---
"@rottay/design-system": minor
---

WO-FAM-07 follow-up: `Box`'s public spacing API becomes logical, and the two
families that still probed the DOM for the reading direction now ask the
authority that already knows it.

**The logical shorthands.** `Box` gains `ps` / `pe` / `ms` / `me` — the inline
edges, on both the scalar and the responsive path. The physical four
(`paddingLeft`/`pl`, `paddingRight`/`pr`, `marginLeft`/`ml`, `marginRight`/`mr`)
are formally deprecated rather than deleted, and the reason is measured: the
FROZEN Classic and Rustic engines read all four by name, so removing them from
`BoxProps` would stop those engines compiling, and a family cut may not touch a
frozen engine. Nothing in the fleet has to move — the census found **zero**
call sites for any of the four across the design system, the showroom and
app-bithire / app-evnto / app-platform, so the deprecation is a rename of an
unused door. Their behaviour is unchanged and pinned by a test.

**The direction authority.** `Splitter` (modern) and the shared `ResizeHandle`
each carried a private `element.closest('[dir]')` probe, re-deriving from paint
a fact the i18n provider already holds — unavailable during SSR, and a forced
style recalculation at the exact moment a drag is deciding its geometry. Both
now read `useOptionalDirection`, the `app-shell` precedent. Measured
consequence, stated rather than hidden: direction signalled ONLY by a bare
`dir` attribute, with no `I18nProvider` anywhere above, no longer mirrors these
two. The one real consumer that renders a `Splitter` under `dir="rtl"` — the
showroom's Arabic locale probe — supplies the provider too, so it is
unaffected; and the provider stamps `dir` itself, so the DOM still says what
the locale says. The two RTL tests moved from a bare wrapper to the provider
for that reason.

```contract-diff
signature .#BoxProps — adds optional `ps`/`pe`/`ms`/`me` (shorthands for `paddingInlineStart`/`paddingInlineEnd`/`marginInlineStart`/`marginInlineEnd`); the long form still wins when both are given. Deprecates `paddingLeft`/`pl`, `paddingRight`/`pr`, `marginLeft`/`ml`, `marginRight`/`mr` — retained, unchanged in behaviour, and still read by the frozen Classic and Rustic engines. All additions optional; absent input is byte-identical.
```

Registered, not fixed here: the frozen Classic and Rustic `Box` engines strip
neither the logical longhands nor the new shorthands from the DOM attributes,
so a caller passing one to a Box forced onto those engines leaks it as an
unknown attribute. That is pre-existing for `paddingInlineStart` and its
siblings, and the fix is a frozen-engine edit this lot may not make.
