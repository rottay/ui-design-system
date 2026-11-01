---
"@rottay/design-system": patch
---

Align the consumer-contract protocol with the changeset classification of repository tooling. `packages/core/scripts/**` outside the build producers is exempt, like the documentation outside the consumer contract, because neither is in the package's `files`. A build producer stays `library` because it writes `dist/`, so it owes a changeset unless a parser proves the edit inert. This changes no published byte and no public surface: no subpath, export, type or behaviour moves, and consumers need no change.
