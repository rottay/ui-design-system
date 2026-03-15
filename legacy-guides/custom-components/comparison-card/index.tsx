import type { ComparisonCardProps } from './core';
import { COMPARISON_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ComparisonCardProps, ComparisonCardPreset, ComparisonMetric } from './core';
export { COMPARISON_CARD_DEFAULTS } from './core';

export function ComparisonCard(props: ComparisonCardProps): React.ReactElement {
  const preset = props.preset ?? COMPARISON_CARD_DEFAULTS.preset ?? 'side-by-side';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ComparisonCard.displayName = 'ComparisonCard';
