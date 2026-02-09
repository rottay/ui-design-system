/**
 * W3OnrampWidget - Main Export
 * Convert fiat currency to crypto with provider selection and rate comparison
 */

import type { W3OnrampWidgetProps } from './core';
import { W3_ONRAMP_WIDGET_DEFAULTS } from './core';
import { W3_ONRAMP_WIDGET_PRESETS } from './presets';

export { type W3OnrampWidgetProps, type W3OnrampWidgetPreset, W3_ONRAMP_WIDGET_DEFAULTS } from './core';
export * from './presets';

export function W3OnrampWidget(props: W3OnrampWidgetProps): React.ReactElement {
  const preset = props.preset ?? W3_ONRAMP_WIDGET_DEFAULTS.preset ?? 'widget';
  const PresetComponent = W3_ONRAMP_WIDGET_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3OnrampWidget.displayName = 'W3OnrampWidget';
