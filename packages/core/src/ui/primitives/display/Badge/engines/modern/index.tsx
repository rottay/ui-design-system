/**
 * @fileoverview Modern engine for the Badge component - Premium quality.
 * Uses the unlayered modern skin, driven by --ds-* CSS custom properties, for
 * precise editorial styling. Inspired by Linear, Vercel, and Stripe Dashboard.
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
 * <Badge engine="modern" variant="success">Ready</Badge>
 * ```
 */

'use client';

import React, { useId } from 'react';
import type { BadgeProps, BadgeSize } from '../../contracts';
import { BADGE_DEFAULTS, DOT_SIZE_MAP, SIZE_MAP, TONE_TO_BADGE_VARIANT } from '../../contracts';
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
 * foundation/tokens/css/runtime/engines/modern/skin/badge.css for why.
 */
type BadgePositionStyle = React.CSSProperties & Record<'--ds-badge-position-transform', string>;

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
 * 1. Standalone / labelled-children badge (no children, or children with no
 *    separate content/count/dot to position) - renders as an inline tag;
 *    children is the label when there is no formattedValue.
 * 2. Anchor-only badge (an explicit content/count/dot fails the visibility
 *    check, e.g. count=0 without showZero) - renders children with no
 *    indicator chrome.
 * 3. Indicator badge (positioned over children) - a separate content/count/
 *    dot value renders as a small badge layered over children.
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
    className = '',
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; the
  // data-variant stamp badge.css keys its fill on, and SIZE_SPECS below, are keyed
  // by the same internal color-token name either way.
  const variant = tone ? TONE_TO_BADGE_VARIANT[tone] : variantProp;

  // -------------------------------------------------------------------------
  // Responsive size handling
  // -------------------------------------------------------------------------
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    // No responsive min-width entry: see the content-integrity note on
    // badgeInlineStyle above -- a forced min-width is what lets a narrow
    // breakpoint shrink the badge below its label, causing mid-word wrap.
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

  // A string display value (explicit content) is showable whenever non-empty
  // -- it is a label, not a count. A numeric count keeps the Ant-style
  // semantic: shown only when positive, or when showZero is set. Checked
  // against displayValue (not the post-formatting formattedValue) so a
  // numeric overflow already rendered as text, e.g. "99+", is not re-parsed
  // as a string label -- it is undefined iff displayValue is undefined.
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
  // renders through the standalone tag chrome below instead of the bare
  // anchor-only fallback.
  const isLabelledChildren = Boolean(children) && displayValue === undefined && !dot;

  // A labelled tag defaults to the soft treatment (BADGE_DEFAULTS.badgeStyle).
  // An indicator positioned over a real anchor child defaults to solid
  // regardless, since a notification bubble needs a saturated fill to stay
  // legible at a glance. An explicit badgeStyle prop always wins either way.
  const isIndicatorRender = Boolean(children) && !isLabelledChildren;
  const badgeStyle = badgeStyleProp ?? (isIndicatorRender ? 'solid' : BADGE_DEFAULTS.badgeStyle);

  // Single source for the click affordance -- the cursor below and the
  // data-interactive attribute the skin stylesheet keys its hover rule on
  // (foundation/tokens/css/runtime/engines/modern/skin/badge.css) both read this, so a badge
  // with neither prop gets neither signal.
  const isInteractive = Boolean(clickable || onClick);

  // -------------------------------------------------------------------------
  // Style computation
  // -------------------------------------------------------------------------
  const sizeSpec = SIZE_SPECS[size!] || SIZE_SPECS.md;

  // Fill, ink, frame and the bordered ring are painted by
  // foundation/tokens/css/runtime/engines/modern/skin/badge.css, keyed on the data-variant /
  // data-badge-style / data-bordered stamps below.
  const badgeInlineStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizeSpec.height,
    // No forced min-width: a fixed min-width lets a flex/grid parent shrink the
    // badge below its label's natural width, which is what produces mid-word
    // wrap ("Bad ge") in narrow containers (spec section 9 / section 13).
    // Padding alone gives count/dot badges their pill proportions.
    maxWidth: '100%',
    paddingLeft: sizeSpec.paddingX,
    paddingRight: sizeSpec.paddingX,
    fontSize: sizeSpec.fontSize,
    lineHeight: sizeSpec.lineHeight,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    fontFamily: 'var(--ds-font-family-base)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: `all var(--ds-motion-fast) var(--ds-motion-ease-out)`,
    // Clickable cursor
    ...(isInteractive ? { cursor: 'pointer' } : {}),
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
  // Render: Standalone / labelled-children badge
  // =========================================================================
  if (!children || isLabelledChildren) {
    return (
      <>
        {responsiveStyleTag}
        <span
          className={`rottay-badge rottay-badge--modern ${pulse ? 'animate-pulse' : ''} ${className}`}
          data-part="root"
          data-variant={variant}
          data-badge-style={badgeStyle}
          data-bordered={bordered ? 'true' : undefined}
          data-dot={dot ? 'true' : undefined}
          data-size={size}
          style={{ ...badgeInlineStyle, ...style }}
          onClick={isInteractive ? handleClick : undefined}
          // The hover transform itself is CSS (foundation/tokens/css/runtime/engines/modern/skin/badge.css),
          // keyed on this attribute plus :hover -- not a JS mouse handler.
          data-interactive={isInteractive ? 'true' : undefined}
          {...responsiveAttrs}
        >
          {icon && (
            <span data-part="icon" style={{ display: 'inline-flex', marginRight: '4px', flexShrink: 0 }}>
              {icon}
            </span>
          )}
          {!dot && formattedValue !== undefined ? formattedValue : props.children}
          {closable && (
            <span
              data-part="close"
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
  // Render: Anchor only (explicit content/count/dot fails visibility)
  // =========================================================================
  // Reached only when children is a real anchor and a separate content/
  // count/dot value exists but is currently suppressed (count=0 without
  // showZero, or visible=false) -- children renders with no indicator chrome.
  if (!shouldShowBadge) {
    return <div className={className} style={style}>{children}</div>;
  }

  // =========================================================================
  // Render: Indicator badge (positioned over children)
  // =========================================================================
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;

  // Position style mapping (replaces DaisyUI indicator classes). The corner
  // offset is exposed as the --ds-badge-position-transform CUSTOM PROPERTY,
  // not the `transform` property itself: `transform` is owned entirely by
  // foundation/tokens/css/runtime/engines/modern/skin/badge.css, so its :hover rule can compose
  // the personality hover lift onto this offset. An inline `transform`
  // property here would always beat the stylesheet regardless of
  // specificity, and the hover rule could never compose onto it.
  const positionStyleMap: Record<string, BadgePositionStyle> = {
    'top-right': { top: 0, right: 0, '--ds-badge-position-transform': 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, '--ds-badge-position-transform': 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, '--ds-badge-position-transform': 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, '--ds-badge-position-transform': 'translate(-50%, 50%)' },
  };
  const positionStyle = positionStyleMap[position!] || positionStyleMap['top-right'];

  // Indicator badge style (smaller, positioned). The full radius this render path
  // takes is a badge.css rule keyed on the data-position stamp, which only this
  // path emits.
  const indicatorBadgeStyle: React.CSSProperties = dot
    ? {
        ...badgeInlineStyle,
        width: dotSize,
        height: dotSize,
        minWidth: 'auto',
        padding: 0,
      }
    : badgeInlineStyle;

  return (
    <>
      {responsiveStyleTag}
      <div className={className} data-part="anchor" style={{ position: 'relative', display: 'inline-flex', ...style }}>
        <span
          className={`rottay-badge rottay-badge--modern ${pulse ? 'animate-pulse' : ''}`}
          data-part="root"
          data-variant={variant}
          data-badge-style={badgeStyle}
          data-bordered={bordered ? 'true' : undefined}
          data-dot={dot ? 'true' : undefined}
          data-size={size}
          data-position={position}
          {...responsiveAttrs}
          style={{ ...indicatorBadgeStyle, position: 'absolute', zIndex: 1, ...positionStyle }}
          onClick={isInteractive ? handleClick : undefined}
          data-interactive={isInteractive ? 'true' : undefined}
        >
          {!dot && (
            <>
              {icon && (
                <span data-part="icon" style={{ display: 'inline-flex', marginRight: '3px', flexShrink: 0 }}>
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
