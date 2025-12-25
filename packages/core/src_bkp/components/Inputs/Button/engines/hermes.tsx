/**
 * Hermes Button Engine
 *
 * DaisyUI Button implementation with unified ButtonProps.
 */

'use client';

import type { ButtonProps } from '../../../../types/components/button';

/**
 * Maps unified button type to DaisyUI variant class
 */
function mapTypeToVariant(type?: ButtonProps['type'], danger?: boolean): string {
  if (danger) return 'btn-error';

  switch (type) {
    case 'primary':
      return 'btn-primary';
    case 'default':
      return 'btn-neutral';
    case 'dashed':
      return 'btn-secondary btn-outline';
    case 'link':
      return 'btn-link';
    case 'text':
      return 'btn-ghost';
    default:
      return 'btn-neutral';
  }
}

/**
 * Maps unified size to DaisyUI size class
 */
function mapSize(size?: ButtonProps['size']): string {
  switch (size) {
    case 'small':
      return 'btn-sm';
    case 'large':
      return 'btn-lg';
    default:
      return '';
  }
}

/**
 * Maps unified shape to DaisyUI shape class
 */
function mapShape(shape?: ButtonProps['shape']): string {
  switch (shape) {
    case 'circle':
      return 'btn-circle';
    case 'round':
      return 'rounded-full';
    default:
      return '';
  }
}

/**
 * Hermes Button - DaisyUI implementation with unified ButtonProps
 */
function HermesButton({
  type,
  size,
  loading,
  disabled,
  danger,
  ghost,
  block,
  fullWidth,
  shape,
  icon,
  children,
  onClick,
  className = '',
  htmlType = 'button',
}: ButtonProps) {
  const variantClass = ghost ? 'btn-outline' : mapTypeToVariant(type, danger);
  const sizeClass = mapSize(size);
  const shapeClass = mapShape(shape);
  const wideClass = (block || fullWidth) ? 'btn-wide w-full' : '';

  const classes = [
    'btn',
    variantClass,
    sizeClass,
    shapeClass,
    wideClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={htmlType}
      className={classes}
      onClick={onClick}
      disabled={disabled || (loading === true)}
    >
      {loading === true && <span className="loading loading-spinner" />}
      {icon}
      {children}
    </button>
  );
}

HermesButton.displayName = 'HermesButton';

export default HermesButton;
