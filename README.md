# os384 Docs

Documentation for [os384](https://384.dev) — built with
[VitePress](https://vitepress.dev/).

## Development

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Build

```sh
pnpm build
pnpm preview
```

## Structure

```
docs/
├── package.json
└── docs/
    ├── .vitepress/
    │   └── config.ts       VitePress configuration + nav/sidebar
    ├── public/             Static assets (logo, images)
    ├── blog/               Blog posts / essays
    ├── index.md            Home page
    ├── introduction.md
    ├── architecture.md
    ├── channels.md
    ├── storage.md
    ├── loader.md
    ├── wallet.md
    ├── strongpin.md
    ├── cli.md
    └── glossary.md
```

## API Reference

API reference docs are generated from lib384 source via TypeDoc. Run
`pnpm docs:api` (requires lib384 to be checked out at `../lib384`):

```sh
# future: npx typedoc --out docs/api ../lib384/src/index.ts
```

## License

GPL-3.0-only — see [LICENSE](LICENSE)
