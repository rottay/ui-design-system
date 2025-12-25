import React from 'react';

/**
 * Base props for Radio components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface RadioBaseProps {
  /** Current value of the radio group */
  value?: string | number;

  /** Callback when radio selection changes */
  onChange?: (value: string | number) => void;

  /** Whether the radio is disabled */
  disabled?: boolean;

  /** Additional CSS class name */
  className?: string;

  /** Name attribute for the radio group (for form submission) */
  name?: string;
}

/**
 * Extended props for Radio components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface RadioProps extends RadioBaseProps {
  /** Display direction of radio options */
  direction?: 'horizontal' | 'vertical';

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Options for the radio group */
  options?: RadioOption[];

  /** Custom render for each option (engine-specific) */
  optionRender?: (option: RadioOption) => React.ReactNode;
}

/**
 * Individual radio option structure
 */
export interface RadioOption {
  /** Display label for the option */
  label: React.ReactNode;

  /** Value for the option */
  value: string | number;

  /** Whether this option is disabled */
  disabled?: boolean;

  /** Additional CSS class for this option */
  className?: string;
}

/**
 * Props for individual Radio button (when not using RadioGroup)
 */
export interface RadioButtonProps {
  /** Whether the radio is checked */
  checked?: boolean;

  /** Value of the radio button */
  value?: string | number;

  /** Callback when radio is clicked */
  onChange?: (checked: boolean) => void;

  /** Whether the radio is disabled */
  disabled?: boolean;

  /** Label content */
  children?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Name attribute (for form submission) */
  name?: string;
}
