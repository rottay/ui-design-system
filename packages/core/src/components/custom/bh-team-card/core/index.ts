/**
 * BhTeamCard - Core Interface
 * Team summary card with performance metrics for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTeamCardPreset = 'standard' | 'compact';

export interface TeamMetric {
  label: string;
  value: number;
  target: number;
}

export interface BhTeamCardProps extends EngineAwareProps {
  preset?: BhTeamCardPreset;
  teamName: string;
  department: string;
  memberCount: number;
  metrics: TeamMetric[];
  status?: 'active' | 'inactive';
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BH_TEAM_CARD_DEFAULTS: Partial<BhTeamCardProps> = {
  preset: 'standard',
  status: 'active',
};
