/**
 * @fileoverview Classic (Ant Design) engine shared components for the Form pattern.
 *
 * Wraps Ant Design's Form, Form.Item, Form.List, and ErrorList with the DS
 * type system so consumers interact with a uniform FormProps/FormItemProps API
 * regardless of which engine is active. The wrapper is intentionally thin --
 * it destructures DS props and passes them through to Ant, only translating
 * where the APIs diverge (e.g. DS `size="default"` maps to Ant `size="middle"`).
 *
 * @example
 * ```tsx
 * import { ClassicFormBase, ClassicFormItem, useForm } from './foundation';
 *
 * function LoginForm() {
 *   const [form] = useForm();
 *   return (
 *     <ClassicFormBase form={form} onFinish={handleSubmit}>
 *       <ClassicFormItem name="email" label="Email" rules={[{ required: true }]}>
 *         <Input />
 *       </ClassicFormItem>
 *     </ClassicFormBase>
 *   );
 * }
 * ```
 */

'use client';

import React from 'react';
import { Form as AntForm } from 'antd';
import type {
  FormProps,
  FormItemProps,
  FormListProps,
  FormErrorListProps,
  FormInstance,
} from '../../../contracts';

/**
 * Re-export Ant Design's useForm hook directly.
 * Consumers get the same form instance API without importing antd themselves.
 */
export const useForm = AntForm.useForm;

/**
 * Classic engine Form root component.
 *
 * Accepts the DS FormProps interface and delegates to Ant Design's Form.
 * Uses `forwardRef` so parent components can imperatively call form methods
 * (validate, resetFields, etc.) via a ref.
 */
export const ClassicFormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const {
    form,
    initialValues,
    layout,
    labelCol,
    wrapperCol,
    labelAlign,
    labelWrap,
    colon,
    size,
    disabled,
    requiredMark,
    validateTrigger,
    preserve,
    scrollToFirstError,
    name,
    onValuesChange,
    onFieldsChange,
    onFinish,
    onFinishFailed,
    children,
    className,
    style,
    autoComplete,
  } = props;

  // Create an internal form instance as fallback when the consumer
  // does not pass one, so the component always has a valid form handle.
  const [internalForm] = AntForm.useForm();
  const resolvedForm = (form as any) ?? internalForm;

  // Expose the resolved form instance via the forwarded ref so parents
  // can call imperative methods like validateFields() or resetFields().
  React.useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  return (
    <AntForm
      form={resolvedForm as any}
      initialValues={initialValues}
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign}
      labelWrap={labelWrap}
      colon={colon}
      // DS uses "default" but Ant Design's equivalent is "middle"
      size={size === 'default' ? 'middle' : size}
      disabled={disabled}
      requiredMark={requiredMark}
      validateTrigger={validateTrigger}
      preserve={preserve}
      scrollToFirstError={scrollToFirstError}
      name={name}
      onValuesChange={onValuesChange}
      onFieldsChange={onFieldsChange}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      role="form"
      className={className}
      style={style}
      autoComplete={autoComplete}
    >
      {children}
    </AntForm>
  );
});

ClassicFormBase.displayName = 'Form.Classic';

/**
 * Classic engine Form.Item -- wraps a single form field with label, validation,
 * and layout configuration. The `rules` cast is needed because the DS rule type
 * is a superset of Ant's and TypeScript cannot narrow it automatically.
 */
export const ClassicFormItem: React.FC<FormItemProps> = (props) => {
  const {
    name,
    label,
    labelCol,
    wrapperCol,
    rules,
    validateTrigger,
    required,
    extra,
    help,
    validateStatus,
    hasFeedback,
    initialValue,
    preserve,
    hidden,
    noStyle,
    tooltip,
    colon,
    dependencies,
    getValueFromEvent,
    normalize,
    valuePropName,
    trigger,
    children,
    className,
    style,
  } = props;

  return (
    <AntForm.Item
      name={name}
      label={label}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      rules={rules as any}
      validateTrigger={validateTrigger}
      required={required}
      extra={extra}
      help={help}
      validateStatus={validateStatus}
      hasFeedback={hasFeedback}
      initialValue={initialValue}
      preserve={preserve}
      hidden={hidden}
      noStyle={noStyle}
      tooltip={tooltip}
      colon={colon}
      dependencies={dependencies}
      getValueFromEvent={getValueFromEvent}
      normalize={normalize}
      valuePropName={valuePropName}
      trigger={trigger}
      className={className}
      style={style}
    >
      {children}
    </AntForm.Item>
  );
};

ClassicFormItem.displayName = 'Form.Item.Classic';

/**
 * Classic engine Form.List -- renders a dynamic list of form fields.
 * Delegates to Ant Design's Form.List which provides add/remove/move
 * operations via the render-prop children API.
 */
export const ClassicFormList: React.FC<FormListProps> = (props) => {
  const { name, rules, initialValue, children } = props;

  return (
    <AntForm.List name={name} rules={rules as any} initialValue={initialValue}>
      {children as any}
    </AntForm.List>
  );
};

ClassicFormList.displayName = 'Form.List.Classic';

/**
 * Classic engine Form.ErrorList -- displays validation errors for a specific field.
 *
 * Uses Ant's `useFormInstance` to pull errors from the nearest parent Form context.
 * When no fieldName is provided or there are no errors, it renders an empty
 * placeholder div (if className is set) or null to avoid layout shifts.
 */
export const ClassicFormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className, style } = props;
  const formInstance = AntForm.useFormInstance();
  const errors = fieldName ? formInstance?.getFieldError(fieldName as any) ?? [] : [];

  // Return an empty placeholder when className is set to preserve layout spacing;
  // otherwise return null to avoid rendering an empty DOM node.
  if (!fieldName || errors.length === 0) {
    return className ? <div className={className} style={style} /> : null;
  }

  return <AntForm.ErrorList errors={errors} className={className} />;
};

ClassicFormErrorList.displayName = 'Form.ErrorList.Classic';
