import type { ChartPersonalityTokens } from '@/foundation/contracts/kernel/tokens/personality';

import { CHART_SCHEME_LITERALS } from '../../../../../foundation/palettes';

/**
 * The bounded categorical vocabulary size. Series beyond the last slot cycle,
 * and the resolver's `slotIndexFor` is the one owner of that rule.
 */
export const CHART_CATEGORICAL_SIZE = CHART_SCHEME_LITERALS.accessible.length;

type BoundedChartScheme = keyof typeof CHART_SCHEME_LITERALS;

/**
 * Canonical categorical paint resolution, highest precedence first:
 *
 *   1. authored `--ds-chart-category-N` (tenant document channel)
 *   2. generated `--ds-chart-series-N` (tenant-scope compiler output)
 *   3. `--ds-chart-{scheme}-N` (mode-aware channel; dark override in patterns.css)
 *   4. embedded audited light literal (stylesheet-free rendering)
 *
 * `--ds-chart-series-N` is a reserved name owned exclusively by the tenant
 * appearance compiler. The design-system runtime must never DEFINE it — an
 * element-scope definition would shadow the inherited tenant palette (nearest
 * custom-property definition wins) — so this module returns consumption
 * expressions only, and every runtime sink (marks, legend swatches, the
 * chart-foundation.css `--ds-chart-paint-N` bridge, personality palettes)
 * resolves through this one chain.
 */
function createSeriesPaint(scheme: BoundedChartScheme): readonly string[] {
  return Object.freeze(
    CHART_SCHEME_LITERALS[scheme].map((fallback, index) => {
      const slot = index + 1;
      return `var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, var(--ds-chart-${scheme}-${slot}, ${fallback})))`;
    }),
  );
}

const SERIES_PAINT = Object.freeze({
  accessible: createSeriesPaint('accessible'),
  default: createSeriesPaint('default'),
  monochrome: createSeriesPaint('monochrome'),
  pastel: createSeriesPaint('pastel'),
  vibrant: createSeriesPaint('vibrant'),
});

/**
 * Resolve a bounded chart scheme to its categorical paint expressions. Status
 * tokens are absent from every tier: a category never borrows status meaning.
 */
export function resolveChartSeriesPaint(
  scheme: ChartPersonalityTokens['colorScheme'] = 'default',
): readonly string[] {
  return SERIES_PAINT[scheme] ?? SERIES_PAINT.default;
}
