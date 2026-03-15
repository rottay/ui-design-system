import type { EngineAwareProps } from '../../../../types';

export type ProgressTrackerPreset = 'linear' | 'circular' | 'milestone';

export interface ProgressStage {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  description?: string;
  icon?: string;
}

export interface ProgressTrackerProps extends EngineAwareProps {
  preset?: ProgressTrackerPreset;
  stages: ProgressStage[];
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PROGRESS_TRACKER_DEFAULTS = {
  preset: 'linear' as ProgressTrackerPreset,
  stages: [],
};
