/**
 * @fileoverview Card Modern Engine - Rottay Design System
 * @description Token-driven card with precise, calm, premium styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses CSS custom property tokens for all visual decisions.
 * No DaisyUI classes - all styling is inline via design tokens.
 *
 * **Material Ladder:**
 * - `elevated`: White card, shadow + border. Primary card.
 * - `outlined`: White card, border only, no shadow. Flat and subtle.
 * - `filled`: Panel background, no border, no shadow. Inset feel.
 * - `ghost`: Transparent, no border, no shadow. Structural grouping.
 *
 * **Hover Behavior:**
 * - Elevated: lifts 1px + elevation-3 shadow
 * - Outlined: border darkens to secondary
 * - Filled/Ghost: no hover elevation change
 *
 * **Transitions:**
 * - All transitions use `var(--ds-motion-fast)` with `var(--ds-motion-ease-out)`
 *
 * @example Basic Usage
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card engine="modern" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @module ModernCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { CardProps } from '../Card.types';
import { CARD_DEFAULTS, PADDING_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from '../Card.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';

// ============================================================================
// Constants
// ============================================================================

const BODY_PADDING = 'var(--ds-card-body-padding, 20px)';

const TRANSITION = [
  'box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'transform var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'border-color var(--ds-motion-fast) var(--ds-motion-ease-out)',
].join(', ');

// ============================================================================
// Loading Spinner
// ============================================================================

/**
 * Custom loading spinner for Card overlay.
 */
const CardSpinner: React.FC = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-button-spin var(--ds-motion-glacial) linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="var(--ds-color-border)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="var(--ds-color-text-secondary)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="22"
    />
  </svg>
);

// ============================================================================
// Variant Styles
// ============================================================================

interface VariantStyle {
  backgroundColor: string;
  borderWidth: string;
  borderStyle: 'solid';
  borderColor: string;
  boxShadow: string;
}

interface VariantHoverStyle {
  boxShadow?: string;
  borderColor?: string;
  transform?: string;
}

const VARIANT_STYLES: Record<string, VariantStyle> = {
  elevated: {
    backgroundColor: 'var(--ds-card-bg, var(--ds-card-elevated-bg, var(--ds-surface-card)))',
    borderWidth: 'var(--ds-card-elevated-border-width, 0)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-card-border, transparent)',
    boxShadow: 'var(--ds-card-shadow, var(--ds-card-elevated-shadow, var(--ds-elevation-2, 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03))))',
  },
  outlined: {
    backgroundColor: 'var(--ds-card-bg, var(--ds-card-bordered-bg, var(--ds-surface-card)))',
    borderWidth: 'var(--ds-card-bordered-border-width, var(--ds-card-border-width, 1px))',
    borderStyle: 'solid',
    borderColor: 'var(--ds-card-border, var(--ds-card-bordered-border-color, var(--ds-card-border-color, var(--ds-color-border-subtle))))',
    boxShadow: 'var(--ds-card-shadow, var(--ds-card-bordered-shadow, none))',
  },
  filled: {
    backgroundColor: 'var(--ds-card-bg, var(--ds-card-flat-bg, var(--ds-surface-panel)))',
    borderWidth: 'var(--ds-card-flat-border-width, 0)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-card-border, transparent)',
    boxShadow: 'var(--ds-card-shadow, var(--ds-card-flat-shadow, none))',
  },
  ghost: {
    backgroundColor: 'var(--ds-card-bg, var(--ds-card-ghost-bg, transparent))',
    borderWidth: '0',
    borderStyle: 'solid',
    borderColor: 'var(--ds-card-border, var(--ds-card-ghost-border-color, transparent))',
    boxShadow: 'var(--ds-card-shadow, var(--ds-card-ghost-shadow, none))',
  },
};

export function getModernCardVariantStyle(variant: string): VariantStyle {
  return VARIANT_STYLES[variant] || VARIANT_STYLES.elevated;
}

function getHoverStyle(variant: string): VariantHoverStyle {
  switch (variant) {
    case 'elevated':
      return {
        boxShadow: 'var(--ds-card-shadow-hover, var(--ds-card-elevated-shadow-hover, var(--ds-elevation-3, 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03))))',
        transform: 'var(--ds-card-interactive-transform-hover, translateY(-1px))',
      };
    case 'outlined':
      return {
        borderColor: 'var(--ds-card-border-accent-hover, var(--ds-card-border-hover, var(--ds-card-border-color-hover, var(--ds-color-border-secondary))))',
      };
    default:
      return {};
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern engine Card component using token-driven inline styles.
 * Premium quality: precise, calm, expensive.
 *
 * @component
 * @param {CardProps} props - Component properties
 * @returns {React.ReactElement} The rendered Modern Card component
 */
export default function ModernCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    description,
    cover,
    coverPosition = 'top',
    extra,
    actions,
    variant = CARD_DEFAULTS.variant,
    colorVariant = CARD_DEFAULTS.colorVariant,
    size: _size = CARD_DEFAULTS.size,
    hoverable = CARD_DEFAULTS.hoverable,
    clickable = CARD_DEFAULTS.clickable,
    loading = CARD_DEFAULTS.loading,
    bordered = CARD_DEFAULTS.bordered,
    shadowed: _shadowed,
    radius = CARD_DEFAULTS.radius,
    padding: paddingProp = CARD_DEFAULTS.padding,
    divider,
    onClick,
    className = '',
    style,
  } = props;

  // Responsive padding handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const paddingIsResponsive = isResponsiveValue(paddingProp);

  if (paddingIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: paddingProp,
      resolve: (v: string) => PADDING_MAP[v] || PADDING_MAP.md,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `card-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const padding = paddingIsResponsive ? CARD_DEFAULTS.padding : (paddingProp as string);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const isInteractive = hoverable || clickable;
  const variantStyle = getModernCardVariantStyle(variant);
  const hoverStyle = isHovered && isInteractive ? getHoverStyle(variant) : {};

  // Get color variant styles
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';
  const cardClassName = [
    'ds-card',
    `ds-card--${variant}`,
    isInteractive ? 'ds-card--interactive' : '',
    hasColorVariant ? `ds-card--tone-${colorVariant}` : '',
    className,
  ].filter(Boolean).join(' ');

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;
  const radiusValue = RADIUS_MAP[radius] || 'var(--ds-radius-lg, 12px)';
  const borderColor = hoverStyle.borderColor || variantStyle.borderColor;

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: radiusValue,
    backgroundColor: variantStyle.backgroundColor,
    border: `${variantStyle.borderWidth} ${variantStyle.borderStyle} ${borderColor}`,
    boxShadow: isFocused && onClick
      ? `${hoverStyle.boxShadow || variantStyle.boxShadow}, 0 0 0 var(--ds-focus-ring-width, 2px) var(--ds-focus-ring-color)`
      : hoverStyle.boxShadow || variantStyle.boxShadow,
    transform: hoverStyle.transform || 'translateY(0)',
    transition: TRANSITION,
    cursor: clickable || onClick ? 'pointer' : undefined,
    outline: onClick ? 'none' : undefined,
    overflow: 'hidden',
    // Color variant accent. Keep the signal on the full card frame so tenants
    // can theme card language without hard-coded side rails.
    ...(hasColorVariant && {
      borderColor: colorStyles.borderColor,
      backgroundColor: colorStyles.background,
    }),
    ...style,
  };

  // ============================================================================
  // Shared sub-elements
  // ============================================================================

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  const headerSeparator: React.CSSProperties = divider
    ? {
        borderBottom: '1px solid var(--ds-card-header-border, var(--ds-color-border))',
        paddingBottom: 'var(--ds-spacing-4, 16px)',
        marginBottom: 'var(--ds-spacing-4, 16px)',
      }
    : {};

  const coverImageStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    objectFit: 'cover' as const,
  };

  // ============================================================================
  // Loading state
  // ============================================================================

  if (loading) {
    return (
      <>
        {responsiveStyleTag}
        <div style={cardStyle} className={cardClassName} {...responsiveAttrs}>
          {/* Placeholder cover */}
          {cover && (
            <div style={{
              height: 'var(--ds-card-cover-height, 192px)',
              backgroundColor: 'var(--ds-surface-inset)',
              opacity: 0.6,
            }} />
          )}
          <div style={{
            padding: paddingValue || BODY_PADDING,
            position: 'relative',
            minHeight: 'var(--ds-card-skeleton-min-height, 120px)',
          }}>
            {/* Skeleton bars */}
            <div style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3, 12px)' }}>
              <div style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                backgroundColor: 'var(--ds-surface-inset)',
                borderRadius: 'var(--ds-radius-sm, 6px)',
                width: '60%',
              }} />
              <div style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                backgroundColor: 'var(--ds-surface-inset)',
                borderRadius: 'var(--ds-radius-sm, 6px)',
                width: '40%',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)', marginTop: 'var(--ds-spacing-1, 4px)' }}>
                <div style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  backgroundColor: 'var(--ds-surface-inset)',
                  borderRadius: 'var(--ds-radius-sm, 6px)',
                  width: '100%',
                }} />
                <div style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  backgroundColor: 'var(--ds-surface-inset)',
                  borderRadius: 'var(--ds-radius-sm, 6px)',
                  width: '85%',
                }} />
              </div>
            </div>
            {/* Spinner overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                backgroundColor: 'color-mix(in srgb, var(--ds-surface-card) 60%, transparent)',
                borderRadius: 'inherit',
                zIndex: 1,
                opacity: 1,
                transition: `opacity var(--ds-motion-normal) var(--ds-motion-ease-out)`,
              }}
            >
              <CardSpinner />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // Default render
  // ============================================================================

  return (
    <>
      {responsiveStyleTag}
      <div
        className={cardClassName}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        style={cardStyle}
        {...responsiveAttrs}
      >
        {/* Cover image - top */}
        {cover && coverPosition === 'top' && (
          <div style={{ overflow: 'hidden', lineHeight: 0 }}>
            <img
              src={cover}
              alt={typeof title === 'string' ? title : 'Card cover'}
              style={coverImageStyle}
            />
          </div>
        )}

        {/* Body */}
        <div style={{ padding: paddingValue || BODY_PADDING, color: 'var(--ds-card-body-color, inherit)' }}>
          {/* Header */}
          {(title || description || extra) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              ...headerSeparator,
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                {title && (
                  <div style={{
                    fontSize: 'var(--ds-card-title-font-size, 16px)',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: 'var(--ds-card-title-color, var(--ds-card-header-color, var(--ds-color-text-primary)))',
                    letterSpacing: 'var(--ds-card-title-letter-spacing, -0.01em)',
                  }}>
                    {title}
                  </div>
                )}
                {description && (
                  <div style={{
                    fontSize: 'var(--ds-card-description-font-size, 13px)',
                    lineHeight: 1.5,
                    color: 'var(--ds-card-subtitle-color, var(--ds-color-text-secondary))',
                    marginTop: title ? 'var(--ds-spacing-0-5, 2px)' : undefined,
                  }}>
                    {description}
                  </div>
                )}
              </div>
              {extra && (
                <div style={{ flexShrink: 0, marginLeft: 'var(--ds-spacing-4, 16px)' }}>
                  {extra}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2, 8px)',
              marginTop: 'var(--ds-spacing-4, 16px)',
              paddingTop: 'var(--ds-spacing-4, 16px)',
              borderTop: '1px solid var(--ds-card-footer-border, var(--ds-color-border))',
              backgroundColor: 'var(--ds-card-footer-bg, transparent)',
            }}>
              {actions.map((action, index) => (
                <React.Fragment key={index}>{action}</React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Cover image - bottom */}
        {cover && coverPosition === 'bottom' && (
          <div style={{ overflow: 'hidden', lineHeight: 0 }}>
            <img
              src={cover}
              alt={typeof title === 'string' ? title : 'Card cover'}
              style={coverImageStyle}
            />
          </div>
        )}
      </div>
    </>
  );
}

ModernCard.displayName = 'ModernCard';
