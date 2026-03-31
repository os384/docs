# Regression Tests

lib384 has a comprehensive test suite under `lib384/tests/`. Tests are tagged by what they require, so you can run exactly what you need without a full live stack.

---

## Prerequisites

The test suite imports from `lib384/dist/384.esm.js`, so you need a current build:

```sh
cd lib384
deno task build
```

---

## Test tags

| Tag | Needs | Typical run time |
|---|---|---|
| `[fast]` | Nothing — pure crypto and logic | < 2 seconds |
| `[fast][channel]` | Channel server (`:3845`) | seconds |
| `[fast][storage]` | Channel + storage servers (`:3843`) | seconds |
| `[fast][pages]` | Channel server + valid storage token | seconds |
| `[slow][channel]` | Channel server + WebSocket support | 10–60 seconds |
| `[broken]` | (skipped by default) | — |

Tags are matched as substrings of the test name, so `[fast]` matches `[fast][channel]` too.

---

## Running tests

**Fastest iteration (no server needed):**

```sh
cd lib384
deno task test:fast      # all [fast] tagged tests
```

The Makefile variant auto-detects local servers and sets `OS384_ENV` appropriately:

```sh
make test-fast           # same, but auto-detects local stack
```

**Channel tests only:**

```sh
deno task test:channel   # all [channel] tagged tests
```

**Full suite (everything):**

```sh
make test                # auto-detects local vs dev, runs all tests
```

**Running a single test file:**

```sh
deno test --allow-net --allow-read --allow-write --allow-env \
  lib384/tests/04.02.basic.channel.test.ts
```

---

## Running against local services

If your local stack is up (see [Local stack setup](./local-stack)), the Makefile detects it:

```sh
make test-fast
# → detects localhost:3845 and localhost:3843
# → sets OS384_ENV=local
# → runs against http://localhost:3845
```

Or manually:

```sh
OS384_ENV=local deno task test:fast
```

The `[fast]` tests include several that touch the server:

- **04.02** — basic channel creation (ping `getChannelKeys()` against the budget channel)
- **04.03**, **04.11** — channel reads and admin ops
- **06.01** — budd test (creates a new channel from an existing one)
- **07.01**, **07.02** — storage: store and retrieve a shard
- **09.01**, **09.02** — pages: store a JS bundle as a channel page

The storage and pages tests require a seeded storage token. See [Local stack setup — Seeding a storage token](./local-stack#seeding-a-storage-token) if these fail with a token-related error.

---

## Expected results on a working local stack

```
running X tests from Y files
[fast] testing the tester          ... ok
[fast] basic SB384 tests           ... ok
[fast] basic Base64 tests          ... ok
[fast] strongpin - ...             ... ok (×4)
[fast] ECPointDecompress testing   ... ok
[fast] [channel] basic channel...  ... ok
[fast] [storage] minimalist ...    ... ok
[fast] [pages] basic pages test    ... ok
... (all ok, no failures)
```

If you see only the pure-crypto tests passing and the `[channel]` / `[storage]` / `[pages]` tests failing, check that both servers are running and `OS384_ENV=local` is in effect.

---

## Test file naming convention

Files are numbered by subsystem:

| Prefix | Subsystem |
|---|---|
| `00.*` | Test framework sanity |
| `01.*` | Import / build verification |
| `02.*` | Utilities (base62, base64, queue, observer, etc.) |
| `03.*` | Crypto (key generation, compression, hydration) |
| `04.*` | Channels (create, connect, socket, TTL, admin) |
| `05.*` | Protocols (AES-GCM, whisper/ECDH, lobby) |
| `06.*` | Budd (channel creation from budget) |
| `07.*` | Storage (low-level store, high-level storeData) |
| `08.*` | History and streams |
| `09.*` | Pages (channel pages, lib384 deploy) |
| `10.*` | Global KV |
| `12.*–13.*` | Iterators, LocalStorage |

The `helper.*` and `aside.*` files are utilities imported by the numbered tests, not test files themselves.
