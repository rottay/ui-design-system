'use client';

/**
 * Segmented - Base Component (Vanilla HTML/CSS)
 */
import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../types';
import { SEGMENTED_DEFAULTS } from '../types';

const styles = {
  container: {
    display: 'inline-flex',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    padding: '2px',
  } as React.CSSProperties,
  containerBlock: {
    display: 'flex',
    width: '100%',
  } as React.CSSProperties,
  button: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  } as React.CSSProperties,
  buttonSmall: { padding: '4px 8px', fontSize: '12px' },
  buttonMiddle: { padding: '6px 12px', fontSize: '14px' },
  buttonLarge: { padding: '8px 16px', fontSize: '16px' },
  buttonActive: {
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#1677ff',
    fontWeight: 500,
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

export const BaseSegmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      block = SEGMENTED_DEFAULTS.block,
      disabled = SEGMENTED_DEFAULTS.disabled,
      size = SEGMENTED_DEFAULTS.size,
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;

    const normalizedOptions: SegmentedOption[] = options.map((opt) =>
      typeof opt === 'object' ? opt : { label: opt, value: opt }
    );

    const handleClick = (optValue: string | number) => {
      if (disabled) return;
      if (value === undefined) setInternalValue(optValue);
      onChange?.(optValue);
    };

    const sizeStyles = size === 'small' ? styles.buttonSmall : size === 'large' ? styles.buttonLarge : styles.buttonMiddle;

    return (
      <div
        ref={ref}
        className={className}
        style={{ ...styles.container, ...(block ? styles.containerBlock : {}), ...style }}
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              style={{
                ...styles.button,
                ...sizeStyles,
                ...(isActive ? styles.buttonActive : {}),
                ...(isDisabled ? styles.buttonDisabled : {}),
              }}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
);

BaseSegmented.displayName = 'BaseSegmented';

export default BaseSegmented;
