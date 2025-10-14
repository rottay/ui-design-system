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
  | 'switch'
  | 'section'; // NEW: For visual grouping

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// NEW: Conditional visibility configuration
export interface FieldDependency {
  /** Field name to depend on */
  field: string;
  /** Expected value */
  value: any;
  /** Condition type */
  condition?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
}

// NEW: Custom validator function
export type CustomValidator = (
  value: any,
  allValues: Record<string, any>
) => Promise<void> | void;

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

  // NEW: Multi-column layout
  /** Number of columns this field should span (1-4) */
  colSpan?: 1 | 2 | 3 | 4;

  // NEW: Conditional visibility
  /** Simple dependency configuration */
  dependsOn?: FieldDependency;
  /** Complex visibility function */
  visibleWhen?: (values: Record<string, any>) => boolean;

  // NEW: Field dependencies
  /** Array of field names this field depends on for updates */
  dependencies?: string[];

  // NEW: Custom validation
  /** Custom validator function */
  customValidator?: CustomValidator;
  /** Validation trigger */
  validateTrigger?: 'onChange' | 'onBlur' | 'onSubmit';

  // NEW: Section-specific props
  /** Section title (for type: 'section') */
  title?: string;
  /** Section description (for type: 'section') */
  description?: string;
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

  // NEW: Multi-column layout
  /** Number of columns in the form grid (1-4) */
  columns?: 1 | 2 | 3 | 4;

  /** Gap between columns in pixels */
  columnGap?: number;

  /** Gap between rows in pixels */
  rowGap?: number;

  // NEW: Field change callback
  /** Callback when any field value changes */
  onFieldChange?: (
    changedField: string,
    value: any,
    allValues: Record<string, any>
  ) => void;
}
