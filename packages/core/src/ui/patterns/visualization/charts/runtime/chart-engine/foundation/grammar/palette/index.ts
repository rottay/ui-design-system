import type { ChartPersonalityTokens } from '@/foundation/contracts/kernel/tokens/personality';

export const CHART_CATEGORICAL_SIZE = 10;

const LIGHT_FALLBACKS = Object.freeze({
  accessible: Object.freeze([
    '#2f6b9a', '#a23b72', '#1f7a55', '#9a5700', '#355cb5',
    '#7a4595', '#5f6368', '#006d77', '#9b4a5a', '#4d6a00',
  ]),
  default: Object.freeze([
    '#0f766e', '#8c6d46', '#b24d3a', '#296f68', '#735838',
    '#963f31', '#3d756f', '#7d6140', '#a04435', '#5e5a52',
  ]),
  monochrome: Object.freeze([
    '#2c5587', '#3a6fb0', '#21528b', '#4b78ad', '#315f97',
    '#103968', '#526f91', '#37699f', '#274b77', '#5a789a',
  ]),
  pastel: Object.freeze([
    '#527aa3', '#9b557a', '#3d8065', '#9a652b', '#5c6fb0',
    '#80628f', '#686868', '#3b777c', '#95606a', '#62752e',
  ]),
  vibrant: Object.freeze([
    '#006b63', '#a12b68', '#007a4d', '#a65000', '#244fc0',
    '#702a91', '#4e545b', '#00727b', '#a3364f', '#486900',
  ]),
});

type BoundedChartScheme = keyof typeof LIGHT_FALLBACKS;

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
    LIGHT_FALLBACKS[scheme].map((fallback, index) => {
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
 * Resolve a bounded chart scheme to its ten categorical paint expressions.
 * Status tokens are intentionally absent from every tier: arbitrary categories
 * may never borrow success, warning, error, or info meaning.
 */
export function resolveChartSeriesPaint(
  scheme: ChartPersonalityTokens['colorScheme'] = 'default',
): readonly string[] {
  return SERIES_PAINT[scheme] ?? SERIES_PAINT.default;
}
