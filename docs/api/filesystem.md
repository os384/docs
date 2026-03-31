# Filesystem

SBFS (the os384 virtual filesystem) layers a traditional file system abstraction over channels and shards. Channels serve as inodes — they store file metadata (via messages) and hold the storage budget. Shards hold the actual file contents.

There are two implementations:
- **`SBFileSystem`** — browser-native, backed by a service worker.
- **`SBFileSystem2`** — Deno/server-side, for tooling and CLI use.

Both extend the internal `SBFS` base class.

---

## SBFileSystem {#sbfilesystem}

The main browser-side virtual filesystem.

```typescript
import { SBFileSystem } from 'lib384'

const fs = new SBFileSystem(
  {
    channelServer: 'https://c3.384.dev',
    ledgerHandle: myLedgerHandle,    // metadata channel
    budgetHandle: myBudgetHandle,    // funding channel
    username: 'alice',
    persistedState: true,            // auto-save state to localStorage
  },
  {
    newFileSet: (meta) => updateUI(meta),       // called as file sets arrive
    setProgressBarWidth: (w) => setProgress(w), // upload progress
  }
)

await fs.init()
```

It is good practice to use **separate channels** for `ledger` and `budget` — when your storage budget runs out, you still want to be able to update ledger metadata.

### Uploading files

```typescript
// Upload a set of SBFile objects
const error: string | null = await fs.uploadNewSet(fileList)

// Upload just a buffer
const handle = await fs.uploadBuffer(buffer, hash?)

// Upload a single file
await fs.uploadFile(file)
```

### Retrieving files

```typescript
const handle = await fs.fetchData(objectHandle)
const sbFile = await fs.downloadFile(objectHandle)
const buffer = await fs.getFileBuffer(hash)
```

### State persistence

Set `persistedState: true` to automatically serialize the filesystem state (the file set map) to `localStorage` with debouncing. Or pass `{ key: 'myapp-fs', debounceMs: 2000 }` for custom control.

---

## SBFileSystem2 {#sbfilesystem2}

The Deno/Node-compatible variant. Same constructor signature as `SBFileSystem`. Suitable for CLI tools, server-side scripts, and test harnesses.

```typescript
import { SBFileSystem2 } from 'lib384'

const fs = new SBFileSystem2(options, callbacks)
await fs.init()

const handle = await fs.uploadBuffer(buffer, hash?)
await fs.uploadFile(file)
```

---

## BrowserFileHelper {#browserfilehelper}

Handles browser file input: drag-and-drop and click-to-open, for both files and directories. Produces arrays of `SBFile` ready for upload.

```typescript
import { BrowserFileHelper } from 'lib384'

const helper = new BrowserFileHelper({
  processNewTable: (files: SBFile[]) => { ... }
})

// Wire up DOM events
fileDropZone.addEventListener('drop', (e) => helper.handleFileDrop(e, callback))
dirDropZone.addEventListener('drop',  (e) => helper.handleDirectoryDrop(e, callback))
fileInput.addEventListener('click',   (e) => helper.handleFileClick(e, callback))
dirInput.addEventListener('click',    (e) => helper.handleDirectoryClick(e, callback))
```

The key data structures are cumulative across interactions:

- `helper.finalFileList` — `Map<fullName, SBFile>` of all processed files.
- `BrowserFileHelper.knownBuffers` — `Map<hash, ArrayBuffer>` of all read buffers (static/global).

Call `helper.clearNewSet()` to reset the "new files since last operation" state without clearing the cumulative maps.

```typescript
// Add a file type to the ignore list
helper.ignoreFile('Thumbs.db')
```

---

## BrowserFileTable {#browserfiletable}

A UI helper for rendering a table of files from an `SBFileSystem`.

```typescript
const table = new BrowserFileTable(
  (hash) => fs.findFileDetails(hash),   // file detail resolver
  {
    table: tableEl,
    tableFileInfo: infoEl,
    uploadNewSetButton: uploadBtn,
  },
  {
    rowClicked: (meta) => showDetails(meta),
    previewFile: (hash, type) => preview(hash, type),
    downloadFile: (hash, type, name) => download(hash, type, name),
    copyLink: (hash, type) => copyToClipboard(hash),
  }
)

table.renderTable(data, headings, editable, location, onSave, actionButtons?)
table.addRow(lexicalOrder, rowContents, metaData)
```

---

## `browser` namespace {#browser-namespace}

Bundles all browser-facing utilities:

```typescript
import { browser } from 'lib384'

browser.BrowserFileHelper   // class
browser.BrowserFileTable    // class
browser.getMimeType(name, fileStart?)
browser.fileViewer(data, mimeType, docElements)
browser.clearBrowserState()
browser.images.readJpegHeader(bytes)
```

### `getMimeType()`

Infers MIME type from file extension and optionally from the first bytes of the file. Falls back to `application/octet-stream`.

```typescript
const mime = getMimeType('photo.jpg')
const mime = getMimeType('photo.jpg', firstBytes)
```

### `browserPreviewFile()`

Renders an `ArrayBuffer` in a DOM element according to its MIME type (image, video, PDF, text, etc.):

```typescript
await browser.fileViewer(data, mimeType, {
  mainDoc: document,
  preview: previewEl,
  maxButton: fullscreenBtn,
})
```

### `clearBrowserState()`

Clears any cached browser state associated with the library (e.g. service worker caches).

---

## `file` namespace {#file-namespace}

```typescript
import { file } from 'lib384'

file.SBFileSystem    // browser filesystem class
file.SBFileSystem2   // Deno filesystem class
file.safe            // Set<string> of safe MIME types
```
