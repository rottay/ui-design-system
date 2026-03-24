# Navigation Module - Use Cases

> **Navigation System: Menus, Routes, Access Control, Breadcrumbs**

**Total: 50 use cases (25 mutations, 25 queries)**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [menus](#navigation-entitiesmenus) - Menu CRUD, cloning, translations
  - [routes](#navigation-entitiesroutes) - Route CRUD
  - [policies](#access-authorizationpolicies) - Policy CRUD and role/permission assignment
  - [versions](#version-history) - Menu version rollback
  - [cache](#cache) - Cache management
- [Queries](#queries)
  - [menus](#navigation-entitiesmenus-1) - Menu retrieval and search
  - [routes](#navigation-entitiesroutes-1) - Route retrieval and access
  - [policies](#access-authorizationpolicies-1) - Policy queries
  - [versions](#version-history-1) - Menu version queries
  - [cache](#cache-1) - Cache statistics
- [Entities](#entities)
- [Related](#related)

---

## Overview

The **Navigation Module** provides comprehensive navigation infrastructure for the platform, including:

- **Menu Management**: Hierarchical menu trees with support for cloning, translations, and feature flags
- **Route Management**: Route definitions, path-based lookups, and search
- **Access Control**: Policy-based authorization with role and permission checks
- **Version Control**: Menu versioning with rollback capabilities
- **Performance**: Built-in caching with statistics, invalidation, and warming

This module integrates with the Auth module for role/permission validation and provides the foundation for building dynamic, permission-aware navigation systems.

---

## Mutations

### navigation-entities/menus
| Use Case | Class | Description |
|----------|-------|-------------|
| create-menu | `CreateMenuUC` | Creates a new menu |
| update-menu | `UpdateMenuUC` | Updates an existing menu |
| delete-menu | `DeleteMenuUC` | Deletes a menu |
| archive-menu | `ArchiveMenuM` | Archives a menu |
| publish-menu | `PublishMenuM` | Publishes a menu |
| clone-menu-tree | `CloneMenuTreeUC` | Clones complete menu tree |
| move-menu-branch | `MoveMenuBranchUC` | Moves menu branch |
| set-menu-translation | `SetMenuTranslationM` | Configures menu translation |
| link-menu-route | `LinkMenuRouteUC` | Links menu with route |
| unlink-menu-route | `UnlinkMenuRouteUC` | Unlinks menu from route |
| assign-role-to-menu | `AssignRoleToMenuUC` | Assigns role to menu (visibility control) |
| revoke-role-from-menu | `RevokeRoleFromMenuUC` | Revokes role from menu |

> **Note:** `UC` = UseCase, `M` = Mutation

### navigation-entities/routes
| Use Case | Class | Description |
|----------|-------|-------------|
| create-route | `CreateRouteUC` | Creates a new route |
| update-route | `UpdateRouteUC` | Updates a route |
| delete-route | `DeleteRouteUC` | Deletes a route |

### access-authorization/policies
| Use Case | Class | Description |
|----------|-------|-------------|
| create-route-policy | `CreateRoutePolicyUC` | Creates route policy |
| update-route-policy | `UpdateRoutePolicyUC` | Updates route policy |
| delete-route-policy | `DeleteRoutePolicyUC` | Deletes route policy |
| assign-role-to-policy | `AssignRoleToPolicyUC` | Assigns role to policy |
| revoke-role-from-policy | `RevokeRoleFromPolicyUC` | Revokes role from policy |
| assign-permission-to-policy | `AssignPermissionToPolicyUC` | Assigns permission to policy |
| revoke-permission-from-policy | `RevokePermissionFromPolicyUC` | Revokes permission from policy |

### version-history
| Use Case | Class | Description |
|----------|-------|-------------|
| rollback-menu-to-version | `RollbackMenuToVersionUC` | Rolls back menu to previous version |

### cache
| Use Case | Class | Description |
|----------|-------|-------------|
| invalidate-menu-cache | `InvalidateMenuCacheUC` | Invalidates menu cache |
| warm-menu-cache | `WarmMenuCacheUC` | Warms menu cache |

---

## Queries

### navigation-entities/menus
| Use Case | Class | Description |
|----------|-------|-------------|
| find-many-menus | `FindManyMenusQ` | Lists menus |
| find-menu-by-id | `FindMenuByIdQ` | Gets menu by ID |
| find-menu-by-name | `FindMenuByNameQ` | Gets menu by name |
| get-menu-hierarchy | `GetMenuHierarchyQ` | Gets menu tree hierarchy |
| build-user-menu | `BuildUserMenuQ` | Builds menu filtered by user permissions |
| get-menus-by-role | `GetMenusByRoleQ` | Gets menus by role |
| find-menu-routes | `FindMenuRoutesQ` | Finds menu routes |
| validate-menu-structure | `ValidateMenuStructureQ` | Validates menu structure |
| find-menu-roles | `FindMenuRolesQ` | Finds roles assigned to a menu |
| search-menus | `SearchMenusQ` | Searches menus by keyword/filter |

### navigation-entities/routes
| Use Case | Class | Description |
|----------|-------|-------------|
| find-many-routes | `FindManyRoutesQ` | Lists routes |
| find-route-by-id | `FindRouteByIdQ` | Gets route by ID |
| find-route-by-pattern | `FindRouteByPatternQ` | Gets route by URL pattern |
| search-routes | `SearchRoutesQ` | Searches routes |
| get-user-accessible-routes | `GetUserAccessibleRoutesQ` | Gets accessible routes for user |
| check-route-access | `CheckRouteAccessQ` | Verifies route access |

### access-authorization/policies
| Use Case | Class | Description |
|----------|-------|-------------|
| find-route-policies | `FindRoutePoliciesQ` | Lists route policies |
| find-route-policy-by-id | `FindRoutePolicyByIdQ` | Gets policy by ID |
| search-route-policies | `SearchRoutePoliciesQ` | Searches route policies |
| find-policy-roles | `FindPolicyRolesQ` | Finds policy roles |
| find-policy-permissions | `FindPolicyPermissionsQ` | Finds policy permissions |

### version-history
| Use Case | Class | Description |
|----------|-------|-------------|
| get-menu-version-history | `GetMenuVersionHistoryQ` | Gets menu version history |
| get-menu-at-version | `GetMenuAtVersionQ` | Gets menu at specific version |
| compare-menu-versions | `CompareMenuVersionsQ` | Compares menu versions |

### cache
| Use Case | Class | Description |
|----------|-------|-------------|
| get-cache-stats | `GetCacheStatsQ` | Gets cache statistics |

---

## Access Check Flow

```typescript
// 1. User navigates to a route
const canAccess = await checkRouteAccess.execute({
  routePath: '/dashboard/settings',
  userId: context.userId,
}, context);

// 2. System verifies:
// - If the route exists
// - If there are associated policies
// - If the user has required roles/permissions
```

---

## Menu Tree Structure

```typescript
interface MenuNode {
  id: string;
  key: string;
  label: string;
  icon?: string;
  routeId?: string;
  children: MenuNode[];
  featureFlag?: string;
  isActive: boolean;
  order: number;
}
```

---

## Entities

| Entity | Description |
|--------|-------------|
| `Menu` | Hierarchical menu item with label, icon, and optional route link |
| `Route` | URL path definition with metadata |
| `RoutePolicy` | Access control policy for routes |
| `MenuRole` | Association between menu and role |
| `MenuRoute` | Association between menu and route |
| `PolicyRole` | Association between policy and role |
| `PolicyPermission` | Association between policy and permission |
| `MenuVersion` | Versioned snapshot of menu state |

---

## Related

| Module | Relationship |
|--------|-------------|
| [Auth](../auth/USE-CASES.md) | Provides roles and permissions for access control |
| [Tenancy](../tenancy/USE-CASES.md) | Multi-tenant menu configurations |
| [Feature Flags](../feature-flags/USE-CASES.md) | Conditional menu visibility |
