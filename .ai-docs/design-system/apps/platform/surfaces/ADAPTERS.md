# Surface Adapters Catalog

> Auto-generated 2026-03-23. Covers all files in `app-platform/src/surfaces/_shared/adapters/`.

## Overview

Adapters implement the `EntityAdapter<Raw, View>` interface from `@rottay/design-system`.
They transform raw domain entities (from server actions) into flat view models with stable `fieldId`s
that ListSurface columns, renderers, and permission rules reference.

Total adapters: **11**
Total LOC: **1,007**

---

## user-adapter.ts (75 LOC)

- **Entity**: `user`
- **Version**: 1.0.0
- **Raw Type**: `User` from `@/actions/identity`
- **View Type**: `UserListView`
- **Field IDs**:
  - `user.name` (key: fullName)
  - `user.email` (key: email)
  - `user.tenant` (key: tenantLabel)
  - `user.status` (key: status)
  - `user.role` (key: role)
  - `user.lastActive` (key: lastActiveLabel)
- **Computes**: fullName from firstName+lastName fallback, tenantLabel truncated to 8 chars, statusLabel/statusVariant via USER_STATUS_CONFIG, roleLabel capitalized, lastActiveLabel via formatDate

---

## user-detail-adapter.ts (98 LOC)

- **Entity**: `user`
- **Version**: 1.0.0
- **Raw Type**: `UserDetailData` from `@/components/users`
- **View Type**: `UserDetailView`
- **Field IDs**:
  - `user.name` (key: fullName)
  - `user.email` (key: email)
  - `user.status` (key: status)
  - `user.role` (key: role)
  - `user.createdAt` (key: createdAtLabel)
  - `user.lastLogin` (key: lastLoginAtLabel)
- **Computes**: fullName from firstName+lastName, statusLabel/statusVariant, roleLabel capitalized, roleCount/groupCount/permissionCount/sessionCount from metrics, formatted date labels. Passes through roles/groups/permissions arrays.

---

## tenant-adapter.ts (85 LOC)

- **Entity**: `tenant`
- **Version**: 1.0.0
- **Raw Type**: `Tenant` from `@/actions/tenancy/tenants`
- **View Type**: `TenantListView`
- **Field IDs**:
  - `tenant.name` (key: name)
  - `tenant.slug` (key: slug)
  - `tenant.plan` (key: planLabel)
  - `tenant.status` (key: status)
  - `tenant.userCount` (key: userCount)
  - `tenant.companyCount` (key: companyCount)
  - `tenant.createdAt` (key: createdAtLabel)
- **Computes**: planLabel via PLAN_LABEL_MAP (free/starter/professional/enterprise), statusLabel/statusVariant via TENANT_STATUS_CONFIG, createdAtLabel via formatDate

---

## role-adapter.ts (68 LOC)

- **Entity**: `role`
- **Version**: 1.0.0
- **Raw Type**: `Role` from `@/actions/permissions`
- **View Type**: `RoleListView`
- **Field IDs**:
  - `role.name` (key: name)
  - `role.permissions` (key: permissionCountLabel)
  - `role.users` (key: userCountLabel)
  - `role.created` (key: createdAtLabel)
- **Computes**: typeLabel (System/Custom) based on isSystem, typeVariant (warning/primary), permissionCountLabel/userCountLabel as strings, createdAtLabel via formatDate

---

## permission-adapter.ts (88 LOC)

- **Entity**: `permission`
- **Version**: 1.0.0
- **Raw Type**: `Permission` from `@/actions/permissions`
- **View Type**: `PermissionListView`
- **Field IDs**:
  - `permission.name` (key: name)
  - `permission.resource` (key: resource)
  - `permission.action` (key: action)
  - `permission.description` (key: description)
  - `permission.created` (key: createdAtLabel)
- **Computes**: typeLabel (System/Custom) based on isSystem, typeVariant, actionVariant via getActionVariant (read=secondary, write/create=primary, update=success, delete=error, manage/admin=warning), createdAtLabel

---

## company-adapter.ts (78 LOC)

- **Entity**: `company`
- **Version**: 1.0.0
- **Raw Type**: `CompanyWithOwner` (extends Company with ownerName/ownerEmail)
- **View Type**: `CompanyListView`
- **Field IDs**:
  - `company.name` (key: name)
  - `company.owner` (key: ownerName)
  - `company.users` (key: userCountLabel)
  - `company.status` (key: statusLabel)
  - `company.created` (key: createdAtLabel)
- **Computes**: statusLabel/statusVariant via COMPANY_STATUS_CONFIG, userCountLabel as string, createdAtLabel via formatDate

---

## audit-event-adapter.ts (117 LOC)

- **Entity**: `auditEvent`
- **Version**: 1.0.0
- **Raw Type**: `AuditEvent` (defined locally - id, timestamp, action, actionType, user{id,name,email}, resource, resourceId, status, ipAddress, userAgent, details, metadata)
- **View Type**: `AuditEventListView`
- **Field IDs**:
  - `audit.timestamp` (key: timeLabel)
  - `audit.action` (key: action)
  - `audit.user` (key: userName)
  - `audit.resource` (key: resource)
  - `audit.status` (key: status)
  - `audit.ip` (key: ipAddress)
- **Computes**: timeLabel via formatTime (HH:MM), dateLabel via formatDate, userInitials from name initials (2 chars), statusVariant (success/warning/error/secondary), hasDetails boolean

---

## consent-record-adapter.ts (100 LOC)

- **Entity**: `consentRecord`
- **Version**: 1.0.0
- **Raw Type**: `ConsentRecord` (defined locally - id, userId, userName, email, purpose, status, grantedAt, expiresAt)
- **View Type**: `ConsentRecordListView`
- **Field IDs**:
  - `consent.user` (key: userName)
  - `consent.purpose` (key: purposeLabel)
  - `consent.status` (key: statusLabel)
  - `consent.date` (key: grantedAtLabel)
- **Computes**: purposeLabel/purposeVariant via PURPOSE_MAP (marketing=primary, analytics=success, third_party=warning, personalization=secondary, essential=primary), statusLabel/statusVariant via STATUS_MAP (granted=success, denied=error, withdrawn=warning, pending=secondary), grantedAtLabel via formatDate

---

## dsar-adapter.ts (98 LOC)

- **Entity**: `dsar`
- **Version**: 1.0.0
- **Raw Type**: `DSAR` (defined locally - id, type, requester, email, status, createdAt, dueDate)
- **View Type**: `DSARListView`
- **Field IDs**:
  - `dsar.type` (key: typeLabel)
  - `dsar.requester` (key: requester)
  - `dsar.status` (key: statusLabel)
  - `dsar.dueDate` (key: dueDateLabel)
- **Computes**: typeLabel/typeVariant via TYPE_MAP (access=primary, portability=success, erasure=error, rectification=warning), statusLabel/statusVariant via STATUS_MAP (pending=warning, in_progress=primary, completed=success, rejected=error), createdAtLabel and dueDateLabel via formatDate

---

## verification-adapter.ts (123 LOC)

- **Entity**: `verification`
- **Version**: 1.0.0
- **Raw Type**: `VerificationRecord` (defined locally - id, userId, userName, email, type, status, riskScore, createdAt, documents[])
- **View Type**: `VerificationListView`
- **Field IDs**:
  - `verification.user` (key: userName)
  - `verification.type` (key: typeLabel)
  - `verification.status` (key: statusLabel)
  - `verification.riskScore` (key: riskScore)
  - `verification.documents` (key: documentCountLabel)
  - `verification.date` (key: createdAtLabel)
- **Computes**: typeLabel/typeVariant via TYPE_MAP (identity=primary, document=success, address=secondary, pep=error), statusLabel/statusVariant via STATUS_MAP (verified=success, pending=warning, failed=error, flagged=error), riskLevel via getRiskLevel (<30=low, <60=medium, <80=high, >=80=critical), riskColor via getRiskColor (uses DS CSS vars), documentCountLabel as "{n} files"

---

## notification-template-adapter.ts (77 LOC)

- **Entity**: `notification-template`
- **Version**: 1.0.0
- **Raw Type**: `NotificationTemplate` from `@/actions/notifications/templates`
- **View Type**: `NotificationTemplateListView`
- **Field IDs**:
  - `notificationTemplate.name` (key: name)
  - `notificationTemplate.channel` (key: channelLabel)
  - `notificationTemplate.status` (key: statusLabel)
  - `notificationTemplate.variables` (key: variablesLabel)
  - `notificationTemplate.created` (key: createdAtLabel)
- **Computes**: channelVariant via CHANNEL_VARIANTS (email=primary, sms=success, push=warning, in_app=secondary), statusLabel (Active/Inactive), statusVariant (success/secondary), variablesLabel formatted as `{{var1}}, {{var2}} +N`
