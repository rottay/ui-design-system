'use client';

/**
 * Titan FloatButton Engine
 *
 * Ant Design implementation with unified FloatButtonProps.
 */

import { FloatButton as AntFloatButton } from 'antd';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../../../types/components/floatbutton';

/**
 * Titan FloatButton - Ant Design implementation
 */
function TitanFloatButton({
  icon,
  description,
  tooltip,
  className,
  style,
  onClick,
  type = 'default',
  shape = 'circle',
  badge,
  href,
  target,
}: FloatButtonProps) {
  return (
    <AntFloatButton
      icon={icon}
      description={description}
      tooltip={tooltip}
      className={className}
      style={style}
      onClick={onClick}
      type={type}
      shape={shape}
      badge={badge}
      href={href}
      target={target}
    />
  );
}

TitanFloatButton.displayName = 'TitanFloatButton';

/**
 * Titan FloatButton.Group
 */
function TitanFloatButtonGroup({
  trigger,
  open,
  onOpenChange,
  icon,
  closeIcon,
  type,
  shape,
  description,
  tooltip,
  badge,
  className,
  style,
  children,
}: FloatButtonGroupProps) {
  return (
    <AntFloatButton.Group
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      icon={icon}
      closeIcon={closeIcon}
      type={type}
      shape={shape}
      description={description}
      tooltip={tooltip as any}
      badge={badge}
      className={className}
      style={style}
    >
      {children}
    </AntFloatButton.Group>
  );
}

TitanFloatButtonGroup.displayName = 'TitanFloatButtonGroup';

/**
 * Titan FloatButton.BackTop
 */
function TitanFloatButtonBackTop({
  visibilityHeight,
  target,
  duration,
  ...props
}: FloatButtonBackTopProps) {
  return (
    <AntFloatButton.BackTop
      visibilityHeight={visibilityHeight}
      target={target}
      duration={duration}
      {...props}
    />
  );
}

TitanFloatButtonBackTop.displayName = 'TitanFloatButtonBackTop';

// Attach subcomponents
TitanFloatButton.Group = TitanFloatButtonGroup;
TitanFloatButton.BackTop = TitanFloatButtonBackTop;

export default TitanFloatButton;
