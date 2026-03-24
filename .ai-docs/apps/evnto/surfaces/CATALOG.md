# Evnto Surface Catalog

> All surface files in `app-evnto/src/surfaces/`. Each module follows the folder/index
> pattern. Evnto has extensive use of config files (ListSurfaceConfig, DetailSurfaceConfig)
> and comprehensive test coverage for surface configs.

## Surface Modules

### analytics/ (4 screens)
| File | Export |
|------|--------|
| `main/index.tsx` | `AnalyticsSurfaceScreen` |
| `consumption/index.tsx` | `ConsumptionIntelligenceSurface` |
| `portfolio/index.tsx` | `PortfolioIntelligenceSurface` |
| `profitability/index.tsx` | `ProfitabilitySurface` |

### artists/ (2 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `ArtistsListSurfaceScreen` |
| `list/config.tsx` | Config factory |
| `detail/index.tsx` | `ArtistDetailSurfaceScreen` |
| `_shared/adapter.ts` | `artistListAdapter`, `ArtistListView`, `ArtistRaw` |
| `__tests__/artists-list-config.test.ts` | Config test |

### auth/ (config only)
| File | Purpose |
|------|---------|
| `login/config.ts` | Login page configuration |
| `__tests__/login-config.test.ts` | Config test |

### bar/ (5 screens + configs + _shared + tests)
| File | Export |
|------|--------|
| `dashboard/index.tsx` | `BarDashboardSurfaceScreen` |
| `dashboard/config.ts` | Dashboard config factory |
| `orders/index.tsx` | `BarOrdersSurfaceScreen` |
| `orders/config.tsx` | Orders list config |
| `order-detail/index.tsx` | `BarOrderDetailSurfaceScreen` |
| `pos/index.tsx` | `BarPOSSurfaceScreen` |
| `pos-detail/index.tsx` | `BarPOSDetailSurfaceScreen` |
| `_shared/adapter.ts` | `barDashboardAdapter`, `BarDashboardView`, `barOrderAdapter`, `BarOrderView` |
| `_shared/helpers.tsx` | `formatCurrency`, `formatOrderDate`, `formatInteger` |
| `__tests__/bar-orders-config.test.ts` | Config test |
| `__tests__/bar-dashboard-config.test.ts` | Config test |

### check-in/ (2 screens + _shared)
| File | Export |
|------|--------|
| `main/index.tsx` | `CheckInSurfaceScreen` |
| `event/index.tsx` | `CheckInEventSurfaceScreen` |
| `_shared/adapter.ts` | `checkInAdapter`, `CheckInView`, `CheckInRaw` |

### credentials/ (1 screen + config + _shared + tests)
| File | Export |
|------|--------|
| `main/index.tsx` | `CredentialsSurfaceScreen` |
| `main/config.ts` | Config factory |
| `_shared/adapter.ts` | `credentialAdapter`, `CredentialView` |
| `__tests__/credentials-config.test.ts` | Config test |

### dashboard/ (1 screen + config + _shared + tests)
| File | Export |
|------|--------|
| `organizer/index.tsx` | `OrganizerDashboardSurfaceScreen` |
| `organizer/config.ts` | Dashboard config factory |
| `_shared/presets.ts` | Dashboard presets |
| `__tests__/organizer-dashboard-config.test.ts` | Config test |

### events/ (15 screens + configs + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `EventsListSurfaceScreen` |
| `list/config.tsx` | Events list config |
| `detail/index.tsx` | `EventDetailSurfaceScreen` |
| `detail/config.ts` | Event detail config |
| `upsert/index.tsx` | `EventUpsertSurface` (create + edit) |
| `upsert/config.ts` | Upsert form config |
| `clone/index.tsx` | `EventCloneSurfaceScreen` |
| `control-room/index.tsx` | `EventControlRoomSurfaceScreen` |
| `control-room/config.ts` | Control room config |
| `live/index.tsx` | `EventLiveSurfaceScreen` |
| `lineup/index.tsx` | `EventLineupSurfaceScreen` |
| `tickets/index.tsx` | `EventTicketsSurfaceScreen` |
| `waitlist/index.tsx` | `EventWaitlistSurfaceScreen` |
| `resale/index.tsx` | `EventResaleSurfaceScreen` |
| `finance/index.tsx` | `EventFinanceSurfaceScreen` |
| `media/index.tsx` | `EventMediaSurfaceScreen` |
| `report/index.tsx` | `PostEventReportSurface` |
| `dj-report/index.tsx` | `DjPerformanceReportSurface` |
| `_shared/adapter.ts` | `eventListAdapter`, `EventListView`, `eventDetailAdapter`, `EventDetailView` |
| `_shared/helpers.tsx` | `formatEventDateTimeRange`, `formatInteger` |
| `__tests__/events-list-config.test.ts` | Config test |
| `__tests__/event-detail-config.test.ts` | Config test |
| `__tests__/event-upsert-config.test.ts` | Config test |

### finance/ (1 screen + config)
| File | Export |
|------|--------|
| `workbench/index.tsx` | `FinanceWorkbenchSurfaceScreen` |
| `workbench/config.ts` | Workbench config |

### inventory/ (6 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `dashboard/index.tsx` | `InventoryDashboardSurfaceScreen` |
| `dashboard/config.ts` | Dashboard config |
| `stock/index.tsx` | `StockSurfaceScreen` |
| `alerts/index.tsx` | `AlertsSurfaceScreen` |
| `movements/index.tsx` | `MovementsSurfaceScreen` |
| `locations/index.tsx` | `LocationsSurfaceScreen` |
| `ledger/index.tsx` | `StockLedgerSurfaceScreen` |
| `_shared/adapter.ts` | `stockItemAdapter`, `StockItemView`, `alertAdapter`, `AlertView`, `InventoryDashboardView` |
| `__tests__/inventory-dashboard-config.test.ts` | Config test |

### onboarding/ (1 screen)
| File | Export |
|------|--------|
| `main/index.tsx` | `OnboardingSurfaceScreen` |

### payroll/ (3 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `periods/index.tsx` | `PayrollPeriodsSurfaceScreen` |
| `periods/config.tsx` | Periods list config |
| `settlements/index.tsx` | `PayrollSettlementsSurfaceScreen` |
| `settlement-ops/index.tsx` | `SettlementOpsSurfaceScreen` |
| `_shared/adapter.ts` | `payrollPeriodAdapter`, `PayrollPeriodView`, `settlementAdapter`, `SettlementView` |
| `__tests__/payroll-periods-config.test.ts` | Config test |

### products/ (7 screens + configs + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `ProductsListSurfaceScreen` |
| `list/config.tsx` | Products list config |
| `detail/index.tsx` | `ProductDetailSurfaceScreen` |
| `detail/config.ts` | Product detail config (DetailSurfaceConfig) |
| `create/index.tsx` | `ProductCreateSurfaceScreen` |
| `edit/index.tsx` | `ProductEditSurfaceScreen` |
| `categories/index.tsx` | `ProductCategoriesSurfaceScreen` |
| `combos/index.tsx` | `ProductCombosSurfaceScreen` |
| `pricing/index.tsx` | `ProductPricingSurfaceScreen` |
| `recipes/index.tsx` | `ProductRecipesSurfaceScreen` |
| `_shared/adapter.ts` | `productListAdapter`, `ProductListView`, `productDetailAdapter`, `ProductDetailView` |
| `_shared/helpers.tsx` | Helper functions |
| `__tests__/products-list-config.test.ts` | Config test |
| `__tests__/product-detail-config.test.ts` | Config test |

### purchasing/ (5 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `PurchasingListSurfaceScreen` |
| `list/config.tsx` | Purchasing list config |
| `detail/index.tsx` | `PurchasingDetailSurfaceScreen` |
| `create/index.tsx` | `PurchasingCreateSurfaceScreen` |
| `receipts/index.tsx` | `PurchasingReceiptsSurfaceScreen` |
| `console/index.tsx` | `ProcurementConsoleSurfaceScreen` |
| `_shared/adapter.ts` | `purchaseOrderAdapter`, `PurchaseOrderView` |
| `__tests__/purchasing-list-config.test.ts` | Config test |

### reports/ (1 screen)
| File | Export |
|------|--------|
| `hub/index.tsx` | `ReportsHubSurfaceScreen` |

### scheduling/ (2 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `calendar/index.tsx` | `SchedulingCalendarSurfaceScreen` |
| `calendar/config.ts` | Calendar config |
| `shifts/index.tsx` | `SchedulingShiftsSurfaceScreen` |
| `_shared/adapter.ts` | `scheduleViewAdapter`, `ScheduleView`, `shiftViewAdapter`, `ShiftView` |
| `__tests__/scheduling-calendar-config.test.ts` | Config test |

### season-passes/ (1 screen + _shared)
| File | Export |
|------|--------|
| `main/index.tsx` | `SeasonPassesSurfaceScreen` |
| `_shared/adapter.ts` | `seasonPassAdapter`, `SeasonPassView`, `SeasonPassRaw` |

### settings/ (1 screen + config + tabs + tests)
| File | Export |
|------|--------|
| `general/index.tsx` | `SettingsSurfaceScreen` |
| `general/config.ts` | Settings config |
| `tabs/integrations-tab/index.tsx` | Integrations tab |
| `tabs/notifications-tab/index.tsx` | Notifications tab |
| `tabs/payments-tab/index.tsx` | Payments tab |
| `tabs/security-tab/index.tsx` | Security tab |
| `tabs/team-tab/index.tsx` | Team tab |
| `__tests__/settings-config.test.ts` | Config test |

### staff/ (6 screens + configs + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `StaffListSurfaceScreen` |
| `list/config.tsx` | Staff list config |
| `detail/index.tsx` | `StaffDetailSurfaceScreen` |
| `detail/config.ts` | Staff detail config |
| `create/index.tsx` | `StaffCreateSurfaceScreen` |
| `create/config.ts` | Staff create config |
| `edit/index.tsx` | `StaffEditSurfaceScreen` |
| `schedule/index.tsx` | `StaffScheduleSurfaceScreen` |
| `command/index.tsx` | `StaffCommandSurfaceScreen` |
| `command/config.ts` | Command center config |
| `_shared/adapter.ts` | `staffListAdapter`, `StaffListView`, `staffDetailAdapter`, `StaffDetailView` |
| `_shared/helpers.ts` | Helper functions |
| `__tests__/staff-list-config.test.ts` | Config test |
| `__tests__/staff-detail-config.test.ts` | Config test |
| `__tests__/staff-create-config.test.ts` | Config test |

### staffing/ (2 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `StaffingListSurfaceScreen` |
| `list/config.tsx` | Staffing list config (uses `createListSurfaceConfig`) |
| `event-detail/index.tsx` | `StaffingEventDetailSurfaceScreen` |
| `_shared/adapter.ts` | `staffingListAdapter`, `StaffingListView`, `StaffingEventDetailView` |
| `__tests__/staffing-list-config.test.ts` | Config test |

### suppliers/ (3 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `SuppliersListSurfaceScreen` |
| `list/config.tsx` | Suppliers list config (uses `createListSurfaceConfig`) |
| `detail/index.tsx` | `SupplierDetailSurfaceScreen` |
| `edit/index.tsx` | `SupplierEditSurfaceScreen` |
| `_shared/adapter.ts` | `supplierListAdapter`, `SupplierListView`, `supplierDetailAdapter`, `SupplierDetailView` |
| `__tests__/suppliers-list-config.test.ts` | Config test |

### time-tracking/ (1 screen + config + _shared + tests)
| File | Export |
|------|--------|
| `main/index.tsx` | `TimeTrackingSurfaceScreen` |
| `main/config.tsx` | Time tracking list config (ListSurfaceConfig) |
| `_shared/adapter.ts` | `timeEntryAdapter`, `TimeEntryView` |
| `__tests__/time-tracking-config.test.ts` | Config test |

### venues/ (3 screens + config + _shared + tests)
| File | Export |
|------|--------|
| `list/index.tsx` | `VenuesListSurfaceScreen` |
| `list/config.tsx` | Venues list config |
| `detail/index.tsx` | `VenueDetailSurfaceScreen` |
| `create/index.tsx` | `VenueCreateSurfaceScreen` |
| `_shared/adapter.ts` | `venueListAdapter`, `VenueListView`, `VenueRaw` |
| `__tests__/venues-list-config.test.ts` | Config test |

### vip-tables/ (2 screens + _shared)
| File | Export |
|------|--------|
| `workbench/index.tsx` | `VipTablesWorkbenchSurfaceScreen` |
| `config/index.tsx` | `VipConfigStudioSurfaceScreen` |
| `_shared/adapter.ts` | `vipReservationAdapter`, `VipReservationView`, `vipDashboardAdapter`, `VipDashboardView`, `mapAlert`, `VipAlertView` |

### _shared/ (3 utility groups)
| File | Purpose |
|------|---------|
| `permissions/permission-maps.ts` | Action permission maps per domain |
| `permissions/compute-permissions.ts` | Pure function for permission computation |
| `permissions/use-surface-permissions.ts` | `useSurfacePermissions()` hook |
| `permissions/route-guard.tsx` | Route-level permission guard |
| `permissions/types.ts` | Permission type definitions |
| `permissions/__tests__/compute-permissions.test.ts` | Permission computation test |
| `cell-renderers/index.tsx` | Shared cell render functions for ListSurface columns |
| `filter-pills/index.tsx` | Reusable filter pill components |

---

## Summary

| Module | Screens | Configs | Adapters | Tests | Total |
|--------|---------|---------|----------|-------|-------|
| analytics | 4 | 0 | 0 | 0 | 4 |
| artists | 2 | 1 | 1 | 1 | 5 |
| auth | 0 | 1 | 0 | 1 | 2 |
| bar | 5 | 2 | 1 | 2 | 10 |
| check-in | 2 | 0 | 1 | 0 | 3 |
| credentials | 1 | 1 | 1 | 1 | 4 |
| dashboard | 1 | 1 | 1 | 1 | 4 |
| events | 15 | 4 | 1 | 3 | 23 |
| finance | 1 | 1 | 0 | 0 | 2 |
| inventory | 6 | 1 | 1 | 1 | 9 |
| onboarding | 1 | 0 | 0 | 0 | 1 |
| payroll | 3 | 1 | 1 | 1 | 6 |
| products | 7 | 2 | 1 | 2 | 12 |
| purchasing | 5 | 1 | 1 | 1 | 8 |
| reports | 1 | 0 | 0 | 0 | 1 |
| scheduling | 2 | 1 | 1 | 1 | 5 |
| season-passes | 1 | 0 | 1 | 0 | 2 |
| settings | 1 | 1 | 0 | 1 | 8 (incl. 5 tabs) |
| staff | 6 | 4 | 1 | 3 | 14 |
| staffing | 2 | 1 | 1 | 1 | 5 |
| suppliers | 3 | 1 | 1 | 1 | 6 |
| time-tracking | 1 | 1 | 1 | 1 | 4 |
| venues | 3 | 1 | 1 | 1 | 6 |
| vip-tables | 2 | 0 | 1 | 0 | 3 |
| _shared | 0 | 0 | 0 | 1 | 8 |
| **TOTAL** | **~75** | **~27** | **~19** | **~24** | **~155** |
