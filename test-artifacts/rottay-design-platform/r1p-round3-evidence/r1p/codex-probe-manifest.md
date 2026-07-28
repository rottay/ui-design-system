# R1-P — Codex Probe Manifest (Phase 7)

Status: prepared by Claude (W4). No sighted validation is claimed here; every item below
is a deterministic probe for Codex to execute in a browser. Expected values reference the
regenerated artifacts and the R1-P state files; where a value is listed as
COMPUTE-AT-PROBE, read it from the regenerated artifact first (r1p/w1-state.md documents
the pixel-preservation acid test — base states are value-stable except the documented
deliberate changes).

## Servers

- BitHire static: `app-bithire` on :3001 (`next dev --webpack -p 3001`).
- Showroom (hosts rottay as default tenant + probe pages incl. `probe/wl-canary`,
  `probe/brand-studio`): `ui-design-system/packages/showroom` on :7001
  (`next dev --webpack --port 7001`).
- The Management (DB-backed): via app-bithire with the TMM tenant row / fixture
  projection per the R2 canary setup in the official doc (fixture-backed; live-DB
  certification is R2's own step).

## Probe blocks

### P-A · BitHire static, base + explicit modes

`getComputedStyle(document.documentElement).getPropertyValue(name)` for:
`--ds-color-bg-primary`, `--ds-color-text-primary`, `--ds-color-primary`,
`--ds-card-bg`, `--ds-card-radius`, `--ds-color-border-primary`,
`--ds-focus-ring-color`, `--ds-font-family-base`, `color-scheme` (computed style).

1. Base state (no data-theme mutation): values must equal the artifact's compiled base
   block (post-R1-P: BrandTheme-authored). Notably `--ds-color-bg-primary` = `#ffffff`
   (adopted shipped value), `color-scheme` = `light` (now compiler-emitted, no longer the
   deleted CLEAR MODE GUARD).
2. `document.documentElement.setAttribute('data-theme','dark')`: the BITHIRE DARK MODE
   declared exception block must now apply (the guard that reverted it is deleted) —
   verify `--ds-color-primary` flips to the dark palette value and `color-scheme`
   computes `dark`. NOTE for acceptance: bithire dark is mechanism-proven but NOT
   visually certified; `modeSwitchAvailable:false` documents that product stance.
3. Remove the attribute: values must return to base (claim/cleanup non-destructive).

### P-B · Rottay/platform, base + light (the Round 3 N-2 channel)

On :7001 (rottay default) or app-platform:
1. Base state: `--ds-card-bg` must be the BrandTheme value (dark palette,
   `#18181B`) — this is the channel where behavioral propagation previously failed in
   ALL states; it must now come from the compiled block (unconditional selector).
2. `data-theme='light'` (or the new app-platform toggle): the `.light` declared
   exception block applies; `--ds-card-bg` = `#FFFFFF`.
3. Toggle round-trip via the new settings control (app-platform): cookie
   `ds-theme-preference` set; reload; SSR must stamp the stored mode with NO flash
   (compare first-paint screenshot vs post-hydration).

### P-C · The Management DB-backed

1. Confirm the v1 compiled artifact path serves TMM (legacy generator not reached —
   W2 verified TENANT_THEME_V1_COVERAGE suppression; Codex confirms in-browser via the
   SSR-embedded style element digest).
2. Divergence vs BitHire on the same component tree (typography, radii, elevation,
   density, sidebar, materials) — the R2 16-capture matrix per the official doc.

### P-D · DB legacy-path ramp fix (brand studio preview)

In the brand-studio tenant preview (:7001 `probe/brand-studio`), configure a tenant with
brandTheme + branding and NO appearance: `--ds-color-primary-500` must be the OKLCH
value (for seed `#3A6FB0`: `#386DAD`), NOT the sRGB echo (`#3A6FB0`). This is W2's
headline value pair — the visible proof the second emitter is gone.

### P-E · i18n / RTL

1. EN default: session-less visit → `lang="en"`, `dir="ltr"`.
2. AR (where enabled / via probe page): `lang="ar"`, `dir="rtl"`, and computed
   `--ds-font-family-base` contains `"Noto Sans Arabic"` on ALL THREE verticals
   (evnto especially — this was the live regression, now compiler-guarded).

### P-F · The 25 Round-3 UNKNOWNs (computed-style resolution)

For each name in classification.md §6 (the 25 reachable bithire UNKNOWN rows —
`--ds-button-default-bg`, `--ds-button-default-bg-hover`, `--ds-button-default-color`,
`--ds-button-ghost-bg-hover`, `--ds-button-ghost-color`, `--ds-button-primary-border`,
`--ds-button-primary-color`, `--ds-button-secondary-bg`, `--ds-button-secondary-bg-hover`,
`--ds-button-secondary-border`, `--ds-card-bg-hover`, `--ds-card-border`,
`--ds-card-border-color`, `--ds-card-footer-bg`, `--ds-card-shadow`,
`--ds-card-shadow-hover`, `--ds-filter-pill-active-border`,
`--ds-filter-pill-active-shadow`, `--ds-filter-pill-count-active-bg`,
`--ds-filter-pill-count-active-ring`, `--ds-filter-pill-count-bg`,
`--ds-filter-pill-count-ring`, `--ds-filter-pill-frame-border`,
`--ds-filter-pill-hover-bg`, `--ds-filter-pill-hover-border`): read the computed value
on :3001 base state and record it against the BrandTheme-adopted expression. Post-R1-P
these are single-authored (adopted per AD-1) — the probe closes their
`resolvedEquality: UNKNOWN` status by measurement, and any mismatch vs the artifact
value indicates an app-tier override (report, don't fix).

### P-G · Writer hygiene

1. In DevTools, toggle app-platform mode twice and unmount/remount the providers (route
   change): `data-account-tenant`/`data-brand-artifact`/`data-css-tenant` must NEVER
   transiently disappear (claim-based baseline restore — W3).
2. `document.documentElement.style.colorScheme` must be EMPTY in base state (AD-5b: no
   inline claim for base; stylesheet owns it) and populated only after an explicit
   light/dark selection.

## What Codex should NOT attribute to R1-P

- Stale `styles/*.css` bundles vs new artifacts (AD-9: bundle regeneration deliberately
  deferred — the five bundle files are concurrent-WIP; probes above read the DOM against
  dev servers which compose from source, or must regenerate bundles AFTER the concurrent
  WIP lands).
- Any visual polish gaps in bithire dark (uncertified by design this wave).
