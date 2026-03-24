# Evnto Adapter Catalog

> Generated 2026-03-23. Documents all `EntityAdapter` instances in `app-evnto/src/surfaces/*/_ shared/adapter.ts`.

## What Adapters Do

Adapters implement `EntityAdapter<Raw, View>` from `@rottay/design-system`. They:

1. **Transform** raw domain entities into display-ready view models
2. **Define canonical `fieldId`s** that permissions, configs, and renderers share
3. **Provide `fields[]`** metadata (key, fieldId, label) for the DS surface layer

The adapter is the single source of truth for field vocabulary in each domain.

---

## Adapter Index

| Domain | Adapter | Entity | Raw Type | View Type | Fields | File |
|--------|---------|--------|----------|-----------|--------|------|
| events | `eventListAdapter` | `event` | `Event` | `EventListView` | name, status, schedule, venue, capacity, coverImage | `events/_shared/adapter.ts` |
| events | `eventDetailAdapter` | `event-detail` | `EventDetailRaw` | `EventDetailView` | name, status, description, schedule, venue, venueAddress, capacity, ticketTypes | `events/_shared/adapter.ts` |
| artists | `artistListAdapter` | `artist` | `ArtistRaw` | `ArtistListView` | name, genre, status | `artists/_shared/adapter.ts` |
| bar | `barDashboardAdapter` | `bar-dashboard` | `BarDashboardRaw` | `BarDashboardView` | activeOrders, pendingOrders, preparingOrders, readyOrders, revenue, totalOrders | `bar/_shared/adapter.ts` |
| bar | `barOrderAdapter` | `bar-order` | `BarOrder` | `BarOrderView` | number, status, total, customer, pos, createdAt, items | `bar/_shared/adapter.ts` |
| check-in | `checkInAdapter` | `check-in` | `CheckInRaw` | `CheckInView` | attendee, ticketType, time, status | `check-in/_shared/adapter.ts` |
| credentials | `credentialAdapter` | `credential` | `Credential` | `CredentialView` | type, status, validFrom, validUntil, zones | `credentials/_shared/adapter.ts` |
| inventory | `stockItemAdapter` | `stock-item` | `StockItem` | `StockItemView` | name, sku, currentStock, minimumStock, status, cost, lastUpdated | `inventory/_shared/adapter.ts` |
| inventory | `alertAdapter` | `stock-alert` | `StockAlert` | `AlertView` | type, severity, message, stockItem, createdAt | `inventory/_shared/adapter.ts` |
| payroll | `payrollPeriodAdapter` | `payroll-period` | `PayrollPeriod` | `PayrollPeriodView` | dateRange, status, totalAmount, currency | `payroll/_shared/adapter.ts` |
| payroll | `settlementAdapter` | `settlement` | `Settlement` | `SettlementView` | staffName, amount, status, paymentMethod, eventName | `payroll/_shared/adapter.ts` |
| products | `productListAdapter` | `product` | `Product` | `ProductListView` | name, status, sku, price, cost, category, image | `products/_shared/adapter.ts` |
| products | `productDetailAdapter` | `product-detail` | `ProductDetailRaw` | `ProductDetailView` | name, status, description, sku, barcode, price, cost, taxRate, category | `products/_shared/adapter.ts` |
| purchasing | `purchaseOrderAdapter` | `purchase-order` | `PurchaseOrder` | `PurchaseOrderView` | orderNumber, supplier, status, items, totalAmount, orderDate, expectedDate | `purchasing/_shared/adapter.ts` |
| scheduling | `scheduleViewAdapter` | `schedule` | `ScheduleViewRaw` | `ScheduleView` | staffName, startTime, endTime, status, duration | `scheduling/_shared/adapter.ts` |
| scheduling | `shiftViewAdapter` | `shift` | `ScheduleViewRaw` | `ShiftView` | staffName, timeRange, status, duration, notes | `scheduling/_shared/adapter.ts` |
| season-passes | `seasonPassAdapter` | `season-pass` | `SeasonPassRaw` | `SeasonPassView` | name, price, validFrom, validTo, sold, status | `season-passes/_shared/adapter.ts` |
| staff | `staffListAdapter` | `staff` | `StaffMember` | `StaffListView` | name, email, phone, status, roles, salary | `staff/_shared/adapter.ts` |
| staff | `staffDetailAdapter` | `staff-detail` | `StaffMember` | `StaffDetailView` | name, email, phone, status, roles, skills, certifications, salary | `staff/_shared/adapter.ts` |
| staffing | `staffingListAdapter` | `staffing-event` | `StaffingListRaw` | `StaffingListView` | eventName, date, venue, required, assigned, fulfillment | `staffing/_shared/adapter.ts` |
| suppliers | `supplierListAdapter` | `supplier` | `Supplier` | `SupplierListView` | name, email, phone, status, city | `suppliers/_shared/adapter.ts` |
| suppliers | `supplierDetailAdapter` | `supplier-detail` | `Supplier` | `SupplierDetailView` | name, contactName, email, phone, address, status, paymentTerms, taxId | `suppliers/_shared/adapter.ts` |
| time-tracking | `timeEntryAdapter` | `time-entry` | `TimeEntry` | `TimeEntryView` | clockIn, clockOut, status, duration, notes | `time-tracking/_shared/adapter.ts` |
| venues | `venueListAdapter` | `venue` | `VenueRaw` | `VenueListView` | name, address, city, capacity, status | `venues/_shared/adapter.ts` |
| vip-tables | `vipReservationAdapter` | `vip-reservation` | `ReservationRaw` | `VipReservationView` | id, status, host, capacity, deposit, spend, progress | `vip-tables/_shared/adapter.ts` |
| vip-tables | `vipDashboardAdapter` | `vip-dashboard` | `DashboardRaw` | `VipDashboardView` | totalTables, occupied, revenue, alerts | `vip-tables/_shared/adapter.ts` |

---

## Adapter Pattern

All adapters follow the same structure:

```typescript
import type { EntityAdapter } from "@rottay/design-system";

export interface SomeView {
  id: string;
  // display-ready fields...
}

export const someAdapter: EntityAdapter<SomeRaw, SomeView> = {
  entity: "entity-name",
  version: "1.0.0",
  map: (raw) => ({
    // transform raw -> view
  }),
  fields: [
    { key: "fieldName", fieldId: "entity.fieldName", label: "Display Label" },
  ],
};
```

### Field ID Convention

Field IDs follow the pattern `{entity}.{field}`:
- `event.name`, `event.status`, `event.venue`
- `staff.name`, `staff.email`, `staff.salary`
- `product.price`, `product.cost`, `product.category`
- `order.number`, `order.status`, `order.total`

These IDs are referenced by:
- **Permission maps** in `_shared/permissions/permission-maps.ts` to control field visibility
- **Config renderCell** to provide custom cell rendering
- **Column definitions** in config factories

---

## Modules Without Adapters

The following surface modules do not have adapters (they use direct data or compose DS primitives):

- `analytics` - Custom dashboards, no entity lists
- `auth` - Login form only
- `dashboard` - Aggregated stats, no entity mapping
- `finance` - Workbench with custom stats
- `onboarding` - Wizard flow
- `reports` - Report hub
- `settings` - Tabbed settings

---

## Helper Files

Several adapters have companion helper files:

| File | Exports |
|------|---------|
| `events/_shared/helpers.tsx` | `formatEventDateTimeRange`, `formatInteger`, `getEventStatusVariant` |
| `bar/_shared/helpers.tsx` | `formatCurrency`, `formatOrderDate`, `formatInteger`, `getOrderStatusVariant`, `getOrderStatusLabel` |
| `staff/_shared/helpers.ts` | `getStaffStatusVariant`, `getStaffStatusLabel` |
| `products/_shared/helpers.tsx` | `formatPrice`, `getProductStatusFromFlags`, `getProductStatusLabel`, `getProductStatusVariant`, `ProductStatusValue` |
| `vip-tables/_shared/adapter.ts` | `mapAlert()` (standalone function, not an EntityAdapter) |
