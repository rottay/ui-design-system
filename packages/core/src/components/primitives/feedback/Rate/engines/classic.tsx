/**
 * @fileoverview Rate Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Rate component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Native Ant Design Rate component
 * - Smooth hover and selection animations
 * - Full keyboard navigation support
 * - RTL (Right-to-Left) support
 * - Custom character rendering
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 * - When you need maximum accessibility features
 *
 * **Multi-Tenant Theming:**
 * Classic rates inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Size Mapping:**
 * | Size | Font Size |
 * |------|-----------|
 * | xs | 16px |
 * | sm | 20px |
 * | md | 24px |
 * | lg | 32px |
 * | xl | 40px |
 *
 * @example Basic Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Rate defaultValue={3} allowHalf />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Rate engine="classic" defaultValue={3}>
 *   {/* Explicitly using Classic engine *\/}
 * </Rate>
 * ```
 *
 * @example With Custom Character
 * ```tsx
 * import { HeartOutlined } from '@ant-design/icons';
 *
 * <Rate
 *   character={<HeartOutlined />}
 *   defaultValue={3}
 *   allowHalf
 * />
 * ```
 *
 * @example With Tooltips
 * ```tsx
 * <Rate
 *   tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
 *   defaultValue={3}
 * />
 * ```
 *
 * @see {@link RateProps} - Component props interface
 * @see {@link ModernRate} - DaisyUI alternative
 * @see {@link RusticRate} - Vanilla alternative
 * @see {@link https://ant.design/components/rate} - Ant Design Rate docs
 * @module Rate/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Rate as AntRate } from 'antd';
import type { RateProps } from '../Rate.types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../Rate.types';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map design system sizes to Ant Design font sizes.
 * Ant Design Rate uses fontSize for star sizing.
 *
 * @internal
 * @param size - The design system size preset
 * @returns CSS properties with fontSize set
 */
const getSizeStyle = (size: RateProps['size']): React.CSSProperties => {
  const sizeValue = RATE_SIZE_MAP[size || 'md'];
  return {
    fontSize: `${sizeValue}px`,
  };
};

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Rate component.
 *
 * @description
 * Wraps Ant Design's Rate component with Rottay's standardized props API.
 * Provides enterprise-grade rating functionality with full accessibility support.
 *
 * @remarks
 * **Key Features:**
 * - Native Ant Design Rate with all features
 * - Smooth transitions and hover effects
 * - Full keyboard navigation (Arrow, Home, End)
 * - Screen reader support
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | value | value |
 * | defaultValue | defaultValue |
 * | count | count |
 * | allowHalf | allowHalf |
 * | allowClear | allowClear |
 * | disabled | disabled |
 * | readOnly | disabled (combined) |
 * | character | character |
 * | tooltips | tooltips |
 * | keyboard | keyboard |
 * | direction | direction |
 *
 * @param props - {@link RateProps}
 * @param ref - Forwarded ref to the Ant Design Rate element
 * @returns The rendered Ant Design Rate component
 *
 * @example
 * ```tsx
 * <ClassicRate
 *   defaultValue={3}
 *   allowHalf
 *   count={5}
 *   tooltips={['1 star', '2 stars', '3 stars', '4 stars', '5 stars']}
 *   onChange={(value) => console.log('Selected:', value)}
 * />
 * ```
 */
export const Rate = React.forwardRef<HTMLUListElement, RateProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      readOnly,
      onChange,
      onHoverChange,
      character,
      className = '',
      style,
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
      size = RATE_DEFAULTS.size,
      activeColor,
      inactiveColor,
      direction,
      // Omit props not supported by Ant Design
      engine: _engine,
      // Omit HTML props that conflict with Ant Design Rate
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...restProps
    } = props;

    // Suppress unused variable warnings - restProps may contain HTML attrs
    // that conflict with Ant Design's Rate API, so we discard them safely
    void restProps;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    // Combine size styles with custom styles and colors.
    // activeColor is injected as a CSS variable to override Ant Design's
    // internal star color without needing ConfigProvider theme changes.
    const combinedStyle: React.CSSProperties = {
      ...getSizeStyle(size),
      ...(activeColor && { '--ant-rate-star-color': activeColor } as React.CSSProperties),
      ...style,
    };

    // Custom root class provides BEM-style hooks so consumers can target
    // specific states (disabled/readonly) without inspecting Ant internals
    const rootClassName = `rottay-rate rottay-rate--${size} ${disabled ? 'rottay-rate--disabled' : ''} ${readOnly ? 'rottay-rate--readonly' : ''} ${className}`.trim();

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <AntRate
        ref={ref as any}
        value={value}
        defaultValue={defaultValue}
        count={count}
        allowHalf={allowHalf}
        allowClear={allowClear}
        // Ant Design has no readOnly prop, so we merge both into disabled.
        // Visual distinction between disabled and readOnly is handled via CSS classes above.
        disabled={disabled || readOnly}
        onChange={onChange}
        onHoverChange={onHoverChange}
        character={character as any}
        className={rootClassName}
        style={combinedStyle}
        tooltips={tooltips}
        autoFocus={autoFocus}
        keyboard={keyboard}
        direction={direction}
      />
    );
  }
);

// Set display name for React DevTools debugging
Rate.displayName = 'Rate.Classic';

export default Rate;
