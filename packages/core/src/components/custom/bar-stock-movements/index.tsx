/**
 * BarStockMovements - Main Export
 * Timeline of stock movements
 */

import type { BarStockMovementsProps } from './core';
import { BAR_STOCK_MOVEMENTS_DEFAULTS } from './core';
import { BAR_STOCK_MOVEMENTS_PRESETS } from './presets';

export {
  type BarStockMovementsProps,
  type BarStockMovementsPreset,
  type StockMovement as BarStockMovement,
  type MovementType as BarStockMovementType,
  BAR_STOCK_MOVEMENTS_DEFAULTS,
} from './core';
export * from './presets';

export function BarStockMovements(props: BarStockMovementsProps): React.ReactElement {
  const preset = props.preset ?? BAR_STOCK_MOVEMENTS_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BAR_STOCK_MOVEMENTS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarStockMovements.displayName = 'BarStockMovements';

export { TimelineBarStockMovements, TableBarStockMovements } from './presets';
