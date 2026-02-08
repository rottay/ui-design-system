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
