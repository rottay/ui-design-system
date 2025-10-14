import React, { useEffect } from 'react';
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
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { FormBuilderProps, FormField, FieldDependency } from './types';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * FormBuilder Component
 *
 * Advanced dynamic form generator from JSON schema.
 * Supports validation, multiple field types, conditional rendering, multi-column layouts,
 * field dependencies, custom validation, and field grouping/sections.
 *
 * @example
 * ```tsx
 * <FormBuilder
 *   fields={fields}
 *   columns={2}
 *   onSubmit={(values) => console.log(values)}
 *   onFieldChange={(field, value, allValues) => console.log(field, value)}
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
  columns = 1,
  columnGap = 16,
  rowGap = 0,
  onFieldChange,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  // Watch form values for field change callback
  const formValues = Form.useWatch([], form);

  useEffect(() => {
    if (onFieldChange && formValues) {
      // Trigger callback when any field changes
      Object.keys(formValues).forEach((field) => {
        if (formValues[field] !== undefined) {
          onFieldChange(field, formValues[field], formValues);
        }
      });
    }
  }, [formValues, onFieldChange]);

  const handleFinish = async (values: Record<string, any>) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  };

  /**
   * Check if a field should be visible based on dependencies
   */
  const checkFieldVisibility = (
    field: FormField,
    values: Record<string, any>
  ): boolean => {
    // Check visibleWhen function
    if (field.visibleWhen) {
      return field.visibleWhen(values);
    }

    // Check dependsOn configuration
    if (field.dependsOn) {
      return checkDependency(field.dependsOn, values);
    }

    return true;
  };

  /**
   * Evaluate dependency condition
   */
  const checkDependency = (
    dep: FieldDependency,
    values: Record<string, any>
  ): boolean => {
    const fieldValue = values[dep.field];
    const { value, condition = 'equals' } = dep;

    switch (condition) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(value);
        }
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(value);
        }
        return false;
      case 'greaterThan':
        return Number(fieldValue) > Number(value);
      case 'lessThan':
        return Number(fieldValue) < Number(value);
      default:
        return true;
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

  /**
   * Render section/group divider
   */
  const renderSection = (field: FormField) => {
    const sectionStyles: React.CSSProperties = {
      marginTop: 32,
      marginBottom: 16,
    };

    switch (template) {
      case 'spotify':
        return (
          <div key={field.name} style={sectionStyles}>
            <Title level={4} style={{ marginBottom: 8, fontWeight: 700 }}>
              {field.title}
            </Title>
            {field.description && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {field.description}
              </Text>
            )}
            <Divider style={{ marginTop: 16, marginBottom: 24 }} />
          </div>
        );
      case 'notion':
        return (
          <div key={field.name} style={sectionStyles}>
            <Title level={5} style={{ marginBottom: 4, fontWeight: 700 }}>
              {field.title}
            </Title>
            {field.description && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {field.description}
              </Text>
            )}
            <Divider style={{ marginTop: 12, marginBottom: 16 }} />
          </div>
        );
      default:
        return (
          <div key={field.name} style={sectionStyles}>
            <Title level={4} style={{ marginBottom: 8 }}>
              {field.title}
            </Title>
            {field.description && (
              <Text type="secondary">{field.description}</Text>
            )}
            <Divider style={{ marginTop: 16, marginBottom: 20 }} />
          </div>
        );
    }
  };

  const renderField = (field: FormField, values: Record<string, any> = {}) => {
    if (field.hidden) return null;

    // Handle section type
    if (field.type === 'section') {
      return renderSection(field);
    }

    // Check conditional visibility
    if (!checkFieldVisibility(field, values)) {
      return null;
    }

    // Build rules with custom validator
    const rules = field.rules || [];
    if (field.required && !rules.some((r) => 'required' in r)) {
      rules.push({ required: true, message: `${field.label} is required` });
    }

    // Add custom validator
    if (field.customValidator) {
      rules.push({
        validator: async (_, value) => {
          try {
            await field.customValidator!(value, values);
          } catch (error) {
            throw error;
          }
        },
      });
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

    // Calculate column span for grid layout
    const colSpan = field.colSpan || 1;
    const spanValue = Math.floor(24 / columns) * colSpan;

    // Collect dependencies for Form.Item
    const dependencies: string[] = [];
    if (field.dependsOn) {
      dependencies.push(field.dependsOn.field);
    }
    if (field.dependencies) {
      dependencies.push(...field.dependencies);
    }

    const formItem = (
      <Form.Item
        key={field.name}
        name={field.name}
        label={label}
        rules={rules}
        initialValue={field.defaultValue}
        valuePropName={field.type === 'switch' ? 'checked' : 'value'}
        dependencies={dependencies.length > 0 ? dependencies : undefined}
        validateTrigger={field.validateTrigger || 'onChange'}
      >
        {fieldComponent}
      </Form.Item>
    );

    // Wrap in Col if using grid layout
    if (columns > 1) {
      return (
        <Col key={field.name} span={spanValue}>
          {formItem}
        </Col>
      );
    }

    return formItem;
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
        {columns > 1 ? (
          <Row gutter={[columnGap, rowGap]}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                return <>{fields.map((field) => renderField(field, values))}</>;
              }}
            </Form.Item>
          </Row>
        ) : (
          <Form.Item noStyle shouldUpdate>
            {({ getFieldsValue }) => {
              const values = getFieldsValue();
              return <>{fields.map((field) => renderField(field, values))}</>;
            }}
          </Form.Item>
        )}

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
