import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { Space } from 'antd';

const meta: Meta<typeof Select> = {
  title: 'Inputs/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de selección para elegir opciones de una lista desplegable.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/select)
- [🎨 API de Props](https://ant.design/components/select#api)
- [💡 Ejemplos](https://ant.design/components/select#examples)

## Cuándo usar

- Para seleccionar una o múltiples opciones de una lista.
- Soporta búsqueda, múltiple selección, grupos y tags personalizados.
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
    loading: {
      control: 'boolean',
    },
    mode: {
      control: 'select',
      options: ['multiple', 'tags'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
  { value: 'tom', label: 'Tom' },
  { value: 'jerry', label: 'Jerry' },
];

export const Basic: Story = {
  args: {
    options,
    placeholder: 'Select a person',
    style: { width: 200 },
  },
};

export const Multiple: Story = {
  args: {
    mode: 'multiple',
    options,
    placeholder: 'Select multiple',
    style: { width: '100%', minWidth: 300 },
    maxTagCount: 'responsive',
  },
};

export const Searchable: Story = {
  render: () => (
    <Select
      showSearch
      options={options}
      placeholder="Search to select"
      style={{ width: 200 }}
      filterOption={(input, option) =>
        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
      }
    />
  ),
};

export const Tags: Story = {
  args: {
    mode: 'tags',
    placeholder: 'Type to add tags',
    style: { width: '100%', minWidth: 300 },
  },
};

export const Groups: Story = {
  render: () => (
    <Select
      placeholder="Select with option groups"
      style={{ width: 200 }}
      options={[
        {
          label: 'Manager',
          options: [
            { label: 'Jack', value: 'jack' },
            { label: 'Lucy', value: 'lucy' },
          ],
        },
        {
          label: 'Engineer',
          options: [
            { label: 'Tom', value: 'tom' },
            { label: 'Jerry', value: 'jerry' },
          ],
        },
      ]}
    />
  ),
};

export const Loading: Story = {
  args: {
    options,
    loading: true,
    placeholder: 'Loading...',
    style: { width: 200 },
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        size="small"
        options={options}
        placeholder="Small"
        style={{ width: 200 }}
      />
      <Select
        size="middle"
        options={options}
        placeholder="Middle (default)"
        style={{ width: 200 }}
      />
      <Select
        size="large"
        options={options}
        placeholder="Large"
        style={{ width: 200 }}
      />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        options={options}
        disabled
        placeholder="Disabled"
        style={{ width: 200 }}
      />
      <Select
        options={options}
        defaultValue="lucy"
        disabled
        style={{ width: 200 }}
      />
    </Space>
  ),
};

export const AllowClear: Story = {
  args: {
    options,
    allowClear: true,
    placeholder: 'Select with clear',
    style: { width: 200 },
  },
};

export const CustomDropdown: Story = {
  render: () => (
    <Select
      options={options}
      placeholder="Custom dropdown render"
      style={{ width: 200 }}
      dropdownRender={(menu) => (
        <div>
          {menu}
          <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
            <a href="#" style={{ color: '#1677ff' }}>
              Add new item
            </a>
          </div>
        </div>
      )}
    />
  ),
};
