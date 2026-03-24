# Platform Route Map

> All `page.tsx` files in `app-platform/src/app/(dashboard)/` with their route paths
> and surface imports. Every dashboard page is a thin wrapper that delegates to a Surface screen.

## Routes by Module

### /dashboard
| Route | Surface Import |
|-------|---------------|
| `/dashboard` | `PlatformDashboardScreen` from `@/surfaces/dashboard` |

### /users
| Route | Surface Import |
|-------|---------------|
| `/users` | `UsersListSurface` from `@/surfaces/users` |
| `/users/create` | `UsersCreateSurface` from `@/surfaces/users` |
| `/users/[id]` | `UsersDetailSurface` from `@/surfaces/users` |
| `/users/[id]/edit` | `UsersEditSurface` from `@/surfaces/users` |
| `/users/guests` | `GuestUsersSurface` from `@/surfaces/users` |
| `/users/duplicates` | `UserDuplicatesSurface` from `@/surfaces/users` |
| `/users/groups` | `UserGroupsListSurface` from `@/surfaces/users` |
| `/users/groups/create` | `GroupCreateSurface` from `@/surfaces/users` |
| `/users/groups/[id]` | `GroupDetailSurface` from `@/surfaces/users` |
| `/users/groups/[id]/edit` | `GroupEditSurface` from `@/surfaces/users` |

### /tenants
| Route | Surface Import |
|-------|---------------|
| `/tenants` | `TenantsListSurface` from `@/surfaces/tenants` |
| `/tenants/new` | `TenantCreateSurface` from `@/surfaces/tenants` |
| `/tenants/[id]` | `TenantDetailSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/edit` | `TenantEditSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/users` | `TenantUsersSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/companies` | `TenantCompaniesSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/features` | `TenantFeaturesSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/branding` | `TenantBrandingSurface` from `@/surfaces/tenants` |
| `/tenants/[id]/settings` | `TenantSettingsSurface` from `@/surfaces/tenants` |

### /roles
| Route | Surface Import |
|-------|---------------|
| `/roles` | `RolesListSurface` from `@/surfaces/roles` |
| `/roles/create` | `RoleCreateSurface` from `@/surfaces/roles` |
| `/roles/[id]` | `RoleDetailSurface` from `@/surfaces/roles` |
| `/roles/[id]/edit` | `RoleEditSurface` from `@/surfaces/roles` |
| `/roles/analytics` | `RolesAnalyticsSurface` from `@/surfaces/roles` |

### /permissions
| Route | Surface Import |
|-------|---------------|
| `/permissions` | `PermissionsListSurface` from `@/surfaces/permissions` |
| `/permissions/create` | `PermissionCreateSurface` from `@/surfaces/permissions` |
| `/permissions/[id]` | `PermissionDetailSurface` from `@/surfaces/permissions` |
| `/permissions/[id]/edit` | `PermissionEditSurface` from `@/surfaces/permissions` |
| `/permissions/policies` | `PoliciesSurface` from `@/surfaces/permissions` |

### /companies
| Route | Surface Import |
|-------|---------------|
| `/companies` | `CompaniesListSurface` from `@/surfaces/companies` |
| `/companies/new` | `CompanyCreateSurface` from `@/surfaces/companies` |
| `/companies/[id]` | `CompanyDetailSurface` from `@/surfaces/companies` |
| `/companies/[id]/edit` | `CompanyEditSurface` from `@/surfaces/companies` |

### /compliance
| Route | Surface Import |
|-------|---------------|
| `/compliance` | `ComplianceOverviewSurface` from `@/surfaces/compliance` |
| `/compliance/audit` | `AuditListSurface` from `@/surfaces/compliance` |
| `/compliance/audit/[id]` | `ComplianceAuditDetailSurface` from `@/surfaces/compliance` |
| `/compliance/consent` | `ConsentListSurface` from `@/surfaces/compliance` |
| `/compliance/gdpr` | `GdprListSurface` from `@/surfaces/compliance` |
| `/compliance/kyc-aml` | `KycAmlListSurface` from `@/surfaces/compliance` |
| `/compliance/breaches` | `ComplianceBreachesSurface` from `@/surfaces/compliance` |
| `/compliance/retention` | `ComplianceRetentionSurface` from `@/surfaces/compliance` |
| `/compliance/my-data` | `ComplianceMyDataSurface` from `@/surfaces/compliance` |

### /security
| Route | Surface Import |
|-------|---------------|
| `/security` | `SecurityOverviewSurface` from `@/surfaces/security` |
| `/security/auth-methods` | `AuthMethodsSecuritySurface` from `@/surfaces/security` |
| `/security/tokens` | `TokensSecuritySurface` from `@/surfaces/security` |
| `/security/mfa` | `MfaSecuritySurface` from `@/surfaces/security` |
| `/security/sso` | `SsoSecuritySurface` from `@/surfaces/security` |
| `/security/sso/create` | `SsoCreateSurface` from `@/surfaces/security` |
| `/security/sso/[id]` | `SsoDetailSurface` from `@/surfaces/security` |
| `/security/oauth-providers` | `OAuthProvidersSecuritySurface` from `@/surfaces/security` |
| `/security/oauth-providers/create` | `OAuthProviderCreateSurface` from `@/surfaces/security` |
| `/security/jwt` | `JwtSecuritySurface` from `@/surfaces/security` |
| `/security/risk` | `RiskSecuritySurface` from `@/surfaces/security` |

### /notifications
| Route | Surface Import |
|-------|---------------|
| `/notifications` | `NotificationsOverviewSurface` from `@/surfaces/notifications` |
| `/notifications/inbox` | `NotificationsInboxSurface` from `@/surfaces/notifications` |
| `/notifications/send` | `NotificationSendSurface` from `@/surfaces/notifications` |
| `/notifications/analytics` | `NotificationAnalyticsSurface` from `@/surfaces/notifications` |
| `/notifications/webhooks` | `NotificationWebhooksSurface` from `@/surfaces/notifications` |
| `/notifications/providers` | `NotificationProvidersSurface` from `@/surfaces/notifications` |
| `/notifications/templates` | `NotificationTemplatesListSurface` from `@/surfaces/notifications` |
| `/notifications/templates/create` | `NotificationTemplateCreateSurface` from `@/surfaces/notifications` |
| `/notifications/templates/[id]` | `NotificationTemplateDetailSurface` from `@/surfaces/notifications` |
| `/notifications/templates/[id]/edit` | `NotificationTemplateEditSurface` from `@/surfaces/notifications` |

### /navigation
| Route | Surface Import |
|-------|---------------|
| `/navigation` | `NavigationOverviewSurface` from `@/surfaces/navigation` |
| `/navigation/menus` | `NavigationMenusListSurface` from `@/surfaces/navigation` |
| `/navigation/menus/create` | `NavigationMenuCreateSurface` from `@/surfaces/navigation` |
| `/navigation/menus/[id]` | `NavigationMenuDetailSurface` from `@/surfaces/navigation` |
| `/navigation/menus/[id]/edit` | `NavigationMenuEditSurface` from `@/surfaces/navigation` |
| `/navigation/routes` | `NavigationRoutesListSurface` from `@/surfaces/navigation` |
| `/navigation/routes/create` | `NavigationRouteCreateSurface` from `@/surfaces/navigation` |
| `/navigation/routes/[id]` | `NavigationRouteDetailSurface` from `@/surfaces/navigation` |
| `/navigation/routes/[id]/edit` | `NavigationRouteEditSurface` from `@/surfaces/navigation` |
| `/navigation/policies` | `NavigationPoliciesListSurface` from `@/surfaces/navigation` |
| `/navigation/policies/create` | `NavigationPolicyCreateSurface` from `@/surfaces/navigation` |
| `/navigation/policies/[id]` | `NavigationPolicyDetailSurface` from `@/surfaces/navigation` |
| `/navigation/policies/[id]/edit` | `NavigationPolicyEditSurface` from `@/surfaces/navigation` |

### /feature-flags
| Route | Surface Import |
|-------|---------------|
| `/feature-flags` | `FeatureFlagsListSurface` from `@/surfaces/feature-flags` |
| `/feature-flags/create` | `FeatureFlagCreateSurface` from `@/surfaces/feature-flags` |
| `/feature-flags/[id]` | `FeatureFlagDetailSurface` from `@/surfaces/feature-flags` |
| `/feature-flags/[id]/edit` | `FeatureFlagEditSurface` from `@/surfaces/feature-flags` |
| `/feature-flags/[id]/rules` | `FeatureFlagRulesSurface` from `@/surfaces/feature-flags` |
| `/feature-flags/usage` | `FeatureFlagUsageSurface` from `@/surfaces/feature-flags` |

### /features
| Route | Surface Import |
|-------|---------------|
| `/features/analytics` | `FeatureAnalyticsSurface` from `@/surfaces/feature-analytics` |

### /settings
| Route | Surface Import |
|-------|---------------|
| `/settings` | `SettingsOverviewSurface` from `@/surfaces/settings` |
| `/settings/account` | `AccountSettingsSurface` from `@/surfaces/settings` |
| `/settings/mfa` | `MfaSettingsSurface` from `@/surfaces/settings` |
| `/settings/passkeys` | `PasskeysSettingsSurface` from `@/surfaces/settings` |
| `/settings/api-keys` | `ApiKeysSettingsSurface` from `@/surfaces/settings` |
| `/settings/webhooks` | `WebhooksSettingsSurface` from `@/surfaces/settings` |
| `/settings/notifications` | `NotificationSettingsSurface` from `@/surfaces/settings` |
| `/settings/billing` | `BillingSettingsSurface` from `@/surfaces/settings` |
| `/settings/privacy` | `PrivacySettingsSurface` from `@/surfaces/settings` |
| `/settings/attributes` | `AttributesSettingsSurface` from `@/surfaces/settings` |
| `/settings/whitelabel` | `WhitelabelSettingsSurface` from `@/surfaces/settings` |
| `/settings/data-export` | `DataExportSettingsSurface` from `@/surfaces/settings` |
| `/settings/integrations/scim` | `ScimSettingsSurface` from `@/surfaces/settings` |

### /profile
| Route | Surface Import |
|-------|---------------|
| `/profile` | `ProfileViewSurface` from `@/surfaces/profile` |
| `/profile/edit` | `ProfileEditSurface` from `@/surfaces/profile` |
| `/profile/sessions` | `ProfileSessionsSurface` from `@/surfaces/profile` |
| `/profile/security` | `ProfileSecuritySurface` from `@/surfaces/profile` |
| `/profile/security/password` | `ProfileSecurityPasswordSurface` from `@/surfaces/profile` |
| `/profile/security/mfa` | `ProfileSecurityMfaSurface` from `@/surfaces/profile` |
| `/profile/security/passkeys` | `ProfileSecurityPasskeysSurface` from `@/surfaces/profile` |
| `/profile/security/devices` | `ProfileSecurityDevicesSurface` from `@/surfaces/profile` |
| `/profile/security/sessions` | `ProfileSecuritySessionsSurface` from `@/surfaces/profile` |
| `/profile/security/activity` | `ProfileSecurityActivitySurface` from `@/surfaces/profile` |
| `/profile/privacy/export` | `ProfilePrivacyExportSurface` from `@/surfaces/profile` |
| `/profile/privacy/delete` | `ProfilePrivacyDeleteSurface` from `@/surfaces/profile` |

### /payments
| Route | Surface Import |
|-------|---------------|
| `/payments` | `PaymentsOverviewSurface` from `@/surfaces/payments` |
| `/payments/refunds` | `PaymentsRefundsSurface` from `@/surfaces/payments` |

### /web3
| Route | Surface Import |
|-------|---------------|
| `/web3/tokens` | `Web3TokensSurface` from `@/surfaces/web3` |
| `/web3/wallets` | `Web3WalletsSurface` from `@/surfaces/web3` |
| `/web3/nfts` | `Web3NFTsSurface` from `@/surfaces/web3` |
| `/web3/staking` | `Web3StakingSurface` from `@/surfaces/web3` |
| `/web3/transactions` | `Web3TransactionsSurface` from `@/surfaces/web3` |
| `/web3/analytics` | `Web3AnalyticsSurface` from `@/surfaces/web3` |

### /admin
| Route | Surface Import |
|-------|---------------|
| `/admin/ai-pricing` | `AdminAiPricingOverviewSurface` from `@/surfaces/admin` |
| `/admin/ai-pricing/config` | `AdminAiPricingConfigSurface` from `@/surfaces/admin` |
| `/admin/ai-pricing/packages` | `AdminAiPricingPackagesSurface` from `@/surfaces/admin` |
| `/admin/ai-pricing/rates` | `AdminAiPricingRatesSurface` from `@/surfaces/admin` |

### /admin-units
| Route | Surface Import |
|-------|---------------|
| `/admin-units` | `AdminUnitsListSurface` from `@/surfaces/admin-units` |
| `/admin-units/[id]` | `AdminUnitsDetailSurface` from `@/surfaces/admin-units` |

### /service-accounts
| Route | Surface Import |
|-------|---------------|
| `/service-accounts` | `ServiceAccountsListSurface` from `@/surfaces/service-accounts` |
| `/service-accounts/create` | `ServiceAccountCreateSurface` from `@/surfaces/service-accounts` |
| `/service-accounts/[id]` | `ServiceAccountDetailSurface` from `@/surfaces/service-accounts` |

### /sessions
| Route | Surface Import |
|-------|---------------|
| `/sessions` | `SessionsOverviewSurface` from `@/surfaces/sessions` |

### /legal
| Route | Surface Import |
|-------|---------------|
| `/legal/terms` | `TermsOfServiceSurface` from `@/surfaces/legal` |
| `/legal/privacy` | `PrivacyPolicySurface` from `@/surfaces/legal` |

### /impersonation
| Route | Surface Import |
|-------|---------------|
| `/impersonation` | `ImpersonationOverviewSurface` from `@/surfaces/impersonation` |
| `/impersonating` | `ImpersonatingSurface` from `@/surfaces/impersonation` |

---

**Total dashboard routes: 120**
