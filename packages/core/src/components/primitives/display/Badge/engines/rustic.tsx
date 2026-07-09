/**
 * @fileoverview Rustic engine for the Badge component, using pure HTML/CSS.
 * Zero external dependencies -- all styling via inline styles and CSS custom
 * properties, with injected keyframes for the pulse animation.
 *
 * @example
 * ```tsx
 * <Badge engine="rustic" count={5} variant="primary"><Avatar /></Badge>
 * ```
 */

'use client';

import React, { useId } from 'react';
import type { BadgeProps, BadgeSize } from '../Badge.types';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP, VARIANT_SOFT_COLOR_MAP, VARIANT_SOFT_TEXT_COLOR_MAP } from '../Badge.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Rustic (pure HTML/CSS) implementation of the Badge component.
 *
 * Supports four style variants (solid, outline, soft, ghost) via computed
 * inline styles. A `<style>` tag is injected only when pulse is active to
 * provide the keyframe animation without requiring a global stylesheet.
 *
 * @param props - Unified BadgeProps from the design system type contract
 * @returns React element built entirely from native HTML elements and inline styles
 */
export default function RusticBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    variant = BADGE_DEFAULTS.variant,
    size: sizeProp = BADGE_DEFAULTS.size,
    badgeStyle: badgeStyleProp,
    visible = BADGE_DEFAULTS.visible,
    pulse,
    position = BADGE_DEFAULTS.position,
    icon,
    closable,
    onClose,
    clickable,
    onClick,
    bordered,
    radius = BADGE_DEFAULTS.radius,
    className = '',
    style,
  } = props;

  // Responsive size handling
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

  // `content` (string/ReactNode) takes precedence over numeric `count`
  const displayValue = content !== undefined ? content : count;

  /**
   * Format count with overflow handling.
   */
  const formattedValue = (() => {
    if (displayValue === undefined) return undefined;
    if (typeof displayValue === 'string') return displayValue;
    return displayValue > max! ? `${max}+` : displayValue;
  })();

  // Badge is hidden when visible=false, or when there is no dot and the count
  // is zero (unless showZero is set). This avoids rendering an empty indicator.
  // A string display value is showable whenever non-empty -- a label, not a
  // count. Checked against displayValue, not formattedValue, so a numeric
  // overflow already formatted to text (e.g. "99+") is not re-parsed as a
  // string label.
  const shouldShowBadge = visible && (
    dot ||
    (displayValue !== undefined && (
      typeof displayValue === 'string'
        ? displayValue.length > 0
        : displayValue > 0 || showZero
    ))
  );

  // children with no explicit content/count/dot has no separate indicator
  // value to position over an anchor -- children itself is the label, so it
  // renders through the standalone tag chrome below instead of the
  // positioned-container fallback.
  const isLabelledChildren = Boolean(children) && displayValue === undefined && !dot;

  // A labelled tag defaults to the soft treatment (BADGE_DEFAULTS.badgeStyle).
  // An indicator positioned over a real anchor child defaults to solid
  // regardless, since a notification bubble needs a saturated fill to stay
  // legible at a glance. An explicit badgeStyle prop always wins either way.
  const isIndicatorRender = Boolean(children) && !isLabelledChildren;
  const badgeStyle = badgeStyleProp ?? (isIndicatorRender ? 'solid' : BADGE_DEFAULTS.badgeStyle);

  // Pull size-specific dimensions from the shared constants (height, minWidth, fontSize)
  const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  /**
   * CSS custom properties for badge styling.
   * Uses design system tokens with fallbacks.
   */
  const cssVars: React.CSSProperties = {
    '--ds-badge-bg': color,
    '--ds-badge-color': 'var(--ds-badge-text-color, #ffffff)',
    '--ds-badge-min-width': sizeValues.minWidth,
    '--ds-badge-height': sizeValues.height,
    '--ds-badge-font-size': sizeValues.fontSize,
    '--ds-badge-dot-size': dotSize,
    '--ds-badge-border-radius': radius === 'full' ? 'var(--ds-badge-radius-full, 9999px)' :
                             radius === 'lg' ? 'var(--ds-badge-radius-lg, 12px)' :
                             radius === 'md' ? 'var(--ds-badge-radius-md, 8px)' :
                             radius === 'sm' ? 'var(--ds-badge-radius-sm, 6px)' : 'var(--ds-badge-radius-none, 0)',
  } as React.CSSProperties;

  /**
   * Position offset styles for badge placement.
   */
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
  };

  /**
   * Returns CSS styles for the selected badge style variant.
   * @returns Style object for the badge appearance
   */
  const getStyleVariation = (): React.CSSProperties => {
    switch (badgeStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ds-badge-bg)',
          border: '1px solid var(--ds-badge-bg)',
        };
      case 'soft':
        return {
          backgroundColor: VARIANT_SOFT_COLOR_MAP[variant!] || VARIANT_SOFT_COLOR_MAP.default,
          color: VARIANT_SOFT_TEXT_COLOR_MAP[variant!] || VARIANT_SOFT_TEXT_COLOR_MAP.default,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ds-badge-bg)',
        };
      default: // solid
        return {
          backgroundColor: 'var(--ds-badge-bg)',
          color: 'var(--ds-badge-color)',
        };
    }
  };

  /**
   * Handles badge click events.
   * @param e - Mouse event
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  /**
   * Handles close button clicks.
   * @param e - Mouse event
   */
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Core visual style shared by both standalone and positioned badges.
  // When dot=true, dimensions collapse to the dot size with zero padding.
  const badgeIndicatorStyle: React.CSSProperties = {
    ...cssVars,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: dot ? 'var(--ds-badge-dot-size)' : 'var(--ds-badge-min-width)',
    maxWidth: '100%',
    height: dot ? 'var(--ds-badge-dot-size)' : 'var(--ds-badge-height)',
    padding: dot ? 0 : '0 6px',
    fontSize: 'var(--ds-badge-font-size)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--ds-badge-border-radius)',
    border: bordered ? 'var(--ds-badge-border-width, 2px) solid var(--ds-badge-border-color, #fff)' : 'none',
    boxShadow: bordered ? `0 0 0 1px ${color}` : 'none',
    cursor: clickable || onClick ? 'pointer' : 'default',
    transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...getStyleVariation(),
  };

  // Animation is applied inline; the matching @keyframes is injected via <style> below
  const pulseAnimation = pulse ? {
    animation: 'badge-pulse 1.5s ease-in-out infinite',
  } : {};

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  // Standalone / labelled-children path: render as an inline tag without any
  // wrapper container -- children (if present, with no separate content/
  // count/dot) is the label, falling back to formattedValue when it is set.
  if (!children || isLabelledChildren) {
    return (
      <>
        {responsiveStyleTag}
        {pulse && (
          <style>{`
            @keyframes badge-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
          `}</style>
        )}
        <span
          className={className}
          style={{ ...badgeIndicatorStyle, ...pulseAnimation, ...style }}
          onClick={clickable || onClick ? handleClick : undefined}
          {...responsiveAttrs}
        >
          {icon && <span style={{ marginRight: formattedValue !== undefined ? 4 : 0 }}>{icon}</span>}
          {!dot && (formattedValue !== undefined ? formattedValue : children)}
          {closable && (
            <span
              style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7 }}
              onClick={handleClose}
              aria-label="Close badge"
            >
              x
            </span>
          )}
        </span>
      </>
    );
  }

  // Positioned path: wrap children in a relative container so the badge can
  // be placed absolutely at the requested corner (top-right, etc.)
  const containerStyle: React.CSSProperties = {
    ...cssVars,
    position: 'relative',
    display: 'inline-flex',
    ...style,
  };

  // Merge indicator styles with absolute positioning and the chosen corner offset
  const positionedBadgeStyle: React.CSSProperties = {
    ...badgeIndicatorStyle,
    ...pulseAnimation,
    position: 'absolute',
    ...positionStyles[position!],
    zIndex: 1,
  };

  return (
    <>
      {responsiveStyleTag}
      {pulse && (
        <style>{`
          @keyframes badge-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
        `}</style>
      )}
      <div className={className} style={containerStyle}>
        {children}
        {shouldShowBadge && (
          <span
            style={positionedBadgeStyle}
            onClick={clickable || onClick ? handleClick : undefined}
          >
            {!dot && (
              <>
                {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
                {formattedValue}
              </>
            )}
          </span>
        )}
      </div>
    </>
  );
}

RusticBadge.displayName = 'RusticBadge';
