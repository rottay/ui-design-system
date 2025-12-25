import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Space } from 'antd';

const meta: Meta<typeof Button> = {
  title: 'Inputs/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de botón para disparar acciones y eventos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/button)
- [🎨 API de Props](https://ant.design/components/button#api)
- [💡 Ejemplos](https://ant.design/components/button#examples)

## Cuándo usar

- Un botón significa una operación (o una serie de operaciones). Al hacer clic en un botón, se activará la lógica empresarial correspondiente.
- Use botones primarios para acciones principales y secundarios para acciones menos importantes.

## Tipos de Botones

- **Primary**: Para la acción principal en una página o sección
- **Default**: Para acciones secundarias
- **Dashed**: Para acciones de agregar o crear
- **Text**: Para acciones de menor énfasis
- **Link**: Para navegación que se parece a enlaces
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['primary', 'default', 'dashed', 'text', 'link'],
      description: 'Type of button',
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
      description: 'Size of button',
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle', 'round'],
      description: 'Shape of button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state of button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state of button',
    },
    danger: {
      control: { type: 'boolean' },
      description: 'Danger state of button',
    },
    block: {
      control: { type: 'boolean' },
      description: 'Option to fit button width to its parent width',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Custom prop: Option to fit button width to 100%',
    },
    htmlType: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  args: {
    children: 'Button',
  },
};

export const Types: Story = {
  render: () => (
    <Space wrap>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="text">Text</Button>
      <Button type="link">Link</Button>
    </Space>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Space wrap>
      <Button size="large" type="primary">Large</Button>
      <Button type="primary">Default</Button>
      <Button size="small" type="primary">Small</Button>
    </Space>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Space wrap>
      <Button type="primary" disabled>Primary</Button>
      <Button disabled>Default</Button>
      <Button type="dashed" disabled>Dashed</Button>
      <Button type="text" disabled>Text</Button>
      <Button type="link" disabled>Link</Button>
    </Space>
  ),
};

export const Loading: Story = {
  render: () => (
    <Space wrap>
      <Button type="primary" loading>Loading</Button>
      <Button loading>Loading</Button>
      <Button type="primary" loading icon={<div>📄</div>}>Loading with icon</Button>
    </Space>
  ),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    type: 'primary',
    children: 'Full Width Button',
  },
};

export const Danger: Story = {
  render: () => (
    <Space wrap>
      <Button type="primary" danger>Primary Danger</Button>
      <Button danger>Default Danger</Button>
      <Button type="dashed" danger>Dashed Danger</Button>
      <Button type="text" danger>Text Danger</Button>
      <Button type="link" danger>Link Danger</Button>
    </Space>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Space wrap>
      <Button type="primary">Default</Button>
      <Button type="primary" shape="circle">A</Button>
      <Button type="primary" shape="round">Round</Button>
    </Space>
  ),
};
