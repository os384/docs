# OS384 Command Line Interface

The `384` CLI is the primary developer tool for interacting with the
os384 platform. It handles environment bootstrapping, channel
management, storage operations, cryptographic key management, and
publishing content as [channel pages](/glossary#page-channel-page).

Under the hood, the CLI uses [lib384](/api) for all
cryptographic and network operations — the same library that runs in
the browser. It's a single-file Deno TypeScript program that
self-hosts its own dependencies via os384's channel page
infrastructure.


## What the CLI is

The `384` command-line tool is the operator interface for os384. It handles
[channel](/glossary#channel) management, [storage token](/glossary#storage-token)
operations, publishing content to [channel pages](/glossary#page-channel-page),
key management, and low-level [shard](/glossary#shard) and
[message](/glossary#message) operations.

For app development against 384.dev you generally don't need the CLI. It
becomes essential when running your own server, managing
[storage budget](/glossary#storage-budget), or working on lib384 internals.

## Installation

The CLI is distributed via os384's own channel page infrastructure — 384
self-hosts its own distribution. You need [Deno](https://deno.com) 2.x:

```sh
# Install Deno if you don't have it
brew install deno
# or: curl -fsSL https://deno.land/install.sh | sh
```

Then install the `384` command globally:

```sh
deno install -f --global -n 384 --allow-read --allow-write --allow-net --allow-env \
  https://c3.384.dev/api/v2/page/8yp0Lyfr/384.20260330.2.ts
```

You can insert any date+release in the page URL above (it serves primarily
to bust Deno caching).

Make sure `~/.deno/bin` is on your PATH. Add to `~/.zshrc` or `~/.bashrc`:

```sh
export PATH="$HOME/.deno/bin:$PATH"
```

Verify:

```sh
384 --version
384 --help
```


## Getting Started

If you're running local servers (e.g. using the docker config in
`services/docker/`), bootstrapping is automatic:

```sh
384 init --local
```

If you're operating against 384.dev or other public servers, you'll need
a [storage token](/glossary#storage-token). Sign up on 384.dev (contact
info@384.co for a token) and then:

```sh
384 init <token>
```

The above sets up keys in `~/.os384/config.json`. After that, all
subsequent commands pick up your
[budget channel](/glossary#budget-channel) and
[ledger](/glossary#ledger-channel) keys automatically — no need to set
environment variables or copy keys around.

The CLI defaults to public servers unless you override with `--local`.
You can optionally set environment variables to override default
behavior; refer to `384 --help`.


## Configuration

### Config file (`~/.os384/config.json`)

Created by `384 init`. Stores per-profile keys and server endpoints:

```json
{
  "version": 1,
  "profiles": {
    "local": {
      "channelServer": "http://localhost:3845",
      "storageServer": "http://localhost:3843",
      "budgetKey": "Xj32...",
      "ledgerKey": "Xj33..."
    },
    "dev": {
      "channelServer": "https://c3.384.dev",
      "storageServer": "https://s3.384.dev",
      "budgetKey": "Xj32...",
      "ledgerKey": "Xj33..."
    }
  }
}
```

### Environment variables

Environment variables override config.json values. CLI flags override
everything.

| Variable | Purpose | Default |
|---|---|---|
| `OS384_BUDGET_KEY` | [Budget channel](/glossary#budget-channel) key | from config.json |
| `OS384_LEDGER_KEY` | [Ledger](/glossary#ledger-channel) key | from config.json |
| `OS384_CHANNEL_SERVER` | [Channel server](/glossary#channel-server) URL | `https://c3.384.dev` |
| `OS384_STORAGE_SERVER` | [Storage server](/glossary#storage-server) URL | `https://s3.384.dev` |
| `OS384_CONFIG_HOME` | Config directory | `~/.os384` |
| `OS384_DATA_HOME` | Bulk data directory (wrangler state, mirror cache) | `/Volumes/os384` |

### Global options

These apply to most commands:

| Flag | Purpose |
|---|---|
| `-l, --local` | Target local stack (localhost:3845) instead of 384.dev |
| `-s, --server <url>` | Explicit server override (takes precedence over `--local`) |
| `-k, --key <key>` | [Private key](/glossary#owner-key) for the operation |

**Server precedence:** `--server` > `--local` > `OS384_CHANNEL_SERVER` > `https://c3.384.dev`


## Commands

### init

Bootstrap a developer environment.

```bash
384 --local init           # local stack (auto-refreshes dev token)
384 init <token>           # 384.dev (token from admin)
384 init --profile staging <token>  # custom profile name
```

Creates a [ledger channel](/glossary#ledger-channel) from the
[storage token](/glossary#storage-token), then mints a large token from
the ledger to create a [budget channel](/glossary#budget-channel). The
ledger keeps a small reserve for metadata; the budget gets the rest.
Both keys are saved to `~/.os384/config.json`.

For local development (`--local`), the token argument is optional — the
CLI automatically calls the local admin server (port 3849) to refresh
the well-known static dev token.

For remote servers, you need a token provided by a server administrator
(created via `bootstrap.token.ts` or similar).

### env

Generate an `env.js` or shell exports file from config.json.

```bash
384 env -o env.js             # env.js for 384.dev (serverType = 'dev')
384 env --local -o env.js     # env.js for local stack (serverType = 'local')
384 env --format sh -o .env   # shell export lines
```

This bridges the CLI's config.json with the browser-land `env.js` /
`config.js` system that lib384 tests, demos, and build tooling expect.
The `--local` flag selects which profile to emit as the active
`serverType`.

Makefiles typically call `384 env` via a `make env` target that
auto-detects whether the local stack is running (by probing
localhost:3845).

### list-channels

List channels for the current profile.

```bash
384 list-channels              # dev profile
384 --local list-channels      # local profile
```

Shows the [budget channel](/glossary#budget-channel) and
[ledger](/glossary#ledger-channel) from config.json, plus any channel records
written to the ledger. Queries each channel's
[storage budget](/glossary#storage-budget) live.

### channel

Create, inspect, or top up a [channel](/glossary#channel).

```bash
384 channel                        # create new channel (needs budget)
384 channel -k <key>               # inspect existing channel
384 channel -k <key> -z 64MiB      # top up by 64 MiB from budget
384 channel -t <token>             # create using explicit token
```

This is the low-level channel operation command. The behavior depends
on which combination of flags you provide:

- **No key:** generates a new [SB384](/glossary#sb384) identity and
  creates a channel for it, funded from the budget channel.
- **Key + channel exists:** prints channel info, or tops up storage if
  `--size` or `--token` is given.
- **Key + channel doesn't exist:** creates the channel.

Options: `-t, --token` ([storage token](/glossary#storage-token)),
`-b, --budget` ([budget channel](/glossary#budget-channel) key),
`-z, --size` (amount, supports units like `MiB`, `GB`, `K`).

### mint

Mint a [storage token](/glossary#storage-token) from a budget channel.

```bash
384 mint                    # default 16 MiB
384 mint -z 1GiB            # mint 1 GiB token
```

Produces a single-use token that can be consumed to create or fund a
channel. The token is printed to stdout.

### publish

Publish a file as a [channel page](/glossary#page-channel-page).

```bash
384 publish -f lib384.esm.js                        # new page channel
384 publish -f lib384.esm.js -k <pageChannelKey>    # update existing
384 publish -f lib384.esm.js -n custom-name.js      # custom URL name
384 publish -f lib384.esm.js -p 6                   # shorter prefix
```

Channel pages are os384's mechanism for serving static content — the CLI
itself and lib384 are deployed this way. The file is stored as encrypted
page data on the channel, served at
`<server>/api/v2/page/<prefix>/<filename>`.

The command checks whether the file has changed before uploading, and
auto-tops-up storage from the budget channel if needed.

Options: `-f, --file` (required), `-n, --name` (URL filename),
`-b, --budget`, `-p, --prefix` (prefix length, default 8).

### shardify

Upload a file or URL as a [shard](/glossary#shard).

```bash
384 shardify -f file1.pdf file2.jpg    # from local files
384 shardify -u https://example.com/data.json  # from URL
384 shardify -f data.bin -m            # minimal handle output
```

This is raw 1:1 [content-addressed](/glossary#content-addressing) storage.
Each file becomes a single encrypted shard. The command prints the full
[ObjectHandle](/glossary#objecthandle) (id, key, verification) needed to
retrieve and decrypt it, plus optionally a NIP-94 (Nostr) formatted handle.

Not the same as a "file upload" — for structured file sets, see
`sbfs-upload`. For serving content via URL, see `publish`.

Options: `-f, --files`, `-u, --url`, `-b, --budget`,
`-m, --minimal` (compact handle), `-o, --output` (format, default `nostr`).

### fetch

Fetch and decrypt a [shard](/glossary#shard).

```bash
384 fetch <id> <verification> <key>           # to stdout
384 fetch <id> <verification> <key> -f out.bin # to file
```

The inverse of `shardify`. Given the three components of an
[ObjectHandle](/glossary#objecthandle), retrieves and decrypts the shard.
Output goes to stdout by default (suitable for piping), or to a file
with `-f`.

### key

Create or inspect an [SB384](/glossary#sb384) identity.

```bash
384 key              # generate a new P-384 key pair
384 key -k <key>     # parse an existing key and show all perspectives
```

Without `-k`, generates a fresh [P-384](/glossary#p-384-secp384r1) key
pair. With `-k`, parses the provided private key and displays every
representation. This is useful for understanding how the different
"perspectives" on a single identity relate to each other:

```
$ 384 key
======================================================================================
 User info, first in full jwk format (private):
======================================================================================
 {
  crv: "P-384",
  ext: true,
  key_ops: [ "deriveKey" ],
  kty: "EC",
  x: "VGQT7e3iW_zJYJp07MJOe99kul80BgkaWyuujo7llqJ4BDTQDTbCPCf9tKeuatUp",
  y: "WfVkLMI-uXPS4Qa1qaYHqqLLtVGhi48vkMdIKzepRNDeRADoWW0QwbBpzAAYWCP2",
  d: "AnZG8j8zOVh-gkAP9P_PaIl6wrlz7AmjdkE3QNlM5rEBfVYzXAnSNWZx6QQgtz5g"
}
======================================================================================
======================================================================================
 Next, a few 'perspectives' on the object:
======================================================================================
userId/channelId:  HQXZpmoD8eoPIxb8KIscPh4EjpaT4GrHGJOaMS44Ejb
userPublicKey:     PNk2UAs5rJTWrA8V0goiAzQc91wNG8pKYSNXjCXp3EfPswaDodAF...
userPrivateKey:    Xj32UAs5rJTWrA8V0goiAzQc91wNG8pKYSNXjCXp3EfPswaccepq...
dehydrated:        Xj3xAkMM0EULgWgoWBsLrKUw0hP1EthwdeBUlsWnZBmSQYxACyQ...

Notes:
- 'user' in this context just means a root SB384 object
- 'channelId', 'user hash', and 'user ID' are more or less synonyms.
- if you need to store userPublic key anyway, you only
  need the dehydrated version of the private key alongside.

Reminder: all you need is the userPrivateKey, try:
  384 key -k Xj32UAs5rJTWrA8V0goiAzQc91...
```

You can then take the `userPrivateKey` and feed it back — `384 key -k
Xj32UAs5...` — and get the exact same output, confirming it round-trips.

Note the [base62](/glossary#base62) prefixes: `Xj32` encodes the full
private key (both public and private components), `PNk2` is the public
key only, and `Xj3x` is the "dehydrated" private key (a shorter form
that omits the public component, since it can be recomputed). The
`userId` / `channelId` is a hash of the public key — it's how the rest
of the system refers to this identity.

### sign / verify

Cryptographic signing and verification using [P-384](/glossary#p-384-secp384r1) keys.

```bash
# Sign a string (output is base62)
384 sign "hello world" -k <privateKey>

# Verify a signature (accepts public or private key)
384 verify "hello world" <signature> -k <publicKey>
```

### join

Join a [channel](/glossary#channel) as a [visitor](/glossary#visitor).

```bash
384 join <channelId>              # generates new identity
384 join <channelId> -k <key>     # join with existing key
```

### send

Send a [message](/glossary#message) to a channel.

```bash
384 send <channelId> "message text" -k <key>
```

### stream

Stream [messages](/glossary#message) from a channel via
[WebSocket](/glossary#channel-server).

```bash
384 stream -k <key>                # historical messages
384 stream -k <key> -e             # live (keeps connection open)
384 stream -k <key> -d             # detailed (parses payloads)
384 stream -k <key> -w             # wrapper (shows raw message envelope)
```

### history

Show channel [deep history](/glossary#deep-history).

```bash
384 history -k <key>
```

### info

Print [channel server](/glossary#channel-server) status.

```bash
384 info                  # default server
384 --local info          # local stack
384 info -s https://custom.server
```

### visitors

List [visitors](/glossary#visitor) and their public keys for a channel.

```bash
384 visitors -k <ownerKey>
384 visitors -k <ownerKey> -c 50    # also set capacity to 50
```

### phrase

Generate a random [passphrase](/glossary#passphrase).

```bash
384 phrase          # 3 words (42 bits entropy)
384 phrase 5        # 5 words (70 bits entropy)
```

Uses a dictionary with 14 bits of entropy per word.

### pin

Generate a 4×4 [strongpin](/glossary#strongpin).

```bash
384 pin             # 16 chars, 76 bits entropy
```

When combined with a 3-word passphrase (42 bits), gives 118 bits total.

### sbfs-upload

Create or upload to an [SBFS](/glossary#sbfs-os384-virtual-file-system)
filesystem. (Under development.)

```bash
384 sbfs-upload -b <budgetKey> -f file1.txt file2.pdf
384 sbfs-upload -b <budgetKey> -k <ledgerKey> -p "my phrase"
```

Manages structured [file sets](/glossary#fileset) on top of os384
channels, with passphrase-based additional encryption.

### manifest-init / manifest-resolve / manifest-validate / manifest-schema

Manage [manifest](/glossary#manifest) files for os384 applications.

```bash
# Create a template manifest
384 manifest-init -n "My App" -a "Author Name"

# Resolve: create channels for each entry in the manifest
384 manifest-resolve -b <budgetKey>

# Validate a manifest file
384 manifest-validate

# Show the manifest schema
384 manifest-schema
```

A manifest (`384.manifest.json`) declares what channels an os384
application needs. `manifest-resolve` creates those channels and
produces a [shadow manifest](/glossary#shadow-manifest)
(`.384.manifest.json`) with the private keys filled in.
