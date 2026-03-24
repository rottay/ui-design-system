# Canonical Runtime Model (Cross-App)

**Date**: 2026-03-24
**Status**: Implemented across all 3 apps

---

## Tenant Resolution

### Header Contract
| Header | Purpose | Set By |
|--------|---------|--------|
| `x-tenant-slug` | Page theming, branding, rendering | Middleware (forwarded request) |
| `x-tenant-id` | API auth override (super-admin only) | API routes only |

### Resolution Chain
```
1. x-tenant-slug header (from middleware/proxy)
2. Session user.tenancy.tenant.slug (post-login)
3. NEXT_PUBLIC_TENANT_SLUG env var
4. Vertical default (rottay/bithire/evnto)
```

### Middleware Pattern (all 3 apps)
```ts
const hostname = req.headers.get('host') ?? 'localhost';
const tenantSlug = resolveRequestTenant(hostname); // from @rottay/design-system/server

const requestHeaders = new Headers(req.headers);
requestHeaders.set('x-tenant-slug', tenantSlug);
const response = NextResponse.next({ request: { headers: requestHeaders } });
response.headers.set('x-tenant-slug', tenantSlug); // also on response for client
```

---

## Whitelabel (2-Step Branding)

### Step 1: Session-Instant (first paint)
```ts
const { tenantConfig } = useTenantBranding({
  tenantSlug,
  session,
  vertical: 'bithire', // per-app
});
// Returns 9 fields: slug, name, engine, theme, plan, features, vertical, branding
```

### Step 2: Async-Full (post-mount)
```ts
// Hook internally fetches: /api/public/tenant-branding/{slug}
// Returns 80+ fields: branding + personality + tokenOverrides
```

### Public Branding Endpoints (all 3 apps)
```
GET /api/public/tenant-branding/:slug
GET /api/public/tenant-branding/by-host?host=...

Response: {
  slug, vertical, engine, theme, locale,
  branding: { companyName, primaryColor, secondaryColor, accentColor, logo },
  rendering: { hidePoweredBy, titleSuffix },
  personality: { ... },
  tokenOverrides: { ... }
}
```

---

## DS Provider Stack (canonical)

```
SessionProvider (NextAuth)
  AuthProvider (app-owned)
    AppSpecificProviders (FocusMode, QueryClient, etc.)
      I18nProvider (DS) -- locale from session/tenantConfig
        DesignSystemProvider (DS)
          tenantSlug={tenantSlug}
          tenantConfig={tenantConfig}       // from useTenantBranding
          tenantOverrides={appOverrides}    // app-specific structural defaults
          vertical={VERTICAL}               // "evnto" | "bithire" | "platform"
          productProfile={PROFILE}          // per-app
          locale={locale}
          // NO forceEngine -- vertical + tenantConfig decide
          ToastProvider (DS)
            {children}
            ToastContainer (DS)
```

---

## Engine Resolution

```
engine = tenantConfig.engine ?? verticalDefault ?? 'classic'
```

| Vertical | Default Engine | Can Override? |
|----------|---------------|---------------|
| evnto | modern | Yes (tenant chooses) |
| bithire | classic | Yes (tenant chooses) |
| platform | classic | Yes (tenant chooses) |

---

## What's Per-App (different)
- `vertical` string
- `productProfile` string
- `getAppTenantOverrides()` function
- AppSpecificProviders (RootProvider, FocusMode, QueryClient)
- Domain surfaces and modules
- Domain entities and adapters

## What's Identical (shared via DS)
- Middleware tenant resolution pattern
- Header name (x-tenant-slug)
- Provider nesting order
- 2-step branding (useTenantBranding hook)
- Toast system (DS Toast)
- Locale derivation (toSupportedLocale)
- Engine resolution (no forceEngine)
- Public branding endpoints
- Surface/Pattern components
