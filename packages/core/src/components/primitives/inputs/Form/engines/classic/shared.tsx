'use client';

import React from 'react';
import { Form as AntForm } from 'antd';
import type {
  FormProps,
  FormItemProps,
  FormListProps,
  FormErrorListProps,
  FormInstance,
} from '../../types';

// Re-export useForm hook from Ant Design
export const useForm = AntForm.useForm;

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
  const [internalForm] = AntForm.useForm();
  const resolvedForm = (form as any) ?? internalForm;

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

export const ClassicFormList: React.FC<FormListProps> = (props) => {
  const { name, rules, initialValue, children } = props;

  return (
    <AntForm.List name={name} rules={rules as any} initialValue={initialValue}>
      {children as any}
    </AntForm.List>
  );
};

ClassicFormList.displayName = 'Form.List.Classic';

export const ClassicFormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className, style } = props;
  const formInstance = AntForm.useFormInstance();
  const errors = fieldName ? formInstance?.getFieldError(fieldName as any) ?? [] : [];

  if (!fieldName || errors.length === 0) {
    return className ? <div className={className} style={style} /> : null;
  }

  return <AntForm.ErrorList errors={errors} className={className} />;
};

ClassicFormErrorList.displayName = 'Form.ErrorList.Classic';
