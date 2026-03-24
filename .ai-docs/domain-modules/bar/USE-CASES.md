# dm-bar - Use Cases

> **Bar and Inventory Management**

**Total: 76 use cases (46 mutations, 30 queries) + 4 orchestrators | 76 zero-arg factories (100% coverage)**

> **REVIEW-2026 Result Pattern Migration**: Complete. All 76 use cases return `Result<T>` using `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. 101 `console.log` statements cleaned up. ~126K LOC.

---

## Quick Index

### Mutations
- [bar-order](#bar-order) - Order management
- [bar-tip](#bar-tip) - Tip handling
- [product](#product) - Product management
- [product-category](#product-category) - Category management
- [combo](#combo) - Product combos
- [point-of-sale](#point-of-sale) - POS operations
- [recipe](#recipe) - Recipe management
- [stock](#stock) - Stock operations
- [stock-item](#stock-item) - Stock item management
- [stock-location](#stock-location) - Location management
- [stock-alert](#stock-alert) - Alert handling
- [supplier](#supplier) - Supplier management
- [purchase-order](#purchase-order) - Purchase orders
- [goods-receipt](#goods-receipt) - Goods reception
- [price-config](#price-config) - Price configuration

### Queries
- [bar-order (queries)](#bar-order-1) - Order queries
- [product (queries)](#product-1) - Product queries
- [inventory](#inventory) - Inventory queries
- [point-of-sale (queries)](#point-of-sale-1) - POS queries
- [purchase-order (queries)](#purchase-order-1) - Purchase order queries
- [goods-receipt (queries)](#goods-receipt-1) - Goods receipt queries
- [supplier (queries)](#supplier-1) - Supplier queries
- [analytics](#analytics) - Analytics queries

### Other Sections
- [Orchestrators](#orchestrators)
- [Entities](#entities)
- [Order Status](#order-status)
- [Purchase Order Status](#purchase-order-status)
- [Related Modules](#related-modules)

---

## Overview

The **dm-bar** module provides comprehensive functionality for bar operations and inventory management within the Rottay platform. It handles the complete lifecycle of bar orders from creation to pickup, manages product catalogs and pricing, and maintains full inventory control including stock tracking, supplier management, and purchase orders.

### Key Capabilities

- **Order Management**: Create, process, and track bar orders through their complete lifecycle
- **Product Catalog**: Manage products, categories, combos, and pricing configurations
- **Point of Sale**: Handle POS operations including opening/closing registers and transaction processing
- **Inventory Control**: Track stock levels, movements, and generate low-stock alerts
- **Recipe Management**: Define product recipes with ingredient tracking for automatic stock deduction
- **Supplier Management**: Maintain supplier relationships and streamline procurement
- **Purchase Orders**: Create, approve, and track purchase orders with goods receipt processing

---

## Mutations

### bar-order
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a new order | `CreateBarOrderUseCase` |
| cancel | Cancels an order | `CancelBarOrderUseCase` |
| pay | Processes payment | `PayBarOrderUseCase` |
| start-preparing | Starts order preparation | `StartPreparingBarOrderUseCase` |
| mark-ready | Marks order as ready | `MarkReadyBarOrderUseCase` |
| confirm-pickup | Confirms order pickup | `ConfirmPickupBarOrderUseCase` |

### bar-tip
| Use Case | Description | Class |
|----------|-------------|-------|
| add | Adds a tip to an order | `AddBarTipUseCase` |

### product
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a new product | `CreateProductUseCase` |
| update | Updates a product | `UpdateProductUseCase` |
| delete | Deletes a product | `DeleteProductUseCase` |
| set-availability | Sets product availability | `SetProductAvailabilityUseCase` |

### product-category
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a category | `CreateProductCategoryUseCase` |
| update | Updates a category | `UpdateProductCategoryUseCase` |

### combo
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a product combo | `CreateComboUseCase` |

### point-of-sale
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a point of sale | `CreatePointOfSaleUseCase` |
| update | Updates a POS | `UpdatePointOfSaleUseCase` |
| open | Opens a register | `OpenPointOfSaleUseCase` |
| close | Closes a register | `ClosePointOfSaleUseCase` |
| pause | Pauses a POS | `PausePointOfSaleUseCase` |

### recipe
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a recipe | `CreateRecipeUseCase` |
| update | Updates a recipe | `UpdateRecipeUseCase` |

### stock
| Use Case | Description | Class |
|----------|-------------|-------|
| adjust | Adjusts stock quantity | `AdjustStockUseCase` |
| reserve | Reserves stock | `ReserveStockUseCase` |
| release | Releases reserved stock | `ReleaseStockUseCase` |
| transfer | Transfers between locations | `TransferStockUseCase` |

### stock-item
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a stock item | `CreateStockItemUseCase` |
| update | Updates a stock item | `UpdateStockItemUseCase` |
| delete | Deletes a stock item | `DeleteStockItemUseCase` |

### stock-location
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a location | `CreateStockLocationUseCase` |
| update | Updates a location | `UpdateStockLocationUseCase` |

### stock-alert
| Use Case | Description | Class |
|----------|-------------|-------|
| acknowledge | Acknowledges an alert | `AcknowledgeStockAlertUseCase` |
| resolve | Resolves an alert | `ResolveStockAlertUseCase` |

### supplier
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a supplier | `CreateSupplierUseCase` |
| update | Updates a supplier | `UpdateSupplierUseCase` |
| delete | Deletes a supplier | `DeleteSupplierUseCase` |
| set-status | Changes supplier status | `SetSupplierStatusUseCase` |

### purchase-order
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a purchase order | `CreatePurchaseOrderUseCase` |
| update | Updates an order | `UpdatePurchaseOrderUseCase` |
| submit | Submits for approval | `SubmitPurchaseOrderUseCase` |
| approve | Approves an order | `ApprovePurchaseOrderUseCase` |
| reject | Rejects an order | `RejectPurchaseOrderUseCase` |
| cancel | Cancels an order | `CancelPurchaseOrderUseCase` |
| mark-ordered | Marks as ordered | `MarkOrderedPurchaseOrderUseCase` |
| add-item | Adds an item | `AddPurchaseOrderItemUseCase` |
| remove-item | Removes an item | `RemovePurchaseOrderItemUseCase` |

### goods-receipt
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a goods receipt | `CreateGoodsReceiptUseCase` |
| update | Updates a receipt | `UpdateGoodsReceiptUseCase` |

### price-config
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates a price configuration | `CreatePriceConfigUseCase` |

---

## Queries

### bar-order
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets an order by ID | `GetBarOrderByIdUseCase` |
| get-by-order-number | Gets by order number | `GetBarOrderByOrderNumberUseCase` |
| get-by-qr | Gets by QR code | `GetBarOrderByQrUseCase` |
| get-queue | Gets the order queue | `GetBarOrderQueueUseCase` |
| list-user-orders | Lists user orders | `ListUserBarOrdersUseCase` |
| get-all-active | Gets all active orders | `GetAllActiveOrdersUseCase` |

### product
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets a product by ID | `GetProductByIdUseCase` |
| get-by-category | Gets by category | `GetProductByCategoryUseCase` |
| list | Lists products | `ListProductsUseCase` |
| search | Searches products | `SearchProductsUseCase` |
| get-catalog | Gets the full catalog | `GetProductCatalogUseCase` |

### inventory
| Use Case | Description | Class |
|----------|-------------|-------|
| get-stock-levels | Gets stock levels | `GetStockLevelsUseCase` |
| get-stock-movements | Gets stock movements | `GetStockMovementsUseCase` |
| list-stock-items | Lists stock items | `ListStockItemsUseCase` |
| get-low-stock-alerts | Gets low stock alerts | `GetLowStockAlertsUseCase` |
| get-recipe-by-id | Gets a recipe | `GetRecipeByIdUseCase` |

### point-of-sale
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets a POS by ID | `GetPointOfSaleByIdUseCase` |
| list | Lists points of sale | `ListPointsOfSaleUseCase` |
| get-stats | Gets POS statistics | `GetPointOfSaleStatsUseCase` |

### purchase-order
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets an order by ID | `GetPurchaseOrderByIdUseCase` |
| list | Lists orders | `ListPurchaseOrdersUseCase` |
| get-pending-approval | Gets pending approvals | `GetPendingApprovalPurchaseOrdersUseCase` |

### goods-receipt
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets a receipt by ID | `GetGoodsReceiptByIdUseCase` |
| list | Lists receipts | `ListGoodsReceiptsUseCase` |
| list-by-purchase-order | Lists by purchase order | `ListGoodsReceiptsByPurchaseOrderUseCase` |

### supplier
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets a supplier by ID | `GetSupplierByIdUseCase` |
| list | Lists suppliers | `ListSuppliersUseCase` |

### analytics
| Use Case | Description | Class |
|----------|-------------|-------|
| get-bar-dashboard-stats | Gets bar dashboard stats | `GetBarDashboardStatsUseCase` |

---

## Orchestrators

| Orchestrator | Description |
|--------------|-------------|
| `OrderOrchestrator` | Manages the complete order flow |
| `InventoryOrchestrator` | Coordinates inventory movements |
| `PricingOrchestrator` | Manages dynamic pricing |
| `PurchaseOrderOrchestrator` | Coordinates purchase orders |

---

## Entities

The dm-bar module manages the following main entities:

| Entity | Description |
|--------|-------------|
| `Product` | Represents a product available for sale |
| `ProductCategory` | Categorization for products |
| `BarOrder` | A customer order at the bar |
| `BarOrderItem` | Individual item within an order |
| `PointOfSale` | A point of sale terminal/register |
| `StockItem` | An item tracked in inventory |
| `Stock` | Current stock levels at a location |
| `StockMovement` | Record of stock changes |
| `StockLocation` | Physical location for inventory |
| `Recipe` | Product recipe with ingredients |
| `Supplier` | Vendor/supplier information |
| `PurchaseOrder` | Order placed with a supplier |
| `GoodsReceipt` | Record of received goods |
| `Combo` | Bundled product offering |
| `PriceConfig` | Pricing configuration rules |

> See [ENTITIES.md](./ENTITIES.md) for detailed entity definitions.

---

## Order Status

```typescript
type BarOrderStatus =
  | 'pending'        // Received
  | 'paid'           // Paid
  | 'preparing'      // In preparation
  | 'ready'          // Ready for pickup
  | 'picked_up'      // Picked up
  | 'cancelled';     // Cancelled
```

---

## Purchase Order Status

```typescript
type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';
```

---

## Related Modules

The dm-bar module integrates with other domain modules for complete functionality:

### Events Module (`dm-events`)
- Bar operations are typically associated with events
- Event venues have bar locations and points of sale
- Order analytics contribute to event metrics
- See: [../events/USE-CASES.md](../events/USE-CASES.md)

### Staff Module (`dm-staff`)
- Staff members are assigned to bar shifts and POS terminals
- Bartender credentials for POS access
- Time tracking for bar staff
- Performance metrics and evaluations
- See: [../staff/USE-CASES.md](../staff/USE-CASES.md)

### Payments Module (`dm-payments`)
- Payment processing for bar orders
- Tip handling and distribution
- Refunds and cancellations
- Settlement and payout coordination
- See: [../payments/USE-CASES.md](../payments/USE-CASES.md)
