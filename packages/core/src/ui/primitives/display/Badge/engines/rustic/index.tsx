/**
 * @fileoverview Rustic engine for the Badge component, using pure HTML/CSS.
 * Zero external dependencies -- component paint lives in the unlayered rustic
 * skin, with CSS custom properties and a governed pulse animation.
 *
 * @example
 * ```tsx
 * <Badge engine="rustic" count={5} variant="primary"><Avatar /></Badge>
 * ```
 */

'use client';

import React, { useId } from 'react';
import type { BadgeProps, BadgeSize } from '../../contracts';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP, VARIANT_SOFT_COLOR_MAP, VARIANT_SOFT_TEXT_COLOR_MAP, VARIANT_SOLID_TEXT_COLOR_MAP, TONE_TO_BADGE_VARIANT } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Carries the indicator badge's per-instance corner-offset transform as a
 * CSS custom property rather than the `transform` property itself -- see
 * foundation/tokens/css/runtime/engines/rustic/skin/badge.css for why.
 */
type BadgePositionStyle = React.CSSProperties & Record<'--ds-badge-position-transform', string>;

/**
 * Rustic (pure HTML/CSS) implementation of the Badge component.
 *
 * Supports four style variants (solid, outline, soft, ghost) through semantic
 * stamps and custom properties consumed by the rustic skin. Generated
 * responsive geometry may use a scoped `<style>` tag; pulse paint stays in the skin.
 *
 * @param props - Unified BadgeProps from the design system type contract
 * @returns Native HTML structure painted by the rustic Badge skin
 */
export default function RusticBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    tone,
    variant: variantProp = BADGE_DEFAULTS.variant,
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

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_COLOR_MAP
  // and its soft-style siblings below are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_BADGE_VARIANT[tone] : variantProp;

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

  // Single source for the click affordance -- the cursor below and the
  // data-interactive attribute the skin stylesheet keys its hover rule on
  // (foundation/tokens/css/runtime/engines/rustic/skin/badge.css) both read this, so a badge
  // with neither prop gets neither signal.
  const isInteractive = Boolean(clickable || onClick);

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
    '--ds-badge-color': VARIANT_SOLID_TEXT_COLOR_MAP[variant!] || VARIANT_SOLID_TEXT_COLOR_MAP.default,
    '--ds-badge-soft-bg': VARIANT_SOFT_COLOR_MAP[variant!] || VARIANT_SOFT_COLOR_MAP.default,
    '--ds-badge-soft-color': VARIANT_SOFT_TEXT_COLOR_MAP[variant!] || VARIANT_SOFT_TEXT_COLOR_MAP.default,
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
   * Position offset styles for badge placement. The corner offset is
   * exposed as the --ds-badge-position-transform CUSTOM PROPERTY, not the
   * `transform` property itself: `transform` is owned entirely by
   * foundation/tokens/css/runtime/engines/rustic/skin/badge.css, so its :hover rule can
   * compose the personality hover lift onto this offset. An inline
   * `transform` property here would always beat the stylesheet regardless
   * of specificity, and the hover rule could never compose onto it.
   */
  const positionStyles: Record<string, BadgePositionStyle> = {
    'top-right': { top: 0, right: 0, '--ds-badge-position-transform': 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, '--ds-badge-position-transform': 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, '--ds-badge-position-transform': 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, '--ds-badge-position-transform': 'translate(-50%, 50%)' },
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
  // Fill, ink, radius, frame and the bordered ring are painted by
  // foundation/tokens/css/runtime/engines/rustic/skin/badge.css, which reads the custom properties
  // above and keys the style branches on the data-badge-style stamp.
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
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // The matching @keyframes lives in the skin, engine-namespaced
  const pulseAnimation = pulse ? {
    animation: 'ds-badge-pulse-rustic 1.5s ease-in-out infinite',
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
        <span
          className={`rottay-badge rottay-badge--rustic ${className}`}
          data-part="root"
          data-variant={variant}
          data-badge-style={badgeStyle}
          data-bordered={bordered ? 'true' : undefined}
          data-dot={dot ? 'true' : undefined}
          data-size={size}
          style={{ ...badgeIndicatorStyle, ...pulseAnimation, ...style }}
          onClick={isInteractive ? handleClick : undefined}
          // The hover transform itself is CSS (foundation/tokens/css/runtime/engines/rustic/skin/badge.css),
          // keyed on this attribute plus :hover -- not a JS mouse handler.
          data-interactive={isInteractive ? 'true' : undefined}
          {...responsiveAttrs}
        >
          {icon && <span data-part="icon" style={{ marginRight: formattedValue !== undefined ? 4 : 0 }}>{icon}</span>}
          {!dot && (formattedValue !== undefined ? formattedValue : children)}
          {closable && (
            <span
              data-part="close"
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
      <div className={className} data-part="anchor" style={containerStyle}>
        {children}
        {shouldShowBadge && (
          <span
            className="rottay-badge rottay-badge--rustic"
            data-part="root"
            data-variant={variant}
            data-badge-style={badgeStyle}
            data-bordered={bordered ? 'true' : undefined}
            data-dot={dot ? 'true' : undefined}
            data-size={size}
            data-position={position}
            style={positionedBadgeStyle}
            onClick={isInteractive ? handleClick : undefined}
            data-interactive={isInteractive ? 'true' : undefined}
          >
            {!dot && (
              <>
                {icon && <span data-part="icon" style={{ marginRight: 4 }}>{icon}</span>}
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
