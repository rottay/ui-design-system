---
"@rottay/design-system": minor
---

WO-FAM-11 (owner resolution R1). The app-shell family's chrome channels move
to their owning namespace: the deriver now produces `--ds-app-shell-*` (51
channels; the five `SHELL_PUBLISHED_CHANNELS` names stay — they are the shell
group's declared cross-owner band, co-produced by `chrome-variables`). Values
are byte-identical; only names moved.

Superseded window: skins read `var(--ds-shell-X, var(--ds-app-shell-X, …))`,
so a consumer scope still writing the old name keeps working (the old name is
a read arm, never a second emission). The window has an executable end
trigger: when the rostered consumers author zero old names, the drill turns
red with the closure instruction; an absent consumer repo reports ABSENT and
keeps the window open. Apps on pinned DS versions need no change today; their
migration lands at their next DS upgrade, then the window closes.
