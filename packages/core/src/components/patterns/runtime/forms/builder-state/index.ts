'use client';

/**
 * @fileoverview useFormBuilder composition hook -- manages form values,
 * field-level validation, dirty tracking, touch state, and async submission.
 * Returns `getFieldProps()` for easy field binding.
 *
 * Designed for dynamic forms where the field set is defined by data (e.g.
 * CMS-driven forms, admin config panels). For static forms with a known
 * shape, consider a schema-first library like react-hook-form + zod.
 *
 * @example
 * ```tsx
 * const { getFieldProps, handleSubmit, isDirty } = useFormBuilder({
 *   fields: [{ name: 'email', type: 'text', required: true }],
 *   onSubmit: (values) => api.saveProfile(values),
 * });
 * return <Input {...getFieldProps('email')} />;
 * ```
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { FieldDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

export interface UseFormBuilderOptions {
  fields: FieldDef[];
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
}

export interface UseFormBuilderReturn {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: string, value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  clearErrors: () => void;
  touch: (name: string) => void;
  validate: () => boolean;
  handleSubmit: () => Promise<void>;
  reset: (values?: Record<string, unknown>) => void;
  getFieldProps: (name: string) => {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
  };
}

/**
 * Validates a single field value against the field definition's constraints.
 * Checks required-ness first, then type-specific rules (minLength/maxLength/
 * pattern for strings, min/max for numbers).
 *
 * @param field - The field definition containing validation rules.
 * @param value - The current field value.
 * @returns An error message string, or null if valid.
 */
function validateField(field: FieldDef, value: unknown): string | null {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label ?? field.name} is required`;
  }
  if (field.validation) {
    const v = field.validation;
    if (typeof value === 'string') {
      if (v.minLength && value.length < v.minLength) return v.message ?? `Minimum ${v.minLength} characters`;
      if (v.maxLength && value.length > v.maxLength) return v.message ?? `Maximum ${v.maxLength} characters`;
      if (v.pattern && !new RegExp(v.pattern).test(value)) return v.message ?? 'Invalid format';
    }
    if (typeof value === 'number') {
      if (v.min !== undefined && value < v.min) return v.message ?? `Minimum value is ${v.min}`;
      if (v.max !== undefined && value > v.max) return v.message ?? `Maximum value is ${v.max}`;
    }
  }
  return null;
}

/**
 * Manages form state for a dynamically-defined set of fields.
 *
 * State model:
 * - `values`: current field values (keyed by field name)
 * - `errors`: validation error messages (only for invalid fields)
 * - `touched`: tracks which fields the user has interacted with
 * - `isDirty`: true when any value differs from the initial snapshot
 *
 * @param options - Fields definition, initial values, and submit handler.
 * @returns Form state, field binding helpers, and lifecycle methods.
 *
 * @example
 * ```tsx
 * const form = useFormBuilder({ fields, onSubmit: save });
 * <Button onClick={form.handleSubmit} disabled={!form.isDirty}>Save</Button>
 * ```
 */
export function useFormBuilder(options: UseFormBuilderOptions): UseFormBuilderReturn {
  const { fields, initialValues = {}, onSubmit } = options;

  const getDefaults = useCallback(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
      defaults[field.name] = readRecordValue(initialValues, field.name) ?? field.defaultValue ?? '';
    }
    return defaults;
  }, [fields, initialValues]);

  const [values, setValuesState] = useState<Record<string, unknown>>(getDefaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref holds the initial snapshot so `isDirty` can compare without
  // causing re-renders when the snapshot itself hasn't changed.
  const initialRef = useRef(getDefaults());

  // Dirty check compares current values to the initial snapshot via strict
  // equality. Uses useMemo so it only re-evaluates when `values` changes.
  const isDirty = useMemo(() => {
    return Object.keys(values).some((k) => (
      readRecordValue(values, k) !== readRecordValue(initialRef.current, k)
    ));
  }, [values]);

  // Valid when the errors map is empty. Re-evaluated only when errors change.
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Clearing the field error on change gives instant "fixed" feedback
  // rather than waiting for the next full validation pass.
  const setValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!readRecordValue(prev, name)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setValues = useCallback((newValues: Record<string, unknown>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const touch = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Validates all visible fields at once. Hidden fields are skipped because
  // they are not rendered and should not block submission.
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const hidden = typeof field.hidden === 'function' ? field.hidden(values) : field.hidden;
      if (hidden) continue;
      const error = validateField(field, readRecordValue(values, field.name));
      if (error) newErrors[field.name] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values, onSubmit]);

  const reset = useCallback((newValues?: Record<string, unknown>) => {
    const defaults = newValues ?? getDefaults();
    setValuesState(defaults);
    initialRef.current = defaults;
    setErrors({});
    setTouched({});
  }, [getDefaults]);

  // Returns a props bag that can be spread onto any DS input component.
  // Errors are only surfaced after the field has been touched (blurred),
  // preventing premature validation messages while the user is still typing.
  const getFieldProps = useCallback((name: string) => {
    const error = readRecordValue(errors, name);
    return {
      value: readRecordValue(values, name),
      onChange: (value: unknown) => setValue(name, value),
      onBlur: () => touch(name),
      error: readRecordValue(touched, name) === true && typeof error === 'string' ? error : undefined,
    };
  }, [values, errors, touched, setValue, touch]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    touch,
    validate,
    handleSubmit,
    reset,
    getFieldProps,
  };
}
