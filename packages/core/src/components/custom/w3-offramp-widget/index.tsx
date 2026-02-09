/**
 * W3OfframpWidget - Main Export
 * Convert crypto to fiat currency with bank transfer and withdrawal options
 */

import type { W3OfframpWidgetProps } from './core';
import { W3_OFFRAMP_WIDGET_DEFAULTS } from './core';
import { W3_OFFRAMP_WIDGET_PRESETS } from './presets';

export { type W3OfframpWidgetProps, type W3OfframpWidgetPreset, W3_OFFRAMP_WIDGET_DEFAULTS } from './core';
export * from './presets';

export function W3OfframpWidget(props: W3OfframpWidgetProps): React.ReactElement {
  const preset = props.preset ?? W3_OFFRAMP_WIDGET_DEFAULTS.preset ?? 'widget';
  const PresetComponent = W3_OFFRAMP_WIDGET_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3OfframpWidget.displayName = 'W3OfframpWidget';
