---
"@rottay/design-system": patch
---

WO-DER-06 (D6-2b). The first-party vertical roster and tenant-identity guard
move out of the authored theme barrel into their own owner,
`foundation/presets/verticals/roster`. A roster row now names a vertical --
identity, engine, policy envelope, font packs, default product profile, default
mode and the slug-derived paths -- and carries no visual theme; the three
authored themes and `FIRST_PARTY_THEMES` stay where they were until the theme
sources are retired.

Nothing published moves: `/server` keeps exporting `isFirstPartyVerticalId`,
re-exported from the new owner, and the root entrypoint's three theme exports
are unchanged. Consumers that read a roster row's `theme` resolve the theme by
slug at the point of compile instead.

```contract-diff
signature ./server#isFirstPartyVerticalId — unchanged guard over the same closed roster, now re-exported from foundation/presets/verticals/roster instead of the authored theme barrel; no consumer changes an import
```
