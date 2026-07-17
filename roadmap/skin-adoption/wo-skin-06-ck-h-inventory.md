# WO-SKIN-06 checkpoint CK-H inventory (read-only) — brand-preview + misc

Scope: the 13 files named in the CK-H row of `wo-skin-06-triage.md` §6, verified
against `node scripts/engine-token-audit.mjs | grep fleet.inlinePaint.runtime/patterns/misc`
(counts match exactly, 453 total):

| file | sites | half |
|---|---:|---|
| `patterns/misc/tenant-preview/engines/modern/index.tsx` | 71 | H1 |
| `patterns/misc/tenant-preview/engines/rustic/index.tsx` | 76 | H1 |
| `patterns/misc/branding-preview-sandbox/index.tsx` | 54 | H1 |
| `patterns/misc/brand-studio/index.tsx` | 36 | H1 |
| `patterns/misc/file-manager/engines/modern/index.tsx` | 35 | H2 |
| `patterns/misc/file-manager/engines/rustic/index.tsx` | 29 | H2 |
| `patterns/misc/user-profile-card/engines/modern/index.tsx` | 30 | H2 |
| `patterns/misc/user-profile-card/engines/rustic/index.tsx` | 28 | H2 |
| `patterns/misc/pricing-table/engines/modern/index.tsx` | 22 | H2 |
| `patterns/misc/pricing-table/engines/rustic/index.tsx` | 31 | H2 |
| `patterns/misc/empty-state/engines/modern/index.tsx` | 11 | H2 |
| `patterns/misc/empty-state/engines/rustic/index.tsx` | 10 | H2 |
| `patterns/misc/token-inspector/index.tsx` | 20 | H2 |

**H1 = 237 sites, 4 files (tenant-preview ×2 engines, branding-preview-sandbox,
brand-studio). H2 = 216 sites, 9 files (file-manager, user-profile-card,
pricing-table, empty-state ×2 engines each, token-inspector).** All 13 files
read in full, not sampled. Every raw count below is grep-verified against the
counter's exact channel regex (`ARC09_PAINT_KEY_RE` from
`scripts/lib/inline-paint-counter.mjs`) before classification, not estimated.

`patterns/misc/cockpit-header`, `page-shell`, `workbench-header` also live
under `patterns/misc/` but are **not** in CK-H scope (they belong to CK-B/CK-C)
and were not read.

Channel scope, class legend (STATIC / STATE-SELECTED / RUNTIME), and the
discriminator are the ones defined in `wo-skin-04-navigation-inventory.md` and
`wo-skin-06-triage.md` §2. **Zero `data-part` anywhere in this family**
(grep-confirmed across all 13 files) and **no skin CSS exists yet for any of
them** — greenfield. All 8 candidate scope classes (`ds-tenant-preview`,
`ds-branding-preview-sandbox`, `ds-brand-studio`, `ds-file-manager`,
`ds-user-profile-card`, `ds-pricing-table`, `ds-empty-state`,
`ds-token-inspector`) are grep-confirmed FREE in `foundation/tokens/css/`.

---

## 1. Headline

```
CK-H total                                    453 sites   13 files

H1 (brand-preview trio + tenant-preview)      237 sites    4 files
  A  migratable to a skin                     190   80.2%
  B  legitimately inline (exempt)               37   15.6%
  N  not paint at all (counter false-positive)  10    4.2%

H2 (file-manager / user-profile-card /
    pricing-table / empty-state / token-inspector)
                                               216 sites    9 files
  A  migratable to a skin                     216  100.0%
  B  legitimately inline (exempt)                0    0.0%
  N  not paint at all                            0    0.0%
```

**H2 is not "~100% A" — it is exactly 100% A.** Zero B, zero C, zero
false-positives anywhere in its 216 sites, across 9 files and 5 components.
This is the cleanest result of any checkpoint so far.

**H1's B count is 37, not 41.** The triage's §4 table listed
`tenant-preview 32 + brand-studio 7 + branding-preview-sandbox 2 = 41`. Hand
reading all four files finds:

- **tenant-preview is 36 B, not 32** (22 modern + 14 rustic) — the triage's
  figure undercounts by missing 10 of the 20 `buildPaletteSteps` palette-step
  entries (see §2).
- **branding-preview-sandbox is 0 B, not 2** — its cited `badge.bg`/`badge.color`
  are misclassified; they come from a hardcoded 4-entry array, not runtime data
  (see §4).
- **brand-studio is 1 B, not 7** — six of the triage's implied sites are not
  paint at all (draft-theme-mutation `onChange` handlers), and the file has
  exactly one genuine B site (see §5).

This is the same failure mode the triage's own two corrections already
documented for CK-C and CK-D — a plausible count from the automated resolver,
not verified against a full hand read. It recurs a third time here, inside the
exemption list itself, which is the one number in this program that is
supposed to be permanent. **A wrongly-exempted site never gets migrated; a
site the exemption list is missing can never reach 0 without someone
discovering it's not actually A.** Both directions are covered below.

Additionally, H1 contains **10 sites the mechanical counter counts as inline
paint that are not inline paint at all** — a new blind-spot class, distinct
from both B (legitimately-inline runtime paint) and the triage's §7.5
interface-member blind spot, though related in shape. See §3 and §5.

---

## 2. tenant-preview (modern 71 + rustic 76 = 147 sites) — both engines share one un-exported helper module, verbatim, unwired

`engines/modern.tsx` and `engines/rustic.tsx` each independently define **the
same four helper functions, byte-identical**: `hexToRgb`, `mixColor`,
`buildPaletteSteps`, `getContrastColor`. Not imported from a shared module —
copy-pasted, present in both files. This is a real, missed sharing
opportunity (unlike the CK-C/CK-D "assumed sharing" traps, this is *actual*
duplication that could be extracted), but it is source-code duplication, not
a paint-migration concern — noted under engine asymmetries (§8), not fixed
here.

### Paint sites — `engines/modern.tsx` (71)

| Part | File:Lines | Channels | Class |
|---|---|---|---|
| root container | modern.tsx:179 | background, borderRadius, boxShadow | STATIC |
| header row | modern.tsx:185 | borderBottom | STATIC |
| logo thumb | modern.tsx:187 | borderRadius | STATIC |
| name / slug text | modern.tsx:192-193 | color ×2 | STATIC |
| `buildPaletteSteps` return-type annotation | modern.tsx:90 | color | **N — not a real site** (see §3) |
| `buildPaletteSteps` palette-step array (10 entries, steps 50-900) | modern.tsx:92-101 | color ×10 | **B** — `mixColor(base, '#ffffff'|'#000000', ratio)`, `base` is `creationConfig.primaryColor` |
| primary palette wrapper | modern.tsx:208 | borderRadius | STATIC |
| primary palette swatch | modern.tsx:213 | backgroundColor | **B** — `color` from the palette-step map |
| "500" label on primary swatch | modern.tsx:216 | color | **B** — `primaryFg = getContrastColor(primary500)` |
| secondary palette wrapper | modern.tsx:225 | borderRadius | STATIC |
| secondary palette swatch | modern.tsx:230 | backgroundColor | **B** |
| button Primary | modern.tsx:257 | borderRadius, border, backgroundColor, color | 2 STATIC + **2 B** (`backgroundColor`/`color` are `primary500`/`primaryFg`) |
| button Outlined | modern.tsx:263 | borderRadius, border, background, color | 2 STATIC + **2 B** (`border`/`color` embed `primary500`) |
| button Default | modern.tsx:267 | borderRadius, border, background, color | STATIC (all 4) |
| sample card wrapper | modern.tsx:278 | background, border, borderRadius, boxShadow | STATIC (all 4) |
| sample card accent bar | modern.tsx:281 | borderRadius, backgroundColor | 1 STATIC + **1 B** (`primary500`) |
| card title / body text | modern.tsx:282-283 | color ×2 | STATIC |
| sample input | modern.tsx:302-306 | border, borderRadius, background, color, outline | STATIC (all 5) |
| badge "Active" | modern.tsx:321 | backgroundColor, color | **2 B** (`primary500`/`primaryFg`) |
| badge "Pending" / "Draft" | modern.tsx:325-326 | background, color ×2 (4 keys) | STATIC (all 4) |
| table header/border | modern.tsx:336(exempt `borderCollapse`),338-341 | borderBottom, color ×3 | STATIC |
| table row 1 | modern.tsx:345-346 | borderBottom, color | STATIC |
| table row 1 status badge | modern.tsx:349 | backgroundColor, color | **2 B** — `` `${primary500}18` ``/`primary500` |
| table row 2 | modern.tsx:354,357,359 | color ×3 | STATIC |
| table row 2 status badge | modern.tsx:358 | background, color | STATIC |
| personality info tiles | modern.tsx:388 | borderRadius, background | STATIC |

**Totals: 48 A-static + 22 B + 1 N = 71.** (No STATE-SELECTED sites at all —
this component has no interactive/hover states, only conditional *sections*
gated by the `components` prop, which does not create branching style
values.)

### Paint sites — `engines/rustic.tsx` (76)

Same shape: `buildPaletteSteps` return-type annotation (rustic.tsx:51, **N**)
+ 10 palette-step `color:` entries (rustic.tsx:53-62, **B**) + 4 render-site
B sites (backgroundColor:color at :210 and :231 — palette swatches; color:
primaryFg at :217; backgroundColor: primary500 at :314 — card accent bar).
**Everything else in rustic's "Buttons"/"Input"/"Badges"/"Table" sections
(lines 257-411) is A-static and reads a generic `--ds-color-primary-500` /
`--ds-button-primary-bg` DS scale token, never the literal `primary500`
variable.** Verified by grepping every use of `primary500`/`primaryFg` in the
file — the only 4 hits are the ones listed as B above.

**Totals: 61 A-static + 14 B + 1 N = 76.**

**This is a real, product-facing cross-engine asymmetry, not just a paint
difference (record only, §8):** modern's component-preview section
demonstrates the tenant's *actual chosen hex* across buttons, badges, and the
table (literal `primary500`/`primaryFg`); rustic's equivalent section uses
generic DS scale tokens that do not reflect the tenant's chosen color at all
— only the palette swatches and the card's accent bar actually show the
tenant's real color in rustic. If `--ds-color-primary-500` inside the scoped
`previewCss` block (see §6) is itself set to the tenant's color, this may be
harmless in practice; that is a CSS-cascade question outside this paint
inventory's scope and was not verified here — flagged for the team to check
before assuming rustic's preview is accurate.

---

## 3. The `buildPaletteSteps` return-type annotation — a new instance of the §7.5 interface-member blind spot

`function buildPaletteSteps(base: string): { step: number; color: string }[] {`
(modern.tsx:90, rustic.tsx:51). The `color: string` here is a TypeScript
inline object **type**, not a value — but its innermost open bracket is `{`,
which is exactly the shape triage §7.5 documents: the lexer's docstring only
excludes the function-*parameter* type-annotation case (innermost bracket
`(`), not an inline object-literal return type. **This file is an 8th and 9th
instance of that exact blind spot** (triage §7.5 enumerated 7, all in
`patterns/visualization`), now confirmed present in `patterns/misc` too. It
inflates each file's counted total by 1 and is not migratable to anything —
there is no CSS selector for a TypeScript type annotation. Recommend adding
both lines to the named-exemption list alongside the original 7, or teaching
the lexer to skip `interface`/inline-type bodies as the triage already
proposed.

---

## 4. branding-preview-sandbox (54 sites) — 100% A; the triage's 2 cited B sites are a misclassification

Every one of the file's 54 counted sites is a literal string constant:
`'var(--ds-button-primary-bg, var(--ds-color-primary))'`,
`'var(--ds-color-success-bg, rgba(34,197,94,0.1))'`, etc. **Grep-confirmed:
zero occurrences of `mixColor`, `pickHex`, `isHex`, or `appearance.` anywhere
in the file's inline style values.** The component's entire purpose — preview
a *proposed* `TenantAppearance` — is delivered through a completely different
mechanism than tenant-preview: `appearanceToVariables(appearance)` builds a
`--ds-*` variable map that is injected via a `<style>` tag scoped to
`[data-preview-<useId>]` (line 131-133). The inline `style={{...}}` objects
below that scope only ever reference `var(--ds-*, fallback)` **names** —
never a computed hex — so the actual proposed-branding values never touch
counted inline paint at all. This is the cleanest possible shape for a
migration: the runtime part is 100% already isolated in a counter-invisible
CSS-variable indirection layer.

**The triage's §4 citation, `badge.bg` / `badge.color` at `index.tsx:187`, is
wrong.** Reading the source:

```tsx
[
  { label: 'Active',  bg: 'var(--ds-color-success-bg, rgba(34,197,94,0.1))', color: 'var(--ds-color-success)' },
  { label: 'Warning', bg: 'var(--ds-color-warning-bg, rgba(245,158,11,0.1))', color: 'var(--ds-color-warning)' },
  { label: 'Error',   bg: 'var(--ds-color-error-bg, rgba(239,68,68,0.1))',   color: 'var(--ds-color-error)' },
  { label: 'Info',    bg: 'var(--ds-color-info-bg, rgba(59,130,246,0.1))',   color: 'var(--ds-color-info)' },
].map(badge => React.createElement('span', { style: { ..., background: badge.bg, color: badge.color } }, badge.label))
```

`badge.bg`/`badge.color` come from a **hardcoded 4-entry literal array**, not
runtime data — structurally identical to the discriminator's own canonical
A-example, `STATUS_PILL_STYLES[status.variant]` (triage §2). This is
STATE-SELECTED (A), not B: `[data-variant=…]` per the discriminator, not an
exemption. **Recommend the exemption list drop this citation entirely.**

**Architectural note, not paint-classification-relevant:** this file is
written entirely with `React.createElement` calls, not JSX — the only other
file in CK-H doing this is `token-inspector` (§7). Both are dev/preview
tooling rather than product UI; noted for completeness, not a migration
concern.

---

## 5. brand-studio (36 sites) — 1 genuine B site; 8 sites are not paint at all

This file is a **BrandTheme editor**: an `onChange`-driven form whose fields
map 1:1 onto `BrandTheme.palette`/`chrome.*` contract keys, plus a live
dual-ground (dark/light) preview compiled via `compileBrandTheme`. Because
the contract's own field names are `color`, `border`, `background` (mirroring
CSS), **some of the file's paint-shaped counted keys are TypeScript state
mutations that never reach a DOM style prop at all** — a new blind-spot shape
for this program, distinct from both the interface-member case (§3) and a
genuine B site.

| Category | Lines | What it actually is |
|---|---|---|
| **B (genuine, 1 site)** | `:387` `background: isHex(value) ? value : 'transparent'` | `ColorField`'s swatch preview — `value` is the live hex the admin is typing into *this* field. Matches the triage's own citation exactly and is the one real "show the user a color they picked" site in this file. |
| **N — WCAG-validator input object (1 site)** | `:229` `background: pickHex(vars, backgroundKeys) ?? ''` | Return value of `deriveBrandingColors`, feeding `validateBrandingContrast`. Never assigned to any element's `style`. Runtime-derived in the sense that `vars` traces back to the compiled theme, but there is no CSS site to migrate — it's a plain data object. |
| **N — hostile-theme test fixture (2 sites)** | `:323` `color: '#fbfbfb'`, `:328` `borderRadius: {...}` | `applyHostileBrandTheme` builds a deliberately-extreme `BrandTheme` draft for the "Run hostile check" button. Hardcoded literals, but mutating a theme-contract object, not a style prop. |
| **N — `BrandThemeEditor` onChange mutations (5 sites)** | `:763,765,767,769,775` | `color: v` / `border: v` inside `emit((d) => { ctl.buttonPrimary = {...., color: v} })` — `v` is the admin's live keystroke in a `ColorField`/`TextField`, being written into the **draft `BrandTheme` object**, not a DOM node. (`colorActive`, `headerBg`, `overlayBg`, `rowBgHover`, `bg` alone do not match the counter's exact-`color`/`background`-prefix regex, which is why only these 5 of the section's ~14 fields register at all.) |
| **A-static (27 sites)** | everything else | Real `style={{...}}` props on `Box`/`Text`/`Card` chrome — section wrappers, labels, the preview panel container, the contrast-violation cards. All literal `var(--ds-color-*, fallback)` strings. |

**Totals: 27 A + 1 B + 8 N = 36.**

**Consequence for the exemption list:** the triage cited `index.tsx:229,387,763`
as its 3 representative brand-studio B examples. Of those, only **:387** is
real. **:229 and :763 are both N**, not B. If a future migration treated
`:763`'s `color: v` as a site needing a `--ds-*` custom-property hatch, it
would be a category error — there is no element to attach the hatch to; the
line is TypeScript business logic that happens to share a property name with
CSS. This must be excluded from the ratchet's total the same way a
type-annotation false positive is (§3), not carried as either A or B debt.

The two `<style>` injections in this file (`PreviewPanel`'s `scopedCss` and
the module-level grid-layout container-query block) are both instance-safe —
see §6.

---

## 6. H2 — file-manager, user-profile-card, pricing-table, empty-state, token-inspector (216 sites, 9 files): confirmed 100% A

Every site in every H2 file resolves to one of:

- **A-static** — literal `var(--ds-*, fallback)` strings or (token-inspector
  only) literal hex, never touched by a runtime identifier.
- **A-state** — a bounded enum/boolean selecting among static leaves:
  `getFileIconStyle(item)` (MIME-type 4-way switch, file-manager both
  engines — the discriminator's canonical "enum-switch fn" shape exactly),
  `selectedItems.includes(item.id)` grid/row-selection ternaries
  (file-manager both engines), `statusBadgeStyles[user.status]` /
  `statusColors[user.status]` (user-profile-card both engines — the
  discriminator's canonical "static map index" shape exactly),
  `action.variant` 3-way chains (user-profile-card, empty-state, both
  engines), `isHighlighted`/`billingCycle` ternaries (pricing-table both
  engines), `renderFeatureValue`'s tri-state switch (pricing-table both
  engines), `state.pinned` / `t.value.startsWith('#')` ternaries
  (token-inspector).

**No B, no C, anywhere.** No component in H2 ever lets a runtime value reach
a paint leaf — every conditional bottoms out in a fixed, finite set of
author-time tokens. Grep-verified: `creationConfig`/tenant-hex-style
identifiers do not exist in this half at all (H2 has no tenant/brand-color
concept — it previews users, files, prices, and empty states, none of which
carry an arbitrary color).

**token-inspector is architecturally unlike the rest of H2 and worth flagging
explicitly**, even though its classification is unremarkable: it is a
dev-only debugging overlay (Ctrl+Shift+T) that hardcodes a **literal dark
palette** (`#1a1a1e`, `#2a2a2f`, `#60a5fa`, etc.) instead of `var(--ds-*)`
tokens — the only component in CK-H, and one of very few in the whole
program, that does not use DS tokens at all. **This is by design, not a
no-hardcoded-colors violation to fix**: the inspector's job is to display the
resolved value of `--ds-*` tokens on whatever element is hovered, including a
broken or in-flux theme; if its own panel styling depended on the same
tokens it's inspecting, it could become invisible or miscolored exactly when
it's most needed. A migration must preserve the literal hex values verbatim
and must not "fix" this into token references. It is also written with
`React.createElement`, not JSX (see §4's note on branding-preview-sandbox).

---

## 7. Bridge rules — dead/live disposition per P-76

**Zero component-named rules found.** Grepped
`engines/{modern,rustic,classic}/theme.css` and `runtime/personality.css` for
all 8 component names (`tenant-preview`, `branding-preview-sandbox`,
`brand-studio`, `file-manager`, `user-profile-card`, `pricing-table`,
`empty-state`, `token-inspector`) — zero hits across the board. No
suppression risk from any component-scoped bridge rule anywhere in CK-H, the
same clean result CK-D found for its cluster.

**Two real, non-component-named findings worth flagging, both in
file-manager modern only:**

1. **`file-manager/engines/modern/index.tsx:237`** renders a folder-name link as
   `<a className="link link-hover cursor-pointer">` with **no inline color at
   all**. `foundation/tokens/css/runtime/engines/modern/theme.css:753-763` carries a real,
   layered `[data-tenant] a.link { color: var(--ds-link-color); ... }` rule
   (plus `:hover`/`:active` variants). Per P-76, `color` is a **LIVE**
   channel (not one preflight kills). Nothing inline contests it, so **this
   is the FloatButton-shaped hazard from WO-SKIN-04**: the folder-link's
   color is a live personality-layer win today, delivered entirely through a
   bare DaisyUI-adjacent class, never through inline paint — and therefore
   invisible to the WO-06 census as a "site" at all (there's no style prop).
   A future skin author scoping `.ds-file-manager` selectors must know this
   color does not come from anywhere in `file-manager`'s own source and must
   decide whether to inherit it (leave `a.link` on the element) or explicitly
   re-declare it in the new skin.
2. **`file-manager/engines/modern/index.tsx:211`** toggles a bare `className="active"`
   on the selected table row (`<tr className={... ? 'active' : ''}>`, code
   comment: "DaisyUI 'active' class highlights the selected row background").
   **`foundation/tokens/css/` has zero `tr.active` or table-row `.active` rules of any
   kind** — this component's selected-row highlight, if it renders at all,
   comes entirely from DaisyUI's own compiled base stylesheet, which is
   outside `foundation/tokens/css/` and was not read for this inventory. This is the
   same "STOP-AND-REPORT" shape WO-SKIN-04 found for Steps' pseudo-element
   connector lines: **not verifiable as live or dead from this codebase
   alone**, and not a counted site (no style prop), so a byte-exact migration
   cannot use "read the TSX" to confirm what it's preserving here. Flag for
   empirical (computed-style) verification before this row's paint is
   touched by any migration.

Everything else in CK-H's DaisyUI-adjacent surface (rustic engines
throughout, modern's Tailwind layout utilities) carries no structural
DaisyUI class at all — 100% inline or 100% Tailwind-layout-only.

---

## 8. Interaction paint: imperative writes, keyframes, per-instance `<style>` tags

**Imperative `.style.x =` writes: zero, anywhere in CK-H.** Grepped all 13
files for `.style.` mutation and `setProperty(` — no matches. Every state
transition in this checkpoint is a declarative style-object ternary or a
factory function taking a boolean/enum. This is the cleanest result on this
axis of any checkpoint in the program so far (CK-D had 2, both in
filter-builder).

**Per-instance `<style>` injections: 3 files, all instance-safe, none with a
naming collision.**

| file | mechanism | scoping | collision risk |
|---|---|---|---|
| `tenant-preview` (both engines) | `generateTenantCss(tenantConfig, {...})` → full tenant stylesheet | `data-tenant="<slug>"` attribute set imperatively in a `useEffect`, cleaned up on unmount | None — slug-scoped, not a keyframe |
| `branding-preview-sandbox` | `appearanceToVariables(appearance)` → `--ds-*` var block | `[data-preview-<useId>]`, `useId()`-derived, collision-proof by construction | None |
| `brand-studio` (`PreviewPanel`) | `buildSurfaceVariables(theme, surface).vars` → `--ds-*` var block | `.brand-studio-${surface.key}-${scopeSalt}`, `scopeSalt = useId()` | None |
| `brand-studio` (module-level) | static, non-templated grid-layout + container-query CSS string (lines 910-916) | class selector `.brand-studio-layout`, byte-identical on every render/instance | None — content is fixed, re-injecting an identical block per mount is wasteful but not a correctness hazard (unlike Tabs' `@keyframes` collision in WO-SKIN-04, there is no global-name clash here) |

**No `@keyframes` anywhere in CK-H.** The `ds-spin`/`spin` naming
inconsistency CK-D already flagged **recurs here**: `file-manager` and
`empty-state` (modern engines) directly reference `animation:
'ds-spin var(--ds-motion-glacial) linear infinite'` (the keyframe CK-D found
defined once in `engines/rustic/theme.css:1052`, cross-engine-shared, not
duplicated); `user-profile-card` and `pricing-table` (modern engines) use the
shared `spinnerStyle()` helper from `_internal/engines/modern/styles.ts`,
which resolves to the *differently-named* `spin` keyframe. Both are already
correctly shared (no duplication, no collision) — this is not a new defect,
just confirmation that the naming split CK-D found is program-wide, not
local to CK-D's files.

---

## 9. Vocabulary map — one real shared module, otherwise no sharing (confirmed, not assumed)

Per the triage's own corrected lesson ("existence is not adoption, similarity
is not sharing" — CK-C/CK-D corrections), every claim below was verified by
grep for actual imports, not inferred from similar-looking code.

- **`patterns/_internal/engines/modern/styles.ts`** (`panelCardStyle`,
  `pillBadgeSmStyle`, `spinnerStyle`) is genuinely imported by
  `user-profile-card/engines/modern/index.tsx` **and**
  `pricing-table/engines/modern/index.tsx` — both real, both use the same names for
  the same values. This is the same module CK-D confirmed as a legitimate,
  cross-checkpoint-adopted shared kit (11 fleet-wide importers; CK-D's
  `invoice-template`/`approval-workflow` were 2 of them). CK-H adds 2 more
  real importers. **This is the one genuine positive counterexample in the
  program so far to the CK-C/CK-D "assumed sharing" trap** — worth citing as
  the shape real sharing actually takes (a named, exported, multi-file-
  imported module), for contrast with everything below.
- **tenant-preview's two engines duplicate `hexToRgb`/`mixColor`/
  `buildPaletteSteps`/`getContrastColor` verbatim** (§2) — real duplication,
  not sharing, not wired to a common module. A legitimate extraction target,
  out of scope for a byte-exact migration.
- **Every other local map/factory in CK-H is genuinely local**:
  `statusBadgeStyles`/`btnSizeStyles`/`sizeClasses` (user-profile-card
  modern), `statusColors`/`sizeMap` (user-profile-card rustic),
  `sizeClasses` (file-manager modern — layout only, no paint),
  `renderFeatureValue` (pricing-table, independently defined per engine,
  different token depth per engine), `sizeDefs`/`primaryBtn`/`defaultBtn`
  (empty-state rustic), `sizeClasses` (empty-state modern). None import from
  or export to any other CK-H file, and none share a name with a CK-A
  through CK-G construct (spot-checked against the `getToneShell`/
  `STATUS_PILL_STYLES` names cited elsewhere in the triage — no overlap).

---

## 10. Anatomy today

**Zero `data-part` anywhere in CK-H** (grep-confirmed all 13 files).

**A real, consistent className convention exists on 5 of 8 components' root
elements, but only on their MODERN engine:**
`ds-pattern-<component> ds-engine-modern` is stamped on the root of
`tenant-preview`, `file-manager`, `user-profile-card`, `pricing-table`, and
`empty-state` — modern engines only. **Grep-confirmed zero references to any
`ds-pattern-*` class anywhere in `foundation/tokens/css/`** — same dead-BEM-hook shape
WO-SKIN-04 found for Menu's compound classNames: a real, consistent naming
convention that nothing currently targets.

**The asymmetry: only `tenant-preview`'s rustic engine mirrors this stamp**
(`ds-pattern-tenant-preview ds-engine-rustic`). **file-manager, user-profile-
card, pricing-table, and empty-state's rustic engines carry no `ds-pattern-*`
class at all** — grep-confirmed (their root `<div>` only forwards the
consumer's own `className` prop). This is a genuine, consistent gap across 4
of 5 dual-engine H2 components, not a one-off: a future skin author picking
`.ds-file-manager.ds-engine-modern` / `.ds-file-manager.ds-engine-rustic` as
a selector pair (mirroring the `ds-pattern-*`/`ds-engine-*` convention
already half-present) will find rustic has nothing to hook — the stamp must
be *added*, not migrated, for 4 of these 5 components. Not a byte-exact
blocker (adding a class is additive), but worth deciding once rather than
per-file.

**brand-studio, branding-preview-sandbox, and token-inspector carry no
`ds-pattern-*`/component-identifying class at all** on either their root or
any inner element — consistent with them being editor/dev tooling rather
than a rendered "preview card" in the same sense as the other five.

**Instance-scoping attributes** (`data-tenant`, `data-preview-<id>`,
`.brand-studio-<surface>-<id>` class) are covered in §8 — these are real,
load-bearing anatomy for the `<style>`-injection mechanism, distinct from
`data-part`.

---

## 11. Engine asymmetries, dead code, pre-existing defects (record only)

- **tenant-preview's rustic "Buttons"/"Badges"(partial)/"Input" sections
  never render the tenant's actual chosen color** — see §2. The most
  product-relevant finding in this checkpoint; worth a team flag independent
  of the migration.
- **tenant-preview's two engines duplicate 4 helper functions verbatim**
  (§2, §9) — not a bug, a missed extraction.
- **`ds-pattern-*`/`ds-engine-*` stamped on modern only, for 4 of 5 dual-
  engine H2 components** (§10) — a consistent, not incidental, asymmetry.
- **file-manager modern's selected-row highlight (`className="active"`) has
  no verifiable CSS source anywhere in this codebase** (§7) — genuinely
  unknown whether it renders anything, unlike every other paint site in this
  checkpoint which resolves to a traceable value.
- **file-manager modern's folder-link color is a live, uncontested
  `theme.css` rule reached only through a bare DaisyUI class** (§7) — the
  FloatButton-shaped hazard, first recurrence of that exact shape outside
  WO-SKIN-04.
- **user-profile-card's status badge is visually different per engine by
  design**: modern uses a 15%-tint translucent background with colored text
  (`color-mix(in srgb, var(--ds-color-success) 15%, transparent)`); rustic
  uses a solid color fill with white-on-color text. Both are internally
  consistent within their own engine; preserve both, do not reconcile.
- **`branding-preview-sandbox` and `token-inspector` are written with
  `React.createElement`, not JSX** — the only two files in CK-H (and rare in
  the wider program) doing this. Not a defect, just a note for whoever
  authors their skins: there is no JSX `style={{...}}` literal to find-and-
  replace; the paint lives in `style:` properties inside `createElement`
  option objects instead.
- **The `buildPaletteSteps` interface-member blind spot recurs** (§3) — 2 new
  instances beyond the triage's original 7.
- **brand-studio's editor-mutation blind spot** (§5) — 8 sites, a new blind-
  spot shape for this program (contract-field-shaped state mutations, not
  type annotations).

---

## 12. Method

Read all 13 files in full. Every file's raw paint-key count was independently
verified with
`grep -noE "\b(background[A-Za-z]*|border[A-Za-z]*|outline[A-Za-z]*|color|boxShadow|textShadow|fill|stroke|accentColor|filter|backdropFilter|WebkitBackdropFilter|transform)\s*:" <file> | wc -l`
(the exact `ARC09_PAINT_KEY_RE` from `scripts/lib/inline-paint-counter.mjs`),
minus `ARC09_PAINT_EXEMPT` hits (`borderCollapse`/`borderSpacing`), and
matched the counter's per-file total exactly before classification began —
every file in this report reproduces the counter's number on the nose, not
approximately. Every B-site citation was traced to its runtime source
(`creationConfig.primaryColor`, a form field's live `value`, etc.) by reading
the defining scope, not inferred from the property name. Bridge-rule and
scope-class-collision checks used grep against `foundation/tokens/css/` for all 8
component names plus the two non-component-named findings in §7.

---

## 13. The three biggest traps

1. **The exemption list itself was wrong, a third time.** The triage's H1 B
   citations (`tenant-preview: 32`, `brand-studio: 7` citing `:229,387,763`,
   `branding-preview-sandbox: 2` citing `:187`) undercount tenant-preview by
   10 (missed `buildPaletteSteps` array entries) and overcount
   branding-preview-sandbox and brand-studio by treating hardcoded-array
   lookups and BrandTheme-draft mutations as runtime paint. Net: triage said
   41, the real number is 37, but the *composition* is what matters — two of
   the three cited brand-studio line numbers are not B at all. A permanent
   ratchet exemption built from an unverified citation list would either
   permanently exempt sites that are actually migratable (branding-preview-
   sandbox's badges) or, worse, treat a business-logic mutation as an
   exemption target with no CSS home to migrate it to (brand-studio's form
   handlers).
2. **A genuinely new blind-spot class: contract-shaped state mutations.**
   brand-studio's `BrandThemeEditor` onChange handlers write into a draft
   `BrandTheme` object using the contract's own field names (`color`,
   `border`, `background`), which the mechanical counter cannot distinguish
   from real inline paint. This is not the interface-member blind spot
   (§7.5 of the triage) — it's a live value assignment, not a type
   annotation — and not B, since there's no rendered element at all. Any
   future component with an `onChange`-driven theme/config editor is likely
   to hit this same shape; worth teaching the lexer to recognize `emit((d) =>
   ...)`/draft-mutation callback bodies, or at minimum documenting the
   pattern so the next inventory doesn't re-derive it from scratch.
3. **Two file-manager paint mechanisms have no CSS source anywhere in this
   codebase** (§7): the `tr.active` selected-row highlight and (less
   severely, since it does have a live `foundation/tokens/css/` source) the `a.link`
   folder-name color. Both are reached through a bare DaisyUI class with zero
   inline contest — invisible to the WO-06 census as sites, but real paint a
   migration must not silently drop. The `tr.active` case is the more
   serious one: unlike Steps' pseudo-element connector (WO-SKIN-04, at least
   traceable to a named DaisyUI mechanism), this one may not resolve to
   anything at all, and nobody will know without checking the live cascade.
