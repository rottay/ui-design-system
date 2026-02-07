import type { MetricTerminalCardProps } from './core';
import { METRIC_TERMINAL_CARD_DEFAULTS } from './core';
import { METRIC_TERMINAL_CARD_PRESETS } from './presets';

export { type MetricTerminalCardProps, type MetricTerminalCardPreset, type TrendDirection, METRIC_TERMINAL_CARD_DEFAULTS } from './core';
export * from './presets';

export function MetricTerminalCard(props: MetricTerminalCardProps): React.ReactElement {
  const preset = props.preset ?? METRIC_TERMINAL_CARD_DEFAULTS.preset ?? 'command';
  const PresetComponent = METRIC_TERMINAL_CARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

MetricTerminalCard.displayName = 'MetricTerminalCard';
