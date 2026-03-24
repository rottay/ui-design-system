# Provider Architecture

> Auto-generated 2026-03-23. Documents the exact provider nesting for app-platform.

## Overview

app-platform has two distinct provider branches:
1. **Auth branch** - Minimal providers for unauthenticated pages (login, register, etc.)
2. **Dashboard branch** - Full provider stack for authenticated pages

Both branches share the root layout which provides only HTML structure (no providers).

---

## Root Layout (`app/layout.tsx`)

The root layout is a **server component** that provides:
- HTML structure with `lang="en"` and `data-tenant` attribute
- Inline script for early tenant/theme detection from localStorage
- Font preconnection (Inter + JetBrains Mono)
- No providers (children pass through directly)

```
<html data-tenant={tenant}>
  <head>
    <script> /* early tenant/theme detection from localStorage */ </script>
    <link> /* font preconnects */ </link>
  </head>
  <body>
    {children}  <!-- Auth or Dashboard branch -->
  </body>
</html>
```

---

## Auth Branch (`app/(auth)/layout.tsx`)

**Server component** that resolves tenant from headers.

### Provider Nesting (3 levels)

```
SessionProvider                       // next-auth/react SessionProvider
  TenantProvider                      // Tenant-aware theming
    DesignSystemProvider              // @rottay/design-system theming (engine, theme, locale)
      I18nProvider                    // Internationalization (locale: "es", fallback: "en")
        ToastProvider                 // Toast notifications (top-right, 5s, max 5)
          {children}                  // Auth pages (login, register, etc.)
          <ToastContainer />          // Toast render target
```

### Tenant Resolution
1. `X-Tenant-ID` header (from middleware/proxy)
2. `NEXT_PUBLIC_TENANT_SLUG` env var
3. Default: `'rottay'`

### What's Available to Auth Pages
- `useSession()` from next-auth/react
- DS components with tenant theming
- `useToast()` for notifications
- I18n translations
- No auth context, no permissions, no FocusMode

---

## Dashboard Branch (`app/(dashboard)/layout.tsx`)

**Server component** that performs authentication, session mapping, and whitelabel config loading.

### Server-Side Work (before providers)

1. Reads `X-Tenant-ID` header and env var for tenant resolution
2. Gets NextAuth session via `getSession()`
3. Redirects to `/login` if no session
4. Resolves tenant slug: header -> session -> default `'rottay'`
5. Loads whitelabel branding from DB (`whitelabelConfigs` table)
6. Builds `TenantConfig` object with branding colors, engine, locale

### Provider Nesting (6 levels)

```
DashboardProviders                    // Composite provider wrapper
  DesignSystemProvider                // @rottay/design-system theming
    |  tenantSlug={tenantSlug}        //   Tenant identifier for theme lookup
    |  tenantConfig={tenantConfig}    //   Pre-built config from whitelabel DB
    |  tenantOverrides={overrides}    //   Runtime overrides (whitelabel live preview)
    |  vertical="platform"            //   Product vertical
    |  productProfile="platform.admin" //  Product profile for feature resolution
    |  locale={locale}                //   From tenantConfig or fallback "es"
    |
    I18nProvider                      // Internationalization
      |  locale={locale}             //   Same as DS locale
      |  fallbackLocale="en"         //   English fallback
      |
      ToastProvider                   // Toast notifications
        |  position="top-right"
        |  duration={5000}
        |  max={5}
        |
        RootProvider                  // Auth + Permissions + Tenant context
          |  initialUser={enrichedUser}  // Session -> EnrichedUser conversion
          |  initialTenant={tenantInfo}  // Tenant id, slug, name, status
          |
          FocusModeProvider           // Focus/compact mode toggle
            |
            {children}               // Dashboard pages
          |
          <Toast.Container />         // Toast render target
```

### ImpersonationBanner + PasskeyPrompt + AppLayout

After DashboardProviders, the layout renders (not providers, but shell components):

```
<DashboardProviders ...>
  <ImpersonationBanner position="top" />   // Shows when impersonating
  <PasskeyPrompt />                        // Prompts passkey setup
  <AppLayout variant="platform">           // App shell (sidebar + topbar + content)
    {children}                             // Surface screens
  </AppLayout>
</DashboardProviders>
```

### Session -> EnrichedUser Conversion

The `sessionToEnrichedUser()` function maps NextAuth session to `EnrichedUser`:

| Session Field | EnrichedUser Field |
|---------------|-------------------|
| `user.id` | `id` |
| `user.email` | `email` |
| `user.name` | `name` |
| `user.tenancy.tenant.id` | `tenantId` |
| `user.companyId` | `companyId` |
| `user.permissions.roles` | `roles`, `effectiveRoles` |
| `user.permissions.permissions` | `permissions` |
| `user.permissions.isSuperAdmin` | `isSuperAdmin` |
| (derived) | `effectivePermissions` = isSuperAdmin ? `['*']` : permissions |
| (derived) | `bypassTenantRestrictions` = isSuperAdmin |
| (derived) | `bypassPlanLimits` = isSuperAdmin |
| (derived) | `hasAllFeatures` = isSuperAdmin |

### What's Available to Dashboard Pages

| Hook/Context | Source Provider | Purpose |
|-------------|----------------|---------|
| DS components | DesignSystemProvider | Themed UI components |
| `useAuth()` | RootProvider | User data, logout, isSuperAdmin |
| `usePermissions()` | RootProvider | hasPermission(), permissions array |
| `useTenant()` | RootProvider | Tenant id, slug, name, status |
| `useFeatures()` | RootProvider | Feature flag checks |
| `useToast()` | ToastProvider | Toast notifications |
| `useFocusMode()` | FocusModeProvider | Focus mode toggle |
| `useSurfacePermissions()` | Surface bridge | can(), canAny(), canAll() for Surface configs |
| `useSurfaceFocusMode()` | Surface bridge | compact boolean for Surface configs |

---

## Provider Source Files

| Provider | File Path |
|----------|-----------|
| Root Layout | `app-platform/src/app/layout.tsx` |
| Auth Layout | `app-platform/src/app/(auth)/layout.tsx` |
| Dashboard Layout | `app-platform/src/app/(dashboard)/layout.tsx` |
| DashboardProviders | `app-platform/src/components/providers/dashboard-providers/index.tsx` |
| TenantProvider | `app-platform/src/components/providers/tenant-provider/index.tsx` |
| SessionProvider | `app-platform/src/components/providers/session-provider/index.tsx` |
| FocusModeProvider | `app-platform/src/providers/focus-mode-context/index.tsx` |
| Surface Permissions Bridge | `app-platform/src/surfaces/_shared/permissions.ts` |
| Surface FocusMode Bridge | `app-platform/src/surfaces/_shared/focus-mode.ts` |

---

## Provider Comparison

| Feature | Auth Branch | Dashboard Branch |
|---------|-------------|-----------------|
| DS Theming | Yes | Yes (with whitelabel DB config) |
| I18n | Yes (es/en) | Yes (es/en, configurable via tenant) |
| Toasts | Yes | Yes |
| Auth Context | No (only next-auth useSession) | Yes (RootProvider with EnrichedUser) |
| Permissions | No | Yes (hasPermission, effectivePermissions) |
| Tenant Context | Via slug only | Full TenantInfo (id, slug, name, status) |
| Feature Flags | No | Yes (via RootProvider) |
| FocusMode | No | Yes (FocusModeProvider) |
| Surface Bridges | No | Yes (useSurfacePermissions, useSurfaceFocusMode) |
