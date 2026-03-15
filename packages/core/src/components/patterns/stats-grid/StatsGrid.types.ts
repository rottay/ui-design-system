/**
 * StatsGrid - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, StatDef } from '../types';

export interface StatsGridProps extends PatternBaseProps {
  /** Stat definitions */
  stats: StatDef[];
  /** Custom stat renderer */
  renderStat?: (stat: StatDef, defaultRender: ReactNode) => ReactNode;
  /** Number of columns */
  columns?: number;
  /** Enable D3 sparklines */
  sparkline?: boolean;
  /** Gap between cards */
  gap?: number | string;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'filled' | 'glass';
  /** Animate values on mount */
  animate?: boolean;
  /** Stat click handler */
  onStatClick?: (stat: StatDef) => void;
}
