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
import type { ResultProps, ResultStatus } from '../../contracts';
import { RESULT_DEFAULTS, RESULT_ICONS } from '../../contracts';

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
 * The per-status colour map moved verbatim into the unlayered rustic Result skin,
 * keyed on `data-tone`. Its `|| RESULT_COLORS[status]` fallback was unreachable --
 * the map covered every `ResultStatus` key -- so only the live half was carried
 * over. `RESULT_COLORS` remains exported from Result.types.ts.
 */
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
  // The badge's circular fill and the status code's colour are keyed on
  // `data-tone` in the unlayered rustic Result skin, from STATUS_COLOR_VARS.
  icon: {
    width: 'var(--ds-result-icon-size, 72px)',
    height: 'var(--ds-result-icon-size, 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-result-icon-font-size, 32px)',
  } as React.CSSProperties,

  /**
   * HTTP status code display styles (404, 403, 500).
   * Creates a large, bold status code display.
   */
  statusCode: {
    fontSize: 'var(--ds-result-code-size, 72px)',
    fontWeight: 700,
    lineHeight: 1,
  } as React.CSSProperties,

  /**
   * Title styles - prominent heading.
   */
  title: {
    fontSize: 'var(--ds-result-title-size, 24px)',
    fontWeight: 600,
    marginBottom: '8px',
    maxWidth: 'var(--ds-result-max-width, 480px)',
  } as React.CSSProperties,

  /**
   * Subtitle styles - secondary text.
   */
  subTitle: {
    fontSize: 'var(--ds-result-subtitle-size, 14px)',
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
  // HTTP status codes are rendered as bold text rather than icons
  // because they are universally recognisable and carry more meaning
  if (['404', '403', '500'].includes(status)) {
    return <div data-part="status-code" style={styles.statusCode}>{status}</div>;
  }

  // Standard statuses display icon character in colored circle
  return (
    <div data-part="status-icon" style={styles.icon}>
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
      /* role="status" + aria-live="polite" ensures screen readers announce
          the result when it appears or changes, without interrupting the user */
      <div
        ref={ref}
        data-part="root"
        data-tone={status}
        className={`rottay-result--rustic ${className}`.trim()}
        style={{ ...styles.container, ...style }}
        role="status"
        aria-live="polite"
      >
        {/* Icon Section */}
        <div data-part="icon" style={styles.iconWrapper}>
          {icon || renderIcon(status!)}
        </div>

        {/* Title Section */}
        {title && (
          <h2 data-part="title" style={styles.title}>
            {title}
          </h2>
        )}

        {/* Subtitle Section */}
        {subTitle && (
          <p data-part="description" style={styles.subTitle}>
            {subTitle}
          </p>
        )}

        {/* Extra Section (Buttons) */}
        {extra && (
          <div data-part="extra" style={styles.extra}>
            {extra}
          </div>
        )}

        {/* Children Section */}
        {children && (
          <div data-part="content" style={styles.children}>
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
