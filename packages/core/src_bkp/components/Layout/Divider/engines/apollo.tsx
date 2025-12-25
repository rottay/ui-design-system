/**
 * Apollo Divider Engine
 *
 * Native HTML + Tailwind CSS divider implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { DividerProps } from '../../../../types/components/divider';
import { cn } from '../../../../utils/cn';

/**
 * Apollo Divider - Native HTML + Tailwind implementation
 */
function ApolloDivider({
  children,
  className,
  style,
  type = 'horizontal',
  dashed = false,
  orientation = 'center',
  orientationMargin,
  plain = false,
}: DividerProps) {
  // Vertical divider without text
  if (type === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block h-full min-h-[1em] w-px align-middle',
          dashed ? 'border-l border-dashed border-gray-300' : 'bg-gray-300',
          className
        )}
        style={style}
      />
    );
  }

  // Horizontal divider without text
  if (!children) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'my-6 h-px w-full',
          dashed ? 'border-t border-dashed border-gray-300' : 'bg-gray-300',
          className
        )}
        style={style}
      />
    );
  }

  // Horizontal divider with text
  const textClasses = cn(
    'whitespace-nowrap',
    plain ? 'text-sm text-gray-500 font-normal' : 'text-base text-gray-900 font-medium',
    plain ? 'px-2' : 'px-4'
  );

  const lineClasses = cn(
    'flex-1 h-px',
    dashed ? 'border-t border-dashed border-gray-300' : 'bg-gray-300'
  );

  // Calculate margin styles for orientation
  const getMarginStyle = () => {
    if (!orientationMargin) return {};

    const margin = typeof orientationMargin === 'number' ? `${orientationMargin}px` : orientationMargin;

    if (orientation === 'left') {
      return { marginRight: margin };
    }
    if (orientation === 'right') {
      return { marginLeft: margin };
    }
    return {};
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('flex items-center my-6 w-full', className)}
      style={style}
    >
      {/* Left line - hidden if orientation is left */}
      {orientation !== 'left' && <div className={lineClasses} />}

      {/* Text content */}
      <span className={textClasses} style={getMarginStyle()}>
        {children}
      </span>

      {/* Right line - hidden if orientation is right */}
      {orientation !== 'right' && <div className={lineClasses} />}
    </div>
  );
}

ApolloDivider.displayName = 'ApolloDivider';

export default ApolloDivider;
