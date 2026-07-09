/**
 * @fileoverview Modern engine for the Badge component - Premium quality.
 * Uses inline styles driven by --ds-* CSS custom properties for precise,
 * editorial styling. Inspired by Linear, Vercel, and Stripe Dashboard.
 *
 * @remarks
 * Three visual styles:
 * - **Solid (filled)**: Strong semantic bg with white text. High contrast.
 * - **Soft**: 10% opacity tinted bg with colored text. Premium, not washed out.
 * - **Outline**: Transparent bg with colored border and text.
 *
 * All transitions use --ds-motion-fast (var(--ds-motion-fast)). Border radius defaults to
 * --ds-radius-full for round shape and --ds-radius-sm for default.
 *
 * @example
 * ```tsx
 * <Badge engine="modern" count={5} variant="primary"><Avatar /></Badge>
 * <Badge engine="modern" content="New" badgeStyle="soft" variant="success" />
 * <Badge engine="modern" content="Beta" badgeStyle="outline" variant="info" />
 * ```
 */

'use client';

import React, { useId } from 'react';
import type { BadgeProps, BadgeSize } from '../Badge.types';
import { BADGE_DEFAULTS, DOT_SIZE_MAP, SIZE_MAP } from '../Badge.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

// ---------------------------------------------------------------------------
// Semantic color tokens per variant
// ---------------------------------------------------------------------------
// Each variant maps to a set of CSS custom properties for solid/soft/outline
// rendering. CSS variables are always defined by the tenant stylesheet.
interface VariantTokens {
  /** Solid bg color */
  solidBg: string;
  /** Solid text color */
  solidColor: string;
  /** Soft bg (low-opacity tint) */
  softBg: string;
  /** Soft text color */
  softColor: string;
  /** Outline border color */
  outlineBorder: string;
  /** Outline text color */
  outlineColor: string;
}

const VARIANT_TOKENS: Record<string, VariantTokens> = {
  default: {
    solidBg: 'var(--ds-color-neutral-200)',
    solidColor: 'var(--ds-color-text-primary)',
    softBg: 'var(--ds-color-alpha-black-100)',
    softColor: 'var(--ds-color-text-secondary)',
    outlineBorder: 'var(--ds-color-border)',
    outlineColor: 'var(--ds-color-text-secondary)',
  },
  primary: {
    solidBg: 'var(--ds-color-primary)',
    solidColor: 'var(--ds-color-primary-foreground)',
    softBg: 'var(--ds-color-alpha-primary-10)',
    softColor: 'var(--ds-color-primary)',
    outlineBorder: 'var(--ds-color-primary-400)',
    outlineColor: 'var(--ds-color-primary)',
  },
  secondary: {
    solidBg: 'var(--ds-color-secondary)',
    solidColor: 'var(--ds-color-text-on-primary, #ECECEC)',
    softBg: 'var(--ds-color-alpha-secondary-10)',
    softColor: 'var(--ds-color-secondary-600)',
    outlineBorder: 'var(--ds-color-secondary-300)',
    outlineColor: 'var(--ds-color-secondary-600)',
  },
  success: {
    solidBg: 'var(--ds-color-success)',
    solidColor: 'var(--ds-color-text-on-primary, #ECECEC)',
    softBg: 'var(--ds-color-alpha-success-10)',
    softColor: 'var(--ds-color-success-700)',
    outlineBorder: 'var(--ds-color-success-border)',
    outlineColor: 'var(--ds-color-success-700)',
  },
  warning: {
    solidBg: 'var(--ds-color-warning)',
    solidColor: 'var(--ds-color-text-on-primary, #ECECEC)',
    softBg: 'var(--ds-color-alpha-warning-10)',
    softColor: 'var(--ds-color-warning-700)',
    outlineBorder: 'var(--ds-color-warning-border)',
    outlineColor: 'var(--ds-color-warning-700)',
  },
  error: {
    solidBg: 'var(--ds-color-error)',
    solidColor: 'var(--ds-color-text-on-primary, #ECECEC)',
    softBg: 'var(--ds-color-alpha-error-10)',
    softColor: 'var(--ds-color-error-700)',
    outlineBorder: 'var(--ds-color-error-border)',
    outlineColor: 'var(--ds-color-error-700)',
  },
  info: {
    solidBg: 'var(--ds-color-info)',
    solidColor: 'var(--ds-color-text-on-primary, #ECECEC)',
    softBg: 'var(--ds-color-alpha-info-10)',
    softColor: 'var(--ds-color-info-700)',
    outlineBorder: 'var(--ds-color-info-border)',
    outlineColor: 'var(--ds-color-info-700)',
  },
};

// ---------------------------------------------------------------------------
// Size specs (inline style values)
// ---------------------------------------------------------------------------
// Tight, consistent size scale: xs=20px, sm=24px, md=28px, lg=32px
interface SizeSpec {
  height: string;
  fontSize: string;
  paddingX: string;
  lineHeight: string;
}

const SIZE_SPECS: Record<string, SizeSpec> = {
  xs: { height: 'var(--ds-badge-xs-height, 14px)', fontSize: 'var(--ds-badge-xs-font-size, 9px)', paddingX: 'var(--ds-badge-xs-padding-x, 6px)', lineHeight: '1' },
  sm: { height: 'var(--ds-badge-sm-height, 16px)', fontSize: 'var(--ds-badge-sm-font-size, 10px)', paddingX: 'var(--ds-badge-sm-padding-x, 8px)', lineHeight: '1' },
  md: { height: 'var(--ds-badge-md-height, 20px)', fontSize: 'var(--ds-badge-md-font-size, 12px)', paddingX: 'var(--ds-badge-md-padding-x, 10px)', lineHeight: '1' },
  lg: { height: 'var(--ds-badge-lg-height, 24px)', fontSize: 'var(--ds-badge-lg-font-size, 14px)', paddingX: 'var(--ds-badge-lg-padding-x, 12px)', lineHeight: '1' },
  xl: { height: 'var(--ds-badge-xl-height, 28px)', fontSize: 'var(--ds-badge-xl-font-size, 16px)', paddingX: 'var(--ds-badge-xl-padding-x, 12px)', lineHeight: '1' },
};

// ---------------------------------------------------------------------------
// ModernBadge
// ---------------------------------------------------------------------------
/**
 * Premium modern badge implementation.
 *
 * Three render paths:
 * 1. Standalone badge (no children) - renders as an inline tag
 * 2. Hidden badge (visibility check fails) - renders children only
 * 3. Indicator badge (positioned over children) - uses DaisyUI indicator
 *
 * @param props - Unified BadgeProps from the design system type contract
 * @returns React element with premium badge styling
 */
export default function ModernBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    variant = BADGE_DEFAULTS.variant,
    size: sizeProp = BADGE_DEFAULTS.size,
    badgeStyle = BADGE_DEFAULTS.badgeStyle,
    visible = BADGE_DEFAULTS.visible,
    pulse,
    position = BADGE_DEFAULTS.position,
    icon,
    closable,
    onClose,
    clickable,
    onClick,
    bordered,
    className = '',
    style,
  } = props;

  // -------------------------------------------------------------------------
  // Responsive size handling
  // -------------------------------------------------------------------------
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'min-width',
      value: sizeProp,
      resolve: (v: BadgeSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).minWidth,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: BadgeSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: BadgeSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementIdVal = needsResponsiveCSS ? `badge-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementIdVal, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? BADGE_DEFAULTS.size;

  // -------------------------------------------------------------------------
  // Display value
  // -------------------------------------------------------------------------
  const displayValue = content !== undefined ? content : count;

  const formattedValue = (() => {
    if (displayValue === undefined) return undefined;
    if (typeof displayValue === 'string') return displayValue;
    return displayValue > max! ? `${max}+` : displayValue;
  })();

  const shouldShowBadge = visible && (
    dot ||
    (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero))
  );

  // -------------------------------------------------------------------------
  // Style computation
  // -------------------------------------------------------------------------
  const tokens = VARIANT_TOKENS[variant!] || VARIANT_TOKENS.default;
  const sizeSpec = SIZE_SPECS[size!] || SIZE_SPECS.md;

  // Compute background, color, and border based on badgeStyle
  let badgeBg: string;
  let badgeColor: string;
  let badgeBorder: string;

  switch (badgeStyle) {
    case 'outline':
      badgeBg = 'transparent';
      badgeColor = tokens.outlineColor;
      badgeBorder = `1px solid ${tokens.outlineBorder}`;
      break;
    case 'soft':
    case 'ghost':
      badgeBg = tokens.softBg;
      badgeColor = tokens.softColor;
      badgeBorder = '1px solid transparent';
      break;
    case 'solid':
    default:
      badgeBg = tokens.solidBg;
      badgeColor = tokens.solidColor;
      badgeBorder = '1px solid transparent';
      break;
  }

  // Base badge inline styles
  const badgeInlineStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeSpec.height,
    minWidth: sizeSpec.height, // ensures pills are at least as wide as tall
    paddingLeft: sizeSpec.paddingX,
    paddingRight: sizeSpec.paddingX,
    fontSize: sizeSpec.fontSize,
    lineHeight: sizeSpec.lineHeight,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    fontFamily: 'var(--ds-font-family-base)',
    backgroundColor: badgeBg,
    color: badgeColor,
    border: badgeBorder,
    borderRadius: 'var(--ds-radius-sm)',
    whiteSpace: 'nowrap',
    transition: `all var(--ds-motion-fast) var(--ds-motion-ease-out)`,
    // Clickable cursor
    ...(clickable || onClick ? { cursor: 'pointer' } : {}),
    // Bordered ring
    ...(bordered ? {
      boxShadow: '0 0 0 2px var(--ds-surface-card)',
    } : {}),
  };

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // -------------------------------------------------------------------------
  // Responsive support
  // -------------------------------------------------------------------------
  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  // =========================================================================
  // Render: Standalone badge (no children)
  // =========================================================================
  if (!children) {
    return (
      <>
        {responsiveStyleTag}
        <span
          className={`rottay-badge rottay-badge--modern ${pulse ? 'animate-pulse' : ''} ${className}`}
          style={{ ...badgeInlineStyle, ...style }}
          onClick={clickable || onClick ? handleClick : undefined}
          {...responsiveAttrs}
        >
          {icon && (
            <span style={{ display: 'inline-flex', marginRight: '4px', flexShrink: 0 }}>
              {icon}
            </span>
          )}
          {!dot && formattedValue !== undefined ? formattedValue : props.children}
          {closable && (
            <span
              style={{
                display: 'inline-flex',
                marginLeft: '4px',
                cursor: 'pointer',
                opacity: 0.5,
                transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                flexShrink: 0,
              }}
              onClick={handleClose}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
              aria-label="Close badge"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </span>
      </>
    );
  }

  // =========================================================================
  // Render: Hidden badge (children only)
  // =========================================================================
  if (!shouldShowBadge) {
    return <div className={className} style={style}>{children}</div>;
  }

  // =========================================================================
  // Render: Indicator badge (positioned over children)
  // =========================================================================
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;

  // Position style mapping (replaces DaisyUI indicator classes)
  const positionStyleMap: Record<string, React.CSSProperties> = {
    'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
  };
  const positionStyle = positionStyleMap[position!] || positionStyleMap['top-right'];

  // Indicator badge style (smaller, positioned)
  const indicatorBadgeStyle: React.CSSProperties = dot
    ? {
        ...badgeInlineStyle,
        width: dotSize,
        height: dotSize,
        minWidth: 'auto',
        padding: 0,
        borderRadius: 'var(--ds-radius-full)',
      }
    : {
        ...badgeInlineStyle,
        borderRadius: 'var(--ds-radius-full)',
      };

  return (
    <>
      {responsiveStyleTag}
      <div className={className} style={{ position: 'relative', display: 'inline-flex', ...style }}>
        <span
          className={`rottay-badge rottay-badge--modern ${pulse ? 'animate-pulse' : ''}`}
          {...responsiveAttrs}
          style={{ ...indicatorBadgeStyle, position: 'absolute', zIndex: 1, ...positionStyle }}
          onClick={clickable || onClick ? handleClick : undefined}
        >
          {!dot && (
            <>
              {icon && (
                <span style={{ display: 'inline-flex', marginRight: '3px', flexShrink: 0 }}>
                  {icon}
                </span>
              )}
              {formattedValue}
            </>
          )}
        </span>
        {children}
      </div>
    </>
  );
}

ModernBadge.displayName = 'ModernBadge';
