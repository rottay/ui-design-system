/**
 * Serializable schema manifest for TenantThemeConfig v1.
 *
 * Validation is derived from this object. Platform editors and persistence
 * adapters can compare its canonical digest instead of maintaining a second
 * field inventory by hand.
 */

import { MOTION_DIAL_BOUNDS } from '@/foundation/contracts/runtime/motion';
import { TENANT_PRESENTATION_PROFILE_IDS } from '@/foundation/contracts/composition/tenants/themes';
import {
  TENANT_THEME_OVERRIDE_TOKENS_V1,
  TENANT_THEME_REFERENCE_TOKENS_V1,
  TENANT_THEME_FONT_PACK_IDS_V1,
  TENANT_THEME_SCHEMA_VERSION,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

export type TenantThemeSchemaNode =
  | { type: 'object'; fields: Readonly<Record<string, TenantThemeSchemaNode>>; required?: readonly string[] }
  | { type: 'literal'; value: string | number }
  | { type: 'enum'; values: readonly (string | number)[] }
  | { type: 'string'; format: 'identifier' | 'slug' | 'color' | 'hex-color' | 'font-family' | 'visual-value' }
  | { type: 'number'; integer?: boolean; min?: number; max?: number };

const literal = (value: string | number): TenantThemeSchemaNode => ({ type: 'literal', value });
const enumeration = (...values: Array<string | number>): TenantThemeSchemaNode => ({ type: 'enum', values });
const string = (format: Extract<TenantThemeSchemaNode, { type: 'string' }>['format']): TenantThemeSchemaNode => ({
  type: 'string',
  format,
});
const number = (options: Omit<Extract<TenantThemeSchemaNode, { type: 'number' }>, 'type'> = {}): TenantThemeSchemaNode => ({
  type: 'number',
  ...options,
});
const object = (
  fields: Readonly<Record<string, TenantThemeSchemaNode>>,
  required: readonly string[] = [],
): TenantThemeSchemaNode => ({ type: 'object', fields, ...(required.length > 0 ? { required } : {}) });

const visualFields = (fields: readonly string[]): Readonly<Record<string, TenantThemeSchemaNode>> =>
  Object.fromEntries(fields.map((field) => [field, string('visual-value')]));

const COLOR = string('color');
const HEX_COLOR = string('hex-color');
const VISUAL = string('visual-value');
const FONT_WEIGHT = number({ min: 1, max: 1000 });
const OPACITY = number({ min: 0, max: 1 });

const general = object({
  presentationProfile: enumeration(...TENANT_PRESENTATION_PROFILE_IDS),
  palette: object({
    primary: COLOR,
    secondary: COLOR,
    accent: COLOR,
    backgroundMode: enumeration('light', 'dark', 'auto'),
  }),
  typography: object({
    fontFamilyBase: string('font-family'),
    fontFamilyHeading: string('font-family'),
  }),
  shape: object({ buttonStyle: enumeration('sharp', 'soft', 'pill') }),
  density: enumeration('compact', 'normal', 'spacious'),
  motion: object({
    intensity: number({ min: MOTION_DIAL_BOUNDS.intensity.min, max: MOTION_DIAL_BOUNDS.intensity.max }),
    durationScale: number({ min: MOTION_DIAL_BOUNDS.durationScale.min, max: MOTION_DIAL_BOUNDS.durationScale.max }),
    ambient: enumeration('off', 'subtle'),
  }),
  surfaces: object({ elevation: enumeration('flat', 'soft', 'elevated') }),
  navigation: object({ sidebarTone: enumeration('subtle', 'strong', 'inverse') }),
});

const sidebar = object({
  ...visualFields([
    'bg',
    'border',
    'text',
    'textMuted',
    'groupFontSize',
    'groupColor',
    'groupLetterSpacing',
    'itemFontSize',
    'itemColor',
    'itemColorActive',
    'itemBgActive',
    'itemBgHover',
    'itemPadding',
    'footerBg',
  ]),
  groupFontWeight: FONT_WEIGHT,
  itemFontWeight: FONT_WEIGHT,
  itemFontWeightActive: FONT_WEIGHT,
});

const shell = object(visualFields([
  'gridSize',
  'gridLine',
  'bg',
  'border',
  'overlay',
  'shadow',
  'activeBg',
  'activeGradient',
  'dropdownShadow',
  'shimmerFaint',
  'shimmerSoft',
  'shimmerMedium',
  'shimmerStrong',
  'commandFont',
  'commandLetterSpacing',
  'commandGridSize',
  'commandGridLineSoft',
  'commandGridLine',
  'commandGridLineStrong',
  'commandGridBg',
  'commandGridBgStrong',
  'commandGlow',
  'commandLine',
  'commandRailBg',
  'commandHomeGridLine',
  'commandHomePanelBorder',
  'commandHomePanelBorderSoft',
  'commandHomePanelShadow',
  'commandHomePanelBg',
  'commandHomePanelBgStrong',
  'commandHomeConsoleBg',
  'commandHomeSurfaceBg',
  'commandHomeHeroBg',
  'commandHomeControlBg',
  'commandHomeControlBorder',
  'commandHomeControlHoverBg',
  'commandHomeControlHoverBorder',
  'commandHomeMeterBg',
  'commandHomeMeterFill',
]));

const buttonVariant = object(visualFields([
  'bg',
  'bgHover',
  'bgActive',
  'color',
  'text',
  'border',
  'borderHover',
  'shadow',
  'shadowHover',
]));

const input = object({
  ...visualFields([
    'bg',
    'bgHover',
    'bgFocus',
    'bgDisabled',
    'color',
    'colorPlaceholder',
    'colorDisabled',
    'border',
    'borderHover',
    'borderFocus',
    'borderDisabled',
    'shadowFocus',
    'successBorder',
    'successShadowFocus',
    'warningBorder',
    'warningShadowFocus',
    'errorBorder',
    'errorShadowFocus',
    'errorColor',
  ]),
  disabledOpacity: OPACITY,
  filled: object(visualFields(['bg', 'bgHover', 'bgFocus'])),
  addon: object(visualFields(['bg', 'color', 'border'])),
  label: object(visualFields(['color'])),
  helper: object(visualFields(['color'])),
  clear: object(visualFields(['color', 'colorHover'])),
});

const controls = object({
  buttonPrimary: buttonVariant,
  buttonSecondary: buttonVariant,
  buttonDefault: buttonVariant,
  buttonGhost: buttonVariant,
  buttonText: buttonVariant,
  buttonLink: object(visualFields(['color', 'colorHover', 'colorActive'])),
  buttonSuccess: buttonVariant,
  buttonWarning: buttonVariant,
  buttonError: buttonVariant,
  buttonInfo: buttonVariant,
  disabled: object({
    ...visualFields(['bg', 'text', 'border', 'borderColor']),
    opacity: OPACITY,
  }),
  focusRing: VISUAL,
  input,
});

const premiumCardFields: Readonly<Record<string, TenantThemeSchemaNode>> = visualFields([
  'bg',
  'bgHover',
  'border',
  'borderHover',
  'selectedBorder',
  'selectedRing',
  'shadow',
  'shadowHover',
  'radius',
  'padding',
  'gap',
  'glassBg',
  'gridSize',
  'gridLine',
  'gridBg',
  'overlay',
  'sheen',
  'depth',
  'iconColor',
  'titleColor',
  'bodyColor',
  'labelColor',
  'valueColor',
  'valueHoverColor',
  'footerBg',
  'footerBorder',
  'footerColor',
  'statusBg',
  'statusBorder',
  'statusColor',
  'actionBg',
  'actionBorder',
  'actionColor',
  'meterTrack',
  'meterTrackBorder',
  'meterFill',
  'numberMinWidth',
  'numberFontVariant',
]);

const chrome = object({
  sidebar,
  layout: object(visualFields(['bg', 'headerBg', 'headerBackdrop', 'headerBorder', 'siderBg', 'siderBorder'])),
  shell,
  toolbar: object(visualFields([
    'bg', 'border', 'borderBottom', 'color', 'shadow', 'radius', 'padding', 'gap',
    'controlBg', 'controlBorder', 'controlColor', 'divider',
  ])),
  filterPill: object(visualFields([
    'bg', 'border', 'color', 'shadow', 'frameBg', 'frameBorder', 'frameShadow',
    'hoverBg', 'hoverBorder', 'activeBg', 'activeBorder', 'activeColor', 'activeShadow',
    'focusRing', 'countBg', 'countActiveBg', 'countBorder', 'countActiveBorder',
    'countRing', 'countActiveRing',
  ])),
  breadcrumb: object({
    ...visualFields([
      'bg', 'border', 'color', 'linkColor', 'itemColor', 'colorHover', 'colorActive',
      'separatorColor', 'fontSize', 'padding',
    ]),
    fontWeight: FONT_WEIGHT,
  }),
  search: object(visualFields([
    'bg', 'border', 'color', 'shadow', 'radius', 'inputBg', 'inputBorder', 'inputColor',
    'placeholderColor', 'iconColor', 'clearColor', 'clearColorHover', 'resultBg',
    'resultBgHover', 'resultBorder', 'resultShadow', 'resultTitleColor', 'resultMetaColor',
    'categoryColor', 'emptyBg',
  ])),
  controls,
  table: object({
    ...visualFields([
      'bg', 'border', 'radius', 'headerBg', 'headerBgHover', 'headerColor', 'headerFontSize',
      'headerBorder', 'headerShadow', 'rowBg', 'rowBgHover', 'rowBgStriped', 'rowBgSelected',
      'rowBgExpanded', 'rowBorder', 'rowHoverShadow', 'cellPadding', 'cellFontSize',
      'cellColor', 'filterRowBg', 'filterFocusShadow', 'resizeBg', 'resizeBgHover',
      'reorderBg', 'actionBg', 'actionBorder', 'sheen', 'pageButtonHoverShadow',
      'loadingOverlayBg',
    ]),
    headerFontWeight: FONT_WEIGHT,
  }),
  cardComponent: object({
    ...visualFields([
      'padding', 'paddingSm', 'paddingMd', 'paddingLg', 'paddingXl', 'bg', 'bgHover',
      'color', 'colorMuted', 'border', 'borderColor', 'borderHover', 'borderColorHover',
      'borderAccentHover', 'radius', 'shadow', 'shadowHover', 'shadowElevated', 'focusRing',
      'headerBorder', 'headerBorderColor', 'headerBg', 'headerColor', 'headerPadding',
      'titleColor', 'titleFontSize', 'subtitleColor', 'bodyColor', 'bodyPadding',
      'footerBorder', 'footerBorderColor', 'footerBg', 'footerColor', 'footerPadding',
      'imagePlaceholderBg', 'imagePlaceholderColor',
    ]),
    titleFontWeight: FONT_WEIGHT,
  }),
  metricCard: object({
    ...premiumCardFields,
    ...visualFields([
      'trendColor', 'trendColorWarning', 'trendColorError', 'trendErrorBg', 'trendErrorBorder',
      'meterFillSuccess', 'meterFillWarning', 'meterFillError', 'meterFillNeutral', 'meterHeight',
    ]),
  }),
  signalCard: object({
    ...premiumCardFields,
    ...visualFields(['accent', 'soft', 'badgeBg', 'badgeBorder', 'badgeColor', 'sectionBg', 'sectionAltBg']),
  }),
  workspaceCard: object(premiumCardFields),
  compactCard: object(premiumCardFields),
  tallCard: object(premiumCardFields),
  collectionCard: object(premiumCardFields),
  listingGrid: object(visualFields([
    'gap', 'cardGap', 'cardBg', 'cardBorder', 'cardShadow', 'selectedRing',
    'emptyBg', 'emptyBorder', 'skeletonBg',
  ])),
  modal: object(visualFields([
    'bg', 'color', 'shadow', 'overlayBg', 'overlayBackdrop', 'headerBg', 'headerBorder',
    'titleColor', 'subtitleColor', 'bodyColor', 'footerBorder', 'footerBg', 'closeColor',
    'closeColorHover', 'closeBgHover',
  ])),
  tabs: object(visualFields(['border', 'color', 'colorHover', 'colorActive', 'bgHover', 'borderActive'])),
});

const tokenValueRules: Readonly<Record<string, TenantThemeSchemaNode>> = Object.fromEntries(
  TENANT_THEME_OVERRIDE_TOKENS_V1.map((token) => {
    if (token.startsWith('--ds-chart-category-')) return [token, HEX_COLOR];
    if (token.startsWith('--ds-color-')
      || token.startsWith('--ds-overlay-')) return [token, COLOR];
    if (token.startsWith('--ds-font-family-')) return [token, string('font-family')];
    if (token.startsWith('--ds-line-height-')) return [token, number({ min: 0.5, max: 3 })];
    if (token === '--ds-density-scale') return [token, number({ min: 0.75, max: 1.25 })];
    if (token === '--ds-effect-intensity') return [token, number({ min: 0, max: 1 })];
    return [token, VISUAL];
  }),
);

const advanced = object({
  chrome,
  tokenOverrides: object(tokenValueRules),
});

const documentFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  schemaVersion: literal(TENANT_THEME_SCHEMA_VERSION),
};

const identityFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  tenantId: string('identifier'),
  slug: string('slug'),
  verticalKey: string('slug'),
  rowVersion: number({ integer: true, min: 0 }),
};

function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

export const TENANT_THEME_CONFIG_V1_SCHEMA = deepFreeze({
  id: 'rottay.tenant-theme-config',
  schemaVersion: TENANT_THEME_SCHEMA_VERSION,
  documents: Object.freeze({
    simple: object(
      { ...documentFields, mode: literal('simple'), appearance: general },
      ['schemaVersion', 'mode', 'appearance'],
    ),
    advanced: object(
      {
        ...documentFields,
        mode: literal('advanced'),
        visualFoundation: object({ general, advanced }),
      },
      ['schemaVersion', 'mode', 'visualFoundation'],
    ),
  }),
  modes: Object.freeze({
    simple: object(
      { ...documentFields, ...identityFields, mode: literal('simple'), appearance: general },
      ['schemaVersion', 'tenantId', 'slug', 'verticalKey', 'rowVersion', 'mode', 'appearance'],
    ),
    advanced: object(
      {
        ...documentFields,
        ...identityFields,
        mode: literal('advanced'),
        visualFoundation: object({ general, advanced }),
      },
      ['schemaVersion', 'tenantId', 'slug', 'verticalKey', 'rowVersion', 'mode', 'visualFoundation'],
    ),
  }),
  scopeAttributes: Object.freeze([
    'data-ds-root',
    'data-vertical',
    'data-tenant',
    'data-ds-presentation-profile',
  ]),
  forbiddenCapabilities: Object.freeze([
    'rawCss',
    'selectors',
    'engine',
    'componentPack',
    'topology',
    'permissions',
    'semanticMappings',
    'iconGlyphs',
    'iconContainers',
    'motionRecipes',
    'chartRenderer',
    'chartDataSemantics',
  ]),
  overrideTokens: TENANT_THEME_OVERRIDE_TOKENS_V1,
  referenceTokens: TENANT_THEME_REFERENCE_TOKENS_V1,
  fontPackIds: TENANT_THEME_FONT_PACK_IDS_V1,
  limits: Object.freeze({
    maxDocumentBytes: 65_536,
    maxDepth: 10,
    maxObjectFields: 400,
    // Advanced can legally project broad chrome plus 70 compiler-owned color
    // ramp variables. The adversarial max-byte v2 fixture emits 69,894 bytes:
    // 64 KiB is 4,358 bytes too small; 88 KiB leaves 20,218 bytes of headroom
    // while remaining a hard SSR/hydration ceiling.
    maxCompiledVariables: 512,
    maxCompiledVariableBytes: 90_112,
    maxStringLength: 512,
    maxFontFamilyLength: 200,
    maxShadowLayers: 4,
    maxGradientStops: 8,
    maxPaddingPx: 128,
    maxRadiusPx: 64,
    maxGapPx: 64,
    maxGridSizePx: 256,
  }),
});

export const TENANT_THEME_GENERAL_SCHEMA = general;
export const TENANT_THEME_ADVANCED_SCHEMA = advanced;
