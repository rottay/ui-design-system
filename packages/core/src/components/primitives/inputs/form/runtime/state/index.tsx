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

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

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

function hasOwnRecordKey(record: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
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

/**
 * What a mounted form lends its instance: the declared initial values, the
 * registered rules, real validation, and the rendered `<form>` element.
 */
interface MountedForm {
  initialValues: () => FieldRecord<unknown>;
  rules: () => FieldRecord<FormRule[] | undefined>;
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
  element: () => HTMLFormElement | null;
}

/**
 * The single store behind one form. The public instance and the rendered
 * fields both read and write these records, so a getter can never disagree
 * with what is on screen. Records are replaced, never mutated in place, so a
 * memo keyed on their identity still sees every change.
 */
interface FormStore {
  values: FieldRecord<unknown>;
  errors: FieldRecord<string[]>;
  touched: FieldRecord<boolean>;
  validating: FieldRecord<boolean>;
  version: number;
  listeners: Set<() => void>;
  host: MountedForm | null;
}

function createFormStore(): FormStore {
  return { values: {}, errors: {}, touched: {}, validating: {}, version: 0, listeners: new Set(), host: null };
}

function notifyStore(store: FormStore): void {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

/** The store is keyed off the instance, so the public shape stays the contract's. */
const FORM_STORES = new WeakMap<object, FormStore>();

function formStoreOf(instance: FormInstance<never> | FormInstance<unknown> | object): FormStore {
  const existing = FORM_STORES.get(instance);
  if (existing) return existing;
  const store = createFormStore();
  FORM_STORES.set(instance, store);
  return store;
}

/** Adds the initial values of fields nobody has written yet; safe to repeat. */
function seedInitialValues(store: FormStore, initialValues: FieldRecord<unknown>): void {
  const missing = Object.keys(initialValues).filter((key) => !hasOwnRecordKey(store.values, key));
  if (missing.length === 0) return;
  const next = { ...store.values };
  missing.forEach((key) => writeOwnRecordValue(next, key, readOwnRecordValue(initialValues, key)));
  store.values = next;
}

type InternalFormInstance<T> = FormInstance<T> & {
  __subscribe?: (listener: () => void) => () => void;
  __getValues?: () => FieldRecord<unknown>;
};

function findField(form: HTMLFormElement | null, key: string): Element | null {
  return form?.querySelector(`[id="form-${key}"]`) || form?.querySelector(`[name="${key}"]`) || null;
}

/**
 * A stable FormInstance over the form's single store, so its identity never
 * changes and its getters report what the mounted form renders.
 */
export function useForm<T = unknown>(): [FormInstance<T>] {
  const storeRef = useRef<FormStore | null>(null);
  storeRef.current ??= createFormStore();

  const instance = useMemo<InternalFormInstance<T>>(() => {
    const store = storeRef.current as FormStore;
    const created: InternalFormInstance<T> = {
      getFieldValue: (name) => readOwnRecordValue(store.values, toFieldKey(name)),
      getFieldsValue: (nameList) => {
        if (!nameList) return store.values as T;
        const result: FieldRecord<unknown> = {};
        nameList.forEach((name) => {
          const key = toFieldKey(name);
          writeOwnRecordValue(result, key, readOwnRecordValue(store.values, key));
        });
        return result as T;
      },
      setFieldValue: (name, value) => {
        store.values = copyWithOwnRecordValue(store.values, toFieldKey(name), value);
        notifyStore(store);
      },
      setFieldsValue: (values) => {
        store.values = { ...store.values, ...(values as FieldRecord<unknown>) };
        notifyStore(store);
      },
      resetFields: (fields) => {
        const initial = store.host?.initialValues() ?? {};
        if (fields) {
          const values = { ...store.values };
          const errors = { ...store.errors };
          const touched = { ...store.touched };
          const validating = { ...store.validating };
          fields.forEach((name) => {
            const key = toFieldKey(name);
            deleteOwnRecordValue(values, key);
            deleteOwnRecordValue(errors, key);
            deleteOwnRecordValue(touched, key);
            deleteOwnRecordValue(validating, key);
            if (hasOwnRecordKey(initial, key)) writeOwnRecordValue(values, key, readOwnRecordValue(initial, key));
          });
          store.values = values;
          store.errors = errors;
          store.touched = touched;
          store.validating = validating;
        } else {
          store.values = { ...initial };
          store.errors = {};
          store.touched = {};
          store.validating = {};
        }
        notifyStore(store);
      },
      validateFields: (async (nameList?: FieldName[]) => {
        const host = store.host;
        if (!host) return store.values as T;
        const rules = host.rules();
        const names = nameList ? nameList.map(toFieldKey) : Object.keys(rules);
        const entries = await Promise.all(
          names.map(async (key) => [key, await host.validateField(key, readOwnRecordValue(rules, key))] as const),
        );
        const failed = entries.filter(([, fieldErrors]) => fieldErrors.length > 0);
        if (failed.length > 0) {
          throw {
            values: store.values,
            errorFields: failed.map(([fieldName, fieldErrors]) => ({ name: fieldName, errors: fieldErrors })),
            outOfDate: false,
          };
        }
        return store.values as T;
      }) as FormInstance<T>['validateFields'],
      submit: () => {
        const element = store.host?.element();
        if (!element) return;
        if (element.requestSubmit) {
          element.requestSubmit();
          return;
        }
        element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      },
      isFieldTouched: (name) => Boolean(readOwnRecordValue(store.touched, toFieldKey(name))),
      isFieldsTouched: () => Object.values(store.touched).some(Boolean),
      getFieldError: (name) => readOwnRecordValue(store.errors, toFieldKey(name)) ?? [],
      getFieldsError: () =>
        Object.entries(store.errors).map(([name, errors]) => ({ name, errors })) as FieldData[],
      isFieldValidating: (name) => Boolean(readOwnRecordValue(store.validating, toFieldKey(name))),
      scrollToField: (name, scrollOptions) => {
        findField(store.host?.element() ?? null, toFieldKey(name))
          ?.scrollIntoView(scrollOptions ?? { behavior: 'smooth', block: 'center' });
      },
      __subscribe: (listener) => {
        store.listeners.add(listener);
        return () => { store.listeners.delete(listener); };
      },
      __getValues: () => ({ ...store.values }),
    };
    FORM_STORES.set(created, store);
    return created;
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
  const store = formStoreOf(resolvedForm);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fieldRulesRef = useRef<FieldRecord<FormRule[] | undefined>>({});

  seedInitialValues(store, initialValues as FieldRecord<unknown>);

  const subscribe = useCallback((listener: () => void) => {
    store.listeners.add(listener);
    return () => { store.listeners.delete(listener); };
  }, [store]);
  const readVersion = useCallback(() => store.version, [store]);
  useSyncExternalStore(subscribe, readVersion, readVersion);

  const getFieldRules = useCallback(
    (fieldName: string) => readOwnRecordValue(fieldRulesRef.current, fieldName),
    [],
  );

  const setValue = useCallback((fieldName: string, value: unknown) => {
    store.values = copyWithOwnRecordValue(store.values, fieldName, value);
    notifyStore(store);
    onValuesChange?.(copyWithOwnRecordValue({}, fieldName, value) as Partial<unknown>, store.values as unknown);
  }, [store, onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    store.errors = copyWithOwnRecordValue(store.errors, fieldName, fieldErrors);
    notifyStore(store);
  }, [store]);

  const setTouched = useCallback((fieldName: string, isTouched: boolean) => {
    store.touched = copyWithOwnRecordValue(store.touched, fieldName, isTouched);
    notifyStore(store);
  }, [store]);

  const setValidating = useCallback((fieldName: string, isValidating: boolean) => {
    store.validating = copyWithOwnRecordValue(store.validating, fieldName, isValidating);
    notifyStore(store);
  }, [store]);

  const registerField = useCallback((fieldName: string, initialValue?: unknown, rules?: FormRule[]) => {
    writeOwnRecordValue(fieldRulesRef.current, fieldName, rules);
    if (initialValue !== undefined && readOwnRecordValue(store.values, fieldName) === undefined) {
      store.values = copyWithOwnRecordValue(store.values, fieldName, initialValue);
      notifyStore(store);
    }
  }, [store]);

  const unregisterField = useCallback((fieldName: string) => {
    deleteOwnRecordValue(fieldRulesRef.current, fieldName);
    if (readOwnRecordValue(store.errors, fieldName) === undefined) return;
    const next = { ...store.errors };
    deleteOwnRecordValue(next, fieldName);
    store.errors = next;
    notifyStore(store);
  }, [store]);

  const messages = useMemo(() => catalog.create(t), [catalog, t]);

  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];
    setValidating(fieldName, true);
    const fieldErrors = await validateRules(rules, readOwnRecordValue(store.values, fieldName), messages, fieldName);
    setValidating(fieldName, false);
    setError(fieldName, fieldErrors);
    return fieldErrors;
  }, [store, messages, setError, setValidating]);

  // The bare instance owns no rules registry; a mounted form lends it real
  // validation, submission and scrolling for as long as it stays in the tree.
  const initialValuesRef = useRef(initialValues as FieldRecord<unknown>);
  const validateFieldRef = useRef(validateField);
  useEffect(() => {
    initialValuesRef.current = initialValues as FieldRecord<unknown>;
    validateFieldRef.current = validateField;
  });

  const hostRef = useRef<MountedForm | null>(null);
  hostRef.current ??= {
    initialValues: () => initialValuesRef.current,
    rules: () => fieldRulesRef.current,
    validateField: (fieldName, rules) => validateFieldRef.current(fieldName, rules),
    element: () => formRef.current,
  };

  useEffect(() => {
    const host = hostRef.current;
    store.host = host;
    return () => {
      if (store.host === host) store.host = null;
    };
  }, [store]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const entries = await Promise.all(
      Object.entries(fieldRulesRef.current).map(async ([fieldName, rules]) => [fieldName, await validateField(fieldName, rules)] as const),
    );
    const errorFields: FieldData[] = entries
      .filter(([, fieldErrors]) => fieldErrors.length > 0)
      .map(([fieldName, fieldErrors]) => ({ name: fieldName, errors: fieldErrors }));

    if (errorFields.length === 0) {
      onFinish?.(store.values as unknown);
      return;
    }
    onFinishFailed?.({ values: store.values as unknown, errorFields, outOfDate: false });
    const first = errorFields[0]?.name;
    if (scrollToFirstError && first !== undefined) {
      findField(formRef.current, toFieldKey(first))?.scrollIntoView(
        typeof scrollToFirstError === 'object' ? scrollToFirstError : { behavior: 'smooth', block: 'center' },
      );
    }
  };

  const { values, errors, touched, validating } = store;
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
