import type { Meta, StoryObj } from '@storybook/react';
import { Collapse } from './Collapse';
import { Space } from 'antd';

const meta: Meta<typeof Collapse> = {
  title: 'Display/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de panel plegable para organizar contenido en secciones expandibles.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/collapse)
- [🎨 API de Props](https://ant.design/components/collapse#api)
- [💡 Ejemplos](https://ant.design/components/collapse#examples)

## Cuándo usar

- Para organizar grandes cantidades de contenido de forma compacta.
- Permite al usuario expandir y contraer secciones según necesidad.
        `,
      },
    },
  },
  argTypes: {
    accordion: { control: 'boolean' },
    bordered: { control: 'boolean' },
    expandIconPosition: {
      control: 'select',
      options: ['start', 'end'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Collapse>;

const items = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>Panel content 1</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>Panel content 2</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>Panel content 3</p>,
  },
];

export const Basic: Story = {
  args: {
    items,
    defaultActiveKey: ['1'],
  },
};

export const Accordion: Story = {
  args: {
    items,
    accordion: true,
    defaultActiveKey: ['1'],
  },
};

export const Borderless: Story = {
  args: {
    items,
    bordered: false,
    defaultActiveKey: ['1'],
  },
};

export const ExpandIconPosition: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Collapse items={items} expandIconPosition="start" defaultActiveKey={['1']} />
      <Collapse items={items} expandIconPosition="end" defaultActiveKey={['1']} />
    </Space>
  ),
};

export const Ghost: Story = {
  args: {
    items,
    ghost: true,
    defaultActiveKey: ['1'],
  },
};
