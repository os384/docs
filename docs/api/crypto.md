# Cryptography & Protocols

lib384 is built on P-384 elliptic curve cryptography and AES-GCM-256. The `SBCrypto` class wraps the browser's `SubtleCrypto` API with os384-specific conventions. Message encryption is handled through the `SBProtocol` interface, with two built-in implementations.

---

## SBCrypto

`SBCrypto` provides low-level crypto utilities for the rest of the library. You should use the global singleton `sbCrypto` rather than instantiating your own.

```typescript
import { sbCrypto } from 'lib384'
```

### Key generation and management

```typescript
// Generate a fresh P-384 ECDH key pair
const pair: CryptoKeyPair = await sbCrypto.generateKeys()

// Export a key to JWK (returns undefined if key is non-extractable)
const jwk: JsonWebKey | undefined = await sbCrypto.exportKey('jwk', key)

// Hash and split for storage addressing
const { idBinary, keyMaterial } = await sbCrypto.generateIdKey(buf)
```

### Encryption and signing

```typescript
// Encrypt with AES-GCM
const encrypted: ArrayBuffer = await sbCrypto.encrypt(data, key, params)

// Sign with P-384
const signature: ArrayBuffer = await sbCrypto.sign(signKey, contents)

// Verify a signature
const ok: boolean = await sbCrypto.verify(verifyKey, signature, contents)
```

`EncryptParams` mirrors the Web Crypto `AesGcmParams` but with all fields optional (iv and salt are filled in automatically if missing).

### String / buffer utilities

```typescript
sbCrypto.str2ab(str)   // string → Uint8Array (UTF-8)
sbCrypto.ab2str(buf)   // Uint8Array → string (UTF-8)

// SHA-256 hash, returned as base62, length 4–42
await sbCrypto.hashDown(value, len?)
```

### Strongpin interface

`sbCrypto.strongpin` bundles the strongpin utilities:

```typescript
sbCrypto.strongpin.generate(options?)    // → Promise<string>  (4-char pin)
sbCrypto.strongpin.generate16(options?)  // → Promise<string>  (16-char pin)
sbCrypto.strongpin.encode(num)
sbCrypto.strongpin.decode(encoded)
sbCrypto.strongpin.process(str)
sbCrypto.strongpin.base32mi            // the base32 alphabet used
```

See also the standalone [strongpin functions](#strongpin) below.

---

## SBProtocol

`SBProtocol` is the interface that message encryption protocols must implement. Channel messages always go through a protocol for both encryption and decryption.

```typescript
interface SBProtocol {
  setChannel(channel: Channel): Promise<void>
  encryptionKey(msg: ChannelMessage): Promise<CryptoKey>
  decryptionKey(msg: ChannelMessage): Promise<CryptoKey | undefined>
}
```

A protocol is associated with a `Channel` instance via `setChannel()`. Individual messages can override the channel's default protocol via `MessageOptions.protocol`.

If `decryptionKey()` returns `undefined`, the message is outside the protocol's scope (e.g. not addressed to this recipient), and will typically be dropped.

---

## Protocol_ECDH {#protocol-ecdh}

The default protocol. Implements 1:1 public-key encryption using ECDH key agreement ("whisper"). The sender's channel key and the recipient's public key are used to derive a shared secret for each message.

```typescript
import { Protocol_ECDH } from 'lib384'

const protocol = new Protocol_ECDH()
const ch = new Channel(handle, protocol)
```

If `sendTo` is not set in `MessageOptions`, messages are encrypted for the channel owner.

::: warning Don't reuse across channels
A `Protocol_ECDH` instance is specific to the channel it is configured for (via `setChannel()`). Do not share it across channels or users.
:::

For debugging: assign names to key IDs for readable trace output:

```typescript
Protocol_ECDH.keyToName.set(userId, 'Alice')
```

---

## Protocol_AES_GCM_256 {#protocol-aes-gcm-256}

Symmetric encryption: all messages use the same shared AES-GCM key derived from a passphrase. Suitable for group channels with a shared secret.

```typescript
import { Protocol_AES_GCM_256 } from 'lib384'

// Generate a fresh key set
const keyInfo: Protocol_KeyInfo = await Protocol_AES_GCM_256.genKey()

// Create protocol with passphrase and key info
const protocol = new Protocol_AES_GCM_256(passphrase, keyInfo)
await protocol.ready()
```

`Protocol_KeyInfo` carries the salts, iteration counts, and hash values needed to deterministically recreate the key:

```typescript
interface Protocol_KeyInfo {
  salt1?: SALT_TYPE
  salt2?: SALT_TYPE
  iterations1?: number
  iterations2?: number
  hash1?: string
  hash2?: string
  summary?: string
}
```

---

## Passphrase and key derivation {#passphrase}

### `generatePassPhrase()`

Generates a human-memorable passphrase from a 16K-word list (~14 bits of entropy per word).

```typescript
const phrase = await generatePassPhrase()                       // 3 words (default)
const phrase = await generatePassPhrase(5)                      // 5 words
const phrase = await generatePassPhrase({ words: 4, extraEntropy: 'some mouse movements' })
```

::: tip Best practice
Don't let users hit "regenerate" freely — offer 4–8 choices and let them pick one. This limits entropy loss to ~log₂(N) bits. For high-security use, 5 words with a choice of 8 is a reasonable target.
:::

Words are all lowercase ASCII. If you encounter any inappropriate words in the word list, please report them.

### `generateStrongKey()`

Derives a strong AES key from a passphrase using PBKDF2 (SHA-256, 10 million iterations).

```typescript
const { phrase, key, salt, iterations } = await generateStrongKey(passphrase?)
```

If no passphrase is provided, one is generated automatically. Returns the `CryptoKey`, the salt, and the iteration count — all needed to recreate the key later.

### `recreateStrongKey()`

Recreates a previously derived key from exact parameters:

```typescript
const { key } = await recreateStrongKey(passphrase, salt, iterations)
```

### `strongphrase` namespace

```typescript
import { strongphrase } from 'lib384'

strongphrase.generate(params?)          // generatePassPhrase
strongphrase.toKey(passphrase?)         // generateStrongKey
strongphrase.recreateKey(...)           // recreateStrongKey
```

---

## Strongpin {#strongpin}

Strongpins are compact, memorable authentication tokens using a character set designed to avoid ambiguous characters. Each "set" of 4 characters carries 19 bits of entropy.

```typescript
const pin4  = await generateStrongPin(options?)    // 4 chars  (19 bits)
const pin16 = await generateStrongPin16(options?)  // 16 chars (76 bits, 4 sets)
```

Options:

```typescript
type StrongPinOptions = {
  extraEntropy?: string
  enforceMix?: boolean  // require mix of character types
  setCount?: number     // number of 4-char sets (for custom length)
}
```

For more on strongpin concepts, see [Strongpin](/strongpin).

### `hydrateKey()`

Ensures a key string is fully hydrated (i.e. has all needed fields including `x`). If provided `pubKey` is used as the source of `x` when the private key is in dehydrated form.

```typescript
const fullKey = hydrateKey(privKey, pubKey?)
// returns undefined if the key cannot be hydrated without pubKey
```
