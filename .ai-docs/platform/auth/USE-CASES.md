# Auth Module - Use Cases

> **Authentication: OAuth, JWT, MFA, Sessions, SSO, SCIM, Passkeys**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [user-auth](#user-auth) - Login, register, password, MFA
  - [password-management](#password-management) - Password change and reset tokens
  - [user-auth-admin](#user-auth-admin) - Admin auth record management
  - [user-sessions](#user-sessions) - Session management
  - [auth-methods](#auth-methods) - Add/remove auth methods
  - [auth-tokens](#auth-tokens) - Token generation and management
  - [oauth](#oauth) - OAuth flows
  - [passkeys](#passkeys) - WebAuthn passwordless
  - [sso](#sso) - SAML/SSO enterprise
  - [scim](#scim) - SCIM provisioning
  - [security](#security) - Risk detection, password policies
  - [secrets](#secrets) - JWT secret rotation
- [Queries](#queries)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The Auth module handles all authentication concerns for the Rottay platform including user registration, login flows, multi-factor authentication, OAuth integrations, enterprise SSO (SAML), passwordless authentication (Passkeys), and SCIM provisioning.

**Stats:**
- **Total:** 79 use cases (50 mutations, 29 queries)
- **Entities:** UserAuth, Session, AuthToken, Passkey, RecoveryCode, SsoConnection, ScimToken

**Key Features:**
- Multi-factor authentication (TOTP, SMS, Email)
- OAuth providers (Google, GitHub, Microsoft, etc.)
- Enterprise SSO via SAML 2.0
- Passwordless login with WebAuthn Passkeys
- Recovery codes as passkey authentication fallback
- SCIM 2.0 for enterprise directory sync
- Risk-based authentication
- Session management and device tracking

---

## Mutations

### user-auth

> Core authentication operations: login, register, MFA.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `login` | Authenticate user with email/password | `LoginUC` | `makeLoginUseCase()` |
| `register` | Create new user account | `RegisterUC` | `makeRegisterUseCase()` |
| `enable-mfa` | Enable multi-factor authentication | `EnableMfaUC` | `makeEnableMfaUseCase()` |
| `disable-mfa` | Disable multi-factor authentication | `DisableMfaUC` | `makeDisableMfaUseCase()` |
| `validate-mfa` | Validate MFA code during login | `ValidateMfaUC` | `makeValidateMfaUseCase()` |
| `logout` | End current session | `LogoutUC` | `makeLogoutUseCase()` |

> **Note:** `UC` = UseCase, `make*UC()` = `make*UseCase()`

---

### password-management

> Password change and reset token generation.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `change-password` | Change password for authenticated user | `ChangePasswordUC` | `makeChangePasswordUseCase()` |
| `create-password-reset-token` | Generate password reset token | `CreatePasswordResetTokenUC` | `makeCreatePasswordResetTokenUseCase()` |
| `request-password-reset` | Send password reset email | `RequestPasswordResetUC` | `makeRequestPasswordResetUseCase()` |
| `reset-password` | Reset password using token | `ResetPasswordUC` | `makeResetPasswordUseCase()` |
| `verify-email` | Verify email using token | `VerifyEmailUC` | `makeVerifyEmailUseCase()` |
| `create-magic-link-token` | Generate magic link for passwordless login | `CreateMagicLinkTokenUC` | `makeCreateMagicLinkTokenUseCase()` |

---

### user-auth-admin

> Administrative auth record management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `delete-user-auth-record` | Delete auth record for user | `DeleteUserAuthRecordUC` | `makeDeleteUserAuthRecordUseCase()` |
| `create-user-session` | Create session for user (admin) | `CreateUserSessionUC` | `makeCreateUserSessionUseCase()` |
| `update-auth-token` | Update token metadata | `UpdateAuthTokenUC` | `makeUpdateAuthTokenUseCase()` |
| `create-user-auth-record` | Create auth record for existing user | `CreateUserAuthRecordUC` | `makeCreateUserAuthRecordUseCase()` |
| `update-user-auth` | Update user auth data | `UpdateUserAuthUC` | `makeUpdateUserAuthUseCase()` |
| `create-security-event` | Create security audit event | `CreateSecurityEventUC` | `makeCreateSecurityEventUseCase()` |

---

### user-sessions

> Session lifecycle: refresh, revoke.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `refresh-session` | Refresh session with new tokens | `RefreshSessionUC` | `makeRefreshSessionUseCase()` |
| `revoke-session` | Revoke specific session | `RevokeSessionUC` | `makeRevokeSessionUseCase()` |

---

### auth-methods

> Manage user authentication methods (email, phone, social).

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `add-method` | Add new auth method to user | `AddAuthMethodUC` | `makeAddAuthMethodUseCase()` |
| `remove-method` | Remove auth method from user | `RemoveAuthMethodUC` | `makeRemoveAuthMethodUseCase()` |

---

### auth-tokens

> Token generation, validation, and lifecycle management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `generate-token` | Generate generic auth token | `GenerateTokenUC` | `makeGenerateTokenUseCase()` |
| `consume-token` | Mark token as used | `ConsumeTokenUC` | `makeConsumeTokenUseCase()` |
| `revoke-token` | Invalidate token before expiry | `RevokeTokenUC` | `makeRevokeTokenUseCase()` |

---

### oauth

> OAuth 2.0 provider integration and flow handling.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `initiate-flow` | Start OAuth authorization flow | `InitiateOAuthFlowUC` | `makeInitiateOAuthFlowUseCase()` |
| `handle-callback` | Process OAuth provider callback | `HandleOAuthCallbackUC` | `makeHandleOAuthCallbackUseCase()` |
| `register-provider` | Configure new OAuth provider | `RegisterOAuthProviderUC` | `makeRegisterOAuthProviderUseCase()` |

---

### passkeys

> WebAuthn passwordless authentication with FIDO2 passkeys.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `generate-registration-challenge` | Create WebAuthn registration challenge | `GenerateRegistrationChallengeUC` | `makeGenerateRegistrationChallengeUseCase()` |
| `register-passkey` | Register new passkey for user | `RegisterPasskeyUC` | `makeRegisterPasskeyUseCase()` |
| `generate-authentication-challenge` | Create WebAuthn auth challenge | `GenerateAuthenticationChallengeUC` | `makeGenerateAuthenticationChallengeUseCase()` |
| `authenticate-with-passkey` | Login using passkey | `AuthenticateWithPasskeyUC` | `makeAuthenticateWithPasskeyUseCase()` |
| `remove-passkey` | Delete user passkey | `RemovePasskeyUC` | `makeRemovePasskeyUseCase()` |
| `generate-recovery-codes` | Generate one-time recovery codes for passkey fallback | `GenerateRecoveryCodesUC` | `makeGenerateRecoveryCodesUseCase()` |
| `verify-recovery-code` | Verify recovery code and create session (login fallback) | `VerifyRecoveryCodeUC` | `makeVerifyRecoveryCodeUseCase()` |

---

### sso

> Enterprise SAML 2.0 Single Sign-On.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-sso-connection` | Configure SAML IdP connection | `CreateSSOConnectionUC` | `makeCreateSSOConnectionUseCase()` |
| `update-sso-connection` | Update SSO configuration | `UpdateSSOConnectionUC` | `makeUpdateSSOConnectionUseCase()` |
| `delete-sso-connection` | Remove SSO connection | `DeleteSSOConnectionUC` | `makeDeleteSSOConnectionUseCase()` |
| `initiate-saml-login` | Start SAML authentication flow | `InitiateSAMLLoginUC` | `makeInitiateSAMLLoginUseCase()` |
| `handle-saml-response` | Process SAML IdP response | `HandleSAMLResponseUC` | `makeHandleSAMLResponseUseCase()` |

---

### scim

> SCIM 2.0 provisioning for enterprise directory sync.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-scim-token` | Generate SCIM API token | `CreateSCIMTokenUC` | `makeCreateSCIMTokenUseCase()` |
| `revoke-scim-token` | Revoke SCIM API token | `RevokeSCIMTokenUC` | `makeRevokeSCIMTokenUseCase()` |
| `handle-scim-users-request` | Process SCIM user operations | `HandleSCIMUsersRequestUC` | `makeHandleSCIMUsersRequestUseCase()` |
| `handle-scim-groups-request` | Process SCIM group operations | `HandleSCIMGroupsRequestUC` | `makeHandleSCIMGroupsRequestUseCase()` |

---

### security

> Risk-based authentication and security policies.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `evaluate-login-risk` | Calculate risk score for login attempt | `EvaluateLoginRiskUC` | `makeEvaluateLoginRiskUseCase()` |
| `enforce-mfa-based-on-risk` | Require MFA for high-risk logins | `EnforceMfaBasedOnRiskUC` | `makeEnforceMfaBasedOnRiskUseCase()` |
| `detect-impossible-travel` | Detect suspicious location changes | `DetectImpossibleTravelUC` | `makeDetectImpossibleTravelUseCase()` |
| `record-login-location` | Store login geolocation data | `RecordLoginLocationUC` | `makeRecordLoginLocationUseCase()` |
| `check-password-breach` | Check if password is in known breaches | `CheckPasswordBreachUC` | `makeCheckPasswordBreachUseCase()` |
| `enforce-password-policy` | Validate password against policy | `EnforcePasswordPolicyUC` | `makeEnforcePasswordPolicyUseCase()` |

---

### secrets

> Cryptographic key management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `rotate-jwt-secret` | Rotate JWT signing keys | `RotateJwtSecretUC` | `makeRotateJwtSecretUseCase()` |

---

## Queries

### users

> Retrieve user authentication information.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-user-auth-data` | Get user auth data | `GetUserAuthDataQ` | `makeGetUserAuthDataQuery()` |
| `get-user-auth-by-id` | Get auth record by ID | `GetUserAuthByIdQ` | `makeGetUserAuthByIdQuery()` |
| `get-user-auth-methods` | Get all auth methods for user | `GetUserAuthMethodsQ` | `makeGetUserAuthMethodsQuery()` |
| `validate-credentials` | Validate user credentials | `ValidateCredentialsQ` | `makeValidateCredentialsQuery()` |
| `search-user-auths` | Search user auth records | `SearchUserAuthsQ` | `makeSearchUserAuthsQuery()` |

---

### user-auth-admin

> Admin auth queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-user-auths-by-user` | List auth records for user | `ListUserAuthsByUserQ` | `makeListUserAuthsByUserQuery()` |
| `validate-token` | Validate a token | `ValidateTokenQ` | `makeValidateTokenQuery()` |
| `get-auth-token-by-id` | Get auth token by ID | `GetAuthTokenByIdQ` | `makeGetAuthTokenByIdQuery()` |

---

### methods

> Auth method queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-all-methods` | List all available auth methods | `ListAllAuthMethodsQ` | `makeListAllAuthMethodsQuery()` |
| `check-method-exists` | Check if auth method exists | `CheckAuthMethodExistsQ` | `makeCheckAuthMethodExistsQuery()` |

---

### sessions

> Query user sessions.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-active-sessions` | Get all active sessions for user | `GetActiveSessionsQ` | `makeGetActiveSessionsQuery()` |
| `get-active-sessions-count` | Count active sessions | `GetActiveSessionsCountQ` | `makeGetActiveSessionsCountQuery()` |
| `get-user-sessions` | Get user sessions (admin) | `GetUserSessionsQ` | `makeGetUserSessionsQuery()` |

---

### tokens

> Token queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-auth-tokens` | List auth tokens | `ListAuthTokensQ` | `makeListAuthTokensQuery()` |
| `get-token-by-type` | Get token by type | `GetTokenByTypeQ` | `makeGetTokenByTypeQuery()` |
| `get-tokens-expiring-soon` | List tokens near expiration | `GetTokensExpiringSoonQ` | `makeGetTokensExpiringSoonQuery()` |

---

### oauth

> Query OAuth provider configurations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-providers` | List configured OAuth providers | `ListOAuthProvidersQ` | `makeListOAuthProvidersQuery()` |

---

### passkeys

> Query user passkeys.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-user-passkeys` | List all passkeys for user | `ListUserPasskeysQ` | `makeListUserPasskeysQuery()` |

---

### sso

> Query SSO configurations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-sso-connection` | Get SSO connection by ID | `GetSSOConnectionQ` | `makeGetSSOConnectionQuery()` |
| `list-sso-connections` | List tenant SSO connections | `ListSSOConnectionsQ` | `makeListSSOConnectionsQuery()` |

---

### scim

> Query SCIM tokens.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-scim-tokens` | List active SCIM tokens | `ListSCIMTokensQ` | `makeListSCIMTokensQuery()` |

---

### security

> Query security and audit data.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-login-history` | Get user login history | `GetLoginHistoryQ` | `makeGetLoginHistoryQuery()` |
| `get-security-events` | Get security events | `GetSecurityEventsQ` | `makeGetSecurityEventsQuery()` |
| `get-security-summary` | Get security overview for tenant | `GetSecuritySummaryQ` | `makeGetSecuritySummaryQuery()` |
| `get-auth-config-changes` | Audit log of config changes | `GetAuthConfigChangesQ` | `makeGetAuthConfigChangesQuery()` |

---

## Entities

| Entity | Description |
|--------|-------------|
| **UserAuth** | User credentials and authentication methods |
| **Session** | Active user sessions with device info |
| **AuthToken** | Authentication tokens (magic links, reset, etc.) |
| **Passkey** | WebAuthn passkeys for passwordless auth |
| **RecoveryCode** | One-time bcrypt-hashed codes for passkey authentication fallback |
| **SsoConnection** | SAML/OIDC enterprise SSO configurations |
| **ScimToken** | API tokens for SCIM directory sync |

---

## NextAuth Adapter (adapters/in/nextjs/)

### OAuth Sign-In Flow (v1.3.28+)

The `signIn` callback in `session-callbacks/index.ts` handles full OAuth user resolution:

1. **Existing user**: Looks up `auth_user_auth` by email (cross-tenant), loads roles/permissions via `loadUserSessionData`, auto-links new OAuth providers
2. **New user**: Auto-provisions `identity_users` + `auth_user_auth` records, assigns to vertical's default tenant, sets `requiresOnboarding=true`
3. **Session enrichment**: Mutates user object with `UnifiedSessionUser` data (tenantId, roles, permissions, admin flags, requiresOnboarding, hasWhitelabeling)
4. **JWT/Session propagation**: `jwt` and `session` callbacks now carry `requiresOnboarding` and `hasWhitelabeling` fields

### Shared Utilities (shared/)

- `loadUserSessionData(params)` - Reusable role/permission loading for both credentials and OAuth flows. Checks `module:access-control` feature flag, loads from DB, falls back to trusted admin domains.
- `hasWhitelabelTheme(tenantSlug)` - Checks if tenant has custom theming enabled

### Key Types

| Field | Type | Description |
|-------|------|-------------|
| `requiresOnboarding` | `boolean?` | True for new OAuth users without assigned tenant |
| `hasWhitelabeling` | `boolean?` | True if tenant has custom theme |

Both fields are on `UnifiedSessionUser` and `UnifiedJWT`.

---

## Related

- [Core Types](../../core/TYPES.md) - TenantContext, UseCaseResult
- [Identity Module](../identity/USE-CASES.md) - User profiles and management
- [Permissions Module](../permissions/USE-CASES.md) - RBAC and access control
- [Compliance Module](../compliance/USE-CASES.md) - KYC, audit logging
- [Tenancy Module](../tenancy/USE-CASES.md) - Multi-tenant configuration
