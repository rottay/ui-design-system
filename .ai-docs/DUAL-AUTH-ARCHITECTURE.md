# Dual Auth Architecture (ADR-002)

## Status

**Accepted** -- Implemented across all four applications.

## Decision

Each application in the Rottay ecosystem maintains its own NextAuth instance with app-specific cookie names and session configuration. A dedicated `app-auth` service acts as the centralized OAuth and passkey hub. This is an intentional architectural decision, not technical debt.

## Context

The Rottay monorepo contains four Next.js applications, each deployed as a separate Vercel project with its own domain:

| Application | Domain (prod) | Local Port | Purpose |
|-------------|---------------|------------|---------|
| app-auth | auth.rottay.com | -- | Centralized OAuth/passkey hub |
| app-platform | platform.rottay.com | 3000 | Platform admin portal |
| app-bithire | bithire.ai | 3001 | BitHire recruiting app |
| app-evnto | evnto.xyz | 3003 | Evnto events app |

Each application is a standalone Next.js deployment. They share a PostgreSQL database and platform packages (`@rottay/auth`, `@rottay/core`, `@rottay/auth-client`) but have no shared runtime state.

## Architecture

### Trust Model

```
                     +-------------------------------------------+
                     |             app-auth                       |
                     |  Centralized OAuth Hub                     |
                     |  Providers: Google, GitHub, LinkedIn       |
                     |  Session TTL: 5 min (flow-only)            |
                     |  Cookie: auth.session-token                |
                     |  Pages: /hub/signin                        |
                     +-----+----------------+--------------------+
                           |                |
              exchange     |                |  exchange
              token        |                |  token
                           v                v
          +----------------+--+    +--------+---------------+
          |  app-platform     |    |  app-bithire           |
          |  Own NextAuth     |    |  Own NextAuth           |
          |  Credentials only |    |  No providers (JWE      |
          |  Session: 24h     |    |  decode only)            |
          |  Cookie:          |    |  Session: 24h            |
          |   platform.       |    |  Cookie:                 |
          |   session-token   |    |   bithire.session-token  |
          +-------------------+    +-------------------------+
                                                |
          +-------------------------------------+
          |  app-evnto
          |  Own NextAuth
          |  No providers (JWE decode only)
          |  Session: 30 days (Evnto-specific)
          |  Cookie: evnto.session-token
          +-------------------------------------+
```

### App Roles

- **app-auth**: The ONLY application that registers OAuth providers (Google, GitHub, LinkedIn). It holds the OAuth client credentials. Its NextAuth session is intentionally short-lived (5 minutes) because it exists only to complete the OAuth callback flow. After the callback succeeds, app-auth stores a one-time exchange token in the `auth_tokens` table and redirects back to the originating app.

- **app-platform**: Registers a CredentialsProvider for direct email/password login. Also accepts tokens from app-auth via the exchange flow for OAuth logins. Session max age is 24 hours.

- **app-bithire**: Registers NO providers. NextAuth is used solely to decode the JWE session cookie set through the exchange flow from app-auth. All authentication (credentials, OAuth, magic-link) is delegated to app-auth. Session max age is 24 hours.

- **app-evnto**: Same as app-bithire -- no providers, JWE decode only. Session max age is 30 days (Evnto-specific requirement for event attendee sessions).

### Cookie Model

Each application uses its own namespaced cookies to prevent collisions, especially during local development where multiple apps run on localhost:

| Application | Session Cookie | Callback Cookie | CSRF Cookie |
|-------------|---------------|-----------------|-------------|
| app-auth | `auth.session-token` | `auth.callback-url` | `auth.csrf-token` |
| app-platform | `platform.session-token` | `platform.callback-url` | `platform.csrf-token` |
| app-bithire | `bithire.session-token` | `bithire.callback-url` | `bithire.csrf-token` |
| app-evnto | `evnto.session-token` | `evnto.callback-url` | `evnto.csrf-token` |

All cookies are configured with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production.

No cross-domain cookie sharing exists. Each app's cookies live exclusively on its own domain. SSO is achieved through the exchange token mechanism, not through shared cookies.

### Auth Flows

#### 1. Direct Login (Credentials)

Only app-platform supports this flow directly.

```
User --> app-platform /login --> app-platform NextAuth CredentialsProvider
     --> Validates email/password via @rottay/auth
     --> Sets platform.session-token cookie on platform domain
     --> User is authenticated
```

#### 2. OAuth Login (via app-auth)

All OAuth flows route through app-auth regardless of which app initiates them.

```
User --> app-X /login --> Redirects to app-auth /hub/signin
     --> app-auth --> OAuth provider (Google/GitHub/LinkedIn)
     --> Provider callback --> app-auth /api/v1/auth/oauth/callback/{provider}
     --> app-auth stores exchange token in auth_tokens table (SHA-256 hashed)
     --> Redirects to app-X /callback?exchange_token={key}
     --> app-X consumes exchange token (single-use, 5 min TTL, tenant-scoped)
     --> app-X creates its own NextAuth session
     --> Sets {app}.session-token cookie on app-X domain
```

Exchange tokens are:
- One-time use (atomically consumed via database UPDATE ... WHERE isUsed = false)
- 5-minute TTL
- SHA-256 hashed before storage
- Tenant-scoped (tokens created for Tenant A cannot be consumed by Tenant B)
- Stored in the `auth_tokens` PostgreSQL table

#### 3. Mobile / API Client (Bearer JWT)

```
Mobile app --> POST /api/auth/login (or via app-auth)
           --> Receives { accessToken, refreshToken, sessionId, expiresAt }
           --> Stores tokens locally
           --> Subsequent requests: Authorization: Bearer {accessToken}
           --> Route-level validation via @rottay/auth-client/middleware
```

Each app's Edge middleware (`middleware.ts`) includes a `hasBearerToken()` check. When an API request carries a `Bearer` token, the NextAuth `withAuth` middleware is bypassed. The actual JWT validation happens at the route handler level via `createAuthMiddleware` from `@rottay/auth-client/middleware`.

Token refresh is handled via `POST /api/auth/refresh` with a `{ refreshToken }` body.

### Boundary Rules

- Each app validates its own sessions independently
- No app trusts another app's session cookies
- app-auth is the ONLY OAuth/passkey authority
- Credentials (email/password) are handled locally by app-platform only; app-bithire and app-evnto delegate all auth to app-auth
- JWT tokens (Bearer) are validated using shared `@rottay/auth-client/middleware` utilities
- app-auth requires an `X-App-ID` header on all API requests (except health, OAuth callbacks, and magic-link verification)
- app-auth enforces per-app origin validation: if origin is present, it must match the app's registered `allowedOrigins`

## Why NOT a Single Auth Instance

1. **Separate deployments**: Each app deploys independently on Vercel. There is no shared server process or shared in-memory state between applications.

2. **Separate domains**: `platform.rottay.com`, `bithire.ai`, `evnto.xyz`. Cookies are domain-scoped by browser security (Same-Origin Policy). A session cookie set on `bithire.ai` is invisible to `evnto.xyz`.

3. **Independent scaling**: Each app auto-scales independently on Vercel. Auth load on one app does not affect others.

4. **Fault isolation**: An auth failure or misconfiguration in one app does not cascade to the others. If app-bithire's NextAuth secret rotates incorrectly, app-platform and app-evnto continue working.

5. **Per-app session policies**: Different apps have different session requirements. Evnto uses 30-day sessions for event attendees; Platform uses 24-hour sessions for admin users; app-auth uses 5-minute sessions that exist only during the OAuth flow.

6. **Per-app middleware logic**: BitHire and Evnto check for onboarding requirements in their Edge middleware and redirect incomplete users to `/onboarding`. Platform uses a different middleware stack focused on CORS and rate limiting for its API-only routes.

## Shared Infrastructure

Despite separate NextAuth instances, auth code is heavily shared through packages:

### @rottay/auth

- `createAuthConfig({ vertical, providers, oauth, session })`: Factory function that produces a NextAuth configuration object. Each app calls this with its vertical name and provider set, then extends the result with app-specific cookie names and page overrides.
- `resolveAdminFlags(roles)`: Derives `isSuperAdmin` and `isTenantAdmin` from a roles array.
- Session types, JWT callback logic, and provider wiring are all centralized.

### @rottay/auth-client

- `AuthAppConfig` type: Defines the per-app config shape (`appId`, `cookieName`, `cookieMaxAge`, `callbackUrl`, `tenantSlug`).
- `createAuthMiddleware({ cookieName, errorHandlers, logger })`: Factory that produces `authMiddleware`, `withAuth`, and `optionalAuthMiddleware` functions. Each app creates a thin wrapper around this with its own cookie name and (optionally) custom error classes.

### @rottay/core

- `jwtService`: RSA-256 JWT generation and verification. Used by app-auth for issuing tokens and by all apps for verifying Bearer tokens.
- `JWTPayload` type: Base payload interface extended per-app with `tid` (tenant), `cid` (company), `sid` (session), `email`.

### Common Middleware Patterns

- `authMiddleware(request)`: Verifies Bearer JWT or NextAuth session cookie. Returns `AuthUser` or throws.
- `withAuth(handler)`: Higher-order function that wraps a route handler with authentication. The request object is extended with a `user` property.
- `optionalAuthMiddleware(request)`: Non-throwing variant that returns `AuthUser | null`. Used for endpoints that support both authenticated and anonymous access.

## App Registry

app-auth maintains a registry of all known applications at `app-auth/src/lib/apps/index.ts`. This registry controls:

| App ID | Allowed Origins | Session TTL |
|--------|----------------|-------------|
| platform | localhost:3000, platform.rottay.com, app.rottay.com | 24h |
| bithire | localhost:3001, bithire.ai, bithire.rottay.com | 24h |
| evnto | localhost:3003, evnto.xyz, evnto.rottay.com | 30 days |
| mobile-ios | (none) | 30 days |
| mobile-android | (none) | 30 days |
| service | (none) | 1h |

The registry is configurable via environment variables (e.g., `APP_PLATFORM_ORIGINS`, `APP_BITHIRE_SESSION_TTL`) and supports dynamic registration of additional apps via `APP_REGISTRY_APPS`.

The `X-App-ID` header is validated against this registry on every app-auth API request. Per-app origin validation ensures that requests from `bithire.ai` cannot impersonate the `platform` app.

## Security Considerations

### Secrets

- **NEXTAUTH_SECRET**: Per-app. Each deployment has its own secret for encrypting JWE session tokens. Rotating one app's secret does not invalidate sessions in other apps.
- **IMPERSONATION_SECRET**: app-platform only. Required with no fallback. Used for admin impersonation flows.
- **NOTIFICATION_HMAC_SECRET**: Required with no fallback. Used for signing notification payloads.
- **OAuth client secrets** (GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_SECRET, LINKEDIN_CLIENT_SECRET): app-auth only. Consumer apps never see these.
- **JWT keys**: RSA-256 asymmetric key pair managed by `@rottay/core`. The private key exists only in the issuing service; public key is available for verification.

### Rate Limiting

- **app-auth**: Edge middleware with in-memory rate limiter (100 requests / 60 seconds per IP). Production uses Redis-based rate limiting in route handlers.
- **app-platform**: Same pattern -- Edge middleware rate limiter on `/api/*` routes.
- **app-bithire / app-evnto**: Rate limiting is handled by the NextAuth `withAuth` middleware integration (throttled at the Edge) plus route-level checks.

### Security Headers

All four applications set identical security headers on every response:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### CORS

- app-auth derives allowed origins from the app registry (union of all registered apps' origins). Per-app origin enforcement happens after `X-App-ID` validation.
- app-platform allows origins from `CORS_ALLOWED_ORIGINS` env var, defaulting to `localhost:3000` and `localhost:3001` in development.
- app-bithire and app-evnto manage CORS through their `withAuth` middleware.
- All apps set `Access-Control-Allow-Credentials: true` and never use wildcard (`*`) origins.

### Exchange Token Security

- Tokens are SHA-256 hashed before database storage (raw key never persisted)
- Single-use: atomic UPDATE with `WHERE isUsed = false` prevents race conditions
- 5-minute TTL: expired tokens are rejected and marked consumed
- Tenant-scoped: cross-tenant consumption is blocked by the `WHERE tenantId = ?` clause
- Cleanup job removes expired tokens periodically

## OAuth Provider Configuration

app-auth supports the following OAuth providers (configured at `app-auth/src/lib/auth/oauth-config/index.ts`):

- Google
- GitHub
- LinkedIn
- Azure AD / Microsoft

Allowed return URL domains are restricted to:

- `localhost`, `127.0.0.1` (development)
- `bithire.ai`, `evnto.xyz`, `rottay.com`
- `app.rottay.com`, `bithire.rottay.com`, `evnto.rottay.com`, `platform.rottay.com`

The `isValidReturnUrl()` function validates redirect targets against this allowlist, including subdomain matching.

## File Reference

| File | Purpose |
|------|---------|
| `app-auth/src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler (OAuth hub) |
| `app-auth/src/lib/auth/nextauth-config/index.ts` | OAuth hub NextAuth config (all providers, 5-min session) |
| `app-auth/src/lib/auth/exchange-token/index.ts` | Exchange token create/consume (DB-backed, SHA-256) |
| `app-auth/src/lib/auth/oauth-config/index.ts` | Allowed OAuth providers and return URL validation |
| `app-auth/src/lib/apps/index.ts` | App registry with per-app origins, session TTL, webhook config |
| `app-auth/src/lib/auth/index.ts` | JWT authentication and token verification |
| `app-auth/src/middleware.ts` | Edge middleware: X-App-ID validation, CORS, rate limiting |
| `app-platform/src/lib/auth/config/index.ts` | Platform NextAuth config (credentials provider, 24h session) |
| `app-platform/src/lib/auth-service/config.ts` | Platform auth-client config (appId, cookieName) |
| `app-platform/src/lib/api/middleware/auth/index.ts` | Platform auth middleware (custom error classes) |
| `app-platform/src/middleware.ts` | Platform Edge middleware: CORS, rate limiting, request ID |
| `app-bithire/src/lib/auth/config/index.ts` | BitHire NextAuth config (no providers, JWE decode only, 24h) |
| `app-bithire/src/lib/auth-service/config.ts` | BitHire auth-client config (appId, cookieName) |
| `app-bithire/src/lib/api/middleware/auth/index.ts` | BitHire auth middleware wrapper |
| `app-bithire/src/middleware.ts` | BitHire Edge middleware: withAuth, onboarding redirect, Bearer bypass |
| `app-bithire/src/providers/index.tsx` | BitHire client providers (SessionProvider, theme by tenant) |
| `app-evnto/src/lib/auth/config/index.ts` | Evnto NextAuth config (no providers, JWE decode only, 30 days) |
| `app-evnto/src/lib/auth-service/config.ts` | Evnto auth-client config (appId, cookieName) |
| `app-evnto/src/lib/api/middleware/auth/index.ts` | Evnto auth middleware wrapper |
| `app-evnto/src/middleware.ts` | Evnto Edge middleware: withAuth, onboarding redirect, Bearer bypass |
| `app-evnto/src/providers/index.tsx` | Evnto client providers (SessionProvider, theme by tenant) |
