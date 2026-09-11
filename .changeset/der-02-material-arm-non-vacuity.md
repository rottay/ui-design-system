---
"@rottay/design-system": patch
---

WO-DER-02 (audit 100, F6). The `state-material-arm` gate can no longer certify
an empty population, and every ungoverned channel it still tolerates is named
with the work order that closes it.

The gate pinned a stylesheet-corpus floor but no channel-population floor, and
computed `ratio` as 1 when the population was empty. The auditor's mutation —
keep all 349 stylesheets, rename every `--ds-` prefix to `--audit-` — therefore
passed with population 0, ratio 1 and zero failures. `populationFloor` now pins
the measured population (137), a population of zero is named as its own failure
independent of any baseline, and `ungovernedDispositions` is held to the tree in
both directions: an ungoverned channel with no disposition fails, and a
disposition naming a channel the tree no longer has fails. `measuredCorpus` is
re-pinned from a stale 348 to the measured 349, and every pinned number states
its own ratchet direction. The measured verdict of the current tree is
unchanged: 122/137 governed, 15 ungoverned, 349 stylesheets.

No published surface moves. The change is confined to
`packages/core/scripts/check/tokens/states/material-arm/`, which is an internal
measurement instrument and is not among the package's published `files`; the
bump exists because `contract-changeset` classifies everything under
`packages/core/` outside `docs/` as shipped bytes.
