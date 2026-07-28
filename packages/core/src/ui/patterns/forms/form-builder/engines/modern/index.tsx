'use client';

/**
 * @fileoverview Modern (Hermes) engine for the FormBuilder pattern. Renders
 * DS primitive components (Input, Select, Checkbox, etc.) instead of raw
 * HTML form elements. All visuals come from CSS custom properties for full
 * theme compliance. Supports vertical, horizontal, grid, and wizard (steps)
 * layouts, collapsible sections, read-only mode, and a sticky action bar.
 *
 * Wave 5.5-A: Rewritten to use DS primitives instead of raw HTML inputs.
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
 *   actions={<button type="submit">Save</button>}
 * />
 */

import React, { useState, useCallback, useMemo, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { FormBuilderProps } from '../../contracts';
import type { FieldDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { resolveAdaptiveFormFieldColumnSpan, resolveAdaptiveFormLayout } from '../../runtime/responsive';

/* -- DS Primitive imports ------------------------------------------------- */
import { Input } from '../../../../../primitives/inputs/Input';
import { InputNumber } from '../../../../../primitives/inputs/InputNumber';
import { PasswordInput } from '../../../../../primitives/inputs/PasswordInput';
import { Textarea } from '../../../../../primitives/inputs/Textarea';
import { Select } from '../../../../../primitives/inputs/Select';
import { Checkbox } from '../../../../../primitives/inputs/Checkbox';
import { Radio } from '../../../../../primitives/inputs/Radio';
import { Switch } from '../../../../../primitives/inputs/Switch';
import { FormField } from '../../../../../primitives/inputs/FormField';
import { DatePicker } from '../../../../../primitives/inputs/DatePicker';
import { TimePicker } from '../../../../../primitives/inputs/TimePicker';
import { Upload } from '../../../../../primitives/inputs/Upload';
import type { UploadChangeInfo } from '../../../../../primitives/inputs/Upload';
import { ColorPicker } from '../../../../../primitives/inputs/ColorPicker';
import type { Color } from '../../../../../primitives/inputs/ColorPicker/contracts';
import { Slider } from '../../../../../primitives/inputs/Slider';
import { Rate } from '../../../../../primitives/feedback/Rate';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernSteps from '../../../../../primitives/navigation/Steps/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ---------------------------------------------------------------------------
 * Shared inline-style constants (DS tokens) -- retained for read-only
 * rendering where DS primitives are not used.
 * -------------------------------------------------------------------------*/

const ROOT_CLASS_NAME = 'ds-pattern-form-builder ds-engine-modern';

const readOnlyTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: '20px',
  padding: '8px 0',
  minHeight: 36,
};

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useFormBuilderTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.t(key, params);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

/* Chevron icon for collapsible sections -- the rotation is state-selected in
   the skin off `data-collapsed`; no inline transition (reduced-motion owns). */
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    data-part="section-chevron"
    data-collapsed={collapsed}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------------------------------------------------------------------------
 * ModernFormBuilder
 * -------------------------------------------------------------------------*/

/**
 * DS-primitive-driven form builder that renders DS components (Input, Select,
 * Checkbox, Radio, Switch, etc.) instead of raw HTML elements. Manages value
 * state, validation, conditional visibility, collapsible sections, read-only
 * mode, and multi-step wizard navigation internally -- no form library required.
 *
 * @param props - Engine-agnostic form configuration; see {@link FormBuilderProps}.
 * @returns A rendered `<form>` element using DS primitive components.
 */
export default function ModernFormBuilder(props: FormBuilderProps) {
  const { tOr } = useFormBuilderTranslation();
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

  /* -- State ------------------------------------------------------------ */

  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    return { ...defaults, ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [internalStep, setInternalStep] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const currentValues = controlledValues ?? internalValues;
  const currentStep = controlledStep ?? internalStep;

  /* Refs for measuring collapsible content heights */
  const sectionContentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});

  /* -- Callbacks -------------------------------------------------------- */

  const updateValue = useCallback(
    (name: string, value: unknown) => {
      if (!controlledValues) {
        setInternalValues((previousValues) => {
          const next = { ...previousValues, [name]: value };
          onChange?.(next);
          return next;
        });
        return;
      }

      const next = { ...controlledValues, [name]: value };
      onChange?.(next);
    },
    [controlledValues, onChange]
  );

  const isHidden = useCallback(
    (field: FieldDef): boolean => {
      if (typeof field.hidden === 'function') return field.hidden(currentValues);
      return !!field.hidden;
    },
    [currentValues]
  );

  /** Centralised empty-check that understands each field type's "no value" shape. */
  const isEmptyFieldValue = useCallback((field: FieldDef, val: unknown): boolean => {
    if (val === undefined || val === null) return true;
    if (val === '') return true;
    // checkbox / switch: false counts as empty when required
    if ((field.type === 'checkbox' || field.type === 'switch') && val === false) return true;
    // multi-select: empty array
    if (field.type === 'multi-select' && Array.isArray(val) && val.length === 0) return true;
    // file: empty array, null File, or absent
    if (field.type === 'file') {
      if (Array.isArray(val) && val.length === 0) return true;
    }
    // rating: 0 counts as "no rating selected" when required
    if (field.type === 'rating' && val === 0) return true;
    return false;
  }, []);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    fields.forEach((field) => {
      if (isHidden(field)) return;
      const val = readRecordValue(currentValues, field.name);
      if (field.required && isEmptyFieldValue(field, val)) {
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

  const toggleSection = useCallback((sectionKey: string) => {
    setCollapsedSections((prev: Record<string, boolean>) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  /* -- Measure section heights for smooth collapse animation ------------ */

  useEffect(() => {
    const heights: Record<string, number> = {};
    for (const [key, ref] of Object.entries(sectionContentRefs.current)) {
      if (ref) heights[key] = ref.scrollHeight;
    }
    setSectionHeights(heights);
  }, [fields, currentValues]);

  /* -- Read-only value renderer ----------------------------------------- */

  const renderReadOnlyValue = useCallback(
    (field: FieldDef): ReactNode => {
      const val = readRecordValue(currentValues, field.name);
      if (val === undefined || val === null || val === '') {
        return (
          <span data-part="readonly-value" data-field-type="empty" style={readOnlyTextStyle}>
            --
          </span>
        );
      }

      switch (field.type) {
        case 'checkbox':
        case 'switch':
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              {val ? 'Yes' : 'No'}
            </span>
          );
        case 'select':
        case 'radio': {
          const opt = field.options?.find((o) => o.value === val);
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              {opt?.label ?? String(val)}
            </span>
          );
        }
        case 'multi-select': {
          const vals = val as string[];
          const labels = vals.map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              {labels.join(', ')}
            </span>
          );
        }
        case 'color':
          return (
            <span
              data-part="readonly-value"
              data-field-type={field.type}
              style={{
                ...readOnlyTextStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* `background` is the hex the user picked -- a value computed from data,
                  never selectable from a token set, so it cannot leave the TSX. */}
              <span data-part="color-swatch" style={{ width: 20, height: 20, background: String(val) }} />
              {String(val)}
            </span>
          );
        case 'rating':
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              {'*'.repeat(val as number) + ` (${val}/5)`}
            </span>
          );
        case 'file':
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              [File attached]
            </span>
          );
        default:
          return (
            <span data-part="readonly-value" data-field-type={field.type} style={readOnlyTextStyle}>
              {String(val)}
            </span>
          );
      }
    },
    [currentValues]
  );

  /* -- Field input renderer --------------------------------------------- */

  const renderFieldInput = useCallback(
    (field: FieldDef): ReactNode => {
      if (readOnly) return renderReadOnlyValue(field);

      const val = readRecordValue(currentValues, field.name);
      const fieldDisabled = disabled || field.disabled;
      const hasError = Boolean(readRecordValue(errors, field.name));

      switch (field.type) {
        case 'text':
        case 'email':
          return (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              required={field.required}
              error={hasError}
              status={hasError ? 'error' : undefined}
            />
          );
        case 'password':
          return (
            <PasswordInput
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              required={field.required}
              error={hasError}
              showToggle
            />
          );
        case 'number':
          return (
            <InputNumber
              placeholder={field.placeholder}
              value={val as number | null | undefined}
              onChange={(newValue) => updateValue(field.name, newValue)}
              min={field.validation?.min}
              max={field.validation?.max}
              disabled={fieldDisabled}
              status={hasError ? 'error' : undefined}
            />
          );
        case 'textarea':
          return (
            <Textarea
              placeholder={field.placeholder}
              value={(val as string) ?? ''}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              required={field.required}
              rows={4}
              status={hasError ? 'error' : undefined}
            />
          );
        case 'select':
          return (
            <Select
              placeholder={field.placeholder}
              value={(val as string) ?? undefined}
              options={(field.options ?? []).map((opt) => ({
                value: opt.value,
                label: opt.label,
                disabled: opt.disabled,
              }))}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              error={hasError}
            />
          );
        case 'multi-select':
          return (
            <Select
              placeholder={field.placeholder}
              value={(val as string[]) ?? []}
              multiple
              options={(field.options ?? []).map((opt) => ({
                value: opt.value,
                label: opt.label,
                disabled: opt.disabled,
              }))}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              error={hasError}
            />
          );
        case 'checkbox':
          return (
            <Checkbox
              checked={!!val}
              onChange={(checked) => updateValue(field.name, checked)}
              disabled={fieldDisabled}
              label={field.label}
            />
          );
        case 'radio':
          return (
            <Radio.Group
              name={field.name}
              value={val as string | number | undefined}
              options={(field.options ?? []).map((opt) => ({
                value: opt.value,
                label: opt.label,
                disabled: opt.disabled,
              }))}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              direction="vertical"
            />
          );
        case 'switch':
          return (
            <Switch checked={!!val} onChange={(checked) => updateValue(field.name, checked)} disabled={fieldDisabled} />
          );
        /* ------------------------------------------------------------------
         * DS Primitive inputs -- DatePicker, TimePicker, Upload, ColorPicker,
         * Slider, Rate. Each primitive's onChange is adapted to the FormBuilder
         * updateValue(fieldName, value) signature.
         * ----------------------------------------------------------------*/
        case 'date':
          return (
            <DatePicker
              value={(val as string | Date) ?? null}
              placeholder={field.placeholder ?? 'Select date'}
              onChange={(_date: Date | null, dateString: string) => updateValue(field.name, dateString)}
              disabled={fieldDisabled}
              status={hasError ? 'error' : undefined}
              allowClear
            />
          );
        case 'time':
          return (
            <TimePicker
              value={(val as string | Date) ?? null}
              placeholder={field.placeholder ?? 'Select time'}
              onChange={(_time: Date | null, timeString: string) => updateValue(field.name, timeString)}
              disabled={fieldDisabled}
              status={hasError ? 'error' : undefined}
              allowClear
            />
          );
        case 'datetime':
          return (
            <DatePicker
              value={(val as string | Date) ?? null}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder={field.placeholder ?? 'Select date and time'}
              onChange={(_date: Date | null, dateString: string) => updateValue(field.name, dateString)}
              disabled={fieldDisabled}
              status={hasError ? 'error' : undefined}
              allowClear
            />
          );
        case 'file': {
          // File field contract: value is File | File[] | null.
          // The fileList adapter converts to Upload's expected shape for
          // bidirectional sync (initial values, resets, external changes).
          // We do NOT accept pre-persisted UploadFile objects with uid --
          // FormBuilder deals in raw Files only.
          const toFileList = (raw: unknown) => {
            if (!raw) return [];
            const files: File[] = Array.isArray(raw)
              ? raw.filter((f): f is File => f instanceof File)
              : raw instanceof File
              ? [raw]
              : [];
            return files.map((f, i) => ({
              uid: `fb-file-${i}-${f.name}`,
              name: f.name,
              size: f.size,
              type: f.type,
              status: 'done' as const,
              originFileObj: f,
            }));
          };
          const fileList = toFileList(val);
          return (
            <Upload
              disabled={fieldDisabled}
              fileList={fileList as never[]}
              onChange={(info: UploadChangeInfo) => {
                // Preserve only actual File objects -- drop stale entries
                // without originFileObj (e.g., after removal).
                const files = info.fileList.map((f) => f.originFileObj).filter((f): f is File => f instanceof File);
                updateValue(field.name, files.length === 0 ? null : files.length === 1 ? files[0] : files);
              }}
              beforeUpload={() => false}
              maxCount={1}
            >
              <span
                data-part="upload-trigger"
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  fontSize: 14,
                  cursor: fieldDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {fileList.length > 0 ? fileList[0]?.name ?? 'File selected' : 'Choose file'}
              </span>
            </Upload>
          );
        }
        case 'color':
          return (
            <ColorPicker
              value={val as string | undefined}
              onChange={(_color: Color, hex: string) => updateValue(field.name, hex)}
              disabled={fieldDisabled}
              showText
              format="hex"
            />
          );
        case 'slider': {
          const sliderMin = field.validation?.min ?? 0;
          const sliderMax = field.validation?.max ?? 100;
          return (
            <Slider
              value={(val as number) ?? sliderMin}
              onChange={(newValue: number | [number, number]) => updateValue(field.name, newValue)}
              min={sliderMin}
              max={sliderMax}
              step={1}
              disabled={fieldDisabled}
              tooltip={{ placement: 'top' }}
            />
          );
        }
        case 'rating':
          return (
            <Rate
              value={(val as number) ?? 0}
              onChange={(newValue: number) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              count={5}
              allowClear
            />
          );
        case 'custom':
          return field.render?.(field, val, (v) => updateValue(field.name, v)) ?? null;
        default:
          return (
            <Input
              value={(val as string) ?? ''}
              onChange={(newValue) => updateValue(field.name, newValue)}
              disabled={fieldDisabled}
              error={hasError}
            />
          );
      }
    },
    [currentValues, disabled, readOnly, updateValue, errors, renderReadOnlyValue]
  );

  /* -- Loading skeleton -------------------------------------------------- */

  if (loading) {
    return (
      <div
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={{ maxWidth: 720, width: '100%', ...style }}
      >
        {/* Title shimmer */}
        <div
          data-part="skeleton-bar"
          style={{
            height: 20,
            width: '40%',
            marginBottom: 8,
            /* shimmer animation is skin-owned (reduced-motion governs) */
          }}
        />
        {/* Description shimmer */}
        <div
          data-part="skeleton-bar"
          style={{
            height: 14,
            width: '65%',
            marginBottom: 28,
            /* shimmer animation is skin-owned (reduced-motion governs) */
          }}
        />
        {/* Field shimmer rows */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div
              data-part="skeleton-bar"
              data-variant="label"
              style={{
                height: 14,
                width: 100,
                marginBottom: 8,
                /* shimmer animation is skin-owned (reduced-motion governs) */
              }}
            />
            <div
              data-part="skeleton-bar"
              style={{
                height: 40,
                width: '100%',
                /* shimmer animation is skin-owned (reduced-motion governs) */
              }}
            />
          </div>
        ))}
        {/* Action bar shimmer */}
        <div
          data-part="action-bar"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 32,
            paddingTop: 20,
          }}
        >
          <div
            data-part="skeleton-bar"
            style={{
              height: 36,
              width: 80,
              /* shimmer animation is skin-owned (reduced-motion governs) */
            }}
          />
          <div
            data-part="skeleton-bar"
            style={{
              height: 36,
              width: 100,
              /* shimmer animation is skin-owned (reduced-motion governs) */
            }}
          />
        </div>
      </div>
    );
  }

  /* -- Visible fields --------------------------------------------------- */

  const visibleFields = useMemo(() => fields.filter((f) => !isHidden(f)), [fields, isHidden]);

  /* -- Step field distribution ------------------------------------------ */

  const stepFields = useMemo(() => {
    if (adaptedLayout !== 'steps' || !stepLabels) return [visibleFields];
    const perStep = Math.ceil(visibleFields.length / stepLabels.length);
    const groups: FieldDef[][] = [];
    for (let i = 0; i < stepLabels.length; i++) {
      groups.push(visibleFields.slice(i * perStep, (i + 1) * perStep));
    }
    return groups;
  }, [adaptedLayout, stepLabels, visibleFields]);

  const handleStepChange = (step: number) => {
    if (controlledStep === undefined) setInternalStep(step);
    onStepChange?.(step);
  };

  /* -- Section grouping ------------------------------------------------- */

  /**
   * Groups visible fields into sections. A field with type 'custom' and a
   * name starting with 'section:' acts as a section header delimiter.
   * Otherwise all fields belong to a default unnamed section.
   */
  const groupedSections = useMemo(() => {
    const fieldsToGroup = adaptedLayout === 'steps' ? arrayValueAt(stepFields, currentStep) ?? [] : visibleFields;
    const sections: {
      key: string;
      title?: string;
      description?: string;
      fields: FieldDef[];
    }[] = [];
    let current: {
      key: string;
      title?: string;
      description?: string;
      fields: FieldDef[];
    } = {
      key: '__default',
      fields: [],
    };

    for (const field of fieldsToGroup) {
      // Convention: fields named "section:xxx" act as section delimiters
      if (field.name.startsWith('section:')) {
        if (current.fields.length > 0 || current.title) sections.push(current);
        current = {
          key: field.name,
          title: field.label,
          description: field.description,
          fields: [],
        };
      } else {
        current.fields.push(field);
      }
    }
    if (current.fields.length > 0 || current.title) sections.push(current);

    return sections;
  }, [adaptedLayout, stepFields, currentStep, visibleFields]);

  /* -- Field renderer --------------------------------------------------- */

  const renderFormField = (field: FieldDef) => {
    const defaultRender = renderFieldInput(field);
    const content = renderField
      ? renderField(field, defaultRender, readRecordValue(currentValues, field.name))
      : defaultRender;
    const error = readRecordValue(errors, field.name) as string | undefined;
    const showLabel = showLabels && field.type !== 'checkbox';
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
          width: '100%',
          ...(adaptedLayout === 'grid' && columnSpan ? { gridColumn: `span ${columnSpan}` } : {}),
        }}
      >
        {showLabel ? (
          <FormField
            engine="modern"
            label={field.label ?? field.name}
            name={field.name}
            required={showRequired ? field.required : false}
            error={error}
            help={field.description}
            disabled={disabled || field.disabled}
          >
            {content}
          </FormField>
        ) : (
          <>
            {content}
            {field.description && !error && (
              <div data-part="field-description">
                {field.description}
              </div>
            )}
            {error && (
              <div data-part="field-error">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* -- Layout helpers --------------------------------------------------- */

  const gapStr = typeof gap === 'number' ? `${gap}px` : gap;

  const renderFields = (fieldsToRender: FieldDef[]) => {
    const fieldElements = fieldsToRender.map(renderFormField);

    if (adaptedLayout === 'grid') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${adaptedColumns}, 1fr)`,
            gap: '20px',
          }}
        >
          {fieldElements}
        </div>
      );
    }

    if (adaptedLayout === 'horizontal') {
      return (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: gapStr,
          }}
        >
          {fieldElements}
        </div>
      );
    }

    // vertical (default)
    return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>{fieldElements}</div>;
  };

  /* -- Render ----------------------------------------------------------- */

  const formContainerStyle: CSSProperties = {
    maxWidth: 720,
    width: '100%',
    ...style,
  };

  return (
    <form
      data-part="root"
      onSubmit={handleSubmit}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={formContainerStyle}
    >
      {/* Title & description */}
      {(title || description) && (
        <div data-part="head">
          {title && (
            <div data-part="title">
              {title}
            </div>
          )}
          {description && (
            <div data-part="description">
              {description}
            </div>
          )}
        </div>
      )}

      {/* Wizard step rail: the public Steps navigation primitive (single
          paint owner; clickable steps render a real button trigger inside the
          item -- keyboard-reachable by construction). */}
      {adaptedLayout === 'steps' && stepLabels && (
        <div data-part="step-list">
          <ModernSteps
            items={stepLabels.map((label) => ({ title: label }))}
            current={currentStep}
            onChange={(step) => handleStepChange(step)}
            direction="horizontal"
            size="small"
            responsive
          />
        </div>
      )}

      {/* Sections with optional collapse */}
      {groupedSections.map((section, sectionIdx) => {
        const isCollapsed = Boolean(readRecordValue(collapsedSections, section.key));
        const hasSectionHeader = !!section.title;
        const contentHeight = readRecordValue(sectionHeights, section.key) as number | undefined;

        return (
          <div key={section.key}>
            {/* Section divider (between sections, not before first) */}
            {sectionIdx > 0 && (
              <div data-part="section-divider" />
            )}

            {/* Section header (disclosure): a Button primitive spanning the
                row; the chevron rotation is skin-owned off data-collapsed. */}
            {hasSectionHeader && (
              <ModernButton
                data-part="section-header"
                data-collapsed={isCollapsed}
                variant="ghost"
                size="md"
                onClick={() => toggleSection(section.key)}
                aria-expanded={!isCollapsed}
              >
                <div>
                  <div data-part="section-title">
                    {section.title}
                  </div>
                  {section.description && (
                    <div data-part="section-description">
                      {section.description}
                    </div>
                  )}
                </div>
                <ChevronIcon collapsed={isCollapsed} />
              </ModernButton>
            )}

            {/* Section content with smooth collapse. The transition lives in
                the skin (reduced-motion governs); max-height/opacity stay
                inline as runtime state values. */}
            <div
              data-part="section-content"
              data-collapsed={isCollapsed}
              ref={(el) => {
                Reflect.set(sectionContentRefs.current, section.key, el);
              }}
              style={{
                overflow: 'hidden',
                maxHeight: hasSectionHeader ? (isCollapsed ? 0 : contentHeight ?? 2000) : undefined,
                opacity: isCollapsed ? 0 : 1,
              }}
            >
              {renderFields(section.fields)}
            </div>
          </div>
        );
      })}

      {/* Wizard step navigation */}
      {adaptedLayout === 'steps' && stepLabels && (
        <div data-part="wizard-nav">
          <div>
            {currentStep > 0 && (
              <ModernButton
                data-part="wizard-prev-button"
                variant="outline"
                size="md"
                disabled={currentStep === 0}
                onClick={() => handleStepChange(currentStep - 1)}
              >
                {tOr('form_builder.previous', 'Previous')}
              </ModernButton>
            )}
          </div>
          <div data-part="wizard-nav-end">
            {/* Step counter text -- tabular numerals via the skin. */}
            <span data-part="wizard-step-counter">
              {tOr('form_builder.step_counter', 'Step {current} of {total}', {
                current: currentStep + 1,
                total: stepLabels.length,
              })}
            </span>
            {currentStep < stepLabels.length - 1 && (
              <ModernButton
                data-part="wizard-next-button"
                variant="primary"
                size="md"
                onClick={() => handleStepChange(currentStep + 1)}
              >
                {tOr('form_builder.next', 'Next')}
              </ModernButton>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      {actions && (
        <div data-part="action-bar">
          {actions}
        </div>
      )}
    </form>
  );
}
