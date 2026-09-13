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
  // Declarative API: the parent Select renders options; this is the standalone rendering.
  return (
    <div
      className={`ds-select-option ${className}`.trim()}
      style={style}
      data-part="option"
      data-value={value}
      data-disabled={disabled || undefined}
      role="option"
      aria-selected={false}
      aria-disabled={disabled || undefined}
    >
      {icon && <span data-part="option-icon">{icon}</span>}
      <span data-part="option-label">{children}</span>
    </div>
  );
}

SelectOption.displayName = 'Select.Option';

// Mark this component as a Select option for parent detection
SelectOption.__isSelectOption = true;
