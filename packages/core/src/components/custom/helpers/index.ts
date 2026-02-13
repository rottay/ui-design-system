/**
 * Shared helper utilities for custom component presets.
 * These generate engine-differentiated styles using tokens.
 *
 * Key principle: helpers auto-detect engine capabilities from token values
 * (useGlass, useGradients, borderWidth, motion.transform) so presets
 * don't need explicit engine checks for standard visual patterns.
 */

import type { CSSProperties } from 'react';
import type { DesignTokens } from '../../../types';

/** Whether the current engine supports glass effects */
function isGlassEngine(tokens: DesignTokens): boolean {
  return !!tokens.surface.useGlass && !!tokens.glass;
}

/** Whether the current engine uses gradient backgrounds */
function isGradientEngine(tokens: DesignTokens): boolean {
  return !!tokens.surface.useGradients && !!tokens.gradients;
}

/**
 * Creates surface styles for a container based on engine tokens.
 * Classic: bordered with subtle shadow
 * Modern: borderless with bold shadow + auto glass when glass=undefined
 * Rustic: ultra-subtle border with whisper shadow
 *
 * glass option: true=force glass, false=no glass, undefined=auto-detect from engine
 */
export function createSurfaceStyle(tokens: DesignTokens, options: {
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
  glass?: boolean;
} = {}): CSSProperties {
  const { elevation = 'sm', borderColor } = options;
  const useGlass = options.glass !== undefined ? options.glass : isGlassEngine(tokens);

  const style: CSSProperties = {
    boxShadow: tokens.shadows[elevation],
    borderRadius: tokens.borderRadius.lg,
  };

  if (tokens.surface.borderWidth !== '0') {
    style.border = `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${borderColor || tokens.colors.neutral[200]}`;
  }

  if (useGlass && tokens.glass) {
    style.backdropFilter = tokens.glass.blur;
    style.WebkitBackdropFilter = tokens.glass.blur;
    style.backgroundColor = tokens.glass.bg;
    if (tokens.surface.borderWidth === '0') {
      style.border = `1px solid ${tokens.glass.border}`;
    }
  }

  return style;
}

/**
 * Creates hover-ready transition styles for interactive elements.
 * Classic: fast ease transition
 * Modern: spring with translateY lift
 * Rustic: minimal fast transition
 */
export function createHoverStyle(tokens: DesignTokens): CSSProperties {
  return {
    transition: `all ${tokens.motion.hover}`,
    cursor: 'pointer',
  };
}

/**
 * Returns the hover transform for the current engine.
 * Use with onMouseEnter to apply the transform.
 */
export function getHoverTransform(tokens: DesignTokens): CSSProperties {
  return {
    transform: tokens.motion.transform,
  };
}

/**
 * Creates complete card styles combining surface + padding + radius.
 * A convenience wrapper for the most common container pattern.
 *
 * Glass auto-detection: on Modern engines, glass bg replaces white bg automatically.
 * Pass glass=false to force opaque white regardless of engine.
 */
export function createCardStyle(tokens: DesignTokens, options: {
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
  glass?: boolean;
  interactive?: boolean;
} = {}): CSSProperties {
  const { elevation = 'sm', padding, interactive = false } = options;
  const useGlass = options.glass !== undefined ? options.glass : isGlassEngine(tokens);

  const style: CSSProperties = {
    ...createSurfaceStyle(tokens, { elevation, glass: useGlass }),
    padding: padding !== undefined ? padding : tokens.spacing[4],
  };

  // Glass bg comes from createSurfaceStyle; only set white when no glass
  if (!useGlass || !tokens.glass) {
    style.backgroundColor = tokens.colors.common.white;
  }

  if (interactive) {
    Object.assign(style, createHoverStyle(tokens));
  }

  return style;
}

/**
 * Creates styles for section headers within components.
 */
export function createSectionHeaderStyle(tokens: DesignTokens): CSSProperties {
  return {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[500],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: tokens.spacing[2],
  };
}

/**
 * Creates badge/chip styles using color scales.
 * Modern: adds subtle glass backdrop for frosted effect.
 */
export function createBadgeStyle(tokens: DesignTokens, color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'): CSSProperties {
  const scaleKey = `${color}Scale` as const;
  const scale = (tokens.colors as any)[scaleKey];
  if (!scale) return {};

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    backgroundColor: scale[100],
    color: scale[700],
    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale[200]}`,
  };

  // Glass engine: frosted glass backdrop on badges
  if (isGlassEngine(tokens) && tokens.glass) {
    style.backdropFilter = tokens.glass.blurSm;
    style.WebkitBackdropFilter = tokens.glass.blurSm;
  }

  return style;
}

/**
 * Creates empty state container styles.
 */
export function createEmptyStateStyle(tokens: DesignTokens): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
    textAlign: 'center' as const,
    color: tokens.colors.neutral[400],
  };
}

/**
 * Creates a skeleton loading pulse animation style.
 */
export function createSkeletonStyle(tokens: DesignTokens): CSSProperties {
  return {
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.borderRadius.md,
    animation: 'pulse 1.5s ease-in-out infinite',
  };
}

/**
 * Creates list item / row styles for interactive lists.
 * Engine-aware dividers: uses tokens.surface.borderWidth so Modern gets no divider line.
 * Active state: primary accent bg + left border indicator.
 */
export function createListItemStyle(tokens: DesignTokens, options: {
  active?: boolean;
  interactive?: boolean;
} = {}): CSSProperties {
  const { active = false, interactive = true } = options;

  const hasBorder = tokens.surface.borderWidth !== '0';

  const style: CSSProperties = {
    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
    borderBottom: hasBorder
      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
      : 'none',
    transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}, color ${tokens.transitions?.fast || tokens.motion.hover}`,
  };

  if (interactive) {
    style.cursor = 'pointer';
  }

  if (active) {
    style.backgroundColor = tokens.colors.primaryScale[50];
    style.borderLeft = `3px solid ${tokens.colors.primaryScale[600]}`;
  }

  return style;
}

/**
 * Creates panel header bar styles (e.g. top bar of a card/panel).
 * Classic/Rustic: neutral bg + bottom border.
 * Modern: gradient bg via tokens.gradients.primarySoft, no bottom border.
 */
export function createPanelHeaderStyle(tokens: DesignTokens): CSSProperties {
  const hasBorder = tokens.surface.borderWidth !== '0';

  if (isGradientEngine(tokens) && tokens.gradients) {
    return {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderBottom: 'none',
      background: tokens.gradients.primarySoft,
    };
  }

  return {
    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
    borderBottom: hasBorder
      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`
      : `1px solid ${tokens.colors.neutral[200]}`,
    backgroundColor: tokens.colors.neutral[50],
  };
}

/**
 * Creates a progress bar track + fill style pair.
 * Modern: uses gradient fill via tokens.gradients.primary.
 * Classic/Rustic: solid color fill.
 */
export function createProgressBarStyle(tokens: DesignTokens, options: {
  color?: string;
  percent: number;
}): { track: CSSProperties; fill: CSSProperties } {
  const { color, percent } = options;

  const fillStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(100, Math.max(0, percent))}%`,
    borderRadius: tokens.borderRadius.full,
    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
  };

  // Gradient engine: use gradient fill when no explicit color override
  if (!color && isGradientEngine(tokens) && tokens.gradients) {
    fillStyle.background = tokens.gradients.primary;
  } else {
    fillStyle.backgroundColor = color || tokens.colors.primaryScale[500];
  }

  return {
    track: {
      height: 6,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.neutral[100],
      overflow: 'hidden' as const,
    },
    fill: fillStyle,
  };
}

/**
 * Creates a small status dot indicator.
 */
export function createStatusDotStyle(tokens: DesignTokens, color: string): CSSProperties {
  return {
    width: 8,
    height: 8,
    borderRadius: tokens.borderRadius.full,
    backgroundColor: color,
    flexShrink: 0,
  };
}

/**
 * Creates filter pill/toggle chip styles.
 * Active = primary colors, inactive = neutral.
 * Engine-aware borders (token-based) and glass tint on Modern active state.
 */
export function createFilterPillStyle(tokens: DesignTokens, options: {
  active: boolean;
}): CSSProperties {
  const { active } = options;
  const hasBorder = tokens.surface.borderWidth !== '0';

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `all ${tokens.transitions?.fast || tokens.motion.hover}`,
    backgroundColor: active ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100],
    color: active ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
    border: hasBorder
      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${active ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`
      : 'none',
  };

  // Glass engine active: frosted glass tint instead of flat color
  if (active && isGlassEngine(tokens) && tokens.glass) {
    style.backdropFilter = tokens.glass.blurSm;
    style.WebkitBackdropFilter = tokens.glass.blurSm;
    style.backgroundColor = tokens.glass.bgLight;
    style.border = `1px solid ${tokens.glass.borderLight}`;
  }

  return style;
}

/**
 * Creates an accent bar decoration for cards.
 * A thin gradient line at the top or left edge.
 */
export function createAccentBarStyle(tokens: DesignTokens, options: {
  position: 'top' | 'left';
  color?: string;
} = { position: 'top' }): CSSProperties {
  const { position, color } = options;
  const gradient = color
    ? `linear-gradient(${position === 'top' ? 'to right' : 'to bottom'}, ${color}, transparent)`
    : tokens.gradients?.primarySoft || `linear-gradient(to right, ${tokens.colors.primaryScale[400]}, ${tokens.colors.primaryScale[200]})`;

  if (position === 'top') {
    return {
      height: 3,
      width: '100%',
      background: gradient,
      borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`,
    };
  }

  return {
    width: 3,
    height: '100%',
    background: gradient,
    borderRadius: `${tokens.borderRadius.lg} 0 0 ${tokens.borderRadius.lg}`,
    flexShrink: 0,
  };
}

/**
 * Creates an interactive card with hover elevation, active highlight, and cursor.
 * Combines createCardStyle with hover shadow lift and optional active state.
 * Glass auto-detects from engine — no explicit glass param needed.
 */
export function createInteractiveCardStyle(tokens: DesignTokens, options: {
  active?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  glass?: boolean;
} = {}): CSSProperties {
  const { active = false, elevation = 'sm' } = options;
  const useGlass = options.glass !== undefined ? options.glass : isGlassEngine(tokens);

  const style: CSSProperties = {
    ...createCardStyle(tokens, { elevation, glass: useGlass, interactive: true }),
  };

  if (active) {
    style.backgroundColor = tokens.colors.primaryScale[50];
    style.borderColor = tokens.colors.primaryScale[200];
    style.boxShadow = tokens.shadows.md;
  }

  return style;
}

/**
 * Returns the next elevation level for shadow hover effects.
 * sm→md, md→lg, lg→xl, xl→xl (capped).
 */
export function getNextElevation(current: 'sm' | 'md' | 'lg' | 'xl'): 'sm' | 'md' | 'lg' | 'xl' {
  const order: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
  const idx = order.indexOf(current);
  return order[Math.min(idx + 1, order.length - 1)];
}

/**
 * Returns the hover shadow for a card based on its current elevation.
 * Lifts shadow by one level for a subtle "raised" hover effect.
 */
export function getCardHoverShadow(tokens: DesignTokens, elevation: 'sm' | 'md' | 'lg' | 'xl' = 'sm'): string {
  return tokens.shadows[getNextElevation(elevation)];
}

/**
 * Creates focus ring styles for accessible focus indicators.
 * Returns boxShadow + borderColor to apply onFocus, and reset values for onBlur.
 */
export function createFocusRingStyle(tokens: DesignTokens): {
  focus: CSSProperties;
  blur: CSSProperties;
} {
  return {
    focus: {
      boxShadow: `0 0 0 2px ${tokens.colors.primaryScale[100]}`,
      borderColor: tokens.colors.primaryScale[400],
    },
    blur: {
      boxShadow: 'none',
      borderColor: tokens.colors.neutral[300],
    },
  };
}

/**
 * Creates overlay background style for modals, backdrops, and translucent surfaces.
 * Uses overlay tokens when available, falls back to rgba.
 */
export function createOverlayStyle(tokens: DesignTokens, variant: 'light' | 'medium' | 'heavy' | 'white' | 'whiteMedium' | 'whiteLight' = 'medium'): CSSProperties {
  if (tokens.overlay) {
    return { backgroundColor: tokens.overlay[variant] };
  }
  // Fallback for non-overlay-aware tenants
  const fallbacks: Record<string, string> = {
    light: 'rgba(0,0,0,0.3)',
    medium: 'rgba(0,0,0,0.5)',
    heavy: 'rgba(0,0,0,0.7)',
    white: 'rgba(255,255,255,0.9)',
    whiteMedium: 'rgba(255,255,255,0.5)',
    whiteLight: 'rgba(255,255,255,0.2)',
  };
  return { backgroundColor: fallbacks[variant] };
}

/**
 * Returns a human-readable relative time string (e.g., "3 minutes ago").
 */
export function formatDistanceToNow(
  date: Date,
  options?: { addSuffix?: boolean }
): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = options?.addSuffix ? (diffMs >= 0 ? ' ago' : ' from now') : '';

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s${suffix}`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d${suffix}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo${suffix}`;

  const years = Math.floor(months / 12);
  return `${years}y${suffix}`;
}

/* ================================================================== */
/*  PERSONALITY-DRIVEN HELPERS                                        */
/*  All read exclusively from tokens.personality — NEVER engine name  */
/* ================================================================== */

/**
 * Calculates stagger delay for a specific index.
 * Respects staggerMax to cap total delay.
 */
export function createStaggerDelay(tokens: DesignTokens, index: number): number {
  const { staggerDelay, staggerMax, intensity } = tokens.personality.animation;
  if (intensity === 0) return 0;
  return Math.min(index * staggerDelay, staggerMax);
}

/**
 * Entrance animation config based on personality tokens.
 * Returns CSS properties for initial and animate states.
 */
export function createEntranceAnimation(tokens: DesignTokens, options: {
  index?: number;
} = {}): {
  initial: CSSProperties;
  animate: CSSProperties;
  transition: string;
} {
  const { index = 0 } = options;
  const anim = tokens.personality.animation;

  if (anim.intensity === 0 || anim.entrance === 'none') {
    return {
      initial: {},
      animate: {},
      transition: 'none',
    };
  }

  const delay = createStaggerDelay(tokens, index);
  const duration = anim.entranceDuration;
  const delayStr = delay > 0 ? ` ${delay}ms` : '';

  switch (anim.entrance) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: `opacity ${duration}ms ease${delayStr}`,
      };
    case 'slideUp':
      return {
        initial: { opacity: 0, transform: 'translateY(8px)' },
        animate: { opacity: 1, transform: 'translateY(0)' },
        transition: `opacity ${duration}ms ease${delayStr}, transform ${duration}ms ease${delayStr}`,
      };
    case 'spring':
      return {
        initial: { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
        animate: { opacity: 1, transform: 'translateY(0) scale(1)' },
        transition: `opacity ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)${delayStr}, transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)${delayStr}`,
      };
    case 'bounce':
      return {
        initial: { opacity: 0, transform: 'translateY(16px) scale(0.95)' },
        animate: { opacity: 1, transform: 'translateY(0) scale(1)' },
        transition: `opacity ${duration}ms cubic-bezier(0.34, 1.8, 0.64, 1)${delayStr}, transform ${duration}ms cubic-bezier(0.34, 1.8, 0.64, 1)${delayStr}`,
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: `opacity ${duration}ms ease${delayStr}`,
      };
  }
}

/**
 * Card hover styles driven by personality tokens.
 * Returns base and hover state CSS.
 */
export function createCardHoverStyles(tokens: DesignTokens): {
  base: CSSProperties;
  hover: CSSProperties;
} {
  const { hoverLift, hoverScale, intensity } = tokens.personality.animation;
  const { hoverElevation, defaultElevation, hoverTint } = tokens.personality.card;

  if (intensity === 0) {
    return { base: {}, hover: {} };
  }

  const transforms: string[] = [];
  if (hoverLift > 0) transforms.push(`translateY(-${hoverLift}px)`);
  if (hoverScale > 1) transforms.push(`scale(${hoverScale})`);

  let hoverShadow: string | undefined;
  if (hoverElevation === 'lift-one') {
    hoverShadow = tokens.shadows[getNextElevation(defaultElevation)];
  } else if (hoverElevation === 'lift-two') {
    hoverShadow = tokens.shadows[getNextElevation(getNextElevation(defaultElevation))];
  }

  const hoverStyles: CSSProperties = {};
  if (transforms.length > 0) hoverStyles.transform = transforms.join(' ');
  if (hoverShadow) hoverStyles.boxShadow = hoverShadow;
  if (hoverTint) hoverStyles.backgroundColor = tokens.colors.primaryScale[50];

  return {
    base: {
      transition: `all ${tokens.motion.hover}`,
      cursor: 'pointer',
    },
    hover: hoverStyles,
  };
}

/**
 * Accent bar styles driven by personality tokens.
 */
export function createPersonalityAccentBar(tokens: DesignTokens, options: {
  color?: string;
} = {}): CSSProperties | null {
  const accent = tokens.personality.accent;
  if (accent.barPosition === 'none') return null;

  const color = options.color || tokens.colors.primary;
  const isTop = accent.barPosition === 'top';
  const isLeft = accent.barPosition === 'left';

  let background: string;
  switch (accent.barStyle) {
    case 'gradient':
      background = `linear-gradient(${isTop ? 'to right' : 'to bottom'}, ${color}, ${tokens.colors.secondary || color})`;
      break;
    case 'animated':
      background = `linear-gradient(90deg, ${color}, ${tokens.colors.secondary || color}, ${color})`;
      break;
    case 'solid':
    default:
      background = color;
      break;
  }

  const style: CSSProperties = {
    background,
    flexShrink: 0,
  };

  if (isTop) {
    style.height = accent.barThickness;
    style.width = '100%';
    style.borderRadius = `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`;
  } else if (isLeft) {
    style.width = accent.barThickness;
    style.height = '100%';
    style.borderRadius = `${tokens.borderRadius.lg} 0 0 ${tokens.borderRadius.lg}`;
  }

  if (accent.barStyle === 'animated') {
    style.backgroundSize = '200% 100%';
    style.animation = 'accentBarShimmer 3s linear infinite';
  }

  return style;
}

/**
 * Chart configuration from personality tokens.
 */
export function getChartConfig(tokens: DesignTokens): {
  animationDuration: number;
  animateOnMount: boolean;
  lineType: 'linear' | 'monotoneX' | 'step';
  showDots: boolean;
  gradientFill: boolean;
  tooltipStyle: 'minimal' | 'detailed' | 'glass';
} {
  const chart = tokens.personality.chart;
  const lineType = chart.lineStyle === 'smooth' ? 'monotoneX' as const
    : chart.lineStyle === 'step' ? 'step' as const
    : 'linear' as const;

  return {
    animationDuration: chart.mountDuration,
    animateOnMount: chart.animateOnMount,
    lineType,
    showDots: chart.showDots,
    gradientFill: chart.useGradientFill,
    tooltipStyle: chart.tooltipStyle,
  };
}

/**
 * Typography adjustments from personality tokens.
 */
export function getPersonalityTypography(tokens: DesignTokens): {
  headingWeight: number;
  labelTransform: 'uppercase' | 'capitalize' | 'none';
  labelLetterSpacing: string;
  headingLetterSpacing: string;
} {
  const typo = tokens.personality.typography;

  let headingWeight: number;
  switch (typo.headingWeightBias) {
    case 'lighter':
      headingWeight = tokens.typography.fontWeight.medium;
      break;
    case 'heavier':
      headingWeight = tokens.typography.fontWeight.bold;
      break;
    default:
      headingWeight = tokens.typography.fontWeight.semibold;
  }

  let labelTransform: 'uppercase' | 'capitalize' | 'none';
  let labelLetterSpacing: string;
  switch (typo.labelStyle) {
    case 'uppercase':
      labelTransform = 'uppercase';
      labelLetterSpacing = '0.05em';
      break;
    case 'capitalize':
      labelTransform = 'capitalize';
      labelLetterSpacing = '0.01em';
      break;
    default:
      labelTransform = 'none';
      labelLetterSpacing = '0';
  }

  return {
    headingWeight,
    labelTransform,
    labelLetterSpacing,
    headingLetterSpacing: typo.headingLetterSpacing,
  };
}

/**
 * Skeleton loading style driven by personality tokens.
 */
export function createPersonalitySkeletonStyle(tokens: DesignTokens): CSSProperties {
  const style = tokens.personality.animation.skeletonStyle;
  const base: CSSProperties = {
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.borderRadius.md,
  };

  switch (style) {
    case 'shimmer':
      return {
        ...base,
        background: `linear-gradient(90deg, ${tokens.colors.neutral[100]} 25%, ${tokens.colors.neutral[200]} 50%, ${tokens.colors.neutral[100]} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      };
    case 'wave':
      return {
        ...base,
        background: `linear-gradient(90deg, ${tokens.colors.neutral[100]} 0%, ${tokens.colors.neutral[200]} 50%, ${tokens.colors.neutral[100]} 100%)`,
        backgroundSize: '300% 100%',
        animation: 'wave 2s ease-in-out infinite',
      };
    case 'pulse':
    default:
      return {
        ...base,
        animation: 'pulse 1.5s ease-in-out infinite',
      };
  }
}

/**
 * Divider style from personality tokens.
 */
export function createDividerStyle(tokens: DesignTokens): CSSProperties {
  const dividerStyle = tokens.personality.accent.dividerStyle;
  if (dividerStyle === 'none') return { border: 'none' };

  return {
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: `1px ${dividerStyle} ${tokens.colors.neutral[200]}`,
    margin: 0,
  };
}

/**
 * Section header style using personality typography.
 */
export function createPersonalitySectionHeaderStyle(tokens: DesignTokens): CSSProperties {
  const typo = getPersonalityTypography(tokens);
  return {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[500],
    textTransform: typo.labelTransform,
    letterSpacing: typo.labelLetterSpacing,
    marginBottom: tokens.spacing[2],
  };
}

/**
 * Error container style.
 */
export function createErrorContainerStyle(tokens: DesignTokens): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
    textAlign: 'center' as const,
    color: tokens.colors.errorScale[600],
    backgroundColor: tokens.colors.errorScale[50],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.errorScale[200]}`,
  };
}

/* ================================================================== */
/*  LAYOUT & STAT HELPERS                                              */
/*  Fix card stacking, accent bar layout, label-value gaps, stat colors */
/* ================================================================== */

/**
 * Returns outer + inner layout styles for cards with accent bars.
 * When barPosition is 'left', outer is flex-row so the bar sits left
 * and content flows in a column inside inner.
 * When barPosition is 'top' or 'none', outer is flex-column.
 */
export function getAccentAwareLayout(tokens: DesignTokens): {
  outer: CSSProperties;
  inner: CSSProperties;
} {
  const pos = tokens.personality.accent.barPosition;
  if (pos === 'left') {
    return {
      outer: { display: 'flex', flexDirection: 'row' as const },
      inner: { display: 'flex', flexDirection: 'column' as const, flex: 1, minWidth: 0, gap: tokens.spacing[2] },
    };
  }
  return {
    outer: { display: 'flex', flexDirection: 'column' as const },
    inner: {},
  };
}

/**
 * Returns styles for a label + value vertical stack.
 * Ensures text elements don't overlap by adding a gap.
 */
export function createLabelValuePairStyle(tokens: DesignTokens): CSSProperties {
  return { display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] };
}

/**
 * Creates card surface styles with flex-column layout baked in.
 * Use this instead of createCardStyle when the card contains stacked content.
 */
export function createStatCardLayout(tokens: DesignTokens, options?: Parameters<typeof createCardStyle>[1]): CSSProperties {
  return { ...createCardStyle(tokens, options), display: 'flex', flexDirection: 'column' as const };
}

/**
 * Returns a professional neutral color for stat values.
 * Use instead of warningScale/successScale/errorScale for metric numbers.
 */
export function getStatValueColor(tokens: DesignTokens): string {
  return tokens.colors.neutral[900];
}

/**
 * Padding value based on personality card density.
 */
export function getCardPadding(tokens: DesignTokens): string {
  switch (tokens.personality.card.paddingDensity) {
    case 'compact':
      return `${tokens.spacing[4]}px ${tokens.spacing[5]}px`;
    case 'spacious':
      return `${tokens.spacing[6]}px ${tokens.spacing[7]}px`;
    default:
      return `${tokens.spacing[5]}px ${tokens.spacing[6]}px`;
  }
}

/**
 * Icon container styles based on personality shape.
 */
export function createIconContainerStyle(tokens: DesignTokens, options: {
  size?: number;
  color?: string;
} = {}): CSSProperties {
  const { size = 40, color } = options;
  const shape = tokens.personality.accent.iconContainerShape;
  const bgColor = color || tokens.colors.primaryScale[50];

  let borderRadius: string;
  switch (shape) {
    case 'circle':
      borderRadius = tokens.borderRadius.full;
      break;
    case 'square':
      borderRadius = tokens.borderRadius.sm;
      break;
    case 'none':
      return {
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      };
    case 'rounded':
    default:
      borderRadius = tokens.borderRadius.md;
  }

  return {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}

/**
 * Badge border radius based on personality shape.
 */
export function getPersonalityBadgeRadius(tokens: DesignTokens): string {
  switch (tokens.personality.accent.badgeShape) {
    case 'pill':
      return tokens.borderRadius.full;
    case 'square':
      return tokens.borderRadius.sm;
    case 'rounded':
    default:
      return tokens.borderRadius.md;
  }
}

/**
 * Pulse speed CSS duration for live indicators.
 */
export function getPulseSpeed(tokens: DesignTokens): string {
  switch (tokens.personality.animation.pulseSpeed) {
    case 'none':
      return 'paused';
    case 'slow':
      return '3s';
    case 'fast':
      return '1s';
    default:
      return '2s';
  }
}
