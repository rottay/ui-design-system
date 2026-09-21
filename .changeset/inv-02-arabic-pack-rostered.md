---
"@rottay/design-system": minor
---

WO-INV-02 residual: the `arabic-text` font pack is rostered, so the DS-A007
Arabic-safe tail resolves to a shipped face instead of a system install.

`8ae785f1e` shipped the pack — the `@font-face`, the manifest row, the
`@rottay/design-system/fonts/arabic-text.css` export — and deliberately left it
unrostered: `TENANT_THEME_FONT_PACK_IDS` listed six ids and no vertical declared
it, so the family `withArabicSafeFallback` compiles into every
`--ds-font-family-base|heading|display` stack still had nothing behind it in a
first-party bundle. This closes that.

**Coverage, not style.** `arabic-text` is the one pack with
`FontPackRole: 'script'`: nobody chooses it the way a tenant chooses a display
face. It therefore joins the roster of ALL THREE first-party verticals rather
than one, and the tenant door lists it so a tenant document may name
`var(--ds-font-pack-arabic-text)` in a font-family list. The cost of putting it
everywhere is measured, not assumed: its `@font-face` declares
`unicode-range: U+0600-06FF, …` with no latin range, and in every compiled stack
the arabic family sits after a latin pack that declares no `unicode-range` at
all — so a page that renders no Arabic codepoint never selects the face and
never fetches the 166 KB binary. Each vertical bundle grows by ~2 KB of CSS.

The font-packs suite's ownership arm FLIPPED with the roster: it was written to
assert that no vertical bundle shipped the pack, and now asserts that all three
do, range-gated, read out of the generated bundle rather than the pack source.

`./fonts/arabic-text.css` also gains its consumer-contract row. The export
landed without one, which left `no-unsanctioned-ds-subpath`'s anti-drift suite
red at `4b5af68fe` (121 export keys against a 120-row table); the published
surface is now 121/121 with 18 `guaranteed`.

```contract-diff
signature ./server#TENANT_THEME_FONT_PACK_IDS — gains `'arabic-text'` in last position (additive; the six existing ids keep their order and index)
signature ./server#TenantThemeFontPackId — widens with the `'arabic-text'` member (additive union)
signature ./eslint#PUBLISHED_SUBPATHS — gains the `./fonts/arabic-text.css` row (additive; mirrors the consumer-contract table, which the anti-drift suite compares byte for byte against `package.json` `exports`)
```
