# Roadmap

A great deal in os384 is working, but there is a laundry list of gaps. We'd like
to think we have a rough idea of what those are and roughly how to go about
addressing them. This section collects draft design documents that attempt to
capture that.

---

## DP-01: Root Security

os384 holds "trust as little as possible" as a design ethos, but is missing is a
coherent, end-to-end strategy for *root security* — the chain of trust from "a
user opens a browser" through to "os384 code is executing the user's intent."

This document maps classical security problems (code distribution integrity,
bootstrap trust, transport trust, key management) onto os384's current state,
identifies gaps, derives design principles, and offers a straw man proposal
centred on signed page envelopes, a standalone verifier artifact, SRI-pinned
entry HTML, and trust tiers ranging from default-web to self-hosted.

[Read DP-01: Root Security →](/dp/DP-01-Root-Security)
