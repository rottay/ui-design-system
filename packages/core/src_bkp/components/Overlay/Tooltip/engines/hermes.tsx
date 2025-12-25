/**
 * Hermes Tooltip Engine
 *
 * DaisyUI tooltip implementation with unified TooltipProps.
 */

'use client';

import type { TooltipProps } from '../../../../types/components/tooltip';

// Map unified placement to DaisyUI data-tip position classes
const placementClasses = {
  top: 'tooltip-top',
  topLeft: 'tooltip-top',
  topRight: 'tooltip-top',
  bottom: 'tooltip-bottom',
  bottomLeft: 'tooltip-bottom',
  bottomRight: 'tooltip-bottom',
  left: 'tooltip-left',
  leftTop: 'tooltip-left',
  leftBottom: 'tooltip-left',
  right: 'tooltip-right',
  rightTop: 'tooltip-right',
  rightBottom: 'tooltip-right',
};

// Map unified color to DaisyUI color classes
const colorClasses = {
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  accent: 'tooltip-accent',
  info: 'tooltip-info',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
};

/**
 * Hermes Tooltip - DaisyUI implementation with unified TooltipProps
 */
function HermesTooltip({
  title,
  children,
  open,
  className = '',
  style,
  'aria-label': ariaLabel,
  placement = 'top',
  color,
}: TooltipProps) {
  // Don't show tooltip if there's no title
  if (!title) {
    return children;
  }

  // DaisyUI tooltip uses data-tip attribute and CSS classes
  // Map color to DaisyUI color class if it matches a semantic color
  const colorClass = color && color in colorClasses
    ? colorClasses[color as keyof typeof colorClasses]
    : '';

  const placementClass = placementClasses[placement] || placementClasses.top;

  // Build tooltip classes
  const tooltipClasses = [
    'tooltip',
    placementClass,
    colorClass,
    // Force open state if controlled
    open && 'tooltip-open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Wrap children in tooltip container
  // DaisyUI tooltip works by adding classes to a wrapper element
  return (
    <div
      className={tooltipClasses}
      data-tip={title}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

HermesTooltip.displayName = 'HermesTooltip';

export default HermesTooltip;
