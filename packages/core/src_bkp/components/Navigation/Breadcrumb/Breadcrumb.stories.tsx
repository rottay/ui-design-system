import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Muestra la ubicación actual dentro de una jerarquía de navegación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/breadcrumb)
- [🎨 API de Props](https://ant.design/components/breadcrumb#api)
- [💡 Ejemplos](https://ant.design/components/breadcrumb#examples)

## Cuándo usar

- Para mostrar la ruta de navegación actual en aplicaciones jerárquicas
- Cuando necesitas indicar la ubicación del usuario en la estructura
- Para proporcionar navegación rápida a niveles superiores
        `,
      },
    },
  },
  argTypes: {
    separator: {
      control: { type: 'text' },
      description: 'Custom separator',
      defaultValue: '/',
    },
    items: {
      control: { type: 'object' },
      description: 'The routing stack information of breadcrumb',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Basic: Story = {
  args: {
    items: [
      {
        title: 'Home',
      },
      {
        title: 'Application',
      },
      {
        title: 'List',
      },
    ],
  },
};

export const WithLinks: Story = {
  args: {
    items: [
      {
        title: 'Home',
        href: '/',
      },
      {
        title: 'Application Center',
        href: '/application',
      },
      {
        title: 'Application List',
        href: '/application/list',
      },
      {
        title: 'An Application',
      },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        title: 'Home',
        href: '/',
      },
      {
        title: 'User',
        href: '/user',
      },
      {
        title: 'Profile',
      },
    ],
  },
};

export const CustomSeparator: Story = {
  args: {
    separator: '>',
    items: [
      {
        title: 'Home',
      },
      {
        title: 'Application',
      },
      {
        title: 'List',
      },
    ],
  },
};
