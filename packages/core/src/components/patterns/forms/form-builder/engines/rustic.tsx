'use client';

/**
 * @fileoverview Rustic (Apollo) engine for the FormBuilder pattern, rendered
 * with token-backed style objects that reference `--ds-*` CSS custom properties.
 * This engine has zero external CSS dependencies (no Tailwind, no Ant Design)
 * so it can run in any host environment -- including iframes, email previews,
 * and Remotion renders -- while still respecting the tenant's design-system
 * theme tokens for colors, radii, typography, and animation personality.
 *
 * @example
 * <RusticFormBuilder
 *   fields={[
 *     { name: 'company', label: 'Company', type: 'text', required: true },
 *     { name: 'industry', label: 'Industry', type: 'select', options: industries },
 *   ]}
 *   layout="horizontal"
 *   onSubmit={(values) => onboardTenant(values)}
 *   actions={<button type="submit" style={{ padding: '8px 20px' }}>Create</button>}
 * />
 */

import React, { useState, useCallback, useMemo, type ReactNode, type CSSProperties } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { FormBuilderProps } from '../FormBuilder.types';
import type { FieldDef } from '../../../foundation/types';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import { resolveAdaptiveFormFieldColumnSpan, resolveAdaptiveFormLayout } from '../adaptive-layout';

// Personality-driven easing and duration: these reference CSS custom properties
// so tenant themes can tune animation feel without touching component code.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

// ---------------------------------------------------------------------------
// Style dictionary
// ---------------------------------------------------------------------------
// All visual tokens reference `--ds-*` CSS custom properties with sensible
// fallbacks so the form renders correctly even without a theme provider.
const ROOT_CLASS_NAME = 'ds-pattern-form-builder ds-engine-rustic';

const s = {
  title: {
    fontSize: 'var(--ds-font-size-xl)',
    fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
    margin: '0 0 4px 0',
  } as CSSProperties,
  description: {
    fontSize: 'var(--ds-font-size-sm)',
    margin: '0 0 24px 0',
  } as CSSProperties,
  label: {
    display: 'block',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 'var(--ds-typography-heading-font-weight, 500)' as unknown as number,
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
    textTransform: 'var(--ds-typography-label-transform, none)' as CSSProperties['textTransform'],
    marginBottom: 6,
  } as CSSProperties,
  required: {
    marginLeft: 3,
  } as CSSProperties,
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: 'var(--ds-font-size-sm)',
    boxSizing: 'border-box' as const,
    transition: `border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  textarea: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: 'var(--ds-font-size-sm)',
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
    boxSizing: 'border-box' as const,
    transition: `border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  error: {
    fontSize: 'var(--ds-font-size-xs)',
    marginTop: 4,
    animation: `ds-form-builder-rustic-error-in ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    paddingLeft: 8,
  } as CSSProperties,
  hint: {
    fontSize: 'var(--ds-font-size-xs)',
    marginTop: 4,
  } as CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
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
      cursor: 'pointer',
      transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    } as CSSProperties),
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 16,
  } as CSSProperties,
  btn: {
    padding: '8px 20px',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  btnPrimary: {
    padding: '8px 20px',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as CSSProperties,
  submitArea: {
    position: 'sticky' as const,
    bottom: 0,
    padding: '12px 0',
    marginTop: 16,
    zIndex: 5,
  } as CSSProperties,
};

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

/**
 * Vanilla inline-style form builder that uses `--ds-*` CSS custom properties
 * for all visual decisions. Ships zero external CSS -- ideal for isolated
 * rendering contexts such as iframes, email templates, or Remotion compositions.
 * Includes a sticky submit area for long scrollable forms inside modals.
 *
 * @param props - Engine-agnostic form configuration; see {@link FormBuilderProps}.
 * @returns A rendered `<form>` element styled with token-backed style objects and CSS variables.
 */
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
    autoAdaptive = false,
  } = props;

  /* -- Auto-adaptive layout override ------------------------------------ */

  const { isMobile, isTablet } = useBreakpoints();

  const { layout: adaptedLayout, columns: adaptedColumns } = resolveAdaptiveFormLayout({
    layout,
    columns,
    autoAdaptive,
    isMobile,
    isTablet,
  });

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

  // Controlled vs uncontrolled: the component works in both modes depending
  // on whether the consumer passes `values` / `currentStep`.
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

  // Validate all visible fields synchronously. Hidden fields are skipped
  // because they should not block submission when their controlling condition
  // is false. Empty string is treated as "not provided" for required checks
  // because HTML inputs default to '' rather than undefined/null.
  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    fields.forEach((field) => {
      if (isHidden(field)) return;
      const val = readRecordValue(currentValues, field.name);
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

  // Intercepts native form submit to run validation first. Only calls
  // onSubmit when all visible fields pass -- the consumer never receives
  // invalid data. Notifies parent of validation state regardless of outcome.
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled) return;

      const errs = validate();
      setErrors(errs);
      onValidationChange?.(errs);
      if (Object.keys(errs).length === 0) {
        onSubmit(currentValues);
      }
    },
    [disabled, validate, onSubmit, currentValues, onValidationChange]
  );

  // Maps each FieldDef type to a native HTML input element styled with
  // inline styles from the `s` dictionary. All visual tokens flow through
  // CSS custom properties so tenant themes control the look without code changes.
  const renderFieldInput = useCallback(
    (field: FieldDef): ReactNode => {
      const val = readRecordValue(currentValues, field.name);
      // Per-field disabled merges with form-level disabled: either wins.
      const fieldDisabled = disabled || field.disabled;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
          return (
            <input
              data-part="value-input"
              data-field-type={field.type}
              type={field.type}
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
        case 'number':
          return (
            <input
              data-part="value-input"
              data-field-type="number"
              type="number"
              placeholder={field.placeholder}
              value={val !== undefined && val !== null ? String(val) : ''}
              onChange={(e) => updateValue(field.name, e.target.value ? Number(e.target.value) : undefined)}
              min={field.validation?.min}
              max={field.validation?.max}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
        case 'textarea':
          return (
            <textarea
              data-part="value-input"
              data-field-type="textarea"
              data-error={Boolean(readRecordValue(errors, field.name))}
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              style={s.textarea}
            />
          );
        case 'select':
          return (
            <select
              data-part="value-input"
              data-field-type="select"
              data-error={Boolean(readRecordValue(errors, field.name))}
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              style={s.select}
            >
              {field.placeholder && <option value="">{field.placeholder}</option>}
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case 'multi-select':
          return (
            <select
              data-part="value-input"
              data-field-type="multi-select"
              data-error={Boolean(readRecordValue(errors, field.name))}
              multiple
              value={(val as string[]) ?? []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                updateValue(field.name, selected);
              }}
              disabled={fieldDisabled}
              style={{ ...s.select, minHeight: 80 }}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case 'checkbox':
          return (
            <label data-part="choice-row" style={s.checkboxRow}>
              <input
                data-part="value-input"
                data-field-type="checkbox"
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
            <div
              data-part="value-input"
              data-field-type="radio"
              style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              {field.options?.map((opt) => (
                <label key={opt.value} data-part="choice-row" style={s.checkboxRow}>
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
            <label data-part="choice-row" style={s.checkboxRow}>
              <input
                data-part="value-input"
                data-field-type="switch"
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
          return (
            <input
              data-part="value-input"
              data-field-type="date"
              type="date"
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
        case 'time':
          return (
            <input
              data-part="value-input"
              data-field-type="time"
              type="time"
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
        case 'datetime':
          return (
            <input
              data-part="value-input"
              data-field-type="datetime"
              type="datetime-local"
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
        case 'file':
          return (
            <input
              data-part="value-input"
              data-field-type="file"
              type="file"
              disabled={fieldDisabled}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
              onChange={(e) => updateValue(field.name, e.target.files)}
            />
          );
        case 'color':
          // Native color inputs only accept concrete color strings, not CSS vars.
          return (
            <input
              data-part="value-input"
              data-field-type="color"
              type="color"
              value={(val as string) ?? '#111827'}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              style={{ width: 48, height: 36, padding: 2, cursor: 'pointer' }}
            />
          );
        case 'slider':
          return (
            <input
              data-part="value-input"
              data-field-type="slider"
              type="range"
              value={(val as number) ?? 0}
              onChange={(e) => updateValue(field.name, Number(e.target.value))}
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 100}
              disabled={fieldDisabled}
              style={{ width: '100%' }}
            />
          );
        case 'rating':
          return (
            <div data-part="value-input" data-field-type="rating" style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  data-part="rating-star"
                  data-active={(val as number) >= star}
                  onClick={() => !fieldDisabled && updateValue(field.name, star)}
                  style={{
                    cursor: fieldDisabled ? 'default' : 'pointer',
                    fontSize: 20,
                  }}
                >
                  &#9733;
                </span>
              ))}
            </div>
          );
        case 'custom':
          return field.render?.(field, val, (v) => updateValue(field.name, v)) ?? null;
        default:
          return (
            <input
              data-part="value-input"
              data-field-type={field.type}
              type="text"
              value={(val as string) ?? ''}
              onChange={(e) => updateValue(field.name, e.target.value)}
              disabled={fieldDisabled}
              readOnly={readOnly}
              data-error={Boolean(readRecordValue(errors, field.name))}
              style={s.input}
            />
          );
      }
    },
    [currentValues, disabled, readOnly, updateValue, errors]
  );

  const visibleFields = useMemo(() => fields.filter((f) => !isHidden(f)), [fields, isHidden]);

  // Distribute fields evenly across steps when explicit step assignments are
  // not provided. This auto-grouping lets consumers add a wizard layout by
  // just supplying stepLabels without restructuring their field array.
  const stepFields = useMemo(() => {
    if (adaptedLayout !== 'steps' || !stepLabels) return [visibleFields];
    const perStep = Math.ceil(visibleFields.length / stepLabels.length);
    const groups: FieldDef[][] = [];
    for (let i = 0; i < stepLabels.length; i++) {
      groups.push(visibleFields.slice(i * perStep, (i + 1) * perStep));
    }
    return groups;
  }, [adaptedLayout, stepLabels, visibleFields]);

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
    const content = renderField
      ? renderField(field, defaultRender, readRecordValue(currentValues, field.name))
      : defaultRender;
    const error = readRecordValue(errors, field.name) as string | undefined;
    // Checkbox fields embed their label inline, so the outer label is hidden
    // to avoid a redundant double-label.
    const showLabel = showLabels && field.type !== 'checkbox';

    // Horizontal layout puts label and input side-by-side in a flex row;
    // other layouts stack them vertically.
    const fieldStyle: CSSProperties =
      adaptedLayout === 'horizontal' ? { display: 'flex', alignItems: 'flex-start', gap: 12 } : {};

    const columnSpan = resolveAdaptiveFormFieldColumnSpan({
      columnSpan: field.colSpan,
      columns: adaptedColumns,
      autoAdaptive,
      isMobile,
      isTablet,
    });

    return (
      <div
        key={field.name}
        data-part="field"
        style={{
          ...fieldStyle,
          ...(adaptedLayout === 'grid' && columnSpan ? { gridColumn: `span ${columnSpan}` } : {}),
        }}
      >
        {showLabel && (
          <label
            data-part="field-label"
            style={{
              ...s.label,
              ...(adaptedLayout === 'horizontal' ? { minWidth: 140, paddingTop: 8 } : {}),
            }}
          >
            {field.label ?? field.name}
            {showRequired && field.required && (
              <span data-part="required-mark" style={s.required}>
                *
              </span>
            )}
          </label>
        )}
        <div data-part="field-content" style={adaptedLayout === 'horizontal' ? { flex: 1 } : undefined}>
          {content}
          {field.description && !error && (
            <div data-part="field-description" style={s.hint}>
              {field.description}
            </div>
          )}
          {error && (
            <div data-part="field-error" style={s.error}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  };

  const fieldsToRender = adaptedLayout === 'steps' ? arrayValueAt(stepFields, currentStep) ?? [] : visibleFields;
  const fieldElements = fieldsToRender.map(renderFormField);
  const gapStr = typeof gap === 'number' ? `${gap}px` : gap;

  // Grid mode uses CSS Grid; all other layouts use a vertical flex column.
  // Gap is unified across both strategies so field spacing stays consistent.
  const containerStyle: CSSProperties =
    adaptedLayout === 'grid'
      ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${adaptedColumns}, 1fr)`,
          gap: gapStr,
        }
      : { display: 'flex', flexDirection: 'column', gap: gapStr };

  return (
    <form
      data-part="root"
      onSubmit={handleSubmit}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={{ fontFamily: 'var(--ds-font-family-base)', ...style }}
    >
      {title && (
        <h3 data-part="title" style={s.title}>
          {title}
        </h3>
      )}
      {description && (
        <p data-part="description" style={s.description}>
          {description}
        </p>
      )}

      {/* Step bar renders a bottom-bordered indicator for each step.
          Steps up to and including the current one are highlighted with
          the primary colour via the `s.stepItem(active)` factory. */}
      {adaptedLayout === 'steps' && stepLabels && (
        <div data-part="step-list" style={s.stepBar}>
          {stepLabels.map((label, i) => (
            <div
              key={i}
              data-part="step-tab"
              data-active={i <= currentStep}
              style={s.stepItem(i <= currentStep)}
              onClick={() => handleStepChange(i)}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div data-part="fields" style={containerStyle}>
        {fieldElements}
      </div>

      {adaptedLayout === 'steps' && stepLabels && (
        <div data-part="wizard-nav" style={s.navRow}>
          <button
            type="button"
            data-part="wizard-prev-button"
            style={s.btn}
            disabled={currentStep === 0}
            onClick={() => handleStepChange(currentStep - 1)}
          >
            Previous
          </button>
          {currentStep < stepLabels.length - 1 && (
            <button
              type="button"
              data-part="wizard-next-button"
              style={s.btnPrimary}
              onClick={() => handleStepChange(currentStep + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Submit area is position:sticky so it stays visible when the form
          scrolls inside a modal or side panel. */}
      {actions && (
        <div data-part="action-bar" style={s.submitArea}>
          {actions}
        </div>
      )}
    </form>
  );
}
