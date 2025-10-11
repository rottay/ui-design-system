import type { FormInstance, Rule } from 'antd/es/form';

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'switch';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  rules?: Rule[];
  options?: SelectOption[]; // For select/radio/checkbox
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
  tooltip?: string;
}

export interface FormBuilderProps {
  /** Form fields configuration */
  fields: FormField[];

  /** Form instance */
  form?: FormInstance;

  /** Initial values */
  initialValues?: Record<string, any>;

  /** Submit button text */
  submitText?: string;

  /** Show submit button */
  showSubmit?: boolean;

  /** Show reset button */
  showReset?: boolean;

  /** Reset button text */
  resetText?: string;

  /** Loading state */
  loading?: boolean;

  /** Callback when form is submitted */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;

  /** Form layout */
  layout?: 'horizontal' | 'vertical' | 'inline';

  /** Label column span (for horizontal layout) */
  labelCol?: { span: number };

  /** Wrapper column span (for horizontal layout) */
  wrapperCol?: { span: number };
}
