# Surface Architecture - Catalog

> Auto-generated 2026-03-23. Covers all files in `app-platform/src/surfaces/`.

## Overview

Total surface files: **161** (including index.ts barrel files)
Total surface LOC: **54,667**
Modules: **22** + `_shared`

Surface screens are the architectural layer between Next.js pages and DS Pattern components.
Pages are thin wrappers (~5-17 lines) that delegate all logic to surface screens.

---

## Module: `_shared` (14 files, 1,094 LOC)

Utilities and entity adapters shared across all surface modules.

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 13 | Barrel export for all shared utilities | - | - |
| `permissions.ts` | 44 | `useSurfacePermissions()` hook - bridges RootProvider's RBAC to Surface config action gating | - | - |
| `focus-mode.ts` | 27 | `useSurfaceFocusMode()` hook - bridges FocusModeProvider to Surface compact mode | - | - |
| `adapters/user-adapter.ts` | 75 | EntityAdapter: User -> UserListView (6 fieldIds) | EntityAdapter | - |
| `adapters/user-detail-adapter.ts` | 98 | EntityAdapter: UserDetailData -> UserDetailView (6 fieldIds) | EntityAdapter | - |
| `adapters/tenant-adapter.ts` | 85 | EntityAdapter: Tenant -> TenantListView (7 fieldIds) | EntityAdapter | - |
| `adapters/role-adapter.ts` | 68 | EntityAdapter: Role -> RoleListView (4 fieldIds) | EntityAdapter | - |
| `adapters/permission-adapter.ts` | 88 | EntityAdapter: Permission -> PermissionListView (5 fieldIds) | EntityAdapter | - |
| `adapters/company-adapter.ts` | 78 | EntityAdapter: Company -> CompanyListView (5 fieldIds) | EntityAdapter | - |
| `adapters/audit-event-adapter.ts` | 117 | EntityAdapter: AuditEvent -> AuditEventListView (6 fieldIds). Computes initials, time/date labels | EntityAdapter | - |
| `adapters/consent-record-adapter.ts` | 100 | EntityAdapter: ConsentRecord -> ConsentRecordListView (4 fieldIds). Maps purpose/status variants | EntityAdapter | - |
| `adapters/dsar-adapter.ts` | 98 | EntityAdapter: DSAR -> DSARListView (4 fieldIds). Maps request type/status variants | EntityAdapter | - |
| `adapters/verification-adapter.ts` | 123 | EntityAdapter: VerificationRecord -> VerificationListView (6 fieldIds). Computes risk level/color | EntityAdapter | - |
| `adapters/notification-template-adapter.ts` | 77 | EntityAdapter: NotificationTemplate -> NotificationTemplateListView (5 fieldIds). Maps channel variants | EntityAdapter | - |

---

## Module: `dashboard` (3 files, 330 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 3 | Barrel export | - | - |
| `screen.tsx` | 278 | Platform dashboard with stats grid, quick actions, recent activity table | **DashboardSurface** | - |
| `config.ts` | 49 | Config factory: `createPlatformDashboardConfig()` returns DashboardSurfaceConfig | DashboardSurfaceConfig | - |

---

## Module: `users` (12 files, 3,427 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 12 | Barrel export | - | - |
| `list.tsx` | 612 | Users list with data fetching, URL-synced filters, bulk actions, CSV export, keyboard shortcuts | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, StatusFilterPills, BulkSelectToggle, TableCheckboxStyles, ConfirmActionModal, TablePagination, FocusHideable |
| `list-config.tsx` | 223 | Config factory: `createUsersListConfig()` with column renderers, row actions, filters | createListSurfaceConfig | - |
| `detail.tsx` | 688 | User detail with tabs (profile, roles, groups, activity), role assignment, actions | **DetailSurface** | - |
| `detail-config.ts` | 126 | Config factory: `createUsersDetailConfig()` with tabs, sidebar, actions | createDetailSurfaceConfig | - |
| `create.tsx` | 149 | User creation form. Wraps existing UserForm component with Surface chrome | DS primitives | - |
| `edit.tsx` | 302 | User edit form with DS Form/Input/Select | DS primitives | EditHeader |
| `duplicates.tsx` | 424 | Duplicate user detection with merge capability | DS primitives | CommandHeader |
| `guests.tsx` | 269 | Guest user management with convert-to-member actions | DS primitives | - |
| `groups-list.tsx` | 176 | User groups (admin units) list with search and CRUD | DS primitives | - |
| `groups-detail.tsx` | 248 | Group detail with member management | DS primitives | - |
| `groups-edit.tsx` | 97 | Group edit form | DS primitives | - |
| `groups-create.tsx` | 91 | Group creation form | DS primitives | - |

---

## Module: `tenants` (11 files, 3,326 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 11 | Barrel export | - | - |
| `list.tsx` | 552 | Tenants list with data fetching, filters, bulk actions, CSV export | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, StatusFilterPills, BulkSelectToggle, ConfirmActionModal, FocusHideable |
| `list-config.tsx` | 240 | Config factory: `createTenantsListConfig()` | createListSurfaceConfig | - |
| `detail.tsx` | 846 | Tenant detail with 6 tabs (overview, users, companies, features, branding, settings) | **DetailSurface** | - |
| `detail-config.ts` | 131 | Config factory: `createTenantDetailConfig()` | createDetailSurfaceConfig | - |
| `create.tsx` | 635 | Tenant creation with multi-step form | DS primitives | - |
| `edit.tsx` | 792 | Tenant edit with tabbed form, slug validation | DS primitives | - |
| `branding.tsx` | 47 | Tenant branding sub-page (stub) | DS primitives | CommandHeader |
| `companies.tsx` | 21 | Tenant companies sub-page (stub) | DS primitives | - |
| `features.tsx` | 26 | Tenant features sub-page (stub) | DS primitives | - |
| `settings.tsx` | 24 | Tenant settings sub-page (stub, uses SettingsSurface) | **SettingsSurface** | - |
| `users.tsx` | 21 | Tenant users sub-page (stub) | DS primitives | - |

---

## Module: `roles` (7 files, 1,221 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `list.tsx` | 534 | Roles list with bulk actions, CSV export, keyboard shortcuts | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, StatusFilterPills, BulkSelectToggle, ConfirmActionModal, FocusHideable |
| `list-config.tsx` | 216 | Config factory: `createRolesListConfig()` | createListSurfaceConfig | - |
| `detail.tsx` | 73 | Role detail view | **DetailSurface** | - |
| `create.tsx` | 104 | Role creation form | DS primitives | FormHeader |
| `edit.tsx` | 120 | Role edit form | DS primitives | EditHeader |
| `analytics.tsx` | 168 | Role assignment analytics dashboard | DS primitives | - |

---

## Module: `permissions` (7 files, 1,120 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `list.tsx` | 572 | Permissions list with bulk actions, CSV export, keyboard shortcuts | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, StatusFilterPills, BulkSelectToggle, ConfirmActionModal, FocusHideable |
| `list-config.tsx` | 231 | Config factory: `createPermissionsListConfig()` | createListSurfaceConfig | - |
| `detail.tsx` | 110 | Permission detail view | **DetailSurface** | DetailHeader |
| `create.tsx` | 43 | Permission creation form | DS primitives | FormHeader |
| `edit.tsx` | 49 | Permission edit form | DS primitives | EditHeader |
| `policies.tsx` | 109 | Permission policies management | DS primitives | CommandHeader, DataTerminalCard, TableToolbar |

---

## Module: `companies` (6 files, 940 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 5 | Barrel export | - | - |
| `list.tsx` | 465 | Companies list with bulk actions, CSV export | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, StatusFilterPills, BulkSelectToggle, ConfirmActionModal, FocusHideable |
| `list-config.tsx` | 226 | Config factory: `createCompaniesListConfig()` | createListSurfaceConfig | - |
| `detail.tsx` | 54 | Company detail view | **DetailSurface** | - |
| `edit.tsx` | 3 | Re-exports _company-edit-impl | - | - |
| `_company-edit-impl.tsx` | 101 | Company edit form implementation | DS primitives | EditHeader |
| `create.tsx` | 91 | Company creation form | DS primitives | FormHeader |

---

## Module: `compliance` (13 files, 5,986 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 13 | Barrel export | - | - |
| `overview.tsx` | 1,197 | Executive compliance dashboard with score gauge, KPIs, activity feed, risk heat map | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `audit-list.tsx` | 340 | Audit log list with filters and CSV export | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, FocusHideable |
| `audit-list-config.tsx` | 303 | Config factory: `createAuditListConfig()` | createListSurfaceConfig | - |
| `audit-detail.tsx` | 715 | Audit event detail with metadata viewer | **DetailSurface** | - |
| `consent-list.tsx` | 367 | Consent records list | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, FocusHideable |
| `consent-list-config.tsx` | 132 | Config factory: `createConsentListConfig()` | createListSurfaceConfig | - |
| `gdpr-list.tsx` | 329 | DSAR (Data Subject Access Request) list | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, FocusHideable |
| `gdpr-list-config.tsx` | 116 | Config factory: `createGdprListConfig()` | createListSurfaceConfig | - |
| `kyc-aml-list.tsx` | 438 | KYC/AML verification list | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, FocusHideable |
| `kyc-aml-list-config.tsx` | 135 | Config factory: `createKycAmlListConfig()` | createListSurfaceConfig | - |
| `breaches.tsx` | 1,487 | Breach management with timeline, notifications, remediation tracking | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `retention.tsx` | 332 | Data retention policies management | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `my-data.tsx` | 528 | User data portal (GDPR rights) with export/delete requests | DS primitives | CommandHeader, DataTerminalCard |

---

## Module: `settings` (14 files, 3,743 LOC)

All settings surfaces use the DS **SettingsSurface** pattern.

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 20 | Barrel export | - | - |
| `overview.tsx` | 118 | Settings hub with tab navigation (General, Branding, Security, Notifications, Integrations) | **SettingsSurface** | - |
| `account.tsx` | 213 | Account settings (name, email, timezone) | **SettingsSurface** | - |
| `mfa.tsx` | 315 | MFA configuration | **SettingsSurface** | - |
| `passkeys.tsx` | 451 | Passkey management | **SettingsSurface** | - |
| `privacy.tsx` | 271 | Privacy settings | **SettingsSurface** | - |
| `notifications.tsx` | 278 | Notification preferences | **SettingsSurface** | - |
| `data-export.tsx` | 252 | Data export (GDPR) | **SettingsSurface** | - |
| `whitelabel.tsx` | 83 | Whitelabel branding settings | **SettingsSurface** | - |
| `api-keys.tsx` | 285 | API key management | **SettingsSurface** | CommandHeader, DataTerminalCard |
| `webhooks.tsx` | 531 | Webhook configuration | **SettingsSurface** | CommandHeader, DataTerminalCard |
| `billing.tsx` | 664 | Billing and subscription management | **SettingsSurface** | - |
| `attributes.tsx` | 253 | Custom user attributes management | **SettingsSurface** | CommandHeader, DataTerminalCard, TableToolbar |
| `scim.tsx` | 236 | SCIM provisioning configuration | **SettingsSurface** | - |

---

## Module: `security` (11 files, 2,628 LOC)

Most security surfaces use the DS **SettingsSurface** pattern.

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 18 | Barrel export | - | - |
| `overview.tsx` | 453 | Security dashboard with metrics, recent events | **SettingsSurface** | - |
| `tokens.tsx` | 240 | API token management | **SettingsSurface** | - |
| `mfa.tsx` | 395 | MFA policy configuration | **SettingsSurface** | - |
| `sso.tsx` | 504 | SSO provider management | **SettingsSurface** | CommandHeader, DataTerminalCard, FocusHideable |
| `sso-create.tsx` | 17 | SSO provider creation (stub) | DS primitives | FormHeader |
| `sso-detail.tsx` | 43 | SSO provider detail | **DetailSurface** | DetailHeader |
| `oauth-providers.tsx` | 214 | OAuth provider management | **SettingsSurface** | CommandHeader |
| `oauth-create.tsx` | 18 | OAuth provider creation (stub) | DS primitives | FormHeader |
| `auth-methods.tsx` | 198 | Auth methods configuration | **SettingsSurface** | - |
| `jwt.tsx` | 111 | JWT configuration | **SettingsSurface** | - |
| `risk.tsx` | 415 | Risk assessment dashboard | **SettingsSurface** | CommandHeader, DataTerminalCard |

---

## Module: `notifications` (12 files, 2,148 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 11 | Barrel export | - | - |
| `overview.tsx` | 233 | Notifications dashboard with stats | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |
| `inbox.tsx` | 64 | Notification inbox | DS primitives | CommandHeader, FocusHideable |
| `send.tsx` | 406 | Send notification form (channel selection, template picker, recipient) | DS primitives | FormHeader |
| `templates-list.tsx` | 369 | Notification templates list | **ListSurface** | CommandHeader, DataTerminalCard, TableToolbar, FocusHideable |
| `templates-list-config.tsx` | 214 | Config factory: `createNotificationTemplatesListConfig()` | createListSurfaceConfig | - |
| `templates-create.tsx` | 204 | Template creation form | DS primitives | FormHeader |
| `templates-detail.tsx` | 229 | Template detail view | **DetailSurface** | - |
| `templates-edit.tsx` | 203 | Template edit form | DS primitives | EditHeader |
| `webhooks.tsx` | 59 | Webhook notifications management | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |
| `analytics.tsx` | 141 | Notification delivery analytics | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |
| `providers.tsx` | 216 | Notification provider configuration (email, SMS, push) | DS primitives | CommandHeader |

---

## Module: `navigation` (13 files, 7,020 LOC)

Full CRUD for menus, routes, and policies.

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 13 | Barrel export | - | - |
| `overview.tsx` | 209 | Navigation management overview grid | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |
| `menus-list.tsx` | 1,257 | Menus list with dual view (table/split) | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `menu-detail.tsx` | 393 | Menu detail with item tree | **DetailSurface** | - |
| `menu-edit.tsx` | 285 | Menu edit form | DS primitives | EditHeader |
| `menu-create.tsx` | 166 | Menu creation form | DS primitives | FormHeader |
| `routes-list.tsx` | 1,736 | Routes list with dual view (table/split) | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `route-detail.tsx` | 194 | Route detail | **DetailSurface** | - |
| `route-edit.tsx` | 291 | Route edit form | DS primitives | EditHeader |
| `route-create.tsx` | 251 | Route creation form | DS primitives | FormHeader |
| `policies-list.tsx` | 1,589 | Policies list with dual view (table/split) | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `policy-detail.tsx` | 262 | Policy detail | **DetailSurface** | - |
| `policy-edit.tsx` | 342 | Policy edit form | DS primitives | EditHeader |
| `policy-create.tsx` | 245 | Policy creation form | DS primitives | FormHeader |

---

## Module: `payments` (3 files, 131 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 2 | Barrel export | - | - |
| `overview.tsx` | 59 | Payments overview wrapping PaymentsList component | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |
| `refunds.tsx` | 70 | Refunds management wrapping RefundsList component | DS primitives | CommandHeader, DataTerminalCard, FocusHideable |

---

## Module: `profile` (13 files, 6,802 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 12 | Barrel export | - | - |
| `view.tsx` | 527 | Profile hub with personal info, security status, preferences | DS primitives (custom) | - |
| `edit.tsx` | 690 | Profile edit form with avatar upload | DS primitives | EditHeader |
| `sessions.tsx` | 185 | Active sessions viewer | DS primitives | - |
| `security.tsx` | 408 | Security overview (MFA, password, recovery) | DS primitives | - |
| `security-activity.tsx` | 773 | Security activity log | DS primitives | - |
| `security-devices.tsx` | 847 | Trusted devices management | DS primitives | - |
| `security-mfa.tsx` | 793 | MFA setup/management (TOTP, backup codes) | DS primitives | - |
| `security-passkeys.tsx` | 692 | Passkey registration and management | DS primitives | - |
| `security-password.tsx` | 504 | Password change form | DS primitives | - |
| `security-sessions.tsx` | 556 | Security-focused session management | DS primitives | - |
| `privacy-delete.tsx` | 972 | Account deletion workflow (multi-step confirmation) | DS primitives | - |
| `privacy-export.tsx` | 854 | Data export workflow (GDPR) | DS primitives | - |

---

## Module: `feature-flags` (7 files, 3,576 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `list.tsx` | 1,042 | Feature flags list with dual view (table/split), toggles | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `detail.tsx` | 471 | Feature flag detail with evaluation stats | **DetailSurface** | - |
| `create.tsx` | 278 | Feature flag creation form | DS primitives | FormHeader |
| `edit.tsx` | 303 | Feature flag edit form | DS primitives | EditHeader |
| `rules.tsx` | 526 | Targeting rules editor | DS primitives | - |
| `usage.tsx` | 952 | Usage analytics dashboard | DS primitives (custom) | CommandHeader, DataTerminalCard |

---

## Module: `web3` (7 files, 3,339 LOC)

All web3 surfaces are pure content-moves using DS primitives with CommandHeader/DataTerminalCard chrome.

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `wallets.tsx` | 662 | Wallet management with dual view (table/split) | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `tokens.tsx` | 476 | Token portfolio management | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `nfts.tsx` | 554 | NFT collection viewer | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `staking.tsx` | 613 | Staking positions management | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `transactions.tsx` | 588 | Transaction history | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `analytics.tsx` | 440 | Web3 analytics dashboard | DS primitives (custom) | CommandHeader, DataTerminalCard |

---

## Module: `admin` (5 files, 1,941 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 4 | Barrel export | - | - |
| `ai-pricing-overview.tsx` | 426 | AI pricing dashboard with provider cost overview | DS primitives (custom) | - |
| `ai-pricing-packages.tsx` | 512 | AI pricing packages management | DS primitives (custom) | - |
| `ai-pricing-rates.tsx` | 486 | AI pricing rates configuration | DS primitives (custom) | - |
| `ai-pricing-config.tsx` | 513 | AI pricing global config | DS primitives (custom) | - |

---

## Module: `admin-units` (3 files, 485 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 2 | Barrel export | - | - |
| `list.tsx` | 237 | Admin units list with search, create modal, delete | DS primitives (custom) | - |
| `detail.tsx` | 246 | Admin unit detail with member management | **DetailSurface** | - |

---

## Module: `service-accounts` (4 files, 1,382 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 3 | Barrel export | - | - |
| `list.tsx` | 449 | Service accounts list with metrics | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `detail.tsx` | 618 | Service account detail with scopes, API keys, rotation | **DetailSurface** | - |
| `create.tsx` | 312 | Service account creation form | DS primitives | FormHeader |

---

## Module: `sessions` (2 files, 228 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 5 | Barrel export | - | - |
| `overview.tsx` | 223 | Active sessions management with revoke actions | DS primitives (custom) | - |

---

## Module: `impersonation` (3 files, 934 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `overview.tsx` | 597 | Impersonation management with user search, session history | DS primitives (custom) | CommandHeader, DataTerminalCard |
| `impersonating.tsx` | 331 | Active impersonation session view with exit controls | DS primitives (custom) | - |

---

## Module: `legal` (3 files, 187 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 6 | Barrel export | - | - |
| `privacy.tsx` | 85 | Privacy policy static content | DS primitives (Heading, Text) | - |
| `terms.tsx` | 96 | Terms of service static content | DS primitives (Heading, Text) | - |

---

## Module: `feature-analytics` (2 files, 532 LOC)

| File | Lines | Purpose | DS Component | App Component |
|------|-------|---------|--------------|---------------|
| `index.ts` | 1 | Barrel export | - | - |
| `overview.tsx` | 531 | Feature flag analytics dashboard with charts, trends | DS primitives (custom) | CommandHeader, DataTerminalCard |

---

## DS Surface Component Usage Summary

| DS Surface Type | Surfaces Using It | Description |
|-----------------|-------------------|-------------|
| **ListSurface** | 14 | users/list, tenants/list, roles/list, permissions/list, companies/list, compliance/audit-list, compliance/consent-list, compliance/gdpr-list, compliance/kyc-aml-list, notifications/templates-list, feature-flags/list, admin-units/list, navigation/{menus,routes,policies}-list, service-accounts/list |
| **DetailSurface** | 16 | users/detail, tenants/detail, roles/detail, permissions/detail, companies/detail, compliance/audit-detail, navigation/menu-detail, navigation/route-detail, navigation/policy-detail, notifications/templates-detail, feature-flags/detail, admin-units/detail, service-accounts/detail, security/sso-detail, users/groups-detail |
| **DashboardSurface** | 1 | dashboard/screen |
| **SettingsSurface** | 21 | All 13 settings surfaces + 8 security surfaces (overview, tokens, mfa, sso, oauth-providers, auth-methods, jwt, risk) + tenants/settings |
| **DS primitives (custom)** | ~80 | All other surfaces use DS Box/Flex/Stack/Grid/Card/Text/Button directly |

## App-Owned Component Usage Summary

| Component | Surfaces Using It | Description |
|-----------|-------------------|-------------|
| **CommandHeader** | 44 | Most list, overview, and dashboard surfaces |
| **DataTerminalCard** | 39 | KPI metric cards in list and dashboard surfaces |
| **FocusHideable** | 18 | Wraps CommandHeader/DataTerminalCard sections |
| **TableToolbar** | 13 | Search + filter bar in list surfaces |
| **EditHeader** | 11 | Edit form surfaces |
| **FormHeader** | 11 | Create form surfaces |
| **DetailHeader** | 2 | permissions/detail, security/sso-detail |
| **StatusFilterPills** | 8 | Core list surfaces (users, tenants, roles, permissions, companies) |
| **BulkSelectToggle** | 8 | Core list surfaces |
| **ConfirmActionModal** | 8 | Core list surfaces with bulk delete |
| **TablePagination** | 1 | users/list (others use ListSurface built-in) |
| **TableCheckboxStyles** | 1 | users/list |
