---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-C + RET-01-D, the census-backed retirement wave). Dead public symbols retire after the consumer census measured zero consumers across the package, the showroom and the three apps: the `useTenantBranding` transport (with its options/return/session types — the tenant facade's branding block), the `DEFAULT_TENANT_CONFIG` export (the value stays behind `getDefaultTenantConfig`), the four semantic-materials alias declarations, and the four dormant redeclared ScrollReveal timing fields. `createTenantConfig` was measured LIVE (the three tenant-preview engines and `useCreateTenant` import it) and stays.

```contract-diff
signature .#useTenantBranding — removed with its module (zero consumers measured; app-platform's same-named hook is a local symbol, verified) (RET-01-C)
signature .#UseTenantBrandingOptions — removed with useTenantBranding (RET-01-C)
signature .#UseTenantBrandingReturn — removed with useTenantBranding (RET-01-C)
signature .#TenantBrandingSession — removed with useTenantBranding (RET-01-C)
signature .#DEFAULT_TENANT_CONFIG — removed from the facade; the default value stays module-private behind getDefaultTenantConfig (RET-01-C)
signature .#SEMANTIC_MATERIAL_ROLES — the deprecated alias retires (zero consumers) (RET-01-D)
signature .#SemanticMaterialRole — the deprecated alias retires (RET-01-D)
signature .#SemanticMaterialRoleTokens — the deprecated alias retires (RET-01-D)
signature .#SemanticMaterialTokens — the deprecated alias retires (RET-01-D)
signature .#ScrollRevealProps — loses the four dormant redeclared timing fields (durationMs/delayMs/duration/delay); the runtime never destructured them (RET-01-D)
```
