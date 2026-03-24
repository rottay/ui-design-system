# Platform Surface Adapters

> All adapters in `app-platform/src/surfaces/_shared/adapters/`.
> Each implements `EntityAdapter<Source, View>` from `@rottay/design-system`,
> transforming raw domain entities into flat view models for Surface rendering.

## Adapter Index

| Adapter | Entity | Source Type | View Model | Lines |
|---------|--------|------------|------------|-------|
| `user-adapter.ts` | user | `User` (from `@/actions/identity`) | `UserListView` | 76 |
| `user-detail-adapter.ts` | user | `UserDetailData` (from `@/components/users`) | `UserDetailView` | 99 |
| `tenant-adapter.ts` | tenant | `Tenant` (from `@/actions/tenancy/tenants`) | `TenantListView` | 86 |
| `role-adapter.ts` | role | `Role` (from `@/actions/permissions`) | `RoleListView` | 69 |
| `permission-adapter.ts` | permission | `Permission` (from `@/actions/permissions`) | `PermissionListView` | 89 |
| `company-adapter.ts` | company | `CompanyWithOwner` (extends `Company` from `@/actions/tenancy/companies`) | `CompanyListView` | 79 |
| `audit-event-adapter.ts` | auditEvent | `AuditEvent` (locally defined) | `AuditEventListView` | 118 |
| `consent-record-adapter.ts` | consentRecord | `ConsentRecord` (locally defined) | `ConsentRecordListView` | 101 |
| `dsar-adapter.ts` | dsar | `DSAR` (locally defined) | `DSARListView` | 99 |
| `verification-adapter.ts` | verification | `VerificationRecord` (locally defined) | `VerificationListView` | 124 |
| `notification-template-adapter.ts` | notification-template | `NotificationTemplate` (from `@/actions/notifications/templates`) | `NotificationTemplateListView` | 78 |

---

## Adapter Details

### userListAdapter
- **Fields mapped**: fullName, email, avatar, tenantId, tenantLabel, status, statusLabel, statusVariant, role, roleLabel, lastActiveLabel, lastLoginAt, createdAt
- **Computed values**: `fullName` (fallback chain: fullName -> firstName+lastName -> email), `tenantLabel` (truncated ID), `statusVariant` (via `getUserStatusVariant()`), `roleLabel` (capitalized), `lastActiveLabel` (via `formatDate()`)
- **Dependencies**: `USER_STATUS_CONFIG`, `getUserStatusVariant`, `formatDate`

### userDetailAdapter
- **Fields mapped**: All of userListAdapter plus firstName, lastName, tenantName, roleCount, groupCount, permissionCount, sessionCount, roles, groups, permissions, updatedAtLabel, lastLoginAtLabel
- **Computed values**: Same as userListAdapter plus `roleCount`/`groupCount`/`permissionCount`/`sessionCount` from metrics, `updatedAtLabel`, `lastLoginAtLabel`
- **Dependencies**: `USER_STATUS_CONFIG`, `getUserStatusVariant`, `formatDate`

### tenantListAdapter
- **Fields mapped**: name, slug, domain, plan, planLabel, status, statusLabel, statusVariant, userCount, companyCount, createdAtLabel, createdAt
- **Computed values**: `planLabel` (via PLAN_LABEL_MAP: free/starter/professional/enterprise), `statusVariant` (via `getTenantStatusVariant()`), `createdAtLabel` (via `formatDate()`)
- **Dependencies**: `TENANT_STATUS_CONFIG`, `getTenantStatusVariant`, `formatDate`

### roleListAdapter
- **Fields mapped**: name, description, slug, isSystem, isDefault, typeLabel, typeVariant, permissionCount, permissionCountLabel, userCount, userCountLabel, createdAtLabel, createdAt
- **Computed values**: `typeLabel` ("System"/"Custom"), `typeVariant` (warning/primary), `permissionCountLabel`/`userCountLabel` (stringified counts)
- **Dependencies**: `formatDate`

### permissionListAdapter
- **Fields mapped**: name, slug, description, resource, action, isSystem, typeLabel, typeVariant, actionVariant, createdAtLabel, createdAt
- **Computed values**: `typeLabel` ("System"/"Custom"), `actionVariant` (read->secondary, write/create->primary, update->success, delete->error, manage/admin->warning)
- **Dependencies**: `formatDate`

### companyListAdapter
- **Fields mapped**: name, slug, status, statusLabel, statusVariant, ownerName, ownerEmail, userCount, userCountLabel, createdAtLabel, createdAt
- **Computed values**: `statusVariant` (via `getCompanyStatusVariant()`), `userCountLabel` (stringified)
- **Dependencies**: `COMPANY_STATUS_CONFIG`, `getCompanyStatusVariant`, `formatDate`

### auditEventListAdapter
- **Fields mapped**: timestamp, timeLabel, dateLabel, action, actionType, userName, userEmail, userInitials, resource, resourceId, status, statusVariant, ipAddress, details, metadata, hasDetails
- **Computed values**: `timeLabel` (HH:MM AM/PM), `dateLabel` (formatted date), `userInitials` (first letters of name parts), `statusVariant` (success/warning/error/secondary), `hasDetails` (boolean from details||metadata)
- **Dependencies**: `formatDate`, local `formatTime` and `getStatusVariant` helpers

### consentRecordListAdapter
- **Fields mapped**: userId, userName, email, purpose, purposeLabel, purposeVariant, status, statusLabel, statusVariant, grantedAt, grantedAtLabel, expiresAt
- **Computed values**: `purposeLabel`/`purposeVariant` (via PURPOSE_MAP: marketing/analytics/third_party/personalization/essential), `statusLabel`/`statusVariant` (via STATUS_MAP: granted/denied/withdrawn/pending)
- **Dependencies**: `formatDate`

### dsarListAdapter
- **Fields mapped**: type, typeLabel, typeVariant, requester, email, status, statusLabel, statusVariant, createdAt, createdAtLabel, dueDate, dueDateLabel
- **Computed values**: `typeLabel`/`typeVariant` (via TYPE_MAP: access/portability/erasure/rectification), `statusLabel`/`statusVariant` (via STATUS_MAP: pending/in_progress/completed/rejected)
- **Dependencies**: `formatDate`

### verificationListAdapter
- **Fields mapped**: userId, userName, email, type, typeLabel, typeVariant, status, statusLabel, statusVariant, riskScore, riskLevel, riskColor, documentCount, documentCountLabel, createdAt, createdAtLabel
- **Computed values**: `typeLabel`/`typeVariant` (via TYPE_MAP: identity/document/address/pep), `statusLabel`/`statusVariant` (via STATUS_MAP: verified/pending/failed/flagged), `riskLevel` (low/medium/high/critical from score thresholds 30/60/80), `riskColor` (DS CSS vars: success/warning/error)
- **Dependencies**: `formatDate`

### notificationTemplateListAdapter
- **Fields mapped**: name, description, channel, channelLabel, channelVariant, isActive, statusLabel, statusVariant, variables, variablesLabel, createdAtLabel, createdAt
- **Computed values**: `channelVariant` (email->primary, sms->success, push->warning, in_app->secondary), `statusLabel` ("Active"/"Inactive"), `variablesLabel` (first 3 variables as `{{var}}` with "+N" overflow)
- **Dependencies**: None (uses inline Date formatting)
