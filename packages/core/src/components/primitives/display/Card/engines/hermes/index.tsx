/**
 * Card - Hermes Engine (DaisyUI)
 */

'use client';

import React, { useState } from 'react';
import type { CardProps } from '../../types';
import { CARD_DEFAULTS, PADDING_MAP, RADIUS_MAP } from '../../types';

export default function HermesCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    description,
    cover,
    coverPosition = 'top',
    extra,
    actions,
    variant = CARD_DEFAULTS.variant,
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

  const [_isHovered, setIsHovered] = useState(false);

  // Map variants to DaisyUI classes
  const variantClasses: Record<string, string> = {
    elevated: 'bg-base-100 shadow-md',
    outlined: 'card-bordered bg-base-100',
    filled: 'bg-base-200',
    ghost: 'bg-transparent',
  };

  // Build class list
  const cardClasses = [
    'card',
    variantClasses[variant] || variantClasses.elevated,
    hoverable || clickable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '',
    bordered && variant !== 'outlined' ? 'card-bordered' : '',
    loading ? 'opacity-70 pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ');

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;

  // Card style
  const cardStyle: React.CSSProperties = {
    borderRadius: RADIUS_MAP[radius] || RADIUS_MAP.md,
    cursor: clickable || onClick ? 'pointer' : undefined,
    ...style,
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className={cardClasses} style={cardStyle}>
        {cover && (
          <figure className="animate-pulse">
            <div className="bg-base-300 h-48 w-full" />
          </figure>
        )}
        <div className="card-body" style={{ padding: paddingValue }}>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-base-300 rounded w-3/4" />
            <div className="h-4 bg-base-300 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-base-300 rounded" />
              <div className="h-3 bg-base-300 rounded" />
              <div className="h-3 bg-base-300 rounded w-5/6" />
            </div>
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

HermesCard.displayName = 'HermesCard';
