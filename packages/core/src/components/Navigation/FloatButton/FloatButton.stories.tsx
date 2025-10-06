import type { Meta, StoryObj } from '@storybook/react';
import { FloatButton } from './FloatButton';

const meta: Meta<typeof FloatButton> = {
  title: 'Navigation/FloatButton',
  component: FloatButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Botón flotante que permanece visible en una posición fija de la pantalla.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/float-button)
- [🎨 API de Props](https://ant.design/components/float-button#api)
- [💡 Ejemplos](https://ant.design/components/float-button#examples)

## Cuándo usar

- Para acciones principales que deben estar siempre accesibles
- Cuando necesitas un acceso rápido a funciones frecuentes
- Para menús de acciones flotantes con múltiples opciones
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['default', 'primary'],
      description: 'Type of button',
    },
    shape: {
      control: { type: 'select' },
      options: ['circle', 'square'],
      description: 'Shape of button',
      defaultValue: 'circle',
    },
    icon: {
      control: false,
      description: 'Custom icon',
    },
    description: {
      control: { type: 'text' },
      description: 'Description of button',
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Tooltip text',
    },
    badge: {
      control: { type: 'object' },
      description: 'Badge props',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FloatButton>;

export const Basic: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <p style={{ padding: '20px' }}>Hover over the float button on the bottom right</p>
      <FloatButton />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <p style={{ padding: '20px' }}>Float buttons with different shapes</p>
      <FloatButton shape="circle" style={{ right: 94 }} />
      <FloatButton shape="square" style={{ right: 24 }} />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <p style={{ padding: '20px' }}>Float buttons with different types</p>
      <FloatButton type="default" style={{ right: 94 }} />
      <FloatButton type="primary" style={{ right: 24 }} />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <p style={{ padding: '20px' }}>Float button with description</p>
      <FloatButton
        shape="square"
        description="Help"
        style={{ right: 24 }}
      />
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <p style={{ padding: '20px' }}>Float button with badge</p>
      <FloatButton
        badge={{ count: 5 }}
        style={{ right: 24 }}
      />
    </div>
  ),
};

export const Group: Story = {
  render: () => {
    return (
      <div style={{ height: '100vh', position: 'relative' }}>
        <p style={{ padding: '20px' }}>Float button group</p>
        <FloatButton.Group trigger="hover" style={{ right: 24 }}>
          <FloatButton />
          <FloatButton />
          <FloatButton />
        </FloatButton.Group>
      </div>
    );
  },
};
