---
title: Getting Started
---

# Getting Started

os384 is a browser-native sovereign computing platform built on P-384 elliptic-curve cryptography. It provides encrypted channels, content-addressed storage, and a browser microkernel (the [Loader](./loader)) that lets you run fully sandboxed apps without trusting any server — including ours.

The best way to understand it is to run it. See **[Local Stack Setup](./dev/local-stack)** for how to get the channel and storage servers running locally, seed your first storage token, and run the lib384 regression tests against your own machine.

---

## Get started with an LLM

::: warning Placeholder
The prompt below is a draft. It will be updated with correct pointers to online assets (docs URL, repo URL, etc.) once those are stable. Do not rely on it working end-to-end yet.
:::

Modern LLMs are good at setup tasks. Paste this into Claude (or your preferred LLM) and let it drive:

```
I want to run os384 locally on my machine. os384 is an open-source
browser-native encrypted computing platform. The public docs are at
https://docs.384.dev and the code is at https://github.com/os384.

Please help me:
1. Clone the repo and understand the structure
2. Install the prerequisites (Deno, wrangler, Node)
3. Set up local storage paths for wrangler state
4. Start the channel and storage servers locally
5. Run the lib384 regression tests against my local servers
6. Confirm the stack is working

I'm on [macOS/Linux/Windows]. I'm a developer comfortable with the terminal.
Use the docs and source code to guide your steps. Ask me before running
anything destructive.
```
