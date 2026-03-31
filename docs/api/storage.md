# Storage & Shards

Shards are the immutable, encrypted, content-addressed storage primitive in os384. They are fixed-size (padded to the nearest power of 2), identified by content hash, and can live on any compliant storage server. The encryption key is derived from content and stored separately — never with the shard itself. For a conceptual overview, see [Storage & Shards](/storage).

---

## StorageApi

`StorageApi` handles reading and writing shards to a storage server. You normally access it via `ChannelApi.storage` rather than constructing it directly.

```typescript
const storage = sb.storage    // sb is a ChannelApi instance
```

Or directly:

```typescript
import { StorageApi } from 'lib384'
const storage = new StorageApi('https://s3.384.dev')
```

### Storing data

```typescript
const handle: ObjectHandle = await storage.storeData(contents, budgetSource)
```

`contents` can be anything — it is automatically packaged into payload format before storing. `budgetSource` is either a `ChannelHandle`, a connected `Channel`, or a `SBStorageToken`.

The returned `ObjectHandle` is what you share with others or store as a reference.

### Fetching data

```typescript
// Full fetch + decrypt → handle.payload has the contents
const filledHandle = await storage.fetchData(handle)
const data = storage.fetchPayload(handle)    // convenience wrapper
```

`fetchData()` will try:
1. The `storageServer` in the handle (if present)
2. Local mirror at `localhost:3841` (if running)
3. Other known servers

Note: the `storageServer` in the returned handle reflects where the data was actually found, which may differ from the input handle.

### Static utilities

```typescript
// Padding (privacy-preserving size normalization)
StorageApi.padBuf(buf)       // rounds up to power-of-2, min 4 KiB
StorageApi.unpadBuf(buf)     // strips padding (actual size in last 4 bytes)

// Derives the object ID from (iv, salt, encryptedData)
StorageApi.getObjectId(iv, salt, encrypted)

// Convenience
StorageApi.getData(handle)    // returns data WeakRef contents, or undefined
StorageApi.paceUploads()      // rate limiting for parallel uploads
```

---

## ObjectHandle

`ObjectHandle` is the complete descriptor for a shard: enough information to retrieve, authenticate, and decrypt it.

```typescript
interface ObjectHandle extends ShardInfo {
  key?: Base62Encoded         // decryption key (43-char base62)
  storageServer?: string      // hint: which server has this shard
  payload?: any               // contents after fetch + decrypt
  type?: string               // MIME type hint
  hash?: string               // hash of contents (payload format)
  signature?: string          // base62 publisher signature (for app shards)
}
```

To **retrieve** a shard you need `id` + `verification`.
To **decrypt** a shard you need `key` + `iv` + `salt`.

The storage server will provide `iv` and `salt` if you have `id` + `verification`.

Validate with `validate_ObjectHandle(h)`.

For serialization (JSON-safe, resolved `verification`), use:

```typescript
const jsonSafe = await stringify_ObjectHandle(handle)
```

---

## ShardInfo

The minimal shard descriptor; base of `ObjectHandle`:

```typescript
interface ShardInfo {
  version?: "1" | "2" | "3"          // "3" is current
  id: Base62Encoded                    // 43-char content address
  iv?: NONCE_TYPE | Base62Encoded      // AES-GCM nonce (12 bytes)
  salt?: SALT_TYPE | Base62Encoded     // salt (16 bytes)
  actualSize?: number                  // unpadded size
  verification?: Promise<string> | string  // read permission token
  data?: WeakRef<ArrayBuffer> | ArrayBuffer // raw encrypted data
}
```

---

## SBFile

`SBFile` represents a file (or set of files) within os384. It is the metadata wrapper around one or more `ObjectHandle` entries.

```typescript
const f = new SBFile(fileInfo?)
```

Key fields:

```typescript
class SBFile {
  name?: string           // filename
  path?: string           // directory path (e.g. '/')
  fullPath?: string       // full canonical path
  type?: string           // MIME type
  size?: number           // size as reported by browser
  actualFileSize?: number // on-server size (padded, encrypted)
  lastModified?: string
  fullName?: string       // globally unique: name + date + size + sha256
  hash?: string           // content hash
  handle?: ObjectHandle          // single-shard file
  handleArray?: ObjectHandle[]   // multi-shard file (chunks of MAX_SBFILE_CHUNK_SIZE)
  file?: ArrayBuffer      // inline content (small files)
  link?: string           // app server URL
  browserFile?: File      // original browser File object
}
```

::: info Chunk size
`SBFile.MAX_SBFILE_CHUNK_SIZE` is currently 4 MiB. Files larger than this are split into multiple shards in `handleArray`.
:::

os384 does not use hierarchical directories. Instead, files are sets: `path` and `fullPath` are preserved as metadata so that a directory structure can be reconstructed if desired.

`SBFile` objects assume they live in encrypted contexts — key information in handles is not hidden within `SBFile` itself.

Guard function: `isSBFile(obj): obj is SBFile`

---

## SBStorageToken

A storage token represents a pre-authorized storage budget. In most cases you only deal with the token hash (a string), not the full structure.

```typescript
type SBStorageTokenHash = string

interface SBStorageToken {
  hash: string             // the token itself (typically all you need)
  size?: number            // storage amount in bytes
  motherChannel?: ChannelId
  created?: number
  used?: boolean
  success?: boolean
}
```

Generate a new (random, unauthorized) token hash:

```typescript
const tokenHash: SBStorageTokenHash = generateStorageToken()
```

To actually *authorize* a token against a budget, use the CLI (`384 mint-tokens`) or the channel server's KV API directly.

Validate with `validate_SBStorageToken(data)`.

---

## Payload encoding {#payload}

All stored data in os384 is wrapped in the "payload" format: a binary container (`ArrayBuffer`) with a 4-byte magic header `0xAABBBBAA`. This is used both for shard contents and for messages.

```typescript
// Encode anything into payload format
const buf: ArrayBuffer | null = assemblePayload(data)

// Decode back to JS object
const obj = extractPayload(buf)
```

These functions support a wide range of JS types (objects, arrays, `ArrayBuffer`, `Map`, etc.).

---

## FileSetMeta

Metadata about a set of files stored in a filesystem ledger:

```typescript
interface FileSetMeta {
  _id: string
  senderUserId: SBUserId
  senderPublicKey: SBUserPublicKey
  serverTimestamp: number
  fileSet: Map<string, SBFile>
  fileSetShard: ObjectHandle
  count?: number
  totalBytes?: number
}
```

---

## Lower-level fetch functions

These are available for direct use when you have an `ObjectHandle` or `SBFile` and want to retrieve contents without a full `StorageApi` instance:

```typescript
// Fetch and fill a known-good ObjectHandle
fetchDataFromHandle(handle: ObjectHandle): Promise<ObjectHandle>

// Fetch and decode payload from an SBFile or ObjectHandle
fetchPayload(fileOrObject: SBFile | ObjectHandle): Promise<any>
```
