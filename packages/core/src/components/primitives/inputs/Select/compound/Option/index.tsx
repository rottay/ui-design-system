/**
 * @fileoverview Select.Option compound component.
 * Represents a single selectable option within a Select.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export interface SelectOptionProps {
  /** Option value */
  value: string | number;
  /** Option content/label */
  children?: ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Select.Option component
 * Used declaratively to define options within a Select component.
 *
 * @example
 * ```tsx
 * <Select>
 *   <Select.Option value="1">Option 1</Select.Option>
 *   <Select.Option value="2" disabled>Option 2 (disabled)</Select.Option>
 *   <Select.Option value="3" icon={<StarIcon />}>Option 3 with icon</Select.Option>
 * </Select>
 * ```
 */
export function SelectOption({
  value,
  children,
  disabled = false,
  icon,
  className = '',
  style,
}: SelectOptionProps): React.ReactElement {
  // This component is primarily used for declarative API
  // The actual rendering is handled by the parent Select component
  // This renders a placeholder that can be used if rendered directly
  const optionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <div
      className={`rottay-select-option ${disabled ? 'rottay-select-option--disabled' : ''} ${className}`}
      style={optionStyle}
      data-value={value}
      data-disabled={disabled}
      role="option"
      aria-disabled={disabled}
    >
      {icon && <span className="rottay-select-option__icon">{icon}</span>}
      <span className="rottay-select-option__label">{children}</span>
    </div>
  );
}

SelectOption.displayName = 'Select.Option';

// Mark this component as a Select option for parent detection
SelectOption.__isSelectOption = true;
