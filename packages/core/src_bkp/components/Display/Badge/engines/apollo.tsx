/**
 * Apollo Badge Engine
 *
 * Native HTML + Tailwind CSS badge implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { BadgeProps, BadgeStatus } from '../../../../types/components/badge';
import { cn } from '../../../../utils/cn';
import { getDisplayCount } from '../../../../types/components/badge';

// Status color mappings for Tailwind classes
const statusColorClasses: Record<BadgeStatus, string> = {
  success: 'bg-green-500',
  processing: 'bg-blue-500',
  default: 'bg-gray-400',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
};

// Status text color classes
const statusTextClasses: Record<BadgeStatus, string> = {
  success: 'text-green-500',
  processing: 'text-blue-500',
  default: 'text-gray-400',
  error: 'text-red-500',
  warning: 'text-yellow-500',
};

const sizeStyles = {
  small: {
    badge: 'min-w-[16px] h-4 text-[10px] px-1',
    dot: 'w-1.5 h-1.5',
  },
  default: {
    badge: 'min-w-[20px] h-5 text-xs px-1.5',
    dot: 'w-2 h-2',
  },
};

/**
 * Apollo Badge - Native HTML + Tailwind implementation
 */
function ApolloBadge({
  children,
  text,
  className,
  style,
  color,
  status = 'default',
  count,
  showZero = false,
  overflowCount = 99,
  dot = false,
  size = 'default',
  offset,
  title,
}: BadgeProps) {
  const styles = sizeStyles[size] || sizeStyles.default;

  // Determine if badge should be shown
  const shouldShowBadge = () => {
    if (dot) return true;
    if (count === undefined || count === null) return false;
    const numCount = typeof count === 'number' ? count : 0;
    return numCount > 0 || showZero;
  };

  // Get badge color class
  const getBadgeColorClass = () => {
    if (color) {
      // Custom color via inline style
      return '';
    }
    return statusColorClasses[status] || statusColorClasses.default;
  };

  // Get custom color style
  const getCustomColorStyle = () => {
    if (color) {
      return { backgroundColor: color };
    }
    return {};
  };

  // Calculate offset positioning
  const getOffsetStyle = () => {
    if (!offset) return {};
    return {
      transform: `translate(${offset[0]}px, ${offset[1]}px)`,
    };
  };

  // Render standalone badge (no children)
  if (!children) {
    // Standalone status badge with text
    if (text) {
      return (
        <span className={cn('inline-flex items-center gap-1.5', className)} style={style} title={title}>
          <span
            className={cn(
              'inline-block rounded-full',
              styles.dot,
              getBadgeColorClass()
            )}
            style={getCustomColorStyle()}
          />
          <span className={cn('text-sm', statusTextClasses[status])}>{text}</span>
        </span>
      );
    }

    // Standalone count badge
    if (shouldShowBadge() && !dot) {
      const displayCount =
        typeof count === 'number' ? getDisplayCount(count, overflowCount) : count;

      return (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full font-medium',
            styles.badge,
            getBadgeColorClass(),
            'text-white',
            className
          )}
          style={{ ...getCustomColorStyle(), ...style }}
          title={title}
        >
          {displayCount}
        </span>
      );
    }

    // Standalone dot badge
    if (dot) {
      return (
        <span
          className={cn(
            'inline-block rounded-full',
            styles.dot,
            getBadgeColorClass(),
            className
          )}
          style={{ ...getCustomColorStyle(), ...style }}
          title={title}
        />
      );
    }

    return null;
  }

  // Render badge with children (wrapper mode)
  return (
    <span className={cn('relative inline-block', className)} style={style}>
      {children}
      {shouldShowBadge() && (
        <span
          className={cn(
            'absolute top-0 right-0 flex items-center justify-center rounded-full transform translate-x-1/2 -translate-y-1/2',
            dot ? styles.dot : cn(styles.badge, 'text-white font-medium'),
            getBadgeColorClass()
          )}
          style={{
            ...getCustomColorStyle(),
            ...getOffsetStyle(),
          }}
          title={title}
        >
          {!dot && (
            <>
              {typeof count === 'number' ? getDisplayCount(count, overflowCount) : count}
            </>
          )}
        </span>
      )}
    </span>
  );
}

ApolloBadge.displayName = 'ApolloBadge';

export default ApolloBadge;
