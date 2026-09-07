---
"@rottay/design-system": patch
---

Adds the two-track operating protocol to the consumer contract
(`docs/consumer-contract/protocol/index.md`): release discipline, the exact
version pin an application keeps, the upgrade checklist, and the single path by
which an application requests a capability the design system does not have yet.

Adds the `contract-changeset` check that enforces the first of those: a change
to a published signature or to the contract documents arrives with a changeset,
and a signature change declares what moved. No published signature, subpath or
export changes in this release.
