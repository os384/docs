# Getting the code

::: warning Work in progress
This page is a placeholder. Full workspace setup documentation is tracked at
[github.com/os384](https://github.com/os384). The content below covers the
essentials; a more detailed guide is planned.
:::

## Repositories

All os384 source lives under the [github.com/os384](https://github.com/os384)
GitHub organization. Each component is its own repo:

| Repo | What it is |
|---|---|
| `lib384` | Core TypeScript runtime — the foundation everything else builds on |
| `services` | Channel + storage servers (Cloudflare Workers) + Docker stack |
| `loader` | Browser microkernel — the app launcher at 384.dev |
| `cli` | `384` command-line tool |
| `mirror` | Python shard cache/proxy |
| `demos` | Demo apps for lib384 |
| `file-manager` | Encrypted browser file manager (Lit/Vite app) |
| `docs` | This documentation site (VitePress) |
| `os384` | Meta-repo — org README, architecture overview |

## Clone everything

```sh
mkdir ~/os384 && cd ~/os384

git clone https://github.com/os384/lib384
git clone https://github.com/os384/services
git clone https://github.com/os384/loader
git clone https://github.com/os384/cli
git clone https://github.com/os384/mirror
git clone https://github.com/os384/demos
git clone https://github.com/os384/file-manager
git clone https://github.com/os384/docs
git clone https://github.com/os384/os384
```

Your workspace should now look like:

```
~/os384/
├── cli/
├── demos/
├── docs/
├── file-manager/
├── lib384/
├── loader/
├── mirror/
├── os384/
└── services/
```

## Deno workspace file

Create `~/os384/deno.json` — this is the Deno workspace root that lets local
repos import from each other without publishing to a registry:

```json
{
  "workspace": ["lib384", "loader", "cli", "mirror", "demos"]
}
```

This file is **not committed** to any repo (it lives at the workspace root, above
all the repo directories). Each developer creates it once on their machine.

With this in place, `import { ... } from '@os384/lib384'` in any workspace member
resolves to `../lib384/src/index.ts` locally instead of fetching from a remote.

::: tip Why not commit it?
Different developers may have different subsets of the repos cloned, or may have
them at different paths. The workspace file is intentionally a local assembly step
rather than something prescribed by any single repo.
:::

## Next steps

1. [Install prerequisites](./prerequisites) if you haven't already
2. [Build lib384](./local-stack#build-lib384) — most other things depend on it
3. Choose your path: [server development](./local-stack) or [Docker stack](./local-stack#local-stack-for-app-development)
