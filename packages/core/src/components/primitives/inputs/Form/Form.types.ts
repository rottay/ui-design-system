/**
 * @fileoverview Form Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Form component,
 * including all props, validation rules, field data structures, and form instance API.
 *
 * **Available Types:**
 * - `FormProps` - Main form component props
 * - `FormItemProps` - Individual form field wrapper props
 * - `FormListProps` - Dynamic field list props
 * - `FormErrorListProps` - Error display component props
 * - `FormInstance` - Programmatic form control interface
 * - `FormLayout` - Layout options (horizontal, vertical, inline)
 * - `FormSize` - Size variants (small, default, large)
 * - `FormRule` - Validation rule structure
 * - `FieldData` - Field state structure
 * - `FormListFieldData` - List field metadata
 * - `FormListOperation` - List operations (add, remove, move)
 *
 * **Validation Rules:**
 * - `required` - Field must have a value
 * - `message` - Custom error message
 * - `pattern` - RegExp for format validation
 * - `min/max` - String length or number range
 * - `type` - Built-in type validation (email, url, etc.)
 * - `validator` - Custom async validation function
 *
 * @example Using Types
 * ```tsx
 * import type {
 *   FormProps,
 *   FormInstance,
 *   FormRule,
 *   FieldData
 * } from '@rottay/design-system';
 *
 * // Custom form wrapper
 * const MyForm: React.FC<FormProps<MyValues>> = (props) => {
 *   return <Form {...props} />;
 * };
 *
 * // Custom validation rules
 * const rules: FormRule[] = [
 *   { required: true, message: 'Required field' },
 *   { pattern: /^[A-Z]/, message: 'Must start with uppercase' },
 * ];
 * ```
 *
 * @example FormInstance API
 * ```tsx
 * const [form] = useForm<UserFormValues>();
 *
 * // Get/set values
 * form.getFieldValue('email');
 * form.setFieldsValue({ email: 'new@email.com' });
 *
 * // Validation
 * await form.validateFields();
 * form.getFieldError('email');
 *
 * // Reset
 * form.resetFields();
 * form.resetFields(['email', 'password']);
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link FormItem} for field wrapper
 * @see {@link useForm} for form control hook
 * @module FormTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { SizeType } from '../../../../contracts/common';

/**
 * Layout direction for the form and its fields.
 * - `horizontal` - Labels sit to the left of controls (uses `labelCol`/`wrapperCol` grid)
 * - `vertical` - Labels stack above controls (default for narrow containers)
 * - `inline` - All fields render in a single row
 */
export type FormLayout = 'horizontal' | 'vertical' | 'inline';

/**
 * Size variants for all form controls within the form.
 * Propagated to child Input, Select, DatePicker, etc. components.
 */
export type FormSize = SizeType;

/**
 * Text alignment for form field labels in horizontal layout.
 */
export type FormLabelAlign = 'left' | 'right';

/**
 * Controls how required fields are visually indicated.
 * - `true` - Show a red asterisk (*) next to required labels (default)
 * - `false` - No required mark
 * - `'optional'` - Mark optional fields instead of required ones
 */
export type FormRequiredMark = boolean | 'optional';

/**
 * Validation rule for a form field.
 * Rules are evaluated in order; the first failing rule produces the error message.
 *
 * @example
 * ```tsx
 * const rules: FormRule[] = [
 *   { required: true, message: 'Email is required' },
 *   { type: 'email', message: 'Enter a valid email' },
 *   { max: 255, message: 'Email is too long' },
 * ];
 * ```
 *
 * @example Custom async validator
 * ```tsx
 * const rules: FormRule[] = [
 *   {
 *     validator: async (_rule, value) => {
 *       const exists = await checkEmailExists(value);
 *       if (exists) throw new Error('Email already registered');
 *     },
 *   },
 * ];
 * ```
 */
export interface FormRule {
  /** Whether the field value is required. Empty strings, `undefined`, and `null` fail this check. */
  required?: boolean;
  /** Custom error message displayed when this rule fails */
  message?: string;
  /** Regular expression the value must match */
  pattern?: RegExp;
  /** Minimum value (number) or minimum length (string/array) */
  min?: number;
  /** Maximum value (number) or maximum length (string/array) */
  max?: number;
  /** Exact length the value must match */
  len?: number;
  /** Built-in type validator. Validates format without making network requests. */
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array';
  /** Custom validation function. Throw or return a rejected Promise to indicate failure. */
  validator?: (rule: FormRule, value: unknown) => Promise<void> | void;
  /** When true, validation failure produces a warning instead of blocking submission */
  warningOnly?: boolean;
  /** When true, a whitespace-only string value fails the `required` check */
  whitespace?: boolean;
}

/**
 * Represents the state of a single form field.
 * Returned by `FormInstance.getFieldsError()` and passed to `onFieldsChange`.
 */
export interface FieldData {
  /** Field path (string for simple fields, array for nested paths like `['address', 'city']`) */
  name: string | number | (string | number)[];
  /** Current field value */
  value?: unknown;
  /** Whether the user has interacted with this field */
  touched?: boolean;
  /** Whether async validation is currently running */
  validating?: boolean;
  /** List of error messages from failed validation rules */
  errors?: string[];
  /** List of warning messages from `warningOnly` rules */
  warnings?: string[];
}

/**
 * Programmatic API for controlling a form instance.
 * Obtained via the `useForm<T>()` hook and passed to `<Form form={formInstance}>`.
 *
 * @typeParam T - Shape of the form values object
 *
 * @example
 * ```tsx
 * const [form] = useForm<{ email: string; password: string }>();
 *
 * // Read a single field
 * const email = form.getFieldValue('email');
 *
 * // Batch update
 * form.setFieldsValue({ email: 'user@example.com' });
 *
 * // Validate and submit
 * const values = await form.validateFields();
 * ```
 */
export interface FormInstance<T = unknown> {
  /** Returns the current value of a single field */
  getFieldValue: (name: string | number | (string | number)[]) => unknown;
  /** Returns all (or selected) field values as the form values object */
  getFieldsValue: (nameList?: (string | number | (string | number)[])[]) => T;
  /** Sets the value of a single field */
  setFieldValue: (name: string | number | (string | number)[], value: unknown) => void;
  /** Merges partial values into the form state */
  setFieldsValue: (values: Partial<T>) => void;
  /** Resets fields to their initial values. Pass no args to reset all. */
  resetFields: (fields?: (string | number | (string | number)[])[]) => void;
  /** Validates fields and returns the values. Rejects if validation fails. */
  validateFields: (nameList?: (string | number | (string | number)[])[]) => Promise<T>;
  /** Triggers form submission (calls `onFinish` or `onFinishFailed`) */
  submit: () => void;
  /** Returns whether the user has interacted with a specific field */
  isFieldTouched: (name: string | number | (string | number)[]) => boolean;
  /** Returns whether any (or all) fields have been touched */
  isFieldsTouched: (nameList?: (string | number | (string | number))[], allFieldsTouched?: boolean) => boolean;
  /** Returns the error messages for a specific field */
  getFieldError: (name: string | number | (string | number)[]) => string[];
  /** Returns error data for all (or selected) fields */
  getFieldsError: (nameList?: (string | number | (string | number)[])[]) => FieldData[];
  /** Returns whether async validation is running for a specific field */
  isFieldValidating: (name: string | number | (string | number)[]) => boolean;
  /** Scrolls the viewport to make the given field visible */
  scrollToField: (name: string | number | (string | number)[], options?: ScrollIntoViewOptions) => void;
}

export interface FormProps<T = unknown> {
  /** Form instance from useForm */
  form?: FormInstance<T>;
  /** Initial values */
  initialValues?: Partial<T>;
  /** Form layout */
  layout?: FormLayout;
  /** Label column config for horizontal layout */
  labelCol?: { span?: number; offset?: number };
  /** Wrapper column config for horizontal layout */
  wrapperCol?: { span?: number; offset?: number };
  /** Label text alignment */
  labelAlign?: FormLabelAlign;
  /** Whether to wrap label text */
  labelWrap?: boolean;
  /** Whether to colon after label */
  colon?: boolean;
  /** Size of form controls */
  size?: FormSize;
  /** Whether to disable all form controls */
  disabled?: boolean;
  /** Required mark style */
  requiredMark?: FormRequiredMark;
  /** Validate trigger */
  validateTrigger?: string | string[];
  /** Preserve field values when field removed */
  preserve?: boolean;
  /** Whether to scroll to first error field when validate fails */
  scrollToFirstError?: boolean | ScrollIntoViewOptions;
  /** Whether to show feedback icons on all form items (can be overridden per-item) */
  hasFeedback?: boolean;
  /** Form name */
  name?: string;
  /** Callback when form values change */
  onValuesChange?: (changedValues: Partial<T>, allValues: T) => void;
  /** Callback when form fields change */
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  /** Callback when form is submitted and validated */
  onFinish?: (values: T) => void;
  /** Callback when form validation fails */
  onFinishFailed?: (errorInfo: { values: T; errorFields: FieldData[]; outOfDate: boolean }) => void;
  /** Children */
  children?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Autocomplete attribute */
  autoComplete?: 'on' | 'off';
}

export interface FormItemProps {
  /** Field name */
  name?: string | number | (string | number)[];
  /** Label text */
  label?: ReactNode;
  /** Label column config */
  labelCol?: { span?: number; offset?: number };
  /** Wrapper column config */
  wrapperCol?: { span?: number; offset?: number };
  /** Validation rules */
  rules?: FormRule[];
  /** Validate trigger */
  validateTrigger?: string | string[];
  /** Whether the field is required */
  required?: boolean;
  /** Extra text below field */
  extra?: ReactNode;
  /** Help text */
  help?: ReactNode;
  /** Validate status */
  validateStatus?: '' | 'success' | 'warning' | 'error' | 'validating';
  /** Whether to show feedback icon */
  hasFeedback?: boolean;
  /** Initial value */
  initialValue?: unknown;
  /** Whether to preserve value when field removed */
  preserve?: boolean;
  /** Whether to hide the field */
  hidden?: boolean;
  /** Whether to remove help/extra when not error */
  noStyle?: boolean;
  /** Tooltip text for label */
  tooltip?: ReactNode;
  /** Colon after label */
  colon?: boolean;
  /** Dependencies (fields to watch) */
  dependencies?: (string | number | (string | number)[])[];
  /** Get value from event */
  getValueFromEvent?: (...args: unknown[]) => unknown;
  /** Normalize value before saving */
  normalize?: (value: unknown, prevValue: unknown, allValues: unknown) => unknown;
  /** Value prop name (default: 'value') */
  valuePropName?: string;
  /** Trigger prop name (default: 'onChange') */
  trigger?: string;
  /** Children */
  children?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export interface FormListProps {
  /** Field name */
  name: string | number | (string | number)[];
  /** Validation rules */
  rules?: FormRule[];
  /** Initial value */
  initialValue?: unknown[];
  /** Children render function */
  children: (fields: FormListFieldData[], operation: FormListOperation, meta: { errors: ReactNode[]; warnings: ReactNode[] }) => ReactNode;
}

/**
 * Metadata for a single item within a dynamic form list.
 * Passed to the `FormListProps.children` render function.
 */
export interface FormListFieldData {
  /** Index of this field within the list (used as `name` for Form.Item) */
  name: number;
  /** Stable React key for this field entry */
  key: number;
  /** Always `true`; distinguishes list items from regular fields internally */
  isListField: boolean;
}

/**
 * Operations available for manipulating a dynamic form list.
 * Passed to the `FormListProps.children` render function alongside the field array.
 */
export interface FormListOperation {
  /** Appends a new entry (optionally at a specific index with a default value) */
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  /** Removes one or more entries by index */
  remove: (index: number | number[]) => void;
  /** Moves an entry from one index to another */
  move: (from: number, to: number) => void;
}

/**
 * Props for the Form.ErrorList compound component.
 * Renders a list of validation error messages for a specific field or the entire form.
 *
 * @example
 * ```tsx
 * <Form.ErrorList fieldName="email" className="mt-2" />
 * ```
 */
export interface FormErrorListProps {
  /** Field name to show errors for. Omit to display form-level errors. */
  fieldName?: string | number | (string | number)[];
  /** Error list class name */
  className?: string;
  /** Error list styles */
  style?: CSSProperties;
}

/**
 * Default values for Form component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 * @property {string} layout - Default layout direction ('horizontal')
 * @property {string} labelAlign - Default label text alignment ('right')
 * @property {boolean} colon - Show colon after labels (true)
 * @property {string} size - Default control size ('default')
 * @property {boolean} requiredMark - Show required asterisk (true)
 * @property {string} validateTrigger - Default validation event ('onChange')
 * @property {boolean} preserve - Preserve values on unmount (true)
 * @property {string} autoComplete - Browser autocomplete behavior ('on')
 */
export const FORM_DEFAULTS: Partial<FormProps> = {
  layout: 'horizontal',
  labelAlign: 'right',
  colon: true,
  size: 'default',
  requiredMark: true,
  validateTrigger: 'onChange',
  preserve: true,
  autoComplete: 'on',
};

/**
 * Default values for Form.Item component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 * @property {boolean} colon - Show colon after label (true)
 * @property {boolean} hasFeedback - Show validation icon (false)
 * @property {boolean} preserve - Preserve value on unmount (true)
 * @property {boolean} hidden - Whether the field is hidden (false)
 * @property {boolean} noStyle - Strip wrapper styling (false)
 * @property {string} valuePropName - Prop name for the child's value ('value')
 * @property {string} trigger - Prop name for the child's change event ('onChange')
 * @property {string} validateTrigger - Event that triggers validation ('onChange')
 */
export const FORM_ITEM_DEFAULTS: Partial<FormItemProps> = {
  colon: true,
  hasFeedback: false,
  preserve: true,
  hidden: false,
  noStyle: false,
  valuePropName: 'value',
  trigger: 'onChange',
  validateTrigger: 'onChange',
};
