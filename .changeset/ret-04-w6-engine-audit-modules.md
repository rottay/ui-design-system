---
"@rottay/design-system": patch
---

Internal tooling only: the engine-token audit (`scripts/check/engine/tokens/audit/index.mjs`) is split into owned modules for paths, parsing, counter cohorts, collection, ratchet and reports, and the existing path stays the CLI entry point. Every counter name and value, baseline rule, CLI mode, exit code and emitted report is unchanged. The published package surface does not change.
