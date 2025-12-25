/**
 * Apollo Checkbox Engine
 *
 * Native HTML checkbox with Tailwind CSS styling.
 * Implements unified CheckboxProps interface.
 */

'use client';

import { useEffect, useRef, forwardRef } from 'react';
import type { CheckboxProps } from '../../../../types/components/checkbox';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Base checkbox styles using Tailwind CSS
 */
const baseStyles = `
  h-4 w-4 rounded border-gray-300
  text-blue-600 focus:ring-blue-500
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
  cursor-pointer
`;

/**
 * Label wrapper styles
 */
const labelStyles = `
  inline-flex items-center gap-2
  cursor-pointer
  select-none
`;

/**
 * Apollo Checkbox - Native HTML + Tailwind implementation
 */
const ApolloCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      indeterminate,
      onChange,
      children,
      className,
      style,
      value,
      name,
      id,
      autoFocus,
      tabIndex,
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const checkboxRef = (forwardedRef ?? internalRef) as React.RefObject<HTMLInputElement>;

    // Handle indeterminate state (cannot be set via HTML attribute)
    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate, checkboxRef]);

    // Handle auto focus
    useEffect(() => {
      if (autoFocus && checkboxRef.current) {
        checkboxRef.current.focus();
      }
    }, [autoFocus, checkboxRef]);

    const checkboxClasses = cn(baseStyles, className);

    // Convert value to string for HTML input compatibility
    const stringValue = value !== undefined ? String(value) : undefined;

    const checkbox = (
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        value={stringValue}
        name={name}
        id={id}
        tabIndex={tabIndex}
        className={checkboxClasses}
        style={style}
      />
    );

    // If there are children (label text), wrap in label element
    if (children) {
      return (
        <label className={cn(labelStyles, disabled && 'opacity-50 cursor-not-allowed')}>
          {checkbox}
          <span className="text-sm text-gray-700">{children}</span>
        </label>
      );
    }

    // Otherwise return standalone checkbox
    return checkbox;
  }
);

ApolloCheckbox.displayName = 'ApolloCheckbox';

export default ApolloCheckbox;
