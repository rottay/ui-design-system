/**
 * StatsSection - Core Interface
 * Animated statistics for landing pages
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type StatsSectionPreset = 'inline' | 'cards' | 'large';

export interface StatItem {
  key: string;
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
}

export interface StatsSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: StatsSectionPreset;
  /** List of statistics */
  stats: StatItem[];
  /** Optional section title */
  title?: string;
  /** Optional section description */
  description?: string;
}

export const STATS_SECTION_DEFAULTS: Partial<StatsSectionProps> = {
  preset: 'inline',
};
