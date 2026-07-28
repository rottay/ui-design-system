# W3 state (root state + i18n runtime)

## Step 0 — mandatory reads + porcelain phase check DONE

Read: architecture-decisions.md AD-5, AD-5b, AD-5c, AD-6, AD-7 (T4/T9/T10); w1-state.md; w2-state.md.

Porcelain (per-file, before any edit):
- ui-design-system `packages/core/src/infrastructure/runtime/theming/composition/react/provider/` → CLEAN (no output)
- ui-design-system `packages/core/src/infrastructure/runtime/foundation/root-attributes/` → CLEAN
- app-platform `src/app/layout.tsx` → CLEAN
- app-platform `src/core/providers/` → CLEAN
- app-platform `src/vertical/profile/index.ts` → CLEAN
- app-platform `src/features/organization/settings/screens/` → `account.tsx` and `overview.tsx` are ` M` (DIRTY, avoid);
  `settings-overview.tsx` and `whitelabel.tsx` CLEAN (both authorized candidates are usable)
- app-bithire `src/core/providers/index.tsx` → CLEAN
- app-bithire `src/vertical/model/profile/product-profile/index.ts` → CLEAN

Census cross-check: none of the above appear in phase0-uids-porcelain.txt / phase0-bithire-porcelain.txt
(app-platform has no census file — per-file porcelain is the only guard, and it was run).

## Step 1 DONE — AD-5b mode-aware color-scheme claim (DS)

File: `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx`
(porcelain CLEAN before edit). `applyThemeToDom()` now builds the claim list conditionally:
`data-theme` + `.dark` class claimed unconditionally (unchanged); `claimRootStyleProperty('color-scheme', …)`
is pushed ONLY when `nextResolvedTheme !== 'base'`. Value simplified from
`nextResolvedTheme === 'dark' ? 'dark' : 'light'` to `nextResolvedTheme` (the branch only runs for
'light' | 'dark', so the ternary was a no-op). DB tenants keep the inline claim by construction:
their theme is 'light'/'dark'/'auto' and `resolveTheme()` never yields 'base' for those.

Tests (one command at a time):
- `npx vitest run --project unit .../provider/tests/theme-provider.test.tsx` → 11/11 PASS, exit 0.
  ZERO re-anchor: the only color-scheme assertion (line 362) mounts `theme="dark"`, which still claims.
- `npx vitest run --project integration .../provider/tests/root-attribute-authority.integration.test.tsx`
  → 5/5 PASS, exit 0. ZERO re-anchor: the census intercepts setAttribute/removeAttribute for the four
  governed data-* channels only; `color-scheme` is an inline style property and was never in its corpus.
  (First attempt used `--project unit` → "No test files found" because the unit project excludes
  `*.integration.test.*`; re-ran under `--project integration`.)
- `npx vitest run --project unit .../provider/theme/tests/use-theme.test.tsx` → 3/3 PASS, exit 0.
  ZERO re-anchor (asserts context shape only).

## Step 2 DONE — AD-5c cookie/SSR/hydration chain (app-platform)

All target files verified CLEAN by `git status --porcelain -- <file>` immediately before editing.

NEW (untracked, `?? src/core/providers/theme-preference/`):
- `src/core/providers/theme-preference/contract/index.ts` — `THEME_PREFERENCE_COOKIE='ds-theme-preference'`,
  `ThemePreference='light'|'dark'`, `THEME_PREFERENCE_MAX_AGE_SECONDS` (1 year),
  `parseThemePreference()` (anything not light/dark, incl. a stale 'base'/'auto', reads as ABSENT).
- `src/core/providers/theme-preference/server/index.ts` — `readThemePreference()` via `next/headers`
  `cookies()`. Isolated in its own sub-owner so `next/headers` cannot reach a client bundle
  (the family barrel deliberately does NOT re-export it).
- `src/core/providers/theme-preference/client/index.tsx` — `'use client'` `ThemePreferenceProvider`
  (server value in as a prop → `useState` → hydration-safe) + `useThemePreference()` +
  the `document.cookie` writer (Path=/, Max-Age, SameSite=Lax, Secure only over https so a
  localhost write is not silently discarded). `useThemePreference()` returns a neutral no-op
  shape outside the provider instead of throwing.

MODIFIED:
- `src/app/layout.tsx:41-42` imports; `:87-93` ONE cookie read feeds both writers;
  `:99` `data-theme={themePreference}` (React omits the attribute when undefined → absent
  keeps today's behavior exactly); `:104-106` `<body>` wraps children in `ThemePreferenceProvider`.
  The dead localStorage boot script AND its `<head suppressHydrationWarning>` wrapper are REMOVED
  (preferred over rewriting it: SSR stamping makes a pre-paint correction unnecessary, and removal
  leaves one fewer writer). Census proof it was dead: repo-wide grep for `ds-theme-preference`
  now returns ONLY the new contract constant; before the edit it returned exactly one hit
  (the boot script itself) in app-platform and ZERO in app-bithire and the DS — one reader, no writer.
- `src/core/providers/index.ts:11-16` — barrel exports `ThemePreferenceProvider`/`useThemePreference`
  + the `ThemePreference` type, with a note that the server reader is import-by-subpath only.
- `src/core/providers/dashboard-providers/index.tsx:62` import, `:176` hook,
  `:210-213` `forceTheme={themePreference}` on `DesignSystemProvider`.
- `src/core/providers/tenant-provider/index.tsx:62` import, `:76` hook, `:99-101`
  `forceTheme={themePreference}`. NOT in the brief's letter but required for correctness:
  `TenantProvider` is the SECOND `DesignSystemProvider` mount (auth `(auth)/layout.tsx` and
  `docs/layout.tsx`). Without it the root layout would stamp `data-theme='dark'` SSR and that
  provider would resolve 'base' and CLAIM over it on hydration — the exact disagreement AD-5c removes.
- `src/vertical/profile/index.ts:58-69` — `modeSwitchAvailable: true` on `PLATFORM_PROFILE`
  with the rationale (rottay is dark-by-default AND ships a fully authored light palette).
- `src/features/organization/settings/screens/settings-overview.tsx` — the toggle.
  Chosen over `whitelabel.tsx` because it is routed at `/settings`
  (`src/app/(dashboard)/settings/page.tsx:3`), whereas whitelabel is the tenant-branding console.
  `account.tsx`/`overview.tsx` were DIRTY and untouched.
  `useTheme` added to the DS import; `applyThemeMode(next)` inside the component body
  (app law forbids module-level functions in .tsx) calls `setTheme(next ?? 'base')` AND
  `setThemePreference(next)`; an "Appearance" section renders Light / Dark / System default,
  gated on `PLATFORM_PROFILE.modeSwitchAvailable`. "System default" passes `null` → cookie cleared
  (Max-Age=0) + theme back to 'base'.

CHAIN AS IMPLEMENTED (single read, two agreeing writers):
`layout.tsx:93 readThemePreference()` → (a) `layout.tsx:99 data-theme` SSR stamp,
(b) `layout.tsx:105 ThemePreferenceProvider preference=` → `useThemePreference()` in
dashboard-providers:176 / tenant-provider:76 → `forceTheme` → DS `DesignSystemProvider`
(`theme = forceTheme ?? explicitTenantTheme ?? appearanceBackgroundMode ?? config.theme ?? 'base'`,
provider/index.tsx:644) → `ThemeProvider theme=` → `resolveTheme()` → claim `data-theme`.
Writer-back: settings toggle → `setTheme()` (DS sole `data-theme` writer) + cookie for the next SSR.

NOT DONE / verified unnecessary: `src/app/(dashboard)/layout.tsx` was NOT edited (outside my
write authorization) — the context path made an edit there unnecessary.

## Step 3 DONE — app-bithire trio + mode-switch declaration

Both files verified CLEAN by porcelain before editing and absent from phase0-bithire-porcelain.txt.

3(a) `src/core/providers/index.tsx`
FINDING (checked before writing any code): `claimRootAttribute` /
`composeRootAttributeReleases` are NOT exported from ANY `@rottay/design-system` entrypoint.
Evidence: `grep -rn "claimRootAttribute\|composeRootAttributeReleases" src/entrypoints/` in the DS
returns nothing; `dist/index.d.ts` has no root-attributes export; `entrypoints/server/index.ts:125-132`
exports only the SSR projection (`resolveDocumentRootAttributes`, `buildThemePrepaintScript`).
The only importers of the claim API are two DS-internal providers (theming + engines).
app-bithire's DS is a SYMLINK to `ui-design-system/packages/core` (v2.19.36), so even the local
build does not expose it. => took the brief's authorized fallback: same baseline-restore semantics
implemented locally.

New local `claimRootAttribute(element, name, value)` (above `InnerProviders`): captures the prior
value (null encodes "absent"), writes, and returns a release that restores the baseline ONLY if the
live value is still what the claim wrote (an external writer that took the channel is left alone).
The trio effect now composes three claims and releases them in REVERSE order, mirroring
`composeRootAttributeReleases`. Destructive `removeAttribute` cleanup is gone.
DEBT recorded in the helper's JSDoc, naming the DS registry
(`infrastructure/runtime/foundation/root-attributes`) as the canonical implementation to
replace it with once the package exports it — it additionally tracks overlapping claims by
identity, which the local version does not.

3(b) `src/vertical/model/profile/product-profile/index.ts:31-47`
`export const BITHIRE_MODE_SWITCH_AVAILABLE = false;` with the rationale (mechanism ships;
the dark palette is not visually certified; flipping it is an R2/R3 SIGHTED decision).
NOTE for W4: the true structural mirror of `PLATFORM_PROFILE` is `BITHIRE_PROFILE` in
`src/vertical/model/profile/index.ts`, but that file is OUTSIDE my write authorization, and the
brief named product-profile explicitly. If W4 wants the flag on `BITHIRE_PROFILE` for symmetry,
that is a one-line move.
NO toggle UI added to bithire (non-goal). Evnto untouched.

## Step 4 DONE — T4 / T9 / T10

Environment note: the DS vitest environment is `happy-dom`, not jsdom (vitest.config.ts:28).
A throwaway probe (`zz-w3-probe.test.ts`, DELETED after use) confirmed happy-dom resolves
computed custom properties from a `<style>` element AND re-resolves them on an attribute
change: `{"base":"#101010","dark":"#f0f0f0","backToBase":"#101010"}`. T4 therefore asserts
real computed values as the brief required.

T4 — NEW `.../theming/composition/react/provider/tests/mode-reachability.test.tsx`
`npx vitest run --project unit .../tests/mode-reachability.test.tsx` → 4/4 PASS, exit 0.
Minimal artifact fixture (2 blocks: unconditional base + `[data-theme='dark']` mode block),
NOT the real artifact. Asserts: preference 'dark' → `data-theme='dark'` → computed `--w3-ink`
is the DARK block's value; base→dark→base transition moves the computed value AND restores it;
AD-5b inline `color-scheme` ('' for base, 'dark'/'light' for explicit, released back to '' on
return to base); plus a negative drill where the attribute is stamped correctly but the fixture
is scoped to another tenant, so the computed value does NOT move — the case an attribute-only
assertion would pass.

T4 ADVERSARIAL DRILL (self-success verification, per the fleet law):
temporarily restored the pre-AD-5b unconditional claim in the provider →
re-ran → `1 failed | 3 passed`, `AssertionError: expected 'light' to be ''`.
Reverted immediately; re-ran → 4/4 PASS. `git diff --stat` on the provider confirms one hunk
(15 insertions / 7 deletions). The test provably catches the regression it names.

T9 — `npx vitest run --project unit src/foundation/i18n/runtime/resolution/locale/tests/index.test.ts`
→ 3/3 PASS, exit 0. NO edits (as expected). This is the invalid-locale file:
`toSupportedLocale('de-DE', 'fr') === 'fr'` and `toSupportedLocale('de-DE') === DEFAULT_LOCALE`.

T10 — NEW `.../foundation/root-attributes/ssr/tests/arabic-document-parity.test.tsx`
`npx vitest run --project unit .../ssr/tests/arabic-document-parity.test.tsx` → 9/9 PASS, exit 0.
(a) `resolveDocumentRootAttributes({locale:'ar'})` → lang 'ar' / dir 'rtl', and
    `resolveDocumentLocaleAttributes('ar')` agrees (no second direction table), 'en' → 'ltr'.
(b) `compileBrandTheme` over bithire/evnto/rottay: every channel in
    `MANDATORY_FALLBACK_FONT_CHANNELS` contains `"Noto Sans Arabic"`; plus a discrimination
    check that `hasMandatoryFontFallback` is not vacuous.
(c) `I18nProvider locale="ar"` converges on EXACTLY the pair the SSR projection produced, and
    tracks a runtime switch to 'en' rather than pinning its first write.

T10 CORRECTION MADE MID-STEP (recorded, not hidden): my first drill asserted
`compileBrandTheme` THROWS for a theme whose authored stack drops the tail. It did not throw,
and the premise was wrong: `withArabicSafeFallback` REPAIRS authored input on the way in, and
`assertMandatoryFontFallback` is the fail-closed check over the EMITTED map (it catches a path
that removes the tail after the repair — W1's own comment says "withArabicSafeFallback cannot
produce this, which is the point"). The drill now asserts the true mechanism: a Latin-only
authored stack is repaired, the author's families keep priority, and the tail is appended.
OVERLAP DISCLOSED: T10(b)'s three-vertical assertion duplicates the first `it.each` in W1's
`.../brand-theme/tests/mandatory-font-fallback.test.ts`. The brief commissioned it as part of
T10 so I kept it; W4 may collapse it. W1's file also owns the throw-drill, which is why mine
does not repeat it.

Adjacent untouched suites re-run as regression cover (all exit 0):
- root-attributes `tests/index.test.ts` + `ssr/tests/index.test.ts` → 31/31 PASS
- `.../i18n/runtime/context/provider/tests/index.test.tsx` → 19/19 PASS

## Final verification

Combined confirmation run (exit code captured explicitly):
`npx vitest run --project unit mode-reachability + arabic-document-parity + theme-provider + locale`
→ **EXIT=0**, 4 files, 27/27 PASS.

Verified claim (not assumed): app-bithire `src/app/layout.tsx:205-207` DOES stamp
`data-account-tenant` / `data-brand-artifact` / `data-css-tenant` server-side, so the old
`removeAttribute` cleanup was deleting real SSR values — the Step 3(a) fix is load-bearing,
not cosmetic.

Repo-wide `ds-theme-preference` census after the wave: app-platform = 1 hit (the new contract
constant); app-bithire = 0; DS = 0. The dead localStorage reader is gone and there is still
exactly one name in play.

FULL FILE MANIFEST (all porcelain-CLEAN before edit; none in either phase0 census):
ui-design-system
  M  packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx
  ?? packages/core/src/infrastructure/runtime/theming/composition/react/provider/tests/mode-reachability.test.tsx
  ?? packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/tests/arabic-document-parity.test.tsx
app-platform
  M  src/app/layout.tsx
  M  src/core/providers/index.ts
  M  src/core/providers/dashboard-providers/index.tsx
  M  src/core/providers/tenant-provider/index.tsx
  M  src/vertical/profile/index.ts
  M  src/features/organization/settings/screens/settings-overview.tsx
  ?? src/core/providers/theme-preference/{contract,server,client}/index.{ts,tsx}
app-bithire
  M  src/core/providers/index.tsx
  M  src/vertical/model/profile/product-profile/index.ts

NOT DONE (deliberate): no typecheck / no build / no suite (agent law) — the app-side TypeScript
is unverified by a compiler and W4's serial chain is its first typecheck; no toggle in
bithire/evnto; no I18nProvider lang/dir mechanics changed; no translations; no Kimi WIP touched;
no git add/commit/stash/restore; `src/app/(dashboard)/layout.tsx` untouched (unauthorized, and
the context path made it unnecessary).
