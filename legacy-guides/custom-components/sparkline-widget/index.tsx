import type { SparklineWidgetProps } from './core';
import { SPARKLINE_WIDGET_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { SparklineWidgetProps, SparklineWidgetPreset } from './core';
export { SPARKLINE_WIDGET_DEFAULTS } from './core';

export function SparklineWidget(props: SparklineWidgetProps): React.ReactElement {
  const preset = props.preset ?? SPARKLINE_WIDGET_DEFAULTS.preset ?? 'line';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

SparklineWidget.displayName = 'SparklineWidget';
