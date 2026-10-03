---
"@rottay/design-system": patch
---

An actionable Card wears the tenant's focus signature, and the Modern Card skin
is the only authority on its root paint.

Keyboard focus on a card painted a solid outline built from
`--ds-card-focus-ring-width`, `-color` and `-offset`: one contour under all
three `states.focus-style` signatures. It now states the signature first in the
card's `box-shadow` and composes it with the shadow the card already paints at
rest, hovered, pressed or selected. A `none` shadow would void the whole list,
so each composition sits behind a guard on its channel and the signature alone
paints otherwise.

| `states.focus-style` | before | after |
| --- | --- | --- |
| `ring` | 2px solid outline at 2px | the double ring, plus the card's own shadow |
| `underline` | 2px solid outline around the card | the 2px underline along the card's bottom edge |
| `glow` | 1px solid outline | the 1px ring and its halo |

Pointer focus shows no indicator, as before. Tab stop, role and state stamps
are unchanged. Forced colours keep the `Highlight` outline of the previous
release; a card that opts out with `forced-color-adjust: none` shows that
outline alone, not the signature beside it.

The four card focus hooks, after this release:

| hook | default before | default after | what an authored value does |
| --- | --- | --- | --- |
| `--ds-card-focus-ring` | `var(--ds-shadow-focus-ring)`, read by nothing that painted | `var(--ds-material-card-focus-ring, var(--ds-focus-ring))`, which rests on the signature | replaces the signature in the focused card's shadow |
| `--ds-card-focus-ring-color` | `var(--ds-focus-ring-color)` | `transparent` | paints a solid outline of that colour beside the signature |
| `--ds-card-focus-ring-width` | `var(--ds-focus-ring-width)` | unchanged | width of that outline; visible once a colour is authored |
| `--ds-card-focus-ring-offset` | `var(--ds-focus-ring-offset, 2px)` | unchanged | offset of that outline; visible once a colour is authored |

DECLARED DEFAULT-LOOK CHANGE (applications only). The personality layer
painted `box-shadow`, `transition` and, on `:hover`, `box-shadow`, `transform`
and `background-color` on every `[data-engine] .ds-card` from a cascade layer
that sits after the engine skins, so in an application every Modern card wore
`--ds-card-shadow` whatever its variant, and no shadow the skin stated could
paint, the focus signature included. Both rules now exclude
`.ds-card--modern`. The elevated card's resting shadow and the interactive
elevated card's hover shadow, lift and tint are the same values as before.
Everything else below is the skin's own statement replacing a shadow the
variant never asked for. Measured in Chromium on real cards, in the three
first-party verticals, at the document root and in a nested root; a document
without `data-engine` is unchanged, and after this release the two read the
same on 438 of 438 rest, hover and pressed readings.

| card | before | after |
| --- | --- | --- |
| elevated, at rest | `--ds-card-shadow` | the same shadow under the skin's inset top keyline |
| elevated and interactive, hovered | hover shadow, lift, hover tint | unchanged |
| outlined, filled, ghost, `shadowed={false}`, nested: at rest | `--ds-card-shadow` | none (each variant's own channel) |
| the same, hovered | the hover shadow | none; an interactive one keeps its lift and tint |
| outlined with `shadowed`, hovered | the hover shadow | its resting shadow |
| selected, at rest and hovered | `--ds-card-shadow`, then the hover shadow | no shadow; the selection border, inset outline and fill |
| toned and interactive, hovered | the hover tint over the tone | the tone |
| not interactive, hovered or pressed | hover shadow and hover tint | no reaction |
| pressed | the hover shadow | `--ds-card-shadow-active` |
| disabled | `--ds-card-shadow` | none |
| every card | transitions `box-shadow, transform, background-color` | the skin's list, with `border-color` and the keyline cross-fade |

A personality that states a card hover transform still moves an interactive
card: the skin now reads `--ds-card-hover-transform` before the family default.
A tenant's `--ds-card-shadow` and `--ds-card-shadow-hover` still paint the
elevated variant and a `shadowed` card; they no longer paint the other
variants. Classic and Rustic cards are untouched.

DataTable mobile card: residual closed. The two interim focus rules and their
forced-colours companions are removed; the card shows the Card's own
signature, one indicator, in an application too. An authored
`--ds-data-table-mobile-card-focus-ring` still paints, through
`--ds-card-focus-ring`. The card's resting collection shadow and its hover
shadow now reach the outlined Card through `--ds-card-bordered-shadow`, so they
read as before in an application and the hover shadow now also paints in a
document without `data-engine`. While the card holds keyboard focus the
signature replaces that shadow.

Selection and focus are now two different marks. The card material's selected
shadow, `--ds-material-card-shadow-selected`, rested on the focus ring, so a
selected card would have worn the focus signature at rest and keyboard focus
would have added nothing to it. Its default is now `none` (materials deriver
and the static default theme), and the Card skin no longer falls back to the
focus ring when the selected shadow is unset. A selected card is marked by its
selection border, its 1px inset outline in the same colour, its selected fill
and the state wash; keyboard focus adds the signature. Measured on real cards
in the three verticals, a selected card at rest against the same card focused:
the double ring, the underline or the ring and halo appear in every case, toned
cards included, where a toned selected card showed no focus change before.

| reader of the selected card shadow | before | after |
| --- | --- | --- |
| Modern Card, selected | the focus ring as a resting shadow (masked in an application) | none |
| SemanticSurface, card role, selected | the focus ring | none; border and fill mark the selection |
| `.ds-rich-card--selected`, `.ds-surface-card` and `.ds-surface-rail-card` when selected | the focus ring | none; border and fill mark the selection |

An authored `surfaces.materials.card.shadowSelected` or
`cardComponent.shadowSelected` still paints, and composes with the signature
under focus. An authored `surfaces.materials.card.focusRing` now paints on
the focused card; `cardComponent.focusRing` outranks it. The `states.focus-style`
catalog row no longer lists `--ds-material-card-shadow-selected` among the
channels it produces. No Classic or Rustic rule reads the channel.

Follow-up, not introduced here. In dark mode the selection mark of the
monochrome verticals is not perceivable: on evnto and rottay the selected
border and outline measure 1.04 to 1.11:1 against their surroundings, because
`--ds-material-card-border-selected` rests on a primary that stays near-black
in dark. Receiver: a states and selection packet with a dark-aware selection
seed.

Known limits. The composition guard reads the channel on the card's parent, so
a shadow channel set on the card element itself is not composed with the
signature. The Search result card states `--ds-card-shadow` in terms of itself;
it now shows the elevated shadow at rest where it showed none.

The root-alias table and the vertical bundles must be regenerated with this
release: until then a tenant scope restates the old alias texts.
