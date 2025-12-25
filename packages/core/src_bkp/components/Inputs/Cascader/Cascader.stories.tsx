import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from './Cascader';
import { Space } from 'antd';

const meta: Meta<typeof Cascader> = {
  title: 'Inputs/Cascader',
  component: Cascader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de selección en cascada para elegir opciones anidadas.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/cascader)
- [🎨 API de Props](https://ant.design/components/cascader#api)
- [💡 Ejemplos](https://ant.design/components/cascader#examples)

## Cuándo usar

- Para seleccionar valores de datos jerárquicos o en cascada.
- Ideal para ubicaciones, categorías o estructuras multinivel.
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
    multiple: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Cascader>;

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const options: Option[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

export const Basic: Story = {
  args: {
    options,
    placeholder: 'Please select',
    style: { width: 300 },
  },
};

export const Multiple: Story = {
  args: {
    options,
    multiple: true,
    placeholder: 'Select multiple',
    style: { width: 300 },
    maxTagCount: 'responsive',
  },
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    placeholder: 'Disabled',
    style: { width: 300 },
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Cascader
        size="small"
        options={options}
        placeholder="Small"
        style={{ width: 300 }}
      />
      <Cascader
        size="middle"
        options={options}
        placeholder="Middle (default)"
        style={{ width: 300 }}
      />
      <Cascader
        size="large"
        options={options}
        placeholder="Large"
        style={{ width: 300 }}
      />
    </Space>
  ),
};

export const ShowSearch: Story = {
  args: {
    options,
    showSearch: true,
    placeholder: 'Search to select',
    style: { width: 300 },
  },
};
