---
"@rottay/design-system": minor
---

WO-FAM-11 (owner resolution R1). App-shell and action-dock now dual-stamp the
canonical class beside the superseded one (`class="ds-app-shell
rottay-app-shell"`, pure addition). The skins read the canonical class with
the superseded class in the same `:is()` — 69 selector pairs measured
specificity-equal, so paint is unchanged on both spellings. Apps on pinned
versions (which emit no canonical class) keep working untouched; their
migration lands at their next DS upgrade, and the superseded emission retires
when the executable roster (the four measured consumer files) reads zero old
selectors — the drill turns red with the closure instruction, and an absent
consumer repo reports ABSENT and keeps the window open.
