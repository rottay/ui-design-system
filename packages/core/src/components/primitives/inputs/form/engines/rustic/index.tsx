'use client';

/**
 * @fileoverview Form Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a headless form implementation using
 * native HTML elements and runtime style props. This offers maximum flexibility
 * for custom styling and ensures full accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Complete form state management
 * - Custom validation engine
 * - Inline styles for layout
 * - Full FormInstance API
 * - ARIA role="form" for accessibility
 *
 * **Runtime:**
 * State, validation and `useForm` come from the shared form runtime
 * (`runtime/state`, `runtime/validation`), the same one Modern renders from.
 *
 * **Engine styling:**
 * Authored engine CSS is combined with bounded runtime layout values from the
 * `styles` object, without depending on a third-party UI framework.
 *
 * **Accessibility:**
 * - `role="form"` on form element
 * - `role="alert"` on error lists
 * - Required field indication
 * - Error messages linked to fields
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Form, Input, useForm } from '@rottay/design-system';
 *
 * const [form] = useForm();
 *
 * <Form
 *   engine="rustic"
 *   form={form}
 *   layout="vertical"
 *   onFinish={handleSubmit}
 *   style={{ maxWidth: '400px' }}
 * >
 *   <Form.Item
 *     name="email"
 *     label="Email Address"
 *     rules={[{ required: true }, { type: 'email' }]}
 *   >
 *     <input type="email" style={{ width: '100%', padding: '8px' }} />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link ClassicForm} for Ant Design implementation
 * @see {@link ModernForm} for DaisyUI implementation
 * @module RusticForm
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useImperativeHandle } from 'react';
import type { FormProps, FormItemProps, FormErrorListProps, FormInstance } from '../../contracts';
import { FORM_DEFAULTS } from '../../contracts';
import { FormContext, bindFormItemControls, composeForm, useForm, useFormErrors, useFormItem, useFormRoot } from '../../runtime/state';
import { FALLBACK_TRANSLATE_OR, type ValidationCatalog } from '../../runtime/validation';

export { useForm };

// Feedback icon data keyed by validation status. Using a static lookup table
// instead of a switch statement keeps the rendering logic minimal and lets us
// share the same SVG rendering path for all statuses.
const feedbackIcons: Record<string, { svg: string; label: string }> = {
  success: {
    svg: 'M5 13l4 4L19 7',
    label: 'Validation passed',
  },
  error: {
    svg: 'M6 18L18 6M6 6l12 12',
    label: 'Validation failed',
  },
  warning: {
    svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.832c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
    label: 'Validation warning',
  },
  validating: {
    svg: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    label: 'Validating',
  },
};

/**
 * Renders a feedback SVG icon for the given validation status.
 * Engine CSS and a bounded runtime animation value avoid UI-framework dependencies.
 * The validating status uses a spin animation; others use a scale-in entrance.
 */
const RusticFeedbackIcon: React.FC<{ status: 'success' | 'error' | 'warning' | 'validating' }> = ({ status }) => {
  const { svg, label } = feedbackIcons[status];
  const iconStyle: React.CSSProperties = {
    marginLeft: 8,
    display: 'inline-flex',
    alignItems: 'center',
    animation: status === 'validating'
      ? 'ds-form-rustic-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      : 'ds-form-rustic-feedback-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };
  return (
    <span data-part="feedback-icon" data-status={status} style={iconStyle} aria-label={label}>
      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={svg} />
      </svg>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Inline style definitions using CSS custom properties (--ds-form-*).
// CSS variables enable multi-tenant theming without class name collisions,
// which is critical for the Rustic engine's zero-dependency approach.
// ---------------------------------------------------------------------------
const styles = {
  formHorizontal: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start',
    gap: 'var(--ds-form-gap)',
  },
  formVertical: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ds-form-gap)',
  },
  formInline: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
    gap: 'var(--ds-form-gap)',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ds-form-item-gap)',
    width: '100%',
  },
  formItemHorizontal: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  label: {
    fontSize: 'var(--ds-form-label-font-size)',
    fontWeight: 'var(--ds-form-label-font-weight)' as unknown as number,
    marginBottom: 'var(--ds-form-item-gap)',
    letterSpacing: '0.01em',
  },
  labelHorizontal: {
    width: 'var(--ds-form-label-width)',
    textAlign: 'right' as const,
    paddingRight: '8px',
  },
  required: {
    marginLeft: '2px',
    animation: 'ds-form-rustic-required-pulse 2s ease-in-out infinite',
  },
  inputWrapper: {
    flex: 1,
  },
  extra: {
    fontSize: 'var(--ds-form-extra-font-size)',
    marginTop: 'var(--ds-form-item-gap)',
  },
  help: {
    fontSize: 'var(--ds-form-help-font-size)',
    marginTop: 'var(--ds-form-item-gap)',
    animation: 'ds-form-rustic-help-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  errorList: {
    listStyle: 'disc',
    paddingLeft: '16px',
    margin: 0,
    fontSize: 'var(--ds-form-help-font-size)',
  },
};

/**
 * Rustic Form base component (pure HTML/CSS with inline styles), rendered
 * from the shared form runtime.
 *
 * @param props - {@link FormProps}
 * @returns A `<form>` element with role="form" wrapped in FormContext
 */
const RUSTIC_CATALOG: ValidationCatalog = {
  namespace: 'components',
  create: (t, tOr = FALLBACK_TRANSLATE_OR) => ({
    required: (name) => t('form.required_with_name', { name }),
    minLength: (min) => t('form.min_length', { min }),
    maxLength: (max) => t('form.max_length', { max }),
    pattern: () => t('form.invalid_format'),
    length: (len) => tOr('form.length', `Must be exactly ${len} characters`, { len }),
    minValue: (min) => tOr('form.min_value', `Minimum value is ${min}`, { min }),
    maxValue: (max) => tOr('form.max_value', `Maximum value is ${max}`, { max }),
    minItems: (min) => tOr('form.min_items', `Must have at least ${min} items`, { min }),
    maxItems: (max) => tOr('form.max_items', `Must have at most ${max} items`, { max }),
    type: (type) => {
      switch (type) {
        case 'email':
          return tOr('form.email', 'Must be a valid email');
        case 'url':
          return tOr('form.url', 'Must be a valid URL');
        case 'number':
          return tOr('form.number', 'Must be a number');
        case 'boolean':
          return tOr('form.boolean', 'Must be true or false');
        case 'array':
          return tOr('form.array', 'Must be a list');
        default:
          return tOr('form.string', 'Must be text');
      }
    },
  }),
};

const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const { layout = FORM_DEFAULTS.layout, name, children, className = '', style, autoComplete = 'on' } = props;
  const { resolvedForm, formRef, contextValue, handleSubmit } = useFormRoot(props, layout, RUSTIC_CATALOG);

  useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  const formStyle = {
    ...(layout === 'horizontal' ? styles.formHorizontal : layout === 'inline' ? styles.formInline : styles.formVertical),
    ...style,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formRef}
        name={name}
        className={`ds-form ds-form--rustic ${className}`}
        data-part="root"
        style={formStyle}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
        role="form"
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Rustic';

/**
 * Rustic Form.Item - wraps a field with label, validation feedback, and help text.
 *
 * @param props - {@link FormItemProps}
 * @returns A labelled form control wrapper with inline-styled error display
 */
const FormItem: React.FC<FormItemProps> = (props) => {
  const { label, extra, help, validateStatus, hidden, tooltip, children, className = '', style } = props;
  const item = useFormItem(props);
  const {
    context: { layout, requiredMark },
    fieldErrors,
    fieldWarnings,
    hasError,
    isWarning,
    isRequired,
    showColon,
    showFeedback,
    generatedControlId,
    feedbackStatus,
  } = item;

  if (hidden) return null;

  const itemStyle = {
    ...styles.formItem,
    ...(layout === 'horizontal' ? styles.formItemHorizontal : {}),
    ...style,
  };

  const labelStyle = {
    ...styles.label,
    ...(layout === 'horizontal' ? styles.labelHorizontal : {}),
  };

  const helpStyle = {
    ...styles.help,
  };

  const childrenWithProps = bindFormItemControls(children, item);
  const message = help || fieldErrors[0] || fieldWarnings[0];

  return (
    <div className={`ds-form-item ds-form-item--rustic ${className}`} data-part="item" style={itemStyle}>
      {label && (
        <label style={labelStyle} data-part="label" htmlFor={generatedControlId}>
          {label}
          {showColon && ':'}
          {isRequired && requiredMark && <span data-part="required-mark" style={styles.required}>*</span>}
          {tooltip && <span data-part="tooltip-icon" title={String(tooltip)} style={{ marginLeft: '4px', cursor: 'help' }}>?</span>}
        </label>
      )}
      <div style={styles.inputWrapper}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>{childrenWithProps}</div>
          {showFeedback && feedbackStatus && (
            <RusticFeedbackIcon status={feedbackStatus} />
          )}
        </div>
        {message && (
          <div
            data-part="help-text"
            data-error={hasError ? 'true' : 'false'}
            data-status={validateStatus}
            data-tone={isWarning && !hasError ? 'warning' : undefined}
            style={helpStyle}
          >
            {message}
          </div>
        )}
        {extra && <div data-part="extra-text" style={styles.extra}>{extra}</div>}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Rustic';

/**
 * Rustic Form.ErrorList - displays validation errors with role="alert" for
 * screen readers. Uses inline styles from the `styles.errorList` object.
 *
 * @param props - {@link FormErrorListProps}
 * @returns An accessible error list or null if there are no errors
 */
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const fieldErrors = useFormErrors(fieldName);

  if (!fieldErrors || fieldErrors.length === 0) return null;

  return (
    <ul data-part="error-list" className={`ds-form-error-list ds-form-error-list--rustic ${className}`} style={{ ...styles.errorList, ...style }} role="alert">
      {fieldErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Rustic';

/**
 * Rustic Form compound component.
 *
 * @param props - {@link FormProps}
 * @returns A zero-dependency form with CSS-variable theming support
 */
export const Form = composeForm(FormBase, { Item: FormItem, ErrorList: FormErrorList });

export default Form;
