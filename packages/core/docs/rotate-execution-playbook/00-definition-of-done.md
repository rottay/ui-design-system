# Definition Of Done

Rotate is only "done" when all of the following are true:

- it reads like a first-party product, not a themed admin template
- the shell is DS-owned in structure, spacing, and chrome
- dashboard and workspace screens have clear hierarchy, strong primary actions, and restrained composition
- the table/workspace path is keyboard-credible, readable, and operationally fast
- bundled first-party tenants are file-first without DB drift
- DB tenants use a bounded DS-first contract centered on `appearance.general`
- admin authoring uses the same contract the runtime uses
- visible flagship primitives are governed by their canonical DS token surfaces
- docs, tests, and guardrails fail when the contract and the rendered reality drift apart

## Anti-Goals

These should not be mistaken for success:

- adding more tokens without stronger visual authorship
- keeping shell logic in app code while only restyling primitives
- preserving legacy authoring just because it still works
- overusing gloss, grids, microcopy, and subtle contrast to simulate premium quality
- shipping more "customizable" fields that do not drive the rendered UI

## What "10/10" Means Here

- visual identity is deliberate, not noisy
- layout hierarchy is obvious in under 3 seconds
- operators can tell what matters now, what is secondary, and what action is primary
- a first-party vertical feels special without breaking system coherence
- a DB tenant can get a strong but bounded branded result without custom CSS
- the implementation is honest: one contract, one merge story, one visible result

