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
      className={`ds-select-optgroup ${className}`.trim()}
      style={style}
      data-part="option-group"
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
    >
      <div data-part="group-label" aria-hidden="true">
        {label}
      </div>
      <div data-part="group-options">{clonedChildren}</div>
    </div>
  );
}

SelectOptGroup.displayName = 'Select.OptGroup';

// Mark this component as a Select option group for parent detection
SelectOptGroup.__isSelectOptGroup = true;
