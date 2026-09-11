---
"@rottay/design-system": patch
---

`palette.seeds` brands the mode the tenant renders, with an ink derived from the
tenant's own primary.

ROUTING. `ingress/foundation/document-patch` read an absent
`appearance.general.palette.backgroundMode` as `"light"`, which equated light
with the body. On rottay, the one first-party vertical whose default mode is
dark, every seed landed in `modes.light` and the canvas the tenant actually
paints was untouched: measured through `compileTenantThemeDocumentV2`, a
seeds-only document moved 0 channels in rottay's rendered mode and 22 in the
mode it does not render. The top-level seeds now tune the mode the document
SELECTS — the vertical's own default when it selects none — so the same document
moves 23 channels in rottay's dark block. An explicit `light`, `dark` or `auto`
selection keeps its previous destination on every vertical, and `palette.dark`
still refines the dark mode under `auto`.

INK. `--ds-color-text-on-primary` gains a derived floor under the authored
value, so a block paints an ink measured against the primary IT renders instead
of inheriting the one its vertical tuned for a colour the tenant replaced. That
inheritance is what made `palette.dark-mode: 'dark'` refuse at APCA Lc 17.6 on
rottay and Lc 17.1 on evnto for seeds both admit in light. The ink is chosen by
APCA, the floor `TEXT_CONTRAST_PAIRINGS` grades it against, while
`--ds-color-primary-foreground` keeps the WCAG choice the axe gates grade: on a
mid-tone seed the two metrics genuinely disagree, and optimizing the metric that
does not gate a channel is how a derivation ships a pair its own admission then
refuses. A seed no ink can sit on is still refused.

No published declaration changes shape. The three first-party compiles are
byte-identical in every value and key; only the emission ORDER of
`--ds-color-text-on-primary` moves, because the channel is now first declared by
the interaction floor rather than by the extended-palette writer that overwrites
it. The shipped facade artifacts emit sorted and are unchanged.
