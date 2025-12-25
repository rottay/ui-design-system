/**
 * Card.Header - Compound Component
 * Header section for Card component
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card header with title, subtitle, and extra content
 */
export function CardHeader({
  title,
  subtitle,
  extra,
  children,
  className = '',
  style,
}: CardHeaderProps): React.ReactElement {
  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--card-header-padding, 16px 24px)',
    borderBottom: '1px solid var(--card-border-color, #f0f0f0)',
    ...style,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 'var(--card-title-size, 16px)',
    fontWeight: 600,
    color: 'var(--card-title-color, #000)',
  };

  const subtitleStyle: CSSProperties = {
    margin: '4px 0 0 0',
    fontSize: 'var(--card-subtitle-size, 14px)',
    color: 'var(--card-subtitle-color, #666)',
  };

  return (
    <div className={`rottay-card-header ${className}`} style={headerStyle}>
      <div className="rottay-card-header-content">
        {title && <h3 style={titleStyle}>{title}</h3>}
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        {children}
      </div>
      {extra && <div className="rottay-card-header-extra">{extra}</div>}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';
