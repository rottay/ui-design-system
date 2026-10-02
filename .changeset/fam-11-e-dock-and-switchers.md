---
"@rottay/design-system": minor
---

WO-FAM-11 sub-lot E — the dock and the two switchers. Three family cuts, one
per family, each ending where its own namespace does.

`action-dock` owned a correct folder-derived namespace and had no producer for
it: thirteen `var(--ds-action-dock-*, LITERAL)` reads that always resolved to
the literal, so the channel looked customizable and was not.
`derivation/chrome/action-dock` publishes all thirteen at the value the skin
was already painting — measured byte for byte against the file, so the repair
moves no pixel and a tenant decision now has somewhere to land. The skin is
unchanged: its fallbacks stay, so a ground that predates the deriver paints
identically.

`scope-switcher` and `view-mode-switcher` had no `--ds-*` namespace at all, and
no test directory either. The first gets one: fifteen channels for the section
band, the scroll region and the count badge, each published at the value the
skin already resolved to, with the pill radius and the numeric weight moved off
`999px`/`700` and onto `--ds-radius-full` / `--ds-font-weight-bold`. The second
gets the measured empty set — the `header-surface` ruling reached from the other
direction: after its wrapper's second recessed frame was retired there is no
ground, frame, corner or state here for a channel to key to, and the certified
Segmented it composes owns every remaining surface. Its deriver produces
nothing, and a drift guard holds the skin to that.

Both switchers stop passing `data-part='switcher'` to the composed Segmented.
The prop named a part no rule anywhere consumed, and it overwrote the
primitive's own `data-part='root'` — the same substitution that once silently
deleted all 29 selectors and 97 declarations of `segmented.css`. The primitive
stamps its own anatomy again; nothing selects the retired name, in this package
or in any consuming app.

Both families gain their first coverage: radiogroup semantics, the single
roving tab stop, arrow movement that moves focus and mirrors under an RTL
locale, and — for the view-mode switcher — a disabled mode's reason carried in
its accessible name, which is the one thing the composition cannot delegate.

No behavior changes for consumers. No public export moved.

`rottay-action-dock` is NOT renamed — in this changeset. `app-bithire`
selects `.rottay-action-dock` and `.rottay-action-dock__actions` from
`src/ui/details/surface-shell/mobile-tray/styles.css`, so the rename was a
breaking change for a live consumer and stayed owed at authoring time. It
ships in the same release as this note: the major
`.changeset/fam-11-legacy-class-retirement.md` (WO-FAM-11, owner ruling 8)
retires the whole `rottay-action-dock*` / `rottay-app-shell*` vocabulary;
this line records the debt, that changeset collects it.
