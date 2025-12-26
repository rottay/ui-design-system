/**
 * @fileoverview Card Base Component
 * @description Pure React implementation of the Card component using CSS variables.
 * Serves as the foundational component extended by engine-specific implementations.
 *
 * @module Card/base
 * @package @es-rottay/designsystem-core
 */

'use client';

import React, { forwardRef, useState } from 'react';
import type { CardProps } from '../types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from '../types';

/**
 * Base Card component using CSS variables for styling.
 * This component provides the foundational structure and behavior
 * that is extended by engine-specific implementations (Titan, Hermes, Apollo).
 *
 * Features:
 * - Multiple visual variants (elevated, outlined, filled, ghost)
 * - Configurable padding, radius, and shadow
 * - Hover effects with smooth transitions
 * - Loading state with spinner overlay
 * - Accessible keyboard navigation for clickable cards
 *
 * @component
 * @example
 * // Basic usage
 * <BaseCard variant="elevated" padding="md">
 *   <p>Card content goes here</p>
 * </BaseCard>
 *
 * @example
 * // Clickable card with hover effects
 * <BaseCard
 *   variant="outlined"
 *   hoverable
 *   clickable
 *   onClick={() => console.log('Card clicked')}
 * >
 *   <p>Click me!</p>
 * </BaseCard>
 *
 * @param {CardProps} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the root element
 * @returns {React.ReactElement} The rendered Card component
 */
export const BaseCard = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const {
      children,
      variant = CARD_DEFAULTS.variant,
      size = CARD_DEFAULTS.size,
      hoverable = CARD_DEFAULTS.hoverable,
      clickable = CARD_DEFAULTS.clickable,
      loading = CARD_DEFAULTS.loading,
      bordered = CARD_DEFAULTS.bordered,
      shadowed,
      radius = CARD_DEFAULTS.radius,
      padding = CARD_DEFAULTS.padding,
      onClick,
      className = '',
      style = {},
    } = props;

    const [isHovered, setIsHovered] = useState(false);

    // Build CSS variables for the card
    const cardVars: React.CSSProperties = {
      '--card-bg': 'var(--card-elevated-bg, #ffffff)',
      '--card-border-color': bordered ? 'var(--card-border-default, #f0f0f0)' : 'transparent',
      '--card-border-radius': RADIUS_MAP[radius] || RADIUS_MAP.md,
      '--card-shadow': SHADOW_MAP[shadowed ? 'md' : 'none'],
      '--card-padding': `${PADDING_MAP[padding]}px`,
      '--card-transition': 'all 0.2s ease-in-out',
    } as React.CSSProperties;

    // Variant-specific styles
    const variantStyles: Record<string, React.CSSProperties> = {
      elevated: {
        backgroundColor: 'var(--card-bg)',
        boxShadow: isHovered && hoverable
          ? 'var(--card-lg-shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
          : 'var(--card-md-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
        border: 'none',
      },
      outlined: {
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'none',
        border: '1px solid var(--card-border-color)',
      },
      filled: {
        backgroundColor: 'var(--card-filled-bg, #fafafa)',
        boxShadow: 'none',
        border: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
      },
    };

    // Computed container styles
    const containerStyle: React.CSSProperties = {
      ...cardVars,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'var(--card-border-radius)',
      overflow: 'hidden',
      transition: 'var(--card-transition)',
      cursor: clickable || onClick ? 'pointer' : 'default',
      opacity: loading ? 0.7 : 1,
      pointerEvents: loading ? 'none' : 'auto',
      ...variantStyles[variant],
      ...style,
    };

    /**
     * Handles mouse enter event for hover effects
     */
    const handleMouseEnter = () => {
      if (hoverable) setIsHovered(true);
    };

    /**
     * Handles mouse leave event for hover effects
     */
    const handleMouseLeave = () => {
      if (hoverable) setIsHovered(false);
    };

    return (
      <div
        ref={ref}
        className={`rottay-card rottay-card--${variant} rottay-card--${size} ${className}`}
        style={containerStyle}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={clickable || onClick ? 'button' : undefined}
        tabIndex={clickable || onClick ? 0 : undefined}
      >
        {loading && (
          <div
            className="rottay-card-loading-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e0e0e0',
                borderTopColor: 'var(--card-loading-color, #1890ff)',
                borderRadius: '50%',
                animation: 'rottay-card-spin 1s linear infinite',
              }}
            />
          </div>
        )}
        {children}
        <style>{`
          @keyframes rottay-card-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
