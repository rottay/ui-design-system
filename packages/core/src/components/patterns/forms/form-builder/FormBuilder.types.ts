/**
 * @fileoverview Type definitions for the FormBuilder pattern component.
 * Defines `FormBuilderProps` -- the schema-driven form renderer that takes an
 * array of `FieldDef` entries and produces a complete form with layout control
 * (vertical, horizontal, grid, multi-step wizard), validation feedback,
 * controlled/uncontrolled value management, and customizable field rendering.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, FieldDef } from '../../foundation/types';

/**
 * Props for the FormBuilder pattern component.
 *
 * FormBuilder generates a complete form from a declarative field schema. It
 * supports four layout modes, optional step-based wizard navigation, and both
 * controlled and uncontrolled value patterns. The parent provides `onSubmit`
 * to receive validated form data.
 *
 * @example
 * ```tsx
 * <PatternFormBuilder
 *   layout="grid"
 *   columns={2}
 *   fields={[
 *     { name: 'firstName', label: 'First Name', type: 'text', required: true },
 *     { name: 'lastName', label: 'Last Name', type: 'text', required: true },
 *     { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 2 },
 *     { name: 'role', label: 'Role', type: 'select', options: roleOptions },
 *   ]}
 *   onSubmit={async (values) => await createUser(values)}
 *   showRequired
 *   actions={<Button type="submit">Create User</Button>}
 * />
 * ```
 */
export interface FormBuilderProps extends PatternBaseProps {
  /**
   * Array of field definitions that describe each form field. The order in
   * the array determines the visual order in the form. Each `FieldDef`
   * specifies the input type, validation rules, options, and layout hints.
   */
  fields: FieldDef[];

  /**
   * Layout mode that controls how fields are arranged.
   *
   * - `"vertical"` -- Labels above inputs, fields stacked top-to-bottom (default).
   * - `"horizontal"` -- Labels to the left of inputs, useful for dense settings forms.
   * - `"grid"` -- CSS grid layout; use `columns` to set the grid column count
   *   and `FieldDef.colSpan` to let fields span multiple columns.
   * - `"steps"` -- Multi-step wizard; fields are grouped by step boundaries
   *   defined in `stepLabels`. Requires `currentStep` and `onStepChange`.
   *
   * @default "vertical"
   */
  layout?: 'vertical' | 'horizontal' | 'grid' | 'steps';

  /**
   * Number of columns when `layout` is `"grid"`. Ignored for other layouts.
   * Individual fields can span multiple columns via `FieldDef.colSpan`.
   * @default 1
   */
  columns?: number;

  /**
   * Custom field renderer that wraps or replaces the default field output.
   * Useful for injecting tooltips, conditional formatting, or entirely custom
   * input widgets that aren't covered by the built-in field types.
   *
   * @param field         - The field definition being rendered.
   * @param defaultRender - The default rendered field ReactNode.
   * @param value         - The current value of this field.
   */
  renderField?: (field: FieldDef, defaultRender: ReactNode, value: unknown) => ReactNode;

  /**
   * Action buttons slot rendered at the bottom of the form. Typically contains
   * Submit, Cancel, and Reset buttons. The slot is rendered as-is, so the
   * parent is responsible for button layout and submit binding.
   */
  actions?: ReactNode;

  /**
   * Submit handler called with the complete form values when the form passes
   * validation. May return a Promise for async submission (the form will
   * track the pending state internally).
   */
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;

  /**
   * Called whenever field-level validation errors change. The parent can use
   * this to display an external error summary or disable navigation.
   *
   * @param errors - Map of field name to error message string.
   */
  onValidationChange?: (errors: Record<string, string>) => void;

  /**
   * Called on every field value change (keystroke, selection, toggle).
   * Useful for live previews or dependent field logic.
   *
   * @param values - The complete current form values.
   */
  onChange?: (values: Record<string, unknown>) => void;

  /**
   * Initial values for uncontrolled mode. These values seed the internal form
   * state on mount and are NOT synced after mount. For controlled mode, use
   * `values` instead.
   */
  initialValues?: Record<string, unknown>;

  /**
   * Controlled form values. When provided, the form becomes fully controlled
   * and the parent must update values via `onChange`. Takes precedence over
   * `initialValues`.
   */
  values?: Record<string, unknown>;

  /**
   * Disables all form fields and prevents submission. Visual styling
   * indicates the disabled state. Individual fields can also be disabled
   * via `FieldDef.disabled`.
   * @default false
   */
  disabled?: boolean;

  /**
   * Puts the entire form into read-only mode. Fields display their values
   * as non-editable text. Useful for review/confirmation steps.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether to render labels above or beside each field.
   * When false, fields rely on `placeholder` for context.
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to display an asterisk (*) indicator next to required field
   * labels. Only effective when `showLabels` is true.
   * @default false
   */
  showRequired?: boolean;

  /**
   * Spacing between fields. Accepts a number (pixels) or CSS string
   * (e.g. `"1rem"`). Applied as CSS `gap` in grid/flex layouts.
   */
  gap?: number | string;

  /** Form title rendered at the top of the form, above all fields. */
  title?: ReactNode;

  /** Form description rendered below the title, above the fields. */
  description?: ReactNode;

  /**
   * Step labels for wizard-style `"steps"` layout. The array length
   * determines the number of steps. Each label is shown in a step indicator
   * (e.g. stepper breadcrumb).
   */
  stepLabels?: string[];

  /**
   * Current active step index (zero-based) for the `"steps"` layout.
   * The form only renders fields belonging to this step.
   */
  currentStep?: number;

  /**
   * Called when the user navigates between steps (next/back buttons or
   * clicking a step indicator).
   *
   * @param step - The new step index (zero-based).
   */
  onStepChange?: (step: number) => void;

  /**
   * Auto-adapt layout to screen size. When true, grid and horizontal layouts
   * switch to vertical on phone, and columns/spans are capped at 2 on tablet.
   * Desktop and opt-out consumers preserve columns and spans exactly.
   * @default false
   */
  autoAdaptive?: boolean;
}
