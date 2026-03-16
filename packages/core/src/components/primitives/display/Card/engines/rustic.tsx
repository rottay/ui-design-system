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

import React, { useState } from 'react';
import type { CardProps } from '../Card.types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from '../Card.types';

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
    padding = CARD_DEFAULTS.padding,
    divider,
    backgroundColor,
    onClick,
    className = '',
    style,
  } = props;

  // Hover state is tracked via React state rather than CSS :hover because
  // inline styles cannot respond to pseudo-classes. This lets us apply
  // CSS-variable-driven transforms and shadows dynamically.
  const [isHovered, setIsHovered] = useState(false);

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;
  const borderRadiusValue = RADIUS_MAP[radius] || RADIUS_MAP.md;

  // Resolve color variant once so the same values are shared between
  // the left-border accent and the tinted background spread below.
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  // Each variant defines its own background, border, and shadow combination.
  // All values reference DS CSS variables with hardcoded fallbacks so the
  // card renders correctly even without a theme provider.
  const variantStyles: Record<string, React.CSSProperties> = {
    elevated: {
      backgroundColor: backgroundColor || 'var(--ds-card-bg, #fff)',
      border: 'none',
      boxShadow: isHovered && hoverable ? SHADOW_MAP.lg : SHADOW_MAP.md,
    },
    outlined: {
      backgroundColor: backgroundColor || 'var(--ds-card-bg, #fff)',
      border: '1px solid var(--ds-card-border, #e5e5e5)',
      boxShadow: 'none',
    },
    filled: {
      backgroundColor: backgroundColor || 'var(--ds-color-neutral-100, #f5f5f5)',
      border: 'none',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
  };

  // The container style merges three layers in order of specificity:
  // 1) Base layout (flex column, overflow hidden, border-radius)
  // 2) Variant-specific visuals (background, border, shadow)
  // 3) State overrides (hover transforms, color variant accents, loading dim)
  // Consumer `style` is spread last so it can override everything.
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: borderRadiusValue,
    overflow: 'hidden',
    // The transition references a DS variable so tenants can customize easing.
    transition: 'var(--ds-card-transition, box-shadow 0.3s, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s)',
    cursor: clickable || onClick ? 'pointer' : undefined,
    // Dim the card and block interactions while content is loading.
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? 'none' : 'auto',
    // Slight upward lift + micro-scale on hover for tactile feedback.
    transform: isHovered && hoverable
      ? 'var(--ds-card-hover-transform, translateY(-2px) scale(1.005))'
      : 'translateY(0) scale(1)',
    ...variantStyles[variant],
    // Color variant accent: left border + tinted background for semantic cues.
    ...(hasColorVariant && {
      borderLeft: `4px solid ${colorStyles.borderColor}`,
      backgroundColor: colorStyles.background,
    }),
    // Hover background/border shift only for non-color-variant cards,
    // because color variants already have their own background.
    ...(isHovered && hoverable && !hasColorVariant && {
      backgroundColor: 'var(--ds-card-bg-hover, inherit)',
      borderColor: 'var(--ds-card-border-hover, var(--ds-card-border, transparent))',
    }),
    ...style,
  };

  // Header style
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: paddingValue,
    borderBottom: divider ? '1px solid var(--ds-card-header-border, #e5e5e5)' : 'none',
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
    borderTop: '1px solid var(--ds-card-footer-border, #e5e5e5)',
  };

  // The loading overlay sits on top of the full card (position: absolute)
  // with a frosted-glass backdrop-filter. Unlike the classic engine's
  // Skeleton approach, this preserves the existing content underneath
  // to signal a "refresh" rather than an initial load.
  const loadingOverlay = loading && (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--ds-color-neutral-200, #e0e0e0)',
          borderTopColor: 'var(--ds-color-primary-500, #1890ff)',
          borderRadius: '50%',
          animation: 'rottay-rustic-card-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      />
    </div>
  );

  return (
    <div
      className={`rottay-card rottay-card--rustic ${className}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Clickable cards receive button role + tabIndex for keyboard access.
      // This is the rustic engine's key a11y advantage over modern/classic.
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      aria-busy={loading}
    >
      {loadingOverlay}

      {/* Cover image at top */}
      {cover && coverPosition === 'top' && (
        <img
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}

      {/* Header with title, description, and extra */}
      {(title || description || extra) && (
        <div style={headerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
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
                style={{
                  fontSize: '14px',
                  color: 'var(--ds-card-subtitle-color, #8c8c8c)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {description}
              </div>
            )}
          </div>
          {extra && <div style={{ flexShrink: 0, marginLeft: '12px' }}>{extra}</div>}
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: paddingValue, flex: 1 }}>{children}</div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div style={actionsStyle}>
          {actions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </div>
      )}

      {/* Cover image at bottom */}
      {cover && coverPosition === 'bottom' && (
        <img
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}

      {/* Inline keyframes avoid requiring a global CSS file, keeping the
          rustic engine fully self-contained with zero external dependencies.
          The animation name is prefixed to prevent collisions with other
          component keyframes in the same document. */}
      <style>{`
        @keyframes rottay-rustic-card-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

RusticCard.displayName = 'RusticCard';
