'use client';

/**
 * @fileoverview The one form runtime: field registration, values, errors,
 * warnings, touched and validating state, dynamic lists, submission and the
 * `useForm` instance. Every engine that owns its own form renders from it;
 * none re-implements it.
 *
 * @module Form/Runtime/State
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { useTranslation } from '@/infrastructure/runtime/i18n';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import type { FieldData, FormInstance, FormErrorListProps, FormItemProps, FormLayout, FormListFieldData, FormListOperation, FormListProps, FormProps, FormRule } from '../../contracts';
import { VALIDATION_CATALOG, evaluateRules, type RuleOutcome, type ValidationCatalog } from '../validation';

type FieldName = string | number | (string | number)[];
type FieldRecord<T> = Record<string, T>;

export type FeedbackStatus = 'success' | 'error' | 'warning' | 'validating';

/** Field paths are stored flat, keyed by their dot-joined path. */
export function toFieldKey(name: FieldName | undefined): string {
  return Array.isArray(name) ? name.join('.') : String(name ?? '');
}

/** A field inside a list is addressed relative to the list; the list's own path comes first. */
function joinFieldKey(parent: string | null, key: string): string {
  if (!parent || !key) return key;
  return `${parent}.${key}`;
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

function copyWithoutOwnRecordKey<T>(record: FieldRecord<T>, key: string): FieldRecord<T> {
  const next = { ...record };
  deleteOwnRecordValue(next, key);
  return next;
}

function isUnder(key: string, prefix: string): boolean {
  return key === prefix || key.startsWith(`${prefix}.`);
}

function copyWithoutPrefix<T>(record: FieldRecord<T>, prefix: string): FieldRecord<T> {
  const next: FieldRecord<T> = {};
  Object.keys(record).forEach((key) => {
    if (!isUnder(key, prefix)) writeOwnRecordValue(next, key, readOwnRecordValue(record, key) as T);
  });
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

/** Spreads a nested value over its flat dot-joined keys; a scalar lands on the prefix itself. */
function writeFlattened(record: FieldRecord<unknown>, prefix: string, value: unknown, onlyIfUnset = false): void {
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => writeFlattened(record, `${prefix}.${key}`, value[key], onlyIfUnset));
    return;
  }
  if (value === undefined) return;
  if (onlyIfUnset && readOwnRecordValue(record, prefix) !== undefined) return;
  writeOwnRecordValue(record, prefix, value);
}

/** The own slot at a runtime index, exactly what `items[index]` reads. */
function readOwnIndex(items: readonly unknown[], index: number): unknown {
  if (!Object.prototype.hasOwnProperty.call(items, index)) return undefined;
  return Reflect.get(items, index);
}

/** Walks a nested initial value down a relative dot-joined path. */
function readNestedAt(value: unknown, path: string): unknown {
  if (!path) return value;
  let current: unknown = value;
  for (const segment of path.split('.')) {
    if (Array.isArray(current)) current = readOwnIndex(current, Number(segment));
    else if (isPlainObject(current)) current = readOwnRecordValue(current, segment);
    else return undefined;
  }
  return current;
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

/** One dynamic list: the stable key of each row and the rows it resets to. */
interface ListState {
  keys: number[];
  nextKey: number;
  initial: unknown[];
}

export interface FormContextValue extends FormPresentation {
  values: FieldRecord<unknown>;
  errors: FieldRecord<string[]>;
  warnings: FieldRecord<string[]>;
  touched: FieldRecord<boolean>;
  validating: FieldRecord<boolean>;
  lists: FieldRecord<ListState>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, errors: string[]) => void;
  setTouched: (name: string, touched: boolean) => void;
  registerField: (name: string, initialValue?: unknown, rules?: FormRule[]) => void;
  /** Drops a field's rules, reset default, errors and warnings when its item leaves the tree, so a removed control cannot keep failing submit. */
  unregisterField: (name: string) => void;
  validateField: (name: string, rules?: FormRule[]) => Promise<string[]>;
  getFieldRules: (name: string) => FormRule[] | undefined;
  /** Adopts a list's rows once and keeps its rules current. */
  registerList: (name: string, initialValue: unknown[] | undefined, rules?: FormRule[]) => void;
  unregisterList: (name: string) => void;
  listOperation: (name: string) => FormListOperation;
  /** Closes the commit a list operation opened: names it re-owned are ordinary again. */
  settleRelocations: () => void;
}

export const FormContext = createContext<FormContextValue | null>(null);

/** The dot-joined path of the list an item renders inside, so its relative name resolves to the full field. */
const FormListPathContext = createContext<string | null>(null);

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
  warnings: FieldRecord<string[]>;
  touched: FieldRecord<boolean>;
  validating: FieldRecord<boolean>;
  /** The `initialValue` each mounted item declared: a field's reset value when the form's `initialValues` say nothing. */
  defaults: FieldRecord<unknown>;
  lists: FieldRecord<ListState>;
  /** Names a list operation re-owned this commit; the unregister of the item that used to hold one must not drop its records. */
  relocated: Set<string>;
  version: number;
  listeners: Set<() => void>;
  host: MountedForm | null;
}

function createFormStore(): FormStore {
  return {
    values: {},
    errors: {},
    warnings: {},
    touched: {},
    validating: {},
    defaults: {},
    lists: {},
    relocated: new Set(),
    version: 0,
    listeners: new Set(),
    host: null,
  };
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

/** The list initial row a flat key falls in, if any list covers it. */
function listInitialAt(store: FormStore, key: string): unknown {
  for (const listKey of Object.keys(store.lists)) {
    const entry = listEntry(key, listKey);
    if (!entry) continue;
    const list = readOwnRecordValue(store.lists, listKey) as ListState;
    return readNestedAt(list.initial[entry.index], entry.rest);
  }
  return undefined;
}

/** Fills the slots the form's own `initialValues` left undefined: a list's initial row first, then the items' registered `initialValue`s. */
function fillFieldDefaults(store: FormStore, values: FieldRecord<unknown>, keys: string[]): void {
  keys.forEach((key) => {
    if (readOwnRecordValue(values, key) !== undefined) return;
    const fromList = listInitialAt(store, key);
    if (fromList !== undefined) {
      writeOwnRecordValue(values, key, fromList);
      return;
    }
    if (hasOwnRecordKey(store.defaults, key)) writeOwnRecordValue(values, key, readOwnRecordValue(store.defaults, key));
  });
}

// ---------------------------------------------------------------------------
// Dynamic lists over the flat store
// ---------------------------------------------------------------------------

/** The row index and the remainder of a flat key that lives under a list. */
function listEntry(key: string, listKey: string): { index: number; rest: string } | null {
  const head = `${listKey}.`;
  if (!key.startsWith(head)) return null;
  const match = /^(\d+)(\..*)?$/.exec(key.slice(head.length));
  if (!match) return null;
  return { index: Number(match[1]), rest: match[2] ? match[2].slice(1) : '' };
}

function highestListIndex(record: FieldRecord<unknown>, listKey: string): number {
  return Object.keys(record).reduce((highest, key) => {
    const entry = listEntry(key, listKey);
    return entry && entry.index > highest ? entry.index : highest;
  }, -1);
}

/** How many rows a list adopts: its initial rows, or more when values already sit under it (an item default, a preserved edit). */
function adoptedRowCount(values: FieldRecord<unknown>, listKey: string, initial: unknown[]): number {
  return Math.max(highestListIndex(values, listKey) + 1, initial.length);
}

/** Re-indexes every record under a list; a row mapped to `null` is dropped. */
function remapListRecord<T>(record: FieldRecord<T>, listKey: string, mapIndex: (index: number) => number | null): FieldRecord<T> {
  const next: FieldRecord<T> = {};
  Object.keys(record).forEach((key) => {
    const entry = listEntry(key, listKey);
    if (!entry) {
      writeOwnRecordValue(next, key, readOwnRecordValue(record, key) as T);
      return;
    }
    const to = mapIndex(entry.index);
    if (to === null) return;
    writeOwnRecordValue(next, `${listKey}.${to}${entry.rest ? `.${entry.rest}` : ''}`, readOwnRecordValue(record, key) as T);
  });
  return next;
}

/** The value a flat key stands for: a registered list becomes its array of rows, a nested prefix its object. */
function materialize(store: FormStore, key: string): unknown {
  const list = readOwnRecordValue(store.lists, key);
  if (list) return list.keys.map((_, index) => materialize(store, `${key}.${index}`));
  if (hasOwnRecordKey(store.values, key)) return readOwnRecordValue(store.values, key);
  const head = `${key}.`;
  let result: Record<string, unknown> | undefined;
  const seen = new Set<string>();
  Object.keys(store.values).forEach((flat) => {
    if (!flat.startsWith(head)) return;
    const segment = flat.slice(head.length).split('.')[0] as string;
    if (seen.has(segment)) return;
    seen.add(segment);
    (result ??= {})[segment] = materialize(store, `${key}.${segment}`);
  });
  return result;
}

function readFieldValue(store: FormStore, key: string): unknown {
  return hasOwnRecordKey(store.lists, key) ? materialize(store, key) : readOwnRecordValue(store.values, key);
}

/** The values as the contract hands them out: flat keys, with every top-level list materialized as an array. */
function publicValues(store: FormStore): FieldRecord<unknown> {
  const listKeys = Object.keys(store.lists);
  if (listKeys.length === 0) return { ...store.values };
  const result: FieldRecord<unknown> = {};
  Object.keys(store.values).forEach((key) => {
    if (listKeys.some((listKey) => isUnder(key, listKey))) return;
    writeOwnRecordValue(result, key, readOwnRecordValue(store.values, key));
  });
  listKeys
    .filter((listKey) => !listKeys.some((other) => other !== listKey && isUnder(listKey, other)))
    .forEach((listKey) => writeOwnRecordValue(result, listKey, materialize(store, listKey)));
  return result;
}

function listRows(rows: unknown[], nextKey: number): ListState {
  return { keys: rows.map((_, index) => nextKey + index), nextKey: nextKey + rows.length, initial: rows };
}

/** Replaces a list's rows outright: fresh keys, the rows' values, nothing else under it. */
function replaceListRows(store: FormStore, listKey: string, rows: unknown[], initial: unknown[]): void {
  const current = readOwnRecordValue(store.lists, listKey);
  const nextKey = current?.nextKey ?? 0;
  const values = copyWithoutPrefix(store.values, listKey);
  rows.forEach((row, index) => writeFlattened(values, `${listKey}.${index}`, row));
  store.values = values;
  store.errors = copyWithoutPrefix(store.errors, listKey);
  store.warnings = copyWithoutPrefix(store.warnings, listKey);
  store.touched = copyWithoutPrefix(store.touched, listKey);
  store.validating = copyWithoutPrefix(store.validating, listKey);
  const lists = copyWithoutPrefix(store.lists, listKey);
  const state = listRows(rows, nextKey);
  writeOwnRecordValue(lists, listKey, { ...state, initial });
  store.lists = lists;
}

function remapList(store: FormStore, listKey: string, keys: number[], mapIndex: (index: number) => number | null): void {
  store.values = remapListRecord(store.values, listKey, mapIndex);
  store.errors = remapListRecord(store.errors, listKey, mapIndex);
  store.warnings = remapListRecord(store.warnings, listKey, mapIndex);
  store.touched = remapListRecord(store.touched, listKey, mapIndex);
  store.validating = remapListRecord(store.validating, listKey, mapIndex);
  const lists = remapListRecord(store.lists, listKey, mapIndex);
  const current = readOwnRecordValue(lists, listKey) as ListState;
  writeOwnRecordValue(lists, listKey, { ...current, keys });
  store.lists = lists;
  [...Object.keys(store.errors), ...Object.keys(store.warnings)].forEach((key) => {
    if (listEntry(key, listKey)) store.relocated.add(key);
  });
}

type InternalFormInstance<T> = FormInstance<T> & {
  __subscribe?: (listener: () => void) => () => void;
  __getValues?: () => FieldRecord<unknown>;
};

function findField(form: HTMLFormElement | null, key: string): Element | null {
  return form?.querySelector(`[id="form-${key}"]`) || form?.querySelector(`[name="${key}"]`) || null;
}

function resetList(store: FormStore, listKey: string): void {
  const list = readOwnRecordValue(store.lists, listKey);
  if (list) replaceListRows(store, listKey, list.initial, list.initial);
}

function writeFieldValue(store: FormStore, key: string, value: unknown): void {
  const list = readOwnRecordValue(store.lists, key);
  if (list && Array.isArray(value)) {
    replaceListRows(store, key, value, list.initial);
    return;
  }
  store.values = copyWithOwnRecordValue(store.values, key, value);
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
      getFieldValue: (name) => readFieldValue(store, toFieldKey(name)),
      getFieldsValue: (nameList) => {
        if (!nameList) return publicValues(store) as T;
        const result: FieldRecord<unknown> = {};
        nameList.forEach((name) => {
          const key = toFieldKey(name);
          writeOwnRecordValue(result, key, readFieldValue(store, key));
        });
        return result as T;
      },
      setFieldValue: (name, value) => {
        writeFieldValue(store, toFieldKey(name), value);
        notifyStore(store);
      },
      setFieldsValue: (values) => {
        Object.keys(values as FieldRecord<unknown>).forEach((key) =>
          writeFieldValue(store, key, readOwnRecordValue(values as FieldRecord<unknown>, key)),
        );
        notifyStore(store);
      },
      resetFields: (fields) => {
        const initial = store.host?.initialValues() ?? {};
        if (fields) {
          const keys = fields.map(toFieldKey);
          const listKeys = keys.filter((key) => hasOwnRecordKey(store.lists, key));
          listKeys.forEach((key) => resetList(store, key));
          const fieldKeys = keys.filter((key) => !hasOwnRecordKey(store.lists, key));
          const values = { ...store.values };
          const errors = { ...store.errors };
          const warnings = { ...store.warnings };
          const touched = { ...store.touched };
          const validating = { ...store.validating };
          fieldKeys.forEach((key) => {
            deleteOwnRecordValue(values, key);
            deleteOwnRecordValue(errors, key);
            deleteOwnRecordValue(warnings, key);
            deleteOwnRecordValue(touched, key);
            deleteOwnRecordValue(validating, key);
            if (hasOwnRecordKey(initial, key)) writeOwnRecordValue(values, key, readOwnRecordValue(initial, key));
          });
          fillFieldDefaults(store, values, fieldKeys);
          store.values = values;
          store.errors = errors;
          store.warnings = warnings;
          store.touched = touched;
          store.validating = validating;
        } else {
          store.values = { ...initial };
          store.errors = {};
          store.warnings = {};
          store.touched = {};
          store.validating = {};
          Object.keys(store.lists).forEach((listKey) => resetList(store, listKey));
          const values = { ...store.values };
          fillFieldDefaults(store, values, Object.keys(store.defaults));
          store.values = values;
        }
        notifyStore(store);
      },
      validateFields: (async (nameList?: FieldName[]) => {
        const host = store.host;
        if (!host) return publicValues(store) as T;
        const rules = host.rules();
        const names = nameList ? nameList.map(toFieldKey) : Object.keys(rules);
        const entries = await Promise.all(
          names.map(async (key) => [key, await host.validateField(key, readOwnRecordValue(rules, key))] as const),
        );
        const failed = entries.filter(([, fieldErrors]) => fieldErrors.length > 0);
        if (failed.length > 0) {
          throw {
            values: publicValues(store),
            errorFields: failed.map(([fieldName, fieldErrors]) => ({ name: fieldName, errors: fieldErrors })),
            outOfDate: false,
          };
        }
        return publicValues(store) as T;
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
      getFieldsError: () => {
        const names = new Set([...Object.keys(store.errors), ...Object.keys(store.warnings)]);
        return Array.from(names, (name) => {
          const errors = readOwnRecordValue(store.errors, name) ?? [];
          const warnings = readOwnRecordValue(store.warnings, name) ?? [];
          return warnings.length > 0 ? { name, errors, warnings } : { name, errors };
        }) as FieldData[];
      },
      isFieldValidating: (name) => Boolean(readOwnRecordValue(store.validating, toFieldKey(name))),
      scrollToField: (name, scrollOptions) => {
        findField(store.host?.element() ?? null, toFieldKey(name))
          ?.scrollIntoView(scrollOptions ?? { behavior: 'smooth', block: 'center' });
      },
      __subscribe: (listener) => {
        store.listeners.add(listener);
        return () => { store.listeners.delete(listener); };
      },
      __getValues: () => publicValues(store),
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
  const { t, tOr } = useTranslation(catalog.namespace);
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
    onValuesChange?.(copyWithOwnRecordValue({}, fieldName, value) as Partial<unknown>, publicValues(store) as unknown);
  }, [store, onValuesChange]);

  const setError = useCallback((fieldName: string, fieldErrors: string[]) => {
    store.errors = copyWithOwnRecordValue(store.errors, fieldName, fieldErrors);
    notifyStore(store);
  }, [store]);

  const setOutcome = useCallback((fieldName: string, outcome: RuleOutcome) => {
    store.errors = copyWithOwnRecordValue(store.errors, fieldName, outcome.errors);
    store.warnings = copyWithOwnRecordValue(store.warnings, fieldName, outcome.warnings);
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
    if (initialValue === undefined) {
      if (hasOwnRecordKey(store.defaults, fieldName)) store.defaults = copyWithoutOwnRecordKey(store.defaults, fieldName);
      return;
    }
    if (!Object.is(readOwnRecordValue(store.defaults, fieldName), initialValue)) {
      store.defaults = copyWithOwnRecordValue(store.defaults, fieldName, initialValue);
    }
    if (readOwnRecordValue(store.values, fieldName) === undefined) {
      store.values = copyWithOwnRecordValue(store.values, fieldName, initialValue);
      notifyStore(store);
    }
  }, [store]);

  const dropOutcome = useCallback((fieldName: string) => {
    const hadErrors = hasOwnRecordKey(store.errors, fieldName);
    const hadWarnings = hasOwnRecordKey(store.warnings, fieldName);
    if (!hadErrors && !hadWarnings) return;
    if (hadErrors) store.errors = copyWithoutOwnRecordKey(store.errors, fieldName);
    if (hadWarnings) store.warnings = copyWithoutOwnRecordKey(store.warnings, fieldName);
    notifyStore(store);
  }, [store]);

  const unregisterField = useCallback((fieldName: string) => {
    deleteOwnRecordValue(fieldRulesRef.current, fieldName);
    if (hasOwnRecordKey(store.defaults, fieldName)) store.defaults = copyWithoutOwnRecordKey(store.defaults, fieldName);
    if (store.relocated.delete(fieldName)) return;
    dropOutcome(fieldName);
  }, [store, dropOutcome]);

  const messages = useMemo(() => catalog.create(t, tOr), [catalog, t, tOr]);

  const validateField = useCallback(async (fieldName: string, rules?: FormRule[]): Promise<string[]> => {
    if (!rules || rules.length === 0) return [];
    setValidating(fieldName, true);
    const outcome = await evaluateRules(rules, readFieldValue(store, fieldName), messages, fieldName);
    setValidating(fieldName, false);
    setOutcome(fieldName, outcome);
    return outcome.errors;
  }, [store, messages, setOutcome, setValidating]);

  // The bare instance owns no rules registry; a mounted form lends it real
  // validation, submission and scrolling for as long as it stays in the tree.
  const initialValuesRef = useRef(initialValues as FieldRecord<unknown>);
  const validateFieldRef = useRef(validateField);
  useEffect(() => {
    initialValuesRef.current = initialValues as FieldRecord<unknown>;
    validateFieldRef.current = validateField;
  });

  const registerList = useCallback((listKey: string, initialValue: unknown[] | undefined, rules?: FormRule[]) => {
    writeOwnRecordValue(fieldRulesRef.current, listKey, rules);
    if (hasOwnRecordKey(store.lists, listKey)) return;
    const seeded = readOwnRecordValue(store.values, listKey);
    const initial = initialValue ?? (Array.isArray(seeded) ? seeded : []);
    const values = Array.isArray(seeded) ? copyWithoutOwnRecordKey(store.values, listKey) : { ...store.values };
    // Values already under the list (an item default, a preserved edit) keep their row and are never overwritten.
    const rows = Array.from({ length: adoptedRowCount(values, listKey, initial) });
    initial.forEach((row, index) => writeFlattened(values, `${listKey}.${index}`, row, true));
    store.values = values;
    store.lists = copyWithOwnRecordValue(store.lists, listKey, { ...listRows(rows, 0), initial });
    notifyStore(store);
  }, [store]);

  const unregisterList = useCallback((listKey: string) => {
    deleteOwnRecordValue(fieldRulesRef.current, listKey);
    dropOutcome(listKey);
  }, [dropOutcome]);

  const revalidateList = useCallback((listKey: string) => {
    if (!hasOwnRecordKey(store.errors, listKey) && !hasOwnRecordKey(store.warnings, listKey)) return;
    void validateFieldRef.current(listKey, readOwnRecordValue(fieldRulesRef.current, listKey));
  }, [store]);

  const listOperation = useCallback((listKey: string): FormListOperation => ({
    add: (defaultValue, insertIndex) => {
      const list = readOwnRecordValue(store.lists, listKey);
      if (!list) return;
      const at = insertIndex === undefined ? list.keys.length : Math.max(0, Math.min(insertIndex, list.keys.length));
      const keys = [...list.keys];
      keys.splice(at, 0, list.nextKey);
      remapList(store, listKey, keys, (index) => (index >= at ? index + 1 : index));
      const values = { ...store.values };
      writeFlattened(values, `${listKey}.${at}`, defaultValue);
      store.values = values;
      const current = readOwnRecordValue(store.lists, listKey) as ListState;
      store.lists = copyWithOwnRecordValue(store.lists, listKey, { ...current, nextKey: list.nextKey + 1 });
      notifyStore(store);
      revalidateList(listKey);
    },
    remove: (index) => {
      const list = readOwnRecordValue(store.lists, listKey);
      if (!list) return;
      const removed = new Set((Array.isArray(index) ? index : [index]).filter((position) => position >= 0 && position < list.keys.length));
      if (removed.size === 0) return;
      const keys = list.keys.filter((_, position) => !removed.has(position));
      remapList(store, listKey, keys, (position) => {
        if (removed.has(position)) return null;
        let shift = 0;
        removed.forEach((gone) => { if (gone < position) shift += 1; });
        return position - shift;
      });
      notifyStore(store);
      revalidateList(listKey);
    },
    move: (from, to) => {
      const list = readOwnRecordValue(store.lists, listKey);
      if (!list) return;
      const last = list.keys.length - 1;
      if (from === to || from < 0 || to < 0 || from > last || to > last) return;
      const keys = [...list.keys];
      const [moved] = keys.splice(from, 1);
      keys.splice(to, 0, moved as number);
      remapList(store, listKey, keys, (position) => {
        if (position === from) return to;
        if (from < position && position <= to) return position - 1;
        if (to <= position && position < from) return position + 1;
        return position;
      });
      notifyStore(store);
      revalidateList(listKey);
    },
  }), [store, revalidateList]);

  const settleRelocations = useCallback(() => {
    store.relocated.clear();
  }, [store]);

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
      onFinish?.(publicValues(store) as unknown);
      return;
    }
    onFinishFailed?.({ values: publicValues(store) as unknown, errorFields, outOfDate: false });
    const first = errorFields[0]?.name;
    if (scrollToFirstError && first !== undefined) {
      findField(formRef.current, toFieldKey(first))?.scrollIntoView(
        typeof scrollToFirstError === 'object' ? scrollToFirstError : { behavior: 'smooth', block: 'center' },
      );
    }
  };

  const { values, errors, warnings, touched, validating, lists } = store;
  const { layout, size, labelAlign, disabled, colon, requiredMark, hasFeedback } = presentation;
  const contextValue = useMemo<FormContextValue>(() => ({
    values,
    errors,
    warnings,
    touched,
    validating,
    lists,
    setValue,
    setError,
    setTouched,
    registerField,
    unregisterField,
    validateField,
    getFieldRules,
    registerList,
    unregisterList,
    listOperation,
    settleRelocations,
    layout,
    size,
    labelAlign,
    disabled,
    colon,
    requiredMark,
    hasFeedback,
  }), [values, errors, warnings, touched, validating, lists, setValue, setError, setTouched, registerField, unregisterField, validateField, getFieldRules, registerList, unregisterList, listOperation, settleRelocations, layout, size, labelAlign, disabled, colon, requiredMark, hasFeedback]);

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
  /** Failures of `warningOnly` rules: shown, never blocking. */
  fieldWarnings: string[];
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
  const listPath = useContext(FormListPathContext);
  const { values, errors, warnings, touched, validating, setValue, setTouched, registerField, unregisterField, validateField } = context;
  const fieldName = joinFieldKey(listPath, toFieldKey(name));

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
      const key = joinFieldKey(listPath, toFieldKey(dependency));
      return `${key}:${JSON.stringify(readOwnRecordValue(values, key))}`;
    })
    .join('|');

  useEffect(() => {
    if (!dependencies || !fieldName || !rules) return;
    if (readOwnRecordValue(touched, fieldName)) validateField(fieldName, rules);
  }, [dependencyKey]);

  const fieldValue = fieldName ? readOwnRecordValue(values, fieldName) : undefined;
  const fieldErrors = fieldName ? (readOwnRecordValue(errors, fieldName) ?? []) : [];
  const fieldWarnings = fieldName ? (readOwnRecordValue(warnings, fieldName) ?? []) : [];
  const isValidating = fieldName ? Boolean(readOwnRecordValue(validating, fieldName)) : false;
  const isTouched = fieldName ? Boolean(readOwnRecordValue(touched, fieldName)) : false;
  const hasError = validateStatus === 'error' || fieldErrors.length > 0;
  const isWarning = validateStatus === 'warning' || (!hasError && fieldWarnings.length > 0);
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
    fieldWarnings,
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

/** The rows a list renders before the store adopted it: its initial rows, or the ones an earlier mount left behind. */
function provisionalRowCount(values: FieldRecord<unknown>, listKey: string, initialValue: unknown[] | undefined): number {
  const seeded = readOwnRecordValue(values, listKey);
  return adoptedRowCount(values, listKey, initialValue ?? (Array.isArray(seeded) ? seeded : []));
}

/** A dynamic list's rows, operations and rule outcome, all read from the store. */
export function useFormList({ name, initialValue, rules }: FormListProps): {
  listKey: string;
  fields: FormListFieldData[];
  operation: FormListOperation;
  meta: { errors: string[]; warnings: string[] };
} {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form.List must be used within a Form');
  }
  const listPath = useContext(FormListPathContext);
  const listKey = joinFieldKey(listPath, toFieldKey(name));
  const { values, errors, warnings, lists, registerList, unregisterList, listOperation, settleRelocations } = context;
  const registered = readOwnRecordValue(lists, listKey);
  const adopted = registered !== undefined;

  useEffect(() => {
    if (listKey) registerList(listKey, initialValue, rules);
  }, [listKey, initialValue, rules, adopted, registerList]);

  useEffect(() => {
    if (!listKey) return undefined;
    return () => unregisterList(listKey);
  }, [listKey, unregisterList]);

  useEffect(() => {
    settleRelocations();
  });

  const keys = registered?.keys ?? Array.from({ length: provisionalRowCount(values, listKey, initialValue) }, (_, index) => index);
  const operation = useMemo(() => listOperation(listKey), [listOperation, listKey]);

  return {
    listKey,
    fields: keys.map((key, index) => ({ key, name: index, isListField: true })),
    operation,
    meta: {
      errors: readOwnRecordValue(errors, listKey) ?? [],
      warnings: readOwnRecordValue(warnings, listKey) ?? [],
    },
  };
}

/** Form.List renders no chrome of its own, so every engine shares it. */
export const FormList: React.FC<FormListProps> = (props) => {
  const { listKey, fields, operation, meta } = useFormList(props);
  return <FormListPathContext.Provider value={listKey}>{props.children(fields, operation, meta)}</FormListPathContext.Provider>;
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
