/**
 * @fileoverview Common contracts - Rottay Design System
 * @description Shared low-level type building blocks (Size, Variant, Shape,
 * BaseComponentProps, and mixin interfaces) reused across all component contracts.
 *
 * @remarks
 * These types are intentionally generic and library-agnostic. If a type only
 * applies to one component family, it belongs next to that family instead.
 *
 * Mixin interfaces (LoadableProps, DisableableProps, ClickableProps, etc.) can
 * be composed via intersection to build component prop types without repeating
 * common fields like `loading`, `disabled`, or `onChange`.
 *
 * @module Contracts/Common
 * @category Types
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
/** Standard size scale used across all DS components. */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Ant Design-compatible size vocabulary used by a few engine bindings. */
export type SizeType = 'small' | 'middle' | 'large' | 'default';

/** Status types for form control validation states. */
export type StatusType = '' | 'error' | 'warning';

/** Semantic color variants available system-wide. */
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';

/** Shape options for components that support geometric variants. */
export type Shape = 'circle' | 'square' | 'rounded';

/** Interaction states that drive visual feedback on interactive elements. */
export type InteractionState = 'idle' | 'hover' | 'active' | 'focus' | 'disabled';

/** Layout direction for flex/stack containers. */
export type Direction = 'horizontal' | 'vertical';

/** Alignment options for content within containers. */
export type Alignment = 'start' | 'center' | 'end';

/**
 * Base props inherited by most DS components.
 *
 * Keeping these centralized avoids dozens of tiny `className/style/id`
 * redefinitions across component-specific prop files.
 */
export interface BaseComponentProps {
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Element ID */
  id?: string;
  /** Data attribute for testing */
  'data-testid'?: string;
  /** Accessible label for non-textual or landmark-style containers */
  'aria-label'?: string;
  /** Accessible description relationship for richer semantics */
  'aria-describedby'?: string;
}

/** Mixin for components that support loading states. */
export interface LoadableProps {
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Alternative text displayed during loading */
  loadingText?: string;
}

/** Mixin for components that support disabled states. */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/** Mixin for components that accept children. */
export interface WithChildren {
  children?: ReactNode;
}

/** Mixin for components that support click interaction. */
export interface ClickableProps {
  /** Whether the component is clickable */
  clickable?: boolean;
  /** Click event callback */
  onClick?: () => void;
}

/** Mixin for components that display error states. */
export interface ErrorableProps {
  /** Whether the component has an error */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/** Mixin for components with label and helper text. */
export interface LabeledProps {
  /** Field label */
  label?: string;
  /** Helper/description text below the field */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
}

/** Mixin for components with placeholder text. */
export interface PlaceholderProps {
  /** Placeholder text shown when empty */
  placeholder?: string;
}

/**
 * Generic controlled/uncontrolled value contract.
 *
 * Components can specialize `T` when their value is not a string.
 */
export interface ControlledProps<T = string> {
  /** Current value (controlled) */
  value?: T;
  /** Default value (uncontrolled) */
  defaultValue?: T;
  /** Callback when the value changes */
  onChange?: (value: T) => void;
}

/** Mixin for components that support clearing their value. */
export interface ClearableProps {
  /** Whether the component shows a clear/reset control */
  clearable?: boolean;
  /** Callback when the value is cleared */
  onClear?: () => void;
}

/** Mixin for components that display an icon. */
export interface IconProps {
  /** Icon element to render */
  icon?: ReactNode;
  /** Icon placement relative to content */
  iconPosition?: 'start' | 'end';
}

/** Mixin for components that support a visible border. */
export interface BorderedProps {
  /** Whether to render a border */
  bordered?: boolean;
}

/** Mixin for components that support a box shadow. */
export interface ShadowedProps {
  /** Whether to render a shadow */
  shadowed?: boolean;
}

/** Absolute positioning options for overlay elements (tooltips, badges, etc.). */
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-center'
  | 'right-center'
  | 'center';

/** Spacing density presets that control padding and gaps globally. */
export type Density = 'compact' | 'normal' | 'comfortable';

/** Semantic color token names available for component theming. */
export type ColorToken =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
