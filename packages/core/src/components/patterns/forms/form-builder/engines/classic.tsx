'use client';

/**
 * @fileoverview Classic (Titan) engine for the FormBuilder pattern, built on
 * Ant Design's `<Form>`, `<Form.Item>`, and individual input components.
 * It translates the engine-agnostic `FormBuilderProps` and `FieldDef[]` into
 * Ant Design form items with validation feedback, supporting vertical,
 * horizontal, grid, and wizard (steps) layouts. Controlled and uncontrolled
 * value modes are both supported via an internal/external state toggle.
 *
 * @example
 * <ClassicFormBuilder
 *   fields={[
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *     { name: 'role', label: 'Role', type: 'select', options: roleOptions },
 *   ]}
 *   layout="vertical"
 *   onSubmit={(values) => createUser(values)}
 *   actions={<Button type="primary" htmlType="submit">Save</Button>}
 * />
 */

import React, { useState, useCallback, useMemo, type ReactNode } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Upload,
  Slider,
  Rate,
  Button,
  Steps,
  Typography,
  ColorPicker,
} from 'antd';
import type { FormBuilderProps } from '../FormBuilder.types';
import type { FieldDef } from '../../../foundation/types';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

/**
 * Ant Design-backed form builder that translates a declarative `FieldDef[]`
 * schema into `<Form.Item>` wrapped input components. Supports four layout
 * modes (vertical, horizontal, grid, steps) and both controlled and
 * uncontrolled value management with synchronous validation.
 *
 * @param props - Engine-agnostic form configuration; see {@link FormBuilderProps}.
 * @returns A rendered `<form>` element backed by Ant Design form primitives.
 */
export default function ClassicFormBuilder(props: FormBuilderProps) {
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

  // Lazy initializer merges field-level defaults with caller-supplied initialValues.
  // initialValues wins over defaultValue so server-loaded data takes precedence.
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
  // Always fire onChange so both controlled and uncontrolled consumers stay in sync.
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

  // Validate all visible fields synchronously. Hidden fields are skipped because
  // they should not block submission when their controlling condition is false.
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

  // Intercepts native form submit to run validation first. Only calls
  // onSubmit when no errors remain -- the consumer never receives invalid data.
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      // Notify parent of validation state regardless of outcome so it can
      // display summary banners or disable external submit buttons.
      onValidationChange?.(errs);
      if (Object.keys(errs).length === 0) {
        onSubmit(currentValues);
      }
    },
    [validate, onSubmit, currentValues, onValidationChange]
  );

  // Maps each FieldDef type to the corresponding Ant Design input component.
  // `commonProps` centralizes disabled/readOnly so each case only adds
  // type-specific props. Custom fields receive a setter callback so they
  // can update form state without accessing internals.
  const renderFieldInput = useCallback(
    (field: FieldDef): ReactNode => {
      const val = currentValues[field.name];
      // Per-field disabled merges with form-level disabled: either wins.
      const fieldDisabled = disabled || field.disabled;
      const commonProps = { disabled: fieldDisabled, readOnly };

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
          return field.type === 'password' ? (
            <Input.Password placeholder={field.placeholder} value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} {...commonProps} />
          ) : (
            <Input type={field.type} placeholder={field.placeholder} value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} {...commonProps} />
          );
        case 'number':
          return <InputNumber placeholder={field.placeholder} value={val as number} onChange={(v) => updateValue(field.name, v)} min={field.validation?.min} max={field.validation?.max} style={{ width: '100%' }} {...commonProps} />;
        case 'textarea':
          return <TextArea placeholder={field.placeholder} value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} rows={4} {...commonProps} />;
        case 'select':
          return <Select placeholder={field.placeholder} value={val as string} onChange={(v) => updateValue(field.name, v)} options={field.options} disabled={fieldDisabled} style={{ width: '100%' }} />;
        case 'multi-select':
          return <Select mode="multiple" placeholder={field.placeholder} value={(val as string[]) ?? []} onChange={(v) => updateValue(field.name, v)} options={field.options} disabled={fieldDisabled} style={{ width: '100%' }} />;
        case 'checkbox':
          return <Checkbox checked={!!val} onChange={(e) => updateValue(field.name, e.target.checked)} disabled={fieldDisabled}>{field.label}</Checkbox>;
        case 'radio':
          return (
            <Radio.Group value={val} onChange={(e) => updateValue(field.name, e.target.value)} disabled={fieldDisabled}>
              {field.options?.map((opt) => <Radio key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</Radio>)}
            </Radio.Group>
          );
        case 'switch':
          return <Switch checked={!!val} onChange={(v) => updateValue(field.name, v)} disabled={fieldDisabled} />;
        case 'date':
          return <DatePicker value={val as any} onChange={(v) => updateValue(field.name, v)} style={{ width: '100%' }} disabled={fieldDisabled} />;
        case 'time':
          return <TimePicker value={val as any} onChange={(v) => updateValue(field.name, v)} style={{ width: '100%' }} disabled={fieldDisabled} />;
        case 'datetime':
          return <DatePicker showTime value={val as any} onChange={(v) => updateValue(field.name, v)} style={{ width: '100%' }} disabled={fieldDisabled} />;
        case 'file':
          return <Upload disabled={fieldDisabled}><Button>Upload</Button></Upload>;
        case 'color':
          return <ColorPicker value={val as string} onChange={(_, hex) => updateValue(field.name, hex)} disabled={fieldDisabled} />;
        case 'slider':
          return <Slider value={val as number} onChange={(v) => updateValue(field.name, v)} min={field.validation?.min ?? 0} max={field.validation?.max ?? 100} disabled={fieldDisabled} />;
        case 'rating':
          return <Rate value={val as number} onChange={(v) => updateValue(field.name, v)} disabled={fieldDisabled} />;
        case 'custom':
          return field.render?.(field, val, (v) => updateValue(field.name, v)) ?? null;
        default:
          return <Input value={(val as string) ?? ''} onChange={(e) => updateValue(field.name, e.target.value)} {...commonProps} />;
      }
    },
    [currentValues, disabled, readOnly, updateValue]
  );

  const visibleFields = useMemo(
    () => fields.filter((f) => !isHidden(f)),
    [fields, isHidden]
  );

  // Distribute fields evenly across steps when explicit step assignments are
  // not provided. This auto-grouping lets consumers add a wizard layout by just
  // supplying stepLabels without restructuring their field array.
  const stepFields = useMemo(() => {
    if (layout !== 'steps' || !stepLabels) return [visibleFields];
    const perStep = Math.ceil(visibleFields.length / stepLabels.length);
    const groups: FieldDef[][] = [];
    for (let i = 0; i < stepLabels.length; i++) {
      groups.push(visibleFields.slice(i * perStep, (i + 1) * perStep));
    }
    return groups;
  }, [layout, stepLabels, visibleFields]);

  // renderField is the consumer's escape hatch: it receives the default control,
  // the field definition, and current value so it can wrap, replace, or augment.
  const renderFormField = (field: FieldDef) => {
    const defaultRender = renderFieldInput(field);
    const content = renderField ? renderField(field, defaultRender, currentValues[field.name]) : defaultRender;
    const error = errors[field.name];

    return (
      <Form.Item
        key={field.name}
        label={showLabels && field.type !== 'checkbox' ? (
          <>
            {field.label ?? field.name}
            {showRequired && field.required && <span style={{ color: 'var(--ds-color-danger, #ff4d4f)', marginLeft: 4 }}>*</span>}
          </>
        ) : undefined}
        help={error || field.description}
        validateStatus={error ? 'error' : undefined}
        style={layout === 'grid' && field.colSpan ? { gridColumn: `span ${field.colSpan}` } : undefined}
      >
        {content}
      </Form.Item>
    );
  };

  // Ant Design Form accepts 'horizontal' or 'vertical'; grid and steps
  // layouts use vertical item stacking and handle their own wrapping.
  const formLayout = layout === 'horizontal' ? 'horizontal' : 'vertical';

  // In step mode, only the current step's fields are rendered.
  const fieldsToRender = layout === 'steps' ? (stepFields[currentStep] ?? []) : visibleFields;

  const fieldElements = fieldsToRender.map(renderFormField);

  // Grid layout wraps field elements in a CSS grid container; all other
  // layouts rely on Ant Form's built-in stacking behaviour.
  const wrappedFields =
    layout === 'grid' ? (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: typeof gap === 'number' ? `${gap}px` : gap }}>
        {fieldElements}
      </div>
    ) : (
      fieldElements
    );

  // Step navigation supports both controlled (parent manages step) and
  // uncontrolled (internal state) modes -- same pattern as selection.
  const handleStepChange = (step: number) => {
    if (!controlledStep) setInternalStep(step);
    onStepChange?.(step);
  };

  return (
    <form onSubmit={handleSubmit} className={className} style={style}>
      {title && <Title level={4}>{title}</Title>}
      {description && <Paragraph type="secondary">{description}</Paragraph>}

      {/* Ant Design Steps component renders clickable step indicators.
          It is only mounted in 'steps' layout mode. */}
      {layout === 'steps' && stepLabels && (
        <Steps
          current={currentStep}
          onChange={handleStepChange}
          items={stepLabels.map((label) => ({ title: label }))}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* component="div" prevents Ant Form from adding a nested <form> tag
          inside our outer <form>, which would be invalid HTML. */}
      <Form layout={formLayout} component="div" style={{ gap: typeof gap === 'number' ? `${gap}px` : gap }}>
        {wrappedFields}
      </Form>

      {layout === 'steps' && stepLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Button disabled={currentStep === 0} onClick={() => handleStepChange(currentStep - 1)}>
            Previous
          </Button>
          {currentStep < stepLabels.length - 1 ? (
            <Button type="primary" onClick={() => handleStepChange(currentStep + 1)}>
              Next
            </Button>
          ) : null}
        </div>
      )}

      {actions && <div style={{ marginTop: 16 }}>{actions}</div>}
    </form>
  );
}
