'use client';

/**
 * @fileoverview FloatButton Classic Engine - Rottay Design System
 * @description Ant Design implementation of the FloatButton component.
 * Provides full-featured floating action buttons with rich animations.
 *
 * @remarks
 * The Classic engine leverages Ant Design's FloatButton component for a
 * feature-rich implementation including:
 * - Smooth animations and transitions
 * - Built-in tooltip support
 * - Badge indicators
 * - Group expansion with menu behavior
 * - BackTop with scroll tracking
 *
 * This engine is ideal for enterprise applications where Ant Design
 * is already part of the tech stack.
 *
 * @example Classic FloatButton
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Explicitly use Classic engine
 * <FloatButton engine="classic" icon={<PlusOutlined />} type="primary" />
 * ```
 *
 * @example Classic Group
 * ```tsx
 * <FloatButton.Group engine="classic" trigger="click" icon={<MenuOutlined />}>
 *   <FloatButton icon={<EditOutlined />} />
 *   <FloatButton icon={<ShareOutlined />} />
 * </FloatButton.Group>
 * ```
 *
 * @see {@link FloatButtonProps} for prop documentation
 * @see {@link https://ant.design/components/float-button} Ant Design FloatButton
 *
 * @module FloatButton/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import { FloatButton as AntFloatButton } from 'antd';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../types';

// ============================================================================
// FloatButton Classic Implementation
// ============================================================================

/**
 * FloatButton component using Ant Design.
 *
 * @description
 * Wraps Ant Design's FloatButton with Rottay's unified prop interface.
 * Provides full access to Ant Design's floating action button features.
 *
 * @remarks
 * - Full animation support
 * - Native tooltip integration
 * - Badge with count and dot variants
 * - Supports href for link behavior
 *
 * @param props - {@link FloatButtonProps}
 * @param _ref - Ref (not forwarded to Ant Design component)
 * @returns Ant Design FloatButton element
 */
export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
  (props, _ref) => {
    const {
      icon,
      description,
      tooltip,
      type,
      shape,
      onClick,
      href,
      target,
      badge,
      className,
      style,
    } = props;

    return (
      <AntFloatButton
        icon={icon}
        description={description}
        tooltip={tooltip}
        type={type}
        shape={shape}
        onClick={onClick}
        href={href}
        target={target}
        badge={badge}
        className={className}
        style={style}
      />
    );
  }
);
FloatButton.displayName = 'FloatButton.Classic';

// ============================================================================
// Group Classic Implementation
// ============================================================================

/**
 * FloatButton.Group component using Ant Design.
 *
 * @description
 * Wraps Ant Design's FloatButton.Group for expandable button menus.
 * Supports click and hover triggers with smooth animations.
 *
 * @remarks
 * - Expandable menu with trigger control
 * - Controlled and uncontrolled modes
 * - Custom open/close icons
 * - Smooth expand/collapse animations
 *
 * @param props - {@link FloatButtonGroupProps}
 * @param _ref - Ref (not forwarded to Ant Design component)
 * @returns Ant Design FloatButton.Group element
 */
export const Group = React.forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (props, _ref) => {
    const {
      trigger,
      open,
      onOpenChange,
      icon,
      closeIcon,
      shape,
      type,
      tooltip,
      children,
      className,
      style,
    } = props;

    return (
      <AntFloatButton.Group
        trigger={trigger}
        open={open}
        onOpenChange={onOpenChange}
        icon={icon}
        closeIcon={closeIcon}
        shape={shape}
        type={type}
        tooltip={tooltip}
        className={className}
        style={style}
      >
        {children}
      </AntFloatButton.Group>
    );
  }
);
Group.displayName = 'FloatButton.Group.Classic';

// ============================================================================
// BackTop Classic Implementation
// ============================================================================

/**
 * FloatButton.BackTop component using Ant Design.
 *
 * @description
 * Wraps Ant Design's FloatButton.BackTop for scroll-to-top functionality.
 * Automatically shows when scroll exceeds visibility threshold.
 *
 * @remarks
 * - Configurable visibility threshold
 * - Custom scroll target support
 * - Smooth scroll animation with configurable duration
 * - Full styling customization
 *
 * @param props - {@link FloatButtonBackTopProps}
 * @param _ref - Ref (not forwarded to Ant Design component)
 * @returns Ant Design FloatButton.BackTop element
 */
export const BackTop = React.forwardRef<HTMLButtonElement, FloatButtonBackTopProps>(
  (props, _ref) => {
    const {
      visibilityHeight,
      target,
      onClick,
      duration,
      icon,
      description,
      type,
      shape,
      tooltip,
      className,
      style,
    } = props;

    return (
      <AntFloatButton.BackTop
        visibilityHeight={visibilityHeight}
        target={target}
        onClick={onClick}
        duration={duration}
        icon={icon}
        description={description}
        type={type}
        shape={shape}
        tooltip={tooltip}
        className={className}
        style={style}
      />
    );
  }
);
BackTop.displayName = 'FloatButton.BackTop.Classic';

// ============================================================================
// Default Export
// ============================================================================

export default FloatButton;
