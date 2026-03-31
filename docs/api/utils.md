# Utilities

---

## `utils` namespace {#utils-namespace}

The `utils` object bundles the most commonly needed encoding and buffer helpers into a single import:

```typescript
import { utils } from 'lib384'

utils.arrayBufferToBase62(buf)
utils.arrayBufferToBase64url(buf)
utils.assemblePayload(data)
utils.base62ToArrayBuffer(str)
utils.base62ToBase64(str)
utils.base64ToArrayBuffer(str)
utils.base64ToBase62(str)
utils.compareBuffers(a, b)
utils.extractPayload(buf)
utils.isBase62Encoded(str)
```

All of these are also available as named exports at the top level.

---

## Encoding functions {#encoding}

### Base62

os384 uses base62 (A–Z, a–z, 0–9) as the standard external encoding for binary data — keys, IDs, hashes. It is URL-safe, human-readable, and slightly more compact than base64url.

```typescript
// ArrayBuffer → base62 string
arrayBufferToBase62(buffer: ArrayBuffer | Uint8Array): string

// base62 string → ArrayBuffer
base62ToArrayBuffer(s: string): ArrayBuffer

// Guard: is this string valid base62?
isBase62Encoded(value: string): value is Base62Encoded

// Direct conversions
base62ToBase64(s: Base62Encoded): string
base64ToBase62(s: string): Base62Encoded
```

`Base62Encoded` is a branded string type:

```typescript
type Base62Encoded = string & { _brand?: "Base62Encoded" }
```

The regex `b62regex` can be used for validation: `b62regex.test(str)`.

### Base64

```typescript
// ArrayBuffer → base64url string
arrayBufferToBase64url(buffer: ArrayBuffer | Uint8Array): string

// base64 or base64url → Uint8Array
base64ToArrayBuffer(s: string): Uint8Array
```

---

## AsyncSequence {#asyncsequence}

`AsyncSequence<T>` is a composable wrapper around any `AsyncIterable<T>`. It implements the standard functional-programming operations on async streams — transformations, filters, truncation, aggregation, and combination — all lazy and chainable.

```typescript
import { AsyncSequence } from 'lib384'

const seq = new AsyncSequence(someAsyncIterable)
```

### Transformations

```typescript
seq.map<U>(fn: (v: T) => U | Promise<U>): AsyncSequence<U>
seq.flatMap<U>(fn: (v: T) => Iterable<U> | AsyncIterable<U>): AsyncSequence<U>
seq.concatMap<U>(fn): AsyncSequence<U>   // serialized flatMap
seq.filter(pred): AsyncSequence<T>
```

### Truncation and windowing

```typescript
seq.take(n)                     // first n elements
seq.takeWhile(pred)             // while predicate is true
seq.limitUntil(pred)            // until predicate becomes true (takeWhile negated)
seq.skip(n)                     // skip first n
seq.skipWhile(pred)             // skip while predicate is true
seq.skipUntil(pred)             // skip until predicate is true
```

### Combining

```typescript
seq.concat(other)               // sequential: second after first
seq.merge(other)                // parallel: emit as soon as either yields
seq.zip<U>(other): AsyncSequence<[T, U]>
```

### Consumers / aggregators

```typescript
await seq.forEach(fn)
await seq.reduce(fn, initialValue)
await seq.toArray(): T[]
await seq.any(pred): boolean
await seq.some(pred): boolean    // alias for any()
await seq.every(pred): boolean
await seq.none(pred): boolean
await seq.find(pred): T | undefined
await seq.first(): T | undefined
await seq.last(): T | undefined
await seq.count(): number
await seq.elementAt(index): T | undefined
```

### AsyncIterable compatibility

`AsyncSequence` implements `Symbol.asyncIterator`, so it works with `for await...of`:

```typescript
for await (const item of seq.filter(x => x.important).take(10)) {
  process(item)
}
```

`ChannelStream.spawn()` returns an `AsyncSequence<Message>`, making it straightforward to compose message processing pipelines.

---

## Timeout decorator {#timeout}

`Timeout` is a TypeScript method decorator that adds timeout + retry logic to any async method:

```typescript
import { Timeout } from 'lib384'

class DataLoader {
  @Timeout(500, 2)   // 500ms timeout, 2 retries
  async fetchData() {
    // ...
  }
}
```

Parameters:
- `ms` — timeout in milliseconds
- `retries` — number of retries (default: 0, meaning no retries)

---

## MessageType enum {#messagetype}

`MessageType` provides standard discriminants for typed messages. These are used as the `type` property in message bodies, especially on ledger channels with `AppMain`.

```typescript
import { MessageType } from 'lib384'

enum MessageType {
  MSG_SIMPLE_CHAT         // plain text chat
  MSG_FILE_SET            // file set metadata shared over channel
  MSG_NEW_SHARD           // new shard/file seen
  MSG_USER_PRIVATE_DATA   // any private user metadata
  MSG_NEW_USER_KEY        // user locked in a key
  MSG_CLAIM_PUBLIC_KEY    // user claims a public key
  MSG_CONTACT_ANNOUNCEMENT
  MSG_REQUEST_MAIN
  MSG_PROVIDE_MAIN
}
```

Each enum value is a human-readable string with a random suffix to avoid collisions across versions (e.g. `"SIMPLE_CHAT_9WbWE53HnRy6"`). You should compare against the enum, not the raw string.

The `channel` namespace exposes a convenience array:

```typescript
import { channel } from 'lib384'
channel.typeList   // MessageType[]
```

---

## `isTextLikeMimeType()`

Simple predicate for deciding whether to re-encode a shard or page payload as UTF-8:

```typescript
isTextLikeMimeType(mimeType: string): boolean
```

Returns `true` for `text/*`, `application/json`, `application/javascript`, `application/xml`, and similar types.
