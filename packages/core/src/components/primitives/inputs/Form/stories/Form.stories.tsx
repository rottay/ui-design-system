/**
 * Form Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Form> = {
  title: 'Primitives/Inputs/Form',
  component: Form,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'A form component with validation and layout support with multi-engine support.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'inline'],
      description: 'Form layout',
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of form controls',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    colon: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const BasicForm: Story = {
  render: () => (
    <Form
      onFinish={(values) => console.log('Form submitted:', values)}
      style={{ maxWidth: 400 }}
    >
      <Form.Item name="username" label="Username" rules={[{ required: true }]}>
        <input type="text" placeholder="Enter username" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <input type="email" placeholder="Enter email" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item>
        <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
      </Form.Item>
    </Form>
  ),
};

export const FormLayouts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ margin: '0 0 12px 0' }}>Horizontal (default)</h4>
        <Form layout="horizontal" style={{ maxWidth: 400 }}>
          <Form.Item name="field1" label="Field 1">
            <input type="text" style={{ width: '100%', padding: 8 }} />
          </Form.Item>
          <Form.Item name="field2" label="Field 2">
            <input type="text" style={{ width: '100%', padding: 8 }} />
          </Form.Item>
        </Form>
      </div>
      <div>
        <h4 style={{ margin: '0 0 12px 0' }}>Vertical</h4>
        <Form layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item name="field1" label="Field 1">
            <input type="text" style={{ width: '100%', padding: 8 }} />
          </Form.Item>
          <Form.Item name="field2" label="Field 2">
            <input type="text" style={{ width: '100%', padding: 8 }} />
          </Form.Item>
        </Form>
      </div>
      <div>
        <h4 style={{ margin: '0 0 12px 0' }}>Inline</h4>
        <Form layout="inline">
          <Form.Item name="field1" label="Field 1">
            <input type="text" style={{ padding: 8 }} />
          </Form.Item>
          <Form.Item name="field2" label="Field 2">
            <input type="text" style={{ padding: 8 }} />
          </Form.Item>
          <Form.Item>
            <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
          </Form.Item>
        </Form>
      </div>
    </div>
  ),
};

export const FormValidation: Story = {
  render: () => (
    <Form
      onFinish={(values) => console.log('Success:', values)}
      onFinishFailed={(errorInfo) => console.log('Failed:', errorInfo)}
      style={{ maxWidth: 400 }}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[
          { required: true, message: 'Please enter your username' },
          { min: 3, message: 'Username must be at least 3 characters' },
        ]}
      >
        <input type="text" placeholder="Enter username" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please enter your password' },
          { min: 8, message: 'Password must be at least 8 characters' },
        ]}
      >
        <input type="password" placeholder="Enter password" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <input type="email" placeholder="Enter email" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item>
        <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
      </Form.Item>
    </Form>
  ),
};

export const RequiredFields: Story = {
  render: () => (
    <Form requiredMark style={{ maxWidth: 400 }}>
      <Form.Item name="required" label="Required Field" required>
        <input type="text" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
      <Form.Item name="optional" label="Optional Field">
        <input type="text" style={{ width: '100%', padding: 8 }} />
      </Form.Item>
    </Form>
  ),
};

export const DisabledForm: Story = {
  render: () => (
    <Form disabled style={{ maxWidth: 400 }}>
      <Form.Item name="field1" label="Field 1">
        <input type="text" value="Disabled field" style={{ width: '100%', padding: 8 }} readOnly />
      </Form.Item>
      <Form.Item name="field2" label="Field 2">
        <input type="text" value="Another disabled field" style={{ width: '100%', padding: 8 }} readOnly />
      </Form.Item>
      <Form.Item>
        <button type="submit" disabled style={{ padding: '8px 16px' }}>Submit</button>
      </Form.Item>
    </Form>
  ),
};

export const FormSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['small', 'default', 'large'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{size}</h4>
          <Form size={size} layout="inline">
            <Form.Item name="field1" label="Field">
              <input type="text" placeholder="Input" style={{ padding: size === 'small' ? 4 : size === 'large' ? 12 : 8 }} />
            </Form.Item>
            <Form.Item>
              <button type="submit" style={{ padding: size === 'small' ? '4px 8px' : size === 'large' ? '12px 24px' : '8px 16px' }}>
                Submit
              </button>
            </Form.Item>
          </Form>
        </div>
      ))}
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Form engine={engine} layout="vertical" style={{ maxWidth: 300 }}>
            <Form.Item name="name" label="Name">
              <input type="text" placeholder="Enter name" style={{ width: '100%', padding: 8 }} />
            </Form.Item>
            <Form.Item>
              <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
            </Form.Item>
          </Form>
        </div>
      ))}
    </div>
  ),
};
