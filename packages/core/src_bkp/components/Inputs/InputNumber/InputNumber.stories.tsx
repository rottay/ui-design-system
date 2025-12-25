import type { Meta, StoryObj } from '@storybook/react';
import { InputNumber } from './InputNumber';
import { Space } from 'antd';

const meta: Meta<typeof InputNumber> = {
  title: 'Inputs/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Campo de entrada numérica con controles para incrementar y decrementar valores.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/input-number)
- [🎨 API de Props](https://ant.design/components/input-number#api)
- [💡 Ejemplos](https://ant.design/components/input-number#examples)

## Cuándo usar

- Cuando necesitas entrada de valores numéricos con validación
- Para cantidades, precios, o cualquier dato que requiera precisión numérica
- Cuando quieres limitar valores dentro de un rango específico
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
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputNumber>;

export const Basic: Story = {
  args: {
    defaultValue: 3,
    style: { width: 200 },
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical">
      <InputNumber size="small" defaultValue={3} style={{ width: 200 }} />
      <InputNumber size="middle" defaultValue={3} style={{ width: 200 }} />
      <InputNumber size="large" defaultValue={3} style={{ width: 200 }} />
    </Space>
  ),
};

export const MinMax: Story = {
  render: () => (
    <Space direction="vertical">
      <div>
        <span>Min: 1, Max: 10</span>
        <InputNumber min={1} max={10} defaultValue={3} style={{ width: 200, marginLeft: 16 }} />
      </div>
      <div>
        <span>Min: 0, Max: 100</span>
        <InputNumber min={0} max={100} defaultValue={50} style={{ width: 200, marginLeft: 16 }} />
      </div>
    </Space>
  ),
};

export const Step: Story = {
  render: () => (
    <Space direction="vertical">
      <div>
        <span>Step: 0.1</span>
        <InputNumber
          step={0.1}
          defaultValue={1.5}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
      <div>
        <span>Step: 10</span>
        <InputNumber
          step={10}
          defaultValue={100}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
    </Space>
  ),
};

export const Formatter: Story = {
  render: () => (
    <Space direction="vertical">
      <div>
        <span>Currency:</span>
        <InputNumber
          defaultValue={1000}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
      <div>
        <span>Percentage:</span>
        <InputNumber
          defaultValue={100}
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value) => value?.replace('%', '') as any}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
    </Space>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 3,
    style: { width: 200 },
  },
};

export const Controls: Story = {
  render: () => (
    <Space direction="vertical">
      <InputNumber
        defaultValue={3}
        controls
        style={{ width: 200 }}
      />
      <InputNumber
        defaultValue={3}
        controls={false}
        style={{ width: 200 }}
      />
    </Space>
  ),
};

export const Precision: Story = {
  render: () => (
    <Space direction="vertical">
      <div>
        <span>Precision: 2</span>
        <InputNumber
          defaultValue={1.5}
          precision={2}
          step={0.01}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
      <div>
        <span>Precision: 0 (integers only)</span>
        <InputNumber
          defaultValue={5}
          precision={0}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>
    </Space>
  ),
};
