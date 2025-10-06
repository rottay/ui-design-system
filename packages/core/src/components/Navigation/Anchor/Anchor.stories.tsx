import type { Meta, StoryObj } from '@storybook/react';
import { Anchor } from './Anchor';

const meta: Meta<typeof Anchor> = {
  title: 'Navigation/Anchor',
  component: Anchor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Navegación tipo ancla que permite saltar a secciones específicas de la página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/anchor)
- [🎨 API de Props](https://ant.design/components/anchor#api)
- [💡 Ejemplos](https://ant.design/components/anchor#examples)

## Cuándo usar

- Para navegar entre secciones de un documento largo
- Cuando necesitas un índice o tabla de contenidos interactiva
- Para mejorar la navegación en páginas con múltiples secciones
        `,
      },
    },
  },
  argTypes: {
    affix: {
      control: { type: 'boolean' },
      description: 'Fixed mode of Anchor',
      defaultValue: true,
    },
    bounds: {
      control: { type: 'number' },
      description: 'Bounding distance of anchor area',
    },
    offsetTop: {
      control: { type: 'number' },
      description: 'Pixels to offset from top when calculating position of scroll',
    },
    targetOffset: {
      control: { type: 'number' },
      description: 'Anchor scroll offset',
    },
    items: {
      control: { type: 'object' },
      description: 'Data configuration option content, support nesting',
    },
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Set Anchor direction',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when active link changes',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when item is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Anchor>;

export const Basic: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <Anchor
        items={[
          {
            key: 'part-1',
            href: '#part-1',
            title: 'Part 1',
          },
          {
            key: 'part-2',
            href: '#part-2',
            title: 'Part 2',
          },
          {
            key: 'part-3',
            href: '#part-3',
            title: 'Part 3',
          },
        ]}
      />
      <div>
        <div id="part-1" style={{ height: '400px', paddingTop: '10px' }}>
          <h2>Part 1</h2>
          <p>Content of Part 1</p>
        </div>
        <div id="part-2" style={{ height: '400px', paddingTop: '10px' }}>
          <h2>Part 2</h2>
          <p>Content of Part 2</p>
        </div>
        <div id="part-3" style={{ height: '400px', paddingTop: '10px' }}>
          <h2>Part 3</h2>
          <p>Content of Part 3</p>
        </div>
      </div>
    </div>
  ),
};

export const Static: Story = {
  render: () => (
    <Anchor
      affix={false}
      items={[
        {
          key: 'introduction',
          href: '#introduction',
          title: 'Introduction',
        },
        {
          key: 'features',
          href: '#features',
          title: 'Features',
          children: [
            {
              key: 'feature-1',
              href: '#feature-1',
              title: 'Feature 1',
            },
            {
              key: 'feature-2',
              href: '#feature-2',
              title: 'Feature 2',
            },
          ],
        },
        {
          key: 'api',
          href: '#api',
          title: 'API',
        },
      ]}
    />
  ),
};
