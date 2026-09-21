---
"@rottay/design-system": minor
---

WO-INV-02 packet A (audit F-39), the contract/kernel slice: the locale-bound
formatter, a provider that survives the locale strings runtime actually hands
it, and the font pack the Arabic invariant has been naming without shipping.
Adoption across the component tiers rides the family cuts and is not in here.

**Formatting reads the provider's locale.** `useFormatter()` and
`useOptionalFormatter()` return every `format*` helper with the active locale
already applied — `date`, `time`, `dateRange`, `relativeTime`, `number`,
`percent`, `currency`, `fileSize`, `list` — splitting `config.dateLocale` from
`config.numberLocale` so a call site names WHAT it formats and never which
language to format it in. The Intl helpers underneath already took an explicit
locale, which is correct for their non-React callers and was the whole problem
for component code: three manual steps, each skippable, and they were skipped.
`toLocaleDateString()` and its twins appear at 71 call sites in this package
and 34 of them pass no argument at all, formatting in the server's language
inside a page the catalog is rendering in another one. `useOptionalFormatter`
formats in `DEFAULT_LOCALE` outside a provider, matching the standalone
contract `useOptionalTranslation` and `useOptionalDirection` already document.

**`I18nProvider` normalizes its locale instead of trusting the type.**
`SupportedLocale` is a compile-time promise and the value reaching the provider
is runtime data — an `Accept-Language` header, a tenant column,
`navigator.language`. Both shapes TypeScript cannot stop used to reach
`LOCALE_CONFIGS[locale]` as `undefined` and crash the entire subtree on
`config.code` before one string was looked up. A region tag (`es-MX`, `ar-SA`)
now resolves to its base language, and an unsupported language falls back to
the CONFIGURED fallback — the application's declared policy — rather than
jumping over it to English. `setLocale` normalizes the same way and
`onLocaleChange` reports what the provider switched TO, so a listener mirroring
the value back into the `locale` prop cannot oscillate.

**The Arabic-safe tail now names a family the package ships.** `arabic-text`
(Noto Sans Arabic, OFL-1.1, opt-in at
`@rottay/design-system/fonts/arabic-text.css`) self-hosts the exact family
`withArabicSafeFallback` compiles into every
`--ds-font-family-base|heading|display` stack of every tenant and vertical
artifact. That family was previously a bet on a system install: the DS-A007
checker passed on the string while a machine without the font dropped Arabic
copy straight through to the generic `sans-serif` the invariant exists to
prevent. The face carries the Arabic subset only and declares the matching
`unicode-range`, so the 166 KB binary is fetched only by a page that renders
Arabic script — the tail sits after a latin pack in every stack it joins.
`FontPackRole` gains `'script'` for the one pack that is coverage rather than a
style choice.

The English floor and `resolveSubmitIntent`'s IME guard were re-measured as
already in force and are unchanged; this adds the end-to-end tests that pin
them — a key the active locale lacks renders English and never the dotted key,
and the floor is still consulted only after the configured fallback has had its
turn.

```contract-diff
signature .#I18nProvider — changed behavior, not shape: runtime locale strings (region tags, unsupported languages) are normalized through toSupportedLocale toward the configured fallback instead of crashing on config.code; onLocaleChange now reports the RESOLVED locale
signature ./server#FONT_PACK_MANIFEST — gains the `arabic-text` pack (additive key; the six existing packs byte-unchanged)
signature ./server#FontPackRole — gains `'script'` (additive union member for coverage packs)
signature ./server#FontPackId — widens with `keyof FONT_PACK_MANIFEST` to include `'arabic-text'` (additive)
signature .#useFormatter — added: returns the locale-bound format helpers (date/time/dateRange/relativeTime/number/percent/currency/fileSize/list) with the active locale applied
signature .#UseFormatterResult — added: the formatter result contract above
signature .#useOptionalFormatter — added: same helpers outside a provider, formatting in DEFAULT_LOCALE
```
