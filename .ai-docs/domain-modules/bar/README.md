# Bar Module (dm-bar)

> **Bar and inventory management for events and venues**

## What It Does

The Bar module handles all bar operations including product management, order processing, point-of-sale operations, inventory tracking, and supplier management. It supports real-time order queues, dynamic pricing, and comprehensive stock management.

The module manages the complete supply chain from purchase orders to goods receipt, with stock alerts for low inventory. It integrates with the Events module for event-based bar operations and the Payments module for transaction processing.

## When to Use

- **Product Management**: Create and manage bar products
- **Order Processing**: Handle bar orders and queues
- **POS Operations**: Manage points of sale
- **Inventory**: Track stock levels and movements
- **Purchasing**: Create and manage purchase orders
- **Suppliers**: Manage supplier relationships

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Product** | Bar item for sale |
| **BarOrder** | Customer order |
| **PointOfSale** | POS terminal/station |
| **StockItem** | Inventory item |
| **PurchaseOrder** | Supplier order |
| **Recipe** | Product ingredients |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 76 use cases (46 mutations + 30 queries) + 4 orchestrators |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- all 76 use cases migrated
- **Pattern**: All use cases now return `Result<T>` via `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core` instead of throwing errors or returning manual `{ success: true/false }` objects
- **Cleanup**: 101 `console.log` statements removed
- **Codebase size**: ~126K LOC

## Import

```typescript
// Orders
import { makeCreateBarOrderUC, makePayOrderUC, makeConfirmPickupUC } from '@rottay/bar';

// Products
import { makeCreateProductUC, makeSetAvailabilityUC } from '@rottay/bar';

// POS
import { makeCreatePointOfSaleUC, makeOpenPosUC, makeClosePosUC } from '@rottay/bar';

// Inventory
import { makeAdjustStockUC, makeTransferStockUC } from '@rottay/bar';

// Purchasing
import { makeCreatePurchaseOrderUC, makeApprovePurchaseOrderUC } from '@rottay/bar';
```

## Order Status Flow

```typescript
type BarOrderStatus =
  | 'pending'    // Order received
  | 'paid'       // Payment processed
  | 'preparing'  // Being prepared
  | 'ready'      // Ready for pickup
  | 'picked_up'  // Customer collected
  | 'cancelled'; // Order cancelled
```

## Related Modules

- [Events](../events/) - Event-based bar operations
- [Staff](../staff/) - Bar staff management
- [Payments](../payments/) - Order payments
