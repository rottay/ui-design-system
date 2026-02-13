/**
 * BhTeamPerformance - Core Interface
 * BarChart comparing team performance metrics for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTeamPerformancePreset = 'chart' | 'compact';

export interface TeamPerfData {
  teamName: string;
  hires: number;
  timeToFill: number;
  qualityScore: number;
  satisfaction: number;
}

export interface BhTeamPerformanceProps extends EngineAwareProps {
  preset?: BhTeamPerformancePreset;
  teams: TeamPerfData[];
  metric?: 'hires' | 'timeToFill' | 'qualityScore' | 'satisfaction';
  title?: string;
  onTeamClick?: (teamName: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_TEAM_PERFORMANCE_DEFAULTS: Partial<BhTeamPerformanceProps> = {
  preset: 'chart',
  metric: 'hires',
  loading: false,
};
