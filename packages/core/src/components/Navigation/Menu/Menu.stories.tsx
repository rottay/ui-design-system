import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Menú de navegación versátil con soporte para jerarquías y diferentes modos de visualización.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/menu)
- [🎨 API de Props](https://ant.design/components/menu#api)
- [💡 Ejemplos](https://ant.design/components/menu#examples)

## Cuándo usar

- Para navegación principal de aplicaciones o sitios web
- Cuando necesitas menús jerárquicos con submenús
- Para barras laterales de navegación o menús desplegables
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical', 'inline'],
      description: 'Type of menu',
      defaultValue: 'vertical',
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
      description: 'Color theme of menu',
      defaultValue: 'light',
    },
    items: {
      control: { type: 'object' },
      description: 'Menu item content',
    },
    inlineCollapsed: {
      control: { type: 'boolean' },
      description: 'Specifies the collapsed status when menu is inline mode',
    },
    inlineIndent: {
      control: { type: 'number' },
      description: 'Indent of inline menu item on each level',
      defaultValue: 24,
    },
    selectable: {
      control: { type: 'boolean' },
      description: 'Allows selecting menu items',
      defaultValue: true,
    },
    multiple: {
      control: { type: 'boolean' },
      description: 'Allows selection of multiple items',
    },
    defaultOpenKeys: {
      control: { type: 'object' },
      description: 'Array with the keys of default opened sub menus',
    },
    defaultSelectedKeys: {
      control: { type: 'object' },
      description: 'Array with the keys of default selected menu items',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when menu item is clicked',
    },
    onSelect: {
      action: 'selected',
      description: 'Callback when menu item is selected',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

const items = [
  {
    key: 'mail',
    label: 'Navigation One',
  },
  {
    key: 'app',
    label: 'Navigation Two',
  },
  {
    key: 'submenu',
    label: 'Navigation Three - Submenu',
    children: [
      {
        key: 'setting:1',
        label: 'Option 1',
      },
      {
        key: 'setting:2',
        label: 'Option 2',
      },
      {
        key: 'setting:3',
        label: 'Option 3',
      },
    ],
  },
  {
    key: 'alipay',
    label: 'Navigation Four',
  },
];

export const Horizontal: Story = {
  args: {
    mode: 'horizontal',
    items: items,
    defaultSelectedKeys: ['mail'],
  },
};

export const Vertical: Story = {
  args: {
    mode: 'vertical',
    items: items,
    defaultSelectedKeys: ['mail'],
    style: { width: 256 },
  },
};

export const Inline: Story = {
  args: {
    mode: 'inline',
    items: items,
    defaultSelectedKeys: ['mail'],
    defaultOpenKeys: ['submenu'],
    style: { width: 256 },
  },
};

export const Collapsed: Story = {
  args: {
    mode: 'inline',
    items: items,
    defaultSelectedKeys: ['mail'],
    inlineCollapsed: true,
    style: { width: 80 },
  },
};

export const Dark: Story = {
  args: {
    mode: 'inline',
    theme: 'dark',
    items: items,
    defaultSelectedKeys: ['mail'],
    defaultOpenKeys: ['submenu'],
    style: { width: 256 },
  },
};
