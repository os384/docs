// docs/.vitepress/config.ts
import { defineConfig } from "file:///sessions/funny-elegant-fermi/mnt/os384/docs/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.49.2_postcss@8.5.8_search-insights@2.17.3/node_modules/vitepress/dist/node/index.js";
import { withMermaid } from "file:///sessions/funny-elegant-fermi/mnt/os384/docs/node_modules/.pnpm/vitepress-plugin-mermaid@2.0.17_mermaid@10.9.5_vitepress@1.6.4_@algolia+client-search@5_25e33e5e72f2f99cd5a3009dc49388e7/node_modules/vitepress-plugin-mermaid/dist/vitepress-plugin-mermaid.es.mjs";
import footnote from "file:///sessions/funny-elegant-fermi/mnt/os384/docs/node_modules/.pnpm/markdown-it-footnote@4.0.0/node_modules/markdown-it-footnote/index.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
var __vite_injected_original_dirname = "/sessions/funny-elegant-fermi/mnt/os384/docs/docs/.vitepress";
var manifest = JSON.parse(
  readFileSync(resolve(__vite_injected_original_dirname, "../public/384.manifest.json"), "utf-8")
);
var base = `/${manifest.prefix}/`;
var config_default = withMermaid(defineConfig({
  lang: "en-US",
  title: "os384",
  description: "os384 \u2014 Sovereign computing platform built on P-384 cryptography.",
  base,
  appearance: "dark",
  ignoreDeadLinks: true,
  markdown: {
    config: (md) => {
      md.use(footnote);
    }
  },
  head: [
    ["link", { rel: "icon", href: `${base}os384-logo.svg` }],
    // Load lib384 globally for interactive components
    ["script", { type: "module" }, `
      if (typeof window !== 'undefined') {
        try {
          const m = await import('https://c3.384.dev/api/v2/page/7938Nx0wM39T/384.esm.js');
          window.os384 = m;
        } catch (e) {
          console.warn('os384 library unavailable:', e);
        }
      }
    `]
  ],
  themeConfig: {
    siteTitle: "os384",
    logo: "/os384-logo.svg",
    nav: [
      { text: "Guide", link: "/introduction" },
      { text: "Develop", link: "/dev/" },
      { text: "API", link: "/api/" },
      { text: "Reference", link: "/architecture" },
      { text: "GitHub", link: "https://github.com/os384" }
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "Background", link: "/background" },
          { text: "Overview", link: "/overview" },
          { text: "Getting Started", link: "/getting-started" }
        ]
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Sovereign Computing", link: "/sovereign-computing" },
          { text: "Architecture", link: "/architecture" },
          { text: "Channels", link: "/channels" },
          { text: "Storage & Shards", link: "/storage" },
          { text: "Loader", link: "/loader" },
          { text: "Wallet & Identity", link: "/wallet" },
          { text: "Strongpin", link: "/strongpin" }
        ]
      },
      {
        text: "Developer Guide",
        collapsed: false,
        items: [
          { text: "Development Scenarios", link: "/dev/" },
          { text: "Prerequisites", link: "/dev/prerequisites" },
          { text: "Getting the Code", link: "/dev/getting-the-code" },
          { text: "Local Stack Setup", link: "/dev/local-stack" },
          { text: "Regression Tests", link: "/dev/regression-tests" },
          { text: "Local Storage Paths", link: "/local-storage" }
        ]
      },
      {
        text: "CLI",
        items: [
          { text: "CLI Reference", link: "/cli" }
        ]
      },
      {
        text: "API Reference",
        collapsed: false,
        items: [
          { text: "Overview", link: "/api/" },
          { text: "Identity & Keys", link: "/api/sb384" },
          { text: "Channels", link: "/api/channel" },
          { text: "Storage & Shards", link: "/api/storage" },
          { text: "Cryptography & Protocols", link: "/api/crypto" },
          { text: "Filesystem", link: "/api/filesystem" },
          { text: "App Framework", link: "/api/appmain" },
          { text: "Utilities", link: "/api/utils" }
        ]
      },
      {
        text: "Reference",
        items: [
          { text: "Glossary", link: "/glossary" },
          { text: "Shoulders of Giants", link: "/further-reading" }
        ]
      },
      {
        text: "What About\u2026?",
        collapsed: true,
        items: [
          { text: "Overview", link: "/whatabout/" },
          { text: "Signal", link: "/whatabout/signal" },
          { text: "Matrix / Element", link: "/whatabout/matrix" },
          { text: "Telegram", link: "/whatabout/telegram" },
          { text: "Proton", link: "/whatabout/proton" },
          { text: "WhatsApp", link: "/whatabout/whatsapp" },
          { text: "IPFS", link: "/whatabout/ipfs" },
          { text: "Nextcloud", link: "/whatabout/nextcloud" },
          { text: "Solid", link: "/whatabout/solid" },
          { text: "Keybase", link: "/whatabout/keybase" },
          { text: "Session", link: "/whatabout/session" }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/os384" }
    ],
    footer: {
      message: 'Copyright (C) 2022\u20132026, 384, Inc. "384" and "os384" are registered trademarks.',
      copyright: "All rights reserved."
    },
    search: {
      provider: "local",
      options: {
        miniSearch: {
          options: {
            // Preserve underscores: only split on whitespace and punctuation
            // EXCLUDING underscores, so identifiers like OS384_BUDGET_KEY
            // stay as a single token.
            tokenize: (text) => {
              return text.match(/[\w]+(?:_[\w]+)*/g) || [];
            }
          },
          searchOptions: {
            // Use AND combinator so all terms must match
            combineWith: "AND",
            fuzzy: 0.2,
            prefix: true,
            // Custom tokenizer for queries: support "quoted phrases"
            // by keeping quoted content as a single token
            tokenize: (query) => {
              const tokens = [];
              const withoutQuotes = query.replace(/"([^"]+)"/g, (_match, phrase) => {
                tokens.push(phrase.toLowerCase());
                return "";
              });
              const remaining = withoutQuotes.match(/[\w]+(?:_[\w]+)*/g);
              if (remaining) {
                tokens.push(...remaining);
              }
              return tokens;
            }
          }
        }
      }
    }
  }
}));
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9zZXNzaW9ucy9mdW5ueS1lbGVnYW50LWZlcm1pL21udC9vczM4NC9kb2NzL2RvY3MvLnZpdGVwcmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2Z1bm55LWVsZWdhbnQtZmVybWkvbW50L29zMzg0L2RvY3MvZG9jcy8udml0ZXByZXNzL2NvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvZnVubnktZWxlZ2FudC1mZXJtaS9tbnQvb3MzODQvZG9jcy9kb2NzLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcbmltcG9ydCB7IHdpdGhNZXJtYWlkIH0gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1tZXJtYWlkJztcbmltcG9ydCBmb290bm90ZSBmcm9tICdtYXJrZG93bi1pdC1mb290bm90ZSc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuXG4vLyBSZWFkIHByZWZpeCBmcm9tIDM4NC5tYW5pZmVzdC5qc29uIChpbiBwdWJsaWMvIHNvIGl0J3MgYWxzbyBjb3BpZWQgdG8gZGlzdClcbmNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShcbiAgcmVhZEZpbGVTeW5jKHJlc29sdmUoX19kaXJuYW1lLCAnLi4vcHVibGljLzM4NC5tYW5pZmVzdC5qc29uJyksICd1dGYtOCcpXG4pO1xuY29uc3QgYmFzZSA9IGAvJHttYW5pZmVzdC5wcmVmaXh9L2A7XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhNZXJtYWlkKGRlZmluZUNvbmZpZyh7XG4gIGxhbmc6ICdlbi1VUycsXG4gIHRpdGxlOiAnb3MzODQnLFxuICBkZXNjcmlwdGlvbjogJ29zMzg0IFx1MjAxNCBTb3ZlcmVpZ24gY29tcHV0aW5nIHBsYXRmb3JtIGJ1aWx0IG9uIFAtMzg0IGNyeXB0b2dyYXBoeS4nLFxuXG4gIGJhc2UsXG4gIGFwcGVhcmFuY2U6ICdkYXJrJyxcbiAgaWdub3JlRGVhZExpbmtzOiB0cnVlLFxuXG4gIG1hcmtkb3duOiB7XG4gICAgY29uZmlnOiAobWQpID0+IHtcbiAgICAgIG1kLnVzZShmb290bm90ZSk7XG4gICAgfSxcbiAgfSxcblxuICBoZWFkOiBbXG4gICAgWydsaW5rJywgeyByZWw6ICdpY29uJywgaHJlZjogYCR7YmFzZX1vczM4NC1sb2dvLnN2Z2AgfV0sXG4gICAgLy8gTG9hZCBsaWIzODQgZ2xvYmFsbHkgZm9yIGludGVyYWN0aXZlIGNvbXBvbmVudHNcbiAgICBbJ3NjcmlwdCcsIHsgdHlwZTogJ21vZHVsZScgfSwgYFxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbSA9IGF3YWl0IGltcG9ydCgnaHR0cHM6Ly9jMy4zODQuZGV2L2FwaS92Mi9wYWdlLzc5MzhOeDB3TTM5VC8zODQuZXNtLmpzJyk7XG4gICAgICAgICAgd2luZG93Lm9zMzg0ID0gbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2Fybignb3MzODQgbGlicmFyeSB1bmF2YWlsYWJsZTonLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGBdLFxuICBdLFxuXG4gIHRoZW1lQ29uZmlnOiB7XG4gICAgc2l0ZVRpdGxlOiAnb3MzODQnLFxuICAgIGxvZ286ICcvb3MzODQtbG9nby5zdmcnLFxuXG4gICAgbmF2OiBbXG4gICAgICB7IHRleHQ6ICdHdWlkZScsIGxpbms6ICcvaW50cm9kdWN0aW9uJyB9LFxuICAgICAgeyB0ZXh0OiAnRGV2ZWxvcCcsIGxpbms6ICcvZGV2LycgfSxcbiAgICAgIHsgdGV4dDogJ0FQSScsIGxpbms6ICcvYXBpLycgfSxcbiAgICAgIHsgdGV4dDogJ1JlZmVyZW5jZScsIGxpbms6ICcvYXJjaGl0ZWN0dXJlJyB9LFxuICAgICAgeyB0ZXh0OiAnR2l0SHViJywgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9vczM4NCcgfSxcbiAgICBdLFxuXG4gICAgc2lkZWJhcjogW1xuICAgICAge1xuICAgICAgICB0ZXh0OiAnR2V0dGluZyBTdGFydGVkJyxcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdJbnRyb2R1Y3Rpb24nLCBsaW5rOiAnL2ludHJvZHVjdGlvbicgfSxcbiAgICAgICAgICB7IHRleHQ6ICdCYWNrZ3JvdW5kJywgbGluazogJy9iYWNrZ3JvdW5kJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ092ZXJ2aWV3JywgbGluazogJy9vdmVydmlldycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdHZXR0aW5nIFN0YXJ0ZWQnLCBsaW5rOiAnL2dldHRpbmctc3RhcnRlZCcgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdDb3JlIENvbmNlcHRzJyxcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdTb3ZlcmVpZ24gQ29tcHV0aW5nJywgbGluazogJy9zb3ZlcmVpZ24tY29tcHV0aW5nJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0FyY2hpdGVjdHVyZScsIGxpbms6ICcvYXJjaGl0ZWN0dXJlJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0NoYW5uZWxzJywgbGluazogJy9jaGFubmVscycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdTdG9yYWdlICYgU2hhcmRzJywgbGluazogJy9zdG9yYWdlJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0xvYWRlcicsIGxpbms6ICcvbG9hZGVyJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ1dhbGxldCAmIElkZW50aXR5JywgbGluazogJy93YWxsZXQnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnU3Ryb25ncGluJywgbGluazogJy9zdHJvbmdwaW4nIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiAnRGV2ZWxvcGVyIEd1aWRlJyxcbiAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdEZXZlbG9wbWVudCBTY2VuYXJpb3MnLCBsaW5rOiAnL2Rldi8nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnUHJlcmVxdWlzaXRlcycsIGxpbms6ICcvZGV2L3ByZXJlcXVpc2l0ZXMnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnR2V0dGluZyB0aGUgQ29kZScsIGxpbms6ICcvZGV2L2dldHRpbmctdGhlLWNvZGUnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnTG9jYWwgU3RhY2sgU2V0dXAnLCBsaW5rOiAnL2Rldi9sb2NhbC1zdGFjaycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdSZWdyZXNzaW9uIFRlc3RzJywgbGluazogJy9kZXYvcmVncmVzc2lvbi10ZXN0cycgfSxcbiAgICAgICAgICB7IHRleHQ6ICdMb2NhbCBTdG9yYWdlIFBhdGhzJywgbGluazogJy9sb2NhbC1zdG9yYWdlJyB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ0NMSScsXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ0xJIFJlZmVyZW5jZScsIGxpbms6ICcvY2xpJyB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ0FQSSBSZWZlcmVuY2UnLFxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHsgdGV4dDogJ092ZXJ2aWV3JywgbGluazogJy9hcGkvJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0lkZW50aXR5ICYgS2V5cycsIGxpbms6ICcvYXBpL3NiMzg0JyB9LFxuICAgICAgICAgIHsgdGV4dDogJ0NoYW5uZWxzJywgbGluazogJy9hcGkvY2hhbm5lbCcgfSxcbiAgICAgICAgICB7IHRleHQ6ICdTdG9yYWdlICYgU2hhcmRzJywgbGluazogJy9hcGkvc3RvcmFnZScgfSxcbiAgICAgICAgICB7IHRleHQ6ICdDcnlwdG9ncmFwaHkgJiBQcm90b2NvbHMnLCBsaW5rOiAnL2FwaS9jcnlwdG8nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnRmlsZXN5c3RlbScsIGxpbms6ICcvYXBpL2ZpbGVzeXN0ZW0nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnQXBwIEZyYW1ld29yaycsIGxpbms6ICcvYXBpL2FwcG1haW4nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnVXRpbGl0aWVzJywgbGluazogJy9hcGkvdXRpbHMnIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiAnUmVmZXJlbmNlJyxcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdHbG9zc2FyeScsIGxpbms6ICcvZ2xvc3NhcnknIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnU2hvdWxkZXJzIG9mIEdpYW50cycsIGxpbms6ICcvZnVydGhlci1yZWFkaW5nJyB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ1doYXQgQWJvdXRcdTIwMjY/JyxcbiAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHsgdGV4dDogJ092ZXJ2aWV3JywgbGluazogJy93aGF0YWJvdXQvJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ1NpZ25hbCcsIGxpbms6ICcvd2hhdGFib3V0L3NpZ25hbCcgfSxcbiAgICAgICAgICB7IHRleHQ6ICdNYXRyaXggLyBFbGVtZW50JywgbGluazogJy93aGF0YWJvdXQvbWF0cml4JyB9LFxuICAgICAgICAgIHsgdGV4dDogJ1RlbGVncmFtJywgbGluazogJy93aGF0YWJvdXQvdGVsZWdyYW0nIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnUHJvdG9uJywgbGluazogJy93aGF0YWJvdXQvcHJvdG9uJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ1doYXRzQXBwJywgbGluazogJy93aGF0YWJvdXQvd2hhdHNhcHAnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnSVBGUycsIGxpbms6ICcvd2hhdGFib3V0L2lwZnMnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnTmV4dGNsb3VkJywgbGluazogJy93aGF0YWJvdXQvbmV4dGNsb3VkJyB9LFxuICAgICAgICAgIHsgdGV4dDogJ1NvbGlkJywgbGluazogJy93aGF0YWJvdXQvc29saWQnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnS2V5YmFzZScsIGxpbms6ICcvd2hhdGFib3V0L2tleWJhc2UnIH0sXG4gICAgICAgICAgeyB0ZXh0OiAnU2Vzc2lvbicsIGxpbms6ICcvd2hhdGFib3V0L3Nlc3Npb24nIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICBzb2NpYWxMaW5rczogW1xuICAgICAgeyBpY29uOiAnZ2l0aHViJywgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9vczM4NCcgfSxcbiAgICBdLFxuXG4gICAgZm9vdGVyOiB7XG4gICAgICBtZXNzYWdlOiAnQ29weXJpZ2h0IChDKSAyMDIyXHUyMDEzMjAyNiwgMzg0LCBJbmMuIFwiMzg0XCIgYW5kIFwib3MzODRcIiBhcmUgcmVnaXN0ZXJlZCB0cmFkZW1hcmtzLicsXG4gICAgICBjb3B5cmlnaHQ6ICdBbGwgcmlnaHRzIHJlc2VydmVkLicsXG4gICAgfSxcblxuICAgIHNlYXJjaDoge1xuICAgICAgcHJvdmlkZXI6ICdsb2NhbCcsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG1pbmlTZWFyY2g6IHtcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAvLyBQcmVzZXJ2ZSB1bmRlcnNjb3Jlczogb25seSBzcGxpdCBvbiB3aGl0ZXNwYWNlIGFuZCBwdW5jdHVhdGlvblxuICAgICAgICAgICAgLy8gRVhDTFVESU5HIHVuZGVyc2NvcmVzLCBzbyBpZGVudGlmaWVycyBsaWtlIE9TMzg0X0JVREdFVF9LRVlcbiAgICAgICAgICAgIC8vIHN0YXkgYXMgYSBzaW5nbGUgdG9rZW4uXG4gICAgICAgICAgICB0b2tlbml6ZTogKHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBTcGxpdCBvbiB3aGl0ZXNwYWNlIGFuZCBwdW5jdHVhdGlvbiBleGNlcHQgdW5kZXJzY29yZXNcbiAgICAgICAgICAgICAgcmV0dXJuIHRleHQubWF0Y2goL1tcXHddKyg/Ol9bXFx3XSspKi9nKSB8fCBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZWFyY2hPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyBVc2UgQU5EIGNvbWJpbmF0b3Igc28gYWxsIHRlcm1zIG11c3QgbWF0Y2hcbiAgICAgICAgICAgIGNvbWJpbmVXaXRoOiAnQU5EJyxcbiAgICAgICAgICAgIGZ1enp5OiAwLjIsXG4gICAgICAgICAgICBwcmVmaXg6IHRydWUsXG4gICAgICAgICAgICAvLyBDdXN0b20gdG9rZW5pemVyIGZvciBxdWVyaWVzOiBzdXBwb3J0IFwicXVvdGVkIHBocmFzZXNcIlxuICAgICAgICAgICAgLy8gYnkga2VlcGluZyBxdW90ZWQgY29udGVudCBhcyBhIHNpbmdsZSB0b2tlblxuICAgICAgICAgICAgdG9rZW5pemU6IChxdWVyeTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHRva2Vuczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgLy8gRXh0cmFjdCBxdW90ZWQgcGhyYXNlcyBmaXJzdFxuICAgICAgICAgICAgICBjb25zdCB3aXRob3V0UXVvdGVzID0gcXVlcnkucmVwbGFjZSgvXCIoW15cIl0rKVwiL2csIChfbWF0Y2gsIHBocmFzZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHBocmFzZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAvLyBUaGVuIHRva2VuaXplIHRoZSByZXN0LCBwcmVzZXJ2aW5nIHVuZGVyc2NvcmVzXG4gICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IHdpdGhvdXRRdW90ZXMubWF0Y2goL1tcXHddKyg/Ol9bXFx3XSspKi9nKTtcbiAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZykge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKC4uLnJlbWFpbmluZyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFYsU0FBUyxvQkFBb0I7QUFDelgsU0FBUyxtQkFBbUI7QUFDNUIsT0FBTyxjQUFjO0FBQ3JCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUp4QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLFdBQVcsS0FBSztBQUFBLEVBQ3BCLGFBQWEsUUFBUSxrQ0FBVyw2QkFBNkIsR0FBRyxPQUFPO0FBQ3pFO0FBQ0EsSUFBTSxPQUFPLElBQUksU0FBUyxNQUFNO0FBRWhDLElBQU8saUJBQVEsWUFBWSxhQUFhO0FBQUEsRUFDdEMsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsYUFBYTtBQUFBLEVBRWI7QUFBQSxFQUNBLFlBQVk7QUFBQSxFQUNaLGlCQUFpQjtBQUFBLEVBRWpCLFVBQVU7QUFBQSxJQUNSLFFBQVEsQ0FBQyxPQUFPO0FBQ2QsU0FBRyxJQUFJLFFBQVE7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFBQSxFQUVB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
