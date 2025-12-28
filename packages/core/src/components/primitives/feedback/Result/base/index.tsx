/**
 * @fileoverview Result Base Component - Rottay Design System
 * @description Base/fallback implementation for the Result component.
 * Provides a fully functional result display when no engine is available.
 *
 * @remarks
 * The BaseResult serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires a minimal markup
 *
 * Unlike other base components, BaseResult is fully functional and can be
 * used directly when a lightweight result display is needed.
 *
 * **Multi-Tenant Integration:**
 * The base component uses CSS variables for theming, allowing tenant-specific
 * colors and typography to be applied via CSS custom properties.
 *
 * **CSS Variables Used:**
 * - `--result-icon-color`: Status-specific icon color
 * - `--result-padding`: Container padding
 * - `--result-title-font-size`: Title text size
 * - `--result-title-color`: Title text color
 * - `--result-subtitle-font-size`: Subtitle text size
 * - `--result-subtitle-color`: Subtitle text color
 * - `--color-bg-secondary`: Children container background
 * - `--radius-lg`: Children container border radius
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseResult } from '@rottay/design-system/components/primitives/feedback/Result/base';
 *
 * <BaseResult
 *   status="success"
 *   title="Operation Complete"
 *   subTitle="Your changes have been saved."
 * />
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * // Always prefer the main Result export for engine support
 * <Result status="success" title="Operation Complete">
 *   Additional content here
 * </Result>
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link TitanResult} - Ant Design implementation
 * @see {@link HermesResult} - DaisyUI implementation
 * @see {@link ApolloResult} - Vanilla implementation
 * @module Result/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useMemo } from 'react';
import type { ResultProps, ResultStatus } from '../types';
import { RESULT_DEFAULTS, RESULT_COLORS } from '../types';

// ============================================================================
// Status Icons
// ============================================================================

/**
 * SVG icons for each result status.
 * Provides consistent visual representation across the component.
 *
 * @remarks
 * - Standard statuses (success, error, info, warning) use circular icons
 * - HTTP statuses (404, 403, 500) display the status code prominently
 * - Icons are sized at 72x72 for standard statuses
 * - HTTP status displays are sized at 252x294 for visual impact
 *
 * @internal
 */
const StatusIcons: Record<ResultStatus, React.ReactNode> = {
  /** Checkmark in circle - successful operation */
  success: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  /** Exclamation in circle - failed operation */
  error: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  /** Info symbol in circle - informational message */
  info: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  /** Warning triangle - caution message */
  warning: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  /** 404 status code display - page not found */
  '404': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#1677ff">404</text>
    </svg>
  ),
  /** 403 status code display - access forbidden */
  '403': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#faad14">403</text>
    </svg>
  ),
  /** 500 status code display - server error */
  '500': (
    <svg viewBox="0 0 252 294" width="252" height="294" fill="none">
      <rect width="252" height="294" rx="10" fill="#F5F5F5" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#ff4d4f">500</text>
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Base Result component using CSS variables.
 * This is extended by engine-specific implementations.
 *
 * @description
 * Renders a complete result display with icon, title, subtitle, extra content,
 * and children. Uses CSS variables for theming support.
 *
 * @remarks
 * **Key Features:**
 * - Fully functional standalone result component
 * - CSS variable-based theming for multi-tenant support
 * - Responsive layout with centered content
 * - Semantic HTML structure for accessibility
 *
 * **CSS Classes:**
 * - `rottay-result`: Base class for styling hooks
 * - `rottay-result--{status}`: Status-specific class for styling
 * - `rottay-result__icon`: Icon container
 * - `rottay-result__title`: Title element
 * - `rottay-result__subtitle`: Subtitle element
 * - `rottay-result__extra`: Extra content container
 * - `rottay-result__content`: Children content container
 *
 * @param props - {@link ResultProps}
 * @param ref - Forwarded ref to the container div
 * @returns A fully functional result display component
 *
 * @example
 * ```tsx
 * <BaseResult
 *   status="success"
 *   title="Payment Successful"
 *   subTitle="Order #12345 has been confirmed."
 *   extra={<button>View Order</button>}
 * />
 * ```
 */
export const BaseResult = forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // CSS Variables
    // -------------------------------------------------------------------------

    const statusColor = RESULT_COLORS[status];

    /**
     * CSS custom properties for theming.
     * These can be overridden by tenant-specific styles.
     */
    const resultVars = useMemo<React.CSSProperties>(() => ({
      '--ds-result-icon-color': statusColor,
      '--ds-result-padding': '48px 32px',
      '--ds-result-title-font-size': '24px',
      '--ds-result-title-color': 'var(--ds-color-text-primary)',
      '--ds-result-subtitle-font-size': '14px',
      '--ds-result-subtitle-color': 'var(--ds-color-text-secondary)',
    } as React.CSSProperties), [statusColor]);

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /** Container styles */
    const resultStyle: React.CSSProperties = {
      ...resultVars,
      textAlign: 'center',
      padding: 'var(--ds-result-padding)',
      ...style,
    };

    /** Icon container styles */
    const iconContainerStyle: React.CSSProperties = {
      marginBottom: '24px',
      color: 'var(--ds-result-icon-color)',
    };

    /** Title styles */
    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--ds-result-title-font-size)',
      fontWeight: 500,
      color: 'var(--ds-result-title-color)',
      marginBottom: subTitle ? '8px' : '24px',
    };

    /** Subtitle styles */
    const subTitleStyle: React.CSSProperties = {
      fontSize: 'var(--ds-result-subtitle-font-size)',
      color: 'var(--ds-result-subtitle-color)',
      marginBottom: '24px',
      lineHeight: 1.6,
    };

    /** Extra content styles */
    const extraStyle: React.CSSProperties = {
      marginTop: '24px',
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    };

    /** Children container styles */
    const contentStyle: React.CSSProperties = {
      marginTop: '24px',
      padding: '24px',
      backgroundColor: 'var(--ds-color-bg-secondary, #fafafa)',
      borderRadius: 'var(--ds-radius-lg, 8px)',
    };

    // -------------------------------------------------------------------------
    // Icon Rendering
    // -------------------------------------------------------------------------

    /**
     * Renders the appropriate icon based on props and status.
     * Custom icons override default status icons.
     */
    const renderIcon = () => {
      if (icon !== undefined) return icon;
      return StatusIcons[status];
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-result rottay-result--${status} ${className}`}
        style={resultStyle}
      >
        {/* Icon Section */}
        <div className="rottay-result__icon" style={iconContainerStyle}>
          {renderIcon()}
        </div>

        {/* Title Section */}
        {title && (
          <div className="rottay-result__title" style={titleStyle}>
            {title}
          </div>
        )}

        {/* Subtitle Section */}
        {subTitle && (
          <div className="rottay-result__subtitle" style={subTitleStyle}>
            {subTitle}
          </div>
        )}

        {/* Extra Content Section (Buttons) */}
        {extra && (
          <div className="rottay-result__extra" style={extraStyle}>
            {extra}
          </div>
        )}

        {/* Children Content Section */}
        {children && (
          <div className="rottay-result__content" style={contentStyle}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
BaseResult.displayName = 'BaseResult';
