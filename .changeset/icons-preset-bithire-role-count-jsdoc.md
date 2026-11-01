---
"@rottay/design-system": patch
---

Correct the role count in the `@rottay/design-system/icons/presets/bithire` module JSDoc: it said 263, and the complete registry now holds the 282 roles of the governed corpus. No type, export or behaviour changes.

```contract-diff
signature ./icons/presets/bithire#BitHireIconPreset — documentation only: the module JSDoc states the current 282-role count of the complete registry instead of 263; types, exports and behaviour unchanged
```
