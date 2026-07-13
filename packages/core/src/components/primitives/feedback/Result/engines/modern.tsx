/**
 * @fileoverview Result Modern Engine - Rottay Design System
 * @description Token-driven Tailwind implementation of the Result component.
 * A utility-first engine optimized for Tailwind CSS projects.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine in the Rottay Design System, built on
 * Tailwind CSS with DS token inline styles. It provides:
 * - Lightweight implementation using utility classes
 * - DS token color system integration via --ds-* CSS custom properties
 * - Consistent with DS token styling patterns
 * - Smaller bundle size compared to Classic
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS as the primary styling solution
 * - When you prefer utility-first CSS methodology
 * - Applications using DS token theming
 * - When bundle size optimization is important
 *
 * **Multi-Tenant Theming:**
 * Modern results use DS token inline styles (--ds-color-success, --ds-color-error,
 * --ds-color-info, --ds-color-warning) which automatically adapt to the active tenant theme.
 * Tenant-specific themes are configured via DS token CSS custom properties.
 *
 * **Tailwind Classes Used:**
 * - Layout: `flex`, `flex-col`, `items-center`, `justify-center`, `text-center`
 * - Spacing: `py-12`, `px-6`, `mb-2`, `mb-6`, `gap-2`
 * - Typography: `text-2xl`, `font-bold`, `text-8xl`
 * - Colors: DS token inline styles via --ds-color-success, --ds-color-error, --ds-color-info, --ds-color-warning, --ds-color-primary, --ds-color-text-primary
 * - Sizing: `h-24`, `w-24`, `max-w-md`, `max-w-lg`
 *
 * @example Basic Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * <Result engine="modern" status="success" title="Done!">
 *   <p>Your changes have been saved.</p>
 * </Result>
 * ```
 *
 * @example With DS Token Theme
 * ```tsx
 * // In a DS-themed application with CSS custom properties
 * <Result engine="modern" status="success" title="Welcome!" />
 * ```
 *
 * @example HTTP Status Pages
 * ```tsx
 * // 404 Page with Tailwind styling
 * <Result
 *   engine="modern"
 *   status="404"
 *   title="Page Not Found"
 *   subTitle="The page you're looking for doesn't exist."
 *   extra={<Button variant="primary">Go Home</Button>}
 * />
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link ClassicResult} - Ant Design alternative
 * @see {@link RusticResult} - Vanilla alternative
 * @see {@link Result} for the main component
 * @module Result/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ResultProps, ResultStatus } from '../Result.types';
import { RESULT_DEFAULTS } from '../Result.types';

// ============================================================================
// Status Icons
// ============================================================================

/**
 * SVG icons for each result status using Tailwind classes and DS token inline styles.
 * Uses DS token colors for automatic theme adaptation.
 *
 * @remarks
 * - Standard statuses use Heroicons-style SVG paths
 * - Colors use DS token inline styles (--ds-color-success, --ds-color-error, etc.)
 * - HTTP statuses display large, bold status codes
 * - Icons are sized using Tailwind width/height classes
 *
 * @internal
 */
const statusIcons: Record<ResultStatus, React.ReactNode> = {
  /** Success - checkmark in circle with green color */
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" style={{ color: 'var(--ds-color-success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Error - X in circle with red color */
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" style={{ color: 'var(--ds-color-error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Info - information icon with blue color */
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" style={{ color: 'var(--ds-color-info)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Warning - triangle with exclamation with yellow/orange color */
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" style={{ color: 'var(--ds-color-warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  /** 404 - large status code with primary color */
  '404': (
    <div className="text-8xl font-bold" style={{ color: 'var(--ds-color-primary)' }}>404</div>
  ),
  /** 403 - large status code with warning color */
  '403': (
    <div className="text-8xl font-bold" style={{ color: 'var(--ds-color-warning)' }}>403</div>
  ),
  /** 500 - large status code with error color */
  '500': (
    <div className="text-8xl font-bold" style={{ color: 'var(--ds-color-error)' }}>500</div>
  ),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Result component.
 *
 * @description
 * A utility-first implementation using Tailwind CSS and DS token patterns.
 * Provides a lightweight result display with semantic color support.
 *
 * @remarks
 * **Key Features:**
 * - Pure Tailwind/DS token styling with no additional CSS
 * - Semantic color classes for theme adaptation
 * - Responsive layout with flex utilities
 * - Minimal JavaScript overhead
 *
 * **Layout Structure:**
 * ```
 * Container (flex col centered)
 * ├── Icon (mb-6)
 * ├── Title (text-2xl font-bold mb-2)
 * ├── Subtitle (var(--ds-color-text-secondary) mb-6)
 * ├── Extra (flex gap-2)
 * └── Children (max-w-lg)
 * ```
 *
 * @param props - {@link ResultProps}
 * @returns The rendered result display with Tailwind styling
 *
 * @example
 * ```tsx
 * <ModernResult
 *   status="success"
 *   title="Payment Successful"
 *   subTitle="Your order has been confirmed."
 *   extra={
 *     <Flex gap={2}>
 *       <Button variant="primary">View Order</Button>
 *       <Button>Continue Shopping</Button>
 *     </Flex>
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
        data-part="root"
        data-tone={status}
        className={`flex flex-col items-center justify-center text-center py-12 px-6 rottay-result--modern ${className}`}
        style={style}
      >
        {/* Custom icon takes precedence over the built-in status icon,
            allowing consumers to completely replace the visual indicator */}
        <div className="mb-6" data-part="icon">
          {icon || statusIcons[status!]}
        </div>

        {/* Title Section */}
        {title && (
          <h2 data-part="title" className="text-2xl font-bold mb-2" style={{ color: 'var(--ds-color-text-primary)' }}>
            {title}
          </h2>
        )}

        {/* Subtitle uses DS text-secondary token for visual hierarchy */}
        {subTitle && (
          <p data-part="description" className="mb-6 max-w-md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {subTitle}
          </p>
        )}

        {/* Extra Section (Buttons) */}
        {extra && (
          <div data-part="extra" className="flex flex-wrap gap-2 justify-center mb-6">
            {extra}
          </div>
        )}

        {/* Children Section */}
        {children && (
          <div data-part="content" className="w-full max-w-lg">
            {children}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Result.displayName = 'Result.Modern';

export default Result;
