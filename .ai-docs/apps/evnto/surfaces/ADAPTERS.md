# Evnto Surface Adapters

> All adapters in `app-evnto/src/surfaces/{module}/_shared/adapter.ts`.
> Each implements `EntityAdapter<Source, View>` from `@rottay/design-system`.
> Evnto has 19 adapter files with both list and detail adapters for several entities.

## Adapter Index

| Module | Adapter(s) | Source Type(s) | View Model(s) |
|--------|-----------|---------------|---------------|
| artists | `artistListAdapter` | `ArtistRaw` | `ArtistListView` |
| bar | `barDashboardAdapter`, `barOrderAdapter` | `BarDashboardRaw`, `BarOrder` | `BarDashboardView`, `BarOrderView` |
| check-in | `checkInAdapter` | `CheckInRaw` | `CheckInView` |
| credentials | `credentialAdapter` | `Credential` (from `@/types`) | `CredentialView` |
| events | `eventListAdapter`, `eventDetailAdapter` | `Event`, `EventDetailRaw` | `EventListView`, `EventDetailView` |
| inventory | `stockItemAdapter`, `alertAdapter` | `StockItemRaw`, `StockAlertRaw` | `StockItemView`, `AlertView` (+`InventoryDashboardView`) |
| payroll | `payrollPeriodAdapter`, `settlementAdapter` | `PayrollPeriod`, `Settlement` | `PayrollPeriodView`, `SettlementView` |
| products | `productListAdapter`, `productDetailAdapter` | `Product`, `ProductDetailRaw` | `ProductListView`, `ProductDetailView` |
| purchasing | `purchaseOrderAdapter` | `PurchaseOrder` (from `@/types`) | `PurchaseOrderView` |
| scheduling | `scheduleViewAdapter`, `shiftViewAdapter` | `ScheduleViewRaw` | `ScheduleView`, `ShiftView` |
| season-passes | `seasonPassAdapter` | `SeasonPassRaw` | `SeasonPassView` |
| staff | `staffListAdapter`, `staffDetailAdapter` | `StaffMember` (from `@/types`) | `StaffListView`, `StaffDetailView` |
| staffing | `staffingListAdapter` | `StaffingListRaw` | `StaffingListView` (+`StaffingEventDetailView`) |
| suppliers | `supplierListAdapter`, `supplierDetailAdapter` | `Supplier` (from `@/types`) | `SupplierListView`, `SupplierDetailView` |
| time-tracking | `timeEntryAdapter` | `TimeEntry` (from `@/types`) | `TimeEntryView` |
| venues | `venueListAdapter` | `VenueRaw` | `VenueListView` |
| vip-tables | `vipReservationAdapter`, `vipDashboardAdapter`, `mapAlert` | `ReservationRaw`, `DashboardRaw`, `AlertRaw` | `VipReservationView`, `VipDashboardView`, `VipAlertView` |

---

## Adapter Details

### eventListAdapter
- **Source**: `Event` from `@/types`
- **View fields**: id, name, status, statusLabel, statusVariant, venueName, date, dateLabel, ticketsSold, ticketsSoldLabel, revenue, revenueLabel, capacity
- **Computed**: `dateLabel` (via `formatEventDateTimeRange()`), `ticketsSoldLabel`/`revenueLabel` (via `formatInteger()`)
- **Helpers**: `formatEventDateTimeRange`, `formatInteger` from `./helpers`

### eventDetailAdapter
- **Source**: `EventDetailRaw` (extended event with venue, ticket types, lineup)
- **View fields**: All list fields plus venueAddress, venueCapacity, ticketTypes, lineupCount, description, coverImage

### staffListAdapter
- **Source**: `StaffMember` from `@/types`
- **View fields**: id, fullName, email, avatar, role, roleLabel, status, statusLabel, statusVariant, phone, skills, skillCount, certificationCount, hireDate

### staffDetailAdapter
- **Source**: `StaffMember` from `@/types`
- **View fields**: All list fields plus address, emergencyContact, bankInfo, notes, schedule, hourlyRate

### productListAdapter
- **Source**: `Product` from `@/types`
- **View fields**: id, name, category, categoryLabel, price, priceLabel, status, statusLabel, statusVariant, stock, stockLabel, isLowStock, sku

### productDetailAdapter
- **Source**: `ProductDetailRaw`
- **View fields**: All list fields plus description, ingredients, allergens, preparationTime, costPrice, margin

### barDashboardAdapter
- **Source**: `BarDashboardRaw`
- **View fields**: totalOrders, totalRevenue, avgOrderValue, topProducts, activeStations, pendingOrders
- **Helpers**: `formatCurrency`, `formatOrderDate`, `formatInteger`

### barOrderAdapter
- **Source**: `BarOrder` from `@/types`
- **View fields**: id, orderNumber, status, statusLabel, statusVariant, total, totalLabel, items, itemCount, createdAt, createdAtLabel, stationName
- **Enums**: `BarOrderStatusValue` from `@/types/enums/order-status`

### supplierListAdapter / supplierDetailAdapter
- **Source**: `Supplier` from `@/types`
- **List fields**: id, name, contactName, email, phone, status, statusLabel, statusVariant, productCount, lastOrderDate
- **Detail fields**: All list fields plus address, taxId, paymentTerms, notes, rating

### purchaseOrderAdapter
- **Source**: `PurchaseOrder` from `@/types`
- **View fields**: id, orderNumber, supplierName, status, statusLabel, statusVariant, total, totalLabel, itemCount, createdAt, expectedDelivery

### inventoryAdapters (stockItemAdapter + alertAdapter)
- **stockItemAdapter**: name, sku, category, currentStock, minStock, maxStock, unit, isLowStock, lastRestocked
- **alertAdapter**: id, type, typeLabel, severity, message, productName, triggeredAt, isResolved

### payrollPeriodAdapter / settlementAdapter
- **payrollPeriodAdapter**: id, name, startDate, endDate, status, statusLabel, totalAmount, staffCount, approvedBy
- **settlementAdapter**: id, staffName, periodName, hoursWorked, grossPay, deductions, netPay, status

### scheduleViewAdapter / shiftViewAdapter
- **scheduleViewAdapter**: id, staffName, date, shiftStart, shiftEnd, role, status, location
- **shiftViewAdapter**: id, staffName, shiftLabel, startTime, endTime, duration, status

### credentialAdapter
- **Source**: `Credential` from `@/types`
- **View fields**: id, staffName, credentialType, typeLabel, issuedAt, expiresAt, status, statusLabel, isExpired, qrCode

### timeEntryAdapter
- **Source**: `TimeEntry` from `@/types`
- **View fields**: id, staffName, eventName, clockIn, clockOut, duration, durationLabel, breakMinutes, status, statusLabel

### vipReservationAdapter / vipDashboardAdapter / mapAlert
- **vipReservationAdapter**: id, guestName, tableName, eventName, status, statusLabel, partySize, totalSpend, arrivalTime
- **vipDashboardAdapter**: totalReservations, occupancyRate, totalRevenue, avgSpendPerTable, peakHour, availableTables
- **mapAlert**: id, type, message, severity, tableName, timestamp, isResolved
