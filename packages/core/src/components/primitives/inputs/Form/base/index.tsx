/**
 * Form - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useMemo, createContext, useContext } from 'react';
import type { FormProps, FormItemProps } from '../types';
import { FORM_DEFAULTS, FORM_ITEM_DEFAULTS } from '../types';

/**
 * Form context for sharing form state
 */
interface FormContextValue {
  layout?: FormProps['layout'];
  labelCol?: FormProps['labelCol'];
  wrapperCol?: FormProps['wrapperCol'];
  labelAlign?: FormProps['labelAlign'];
  colon?: boolean;
  size?: FormProps['size'];
  disabled?: boolean;
  requiredMark?: FormProps['requiredMark'];
}

const FormContext = createContext<FormContextValue>({});

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { fontSize: 12, labelHeight: 24, controlHeight: 24 },
  default: { fontSize: 14, labelHeight: 32, controlHeight: 32 },
  large: { fontSize: 16, labelHeight: 40, controlHeight: 40 },
};

/**
 * Base Form component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseForm = forwardRef<HTMLFormElement, FormProps<unknown>>(
  (props, ref) => {
    const {
      form: _form,
      initialValues,
      layout = FORM_DEFAULTS.layout,
      labelCol,
      wrapperCol,
      labelAlign = FORM_DEFAULTS.labelAlign,
      labelWrap: _labelWrap,
      colon = FORM_DEFAULTS.colon,
      size = FORM_DEFAULTS.size,
      disabled = false,
      requiredMark = FORM_DEFAULTS.requiredMark,
      validateTrigger: _validateTrigger,
      preserve: _preserve,
      scrollToFirstError: _scrollToFirstError,
      name,
      onValuesChange: _onValuesChange,
      onFieldsChange: _onFieldsChange,
      onFinish,
      onFinishFailed: _onFinishFailed,
      children,
      className = '',
      style = {},
      autoComplete = FORM_DEFAULTS.autoComplete,
    } = props;

    // Suppress unused variable warnings - these props are available for engine implementations
    void _form;
    void _labelWrap;
    void _validateTrigger;
    void _preserve;
    void _scrollToFirstError;
    void _onValuesChange;
    void _onFieldsChange;
    void _onFinishFailed;

    // Size config
    const sizeKey = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
    const config = SIZE_CONFIG[sizeKey];

    // CSS variables
    const formVars = useMemo<React.CSSProperties>(() => ({
      '--form-font-size': `${config.fontSize}px`,
      '--form-label-height': `${config.labelHeight}px`,
      '--form-control-height': `${config.controlHeight}px`,
      '--form-label-color': 'var(--color-text-primary)',
      '--form-item-margin-bottom': '24px',
      '--form-error-color': 'var(--color-error, #ff4d4f)',
      '--form-warning-color': 'var(--color-warning, #faad14)',
    } as React.CSSProperties), [config]);

    const formStyle: React.CSSProperties = {
      ...formVars,
      fontSize: 'var(--form-font-size)',
      ...style,
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // In a real implementation, this would validate and call onFinish
      onFinish?.(initialValues as unknown);
    };

    const contextValue: FormContextValue = {
      layout,
      labelCol,
      wrapperCol,
      labelAlign,
      colon,
      size,
      disabled,
      requiredMark,
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={ref}
          name={name}
          autoComplete={autoComplete}
          className={`rottay-form rottay-form--${layout} rottay-form--${sizeKey} ${className}`}
          style={formStyle}
          onSubmit={handleSubmit}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

BaseForm.displayName = 'BaseForm';

/**
 * Base FormItem component
 */
export const BaseFormItem = forwardRef<HTMLDivElement, FormItemProps>(
  (props, ref) => {
    const formContext = useContext(FormContext);

    const {
      name: _name,
      label,
      labelCol = formContext.labelCol,
      wrapperCol: _wrapperCol = formContext.wrapperCol,
      rules,
      validateTrigger: _validateTrigger,
      required,
      extra,
      help,
      validateStatus,
      hasFeedback: _hasFeedback = FORM_ITEM_DEFAULTS.hasFeedback,
      initialValue: _initialValue,
      preserve: _preserve,
      hidden = FORM_ITEM_DEFAULTS.hidden,
      noStyle = FORM_ITEM_DEFAULTS.noStyle,
      tooltip,
      colon = formContext.colon ?? FORM_ITEM_DEFAULTS.colon,
      dependencies: _dependencies,
      getValueFromEvent: _getValueFromEvent,
      normalize: _normalize,
      valuePropName: _valuePropName = FORM_ITEM_DEFAULTS.valuePropName,
      trigger: _trigger = FORM_ITEM_DEFAULTS.trigger,
      children,
      className = '',
      style = {},
    } = props;

    // Suppress unused variable warnings - these props are available for engine implementations
    void _name;
    void _wrapperCol;
    void _validateTrigger;
    void _hasFeedback;
    void _initialValue;
    void _preserve;
    void _dependencies;
    void _getValueFromEvent;
    void _normalize;
    void _valuePropName;
    void _trigger;

    const layout = formContext.layout || 'horizontal';
    const labelAlign = formContext.labelAlign || 'right';
    const isRequired = required || rules?.some(r => r.required);
    const showRequiredMark = formContext.requiredMark !== false && isRequired;

    if (hidden) return null;
    if (noStyle) return <>{children}</>;

    const itemStyle: React.CSSProperties = {
      marginBottom: 'var(--form-item-margin-bottom)',
      display: layout === 'inline' ? 'inline-flex' : 'flex',
      flexDirection: layout === 'vertical' ? 'column' : 'row',
      alignItems: layout === 'vertical' ? 'flex-start' : 'flex-start',
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      flex: layout === 'horizontal' && labelCol?.span ? `0 0 ${(labelCol.span / 24) * 100}%` : 'none',
      textAlign: labelAlign,
      paddingRight: layout === 'horizontal' ? '8px' : 0,
      paddingBottom: layout === 'vertical' ? '8px' : 0,
      lineHeight: 'var(--form-control-height)',
      color: 'var(--form-label-color)',
      whiteSpace: 'nowrap',
    };

    const wrapperStyle: React.CSSProperties = {
      flex: layout === 'horizontal' ? 1 : 'none',
      width: layout === 'vertical' ? '100%' : undefined,
    };

    const statusClass = validateStatus ? `rottay-form-item--${validateStatus}` : '';

    return (
      <div
        ref={ref}
        className={`rottay-form-item ${statusClass} ${className}`}
        style={itemStyle}
      >
        {label && (
          <label className="rottay-form-item__label" style={labelStyle}>
            {showRequiredMark && formContext.requiredMark !== 'optional' && (
              <span style={{ color: 'var(--form-error-color)', marginRight: 4 }}>*</span>
            )}
            {label}
            {colon && ':'}
            {tooltip && <span style={{ marginLeft: 4 }}>{tooltip}</span>}
          </label>
        )}
        <div className="rottay-form-item__control" style={wrapperStyle}>
          <div className="rottay-form-item__control-input">
            {children}
          </div>
          {(help || validateStatus === 'error') && (
            <div
              className="rottay-form-item__help"
              style={{
                color: validateStatus === 'error' ? 'var(--form-error-color)' : validateStatus === 'warning' ? 'var(--form-warning-color)' : 'var(--color-text-secondary)',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              {help}
            </div>
          )}
          {extra && (
            <div
              className="rottay-form-item__extra"
              style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '4px' }}
            >
              {extra}
            </div>
          )}
        </div>
      </div>
    );
  }
);

BaseFormItem.displayName = 'BaseFormItem';

// Export context for compound components
export { FormContext };
