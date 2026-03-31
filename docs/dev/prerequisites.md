# Prerequisites

This page lists everything you need installed before working with any part of os384.
Not every workflow requires everything here — the table below shows what's needed for what.

## Summary

| Tool | Version | Needed for |
|---|---|---|
| [Deno](https://deno.com) | 2.x | lib384, cli, mirror, demos, tests |
| [Node.js](https://nodejs.org) | 20.x LTS | wrangler (channel + storage servers) |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | latest | running channel + storage servers locally |
| [pnpm](https://pnpm.io/) | 8.x+ | loader, file-manager (Vite projects) |
| [Docker](https://www.docker.com/) or [OrbStack](https://orbstack.dev/) | any recent | Docker stack (local app dev, self-hosted) |
| [Git](https://git-scm.com/) | any recent | cloning repos |

---

## Deno 2.x

Deno is the primary runtime for lib384, the CLI, tests, and all non-Vite tooling.
The workspace uses Deno 2.x — do not use Deno 1.x.

```sh
# macOS / Linux
curl -fsSL https://deno.land/install.sh | sh

# Or via Homebrew (macOS)
brew install deno
```

Verify:
```sh
deno --version
# deno 2.x.x (...)
```

---

## Node.js + Wrangler

Wrangler (the Cloudflare Workers CLI) requires Node.js. Use Node 20 LTS.

```sh
# Install Node via nvm (recommended — avoids system Node conflicts)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | sh
nvm install 20
nvm use 20

# Then install wrangler globally
npm install -g wrangler
```

Verify:
```sh
node --version    # v20.x.x
wrangler --version
```

::: info Wrangler and Cloudflare accounts
For **local development** you do not need a Cloudflare account. Wrangler runs
entirely in local mode — no login required. A Cloudflare account (with a paid
Workers plan for Durable Objects) is only needed if you want to deploy to
Cloudflare itself.
:::

---

## pnpm

Used only in the `loader/` and `file-manager/` repos (Vite build tooling). Not
needed for lib384, cli, services, or tests.

```sh
npm install -g pnpm
```

Verify:
```sh
pnpm --version
```

---

## Docker / OrbStack

Needed only for the Docker stack path (local app development and self-hosted deployment).
If you're doing server development with wrangler in terminals, you don't need Docker.

On macOS, [OrbStack](https://orbstack.dev/) is recommended over Docker Desktop — faster,
lighter, and supports the same `docker compose` commands.

```sh
# OrbStack (macOS) — download from https://orbstack.dev
# Docker Desktop — download from https://www.docker.com/products/docker-desktop

# Verify either is working
docker --version
docker compose version
```

---

## macOS: `/Volumes/os384`

If you're on macOS and running the servers locally (wrangler path), you'll also need
a dedicated APFS volume at `/Volumes/os384` for wrangler state and the mirror shard
cache. This keeps ephemeral dev data out of your backup boundary.

See [Local storage paths](../local-storage) for the one-time setup.

---

## The `384` CLI

The `384` command-line tool is used for channel management, token operations, and
deploying lib384 artifacts. See [CLI Reference](/cli) for installation and
usage.
