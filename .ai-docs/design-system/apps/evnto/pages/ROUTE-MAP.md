# Evnto Route Map

> Generated 2026-03-23. Maps every `page.tsx` under `app-evnto/src/app/` to its surface import.

## Dashboard Routes (`(dashboard)/`)

### Events Module

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/events` | `EventsListSurfaceScreen` | `@/surfaces/events` |
| `/events/new` | `EventUpsertSurface` | `@/surfaces/events` |
| `/events/[id]` | `EventDetailSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/edit` | `EventUpsertSurface` | `@/surfaces/events` |
| `/events/[id]/finance` | `EventFinanceSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/lineup` | `EventLineupSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/live` | `EventLiveSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/media` | `EventMediaSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/resale` | `EventResaleSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/tickets` | `EventTicketsSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/waitlist` | `EventWaitlistSurfaceScreen` | `@/surfaces/events` |
| `/events/[id]/control-room` | `EventControlRoomSurfaceScreen` | `@/surfaces/events/control-room` |
| `/events/[id]/report` | `PostEventReportSurface` | `@/surfaces/events` |
| `/events/[id]/dj-report` | `DjPerformanceReportSurface` | `@/surfaces/events/dj-report` |
| `/events/clone/[id]` | `EventCloneSurfaceScreen` | `@/surfaces/events/clone` |

### Venues

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/venues` | `VenuesListSurfaceScreen` | `@/surfaces/venues` |
| `/venues/[id]` | `VenueDetailSurfaceScreen` | `@/surfaces/venues` |

### Artists

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/artists` | `ArtistsListSurfaceScreen` | `@/surfaces/artists` |
| `/artists/[id]` | `ArtistDetailSurfaceScreen` | `@/surfaces/artists` |

### Check-In

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/check-in` | `CheckInSurfaceScreen` | `@/surfaces/check-in` |
| `/check-in/[eventId]` | `CheckInEventSurfaceScreen` | `@/surfaces/check-in` |

### Season Passes

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/season-passes` | `SeasonPassesSurfaceScreen` | `@/surfaces/season-passes` |

### Staff Module

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/staff` | `StaffListSurfaceScreen` | `@/surfaces/staff` |
| `/staff/new` | `StaffCreateSurfaceScreen` | `@/surfaces/staff` |
| `/staff/[id]` | `StaffDetailSurfaceScreen` | `@/surfaces/staff` |
| `/staff/[id]/edit` | `StaffEditSurfaceScreen` | `@/surfaces/staff` |
| `/staff/[id]/schedule` | `StaffScheduleSurfaceScreen` | `@/surfaces/staff` |
| `/staff/command` | `StaffCommandSurfaceScreen` | `@/surfaces/staff` |

### Scheduling

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/scheduling` | `SchedulingCalendarSurfaceScreen` | `@/surfaces/scheduling` |
| `/scheduling/shifts` | `SchedulingShiftsSurfaceScreen` | `@/surfaces/scheduling` |

### Staffing

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/staffing` | `StaffingListSurfaceScreen` | `@/surfaces/staffing` |
| `/staffing/[eventId]` | `StaffingEventDetailSurfaceScreen` | `@/surfaces/staffing` |

### Credentials

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/credentials` | `CredentialsSurfaceScreen` | `@/surfaces/credentials` |

### Time Tracking

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/time-tracking` | `TimeTrackingSurfaceScreen` | `@/surfaces/time-tracking` |

### Payroll

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/payroll` | `PayrollPeriodsSurfaceScreen` | `@/surfaces/payroll` |
| `/payroll/settlements` | `PayrollSettlementsSurfaceScreen` | `@/surfaces/payroll` |
| `/payroll/settlement-ops` | `SettlementOpsSurfaceScreen` | `@/surfaces/payroll/settlement-ops` |

### Bar Module

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/bar` | `BarDashboardSurfaceScreen` | `@/surfaces/bar` |
| `/bar/orders` | `BarOrdersSurfaceScreen` | `@/surfaces/bar` |
| `/bar/orders/[id]` | `BarOrderDetailSurfaceScreen` | `@/surfaces/bar` |
| `/bar/pos` | `BarPOSSurfaceScreen` | `@/surfaces/bar` |
| `/bar/pos/[id]` | `BarPOSDetailSurfaceScreen` | `@/surfaces/bar` |

### Products

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/products` | `ProductsListSurfaceScreen` | `@/surfaces/products` |
| `/products/new` | `ProductCreateSurfaceScreen` | `@/surfaces/products` |
| `/products/[id]` | `ProductDetailSurfaceScreen` | `@/surfaces/products` |
| `/products/[id]/edit` | `ProductEditSurfaceScreen` | `@/surfaces/products` |
| `/products/categories` | `ProductCategoriesSurfaceScreen` | `@/surfaces/products` |
| `/products/combos` | `ProductCombosSurfaceScreen` | `@/surfaces/products` |
| `/products/pricing` | `ProductPricingSurfaceScreen` | `@/surfaces/products` |
| `/products/recipes` | `ProductRecipesSurfaceScreen` | `@/surfaces/products` |

### Inventory

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/inventory` | `InventoryDashboardSurfaceScreen` | `@/surfaces/inventory` |
| `/inventory/stock` | `StockSurfaceScreen` | `@/surfaces/inventory` |
| `/inventory/movements` | `MovementsSurfaceScreen` | `@/surfaces/inventory` |
| `/inventory/alerts` | `AlertsSurfaceScreen` | `@/surfaces/inventory` |
| `/inventory/locations` | `LocationsSurfaceScreen` | `@/surfaces/inventory` |
| `/inventory/ledger` | `StockLedgerSurfaceScreen` | `@/surfaces/inventory/ledger` |

### Suppliers

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/suppliers` | `SuppliersListSurfaceScreen` | `@/surfaces/suppliers` |
| `/suppliers/[id]` | `SupplierDetailSurfaceScreen` | `@/surfaces/suppliers` |
| `/suppliers/[id]/edit` | `SupplierEditSurfaceScreen` | `@/surfaces/suppliers` |

### Purchasing

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/purchasing` | `PurchasingListSurfaceScreen` | `@/surfaces/purchasing` |
| `/purchasing/new` | `PurchasingCreateSurfaceScreen` | `@/surfaces/purchasing` |
| `/purchasing/[id]` | `PurchasingDetailSurfaceScreen` | `@/surfaces/purchasing` |
| `/purchasing/receipts` | `PurchasingReceiptsSurfaceScreen` | `@/surfaces/purchasing` |
| `/purchasing/console` | `ProcurementConsoleSurfaceScreen` | `@/surfaces/purchasing/console` |

### Analytics

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/analytics` | `AnalyticsSurfaceScreen` | `@/surfaces/analytics` |
| `/analytics/consumption` | `ConsumptionIntelligenceSurface` | `@/surfaces/analytics` |
| `/analytics/profitability/[eventId]` | `ProfitabilitySurface` | `@/surfaces/analytics` |
| `/analytics/portfolio` | `PortfolioIntelligenceSurface` | `@/surfaces/analytics/portfolio` |

### VIP Tables

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/vip-tables` | `VipTablesWorkbenchSurfaceScreen` | `@/surfaces/vip-tables` |
| `/vip-tables/config` | `VipConfigStudioSurfaceScreen` | `@/surfaces/vip-tables/config` |
| `/vip-tables/packages` | *No surface* - inline page component | Direct DS primitives |
| `/vip-tables/reservations/[id]` | *No surface* - inline page component | Uses `vip-tables/_shared/adapter` |

### Dashboard

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/dashboard` | `OrganizerDashboardSurfaceScreen` | `@/surfaces/dashboard` |

### Finance

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/finance` | `FinanceWorkbenchSurfaceScreen` | `@/surfaces/finance/workbench` |

### Reports

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/reports` | `ReportsHubSurfaceScreen` | `@/surfaces/reports` |

### Settings

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/settings` | *No surface* - inline settings hub | DS primitives (Card, Stack, Flex) |
| `/settings/team` | `SettingsSurfaceScreen` | `@/surfaces/settings` |
| `/settings/payments` | `SettingsSurfaceScreen` | `@/surfaces/settings` |
| `/settings/security` | `SettingsSurfaceScreen` | `@/surfaces/settings` |
| `/settings/notifications` | `SettingsSurfaceScreen` | `@/surfaces/settings` |
| `/settings/integrations` | `SettingsSurfaceScreen` | `@/surfaces/settings` |
| `/settings/appearance` | `SettingsSurfaceScreen` | `@/surfaces/settings` |

---

## Other Route Groups

### Auth Routes (`(auth)/`)

| Route | Surface | Notes |
|-------|---------|-------|
| `/login` | None | Uses `createLoginConfig` from `@/surfaces/auth` |
| `/register` | None | Inline page |
| `/forgot-password` | None | Inline page |
| `/reset-password` | None | Inline page |
| `/callback` | None | OAuth callback handler |

### Onboarding Routes (`(onboarding)/`)

| Route | Surface Import | Source |
|-------|---------------|--------|
| `/onboarding` | `OnboardingSurfaceScreen` | `@/surfaces/onboarding` |

### Root Routes

| Route | Notes |
|-------|-------|
| `/` | Landing/redirect |
| `/platform` | Platform selection |
| `/roles` | Role selection |

---

## Coverage Summary

| Category | Total Routes | Surface-backed | Inline |
|----------|-------------|----------------|--------|
| Dashboard routes | 83 | 80 | 3 |
| Auth routes | 5 | 0 | 5 |
| Onboarding | 1 | 1 | 0 |
| Root | 3 | 0 | 3 |
| **Total** | **92** | **81** | **11** |

**Surface coverage**: 88% of dashboard routes delegate to a surface. The 3 inline dashboard pages are `/settings` (hub), `/vip-tables/packages`, and `/vip-tables/reservations/[id]`.

### Page Pattern

The canonical page pattern is a thin wrapper:

```tsx
"use client";
import { SomeSurfaceScreen } from "@/surfaces/domain";
export default function SomePage() {
  return <SomeSurfaceScreen />;
}
```

Some pages add `<AnimatedContent>` wrapping (staff list, staff detail, staff new, staff command).
