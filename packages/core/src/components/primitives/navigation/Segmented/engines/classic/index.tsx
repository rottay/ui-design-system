/**
 * @fileoverview Segmented Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Segmented component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth animations on selection change
 * - Native keyboard navigation
 * - Full accessibility support
 * - RTL (Right-to-Left) support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 * - When consistent design language with Ant Design ecosystem is needed
 *
 * **Multi-Tenant Theming:**
 * Classic segmented controls inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Size Mapping:**
 * | Size | Description |
 * |------|-------------|
 * | small | Compact, suitable for toolbars |
 * | middle | Standard size (default) |
 * | large | Touch-friendly, prominent |
 *
 * @example Basic Usage
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Segmented
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Segmented
 *   engine="classic"
 *   options={['List', 'Grid', 'Calendar']}
 *   value={viewMode}
 *   onChange={setViewMode}
 * />
 * ```
 *
 * @example With Rich Options
 * ```tsx
 * <Segmented
 *   options={[
 *     { label: 'Daily', value: 'daily', icon: <CalendarOutlined /> },
 *     { label: 'Weekly', value: 'weekly', icon: <CalendarOutlined /> },
 *     { label: 'Monthly', value: 'monthly', icon: <CalendarOutlined /> },
 *   ]}
 *   value={period}
 *   onChange={setPeriod}
 *   size="large"
 *   block
 * />
 * ```
 *
 * @see {@link SegmentedProps} - Component props interface
 * @see {@link ModernSegmented} - DaisyUI alternative
 * @see {@link RusticSegmented} - Vanilla alternative
 * @see {@link https://ant.design/components/segmented} - Ant Design Segmented docs
 * @module Segmented/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Segmented as AntSegmented } from 'antd';
import type { SegmentedProps } from '../../types';
import { SEGMENTED_DEFAULTS } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Segmented component.
 *
 * @description
 * Wraps Ant Design's Segmented component with Rottay's standardized props API.
 * Provides enterprise-grade segmented control with full accessibility support.
 *
 * @remarks
 * **Key Features:**
 * - Animated selection indicator
 * - Native keyboard navigation (arrow keys)
 * - Full ARIA support
 * - ConfigProvider theme integration
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | options | options |
 * | value | value |
 * | defaultValue | defaultValue |
 * | onChange | onChange |
 * | block | block |
 * | disabled | disabled |
 * | size | size |
 *
 * @param props - {@link SegmentedProps}
 * @returns The rendered Ant Design Segmented
 *
 * @example
 * ```tsx
 * <ClassicSegmented
 *   options={['Daily', 'Weekly', 'Monthly']}
 *   value={period}
 *   onChange={(val) => setPeriod(val)}
 *   size="middle"
 *   block={false}
 * />
 * ```
 */
export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      options,
      value,
      defaultValue,
      onChange,
      block = SEGMENTED_DEFAULTS.block,
      disabled = SEGMENTED_DEFAULTS.disabled,
      size = SEGMENTED_DEFAULTS.size,
      className,
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div ref={ref} className={className} style={style}>
        <AntSegmented
          options={options}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          block={block}
          disabled={disabled}
          size={size}
        />
      </div>
    );
  }
);

// Set display name for React DevTools debugging
Segmented.displayName = 'Segmented.Classic';

export default Segmented;
