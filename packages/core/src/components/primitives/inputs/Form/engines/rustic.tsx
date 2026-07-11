'use client';

/**
 * @fileoverview Form Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a headless form implementation using only
 * native HTML elements and inline styles. This offers maximum flexibility
 * for custom styling and ensures full accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Complete form state management
 * - Custom validation engine
 * - Inline styles for layout
 * - Full FormInstance API
 * - ARIA role="form" for accessibility
 *
 * **Custom Implementation:**
 * Like Modern, Rustic provides its own:
 * - Form state management via React context
 * - Validation engine with rule processing
 * - Field registration and value tracking
 * - useForm hook with full FormInstance API
 *
 * **Inline Styles:**
 * All styling is done via inline styles defined in the `styles` object,
 * ensuring the component works without external CSS.
 *
 * **Accessibility:**
 * - `role="form"` on form element
 * - `role="alert"` on error lists
 * - Required field indication
 * - Error messages linked to fields
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Form, Input, useForm } from '@rottay/design-system';
 *
 * const [form] = useForm();
 *
 * <Form
 *   engine="rustic"
 *   form={form}
 *   layout="vertical"
 *   onFinish={handleSubmit}
 *   style={{ maxWidth: '400px' }}
 * >
 *   <Form.Item
 *     name="email"
 *     label="Email Address"
 *     rules={[{ required: true }, { type: 'email' }]}
 *   >
 *     <input type="email" style={{ width: '100%', padding: '8px' }} />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link ClassicForm} for Ant Design implementation
 * @see {@link ModernForm} for DaisyUI implementation
 * @module RusticForm
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useImperativeHandle, useEffect } from 'react';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance, FormRule, FieldData } from '../Form.types';
import { useTranslation } from '../../../../../i18n';

// Feedback icon data keyed by validation status. Using a static lookup table
// instead of a switch statement keeps the rendering logic minimal and lets us
// share the same SVG rendering path for all statuses.
const feedbackIcons: Record<string, { svg: string; color: string; label: string }> = {
  success: {
    svg: 'M5 13l4 4L19 7',
    color: 'var(--ds-form-success-color, #22c55e)',
    label: 'Validation passed',
  },
  error: {
    svg: 'M6 18L18 6M6 6l12 12',
    color: 'var(--ds-form-error-color, #ef4444)',
    label: 'Validation failed',
  },
  warning: {
    svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.832c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
    color: 'var(--ds-form-warning-color, #f59e0b)',
    label: 'Validation warning',
  },
  validating: {
    svg: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: 'var(--ds-form-info-color, #3b82f6)',
    label: 'Validating',
  },
};

/**
 * Renders a feedback SVG icon for the given validation status.
 * All styling is inline to avoid CSS framework dependencies.
 * The validating status uses a spin animation; others use a scale-in entrance.
 */
const RusticFeedbackIcon: React.FC<{ status: 'success' | 'error' | 'warning' | 'validating' }> = ({ status }) => {
  const { svg, color, label } = feedbackIcons[status];
  const iconStyle: React.CSSProperties = {
    marginLeft: 8,
    display: 'inline-flex',
    alignItems: 'center',
    color,
    animation: status === 'validating'
      ? 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      : 'rottay-form-feedback-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };
  return (
    <span data-part="feedback-icon" style={iconStyle} aria-label={label}>
      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={svg} />
      </svg>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Inline style definitions using CSS custom properties (--ds-form-*).
// CSS variables enable multi-tenant theming without class name collisions,
// which is critical for the Rustic engine's zero-dependency approach.
// ---------------------------------------------------------------------------
const styles = {
  formHorizontal: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start',
    gap: 'var(--ds-form-gap)',
  },
  formVertical: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ds-form-gap)',
  },
  formInline: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
    gap: 'var(--ds-form-gap)',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ds-form-item-gap)',
    width: '100%',
  },
  formItemHorizontal: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  label: {
    fontSize: 'var(--ds-form-label-font-size)',
    fontWeight: 'var(--ds-form-label-font-weight)' as unknown as number,
    color: 'var(--ds-form-label-color)',
    marginBottom: 'var(--ds-form-item-gap)',
    letterSpacing: '0.01em',
  },
  labelHorizontal: {
    width: 'var(--ds-form-label-width)',
    textAlign: 'right' as const,
    paddingRight: '8px',
  },
  required: {
    color: 'var(--ds-form-required-color)',
    marginLeft: '2px',
    animation: 'rottay-form-required-pulse 2s ease-in-out infinite',
  },
  inputWrapper: {
    flex: 1,
  },
  extra: {
    fontSize: 'var(--ds-form-extra-font-size)',
    color: 'var(--ds-form-extra-color)',
    marginTop: 'var(--ds-form-item-gap)',
  },
  help: {
    fontSize: 'var(--ds-form-help-font-size)',
    marginTop: 'var(--ds-form-item-gap)',
    color: 'var(--ds-form-help-color)',
    animation: 'rottay-form-help-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  helpError: {
    color: 'var(--ds-form-error-color)',
  },
  helpWarning: {
    color: 'var(--ds-form-warning-color)',
  },
  helpSuccess: {
    color: 'var(--ds-form-success-color)',
  },
  errorList: {
    listStyle: 'disc',
    paddingLeft: '16px',
    margin: 0,
    fontSize: 'var(--ds-form-help-font-size)',
    color: 'var(--ds-form-error-color)',
  },
};

// ---------------------------------------------------------------------------
// Form Context - carries form-wide state and callbacks to nested Form.Items.
// Includes a `t` function for i18n so validation messages can be translated.
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
  t: (key: string, params?: Record<string, string | number>) => string;
}

const FormContext = createContext<FormContextValue | null>(null);

/**
 * Custom useForm hook for the Rustic engine.
 *
 * Returns a stable FormInstance stored in refs so the object identity does not
 * change between renders. This is nearly identical to the Modern engine's hook
 * but kept separate to allow future engine-specific divergence.
 *
 * @template T - Shape of the form values object
 * @returns A single-element tuple containing the FormInstance
 */
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

/**
 * Rustic Form base component (pure HTML/CSS with inline styles).
 *
 * Provides the same state management and validation engine as Modern but
 * renders using inline styles backed by CSS variables instead of Tailwind
 * classes. This guarantees the component works without any CSS framework
 * and supports multi-tenant theming via custom property overrides.
 *
 * @param props - {@link FormProps}
 * @returns A `<form>` element with role="form" wrapped in FormContext
 */
const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const { t } = useTranslation('components');

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

  React.useEffect(() => {
    if (resolvedForm) {
      const originalSetFieldsValue = resolvedForm.setFieldsValue;
      const originalSetFieldValue = resolvedForm.setFieldValue;
      const originalResetFields = resolvedForm.resetFields;
      const originalSubmit = resolvedForm.submit;

      resolvedForm.setFieldsValue = (newValues: Record<string, unknown>) => {
        originalSetFieldsValue.call(resolvedForm, newValues);
        const nextValues = { ...valuesRef.current, ...newValues };
        valuesRef.current = nextValues;
        setValues(nextValues);
      };

      resolvedForm.setFieldValue = (
        fieldName: string | number | (string | number)[],
        value: unknown
      ) => {
        originalSetFieldValue.call(resolvedForm, fieldName, value);
        const key = Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName);
        const nextValues = { ...valuesRef.current, [key]: value };
        valuesRef.current = nextValues;
        setValues(nextValues);
      };

      resolvedForm.resetFields = (fields?: (string | number | (string | number)[])[]) => {
        originalResetFields.call(resolvedForm, fields);
        if (fields) {
          setValues((prev) => {
            const nextValues = { ...prev };
            fields.forEach((field) => {
              const key = Array.isArray(field) ? field.join('.') : String(field);
              delete nextValues[key];
            });
            valuesRef.current = nextValues;
            return nextValues;
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

  // Validates a single field against all its rules. Uses the `t` function for
  // translatable default error messages (unlike Modern which hardcodes English).
  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];

    setValidating((prev) => ({ ...prev, [fieldName]: true }));

    const value = valuesRef.current[fieldName];
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(rule.message || t('form.required_with_name', { name: fieldName }));
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        fieldErrors.push(rule.message || t('form.min_length', { min: rule.min }));
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        fieldErrors.push(rule.message || t('form.max_length', { max: rule.max }));
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || t('form.invalid_format'));
      }
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
  }, [values, setError, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    t,
  }), [values, errors, touched, validating, setValue, setError, setFieldTouched, registerField, layout, size, disabled, colon, requiredMark, formHasFeedback, validateField, getFieldRules, t]);

  useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  const formStyle = {
    ...(layout === 'horizontal' ? styles.formHorizontal : layout === 'inline' ? styles.formInline : styles.formVertical),
    ...style,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formElementRef}
        name={name}
        className={`ds-form ds-form--rustic ${className}`}
        data-part="root"
        style={formStyle}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
        role="form"
      >
        {children}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rottay-form-help-slide-in {
            from { opacity: 0; transform: translateY(-4px); max-height: 0; }
            to { opacity: 1; transform: translateY(0); max-height: 100px; }
          }
          @keyframes rottay-form-feedback-in {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes rottay-form-required-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Rustic';

/**
 * Rustic Form.Item - wraps a field with label, validation feedback, and help text.
 *
 * All layout and styling is handled through inline styles from the `styles`
 * object, making it completely independent of external CSS. Supports
 * horizontal/vertical/inline layouts, required-mark display, and dependencies
 * for cross-field validation.
 *
 * @param props - {@link FormItemProps}
 * @returns A labelled form control wrapper with inline-styled error display
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
    disabled,
    requiredMark,
    hasFeedback: formHasFeedback,
    validateField,
    getFieldRules,
  } = context;

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
    <div className={`ds-form-item ds-form-item--rustic ${className}`} data-part="item" style={itemStyle}>
      {label && (
        <label style={labelStyle} data-part="label" htmlFor={generatedControlId}>
          {label}
          {showColon && ':'}
          {isRequired && requiredMark && <span data-part="required-mark" style={styles.required}>*</span>}
          {tooltip && <span data-part="tooltip-icon" title={String(tooltip)} style={{ marginLeft: '4px', cursor: 'help' }}>?</span>}
        </label>
      )}
      <div style={styles.inputWrapper}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>{childrenWithProps}</div>
          {showFeedback && feedbackStatus && (
            <RusticFeedbackIcon status={feedbackStatus} />
          )}
        </div>
        {(help || fieldErrors.length > 0) && (
          <div data-part="help-text" data-error={hasError ? 'true' : 'false'} style={helpStyle}>{help || fieldErrors[0]}</div>
        )}
        {extra && <div data-part="extra-text" style={styles.extra}>{extra}</div>}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Rustic';

/**
 * Rustic Form.List - dynamic field array management via render-prop pattern.
 *
 * Provides add/remove/move operations to children. Monotonically increasing
 * keys ensure React reconciliation is stable across reorders and deletions.
 *
 * @param props - {@link FormListProps}
 * @returns Rendered children with field descriptors and operation helpers
 */
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

FormList.displayName = 'Form.List.Rustic';

/**
 * Rustic Form.ErrorList - displays validation errors with role="alert" for
 * screen readers. Uses inline styles from the `styles.errorList` object.
 *
 * @param props - {@link FormErrorListProps}
 * @returns An accessible error list or null if there are no errors
 */
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const context = useContext(FormContext);

  if (!context) return null;

  const fieldErrors = fieldName
    ? context.errors[Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName)] || []
    : Object.values(context.errors).flat();

  if (fieldErrors.length === 0) return null;

  return (
    <ul data-part="error-list" className={className} style={{ ...styles.errorList, ...style }} role="alert">
      {fieldErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Rustic';

/**
 * Rustic Form compound component.
 *
 * @param props - {@link FormProps}
 * @returns A zero-dependency form with CSS-variable theming support
 */
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
