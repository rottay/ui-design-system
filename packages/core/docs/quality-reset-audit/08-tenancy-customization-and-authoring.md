# Tenancy, Customization, and Authoring

## Score

- architecture direction: `5.8/10`
- bundled first-party path: `8/10`
- DB tenant path in product reality: `4/10`

## Truth

The tenant model is not broken.
It is unfinished and split across two stories.

## Strong Story

- bundled tenants
- file-first
- `brandTheme`
- DS-owned identity

## Weak Story

- runtime DB tenants
- partial `appearance.general`
- legacy branding blobs
- app-owned authoring UI

## Evidence

- `ui-design-system/packages/core/docs/TENANT_MODEL.md`
- `ui-design-system/packages/core/src/contracts/themes/index.ts`
- `ui-design-system/packages/core/src/runtime/bootstrap/DesignSystemProvider.tsx`
- `app-platform/src/lib/tenancy/branding-to-tenant-config.ts`
- `app-platform/src/surfaces/settings/overview.tsx`
- `app-platform/src/components/providers/dashboard-providers/index.tsx`
- `app-platform/src/components/providers/tenant-provider/index.tsx`

## Main Gaps

1. `app-platform` still writes legacy branding-first settings.
2. The adapter only maps a narrow slice of `appearance.general`.
3. The host still hardcodes important identity decisions.
4. Runtime tenants cannot yet reach a truly authored product feel.

## Strategic Conclusion

If Rotate should feel exceptional, the dominant visual identity path must be:

- clearer
- richer
- more singular
- less split between DS truth and app truth
