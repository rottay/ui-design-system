/**
 * Switch Component Types
 *
 * Unified type definitions for Switch component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface SwitchBaseProps {
  // State management
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;

  // Interaction
  disabled?: boolean;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface SwitchProps extends SwitchBaseProps {
  // Size variants (titan, apollo support; hermes limited)
  size?: 'small' | 'default' | 'large';

  // Loading state (titan primary support)
  loading?: boolean;

  // Labels for checked/unchecked states (titan primary support)
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;

  // Custom handlers - simplified to avoid event type issues across engines
  onClick?: (checked: boolean, event: React.MouseEvent) => void | boolean;

  // Auto focus
  autoFocus?: boolean;

  // Custom title for tooltip/hover
  title?: string;
}

/**
 * Type guard to check if switch is controlled
 */
export function isControlledSwitch(props: SwitchProps): boolean {
  return props.checked !== undefined;
}

/**
 * Type guard to check if switch is uncontrolled
 */
export function isUncontrolledSwitch(props: SwitchProps): boolean {
  return props.checked === undefined && props.defaultChecked !== undefined;
}
