# GuidedDraftForm takes the ledger doctrine (WO-FAM-10, arm 2)

Lot opened on `13950abeb`. HEAD did not move during the packet, but the working
tree carries a foreign FAM-09 writer's work — `widget-board`, three
`visualization/charts` families and their tests, `.changeset/fam-09-*`,
`packages/core/.wbprobe/` — plus `roadmap/STATUS.md` and `roadmap/registry.json`.
**None of that is mine**; read the diff as a subset.

Captures of `GuidedDraftFormSurface` in scroll mode: three sections (one
complete and active, one with errors, one plain), two fields each.

- `before-*` — rendered from `13950abeb`.
- `after-*` — rendered from the lot tree.

Scopes: `bithire light` and `rottay dark`, each at a 1280px desktop box and a
360px box. Both phases used the same harness: the compiled first-party CSS for
the vertical plus the surface's server markup, parsed as a real document so
React's streamed Suspense chunks reattach.

The 360px arm renders the PHONE REQUEST. A static capture runs no React, so the
container posture is never measured; the container-driven flip is proven by the
`*.adapt.test.tsx` suites, which measure a real box.

---

## The repair

`components/surfaces/presentation/pages/forms/guided-draft-form/index.tsx` —
the scroll-mode section stops being a `Card`:

```
-  <Card className={…} variant={cardVariant} id={`section-${key}`}>
-    <Card.Body><Stack spacing="sm">
-      <Box data-part="section-card-header">…</Box>
-      {section.render()}
-    </Stack></Card.Body>
-  </Card>
+  <InlineEditor className={…} headerless title={section.title} id={`section-${key}`}>
+    <Box data-part="section-card-header">…</Box>
+    <InlineEditGrid kind="primary" columns={EDIT_FIELDS_SINGLE_TRACK}>
+      {section.render()}
+    </InlineEditGrid>
+  </InlineEditor>
```

`skin/guided-draft-form/index.css` — the locus follows it off the card:

```
-.…__section-card--active { --ds-card-bordered-border-color: color-mix(…primary 26%…); }
-.…__section-card--errors { --ds-card-bordered-border-color: var(--ds-color-error); }
+.…__section-card          { position: relative; padding-inline-start: var(--ds-spacing-3); }
+.…__section-card--active::before { background: var(--ds-color-link, var(--ds-color-primary)); }
+.…__section-card--errors::before { background: var(--ds-color-error); }
```

## Verdict

- **No card-stack chrome.** Each section is an `edit-fields` ledger block —
  heading, state chip, description, one hairline seam, then the fields. The
  rounded, elevated per-section frames in every `before-*` capture are gone.
- **Hierarchy intact.** h2 section titles, supporting description, small bold
  field labels, full-width controls on the ledger grid.
- **Labels legible** in both verticals and both modes.
- **The locus survives the move.** Measured through the productive door, on
  the `::before` rail, at both widths:

  | scope | active | errors | plain |
  | --- | --- | --- | --- |
  | bithire light | `rgb(47,91,232)` 2px | `rgb(198,40,40)` 2px | no rail |
  | rottay dark | `rgb(163,163,163)` 2px | `rgb(248,113,113)` 2px | no rail |

  The cue is the PRESENCE of a rail, not a hue to compare: every section
  reserves the gutter (`padding-inline-start` equal on all three, pinned by
  `GuidedDraftForm.locus.integration.test.tsx`), so the ledger rhythm does not
  shift and an unmarked section is unmistakably unmarked. The errored section
  additionally carries its `Has errors` chip (semantic icon + copy).

## Why a pseudo-element and not a border

A layered `border-*` in this file cannot paint at all: preflight zeroes
`border-width` from outside every `rottay-*` layer, which is exactly why the
`edit-fields` skin is deliberately unlayered. A frame is also the card this
family just retired. `inset-inline-start` keeps the rail on the reading edge
under RTL, which `box-shadow: inset` could not.

## Why the link channel for the active rail

`--ds-color-primary` is a brand statement and is mode-blind: it resolves to
`#171717` in rottay dark, on a `#0b1220` ground — the first cut of this rail
was invisible there (measured). `--ds-color-link` is the primary-family ink
derived against the ground it is painted on, the same reason the typography
skin paints a link with it: `#2F5BE8` bithire, `#a3a3a3` rottay dark.

## Entrypoint reach: adopting a family costs nothing

The first cut of arm 1 aggregated the two new family contracts into the
adaptation kernel's `composition/families` barrel, beside `data-table` and
`form`. Every public entrypoint that reaches the kernel reaches that barrel, so
`./patterns/widget-board` went 38 -> 40 reachable modules (budget 38) and
`./structures/app-shell` 78 -> 80 (budget 78). The cost is PER ADOPTED FAMILY,
so the budgets would have ratcheted up once per future adoption.

No budget was amended. The composition was wrong, and the repo already had the
right pattern: `families/overlay` (WO-FAM-04) is deliberately NOT in the barrel
— modal, drawer and sheet take `Adapt` from the kernel and `OverlayAdaptation`
from `composition/families/overlay`. `edit-fields` and `form-surface` now follow
it, and so do their five consumers.

Measuring further found the larger half: `registry` was in the barrel too, and
**no runtime module imports it** — the `adapt-slot` gate reads
`LAYOUT_SENSITIVE_FAMILIES` from source with the TypeScript AST. Every
entrypoint reaching the kernel was carrying a roster with no consumer, and
carrying one more row of it per adoption. It left the barrel as well.

| entrypoint | HEAD | first cut | now | budget |
| --- | --- | --- | --- | --- |
| `./patterns/widget-board` reachable | 38 | 40 (FAIL) | **37** | 38 |
| `./structures/app-shell` reachable | 78 | 80 (FAIL) | **77** | 78 |
| `./structures/app-shell` bytes | — | 285254 (FAIL) | **282507** | 283584 |

Both entrypoints now sit BELOW their HEAD numbers, and a future family adoption
adds zero modules and zero bytes to any entrypoint that does not consume it.
`data-table` and `form` predate the law and are still aggregated; migrating
their consumers to the direct subpath is owed to those families, and is the
only remaining per-family cost in the barrel.

---

## Known, named, not introduced by this lot

- `before-bithire-light-desktop` / `before-rottay-dark-desktop`: the section
  cards collapse to a 2px hairline. `[data-part='content-body']` never claimed
  its track in the sidebar composition, so the column was shrink-to-fit. The
  lot gives that node `flex={1}`, which is why the `after-*` desktop captures
  show a full-width column.
- `after-rottay-dark-*`: the ACTIVE section-nav label is near-invisible
  (`#171717` on `#0c121f`, 1.04:1) — the same mode-blind `--ds-color-primary`.
  Pre-existing, already pinned in the family's axe debt for `rottay dark`.
- `section-card-description` fails contrast at 2.49:1 (evnto) / 2.6:1
  (bithire). In those verticals EVERY supporting role — `secondary`,
  `tertiary`, `muted`, `subtle` — resolves into the #96–#a0 band, so no ink a
  surface can choose clears 4.5:1; five sibling nodes in this family were
  already pinned on that one token. The card ground had been hiding the node
  from axe, not making it legible. Owed to tokens/derivation.
- The section state chip sits flush with the field column's trailing edge
  (`margin-inline-start: auto`, untouched by this lot). Measured flush, not
  clipped: `chipRight − sectionRight = 0` at 360px.
