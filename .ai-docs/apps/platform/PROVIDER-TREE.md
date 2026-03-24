# Platform Provider Tree

> Auth and dashboard provider nesting from `app-platform/src/components/providers/`.

## Provider Exports

File: `app-platform/src/components/providers/index.ts`
```
export { DashboardProviders } from './dashboard-providers';
export { TenantProvider } from './tenant-provider';
export { I18nProvider } from './i18n-provider';
export { SessionProvider } from './session-provider';
```

---

## Provider Hierarchy

### Auth Pages (TenantProvider)

Used in `app/(auth)/layout.tsx` where full session context is not available.

```
TenantProvider (tenantSlug)
  --> DesignSystemProvider (tenantSlug, vertical="platform", productProfile="platform.admin")
      --> I18nProvider (locale="es", fallbackLocale="en")
          --> ToastProvider (position="top-right", duration=5000, max=5)
              --> {children}
              --> ToastContainer
```

- **Tenant resolution**: Known tenants (rottay, bithire) use built-in configs; unknown tenants can be fetched from API; falls back to "rottay" default.
- **I18n**: Spanish default, English fallback.

### Dashboard Pages (DashboardProviders)

Used in `app/(dashboard)/layout.tsx` for authenticated users.

```
DesignSystemProvider (tenantSlug, tenantConfig, tenantOverrides, vertical="platform", productProfile="platform.admin", locale)
  --> I18nProvider (locale from tenantConfig or "es", fallbackLocale="en")
      --> ToastProvider (position="top-right", duration=5000, max=5)
          --> RootProvider (initialUser: EnrichedUser, initialTenant: TenantInfo)
              --> FocusModeProvider
                  --> {children}
              --> Toast.Container
```

**Key details:**

1. **Session-to-EnrichedUser conversion** (`sessionToEnrichedUser`):
   - Reads `session.user.permissions.isSuperAdmin`, `.roles`, `.permissions`
   - Reads `session.user.tenancy.tenant.id` for tenantId
   - Super admin gets `effectivePermissions: ['*']` and bypass flags (`bypassTenantRestrictions`, `bypassPlanLimits`, `hasAllFeatures`)

2. **RootProvider** (from `@/platform/client`):
   - Provides auth, tenant, permissions, and features context
   - Consumed by `useSurfacePermissions()` in Surface configs

3. **FocusModeProvider** (from `@/providers/focus-mode-context`):
   - Provides focus mode state for Surface compact mode
   - Consumed by `useSurfaceFocusMode()` in Surface screens

4. **Locale resolution priority**: `tenantConfig?.locale` (from whitelabel DB) -> fallback `"es"`

5. **Whitelabel support**: `tenantConfig` and `tenantOverrides` props enable live preview on the whitelabel settings page.

### Session-Only (SessionProvider)

Thin wrapper around `next-auth/react` `SessionProvider`. Used at the root layout level.

```
NextAuthSessionProvider
  --> {children}
```

### Standalone I18nProvider

Full internationalization provider with local context (not from DS). Supports 4 locales:
- `es` (Spanish - default)
- `en` (English)
- `pt` (Portuguese)
- `fr` (French)

Translation keys: `common.*` (yes/no/cancel/save/delete/edit/create/search/loading/noData) and `components.datepicker.*` (selectDate/today/clear).

Provides: `{ locale, setLocale, t, config }` via `useI18n()` hook.

---

## Provider Files

| File | Lines | Purpose |
|------|-------|---------|
| `providers/index.ts` | 5 | Barrel exports |
| `providers/session-provider/index.tsx` | 13 | NextAuth SessionProvider wrapper |
| `providers/tenant-provider/index.tsx` | 73 | Auth page DS + I18n + Toast |
| `providers/dashboard-providers/index.tsx` | 180 | Full dashboard provider stack |
| `providers/i18n-provider/index.tsx` | 246 | Standalone I18n with 4 locales |
