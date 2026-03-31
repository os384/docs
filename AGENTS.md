# AGENTS — docs

Read `/os384/AGENTS.md` (workspace root) first for overall context.

## What this is

The os384 documentation site. Built with VitePress. Deployed to docs.384.dev
(or similar — TBD).

## Structure

```
docs/
├── package.json          pnpm + VitePress
└── docs/
    ├── .vitepress/
    │   └── config.ts     Nav, sidebar, head scripts, theme config
    ├── public/           Static assets (logo, images)
    ├── blog/             Blog posts (sovereign-computing, problems-with-data-manifestos)
    └── *.md              Content pages
```

## Build & run

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build
pnpm preview
```

## Content status

Content was migrated from `dev/os384-whitepaper/docs/` and needs cleanup:
- Remove old org names (`snackabra`, `384co`, `384 Inc`)
- Remove TODO stubs and placeholder sections
- Update to reflect RC3 architecture (no more `lib384/` bundled inside servers)
- The blog posts (`blog/`) are in good shape — PSM essays, minimal editing needed

See `TODO.md` for the content cleanup checklist.

## Docs as context for AI threads

This repo serves a dual purpose: documentation for users AND context for
AI coding assistants. When starting a new thread to work on os384, point
Claude at the docs content + the workspace AGENTS.md.

The most useful pages for architectural context:
- `introduction.md`, `architecture.md`, `channels.md`, `storage.md`, `loader.md`

## What NOT to do

- Do NOT use the old VitePress config from `dev/os384-whitepaper/` — it has
  complex custom plugins that aren't in this repo.
- Do NOT add auto-generated API docs until TypeDoc integration is set up.
- This repo uses pnpm/npm (VitePress requirement). That's OK for docs tooling.
  Keep it isolated here; don't let npm creep into Deno repos.
