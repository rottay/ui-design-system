# Permissions Module - Use Cases

> **RBAC: Roles, Permissions, Access Control, Impersonation**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [permissions](#permissions) - Permission CRUD and assignment
  - [roles](#roles) - Role CRUD and assignment
  - [bulk-ops](#bulk-ops) - Bulk permission and role assignment
  - [advanced-queries](#advanced-queries) - Permission updates
  - [impersonation](#impersonation) - User impersonation
- [Queries](#queries)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The Permissions module implements Role-Based Access Control (RBAC) for the Rottay platform. It manages permissions, roles, and role assignments to users, providing fine-grained access control. The module also supports user impersonation for administrative support scenarios, bulk operations, and analytics.

**Stats:**
- **Total:** 33 use cases (15 mutations, 18 queries)
- **Entities:** Permission, Role, UserRole, RolePermission

**Key Features:**
- Permission management (`resource:action` format)
- Role creation, cloning, and assignment
- User-to-role mapping
- Bulk permission and role assignment
- Access validation and effective permissions
- Audit logging of permission changes
- Admin impersonation for support
- Permission usage analytics

---

## Mutations

### permissions

> Permission CRUD and role assignment.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-permission` | Create new permission | `CreatePermissionUC` | `makeCreatePermissionUseCase()` |
| `delete-permission` | Delete permission | `DeletePermissionUC` | `makeDeletePermissionUseCase()` |
| `assign-permissions-to-role` | Assign permissions to role | `AssignPermissionsToRoleUC` | `makeAssignPermissionsToRoleUseCase()` |
| `remove-permissions-from-role` | Remove permissions from role | `RemovePermissionsFromRoleUC` | `makeRemovePermissionsFromRoleUseCase()` |

> **Note:** `UC` = UseCase, `make*UC()` = `make*UseCase()`

---

### roles

> Role CRUD and user assignment.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-role` | Create new role | `CreateRoleUC` | `makeCreateRoleUseCase()` |
| `update-role` | Update role details | `UpdateRoleUC` | `makeUpdateRoleUseCase()` |
| `delete-role` | Delete role | `DeleteRoleUC` | `makeDeleteRoleUseCase()` |
| `assign-role-to-user` | Assign role to user | `AssignRoleToUserUC` | `makeAssignRoleToUserUseCase()` |
| `revoke-role-from-user` | Revoke role from user | `RevokeRoleFromUserUC` | `makeRevokeRoleFromUserUseCase()` |
| `clone-role` | Clone role with permissions | `CloneRoleUC` | `makeCloneRoleUseCase()` |

---

### bulk-ops

> Bulk permission and role operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `bulk-assign-permissions` | Bulk assign permissions | `BulkAssignPermissionsUC` | `makeBulkAssignPermissionsUseCase()` |
| `bulk-assign-roles` | Bulk assign roles | `BulkAssignRolesUC` | `makeBulkAssignRolesUseCase()` |

---

### advanced-queries

> Permission update operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `update-permission` | Update permission details | `UpdatePermissionUC` | `makeUpdatePermissionUseCase()` |

---

### impersonation

> User impersonation for support.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `start-impersonation` | Start impersonating user | `StartImpersonationUC` | `makeStartImpersonationUseCase()` |
| `end-impersonation` | End impersonation session | `EndImpersonationUC` | `makeEndImpersonationUseCase()` |

---

## Queries

### permissions

> Permission queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-many-permissions` | List all permissions | `FindManyPermissionsQ` | `makeFindManyPermissionsQuery()` |
| `get-user-permissions` | Get permissions for user | `GetUserPermissionsQ` | `makeGetUserPermissionsQuery()` |
| `check-user-permission` | Check if user has permission | `CheckUserPermissionQ` | `makeCheckUserPermissionQuery()` |

---

### roles

> Role queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-many-roles` | List all roles | `FindManyRolesQ` | `makeFindManyRolesQuery()` |
| `find-role-by-id` | Find role by ID | `FindRoleByIdQ` | `makeFindRoleByIdQuery()` |
| `get-role-permissions` | Get permissions for role | `GetRolePermissionsQ` | `makeGetRolePermissionsQuery()` |
| `compare-role-permissions` | Compare permissions between roles | `CompareRolePermissionsQ` | `makeCompareRolePermissionsQuery()` |

---

### advanced-queries

> Advanced permission and role queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-permission-by-id` | Find permission by ID | `FindPermissionByIdQ` | `makeFindPermissionByIdQuery()` |
| `find-permission-by-name` | Find permission by name | `FindPermissionByNameQ` | `makeFindPermissionByNameQuery()` |
| `find-role-by-name` | Find role by name | `FindRoleByNameQ` | `makeFindRoleByNameQuery()` |
| `get-user-roles` | Get roles assigned to user | `GetUserRolesQ` | `makeGetUserRolesQuery()` |
| `validate-user-access` | Validate user access to resource | `ValidateUserAccessQ` | `makeValidateUserAccessQuery()` |
| `audit-permission-changes` | Audit log of permission changes | `AuditPermissionChangesQ` | `makeAuditPermissionChangesQuery()` |

---

### analytics

> Permission usage analytics.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-permission-usage-analytics` | Get permission usage analytics | `GetPermissionUsageAnalyticsQ` | `makeGetPermissionUsageAnalyticsQuery()` |
| `get-user-effective-permissions` | Get user effective permissions | `GetUserEffectivePermissionsQ` | `makeGetUserEffectivePermissionsQuery()` |

---

### impersonation

> Impersonation queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-active-impersonations` | Get active impersonation sessions | `GetActiveImpersonationsQ` | `makeGetActiveImpersonationsQuery()` |
| `get-impersonation-history` | List impersonation history | `GetImpersonationHistoryQ` | `makeGetImpersonationHistoryQuery()` |
| `validate-impersonation-session` | Validate impersonation session | `ValidateImpersonationSessionQ` | `makeValidateImpersonationSessionQuery()` |

---

## Entities

| Entity | Description |
|--------|-------------|
| **Permission** | Individual permission (e.g., `products:create`) |
| **Role** | Role with multiple permissions |
| **UserRole** | User-to-role assignment |
| **RolePermission** | Permission-to-role assignment |

---

## Permission Format

```typescript
// Format: resource:action
type PermissionFormat = `${string}:${string}`;

// Examples
const permissions = [
  'products:create',
  'products:read',
  'products:update',
  'products:delete',
  'users:manage',
  'reports:view',
  'settings:admin',
];
```

---

## Usage in Use Cases

```typescript
import { Authorize } from '@rottay/core';

class DeleteProductUseCase {
  @Authorize({ permissions: ['products:delete'] })
  async execute(input: Input, context: TenantContext) {
    // Only executes if user has the permission
  }
}
```

---

## Impersonation

Allows admins to act as another user for support purposes:

```typescript
// Start impersonation
const result = await startImpersonation.execute({
  targetUserId: 'user-123',
  reason: 'Support ticket #456',
}, adminContext);

// The returned context has:
// - userId of impersonated user
// - impersonatorId of admin
// - impersonationId for audit trail
```

---

## Related

- [Auth Module](../auth/USE-CASES.md) - Authentication before authorization
- [Identity Module](../identity/USE-CASES.md) - User and group management
- [Navigation Module](../navigation/USE-CASES.md) - Route-based access control
