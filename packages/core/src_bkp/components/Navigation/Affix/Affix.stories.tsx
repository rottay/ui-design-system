import type { Meta, StoryObj } from '@storybook/react';
import { Affix } from './Affix';
import { Button } from '../../Inputs/Button';

const meta: Meta<typeof Affix> = {
  title: 'Navigation/Affix',
  component: Affix,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Componente que fija elementos en una posición específica durante el scroll.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/affix)
- [🎨 API de Props](https://ant.design/components/affix#api)
- [💡 Ejemplos](https://ant.design/components/affix#examples)

## Cuándo usar

- Para mantener botones o elementos de navegación visibles durante el scroll
- Cuando necesitas fijar barras de herramientas o menús
- Para mejorar la accesibilidad de acciones importantes en páginas largas
        `,
      },
    },
  },
  argTypes: {
    offsetTop: {
      control: { type: 'number' },
      description: 'Pixels to offset from top when fixed',
    },
    offsetBottom: {
      control: { type: 'number' },
      description: 'Pixels to offset from bottom when fixed',
    },
    target: {
      control: false,
      description: 'Set the container to scroll',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when affix state changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Affix>;

export const Basic: Story = {
  args: {
    offsetTop: 10,
    children: <Button type="primary">Affix Top</Button>,
  },
};

export const OffsetTop: Story = {
  render: () => (
    <div style={{ height: '100vh', padding: '20px' }}>
      <Affix offsetTop={120}>
        <Button type="primary">120px to affix top</Button>
      </Affix>
      <div style={{ height: '1000px', paddingTop: '60px' }}>
        <p>Scroll to see the affix effect</p>
      </div>
    </div>
  ),
};

export const OffsetBottom: Story = {
  render: () => (
    <div style={{ height: '100vh', padding: '20px' }}>
      <div style={{ height: '1000px', paddingBottom: '60px' }}>
        <p>Scroll down to see the affix effect</p>
      </div>
      <Affix offsetBottom={10}>
        <Button type="primary">Affix Bottom</Button>
      </Affix>
    </div>
  ),
};
