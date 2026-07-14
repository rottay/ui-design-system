/**
 * @fileoverview Card Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS card implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free card using only
 * inline styles and semantic HTML for maximum accessibility.
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Uses semantic HTML with ARIA attributes
 * - Spinner overlay for loading state
 * - Full keyboard navigation support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility (ARIA, keyboard)
 *
 * **Accessibility Features:**
 * - `role="button"` for clickable cards
 * - `tabIndex` for keyboard navigation
 * - `aria-busy` for loading state
 * - `aria-label` for loading overlay
 *
 * @example Basic Usage
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card engine="rustic" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 * ```
 *
 * @example Accessible Clickable Card
 * ```tsx
 * <Card
 *   engine="rustic"
 *   clickable
 *   onClick={() => navigate('/details')}
 *   title="Click to view details"
 * >
 *   <p>Fully keyboard accessible</p>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @see {@link BaseCard} for CSS variable implementation
 * @module RusticCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useId } from 'react';

import { partAttributes, useInteractionState } from '../../../../../behavior';
import type { CardProps } from '../Card.types';
import { CARD_DEFAULTS, PADDING_MAP } from '../Card.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';

/**
 * Rustic engine Card component using pure HTML/CSS.
 * Provides a lightweight, accessible card implementation without external dependencies.
 *
 * Features:
 * - Zero external dependencies (pure React)
 * - Maximum accessibility with semantic HTML
 * - CSS-in-JS styling with CSS variables
 * - Loading state with spinner overlay
 * - Cover image support (top/bottom position)
 * - Header with title, description, and extra content
 * - Action slot for buttons/links
 * - Smooth hover transitions
 * - Full keyboard navigation support
 *
 * @component
 * @example
 * // Basic card with Rustic engine
 * <Card engine="rustic" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Accessible clickable card
 * <Card
 *   engine="rustic"
 *   clickable
 *   onClick={() => navigate('/details')}
 *   title="Click to view details"
 * >
 *   <p>This card is fully keyboard accessible</p>
 * </Card>
 *
 * @param {CardProps} props - Component properties
 * @returns {React.ReactElement} The rendered Rustic Card component
 */
export default function RusticCard(props: CardProps): React.ReactElement {
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
    bordered: _bordered = CARD_DEFAULTS.bordered,
    shadowed: _shadowed,
    radius = CARD_DEFAULTS.radius,
    padding: paddingProp = CARD_DEFAULTS.padding,
    divider,
    backgroundColor,
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

  // Hover state is tracked via React state rather than CSS :hover because
  // inline styles cannot respond to pseudo-classes. This lets us apply
  // CSS-variable-driven transforms and shadows dynamically.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;

  // Resolve color variant once so the same values are shared between
  // the left-border accent and the tinted background spread below.
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  // Each variant defines its own background, border, and shadow combination.
  // All values reference DS CSS variables with hardcoded fallbacks so the
  // card renders correctly even without a theme provider.
  // Paint lives in `tokens/css/engines/rustic/skin/card.css`, keyed on the
  // `data-*` contract below. `backgroundColor` is a caller's value, like `style`,
  // and keeps the precedence it always had.
  const cardStyle: React.CSSProperties = {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...style,
  };

  /** The DOM contract the rustic Card skin selects on. */
  const skinAttributes = {
    'data-variant': variant,
    'data-radius': radius,
    'data-tone': hasColorVariant ? colorVariant : undefined,
    'data-hoverable': hoverable ? 'true' : undefined,
    'data-clickable': clickable || onClick ? 'true' : undefined,
    'data-loading': loading ? 'true' : undefined,
  } as const;

  // The divider rule is card.css, keyed on the data-divider stamp below.
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: paddingValue,
  };

  // Cover image style
  const coverStyle: React.CSSProperties = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  };

  // Actions style
  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: paddingValue,
  };

  // The loading overlay sits on top of the full card (position: absolute)
  // with a frosted-glass backdrop-filter. Unlike the classic engine's
  // Skeleton approach, this preserves the existing content underneath
  // to signal a "refresh" rather than an initial load.
  const loadingOverlay = loading && (
    <div
      data-part="loading-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        data-part="spinner"
        style={{
          width: '32px',
          height: '32px',
          animation: 'ds-card-spin-rustic 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      />
    </div>
  );

  return (
    <>
    {responsive && responsive.css && (
      <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
    )}
    <div
      className={`rottay-card rottay-card--rustic ${className}`}
      style={cardStyle}
      {...skinAttributes}
      onClick={onClick}
      {...interactionHandlers}
      {...partAttributes('root', interaction)}
      // The three go together or none of them do. A `role="button"` with a tab
      // stop and no activation path is a control a pointer can use and a
      // keyboard cannot. `clickable` is a styling flag, not a promise that the
      // card does anything, so it does not mint a button.
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-busy={loading}
      {...(responsive ? responsive.attrs : {})}
    >
      {loadingOverlay}

      {/* Cover image at top */}
      {cover && coverPosition === 'top' && (
        <img
          data-part="cover"
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}

      {/* Header with title, description, and extra */}
      {(title || description || extra) && (
        <div data-part="header" data-divider={divider ? 'true' : undefined} style={headerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
                data-part="title"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: description ? '4px' : 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                data-part="description"
                style={{
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {description}
              </div>
            )}
          </div>
          {extra && <div data-part="extra" style={{ flexShrink: 0, marginLeft: '12px' }}>{extra}</div>}
        </div>
      )}

      {/* Main content */}
      <div data-part="body" style={{ padding: paddingValue, flex: 1 }}>{children}</div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div data-part="actions" style={actionsStyle}>
          {actions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </div>
      )}

      {/* Cover image at bottom */}
      {cover && coverPosition === 'bottom' && (
        <img
          data-part="cover"
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}
    </div>
    </>
  );
}

RusticCard.displayName = 'RusticCard';
