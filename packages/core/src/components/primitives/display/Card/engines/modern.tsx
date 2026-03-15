/**
 * @fileoverview Card Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based card with utility-first styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's card component classes with Tailwind utilities
 * for lightweight, responsive card rendering.
 *
 * **Implementation Details:**
 * - Uses DaisyUI `card` class for container
 * - Uses `card-body`, `card-title`, `card-actions` for structure
 * - Custom spinner overlay with backdrop-filter blur for loading state
 * - Uses `figure` element for cover images
 *
 * **Enhancements:**
 * - Hover state tracking with transform + shadow elevation
 * - Smooth transitions using cubic-bezier easing
 * - Custom spinner overlay replaces simple animate-pulse
 * - Personality-variable-driven hover effects
 *
 * **Class Mappings:**
 * - `elevated` -> `bg-base-100 shadow-md`
 * - `outlined` -> `card-bordered bg-base-100`
 * - `filled` -> `bg-base-200`
 * - `ghost` -> `bg-transparent`
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
 * @example DaisyUI Styling
 * ```tsx
 * <Card engine="modern" variant="outlined" hoverable>
 *   <Card.Body>
 *     <p>DaisyUI styled content</p>
 *   </Card.Body>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @see {@link https://daisyui.com/components/card/} DaisyUI Card
 * @module ModernCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState } from 'react';
import type { CardProps } from '../Card.types';
import { CARD_DEFAULTS, PADDING_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from '../Card.types';

/**
 * Custom loading spinner for Card overlay.
 */
const CardSpinner: React.FC = () => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-button-spin 1s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="10"
      opacity="0.25"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="25"
    />
  </svg>
);

/**
 * Modern engine Card component using DaisyUI/Tailwind CSS.
 * Provides a utility-first card implementation with responsive design patterns.
 *
 * Features:
 * - DaisyUI card component classes
 * - Tailwind CSS utility-first styling
 * - Custom spinner overlay with backdrop blur for loading
 * - Cover image support (top/bottom position)
 * - Header with title, description, and extra content
 * - Action slot with flexible alignment
 * - Smooth hover transitions with transform + shadow elevation
 *
 * @component
 * @example
 * // Basic card with Modern engine
 * <Card engine="modern" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Card with DaisyUI styling
 * <Card
 *   engine="modern"
 *   variant="outlined"
 *   hoverable
 * >
 *   <Card.Body>
 *     <p>DaisyUI styled content</p>
 *   </Card.Body>
 * </Card>
 *
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
    padding = CARD_DEFAULTS.padding,
    divider,
    onClick,
    className = '',
    style,
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  // Map variants to DaisyUI classes
  const variantClasses: Record<string, string> = {
    elevated: 'bg-base-100 shadow-md',
    outlined: 'card-bordered bg-base-100',
    filled: 'bg-base-200',
    ghost: 'bg-transparent',
  };

  // Build class list
  const isInteractive = hoverable || clickable;
  const cardClasses = [
    'card',
    variantClasses[variant] || variantClasses.elevated,
    isInteractive ? 'cursor-pointer' : '',
    bordered && variant !== 'outlined' ? 'card-bordered' : '',
    className,
  ].filter(Boolean).join(' ');

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;

  // Get color variant styles
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  // Card style with interactive transitions
  const cardStyle: React.CSSProperties = {
    borderRadius: RADIUS_MAP[radius] || RADIUS_MAP.md,
    cursor: clickable || onClick ? 'pointer' : undefined,
    transition: 'box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: isHovered && isInteractive
      ? 'var(--ds-card-hover-transform, translateY(-2px))'
      : 'translateY(0)',
    boxShadow: isHovered && isInteractive
      ? 'var(--ds-card-hover-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08))'
      : undefined,
    position: 'relative',
    // Apply color variant styles
    ...(hasColorVariant && {
      borderLeft: `4px solid ${colorStyles.borderColor}`,
      backgroundColor: colorStyles.background,
    }),
    ...style,
  };

  // Render loading state with custom spinner overlay + backdrop blur
  if (loading) {
    return (
      <div className={cardClasses} style={cardStyle}>
        {cover && (
          <figure>
            <div className="bg-base-300 h-48 w-full" style={{ opacity: 0.5 }} />
          </figure>
        )}
        <div className="card-body" style={{ padding: paddingValue, position: 'relative', minHeight: '120px' }}>
          {/* Skeleton content underneath */}
          <div className="space-y-4" style={{ opacity: 0.3 }}>
            <div className="h-4 bg-base-300 rounded w-3/4" />
            <div className="h-4 bg-base-300 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-base-300 rounded" />
              <div className="h-3 bg-base-300 rounded" />
              <div className="h-3 bg-base-300 rounded w-5/6" />
            </div>
          </div>
          {/* Spinner overlay with backdrop blur */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'inherit',
              zIndex: 1,
            }}
          >
            <CardSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
    >
      {/* Cover image at top */}
      {cover && coverPosition === 'top' && (
        <figure>
          <img
            src={cover}
            alt={typeof title === 'string' ? title : 'Card cover'}
            className="w-full object-cover"
          />
        </figure>
      )}

      <div className="card-body" style={{ padding: paddingValue }}>
        {/* Header with title, description, and extra */}
        {(title || description || extra) && (
          <div className={`flex justify-between items-start ${divider ? 'border-b border-base-300 pb-4 mb-4' : ''}`}>
            <div>
              {title && <h2 className="card-title">{title}</h2>}
              {description && (
                <p className="text-sm opacity-60">{description}</p>
              )}
            </div>
            {extra && <div className="flex-shrink-0">{extra}</div>}
          </div>
        )}

        {/* Main content */}
        {children}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="card-actions justify-end mt-4">
            {actions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Cover image at bottom */}
      {cover && coverPosition === 'bottom' && (
        <figure>
          <img
            src={cover}
            alt={typeof title === 'string' ? title : 'Card cover'}
            className="w-full object-cover"
          />
        </figure>
      )}
    </div>
  );
}

ModernCard.displayName = 'ModernCard';
