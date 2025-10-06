import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import { Space } from 'antd';

const meta: Meta<typeof Slider> = {
  title: 'Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Control deslizante para seleccionar valores o rangos numéricos mediante interacción visual.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/slider)
- [🎨 API de Props](https://ant.design/components/slider#api)
- [💡 Ejemplos](https://ant.design/components/slider#examples)

## Cuándo usar

- Para ajustar valores dentro de un rango continuo
- Cuando necesitas seleccionar rangos de valores (por ejemplo, filtros de precio)
- Para controles de volumen, brillo, u otras configuraciones graduales
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    vertical: {
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
type Story = StoryObj<typeof Slider>;

export const Basic: Story = {
  args: {
    defaultValue: 30,
  },
};

export const Range: Story = {
  args: {
    range: true,
    defaultValue: [20, 50],
  },
};

export const Marks: Story = {
  render: () => {
    const marks = {
      0: '0°C',
      26: '26°C',
      37: '37°C',
      100: {
        style: { color: '#f50' },
        label: <strong>100°C</strong>,
      },
    };

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Slider marks={marks} defaultValue={37} />
        <Slider marks={marks} range defaultValue={[26, 37]} />
      </Space>
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <Space size={50}>
      <Slider vertical defaultValue={30} style={{ height: 300 }} />
      <Slider vertical range defaultValue={[20, 50]} style={{ height: 300 }} />
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Slider disabled defaultValue={30} />
      <Slider disabled range defaultValue={[20, 50]} />
    </Space>
  ),
};

export const Step: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <span>Step: 10</span>
        <Slider defaultValue={30} step={10} />
      </div>
      <div>
        <span>Step: null (continuous)</span>
        <Slider defaultValue={30} step={null as any} />
      </div>
    </Space>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Slider defaultValue={30} tooltip={{ open: true }} />
      <Slider defaultValue={30} tooltip={{ placement: 'bottom' }} />
    </Space>
  ),
};

export const CustomTooltip: Story = {
  render: () => (
    <Slider
      defaultValue={30}
      tooltip={{
        formatter: (value) => `${value}%`,
      }}
    />
  ),
};

export const MinMax: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <span>Min: 0, Max: 100</span>
        <Slider min={0} max={100} defaultValue={50} />
      </div>
      <div>
        <span>Min: -100, Max: 100</span>
        <Slider min={-100} max={100} defaultValue={0} />
      </div>
    </Space>
  ),
};
