/** Runtime values and operations separated from the public type contract. */

/**
 * The one declaration of the twelve categorical slots per scheme; all clear WCAG
 * 3:1 and slots 11-12 also clear the ten's OKLab floor (`ChartPalette.contrast`).
 */
export const CHART_SCHEME_LITERALS = Object.freeze({
  accessible: Object.freeze([
    '#2f6b9a', '#a23b72', '#1f7a55', '#9a5700', '#355cb5', '#7a4595',
    '#5f6368', '#006d77', '#9b4a5a', '#4d6a00', '#a53426', '#6d5a24',
  ]),
  default: Object.freeze([
    '#0f766e', '#8c6d46', '#b24d3a', '#296f68', '#735838', '#963f31',
    '#3d756f', '#7d6140', '#a04435', '#5e5a52', '#366916', '#716901',
  ]),
  monochrome: Object.freeze([
    '#2c5587', '#3a6fb0', '#21528b', '#4b78ad', '#315f97', '#103968',
    '#526f91', '#37699f', '#274b77', '#5a789a', '#123b5b', '#355c81',
  ]),
  pastel: Object.freeze([
    '#527aa3', '#9b557a', '#3d8065', '#9a652b', '#5c6fb0', '#80628f',
    '#686868', '#3b777c', '#95606a', '#62752e', '#a64e41', '#857449',
  ]),
  vibrant: Object.freeze([
    '#006b63', '#a12b68', '#007a4d', '#a65000', '#244fc0', '#702a91',
    '#4e545b', '#00727b', '#a3364f', '#486900', '#006db3', '#614805',
  ]),
});

/**
 * Legacy categorical fallback for imperative families and SSR paths that cannot
 * read a custom property; anything that can consumes `resolveChartSeriesPaint`.
 */
export const ACCESSIBLE_COLORS = CHART_SCHEME_LITERALS.accessible;

/**
 * Default palette for a no-config legacy chart. Status tokens are never reused
 * as arbitrary categories.
 */
export const DEFAULT_COLORS = CHART_SCHEME_LITERALS.default;
