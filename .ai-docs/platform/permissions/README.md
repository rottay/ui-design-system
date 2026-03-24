# Permissions Module

> **Role-Based Access Control (RBAC) for fine-grained authorization**

## What It Does

The Permissions module implements comprehensive RBAC for the Rottay platform. It manages permissions in a `resource:action` format, organizes them into roles, and assigns roles to users for fine-grained access control.

The module provides runtime access validation, bulk permission checking for UI rendering, and complete audit logging for compliance. It also supports user impersonation for administrative support scenarios with full audit trails.

All authorization decisions are centralized through this module, ensuring consistent access control across the platform.

## When to Use

- **Permission Setup**: Define resource-level permissions
- **Role Management**: Create roles with permission sets
- **User Authorization**: Assign roles to users
- **Access Validation**: Check user permissions at runtime
- **Audit Trail**: Review permission and access history
- **Admin Support**: Impersonate users for debugging

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Permission** | Individual permission (`products:delete`) |
| **Role** | Collection of permissions |
| **UserRole** | User-to-role assignment |
| **Impersonation** | Admin acting as another user |
| **AuditLog** | Record of access decisions |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 14 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Permission management
import { makeCreatePermissionUC, makeCreateRoleUC } from '@rottay/permissions';

// Role assignment
import { makeAssignRolePermissionsUC, makeAssignUserRolesUC } from '@rottay/permissions';

// Access validation
import { makeValidateAccessUC, makeBulkCheckPermissionsUC } from '@rottay/permissions';

// Impersonation
import { makeStartImpersonationUC, makeCanImpersonateUC } from '@rottay/permissions';
```

## Usage Example

```typescript
import { Authorize } from '@rottay/core';

class DeleteProductUseCase {
  @Authorize({ permissions: ['products:delete'] })
  async execute(input: Input, context: TenantContext) {
    // Only executes if user has permission
  }
}
```

## Database Tables

All tables use the `permissions_` prefix. Schema files located in `platform/packages/platform/permissions/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Permission | `permissions_permissions` | id, tenant_id, resource, action, name, description, is_active | Individual permissions in resource:action format. |
| Role | `permissions_roles` | id, tenant_id, name, description, is_system, is_active | Role definitions. System roles cannot be deleted. |
| RolePermission | `permissions_role_permissions` | id, tenant_id, role_id, permission_id, is_active | Many-to-many role-to-permission assignments. |
| UserRole | `permissions_user_roles` | id, tenant_id, user_id, role_id, assigned_by, is_active | User-to-role assignments. |
| Policy | `permissions_policies` | id, tenant_id, name, description, effect, conditions, priority, is_active | Attribute-based policies with conditions and priority. |
| Relation | `permissions_relations` | id, tenant_id, subject_type, subject_id, relation, object_type, object_id, is_active | Relationship-based access control (Zanzibar-style). |
| Decision | `permissions_decisions` | id, tenant_id, user_id, resource, action, decision, reason, context, created_at | Access decision audit log. |
| UserImpersonation | `permissions_user_impersonations` | id, tenant_id, impersonator_id, target_user_id, reason, started_at, ended_at, is_active | Admin impersonation sessions with audit trail. |

## Related Modules

- [Auth](../auth/) - Authentication before authorization
- [Identity](../identity/) - Users and groups to assign roles
- [Navigation](../navigation/) - Route-based access control
