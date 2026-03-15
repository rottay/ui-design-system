import type { HeatmapTimelineProps } from './core';
import { HEATMAP_TIMELINE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  HeatmapTimelineProps,
  HeatmapFrame,
  HeatmapCell,
  TimelineEvent,
  HeatmapTimelinePreset,
} from './core';

export type EvHeatmapTimelineProps = HeatmapTimelineProps;

export function HeatmapTimeline(props: HeatmapTimelineProps) {
  const { preset = HEATMAP_TIMELINE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

HeatmapTimeline.displayName = 'HeatmapTimeline';

export const EvHeatmapTimeline = HeatmapTimeline;
export { HeatmapTimelinePlayer, HeatmapTimelineSnapshot } from './presets';
