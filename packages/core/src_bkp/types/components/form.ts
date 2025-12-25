/**
 * Form Component Types
 *
 * Unified type definitions for the Form component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties, FormEvent } from 'react';

/**
 * Form layout type
 */
export type FormLayout = 'horizontal' | 'vertical' | 'inline';

/**
 * Form size
 */
export type FormSize = 'small' | 'middle' | 'large';

/**
 * Form label alignment
 */
export type FormLabelAlign = 'left' | 'right';

/**
 * Validation rule
 */
export interface FormRule {
  /** Whether the field is required */
  required?: boolean;
  /** Custom error message */
  message?: ReactNode;
  /** Minimum length or value */
  min?: number;
  /** Maximum length or value */
  max?: number;
  /** Field type for validation */
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'array' | 'object';
  /** Pattern for regex validation */
  pattern?: RegExp;
  /** Whitespace validation */
  whitespace?: boolean;
  /** Custom validator function */
  validator?: (rule: FormRule, value: unknown) => Promise<void>;
  /** When to trigger validation */
  validateTrigger?: string | string[];
  /** Transform value before validation */
  transform?: (value: unknown) => unknown;
  /** Length validation */
  len?: number;
  /** Enum validation */
  enum?: unknown[];
}

/**
 * Field validation status
 */
export type FormValidateStatus = 'success' | 'warning' | 'error' | 'validating' | '';

/**
 * Form field value
 */
export type FormFieldValue = unknown;

/**
 * Form values - key-value pairs
 */
export type FormValues = Record<string, FormFieldValue>;

/**
 * Form field error
 */
export interface FormFieldError {
  name: string | string[];
  errors: string[];
}

/**
 * Form instance methods
 */
export interface FormInstance<T extends FormValues = FormValues> {
  /** Get all field values */
  getFieldsValue: () => T;
  /** Get single field value */
  getFieldValue: (name: string | string[]) => unknown;
  /** Set field values */
  setFieldsValue: (values: Partial<T>) => void;
  /** Set single field value */
  setFieldValue: (name: string | string[], value: unknown) => void;
  /** Reset all fields */
  resetFields: (fields?: string[]) => void;
  /** Validate all fields */
  validateFields: (nameList?: string[]) => Promise<T>;
  /** Submit form */
  submit: () => void;
  /** Get field errors */
  getFieldsError: (nameList?: string[]) => FormFieldError[];
  /** Check if field is touched */
  isFieldTouched: (name: string | string[]) => boolean;
  /** Check if any field is touched */
  isFieldsTouched: (nameList?: string[], allFieldsTouched?: boolean) => boolean;
}

/**
 * Form.Item label col configuration
 */
export interface FormItemLabelCol {
  span?: number;
  offset?: number;
  xs?: { span?: number; offset?: number };
  sm?: { span?: number; offset?: number };
  md?: { span?: number; offset?: number };
  lg?: { span?: number; offset?: number };
  xl?: { span?: number; offset?: number };
  xxl?: { span?: number; offset?: number };
}

/**
 * Form.Item wrapper col configuration
 */
export interface FormItemWrapperCol extends FormItemLabelCol {}

/**
 * Form.Item props
 */
export interface FormItemProps {
  /** Field name */
  name?: string | string[];
  /** Label text */
  label?: ReactNode;
  /** Extra hint message below field */
  extra?: ReactNode;
  /** Help message (error or hint) */
  help?: ReactNode;
  /** Whether the field has feedback icon */
  hasFeedback?: boolean;
  /** Validation status */
  validateStatus?: FormValidateStatus;
  /** Validation rules */
  rules?: FormRule[];
  /** Whether the field is required (adds asterisk) */
  required?: boolean;
  /** Tooltip for label */
  tooltip?: ReactNode;
  /** Initial value */
  initialValue?: unknown;
  /** Value prop name (default: 'value') */
  valuePropName?: string;
  /** Change event name (default: 'onChange') */
  trigger?: string;
  /** Validation trigger event */
  validateTrigger?: string | string[];
  /** Dependencies for validation */
  dependencies?: string[];
  /** Label column configuration */
  labelCol?: FormItemLabelCol;
  /** Wrapper column configuration */
  wrapperCol?: FormItemWrapperCol;
  /** Colon after label */
  colon?: boolean;
  /** Hidden field */
  hidden?: boolean;
  /** Label alignment */
  labelAlign?: FormLabelAlign;
  /** No style wrapper */
  noStyle?: boolean;
  /** Should update (performance) */
  shouldUpdate?: boolean | ((prevValues: FormValues, curValues: FormValues) => boolean);
  /** Children */
  children?: ReactNode | ((form: FormInstance) => ReactNode);
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Base Form props
 */
export interface FormBaseProps<T extends FormValues = FormValues> {
  /** Form layout */
  layout?: FormLayout;
  /** Form size */
  size?: FormSize;
  /** Initial values */
  initialValues?: Partial<T>;
  /** Form name (for form ID) */
  name?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Colon after labels */
  colon?: boolean;
  /** Label alignment */
  labelAlign?: FormLabelAlign;
  /** Label column configuration */
  labelCol?: FormItemLabelCol;
  /** Wrapper column configuration */
  wrapperCol?: FormItemWrapperCol;
  /** Label wrap */
  labelWrap?: boolean;
  /** Require mark style */
  requiredMark?: boolean | 'optional';
  /** Scroll to first error on submit */
  scrollToFirstError?: boolean | { behavior?: 'smooth' | 'auto'; block?: 'start' | 'center' | 'end' };
  /** Preserve values when unmounted */
  preserve?: boolean;
  /** Validate messages */
  validateMessages?: Record<string, string>;
  /** Validation trigger */
  validateTrigger?: string | string[];
  /** Submit handler */
  onFinish?: (values: T) => void;
  /** Submit failed handler */
  onFinishFailed?: (errorInfo: { values: T; errorFields: FormFieldError[]; outOfDate: boolean }) => void;
  /** Field values change handler */
  onValuesChange?: (changedValues: Partial<T>, allValues: T) => void;
  /** Field change handler */
  onFieldsChange?: (changedFields: FormFieldError[], allFields: FormFieldError[]) => void;
  /** Form instance (for controlled form) */
  form?: FormInstance<T>;
  /** Children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Auto complete */
  autoComplete?: string;
}

/**
 * Full Form props
 */
export interface FormProps<T extends FormValues = FormValues> extends FormBaseProps<T> {
  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';
  /** Clear on destroy */
  clearOnDestroy?: boolean;
  /** Feedback icons */
  feedbackIcons?: (info: { status: FormValidateStatus }) => { success?: ReactNode; error?: ReactNode; warning?: ReactNode; validating?: ReactNode };
}

/**
 * Form component with Item subcomponent
 */
export interface FormComponent<T extends FormValues = FormValues>
  extends React.FC<FormProps<T>> {
  Item: React.FC<FormItemProps>;
  useForm: () => [FormInstance<T>];
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a simple form instance for uncontrolled forms
 */
export function createFormInstance<T extends FormValues = FormValues>(): FormInstance<T> {
  const values: T = {} as T;
  const errors: Map<string, string[]> = new Map();
  const touched: Set<string> = new Set();

  const getFieldKey = (name: string | string[]): string => {
    return Array.isArray(name) ? name.join('.') : name;
  };

  return {
    getFieldsValue: () => ({ ...values }),
    getFieldValue: (name) => {
      const key = getFieldKey(name);
      return values[key as keyof T];
    },
    setFieldsValue: (newValues) => {
      Object.assign(values, newValues);
    },
    setFieldValue: (name, value) => {
      const key = getFieldKey(name);
      (values as Record<string, unknown>)[key] = value;
    },
    resetFields: (fields) => {
      if (fields) {
        fields.forEach((field) => {
          delete (values as Record<string, unknown>)[field];
          errors.delete(field);
          touched.delete(field);
        });
      } else {
        Object.keys(values).forEach((key) => {
          delete (values as Record<string, unknown>)[key];
        });
        errors.clear();
        touched.clear();
      }
    },
    validateFields: async (nameList) => {
      // Simple validation - returns current values
      return Promise.resolve({ ...values });
    },
    submit: () => {
      // Trigger form submit
    },
    getFieldsError: (nameList) => {
      const result: FormFieldError[] = [];
      const keys = nameList ?? Array.from(errors.keys());
      keys.forEach((key) => {
        const fieldErrors = errors.get(key);
        if (fieldErrors) {
          result.push({ name: key, errors: fieldErrors });
        }
      });
      return result;
    },
    isFieldTouched: (name) => {
      return touched.has(getFieldKey(name));
    },
    isFieldsTouched: (nameList, allFieldsTouched = false) => {
      if (!nameList) {
        return touched.size > 0;
      }
      if (allFieldsTouched) {
        return nameList.every((name) => touched.has(name));
      }
      return nameList.some((name) => touched.has(name));
    },
  };
}

/**
 * Validate a single field value against rules
 */
export async function validateField(
  value: unknown,
  rules: FormRule[],
  fieldName: string
): Promise<string[]> {
  const errors: string[] = [];

  for (const rule of rules) {
    try {
      // Required validation
      if (rule.required) {
        if (value === undefined || value === null || value === '') {
          errors.push(String(rule.message ?? `${fieldName} is required`));
          continue;
        }
      }

      // Skip other validations if value is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type validation
      if (rule.type === 'email' && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(String(rule.message ?? 'Invalid email format'));
        }
      }

      if (rule.type === 'url' && typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          errors.push(String(rule.message ?? 'Invalid URL format'));
        }
      }

      // Min/Max validation
      if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push(String(rule.message ?? `Minimum length is ${rule.min}`));
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push(String(rule.message ?? `Maximum length is ${rule.max}`));
        }
        if (rule.len !== undefined && value.length !== rule.len) {
          errors.push(String(rule.message ?? `Length must be ${rule.len}`));
        }
      }

      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(String(rule.message ?? `Minimum value is ${rule.min}`));
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(String(rule.message ?? `Maximum value is ${rule.max}`));
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(String(rule.message ?? 'Pattern does not match'));
        }
      }

      // Whitespace validation
      if (rule.whitespace && typeof value === 'string' && value.trim() === '') {
        errors.push(String(rule.message ?? 'Cannot be only whitespace'));
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(String(rule.message ?? `Value must be one of: ${rule.enum.join(', ')}`));
      }

      // Custom validator
      if (rule.validator) {
        await rule.validator(rule, value);
      }
    } catch (e) {
      if (e instanceof Error) {
        errors.push(e.message);
      }
    }
  }

  return errors;
}
