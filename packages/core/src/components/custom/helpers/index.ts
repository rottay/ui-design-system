/**
 * Shared helper utilities for custom component presets.
 * These generate engine-differentiated styles using tokens.
 */

import type { CSSProperties } from 'react';
import type { DesignTokens } from '../../../types';

/**
 * Creates surface styles for a container based on engine tokens.
 * Classic: bordered with subtle shadow
 * Modern: borderless with bold shadow + optional glass
 * Rustic: ultra-subtle border with whisper shadow
 */
export function createSurfaceStyle(tokens: DesignTokens, options: {
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
  glass?: boolean;
} = {}): CSSProperties {
  const { elevation = 'sm', borderColor, glass = false } = options;

  const style: CSSProperties = {
    boxShadow: tokens.shadows[elevation],
    borderRadius: tokens.borderRadius.lg,
  };

  if (tokens.surface.borderWidth !== '0') {
    style.border = `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${borderColor || tokens.colors.neutral[200]}`;
  }

  if (glass && tokens.surface.useGlass && tokens.glass) {
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
 */
export function createCardStyle(tokens: DesignTokens, options: {
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
  glass?: boolean;
  interactive?: boolean;
} = {}): CSSProperties {
  const { elevation = 'sm', padding, glass = false, interactive = false } = options;

  const style: CSSProperties = {
    ...createSurfaceStyle(tokens, { elevation, glass }),
    padding: padding !== undefined ? padding : tokens.spacing[4],
    backgroundColor: tokens.colors.common.white,
  };

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
 */
export function createBadgeStyle(tokens: DesignTokens, color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'): CSSProperties {
  const scaleKey = `${color}Scale` as const;
  const scale = (tokens.colors as any)[scaleKey];
  if (!scale) return {};

  return {
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
