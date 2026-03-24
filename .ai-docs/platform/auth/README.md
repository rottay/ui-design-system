# Auth Module

> **Complete authentication infrastructure for multi-tenant SaaS applications**

## What It Does

The Auth module provides all authentication capabilities for the Rottay platform. It handles user registration, login flows, session management, and supports multiple authentication methods including traditional email/password, OAuth social logins, enterprise SSO, and modern passwordless authentication with WebAuthn Passkeys.

The module implements risk-based authentication to detect suspicious login attempts, impossible travel scenarios, and compromised credentials. It enforces configurable password policies and supports multi-factor authentication (MFA) via TOTP apps, SMS, or email.

For enterprise customers, the Auth module provides SAML 2.0 SSO integration and SCIM 2.0 provisioning, enabling seamless directory synchronization with identity providers like Okta, Azure AD, and OneLogin.

## When to Use

- **User Authentication**: Login, register, password reset flows
- **Session Management**: Create, refresh, or revoke user sessions
- **OAuth Integration**: Add social login (Google, GitHub, Microsoft)
- **Enterprise SSO**: Configure SAML connections for enterprise tenants
- **Passwordless**: Implement WebAuthn passkeys for modern auth
- **MFA**: Enable two-factor authentication for users
- **Security**: Evaluate login risk, detect anomalies
- **Directory Sync**: SCIM provisioning from enterprise IdPs

## Key Concepts

| Concept | Description |
|---------|-------------|
| **UserAuth** | Authentication credentials linked to a user identity |
| **Session** | Active login session with device/location info |
| **AuthToken** | Time-limited tokens for email verification, password reset |
| **Passkey** | WebAuthn credential stored on user's device |
| **SsoConnection** | SAML IdP configuration for enterprise tenants |
| **ScimToken** | API token for directory synchronization |
| **MFA** | Multi-factor authentication (TOTP, SMS, Email) |
| **Risk Score** | Login attempt risk evaluation (0-100) |

## REVIEW-2026 Changes

- Self-referential package dependency (`"@rottay/auth"` in its own package.json) was REMOVED
- Rate limits in login use case (dev/test mode) were reduced from 500/1000/10000 to 50/100/1000 (10x production instead of 100x)
- 67 use cases total (confirmed)

### Session 2026-02-06

- **Layer violations fixed (13 total)**: Domain layer no longer imports from adapters, restoring hexagonal architecture compliance
- **ValidateMfa backward compatibility**: Hash comparison now supports bcrypt, SHA-256, and legacy formats for seamless migration of existing MFA secrets
- **MFA backup codes**: Now persisted with SHA-256 hashing (previously unhashed or inconsistently hashed)
- **Impersonation cookies**: Secured with HMAC-SHA256 signing and 1-hour expiration (previously unsigned with no expiry)
- **14 foreign keys added**: Across auth, identity, tenancy, and permissions tables to enforce referential integrity at the DB level

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 67 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Unified Auth System

The module provides unified authentication adapters for both NextJS (SSR) and SPA applications.

### NextJS Apps (SSR/SSG)

```typescript
// lib/auth/config/index.ts
import { createAuthConfig } from '@rottay/auth';

export const authOptions = createAuthConfig({
  vertical: 'bithire',
  oauth: {
    google: { clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET },
  },
  session: { maxAge: 24 * 60 * 60 },
});
```

### SPA Apps (React/Vue)

```tsx
import { SPAAuthProvider, createSPAConfig, useSPAAuth } from '@rottay/auth';

const config = createSPAConfig({
  apiBaseUrl: 'https://api.rottay.com',
  vertical: 'bithire',
  onSessionExpired: () => navigate('/login'),
});

function App() {
  return (
    <SPAAuthProvider config={config}>
      <Router />
    </SPAAuthProvider>
  );
}
```

### Universal Hooks

```tsx
import { useAuth, usePermissions } from '@rottay/auth/client';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { can, hasRole, isSuperAdmin } = usePermissions();

  return (
    <>
      {can('write', 'candidates') && <CreateButton />}
      {hasRole('bithire:recruiter') && <RecruiterPanel />}
    </>
  );
}
```

### Session Structure (UnifiedSessionUser) - v1.3.71+

Each segment maps to a `@rottay` module. No flat legacy fields remain.

```typescript
interface UnifiedSessionUser {
  // Session-level (not tied to a module)
  sessionId: string;
  authProvider: 'credentials' | 'google' | 'github' | 'microsoft' | 'linkedin' | 'saml' | 'api-key';

  // @rottay/identity - who the user is
  identity: {
    id: string;
    email: string;
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    phone?: string | null;
    phoneVerified?: boolean;
    lifecycleStatus?: 'pending' | 'active' | 'suspended' | 'deprovisioned' | 'staged';
    memberSince?: string;
  };

  // @rottay/auth - authentication state
  auth: {
    mfaEnabled: boolean;
    mfaMethod?: 'totp' | 'sms' | 'email';
    lastLoginAt?: string;
    lastPasswordChangeAt?: string;
    linkedAccounts: LinkedAccount[];
  };

  // @rottay/permissions - roles and access control
  permissions: {
    roles: string[];
    permissions: string[];
    isSuperAdmin: boolean;
    isTenantAdmin: boolean;
  };

  // @rottay/tenancy - multi-tenant context
  tenancy: {
    tenant: {
      id: string;
      slug: string;
      name: string;
      plan: 'free' | 'starter' | 'pro' | 'enterprise';
      status: 'active' | 'trial' | 'suspended' | 'cancelled';
      features: string[];
      hasWhitelabeling: boolean;
      limits?: Record<string, number | undefined>;
    };
    company?: { id: string; name: string; logo?: string };
    teams: SessionTeam[];
  };

  // Cross-module preferences
  preferences: {
    localization: { locale: string; timezone: string };
    display: { dateFormat?: string; timeFormat?: '12h' | '24h' };
  };

  // Runtime context (populated per request)
  context: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    geo?: { country?: string; city?: string };
    requiresOnboarding: boolean;
  };

  // Enterprise features (optional)
  impersonation?: {...};
  delegation?: {...};
  elevation?: {...};
}
```

**IMPORTANT**: All flat legacy fields (`user.id`, `user.email`, `user.roles`, `user.tenantId`, `user.rbac`, `user.tenant`, `user.security`) have been REMOVED as of v1.3.71. Use the module-aligned paths above.

### System Roles

| Constant | Value | Description |
|----------|-------|-------------|
| `SYSTEM_ROLES.SUPER_ADMIN` | `'super-admin'` | Cross-tenant access (no tenant filter) |
| `SYSTEM_ROLES.TENANT_ADMIN` | `'tenant-admin'` | Full access within tenant |
| `SYSTEM_ROLES.ADMIN` | `'admin'` | Alias for tenant admin |

All other roles are loaded from DB via @rottay/permissions.

### Admin Flags Utility

Use `deriveAdminPrivileges()` (or deprecated alias `resolveAdminFlags()`) to compute admin status from role names:

```typescript
import { deriveAdminPrivileges, SYSTEM_ROLES } from '@rottay/auth';

// Compute admin flags from roles array
const roles = ['super-admin', 'viewer'];
const { isSuperAdmin, isTenantAdmin } = deriveAdminPrivileges(roles);
// isSuperAdmin: true, isTenantAdmin: true

// In session callbacks, these flags are pre-computed in permissions:
const { isSuperAdmin, isTenantAdmin } = session.user.permissions;
```

This ensures consistent admin detection across all apps.

### Accessing Session Data in Apps

All apps use module-aligned paths (v1.3.71+):

```typescript
// Identity
const userId = session.user.identity.id;
const email = session.user.identity.email;
const name = session.user.identity.name;

// Permissions
const roles = session.user.permissions.roles;
const perms = session.user.permissions.permissions;
const isSuperAdmin = session.user.permissions.isSuperAdmin;

// Tenancy
const tenantId = session.user.tenancy.tenant.id;
const tenantSlug = session.user.tenancy.tenant.slug;

// Auth
const mfaEnabled = session.user.auth.mfaEnabled;
const linkedAccounts = session.user.auth.linkedAccounts;

// Context
const requiresOnboarding = session.user.context.requiresOnboarding;
```

### Migration Reference (v1.3.71)

| Old path | New path |
|----------|----------|
| `user.id` | `user.identity.id` |
| `user.email` | `user.identity.email` |
| `user.name` | `user.identity.name` |
| `user.rbac.roles` | `user.permissions.roles` |
| `user.rbac.permissions` | `user.permissions.permissions` |
| `user.rbac.isSuperAdmin` | `user.permissions.isSuperAdmin` |
| `user.rbac.isTenantAdmin` | `user.permissions.isTenantAdmin` |
| `user.tenant.id` | `user.tenancy.tenant.id` |
| `user.tenant.slug` | `user.tenancy.tenant.slug` |
| `user.security.mfaEnabled` | `user.auth.mfaEnabled` |
| `user.linkedAccounts` | `user.auth.linkedAccounts` |
| `user.company` | `user.tenancy.company` |
| `user.teams` | `user.tenancy.teams` |
| `user.state.requiresOnboarding` | `user.context.requiresOnboarding` |
| `user.localization` | `user.preferences.localization` |

## Import

```typescript
// Core auth use cases
import { makeLoginUC, makeRegisterUC, makeLogoutUC } from '@rottay/auth';

// Admin flags utility (ALWAYS use this, never compute manually)
import { resolveAdminFlags, SYSTEM_ROLES } from '@rottay/auth';

// Unified NextJS adapter
import { createAuthConfig } from '@rottay/auth';

// SPA adapter
import { SPAAuthProvider, useSPAAuth, createSPAConfig } from '@rottay/auth';

// Universal client hooks
import { useAuth, usePermissions } from '@rottay/auth/client';

// Session management
import { makeCreateSessionUC, makeRefreshSessionUC } from '@rottay/auth';

// OAuth flows
import { makeInitiateOAuthFlowUC, makeHandleOAuthCallbackUC } from '@rottay/auth';

// Passkeys (WebAuthn)
import { makeRegisterPasskeyUC, makeAuthenticateWithPasskeyUC } from '@rottay/auth';

// SSO (SAML)
import { makeCreateSsoConnectionUC, makeInitiateSamlLoginUC } from '@rottay/auth';

// Security
import { makeEvaluateLoginRiskUC, makeEnforceMfaBasedOnRiskUC } from '@rottay/auth';
```

## Example Usage

```typescript
import { makeLoginUC, makeCreateSessionUC } from '@rottay/auth';
import { success, error } from '@rottay/core';

// Login flow
const loginUC = makeLoginUC(db);
const result = await loginUC.execute({
  email: 'user@example.com',
  password: 'securePassword123'
}, context);

if (result.isError) {
  // Handle invalid credentials
  return error(result.error);
}

// Create session
const sessionUC = makeCreateSessionUC(db);
const session = await sessionUC.execute({
  userId: result.value.userId,
  deviceInfo: { userAgent, ip }
}, context);

return success({ token: session.value.accessToken });
```

## Database Tables

All tables use the `auth_` prefix. Schema files located in `platform/packages/platform/auth/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| UserAuth | `auth_user_credentials` | id, tenant_id, user_id, email, password_hash, mfa_secret, mfa_enabled, is_active | Core authentication credentials. |
| AuthToken | `auth_tokens` | id, tenant_id, user_id, token_hash, type, expires_at, used_at, is_active | Email verification, password reset tokens. |
| OAuthProvider | `auth_oauth_providers` | id, tenant_id, user_id, provider, provider_user_id, access_token, refresh_token, is_active | Social login (Google, GitHub, Microsoft, LinkedIn). |
| OAuthStateToken | `auth_oauth_state_tokens` | id, tenant_id, state, provider, redirect_uri, expires_at | CSRF protection for OAuth flows. |
| AuthMethod | `auth_methods` | id, tenant_id, user_id, type, is_primary, is_verified, is_active | Consolidated auth method registry. |
| UserSession | `auth_user_sessions` | id, tenant_id, user_id, token_hash, device_info, ip_address, location, expires_at, is_active | Active login sessions with device/location tracking. |
| SecurityEvent | `auth_security_events` | id, tenant_id, user_id, event_type, severity, ip_address, user_agent, metadata, created_at | Login attempts, MFA events, suspicious activity. |
| LoginLocation | `auth_login_locations` | id, tenant_id, user_id, ip_address, country, city, latitude, longitude, is_trusted, first_seen_at, last_seen_at | Impossible travel detection. |
| SecurityIncident | `auth_security_incidents` | id, tenant_id, user_id, type, severity, status, details, resolved_at, is_active | Aggregated security incidents. |
| BreachCheckCache | `auth_breach_check_cache` | id, password_hash_prefix, is_breached, checked_at, source | HaveIBeenPwned cache for credential checks. |
| Secret | `auth_secrets` | id, tenant_id, name, type, encrypted_value, encryption_key_id, version, expires_at, is_active | Secrets vault (API keys, signing keys). |
| SecretVersion | `auth_secret_versions` | id, secret_id, version, encrypted_value, is_active, created_at | Secret version history for rotation. |
| SecretRotationAudit | `auth_secret_rotation_audit` | id, secret_id, old_version, new_version, rotated_by, rotated_at | Audit trail for secret rotations. |
| PasskeyCredential | `auth_passkey_credentials` | id, tenant_id, user_id, credential_id, public_key, sign_count, transports, aaguid, device_name, is_active | WebAuthn/FIDO2 passkey credentials. |
| PasskeyChallenge | `auth_passkey_challenges` | id, tenant_id, user_id, challenge, type, expires_at | Time-limited WebAuthn challenges. |
| SsoConnection | `auth_sso_connections` | id, tenant_id, provider_type, entity_id, sso_url, certificate, metadata_url, is_active | SAML 2.0 SSO IdP configurations. |
| ScimToken | `auth_scim_tokens` | id, tenant_id, token_hash, name, scopes, expires_at, last_used_at, is_active | SCIM 2.0 provisioning API tokens. |
| ScimUser | `auth_scim_users` | id, tenant_id, external_id, user_id, scim_data, is_active | SCIM user mapping. |
| ScimGroupMember | `auth_scim_group_members` | id, tenant_id, group_id, user_id, is_active | SCIM group membership. |
| ScimSyncLog | `auth_scim_sync_logs` | id, tenant_id, operation, resource_type, resource_id, status, error, created_at | SCIM sync operation audit. |
| ScimTokenUsageLog | `auth_scim_token_usage_logs` | id, token_id, endpoint, method, status_code, ip_address, created_at | SCIM token usage tracking. |

## Related Modules

- [Identity](../identity/) - User profiles, groups, service accounts
- [Permissions](../permissions/) - RBAC, access control after authentication
- [Tenancy](../tenancy/) - Multi-tenant configuration, API keys
- [Compliance](../compliance/) - Audit logging, KYC verification
- [Notifications](../notifications/) - Email/SMS for verification, MFA codes
