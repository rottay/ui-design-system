import type { Meta, StoryObj } from '@storybook/react';
import { FormModal } from './FormModal';
import { Button, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof FormModal> = {
  title: 'Feedback/Modal/FormModal',
  component: FormModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Modal especializado para formularios con gestión integrada de validación y envío.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para capturar datos del usuario en un contexto modal
- Cuando necesitas formularios con validación en ventanas emergentes
- Para crear o editar entidades sin cambiar de página
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormModal>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Form Modal
        </Button>
        <FormModal
          title="Basic Form"
          open={open}
          onCancel={() => setOpen(false)}
          onFinish={handleFinish}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input />
          </Form.Item>
        </FormModal>
      </>
    );
  },
};

export const WithExternalForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };

    const fillForm = () => {
      form.setFieldsValue({
        username: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      });
    };

    return (
      <>
        <Button.Group>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open Form Modal
          </Button>
          <Button onClick={fillForm}>Fill Form</Button>
          <Button onClick={() => form.resetFields()}>Reset Form</Button>
        </Button.Group>
        <FormModal
          title="Form with External Form Instance"
          open={open}
          form={form}
          onCancel={() => setOpen(false)}
          onFinish={handleFinish}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="guest">Guest</Select.Option>
            </Select>
          </Form.Item>
        </FormModal>
      </>
    );
  },
};

export const ComplexForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = async (values: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Complex Form
        </Button>
        <FormModal
          title="User Registration"
          open={open}
          onCancel={() => setOpen(false)}
          onFinish={handleFinish}
          width={600}
        >
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please input your age!' }]}
          >
            <InputNumber min={1} max={120} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select your gender!' }]}
          >
            <Select placeholder="Select gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="birthdate"
            label="Birth Date"
            rules={[{ required: true, message: 'Please select your birth date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </FormModal>
      </>
    );
  },
};

export const PreserveFormData: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Form (Preserves Data)
        </Button>
        <FormModal
          title="Form with Preserved Data"
          open={open}
          onCancel={() => setOpen(false)}
          onFinish={handleFinish}
          preserveFormOnClose={true}
        >
          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true, message: 'Please input some notes!' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter your notes here..." />
          </Form.Item>
        </FormModal>
      </>
    );
  },
};

export const ValidationHandling: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = (values: any) => {
      console.log('Success:', values);
      setOpen(false);
    };

    const handleFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Form with Validation
        </Button>
        <FormModal
          title="Form Validation"
          open={open}
          onCancel={() => setOpen(false)}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        >
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </FormModal>
      </>
    );
  },
};
