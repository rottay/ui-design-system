import type {
  SpatialLiveMode,
  SpatialMode,
  SpatialQualityBudget,
} from '../../contracts/spatial';

/**
 * Certified v1 quality ceilings. These are upper bounds, not instructions for
 * a scene to allocate up to them.
 */
export const SPATIAL_QUALITY_BUDGETS: Readonly<
  Record<SpatialLiveMode, SpatialQualityBudget>
> = Object.freeze({
  'live-low': Object.freeze({
    quality: 'low' as const,
    maxDpr: 1.25,
    antialias: false,
    powerPreference: 'default' as const,
  }),
  'live-high': Object.freeze({
    quality: 'high' as const,
    maxDpr: 1.5,
    antialias: true,
    powerPreference: 'high-performance' as const,
  }),
});

export function resolveSpatialQualityBudget(
  mode: SpatialMode,
): SpatialQualityBudget | null {
  return mode === 'live-low' || mode === 'live-high'
    ? SPATIAL_QUALITY_BUDGETS[mode]
    : null;
}

/** A performance signal may lower quality, never promote or revive a mode. */
export function downgradeSpatialMode(mode: SpatialMode): SpatialMode {
  return mode === 'live-high' ? 'live-low' : mode;
}
