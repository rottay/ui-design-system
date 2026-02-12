'use client';

/**
 * useFormBuilder - Composition Hook
 *
 * Manages form state: values, validation, dirty tracking, submission.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { FieldDef } from '../types';

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

export function useFormBuilder(options: UseFormBuilderOptions): UseFormBuilderReturn {
  const { fields, initialValues = {}, onSubmit } = options;

  const getDefaults = useCallback(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
      defaults[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    }
    return defaults;
  }, [fields, initialValues]);

  const [values, setValuesState] = useState<Record<string, unknown>>(getDefaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialRef = useRef(getDefaults());

  const isDirty = useMemo(() => {
    return Object.keys(values).some((k) => values[k] !== initialRef.current[k]);
  }, [values]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const setValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
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

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const hidden = typeof field.hidden === 'function' ? field.hidden(values) : field.hidden;
      if (hidden) continue;
      const error = validateField(field, values[field.name]);
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

  const getFieldProps = useCallback((name: string) => ({
    value: values[name],
    onChange: (value: unknown) => setValue(name, value),
    onBlur: () => touch(name),
    error: touched[name] ? errors[name] : undefined,
  }), [values, errors, touched, setValue, touch]);

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
