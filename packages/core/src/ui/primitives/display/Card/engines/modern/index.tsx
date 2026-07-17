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

import React, { useCallback, useId } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import type { CardProps } from '../../contracts';
import { CARD_DEFAULTS, PADDING_MAP } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

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
    data-part="spinner"
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

  // The triad is decided once, in the behavior core: both skins of this
  // component read the same state, and a focus ring is a keyboard affordance.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();

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
  const hasColorVariant = colorVariant && colorVariant !== 'default';
  const cardClassName = [
    'ds-card',
    `ds-card--${variant}`,
    isInteractive ? 'ds-card--interactive' : '',
    'ds-card--modern',
    hasColorVariant ? `ds-card--tone-${colorVariant}` : '',
    className,
  ].filter(Boolean).join(' ');

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;

  // Paint lives in `foundation/tokens/css/runtime/engines/modern/skin/card.css`, keyed on the
  // `data-*` contract stamped on the root below. Only a caller's own `style` prop
  // stays inline, which is the precedence it has always had.
  const cardStyle: React.CSSProperties | undefined = style;

  /** The DOM contract the modern Card skin selects on. */
  const skinAttributes = {
    'data-variant': variant,
    'data-radius': radius,
    'data-tone': hasColorVariant ? colorVariant : undefined,
    // `hoverable || clickable`, the condition the hover paint was gated on.
    'data-interactive': isInteractive ? 'true' : undefined,
    // Paints a pointer. Not the same as being operable.
    'data-clickable': clickable || onClick ? 'true' : undefined,
    // Actually operable: takes a tab stop, a button role, and a focus ring.
    'data-actionable': onClick ? 'true' : undefined,
  } as const;

  // ============================================================================
  // Shared sub-elements
  // ============================================================================

  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  // The divider rule itself is card.css, keyed on the data-divider stamp; the space
  // it needs around it is not paint and stays here.
  const headerSeparator: React.CSSProperties = divider
    ? {
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
            <div
              data-part="cover"
              style={{
                height: 'var(--ds-card-cover-height, 192px)',
                opacity: 0.6,
              }}
            />
          )}
          <div style={{
            padding: paddingValue || BODY_PADDING,
            position: 'relative',
            minHeight: 'var(--ds-card-skeleton-min-height, 120px)',
          }}>
            {/* Skeleton bars */}
            <div data-part="skeleton" style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3, 12px)' }}>
              <div data-part="skeleton-bar" style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                width: '60%',
              }} />
              <div data-part="skeleton-bar" style={{
                height: 'var(--ds-skeleton-bar-height, 12px)',
                width: '40%',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)', marginTop: 'var(--ds-spacing-1, 4px)' }}>
                <div data-part="skeleton-bar" style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  width: '100%',
                }} />
                <div data-part="skeleton-bar" style={{
                  height: 'var(--ds-skeleton-bar-height-sm, 10px)',
                  width: '85%',
                }} />
              </div>
            </div>
            {/* Spinner overlay */}
            <div
              data-part="loading-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
        {...interactionHandlers}
        {...partAttributes('root', interaction)}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        style={cardStyle}
        {...skinAttributes}
        {...responsiveAttrs}
      >
        {/* Cover image - top */}
        {cover && coverPosition === 'top' && (
          <div data-part="cover" style={{ overflow: 'hidden', lineHeight: 0 }}>
            <img
              src={cover}
              alt={typeof title === 'string' ? title : 'Card cover'}
              style={coverImageStyle}
            />
          </div>
        )}

        {/* Body */}
        <div data-part="body" style={{ padding: paddingValue || BODY_PADDING }}>
          {/* Header */}
          {(title || description || extra) && (
            <div
              data-part="header"
              data-divider={divider ? 'true' : undefined}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                ...headerSeparator,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                {title && (
                  <div data-part="title" style={{
                    fontSize: 'var(--ds-card-title-font-size, 16px)',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    letterSpacing: 'var(--ds-card-title-letter-spacing, -0.01em)',
                  }}>
                    {title}
                  </div>
                )}
                {description && (
                  <div data-part="description" style={{
                    fontSize: 'var(--ds-card-description-font-size, 13px)',
                    lineHeight: 1.5,
                    marginTop: title ? 'var(--ds-spacing-0-5, 2px)' : undefined,
                  }}>
                    {description}
                  </div>
                )}
              </div>
              {extra && (
                <div data-part="extra" style={{ flexShrink: 0, marginLeft: 'var(--ds-spacing-4, 16px)' }}>
                  {extra}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div data-part="actions" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2, 8px)',
              marginTop: 'var(--ds-spacing-4, 16px)',
              paddingTop: 'var(--ds-spacing-4, 16px)',
            }}>
              {actions.map((action, index) => (
                <React.Fragment key={index}>{action}</React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Cover image - bottom */}
        {cover && coverPosition === 'bottom' && (
          <div data-part="cover" style={{ overflow: 'hidden', lineHeight: 0 }}>
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
