# BitHire Provider Tree

> Auto-generated: 2026-03-23
> Source: `app-bithire/src/providers/index.tsx`

## Overview

The provider tree is the exact nesting order of React context providers
that wrap the entire BitHire application. The root `<Providers>` component
is consumed by the dashboard layout.

---

## Provider Nesting (Outermost to Innermost)

```
QueryClientProvider          [react-query]
  |
  +-- SessionProvider        [next-auth]
        |
        +-- InnerProviders   (reads session to resolve tenant)
              |
              +-- AuthProvider         [app-owned: auth context]
              |     |
              |     +-- FocusModeProvider   [app-owned: UI focus mode]
              |           |
              |           +-- I18nProvider       [DS: locale/i18n]
              |                 |
              |                 +-- DesignSystemProvider  [DS: theming engine]
              |                       |
              |                       +-- ToastProvider     [DS: toast notifications]
              |                             |
              |                             +-- {children}
              |                             +-- ConfirmProvider  [app-owned: confirm dialogs]
              |                             +-- Toast.Container  [DS: toast renderer]
```

Additional providers exist per-layout:
- `BreadcrumbProvider` -- mounted in the dashboard layout, NOT in the root provider

---

## Provider Details

### 1. QueryClientProvider (outermost)

- **Source**: `@tanstack/react-query`
- **Singleton**: Browser reuses one instance; server creates fresh per request
- **Config**: `staleTime: 60s`, `retry: 1` queries / `0` mutations, `refetchOnWindowFocus: false`
- **Dev tools**: `ReactQueryDevtools` mounted as sibling (outside InnerProviders)

### 2. SessionProvider

- **Source**: `next-auth/react`
- **Purpose**: Makes `useSession()` available throughout the tree
- **Session type**: `BitHireSession` (extends NextAuth Session with tenant/permissions)

### 3. AuthProvider (app-owned)

- **Source**: `@/providers/auth-provider`
- **Context**: `AuthContextValue`
- **Exports hooks**: `useAuth()`, `usePermission(permission)`, `useRole(role)`
- **Also exports**: `useTenant()` -- tenant features, quotas, usage

Key fields:
| Field | Type | Description |
|-------|------|-------------|
| `user` | `BitHireUser | null` | Current user with permissions |
| `isAuthenticated` | `boolean` | Auth status |
| `tenantId` | `string | null` | Current tenant ID |
| `tenantSlug` | `string | null` | Current tenant slug |
| `hasPermission(p)` | `(string) => boolean` | RBAC check (super-admin has wildcard) |
| `hasRole(r)` | `(string) => boolean` | Role membership check |

`useTenant()` fields:
| Field | Type | Description |
|-------|------|-------------|
| `id`, `slug`, `name` | string | Tenant identity |
| `plan`, `planName` | string | Subscription tier |
| `features` | string[] | Enabled feature flags |
| `quotas` | TenantQuotas | Quota limits |
| `usage` | TenantUsage | Current usage snapshot |
| `hasFeature(key)` | function | Wildcard-aware feature check |
| `isWithinLimit(key)` | function | Quota enforcement |
| `getRemaining(key)` | function | Remaining quota |

### 4. FocusModeProvider (app-owned)

- **Source**: `@/providers/focus-mode-provider`
- **Context**: `FocusModeContextType`
- **Purpose**: Toggles a "focus mode" that hides non-essential UI chrome
- **Exports hook**: `useFocusMode()` -- `{ isFocusMode, toggleFocusMode, setFocusMode }`
- **Consumer**: `FocusHideable` component in `_shared/ui/`

### 5. I18nProvider (DS-owned)

- **Source**: `@rottay/design-system`
- **Purpose**: Sets the active locale for DS components
- **Locale resolution**: `toSupportedLocale(session.user.locale)`
- Flows into all DS components that render locale-sensitive text

### 6. DesignSystemProvider (DS-owned)

- **Source**: `@rottay/design-system`
- **Purpose**: Central theming engine -- CSS custom property injection
- **Props**:

| Prop | Value | Description |
|------|-------|-------------|
| `tenantSlug` | Resolved slug ("bithire" default) | Drives CSS tenant token file |
| `tenantConfig` | From `useTenantBranding()` | DB-stored branding (logo, colors) |
| `tenantOverrides` | App defaults + DB overrides merged | Token overrides (density, radii, shadows) |
| `vertical` | `"bithire"` | Product vertical identifier |
| `productProfile` | `"recruiting.operator"` | DS profile (compact density, tight radii) |
| `locale` | Resolved locale | Passed through to DS internals |

**Tenant resolution flow**:
1. Server layout resolves tenant slug from header
2. `resolveThemeTenant()` maps "rottay" -> "bithire"
3. `useTenantBranding()` fetches DB config for the slug
4. `getBithireTenantOverrides()` provides app-level structural defaults
5. DB `tokenOverrides` are merged on top (DB wins)

### 7. ToastProvider (DS-owned)

- **Source**: `@rottay/design-system`
- **Position**: `bottom-right`
- **Duration**: 5000ms
- **Max visible**: 5
- **Renderer**: `<Toast.Container />` mounted inside

### 8. ConfirmProvider (app-owned)

- **Source**: `@/components/_shared/feedback/confirm-provider`
- **Purpose**: Global confirmation dialog (shared across all surfaces)
- **Must be inside**: DesignSystemProvider (uses DS modal/button)

### 9. BreadcrumbProvider (dashboard layout, not root)

- **Source**: `@/providers/breadcrumb-provider`
- **Purpose**: Dynamic breadcrumb label resolution for `[id]` routes
- **Exports hooks**: `useBreadcrumbContext()`, `useBreadcrumbLabel(path, label)`
- **Pattern**: Detail pages call `useBreadcrumbLabel('/candidates/abc-123', 'John Doe')` to replace UUID with display name
- **Cleanup**: Label is automatically cleared on component unmount

---

## Context Files Summary

| File | Type | Provider/Hook |
|------|------|---------------|
| `providers/index.tsx` | Root | `<Providers>` (all above) |
| `providers/auth-provider/index.tsx` | Provider + hooks | `AuthProvider`, `useAuth()`, `usePermission()`, `useRole()`, `useTenant()` |
| `providers/auth-context/index.tsx` | Re-export | Re-exports from auth-provider |
| `providers/focus-mode-provider/index.tsx` | Provider + hook | `FocusModeProvider`, `useFocusMode()` |
| `providers/focus-mode-context/index.tsx` | Re-export | Re-exports from focus-mode-provider |
| `providers/breadcrumb-provider/index.tsx` | Provider + hooks | `BreadcrumbProvider`, `useBreadcrumbContext()`, `useBreadcrumbLabel()` |
