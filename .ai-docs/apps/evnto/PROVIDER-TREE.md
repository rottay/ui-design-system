# Evnto Provider Tree

> Provider nesting from `app-evnto/src/providers/`.

## Root Export

File: `app-evnto/src/providers/index.tsx`

Exports:
- `Providers` (main wrapper)
- Re-exports from `./auth-context` (`AuthProvider`, `useAuth`, `usePermission`, `useRole`, `useTenantPlan`)
- Re-exports from `./breadcrumb-context` (`BreadcrumbProvider`, `useBreadcrumbContext`, `useBreadcrumbLabel`)

## Provider Hierarchy

```
Providers ({ children, tenantSlug })
  --> QueryClientProvider (queryClient: singleton on browser, fresh per SSR)
      --> SessionProvider (NextAuth)
          --> InnerProviders (reads session via useSession())
              --> AuthProvider (custom auth context with tenant plan info)
                  --> I18nProvider (locale from session via toSupportedLocale())
                      --> DesignSystemProvider (tenantSlug, tenantConfig, tenantOverrides, vertical="evnto", productProfile=EVNTO_PRODUCT_PROFILE, locale)
                          --> ToastProvider (position="bottom-right", duration=5000, max=5)
                              --> {children}
                              --> ConfirmProvider
                              --> Toast.Container
      --> ReactQueryDevtools (initialIsOpen=false)
```

**Note**: `BreadcrumbProvider` is NOT in the root Providers stack -- it is added separately in the dashboard layout.

## Key Details

### Tenant Resolution
- Function `resolveThemeTenant(slug)`: "rottay" or empty maps to "evnto" (Evnto is a Rottay company)
- Slug priority: server-provided `tenantSlug` prop -> `session.user.tenancy.tenant.slug`

### Tenant Branding (2-step)
1. **Instant**: Session-based config
2. **Async**: Full config from DB via `useTenantBranding({ tenantSlug, session, vertical: 'evnto' })`
- App-level overrides from `getEvntoTenantOverrides(tenantSlug)` (simpler than BitHire, no DB overlay)

### QueryClient Config
- `staleTime`: 60s (1 minute)
- `retry`: 1 for queries, 0 for mutations
- `refetchOnWindowFocus`: false

### Locale Resolution
- From session user's locale field (BCP-47 -> 2-letter code)
- Normalized via `toSupportedLocale()` from DS

## AuthProvider (auth-context)

File: `app-evnto/src/providers/auth-context/index.tsx` (107 lines)

Provides:
- `user: EvntoUser | null`
- `isLoading: boolean`
- `isAuthenticated: boolean`
- `tenantId: string | null`
- `tenantSlug: string | null`
- `tenantName: string | null`
- `tenantFeatures: string[]`
- `tenantPlan: TenantPlanInfo` (plan, limits, status, hasWhitelabeling)
- `hasPermission(permission: string): boolean`
- `hasRole(role: string): boolean`

Exported hooks:
- `useAuth()` -- full context
- `usePermission(permission)` -- single permission check
- `useRole(role)` -- single role check
- `useTenantPlan()` -- tenant plan, limits, status, whitelabeling info

### TenantPlanInfo
```typescript
interface TenantPlanInfo {
  plan: string | null;
  limits: Record<string, unknown>;
  status: string | null;
  hasWhitelabeling: boolean;
}
```

## BreadcrumbProvider (breadcrumb-context)

File: `app-evnto/src/providers/breadcrumb-context/index.tsx` (71 lines)

Provides dynamic breadcrumb label resolution for detail pages. When a detail page loads
(e.g., event detail), it can set a custom label for its URL segment instead of showing
the raw UUID.

Provides:
- `labels: { [path: string]: string }`
- `setLabel(path, label)`: Set a breadcrumb label
- `clearLabel(path)`: Remove a breadcrumb label

Exported hooks:
- `useBreadcrumbContext()` -- full context
- `useBreadcrumbLabel(path, label)` -- auto-set/clear label on mount/unmount

**Example usage**: A page at `/events/abc-123` calls `useBreadcrumbLabel('/events/abc-123', 'Summer Festival 2024')` to show the event name in breadcrumbs instead of the ID.

## Provider Files

| File | Lines | Purpose |
|------|-------|---------|
| `providers/index.tsx` | 139 | Root Providers wrapper + InnerProviders + QueryClient |
| `providers/auth-context/index.tsx` | 107 | AuthProvider + useAuth + usePermission + useRole + useTenantPlan |
| `providers/breadcrumb-context/index.tsx` | 71 | BreadcrumbProvider + useBreadcrumbLabel |
| `providers/__tests__/providers-boot.test.tsx` | Test file for provider initialization |
