import type { EngineAwareProps } from '../../../../types';

export type LeaderboardPreset = 'numbered' | 'avatar' | 'bar';

export interface LeaderboardEntry {
  rank?: number;
  name: string;
  value: string | number;
  avatar?: string;
  badge?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface LeaderboardProps extends EngineAwareProps {
  preset?: LeaderboardPreset;
  entries: LeaderboardEntry[];
  title?: string;
  maxEntries?: number;
  valueLabel?: string;
  unit?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LEADERBOARD_DEFAULTS = {
  preset: 'numbered' as LeaderboardPreset,
  entries: [],
  maxEntries: 10,
};
