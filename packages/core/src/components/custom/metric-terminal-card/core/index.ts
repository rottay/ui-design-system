import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type MetricTerminalCardPreset = 'command' | 'hud' | 'circuit' | 'matrix';

export type TrendDirection = 'up' | 'down';

export interface MetricTerminalCardProps extends EngineAwareProps {
  preset?: MetricTerminalCardPreset;
  label: string;
  value: number | string;
  change?: string;
  trend?: TrendDirection;
  icon?: ReactNode;
  progress?: number;
  subtitle?: string;
  onClick?: () => void;
  animationIntensity?: 'none' | 'subtle' | 'full';
  compact?: boolean;
  stats?: Array<{ label: string; value: string }>;
  actions?: Array<{ key: string; label: string; icon?: ReactNode; onClick?: () => void }>;
  statusLabel?: string;
  liveIndicator?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const METRIC_TERMINAL_CARD_DEFAULTS: Partial<MetricTerminalCardProps> = {
  preset: 'command',
  animationIntensity: 'full',
  liveIndicator: false,
};
