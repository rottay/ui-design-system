---
"@rottay/design-system": patch
---

`ICON_SIZE_MAP` is declared in the icon size-token leaf beside `ICON_SIZE_TOKENS`
instead of in the glyph type contracts. The semantic `Icon` runtime and the
glyph factories read it from there, so a runtime that only needs the size scale
no longer loads the type-contract module; `./primitives/message` returns under
its reviewed source-bytes ceiling. The exported name, type and values are
unchanged and `@rottay/design-system/icons` still exports it.
