import type { ComponentType } from 'react';
import type { StatWidgetPreset, StatWidgetProps } from '../core';

import standardPreset from './standard';
import ringPreset from './ring';
import compactPreset from './compact';

export const standard = standardPreset;
export const ring = ringPreset;
export const compact = compactPreset;

export const PRESETS: Record<StatWidgetPreset, ComponentType<StatWidgetProps>> = {
  standard: standardPreset,
  ring: ringPreset,
  compact: compactPreset,
};
