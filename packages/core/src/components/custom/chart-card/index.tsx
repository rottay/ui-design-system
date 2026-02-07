import React from 'react';
import type { ChartCardProps } from './core';
import { CHART_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ChartCardProps, ChartCardPreset, ChartTrendDirection } from './core';
export { CHART_CARD_DEFAULTS } from './core';

export function ChartCard(props: ChartCardProps) {
  const { preset = CHART_CARD_DEFAULTS.preset!, ...rest } = props;
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown ChartCard preset: ${preset}`);
  }

  return <PresetComponent {...rest} />;
}
