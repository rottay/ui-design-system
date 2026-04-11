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
  'box-shadow var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
  'transform var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
  'border-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
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
    style={{ animation: 'rottay-button-spin 0.8s linear infinite' }}
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
  border: string;
  boxShadow: string;
}

interface VariantHoverStyle {
  boxShadow?: string;
  borderColor?: string;
  transform?: string;
}

const VARIANT_STYLES: Record<string, VariantStyle> = {
  elevated: {
    backgroundColor: 'var(--ds-surface-card)',
    border: '1px solid transparent',
    boxShadow: 'var(--ds-elevation-2, 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03))',
  },
  outlined: {
    backgroundColor: 'var(--ds-surface-card)',
    border: '1px solid var(--ds-color-border-subtle)',
    boxShadow: 'none',
  },
  filled: {
    backgroundColor: 'var(--ds-surface-panel)',
    border: '1px solid transparent',
    boxShadow: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    boxShadow: 'none',
  },
};

function getHoverStyle(variant: string): VariantHoverStyle {
  switch (variant) {
    case 'elevated':
      return {
        boxShadow: 'var(--ds-elevation-3, 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03))',
        transform: 'translateY(-1px)',
      };
    case 'outlined':
      return {
        borderColor: 'var(--ds-color-border-secondary)',
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
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.elevated;
  const hoverStyle = isHovered && isInteractive ? getHoverStyle(variant) : {};

  // Get color variant styles
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;
  const radiusValue = RADIUS_MAP[radius] || 'var(--ds-radius-lg, 12px)';

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: radiusValue,
    backgroundColor: variantStyle.backgroundColor,
    border: variantStyle.border,
    boxShadow: isFocused && onClick
      ? `${hoverStyle.boxShadow || variantStyle.boxShadow}, 0 0 0 var(--ds-focus-ring-width, 2px) var(--ds-focus-ring-color)`
      : hoverStyle.boxShadow || variantStyle.boxShadow,
    borderColor: hoverStyle.borderColor || undefined,
    transform: hoverStyle.transform || 'translateY(0)',
    transition: TRANSITION,
    cursor: clickable || onClick ? 'pointer' : undefined,
    outline: onClick ? 'none' : undefined,
    overflow: 'hidden',
    // Color variant accent
    ...(hasColorVariant && {
      borderLeft: `4px solid ${colorStyles.borderColor}`,
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
        borderBottom: '1px solid var(--ds-color-border)',
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
        <div style={cardStyle} className={className} {...responsiveAttrs}>
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
                transition: `opacity var(--ds-motion-normal, 250ms) var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))`,
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
        className={className}
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
        <div style={{ padding: paddingValue || BODY_PADDING }}>
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
                    fontSize: 'var(--ds-card-title-font-size, 15px)',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: 'var(--ds-color-text-primary)',
                    letterSpacing: 'var(--ds-card-title-letter-spacing, -0.01em)',
                  }}>
                    {title}
                  </div>
                )}
                {description && (
                  <div style={{
                    fontSize: 'var(--ds-card-description-font-size, 13px)',
                    lineHeight: 1.5,
                    color: 'var(--ds-color-text-secondary)',
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
              borderTop: '1px solid var(--ds-color-border)',
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
