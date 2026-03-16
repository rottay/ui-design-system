/**
 * @fileoverview Result Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Result component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Native Ant Design Result component with optimized styling
 * - Built-in status icons with professional design
 * - Consistent spacing and typography
 * - RTL (Right-to-Left) support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When native Ant Design styling is desired
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Classic results inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Status Mapping:**
 * | Status | Visual |
 * |--------|--------|
 * | success | Green checkmark circle |
 * | error | Red X circle |
 * | info | Blue info circle |
 * | warning | Yellow warning circle |
 * | 404 | Illustrated not found page |
 * | 403 | Illustrated forbidden page |
 * | 500 | Illustrated server error page |
 *
 * @example Basic Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Result status="success" title="Payment Complete!">
 *   <p>Your order has been confirmed.</p>
 * </Result>
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Result engine="classic" status="error" title="Submission Failed">
 *   <p>Please check your input and try again.</p>
 * </Result>
 * ```
 *
 * @example HTTP Status Pages
 * ```tsx
 * // 404 Page
 * <Result status="404" title="Page Not Found" subTitle="The page you're looking for doesn't exist." />
 *
 * // 403 Page
 * <Result status="403" title="Access Denied" subTitle="You don't have permission to view this page." />
 *
 * // 500 Page
 * <Result status="500" title="Server Error" subTitle="Something went wrong on our end." />
 * ```
 *
 * @see {@link ResultProps} - Component props interface
 * @see {@link ModernResult} - DaisyUI alternative
 * @see {@link RusticResult} - Vanilla alternative
 * @see {@link https://ant.design/components/result} - Ant Design Result docs
 * @module Result/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Result as AntResult } from 'antd';
import type { ResultProps, ResultStatus } from '../Result.types';
import { RESULT_DEFAULTS } from '../Result.types';

// ============================================================================
// Status Mapping
// ============================================================================

/**
 * Maps Rottay status types to Ant Design Result status types.
 * Both use identical string values, ensuring 1:1 compatibility.
 *
 * @remarks
 * Ant Design's Result component natively supports all status types
 * used in the Rottay Design System, making this a direct mapping.
 *
 * @internal
 */
const statusMap: Record<ResultStatus, 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'> = {
  /** Success status - green checkmark */
  success: 'success',
  /** Error status - red X mark */
  error: 'error',
  /** Info status - blue info icon */
  info: 'info',
  /** Warning status - yellow/orange warning */
  warning: 'warning',
  /** 404 status - page not found illustration */
  '404': '404',
  /** 403 status - access forbidden illustration */
  '403': '403',
  /** 500 status - server error illustration */
  '500': '500',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Result component.
 *
 * @description
 * Wraps Ant Design's Result component with Rottay's standardized props API.
 * Provides enterprise-grade result display with professional icons and styling.
 *
 * @remarks
 * **Key Features:**
 * - Native Ant Design styling and animations
 * - Professional status icons and HTTP error illustrations
 * - Responsive layout that adapts to container width
 * - Full accessibility support
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | status | status |
 * | icon | icon |
 * | title | title |
 * | subTitle | subTitle |
 * | extra | extra |
 * | children | children |
 *
 * @param props - {@link ResultProps}
 * @returns The rendered Ant Design Result
 *
 * @example
 * ```tsx
 * <ClassicResult
 *   status="success"
 *   title="Order Placed Successfully!"
 *   subTitle="Order number: 2024-001234"
 *   extra={[
 *     <Button key="track">Track Order</Button>,
 *     <Button key="home">Back to Home</Button>,
 *   ]}
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
      className,
      style,
    } = props;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // Wrapper div accepts the forwarded ref and consumer styles,
    // while AntResult handles its own internal layout and icon rendering
    return (
      <div ref={ref} className={className} style={style}>
        <AntResult
          status={statusMap[status!]}
          icon={icon}
          title={title}
          subTitle={subTitle}
          extra={extra}
        >
          {children}
        </AntResult>
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Result.displayName = 'Result.Classic';

export default Result;
