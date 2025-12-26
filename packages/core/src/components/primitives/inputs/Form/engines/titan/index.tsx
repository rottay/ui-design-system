'use client';

/**
 * Form - Titan Engine (Ant Design)
 */
import React from 'react';
import { Form as AntForm } from 'antd';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps, FormInstance } from '../../types';

// Re-export useForm hook from Ant Design
export const useForm = AntForm.useForm;

// Form component
const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
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

  return (
    <AntForm
      ref={ref as any}
      form={form as any}
      initialValues={initialValues}
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign}
      labelWrap={labelWrap}
      colon={colon}
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
      className={className}
      style={style}
      autoComplete={autoComplete}
    >
      {children}
    </AntForm>
  );
});

FormBase.displayName = 'Form.Titan';

// Form.Item component
const FormItem: React.FC<FormItemProps> = (props) => {
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

FormItem.displayName = 'Form.Item.Titan';

// Form.List component
const FormList: React.FC<FormListProps> = (props) => {
  const { name, rules, initialValue, children } = props;

  return (
    <AntForm.List name={name} rules={rules as any} initialValue={initialValue}>
      {children as any}
    </AntForm.List>
  );
};

FormList.displayName = 'Form.List.Titan';

// Form.ErrorList component
const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { className, style: _style } = props;

  return <AntForm.ErrorList className={className} />;
};

FormErrorList.displayName = 'Form.ErrorList.Titan';

// Compound component using Object.assign
export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
});

export default Form;
