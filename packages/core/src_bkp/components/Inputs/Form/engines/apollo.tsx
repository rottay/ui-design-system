'use client';

/**
 * Apollo Form Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type {
  FormProps,
  FormItemProps,
  FormInstance,
  FormValues,
  FormFieldError,
  FormValidateStatus,
} from '../types';
import { createFormInstance, validateField } from '../../../../types/components/form';

// Form context
interface FormContextValue<T extends FormValues = FormValues> {
  form: FormInstance<T>;
  values: T;
  errors: Map<string, string[]>;
  touched: Set<string>;
  layout: 'horizontal' | 'vertical' | 'inline';
  size: 'small' | 'middle' | 'large';
  disabled: boolean;
  colon: boolean;
  requiredMark: boolean | 'optional';
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, errors: string[]) => void;
  setFieldTouched: (name: string) => void;
  validateField: (name: string, rules: FormItemProps['rules']) => Promise<string[]>;
}

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form.Item must be used within a Form');
  }
  return context;
}

/**
 * Custom useForm hook
 */
function useForm<T extends FormValues = FormValues>(): [FormInstance<T>] {
  const [form] = useState(() => createFormInstance<T>());
  return [form];
}

/**
 * Apollo Form Component
 */
function ApolloForm<T extends FormValues = FormValues>(props: FormProps<T>) {
  const {
    layout = 'vertical',
    size = 'middle',
    initialValues,
    name,
    disabled = false,
    colon = true,
    requiredMark = true,
    form: externalForm,
    onFinish,
    onFinishFailed,
    onValuesChange,
    children,
    className = '',
    style,
    id,
    autoComplete,
  } = props;

  const [internalForm] = useState(() => externalForm ?? createFormInstance<T>());
  const [values, setValues] = useState<T>((initialValues ?? {}) as T);
  const [errors, setErrors] = useState<Map<string, string[]>>(new Map());
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      internalForm.setFieldsValue(initialValues);
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, []);

  const setFieldValue = useCallback(
    (fieldName: string, value: unknown) => {
      internalForm.setFieldValue(fieldName, value);
      const newValues = { ...values, [fieldName]: value } as T;
      setValues(newValues);
      onValuesChange?.({ [fieldName]: value } as Partial<T>, newValues);
    },
    [values, internalForm, onValuesChange]
  );

  const setFieldError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors((prev) => {
      const next = new Map(prev);
      if (fieldErrors.length > 0) {
        next.set(fieldName, fieldErrors);
      } else {
        next.delete(fieldName);
      }
      return next;
    });
  }, []);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  const validateFieldHandler = useCallback(
    async (fieldName: string, rules: FormItemProps['rules']): Promise<string[]> => {
      if (!rules) return [];
      const fieldErrors = await validateField(values[fieldName as keyof T], rules, fieldName);
      setFieldError(fieldName, fieldErrors);
      return fieldErrors;
    },
    [values, setFieldError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const allErrors: FormFieldError[] = [];
      errors.forEach((errs, fieldName) => {
        if (errs.length > 0) {
          allErrors.push({ name: fieldName, errors: errs });
        }
      });

      if (allErrors.length > 0) {
        onFinishFailed?.({ values, errorFields: allErrors, outOfDate: false });
      } else {
        onFinish?.(values);
      }
    },
    [values, errors, onFinish, onFinishFailed]
  );

  const contextValue = useMemo<FormContextValue<T>>(
    () => ({
      form: internalForm,
      values,
      errors,
      touched,
      layout,
      size,
      disabled,
      colon,
      requiredMark,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      validateField: validateFieldHandler,
    }),
    [
      internalForm,
      values,
      errors,
      touched,
      layout,
      size,
      disabled,
      colon,
      requiredMark,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      validateFieldHandler,
    ]
  );

  const formClasses = [
    'w-full',
    layout === 'inline' ? 'flex flex-wrap gap-4 items-end' : 'space-y-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <FormContext.Provider value={contextValue as FormContextValue}>
      <form
        id={id ?? name}
        name={name}
        className={formClasses}
        style={style}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

/**
 * Apollo Form.Item Component
 */
function ApolloFormItem(props: FormItemProps) {
  const {
    name,
    label,
    extra,
    help,
    hasFeedback = false,
    validateStatus: externalValidateStatus,
    rules,
    required,
    tooltip,
    initialValue,
    valuePropName = 'value',
    trigger = 'onChange',
    validateTrigger = 'onBlur',
    colon: itemColon,
    hidden = false,
    labelAlign,
    noStyle = false,
    children,
    className = '',
    style,
  } = props;

  const formContext = useFormContext();
  const {
    values,
    errors,
    layout,
    size,
    disabled,
    colon: formColon,
    requiredMark,
    setFieldValue,
    setFieldTouched,
    validateField: validateFieldHandler,
  } = formContext;

  const fieldName = Array.isArray(name) ? name.join('.') : name;
  const fieldValue = fieldName ? values[fieldName as keyof typeof values] : undefined;
  const fieldErrors = fieldName ? errors.get(fieldName) ?? [] : [];
  const showColon = itemColon ?? formColon;
  const isRequired = required ?? rules?.some((r) => r.required);

  // Determine validation status
  const validateStatus: FormValidateStatus = externalValidateStatus ??
    (fieldErrors.length > 0 ? 'error' : '');

  // Handle field change
  const handleChange = useCallback(
    (eventOrValue: unknown) => {
      if (!fieldName) return;

      let newValue: unknown;
      if (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue) {
        const target = (eventOrValue as React.ChangeEvent<HTMLInputElement>).target;
        newValue = target.type === 'checkbox' ? target.checked : target.value;
      } else {
        newValue = eventOrValue;
      }

      setFieldValue(fieldName, newValue);

      if (validateTrigger === 'onChange' || (Array.isArray(validateTrigger) && validateTrigger.includes('onChange'))) {
        validateFieldHandler(fieldName, rules);
      }
    },
    [fieldName, setFieldValue, validateTrigger, validateFieldHandler, rules]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    if (!fieldName) return;
    setFieldTouched(fieldName);

    if (validateTrigger === 'onBlur' || (Array.isArray(validateTrigger) && validateTrigger.includes('onBlur'))) {
      validateFieldHandler(fieldName, rules);
    }
  }, [fieldName, setFieldTouched, validateTrigger, validateFieldHandler, rules]);

  // Set initial value
  useEffect(() => {
    if (fieldName && initialValue !== undefined && fieldValue === undefined) {
      setFieldValue(fieldName, initialValue);
    }
  }, []);

  // Clone children with props
  const childElement = useMemo(() => {
    if (typeof children === 'function') {
      return children(formContext.form);
    }

    if (!children) return null;

    const child = children as React.ReactElement;
    if (!fieldName) return child;

    return {
      ...child,
      props: {
        ...child.props,
        [valuePropName]: fieldValue,
        [trigger]: handleChange,
        onBlur: handleBlur,
        disabled: disabled || child.props?.disabled,
        id: fieldName,
        name: fieldName,
      },
    };
  }, [children, fieldName, fieldValue, valuePropName, trigger, handleChange, handleBlur, disabled, formContext.form]);

  if (hidden) return null;

  if (noStyle) {
    return <>{childElement}</>;
  }

  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg',
  };

  const isHorizontal = layout === 'horizontal';
  const isInline = layout === 'inline';

  const itemClasses = [
    'mb-4',
    isInline ? 'flex items-end gap-2' : '',
    isHorizontal ? 'flex flex-col sm:flex-row sm:items-start gap-2' : '',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'block mb-1 font-medium text-gray-700',
    isHorizontal ? 'sm:w-32 sm:text-right sm:pt-2 sm:mb-0' : '',
    labelAlign === 'left' ? 'text-left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const errorClasses = 'mt-1 text-sm text-red-600';
  const helpClasses = 'mt-1 text-sm text-gray-500';

  return (
    <div className={itemClasses} style={style}>
      {label && (
        <label className={labelClasses} htmlFor={fieldName}>
          {requiredMark && isRequired && (
            <span className="text-red-500 mr-1">*</span>
          )}
          {label}
          {showColon && ':'}
          {tooltip && (
            <span className="ml-1 text-gray-400 cursor-help" title={String(tooltip)}>
              <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
        </label>
      )}
      <div className={isHorizontal ? 'flex-1' : 'w-full'}>
        <div className="relative">
          {childElement}
          {/* Feedback icon */}
          {hasFeedback && validateStatus && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              validateStatus === 'error' ? 'text-red-500' :
              validateStatus === 'warning' ? 'text-yellow-500' :
              validateStatus === 'success' ? 'text-green-500' :
              'text-blue-500'
            }`}>
              {validateStatus === 'validating' && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {validateStatus === 'success' && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {validateStatus === 'error' && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
          )}
        </div>
        {/* Error message */}
        {fieldErrors.length > 0 && (
          <p className={errorClasses}>{fieldErrors[0]}</p>
        )}
        {/* Help text */}
        {help && fieldErrors.length === 0 && (
          <p className={helpClasses}>{help}</p>
        )}
        {/* Extra content */}
        {extra && (
          <p className={helpClasses}>{extra}</p>
        )}
      </div>
    </div>
  );
}

// Attach Item and useForm to Form
ApolloForm.Item = ApolloFormItem;
ApolloForm.useForm = useForm;

ApolloForm.displayName = 'ApolloForm';

export default ApolloForm;
