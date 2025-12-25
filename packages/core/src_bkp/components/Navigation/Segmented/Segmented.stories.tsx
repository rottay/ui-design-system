import type { Meta, StoryObj } from '@storybook/react';
import { Segmented } from './Segmented';
import { useState } from 'react';

const meta: Meta<typeof Segmented> = {
  title: 'Navigation/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Control segmentado que permite seleccionar una opción entre múltiples alternativas.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/segmented)
- [🎨 API de Props](https://ant.design/components/segmented#api)
- [💡 Ejemplos](https://ant.design/components/segmented#examples)

## Cuándo usar

- Para alternar entre vistas o modos de visualización
- Cuando necesitas selección exclusiva entre pocas opciones
- Para filtros o categorías con opciones mutuamente excluyentes
        `,
      },
    },
  },
  argTypes: {
    options: {
      control: { type: 'object' },
      description: 'Set options of segmented',
    },
    value: {
      control: { type: 'text' },
      description: 'Current selected value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default selected value',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all segments',
    },
    block: {
      control: { type: 'boolean' },
      description: 'Option to fit width to its parent width',
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
      description: 'Size of segmented',
      defaultValue: 'middle',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Segmented>;

export const Basic: Story = {
  args: {
    options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
  },
};

export const WithValue: Story = {
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    defaultValue: 'Weekly',
  },
};

export const Block: Story = {
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    block: true,
  },
};

export const Disabled: Story = {
  args: {
    options: ['Daily', 'Weekly', 'Monthly'],
    disabled: true,
  },
};

export const DisabledOption: Story = {
  args: {
    options: [
      'Daily',
      { label: 'Weekly', value: 'Weekly', disabled: true },
      'Monthly',
      { label: 'Quarterly', value: 'Quarterly', disabled: true },
      'Yearly',
    ],
  },
};

export const CustomRender: Story = {
  args: {
    options: [
      {
        label: 'User 1',
        value: 'user1',
      },
      {
        label: 'User 2',
        value: 'user2',
      },
      {
        label: 'User 3',
        value: 'user3',
      },
    ],
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Segmented size="large" options={['Daily', 'Weekly', 'Monthly']} />
      <Segmented options={['Daily', 'Weekly', 'Monthly']} />
      <Segmented size="small" options={['Daily', 'Weekly', 'Monthly']} />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('Map');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Segmented
          options={['Map', 'Transit', 'Satellite']}
          value={value}
          onChange={setValue}
        />
        <div>Selected: {value}</div>
      </div>
    );
  },
};
