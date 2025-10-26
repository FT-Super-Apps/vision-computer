# Archived Shell Scripts

These scripts have been **deprecated** and are kept here for reference only.

## ⚠️ Do Not Use These Scripts

All functionality from these individual scripts has been **consolidated** into the main control script:

```bash
./devnolife.sh
```

## What Each Script Became

| Old Script | New Location in devnolife.sh |
|-----------|------------------------------|
| `init.sh` | Option [1] - Initialize Project |
| `start_production.sh` | Option [2] - Start Backend Services |
| `stop_production.sh` | Option [5] - Stop Backend Services |
| `restart_production.sh` | Option [6] - Restart Backend Services |
| `status_production.sh` | Option [7] - Check Status |
| `start_workers.sh` | Integrated into Option [2] |

## Migration Guide

Instead of running individual scripts:

```bash
# OLD WAY (Deprecated)
./init.sh
./start_production.sh
./status_production.sh

# NEW WAY (Use this!)
./devnolife.sh
# Then select from the interactive menu
```

## Why the Change?

✅ **Single File** - Easier to maintain and update
✅ **Interactive Menu** - User-friendly interface
✅ **No Dependencies** - All functionality in one place
✅ **Better Organization** - Clean project structure

---

**For the latest usage, see the main [README.md](../../README.md)**
