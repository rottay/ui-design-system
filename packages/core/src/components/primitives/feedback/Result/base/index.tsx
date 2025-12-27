/**
 * Result - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useMemo } from 'react';
import type { ResultProps, ResultStatus } from '../types';
import { RESULT_DEFAULTS, RESULT_COLORS } from '../types';

/**
 * Status icons as SVGs
 */
const StatusIcons: Record<ResultStatus, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  '404': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#1677ff">404</text>
    </svg>
  ),
  '403': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#faad14">403</text>
    </svg>
  ),
  '500': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#ff4d4f">500</text>
    </svg>
  ),
};

/**
 * Base Result component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseResult = forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    const {
      status = RESULT_DEFAULTS.status!,
      icon,
      title,
      subTitle,
      extra,
      children,
      className = '',
      style = {},
    } = props;

    const statusColor = RESULT_COLORS[status];

    // CSS variables
    const resultVars = useMemo<React.CSSProperties>(() => ({
      '--result-icon-color': statusColor,
      '--result-padding': '48px 32px',
      '--result-title-font-size': '24px',
      '--result-title-color': 'var(--color-text-primary)',
      '--result-subtitle-font-size': '14px',
      '--result-subtitle-color': 'var(--color-text-secondary)',
    } as React.CSSProperties), [statusColor]);

    const resultStyle: React.CSSProperties = {
      ...resultVars,
      textAlign: 'center',
      padding: 'var(--result-padding)',
      ...style,
    };

    const iconContainerStyle: React.CSSProperties = {
      marginBottom: '24px',
      color: 'var(--result-icon-color)',
    };

    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--result-title-font-size)',
      fontWeight: 500,
      color: 'var(--result-title-color)',
      marginBottom: subTitle ? '8px' : '24px',
    };

    const subTitleStyle: React.CSSProperties = {
      fontSize: 'var(--result-subtitle-font-size)',
      color: 'var(--result-subtitle-color)',
      marginBottom: '24px',
      lineHeight: 1.6,
    };

    const extraStyle: React.CSSProperties = {
      marginTop: '24px',
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    };

    const contentStyle: React.CSSProperties = {
      marginTop: '24px',
      padding: '24px',
      backgroundColor: 'var(--color-bg-secondary, #fafafa)',
      borderRadius: 'var(--radius-lg, 8px)',
    };

    // Determine which icon to show
    const renderIcon = () => {
      if (icon !== undefined) return icon;
      return StatusIcons[status];
    };

    return (
      <div
        ref={ref}
        className={`rottay-result rottay-result--${status} ${className}`}
        style={resultStyle}
      >
        <div className="rottay-result__icon" style={iconContainerStyle}>
          {renderIcon()}
        </div>

        {title && (
          <div className="rottay-result__title" style={titleStyle}>
            {title}
          </div>
        )}

        {subTitle && (
          <div className="rottay-result__subtitle" style={subTitleStyle}>
            {subTitle}
          </div>
        )}

        {extra && (
          <div className="rottay-result__extra" style={extraStyle}>
            {extra}
          </div>
        )}

        {children && (
          <div className="rottay-result__content" style={contentStyle}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

BaseResult.displayName = 'BaseResult';
