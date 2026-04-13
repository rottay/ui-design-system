# App-Platform Architecture Audit

Score: `6.7/10`

## What improved for real

### Tenant path is much healthier

The tenant read path is now a credible boundary:

- file-first for bundled tenants
- DB only when needed
- adapter into DS is clearer

Key files:

- `src/lib/tenancy/get-tenant-branding.ts`
- `src/lib/tenancy/branding-to-tenant-config.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(auth)/layout.tsx`

### Shell ownership is moving in the right direction

`AppLayout` is now meaningfully thinner and delegates geometry/structure to `AppShell`.

Key file:

- `src/components/_shared/layouts/app-layout/index.tsx`

## Main architectural gap

`app-platform` still does not behave like a pure DS consumer.

It behaves like:

- a DS-backed app at the boundary and shell structure
- but a parallel product UI layer in dashboard, workspace, and settings

## Top findings

### P1. Dashboard still acts like a second local design system

The dashboard remains highly app-owned in grammar and composition.

Evidence:

- `src/surfaces/dashboard/widgets/index.tsx` is `2214` lines
- `src/surfaces/dashboard/builder/styles.css` is `858` lines
- `src/surfaces/dashboard/builder/index.tsx` still defines local command/action wrappers

This means the DS is often being used as:

- `Box`
- `Flex`
- `Text`
- `Button`

while the actual dashboard language still lives locally.

### P1. Workspace still wraps DS patterns with local micro-DS chrome

The workspace is one of the best DS-consuming areas structurally, but still paints too much app-owned grammar around it.

Evidence:

- local `UtilityButton`
- local row-action pills
- raw injected `<style>` for table reskinning

Key file:

- `src/components/_shared/tables/entity-table-workspace/index.tsx`

### P1. Settings/admin is still hybrid

The basic styling path moved toward `appearance.general`, which is real progress.

But the live surface still keeps:

- legacy color fields
- legacy mirror writes
- a second advanced whitelabel editor that still behaves like a parallel DS editor

Key files:

- `src/surfaces/settings/overview.tsx`
- `src/surfaces/settings/whitelabel.tsx`

### P2. Visible shell styling is still too local

The shell structure moved to DS ownership, but the actual look of:

- sidebar separators
- footer chrome
- avatar ring treatment
- search/topbar rhythm

still lives too much in app code.

Key files:

- `src/components/_shared/layouts/app-layout/sidebar/index.tsx`
- `src/components/_shared/layouts/app-layout/topbar/index.tsx`
- `src/components/_shared/global-search/index.tsx`

### P2. Settings breadth remains too style-heavy

Several settings surfaces still feel like custom pages sitting inside `SettingsSurface`, rather than thin DS-backed consumers.

Evidence:

- `src/surfaces/settings/billing.tsx` is `664` lines
- similar pattern in `api-keys.tsx` and `webhooks.tsx`

## Conclusion

`app-platform` is now a credible DS-backed application.

It is not yet a premium-final DS consumer because too much visible grammar still lives in app code.

The next architectural move is not more plumbing.

It is moving recurring dashboard/workspace/settings language into DS-owned patterns and structures.

