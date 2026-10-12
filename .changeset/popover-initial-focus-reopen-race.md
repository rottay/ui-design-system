---
"@rottay/design-system": patch
---

Popover (Modern engine): a re-open that commits in the same batch as the close's
unmount no longer loses the initial-focus pass. The one-shot focus guard is no
longer spent on a surface that is already out of the document; focus lands on
the first control as documented. No API, prop or default changes. Two
deterministic regression tests (trigger mode and anchored mode) cover the race.
