# Development Overview

::: tip Quick start — install the CLI
Most development workflows benefit from having the `384` CLI. If you have [Deno](https://deno.com) 2.x:
```sh
deno install -f --global -n 384 --allow-read --allow-write --allow-net --allow-env \
  https://c3.384.dev/api/v2/page/8yp0Lyfr/384.ts
export PATH="$HOME/.deno/bin:$PATH"
```
See [CLI Reference](/cli) for details.
:::

os384 is both a **platform** (channel server, storage server, loader) and a **library** (lib384) that runs in the browser. Depending on what you're working on, you'll find yourself in one of four scenarios. Pick the one that matches what you're doing.

---

## 1 — Building apps with os384

You're writing browser applications that use os384's encrypted storage and channels. You're not modifying any os384 infrastructure — just using it the same way a web developer uses any cloud platform.

**What you need:** a browser, your editor, and the os384 docs.

lib384 is loaded from a stable URL served by the os384 channel infrastructure. No install step, no build step — just import it in a `<script type="module">` tag or load the IIFE bundle. The [Loader](../loader) at 384.dev handles key management and app launch for end users.

Start with the [Getting Started](../getting-started) page, then consult the [lib384 API reference](https://github.com/os384/lib384) for what's available.

---

## 2 — Working on lib384 or the servers

You're modifying lib384 itself, or the channel/storage server code. You want a full local stack running so you can run regression tests without touching production and iterate fast.

This is the scenario where you run wrangler in two terminal windows, run `make test` in lib384, and work against localhost:3845 and localhost:3843.

→ **[Local stack setup](./local-stack)**
→ **[Running regression tests](./regression-tests)**

---

## 3 — Running your own os384 instance

You want to host os384 privately — for yourself, a team, or your users — without modifying any server code. The entire stack ships as a Docker Compose file.

```sh
cd os384/services/docker
docker compose up --build -d
```

All five services start automatically on their respective ports (3840–3849). You don't need a Cloudflare account; wrangler runs in local mode inside each container.

See the [services README](https://github.com/os384/services) for the full setup.

---

## 4 — Deploying to a Linux VM

Same as running your own instance, but on a Hetzner/DigitalOcean/Linode VM. Add a reverse proxy (nginx or Caddy) in front to handle TLS and route ports.

The Docker stack is the same; the Compose file works identically on Linux. The only differences are paths for persistent storage (see [Local storage paths](../local-storage) for the Linux layout) and whatever DNS/TLS setup you prefer.

---

## The two key components

**lib384** is the TypeScript/Deno runtime library that runs in every browser app. Think of it the way you'd think of libc for Unix, or the Deno standard library — it's the foundational layer everything builds on. Source: `lib384/`.

**Loader** is the browser microkernel. It manages the user's wallet (key material), resolves channel page URIs, and launches apps in origin-isolated subdomains. It's the VMM in the analogy. Source: `loader/`.

The servers (channel, storage) are deliberately lean — the channel server is under 2500 lines of TypeScript, the storage server under 500. The complexity lives in lib384 and in the cryptographic protocol, not in the server.
