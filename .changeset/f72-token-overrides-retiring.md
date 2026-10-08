---
"@rottay/design-system": minor
---

WO-EVI-02 F-72, Stage A of owner ruling R32 Q2. The raw `tokenOverrides`
escape is now `retiring`, not retired: nothing narrows and every stored row
reads as before.

- The tenant capability registry's status vocabulary gains `retiring`. A
  retiring capability is live: it stays in `TENANT_PRO_MANIFEST` and in
  `ActiveTenantCapabilityId`, and it is read exactly as an active one.
  `token-overrides` moves to it.
- A v1 document carrying `visualFoundation.advanced.tokenOverrides` is still
  admitted and lowered as before. Each admitted entry now carries a named
  `TenantThemeDeprecationNotice`, both on the door's admission report and on
  the compiled `TenantThemeArtifact.deprecations`. The notice names the
  entry's path, the ruling and the migration document. It sits outside the
  digest, so every artifact keeps its digest, CSS and variables byte for byte.
- v2 and v3 decision documents still refuse the decision by name and carry no
  notice.

The migration of stored rows is documented in
`docs/reference/contracts/token-overrides-migration`. It is not executed:
eleven of the 292 raw tokens have a canonical home, and the other 281 need a
ruled resolution before the retirement can refuse them.

```contract-diff
signature .#CapabilityStatus — widens with `'retiring'`: live, admitted and consumed like `'active'`, its retirement ruled (same target on `./server` where re-exported)
signature .#TenantThemeArtifact — adds the optional `deprecations` field, outside the digest
signature ./server#compileTenantThemeConfig — a v1 document carrying `advanced.tokenOverrides` compiles as before and the artifact carries one `deprecations` notice per admitted entry
export ./server#TenantThemeDeprecationNotice — added: the named notice for an admitted entry of a retiring capability
export .#TenantThemeDeprecationNotice — added (the same type, from the root contracts barrel)
export .#TenantThemeRetiringCapability — added: the capability ids a notice can name
signature .#TENANT_CAPABILITY_REGISTRY — the `token-overrides` row's `status` reads `'retiring'` (was `'active'`) and its `compat` names the ruling and the migration document; every other row is unchanged
signature .#ActiveTenantCapabilityId — now extracts the LIVE statuses (`'active' | 'retiring'`); the id set is unchanged, `token-overrides` included
signature .#TENANT_STANDARD_MANIFEST — filters on the live statuses instead of `'active'`; its members are unchanged
signature .#TENANT_PRO_MANIFEST — filters on the live statuses instead of `'active'`; its members are unchanged, `token-overrides` included
signature .#TENANT_INTERNAL_MANIFEST — filters on the live statuses instead of `'active'`; its members are unchanged
signature .#TenantThemeArtifactAssembly — adds the optional `deprecations` input, carried onto the artifact outside the digest
signature .#DocumentAdmission — adds `deprecations`: one notice per admitted entry of a retiring capability on v1, always empty on v2/v3
```
