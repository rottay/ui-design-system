/**
 * EvTableOrder - Main Export
 * Per-table orders with timing, preparation status, and order history
 */

import type { EvTableOrderProps } from './core';
import { EV_TABLE_ORDER_DEFAULTS } from './core';
import { EV_TABLE_ORDER_PRESETS } from './presets';

export {
  type EvTableOrderProps,
  type EvTableOrderPreset,
  type TableOrderItem as EvTableOrderItem,
  type TableOrder as EvTableOrderTableOrder,
  EV_TABLE_ORDER_DEFAULTS,
} from './core';
export * from './presets';

export function EvTableOrder(props: EvTableOrderProps): React.ReactElement {
  const preset = props.preset ?? EV_TABLE_ORDER_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = EV_TABLE_ORDER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvTableOrder.displayName = 'EvTableOrder';

export { TimelineEvTableOrder, GridEvTableOrder } from './presets';
