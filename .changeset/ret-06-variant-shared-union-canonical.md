---
"@rottay/design-system": patch
---

WO-RET-06, owner ruling #3 (2026-10-08) on the kernel `Variant`. `Variant` is
supported as the shared variant contract of Badge, Tag and Avatar for as long
as `BadgeVariant`, `TagVariant` or `AvatarVariant` is built on it. It stays
published at the root with its seven literals unchanged; `Tone` remains the
recommended semantic-colour axis. No type, value, engine or runtime changes.

- The `@deprecated` tag is removed from `Variant`; the type line is unchanged.
- Its row leaves the deprecation ledger, with its `notice` entry in the
  `release-3-0` codemod map. The 4.0 removal recorded for `Variant` by
  `.changeset/ret-01-compat-rows-receiver-4-0.md` no longer applies.
- This supersedes the bullet of `.changeset/ret-06-d-b-variant-structural-fills.md`
  that leaves the terminal disposition of `Variant` open with the owner.
- The `prop-renamed/badge-variant-secondary` parity fixture and the Badge/Tag
  parity tests are unchanged.

Documented in `docs/consumer-contract/structural-variant-fills`.

```contract-diff
signature .#Variant — loses the @deprecated tag (owner ruling 2026-10-08 #3); the union is unchanged
```
