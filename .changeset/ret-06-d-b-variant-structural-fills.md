---
"@rottay/design-system": patch
---

WO-RET-06, disposition lot of the owner's dated disposition D-B (2026-10-07).
`variant` stays the canonical expression of the `secondary`/`gradient`
structural fills where the evidence demonstrates them. Six component variant
names stop being deprecations; they stay published with their exact types. No
engine, type, runtime or `tone`-wins precedence changes.

- The `@deprecated` tag is removed from `BadgeVariant`, `BadgeBaseProps.variant`,
  `TagVariant`, `TagProps.variant`, `AvatarVariant` and `AvatarProps.variant`.
- Their six rows leave the deprecation ledger, with the four Badge/Tag receipts
  and their six `notice` entries in the `release-3-0` codemod map. The 4.0
  removal those notices announced no longer applies.
- Measured scope: Badge `secondary`, Tag `secondary` (Modern skin rules plus the
  `prop-renamed/badge-variant-secondary` and `prop-renamed/tag-variant-secondary`
  parity fixtures and tests, which stay), Avatar `secondary` and `gradient`
  (Modern skin rules; no parity fixture). Badge and Tag still accept `gradient`
  in their types, but no Modern skin paints it and no test measures it: it is
  not claimed as a demonstrated fill.
- The kernel `Variant` stays deprecated with its ledger row, codemod entry and
  "leaves last" condition. Only its comment and the row's `reason` are corrected
  to say the six canonical names remain built on it; no signature of it changes,
  and its terminal disposition stays open with the owner.

Documented in `docs/consumer-contract/structural-variant-fills`.

```contract-diff
signature .#BadgeVariant — loses the `@deprecated` tag (D-B); type unchanged
signature .#BadgeProps — `variant` (from `BadgeBaseProps`) loses the `@deprecated` tag (D-B); type unchanged
signature .#TagVariant — loses the `@deprecated` tag (D-B); type unchanged
signature .#TagProps — `variant` loses the `@deprecated` tag (D-B); type unchanged
signature .#AvatarVariant — loses the `@deprecated` tag (D-B); type unchanged
signature .#AvatarProps — `variant` loses the `@deprecated` tag (D-B); type unchanged
```
