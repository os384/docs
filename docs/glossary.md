---
title: Glossary
description: A comprehensive glossary of terms used in the os384 ecosystem
---

# Glossary

This glossary provides definitions for key terms and concepts used throughout the os384 ecosystem. Terms are organized alphabetically for easy reference.

## A

### addressable worker

An edge computing worker that has a persistent global identity — all requests for a specific addressable worker are routed to the same instance, wherever it happens to be running in the infrastructure. Because it is "addressable," it can maintain local state ([KV_local](#kv_local)) and support long-lived [WebSocket](#channel-server) connections for real-time communication. Contrast with [non-addressable worker](#non-addressable-worker).

In os384: each [Channel](#channel) is backed by an addressable worker (a [Durable Object](#durable-object) in the Cloudflare reference implementation). This is why channel operations have strong consistency guarantees — all synchronous calls for a given channel route to one instance.

*Related: [non-addressable worker](#non-addressable-worker), [Durable Object](#durable-object), [KV_local](#kv_local), [Channel](#channel)*

*Read more: [architecture](/architecture)*

---

### AES-256-GCM

AES-256-GCM (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode) is a standard *authenticated* encryption algorithm. "Authenticated" means it both encrypts data and detects any tampering — if the ciphertext has been modified, decryption fails rather than silently producing garbage. The 256-bit key makes brute-force attacks computationally infeasible for the foreseeable future.

In os384: AES-256-GCM is the symmetric encryption used for all stored [objects](#object) and for group [Channel](#channel) messages (`Protocol_AES_GCM_256`). The encryption key for a shard is derived from the content's own hash using [PBKDF2](#pbkdf2).

*Related: [PBKDF2](#pbkdf2), [nonce](#nonce), [iv](#iv), [salt](#salt), [protocol](#protocol)*

---

### AppMain

The bootstrap class for os384 applications. An app built with `AppMain` declares a manifest (`384.manifest.json`) specifying its entry point, dependencies, and resource channels. When the [Loader](#loader) launches an app, `AppMain` handles initialization: locating the ledger channel, verifying storage, and setting up the app's runtime environment.

During local development without the Loader, `AppMain.init()` supports a [shadow manifest](#shadow-manifest) (`.384.manifest.json` dotfile) that takes priority over the published manifest, allowing iterative development without redeployment.

*Related: [Loader](#loader), [manifest](#manifest), [shadow manifest](#shadow-manifest), [budget channel](#budget-channel), [Channel](#channel)*

*API: <ApiLink type="class" name="AppMain" />*

---

## B

### base32

A text encoding that uses a 32-character alphabet. os384 uses Crockford's Base32 variant (digits 0–9 plus uppercase consonants, excluding visually ambiguous characters like I, L, O, U) for the [Channel ID](#channel-id) hash representation (`hashB32`) and for [channel page](/glossary#page-channel-page) URL prefixes. The limited character set makes these identifiers easy to read aloud, type manually, and embed in URLs without case sensitivity issues.

*Related: [base62](#base62), [Channel ID](#channel-id), [strongpin](#strongpin), [page](#page-channel-page)*

---

### base62

A text encoding that uses only alphanumeric characters (A–Z, a–z, 0–9) — 62 characters total. Unlike base64, which requires two additional symbols (typically `+` and `/`), base62 can be embedded anywhere an alphanumeric string is expected — URLs, filenames, database keys, log entries — without any escaping or quoting.

In os384: base62 is the universal wire format for all external identifiers: [Channel IDs](#channel-id), user IDs, object handles, and keys. Implemented in the reference library at [github.com/petersmagnusson/base62](https://github.com/petersmagnusson/base62), exported as <ApiLink type="function" name="arrayBufferToBase62" /> and <ApiLink type="function" name="base62ToArrayBuffer" />.

*Related: [Channel ID](#channel-id), [FN](#fn), [Owner Key](#owner-key)*

---

### budd

To "budd" a channel is to spin off a new [Channel](#channel) from an existing one, optionally transferring some or all of the parent channel's [storage budget](#storage-budget) to the new one. A budded channel inherits nothing from the parent's messages or access control — it is a fresh, independent channel. The operation also covers transferring budget between existing channels without creating a new one.

In os384: budding is the primary mechanism for allocating storage. You start with a channel that has budget (typically seeded from a [storage token](#storage-token)), then budd from it to create the channels your app actually uses.

*Related: [Storage Budget](#storage-budget), [storage token](#storage-token), [Channel](#channel), [budget channel](#budget-channel)*

*API: <ApiLink type="class" name="Channel" method="budd" />*

---

### bootstrap

The one-time operation of provisioning a [storage token](#storage-token) directly into the [Channel Server's](#channel-server) KV store, establishing the initial storage budget from which all subsequent channel creation flows. Distinct from drawing a token from an existing funded channel (which requires a channel that already has budget).

In os384: bootstrapping requires server ownership — either wrangler credentials (for direct KV writes) or admin access (for the Docker stack). The result is a `LEDGER_NAMESPACE` KV entry. Once the token is in KV, the companion step is to consume it via `SB.create(token)` (see the `04.01` regression test) to produce a [budget channel](#budget-channel).

Three bootstrap paths exist for local dev:

- **CLI (wrangler directly)** — `wrangler kv key put --binding=LEDGER_NAMESPACE ...`
- **`bootstrap.token.ts`** — Deno CLI wrapper around the same wrangler command
- **Docker admin** — `curl http://localhost:3849/refresh` seeds the canonical dev token automatically

*Related: [storage token](#storage-token), [budget channel](#budget-channel), [LEDGER_KEY](#ledger_key), [budd](#budd)*

*Read more: [dev/local-stack](/dev/local-stack)*

---

### budget channel

An informal term for a [Channel](#channel) used primarily or exclusively as a source of [storage budget](#storage-budget) rather than for communication — often the root of a tree of [budded](#budd) channels. Not a distinct type in the code; just a usage pattern. Typically paired with a [ledger channel](#ledger-channel) so that operational bookkeeping and storage budget are managed independently.

*Related: [ledger channel](#ledger-channel), [budd](#budd), [Storage Budget](#storage-budget), [Channel](#channel), [bootstrap](#bootstrap)*

---

## C

### capacity

The maximum number of [Visitor](#visitor) members allowed in a [Channel](#channel) at one time. Set by the channel owner via `channel.setCapacity(n)`. Once reached, `acceptVisitor()` will fail until the owner raises the limit or existing members leave. Capacity is one of the fields returned in [ChannelAdminData](#channel-handle) (owner-only).

In os384: capacity is a soft policy — the default is permissive. Most apps set a meaningful capacity as part of their access-control logic (e.g., a 1-on-1 chat channel has capacity 1).

*Related: [Visitor](#visitor), [Owner](#owner), [Restricted](#restricted), [locked](#locked)*

*API: <ApiLink type="class" name="Channel" method="setCapacity" />*

---

### Channel

The fundamental communication and capability primitive of os384. A Channel is a globally unique, durable, owner-controlled endpoint — conceptually analogous to a capability-bearing port in systems like Mach/Chorus, but persistent and cryptographically owned. Every channel has a unique [Channel ID](#channel-id) permanently derived from its owner's [P-384](#p-384) private key, meaning the channel's identity and proof of ownership are mathematically inseparable.

Unlike a typical network socket, a Channel is not ephemeral: messages are stored permanently by default (see [TTL](#ttl)), and the channel itself persists indefinitely. At runtime it is backed by an [addressable worker](#addressable-worker), so all operations on a given channel are serialized through one instance — enabling strong consistency without a central database.

A critical design property: **shards have no metadata whatsoever**. All context about stored objects — what they are, who they belong to, how to decrypt them — must travel as channel messages. The channel message log is therefore the metadata layer for the entire storage system. Conversely, the channel's own message history eventually migrates *into* shard storage via the [deep history](#deep-history) mechanism, though the resulting shards have no knowledge of their origin.

Channels are the substrate on which all P2P communication in os384 apps is built. They also carry [storage budget](#storage-budget), expose typed data via [Pages](#page), and can be restricted to owner-approved [Visitors](#visitor) only. New channels are created from existing ones via [budd](#budd).

*Related: [Channel ID](#channel-id), [Owner](#owner), [Owner Key](#owner-key), [Shard](#shard), [budd](#budd), [addressable worker](#addressable-worker), [deep history](#deep-history)*

*Read more: [channels](/channels)* | *API: <ApiLink type="class" name="Channel" />*

---

### Channel ID

The globally unique 43-character [base62](#base62) string that identifies a channel. It is deterministically derived from the channel owner's [P-384](#p-384) public key as a SHA-384 hash, which means: (1) it cannot be forged without the corresponding private key; (2) it requires no central registry — the owner generates it offline; (3) knowing a Channel ID tells you nothing useful without the matching key material.

In the code and API, this is always `ChannelId` (a type alias for `SB384Hash`). Some documentation also uses "Channel Name" — these are the same thing.

*Related: [Channel](#channel), [Owner Key](#owner-key), [SB384](#owner-key), [base62](#base62)*

*API: <ApiLink type="class" name="SB384" method="userId" />, <ApiLink type="class" name="SB384" method="ownerChannelId" />*

---

### channel handle

A portable, self-contained description of a channel carrying enough information to connect to and operate it. At minimum it contains the user's private key; optionally includes the [Channel ID](#channel-id), channel server URL, and cached server-side channel data. Possessing a channel handle with a private key is equivalent to possessing the capability to act as owner of that channel — the handle *is* the capability token.

*Related: [Channel](#channel), [Channel ID](#channel-id), [Owner Key](#owner-key)*

*API: <ApiLink type="interface" name="ChannelHandle" />*

---

### Channel Server

The edge server (or cluster of servers) that hosts [Channels](#channel). Responsible for message routing, [WebSocket](#channel-server) connections, access control (visitor admission, channel restriction), storage budget enforcement, and channel metadata. In the current implementation, a single service handles both channel and storage operations, though they remain architecturally distinct. Channel Servers can be self-hosted.

*Related: [Channel](#channel), [addressable worker](#addressable-worker), [Storage Server](#storage-server), [Personal Channel Server](#personal-channel-server)*

*Read more: [dev/local-stack](/dev/local-stack)*

---

### CLI

The command-line interface tools for administering os384 channels and servers. Used for tasks like creating channels, sending messages, managing storage tokens, and configuring server keys. Environment variables (`OS384_CHANNEL_SERVER`, `OS384_STORAGE_SERVER`, `OS384_BUDGET_KEY`, `OS384_LEDGER_KEY`) configure which servers the CLI targets.

*Related: [Personal Channel Server](#personal-channel-server), [storage token](#storage-token), [LEDGER_KEY](#ledger_key)*

*Read more: [cli](/cli)*

---

### content addressing

A storage scheme where an object's identity (its address) is derived from a cryptographic hash of its content. Content addressing has three important properties: (1) identical content always produces the same address, enabling [deduplication](#deduplication) without comparing raw data; (2) any client can verify downloaded data by re-hashing it and comparing to the address; (3) addresses are server-independent — the same shard has the same ID on every storage server in the world, enabling [mirrors](#mirror) and cache servers without coordination.

In os384: all [Shards](#shard) are content-addressed. The storage ID is derived from the encrypted form of the data (see [FN](#fn-full-name)). Contrast with location-based addressing (URLs), where the same content can sit at different addresses on different servers.

*Related: [Shard](#shard), [FN](#fn-full-name), [deduplication](#deduplication), [verification](#verification)*

---

### cryptobiosis

The dormant state a [Channel](#channel) enters when it runs out of [storage budget](#storage-budget). In this state, <ApiLink type="class" name="Channel" method="getMessageKeys" /> returns only the channel's [deep history](#deep-history) shard — the frozen archive of past messages. The channel becomes read-only until new budget is allocated. The name borrows from biology, where cryptobiosis is the suspended state some organisms enter under resource deprivation.

Also called "frozen," "deep freeze," or "deep history mode."

In os384: cryptobiosis is not an error condition — it is an inherent property of the storage model. A channel in cryptobiosis can always be read (history is never lost) and can always be revived by allocating new budget via [budd](#budd) or a [storage token](#storage-token).

*Related: [deep history](#deep-history), [Storage Budget](#storage-budget), [TTL](#ttl), [budd](#budd)*

---

## D

### deduplication

The process by which the [Storage Server](#storage-server) avoids storing the same data twice — even across different users and channels — without ever seeing the plaintext. The first half of the [FN](#fn) (h1) is derived from the SHA-512 hash of the *unencrypted* content, so the server can recognize identical content without being able to read it. If an object with a given FN already exists, the server discards the new upload and returns the stored [verification](#verification) token.

In os384: privacy-preserving deduplication is a deliberate design goal. Two users uploading the same file will silently share the stored shard. Neither party can detect this from the outside, and the server cannot read either copy.

*Related: [FN](#fn), [verification](#verification), [Shard](#shard), [object](#object), [padding](#padding), [Privacy Window](#privacy-window)*

---

### deep history

The permanent, shard-based archive of a channel's message log. Messages with infinite [TTL](#ttl) (the default) are eventually moved from the active message map into deep history when the live message set exceeds the channel server's maximum. Deep history is stored as a structured tree of [shards](#shard) (a Merkle-like history tree).

This is the mechanism by which the channel message log *becomes* shard storage: the channel server chunks the message history and stores it as encrypted blobs on the storage server. The resulting shards have no knowledge of their origin — they are opaque bytes like any other shard. Deep history is always available, even for channels in [cryptobiosis](#cryptobiosis).

*Related: [cryptobiosis](#cryptobiosis), [TTL](#ttl), [Shard](#shard), [Channel](#channel)*

*API: <ApiLink type="interface" name="MessageHistory" />, <ApiLink type="interface" name="DeepHistory" />, <ApiLink type="interface" name="HistoryTree" />*

---

### dehydrated key

A compressed form of a [P-384](#p-384-secp384r1) private key that stores only the scalar `d` (the private key material), without the public key coordinates `x` and `y`. Identified in the wire format by the `XjZx` key prefix (compared to `Xj34` for a full private key). The public key can be recomputed from `d` at any time, but this requires additional computation. Dehydrated keys are more compact for storage and transmission.

In os384: use `hydrateKey(privKey, pubKey?)` to reconstitute a dehydrated key into its full form. The `pubKey` argument can supply the `x` coordinate when you have the public key available separately.

*Related: [P-384](#p-384-secp384r1), [Owner Key](#owner-key), [SB384](#sb384), [Public Key Pair](#public-key-pair)*

*API: <ApiLink type="function" name="hydrateKey" />*

---

### Durable Object

Cloudflare's implementation of an [addressable worker](#addressable-worker). A Durable Object is a unique, persistent JavaScript worker instance with its own local storage ([KV_local](#kv_local)) and WebSocket support, globally addressable by a unique identifier. In os384, each [Channel](#channel) is backed by a Durable Object.

In os384: "Durable Object" and "addressable worker" are used interchangeably in the code and documentation. The os384 design is not tied to Cloudflare specifically — Durable Objects are the reference implementation of the addressable worker concept for the current deployment.

*Related: [addressable worker](#addressable-worker), [KV_local](#kv_local), [Channel](#channel)*

*External: [Cloudflare Durable Objects docs](https://developers.cloudflare.com/durable-objects/)*

---

## E

### E2E Encryption (End-to-End Encryption)

Encryption where only the communicating parties can read messages — nothing in between (servers, networks, operators) has access. Conventional E2E means: secure *assuming* you trust all parts of the system. os384 distinguishes a stronger variant: "true E2E," where even the key management infrastructure cannot access messages once a channel is [restricted](#restricted) and the owner has rotated their keys. At that point, neither the channel server, the storage server, nor any cloud infrastructure provider can read content or establish participant identity.

In os384: all messages are encrypted. Unrestricted channels use server-assisted key distribution (the server facilitates key exchange but cannot read message content). Restricted channels with rotated keys give the server no useful access at all.

*Related: [Restricted](#restricted), [Channel](#channel), [Owner Key](#owner-key), [protocol](#protocol), [Micro Federation](#micro-federation), [sovereignty](#sovereignty)*

*Read more: [background](/background)*

---

### ECDH (Elliptic Curve Diffie-Hellman)

A key agreement protocol: two parties can each derive an identical shared secret from their own private key and the other party's public key, without ever transmitting the secret. The result is a symmetric encryption key both parties can independently compute.

In os384: ECDH over [P-384](#p-384) is the "whisper" protocol (`Protocol_ECDH`) used for private 1:1 messages between an owner and a specific visitor. Both parties derive the same AES key from their own private key and the other's public key.

*Related: [P-384](#p-384), [AES-256-GCM](#aes-256-gcm), [protocol](#protocol)*

*API: <ApiLink type="enumeration" name="SBProtocol" />*

---

### edge-native

An architectural approach where computation is distributed to the "edge" of the network — inside browsers (client side) and lightweight cloud workers (server side) — rather than concentrated in central data centers. The key observation behind os384's design is that the combined computing power of browsers and edge workers now exceeds traditional centralized cloud infrastructure.

In os384: "edge-native" means all sensitive operations (key generation, encryption, decryption) happen on the client device. The servers are deliberately minimal and cannot read user data. Backend services ([Channel Server](#channel-server), [Storage Server](#storage-server)) are implemented as edge workers that require no privileged access to operate.

*Related: [addressable worker](#addressable-worker), [non-addressable worker](#non-addressable-worker), [Loader](#loader), [sovereignty](#sovereignty)*

---

### env.js

A gitignored JavaScript file (`lib384/env.js`, `services/env.js`) that bridges environment-specific configuration into browser and Deno contexts. It exports `globalThis.env` with fields like `localBudgetKey`, `localLedgerKey`, `localWalletHandle`, and `configServerType`, which `config.js` reads to configure server URLs and key material.

`env.js` is a transitional mechanism — browsers cannot read Unix environment variables, so this file acts as the bridge. Copy `env.example.js` as a template and fill in your local keys after [bootstrapping](#bootstrap) a budget channel. Never commit a populated `env.js`; it contains private key material.

In Deno contexts the CLI reads environment variables directly (`OS384_BUDGET_KEY`, `OS384_LEDGER_KEY`, etc.) and does not use `env.js`.

*Related: [budget channel](#budget-channel), [CLI](#cli), [bootstrap](#bootstrap)*

*Read more: [dev/local-stack](/dev/local-stack)*

---

## F

### file

In os384, "file" is used broadly: any stored item — image, video, document, arbitrary binary data. os384 has no directory hierarchy; files are modeled as sets with path properties rather than as entries in a physical folder structure. The underlying storage primitive is an [SBFile](#sbfs), which wraps one or more [ObjectHandles](#object) (shards).

*Related: [Shard](#shard), [object](#object), [SBFS](#sbfs)*

*API: <ApiLink type="class" name="SBFile" />*

---

### FileSet

A packaged collection of static files (HTML, JS, CSS, assets) bundled together as a single [shard](#shard). FileSets are the delivery format for os384 apps: the [Loader](#loader) fetches a FileSet shard, reconstructs a virtual file system ([SBFS](#sbfs)) from it, and serves the app to the browser via a [Service Worker](#service-worker). Conceptually equivalent to a ZIP of a static web site, but encrypted, content-addressed, and served without the server knowing what it contains.

*Related: [Loader](#loader), [SBFS](#sbfs), [Service Worker](#service-worker), [Shard](#shard)*

---

### FN (Full Name)

The globally unique identifier of a stored [object](#object). An FN is derived by taking the SHA-512 hash of the padded, unencrypted content and splitting it into two 256-bit halves: **h1** (the first half, used as the server-side lookup key) and **h2** (the second half, used as the client-side encryption key material). The server never sees h2.

The two-half construction enables private [deduplication](#deduplication): h1 is sent to the storage server to retrieve a [nonce](#nonce) and [salt](#salt) — the server recognizes the same h1 for identical content and returns the same values. The client then uses h2 + salt with [PBKDF2](#pbkdf2-password-based-key-derivation-function-2) (100,000 iterations) to derive the encryption key independently. The final storage address of the shard is a *separate* SHA-256 hash taken over (iv + salt + encrypted data) — a third hash distinct from h1 and h2.

The [ObjectHandle](#objecthandle) returned from a successful store operation contains the shard's storage ID, the decryption key (h2 in base62), and the verification token — everything needed to retrieve and decrypt the shard later.

*Related: [object](#object), [Shard](#shard), [verification](#verification), [deduplication](#deduplication), [ObjectHandle](#objecthandle)*

*API: <ApiLink type="function" name="sbCrypto.generateIdKey" />*

---

## I

### iv (Initialization Vector)

A random value used in encryption to ensure that encrypting the same data twice with the same key produces different ciphertexts. Without an IV, an attacker could detect when the same message is sent repeatedly. The IV does not need to be kept secret — it is stored alongside the encrypted data.

In os384: IVs are used in [AES-256-GCM](#aes-256-gcm) encryption of [shards](#shard) and messages. In authenticated encryption contexts, the terms "iv" and "[nonce](#nonce)" are used interchangeably.

*Related: [nonce](#nonce), [salt](#salt), [AES-256-GCM](#aes-256-gcm)*

---

## K

### key

os384 identities are [P-384](#p-384-secp384r1) elliptic-curve key pairs. The system uses [base62](#base62)-encoded representations with type-discriminating prefixes so that any key string is self-describing. All prefixes are defined in lib384's `SBCrypto` module (`KeyPrefix` and `KeySubPrefix` enums).

**Prefix scheme:**

Every encoded key begins with a 3- or 4-character prefix. The first three characters identify the key type, and a fourth character (the "sub-prefix") encodes either the parity of the y-coordinate or whether the key is dehydrated:

| Prefix | Type | Meaning |
|---|---|---|
| `PNk2` | Public key | Compressed, y-coordinate is even |
| `PNk3` | Public key | Compressed, y-coordinate is odd |
| `Xj32` | Private key | Compressed (includes public), y even |
| `Xj33` | Private key | Compressed (includes public), y odd |
| `Xj34` | Private key | Uncompressed (full x + y + d) |
| `XjZx` | Dehydrated private key | Private scalar only (public components omitted; can be recomputed) |

The `2`/`3` sub-prefix comes from the SEC 1 compressed-point convention: `0x02` for even y, `0x03` for odd y. Parity is determined by the least-significant bit of the last byte of the y-coordinate.

**Key representations:**

A single [SB384](#sb384) identity can be viewed through several "perspectives":

- **Private key** (`Xj32`/`Xj33`): The full key pair — everything needed to act as this identity. This is what you store and pass to `-k` flags.
- **Public key** (`PNk2`/`PNk3`): The public half only. Safe to share; used by others to encrypt to you or verify your signatures.
- **Dehydrated key** (`XjZx`): A shorter form of the private key that omits the public components (since they can be recomputed from the private scalar and the curve). Useful when you're already storing the public key separately.
- **Channel ID / User ID**: A hash of the public key. This is how the rest of the system refers to an identity — it's the address, not the key itself.

Use `384 key` to generate a new identity or `384 key -k <privateKey>` to inspect an existing one and see all representations.

*Related: [SB384](#sb384), [P-384](#p-384-secp384r1), [base62](#base62), [channel ID](#channel-id)*

*Read more: [CLI Reference — key command](/cli#key)*

---

### KV_global

A key-value store accessible by all workers — both [Channel Server](#channel-server) and [Storage Server](#storage-server) instances. Used for data that must be readable from any worker: stored [objects (shards)](#shard), [storage tokens](#storage-token), and other global state. Designed to tolerate eventual consistency — reads may be slightly stale. In the Cloudflare implementation, this is Cloudflare Workers KV.

*Related: [KV_local](#kv_local), [Shard](#shard), [non-addressable worker](#non-addressable-worker)*

*Read more: [storage](/storage)*

---

### KV_local

A key-value store private to a specific [addressable worker](#addressable-worker) instance, and hence to a specific [Channel](#channel). Used for data requiring strong consistency: active message state, visitor keys, channel metadata, and administrative data. In the Cloudflare implementation, this is Durable Object storage.

Not to be confused with browser [Local Storage](#local-storage) on the client.

*Related: [KV_global](#kv_global), [addressable worker](#addressable-worker), [Durable Object](#durable-object)*

*Read more: [storage](/storage)*

---

## L

### ledger channel

An informal term for a [Channel](#channel) used to record metadata and operational history — such as which channels were created, when, and for what purpose. Not a distinct type in the os384 protocol; just a common usage pattern. The ledger is kept separate from the [budget channel](#budget-channel) so that bookkeeping never gets starved of [storage budget](#storage-budget) — even if the budget channel is nearly exhausted, the ledger retains its own small reserve and can still accept new records.

A typical setup (e.g. via `384 init`) creates a ledger channel first from a [storage token](#storage-token), then mints most of that budget off to a separate budget channel. The ledger keeps a small reserve and serves as the authoritative log of what was done.

*Related: [budget channel](#budget-channel), [budd](#budd), [Storage Budget](#storage-budget), [Channel](#channel), [CLI](#cli)*

---

### Loader

The os384 component that runs in the browser as the system's entry point — functioning simultaneously as microkernel, virtual machine manager, and bootloader. When you navigate to a 384.dev URL, the Loader interprets the URL fragment (which carries an app identifier or shard reference without transmitting it to any server), fetches the appropriate [FileSet](#fileset) from a channel server, sets up a virtual file system ([SBFS](#sbfs)) in a fresh browser subdomain, and launches the app via a [Service Worker](#service-worker). The Loader itself never persists user data; all key management happens in the app context it spawns.

In os384: the Loader is intentionally minimal and auditable. It can also be run locally from a static HTML file, completely independent of 384.dev infrastructure.

*Related: [FileSet](#fileset), [SBFS](#sbfs), [Service Worker](#service-worker), [Wallet](#wallet), [Channel](#channel)*

*Read more: [loader](/loader)*

---

### Local Storage

In the browser, `window.localStorage` — a persistent key-value store scoped to a specific origin. In os384, Local Storage is where channel keys, visitor information, and [Wallet](#wallet) state are kept on the client device. It is never synced or held by any server.

In os384: if Local Storage is cleared, the user must restore from a backup (exported key file or wallet recovery). This is a deliberate privacy trade-off — the server never holds these keys and therefore cannot assist in recovery.

*Related: [Wallet](#wallet), [Vault](#vault), [sovereignty](#sovereignty)*

*Read more: [local-storage](/local-storage)*

---

### locked

A [Channel](#channel) state in which only pre-approved [Visitors](#visitor) can join. Activated by the owner calling `channel.lock()`. After locking, new visitors must be individually accepted via `channel.acceptVisitor(userId)` before they can connect. The locked state is stored as a flag in the channel's server-side data and is reported in `ChannelAdminData.locked`.

In os384: locking is the channel owner's primary access-control mechanism for private channels. An unlocked channel permits any user to join (subject to [capacity](#capacity)). A locked channel is sometimes described as "restricted" or "closed" in informal usage.

*Related: [Restricted](#restricted), [capacity](#capacity), [Visitor](#visitor), [Owner](#owner)*

*API: <ApiLink type="class" name="Channel" method="lock" />*

---

## M

### manifest

Two related uses in os384:

1. The set of cryptographic information needed to fetch and decrypt a stored [object](#object): [FN](#fn), [verification](#verification), [salt](#salt), [iv](#iv), and size. Together these are the "key" to an encrypted shard — without the manifest you cannot retrieve or decrypt the object. Manifests typically travel as [Channel](#channel) messages, since [shards](#shard) themselves carry no metadata.

2. The application manifest (`384.manifest.json`) used by [AppMain](#appmain) to declare an app's entry point, dependencies, and resource channels. During local development a dotfile variant (`.384.manifest.json`) acts as a [shadow manifest](#shadow-manifest) that takes priority over the published one.

*Related: [FN](#fn), [verification](#verification), [object](#object), [AppMain](#appmain), [Channel](#channel), [shadow manifest](#shadow-manifest)*

---

### Message

The unit of communication on a [Channel](#channel). Every message has a body (arbitrary content), a sender (identified by `SBUserId`), a server-assigned timestamp, a [TTL](#ttl), and a unique `_id` (format: `channelId__subChannel__timestampPrefix`). Messages are encrypted end-to-end; the server routes them but cannot read the body.

Messages with default [TTL](#ttl) (15, permanent) are stored forever — first in the channel's active message map, then archived into [deep history](#deep-history). `TTL=0` messages are ephemeral and never stored.

Because [shards](#shard) carry zero metadata, channel messages are also the mechanism for distributing shard manifests — the information needed to retrieve and decrypt a stored object is always communicated as a message.

*Related: [TTL](#ttl), [Channel](#channel), [deep history](#deep-history), [SubChannel](#subchannel), [manifest](#manifest)*

*API: <ApiLink type="interface" name="Message" />, <ApiLink type="class" name="Channel" method="send" />*

---

### Micro Federation

The ability for an established, [restricted](#restricted) channel and its participants to "leave" their origin server and reconstitute on any other server without losing continuity. Also called *severability*.

Once a channel is restricted and the [Owner](#owner) has rotated their keys, every participant holds the public keys of every other participant in their local storage. Moving servers requires only that someone hosts a new one and securely shares its address — each participant exports their key file, connects to the new server, imports their keys, and the channel resumes. The storage components ([shards](#shard)) are independent: objects are content-addressed and can remain on the original storage server or be migrated separately as desired.

In os384: Micro Federation is a core [sovereignty](#sovereignty) property. No server operator — including 384, Inc. — can permanently cut off a group from their own conversation.

*Related: [Restricted](#restricted), [Owner Key](#owner-key), [sovereignty](#sovereignty), [Channel](#channel), [Local Storage](#local-storage)*

---

### mirror

A read-only replica of a [Storage Server](#storage-server). A mirror stores [shards](#shard) indexed by their content address and serves them via the standard fetch API, but cannot accept new uploads. Because shard IDs are [content-addressed](#content-addressing) and globally unique, any mirror can serve any shard without coordination — a client with the shard ID and [verification](#verification) token can retrieve the shard from any mirror that has it.

In os384: mirrors are useful for performance (CDN-like caching), redundancy, and offline access. Running a local mirror during development (`mirror.py`) caches shards on your machine to avoid repeated fetches from the network.

*Related: [Shard](#shard), [Storage Server](#storage-server), [content addressing](#content-addressing), [verification](#verification)*

---

### MOTD (Message of the Day)

An optional message set by the [Owner](#owner) of a [Channel](#channel), displayed to any participant joining or re-joining the channel. Can be changed by the owner at any time.

*Related: [Owner](#owner), [Channel](#channel), [Page](#page)*

---

### mother channel

The [Channel](#channel) from which a given channel was [budded](#budd). When `channel.budd()` creates a new channel, the new channel records the origin as its mother channel (retrievable via `channel.getMother()`). This creates a lineage tree that tracks how storage budget was allocated and can be used for auditing.

In os384: the mother channel relationship is stored server-side. A channel cannot be re-parented; the mother channel is set at creation and does not change.

*Related: [budd](#budd), [Storage Budget](#storage-budget), [budget channel](#budget-channel)*

*API: <ApiLink type="class" name="Channel" method="getMother" />*

---

## N

### non-addressable worker

An edge computing worker with no persistent global identity. When a client connects to a non-addressable worker, the infrastructure routes it to any available instance — there is no control over which one. Non-addressable workers have no local storage; all state must come from [KV_global](#kv_global). They scale horizontally without limit, making them ideal for stateless operations (fetching [shards](#shard), API calls that don't require channel-specific state). Contrast with [addressable worker](#addressable-worker).

In os384: shard fetch and store operations go through non-addressable workers; channel-specific operations (sending messages, managing visitors) require an [addressable worker](#addressable-worker).

*Related: [addressable worker](#addressable-worker), [Durable Object](#durable-object), [KV_global](#kv_global)*

---

### nonce

A "number used once" — a random value included in encryption to prevent an attacker from detecting when the same message is sent repeatedly. In [AES-256-GCM](#aes-256-gcm), the nonce ensures that encrypting the same plaintext with the same key produces different ciphertext every time.

In os384: nonces are used in all shard and message encryption. In authenticated encryption contexts, "nonce" and "[iv](#iv)" are used interchangeably.

*Related: [iv](#iv), [salt](#salt), [AES-256-GCM](#aes-256-gcm)*

---

## O

### object

An immutable, encrypted, content-addressed blob of data stored in os384. Every object has a globally unique [FN](#fn) derived from its contents, is encrypted before leaving the client, is [padded](#padding) to obscure its true size, and is stored with a server-assigned [verification](#verification) token. Objects have no metadata of any kind — no name, no type, no owner. All such context must be communicated separately through [Channel](#channel) messages. An [ObjectHandle](#object) contains all the information needed to retrieve and decrypt an object.

"Object" and "[Shard](#shard)" refer to the same storage unit — "object" emphasizes the logical view, "shard" the physical storage unit.

*Related: [Shard](#shard), [FN](#fn), [verification](#verification), [deduplication](#deduplication), [padding](#padding), [Channel](#channel)*

*API: <ApiLink type="interface" name="ObjectHandle" />, <ApiLink type="interface" name="ShardInfo" />*

---

### ObjectHandle

The complete in-memory descriptor for a [Shard](#shard) — sufficient to retrieve, authenticate, and decrypt it. An ObjectHandle is what you hold after storing data and what you share with others to give them access to it.

Key fields: `id` (the content address, 43-char base62), `key` (the decryption key material, base62-encoded h2 half of SHA-512), `iv` and `salt` (returned by the server, needed for decryption), `verification` (the server-issued access token), and optionally `payload` (the decrypted contents, populated after `fetchData()`). Also carries `storageServer` (a hint for where to fetch it) and `type` (MIME type).

To **retrieve** a shard you need `id` + `verification`. To **decrypt** it you additionally need `key` + `iv` + `salt`. The storage server supplies `iv` and `salt` on fetch if you provide `id` + `verification`.

Distinct from [ShardInfo](#shard) (the server's minimal representation, which only has `id`, `iv`, `salt`).

*Related: [Shard](#shard), [FN](#fn-full-name), [verification](#verification), [object](#object)*

*API: <ApiLink type="interface" name="ObjectHandle" />, <ApiLink type="class" name="StorageApi" method="storeData" />, <ApiLink type="class" name="StorageApi" method="fetchData" />*

---

### Origin Server

The [Channel Server](#channel-server) at whose domain a particular [Channel ID](#channel-id) was first allocated. The origin server is not tracked or recorded in any central registry — there is no authority over channel assignment. Once a channel exists, it can migrate to other servers via [Micro Federation](#micro-federation). The concept of an origin server is relevant mainly for auditing.

*Related: [Channel](#channel), [Channel Server](#channel-server), [Micro Federation](#micro-federation)*

---

### Owner

The entity that holds the private key corresponding to a [Channel's](#channel) [Channel ID](#channel-id). The owner has exclusive rights to all administrative operations: accepting [visitors](#visitor), [restricting](#restricted) the channel, setting the [MOTD](#motd), rotating keys, [budding](#budd) channels, setting capacity, and setting [Pages](#page). There is exactly one owner per channel, determined solely by possession of the private key — not by any server-side record.

*Related: [Owner Key](#owner-key), [Channel](#channel), [Restricted](#restricted), [channel handle](#channel-handle)*

*API: <ApiLink type="class" name="ChannelKeys" method="owner" />*

---

### Owner Key

The [P-384](#p-384) private key from which a channel's [Channel ID](#channel-id) is derived. It is the root of a channel's identity: without it, no administrative operation on the channel is possible. The Channel ID is the SHA-384 hash of the corresponding public key. Owner keys are unique per channel — the same user has different owner keys for different channels, providing privacy isolation between channels.

*Related: [Owner](#owner), [Channel ID](#channel-id), [P-384](#p-384)*

*API: <ApiLink type="class" name="SB384" method="userPrivateKey" />, <ApiLink type="class" name="SB384" method="ownerChannelId" />*

---

## P

### page (Channel Page)

A single public-facing content object served by the [Channel Server](#channel-server) at a fixed, unauthenticated URL path (`/api/v2/page/<prefix>`). Any MIME type is supported — JavaScript, HTML, PDF, JSON, images. Clients can read a page without any authentication; the channel owner sets the page content via `channel.setPage()`.

In os384: pages are the mechanism for hosting public static assets on top of channels. The Loader itself is served as a page, lib384 is served as a page, and apps typically expose their entry point via a page. A short "page prefix" can function like a URL shortener — the `#A1cQwk`-style fragment in os384 links resolves to a page prefix.

*Related: [Channel](#channel), [Loader](#loader), [manifest](#manifest), [SBFS](#sbfs-os384-virtual-file-system)*

*API: <ApiLink type="class" name="Channel" method="setPage" />, <ApiLink type="class" name="ChannelApi" method="getPage" />*

---

### passphrase

The word-based component of a [Wallet](#wallet) credential, complementing the [strongpin](#strongpin). A passphrase is a sequence of randomly selected plain-English words — the recommended baseline is three words, contributing approximately 39–42 bits of entropy. The passphrase is intended to be memorable or writable in natural language, while the strongpin is optimized for unambiguous transcription.

Together, strongpin + passphrase are the two inputs to [PBKDF2](#pbkdf2-password-based-key-derivation-function-2) (10 million iterations) that derives the wallet's [P-384](#p-384-secp384r1) private key. Neither alone is sufficient.

In os384: generated by `generatePassPhrase()`. Unlike the strongpin, the passphrase does not have a parity check — each word contributes independently.

*Related: [strongpin](#strongpin), [Wallet](#wallet), [PBKDF2](#pbkdf2-password-based-key-derivation-function-2)*

*API: <ApiLink type="function" name="generatePassPhrase" />*

---

### P-384 (secp384r1)

An elliptic curve defined by NIST standards, used for all public-key cryptography in os384. P-384 provides approximately 192 bits of security — meaningfully stronger than the more common P-256 (128-bit security). Key pairs on P-384 are used for [ECDH](#ecdh) key agreement and digital signatures.

In os384: every user identity, channel identity, and ownership proof is ultimately grounded in a P-384 key pair. The "384" in os384 refers to this curve.

*Related: [ECDH](#ecdh), [Owner Key](#owner-key), [Public Key Pair](#public-key-pair)*

*API: <ApiLink type="class" name="SB384" />*

---

### padding

The process of expanding an [object's](#object) size to the nearest power of two before encryption, preventing the storage server from inferring content type or true size from the ciphertext length. The minimum padded size is 32 KiB; maximum is 32 MiB.

In os384: padding is a privacy measure. Without it, an object's size would leak information (e.g., a ~50 KB file is probably a compressed image). After padding, all objects in the same size bucket are indistinguishable to the storage server.

*Related: [object](#object), [Shard](#shard), [AES-256-GCM](#aes-256-gcm), [deduplication](#deduplication)*

---

### payload format

The binary serialization container used for all stored data and channel message bodies in os384. A payload is an `ArrayBuffer` prefixed with a 4-byte magic header (`0xAABBBBAA`), followed by a compact representation of any JavaScript value — objects, arrays, `ArrayBuffer`, `Map`, typed arrays, and more.

All content stored in os384 goes through `assemblePayload()` before encryption, and through `extractPayload()` after decryption. The payload format is what the encryption layer sees — the storage server only ever handles encrypted payloads and never knows their internal structure.

*Related: [Shard](#shard), [Message](#message), [object](#object)*

*API: <ApiLink type="function" name="assemblePayload" />, <ApiLink type="function" name="extractPayload" />*

---

### PBKDF2 (Password-Based Key Derivation Function 2)

A standard algorithm for deriving a cryptographic key from a passphrase or other lower-entropy input. It applies a hash function many times in sequence (controlled by an iteration count), making brute-force guessing computationally expensive — each guess requires doing all the iterations.

In os384: PBKDF2 is used in two distinct contexts with different iteration counts. For shard encryption: 100,000 iterations, using the h2 half of the content's SHA-512 hash as key material — fewer iterations are appropriate since h2 is already high-entropy hash data, not a human password. For [Wallet](#wallet) key derivation from a [strongpin](#strongpin) + [passphrase](#passphrase): 10 million iterations — high because the input is human-chosen and must resist brute force. The wallet iteration count was upgraded from 100,000 in earlier versions.

*Related: [Wallet](#wallet), [strongpin](#strongpin), [salt](#salt), [AES-256-GCM](#aes-256-gcm), [FN](#fn)*

*API: <ApiLink type="class" name="SBCrypto" />*

---

### perma

The unit of storage accounting in os384. One perma corresponds to permanently storing 4 KiB of data. Storage budgets, costs, and token values are expressed in permas.

*Related: [Storage Budget](#storage-budget), [storage token](#storage-token), [Shard](#shard)*

---

### Personal Channel Server

An instance of a [Channel Server](#channel-server) run for personal or private use, typically on hardware you control. Running your own channel server is the path to full [sovereignty](#sovereignty) — your channels are not dependent on 384.dev or any third-party infrastructure. The server software and configuration are fully open source.

*Related: [Channel Server](#channel-server), [sovereignty](#sovereignty), [Micro Federation](#micro-federation)*

*Read more: [dev/local-stack](/dev/local-stack)*

---

### PII (Personally Identifiable Information)

Any data that can uniquely identify a specific individual — name, email address, phone number, device fingerprint, etc. os384 is designed to minimize PII in the system and to avoid exposing it to operators. In a fully [restricted](#restricted) channel with rotated keys, even the channel operator holds no PII about participants.

*Related: [sovereignty](#sovereignty), [E2E Encryption](#e2e-encryption-end-to-end-encryption), [Restricted](#restricted)*

---

### Privacy Window

A rolling 14-day period after which the per-object h1 prefix records used for [deduplication](#deduplication) are discarded. The Privacy Window limits how long the server can correlate which objects were stored by the same channel. After the window expires, the h1 record is deleted — the stored [shard](#shard) itself remains, but the deduplication index entry does not.

*Related: [FN](#fn), [deduplication](#deduplication), [object](#object)*

---

### protocol

The encryption scheme applied to a specific message on a [Channel](#channel). os384 supports two: `Protocol_ECDH` (asymmetric, for private 1:1 "whisper" messages using [ECDH](#ecdh) key agreement between owner and one visitor) and `Protocol_AES_GCM_256` (symmetric [AES-256-GCM](#aes-256-gcm), for group messages where all participants share an encryption key). Protocol can be set per message.

*Related: [E2E Encryption](#e2e-encryption-end-to-end-encryption), [ECDH](#ecdh), [AES-256-GCM](#aes-256-gcm)*

*API: <ApiLink type="enumeration" name="SBProtocol" />*

---

### Public Key Pair

An asymmetric cryptographic key pair consisting of a private key (kept secret) and a public key (shared freely). In os384, all key pairs use [P-384](#p-384). The public key is used to encrypt data *to* you and verify your digital signatures; the private key is used to decrypt and to sign.

In os384: key pairs serve double duty — they are both cryptographic credentials and identity. Your [Channel ID](#channel-id) is derived from your public key, so identity and encryption capability are mathematically inseparable. For public channel servers, key pairs are generated offline using <ApiLink type="function" name="sbCrypto.gen_p384_pair" />.

*Related: [P-384](#p-384), [Owner Key](#owner-key), [ECDH](#ecdh)*

---

## R

### ready template

A construction pattern used throughout lib384. Because many classes require asynchronous initialization (key generation, network lookups, WebSocket setup), they cannot complete setup in a synchronous constructor. Instead, each such class exposes a `ready` property — a Promise that resolves to the fully initialized object. You create the instance synchronously, then `await obj.ready` before accessing any properties.

```typescript
const ch = new Channel(handle)
await ch.ready          // waits for key import and channel setup
ch.send('hello world')  // safe to call now
```

Accessing key properties (like `channelId`, `userPublicKey`) before `ready` resolves will throw. All classes in the [SB384](#sb384) hierarchy follow this pattern.

*Related: [SB384](#sb384), [Channel](#channel), [ChannelSocket](#channel)*

---

### Restricted

A channel mode where only [Visitors](#visitor) explicitly approved by the [Owner](#owner) can participate. When a channel is restricted, the owner distributes encrypted copies of the channel's shared key to each approved visitor individually, using [ECDH](#ecdh) between the owner's key and each visitor's key. Restriction is a "fire once" operation — once set, the access model is locked and can only be changed through further owner action.

In os384: a restricted channel with rotated keys is the strongest privacy mode available — the channel server cannot read messages, and the participant set is entirely under owner control. This is the foundation for [Micro Federation](#micro-federation) and the "[Insider Privacy Model](#e2e-encryption-end-to-end-encryption)" described in the background documentation.

*Related: [Owner](#owner), [E2E Encryption](#e2e-encryption-end-to-end-encryption), [Micro Federation](#micro-federation), [Visitor](#visitor)*

---

## S

### salt

A random value mixed into data before hashing or key derivation to ensure that identical inputs produce different outputs. Salts prevent precomputed lookup table attacks ("rainbow tables") and ensure that two users storing identical files produce differently-keyed ciphertexts even though the content hash (h1) is the same.

In os384: salts are generated by the [Storage Server](#storage-server) when a new object is first registered (before encryption), stored alongside the encrypted object, and returned to any client presenting a valid [FN](#fn) + [verification](#verification) for decryption.

*Related: [nonce](#nonce), [iv](#iv), [PBKDF2](#pbkdf2), [FN](#fn), [AES-256-GCM](#aes-256-gcm)*

---

### SB384

The root identity object in lib384 — a [P-384](#p-384-secp384r1) key pair with its externally-visible identity formats. Every user, channel, and app key in os384 is ultimately an SB384 object. The class is the "basic capability object": its `userId` (a 43-char base62 SHA-384 hash of the public key) is used interchangeably as both a user ID and a channel ID; its `userPrivateKey` proves ownership.

Follows the [ready template](#ready-template): always `await obj.ready` before accessing properties.

```typescript
const identity = new SB384()
await identity.ready
console.log(identity.userId)        // e.g. "Xk4aB3..."  (43 chars)
console.log(identity.userPublicKey) // "PNk4..." + base62-encoded coordinates
```

The name traces back to "Snackabra 384" — the project from which os384 evolved. The `ChannelKeys` and `Channel` classes extend SB384, adding channel-server connectivity on top of the base key pair.

*Related: [P-384](#p-384-secp384r1), [Channel ID](#channel-id), [Owner Key](#owner-key), [dehydrated key](#dehydrated-key), [ready template](#ready-template)*

*API: <ApiLink type="class" name="SB384" />*

---

### SBFS (os384 Virtual File System)

The virtual file system that the [Loader](#loader) constructs in a browser subdomain when launching an app. SBFS uses a browser [Service Worker](#service-worker) to intercept all HTTP requests within the app's origin and serve responses from the decrypted [FileSet](#fileset) contents. To the app, it looks like a normal web server; in reality, all files are being decrypted from an encrypted shard and served from memory.

*Related: [Loader](#loader), [FileSet](#fileset), [Service Worker](#service-worker)*

*API: <ApiLink type="class" name="SBFileSystem" />, <ApiLink type="class" name="SBFileSystem2" />*

---

### Service Worker

A browser standard that allows JavaScript code to intercept and handle network requests within a specific origin, running in a background thread separate from the page. os384 uses a Service Worker as the core of [SBFS](#sbfs): once registered in a subdomain, it intercepts every request the app makes and serves the appropriate decrypted file from the [FileSet](#fileset) in memory.

In os384: the Service Worker is what makes os384 apps work transparently — it bridges the gap between the encrypted storage system and the web app's expectation of a normal file server.

*Related: [SBFS](#sbfs), [Loader](#loader), [FileSet](#fileset)*

---

### Shard

The fundamental storage unit in os384. A shard is an immutable, encrypted, content-addressed binary blob stored on a [Storage Server](#storage-server). Shards have no metadata whatsoever — no name, no type, no owner record. All context about a shard (what it contains, who has rights to it, how to decrypt it) exists solely in [Channel](#channel) messages that carry the shard's [manifest](#manifest).

Accessed by [FN](#fn) + [verification](#verification) and decrypted using the associated key, [iv](#iv), and [salt](#salt). "Shard" and "[object](#object)" refer to the same thing — "object" emphasizes the logical view, "shard" the physical storage unit.

*Related: [object](#object), [FN](#fn), [verification](#verification), [Storage Server](#storage-server), [deduplication](#deduplication), [Channel](#channel)*

*API: <ApiLink type="interface" name="ShardInfo" />, <ApiLink type="interface" name="ObjectHandle" />, <ApiLink type="class" name="StorageApi" />*

---

### sovereignty

The combination of three user rights that os384 is designed to guarantee: **control** (you decide who accesses your data and on what terms), **transparency** (you know where and how your data is stored and what laws apply), and **freedom** (you can always export your data and take it elsewhere — no vendor lock-in). This framing synthesizes the User Data Manifesto (Karlitschek, Roy) and related work and is the organizing principle of os384's design.

In technical terms, sovereignty is realized through client-side key management, open-source servers, and [Micro Federation](#micro-federation).

*Related: [Micro Federation](#micro-federation), [E2E Encryption](#e2e-encryption-end-to-end-encryption), [Restricted](#restricted), [Wallet](#wallet), [Personal Channel Server](#personal-channel-server)*

*Read more: [background](/background)*

---

### Storage Budget

The amount of storage a [Channel](#channel) is authorized to use, measured in [permas](#perma) (4 KiB units). All stored [objects](#object) are charged against the originating channel's budget at the time of storage. When the budget is exhausted, the channel enters [cryptobiosis](#cryptobiosis). Budget is transferred between channels via [budd](#budd) or [storage tokens](#storage-token).

*Related: [perma](#perma), [budd](#budd), [storage token](#storage-token), [cryptobiosis](#cryptobiosis)*

*API: <ApiLink type="class" name="Channel" method="getCapacity" />, <ApiLink type="class" name="Channel" method="setCapacity" />*

---

### Storage Server

The edge server responsible for storing and retrieving encrypted [objects (shards)](#shard). The storage server handles content-addressed blob storage (`storeRequest`, `storeData`, `fetchData`) and never sees plaintext — all encryption and decryption happens on the client. In the current implementation this is merged with the [Channel Server](#channel-server) into a single service, but remains architecturally distinct.

*Related: [Shard](#shard), [Channel Server](#channel-server), [KV_global](#kv_global), [FN](#fn)*

*Read more: [storage](/storage)*

---

### storage token

A single-use authorization for a specific amount of [storage budget](#storage-budget). Consuming a token (via `SB.create(token)`) creates a new [Channel](#channel) carrying that budget; the token cannot be reused.

Two ways to obtain a storage token:

- **[Bootstrap](#bootstrap)** — insert a token directly into the Channel Server's KV store using `wrangler kv key put` or `bootstrap.token.ts`. Requires server ownership. Used once at initial setup (or to replenish a server).
- **Mint** — draw a new token from an existing funded channel using `budgetChannel.getStorageToken(size)`. Requires a channel with available budget. Used to provision new users or sub-systems.

Storage tokens are the primary out-of-band mechanism for provisioning users who have no channels yet.

*Related: [Storage Budget](#storage-budget), [LEDGER_KEY](#ledger_key), [budd](#budd), [Wallet](#wallet), [bootstrap](#bootstrap)*

*API: <ApiLink type="interface" name="SBStorageToken" />*

---

### shadow manifest

A local-only override for an app's [manifest](#manifest) (definition 2), placed as `.384.manifest.json` (dotfile) in the app's working directory. [AppMain](#appmain) checks for this dotfile first and, if present, uses it in place of `384.manifest.json`. This lets you iterate on an app's manifest locally without touching the deployed version or running the full [Loader](#loader) and service worker stack.

The shadow manifest is a development convenience only — it should be gitignored and never deployed. It is the primary bridge for developing os384 apps against a local wrangler server stack without needing the browser Loader infrastructure.

*Related: [manifest](#manifest), [AppMain](#appmain), [Loader](#loader)*

*Read more: [dev/local-stack](/dev/local-stack)*

---

### strongpin

A compact, human-typeable identifier used as the "username" component of [Wallet](#wallet) authentication. A strongpin consists of one or more 4-character groups from a carefully designed character set that excludes visually ambiguous characters (e.g., `0` vs `O`) and avoids common words. Each 4-character group provides 19 bits of entropy; a full 16-character (4-group) strongpin provides 76 bits.

In os384: a strongpin is paired with a passphrase and fed into [PBKDF2](#pbkdf2) to derive the wallet's key material. The character set is designed for dictation and reliable entry on mobile keyboards.

*Related: [Wallet](#wallet), [Vault](#vault), [PBKDF2](#pbkdf2)*

*Read more: [strongpin](/strongpin)*

---

### SubChannel

A 4-character tag that scopes messages within a [Channel](#channel), providing logical partitioning of the message stream without creating separate channels. Every message `_id` includes a subChannel field. Used internally by os384 for TTL-categorized storage (TTL messages are duplicated into sub-channels `___3` through `___8` for efficient range queries).

*Related: [Channel](#channel), [Message](#message), [TTL](#ttl)*

*API: <ApiLink type="interface" name="MessageOptions" />*

---

## T

### timestamp prefix

A 26-character base-4 string embedded in every [message's](#message) `_id`. Encodes the server-assigned timestamp in a format that sorts lexicographically in chronological order, enabling efficient prefix-based range queries on the message log without a secondary index. Base-4 (digits 0–3) was chosen because it maps cleanly into the key format and supports the branching factor of the [deep history](#deep-history) tree.

*Related: [Message](#message), [deep history](#deep-history), [Channel](#channel)*

---

### TTL (Time to Live)

The lifetime setting for a message or shard, encoded as an index rather than a raw duration. Valid values and their meanings:

| Index | Duration |
|-------|----------|
| 0 | Ephemeral (never stored) |
| 3 | 1 minute |
| 4 | 5 minutes |
| 5 | 30 minutes |
| 6 | 4 hours |
| 7 | 36 hours |
| 8 | 10 days |
| 15 | Permanent (default) |

Values 1–2 and 9–14 are reserved. TTL=15 (permanent/permastore) is the default — messages and shards are stored forever unless explicitly set otherwise. Routable messages (with a `sendTo` field) may not have TTL above 8.

*Related: [cryptobiosis](#cryptobiosis), [deep history](#deep-history), [Message](#message), [SubChannel](#subchannel)*

*API: <ApiLink type="type-alias" name="MessageTtl" />*

---

## V

### Vault

A [Wallet](#wallet) that has been registered with and authorized on a [Channel Server](#channel-server). While a Wallet is a purely local, offline construct (it can exist as an exported key file), a Vault is live — it has a corresponding channel on a server, enabling remote access, key backup, and the ability to restore from a [strongpin](#strongpin) and passphrase on a new device.

*Related: [Wallet](#wallet), [strongpin](#strongpin), [Channel](#channel), [Loader](#loader)*

---

### verification

A server-generated random value (stored as a dot-separated string of four 16-bit integers; effectively 64 bits of randomness) returned when an [object](#object) is first stored. Subsequently, presenting the [FN](#fn) together with the correct verification is required to retrieve the object.

The verification serves two purposes: it proves that you (or someone you authorized) previously paid for the storage of this object; and it prevents enumeration attacks — an attacker cannot retrieve objects by guessing FNs alone.

*Related: [FN](#fn), [object](#object), [Shard](#shard), [manifest](#manifest)*

*API: <ApiLink type="interface" name="ObjectHandle" />, <ApiLink type="interface" name="ShardInfo" />*

---

### Visitor

A non-owner participant in a [Channel](#channel). Visitors can send and receive messages (subject to the channel's [restriction](#restricted) settings) but cannot perform administrative operations. In a [restricted](#restricted) channel, visitors must be explicitly approved by the [Owner](#owner). The public keys of all current visitors are stored in the channel's [KV_local](#kv_local).

*Related: [Owner](#owner), [Restricted](#restricted), [Channel](#channel)*

*API: <ApiLink type="class" name="Channel" method="acceptVisitor" />, <ApiLink type="class" name="Channel" method="getPubKeys" />*

---

## W

### Wallet

A local, offline representation of a user's cryptographic identity in os384. A Wallet holds the key material derived from a [strongpin](#strongpin) + passphrase via [PBKDF2](#pbkdf2), which is used to access channels and storage. A Wallet that has been instantiated on a server is called a [Vault](#vault). Wallets can be exported as key files for backup or migration between devices.

*Related: [Vault](#vault), [strongpin](#strongpin), [PBKDF2](#pbkdf2), [Channel](#channel), [Local Storage](#local-storage)*

*Read more: [wallet](/wallet)*

---

### whisper

The informal name for `Protocol_ECDH`, the default 1:1 message encryption protocol in os384. When a message is sent with a `sendTo` field specifying a recipient, it is "whispered" — encrypted using a shared secret derived from [ECDH](#ecdh-elliptic-curve-diffie-hellman) key agreement between the sender's channel key and the recipient's [P-384](#p-384-secp384r1) public key. Only the intended recipient can decrypt it.

Contrast with `Protocol_AES_GCM_256`, which uses a shared passphrase for group channels where all participants hold the same key.

In os384: whisper is the default when you call `channel.send(contents, { sendTo: recipientId })`. Without `sendTo`, messages are encrypted for the channel owner instead.

*Related: [ECDH](#ecdh-elliptic-curve-diffie-hellman), [E2E Encryption](#e2e-encryption-end-to-end-encryption), [protocol](#protocol), [Message](#message)*

*API: <ApiLink type="class" name="Protocol_ECDH" />*
