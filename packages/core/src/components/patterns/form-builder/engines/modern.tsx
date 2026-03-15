'use client';

/**
 * FormBuilder - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useState, useCallback, useMemo, type ReactNode } from 'react';
import type { FormBuilderProps } from '../FormBuilder.types';
import type { FieldDef } from '../../types';

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

  const updateValue = useCallback(
    (name: string, value: unknown) => {
      const next = { ...currentValues, [name]: value };
      if (!controlledValues) setInternalValues(next);
      onChange?.(next);
    },
    [currentValues, controlledValues, onChange]
  );

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
      if (field.required && (val === undefined || val === null || val === '')) {
        errs[field.name] = field.validation?.message ?? `${field.label ?? field.name} is required`;
      }
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

  const renderFieldInput = useCallback(
    (field: FieldDef): ReactNode => {
      const val = currentValues[field.name];
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

  const stepFields = useMemo(() => {
    if (layout !== 'steps' || !stepLabels) return [visibleFields];
    const perStep = Math.ceil(visibleFields.length / stepLabels.length);
    const groups: FieldDef[][] = [];
    for (let i = 0; i < stepLabels.length; i++) {
      groups.push(visibleFields.slice(i * perStep, (i + 1) * perStep));
    }
    return groups;
  }, [layout, stepLabels, visibleFields]);

  const handleStepChange = (step: number) => {
    if (controlledStep === undefined) setInternalStep(step);
    onStepChange?.(step);
  };

  const renderFormField = (field: FieldDef) => {
    const defaultRender = renderFieldInput(field);
    const content = renderField ? renderField(field, defaultRender, currentValues[field.name]) : defaultRender;
    const error = errors[field.name];
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
