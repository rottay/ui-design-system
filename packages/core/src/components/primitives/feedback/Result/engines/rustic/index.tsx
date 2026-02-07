/**
 * @fileoverview Result Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Result component.
 * A zero-dependency engine for maximum compatibility and accessibility.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless engine in the Rottay Design System, built with
 * vanilla HTML and CSS. It provides:
 * - Zero external dependencies (no Ant Design or Tailwind required)
 * - Maximum accessibility with semantic HTML and ARIA attributes
 * - Full styling control via inline styles
 * - Smallest possible bundle footprint
 *
 * **When to Use Rustic:**
 * - Projects that cannot use external UI libraries
 * - When maximum accessibility compliance is required
 * - Server-side rendering scenarios
 * - Embedding in legacy applications
 * - When full styling control is needed
 *
 * **Multi-Tenant Theming:**
 * Rustic results use the design system's color constants which can be
 * customized per tenant. The component uses inline styles that can be
 * overridden via the style prop or CSS custom properties.
 *
 * **Accessibility Features:**
 * - Uses `role="status"` for screen reader announcements
 * - Includes `aria-live="polite"` for dynamic updates
 * - Semantic heading structure with `<h2>` for titles
 * - Proper text hierarchy with `<p>` for subtitles
 *
 * @example Basic Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * <Result engine="rustic" status="success" title="Done!">
 *   <p>Your changes have been saved.</p>
 * </Result>
 * ```
 *
 * @example Server-Side Rendering
 * ```tsx
 * // Rustic works well in SSR contexts
 * export default function Page() {
 *   return (
 *     <Result
 *       engine="rustic"
 *       status="error"
 *       title="Submission Failed"
 *       subTitle="Please try again later."
 *     />
 *   );
 * }
 * ```
 *
 * @example Custom Styling
 * ```tsx
 * <Result
 *   engine="rustic"
 *   status="success"
 *   title="Custom Styled Result"
 *   style={{
 *     backgroundColor: '#f0f5ff',
 *     borderRadius: '16px',
 *     padding: '48px',
 *   }}
 * />
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link ClassicResult} - Ant Design alternative
 * @see {@link ModernResult} - DaisyUI alternative
 * @module Result/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ResultProps, ResultStatus } from '../../types';
import { RESULT_DEFAULTS, RESULT_COLORS, RESULT_ICONS } from '../../types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Inline style definitions for the Rustic engine.
 * Uses a styles object pattern for maintainability and type safety.
 *
 * @remarks
 * All styles are defined as React.CSSProperties for type checking.
 * Dynamic styles (like status-specific colors) are defined as functions.
 *
 * @internal
 */
/**
 * CSS variable-based color mapping for result statuses.
 * Uses design system tokens with fallbacks.
 */
const STATUS_COLOR_VARS: Record<ResultStatus, string> = {
  success: 'var(--ds-result-success-color, var(--ds-color-success-500, #52c41a))',
  error: 'var(--ds-result-error-color, var(--ds-color-error-500, #ff4d4f))',
  info: 'var(--ds-result-info-color, var(--ds-color-primary-500, #1677ff))',
  warning: 'var(--ds-result-warning-color, var(--ds-color-warning-500, #faad14))',
  '404': 'var(--ds-result-404-color, var(--ds-color-primary-500, #1677ff))',
  '403': 'var(--ds-result-403-color, var(--ds-color-warning-500, #faad14))',
  '500': 'var(--ds-result-500-color, var(--ds-color-error-500, #ff4d4f))',
};

const styles = {
  /**
   * Container styles - centered flex layout.
   */
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: 'var(--ds-result-padding, 48px 24px)',
  },

  /**
   * Icon wrapper styles - provides spacing below icon.
   */
  iconWrapper: {
    marginBottom: 'var(--ds-result-icon-margin, 24px)',
  },

  /**
   * Standard status icon styles (success, error, info, warning).
   * Creates a circular badge with the status color.
   *
   * @param status - The result status for color lookup
   * @returns CSSProperties for the icon container
   */
  icon: (status: ResultStatus): React.CSSProperties => ({
    width: 'var(--ds-result-icon-size, 72px)',
    height: 'var(--ds-result-icon-size, 72px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-result-icon-font-size, 32px)',
    color: 'var(--ds-result-icon-color, #fff)',
    backgroundColor: STATUS_COLOR_VARS[status] || RESULT_COLORS[status],
  }),

  /**
   * HTTP status code display styles (404, 403, 500).
   * Creates a large, bold status code display.
   *
   * @param status - The result status for color lookup
   * @returns CSSProperties for the status code display
   */
  statusCode: (status: ResultStatus): React.CSSProperties => ({
    fontSize: 'var(--ds-result-code-size, 72px)',
    fontWeight: 700,
    color: STATUS_COLOR_VARS[status] || RESULT_COLORS[status],
    lineHeight: 1,
  }),

  /**
   * Title styles - prominent heading.
   */
  title: {
    fontSize: 'var(--ds-result-title-size, 24px)',
    fontWeight: 600,
    color: 'var(--ds-result-title-color, rgba(0, 0, 0, 0.88))',
    marginBottom: '8px',
    maxWidth: 'var(--ds-result-max-width, 480px)',
  } as React.CSSProperties,

  /**
   * Subtitle styles - secondary text.
   */
  subTitle: {
    fontSize: 'var(--ds-result-subtitle-size, 14px)',
    color: 'var(--ds-result-subtitle-color, rgba(0, 0, 0, 0.45))',
    marginBottom: '24px',
    maxWidth: 'var(--ds-result-max-width, 480px)',
    lineHeight: 1.6,
  } as React.CSSProperties,

  /**
   * Extra content container styles - for action buttons.
   */
  extra: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 'var(--ds-result-extra-gap, 8px)',
    justifyContent: 'center',
    marginBottom: '24px',
  },

  /**
   * Children container styles - for additional content.
   */
  children: {
    width: '100%',
    maxWidth: 'var(--ds-result-content-max-width, 560px)',
  },
};

// ============================================================================
// Icon Rendering
// ============================================================================

/**
 * Renders the appropriate icon based on the result status.
 * HTTP status codes display as large text, other statuses show icons.
 *
 * @param status - The result status to render
 * @returns React node containing the status icon or code
 *
 * @internal
 */
const renderIcon = (status: ResultStatus): React.ReactNode => {
  // HTTP status codes (404, 403, 500) display as large text
  if (['404', '403', '500'].includes(status)) {
    return <div style={styles.statusCode(status)}>{status}</div>;
  }

  // Standard statuses display icon character in colored circle
  return (
    <div style={styles.icon(status)}>
      {RESULT_ICONS[status]}
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Result component.
 *
 * @description
 * A zero-dependency implementation using vanilla HTML and inline CSS.
 * Provides maximum accessibility and compatibility with any environment.
 *
 * @remarks
 * **Key Features:**
 * - No external dependencies
 * - Full accessibility support with ARIA attributes
 * - Inline styles for complete encapsulation
 * - Works in any React environment
 *
 * **Accessibility:**
 * - `role="status"` announces content to screen readers
 * - `aria-live="polite"` ensures updates are announced
 * - Semantic HTML structure with proper heading levels
 *
 * **Layout Structure:**
 * ```
 * Container (role="status" aria-live="polite")
 * ├── Icon Wrapper
 * │   └── Status Icon or Code
 * ├── Title (h2)
 * ├── Subtitle (p)
 * ├── Extra (div for buttons)
 * └── Children (div for additional content)
 * ```
 *
 * @param props - {@link ResultProps}
 * @returns The rendered result display with vanilla styling
 *
 * @example
 * ```tsx
 * <RusticResult
 *   status="success"
 *   title="Payment Successful"
 *   subTitle="Your order has been confirmed."
 *   extra={
 *     <button style={{ padding: '8px 16px' }}>
 *       Continue Shopping
 *     </button>
 *   }
 * />
 * ```
 */
export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      status = RESULT_DEFAULTS.status,
      icon,
      title,
      subTitle,
      extra,
      children,
      className = '',
      style,
    } = props;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={className}
        style={{ ...styles.container, ...style }}
        role="status"
        aria-live="polite"
      >
        {/* Icon Section */}
        <div style={styles.iconWrapper}>
          {icon || renderIcon(status!)}
        </div>

        {/* Title Section */}
        {title && (
          <h2 style={styles.title}>
            {title}
          </h2>
        )}

        {/* Subtitle Section */}
        {subTitle && (
          <p style={styles.subTitle}>
            {subTitle}
          </p>
        )}

        {/* Extra Section (Buttons) */}
        {extra && (
          <div style={styles.extra}>
            {extra}
          </div>
        )}

        {/* Children Section */}
        {children && (
          <div style={styles.children}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Result.displayName = 'Result.Rustic';

export default Result;
