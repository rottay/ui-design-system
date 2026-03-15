'use client';

/**
 * FormBuilder - Rustic Engine (Vanilla HTML/CSS)
 */

import React, { useState, useCallback, useMemo, type ReactNode, type CSSProperties } from 'react';
import type { FormBuilderProps } from '../../types';
import type { FieldDef } from '../../../types';

const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

const s = {
  title: {
    fontSize: 'var(--ds-font-size-xl)',
    fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
    color: 'var(--ds-color-neutral-900)',
    margin: '0 0 4px 0',
  } as CSSProperties,
  description: {
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-neutral-500)',
    margin: '0 0 24px 0',
  } as CSSProperties,
  sectionDivider: {
    border: 'none',
    borderTop: '1px var(--ds-divider-style, solid) var(--ds-divider-color, var(--ds-color-neutral-200))',
    margin: 'var(--ds-card-body-padding, 1.5rem) 0',
  } as CSSProperties,
  label: {
    display: 'block',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 'var(--ds-typography-heading-font-weight, 500)' as unknown as number,
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
    textTransform: 'var(--ds-typography-label-transform, none)' as CSSProperties['textTransform'],
    color: 'var(--ds-color-neutral-700)',
    marginBottom: 6,
  } as CSSProperties,
  required: {
    color: 'var(--ds-color-danger, #ef4444)',
    marginLeft: 3,
  } as CSSProperties,
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-0, #fff)',
    color: 'var(--ds-color-neutral-900)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: `border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  textarea: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-0, #fff)',
    color: 'var(--ds-color-neutral-900)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    minHeight: 80,
    transition: `border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  select: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-0, #fff)',
    color: 'var(--ds-color-neutral-900)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: `border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  error: {
    fontSize: 'var(--ds-font-size-xs)',
    color: 'var(--ds-color-danger, #ef4444)',
    marginTop: 4,
    animation: `ds-form-error-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    borderLeft: '2px solid var(--ds-color-danger, #ef4444)',
    paddingLeft: 8,
  } as CSSProperties,
  hint: {
    fontSize: 'var(--ds-font-size-xs)',
    color: 'var(--ds-color-neutral-400)',
    marginTop: 4,
  } as CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-neutral-700)',
  } as CSSProperties,
  stepBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
  } as CSSProperties,
  stepItem: (active: boolean) =>
    ({
      flex: 1,
      textAlign: 'center',
      padding: '8px 0',
      fontSize: 'var(--ds-font-size-sm)',
      fontWeight: active ? 'var(--ds-typography-heading-font-weight, 600)' : 400,
      color: active ? 'var(--ds-color-primary, #3b82f6)' : 'var(--ds-color-neutral-400)',
      borderBottom: `2px solid ${active ? 'var(--ds-color-primary, #3b82f6)' : 'var(--ds-color-neutral-200)'}`,
      cursor: 'pointer',
      transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    }) as CSSProperties,
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 16,
  } as CSSProperties,
  btn: {
    padding: '8px 20px',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-0, #fff)',
    color: 'var(--ds-color-neutral-700)',
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  btnPrimary: {
    padding: '8px 20px',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    border: 'none',
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-primary, #3b82f6)',
    color: 'var(--ds-color-text-on-primary)',
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  inputError: {
    borderColor: 'var(--ds-color-danger, #ef4444)',
    boxShadow: '0 0 0 1px var(--ds-color-danger, #ef4444)',
  } as CSSProperties,
  submitArea: {
    position: 'sticky' as const,
    bottom: 0,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    background: 'rgba(255, 255, 255, 0.85)',
    padding: '12px 0',
    marginTop: 16,
    borderTop: '1px solid var(--ds-color-neutral-100)',
    zIndex: 5,
  } as CSSProperties,
};

export default function RusticFormBuilder(props: FormBuilderProps) {
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

  const inputStyle = (name: string): CSSProperties =>
    errors[name] ? { ...s.input, ...s.inputError } : s.input;

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
              style={inputStyle(field.name)}
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
              style={inputStyle(field.name)}
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
              style={{ ...s.textarea, ...(errors[field.name] ? s.inputError : {}) }}
            />
          );
        case 'select':
          return (
            <select
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              style={{ ...s.select, ...(errors[field.name] ? s.inputError : {}) }}
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
              style={{ ...s.select, minHeight: 80, ...(errors[field.name] ? s.inputError : {}) }}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              ))}
            </select>
          );
        case 'checkbox':
          return (
            <label style={s.checkboxRow}>
              <input
                type="checkbox"
                checked={!!val}
                onChange={(e) => updateValue(field.name, e.target.checked)}
                disabled={fieldDisabled}
              />
              {field.label}
            </label>
          );
        case 'radio':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {field.options?.map((opt) => (
                <label key={opt.value} style={s.checkboxRow}>
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={val === opt.value}
                    onChange={() => updateValue(field.name, opt.value)}
                    disabled={fieldDisabled || opt.disabled}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          );
        case 'switch':
          return (
            <label style={s.checkboxRow}>
              <input
                type="checkbox"
                checked={!!val}
                onChange={(e) => updateValue(field.name, e.target.checked)}
                disabled={fieldDisabled}
                role="switch"
              />
              {val ? 'On' : 'Off'}
            </label>
          );
        case 'date':
          return <input type="date" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} style={inputStyle(field.name)} />;
        case 'time':
          return <input type="time" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} style={inputStyle(field.name)} />;
        case 'datetime':
          return <input type="datetime-local" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} style={inputStyle(field.name)} />;
        case 'file':
          return <input type="file" disabled={fieldDisabled} style={inputStyle(field.name)} onChange={(e) => updateValue(field.name, e.target.files)} />;
        case 'color':
          // Native color inputs only accept concrete color strings, not CSS vars.
          return <input type="color" value={(val as string) ?? '#111827'} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} style={{ width: 48, height: 36, padding: 2, border: '1px solid var(--ds-color-neutral-300)', borderRadius: 'var(--ds-radius-md)', cursor: 'pointer' }} />;
        case 'slider':
          return <input type="range" value={(val as number) ?? 0} onChange={(e) => updateValue(field.name, Number(e.target.value))} min={field.validation?.min ?? 0} max={field.validation?.max ?? 100} disabled={fieldDisabled} style={{ width: '100%' }} />;
        case 'rating':
          return (
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => !fieldDisabled && updateValue(field.name, star)}
                  style={{ cursor: fieldDisabled ? 'default' : 'pointer', fontSize: 20, color: (val as number) >= star ? 'var(--ds-color-warning, #f59e0b)' : 'var(--ds-color-neutral-300)' }}
                >
                  &#9733;
                </span>
              ))}
            </div>
          );
        case 'custom':
          return field.render?.(field, val, (v) => updateValue(field.name, v)) ?? null;
        default:
          return <input type="text" value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled} readOnly={readOnly} style={inputStyle(field.name)} />;
      }
    },
    [currentValues, disabled, readOnly, updateValue, errors]
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

    const fieldStyle: CSSProperties =
      layout === 'horizontal'
        ? { display: 'flex', alignItems: 'flex-start', gap: 12 }
        : {};

    return (
      <div
        key={field.name}
        style={{
          ...fieldStyle,
          ...(layout === 'grid' && field.colSpan ? { gridColumn: `span ${field.colSpan}` } : {}),
        }}
      >
        {showLabel && (
          <label style={{ ...s.label, ...(layout === 'horizontal' ? { minWidth: 140, paddingTop: 8 } : {}) }}>
            {field.label ?? field.name}
            {showRequired && field.required && <span style={s.required}>*</span>}
          </label>
        )}
        <div style={layout === 'horizontal' ? { flex: 1 } : undefined}>
          {content}
          {field.description && !error && <div style={s.hint}>{field.description}</div>}
          {error && <div style={s.error}>{error}</div>}
        </div>
      </div>
    );
  };

  const fieldsToRender = layout === 'steps' ? (stepFields[currentStep] ?? []) : visibleFields;
  const fieldElements = fieldsToRender.map(renderFormField);
  const gapStr = typeof gap === 'number' ? `${gap}px` : gap;

  const containerStyle: CSSProperties =
    layout === 'grid'
      ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gapStr }
      : { display: 'flex', flexDirection: 'column', gap: gapStr };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{ fontFamily: 'var(--ds-font-family-base)', ...style }}
    >
      <style>{`@keyframes ds-form-error-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {title && <h3 style={s.title}>{title}</h3>}
      {description && <p style={s.description}>{description}</p>}

      {layout === 'steps' && stepLabels && (
        <div style={s.stepBar}>
          {stepLabels.map((label, i) => (
            <div
              key={i}
              style={s.stepItem(i <= currentStep)}
              onClick={() => handleStepChange(i)}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div style={containerStyle}>{fieldElements}</div>

      {layout === 'steps' && stepLabels && (
        <div style={s.navRow}>
          <button type="button" style={s.btn} disabled={currentStep === 0} onClick={() => handleStepChange(currentStep - 1)}>
            Previous
          </button>
          {currentStep < stepLabels.length - 1 && (
            <button type="button" style={s.btnPrimary} onClick={() => handleStepChange(currentStep + 1)}>
              Next
            </button>
          )}
        </div>
      )}

      {actions && <div style={s.submitArea}>{actions}</div>}
    </form>
  );
}
