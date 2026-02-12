/**
 * BarOrderHistory - Main Export
 * DataTable of past orders with filters
 */

import type { BarOrderHistoryProps } from './core';
import { BAR_ORDER_HISTORY_DEFAULTS } from './core';
import { BAR_ORDER_HISTORY_PRESETS } from './presets';

export {
  type BarOrderHistoryProps,
  type BarOrderHistoryPreset,
  type HistoryOrder as BarOrderHistoryOrder,
  BAR_ORDER_HISTORY_DEFAULTS,
} from './core';
export * from './presets';

export function BarOrderHistory(props: BarOrderHistoryProps): React.ReactElement {
  const preset = props.preset ?? BAR_ORDER_HISTORY_DEFAULTS.preset ?? 'table';
  const PresetComponent = BAR_ORDER_HISTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarOrderHistory.displayName = 'BarOrderHistory';

export { TableBarOrderHistory, CompactBarOrderHistory } from './presets';
