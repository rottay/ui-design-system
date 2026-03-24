# Identity Module

> **Complete user identity management for multi-tenant SaaS applications**

## What It Does

The Identity module manages all aspects of user identity including profiles, groups, organizational hierarchies, and service accounts. It provides a unified identity layer that supports both B2B (enterprise) and B2C (consumer) patterns.

The module handles user lifecycle from creation through deactivation, supports SCIM 2.0 for enterprise directory synchronization with providers like Okta and Azure AD, and provides advanced capabilities like identity linking, profile merging, and duplicate detection.

For machine-to-machine communication, the module provides service accounts with rotatable credentials, enabling secure API integrations without user context.

## When to Use

- **User Management**: Create, update, or deactivate user accounts
- **Group Organization**: Organize users into groups for permissions
- **Enterprise Integration**: SCIM provisioning from enterprise IdPs
- **B2B Collaboration**: Invite and manage guest users
- **Service Accounts**: Create M2M accounts for integrations
- **Bulk Operations**: Import/export users at scale
- **Profile Enrichment**: Enhance profiles with external data

## Key Concepts

| Concept | Description |
|---------|-------------|
| **User** | Core identity with profile attributes |
| **Group** | Collection of users for organization |
| **AdminUnit** | Hierarchical organizational unit |
| **ServiceAccount** | Non-human identity for M2M auth |
| **UserIdentity** | Linked external identity (social, SSO) |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 98 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// User operations
import { makeCreateUserUC, makeUpdateUserUC, makeDeactivateUserUC } from '@rottay/identity';

// Group management
import { makeCreateGroupUC, makeAddUserToGroupUC } from '@rottay/identity';

// SCIM provisioning
import { makeScimCreateUserUC, makeScimSyncDirectoryUC } from '@rottay/identity';

// Service accounts
import { makeCreateServiceAccountUC, makeRotateCredentialsUC } from '@rottay/identity';
```

## Session 2026-02-06 Changes

- **Admin units fully exported**: AdminUnit use cases and types are now properly exported from `@rottay/identity` barrel, making them consumable by app-platform
- **14 foreign keys added**: Cross-module referential integrity enforced at DB level across auth, identity, tenancy, and permissions tables

## Database Tables

All tables use the `identity_` prefix. Schema files located in `platform/packages/platform/identity/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| User | `identity_users` | id, tenant_id, email, first_name, last_name, phone, avatar_url, status, is_active, created_at, updated_at | Core user profiles. |
| Group | `identity_groups` | id, tenant_id, name, description, type, parent_id, is_active | Organizational groups with hierarchy. |
| GroupMember | `identity_group_members` | id, tenant_id, group_id, user_id, role, is_active | User-to-group assignments. |
| ScimConfiguration | `identity_scim_configurations` | id, tenant_id, provider, endpoint_url, token_hash, sync_interval, last_sync_at, is_active | SCIM directory sync configuration. |
| DirectorySyncLog | `identity_directory_sync_logs` | id, tenant_id, scim_config_id, operation, status, users_created, users_updated, error, created_at | Directory sync operation logs. |
| ServiceAccount | `identity_service_accounts` | id, tenant_id, name, description, client_id, client_secret_hash, scopes, is_active | M2M service accounts with rotatable credentials. |
| AdministrativeUnit | `identity_administrative_units` | id, tenant_id, name, description, parent_id, type, is_active | Hierarchical organizational units. |
| AdminUnitMember | `identity_admin_unit_members` | id, tenant_id, admin_unit_id, user_id, role, is_active | User-to-admin-unit assignments. |
| PseudonymMapping | `identity_pseudonym_mappings` | id, tenant_id, user_id, pseudonym, context, created_at | GDPR pseudonymization mappings. |
| ErasureAudit | `identity_erasure_audit` | id, tenant_id, user_id, request_id, data_category, action, status, completed_at | GDPR right-to-erasure audit trail. |
| AnonymizationAudit | `identity_anonymization_audit` | id, tenant_id, user_id, fields_anonymized, reason, performed_by, created_at | Data anonymization audit trail. |

## Related Modules

- [Auth](../auth/) - Authentication after identity is established
- [Permissions](../permissions/) - RBAC for identity-based access control
- [Tenancy](../tenancy/) - Multi-tenant user assignments
- [Compliance](../compliance/) - GDPR, privacy for user data
