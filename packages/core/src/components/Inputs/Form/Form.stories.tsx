import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './Form';
import { Space, Button, Input, Checkbox, Select, Radio } from 'antd';

const meta: Meta<typeof Form> = {
  title: 'Inputs/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de formulario para recopilar, validar y enviar datos del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/form)
- [🎨 API de Props](https://ant.design/components/form#api)
- [💡 Ejemplos](https://ant.design/components/form#examples)

## Cuándo usar

- Para crear formularios con validación automática de campos.
- Soporta diferentes layouts (horizontal, vertical, inline) y tipos de validación.
        `,
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'inline'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Basic: Story = {
  render: () => (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <Form
      name="validation"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input placeholder="user@example.com" />
      </Form.Item>

      <Form.Item
        label="Age"
        name="age"
        rules={[
          { required: true, message: 'Please input your age!' },
          { type: 'number', min: 1, max: 120, message: 'Age must be between 1 and 120' },
        ]}
      >
        <Input type="number" />
      </Form.Item>

      <Form.Item
        label="Website"
        name="website"
        rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
      >
        <Input placeholder="https://example.com" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  ),
};

export const Layouts: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div>
        <h4>Horizontal Layout</h4>
        <Form layout="horizontal" style={{ maxWidth: 600 }}>
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
        </Form>
      </div>

      <div>
        <h4>Vertical Layout</h4>
        <Form layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
        </Form>
      </div>

      <div>
        <h4>Inline Layout</h4>
        <Form layout="inline">
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary">Submit</Button>
          </Form.Item>
        </Form>
      </div>
    </Space>
  ),
};

export const FieldTypes: Story = {
  render: () => (
    <Form
      name="fieldTypes"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
    >
      <Form.Item label="Input" name="input">
        <Input placeholder="Basic input" />
      </Form.Item>

      <Form.Item label="Select" name="select">
        <Select>
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Radio" name="radio">
        <Radio.Group>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
          <Radio value="c">C</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Checkbox" name="checkbox" valuePropName="checked">
        <Checkbox>Agree to terms</Checkbox>
      </Form.Item>

      <Form.Item label="TextArea" name="textarea">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Form
      name="disabled"
      disabled
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
      initialValues={{ name: 'John Doe', email: 'john@example.com' }}
    >
      <Form.Item label="Name" name="name">
        <Input />
      </Form.Item>

      <Form.Item label="Email" name="email">
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  ),
};
