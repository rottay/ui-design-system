# Dashboard Route Map

> Auto-generated 2026-03-23. Covers all `page.tsx` files under `app-platform/src/app/(dashboard)/`.

## Overview

Total dashboard pages: **118**
Thin wrappers (client, no data fetching): **117**
Server-side data fetching pages: **1** (dashboard)

All pages follow the Surface Architecture pattern: pages are thin wrappers
that import and render a Surface screen from `src/surfaces/`.

---

## Dashboard

| Route | Surface Import | Type |
|-------|---------------|------|
| `/dashboard` | `PlatformDashboardScreen` | **Server-side fetch** (getSession + getDashboardMetrics, Suspense boundary) |

---

## Users (10 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/users` | `UsersListSurface` | Thin wrapper |
| `/users/[id]` | `UsersDetailSurface` | Thin wrapper (passes userId from params) |
| `/users/[id]/edit` | `UsersEditSurface` | Thin wrapper (passes userId from params) |
| `/users/create` | `UsersCreateSurface` | Thin wrapper |
| `/users/duplicates` | `UserDuplicatesSurface` | Thin wrapper |
| `/users/guests` | `GuestUsersSurface` | Thin wrapper |
| `/users/groups` | `UserGroupsListSurface` | Thin wrapper |
| `/users/groups/[id]` | `GroupDetailSurface` | Thin wrapper |
| `/users/groups/[id]/edit` | `GroupEditSurface` | Thin wrapper |
| `/users/groups/create` | `GroupCreateSurface` | Thin wrapper |

---

## Tenants (9 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/tenants` | `TenantsListSurface` | Thin wrapper |
| `/tenants/[id]` | `TenantDetailSurface` | Thin wrapper |
| `/tenants/[id]/edit` | `TenantEditSurface` | Thin wrapper |
| `/tenants/new` | `TenantCreateSurface` | Thin wrapper |
| `/tenants/[id]/branding` | `TenantBrandingSurface` | Thin wrapper |
| `/tenants/[id]/companies` | `TenantCompaniesSurface` | Thin wrapper |
| `/tenants/[id]/features` | `TenantFeaturesSurface` | Thin wrapper |
| `/tenants/[id]/settings` | `TenantSettingsSurface` | Thin wrapper |
| `/tenants/[id]/users` | `TenantUsersSurface` | Thin wrapper |

---

## Roles (5 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/roles` | `RolesListSurface` | Thin wrapper |
| `/roles/[id]` | `RoleDetailSurface` | Thin wrapper |
| `/roles/[id]/edit` | `RoleEditSurface` | Thin wrapper |
| `/roles/create` | `RoleCreateSurface` | Thin wrapper |
| `/roles/analytics` | `RolesAnalyticsSurface` | Thin wrapper |

---

## Permissions (5 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/permissions` | `PermissionsListSurface` | Thin wrapper |
| `/permissions/[id]` | `PermissionDetailSurface` | Thin wrapper |
| `/permissions/[id]/edit` | `PermissionEditSurface` | Thin wrapper |
| `/permissions/create` | `PermissionCreateSurface` | Thin wrapper |
| `/permissions/policies` | `PoliciesSurface` | Thin wrapper |

---

## Companies (4 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/companies` | `CompaniesListSurface` | Thin wrapper |
| `/companies/[id]` | `CompanyDetailSurface` | Thin wrapper |
| `/companies/[id]/edit` | `CompanyEditSurface` | Thin wrapper |
| `/companies/new` | `CompanyCreateSurface` | Thin wrapper |

---

## Compliance (8 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/compliance` | `ComplianceOverviewSurface` | Thin wrapper |
| `/compliance/audit` | `AuditListSurface` | Thin wrapper |
| `/compliance/audit/[id]` | `ComplianceAuditDetailSurface` | Thin wrapper |
| `/compliance/consent` | `ConsentListSurface` | Thin wrapper |
| `/compliance/gdpr` | `GdprListSurface` | Thin wrapper |
| `/compliance/kyc-aml` | `KycAmlListSurface` | Thin wrapper |
| `/compliance/breaches` | `ComplianceBreachesSurface` | Thin wrapper |
| `/compliance/retention` | `ComplianceRetentionSurface` | Thin wrapper |
| `/compliance/my-data` | `ComplianceMyDataSurface` | Thin wrapper |

---

## Settings (13 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/settings` | `SettingsOverviewSurface` | Thin wrapper |
| `/settings/account` | `AccountSettingsSurface` | Thin wrapper |
| `/settings/mfa` | `MfaSettingsSurface` | Thin wrapper |
| `/settings/passkeys` | `PasskeysSettingsSurface` | Thin wrapper |
| `/settings/privacy` | `PrivacySettingsSurface` | Thin wrapper |
| `/settings/notifications` | `NotificationSettingsSurface` | Thin wrapper |
| `/settings/data-export` | `DataExportSettingsSurface` | Thin wrapper |
| `/settings/whitelabel` | `WhitelabelSettingsSurface` | Thin wrapper |
| `/settings/api-keys` | `ApiKeysSettingsSurface` | Thin wrapper |
| `/settings/webhooks` | `WebhooksSettingsSurface` | Thin wrapper |
| `/settings/billing` | `BillingSettingsSurface` | Thin wrapper |
| `/settings/attributes` | `AttributesSettingsSurface` | Thin wrapper |
| `/settings/integrations/scim` | `ScimSettingsSurface` | Thin wrapper |

---

## Security (11 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/security` | `SecurityOverviewSurface` | Thin wrapper |
| `/security/tokens` | `TokensSecuritySurface` | Thin wrapper |
| `/security/mfa` | `MfaSecuritySurface` | Thin wrapper |
| `/security/sso` | `SsoSecuritySurface` | Thin wrapper |
| `/security/sso/[id]` | `SsoDetailSurface` | Thin wrapper |
| `/security/sso/create` | `SsoCreateSurface` | Thin wrapper |
| `/security/oauth-providers` | `OAuthProvidersSecuritySurface` | Thin wrapper |
| `/security/oauth-providers/create` | `OAuthProviderCreateSurface` | Thin wrapper |
| `/security/auth-methods` | `AuthMethodsSecuritySurface` | Thin wrapper |
| `/security/jwt` | `JwtSecuritySurface` | Thin wrapper |
| `/security/risk` | `RiskSecuritySurface` | Thin wrapper |

---

## Notifications (11 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/notifications` | `NotificationsOverviewSurface` | Thin wrapper |
| `/notifications/inbox` | `NotificationsInboxSurface` | Thin wrapper |
| `/notifications/send` | `NotificationSendSurface` | Thin wrapper |
| `/notifications/templates` | `NotificationTemplatesListSurface` | Thin wrapper |
| `/notifications/templates/[id]` | `NotificationTemplateDetailSurface` | Thin wrapper |
| `/notifications/templates/[id]/edit` | `NotificationTemplateEditSurface` | Thin wrapper |
| `/notifications/templates/create` | `NotificationTemplateCreateSurface` | Thin wrapper |
| `/notifications/webhooks` | `NotificationWebhooksSurface` | Thin wrapper |
| `/notifications/analytics` | `NotificationAnalyticsSurface` | Thin wrapper |
| `/notifications/providers` | `NotificationProvidersSurface` | Thin wrapper |

---

## Navigation (13 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/navigation` | `NavigationOverviewSurface` | Thin wrapper |
| `/navigation/menus` | `NavigationMenusListSurface` | Thin wrapper |
| `/navigation/menus/[id]` | `NavigationMenuDetailSurface` | Thin wrapper |
| `/navigation/menus/[id]/edit` | `NavigationMenuEditSurface` | Thin wrapper |
| `/navigation/menus/create` | `NavigationMenuCreateSurface` | Thin wrapper |
| `/navigation/routes` | `NavigationRoutesListSurface` | Thin wrapper |
| `/navigation/routes/[id]` | `NavigationRouteDetailSurface` | Thin wrapper |
| `/navigation/routes/[id]/edit` | `NavigationRouteEditSurface` | Thin wrapper |
| `/navigation/routes/create` | `NavigationRouteCreateSurface` | Thin wrapper |
| `/navigation/policies` | `NavigationPoliciesListSurface` | Thin wrapper |
| `/navigation/policies/[id]` | `NavigationPolicyDetailSurface` | Thin wrapper |
| `/navigation/policies/[id]/edit` | `NavigationPolicyEditSurface` | Thin wrapper |
| `/navigation/policies/create` | `NavigationPolicyCreateSurface` | Thin wrapper |

---

## Payments (2 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/payments` | `PaymentsOverviewSurface` | Thin wrapper |
| `/payments/refunds` | `PaymentsRefundsSurface` | Thin wrapper |

---

## Profile (11 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/profile` | `ProfileViewSurface` | Thin wrapper |
| `/profile/edit` | `ProfileEditSurface` | Thin wrapper |
| `/profile/sessions` | `ProfileSessionsSurface` | Thin wrapper |
| `/profile/privacy/delete` | `ProfilePrivacyDeleteSurface` | Thin wrapper |
| `/profile/privacy/export` | `ProfilePrivacyExportSurface` | Thin wrapper |
| `/profile/security` | `ProfileSecuritySurface` | Thin wrapper |
| `/profile/security/activity` | `ProfileSecurityActivitySurface` | Thin wrapper |
| `/profile/security/devices` | `ProfileSecurityDevicesSurface` | Thin wrapper |
| `/profile/security/mfa` | `ProfileSecurityMfaSurface` | Thin wrapper |
| `/profile/security/passkeys` | `ProfileSecurityPasskeysSurface` | Thin wrapper |
| `/profile/security/password` | `ProfileSecurityPasswordSurface` | Thin wrapper |
| `/profile/security/sessions` | `ProfileSecuritySessionsSurface` | Thin wrapper |

---

## Feature Flags (6 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/feature-flags` | `FeatureFlagsListSurface` | Thin wrapper |
| `/feature-flags/[id]` | `FeatureFlagDetailSurface` | Thin wrapper |
| `/feature-flags/[id]/edit` | `FeatureFlagEditSurface` | Thin wrapper |
| `/feature-flags/[id]/rules` | `FeatureFlagRulesSurface` | Thin wrapper |
| `/feature-flags/create` | `FeatureFlagCreateSurface` | Thin wrapper |
| `/feature-flags/usage` | `FeatureFlagUsageSurface` | Thin wrapper |

---

## Web3 (6 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/web3/wallets` | `Web3WalletsSurface` | Thin wrapper |
| `/web3/tokens` | `Web3TokensSurface` | Thin wrapper |
| `/web3/nfts` | `Web3NFTsSurface` | Thin wrapper |
| `/web3/staking` | `Web3StakingSurface` | Thin wrapper |
| `/web3/transactions` | `Web3TransactionsSurface` | Thin wrapper |
| `/web3/analytics` | `Web3AnalyticsSurface` | Thin wrapper |

---

## Admin (4 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/admin/ai-pricing` | `AdminAiPricingOverviewSurface` | Thin wrapper |
| `/admin/ai-pricing/packages` | `AdminAiPricingPackagesSurface` | Thin wrapper |
| `/admin/ai-pricing/rates` | `AdminAiPricingRatesSurface` | Thin wrapper |
| `/admin/ai-pricing/config` | `AdminAiPricingConfigSurface` | Thin wrapper |

---

## Other (6 pages)

| Route | Surface Import | Type |
|-------|---------------|------|
| `/admin-units` | `AdminUnitsListSurface` | Thin wrapper |
| `/admin-units/[id]` | `AdminUnitDetailSurface` | Thin wrapper |
| `/service-accounts` | `ServiceAccountsListSurface` | Thin wrapper |
| `/service-accounts/[id]` | `ServiceAccountDetailSurface` | Thin wrapper |
| `/service-accounts/create` | `ServiceAccountCreateSurface` | Thin wrapper |
| `/sessions` | `SessionsOverviewSurface` | Thin wrapper |
| `/impersonation` | `ImpersonationOverviewSurface` | Thin wrapper |
| `/impersonating` | `ImpersonatingSurface` | Thin wrapper |
| `/legal/privacy` | `PrivacyPolicySurface` | Thin wrapper |
| `/legal/terms` | `TermsOfServiceSurface` | Thin wrapper |
| `/features/analytics` | `FeatureAnalyticsOverviewSurface` | Thin wrapper |
