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
import type { SizeType } from '../../../../../types/common';

export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type FormSize = SizeType;
export type FormLabelAlign = 'left' | 'right';
export type FormRequiredMark = boolean | 'optional';

export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  len?: number;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array';
  validator?: (rule: FormRule, value: unknown) => Promise<void> | void;
  warningOnly?: boolean;
  whitespace?: boolean;
}

export interface FieldData {
  name: string | number | (string | number)[];
  value?: unknown;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface FormInstance<T = unknown> {
  getFieldValue: (name: string | number | (string | number)[]) => unknown;
  getFieldsValue: (nameList?: (string | number | (string | number)[])[]) => T;
  setFieldValue: (name: string | number | (string | number)[], value: unknown) => void;
  setFieldsValue: (values: Partial<T>) => void;
  resetFields: (fields?: (string | number | (string | number)[])[]) => void;
  validateFields: (nameList?: (string | number | (string | number)[])[]) => Promise<T>;
  submit: () => void;
  isFieldTouched: (name: string | number | (string | number)[]) => boolean;
  isFieldsTouched: (nameList?: (string | number | (string | number))[], allFieldsTouched?: boolean) => boolean;
  getFieldError: (name: string | number | (string | number)[]) => string[];
  getFieldsError: (nameList?: (string | number | (string | number)[])[]) => FieldData[];
  isFieldValidating: (name: string | number | (string | number)[]) => boolean;
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

export interface FormListFieldData {
  name: number;
  key: number;
  isListField: boolean;
}

export interface FormListOperation {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface FormErrorListProps {
  /** Field name to show errors for */
  fieldName?: string | number | (string | number)[];
  /** Error list class name */
  className?: string;
  /** Error list styles */
  style?: CSSProperties;
}

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
