# BitHire Provider Tree

> Provider nesting from `app-bithire/src/providers/index.tsx`.

## Root Export

File: `app-bithire/src/providers/index.tsx`

Exports: `Providers` (main wrapper), plus re-exports from `./auth-provider` and `./focus-mode-provider`.

## Provider Hierarchy

```
Providers ({ children, tenantSlug })
  --> QueryClientProvider (queryClient: singleton on browser, fresh per SSR request)
      --> SessionProvider (NextAuth)
          --> InnerProviders (reads session via useSession())
              --> AuthProvider (custom auth context)
                  --> FocusModeProvider
                      --> I18nProvider (locale from session)
                          --> DesignSystemProvider (tenantSlug, tenantConfig, tenantOverrides, vertical="bithire", productProfile=BITHIRE_PRODUCT_PROFILE, locale)
                              --> ToastProvider (position="bottom-right", duration=5000, max=5)
                                  --> {children}
                                  --> ConfirmProvider
                                  --> Toast.Container
      --> ReactQueryDevtools (initialIsOpen=false)
```

## Key Details

### Tenant Resolution
- Function `resolveThemeTenant(slug)`: "rottay" or empty maps to "bithire" (BitHire is a Rottay product)
- Slug priority: server-provided `tenantSlug` prop -> `session.user.tenancy.tenant.slug`

### Tenant Branding (2-step)
1. **Instant**: Session-based config (immediate render)
2. **Async**: Full config from DB via `useTenantBranding({ tenantSlug, session, vertical: 'bithire' })`
- App-level overrides from `getBithireTenantOverrides(tenantSlug)` merged with DB `tokenOverrides`
- DB values take precedence (borderRadius, shadows overlay)

### QueryClient Config
- `staleTime`: 60s
- `retry`: 1 for queries, 0 for mutations
- `refetchOnWindowFocus`: false

### Locale Resolution
- From session user's locale field
- Normalized via `toSupportedLocale()` from DS

## Provider Files

| File | Lines | Purpose |
|------|-------|---------|
| `providers/index.tsx` | 180 | Root Providers wrapper + InnerProviders + QueryClient |
| `providers/auth-provider/` | (custom AuthProvider for bithire-specific auth context) |
| `providers/focus-mode-provider/` | FocusModeProvider for Surface compact mode |
