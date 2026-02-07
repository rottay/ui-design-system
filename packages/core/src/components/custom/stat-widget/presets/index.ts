import React from 'react';
import type { StatWidgetPreset } from '../core';

import standardPreset from './standard';
import ringPreset from './ring';
import compactPreset from './compact';

export const standard = standardPreset;
export const ring = ringPreset;
export const compact = compactPreset;

export const PRESETS: Record<StatWidgetPreset, React.ComponentType<any>> = {
  standard: standardPreset,
  ring: ringPreset,
  compact: compactPreset,
};
