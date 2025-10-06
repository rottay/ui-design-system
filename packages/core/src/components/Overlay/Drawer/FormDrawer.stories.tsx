import type { Meta, StoryObj } from '@storybook/react';
import { FormDrawer } from './FormDrawer';
import { Button, Form, Input, Select, DatePicker, Switch, InputNumber, Radio } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof FormDrawer> = {
  title: 'Overlay/Drawer/FormDrawer',
  component: FormDrawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Drawer especializado para formularios con gestión automática de estado y validación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/drawer)
- [🎨 API de Props](https://ant.design/components/drawer#api)
- [💡 Ejemplos](https://ant.design/components/drawer#examples)

## Cuándo usar

- Para formularios de creación o edición en panel lateral
- Cuando necesitas mantener el contexto mientras capturas datos
- Para flujos de trabajo que requieren entrada de usuario sin cambiar de página
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormDrawer>;

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
          Open Form Drawer
        </Button>
        <FormDrawer
          title="Create New User"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          width={500}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="guest">Guest</Select.Option>
            </Select>
          </Form.Item>
        </FormDrawer>
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

    const prefillForm = () => {
      form.setFieldsValue({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'us',
      });
    };

    return (
      <>
        <Button.Group>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open Form
          </Button>
          <Button onClick={prefillForm}>Prefill Data</Button>
          <Button onClick={() => form.resetFields()}>Clear Form</Button>
        </Button.Group>
        <FormDrawer
          title="User Information"
          open={open}
          form={form}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          width={500}
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="us">United States</Select.Option>
              <Select.Option value="uk">United Kingdom</Select.Option>
              <Select.Option value="ca">Canada</Select.Option>
            </Select>
          </Form.Item>
        </FormDrawer>
      </>
    );
  },
};

export const RightPlacement: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Right Drawer
        </Button>
        <FormDrawer
          title="Settings"
          placement="right"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          width={400}
        >
          <Form.Item
            name="notifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="theme" label="Theme">
            <Radio.Group>
              <Radio value="light">Light</Radio>
              <Radio value="dark">Dark</Radio>
              <Radio value="auto">Auto</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="language" label="Language">
            <Select>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="es">Spanish</Select.Option>
              <Select.Option value="fr">French</Select.Option>
            </Select>
          </Form.Item>
        </FormDrawer>
      </>
    );
  },
};

export const ComplexForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = async (values: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Product Form
        </Button>
        <FormDrawer
          title="Add New Product"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          width={600}
        >
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name!' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="electronics">Electronics</Select.Option>
              <Select.Option value="clothing">Clothing</Select.Option>
              <Select.Option value="books">Books</Select.Option>
              <Select.Option value="food">Food & Beverages</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price!' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              prefix="$"
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please enter stock quantity!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description!' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>
          <Form.Item name="availableDate" label="Available From">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="featured" label="Featured Product" valuePropName="checked">
            <Switch />
          </Form.Item>
        </FormDrawer>
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
        <FormDrawer
          title="Draft Message"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          preserveFormOnClose={true}
          width={500}
        >
          <Form.Item name="to" label="To" rules={[{ required: true }]}>
            <Input placeholder="Recipient email" />
          </Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input placeholder="Email subject" />
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={8} placeholder="Your message here..." />
          </Form.Item>
        </FormDrawer>
      </>
    );
  },
};

export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleFinish = (values: any) => {
      console.log('Form values:', values);
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Custom Footer
        </Button>
        <FormDrawer
          title="Custom Actions"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          submitText="Save & Continue"
          cancelText="Discard"
          width={500}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <Input.TextArea rows={4} />
          </Form.Item>
        </FormDrawer>
      </>
    );
  },
};

export const NoFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        console.log('Form values:', values);
        setOpen(false);
      } catch (error) {
        console.log('Validation failed:', error);
      }
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open No Footer
        </Button>
        <FormDrawer
          title="Inline Actions"
          open={open}
          form={form}
          onClose={() => setOpen(false)}
          showFooter={false}
          width={500}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit} block>
              Submit Form
            </Button>
          </Form.Item>
        </FormDrawer>
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
          Open Validation Form
        </Button>
        <FormDrawer
          title="Registration Form"
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
          width={500}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input password!' },
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
              { required: true, message: 'Please confirm password!' },
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
        </FormDrawer>
      </>
    );
  },
};
