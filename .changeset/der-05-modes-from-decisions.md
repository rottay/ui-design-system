---
"@rottay/design-system": minor
---

Modes are derived from the same decisions, and one reader answers "which mode
is this".

THE MODE BLOCK. A vertical's `modes.<mode>` object was merged ON TOP of the
already tenant-merged theme, so the baseline's hand-written overlay repainted
whatever the tenant had chosen — the non-default mode's delta was the
vertical's, in every vertical (F-05). It is a sanctioned override now and ranks
there: beneath the tenant, above the derivation. A tenant's MODE-AGNOSTIC
decisions — the brand and status seeds, the colours a document ingress already
calls "mode-agnostic brand identity" — cross into the other mode, and only the
tenant can narrow that by authoring the mode itself. A statement that
DESCRIBES a mode (a ground, an ink, a chrome surface) stays where it was
written: carrying a light card background into the dark block puts the dark ink
on a light surface, and the APCA floor refuses it. Measured on the bithire
digest fixture: the base block is unchanged at 65 channels and the dark delta
goes 41 → 34 — ten channels withdrawn because dark now inherits the tenant's
own value, ten chart series re-derived from the tenant's palette, three
cascade aliases added. The three first-party artifacts are byte-identical.

THE DEFAULT MODE. Thirteen independent light-by-default expressions answered
"which mode" across the ingress, the lowering, the artifact terminal, the SSR
projection and the studio. On rottay, the one first-party vertical whose
baseline is dark, every one of them was wrong in a different place: the
artifact declared `color-scheme: dark` while `mountTenantTheme` stamped
`data-theme="light"` (audit 100). `compilers/kernel/foundation/modes` is the
one reader now — it reads the roster first, and the roster holds the single
remaining literal. The mount stamps the mode the mounted bytes were compiled
for, and `resolveDocumentRootAttributes` falls back for `auto` to the mounted
vertical's own declared mode rather than to light.

`auto` EMITS ONE BLOCK, keyed on the mode the base rule is NOT. The emitter
hard-coded `dark`, so a dark-first vertical under `auto` got no media copy at
all; it reads the artifact's own shape now. A light-default artifact's bytes
are unchanged.

THE BASELINE IS COMPILED ONCE. Every tenant compile lowered the vertical's
~9K-line authored theme again to measure its delta against. It is cached by the
digest of the baseline's visual content and the adapter, and frozen before it
is shared.

```contract-diff
export .#ThemeProvenance — gains `authoredLeaves`, the subset of `authoredPaths` the patch states a value for
signature ./server#DocumentRootAttributesInput — `autoFallback` defaults to the mounted vertical's declared mode, not to light
```
