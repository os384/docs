# Local Stack Setup

This page covers running the channel and storage servers locally via wrangler so you can develop against them without touching 384.dev.

::: tip When to use this
You're working on lib384 or the server code and need a local target for regression tests. If you just want to build apps using 384.dev infrastructure, skip this — no local server needed.
:::

---

## One-time setup

The steps in this section only need to be done once per machine (or when you blow away your wrangler state).

:::details Prerequisites

See [Prerequisites](./prerequisites) for install instructions. You'll need:

- **Deno 2.x** — runs lib384, CLI, and test tooling
- **Node.js + wrangler** — wrangler runs the Cloudflare Workers locally

:::

:::details Local storage paths

Both workers persist KV state to a directory outside the project tree so that wrangler data doesn't land inside your backup boundary. By default this is `/Volumes/os384/wrangler` (macOS). See [Local storage paths](../local-storage) for the full setup, including how to override with `OS384_WRANGLER_STATE` and the Linux equivalent.

If you haven't done this one-time setup yet, do it before proceeding.

:::

:::details wrangler.toml

The `wrangler.toml` files contain your Cloudflare `account_id` and are gitignored. Copy `wrangler.template.toml` to `wrangler.toml` in both `services/channel/` and `services/storage/` and fill in the account ID. For purely local dev the value doesn't matter — wrangler only reads it for remote deployments.

:::

:::details Seeding a storage token

The storage server requires a valid storage token before it will accept writes. Tokens are [base62](#base62)-encoded identifiers tracked in the LEDGER_NAMESPACE KV store. This is a one-time [bootstrap](../../glossary#bootstrap) step.

For local development, a well-known shared dev token is used — the same one the Docker admin service seeds automatically. Seed it manually via wrangler's KV CLI (run from `services/storage/`):

```sh
cd ~/os384/services/storage

wrangler kv key put \
  --binding=LEDGER_NAMESPACE \
  --preview false \
  --local \
  --persist-to "$OS384_WRANGLER_STATE" \
  "LM2r39oAn1F8aMsicKTInXZb5L81JihNghBfJguAPVWZq5k" \
  '{"hash":"LM2r39oAn1F8aMsicKTInXZb5L81JihNghBfJguAPVWZq5k","used":false,"size":1099511627776,"motherChannel":"<dev>"}'
```

`OS384_WRANGLER_STATE` defaults to `/Volumes/os384/wrangler` if not set. The budget size (1 TB) is effectively unlimited for local dev purposes.

::: info Why `--preview false`?
`wrangler.toml` defines each KV namespace with both an `id` and a `preview_id`. Wrangler defaults to the preview namespace, so without `--preview false` you'll get an error asking you to specify which one you mean. For local dev we always want the non-preview (`id`) namespace — the same one the storage worker reads at runtime.
:::

::: tip Docker users
If you're running the Docker stack instead (`services/docker`), the admin service handles this automatically:
```sh
curl http://localhost:3849/refresh
```
The same token hash is used in both paths.
:::

:::

:::details Creating a budget channel

Once the storage token is seeded and the servers are running, consume the token to create your local [budget channel](../../glossary#budget-channel). The `04.01` regression test does this for you:

```sh
cd ~/os384/lib384
OS384_ENV=local deno task test:04.01
```

This calls `SB.create(token)` with the canonical dev token, creates a channel on your local stack, and saves the resulting [channel handle](../../glossary#channel-handle) to `.local.data.json`. You only need to do this once — subsequent test runs reuse the saved handle.

The test also stores the budget key in `.local.data.json` under the channel server URL key. You can inspect it:

```sh
cat ~/os384/lib384/.local.data.json | deno eval "
  const d = JSON.parse(await Deno.stdin.readText())
  console.log(JSON.stringify(d, null, 2))
"
```

:::

:::details Populating env.js (for browser/app development)

`env.js` bridges your local keys into browser and legacy Deno contexts. If you only run CLI tools and tests (which read env vars directly), you can skip this step.

Copy the template:

```sh
cp ~/os384/lib384/env.example.js ~/os384/lib384/env.js
```

Then edit `env.js` and fill in the values from `.local.data.json`:

- `localBudgetKey` — the private key of your local budget channel
- `localWalletHandle` — the channel handle JSON (stringified)
- `localLedgerKey` — the private key of your local ledger channel (if created)
- `configServerType` — set to `'local'`

::: warning
`env.js` contains private key material. It is gitignored — never commit it. Never copy values from a populated `env.js` into any tracked file.
:::

:::

---

## Daily development

### Starting the servers

Open two terminal windows from `~/os384/services/`.

**Terminal 1 — storage server** (start this one first)

```sh
cd ~/os384/services
make dev-storage
# Runs on http://localhost:3843
```

**Terminal 2 — channel server**

```sh
cd ~/os384/services
make dev-channel
# Runs on http://localhost:3845
```

Both workers share the same wrangler state directory via `--persist-to`, so channel can see the LEDGER_NAMESPACE that storage writes to. No symlink is needed.

### Running tests

The `lib384/Makefile` auto-detects running local servers by probing both ports and sets `OS384_ENV=local` automatically. So if your servers are up, `make test` just works:

```sh
cd ~/os384/lib384
make test
```

To set it manually:

```sh
export OS384_ENV=local
deno task test:fast
```

### Verifying the stack

```sh
# Confirm the channel server is up
curl http://localhost:3845/api/v2/info

# Run the fast test suite
cd ~/os384/lib384
make test-fast
```

The fast suite includes pure crypto tests (no server needed) plus `[fast][channel]`, `[fast][storage]`, and `[fast][pages]` tests that exercise the local stack. All should pass. See [Regression Tests](./regression-tests) for the full breakdown.

---

## App development (shadow manifest)

When developing an os384 app locally — without the [Loader](../../glossary#loader) infrastructure or a deployed service worker — you can use a [shadow manifest](../../glossary#shadow-manifest).

Create `.384.manifest.json` (note the leading dot) in your app's working directory. [AppMain](../../glossary#appmain) checks for this dotfile first and uses it in place of `384.manifest.json` when found. This lets you point the app at your local wrangler stack and iterate without redeploying anything.

A minimal shadow manifest looks like:

```json
{
  "version": 1,
  "channelServer": "http://localhost:3845",
  "storageServer": "http://localhost:3843",
  "entry": "index.html"
}
```

::: tip
`.384.manifest.json` should be gitignored — it's a local dev artifact. Add it to your project's `.gitignore`.
:::

To serve the manifest (and your app files) locally without the Loader's service worker, you can use any static file server. A simple Deno one-liner works:

```sh
deno run --allow-net --allow-read \
  'https://deno.land/std/http/file_server.ts' \
  --port 3840
```

The app will run at `http://localhost:3840` and `AppMain.init()` will pick up the shadow manifest automatically.
