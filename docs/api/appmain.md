# App Framework

`AppMain` is the bootstrap class for native os384 apps. It handles manifest loading, channel provisioning, and provides a clean lifecycle for apps launched through the os384 loader.

---

## AppMain

`AppMain` extends `SBEventTarget`. There should be exactly one instance per app (analogous to `main()` in other environments).

```typescript
import { AppMain } from 'lib384'

const App = new AppMain()
await App.init()
```

`init()` reads the app manifest, contacts the loader for provisioned channels (budget, ledger, and any custom ones), and sets up the encryption protocol. **Always await `init()` before using any other members.**

### The manifest file

Every native os384 app must include a file called `384.manifest.json` at its root. The loader uses its presence as the signal that this is a "native" os384 app, and fulfills any channel requests before launching.

```json
{
  "lang": "en",
  "short_name": "MyApp",
  "name": "My Distributed App",
  "description": "Does something cool.",
  "version": "1.0.0",
  "author": "384, Inc.",
  "vault": true,
  "keywords": ["demo", "os384"],
  "channels": [
    { "name": "budget", "size": 16000000 },
    { "name": "ledger", "size": 4000000 }
  ],
  "socialProof": [
    {
      "source": "384,inc",
      "website": "https://384.co",
      "twitter": "@384co",
      "github": "384co"
    }
  ]
}
```

**`vault: true`** means the loader will track generated keys on the global ledger, allowing recovery across devices.

**`channels`** lists the channels the loader should provision. The two standard names are `budget` (storage funding) and `ledger` (global app state). Additional channels can be defined — retrieve them with `App.getChannel(name)`.

### Shadow manifest (dev mode)

During development you can create a `.384.manifest.json` (note the leading dot) to test your app outside the loader. This file is ignored by the loader in production. **Include it in `.gitignore`.**

### Getters

```typescript
App.initialized          // boolean — true after init() completes
App.channelServer        // string  — the server this app is running against
App.manifest             // any     — parsed manifest object (empty if missing/failed)
App.parameters           // any     — parameters passed to the app by the loader
App.keyInfo              // { salt1, iterations1, iterations2, hash1, summary }
App.ledgerHandle         // ChannelHandle (throws if no ledger)
App.ledgerChannel        // Promise<Channel> (throws if no ledger)
App.budgetHandle         // ChannelHandle (throws if no budget)
App.budgetChannel        // Promise<Channel> (throws if no budget)
```

### Getting provisioned channels

```typescript
const myChannel = App.getChannel('myCustomChannel')
```

Returns the channel object or `undefined` if not present. Note: `budget` and `ledger` are also returned here, though they have dedicated getters.

### Processing ledger messages

The ledger channel carries typed messages for inter-app state. `AppMain` dispatches them as events:

```typescript
// Start processing — runs until error or shutdown
await App.processLedgerMessages(startTimestamp?)

// Listen for typed messages
App.on('ledgerMessage_joinGame', (msg) => {
  const { chessGame } = msg.body
  // ...
})

// Send to the ledger
const ledger = await App.ledgerChannel
await ledger.send({ type: 'joinGame', chessGame: myGame })
```

The event name is always `ledgerMessage_<type>`, where `type` is the `type` property of the message body.

### Events (inherited from SBEventTarget)

```typescript
App.on(eventName, listener)
App.off(eventName, listener)
App.emit(eventName, ...args)
```

---

## Server API cost constants

For informational use (e.g. UI budget estimates):

```typescript
import { serverApiCosts } from 'lib384'

serverApiCosts.CHANNEL_STORAGE_MULTIPLIER          // multiplier for channel KV storage vs shard storage
serverApiCosts.CHANNEL_STORAGE_MULTIPLIER_TTL_ZERO // multiplier for ephemeral (TTL=0) messages
```
