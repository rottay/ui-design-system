/**
 * Apollo Switch Engine
 *
 * Native HTML + Tailwind CSS switch implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { SwitchProps } from '../../../../types/components/switch';
import { cn } from '../../../../utils/cn';

const sizeStyles = {
  small: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    children: 'text-xs',
  },
  default: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    children: 'text-xs',
  },
  large: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
    children: 'text-sm',
  },
};

/**
 * Apollo Switch - Native HTML + Tailwind implementation
 */
function ApolloSwitch({
  checked,
  defaultChecked = false,
  disabled,
  onChange,
  className,
  style,
  id,
  name,
  size = 'default',
  loading,
  checkedChildren,
  unCheckedChildren,
  onClick,
  autoFocus,
  title,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const isDisabled = disabled || loading;

  const styles = sizeStyles[size] || sizeStyles.default;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    const newChecked = !isChecked;

    // Call onClick first, allow preventing change if it returns false
    if (onClick && onClick(newChecked, event) === false) {
      return;
    }

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      id={id}
      name={name}
      disabled={isDisabled}
      onClick={handleClick}
      autoFocus={autoFocus}
      title={title}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        styles.track,
        isChecked ? 'bg-blue-600' : 'bg-gray-200',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'cursor-pointer',
        className
      )}
      style={style}
    >
      {/* Track content */}
      {(checkedChildren || unCheckedChildren) && (
        <span
          className={cn(
            'absolute inset-0 flex items-center px-1',
            styles.children,
            isChecked ? 'justify-start text-white' : 'justify-end text-gray-500'
          )}
        >
          {isChecked ? checkedChildren : unCheckedChildren}
        </span>
      )}

      {/* Thumb */}
      <span
        className={cn(
          'absolute left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200',
          styles.thumb,
          isChecked && styles.translate
        )}
      >
        {loading && (
          <svg
            className="animate-spin h-full w-full text-blue-600 p-0.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

ApolloSwitch.displayName = 'ApolloSwitch';

export default ApolloSwitch;
