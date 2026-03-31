# TODO — docs

## High priority (RC3 blocker — do this before relying on docs as AI context)

- [ ] **Strip old branding** — remove `snackabra`, `384 Inc`, `384co` references.
      Replace with `os384`, `os384 Contributors`.
- [ ] **Remove TODO stubs** — pages with `<!-- [TODO ...] -->` sections need
      real content or the stub removed.
- [ ] **Update architecture.md** — reflect RC3: no lib384 bundled inside servers,
      Deno workspace, Cloudflare Workers pattern.
- [ ] **Update overview.md** — Applications section is mostly empty stubs.
- [ ] **Verify VitePress builds** — `pnpm install && pnpm build --ignore-dead-links`.

## Medium priority

- [ ] Add a "Getting Started for Developers" quickstart page
- [ ] Add paywall / storage purchasing documentation
- [ ] Update cli.md with current command list from `cli/src/384.ts`
- [ ] Deploy to docs.384.dev (or similar)

## Lower priority / future

- [ ] TypeDoc API reference (generate from lib384 source)
- [ ] Interactive components (Vue embeds calling live lib384 API)
- [ ] PDF export
