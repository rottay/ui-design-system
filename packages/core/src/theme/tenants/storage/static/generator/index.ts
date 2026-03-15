import type { TenantConfig } from '../../../../../contracts';

const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export interface GenerateTenantCssOptions {
  includeDarkSelector?: boolean;
  includeSystemDarkSelector?: boolean;
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    return value;
  }

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  return value;
}

function hexToRgb(value: string): { r: number; g: number; b: number } | null {
  const normalizedValue = normalizeHexColor(value);

  if (!isHexColor(normalizedValue)) {
    return null;
  }

  const parsed = Number.parseInt(normalizedValue.slice(1), 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixColor(baseColor: string, mixWith: string, mixRatio: number): string {
  const baseRgb = hexToRgb(baseColor);
  const mixRgb = hexToRgb(mixWith);

  if (!baseRgb || !mixRgb) {
    return baseColor;
  }

  return rgbToHex({
    r: baseRgb.r + (mixRgb.r - baseRgb.r) * mixRatio,
    g: baseRgb.g + (mixRgb.g - baseRgb.g) * mixRatio,
    b: baseRgb.b + (mixRgb.b - baseRgb.b) * mixRatio,
  });
}

function buildRuntimeScale(baseColor: string): Record<(typeof COLOR_STEPS)[number], string> {
  return {
    50: mixColor(baseColor, '#ffffff', 0.92),
    100: mixColor(baseColor, '#ffffff', 0.82),
    200: mixColor(baseColor, '#ffffff', 0.68),
    300: mixColor(baseColor, '#ffffff', 0.48),
    400: mixColor(baseColor, '#ffffff', 0.2),
    500: normalizeHexColor(baseColor),
    600: mixColor(baseColor, '#000000', 0.12),
    700: mixColor(baseColor, '#000000', 0.24),
    800: mixColor(baseColor, '#000000', 0.36),
    900: mixColor(baseColor, '#000000', 0.48),
  };
}

function buildDarkRuntimeScale(baseColor: string): Record<(typeof COLOR_STEPS)[number], string> {
  return {
    50: mixColor(baseColor, '#020617', 0.88),
    100: mixColor(baseColor, '#020617', 0.74),
    200: mixColor(baseColor, '#020617', 0.6),
    300: mixColor(baseColor, '#020617', 0.42),
    400: mixColor(baseColor, '#ffffff', 0.22),
    500: mixColor(baseColor, '#ffffff', 0.12),
    600: normalizeHexColor(baseColor),
    700: mixColor(baseColor, '#000000', 0.12),
    800: mixColor(baseColor, '#000000', 0.26),
    900: mixColor(baseColor, '#000000', 0.38),
  };
}

function getReadableForegroundColor(baseColor: string): string {
  const rgbColor = hexToRgb(baseColor);

  if (!rgbColor) {
    return '#ffffff';
  }

  const luminance = (0.299 * rgbColor.r) + (0.587 * rgbColor.g) + (0.114 * rgbColor.b);
  return luminance > 186 ? '#171717' : '#ffffff';
}

function labelTransform(style: 'uppercase' | 'sentence' | 'capitalize'): string {
  switch (style) {
    case 'uppercase':
      return 'uppercase';
    case 'capitalize':
      return 'capitalize';
    default:
      return 'none';
  }
}

function headingWeight(weight: 'lighter' | 'normal' | 'heavier'): number {
  switch (weight) {
    case 'lighter':
      return 500;
    case 'heavier':
      return 700;
    default:
      return 600;
  }
}

function cardShadow(level: 'sm' | 'md' | 'lg'): string {
  return `var(--ds-shadow-${level})`;
}

function hoverCardShadow(level: 'none' | 'lift-one' | 'lift-two'): string {
  switch (level) {
    case 'lift-one':
      return 'var(--ds-shadow-md)';
    case 'lift-two':
      return 'var(--ds-shadow-lg)';
    default:
      return 'var(--ds-card-shadow)';
  }
}

function hoverTransform(hoverLift: number, hoverScale: number): string {
  if (hoverLift <= 0 && hoverScale <= 1) {
    return 'translateY(0) scale(1)';
  }

  return `translateY(${hoverLift > 0 ? `-${hoverLift}px` : '0'}) scale(${Math.max(hoverScale, 1)})`;
}

function activeTransform(hoverScale: number): string {
  const normalized = Math.max(hoverScale, 1);
  return `translateY(0) scale(${normalized > 1 ? Math.max(normalized - 0.02, 0.97) : 0.98})`;
}

function badgeRadius(shape: 'rounded' | 'pill' | 'square'): string {
  switch (shape) {
    case 'pill':
      return 'var(--ds-radius-full)';
    case 'square':
      return 'var(--ds-radius-sm)';
    default:
      return 'var(--ds-radius-lg)';
  }
}

function pulseDuration(speed: 'none' | 'slow' | 'normal' | 'fast'): string {
  switch (speed) {
    case 'slow':
      return '1.9s';
    case 'fast':
      return '1.1s';
    case 'none':
      return '0s';
    default:
      return '1.5s';
  }
}

function toCssBlock(selector: string, declarations: Record<string, string | number | undefined>): string {
  const lines = Object.entries(declarations)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => `  ${name}: ${String(value)};`);

  return `${selector} {\n${lines.join('\n')}\n}`;
}

function indentBlock(block: string, spaces = 2): string {
  const indent = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length > 0 ? `${indent}${line}` : line))
    .join('\n');
}

function brandingVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const declarations: Record<string, string | number | undefined> = {};
  const colorEntries = [
    ['primary', config.branding.primaryColor],
    ['secondary', config.branding.secondaryColor],
    ['accent', config.branding.accentColor],
  ] as const;

  colorEntries.forEach(([tokenName, colorValue]) => {
    if (!colorValue) {
      return;
    }

    const scale = buildRuntimeScale(colorValue);
    declarations[`--ds-color-${tokenName}`] = scale[500];
    COLOR_STEPS.forEach((step) => {
      declarations[`--ds-color-${tokenName}-${step}`] = scale[step];
    });

    if (tokenName === 'primary') {
      declarations['--ds-color-primary-foreground'] = getReadableForegroundColor(scale[500]);
      declarations['--ds-color-link'] = scale[500];
      declarations['--ds-color-link-hover'] = scale[600];
      declarations['--ds-color-border-focus'] = scale[500];
    }
  });

  return declarations;
}

function darkBrandingVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const declarations: Record<string, string | number | undefined> = {};
  const colorEntries = [
    ['primary', config.branding.primaryColor],
    ['secondary', config.branding.secondaryColor],
    ['accent', config.branding.accentColor],
  ] as const;

  colorEntries.forEach(([tokenName, colorValue]) => {
    if (!colorValue) {
      return;
    }

    const scale = buildDarkRuntimeScale(colorValue);
    declarations[`--ds-color-${tokenName}`] = scale[400];
    COLOR_STEPS.forEach((step) => {
      declarations[`--ds-color-${tokenName}-${step}`] = scale[step];
    });

    if (tokenName === 'primary') {
      declarations['--ds-color-primary-foreground'] = getReadableForegroundColor(scale[400]);
      declarations['--ds-color-link'] = scale[300];
      declarations['--ds-color-link-hover'] = scale[200];
      declarations['--ds-color-border-focus'] = scale[300];
    }
  });

  return declarations;
}

function tokenOverrideVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const overrides = config.tokenOverrides;

  return {
    '--ds-surface-border-width': overrides?.surface?.borderWidth,
    '--ds-surface-border-style': overrides?.surface?.borderStyle,
    '--ds-surface-use-gradients': overrides?.surface?.useGradients ? '1' : undefined,
    '--ds-surface-use-glass': overrides?.surface?.useGlass ? '1' : undefined,
    '--ds-motion-hover-transition': overrides?.motion?.hover,
    '--ds-motion-hover-transform': overrides?.motion?.transform,
    '--ds-motion-spring': overrides?.motion?.spring,
    '--ds-motion-duration-scale': overrides?.motion?.durationScale,
    '--ds-density-scale': overrides?.densityScale,
    '--ds-radius-sm': overrides?.borderRadius?.sm,
    '--ds-radius-md': overrides?.borderRadius?.md,
    '--ds-radius-lg': overrides?.borderRadius?.lg,
    '--ds-radius-xl': overrides?.borderRadius?.xl,
    '--ds-shadow-sm': overrides?.shadows?.sm,
    '--ds-shadow-md': overrides?.shadows?.md,
    '--ds-shadow-lg': overrides?.shadows?.lg,
    '--ds-shadow-xl': overrides?.shadows?.xl,
  };
}

function personalityVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const personality = config.personality;
  if (!personality) {
    return {};
  }

  const hoverScaleValue = personality.animation?.hoverScale;
  const hoverLiftValue = personality.animation?.hoverLift;

  return {
    '--ds-personality-animation-intensity': personality.animation?.intensity,
    '--ds-personality-animation-stagger-delay':
      personality.animation?.staggerDelay !== undefined
        ? `${personality.animation.staggerDelay}ms`
        : undefined,
    '--ds-personality-animation-stagger-max':
      personality.animation?.staggerMax !== undefined
        ? `${personality.animation.staggerMax}ms`
        : undefined,
    '--ds-personality-animation-entrance': personality.animation?.entrance,
    '--ds-personality-animation-entrance-duration':
      personality.animation?.entranceDuration !== undefined
        ? `${personality.animation.entranceDuration}ms`
        : undefined,
    '--ds-personality-animation-hover-lift':
      hoverLiftValue !== undefined ? `${hoverLiftValue}px` : undefined,
    '--ds-personality-animation-hover-scale': hoverScaleValue,
    '--ds-personality-animation-spring-tension': personality.animation?.springTension,
    '--ds-personality-animation-spring-friction': personality.animation?.springFriction,
    '--ds-personality-animation-pulse-speed': personality.animation?.pulseSpeed,
    '--ds-personality-animation-skeleton-style': personality.animation?.skeletonStyle,
    '--ds-personality-animation-count-up-enabled':
      personality.animation?.countUpEnabled !== undefined
        ? personality.animation.countUpEnabled
          ? '1'
          : '0'
        : undefined,
    '--ds-personality-chart-line-style': personality.chart?.lineStyle,
    '--ds-personality-chart-tooltip-style': personality.chart?.tooltipStyle,
    '--ds-personality-chart-mount-duration':
      personality.chart?.mountDuration !== undefined
        ? `${personality.chart.mountDuration}ms`
        : undefined,
    '--ds-personality-card-padding-density': personality.card?.paddingDensity,
    '--ds-personality-card-default-elevation': personality.card?.defaultElevation,
    '--ds-personality-card-hover-elevation': personality.card?.hoverElevation,
    '--ds-personality-card-show-border':
      personality.card?.showBorder !== undefined ? (personality.card.showBorder ? '1' : '0') : undefined,
    '--ds-personality-card-hover-tint':
      personality.card?.hoverTint !== undefined ? (personality.card.hoverTint ? '1' : '0') : undefined,
    '--ds-personality-accent-bar-position': personality.accent?.barPosition,
    '--ds-personality-accent-bar-style': personality.accent?.barStyle,
    '--ds-personality-accent-bar-thickness':
      personality.accent?.barThickness !== undefined
        ? `${personality.accent.barThickness}px`
        : undefined,
    '--ds-personality-accent-badge-shape': personality.accent?.badgeShape,
    '--ds-personality-accent-icon-shape': personality.accent?.iconContainerShape,
    '--ds-personality-accent-divider-style': personality.accent?.dividerStyle,
    '--ds-personality-typography-heading-letter-spacing':
      personality.typography?.headingLetterSpacing,
    '--ds-personality-typography-heading-weight-bias':
      personality.typography?.headingWeightBias,
    '--ds-personality-typography-label-style': personality.typography?.labelStyle,
    '--ds-card-shadow':
      personality.card?.defaultElevation !== undefined
        ? cardShadow(personality.card.defaultElevation)
        : undefined,
    '--ds-card-shadow-hover':
      personality.card?.hoverElevation !== undefined
        ? hoverCardShadow(personality.card.hoverElevation)
        : undefined,
    '--ds-card-border':
      personality.card?.showBorder !== undefined
        ? personality.card.showBorder
          ? 'var(--ds-color-border-primary)'
          : 'transparent'
        : undefined,
    '--ds-card-border-hover':
      personality.card?.showBorder !== undefined
        ? personality.card.showBorder
          ? 'var(--ds-color-border-secondary)'
          : 'transparent'
        : undefined,
    '--ds-card-bg-hover':
      personality.card?.hoverTint !== undefined
        ? personality.card.hoverTint
          ? 'color-mix(in srgb, var(--ds-card-bg) 90%, var(--ds-color-primary-100) 10%)'
          : 'var(--ds-card-bg)'
        : undefined,
    '--ds-card-hover-transform':
      hoverLiftValue !== undefined || hoverScaleValue !== undefined
        ? hoverTransform(hoverLiftValue ?? 0, hoverScaleValue ?? 1)
        : undefined,
    '--ds-badge-radius':
      personality.accent?.badgeShape !== undefined
        ? badgeRadius(personality.accent.badgeShape)
        : undefined,
    '--ds-divider-style':
      personality.accent?.dividerStyle !== undefined
        ? personality.accent.dividerStyle === 'none'
          ? 'solid'
          : personality.accent.dividerStyle
        : undefined,
    '--ds-divider-color':
      personality.accent?.dividerStyle !== undefined
        ? personality.accent.dividerStyle === 'none'
          ? 'transparent'
          : 'var(--ds-color-border-primary)'
        : undefined,
    '--ds-skeleton-animation-duration':
      personality.animation?.pulseSpeed !== undefined
        ? pulseDuration(personality.animation.pulseSpeed)
        : undefined,
    '--ds-typography-heading-letter-spacing':
      personality.typography?.headingLetterSpacing,
    '--ds-typography-heading-font-weight':
      personality.typography?.headingWeightBias !== undefined
        ? headingWeight(personality.typography.headingWeightBias)
        : undefined,
    '--ds-typography-label-transform':
      personality.typography?.labelStyle !== undefined
        ? labelTransform(personality.typography.labelStyle)
        : undefined,
    '--ds-button-hover-transform':
      hoverLiftValue !== undefined || hoverScaleValue !== undefined
        ? hoverTransform(hoverLiftValue ?? 0, hoverScaleValue ?? 1)
        : undefined,
    '--ds-button-active-transform':
      hoverScaleValue !== undefined ? activeTransform(hoverScaleValue) : undefined,
  };
}

function darkPersonalityOverrides(config: TenantConfig): Record<string, string | number | undefined> {
  const personality = config.personality;
  if (!personality) {
    return {};
  }

  return {
    // In dark mode, card hover tint should mix with a dark shade of the primary
    '--ds-card-bg-hover':
      personality.card?.hoverTint !== undefined
        ? personality.card.hoverTint
          ? 'color-mix(in srgb, var(--ds-card-bg) 88%, var(--ds-color-primary-800) 12%)'
          : 'var(--ds-card-bg)'
        : undefined,
  };
}

function darkSemanticVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const primaryColor = config.branding.primaryColor
    ? buildDarkRuntimeScale(config.branding.primaryColor)[300]
    : '#7dd3fc';

  return {
    /* ── Background inversion: light bg (#FFFFFF) -> dark bg (#0A0A0A) ── */
    '--ds-color-bg-primary': '#0a0a0a',
    '--ds-color-bg-secondary': '#111827',
    '--ds-color-bg-tertiary': '#162033',
    '--ds-color-bg-elevated': '#141a2a',
    '--ds-color-bg-overlay': 'rgba(2, 6, 23, 0.78)',
    '--ds-color-bg': '#0a0a0a',
    '--ds-color-background': '#0a0a0a',

    /* ── Surfaces ── */
    '--ds-color-surface': '#111827',
    '--ds-color-surface-primary': '#111827',
    '--ds-color-surface-secondary': '#162033',
    '--ds-color-surface-muted': '#1a2332',

    /* ── Text inversion: dark text (#0A0A0A) -> light text (#FAFAFA) ── */
    '--ds-color-text-primary': '#fafafa',
    '--ds-color-text-secondary': '#cbd5e1',
    '--ds-color-text-tertiary': '#94a3b8',
    '--ds-color-text-muted': '#94a3b8',
    '--ds-color-text-on-primary': '#ffffff',
    '--ds-color-text-inverse': '#0a0a0a',
    '--ds-color-text': '#fafafa',

    /* ── Border adjustment: rgba(0,0,0,0.08) -> rgba(255,255,255,0.12) ── */
    '--ds-color-border-primary': 'rgba(255, 255, 255, 0.12)',
    '--ds-color-border-secondary': 'rgba(255, 255, 255, 0.08)',

    /* ── Brand colors: keep hue, adjust for dark contrast ── */
    '--ds-color-link': primaryColor,
    '--ds-color-link-hover': config.branding.primaryColor
      ? buildDarkRuntimeScale(config.branding.primaryColor)[200]
      : '#a5d8ff',

    /* ── Overlay / Modal ── */
    '--ds-overlay-bg': 'rgba(2, 6, 23, 0.72)',
    '--ds-modal-overlay-bg': 'rgba(2, 6, 23, 0.78)',

    /* ── Component surfaces ── */
    '--ds-card-bg': '#111827',
    '--ds-card-bg-hover': 'color-mix(in srgb, #111827 86%, var(--ds-color-primary-400) 14%)',
    '--ds-modal-bg': '#111827',
    '--ds-drawer-bg': '#111827',
    '--ds-message-bg': '#111827',
    '--ds-toast-bg': '#111827',
    '--ds-notification-bg': '#111827',
    '--ds-tooltip-bg': '#0f172a',

    /* ── Input ── */
    '--ds-input-bg': '#0f172a',
    '--ds-input-border': 'rgba(255, 255, 255, 0.12)',
    '--ds-input-border-hover': 'rgba(255, 255, 255, 0.2)',
    '--ds-input-placeholder-color': '#94a3b8',
    '--ds-input-color': '#fafafa',

    /* ── Shadow darkening: increase opacity for dark backgrounds ── */
    '--ds-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.24), 0 2px 4px rgba(0, 0, 0, 0.18), 0 4px 8px rgba(0, 0, 0, 0.12)',
    '--ds-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.24), 0 8px 16px rgba(0, 0, 0, 0.18)',
    '--ds-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.24), 0 16px 32px rgba(0, 0, 0, 0.2)',
    '--ds-shadow-xl': '0 8px 16px rgba(0, 0, 0, 0.24), 0 16px 32px rgba(0, 0, 0, 0.28), 0 32px 64px rgba(0, 0, 0, 0.24)',
    '--ds-card-shadow': '0 1px 2px rgba(0, 0, 0, 0.32), 0 2px 4px rgba(0, 0, 0, 0.24)',
    '--ds-card-shadow-hover': '0 4px 8px rgba(0, 0, 0, 0.28), 0 8px 16px rgba(0, 0, 0, 0.24)',

    /* ── Alias shortcuts ── */
    '--ds-text-primary': 'var(--ds-color-text-primary)',
    '--ds-text-secondary': 'var(--ds-color-text-secondary)',
    '--ds-bg-primary': 'var(--ds-color-bg-primary)',
    '--ds-bg-secondary': 'var(--ds-color-bg-secondary)',
    '--ds-border-color-default': 'var(--ds-color-border-primary)',
  };
}

export function buildTenantSelector(slug: string): string {
  return `html[data-tenant='${slug}']`;
}

export function generateTenantCss(
  config: TenantConfig,
  options: GenerateTenantCssOptions = {}
): string {
  const selector = buildTenantSelector(config.slug);
  const includeDarkSelector = options.includeDarkSelector ?? true;
  const includeSystemDarkSelector = options.includeSystemDarkSelector ?? true;
  const declarations = {
    ...brandingVariables(config),
    ...tokenOverrideVariables(config),
    ...personalityVariables(config),
  };
  const blocks = [toCssBlock(selector, declarations)];

  if (includeDarkSelector) {
    const darkDeclarations = {
      ...declarations,
      ...darkBrandingVariables(config),
      ...darkSemanticVariables(config),
      ...darkPersonalityOverrides(config),
    };

    blocks.push(
      toCssBlock(
        `${selector}[data-theme='dark'], ${selector}.dark, ${selector}:is([data-theme='dark'])`,
        darkDeclarations
      )
    );

    if (includeSystemDarkSelector) {
      blocks.push(
        `@media (prefers-color-scheme: dark) {\n${indentBlock(
          toCssBlock(
            `${selector}:not([data-theme]):not(.light):not(.dark)`,
            darkDeclarations
          )
        )}\n}`
      );
    }
  }

  return [
    `/* Auto-generated tenant theme for ${config.name} (${config.slug}) */`,
    ...blocks,
    '',
  ].join('\n');
}

export function generateTenantCssFile(
  config: TenantConfig,
  options?: GenerateTenantCssOptions
): { path: string; contents: string } {
  return {
    path: `${config.slug}/index.css`,
    contents: generateTenantCss(config, options),
  };
}
