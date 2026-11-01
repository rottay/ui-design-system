---
"@rottay/design-system": patch
---

Retire the EffectRegistry leg of the bundle analyzer with its `--effects` flag, its `analyze:effects` script and its two `dist/effects.*` raw keys. RET-01-E removed `./effects`, so that leg could only fail on the missing supplier-contract entry, and did so inside every normal analysis, while the raw keys could only report `SKIP`. The `evidence` pointer of the `particle-field` budget now names the CRA-15 runtime-hardening gate, which owns its 16,384 B gzip ceiling; the retired leg measured the whole registry facade against a different one. The shared `EFFECTS_EXTERNALS` peer list, every active budget, ceiling, export and type stay as they were.
