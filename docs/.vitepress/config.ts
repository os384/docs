import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import footnote from 'markdown-it-footnote';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read prefix from 384.manifest.json (in public/ so it's also copied to dist)
const manifest = JSON.parse(
  readFileSync(resolve(__dirname, '../public/384.manifest.json'), 'utf-8')
);
const base = `/${manifest.prefix}/`;

export default withMermaid(defineConfig({
  lang: 'en-US',
  title: 'os384',
  description: 'os384 — Sovereign computing platform built on P-384 cryptography.',

  base,
  appearance: 'dark',
  ignoreDeadLinks: true,

  markdown: {
    config: (md) => {
      md.use(footnote);
    },
  },

  head: [
    ['link', { rel: 'icon', href: `${base}os384-logo.svg` }],
    // Load lib384 globally for interactive components
    ['script', { type: 'module' }, `
      if (typeof window !== 'undefined') {
        try {
          const m = await import('https://c3.384.dev/api/v2/page/7938Nx0wM39T/384.esm.js');
          window.os384 = m;
        } catch (e) {
          console.warn('os384 library unavailable:', e);
        }
      }
    `],
  ],

  themeConfig: {
    siteTitle: 'os384',
    logo: '/os384-logo.svg',

    nav: [
      { text: 'Guide', link: '/introduction' },
      { text: 'Develop', link: '/dev/' },
      { text: 'API', link: '/api/' },
      { text: 'Reference', link: '/architecture' },
      { text: 'GitHub', link: 'https://github.com/os384' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Background', link: '/background' },
          { text: 'Overview', link: '/overview' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Sovereign Computing', link: '/sovereign-computing' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Channels', link: '/channels' },
          { text: 'Storage & Shards', link: '/storage' },
          { text: 'Loader', link: '/loader' },
          { text: 'Wallet & Identity', link: '/wallet' },
          { text: 'Strongpin', link: '/strongpin' },
        ],
      },
      {
        text: 'Developer Guide',
        collapsed: false,
        items: [
          { text: 'Development Scenarios', link: '/dev/' },
          { text: 'Prerequisites', link: '/dev/prerequisites' },
          { text: 'Getting the Code', link: '/dev/getting-the-code' },
          { text: 'Local Stack Setup', link: '/dev/local-stack' },
          { text: 'Regression Tests', link: '/dev/regression-tests' },
          { text: 'Local Storage Paths', link: '/local-storage' },
        ],
      },
      {
        text: 'CLI',
        items: [
          { text: 'CLI Reference', link: '/cli' },
        ],
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Identity & Keys', link: '/api/sb384' },
          { text: 'Channels', link: '/api/channel' },
          { text: 'Storage & Shards', link: '/api/storage' },
          { text: 'Cryptography & Protocols', link: '/api/crypto' },
          { text: 'Filesystem', link: '/api/filesystem' },
          { text: 'App Framework', link: '/api/appmain' },
          { text: 'Utilities', link: '/api/utils' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Glossary', link: '/glossary' },
          { text: 'Shoulders of Giants', link: '/further-reading' },
        ],
      },
      // 'What About…?' comparisons moved to docs/_whatabout/ for possible future use
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/os384' },
    ],

    footer: {
      message: 'Copyright (C) 2022–2026, 384, Inc. "384" and "os384" are registered trademarks.',
      copyright: `All rights reserved. v${manifest.version}`,
    },

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // Preserve underscores: only split on whitespace and punctuation
            // EXCLUDING underscores, so identifiers like OS384_BUDGET_KEY
            // stay as a single token.
            tokenize: (text: string) => {
              // Split on whitespace and punctuation except underscores
              return text.match(/[\w]+(?:_[\w]+)*/g) || [];
            },
          },
          searchOptions: {
            // Use AND combinator so all terms must match
            combineWith: 'AND',
            fuzzy: 0.2,
            prefix: true,
            // Custom tokenizer for queries: support "quoted phrases"
            // by keeping quoted content as a single token
            tokenize: (query: string) => {
              const tokens: string[] = [];
              // Extract quoted phrases first
              const withoutQuotes = query.replace(/"([^"]+)"/g, (_match, phrase) => {
                tokens.push(phrase.toLowerCase());
                return '';
              });
              // Then tokenize the rest, preserving underscores
              const remaining = withoutQuotes.match(/[\w]+(?:_[\w]+)*/g);
              if (remaining) {
                tokens.push(...remaining);
              }
              return tokens;
            },
          },
        },
      },
    },
  },
}));
