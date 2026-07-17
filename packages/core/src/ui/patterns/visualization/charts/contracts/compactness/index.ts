/** Runtime values and operations separated from the public type contract. */

import type { ChartCompactConfig } from '..';

/** Sensible defaults for compact mode so charts work well on mobile without config */
export const DEFAULT_COMPACT_CONFIG: Required<ChartCompactConfig> = {
  hideLegend: true,
  maxTicks: 4,
  compactTooltip: true,
  hideSeriesLabels: false,
  minHeight: 150,
};
