import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type HeatmapTimelinePreset = 'player' | 'snapshot';

export interface HeatmapCell {
  x: number;
  y: number;
  intensity: number;
}

export interface HeatmapFrame {
  timestamp: Date;
  data: HeatmapCell[];
  annotation?: string;
}

export interface TimelineEvent {
  timestamp: Date;
  label: string;
  type: 'dj-change' | 'bar-close' | 'set-start' | 'set-end' | 'weather';
}

export interface HeatmapTimelineProps extends EngineAwareProps {
  preset?: HeatmapTimelinePreset;
  frames?: HeatmapFrame[];
  events?: TimelineEvent[];
  playbackSpeed?: number;
  currentTimestamp?: Date;
  onSeek?: (timestamp: Date) => void;
  onCompare?: (timestamp1: Date, timestamp2: Date) => void;
  style?: CSSProperties;
  className?: string;
}

export const HEATMAP_TIMELINE_DEFAULTS: Required<
  Pick<HeatmapTimelineProps, 'preset' | 'frames' | 'events' | 'playbackSpeed'>
> = {
  preset: 'player',
  frames: [],
  events: [],
  playbackSpeed: 1,
};
