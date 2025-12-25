/**
 * Card - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { CardProps } from '../types';
import { CARD_DEFAULTS, PADDING_MAP } from '../types';

export default function HermesCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    subtitle,
    variant = CARD_DEFAULTS.variant,
    hoverable = CARD_DEFAULTS.hoverable,
    padding = CARD_DEFAULTS.padding,
    onClick,
    className = '',
    style,
  } = props;

  // Map variants to DaisyUI classes
  const variantClasses = {
    elevated: 'card-bordered bg-base-100 shadow-md',
    outlined: 'card-bordered bg-base-100',
    filled: 'bg-base-200',
  };

  const paddingValue = PADDING_MAP[padding!];
  const cardClass = `card ${variantClasses[variant!]} ${hoverable ? 'hover:shadow-lg transition-shadow' : ''} ${className}`;

  return (
    <div
      className={cardClass}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      <div className="card-body" style={{ padding: paddingValue }}>
        {(title || subtitle) && (
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && (
              <p className="text-sm opacity-60">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
