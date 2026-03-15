import React from 'react';
import type { StatWidgetProps } from './core';
import { STAT_WIDGET_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { StatWidgetProps, StatWidgetPreset } from './core';
export { STAT_WIDGET_DEFAULTS } from './core';

export function StatWidget(props: StatWidgetProps) {
  const { preset = STAT_WIDGET_DEFAULTS.preset!, ...rest } = props;
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown StatWidget preset: ${preset}`);
  }

  return <PresetComponent {...rest} />;
}
