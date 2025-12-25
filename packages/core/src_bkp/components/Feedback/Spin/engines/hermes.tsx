/**
 * Hermes Spin Engine
 *
 * DaisyUI loading implementation with unified SpinProps.
 */

'use client';

import { useEffect, useState } from 'react';
import type { SpinProps } from '../../../../types/components/spin';

// Map unified size to DaisyUI size classes
const sizeClasses = {
  small: 'loading-sm',
  default: 'loading-md',
  large: 'loading-lg',
};

/**
 * Hermes Spin - DaisyUI implementation with unified SpinProps
 */
function HermesSpin({
  spinning = true,
  size = 'default',
  tip,
  delay,
  indicator,
  children,
  className = '',
  style,
  fullscreen,
  wrapperClassName = '',
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

  const sizeClass = sizeClasses[size] || sizeClasses.default;

  // Default DaisyUI spinner (or custom indicator)
  const spinnerElement = indicator ? indicator : (
    <span
      className={`loading loading-spinner ${sizeClass}`}
      role="status"
      aria-label="Loading"
    />
  );

  // Fullscreen mode
  if (fullscreen && showSpinner) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100/80 backdrop-blur-sm ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-3">
          {spinnerElement}
          {tip && <div className="text-base-content">{tip}</div>}
        </div>
      </div>
    );
  }

  // Wrapping content mode
  if (children) {
    return (
      <div
        className={`relative ${wrapperClassName}`}
        style={style}
      >
        {showSpinner && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-100/60">
            <div className="flex flex-col items-center gap-2">
              {spinnerElement}
              {tip && <div className="text-base-content text-sm">{tip}</div>}
            </div>
          </div>
        )}
        <div className={showSpinner ? `pointer-events-none opacity-50 ${className}` : className}>
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
      className={`flex flex-col items-center gap-2 ${className}`}
      style={style}
    >
      {spinnerElement}
      {tip && <div className="text-base-content text-sm">{tip}</div>}
    </div>
  );
}

HermesSpin.displayName = 'HermesSpin';

export default HermesSpin;
