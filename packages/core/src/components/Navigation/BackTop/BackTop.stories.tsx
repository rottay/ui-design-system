import type { Meta, StoryObj } from '@storybook/react';
import { BackTop } from './BackTop';

const meta: Meta<typeof BackTop> = {
  title: 'Navigation/BackTop',
  component: BackTop,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Botón flotante que permite volver rápidamente al inicio de la página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/back-top)
- [🎨 API de Props](https://ant.design/components/back-top#api)
- [💡 Ejemplos](https://ant.design/components/back-top#examples)

## Cuándo usar

- En páginas con contenido extenso que requieren scroll
- Para mejorar la navegación y experiencia del usuario
- Cuando quieres proporcionar acceso rápido al inicio de la página
        `,
      },
    },
  },
  argTypes: {
    icon: {
      control: false,
      description: 'Custom icon',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BackTop>;

export const Basic: Story = {
  render: () => (
    <div style={{ height: '100vh', padding: '20px', overflow: 'auto' }}>
      <div style={{ height: '2000px' }}>
        <p>Scroll down to see the BackTop button</p>
        <BackTop />
      </div>
    </div>
  ),
};

export const WithCustomStyle: Story = {
  render: () => (
    <div style={{ height: '100vh', padding: '20px', overflow: 'auto' }}>
      <div style={{ height: '2000px' }}>
        <p>BackTop button with custom style</p>
        <BackTop style={{ right: 50, bottom: 50 }} />
      </div>
    </div>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <div style={{ height: '100vh', padding: '20px', overflow: 'auto' }}>
      <div style={{ height: '2000px' }}>
        <p>Scroll down to see the custom BackTop button</p>
        <BackTop icon={<div>UP</div>} />
      </div>
    </div>
  ),
};
