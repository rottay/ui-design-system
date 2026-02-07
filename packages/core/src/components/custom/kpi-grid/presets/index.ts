import type { KpiGridPreset } from '../core';
import { Cards } from './cards';
import { Compact } from './compact';
import { Detailed } from './detailed';

export const PRESETS: Record<KpiGridPreset, React.ComponentType<any>> = {
  'cards': Cards,
  'compact': Compact,
  'detailed': Detailed,
};
