import type { EngineAwareProps } from '../../../../types';

export type FeatureFlagPanelPreset = 'list' | 'detailed';

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercent?: number;
  environment?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FeatureFlagPanelProps extends EngineAwareProps {
  preset?: FeatureFlagPanelPreset;
  flags: FeatureFlag[];
  onToggle?: (flagKey: string) => void;
  onRolloutChange?: (flagKey: string, percent: number) => void;
  environments?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const FEATURE_FLAG_PANEL_DEFAULTS = {
  preset: 'list' as FeatureFlagPanelPreset,
  flags: [],
};
