/**
 * @fileoverview Result Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Result component.
 * A utility-first engine optimized for Tailwind CSS projects.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine in the Rottay Design System, built on
 * DaisyUI and Tailwind CSS. It provides:
 * - Lightweight implementation using utility classes
 * - Native Tailwind/DaisyUI color system integration
 * - Consistent with DaisyUI component patterns
 * - Smaller bundle size compared to Classic
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS as the primary styling solution
 * - When you prefer utility-first CSS methodology
 * - Applications already using DaisyUI components
 * - When bundle size optimization is important
 *
 * **Multi-Tenant Theming:**
 * Modern results use DaisyUI's semantic color classes (success, error,
 * info, warning) which automatically adapt to the active DaisyUI theme.
 * Tenant-specific themes can be configured via DaisyUI theme customization.
 *
 * **Tailwind Classes Used:**
 * - Layout: `flex`, `flex-col`, `items-center`, `justify-center`, `text-center`
 * - Spacing: `py-12`, `px-6`, `mb-2`, `mb-6`, `gap-2`
 * - Typography: `text-2xl`, `font-bold`, `text-8xl`
 * - Colors: `text-success`, `text-error`, `text-info`, `text-warning`, `text-primary`, `text-base-content`
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
 * @example With DaisyUI Theme
 * ```tsx
 * // In a DaisyUI themed application
 * <html data-theme="corporate">
 *   <Result engine="modern" status="success" title="Welcome!" />
 * </html>
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
 *   extra={<button className="btn btn-primary">Go Home</button>}
 * />
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link ClassicResult} - Ant Design alternative
 * @see {@link RusticResult} - Vanilla alternative
 * @see {@link https://daisyui.com} - DaisyUI documentation
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
 * SVG icons for each result status using Tailwind/DaisyUI classes.
 * Uses semantic color classes for automatic theme adaptation.
 *
 * @remarks
 * - Standard statuses use Heroicons-style SVG paths
 * - Colors use DaisyUI semantic classes (text-success, text-error, etc.)
 * - HTTP statuses display large, bold status codes
 * - Icons are sized using Tailwind width/height classes
 *
 * @internal
 */
const statusIcons: Record<ResultStatus, React.ReactNode> = {
  /** Success - checkmark in circle with green color */
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Error - X in circle with red color */
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Info - information icon with blue color */
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Warning - triangle with exclamation with yellow/orange color */
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  /** 404 - large status code with primary color */
  '404': (
    <div className="text-8xl font-bold text-primary">404</div>
  ),
  /** 403 - large status code with warning color */
  '403': (
    <div className="text-8xl font-bold text-warning">403</div>
  ),
  /** 500 - large status code with error color */
  '500': (
    <div className="text-8xl font-bold text-error">500</div>
  ),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Result component.
 *
 * @description
 * A utility-first implementation using Tailwind CSS and DaisyUI patterns.
 * Provides a lightweight result display with semantic color support.
 *
 * @remarks
 * **Key Features:**
 * - Pure Tailwind/DaisyUI styling with no additional CSS
 * - Semantic color classes for theme adaptation
 * - Responsive layout with flex utilities
 * - Minimal JavaScript overhead
 *
 * **Layout Structure:**
 * ```
 * Container (flex col centered)
 * ├── Icon (mb-6)
 * ├── Title (text-2xl font-bold mb-2)
 * ├── Subtitle (text-base-content/70 mb-6)
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
 *     <div className="flex gap-2">
 *       <button className="btn btn-primary">View Order</button>
 *       <button className="btn">Continue Shopping</button>
 *     </div>
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
        className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
        style={style}
      >
        {/* Icon Section */}
        <div className="mb-6">
          {icon || statusIcons[status!]}
        </div>

        {/* Title Section */}
        {title && (
          <h2 className="text-2xl font-bold mb-2 text-base-content">
            {title}
          </h2>
        )}

        {/* Subtitle Section */}
        {subTitle && (
          <p className="text-base-content/70 mb-6 max-w-md">
            {subTitle}
          </p>
        )}

        {/* Extra Section (Buttons) */}
        {extra && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {extra}
          </div>
        )}

        {/* Children Section */}
        {children && (
          <div className="w-full max-w-lg">
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
