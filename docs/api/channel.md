# Channels

Channels are the core communication and state primitive in os384. A channel is identified by a P-384 public key, is end-to-end encrypted, and serves simultaneously as a message bus, a key-value store, and a storage budget account. For a conceptual overview, see [Channels](/channels).

---

## ChannelApi

`ChannelApi` is your main entry point to a channel server. Most apps create a single instance of it.

```typescript
import { ChannelApi } from 'lib384'

const sb = new ChannelApi('https://c3.384.dev')
```

`ChannelApi` extends `SBEventTarget`, so it emits events (notably `'online'` and `'offline'`) at the class level.

### Constructor

```typescript
new ChannelApi(channelServer: string, options?: { DBG?: boolean; DBG2?: boolean; sbFetch?: ... } | boolean)
```

`sbFetch` lets you provide a custom fetch function — useful in Cloudflare Workers (service bindings). Pass `true` as `options` to enable basic debug output.

Creating a `ChannelApi` instance automatically sets `ChannelApi.defaultChannelServer`.

### Connecting to channels

```typescript
// Returns a Channel (fetch-based)
const ch = sb.connect(handleOrKey)

// Returns a ChannelSocket (WebSocket, low-latency)
const sock = sb.connect(handleOrKey, (msg) => { console.log(msg) })
```

### Creating channels

```typescript
// Budd a new channel from an existing one (transfers minimal storage)
const handle: ChannelHandle = await sb.create(existingChannel)

// Or fund from a storage token
const handle: ChannelHandle = await sb.create(storageToken)
```

`ChannelApi.create()` returns a `ChannelHandle`. To get a live `Channel` object, use `Channel.create()` on the channel itself.

### Fetching a page (unauthenticated)

```typescript
const { type, payload } = await sb.getPage(prefix)
```

Gets the "page" of a channel without authentication — useful for public app manifests and static content.

### Static members

| Member | Description |
|---|---|
| `ChannelApi.defaultChannelServer` | Get/set the default channel server URL. |
| `ChannelApi.version` | lib384 version string. |
| `ChannelApi.knownShards` | Global `Map<hash, ObjectHandle>` cache updated by `fetchData()`. |
| `ChannelApi.onlineStatus` | `"online" \| "offline" \| "unknown"` |
| `ChannelApi.isShutdown` | `true` after `closeAll()` is called. |
| `ChannelApi.closeAll()` | Closes all active WebSockets and fetch operations globally. |
| `ChannelApi.getServerInfo(server?)` | Returns `SBServerInfo` for the given server (or default). Returns `undefined` if unreachable. |
| `ChannelApi.dateNow()` | Returns a monotonically increasing, precise timestamp. Use for message ordering. |

### Accessors

```typescript
sb.storage   // → StorageApi instance for the associated storage server
sb.crypto    // → sbCrypto (global SBCrypto instance)
sb.version   // → lib384 version string
sb.getStorageServer()  // → Promise<string>  (URL of storage server)
```

---

## Channel

`Channel` extends `ChannelKeys` and is the primary object for interacting with a channel. You can create one from scratch, from a key, or from a handle.

### Constructors

```typescript
new Channel()                                // create from scratch (mints Owner key)
new Channel(null, protocol)                  // from scratch with explicit protocol
new Channel(key: SBUserPrivateKey, protocol?) // from existing key
new Channel(handle: ChannelHandle, protocol?) // from full/partial handle (fastest)
```

A from-scratch `Channel` is mathematically unique but not yet hosted anywhere — no server knows about it until you call `channel.create()`.

### Sending messages

```typescript
await channel.send(contents, options?)
```

`contents` can be any serializable value. The message is packaged synchronously and sent asynchronously off an internal queue. Returns the server's response string.

```typescript
const options: MessageOptions = {
  ttl: 8,               // ~10 days
  sendTo: recipientId,  // routes to specific user
  subChannel: 'myapp',  // 4-char subchannel tag
  protocol: myProtocol, // override per-message
}
```

### Reading messages

```typescript
// Get the set of message keys for a time range
const { keys } = await channel.getMessageKeys(prefix?)

// Fetch and decrypt a batch
const messages: Map<string, Message> = await channel.getMessageMap(keys)

// Or raw (unencrypted) for special use cases
const raw: Map<string, ArrayBuffer> = await channel.getRawMessageMap(keys)
```

### Message history

```typescript
// Returns a ClientDeepHistory tree
const history = await channel.getHistory()
```

`ClientDeepHistory` extends `DeepHistory`, which is a Merkle-tree-like structure. You can traverse it with `traverseMessagesGenerator(from, to, reverse)`.

### Key-value store

Each channel has a built-in KV store. Values can be any type (up to 4 MiB each).

```typescript
await channel.put(key, value, encrypt?)
const value = await channel.get(key)
```

::: warning Budget
KV storage is more expensive than shard storage. Prefer shards for large values.
:::

### Channel pages

A "page" is a single public-facing response served by the channel server at `GET /api/v2/page/<prefix>`. Any content type is supported.

```typescript
await channel.setPage({ page: myContent, type: 'text/html', prefix: 12 })
const content = await channel.getPage()
```

### Lifecycle and authorization

```typescript
// Register this channel on a server
await channel.create(storageToken, channelServer?)

// Transfer or spin off storage budget
const newHandle = await channel.budd(options?)
```

`budd()` is the storage budget operation:

```typescript
// Various combinations:
await channel.budd()                          // new channel, minimal budget
await channel.budd({ size: 32_000_000 })     // new channel, 32 MB
await channel.budd({ targetChannel: handle }) // transfer to existing channel
await channel.budd({ size: Infinity })        // transfer everything ("plunder")
```

### Owner-only operations

```typescript
await channel.acceptVisitor(userId)
await channel.lock()           // only pre-approved visitors
await channel.setCapacity(n)
await channel.getAdminData()   // → ChannelAdminData
await channel.getMother()      // → channelId of mother channel
await channel.getStorageToken(size) // → SBStorageToken
```

### Timestamp utilities (static)

Channel message keys have the format `<channelId>_<i2>_<timestampPrefix>` where `timestampPrefix` is 26 base-4 (`[0-3]`) characters.

```typescript
Channel.timestampToBase4String(ms)     // epoch ms → base4 string
Channel.base4StringToTimestamp(str)    // base4 string → epoch ms
Channel.deComposeMessageKey(key)       // → { channelId, i2, timestamp }
Channel.composeMessageKey(channelId, timestamp, subChannel?)
Channel.getLexicalExtremes(set)        // → [min, max]
```

---

## ChannelSocket

`ChannelSocket` extends `Channel` with a WebSocket transport for lower latency and higher throughput.

```typescript
const sock = new ChannelSocket(handleOrKey, onMessage, protocol?)
await sock.ready

// or via ChannelApi:
const sock = sb.connect(handle, (msg) => { ... })
```

`onMessage` receives either a `Message` (decrypted, validated) or a raw `string` (low-level server message).

### Key members

| Member | Description |
|---|---|
| `send(contents, options?)` | Send and get back `"success"` or an error string. |
| `close()` | Gracefully close the WebSocket. |
| `reset()` | Reconnect without blocking. `ready` resolves when reconnected. |
| `status` | `"OPEN" \| "CLOSED" \| "CONNECTING" \| "CLOSING"` |
| `enableTrace` | Set `true` to print low-level WebSocket debug output. |

ChannelSocket manages its own reconnection — you don't need to check if the connection is open before calling `send()`.

---

## ChannelStream

`ChannelStream` extends `Channel` with an async-sequence interface for processing messages — both historical and live — via `AsyncSequence`.

```typescript
const stream = new ChannelStream(handle)
await stream.ready

// New preferred API: returns an AsyncSequence<Message>
const seq = await stream.spawn({ start: 0, live: true })
for await (const msg of seq) {
  console.log(msg)
}
```

### `spawn()` options

```typescript
interface ChannelStreamOptions {
  start?: number   // epoch ms, 0 = from beginning of time
  end?: number     // epoch ms, Infinity = latest
  live?: boolean   // default true: keep receiving new messages
}
```

### `start()` (deprecated)

The older `start()` method also returns an `AsyncGenerator<Message>`. It is being superseded by `spawn()` but remains functional.

```typescript
for await (const msg of stream.start({ prefix: '0' })) { ... }
```

::: tip Pattern: reverse-then-forward
To scan recent history in reverse order and then pick up live messages going forward, start a reverse stream, record the latest timestamp encountered, and then spawn a forward stream from that timestamp.
:::

---

## Interfaces

### ChannelHandle

A portable reference to a channel. Minimum requirement is a key.

```typescript
interface ChannelHandle {
  userPrivateKey: SBUserPrivateKey   // required
  channelId?: ChannelId              // derived from owner key if omitted
  channelServer?: string             // defaults to global default
  channelData?: SBChannelData        // server metadata; optional
}
```

Validate with `validate_ChannelHandle(data)`.

### Message

The application-level message format. This is what `onMessage` callbacks and `getMessageMap()` deliver.

```typescript
interface Message {
  body: any                        // actual message content
  channelId: ChannelId
  sender: SBUserId
  messageTo?: SBUserId             // set for routed messages
  senderPublicKey: SBUserPublicKey
  senderTimestamp: number          // client epoch ms
  serverTimestamp: number          // server epoch ms
  eol?: number                     // expiry timestamp (if TTL was set)
  _id: string                      // channelId + '_' + i2 + '_' + timestampPrefix
  previous?: string                // hash of sender's previous message
  error?: string
}
```

### MessageOptions

Options passed to `send()`:

```typescript
interface MessageOptions {
  ttl?: MessageTtl
  sendTo?: SBUserId | SBUserPublicKey   // route to a specific recipient
  subChannel?: string                    // 4-char subchannel tag
  protocol?: SBProtocol                  // per-message protocol override
  sendString?: boolean                   // send raw string (no packaging)
  retries?: number                       // internal: override retry count
}
```

### MessageTtl

`MessageTtl` is a union of allowed integer values representing message lifetime. Stored as 4 bits.

| Value | Duration | Notes |
|---|---|---|
| `0` | Ephemeral | Not stored at all |
| `3` | 1 minute | Current minimum stored |
| `4` | 5 minutes | |
| `5` | 30 minutes | |
| `6` | 4 hours | |
| `7` | 36 hours | |
| `8` | 10 days | |
| `15` | Permanent | Default — permastore |

TTL messages 3–8 are automatically duplicated to subchannels `___3`–`___8`, enabling efficient range queries. Routed messages (with a `sendTo`) may not have TTL above `8`.

### SBChannelData

What the channel server knows about a channel:

```typescript
interface SBChannelData {
  channelId: ChannelId
  ownerPublicKey: SBUserPublicKey
  storageToken?: SBStorageToken
}
```

Validate with `validate_SBChannelData(data)`.

### ChannelAdminData

Owner-only channel metadata:

```typescript
interface ChannelAdminData {
  channelId: ChannelId
  channelData: SBChannelData
  capacity: number
  locked: boolean
  accepted: Set<SBUserId>
  visitors: Map<SBUserId, SBUserPublicKey>
  storageLimit: number
  motherChannel: ChannelId
  latestTimestamp: string
}
```

### SBServerInfo

Returned by `ChannelApi.getServerInfo()`:

```typescript
interface SBServerInfo {
  version: string
  channelServer: string
  storageServer: string
  jslibVersion?: string
}
```

---

## `channel` namespace

The library also exports a convenience namespace:

```typescript
import { channel } from 'lib384'

channel.api    // → ChannelApi class
channel.stream // → ChannelStream class
channel.keys   // → ChannelKeys class
channel.types  // → MessageType enum
channel.typeList // → MessageType[]
```
