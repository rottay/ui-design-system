import type { ChartPersonalityTokens } from '@/contracts/tokens/personality';

export const CHART_CATEGORICAL_SIZE = 10;

export type ChartSeriesVariableName = `--ds-chart-series-${number}`;
export type ChartSeriesVariableMap = Readonly<Record<ChartSeriesVariableName, string>>;

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
 * Resolve a scheme through mode-aware DS channels. The concrete fallback is
 * the audited light-surface color used when consumers omit the stylesheet;
 * patterns.css replaces it in dark mode. Tenant-owned category channels still
 * wrap these values later and therefore retain highest visual precedence.
 */
function createSchemePalette(scheme: BoundedChartScheme): readonly string[] {
  return Object.freeze(
    LIGHT_FALLBACKS[scheme].map(
      (fallback, index) => `var(--ds-chart-${scheme}-${index + 1}, ${fallback})`,
    ),
  );
}

const ACCESSIBLE = createSchemePalette('accessible');
const DEFAULT = createSchemePalette('default');
const MONOCHROME = createSchemePalette('monochrome');
const PASTEL = createSchemePalette('pastel');
const VIBRANT = createSchemePalette('vibrant');

const SCHEMES = Object.freeze({
  accessible: Object.freeze(ACCESSIBLE),
  default: Object.freeze(DEFAULT),
  monochrome: Object.freeze(MONOCHROME),
  pastel: Object.freeze(PASTEL),
  vibrant: Object.freeze(VIBRANT),
});

/**
 * Maps the bounded tenant chart scheme to provider-scoped CSS channels.
 * Status tokens are intentionally absent: arbitrary categories may never
 * borrow success, warning, error, or info meaning.
 */
export function resolveChartSeriesVariables(
  scheme: ChartPersonalityTokens['colorScheme'] = 'default',
): ChartSeriesVariableMap {
  const palette = SCHEMES[scheme] ?? SCHEMES.default;
  const [one, two, three, four, five, six, seven, eight, nine, ten] = palette;

  return Object.freeze({
    '--ds-chart-series-1': `var(--ds-chart-category-1, ${one})`,
    '--ds-chart-series-2': `var(--ds-chart-category-2, ${two})`,
    '--ds-chart-series-3': `var(--ds-chart-category-3, ${three})`,
    '--ds-chart-series-4': `var(--ds-chart-category-4, ${four})`,
    '--ds-chart-series-5': `var(--ds-chart-category-5, ${five})`,
    '--ds-chart-series-6': `var(--ds-chart-category-6, ${six})`,
    '--ds-chart-series-7': `var(--ds-chart-category-7, ${seven})`,
    '--ds-chart-series-8': `var(--ds-chart-category-8, ${eight})`,
    '--ds-chart-series-9': `var(--ds-chart-category-9, ${nine})`,
    '--ds-chart-series-10': `var(--ds-chart-category-10, ${ten})`,
  });
}
