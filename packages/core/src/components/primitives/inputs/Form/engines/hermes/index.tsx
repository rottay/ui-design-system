'use client';

/**
 * Form - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useImperativeHandle } from 'react';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance, FormRule, FieldData } from '../../types';

// Form Context
interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, errors: string[]) => void;
  setTouched: (name: string, touched: boolean) => void;
  registerField: (name: string, initialValue?: unknown) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  colon?: boolean;
  requiredMark?: boolean | 'optional';
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
}

const FormContext = createContext<FormContextValue | null>(null);

// useForm hook
export function useForm<T = unknown>(): [FormInstance<T>] {
  const valuesRef = useRef<Record<string, unknown>>({});
  const errorsRef = useRef<Record<string, string[]>>({});
  const touchedRef = useRef<Record<string, boolean>>({});
  const listenersRef = useRef<Set<() => void>>(new Set());

  const instance = useMemo<FormInstance<T>>(() => ({
    getFieldValue: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return valuesRef.current[key];
    },
    getFieldsValue: (nameList) => {
      if (!nameList) return valuesRef.current as T;
      const result: Record<string, unknown> = {};
      nameList.forEach((name) => {
        const key = Array.isArray(name) ? name.join('.') : String(name);
        result[key] = valuesRef.current[key];
      });
      return result as T;
    },
    setFieldValue: (name, value) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      valuesRef.current[key] = value;
      listenersRef.current.forEach((fn) => fn());
    },
    setFieldsValue: (values) => {
      Object.assign(valuesRef.current, values);
      listenersRef.current.forEach((fn) => fn());
    },
    resetFields: (fields) => {
      if (fields) {
        fields.forEach((name) => {
          const key = Array.isArray(name) ? name.join('.') : String(name);
          delete valuesRef.current[key];
          delete errorsRef.current[key];
          delete touchedRef.current[key];
        });
      } else {
        valuesRef.current = {};
        errorsRef.current = {};
        touchedRef.current = {};
      }
      listenersRef.current.forEach((fn) => fn());
    },
    validateFields: async () => {
      return valuesRef.current as T;
    },
    submit: () => {
      // Trigger form submit
    },
    isFieldTouched: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return !!touchedRef.current[key];
    },
    isFieldsTouched: () => Object.values(touchedRef.current).some(Boolean),
    getFieldError: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return errorsRef.current[key] || [];
    },
    getFieldsError: () => {
      return Object.entries(errorsRef.current).map(([name, errors]) => ({
        name,
        errors,
      })) as FieldData[];
    },
    isFieldValidating: () => false,
    scrollToField: () => {},
  }), []);

  return [instance];
}

// Form component
const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const {
    form,
    initialValues = {},
    layout = 'vertical',
    colon = true,
    size = 'default',
    disabled = false,
    requiredMark = true,
    name,
    onValuesChange,
    onFinish,
    onFinishFailed,
    children,
    className = '',
    style,
    autoComplete = 'on',
  } = props;

  const [values, setValues] = useState<Record<string, unknown>>(initialValues as Record<string, unknown>);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((fieldName: string, value: unknown) => {
    setValues((prev) => {
      const newValues = { ...prev, [fieldName]: value };
      onValuesChange?.({ [fieldName]: value } as Partial<unknown>, newValues as unknown);
      return newValues;
    });
  }, [onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors }));
  }, []);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const registerField = useCallback((fieldName: string, initialValue?: unknown) => {
    if (initialValue !== undefined && values[fieldName] === undefined) {
      setValues((prev) => ({ ...prev, [fieldName]: initialValue }));
    }
  }, [values]);

  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];

    const value = values[fieldName];
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(rule.message || `${fieldName} is required`);
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        fieldErrors.push(rule.message || `${fieldName} must be at least ${rule.min} characters`);
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        fieldErrors.push(rule.message || `${fieldName} must be at most ${rule.max} characters`);
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || `${fieldName} format is invalid`);
      }
      if (rule.validator) {
        try {
          await rule.validator(rule, value);
        } catch (e) {
          fieldErrors.push(rule.message || String(e));
        }
      }
    }

    setError(fieldName, fieldErrors);
    return fieldErrors;
  }, [values, setError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const allErrors: FieldData[] = [];
    for (const [fieldName, fieldErrors] of Object.entries(errors)) {
      if (fieldErrors.length > 0) {
        allErrors.push({ name: fieldName, errors: fieldErrors });
      }
    }

    if (allErrors.length > 0) {
      onFinishFailed?.({ values: values as unknown, errorFields: allErrors, outOfDate: false });
    } else {
      onFinish?.(values as unknown);
    }
  };

  const contextValue = useMemo<FormContextValue>(() => ({
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched: setFieldTouched,
    registerField,
    layout,
    size: size === 'middle' ? 'default' : size,
    disabled,
    colon,
    requiredMark,
    validateField,
  }), [values, errors, touched, setValue, setError, setFieldTouched, registerField, layout, size, disabled, colon, requiredMark, validateField]);

  useImperativeHandle(ref, () => form as FormInstance, [form]);

  const layoutClasses = {
    horizontal: 'flex flex-row flex-wrap items-start gap-4',
    vertical: 'flex flex-col gap-4',
    inline: 'flex flex-row flex-wrap items-end gap-4',
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        name={name}
        className={`${layoutClasses[layout]} ${className}`}
        style={style}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Hermes';

// Form.Item component
const FormItem: React.FC<FormItemProps> = (props) => {
  const {
    name,
    label,
    rules,
    required,
    extra,
    help,
    validateStatus,
    hasFeedback,
    initialValue,
    hidden,
    tooltip,
    colon: itemColon,
    children,
    className = '',
    style,
  } = props;

  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form.Item must be used within a Form');
  }

  const fieldName = Array.isArray(name) ? name.join('.') : String(name || '');
  const { values, errors, setValue, registerField, layout, colon, size, disabled, requiredMark, validateField } = context;

  // Register field with initial value
  React.useEffect(() => {
    if (fieldName) {
      registerField(fieldName, initialValue);
    }
  }, [fieldName, initialValue, registerField]);

  const fieldValue = fieldName ? values[fieldName] : undefined;
  const fieldErrors = fieldName ? (errors[fieldName] || []) : [];
  const hasError = validateStatus === 'error' || fieldErrors.length > 0;
  const isRequired = required || rules?.some((r) => r.required);
  const showColon = itemColon ?? colon;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | unknown) => {
    if (!fieldName) return;
    const value = (e as React.ChangeEvent<HTMLInputElement>)?.target?.value ?? e;
    setValue(fieldName, value);
    if (rules) {
      validateField(fieldName, rules);
    }
  }, [fieldName, setValue, rules, validateField]);

  if (hidden) return null;

  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<{ value?: unknown; onChange?: (v: unknown) => void; disabled?: boolean }>, {
        value: fieldValue,
        onChange: handleChange,
        disabled: disabled || child.props.disabled,
      });
    }
    return child;
  });

  return (
    <div
      className={`form-control w-full ${layout === 'horizontal' ? 'flex-row items-center' : ''} ${className}`}
      style={style}
    >
      {label && (
        <label className={`label ${layout === 'horizontal' ? 'w-1/4' : ''}`}>
          <span className={`label-text ${sizeClasses[size || 'default']} ${isRequired && requiredMark ? 'after:content-["*"] after:text-error after:ml-1' : ''}`}>
            {label}
            {showColon && ':'}
          </span>
          {tooltip && (
            <span className="label-text-alt tooltip" data-tip={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}
      <div className={`${layout === 'horizontal' ? 'flex-1' : 'w-full'}`}>
        {childrenWithProps}
        {hasFeedback && hasError && (
          <span className="text-error ml-2">⚠️</span>
        )}
        {(help || fieldErrors.length > 0) && (
          <label className="label">
            <span className={`label-text-alt ${hasError ? 'text-error' : ''}`}>
              {help || fieldErrors[0]}
            </span>
          </label>
        )}
        {extra && (
          <label className="label">
            <span className="label-text-alt text-base-content/60">{extra}</span>
          </label>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Hermes';

// Form.List component (simplified)
const FormList: React.FC<FormListProps> = (props) => {
  const { name: _name, initialValue = [], children } = props;
  const [fields, setFields] = useState<Array<{ key: number; name: number }>>(() =>
    (initialValue || []).map((_, index) => ({ key: index, name: index }))
  );
  const keyRef = useRef(fields.length);

  const operation = useMemo(() => ({
    add: (_defaultValue?: unknown, insertIndex?: number) => {
      const newKey = keyRef.current++;
      const newField = { key: newKey, name: fields.length, isListField: true };
      if (insertIndex !== undefined) {
        setFields((prev) => [...prev.slice(0, insertIndex), newField, ...prev.slice(insertIndex)]);
      } else {
        setFields((prev) => [...prev, newField]);
      }
    },
    remove: (index: number | number[]) => {
      const indices = Array.isArray(index) ? index : [index];
      setFields((prev) => prev.filter((_, i) => !indices.includes(i)));
    },
    move: (from: number, to: number) => {
      setFields((prev) => {
        const result = [...prev];
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
      });
    },
  }), [fields.length]);

  const formattedFields = fields.map((f, index) => ({
    ...f,
    name: index,
    isListField: true,
  }));

  return <>{children(formattedFields, operation, { errors: [], warnings: [] })}</>;
};

FormList.displayName = 'Form.List.Hermes';

// Form.ErrorList component
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const context = useContext(FormContext);

  if (!context) return null;

  const errors = fieldName
    ? context.errors[Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName)] || []
    : Object.values(context.errors).flat();

  if (errors.length === 0) return null;

  return (
    <ul className={`text-error text-sm list-disc pl-4 ${className}`} style={style}>
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Hermes';

// Compound component
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
