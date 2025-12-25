import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Space } from 'antd';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';

const meta: Meta<typeof Input> = {
  title: 'Inputs/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de entrada de texto para recopilar información del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/input)
- [🎨 API de Props](https://ant.design/components/input#api)
- [💡 Ejemplos](https://ant.design/components/input#examples)

## Cuándo usar

- Para permitir al usuario ingresar texto, números o información en formularios.
- Incluye variantes como TextArea, Password, Search para diferentes casos de uso.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    allowClear: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Basic: Story = {
  args: {
    placeholder: 'Basic usage',
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input size="small" placeholder="Small" />
      <Input size="middle" placeholder="Middle (default)" />
      <Input size="large" placeholder="Large" />
    </Space>
  ),
};

export const TextArea: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.TextArea placeholder="Basic TextArea" rows={4} />
      <Input.TextArea
        placeholder="Auto size TextArea"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <Input.TextArea placeholder="Show count" showCount maxLength={100} />
    </Space>
  ),
};

export const Password: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Password placeholder="Basic password" />
      <Input.Password
        placeholder="With icon render"
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
      />
      <Input.Password placeholder="Visible password" visibilityToggle={false} />
    </Space>
  ),
};

export const Search: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Search placeholder="Input search text" />
      <Input.Search placeholder="Input search text" allowClear />
      <Input.Search
        placeholder="Input search text"
        enterButton="Search"
        size="large"
      />
      <Input.Search placeholder="Input search text" enterButton />
    </Space>
  ),
};

export const WithAddon: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input addonBefore="http://" addonAfter=".com" defaultValue="mysite" />
      <Input addonBefore="https://" defaultValue="mysite.com" />
      <Input prefix="$" suffix="USD" />
      <Input prefix={<UserOutlined />} placeholder="Enter your username" />
    </Space>
  ),
};

export const AllowClear: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input placeholder="Input with clear icon" allowClear />
      <Input.TextArea placeholder="TextArea with clear icon" allowClear rows={4} />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input placeholder="Disabled input" disabled />
      <Input.TextArea placeholder="Disabled TextArea" disabled rows={4} />
      <Input.Password placeholder="Disabled password" disabled />
    </Space>
  ),
};

export const WithPrefix: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input prefix={<UserOutlined />} placeholder="Username" />
      <Input prefix={<LockOutlined />} placeholder="Password" type="password" />
    </Space>
  ),
};
