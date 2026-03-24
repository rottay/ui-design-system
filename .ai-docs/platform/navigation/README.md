# Navigation Module

> **Dynamic navigation system with role-based access control**

## What It Does

The Navigation module manages the application's menu structure, routes, and navigation access control. It provides a hierarchical menu system that can be dynamically filtered based on user roles and permissions.

The module supports versioned menus with rollback capabilities, feature flag integration for conditional menu items, multi-language translations, and user favorites for quick access. Route policies enforce access control at the navigation level.

## When to Use

- **Menu Management**: Create and organize menu hierarchies
- **Route Access**: Define route-based access policies
- **User Favorites**: Manage user navigation shortcuts
- **Navigation History**: Track user navigation patterns
- **Breadcrumbs**: Generate navigation breadcrumbs
- **Menu Versioning**: Version control for menu changes

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Menu** | Hierarchical menu structure |
| **Route** | Application route definition |
| **RoutePolicy** | Access rules for routes |
| **Favorite** | User's saved navigation items |
| **MenuVersion** | Versioned menu snapshots |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 74 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Menu management
import { makeCreateMenuUC, makeUpdateMenuUC, makePublishMenuUC } from '@rottay/navigation';

// Route policies
import { makeCreateRoutePolicyUC, makeAssignRoleToPolicyUC } from '@rottay/navigation';

// Access checking
import { makeCheckRouteAccessUC, makeGetAccessibleRoutesUC } from '@rottay/navigation';

// User navigation
import { makeGetFilteredMenuTreeUC, makeGetBreadcrumbsUC } from '@rottay/navigation';
```

## Menu Structure

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
}
```

## Session 2026-02-06 Changes

- **Dead code cleaned**: Removed `NAVIGATION_DI_TYPES`, `NavigationControlUtils`, legacy DI container, and deprecated middleware aliases. These were vestiges of the pre-hexagonal architecture and are no longer referenced by any consumer.

## Database Tables

All tables use the `navigation_` prefix. Schema files located in `platform/packages/platform/navigation/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Menu | `navigation_menus` | id, tenant_id, name, key, description, version, is_published, is_active | Hierarchical menu structures with versioning. |
| Route | `navigation_routes` | id, pattern, is_public, is_active, created_by, created_at | Application route definitions. |
| MenuRoute | `navigation_menu_routes` | id, tenant_id, menu_id, route_id, parent_id, label, icon, sort_order, feature_flag, is_active | Menu-to-route assignments with hierarchy. |
| MenuRole | `navigation_menu_roles` | id, tenant_id, menu_id, role_id, is_active | Role-based menu access control. |
| Favorite | `navigation_favorites` | id, tenant_id, user_id, route_id, label, sort_order, is_active | User navigation shortcuts. |
| NavigationHistory | `navigation_navigation_history` | id, tenant_id, user_id, route_id, path, visited_at | User navigation tracking. |
| RoutePolicy | `navigation_route_policies` | id, tenant_id, route_id, name, effect, is_active | Access rules for routes. |
| RoutePolicyPermission | `navigation_route_policy_permissions` | id, tenant_id, policy_id, permission_id, is_active | Permission requirements for route policies. |
| RoutePolicyRole | `navigation_route_policy_roles` | id, tenant_id, policy_id, role_id, is_active | Role requirements for route policies. |

## Related Modules

- [Permissions](../permissions/) - Role-based menu filtering
- [Feature Flags](../feature-flags/) - Conditional menu items
- [Auth](../auth/) - User context for navigation
