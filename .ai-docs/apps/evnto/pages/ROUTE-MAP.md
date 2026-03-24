# Evnto Route Map

> All `page.tsx` files in `app-evnto/src/app/` with their route paths and surface imports.

## Auth Routes (no surface import)

| Route | Layout Group |
|-------|-------------|
| `/login` | `(auth)` |
| `/register` | `(auth)` |
| `/forgot-password` | `(auth)` |
| `/reset-password` | `(auth)` |
| `/callback` | `(auth)` |

## Onboarding Routes

| Route | Surface Import |
|-------|---------------|
| `/onboarding` | `OnboardingSurfaceScreen` from `@/surfaces/onboarding` |

## Standalone Routes

| Route | Purpose |
|-------|---------|
| `/platform` | Platform integration page |
| `/roles` | Roles configuration page |

## Dashboard Routes

### Dashboard
| Route | Surface Import |
|-------|---------------|
| `/dashboard` | `OrganizerDashboardSurfaceScreen` from `@/surfaces/dashboard` |

### Events
| Route | Surface Import |
|-------|---------------|
| `/events` | `EventsListSurfaceScreen` from `@/surfaces/events` |
| `/events/new` | `EventUpsertSurface` from `@/surfaces/events` |
| `/events/[id]` | `EventDetailSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/edit` | `EventUpsertSurface` from `@/surfaces/events` (same component, edit mode) |
| `/events/[id]/control-room` | `EventControlRoomSurfaceScreen` from `@/surfaces/events/control-room` |
| `/events/[id]/live` | `EventLiveSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/lineup` | `EventLineupSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/tickets` | `EventTicketsSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/waitlist` | `EventWaitlistSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/resale` | `EventResaleSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/finance` | `EventFinanceSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/media` | `EventMediaSurfaceScreen` from `@/surfaces/events` |
| `/events/[id]/report` | `PostEventReportSurface` from `@/surfaces/events` |
| `/events/[id]/dj-report` | `DjPerformanceReportSurface` from `@/surfaces/events/dj-report` |
| `/events/clone/[id]` | `EventCloneSurfaceScreen` from `@/surfaces/events/clone` |

### Venues
| Route | Surface Import |
|-------|---------------|
| `/venues` | `VenuesListSurfaceScreen` from `@/surfaces/venues` |
| `/venues/[id]` | `VenueDetailSurfaceScreen` from `@/surfaces/venues` |

### Artists
| Route | Surface Import |
|-------|---------------|
| `/artists` | `ArtistsListSurfaceScreen` from `@/surfaces/artists` |
| `/artists/[id]` | `ArtistDetailSurfaceScreen` from `@/surfaces/artists` |

### Check-In
| Route | Surface Import |
|-------|---------------|
| `/check-in` | `CheckInSurfaceScreen` from `@/surfaces/check-in` |
| `/check-in/[eventId]` | `CheckInEventSurfaceScreen` from `@/surfaces/check-in` |

### Staff
| Route | Surface Import |
|-------|---------------|
| `/staff` | `StaffListSurfaceScreen` from `@/surfaces/staff` |
| `/staff/new` | `StaffCreateSurfaceScreen` from `@/surfaces/staff` |
| `/staff/[id]` | `StaffDetailSurfaceScreen` from `@/surfaces/staff` |
| `/staff/[id]/edit` | `StaffEditSurfaceScreen` from `@/surfaces/staff` |
| `/staff/[id]/schedule` | `StaffScheduleSurfaceScreen` from `@/surfaces/staff` |
| `/staff/command` | `StaffCommandSurfaceScreen` from `@/surfaces/staff` |

### Scheduling
| Route | Surface Import |
|-------|---------------|
| `/scheduling` | `SchedulingCalendarSurfaceScreen` from `@/surfaces/scheduling` |
| `/scheduling/shifts` | `SchedulingShiftsSurfaceScreen` from `@/surfaces/scheduling` |

### Staffing
| Route | Surface Import |
|-------|---------------|
| `/staffing` | `StaffingListSurfaceScreen` from `@/surfaces/staffing` |
| `/staffing/[eventId]` | `StaffingEventDetailSurfaceScreen` from `@/surfaces/staffing` |

### Credentials
| Route | Surface Import |
|-------|---------------|
| `/credentials` | `CredentialsSurfaceScreen` from `@/surfaces/credentials` |

### Time Tracking
| Route | Surface Import |
|-------|---------------|
| `/time-tracking` | `TimeTrackingSurfaceScreen` from `@/surfaces/time-tracking` |

### Payroll
| Route | Surface Import |
|-------|---------------|
| `/payroll` | `PayrollPeriodsSurfaceScreen` from `@/surfaces/payroll` |
| `/payroll/settlements` | `PayrollSettlementsSurfaceScreen` from `@/surfaces/payroll` |
| `/payroll/settlement-ops` | `SettlementOpsSurfaceScreen` from `@/surfaces/payroll/settlement-ops` |

### Bar
| Route | Surface Import |
|-------|---------------|
| `/bar` | `BarDashboardSurfaceScreen` from `@/surfaces/bar` |
| `/bar/orders` | `BarOrdersSurfaceScreen` from `@/surfaces/bar` |
| `/bar/orders/[id]` | `BarOrderDetailSurfaceScreen` from `@/surfaces/bar` |
| `/bar/pos` | `BarPOSSurfaceScreen` from `@/surfaces/bar` |
| `/bar/pos/[id]` | `BarPOSDetailSurfaceScreen` from `@/surfaces/bar` |

### Products
| Route | Surface Import |
|-------|---------------|
| `/products` | `ProductsListSurfaceScreen` from `@/surfaces/products` |
| `/products/new` | `ProductCreateSurfaceScreen` from `@/surfaces/products` |
| `/products/[id]` | `ProductDetailSurfaceScreen` from `@/surfaces/products` |
| `/products/[id]/edit` | `ProductEditSurfaceScreen` from `@/surfaces/products` |
| `/products/categories` | `ProductCategoriesSurfaceScreen` from `@/surfaces/products` |
| `/products/combos` | `ProductCombosSurfaceScreen` from `@/surfaces/products` |
| `/products/recipes` | `ProductRecipesSurfaceScreen` from `@/surfaces/products` |
| `/products/pricing` | `ProductPricingSurfaceScreen` from `@/surfaces/products` |

### Inventory
| Route | Surface Import |
|-------|---------------|
| `/inventory` | `InventoryDashboardSurfaceScreen` from `@/surfaces/inventory` |
| `/inventory/stock` | `StockSurfaceScreen` from `@/surfaces/inventory` |
| `/inventory/alerts` | `AlertsSurfaceScreen` from `@/surfaces/inventory` |
| `/inventory/movements` | `MovementsSurfaceScreen` from `@/surfaces/inventory` |
| `/inventory/locations` | `LocationsSurfaceScreen` from `@/surfaces/inventory` |
| `/inventory/ledger` | `StockLedgerSurfaceScreen` from `@/surfaces/inventory/ledger` |

### Suppliers
| Route | Surface Import |
|-------|---------------|
| `/suppliers` | `SuppliersListSurfaceScreen` from `@/surfaces/suppliers` |
| `/suppliers/[id]` | `SupplierDetailSurfaceScreen` from `@/surfaces/suppliers` |
| `/suppliers/[id]/edit` | `SupplierEditSurfaceScreen` from `@/surfaces/suppliers` |

### Purchasing
| Route | Surface Import |
|-------|---------------|
| `/purchasing` | `PurchasingListSurfaceScreen` from `@/surfaces/purchasing` |
| `/purchasing/new` | `PurchasingCreateSurfaceScreen` from `@/surfaces/purchasing` |
| `/purchasing/[id]` | `PurchasingDetailSurfaceScreen` from `@/surfaces/purchasing` |
| `/purchasing/receipts` | `PurchasingReceiptsSurfaceScreen` from `@/surfaces/purchasing` |
| `/purchasing/console` | `ProcurementConsoleSurfaceScreen` from `@/surfaces/purchasing/console` |

### Season Passes
| Route | Surface Import |
|-------|---------------|
| `/season-passes` | `SeasonPassesSurfaceScreen` from `@/surfaces/season-passes` |

### VIP Tables
| Route | Surface Import |
|-------|---------------|
| `/vip-tables` | `VipTablesWorkbenchSurfaceScreen` from `@/surfaces/vip-tables` |
| `/vip-tables/config` | `VipConfigStudioSurfaceScreen` from `@/surfaces/vip-tables/config` |
| `/vip-tables/reservations/[id]` | (uses adapter directly from `@/surfaces/vip-tables/_shared/adapter`) |
| `/vip-tables/packages` | (no surface import) |

### Finance
| Route | Surface Import |
|-------|---------------|
| `/finance` | `FinanceWorkbenchSurfaceScreen` from `@/surfaces/finance/workbench` |

### Analytics
| Route | Surface Import |
|-------|---------------|
| `/analytics` | `AnalyticsSurfaceScreen` from `@/surfaces/analytics` |
| `/analytics/consumption` | `ConsumptionIntelligenceSurface` from `@/surfaces/analytics` |
| `/analytics/portfolio` | `PortfolioIntelligenceSurface` from `@/surfaces/analytics/portfolio` |
| `/analytics/profitability/[eventId]` | `ProfitabilitySurface` from `@/surfaces/analytics` |

### Reports
| Route | Surface Import |
|-------|---------------|
| `/reports` | `ReportsHubSurfaceScreen` from `@/surfaces/reports` |

### Settings
| Route | Surface Import |
|-------|---------------|
| `/settings` | `SettingsSurfaceScreen` from `@/surfaces/settings` |
| `/settings/appearance` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |
| `/settings/integrations` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |
| `/settings/notifications` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |
| `/settings/payments` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |
| `/settings/security` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |
| `/settings/team` | `SettingsSurfaceScreen` from `@/surfaces/settings` (tab variant) |

---

**Total page.tsx files: ~98** (5 auth + 1 onboarding + 2 standalone + ~90 dashboard)

**Note**: Settings routes all import the same `SettingsSurfaceScreen` component which renders different tabs based on the URL path.
