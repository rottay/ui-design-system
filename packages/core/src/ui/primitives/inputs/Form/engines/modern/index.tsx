'use client';

/**
 * @fileoverview Form Modern Engine - Rottay Design System
 * @description Self-contained, token-driven implementation of the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
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
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance, FormRule, FieldData } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { FeedbackHelpIcon } from '@/graphics/icons/presentation/semantic/generated/roles/feedback-help';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { StatusLoadingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-loading';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';

/**
 * Renders a semantic DS icon corresponding to the current validation status.
 */
const FeedbackIcon: React.FC<{ status: 'success' | 'error' | 'warning' | 'validating' }> = ({ status }) => {
  const { t } = useTranslation('validation');
  const Icon = status === 'success'
    ? StatusSuccessIcon
    : status === 'error'
      ? StatusErrorIcon
      : status === 'warning'
        ? StatusWarningIcon
        : StatusLoadingIcon;
  const labelKey = status === 'success'
    ? 'passed'
    : status === 'error'
      ? 'failed'
      : status === 'warning'
        ? 'warning_state'
        : 'validating';

  // Announcement de-duplication (a11y law: no duplicated status announcements):
  // in the error posture the message's own `role="alert"` already announces
  // the failure WITH its text, so the icon bows out (decorative). For
  // success/warning/validating there is no alert anywhere, so the icon keeps
  // the `role="status"` channel as the only announcement.
  const announcementOwnedByAlert = status === 'error';

  return (
    <span
      data-part="feedback-icon"
      data-status={status}
      role={announcementOwnedByAlert ? undefined : 'status'}
      aria-label={announcementOwnedByAlert ? undefined : t(labelKey)}
      aria-hidden={announcementOwnedByAlert || undefined}
    >
      <Icon decorative size={15} />
    </span>
  );
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
  /** Canonical `sm | md | lg` step; the public `size` prop's legacy spelling is normalized once via `toCanonicalSize` before entering context. */
  size?: 'sm' | 'md' | 'lg';
  labelAlign?: 'left' | 'right';
  disabled?: boolean;
  colon?: boolean;
  requiredMark?: boolean | 'optional';
  hasFeedback?: boolean;
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
  getFieldRules: (name: string) => FormRule[] | undefined;
}

const FormContext = createContext<FormContextValue | null>(null);

function readOwnRecordValue<T>(record: Record<string, T>, key: string): T | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, key)) return undefined;
  return Reflect.get(record, key) as T;
}

function writeOwnRecordValue<T>(record: Record<string, T>, key: string, value: T): void {
  Reflect.set(record, key, value);
}

function copyWithOwnRecordValue<T>(record: Record<string, T>, key: string, value: T): Record<string, T> {
  const next = { ...record };
  writeOwnRecordValue(next, key, value);
  return next;
}

function deleteOwnRecordValue(record: object, key: string): void {
  Reflect.deleteProperty(record, key);
}

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
      return readOwnRecordValue(valuesRef.current, key);
    },
    getFieldsValue: (nameList) => {
      if (!nameList) return valuesRef.current as T;
      const result: Record<string, unknown> = {};
      nameList.forEach((name) => {
        const key = Array.isArray(name) ? name.join('.') : String(name);
        writeOwnRecordValue(result, key, readOwnRecordValue(valuesRef.current, key));
      });
      return result as T;
    },
    setFieldValue: (name, value) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      writeOwnRecordValue(valuesRef.current, key, value);
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
          deleteOwnRecordValue(valuesRef.current, key);
          deleteOwnRecordValue(errorsRef.current, key);
          deleteOwnRecordValue(touchedRef.current, key);
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
      return Boolean(readOwnRecordValue(touchedRef.current, key));
    },
    isFieldsTouched: () => Object.values(touchedRef.current).some(Boolean),
    getFieldError: (name) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      return readOwnRecordValue(errorsRef.current, key) ?? [];
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
 * Modern Form base component (token-driven, painted by the form.css skin).
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
  const { t: tValidation } = useTranslation('validation');
  const {
    form,
    initialValues = {},
    layout = 'vertical',
    colon = true,
    size = 'default',
    labelAlign,
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
    return readOwnRecordValue(fieldRulesRef.current, fieldName);
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
        const nextValues = copyWithOwnRecordValue(valuesRef.current, key, value);
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
              deleteOwnRecordValue(newValues, key);
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
    const nextValues = copyWithOwnRecordValue(valuesRef.current, fieldName, value);
    valuesRef.current = nextValues;
    setValues(nextValues);
    onValuesChange?.(
      copyWithOwnRecordValue({} as Record<string, unknown>, fieldName, value) as Partial<unknown>,
      nextValues as unknown,
    );
  }, [onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors((prev) => copyWithOwnRecordValue(prev, fieldName, fieldErrors));
  }, []);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouched((prev) => copyWithOwnRecordValue(prev, fieldName, isTouched));
  }, []);

  const registerField = useCallback((fieldName: string, initialValue?: unknown, rules?: FormRule[]) => {
    writeOwnRecordValue(fieldRulesRef.current, fieldName, rules);
    if (initialValue !== undefined && readOwnRecordValue(values, fieldName) === undefined) {
      const nextValues = copyWithOwnRecordValue(valuesRef.current, fieldName, initialValue);
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

    setValidating((prev) => copyWithOwnRecordValue(prev, fieldName, true));

    const value = readOwnRecordValue(valuesRef.current, fieldName);
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      // Check required first - empty values fail immediately
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(rule.message || tValidation('required'));
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        fieldErrors.push(rule.message || tValidation('min_length', { min: rule.min }));
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        fieldErrors.push(rule.message || tValidation('max_length', { max: rule.max }));
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || tValidation('pattern'));
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

    setValidating((prev) => copyWithOwnRecordValue(prev, fieldName, false));
    setError(fieldName, fieldErrors);
    return fieldErrors;
  }, [setError, tValidation]);

  // Contract honesty: the bare useForm instance cannot validate (it owns no
  // rules registry), so its validateFields/scrollToField ship as stubs. The
  // real implementations live HERE, where the rules registry (fieldRulesRef)
  // and validateField actually exist. This is a SEPARATE wrap seam from the
  // submit/setFields effect above: it must be declared after validateField
  // (TDZ) and re-wraps whenever the validation closure changes (locale).
  React.useEffect(() => {
    if (!resolvedForm) return;
    const originalValidateFields = resolvedForm.validateFields;
    const originalScrollToField = resolvedForm.scrollToField;

    resolvedForm.validateFields = (async (
      nameList?: (string | number | (string | number)[])[],
    ) => {
      const names = nameList
        ? nameList.map((n) => (Array.isArray(n) ? n.join('.') : String(n)))
        : Object.keys(fieldRulesRef.current);
      const entries = await Promise.all(
        names.map(
          async (fieldName) =>
            [fieldName, await validateField(fieldName, getFieldRules(fieldName))] as const,
        ),
      );
      const failed = entries.filter(([, fieldErrors]) => fieldErrors.length > 0);
      if (failed.length > 0) {
        // Ant Design parity: reject with the errorFields payload (never a
        // silent pass) so `await form.validateFields()` can branch on it.
        throw {
          values: valuesRef.current,
          errorFields: failed.map(([fieldName, fieldErrors]) => ({
            name: fieldName,
            errors: fieldErrors,
          })),
          outOfDate: false,
        };
      }
      return valuesRef.current;
    }) as FormInstance['validateFields'];

    resolvedForm.scrollToField = (name, options) => {
      const key = Array.isArray(name) ? name.join('.') : String(name);
      const el =
        formElementRef.current?.querySelector(`[id="form-${key}"]`) ||
        formElementRef.current?.querySelector(`[name="${key}"]`);
      // Contract: scroll only (focus management stays the caller's call).
      el?.scrollIntoView(options ?? { behavior: 'smooth', block: 'center' });
    };

    return () => {
      resolvedForm.validateFields = originalValidateFields;
      resolvedForm.scrollToField = originalScrollToField;
    };
  }, [resolvedForm, validateField, getFieldRules]);

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
    size: toCanonicalSize(size),
    labelAlign,
    disabled,
    colon,
    requiredMark,
    hasFeedback: formHasFeedback,
    validateField,
    getFieldRules,
  }), [values, errors, touched, validating, setValue, setError, setFieldTouched, registerField, layout, size, labelAlign, disabled, colon, requiredMark, formHasFeedback, validateField, getFieldRules]);

  useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formElementRef}
        name={name}
        role="form"
        className={`ds-form ds-form--modern ${className}`.trim()}
        data-part="root"
        data-layout={layout}
        data-size={toCanonicalSize(size)}
        data-disabled={disabled || undefined}
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
  const { t } = useTranslation('common');
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
    labelAlign,
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
    return `${k}:${JSON.stringify(readOwnRecordValue(values, k))}`;
  }).join('|');

  useEffect(() => {
    if (!dependencies || !fieldName || !rules) return;
    // Only re-validate if the field has been touched (avoid validating on mount)
    if (readOwnRecordValue(touched, fieldName)) {
      validateField(fieldName, rules);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  const fieldValue = fieldName ? readOwnRecordValue(values, fieldName) : undefined;
  const fieldErrors = fieldName ? (readOwnRecordValue(errors, fieldName) ?? []) : [];
  const isFieldValidating = fieldName ? Boolean(readOwnRecordValue(validatingMap, fieldName)) : false;
  const isFieldTouched = fieldName ? Boolean(readOwnRecordValue(touched, fieldName)) : false;
  const hasError = validateStatus === 'error' || fieldErrors.length > 0;
  const isSuccess = validateStatus === 'success' || (isFieldTouched && fieldErrors.length === 0 && !isFieldValidating && fieldValue !== undefined && fieldValue !== '');
  const isWarning = validateStatus === 'warning';
  const isRequired = required || rules?.some((r) => r.required);
  const showColon = itemColon ?? colon;
  const generatedControlId = fieldName ? `form-${fieldName}` : undefined;
  // The label's htmlFor must track the control the item ACTUALLY points at:
  // a child with its own `id` wins over the generated one (the clone below
  // follows the same rule), otherwise the association silently breaks.
  const firstChildProvidedId = React.Children.toArray(children).reduce<string | undefined>(
    (found, child) => found ?? (React.isValidElement<{ id?: string }>(child) ? child.props.id : undefined),
    undefined,
  );
  const resolvedControlId = firstChildProvidedId ?? generatedControlId;
  const showFeedback = itemHasFeedback ?? formHasFeedback;
  const messageId = fieldName ? `${generatedControlId}-message` : undefined;

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

  // Clone children to inject controlled value, onChange, disabled, and id props.
  // This is how the Form.Item takes ownership of its child input element without
  // the consumer needing to wire up onChange/value manually.
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement<{ value?: unknown; onChange?: (v: unknown) => void; disabled?: boolean; checked?: boolean; id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }>(child)) {
      const usesCheckedValue = valuePropName === 'checked' || (child.props as { type?: string }).type === 'checkbox';
      const childId = (child.props as { id?: string }).id ?? generatedControlId;

      return React.cloneElement(child, {
        id: childId,
        [usesCheckedValue ? 'checked' : valuePropName]: usesCheckedValue
          ? Boolean(fieldValue)
          : (fieldValue ?? ''),
        onChange: handleChange,
        disabled: disabled || (child as React.ReactElement<any>).props.disabled,
        'aria-describedby': (help || fieldErrors.length > 0 || extra) ? messageId : undefined,
        'aria-invalid': hasError || undefined,
        'aria-required': isRequired || undefined,
      });
    }
    return child;
  });

  const feedbackStatus = computedFeedbackStatus();

  // Layout (horizontal label split, label/field geometry, message rhythm) is
  // owned by the form.css skin, keyed on `data-layout` here and `data-size`
  // on the form root -- moving it out of inline styles also revives the
  // skin's `@container` collapse for horizontal items on narrow containers,
  // which an inline `flexDirection` previously overrode.
  return (
    <div
      className={`ds-form-item ds-form-item--modern ${className || ''}`}
      data-part="item"
      data-layout={layout}
      data-validation={feedbackStatus ?? 'neutral'}
      data-required={isRequired || undefined}
      style={style}
    >
      {label && (
        <label
          htmlFor={resolvedControlId}
          data-part="label"
          data-label-align={layout === 'horizontal' ? labelAlign : undefined}
        >
          <span data-part="label-text">
            {label}
            {isRequired && requiredMark && (
              <span data-part="required-mark" data-kind="required">*</span>
            )}
            {showColon && ':'}
          </span>
          {!isRequired && requiredMark === 'optional' && (
            <span data-part="required-mark" data-kind="optional">{t('optional')}</span>
          )}
          {tooltip && (
            <span
              data-part="tooltip-icon"
              title={typeof tooltip === 'string' ? tooltip : undefined}
            >
              <FeedbackHelpIcon decorative size={13} />
            </span>
          )}
        </label>
      )}
      <div data-part="field">
        <div data-part="control-row">
          <div data-part="control">{childrenWithProps}</div>
          {showFeedback && feedbackStatus && (
            <FeedbackIcon status={feedbackStatus} />
          )}
        </div>
        {(help || fieldErrors.length > 0) && (
          <div data-part="message" id={messageId} role={hasError ? 'alert' : undefined}>
            {/* Error posture rides shape + live announcement, never hue alone:
                same governed status.error idiom as FormField's error-icon. */}
            {hasError && (
              <StatusErrorIcon decorative size={13} data-part="error-icon" />
            )}
            <span data-part="help-text" data-error={hasError ? 'true' : 'false'} data-tone={isWarning && !hasError ? 'warning' : undefined}>
              {help || fieldErrors[0]}
            </span>
          </div>
        )}
        {extra && (
          <div data-part="message" id={!help && fieldErrors.length === 0 ? messageId : undefined}>
            <span data-part="extra-text">{extra}</span>
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
    ? readOwnRecordValue(context.errors, Array.isArray(fieldName) ? fieldName.join('.') : String(fieldName)) ?? []
    : Object.values(context.errors).flat();

  if (errors.length === 0) return null;

  return (
    <ul data-part="error-list" role="alert" className={`ds-form-error-list ds-form-error-list--modern ${className}`} style={{ ...style }}>
      {errors.map((error, index) => (
        <li key={index} data-part="error-item">
          <StatusErrorIcon decorative size={14} />
          <span>{error}</span>
        </li>
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
 * @returns A token-driven form with context-based state management
 */
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
