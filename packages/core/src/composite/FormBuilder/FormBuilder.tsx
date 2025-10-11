import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  DatePicker,
  Switch,
  Button,
  Space,
  Tooltip,
  theme,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { FormBuilderProps, FormField } from './types';

const { TextArea } = Input;

/**
 * FormBuilder Component
 *
 * Dynamic form generator from JSON schema.
 * Supports validation, multiple field types, and conditional rendering.
 *
 * @example
 * ```tsx
 * <FormBuilder
 *   fields={fields}
 *   onSubmit={(values) => console.log(values)}
 * />
 * ```
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  form: externalForm,
  initialValues,
  submitText = 'Submit',
  showSubmit = true,
  showReset = false,
  resetText = 'Reset',
  loading = false,
  onSubmit,
  layout = 'vertical',
  labelCol,
  wrapperCol,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  const handleFinish = async (values: Record<string, any>) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  };

  // Theme-specific form container styles
  const getFormStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: 24,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${token.colorBorder}`,
          padding: 32,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          padding: 28,
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
          padding: 20,
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          borderRadius: 12,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.08)',
          padding: 32,
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
        };
    }
  };

  // Theme-specific label styles
  const getLabelStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          fontSize: 14,
          fontWeight: 700,
          color: token.colorText,
        };
      case 'stripe':
        return {
          fontSize: 13,
          fontWeight: 600,
          color: token.colorText,
        };
      case 'notion':
        return {
          fontSize: 14,
          fontWeight: 600,
          color: token.colorText,
        };
      case 'linear':
        return {
          fontSize: 14,
          fontWeight: 500,
          color: token.colorText,
        };
      default:
        return {};
    }
  };

  const renderField = (field: FormField) => {
    if (field.hidden) return null;

    // Build rules
    const rules = field.rules || [];
    if (field.required && !rules.some((r) => 'required' in r)) {
      rules.push({ required: true, message: `${field.label} is required` });
    }

    // Label with tooltip
    const label = field.tooltip ? (
      <span style={getLabelStyles()}>
        {field.label}{' '}
        <Tooltip title={field.tooltip}>
          <QuestionCircleOutlined style={{ color: token.colorTextSecondary }} />
        </Tooltip>
      </span>
    ) : (
      <span style={getLabelStyles()}>{field.label}</span>
    );

    // Render field based on type
    let fieldComponent;

    switch (field.type) {
      case 'text':
      case 'email':
        fieldComponent = (
          <Input
            placeholder={field.placeholder}
            disabled={field.disabled}
            type={field.type}
          />
        );
        break;

      case 'password':
        fieldComponent = (
          <Input.Password
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );
        break;

      case 'number':
        fieldComponent = (
          <InputNumber
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={{ width: '100%' }}
          />
        );
        break;

      case 'textarea':
        fieldComponent = (
          <TextArea
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
          />
        );
        break;

      case 'select':
        fieldComponent = (
          <Select
            placeholder={field.placeholder}
            disabled={field.disabled}
            options={field.options}
          />
        );
        break;

      case 'radio':
        fieldComponent = (
          <Radio.Group disabled={field.disabled}>
            {field.options?.map((opt) => (
              <Radio key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        );
        break;

      case 'checkbox':
        fieldComponent = (
          <Checkbox.Group
            options={field.options}
            disabled={field.disabled}
          />
        );
        break;

      case 'date':
        fieldComponent = (
          <DatePicker
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={{ width: '100%' }}
          />
        );
        break;

      case 'switch':
        fieldComponent = <Switch disabled={field.disabled} />;
        break;

      default:
        fieldComponent = (
          <Input
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );
    }

    return (
      <Form.Item
        key={field.name}
        name={field.name}
        label={label}
        rules={rules}
        initialValue={field.defaultValue}
        valuePropName={field.type === 'switch' ? 'checked' : 'value'}
      >
        {fieldComponent}
      </Form.Item>
    );
  };

  return (
    <div style={getFormStyles()}>
      <Form
        form={form}
        layout={layout}
        initialValues={initialValues}
        onFinish={handleFinish}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
      >
        {fields.map((field) => renderField(field))}

        {(showSubmit || showReset) && (
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Space>
              {showSubmit && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  {submitText}
                </Button>
              )}
              {showReset && (
                <Button htmlType="reset" disabled={loading}>
                  {resetText}
                </Button>
              )}
            </Space>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

FormBuilder.displayName = 'FormBuilder';
