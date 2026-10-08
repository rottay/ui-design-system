---
"@rottay/design-system": patch
---

Internal restructure: the chrome CSS variable emitter (`infrastructure/compilers/kernel/foundation/css/chrome-variables`) moves its static field-to-variable tables (`chromeVariableMap`, the 26 flat family tables, `FLAT_CHROME_FAMILY_VARIABLES`, the tooltip, popover and badge tables) into an internal `tables` module, and the existing path stays the emitter entry point. The tables are reachable only from that entry point; no package subpath is added. `chromeToVariables`, `sidebarToneToVariables`, `PRODUCER_RANK`, `FROZEN_ENGINE_COMPAT_CHANNELS` and every other export keep their declarations, and the emitted variable names, values and insertion order are unchanged. The theme-parity, hook-manifest, tenant-reach and cascade-producer instruments read both files through one closed emitter authority that fails on an orphan, unimported, undeclared or non-data member. The published package API does not change.
