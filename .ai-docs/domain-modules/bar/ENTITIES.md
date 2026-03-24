# dm-bar - Entities

> **Entidades del módulo de bar e inventario**

---

## Entidades Principales

### Product

```typescript
interface Product {
  id: string;
  tenantId: string;
  companyId: string;
  categoryId: string;
  name: string;
  description: string;
  sku: string;
  price: {
    amount: number;
    currency: string;
  };
  cost?: {
    amount: number;
    currency: string;
  };
  imageUrl?: string;
  recipeId?: string;
  isAvailable: boolean;
  preparationTime: number;  // minutes
  tags: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ProductCategory

```typescript
interface ProductCategory {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description: string;
  parentId?: string;
  order: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### BarOrder

```typescript
interface BarOrder {
  id: string;
  tenantId: string;
  companyId: string;
  orderNumber: string;
  posId: string;
  userId?: string;
  status: BarOrderStatus;
  items: BarOrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  qrCode: string;
  notes?: string;
  paidAt?: Date;
  preparedAt?: Date;
  pickedUpAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface BarOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  modifiers: ItemModifier[];
  notes?: string;
}
```

### PointOfSale

```typescript
interface PointOfSale {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  locationId: string;
  status: PosStatus;
  openedAt?: Date;
  closedAt?: Date;
  openedBy?: string;
  closedBy?: string;
  cashFloat: number;
  settings: PosSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type PosStatus = 'closed' | 'open' | 'paused';

interface PosSettings {
  autoClose: boolean;
  autoCloseTime?: string;  // HH:mm
  requireCashCount: boolean;
  printReceipts: boolean;
}
```

### StockItem

```typescript
interface StockItem {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  sku: string;
  unit: StockUnit;
  category: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId?: string;
  cost: {
    amount: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type StockUnit = 'unit' | 'kg' | 'g' | 'l' | 'ml' | 'box' | 'case';
```

### Stock

```typescript
interface Stock {
  id: string;
  tenantId: string;
  stockItemId: string;
  locationId: string;
  quantity: number;
  reserved: number;
  available: number;  // quantity - reserved
  lastCountedAt?: Date;
  lastCountedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### StockMovement

```typescript
interface StockMovement {
  id: string;
  tenantId: string;
  stockItemId: string;
  type: MovementType;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  cost?: number;
  createdAt: Date;
  createdBy: string;
}

type MovementType =
  | 'in'          // Entrada
  | 'out'         // Salida
  | 'transfer'    // Transferencia
  | 'adjustment'  // Ajuste
  | 'return'      // Devolución
  | 'waste';      // Merma
```

### Recipe

```typescript
interface Recipe {
  id: string;
  tenantId: string;
  companyId: string;
  productId: string;
  name: string;
  yield: number;
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  preparationTime: number;
  cost: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface RecipeIngredient {
  stockItemId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}
```

### Supplier

```typescript
interface Supplier {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  status: SupplierStatus;
  paymentTerms: string;
  leadTimeDays: number;
  minimumOrder?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type SupplierStatus = 'active' | 'inactive' | 'blocked';
```

### PurchaseOrder

```typescript
interface PurchaseOrder {
  id: string;
  tenantId: string;
  companyId: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  expectedDeliveryDate?: Date;
  deliveredAt?: Date;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface PurchaseOrderItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}
```

### GoodsReceipt

```typescript
interface GoodsReceipt {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  receiptNumber: string;
  receivedAt: Date;
  receivedBy: string;
  items: GoodsReceiptItem[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface GoodsReceiptItem {
  purchaseOrderItemId: string;
  stockItemId: string;
  quantityReceived: number;
  quantityRejected: number;
  rejectionReason?: string;
}
```

---

## Entidades Adicionales

### BarOrderItem

```typescript
interface BarOrderItem {
  id: string;
  tenantId: string;
  orderId: string;
  productId: string;
  comboId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
  modifiers: ItemModifier[];
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  preparedAt?: Date;
  preparedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ItemModifier {
  id: string;
  name: string;
  price: number;
}
```

### BarTip

```typescript
interface BarTip {
  id: string;
  tenantId: string;
  orderId: string;
  posId: string;
  staffId?: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'crypto';
  transactionHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Combo

```typescript
interface Combo {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description: string;
  items: ComboItem[];
  regularPrice: number;
  comboPrice: number;
  discount: number;
  currency: string;
  imageUrl?: string;
  availableFrom?: Date;
  availableUntil?: Date;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface ComboItem {
  productId: string;
  name: string;
  quantity: number;
  substituteOptions?: string[];
}
```

### PriceConfig

```typescript
interface PriceConfig {
  id: string;
  tenantId: string;
  companyId: string;
  productId: string;
  locationId?: string;
  eventId?: string;
  priceType: 'regular' | 'happy_hour' | 'event' | 'vip';
  price: number;
  currency: string;
  validFrom: Date;
  validUntil?: Date;
  conditions?: {
    minQuantity?: number;
    dayOfWeek?: number[];
    timeRange?: { start: string; end: string };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StockAlert

```typescript
interface StockAlert {
  id: string;
  tenantId: string;
  stockItemId: string;
  locationId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  severity: 'info' | 'warning' | 'critical';
  threshold: number;
  currentValue: number;
  message: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### StockLocation

```typescript
interface StockLocation {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  type: 'warehouse' | 'bar' | 'kitchen' | 'storage';
  address?: Address;
  parentLocationId?: string;
  managerId?: string;
  capacity?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ComboItem

```typescript
interface ComboItem {
  id: string;
  tenantId: string;
  companyId: string;
  comboId: string;
  productId: string;
  quantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### RecipeIngredient

```typescript
interface RecipeIngredient {
  id: string;
  tenantId: string;
  companyId: string;
  recipeId: string;
  stockItemId: string;
  quantity: number;              // precision: 10, scale: 3
  unit: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

---

## Relaciones

```
Product         1──1  Recipe
Product         1──*  PriceConfig
ProductCategory 1──*  Product
BarOrder        1──*  BarOrderItem
BarOrder        1──*  BarTip
PointOfSale     1──*  BarOrder
StockItem       1──*  Stock
StockItem       1──*  StockMovement
StockItem       1──*  StockAlert
StockLocation   1──*  Stock
Recipe          1──*  RecipeIngredient
RecipeIngredient *──1 StockItem
Supplier        1──*  PurchaseOrder
PurchaseOrder   1──*  PurchaseOrderItem
PurchaseOrder   1──*  GoodsReceipt
GoodsReceipt    1──*  GoodsReceiptItem
Combo           1──*  ComboItem
ComboItem       *──1  Product
```

---

## Database Tables

> Complete mapping of domain entities to their actual PostgreSQL table names.
> All tables are created via `withSchema()` factory in multi-tenant schemas.

| # | Entity | DB Table | Key Columns | Notes |
|---|--------|----------|-------------|-------|
| 1 | ProductCategory | `bar_product_categories` | id, tenant_id, company_id, name, parent_id, order | Hierarchical categories |
| 2 | Product | `bar_products` | id, tenant_id, company_id, category_id, name, sku, price, product_type (enum) | FK to bar_product_categories |
| 3 | Combo | `bar_combos` | id, tenant_id, company_id, name, combo_price, valid_from, valid_until, is_available | Product bundles |
| 4 | ComboItem | `bar_combo_items` | id, tenant_id, company_id, combo_id, product_id, quantity | Junction: Combo-Product |
| 5 | PriceConfig | `bar_price_configs` | id, tenant_id, company_id, product_id, price_type, price, valid_from, valid_until | Zone/event-specific pricing |
| 6 | StockItem | `bar_stock_items` | id, tenant_id, company_id, name, sku, unit (enum), category (enum), min_stock, reorder_point | Uses bar_unit_of_measure & bar_stock_item_category enums |
| 7 | StockLocation | `bar_stock_locations` | id, tenant_id, company_id, name, type (enum), parent_location_id, is_default | Uses bar_stock_location_type enum |
| 8 | Stock | `bar_stocks` | id, tenant_id, stock_item_id, location_id, quantity, reserved, available | Current inventory levels |
| 9 | Recipe | `bar_recipes` | id, tenant_id, company_id, product_id, name, yield, preparation_time | Product preparation recipes |
| 10 | RecipeIngredient | `bar_recipe_ingredients` | id, tenant_id, company_id, recipe_id, stock_item_id, quantity, unit | Junction: Recipe-StockItem |
| 11 | StockMovement | `bar_stock_movements` | id, tenant_id, stock_item_id, type (enum), quantity, from_location_id, to_location_id, reason | Uses bar_stock_movement_type enum |
| 12 | StockAlert | `bar_stock_alerts` | id, tenant_id, stock_item_id, location_id, type (enum), severity (enum), status (enum), threshold, current_value | Uses bar_stock_alert_type, _severity, _status enums |
| 13 | BarOrder | `bar_orders` | id, tenant_id, company_id, order_number, pos_id, status (enum), payment_status (enum), subtotal, total, qr_code | Uses bar_order_status & bar_payment_status enums |
| 14 | BarOrderItem | `bar_order_items` | id, tenant_id, order_id, product_id, combo_id, name, quantity, unit_price, total, status | FK to bar_orders, bar_products, bar_combos |
| 15 | BarTip | `bar_tips` | id, tenant_id, order_id, pos_id, staff_id, amount, currency, payment_method | FK to bar_orders |
| 16 | PointOfSale | `bar_points_of_sale` | id, tenant_id, company_id, name, location_id, status (enum), cash_float | Uses bar_point_of_sale_status enum |
| 17 | Supplier | `bar_suppliers` | id, tenant_id, company_id, name, contact_name, email, phone, status (enum) | Uses bar_supplier_status enum |
| 18 | PurchaseOrder | `bar_purchase_orders` | id, tenant_id, company_id, order_number, supplier_id, status (enum), subtotal, total | Uses bar_purchase_order_status enum |
| 19 | PurchaseOrderItem | `bar_purchase_order_items` | id, tenant_id, purchase_order_id, stock_item_id, quantity, received_quantity, unit_price | FK to bar_purchase_orders, bar_stock_items |
| 20 | GoodsReceipt | `bar_goods_receipts` | id, tenant_id, purchase_order_id, receipt_number, received_at, received_by | FK to bar_purchase_orders, bar_stock_locations |
| 21 | GoodsReceiptItem | `bar_goods_receipt_items` | id, tenant_id, goods_receipt_id, purchase_order_item_id, stock_item_id, quantity_received, condition (enum) | Uses bar_goods_receipt_condition enum |

### Schema-Specific Enums

| Enum Name | Values | Used By |
|-----------|--------|---------|
| `bar_order_status` | pending, paid, preparing, ready, picked_up, cancelled | `bar_orders.status` |
| `bar_payment_status` | (status values) | `bar_orders.payment_status` |
| `bar_product_type` | drink, food, merchandise | `bar_products.product_type` |
| `bar_stock_item_category` | (category values) | `bar_stock_items.category` |
| `bar_unit_of_measure` | unit, kg, g, l, ml, box, case | `bar_stock_items.unit` |
| `bar_purchase_order_status` | draft, submitted, approved, ordered, partially_received, received, cancelled | `bar_purchase_orders.status` |
| `bar_supplier_status` | active, inactive, blocked | `bar_suppliers.status` |
| `bar_point_of_sale_status` | closed, open, paused | `bar_points_of_sale.status` |
| `bar_stock_alert_type` | low_stock, out_of_stock, expiring | `bar_stock_alerts.type` |
| `bar_stock_alert_severity` | info, warning, critical | `bar_stock_alerts.severity` |
| `bar_stock_alert_status` | (status values) | `bar_stock_alerts.status` |
| `bar_stock_movement_type` | receipt, sale, transfer_in, transfer_out, adjustment, waste | `bar_stock_movements.type` |
| `bar_stock_location_type` | warehouse, bar, kitchen, storage | `bar_stock_locations.type` |
| `bar_goods_receipt_condition` | (condition values) | `bar_goods_receipt_items.condition` |
