# Evnto Provider Tree

> Generated 2026-03-23. Documents the exact provider nesting from `app-evnto/src/providers/`.

## Provider Nesting (Outside -> Inside)

```
<QueryClientProvider client={queryClient}>
  <SessionProvider>                              // next-auth/react
    <InnerProviders>
      <AuthProvider>                             // app-owned: useAuth(), usePermission(), useRole(), useTenantPlan()
        <I18nProvider locale={locale}>           // @rottay/design-system: BCP-47 locale
          <DesignSystemProvider                  // @rottay/design-system: theming engine
            tenantSlug={tenantSlug}
            tenantConfig={tenantConfig}
            tenantOverrides={tenantOverrides}
            vertical="evnto"
            productProfile={EVNTO_PRODUCT_PROFILE}
            locale={locale}
          >
            <ToastProvider position="bottom-right" duration={5000} max={5}>
              {children}
              <ConfirmProvider />                // app-owned: confirmation dialogs
              <Toast.Container />                // @rottay/design-system
            </ToastProvider>
          </DesignSystemProvider>
        </I18nProvider>
      </AuthProvider>
    </InnerProviders>
  </SessionProvider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Dashboard Layout Providers (Additional)

The `(dashboard)/layout.tsx` adds one more provider inside the above tree:

```
<BreadcrumbProvider>                             // app-owned: dynamic breadcrumb labels
  <Header ... />
  <BreadcrumbBar ... />
  <MainContent>{children}</MainContent>
</BreadcrumbProvider>
```

---

## Provider Details

### 1. QueryClientProvider (TanStack Query)

- **Source**: `@tanstack/react-query`
- **Config**: `staleTime: 60s`, `retry: 1` (queries), `retry: 0` (mutations), `refetchOnWindowFocus: false`
- **Singleton**: Browser reuses a single `QueryClient`; server creates fresh ones

### 2. SessionProvider (NextAuth)

- **Source**: `next-auth/react`
- **Provides**: `useSession()` hook for auth state
- **Session type**: `EvntoSession` (extends NextAuth Session)

### 3. AuthProvider (App-Owned)

- **File**: `app-evnto/src/providers/auth-context/index.tsx`
- **Hooks exported**:
  - `useAuth()` -> `AuthContextValue` (user, isLoading, isAuthenticated, tenantId, tenantSlug, tenantName, tenantFeatures, tenantPlan, hasPermission, hasRole)
  - `usePermission(permission)` -> boolean
  - `useRole(role)` -> boolean
  - `useTenantPlan()` -> `TenantPlanInfo` (plan, limits, status, hasWhitelabeling)
- **Dependencies**: Reads from `useSession()` internally
- **Tenant resolution**: Extracts from `session.user.tenancy.tenant`

### 4. I18nProvider

- **Source**: `@rottay/design-system`
- **Config**: Locale derived from session user's `locale` field via `toSupportedLocale()`
- **Provides**: Internationalization context for DS components

### 5. DesignSystemProvider

- **Source**: `@rottay/design-system`
- **Key props**:
  - `tenantSlug` - resolved via `resolveThemeTenant()` ("rottay" -> "evnto", empty -> "evnto")
  - `tenantConfig` - async from `useTenantBranding()` (2-step: instant session config -> DB config)
  - `tenantOverrides` - from `getEvntoTenantOverrides()` (density, radii, shadows)
  - `vertical` - always `"evnto"`
  - `productProfile` - `EVNTO_PRODUCT_PROFILE` from `@/lib/theme`
  - `locale` - BCP-47 locale code
- **Purpose**: White-label theming, CSS variable injection, component defaults

### 6. ToastProvider

- **Source**: `@rottay/design-system`
- **Config**: `position="bottom-right"`, `duration=5000`, `max=5`
- **Contains**: `<ConfirmProvider />` and `<Toast.Container />`

### 7. ConfirmProvider (App-Owned)

- **File**: `app-evnto/src/components/_shared/feedback/`
- **Purpose**: Global confirmation dialog state

### 8. BreadcrumbProvider (App-Owned, Layout-Level)

- **File**: `app-evnto/src/providers/breadcrumb-context/index.tsx`
- **Hooks exported**:
  - `useBreadcrumbContext()` -> `{ labels, setLabel, clearLabel }`
  - `useBreadcrumbLabel(path, label)` - auto-registers/clears on mount/unmount
- **Purpose**: Dynamic breadcrumb labels (e.g., replacing UUID segments with entity names)
- **Scope**: Only available inside `(dashboard)/layout.tsx`, not in auth/onboarding routes

---

## Tenant Theme Resolution

The provider tree performs 2-step tenant resolution:

1. **URL-first**: `tenantSlug` prop passed from server layout (URL subdomain parsing)
2. **Session fallback**: `session.user.tenancy.tenant.slug`
3. **Normalization**: `resolveThemeTenant()` maps "rottay" -> "evnto" and empty -> "evnto"
4. **Branding**: `useTenantBranding({ tenantSlug, session, vertical: 'evnto' })` fetches full config
5. **Overrides**: `getEvntoTenantOverrides(tenantSlug)` applies structural tokens

---

## Dashboard Layout Shell

The `(dashboard)/layout.tsx` is **app-owned** (not a DS shell) and includes:

- `<PasskeyPrompt />` - WebAuthn passkey prompt
- `<CommandPalette />` - Cmd+K command palette
- `<Sidebar>` - Collapsible navigation (desktop: fixed, mobile: off-canvas)
- `<Header>` - Search, notifications, user menu
- `<BreadcrumbBar>` - Dynamic breadcrumbs
- `<MainContent>` - Page content with responsive padding
- `<ActionDock>` - Mobile quick actions (Create Event, Add Staff, Add Product)
- Back-to-top button (desktop, appears at 300px scroll)

DS responsive components used: `<Show>`, `<Hide>`, `<ResponsiveSlot>`, `<ActionDock>`

---

## Re-exports from providers/index.tsx

```typescript
export * from './auth-context';
export * from './breadcrumb-context';
```
