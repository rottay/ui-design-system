'use client';

/**
 * @fileoverview Form Modern Engine - Rottay Design System
 * @description DS token inline-styled implementation of the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements forms using DaisyUI's utility-first approach
 * with Tailwind CSS classes and custom validation logic. It provides a
 * lightweight alternative to Classic with smaller bundle size.
 *
 * **DaisyUI Features Utilized:**
 * - Form control wrapper classes
 * - Label text styling via inline styles
 * - Text error/warning/success color utilities
 * - Flex layout utilities for form layouts
 * - Tooltip for field hints
 *
 * **Custom Implementation:**
 * Unlike Classic which wraps Ant Design, Modern provides its own:
 * - Form state management via React context
 * - Validation engine with rule processing
 * - Field registration and value tracking
 * - useForm hook with full FormInstance API
 *
 * **Validation Support:**
 * - Required validation
 * - Min/max length validation
 * - Pattern (regex) validation
 * - Custom async validators
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Form, Input, useForm } from '@rottay/design-system';
 *
 * const [form] = useForm();
 *
 * <Form
 *   engine="modern"
 *   form={form}
 *   layout="vertical"
 *   onFinish={handleSubmit}
 *   className="max-w-md"
 * >
 *   <Form.Item
 *     name="username"
 *     label="Username"
 *     rules={[{ required: true }, { min: 3 }]}
 *   >
 *     <Input placeholder="Enter username" />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link ClassicForm} for Ant Design implementation
 * @see {@link RusticForm} for vanilla implementation
 * @module ModernForm
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useImperativeHandle, useEffect } from 'react';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance, FormRule, FieldData } from '../Form.types';

/**
 * Renders an inline SVG icon corresponding to the current validation status.
 * Uses DaisyUI semantic color classes (text-success, text-error, etc.) and a
 * shared entrance animation so the icon pops in when validation completes.
 */
const FeedbackIcon: React.FC<{ status: 'success' | 'error' | 'warning' | 'validating' }> = ({ status }) => {
  switch (status) {
    case 'success':
      return (
        <span data-part="feedback-icon" data-status="success" className="ml-2 inline-flex items-center" aria-label="Validation passed" style={{ animation: 'ds-form-modern-feedback-in var(--ds-motion-slow) var(--ds-motion-ease-out)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </span>
      );
    case 'error':
      return (
        <span data-part="feedback-icon" data-status="error" className="ml-2 inline-flex items-center" aria-label="Validation failed" style={{ animation: 'ds-form-modern-feedback-in var(--ds-motion-slow) var(--ds-motion-ease-out)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </span>
      );
    case 'warning':
      return (
        <span data-part="feedback-icon" data-status="warning" className="ml-2 inline-flex items-center" aria-label="Validation warning" style={{ animation: 'ds-form-modern-feedback-in var(--ds-motion-slow) var(--ds-motion-ease-out)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.832c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </span>
      );
    case 'validating':
      return (
        <span data-part="feedback-icon" data-status="validating" className="ml-2 inline-flex items-center animate-spin" aria-label="Validating">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </span>
      );
  }
};

// ---------------------------------------------------------------------------
// Form Context - carries form-wide state and callbacks to nested Form.Items
// without requiring prop-drilling through intermediate components.
// ---------------------------------------------------------------------------
interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  validating: Record<string, boolean>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, errors: string[]) => void;
  setTouched: (name: string, touched: boolean) => void;
  registerField: (name: string, initialValue?: unknown, rules?: FormRule[]) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  colon?: boolean;
  requiredMark?: boolean | 'optional';
  hasFeedback?: boolean;
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
  getFieldRules: (name: string) => FormRule[] | undefined;
}

const FormContext = createContext<FormContextValue | null>(null);

/**
 * Custom useForm hook providing a stable FormInstance for the Modern engine.
 *
 * All mutable state lives in refs so the instance identity stays the same
 * across re-renders. External subscribers (the Form component) are notified
 * via a simple listener set to trigger React state updates when values change.
 *
 * @template T - Shape of the form values object
 * @returns A single-element tuple containing the FormInstance, matching Ant Design's API
 */
export function useForm<T = unknown>(): [FormInstance<T>] {
  const valuesRef = useRef<Record<string, unknown>>({});
  const errorsRef = useRef<Record<string, string[]>>({});
  const touchedRef = useRef<Record<string, boolean>>({});
  const listenersRef = useRef<Set<() => void>>(new Set());

  // useMemo with [] deps ensures the instance object is created once and never
  // replaced, so consumers can safely hold a reference without stale closures.
  const instance = useMemo<FormInstance<T> & { __subscribe?: (fn: () => void) => () => void; __getValues?: () => Record<string, unknown> }>(() => ({
    // Field names can be strings or path arrays (e.g., ['address', 'city']).
    // We normalise to dot-delimited keys for flat storage in the refs.
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
    // Internal methods used by the Form component to stay in sync.
    // __subscribe lets the Form re-render when programmatic changes
    // (e.g. setFieldsValue) happen outside React's normal flow.
    __subscribe: (fn: () => void) => {
      listenersRef.current.add(fn);
      return () => listenersRef.current.delete(fn);
    },
    __getValues: () => ({ ...valuesRef.current }),
  }), []);

  return [instance];
}

/**
 * Modern Form base component (DaisyUI/Tailwind CSS).
 *
 * Manages form state via React context, validates fields on change and submit,
 * and supports scrollToFirstError for long forms. The component wraps the
 * external FormInstance methods so that programmatic mutations (e.g. form.setFieldsValue)
 * also update the internal React state and trigger re-renders.
 *
 * @param props - {@link FormProps}
 * @returns A `<form>` element wrapped in a FormContext provider
 */
const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const {
    form,
    initialValues = {},
    layout = 'vertical',
    colon = true,
    size = 'default',
    disabled = false,
    requiredMark = true,
    scrollToFirstError = false,
    hasFeedback: formHasFeedback = false,
    name,
    onValuesChange,
    onFinish,
    onFinishFailed,
    children,
    className = '',
    style,
    autoComplete = 'on',
  } = props;
  const [internalForm] = useForm();
  const resolvedForm = form ?? internalForm;
  const formElementRef = useRef<HTMLFormElement | null>(null);

  const [values, setValues] = useState<Record<string, unknown>>(initialValues as Record<string, unknown>);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const fieldRulesRef = useRef<Record<string, FormRule[] | undefined>>({});
  const valuesRef = useRef<Record<string, unknown>>(initialValues as Record<string, unknown>);

  const getFieldRules = useCallback((fieldName: string) => {
    return fieldRulesRef.current[fieldName];
  }, []);

  // Wrap form instance methods to sync with component state
  // This works with ANY form instance (Classic/Ant Design, Modern, or Rustic)
  React.useEffect(() => {
    if (resolvedForm) {
      // Store original methods so the engine can stay in sync with the
      // externally visible FormInstance API without forking behavior.
      const originalSetFieldsValue = resolvedForm.setFieldsValue;
      const originalSetFieldValue = resolvedForm.setFieldValue;
      const originalResetFields = resolvedForm.resetFields;
      const originalSubmit = resolvedForm.submit;

      // Wrap setFieldsValue to also update component state
      resolvedForm.setFieldsValue = (newValues: Record<string, unknown>) => {
        // Call original method
        originalSetFieldsValue.call(resolvedForm, newValues);
        // Update component state
        const nextValues = { ...valuesRef.current, ...newValues };
        valuesRef.current = nextValues;
        setValues(nextValues);
      };

      // Wrap setFieldValue to also update component state
      resolvedForm.setFieldValue = (fieldName: string | number | (string | number)[], value: unknown) => {
        // Call original method
        originalSetFieldValue.call(resolvedForm, fieldName, value);
        // Update component state
        const key = Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName);
        const nextValues = { ...valuesRef.current, [key]: value };
        valuesRef.current = nextValues;
        setValues(nextValues);
      };

      // Wrap resetFields to also reset component state
      resolvedForm.resetFields = (fields?: (string | number | (string | number)[])[]) => {
        // Call original method
        originalResetFields.call(resolvedForm, fields);
        // Reset component state
        if (fields) {
          setValues(prev => {
            const newValues = { ...prev };
            fields.forEach(field => {
              const key = Array.isArray(field) ? field.join('.') : String(field);
              delete newValues[key];
            });
            valuesRef.current = newValues;
            return newValues;
          });
        } else {
          valuesRef.current = initialValues as Record<string, unknown>;
          setValues(initialValues as Record<string, unknown>);
        }
      };

      resolvedForm.submit = () => {
        if (formElementRef.current?.requestSubmit) {
          formElementRef.current.requestSubmit();
          return;
        }

        formElementRef.current?.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
      };

      // Cleanup: restore original methods
      return () => {
        resolvedForm.setFieldsValue = originalSetFieldsValue;
        resolvedForm.setFieldValue = originalSetFieldValue;
        resolvedForm.resetFields = originalResetFields;
        resolvedForm.submit = originalSubmit;
      };
    }
  }, [resolvedForm, initialValues]);

  const setValue = useCallback((fieldName: string, value: unknown) => {
    const nextValues = { ...valuesRef.current, [fieldName]: value };
    valuesRef.current = nextValues;
    setValues(nextValues);
    onValuesChange?.({ [fieldName]: value } as Partial<unknown>, nextValues as unknown);
  }, [onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors }));
  }, []);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const registerField = useCallback((fieldName: string, initialValue?: unknown, rules?: FormRule[]) => {
    fieldRulesRef.current[fieldName] = rules;
    if (initialValue !== undefined && values[fieldName] === undefined) {
      const nextValues = { ...valuesRef.current, [fieldName]: initialValue };
      valuesRef.current = nextValues;
      setValues(nextValues);
    }
  }, [values]);

  // Runs every configured rule sequentially for a single field.
  // Sequential execution matters because later rules may depend on earlier
  // ones (e.g., a custom validator that only makes sense after required passes).
  // Async validators are awaited individually so the validating spinner renders.
  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];

    setValidating((prev) => ({ ...prev, [fieldName]: true }));

    const value = valuesRef.current[fieldName];
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      // Check required first - empty values fail immediately
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
      // Custom validator: rejection or thrown error means validation failed
      if (rule.validator) {
        try {
          await rule.validator(rule, value);
        } catch (e) {
          fieldErrors.push(rule.message || String(e));
        }
      }
    }

    setValidating((prev) => ({ ...prev, [fieldName]: false }));
    setError(fieldName, fieldErrors);
    return fieldErrors;
  }, [values, setError]);

  // Submit handler: validates ALL registered fields in parallel, then either
  // calls onFinish (success) or onFinishFailed (errors) with scroll-to-error UX.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate every registered field during submit so failed submits are based
    // on the current form state instead of whatever happened to be validated last.
    const validationEntries = await Promise.all(
      Object.entries(fieldRulesRef.current).map(async ([fieldName, fieldRules]) => {
        const fieldErrors = await validateField(fieldName, fieldRules);
        return [fieldName, fieldErrors] as const;
      })
    );

    const allErrors: FieldData[] = validationEntries
      .filter(([, fieldErrors]) => fieldErrors.length > 0)
      .map(([fieldName, fieldErrors]) => ({
        name: fieldName,
        errors: fieldErrors,
      }));

    if (allErrors.length > 0) {
      onFinishFailed?.({ values: valuesRef.current as unknown, errorFields: allErrors, outOfDate: false });

      // Scroll to first error field
      if (scrollToFirstError && formElementRef.current) {
        const firstErrorName = allErrors[0]?.name;
        if (firstErrorName) {
          const fieldKey = Array.isArray(firstErrorName) ? firstErrorName.join('.') : String(firstErrorName);
          const errorEl = formElementRef.current.querySelector(`[id="form-${fieldKey}"]`) ||
            formElementRef.current.querySelector(`[name="${fieldKey}"]`);
          if (errorEl) {
            const scrollOpts: ScrollIntoViewOptions = typeof scrollToFirstError === 'object'
              ? scrollToFirstError
              : { behavior: 'smooth', block: 'center' };
            errorEl.scrollIntoView(scrollOpts);
          }
        }
      }
    } else {
      onFinish?.(valuesRef.current as unknown);
    }
  };

  const contextValue = useMemo<FormContextValue>(() => ({
    values,
    errors,
    touched,
    validating,
    setValue,
    setError,
    setTouched: setFieldTouched,
    registerField,
    layout,
    size: size === 'middle' ? 'default' : size,
    disabled,
    colon,
    requiredMark,
    hasFeedback: formHasFeedback,
    validateField,
    getFieldRules,
  }), [values, errors, touched, validating, setValue, setError, setFieldTouched, registerField, layout, size, disabled, colon, requiredMark, formHasFeedback, validateField, getFieldRules]);

  useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  const layoutClasses = {
    horizontal: 'flex flex-row flex-wrap items-start gap-4',
    vertical: 'flex flex-col gap-4',
    inline: 'flex flex-row flex-wrap items-end gap-4',
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formElementRef}
        name={name}
        role="form"
        className={`ds-form ds-form--modern ${layoutClasses[layout]} ${className}`}
        data-part="root"
        style={style}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Modern';

/**
 * Modern Form.Item - wraps a single form field with label, validation, and
 * feedback display. Automatically registers itself with the parent Form
 * context and triggers validation on change and on dependency updates.
 *
 * @param props - {@link FormItemProps}
 * @returns A labelled form control wrapper with error/help/extra messaging
 */
const FormItem: React.FC<FormItemProps> = (props) => {
  const {
    name,
    label,
    rules,
    required,
    extra,
    help,
    validateStatus,
    hasFeedback: itemHasFeedback,
    initialValue,
    hidden,
    tooltip,
    valuePropName = 'value',
    colon: itemColon,
    dependencies,
    children,
    className = '',
    style,
  } = props;

  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form.Item must be used within a Form');
  }

  const fieldName = Array.isArray(name) ? name.join('.') : String(name || '');
  const {
    values,
    errors,
    touched,
    validating: validatingMap,
    setValue,
    registerField,
    layout,
    colon,
    size,
    disabled,
    requiredMark,
    hasFeedback: formHasFeedback,
    validateField,
    getFieldRules,
  } = context;

  // Register field with initial value
  React.useEffect(() => {
    if (fieldName) {
      registerField(fieldName, initialValue, rules);
    }
  }, [fieldName, initialValue, registerField, rules]);

  // Field dependencies: when a dependency changes, re-validate this field
  const depsKey = dependencies?.map((d) => {
    const k = Array.isArray(d) ? d.join('.') : String(d);
    return `${k}:${JSON.stringify(values[k])}`;
  }).join('|');

  useEffect(() => {
    if (!dependencies || !fieldName || !rules) return;
    // Only re-validate if the field has been touched (avoid validating on mount)
    if (touched[fieldName]) {
      validateField(fieldName, rules);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  const fieldValue = fieldName ? values[fieldName] : undefined;
  const fieldErrors = fieldName ? (errors[fieldName] || []) : [];
  const isFieldValidating = fieldName ? !!validatingMap[fieldName] : false;
  const hasError = validateStatus === 'error' || fieldErrors.length > 0;
  const isSuccess = validateStatus === 'success' || (touched[fieldName] && fieldErrors.length === 0 && !isFieldValidating && fieldValue !== undefined && fieldValue !== '');
  const isWarning = validateStatus === 'warning';
  const isRequired = required || rules?.some((r) => r.required);
  const showColon = itemColon ?? colon;
  const generatedControlId = fieldName ? `form-${fieldName}` : undefined;
  const showFeedback = itemHasFeedback ?? formHasFeedback;

  const computedFeedbackStatus = (): 'success' | 'error' | 'warning' | 'validating' | null => {
    if (validateStatus === 'validating' || isFieldValidating) return 'validating';
    if (validateStatus === 'error' || hasError) return 'error';
    if (validateStatus === 'warning' || isWarning) return 'warning';
    if (validateStatus === 'success' || isSuccess) return 'success';
    return null;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | unknown) => {
    if (!fieldName) return;
    const target = (e as React.ChangeEvent<HTMLInputElement>)?.target;
    const value =
      valuePropName === 'checked'
        ? target?.checked ?? Boolean(e)
        : target?.value ?? e;
    setValue(fieldName, value);
    if (rules) {
      validateField(fieldName, rules);
    }
  }, [fieldName, setValue, rules, validateField, valuePropName]);

  if (hidden) return null;

  const sizeFontMap: Record<string, number> = {
    small: 14,
    default: 16,
    large: 18,
  };

  // Clone children to inject controlled value, onChange, disabled, and id props.
  // This is how the Form.Item takes ownership of its child input element without
  // the consumer needing to wire up onChange/value manually.
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement<{ value?: unknown; onChange?: (v: unknown) => void; disabled?: boolean; checked?: boolean; id?: string }>(child)) {
      const usesCheckedValue = valuePropName === 'checked' || (child.props as { type?: string }).type === 'checkbox';
      const childId = (child.props as { id?: string }).id ?? generatedControlId;

      return React.cloneElement(child, {
        id: childId,
        [usesCheckedValue ? 'checked' : valuePropName]: usesCheckedValue
          ? Boolean(fieldValue)
          : (fieldValue ?? ''),
        onChange: handleChange,
        disabled: disabled || (child as React.ReactElement<any>).props.disabled,
      });
    }
    return child;
  });

  const feedbackStatus = computedFeedbackStatus();

  return (
    <div
      className={`ds-form-item ds-form-item--modern ${className || ''}`}
      data-part="item"
      style={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        alignItems: layout === 'horizontal' ? 'center' : undefined,
        width: '100%',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={generatedControlId}
          data-part="label"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 4,
            ...(layout === 'horizontal' ? { width: '25%' } : {}),
          }}
        >
          <span data-part="label-text" style={{ fontWeight: 500, letterSpacing: '-0.01em', fontSize: sizeFontMap[size || 'default'] || 16 }}>
            {label}
            {isRequired && requiredMark && (
              <span data-part="required-mark" style={{ marginLeft: 4 }}>*</span>
            )}
            {showColon && ':'}
          </span>
          {tooltip && (
            <span
              data-part="tooltip-icon"
              title={typeof tooltip === 'string' ? tooltip : undefined}
              style={{
                marginLeft: 4,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'help',
              }}
            >
              ?
            </span>
          )}
        </label>
      )}
      <div style={{ flex: layout === 'horizontal' ? 1 : undefined, width: layout === 'horizontal' ? undefined : '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>{childrenWithProps}</div>
          {showFeedback && feedbackStatus && (
            <FeedbackIcon status={feedbackStatus} />
          )}
        </div>
        {(help || fieldErrors.length > 0) && (
          <div style={{ paddingTop: 4, animation: hasError ? 'ds-form-modern-error-slide var(--ds-motion-normal) ease-out' : undefined }}>
            <span data-part="help-text" data-error={hasError ? 'true' : 'false'} style={{ fontSize: 12 }}>
              {help || fieldErrors[0]}
            </span>
          </div>
        )}
        {extra && (
          <div style={{ paddingTop: 4 }}>
            <span data-part="extra-text" style={{ fontSize: 12 }}>{extra}</span>
          </div>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Modern';

/**
 * Modern Form.List - manages a dynamic array of fields via render-prop pattern.
 *
 * Exposes add/remove/move operations to the children render function, mirroring
 * Ant Design's Form.List API. Keys are monotonically increasing to ensure
 * React reconciliation works correctly when items are reordered or removed.
 *
 * @param props - {@link FormListProps}
 * @returns Rendered children with fields array and operation helpers
 */
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

FormList.displayName = 'Form.List.Modern';

/**
 * Modern Form.ErrorList - displays validation errors as a bulleted list.
 *
 * When `fieldName` is provided, shows errors for that specific field.
 * When omitted, aggregates all form errors into a single list - useful
 * for showing a summary at the top or bottom of the form.
 *
 * @param props - {@link FormErrorListProps}
 * @returns An error list or null if no errors exist
 */
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const context = useContext(FormContext);

  if (!context) return null;

  const errors = fieldName
    ? context.errors[Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName)] || []
    : Object.values(context.errors).flat();

  if (errors.length === 0) return null;

  return (
    <ul data-part="error-list" className={`ds-form-error-list ds-form-error-list--modern text-sm list-disc pl-4 ${className}`} style={{ ...style }}>
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Modern';

/**
 * Modern Form compound component.
 *
 * Uses Object.assign to attach sub-components so consumers can write
 * `<Form.Item>` and `<Form.List>` without extra imports.
 *
 * @param props - {@link FormProps}
 * @returns A DaisyUI/Tailwind-styled form with context-based state management
 */
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
