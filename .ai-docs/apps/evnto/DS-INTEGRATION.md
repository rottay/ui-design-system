# Evnto DS Integration

> How app-evnto uses @rottay/design-system: patterns, hooks, engine flow.

## Overview

Evnto is a ticketing and event management platform with three domain modules (Events, Staff, Bar).
It has the most mature DS Surface integration in the monorepo, with 154 files importing from
`@rottay/design-system`, 27 config factories, and 24 surface config tests.

## DS Configuration

| Setting | Value |
|---------|-------|
| **vertical** | `"evnto"` |
| **productProfile** | `EVNTO_PRODUCT_PROFILE` (from `@/lib/theme`) |
| **default tenant** | `"evnto"` (rottay maps to evnto) |
| **toast position** | `"bottom-right"` |
| **locale** | Session-based via `toSupportedLocale()` |

## Surface Patterns Used

### ListSurface with Config Factories
Evnto uses `createListSurfaceConfig<T>()` from DS to build list configurations.
Config factories are pure functions in separate `config.tsx` files, testable without React.

**Pattern**:
```
config.tsx   -> pure function returning ListSurfaceConfig<View>
index.tsx    -> screen component that calls config(), passes to <ListSurface />
__tests__/   -> tests that call config() and assert structure
adapter.ts   -> EntityAdapter<Raw, View> mapping
```

**Modules using ListSurface configs**:
- events/list, products/list, suppliers/list, purchasing/list
- staff/list, staffing/list, venues/list, artists/list
- bar/orders, payroll/periods, time-tracking/main, credentials/main
- scheduling/calendar

### DetailSurface with Config Factories
Detail pages use `DetailSurfaceConfig<T>` for structured detail views.

**Modules using DetailSurface configs**:
- products/detail, staff/detail, events/detail

### DashboardSurface
Used for the organizer dashboard (`dashboard/organizer/`).
- Config factory in `organizer/config.ts`
- Presets in `_shared/presets.ts`
- Fully tested (`__tests__/organizer-dashboard-config.test.ts`)

Also used for:
- `bar/dashboard` (bar metrics and orders overview)
- `inventory/dashboard` (stock levels and alerts)

### FormSurface
One reference implementation exists: `venues/create/index.tsx` (VenueCreateSurfaceScreen).
Other forms remain app-owned using React Hook Form (explicit architectural decision -- see CLAUDE.md).

### Custom Surface Screens
Many screens are custom but still use DS components and `useSurfacePermissions()`:
- Event control room, live view, lineup, waitlist, resale, finance, media, report
- Bar POS, order detail
- Staff command center, schedule
- Analytics (profitability, consumption, portfolio)
- Finance workbench, procurement console
- VIP tables workbench and config studio

## Permission System

File: `app-evnto/src/surfaces/_shared/permissions/`

### Permission Maps (`permission-maps.ts`)
Domain-specific action permission maps:
- Event permissions (create, edit, delete, publish, archive, manage-tickets, manage-lineup)
- Staff permissions (create, edit, delete, manage-schedule, manage-credentials, manage-payroll)
- Bar permissions (create-order, edit-order, manage-products, manage-inventory, manage-suppliers)
- Purchasing permissions
- Analytics permissions (view, export)
- Settings permissions

### useSurfacePermissions Hook
- Takes `{ actions: ActionPermissionMap }` as input
- Reads user permissions from `useAuth()` context
- Calls `computePermissions()` (pure function, tested in `__tests__/compute-permissions.test.ts`)
- Returns `{ permissions }` object with boolean flags per action

### Route Guard (`route-guard.tsx`)
- Route-level permission guard component

## Adapter Pattern

Evnto has the richest adapter ecosystem with both list and detail adapters:

| Domain | List Adapter | Detail Adapter |
|--------|-------------|----------------|
| events | eventListAdapter | eventDetailAdapter |
| staff | staffListAdapter | staffDetailAdapter |
| products | productListAdapter | productDetailAdapter |
| suppliers | supplierListAdapter | supplierDetailAdapter |
| bar | barOrderAdapter | (barDashboardAdapter for dashboard) |
| scheduling | scheduleViewAdapter | (shiftViewAdapter for shifts) |
| payroll | payrollPeriodAdapter | settlementAdapter |
| inventory | stockItemAdapter | alertAdapter |
| purchasing | purchaseOrderAdapter | -- |
| staffing | staffingListAdapter | -- |
| time-tracking | timeEntryAdapter | -- |
| credentials | credentialAdapter | -- |
| venues | venueListAdapter | -- |
| artists | artistListAdapter | -- |
| season-passes | seasonPassAdapter | -- |
| check-in | checkInAdapter | -- |
| vip-tables | vipReservationAdapter | vipDashboardAdapter + mapAlert |

## Test Coverage

Evnto has the best surface config test coverage across all apps:

| Module | Test File | What It Tests |
|--------|-----------|---------------|
| artists | `artists-list-config.test.ts` | ListSurfaceConfig structure |
| bar | `bar-orders-config.test.ts` | Orders list config |
| bar | `bar-dashboard-config.test.ts` | Dashboard config |
| credentials | `credentials-config.test.ts` | Credentials config |
| dashboard | `organizer-dashboard-config.test.ts` | Dashboard config |
| events | `events-list-config.test.ts` | Events list config |
| events | `event-detail-config.test.ts` | Event detail config |
| events | `event-upsert-config.test.ts` | Create/edit form config |
| inventory | `inventory-dashboard-config.test.ts` | Inventory dashboard |
| payroll | `payroll-periods-config.test.ts` | Payroll periods list |
| products | `products-list-config.test.ts` | Products list config |
| products | `product-detail-config.test.ts` | Product detail (DetailSurfaceConfig) |
| purchasing | `purchasing-list-config.test.ts` | Purchasing list |
| scheduling | `scheduling-calendar-config.test.ts` | Calendar config |
| settings | `settings-config.test.ts` | Settings tabs config |
| staff | `staff-list-config.test.ts` | Staff list config |
| staff | `staff-detail-config.test.ts` | Staff detail config |
| staff | `staff-create-config.test.ts` | Staff create form config |
| staffing | `staffing-list-config.test.ts` | Staffing list config |
| suppliers | `suppliers-list-config.test.ts` | Suppliers list config |
| time-tracking | `time-tracking-config.test.ts` | Time tracking list config |
| venues | `venues-list-config.test.ts` | Venues list config |
| auth | `login-config.test.ts` | Login page config |
| _shared | `compute-permissions.test.ts` | Permission computation |

**Total: 24 surface config tests**

## DS Components Most Used

Based on import analysis across 154 files:

1. **Box, Flex, Text, Stack** -- Layout primitives (nearly every file)
2. **Card** -- Content containers
3. **Button** -- Actions and CTAs
4. **Table, Tag, Badge** -- Data display
5. **Grid, GridItem** -- Grid layouts
6. **Input, Select, Form, Switch** -- Form elements
7. **Modal, Spinner, Empty, Divider** -- Feedback and decoration
8. **Avatar, Tabs, Popconfirm** -- Complex components
9. **useSurfacePermissions** -- Permission gating (from _shared)
10. **ListSurface, DetailSurface, DashboardSurface** -- Surface containers
11. **createListSurfaceConfig** -- Config factory helper
12. **EntityAdapter** -- Type for adapters

## Shell Architecture

The dashboard layout shell is **intentionally app-owned** (explicit decision documented in CLAUDE.md):
- Sidebar has app-specific navigation (Events, Staff, Bar, Analytics, Settings)
- Header integrates CommandPalette (Cmd+K), ActionDock, PasskeyPrompt
- BreadcrumbProvider uses app-specific context
- Components in `src/components/_shared/layout/` are permanent infrastructure

## Settings Pattern

Settings uses a single `SettingsSurfaceScreen` with 5 tab components:
- `tabs/integrations-tab/` -- External service integrations
- `tabs/notifications-tab/` -- Notification preferences
- `tabs/payments-tab/` -- Payment gateway config
- `tabs/security-tab/` -- Security settings
- `tabs/team-tab/` -- Team member management

All settings routes (`/settings/*`) import the same surface component; the URL determines which tab renders.
