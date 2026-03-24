# Evnto Surface Catalog

> Generated 2026-03-23. Covers every module under `app-evnto/src/surfaces/`.

## Architecture Overview

Evnto surfaces follow a **Config Factory + Surface Component** pattern:

1. **Adapter** (`_shared/adapter.ts`) - `EntityAdapter<Raw, View>` maps domain entities to view models with canonical `fieldId`s
2. **Config** (`{surface}/config.ts(x)`) - Pure function returning a `*SurfaceConfig` object (visual + presentation + behavior + permissions)
3. **Screen** (`{surface}/index.tsx`) - `"use client"` component that fetches data, calls the config factory, renders the DS surface
4. **Barrel** (`index.ts`) - Re-exports all screen components for the route layer

Config patterns used:
- `createListSurfaceConfig<T>()` -> `<ListSurface>` (or `<PatternDataTable>` + `<StatsHeader>` hybrid)
- `DashboardSurfaceConfig` -> `<DashboardSurface>`
- `DetailSurfaceConfig<T>` -> `<DetailSurface>`
- `SchedulerSurfaceConfig` -> `<SchedulerSurface>`
- `OperationalSurfaceConfig<T>` -> `<OperationalSurface>`
- `SettingsSurfaceConfig` -> `<SettingsSurface>`
- `createFormSurfaceConfig()` -> `<FormSurface>` (1 reference implementation only)

---

## _shared (Global Surface Infrastructure)

| File | Lines | Description |
|------|-------|-------------|
| `index.ts` | 30 | Barrel: cell-renderers, FilterPills, permissions |
| `cell-renderers/index.tsx` | ~100 | `renderNameWithInitials`, `renderStatusDot`, `renderCurrencyCell`, `renderDateCell`, `renderProgressCell`, `renderTagsCell`, `renderContactCell` |
| `filter-pills/index.tsx` | ~50 | `FilterPills` component |
| `permissions/index.ts` | ~10 | Barrel for permission utilities |
| `permissions/types.ts` | ~30 | `EvntoPermission`, `RbacPayload`, `ComputePermissionsOptions/Result` |
| `permissions/compute-permissions.ts` | ~60 | `computePermissions()` - evaluates RBAC payload against surface rules |
| `permissions/use-surface-permissions.ts` | ~40 | `useSurfacePermissions()` hook - converts auth context to `SurfacePermissionsConfig` |
| `permissions/permission-maps.ts` | 312 | Domain-specific permission constants (events, staff, bar, inventory, finance, analytics, season-passes, check-in, artists, venues, purchasing, suppliers, scheduling, payroll, time-tracking, staffing, credentials, VIP tables, control room, settings) |
| `permissions/route-guard.tsx` | ~30 | `RouteGuard` component |
| `permissions/__tests__/compute-permissions.test.ts` | ~80 | Tests |

**Key patterns**: `useSurfacePermissions`, `FilterPills`, shared cell renderers

---

## analytics

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | Exports: `AnalyticsSurfaceScreen`, `ConsumptionIntelligenceSurface`, `ProfitabilitySurface`, `PortfolioIntelligenceSurface` |
| `main/index.tsx` | Screen | Analytics dashboard. Uses `useSurfacePermissions`, `StatsHeader`. Custom layout (not a DS surface). |
| `consumption/index.tsx` | Screen | Consumption Intelligence. Uses `useSurfacePermissions`, `StatsHeader`. Custom layout. |
| `profitability/index.tsx` | Screen | Event Profitability. Uses `useSurfacePermissions`, `StatsHeader`. Accepts `[eventId]` param. |
| `portfolio/index.tsx` | Screen | Portfolio Intelligence. Uses `StatsHeader`. Custom layout. |

**Config pattern**: No config factories. Screens compose DS primitives directly with `StatsHeader`.
**DS hooks**: `useSurfacePermissions`
**DS components**: `StatsHeader`

---

## artists

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `ArtistsListSurfaceScreen`, `ArtistDetailSurfaceScreen`, `createArtistsListConfig` |
| `_shared/adapter.ts` | Adapter | `artistListAdapter` (ArtistRaw -> ArtistListView). Fields: name, genre, status. 38 lines. |
| `list/config.tsx` | Config | `createArtistsListConfig()` -> `createListSurfaceConfig<ArtistListView>`. 131 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/index.tsx` | Screen | Artist detail view. |
| `__tests__/artists-list-config.test.ts` | Test | Config factory test. |

**Config pattern**: `createListSurfaceConfig` with `PatternDataTable` + `StatsHeader` hybrid rendering
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## auth

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `createLoginConfig` |
| `login/config.ts` | Config | `createLoginConfig()` - minimal config (chrome title, onSubmit, secondary actions). 24 lines. |
| `__tests__/login-config.test.ts` | Test | Config factory test. |

**Config pattern**: Custom minimal config (not a DS surface type)

---

## bar

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `BarDashboardSurfaceScreen`, `BarOrdersSurfaceScreen`, `BarOrderDetailSurfaceScreen`, `BarPOSSurfaceScreen`, `BarPOSDetailSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `barDashboardAdapter` (BarDashboardRaw -> BarDashboardView), `barOrderAdapter` (BarOrder -> BarOrderView). 105 lines. |
| `_shared/helpers.tsx` | Helpers | `formatCurrency`, `formatOrderDate`, `formatInteger`, `getOrderStatusVariant`, `getOrderStatusLabel` |
| `dashboard/config.ts` | Config | `createBarDashboardConfig()` -> `DashboardSurfaceConfig`. 50 lines. |
| `dashboard/index.tsx` | Screen | Uses `<DashboardSurface>` with `DashboardSurfaceSection` builders. |
| `orders/config.tsx` | Config | `createBarOrdersConfig()` -> `createListSurfaceConfig<BarOrderView>`. 122 lines. |
| `orders/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `order-detail/index.tsx` | Screen | Order detail custom layout. |
| `pos/index.tsx` | Screen | POS list with `StatsHeader`. |
| `pos-detail/index.tsx` | Screen | POS detail with `StatsHeader`. |
| `__tests__/bar-dashboard-config.test.ts` | Test | |
| `__tests__/bar-orders-config.test.ts` | Test | |

**Config pattern**: `DashboardSurfaceConfig` (dashboard), `createListSurfaceConfig` (orders)
**DS surfaces**: `<DashboardSurface>`, `PatternDataTable` + `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## check-in

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `CheckInSurfaceScreen`, `CheckInEventSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `checkInAdapter` (CheckInRaw -> CheckInView). 44 lines. |
| `main/index.tsx` | Screen | Event selection for check-in. Custom layout. |
| `event/index.tsx` | Screen | Per-event check-in with `StatsHeader`. |

**Config pattern**: No config factory. Custom layout with `StatsHeader`.

---

## credentials

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `CredentialsSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `credentialAdapter` (Credential -> CredentialView). 78 lines. |
| `main/config.ts` | Config | `createCredentialsConfig()` - minimal behavior config (primaryAction, rowActions). 37 lines. |
| `main/index.tsx` | Screen | Uses `StatsHeader`, `useSurfacePermissions`. Custom table layout. |
| `__tests__/credentials-config.test.ts` | Test | |

**Config pattern**: Custom minimal config
**DS components**: `StatsHeader`
**DS hooks**: `useSurfacePermissions`

---

## dashboard

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `OrganizerDashboardSurfaceScreen`, `DASHBOARD_PRESETS`, `PRESET_OPTIONS`, `getPresetDefinition` |
| `_shared/presets.ts` | Presets | 5 role-based dashboard presets: executive, operations, bar-manager, staffing, finance. 230 lines. KPI definitions with `getValue` functions. |
| `organizer/config.ts` | Config | `createOrganizerDashboardConfig()` -> `DashboardSurfaceConfig`. 47 lines. |
| `organizer/index.tsx` | Screen | Organizer dashboard v2. Uses `StatsHeader`. |
| `__tests__/organizer-dashboard-config.test.ts` | Test | |

**Config pattern**: `DashboardSurfaceConfig`
**DS components**: `StatsHeader`
**Unique to evnto**: 5 dashboard presets (executive, operations, bar-manager, staffing, finance)

---

## events

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | 14 exports: List, Detail, Upsert, Finance, Lineup, Live, Media, Resale, Tickets, Waitlist, ControlRoom, Clone, PostEventReport, DjPerformanceReport |
| `_shared/adapter.ts` | Adapter | `eventListAdapter`, `eventDetailAdapter`. EventListView (6 fields), EventDetailView (8 fields). 107 lines. |
| `_shared/helpers.tsx` | Helpers | `formatEventDateTimeRange`, `formatInteger`, `getEventStatusVariant` |
| `list/config.tsx` | Config | `createEventsListConfig()` -> `createListSurfaceConfig<EventListView>`. 153 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/config.ts` | Config | `createEventDetailConfig()` with tabbed permissions (finance, lineup, live, media, waitlist, resale). 75 lines. |
| `detail/index.tsx` | Screen | Event cockpit. Custom multi-tab layout. |
| `upsert/config.ts` | Config | `createEventUpsertConfig()` - create/edit form chrome. 29 lines. |
| `upsert/index.tsx` | Screen | Event create/edit form. |
| `control-room/config.ts` | Config | `createControlRoomConfig()` -> `OperationalSurfaceConfig<ControlRoomFeedItem>`. 76 lines. |
| `control-room/index.tsx` | Screen | Uses `<OperationalSurface>` with live feed, 3-panel layout, `DashboardSurfaceSection` builders. |
| `clone/index.tsx` | Screen | Event clone flow. |
| `finance/index.tsx` | Screen | Event finance tab. Uses `StatsHeader`. |
| `lineup/index.tsx` | Screen | Event lineup tab. Uses `StatsHeader`. |
| `live/index.tsx` | Screen | Live event monitoring. Uses `StatsHeader`. |
| `media/index.tsx` | Screen | Event media management. Uses `StatsHeader`. |
| `resale/index.tsx` | Screen | Ticket resale. Uses `StatsHeader`. |
| `tickets/index.tsx` | Screen | Ticket management. |
| `waitlist/index.tsx` | Screen | Event waitlist. |
| `report/index.tsx` | Screen | Post-event report. Uses `StatsHeader`. |
| `dj-report/index.tsx` | Screen | DJ performance report. Uses `StatsHeader`. |
| `__tests__/` | Tests | 3 test files (list, detail, upsert configs). |

**Config pattern**: `createListSurfaceConfig` (list), custom detail config, `OperationalSurfaceConfig` (control room)
**DS surfaces**: `<OperationalSurface>`, `PatternDataTable` + `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## finance

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `FinanceWorkbenchSurfaceScreen`, `createFinanceWorkbenchConfig` |
| `workbench/config.ts` | Config | `createFinanceWorkbenchConfig()` -> `DashboardSurfaceConfig`. 50 lines. |
| `workbench/index.tsx` | Screen | Finance Ops Workbench. Uses `StatsHeader`. |

**Config pattern**: `DashboardSurfaceConfig`

---

## inventory

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `InventoryDashboardSurfaceScreen`, `StockSurfaceScreen`, `MovementsSurfaceScreen`, `AlertsSurfaceScreen`, `LocationsSurfaceScreen`, `StockLedgerSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `stockItemAdapter`, `alertAdapter`, plus `InventoryDashboardView`. 124 lines. |
| `dashboard/config.ts` | Config | `createInventoryDashboardConfig()` -> `DashboardSurfaceConfig`. 50 lines. |
| `dashboard/index.tsx` | Screen | Uses `<DashboardSurface>` with `DashboardSurfaceSection` builders. |
| `stock/index.tsx` | Screen | Stock items view. |
| `movements/index.tsx` | Screen | Stock movements. |
| `alerts/index.tsx` | Screen | Stock alerts. |
| `locations/index.tsx` | Screen | Storage locations. |
| `ledger/index.tsx` | Screen | Stock ledger. Uses `StatsHeader`. |
| `__tests__/inventory-dashboard-config.test.ts` | Test | |

**Config pattern**: `DashboardSurfaceConfig`
**DS surfaces**: `<DashboardSurface>`

---

## onboarding

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `OnboardingSurfaceScreen` |
| `main/index.tsx` | Screen | Onboarding flow. Custom layout. |

**Config pattern**: No config factory

---

## payroll

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `PayrollPeriodsSurfaceScreen`, `PayrollSettlementsSurfaceScreen`, `SettlementOpsSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `payrollPeriodAdapter`, `settlementAdapter`. 120 lines. |
| `periods/config.tsx` | Config | `createPayrollPeriodsConfig()` -> `ListSurfaceConfig<PayrollPeriodView>`. Conditional rowActions (`visible`). 143 lines. |
| `periods/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `settlements/index.tsx` | Screen | Settlement list. Uses `StatsHeader`. |
| `settlement-ops/index.tsx` | Screen | Settlement operations dashboard. Uses `StatsHeader`. |
| `__tests__/payroll-periods-config.test.ts` | Test | |

**Config pattern**: `ListSurfaceConfig` with conditional row visibility
**DS components**: `PatternDataTable`, `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## products

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `ProductsListSurfaceScreen`, `ProductDetailSurfaceScreen`, `ProductCreateSurfaceScreen`, `ProductEditSurfaceScreen`, `ProductCategoriesSurfaceScreen`, `ProductCombosSurfaceScreen`, `ProductPricingSurfaceScreen`, `ProductRecipesSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `productListAdapter`, `productDetailAdapter`. 133 lines. |
| `_shared/helpers.tsx` | Helpers | `formatPrice`, `getProductStatusFromFlags`, `getProductStatusLabel`, `getProductStatusVariant`, `ProductStatusValue` |
| `list/config.tsx` | Config | `createProductsListConfig()` -> `createListSurfaceConfig<ProductListView>`. 172 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/config.ts` | Config | `createProductDetailConfig()` -> `DetailSurfaceConfig<ProductDetailView>`. Sidebar, tabs, status function. 95 lines. |
| `detail/index.tsx` | Screen | Uses `<DetailSurface>`. |
| `create/index.tsx` | Screen | Product create form. |
| `edit/index.tsx` | Screen | Product edit form. |
| `categories/index.tsx` | Screen | Product categories. |
| `combos/index.tsx` | Screen | Product combos. |
| `pricing/index.tsx` | Screen | Dynamic pricing. |
| `recipes/index.tsx` | Screen | Recipe management. |
| `__tests__/` | Tests | 2 test files. |

**Config pattern**: `createListSurfaceConfig` (list), `DetailSurfaceConfig` (detail)
**DS surfaces**: `<DetailSurface>`, `PatternDataTable` + `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## purchasing

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `PurchasingListSurfaceScreen`, `PurchasingDetailSurfaceScreen`, `PurchasingCreateSurfaceScreen`, `PurchasingReceiptsSurfaceScreen`, `ProcurementConsoleSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `purchaseOrderAdapter`. 63 lines. |
| `list/config.tsx` | Config | `createPurchasingListConfig()` -> `createListSurfaceConfig<PurchaseOrderView>`. 186 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/index.tsx` | Screen | Purchase order detail. |
| `create/index.tsx` | Screen | PO create form. |
| `receipts/index.tsx` | Screen | Receipt management. |
| `console/index.tsx` | Screen | Procurement console. Uses `StatsHeader`. |
| `__tests__/purchasing-list-config.test.ts` | Test | |

**Config pattern**: `createListSurfaceConfig`
**DS components**: `PatternDataTable`, `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## reports

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `ReportsHubSurfaceScreen` |
| `hub/index.tsx` | Screen | Reports hub. Custom layout. |

**Config pattern**: No config factory

---

## scheduling

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `SchedulingCalendarSurfaceScreen`, `SchedulingShiftsSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `scheduleViewAdapter`, `shiftViewAdapter`. 123 lines. |
| `calendar/config.ts` | Config | `createSchedulingCalendarConfig()` -> `SchedulerSurfaceConfig`. 62 lines. |
| `calendar/index.tsx` | Screen | Uses `<SchedulerSurface>`. |
| `shifts/index.tsx` | Screen | Shift list/management. |
| `__tests__/scheduling-calendar-config.test.ts` | Test | |

**Config pattern**: `SchedulerSurfaceConfig`
**DS surfaces**: `<SchedulerSurface>`
**DS hooks**: `useSurfacePermissions`

---

## season-passes

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `SeasonPassesSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `seasonPassAdapter`. 44 lines. |
| `main/index.tsx` | Screen | Season pass management. |

**Config pattern**: No config factory (uses adapter directly)

---

## settings

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `SettingsSurfaceScreen`, `createSettingsConfig` |
| `general/config.ts` | Config | `createSettingsConfig()` -> `SettingsSurfaceConfig`. 41 lines. |
| `general/index.tsx` | Screen | Uses `<SettingsSurface>`. |
| `tabs/index.ts` | Barrel | Re-exports tab components |
| `tabs/team-tab/index.tsx` | Tab | Team settings tab |
| `tabs/payments-tab/index.tsx` | Tab | Payment settings tab |
| `tabs/security-tab/index.tsx` | Tab | Security settings tab |
| `tabs/notifications-tab/index.tsx` | Tab | Notification settings tab |
| `tabs/integrations-tab/index.tsx` | Tab | Integrations settings tab |
| `__tests__/settings-config.test.ts` | Test | |

**Config pattern**: `SettingsSurfaceConfig`
**DS surfaces**: `<SettingsSurface>`

---

## staff

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `StaffListSurfaceScreen`, `StaffDetailSurfaceScreen`, `StaffCreateSurfaceScreen`, `StaffEditSurfaceScreen`, `StaffScheduleSurfaceScreen`, `StaffCommandSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `staffListAdapter`, `staffDetailAdapter`. 105 lines. |
| `_shared/helpers.ts` | Helpers | `getStaffStatusVariant`, `getStaffStatusLabel` |
| `list/config.tsx` | Config | `createStaffListConfig()` -> `ListSurfaceConfig<StaffListView>`. 144 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/config.ts` | Config | `createStaffDetailConfig()` -> `DetailSurfaceConfig<StaffDetailView>`. Sidebar, tabs, status. 105 lines. |
| `detail/index.tsx` | Screen | Uses `<DetailSurface>`. |
| `create/config.ts` | Config | `createStaffCreateConfig()` - minimal form chrome. 28 lines. |
| `create/index.tsx` | Screen | Staff create form. |
| `edit/index.tsx` | Screen | Staff edit form. |
| `schedule/index.tsx` | Screen | Staff individual schedule. |
| `command/config.ts` | Config | `createStaffCommandConfig()` -> `DashboardSurfaceConfig`. 50 lines. |
| `command/index.tsx` | Screen | Staff Command Center. Uses `<DashboardSurface>` with 4 `DashboardSurfaceSection` builders. |
| `__tests__/` | Tests | 3 test files (list, detail, create configs). |

**Config pattern**: `ListSurfaceConfig` (list), `DetailSurfaceConfig` (detail), `DashboardSurfaceConfig` (command)
**DS surfaces**: `<DetailSurface>`, `<DashboardSurface>`, `PatternDataTable` + `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## staffing

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `StaffingListSurfaceScreen`, `StaffingEventDetailSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `staffingListAdapter`, `StaffingEventDetailView`. 92 lines. |
| `list/config.tsx` | Config | `createStaffingListConfig()` -> `createListSurfaceConfig<StaffingListView>`. 118 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `event-detail/index.tsx` | Screen | Event staffing detail. Uses `StatsHeader`. |
| `__tests__/staffing-list-config.test.ts` | Test | |

**Config pattern**: `createListSurfaceConfig`
**DS components**: `PatternDataTable`, `StatsHeader`

---

## suppliers

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `SuppliersListSurfaceScreen`, `SupplierDetailSurfaceScreen`, `SupplierEditSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `supplierListAdapter`, `supplierDetailAdapter`. 98 lines. |
| `list/config.tsx` | Config | `createSuppliersListConfig()` -> `createListSurfaceConfig<SupplierListView>`. 155 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/index.tsx` | Screen | Supplier detail. Uses `StatsHeader`. |
| `edit/index.tsx` | Screen | Supplier edit form. |
| `__tests__/suppliers-list-config.test.ts` | Test | |

**Config pattern**: `createListSurfaceConfig`
**DS components**: `PatternDataTable`, `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## time-tracking

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `TimeTrackingSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `timeEntryAdapter`. 92 lines. |
| `main/config.tsx` | Config | `createTimeTrackingConfig()` -> `ListSurfaceConfig<TimeEntryView>`. Conditional row actions (`visible`). 158 lines. |
| `main/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `__tests__/time-tracking-config.test.ts` | Test | |

**Config pattern**: `ListSurfaceConfig` with conditional row visibility
**DS components**: `PatternDataTable`, `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## venues

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `VenuesListSurfaceScreen`, `VenueDetailSurfaceScreen`, `VenueCreateSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `venueListAdapter`. 40 lines. |
| `list/config.tsx` | Config | `createVenuesListConfig()` -> `createListSurfaceConfig<VenueListView>`. 143 lines. |
| `list/index.tsx` | Screen | Uses `PatternDataTable`, `StatsHeader`, `useListController`, `useSurfacePermissions`. |
| `detail/index.tsx` | Screen | Venue detail. |
| `create/index.tsx` | Screen | **FormSurface reference implementation** - uses `<FormSurface>` + `createFormSurfaceConfig()`. |
| `__tests__/venues-list-config.test.ts` | Test | |

**Config pattern**: `createListSurfaceConfig` (list), `createFormSurfaceConfig` (create - canonical FormSurface example)
**DS surfaces**: `<FormSurface>`, `PatternDataTable` + `StatsHeader`
**DS hooks**: `useListController`, `useSurfacePermissions`

---

## vip-tables

| File | Type | Description |
|------|------|-------------|
| `index.ts` | Barrel | `VipTablesWorkbenchSurfaceScreen`, `VipConfigStudioSurfaceScreen` |
| `_shared/adapter.ts` | Adapter | `vipReservationAdapter`, `vipDashboardAdapter`, `mapAlert`. 185 lines. |
| `workbench/index.tsx` | Screen | VIP tables workbench. Uses `StatsHeader`. |
| `config/index.tsx` | Screen | VIP config studio. Uses `StatsHeader`. |

**Config pattern**: No config factory. Custom layout with `StatsHeader`.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total surface modules | 25 (23 domain + _shared + dashboard._shared) |
| Total exported screens | ~75 |
| Config factories | 20 |
| EntityAdapters | 19 |
| Modules using PatternDataTable | 12 |
| Modules using StatsHeader | 30+ screens |
| Modules using useListController | 12 |
| Modules using useSurfacePermissions | 15+ |
| DS Surface components used | 6 (ListSurface pattern, DashboardSurface, DetailSurface, SchedulerSurface, OperationalSurface, SettingsSurface, FormSurface) |
| Test files | 18 |
