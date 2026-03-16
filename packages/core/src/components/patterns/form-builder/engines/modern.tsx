'use client';

/**
 * @fileoverview Modern (Hermes) engine for the FormBuilder pattern, rendered
 * with native HTML form elements styled via DaisyUI and Tailwind CSS utility
 * classes. Unlike the Classic engine, this implementation uses no Ant Design
 * components -- all inputs, selects, checkboxes, and validation messages are
 * native HTML, keeping the bundle lean and the markup SSR-friendly. Supports
 * vertical, horizontal, grid, and wizard (steps) layouts.
 *
 * @example
 * <ModernFormBuilder
 *   fields={[
 *     { name: 'name', label: 'Full Name', type: 'text', required: true },
 *     { name: 'bio', label: 'Bio', type: 'textarea' },
 *   ]}
 *   layout="grid"
 *   columns={2}
 *   onSubmit={(values) => updateProfile(values)}
 *   actions={<button type="submit" className="btn btn-primary">Save</button>}
 * />
 */

import React, { useState, useCallback, useMemo, type ReactNode } from 'react';
import type { FormBuilderProps } from '../FormBuilder.types';
import type { FieldDef } from '../../types';

/**
 * DaisyUI/Tailwind-backed form builder that renders native HTML input elements
 * with utility classes. Manages value state, validation, conditional visibility,
 * and multi-step wizard navigation internally -- no form library required.
 *
 * @param props - Engine-agnostic form configuration; see {@link FormBuilderProps}.
 * @returns A rendered `<form>` element styled with DaisyUI classes.
 */
export default function ModernFormBuilder(props: FormBuilderProps) {
  const {
    fields,
    layout = 'vertical',
    columns = 2,
    renderField,
    actions,
    onSubmit,
    onValidationChange,
    onChange,
    initialValues = {},
    values: controlledValues,
    disabled = false,
    readOnly = false,
    showLabels = true,
    showRequired = true,
    gap = 16,
    title,
    description,
    stepLabels,
    currentStep: controlledStep,
    onStepChange,
    loading,
    className,
    style,
  } = props;

  // Lazy initializer: field-level defaults are merged first, then overridden
  // by initialValues so server-loaded data always takes precedence.
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    return { ...defaults, ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [internalStep, setInternalStep] = useState(0);

  const currentValues = controlledValues ?? internalValues;
  const currentStep = controlledStep ?? internalStep;

  // Shallow-copy-on-write: only update internal state when uncontrolled.
  // Always fires onChange so both controlled and uncontrolled consumers stay in sync.
  const updateValue = useCallback(
    (name: string, value: unknown) => {
      const next = { ...currentValues, [name]: value };
      if (!controlledValues) setInternalValues(next);
      onChange?.(next);
    },
    [currentValues, controlledValues, onChange]
  );

  // `hidden` can be a static boolean or a function of current form values,
  // enabling conditional visibility (e.g. "show city only if country is selected").
  const isHidden = useCallback(
    (field: FieldDef): boolean => {
      if (typeof field.hidden === 'function') return field.hidden(currentValues);
      return !!field.hidden;
    },
    [currentValues]
  );

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    fields.forEach((field) => {
      if (isHidden(field)) return;
      const val = currentValues[field.name];
      // Empty string is treated as "not provided" for required checks because
      // HTML inputs default to '' rather than undefined/null.
      if (field.required && (val === undefined || val === null || val === '')) {
        errs[field.name] = field.validation?.message ?? `${field.label ?? field.name} is required`;
      }
      // Only validate non-empty values to avoid false positives on optional fields.
      if (field.validation && val !== undefined && val !== null && val !== '') {
        const v = field.validation;
        if (v.minLength && typeof val === 'string' && val.length < v.minLength) {
          errs[field.name] = v.message ?? `Minimum ${v.minLength} characters`;
        }
        if (v.maxLength && typeof val === 'string' && val.length > v.maxLength) {
          errs[field.name] = v.message ?? `Maximum ${v.maxLength} characters`;
        }
        if (v.min !== undefined && typeof val === 'number' && val < v.min) {
          errs[field.name] = v.message ?? `Minimum value is ${v.min}`;
        }
        if (v.max !== undefined && typeof val === 'number' && val > v.max) {
          errs[field.name] = v.message ?? `Maximum value is ${v.max}`;
        }
        if (v.pattern && typeof val === 'string' && !new RegExp(v.pattern).test(val)) {
          errs[field.name] = v.message ?? 'Invalid format';
        }
      }
    });
    return errs;
  }, [fields, currentValues, isHidden]);

  // Intercepts native form submit to run validation first. Only calls
  // onSubmit when all visible fields pass -- hidden fields are excluded.
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      onValidationChange?.(errs);
      if (Object.keys(errs).length === 0) {
        onSubmit(currentValues);
      }
    },
    [validate, onSubmit, currentValues, onValidationChange]
  );

  // Maps each FieldDef type to a native HTML input element styled with
  // DaisyUI classes. All inputs use `rounded-xl` for consistency with the
  // Modern engine's rounded card aesthetic.
  const renderFieldInput = useCallback(
    (field: FieldDef): ReactNode => {
      const val = currentValues[field.name];
      // Per-field disabled merges with form-level disabled: either wins.
      const fieldDisabled = disabled || field.disabled;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
          return (
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              className="input input-bordered w-full rounded-xl"
            />
          );
        case 'number':
          return (
            <input
              type="number"
              placeholder={field.placeholder}
              value={val !== undefined && val !== null ? String(val) : ''}
              onChange={(e) => updateValue(field.name, e.target.value ? Number(e.target.value) : undefined)}
              min={field.validation?.min}
              max={field.validation?.max}
              disabled={fieldDisabled}
              readOnly={readOnly}
              className="input input-bordered w-full rounded-xl"
            />
          );
        case 'textarea':
          return (
            <textarea
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              rows={4}
              className="textarea textarea-bordered w-full rounded-xl"
            />
          );
        case 'select':
          return (
            <select
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              className="select select-bordered w-full rounded-xl"
            >
              {field.placeholder && <option value="">{field.placeholder}</option>}
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              ))}
            </select>
          );
        // Native multi-select requires extracting selected options from the DOM
        // element because onChange only exposes the event, not the selected set.
        case 'multi-select':
          return (
            <select
              multiple
              value={(val as string[]) ?? []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                updateValue(field.name, selected);
              }}
              disabled={fieldDisabled}
              className="select select-bordered w-full rounded-xl min-h-[6rem]"
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              ))}
            </select>
          );
        case 'checkbox':
          return (
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                checked={!!val}
                onChange={(e) => updateValue(field.name, e.target.checked)}
                disabled={fieldDisabled}
                className="checkbox checkbox-primary rounded-lg"
              />
              <span className="label-text">{field.label}</span>
            </label>
          );
        case 'radio':
          return (
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => (
                <label key={opt.value} className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={val === opt.value}
                    onChange={() => updateValue(field.name, opt.value)}
                    disabled={fieldDisabled || opt.disabled}
                    className="radio radio-primary"
                  />
                  <span className="label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          );
        case 'switch':
          return (
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => updateValue(field.name, e.target.checked)}
              disabled={fieldDisabled}
              className="toggle toggle-primary"
            />
          );
        case 'date':
          return (
            <input type="date" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} className="input input-bordered w-full rounded-xl" />
          );
        case 'time':
          return (
            <input type="time" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} className="input input-bordered w-full rounded-xl" />
          );
        case 'datetime':
          return (
            <input type="datetime-local" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} className="input input-bordered w-full rounded-xl" />
          );
        case 'file':
          return (
            <input type="file" disabled={fieldDisabled} className="file-input file-input-bordered w-full rounded-xl" onChange={(e) => updateValue(field.name, e.target.files)} />
          );
        case 'color':
          return (
            // Native color inputs only accept concrete color strings, not CSS vars.
            <input type="color" value={(val as string) ?? '#111827'} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} className="w-12 h-10 rounded-xl border border-base-300 cursor-pointer" />
          );
        case 'slider':
          return (
            <input type="range" value={(val as number) ?? 0} onChange={(e) => updateValue(field.name, Number(e.target.value))} min={field.validation?.min ?? 0} max={field.validation?.max ?? 100} disabled={fieldDisabled} className="range range-primary w-full" />
          );
        case 'rating':
          return (
            <div className="rating rating-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name={`rating-${field.name}`}
                  className="mask mask-star-2 bg-orange-400"
                  checked={(val as number) === star}
                  onChange={() => updateValue(field.name, star)}
                  disabled={fieldDisabled}
                />
              ))}
            </div>
          );
        case 'custom':
          return field.render?.(field, val, (v) => updateValue(field.name, v)) ?? null;
        default:
          return (
            <input type="text" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} className="input input-bordered w-full rounded-xl" />
          );
      }
    },
    [currentValues, disabled, readOnly, updateValue]
  );

  const visibleFields = useMemo(
    () => fields.filter((f) => !isHidden(f)),
    [fields, isHidden]
  );

  // Distribute fields evenly across steps when explicit step assignments are
  // not provided. This auto-grouping lets consumers add a wizard layout by
  // just supplying stepLabels without restructuring their field array.
  const stepFields = useMemo(() => {
    if (layout !== 'steps' || !stepLabels) return [visibleFields];
    const perStep = Math.ceil(visibleFields.length / stepLabels.length);
    const groups: FieldDef[][] = [];
    for (let i = 0; i < stepLabels.length; i++) {
      groups.push(visibleFields.slice(i * perStep, (i + 1) * perStep));
    }
    return groups;
  }, [layout, stepLabels, visibleFields]);

  // Step navigation supports both controlled (parent manages step) and
  // uncontrolled (internal state) modes -- same pattern as value management.
  const handleStepChange = (step: number) => {
    if (controlledStep === undefined) setInternalStep(step);
    onStepChange?.(step);
  };

  // renderField is the consumer's escape hatch: it receives the default
  // control, the field definition, and current value so it can wrap, replace,
  // or augment the rendering without reimplementing the entire switch.
  const renderFormField = (field: FieldDef) => {
    const defaultRender = renderFieldInput(field);
    const content = renderField ? renderField(field, defaultRender, currentValues[field.name]) : defaultRender;
    const error = errors[field.name];
    // Checkbox fields embed their label inline, so the outer label is hidden
    // to avoid a redundant double-label.
    const showLabel = showLabels && field.type !== 'checkbox';

    return (
      <div
        key={field.name}
        className="form-control w-full"
        style={layout === 'grid' && field.colSpan ? { gridColumn: `span ${field.colSpan}` } : undefined}
      >
        {showLabel && (
          <label className="label">
            <span className="label-text font-medium">
              {field.label ?? field.name}
              {showRequired && field.required && <span className="text-error ml-1">*</span>}
            </span>
          </label>
        )}
        {content}
        {field.description && !error && (
          <label className="label"><span className="label-text-alt text-base-content/60">{field.description}</span></label>
        )}
        {error && (
          <label className="label"><span className="label-text-alt text-error">{error}</span></label>
        )}
      </div>
    );
  };

  const fieldsToRender = layout === 'steps' ? (stepFields[currentStep] ?? []) : visibleFields;

  const fieldElements = fieldsToRender.map(renderFormField);

  // Returns the outer container class for the non-grid layouts. Grid mode
  // gets its own CSS Grid container in the JSX below, so it returns empty.
  const getLayoutClass = () => {
    if (layout === 'grid') return '';
    if (layout === 'horizontal') return 'flex flex-wrap items-start';
    return 'flex flex-col';
  };

  const gapStr = typeof gap === 'number' ? `${gap}px` : gap;

  return (
    <form onSubmit={handleSubmit} className={className} style={style}>
      {title && <h3 className="text-xl font-semibold mb-1">{title}</h3>}
      {description && <p className="text-base-content/60 mb-6">{description}</p>}

      {/* DaisyUI steps component renders a horizontal progress bar. Steps
          up to and including the current one get `step-primary` colouring. */}
      {layout === 'steps' && stepLabels && (
        <ul className="steps steps-horizontal w-full mb-8">
          {stepLabels.map((label, i) => (
            <li
              key={i}
              className={`step ${i <= currentStep ? 'step-primary' : ''} cursor-pointer`}
              onClick={() => handleStepChange(i)}
            >
              {label}
            </li>
          ))}
        </ul>
      )}

      {layout === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gapStr,
          }}
        >
          {fieldElements}
        </div>
      ) : (
        <div className={getLayoutClass()} style={{ gap: gapStr }}>
          {fieldElements}
        </div>
      )}

      {layout === 'steps' && stepLabels && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="btn btn-outline rounded-xl"
            disabled={currentStep === 0}
            onClick={() => handleStepChange(currentStep - 1)}
          >
            Previous
          </button>
          {currentStep < stepLabels.length - 1 && (
            <button
              type="button"
              className="btn btn-primary rounded-xl"
              onClick={() => handleStepChange(currentStep + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}

      {actions && <div className="mt-6">{actions}</div>}
    </form>
  );
}
