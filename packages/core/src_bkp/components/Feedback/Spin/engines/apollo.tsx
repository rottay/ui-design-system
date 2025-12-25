/**
 * Apollo Spin Engine
 *
 * Native HTML + Tailwind CSS spin implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useEffect, useState } from 'react';
import type { SpinProps } from '../../../../types/components/spin';
import { cn } from '../../../../utils/cn';

const sizeStyles = {
  small: {
    spinner: 'w-4 h-4 border-2',
    container: 'text-sm',
  },
  default: {
    spinner: 'w-8 h-8 border-2',
    container: 'text-base',
  },
  large: {
    spinner: 'w-12 h-12 border-3',
    container: 'text-lg',
  },
};

/**
 * Default spinning indicator - circular spinner
 */
function DefaultIndicator({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const styles = sizeStyles[size] || sizeStyles.default;

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-blue-600 border-t-transparent',
        styles.spinner
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Apollo Spin - Native HTML + Tailwind implementation
 */
function ApolloSpin({
  spinning = true,
  size = 'default',
  tip,
  delay,
  indicator,
  children,
  className,
  style,
  fullscreen,
  wrapperClassName,
}: SpinProps) {
  const [showSpinner, setShowSpinner] = useState(!delay);

  // Handle delay before showing spinner
  useEffect(() => {
    if (!spinning) {
      setShowSpinner(false);
      return;
    }

    if (delay) {
      const timer = setTimeout(() => {
        setShowSpinner(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShowSpinner(true);
    }
  }, [spinning, delay]);

  const styles = sizeStyles[size] || sizeStyles.default;
  const spinnerElement = indicator ? indicator : <DefaultIndicator size={size} />;

  // Fullscreen mode
  if (fullscreen && showSpinner) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
          className
        )}
        style={style}
      >
        <div className="flex flex-col items-center gap-3">
          {spinnerElement}
          {tip && <div className={cn('text-gray-600', styles.container)}>{tip}</div>}
        </div>
      </div>
    );
  }

  // Wrapping content mode
  if (children) {
    return (
      <div
        className={cn('relative', wrapperClassName)}
        style={style}
      >
        {showSpinner && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60">
            <div className="flex flex-col items-center gap-2">
              {spinnerElement}
              {tip && <div className={cn('text-gray-600', styles.container)}>{tip}</div>}
            </div>
          </div>
        )}
        <div className={cn(showSpinner && 'pointer-events-none blur-sm', className)}>
          {children}
        </div>
      </div>
    );
  }

  // Standalone spinner mode
  if (!showSpinner) {
    return null;
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-2', className)}
      style={style}
    >
      {spinnerElement}
      {tip && <div className={cn('text-gray-600', styles.container)}>{tip}</div>}
    </div>
  );
}

ApolloSpin.displayName = 'ApolloSpin';

export default ApolloSpin;
