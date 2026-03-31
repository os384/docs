# Local storage paths

Some os384 services write local state that is deliberately kept **outside** the
project tree — and outside the user's home directory entirely. The reasons are:

- **Backup hygiene.** Shard caches and wrangler KV state are large, ephemeral,
  or fully regenerable. They should not be swept up by tools like `restic` that
  back up everything under `~/`.
- **Clear separation.** Dev/test infrastructure state is distinct from source
  code and personal data.

## macOS — recommended setup

Create a dedicated APFS volume inside your existing disk container. APFS volumes
share free space dynamically — no fixed allocation needed.

First, identify your APFS container disk:

```sh
diskutil list
```

Look for a `(synthesized)` entry of type `APFS Container Scheme` that contains
your main `Macintosh HD` / `Data` volumes. On most modern Macs this is `disk3`,
but verify — it could differ on your machine (e.g. if you have external drives
connected at boot, or a non-standard partition layout).

```
/dev/disk3 (synthesized):          ← this is the one you want
   #:  TYPE                  NAME
   0:  APFS Container Scheme  -      2.0 TB   disk3
   1:  APFS Volume            Macintosh HD
   ...
```

Then add the new volume to that container:

```sh
diskutil apfs addVolume disk3 APFS os384
# mounts automatically at /Volumes/os384 on every boot
sudo chown $(whoami) /Volumes/os384
```

That's the only manual step. Subdirectories are created automatically the first
time you run any service via the Makefile (see below).

## Linux — recommended paths

`/opt/os384/` follows FHS convention for add-on software state.
`/var/cache/os384/` is the correct FHS location for regenerable cache data.
As with macOS, subdirectory creation is handled automatically by the Makefile.

## Environment variables

These variables control where wrangler and mirror store their local state. Both
have sensible defaults for macOS — you only need to set them if you want a
different location or are on Linux.

| Variable | Default (macOS) | Linux recommended | Purpose |
|---|---|---|---|
| `OS384_WRANGLER_STATE` | `/Volumes/os384/wrangler` | `/opt/os384` | Root directory for wrangler local KV / DO state |
| `OS384_MIRROR_CACHE_DIR` | `/Volumes/os384/mirror/shards` | `/var/cache/os384/mirror/shards` | Shard cache directory for the mirror server |

To override, set them in your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) or
in a sourced env file (see `env.example.sh` in the repo root):

```sh
# os384 local storage — override defaults if needed
export OS384_WRANGLER_STATE=/Volumes/os384/wrangler  # macOS default
export OS384_MIRROR_CACHE_DIR=/Volumes/os384/mirror/shards   # macOS default
```

If `OS384_WRANGLER_STATE` is not set, the `services/Makefile` defaults to
`/Volumes/os384/wrangler` and creates the directory automatically. If the
directory cannot be created, the Makefile will print an error and exit with a
link back to this page.

## Makefile integration

The `services/Makefile` has an `ensure-local-storage` target that creates both
directories idempotently. All service start targets (`dev-storage`, `dev-channel`)
depend on it, so setup is automatic on first run:

```sh
make dev-storage   # creates dirs if needed, then starts storage worker
make dev-channel   # same, then starts channel worker
```

You can also run it standalone as a quick check:

```sh
make ensure-local-storage
# Local storage OK
#   wrangler state : /Volumes/os384/wrangler
#   mirror cache   : /Volumes/os384/mirror/shards
```

If either directory cannot be created you'll get a clear error pointing back
to this page rather than a silent failure.

## Notes

- The wrangler `--persist-to` flag **cannot** be set inside `wrangler.toml` — it
  is CLI-only and must be passed on every `wrangler dev` invocation. The
  `services/Makefile` handles this for both `dev-storage` and `dev-channel`,
  pointing both at the same state directory so they share KV namespaces.

- Both `storage` and `channel` workers share the same wrangler state directory.
  This is intentional: the channel worker needs to read LEDGER_NAMESPACE which
  storage writes to. Passing the same `--persist-to` path to both achieves this
  without any symlink setup.

- Mirror's `OS384_MIRROR_CACHE_DIR` points directly to the shards directory
  (not its parent). The directory is created automatically by `mirror.py` on
  startup if it does not exist.

- Linux support for this layout is tracked in `services/TODO.md`.
  Docker volume placement is also tracked there.
