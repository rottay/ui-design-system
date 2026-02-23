import type { KpiGridPreset, KpiGridProps } from '../core';
import type { ComponentType } from 'react';
import { Cards } from './cards';
import { Compact } from './compact';
import { Detailed } from './detailed';

export const PRESETS: Record<KpiGridPreset, ComponentType<KpiGridProps>> = {
  'cards': Cards,
  'compact': Compact,
  'detailed': Detailed,
};
