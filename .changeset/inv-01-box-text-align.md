---
"@rottay/design-system": minor
---

WO-INV-01 L7, Box text alignment. `BoxProps.textAlign` stopped being an
unconstrained `CSSProperties['textAlign']` and became the logical vocabulary:
`start | center | end | justify`, with `left` and `right` retained as
documented, deprecated aliases of `start` / `end`.

The unconstrained type was the defect. A public layout API that accepts `left`
accepts a request the reading direction cannot honour: under `dir="rtl"` the
text pins to the physical left edge while every other logical property in the
same Box -- `paddingInlineStart`, `marginInlineEnd`, the skin's `inset-inline-*`
declarations -- mirrors, so one property in the box reads the page differently
from all the others. The union also admitted `match-parent`, `-moz-*` and
`-webkit-*` spellings that no engine ever lowered and no skin selects on.

The aliases are normalized ONCE, at the Modern engine's style boundary, by
`normalizeBoxTextAlign` over the `BOX_TEXT_ALIGN_ALIASES` table -- the same
shape `normalizeOverlayPlacement` uses for the retired physical placements, so
the package has one deprecation grammar rather than one per family. Anything
already logical is returned unchanged, so the call is idempotent.

What changes for a caller: `textAlign="left"` on a Modern Box now emits
`text-align: start`, which is identical under LTR and MIRRORS under RTL. That
is the point of the lot, and it is the only behavioural difference. The frozen
Classic and Rustic engines still assign the value through unchanged, so a
physical alias stays physical there; they are frozen by owner decision and the
retained aliases are what lets them build untouched. A caller that genuinely
wants a physical edge in both directions should pass the CSS itself through
`style`, which is a layout decision rather than an alignment one.

In-package call sites passing a physical alias: none. The single `textAlign=`
call site in `packages/core/src` passes `center`.

Evidence: `Box.text-align-logical.test.tsx` (unit, happy-dom: the alias table's
exact size, the idempotence of the normalizer, and the Modern engine emitting
`start` / `end` for the deprecated spellings while `center` and `justify` pass
through untouched).

ALSO IN THIS LOT, and behavioural: `AdaptiveOverlay` stopped taking a SECOND
direction. It resolved its physical drawer side from
`direction === 'rtl' || document.documentElement.dir === 'rtl'`, reading the
document in an effect because that read is unavailable during SSR. The document
is not an authority -- it is what the i18n provider WRITES -- so the overlay was
re-deriving the provider's own fact from paint, one commit after mount, with a
first paint that could name the opposite side. The document read is gone and the
side comes from `useOptionalDirection` alone. For the same direction the
placement is identical; what changes is a page that declares `dir="rtl"` on the
document and mounts NO `I18nProvider`: its side drawer now opens on the
physical right, because without a provider the authority answers `ltr`. Such a
page should mount the provider (or an RTL locale), which is what every other
direction-aware family in the package already requires.

```contract-diff
export .#BoxProps — changed; `textAlign` narrows to the logical `start`/`center`/`end`/`justify`, keeps `left`/`right` as deprecated aliases normalized to `start`/`end` by the Modern engine
```
