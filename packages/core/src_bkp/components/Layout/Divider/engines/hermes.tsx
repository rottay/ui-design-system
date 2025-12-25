/**
 * Hermes Divider Engine
 *
 * DaisyUI divider implementation with unified DividerProps.
 */

'use client';

import type { DividerProps } from '../../../../types/components/divider';

/**
 * Hermes Divider - DaisyUI implementation with unified DividerProps
 */
function HermesDivider({
  children,
  className = '',
  style,
  type = 'horizontal',
  orientation = 'center',
}: DividerProps) {
  // Note: DaisyUI divider is simpler - it doesn't natively support:
  // - dashed style
  // - orientationMargin
  // - plain style
  // We work with what DaisyUI provides

  // Vertical divider
  if (type === 'vertical') {
    return (
      <div
        className={`divider divider-horizontal ${className}`.trim()}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Horizontal divider with orientation support via custom classes
  const orientationClass = orientation === 'left'
    ? 'divider-start'
    : orientation === 'right'
    ? 'divider-end'
    : '';

  return (
    <div
      className={`divider ${orientationClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

HermesDivider.displayName = 'HermesDivider';

export default HermesDivider;
