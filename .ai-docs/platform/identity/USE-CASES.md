# Identity Module - Use Cases

> **Identity Management: Users, Groups, SCIM, B2B/B2C, Service Accounts**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [users](#users) - Create, update, activate users
  - [user-lifecycle](#user-lifecycle) - User activation lifecycle
  - [groups](#groups) - User group management
  - [admin-units](#admin-units) - Administrative units
  - [b2b-b2c](#b2b-b2c) - Guest users, B2B invitations
  - [scim](#scim) - SCIM provisioning
  - [service-accounts](#service-accounts) - Machine-to-machine
  - [merge](#merge) - Identity linking and merging
  - [profile-ops](#profile-ops) - Profile enrichment
  - [profile-mastering](#profile-mastering) - Attribute source management
  - [webhooks](#webhooks) - Webhook processing
  - [privacy](#privacy) - Privacy and data protection
- [Queries](#queries)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The Identity module manages all user identity concerns including user profiles, groups, organizational units, and service accounts. It supports both B2B (enterprise) and B2C (consumer) identity patterns, SCIM 2.0 provisioning for enterprise directory sync, and advanced features like identity merging and profile enrichment.

**Stats:**
- **Total:** 77 use cases (45 mutations, 32 queries)
- **Entities:** User, Group, AdminUnit, ServiceAccount, UserIdentity

**Key Features:**
- User lifecycle management (create, update, activate, deactivate)
- Group-based organization
- SCIM 2.0 directory synchronization
- B2B guest invitations and conversion
- Service accounts for M2M authentication
- Profile merging and identity linking
- Bulk operations for large-scale management
- Privacy operations (anonymization, erasure, pseudonymization)

---

## Mutations

### users

> Core user operations: create, update, deactivate.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-user` | Create new user profile | `CreateUserUC` | `makeCreateUserUseCase()` |
| `update-user` | Update user profile data | `UpdateUserUC` | `makeUpdateUserUseCase()` |
| `deactivate-user` | Deactivate user account | `DeactivateUserUC` | `makeDeactivateUserUseCase()` |
| `add-user-to-group` | Add user to group | `AddUserToGroupM` | `makeAddUserToGroupMutation()` |
| `remove-user-from-group` | Remove user from group | `RemoveUserFromGroupM` | `makeRemoveUserFromGroupMutation()` |
| `sync-group-membership` | Sync group membership from external source | `SyncGroupMembershipM` | `makeSyncGroupMembershipMutation()` |
| `convert-guest-to-member` | Convert guest to full member | `ConvertGuestToMemberUC` | `makeConvertGuestToMemberUseCase()` |
| `invite-b2b-guest` | Invite external guest user | `InviteB2BGuestUC` | `makeInviteB2BGuestUseCase()` |

> **Note:** `UC` = UseCase, `M` = Mutation

---

### user-lifecycle

> User activation lifecycle management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `activate-user` | Activate user account | `ActivateUserUC` | `makeActivateUserUseCase()` |

---

### groups

> User group management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-group` | Create new user group | `CreateGroupM` | `makeCreateGroupMutation()` |
| `update-group` | Update group details | `UpdateGroupM` | `makeUpdateGroupMutation()` |
| `delete-group` | Soft delete user group | `DeleteGroupM` | `makeDeleteGroupMutation()` |

---

### admin-units

> Administrative unit management for organizational hierarchy.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-admin-unit` | Create administrative unit | `CreateAdminUnitM` | `makeCreateAdminUnitMutation()` |
| `update-admin-unit` | Update administrative unit | `UpdateAdminUnitM` | `makeUpdateAdminUnitMutation()` |
| `delete-admin-unit` | Delete administrative unit | `DeleteAdminUnitM` | `makeDeleteAdminUnitMutation()` |
| `add-member-to-unit` | Add member to admin unit | `AddMemberToUnitM` | `makeAddMemberToUnitMutation()` |
| `remove-member-from-unit` | Remove member from admin unit | `RemoveMemberFromUnitM` | `makeRemoveMemberFromUnitMutation()` |

---

### scim

> SCIM 2.0 provisioning operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-scim-configuration` | Create SCIM configuration | `CreateScimConfigurationUC` | `makeCreateScimConfigurationUseCase()` |
| `update-scim-configuration` | Update SCIM configuration | `UpdateScimConfigurationUC` | `makeUpdateScimConfigurationUseCase()` |
| `delete-scim-configuration` | Delete SCIM configuration | `DeleteScimConfigurationUC` | `makeDeleteScimConfigurationUseCase()` |
| `scim-create-user` | Create user via SCIM | `ScimCreateUserUC` | `makeScimCreateUserUseCase()` |
| `scim-update-user` | Update user via SCIM | `ScimUpdateUserUC` | `makeScimUpdateUserUseCase()` |
| `scim-delete-user` | Delete user via SCIM | `ScimDeleteUserUC` | `makeScimDeleteUserUseCase()` |
| `scim-create-group` | Create group via SCIM | `ScimCreateGroupUC` | `makeScimCreateGroupUseCase()` |
| `scim-update-group` | Update group via SCIM | `ScimUpdateGroupUC` | `makeScimUpdateGroupUseCase()` |
| `scim-patch-group` | Patch group via SCIM | `ScimPatchGroupUC` | `makeScimPatchGroupUseCase()` |
| `scim-delete-group` | Delete group via SCIM | `ScimDeleteGroupUC` | `makeScimDeleteGroupUseCase()` |

---

### service-accounts

> Service accounts for machine-to-machine authentication.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-service-account` | Create service account | `CreateServiceAccountUC` | `makeCreateServiceAccountUseCase()` |
| `update-service-account` | Update service account | `UpdateServiceAccountUC` | `makeUpdateServiceAccountUseCase()` |
| `delete-service-account` | Delete service account | `DeleteServiceAccountUC` | `makeDeleteServiceAccountUseCase()` |
| `rotate-credentials` | Rotate service account credentials | `RotateCredentialsUC` | `makeRotateServiceAccountCredentialsUseCase()` |

---

### merge

> Identity linking and profile merging.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `link-user-identities` | Link multiple identities to user | `LinkUserIdentitiesUC` | `makeLinkUserIdentitiesUseCase()` |
| `unlink-user-identity` | Unlink identity from user | `UnlinkUserIdentityUC` | `makeUnlinkUserIdentityUseCase()` |
| `merge-user-profiles` | Merge duplicate user profiles | `MergeUserProfilesUC` | `makeMergeUserProfilesUseCase()` |

---

### profile-ops

> Profile enrichment and validation.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `enrich-profile` | Enrich profile with external data | `EnrichProfileUC` | `makeEnrichProfileUseCase()` |
| `normalize-profile-data` | Normalize profile data format | `NormalizeProfileDataUC` | `makeNormalizeProfileDataUseCase()` |
| `validate-profile-data` | Validate profile completeness | `ValidateProfileDataUC` | `makeValidateProfileDataUseCase()` |

---

### profile-mastering

> Attribute source management for federated profiles.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `set-attribute-source` | Set authoritative source for attribute | `SetAttributeSourceUC` | `makeSetAttributeSourceUseCase()` |
| `resolve-attribute-conflict` | Resolve conflicting attribute values | `ResolveAttributeConflictUC` | `makeResolveAttributeConflictUseCase()` |

---

### webhooks

> Identity event webhook processing.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `process-webhook-event` | Process incoming webhook event | `ProcessWebhookEventUC` | `makeProcessWebhookEventUseCase()` |
| `retry-failed-webhooks` | Retry failed webhook deliveries | `RetryFailedWebhooksUC` | `makeRetryFailedWebhooksUseCase()` |

---

### privacy

> Privacy and data protection operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `anonymize-user-data` | Anonymize user personal data | `AnonymizeUserDataUC` | `makeAnonymizeUserDataUseCase()` |
| `process-erasure-request` | Process right to erasure request | `ProcessErasureRequestUC` | `makeProcessErasureRequestUseCase()` |
| `execute-data-retention-policy` | Execute data retention policy | `ExecuteDataRetentionPolicyUC` | `makeExecuteDataRetentionPolicyUseCase()` |
| `pseudonymize-pii` | Pseudonymize personally identifiable information | `PseudonymizePiiUC` | `makePseudonymizePiiUseCase()` |

---

## Queries

### users

> Query user information.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-user-by-id` | Find user by ID | `FindUserByIdQ` | `makeFindUserByIdQuery()` |
| `find-user-by-email` | Find user by email | `FindUserByEmailQ` | `makeFindUserByEmailQuery()` |
| `list-users` | List all users | `ListUsersQ` | `makeListUsersQuery()` |
| `search-users` | Search users by criteria | `SearchUsersQ` | `makeSearchUsersQuery()` |
| `get-user-statistics` | Get user statistics | `GetUserStatisticsQ` | `makeGetUserStatisticsQuery()` |
| `count-users-by-filter` | Count users matching filter | `CountUsersByFilterQ` | `makeCountUsersByFilterQuery()` |
| `list-guest-users` | List guest users | `ListGuestUsersQ` | `makeListGuestUsersQuery()` |
| `get-user-groups` | Get groups a user belongs to | `GetUserGroupsQ` | `makeGetUserGroupsQuery()` |

---

### groups

> Query group information.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-groups` | List all groups | `ListGroupsQ` | `makeListGroupsQuery()` |
| `get-group-by-id` | Get group by ID | `GetGroupByIdQ` | `makeGetGroupByIdQuery()` |
| `get-group-members` | Get members of a group | `GetGroupMembersQ` | `makeGetGroupMembersQuery()` |

---

### admin-units

> Query administrative units.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-admin-units` | List administrative units | `ListAdminUnitsQ` | `makeListAdminUnitsQuery()` |
| `get-unit-members` | Get members of admin unit | `GetUnitMembersQ` | `makeGetUnitMembersQuery()` |

---

### advanced-search

> Advanced user search capabilities.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `advanced-search-users` | Full-text search with filters | `AdvancedSearchUsersQ` | `makeAdvancedSearchUsersQuery()` |
| `get-users-by-filter` | Get users by complex filter | `GetUsersByFilterQ` | `makeGetUsersByFilterQuery()` |
| `search-by-attribute` | Search by specific attribute | `SearchByAttributeQ` | `makeSearchByAttributeQuery()` |
| `search-by-custom-field` | Search by custom field | `SearchByCustomFieldQ` | `makeSearchByCustomFieldQuery()` |

---

### scim

> SCIM query operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-scim-configurations` | List SCIM configurations | `ListScimConfigurationsQ` | `makeListScimConfigurationsQuery()` |
| `get-scim-configuration-by-id` | Get SCIM configuration by ID | `GetScimConfigurationByIdQ` | `makeGetScimConfigurationByIdQuery()` |
| `scim-list-users` | List users via SCIM | `ScimListUsersQ` | `makeScimListUsersQuery()` |
| `scim-get-user` | Get user via SCIM | `ScimGetUserQ` | `makeScimGetUserQuery()` |
| `scim-list-groups` | List groups via SCIM | `ScimListGroupsQ` | `makeScimListGroupsQuery()` |
| `scim-get-group` | Get group via SCIM | `ScimGetGroupQ` | `makeScimGetGroupQuery()` |

---

### service-accounts

> Query service accounts.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-service-accounts` | List service accounts | `ListServiceAccountsQ` | `makeListServiceAccountsQuery()` |
| `get-service-account-by-id` | Get service account by ID | `GetServiceAccountByIdQ` | `makeGetServiceAccountByIdQuery()` |

---

### merge

> Query for duplicate detection.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-duplicate-users` | Find potential duplicate users | `FindDuplicateUsersQ` | `makeFindDuplicateUsersQuery()` |

---

### privacy

> Privacy-related queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `export-user-data` | Export user data (GDPR) | `ExportUserDataQ` | `makeExportUserDataQuery()` |
| `generate-dpia-report` | Generate DPIA report | `GenerateDpiaReportQ` | `makeGenerateDpiaReportQuery()` |

---

### profile-ops

> Profile analysis queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-profile-completeness` | Calculate profile completeness | `GetProfileCompletenessQ` | `makeGetProfileCompletenessQuery()` |
| `suggest-profile-updates` | Suggest profile improvements | `SuggestProfileUpdatesQ` | `makeSuggestProfileUpdatesQuery()` |

---

### profile-mastering

> Query attribute sources.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-attribute-sources` | Get attribute source mapping | `GetAttributeSourcesQ` | `makeGetAttributeSourcesQuery()` |

---

### webhooks

> Query webhook history.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-webhook-event-history` | Get webhook event history | `GetWebhookEventHistoryQ` | `makeGetWebhookEventHistoryQuery()` |

---

## Entities

| Entity | Description |
|--------|-------------|
| **User** | Core user profile and attributes |
| **Group** | User groups for organization |
| **AdminUnit** | Administrative units for hierarchy |
| **ServiceAccount** | Machine-to-machine service accounts |
| **UserIdentity** | Linked external identities (social, SSO) |

---

## Related

- [Auth Module](../auth/USE-CASES.md) - Authentication and login
- [Permissions Module](../permissions/USE-CASES.md) - RBAC and access control
- [Tenancy Module](../tenancy/USE-CASES.md) - Multi-tenant user assignment
- [Compliance Module](../compliance/USE-CASES.md) - GDPR, privacy compliance
