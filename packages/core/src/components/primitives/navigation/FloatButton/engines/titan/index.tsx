'use client';

/**
 * FloatButton - Titan Engine (Ant Design)
 */
import React from 'react';
import { FloatButton as AntFloatButton } from 'antd';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../types';

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
FloatButton.displayName = 'FloatButton.Titan';

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
Group.displayName = 'FloatButton.Group.Titan';

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
BackTop.displayName = 'FloatButton.BackTop.Titan';

export default FloatButton;
