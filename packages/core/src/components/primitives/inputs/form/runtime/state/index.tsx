'use client';

/**
 * @fileoverview The one form runtime: field registration, values, errors,
 * touched and validating state, submission and the `useForm` instance. Every
 * engine that owns its own form renders from it; none re-implements it.
 *
 * @module Form/Runtime/State
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@/infrastructure/runtime/i18n';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import type { FieldData, FormInstance, FormErrorListProps, FormItemProps, FormLayout, FormListFieldData, FormListOperation, FormListProps, FormProps, FormRule } from '../../contracts';
import { VALIDATION_CATALOG, validateRules, type ValidationCatalog } from '../validation';

type FieldName = string | number | (string | number)[];
type FieldRecord<T> = Record<string, T>;

export type FeedbackStatus = 'success' | 'error' | 'warning' | 'validating';

/** Field paths are stored flat, keyed by their dot-joined path. */
export function toFieldKey(name: FieldName | undefined): string {
  return Array.isArray(name) ? name.join('.') : String(name ?? '');
}

export function readOwnRecordValue<T>(record: FieldRecord<T>, key: string): T | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, key)) return undefined;
  return Reflect.get(record, key) as T;
}

function writeOwnRecordValue<T>(record: FieldRecord<T>, key: string, value: T): void {
  Reflect.set(record, key, value);
}

function copyWithOwnRecordValue<T>(record: FieldRecord<T>, key: string, value: T): FieldRecord<T> {
  const next = { ...record };
  writeOwnRecordValue(next, key, value);
  return next;
}

function deleteOwnRecordValue(record: object, key: string): void {
  Reflect.deleteProperty(record, key);
}

/** Form-wide presentation every item reads from context. */
export interface FormPresentation {
  layout: FormLayout;
  /** Canonical `sm | md | lg` step. */
  size: 'sm' | 'md' | 'lg';
  labelAlign?: 'left' | 'right';
  disabled: boolean;
  colon: boolean;
  requiredMark: boolean | 'optional';
  hasFeedback: boolean;
}

export interface FormContextValue extends FormPresentation {
  values: FieldRecord<unknown>;
  errors: FieldRecord<string[]>;
  touched: FieldRecord<boolean>;
  validating: FieldRecord<boolean>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, errors: string[]) => void;
  setTouched: (name: string, touched: boolean) => void;
  registerField: (name: string, initialValue?: unknown, rules?: FormRule[]) => void;
  /** Drops a field's rules and errors when its item leaves the tree, so a removed control cannot keep failing submit. */
  unregisterField: (name: string) => void;
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
  getFieldRules: (name: string) => FormRule[] | undefined;
}

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

type InternalFormInstance<T> = FormInstance<T> & {
  __subscribe?: (listener: () => void) => () => void;
  __getValues?: () => FieldRecord<unknown>;
};

/**
 * A stable FormInstance. State lives in refs so the instance identity never
 * changes; a mounted form wraps its methods to keep React state in sync.
 */
export function useForm<T = unknown>(): [FormInstance<T>] {
  const valuesRef = useRef<FieldRecord<unknown>>({});
  const errorsRef = useRef<FieldRecord<string[]>>({});
  const touchedRef = useRef<FieldRecord<boolean>>({});
  const listenersRef = useRef<Set<() => void>>(new Set());

  const instance = useMemo<InternalFormInstance<T>>(() => {
    const notify = () => listenersRef.current.forEach((listener) => listener());
    return {
      getFieldValue: (name) => readOwnRecordValue(valuesRef.current, toFieldKey(name)),
      getFieldsValue: (nameList) => {
        if (!nameList) return valuesRef.current as T;
        const result: FieldRecord<unknown> = {};
        nameList.forEach((name) => {
          const key = toFieldKey(name);
          writeOwnRecordValue(result, key, readOwnRecordValue(valuesRef.current, key));
        });
        return result as T;
      },
      setFieldValue: (name, value) => {
        writeOwnRecordValue(valuesRef.current, toFieldKey(name), value);
        notify();
      },
      setFieldsValue: (values) => {
        Object.assign(valuesRef.current, values);
        notify();
      },
      resetFields: (fields) => {
        if (fields) {
          fields.forEach((name) => {
            const key = toFieldKey(name);
            deleteOwnRecordValue(valuesRef.current, key);
            deleteOwnRecordValue(errorsRef.current, key);
            deleteOwnRecordValue(touchedRef.current, key);
          });
        } else {
          valuesRef.current = {};
          errorsRef.current = {};
          touchedRef.current = {};
        }
        notify();
      },
      validateFields: async () => valuesRef.current as T,
      submit: () => {},
      isFieldTouched: (name) => Boolean(readOwnRecordValue(touchedRef.current, toFieldKey(name))),
      isFieldsTouched: () => Object.values(touchedRef.current).some(Boolean),
      getFieldError: (name) => readOwnRecordValue(errorsRef.current, toFieldKey(name)) ?? [],
      getFieldsError: () =>
        Object.entries(errorsRef.current).map(([name, errors]) => ({ name, errors })) as FieldData[],
      isFieldValidating: () => false,
      scrollToField: () => {},
      __subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      __getValues: () => ({ ...valuesRef.current }),
    };
  }, []);

  return [instance];
}

export interface FormRuntimeOptions {
  form?: FormInstance<unknown>;
  initialValues?: FormProps['initialValues'];
  scrollToFirstError?: FormProps['scrollToFirstError'];
  onValuesChange?: FormProps['onValuesChange'];
  onFinish?: FormProps['onFinish'];
  onFinishFailed?: FormProps['onFinishFailed'];
  presentation: FormPresentation;
  /** The engine's default rule messages; the `validation` catalog when omitted. */
  catalog?: ValidationCatalog;
}

export interface FormRuntime {
  resolvedForm: FormInstance<unknown>;
  formRef: React.MutableRefObject<HTMLFormElement | null>;
  contextValue: FormContextValue;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

function findField(form: HTMLFormElement | null, key: string): Element | null {
  return form?.querySelector(`[id="form-${key}"]`) || form?.querySelector(`[name="${key}"]`) || null;
}

/** The state, validation and submission of one mounted form. */
export function useFormRuntime(options: FormRuntimeOptions): FormRuntime {
  const catalog = options.catalog ?? VALIDATION_CATALOG;
  const { t } = useTranslation(catalog.namespace);
  const {
    form,
    initialValues = {},
    scrollToFirstError = false,
    onValuesChange,
    onFinish,
    onFinishFailed,
    presentation,
  } = options;
  const [internalForm] = useForm();
  const resolvedForm = form ?? internalForm;
  const formRef = useRef<HTMLFormElement | null>(null);

  const [values, setValues] = useState<FieldRecord<unknown>>(initialValues as FieldRecord<unknown>);
  const [errors, setErrors] = useState<FieldRecord<string[]>>({});
  const [touched, setTouchedState] = useState<FieldRecord<boolean>>({});
  const [validating, setValidating] = useState<FieldRecord<boolean>>({});
  const fieldRulesRef = useRef<FieldRecord<FormRule[] | undefined>>({});
  const valuesRef = useRef<FieldRecord<unknown>>(initialValues as FieldRecord<unknown>);

  const commitValues = useCallback((next: FieldRecord<unknown>) => {
    valuesRef.current = next;
    setValues(next);
  }, []);

  const getFieldRules = useCallback(
    (fieldName: string) => readOwnRecordValue(fieldRulesRef.current, fieldName),
    [],
  );

  // A programmatic change through the public instance also moves React state.
  useEffect(() => {
    const { setFieldsValue, setFieldValue, resetFields, submit } = resolvedForm;

    resolvedForm.setFieldsValue = (next) => {
      setFieldsValue.call(resolvedForm, next);
      commitValues({ ...valuesRef.current, ...(next as FieldRecord<unknown>) });
    };
    resolvedForm.setFieldValue = (name, value) => {
      setFieldValue.call(resolvedForm, name, value);
      commitValues(copyWithOwnRecordValue(valuesRef.current, toFieldKey(name), value));
    };
    resolvedForm.resetFields = (fields) => {
      resetFields.call(resolvedForm, fields);
      if (fields) {
        setValues((previous) => {
          const next = { ...previous };
          fields.forEach((field) => deleteOwnRecordValue(next, toFieldKey(field)));
          valuesRef.current = next;
          return next;
        });
      } else {
        commitValues(initialValues as FieldRecord<unknown>);
      }
    };
    resolvedForm.submit = () => {
      if (formRef.current?.requestSubmit) {
        formRef.current.requestSubmit();
        return;
      }
      formRef.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    };

    return () => {
      resolvedForm.setFieldsValue = setFieldsValue;
      resolvedForm.setFieldValue = setFieldValue;
      resolvedForm.resetFields = resetFields;
      resolvedForm.submit = submit;
    };
  }, [resolvedForm, initialValues, commitValues]);

  const setValue = useCallback((fieldName: string, value: unknown) => {
    const next = copyWithOwnRecordValue(valuesRef.current, fieldName, value);
    commitValues(next);
    onValuesChange?.(copyWithOwnRecordValue({}, fieldName, value) as Partial<unknown>, next as unknown);
  }, [commitValues, onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors((previous) => copyWithOwnRecordValue(previous, fieldName, fieldErrors));
  }, []);

  const setTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouchedState((previous) => copyWithOwnRecordValue(previous, fieldName, isTouched));
  }, []);

  const registerField = useCallback((fieldName: string, initialValue?: unknown, rules?: FormRule[]) => {
    writeOwnRecordValue(fieldRulesRef.current, fieldName, rules);
    if (initialValue !== undefined && readOwnRecordValue(values, fieldName) === undefined) {
      commitValues(copyWithOwnRecordValue(valuesRef.current, fieldName, initialValue));
    }
  }, [values, commitValues]);

  const unregisterField = useCallback((fieldName: string) => {
    deleteOwnRecordValue(fieldRulesRef.current, fieldName);
    setErrors((previous) => {
      if (readOwnRecordValue(previous, fieldName) === undefined) return previous;
      const next = { ...previous };
      deleteOwnRecordValue(next, fieldName);
      return next;
    });
  }, []);

  const messages = useMemo(() => catalog.create(t), [catalog, t]);

  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];
    setValidating((previous) => copyWithOwnRecordValue(previous, fieldName, true));
    const fieldErrors = await validateRules(rules, readOwnRecordValue(valuesRef.current, fieldName), messages, fieldName);
    setValidating((previous) => copyWithOwnRecordValue(previous, fieldName, false));
    setError(fieldName, fieldErrors);
    return fieldErrors;
  }, [messages, setError]);

  // The bare instance owns no rules registry; a mounted form supplies real validation and scrolling.
  useEffect(() => {
    const { validateFields, scrollToField } = resolvedForm;

    resolvedForm.validateFields = (async (nameList?: FieldName[]) => {
      const names = nameList ? nameList.map(toFieldKey) : Object.keys(fieldRulesRef.current);
      const entries = await Promise.all(
        names.map(async (fieldName) => [fieldName, await validateField(fieldName, getFieldRules(fieldName))] as const),
      );
      const failed = entries.filter(([, fieldErrors]) => fieldErrors.length > 0);
      if (failed.length > 0) {
        throw {
          values: valuesRef.current,
          errorFields: failed.map(([fieldName, fieldErrors]) => ({ name: fieldName, errors: fieldErrors })),
          outOfDate: false,
        };
      }
      return valuesRef.current;
    }) as FormInstance['validateFields'];

    resolvedForm.scrollToField = (name, scrollOptions) => {
      findField(formRef.current, toFieldKey(name))?.scrollIntoView(scrollOptions ?? { behavior: 'smooth', block: 'center' });
    };

    return () => {
      resolvedForm.validateFields = validateFields;
      resolvedForm.scrollToField = scrollToField;
    };
  }, [resolvedForm, validateField, getFieldRules]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const entries = await Promise.all(
      Object.entries(fieldRulesRef.current).map(async ([fieldName, rules]) => [fieldName, await validateField(fieldName, rules)] as const),
    );
    const errorFields: FieldData[] = entries
      .filter(([, fieldErrors]) => fieldErrors.length > 0)
      .map(([fieldName, fieldErrors]) => ({ name: fieldName, errors: fieldErrors }));

    if (errorFields.length === 0) {
      onFinish?.(valuesRef.current as unknown);
      return;
    }
    onFinishFailed?.({ values: valuesRef.current as unknown, errorFields, outOfDate: false });
    const first = errorFields[0]?.name;
    if (scrollToFirstError && first !== undefined) {
      findField(formRef.current, toFieldKey(first))?.scrollIntoView(
        typeof scrollToFirstError === 'object' ? scrollToFirstError : { behavior: 'smooth', block: 'center' },
      );
    }
  };

  const { layout, size, labelAlign, disabled, colon, requiredMark, hasFeedback } = presentation;
  const contextValue = useMemo<FormContextValue>(() => ({
    values,
    errors,
    touched,
    validating,
    setValue,
    setError,
    setTouched,
    registerField,
    unregisterField,
    validateField,
    getFieldRules,
    layout,
    size,
    labelAlign,
    disabled,
    colon,
    requiredMark,
    hasFeedback,
  }), [values, errors, touched, validating, setValue, setError, setTouched, registerField, unregisterField, validateField, getFieldRules, layout, size, labelAlign, disabled, colon, requiredMark, hasFeedback]);

  return { resolvedForm, formRef, contextValue, handleSubmit };
}

/** The runtime a form root renders from, with the presentation props read once. */
export function useFormRoot(props: FormProps, layout: FormLayout, catalog?: ValidationCatalog): FormRuntime {
  const {
    form,
    initialValues,
    colon = true,
    size = 'default',
    labelAlign,
    disabled = false,
    requiredMark = true,
    scrollToFirstError,
    hasFeedback = false,
    onValuesChange,
    onFinish,
    onFinishFailed,
  } = props;
  return useFormRuntime({
    form,
    initialValues,
    scrollToFirstError,
    onValuesChange,
    onFinish,
    onFinishFailed,
    presentation: { layout, size: toCanonicalSize(size), labelAlign, disabled, colon, requiredMark, hasFeedback },
    catalog,
  });
}

export interface FormItemRuntime {
  context: FormContextValue;
  fieldName: string;
  fieldValue: unknown;
  fieldErrors: string[];
  hasError: boolean;
  isWarning: boolean;
  isRequired: boolean;
  showColon: boolean;
  showFeedback: boolean;
  generatedControlId: string | undefined;
  feedbackStatus: FeedbackStatus | null;
  valuePropName?: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement> | unknown) => void;
}

/** One item's registration, dependency re-validation and derived validation posture. */
export function useFormItem(props: FormItemProps): FormItemRuntime {
  const {
    name,
    rules,
    required,
    validateStatus,
    hasFeedback: itemHasFeedback,
    initialValue,
    valuePropName = 'value',
    colon: itemColon,
    dependencies,
  } = props;

  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form.Item must be used within a Form');
  }
  const { values, errors, touched, validating, setValue, setTouched, registerField, unregisterField, validateField } = context;
  const fieldName = toFieldKey(name);

  useEffect(() => {
    if (fieldName) registerField(fieldName, initialValue, rules);
  }, [fieldName, initialValue, registerField, rules]);

  // Registration re-runs on every inline `rules` literal, so it never carries the teardown.
  useEffect(() => {
    if (!fieldName) return undefined;
    return () => unregisterField(fieldName);
  }, [fieldName, unregisterField]);

  const dependencyKey = dependencies
    ?.map((dependency) => {
      const key = toFieldKey(dependency);
      return `${key}:${JSON.stringify(readOwnRecordValue(values, key))}`;
    })
    .join('|');

  useEffect(() => {
    if (!dependencies || !fieldName || !rules) return;
    if (readOwnRecordValue(touched, fieldName)) validateField(fieldName, rules);
  }, [dependencyKey]);

  const fieldValue = fieldName ? readOwnRecordValue(values, fieldName) : undefined;
  const fieldErrors = fieldName ? (readOwnRecordValue(errors, fieldName) ?? []) : [];
  const isValidating = fieldName ? Boolean(readOwnRecordValue(validating, fieldName)) : false;
  const isTouched = fieldName ? Boolean(readOwnRecordValue(touched, fieldName)) : false;
  const hasError = validateStatus === 'error' || fieldErrors.length > 0;
  const isWarning = validateStatus === 'warning';
  const isSuccess =
    validateStatus === 'success' ||
    (isTouched && fieldErrors.length === 0 && !isValidating && fieldValue !== undefined && fieldValue !== '');

  const feedbackStatus: FeedbackStatus | null =
    validateStatus === 'validating' || isValidating
      ? 'validating'
      : hasError
        ? 'error'
        : isWarning
          ? 'warning'
          : isSuccess
            ? 'success'
            : null;

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement> | unknown) => {
    if (!fieldName) return;
    const target = (event as React.ChangeEvent<HTMLInputElement>)?.target;
    const value = valuePropName === 'checked' ? target?.checked ?? Boolean(event) : target?.value ?? event;
    setValue(fieldName, value);
    setTouched(fieldName, true);
    if (rules) validateField(fieldName, rules);
  }, [fieldName, setValue, setTouched, rules, validateField, valuePropName]);

  return {
    context,
    fieldName,
    fieldValue,
    fieldErrors,
    hasError,
    isWarning,
    isRequired: Boolean(required || rules?.some((rule) => rule.required)),
    showColon: itemColon ?? context.colon,
    showFeedback: itemHasFeedback ?? context.hasFeedback,
    generatedControlId: fieldName ? `form-${fieldName}` : undefined,
    feedbackStatus,
    valuePropName,
    handleChange,
  };
}

interface BoundControlProps {
  id?: string;
  type?: string;
  disabled?: boolean;
}

/**
 * The item's controls, bound to the field: id, value (or `checked`), change and
 * disabled. `aria` also states the message relation and the invalid/required posture.
 */
export function bindFormItemControls(
  children: React.ReactNode,
  item: FormItemRuntime,
  aria?: { describedBy: string | undefined },
): React.ReactNode {
  const { fieldValue, handleChange, generatedControlId, valuePropName = 'value', hasError, isRequired, context } = item;
  return React.Children.map(children, (child) => {
    if (!React.isValidElement<BoundControlProps>(child)) return child;
    const usesCheckedValue = valuePropName === 'checked' || child.props.type === 'checkbox';
    return React.cloneElement(child, {
      id: child.props.id ?? generatedControlId,
      [usesCheckedValue ? 'checked' : valuePropName]: usesCheckedValue ? Boolean(fieldValue) : (fieldValue ?? ''),
      onChange: handleChange,
      disabled: context.disabled || child.props.disabled,
      ...(aria
        ? { 'aria-describedby': aria.describedBy, 'aria-invalid': hasError || undefined, 'aria-required': isRequired || undefined }
        : {}),
    } as Partial<BoundControlProps>);
  });
}

/** Add, remove and move operations over a dynamic field list, with stable keys. */
export function useFormList(initialValue: unknown[] | undefined): {
  fields: FormListFieldData[];
  operation: FormListOperation;
} {
  const [fields, setFields] = useState<Array<{ key: number; name: number }>>(() =>
    (initialValue || []).map((_, index) => ({ key: index, name: index })),
  );
  const keyRef = useRef(fields.length);

  const operation = useMemo<FormListOperation>(() => ({
    add: (_defaultValue, insertIndex) => {
      const field = { key: keyRef.current++, name: fields.length, isListField: true };
      setFields((previous) =>
        insertIndex !== undefined
          ? [...previous.slice(0, insertIndex), field, ...previous.slice(insertIndex)]
          : [...previous, field],
      );
    },
    remove: (index) => {
      const indices = Array.isArray(index) ? index : [index];
      setFields((previous) => previous.filter((_, position) => !indices.includes(position)));
    },
    move: (from, to) => {
      setFields((previous) => {
        const next = [...previous];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
  }), [fields.length]);

  return {
    fields: fields.map((field, index) => ({ ...field, name: index, isListField: true })),
    operation,
  };
}

/** Form.List renders no chrome of its own, so every engine shares it. */
export const FormList: React.FC<FormListProps> = ({ initialValue, children }) => {
  const { fields, operation } = useFormList(initialValue);
  return <>{children(fields, operation, { errors: [], warnings: [] })}</>;
};

FormList.displayName = 'Form.List';

/** The public compound: an engine's root, item and error list with the shared list and `useForm`. */
export function composeForm<Root extends object>(
  root: Root,
  parts: { Item: React.FC<FormItemProps>; ErrorList: React.FC<FormErrorListProps> },
) {
  return Object.assign(root, { Item: parts.Item, List: FormList, ErrorList: parts.ErrorList, useForm });
}

/** The errors an error list shows: one field's, or every field's; `null` outside a form. */
export function useFormErrors(fieldName: FieldName | undefined): string[] | null {
  const context = useContext(FormContext);
  if (!context) return null;
  return fieldName
    ? readOwnRecordValue(context.errors, toFieldKey(fieldName)) ?? []
    : Object.values(context.errors).flat();
}
