---
"@rottay/design-system": patch
---

Internal restructure: `DesignSystemProvider` (`infrastructure/runtime/bootstrap/facade/react/provider`) is split into owned modules for its props contract, tenant-config derivation, locale merge, retained-artifact sentinels and render boundaries, and the existing path stays the provider entry point. `DesignSystemProvider`, `DesignSystemProviderProps` and every other export of that module keep their declarations, and render, hook order, admission, retention and resolution behavior are unchanged. The published package API does not change.
