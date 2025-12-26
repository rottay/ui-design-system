'use client';

/**
 * Form - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useImperativeHandle } from 'react';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance, FormRule, FieldData } from '../../types';

const styles = {
  formHorizontal: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start',
    gap: '16px',
  },
  formVertical: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formInline: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
    gap: '16px',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    width: '100%',
  },
  formItemHorizontal: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '4px',
  },
  labelHorizontal: {
    width: '25%',
    textAlign: 'right' as const,
    paddingRight: '8px',
  },
  required: {
    color: '#ff4d4f',
    marginLeft: '2px',
  },
  inputWrapper: {
    flex: 1,
  },
  extra: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },
  help: {
    fontSize: '12px',
    marginTop: '4px',
  },
  helpError: {
    color: '#ff4d4f',
  },
  helpWarning: {
    color: '#faad14',
  },
  helpSuccess: {
    color: '#52c41a',
  },
  errorList: {
    listStyle: 'disc',
    paddingLeft: '16px',
    margin: 0,
    fontSize: '12px',
    color: '#ff4d4f',
  },
};

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
    validateFields: async () => valuesRef.current as T,
    submit: () => {},
    isFieldTouched: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return !!touchedRef.current[key];
    },
    isFieldsTouched: () => Object.values(touchedRef.current).some(Boolean),
    getFieldError: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return errorsRef.current[key] || [];
    },
    getFieldsError: () =>
      Object.entries(errorsRef.current).map(([name, errors]) => ({
        name,
        errors,
      })) as FieldData[],
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
        fieldErrors.push(rule.message || `Minimum ${rule.min} characters`);
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        fieldErrors.push(rule.message || `Maximum ${rule.max} characters`);
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || 'Invalid format');
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

  const formStyle = {
    ...(layout === 'horizontal' ? styles.formHorizontal : layout === 'inline' ? styles.formInline : styles.formVertical),
    ...style,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        name={name}
        className={className}
        style={formStyle}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
        role="form"
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Apollo';

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
  const { values, errors, setValue, registerField, layout, colon, disabled, requiredMark, validateField } = context;

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

  const itemStyle = {
    ...styles.formItem,
    ...(layout === 'horizontal' ? styles.formItemHorizontal : {}),
    ...style,
  };

  const labelStyle = {
    ...styles.label,
    ...(layout === 'horizontal' ? styles.labelHorizontal : {}),
  };

  const helpStyle = {
    ...styles.help,
    ...(hasError ? styles.helpError : validateStatus === 'warning' ? styles.helpWarning : validateStatus === 'success' ? styles.helpSuccess : {}),
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
    <div className={className} style={itemStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {showColon && ':'}
          {isRequired && requiredMark && <span style={styles.required}>*</span>}
          {tooltip && <span title={String(tooltip)} style={{ marginLeft: '4px', cursor: 'help' }}>ℹ️</span>}
        </label>
      )}
      <div style={styles.inputWrapper}>
        {childrenWithProps}
        {(help || fieldErrors.length > 0) && (
          <div style={helpStyle}>{help || fieldErrors[0]}</div>
        )}
        {extra && <div style={styles.extra}>{extra}</div>}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Apollo';

// Form.List component
const FormList: React.FC<FormListProps> = (props) => {
  const { initialValue = [], children } = props;
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

FormList.displayName = 'Form.List.Apollo';

// Form.ErrorList component
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const context = useContext(FormContext);

  if (!context) return null;

  const fieldErrors = fieldName
    ? context.errors[Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName)] || []
    : Object.values(context.errors).flat();

  if (fieldErrors.length === 0) return null;

  return (
    <ul className={className} style={{ ...styles.errorList, ...style }} role="alert">
      {fieldErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Apollo';

// Compound component
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
