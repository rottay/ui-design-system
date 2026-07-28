# `themes/default.css` — tenant-value audit

Rule 9 of the correction: *no Rottay colour becomes a global default*, and
`themes/default.css` must contain no tenant-specific value. This is the diff of every
literal in the file against the three authored `BrandTheme` palettes and the three
static extensions.

**Verdict: the rule is violated today, and not marginally.** `:root` is not a neutral
base — it is a tenant identity with a second, different identity layered on top of it,
and `html.dark` is a third identity that belongs to nobody.

## Shape of the file

| block | line | declarations |
|---|---:|---:|
| `:root` | 12 | 1430 |
| `:root[data-theme='dark'], html[data-theme='dark'], html.dark` | 2348 | 70 |

`:root` carries 644 colour literals (153 chromatic,
60 distinct chromatic values); the dark block carries
23 (16 chromatic).

## Finding 1 — `:root` is byte-identical to Rottay on 112 channels

The strongest possible test is same channel, same value: does `default.css` declare
`--ds-X` with exactly the value a tenant authored for `--ds-X`? It does, overwhelmingly
for one tenant.

| block | rottay | bithire | evnto |
|---|---:|---:|---:|
| `:root` decls | 128 | 3 | 11 |
| `:root` distinct channels | 112 | 3 | 11 |
| `html.dark` decls | 0 | 1 | 1 |
| `html.dark` distinct channels | 0 | 1 | 1 |

Of Rottay's 128 matches, **73 are against Rottay's DARK arm** and
55 against its light arm. bithire's 3 and evnto's 11 matches are
universal values (`transparent`, `9999px`, `#ffffff`) or the shared Tailwind neutral
ramp — nobody's identity. Rottay's are the product's actual canvas:

| channel | value in `default.css` `:root` | identical to | readers |
|---|---|---|---:|
| `--ds-color-text-muted` | `#96969E` | rottay dark arm | 5592 |
| `--ds-color-border-secondary` | `#252529` | rottay dark arm | 3163 |
| `--ds-color-bg-primary` | `#0A0A0C` | rottay dark arm | 2029 |
| `--ds-color-error` | `var(--ds-color-error-400)` | rottay dark arm | 1637 |
| `--ds-color-bg-secondary` | `#0F0F12` | rottay dark arm | 1488 |
| `--ds-color-border` | `#1C1C20` | rottay dark arm | 1407 |
| `--ds-color-border-subtle` | `#161619` | rottay dark arm | 934 |
| `--ds-color-bg-elevated` | `#18181C` | rottay dark arm | 689 |
| `--ds-color-info` | `var(--ds-color-info-400)` | rottay dark arm | 657 |
| `--ds-color-text-on-primary` | `#0C0C0E` | rottay dark arm | 255 |
| `--ds-color-border-primary` | `#1C1C20` | rottay dark arm | 198 |
| `--ds-radius-full` | `9999px` | rottay dark arm | 196 |
| `--ds-color-bg-tertiary` | `#141417` | rottay dark arm | 132 |
| `--ds-color-text-tertiary` | `#9A9AA2` | rottay dark arm | 100 |
| `--ds-shadow-xs` | `var(--ds-elevation-1)` | rottay dark arm | 62 |
| `--ds-color-bg-hover` | `#18181C` | rottay dark arm | 25 |
| `--ds-color-bg-input` | `#0F0F12` | rottay dark arm | 25 |
| `--ds-color-bg-canvas` | `#0A0A0C` | rottay dark arm | 20 |

`--ds-color-text-muted: #96969E` has **5,592 readers**. A Rottay grey is the default ink
of every product in the monorepo that does not overwrite it.

## Finding 2 — `:root` is two identities fighting inside one block

The Rottay surface ramp (`--ds-color-bg-*`: `#0A0A0C / #0F0F12 / #141417 / #18181C`) sits in
the same `:root` as a Vercel-white component layer:

* 108 background/surface channels with luminance > 0.7 (`--ds-card-bg: #ffffff`,
  `--ds-table-bg: #ffffff`, `--ds-button-default-bg: #ffffff`, `--ds-table-header-bg: #fafafa`, …)
* 12 ink channels with luminance < 0.35 sitting on top of them

So the base layer says "the canvas is near-black" and the component layer says "the card
is white". Any tenant is therefore forced to restate the component layer to be internally
coherent, which is exactly what the extensions do:

| tenant | distinct channels it restates that `:root` already declares |
|---|---:|
| rottay | 589 |
| bithire | 93 |
| evnto | 36 |

`81` channels with real readers are unprotected for a dark-default tenant today
(32 light surfaces, 49 dark inks), of which only 6 are covered by `html.dark`.
Worst by reader count:

| channel | `:root` value | readers |
|---|---|---:|
| `--ds-color-primary-500` | `#171717` | 287 |
| `--ds-card-bg` | `#ffffff` | 173 |
| `--ds-color-primary-600` | `#0a0a0a` | 78 |
| `--ds-input-bg` | `#ffffff` | 41 |
| `--ds-color-error-700` | `#b91c1c` | 39 |
| `--ds-color-black` | `#000000` | 37 |
| `--ds-color-primary-700` | `#000000` | 36 |
| `--ds-card-color` | `#171717` | 35 |
| `--ds-color-info-700` | `#1d4ed8` | 25 |
| `--ds-input-color` | `#171717` | 23 |
| `--ds-table-bg` | `#ffffff` | 23 |
| `--ds-card-title-color` | `#171717` | 22 |

## Finding 3 — the status palette is a fixed brand decision

153 chromatic literals over 60 distinct values. They are one specific
palette (Tailwind 500/700 status hues) repeated across component families:

| value | times in `:root` | example channels |
|---|---:|---|
| `#ef4444` | 25 | `--ds-color-error-500`, `--ds-button-error-bg`, `--ds-input-error-border` |
| `#f59e0b` | 18 | `--ds-color-warning-500`, `--ds-button-warning-bg`, `--ds-input-warning-border` |
| `#22c55e` | 14 | `--ds-color-success-500`, `--ds-button-success-bg`, `--ds-input-success-border` |
| `#3b82f6` | 5 | `--ds-color-info-500`, `--ds-button-info-bg`, `--ds-badge-info-bg` |
| `#bbf7d0` | 4 | `--ds-color-success-200`, `--ds-avatar-success-border`, `--ds-tag-success-border` |
| `#15803d` | 4 | `--ds-color-success-700`, `--ds-button-success-bg-active`, `--ds-avatar-success-color` |
| `#fde68a` | 4 | `--ds-color-warning-200`, `--ds-avatar-warning-border`, `--ds-tag-warning-border` |
| `#b45309` | 4 | `--ds-color-warning-700`, `--ds-button-warning-bg-active`, `--ds-avatar-warning-color` |

Semantic hue is tenant identity — a tenant whose brand red is not `#ef4444` inherits
`#ef4444` everywhere it has not restated it. These belong to the palette contract, not to
a global default.

## Finding 4 — `html.dark` is a third identity, and it is legacy

The block is `:root[data-theme='dark'], html[data-theme='dark'], html.dark`,
70 declarations. Its palette is Tailwind slate-navy — `#020617`, `#0b1220`, `#111827`,
`#1f2937`, `#334155`, `#475569`, `#64748b`, plus `--ds-color-bg-tertiary: #172033` and
`--ds-color-surface: #101826`. **No tenant authors any of it.** Same-channel-same-value against
the three tenants finds 2 matches in total, all universal values.

It is a second system in the precise sense the correction forbids: it activates on a mode
class rather than on tenant identity, and it wins wherever the tenant has not explicitly
claimed the channel in its own dark arm.

| tenant | dark-default? | channels protected by the tenant dark arm | order-dependent (tenant base arm only, equal specificity) | inherits slate-navy |
|---|---|---:|---:|---:|
| rottay | yes | 54 | 10 | 5 |
| bithire | no | 28 | 5 | 36 |
| evnto | no | 15 | 1 | 53 |

The specificity arithmetic behind the middle column: the tenant dark arm is
`:is(html[data-tenant='X'], …)[data-theme='dark']` = (0,2,1) and beats `html.dark` = (0,1,1).
The tenant BASE arm is `:is(html[data-tenant='X'], …)` — `:is()` takes the specificity of its
most specific argument, so it is also (0,1,1), a tie that stylesheet order decides.

When app-bithire toggles `.dark`, **36 of the 70 channels render Tailwind slate**, including
`--ds-color-surface`, `--ds-color-neutral-0`, `--ds-focus-ring-color`, `--ds-color-text-inverse`, and the whole
`--ds-menu-*` / `--ds-list-*` / `--ds-descriptions-*` / `--ds-anchor-*` dark families. For evnto it is
53 of 70. That is a navy that belongs to no brand appearing inside a tenant's dark mode.

5 of the 70 have zero readers anywhere:
`--ds-bg-primary`, `--ds-bg-secondary`, `--ds-card-border-default`, `--ds-input-placeholder`, `--ds-anchor-border-color`.

Rottay is not protected by being dark-default either: its dark arm is
`…:not([data-theme='light']):not(.light)`, which does not require `.dark` on the html element.
So for the 10 channels Rottay declares only in its base arm and the 5 it does not
declare at all, what renders depends on whether the host app happens to set `.dark`:

* base-arm only: `--ds-card-bg`, `--ds-input-bg`, `--ds-input-color`, `--ds-input-border`, `--ds-input-border-focus`, `--ds-modal-title-color`, `--ds-modal-body-color`, `--ds-modal-header-border`, `--ds-modal-footer-border`, `--ds-modal-close-color`
* not declared: `--ds-card-border-default`, `--ds-card-shadow-sm`, `--ds-card-shadow-md`, `--ds-elevation-lift-strength`, `--ds-input-placeholder`

## What has to change

1. `:root` keeps only values that are not identity: geometry, z-index, motion timing, the
   `0`/`transparent`/`inherit` degenerate cases, and structural definitions whose colour comes
   from a `var()` over a tenant channel. Every literal colour leaves.
2. The 112 channels that carry Rottay values move into the Rottay `BrandTheme`, where
   they already have a home. This is a move, not a deletion — the tenant keeps its look.
3. The white component layer (`--ds-card-bg` and its family) becomes a Modern derivation over
   `--ds-color-bg-*`, which is the owner-(b) work in `pc-reclassification.md`. That is what makes
   the layer stop having an identity of its own.
4. `html.dark` is deleted rather than extended. Its 70 declarations are either restated in a
   tenant palette (if any tenant actually wants them) or retired. No light/dark toggle ships at
   launch, so nothing regresses; keeping the block is what would regress, because it silently
   repaints a tenant the moment anything sets `.dark`.
5. The status hues become palette-contract fields. A tenant whose error is not `#ef4444` must be
   able to say so without an extension.

