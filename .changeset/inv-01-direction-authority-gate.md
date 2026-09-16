---
"@rottay/design-system": patch
---

WO-INV-01 gates: `direction-authority`, the executable half of the one-direction
law, with the three anchor/portal readers as named exceptions.

The sweep that migrated twelve probes accepted itself with
`grep "closest('[dir]')" src/components` reading zero. That criterion is
spelling-bound, and the tree answers it in four spellings — bare, double-quoted,
generic (`closest<HTMLElement>(`) and optional (`closest?.(`) — plus a fifth
shape that never calls `closest` at all, `getComputedStyle(x).direction`. The
grep saw one of them, so it went green with sixteen probes still live. A gate
keyed to that same string would inherit the same blindness, so this one keys on
the `[dir]` SELECTOR LITERAL in any call spelling and on the computed-style read.

Two classes, measured apart. **Named exceptions**: `portal-scope`, `tooltip` and
`popover` read their ANCHOR's declared ancestry — `dir` and `lang` and the DS
scope attributes together, kept live by a MutationObserver — so a portal
rendered outside that subtree can reproduce it. That is a different question
from "what is the app locale", and each is declared by path with the reason,
which the drill checks is a real one. **Pinned debt**: the remaining 21 probes
across 10 files, as a count per file rather than a line list, so an edit above a
probe moves nothing the law cares about. Growth fails, an unpinned file fails as
a new owner, and a shrink fails with an instruction to lower the pin.

The drill plants each of the five spellings into a sandbox mirror and asserts
the gate turns red, with a control proving the mirror reproduces the real
measurement first. Its teeth were then verified against the instrument itself:
narrowing the matcher back to the original naive regex turns the drill red on
exactly the three spellings that defeated the real censuses, and restoring it
returns the file byte-identical and the drill to green.
