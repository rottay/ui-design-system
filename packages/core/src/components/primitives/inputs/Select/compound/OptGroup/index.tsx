/**
 * @fileoverview Select.OptGroup compound component.
 * Groups related options together with a label.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface SelectOptGroupProps {
  /** Group label */
  label: string;
  /** Children (Option components) */
  children?: ReactNode;
  /** Whether the entire group is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Select.OptGroup component
 * Used to group related options together with a label.
 *
 * @example
 * ```tsx
 * <Select>
 *   <Select.OptGroup label="Fruits">
 *     <Select.Option value="apple">Apple</Select.Option>
 *     <Select.Option value="banana">Banana</Select.Option>
 *   </Select.OptGroup>
 *   <Select.OptGroup label="Vegetables">
 *     <Select.Option value="carrot">Carrot</Select.Option>
 *     <Select.Option value="broccoli">Broccoli</Select.Option>
 *   </Select.OptGroup>
 * </Select>
 * ```
 */
export function SelectOptGroup({
  label,
  children,
  disabled = false,
  className = '',
  style,
}: SelectOptGroupProps): React.ReactElement {
  const groupStyle: CSSProperties = {
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const labelStyle: CSSProperties = {
    padding: '8px 12px 4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ds-color-text-secondary, #666)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    userSelect: 'none',
  };

  const optionsStyle: CSSProperties = {
    marginBottom: '4px',
  };

  // Clone children to pass disabled prop if group is disabled
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && disabled) {
      return React.cloneElement(child as React.ReactElement<any>, {
        disabled: true,
      });
    }
    return child;
  });

  return (
    <div
      className={`rottay-select-optgroup ${disabled ? 'rottay-select-optgroup--disabled' : ''} ${className}`}
      style={groupStyle}
      data-part="option-group"
      role="group"
      aria-label={label}
      aria-disabled={disabled}
      data-disabled={disabled}
    >
      <div className="rottay-select-optgroup__label" data-part="group-label" style={labelStyle}>
        {label}
      </div>
      <div className="rottay-select-optgroup__options" style={optionsStyle}>
        {clonedChildren}
      </div>
    </div>
  );
}

SelectOptGroup.displayName = 'Select.OptGroup';

// Mark this component as a Select option group for parent detection
SelectOptGroup.__isSelectOptGroup = true;
