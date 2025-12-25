import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pestañas que organizan y permiten navegar entre grupos de contenido relacionado.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tabs)
- [🎨 API de Props](https://ant.design/components/tabs#api)
- [💡 Ejemplos](https://ant.design/components/tabs#examples)

## Cuándo usar

- Para organizar contenido en categorías o secciones relacionadas
- Cuando necesitas alternar entre diferentes vistas sin cambiar de página
- Para dashboards o interfaces con múltiples paneles de información
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['line', 'card', 'editable-card'],
      description: 'Type of tabs',
      defaultValue: 'line',
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
      description: 'Size of tabs',
      defaultValue: 'middle',
    },
    tabPosition: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Position of tabs',
      defaultValue: 'top',
    },
    items: {
      control: { type: 'object' },
      description: 'Tab items',
    },
    activeKey: {
      control: { type: 'text' },
      description: 'Current active tab key',
    },
    defaultActiveKey: {
      control: { type: 'text' },
      description: 'Initial active tab key',
    },
    centered: {
      control: { type: 'boolean' },
      description: 'Center tabs',
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Enable animation',
      defaultValue: true,
    },
    tabBarGutter: {
      control: { type: 'number' },
      description: 'Gap between tabs',
    },
    onChange: {
      action: 'tab-changed',
      description: 'Callback when tab is changed',
    },
    onTabClick: {
      action: 'tab-clicked',
      description: 'Callback when tab is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const items = [
  {
    key: '1',
    label: 'Tab 1',
    children: 'Content of Tab Pane 1',
  },
  {
    key: '2',
    label: 'Tab 2',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '3',
    label: 'Tab 3',
    children: 'Content of Tab Pane 3',
  },
];

export const Basic: Story = {
  args: {
    defaultActiveKey: '1',
    items: items,
  },
};

export const Centered: Story = {
  args: {
    defaultActiveKey: '1',
    centered: true,
    items: items,
  },
};

export const Card: Story = {
  args: {
    type: 'card',
    defaultActiveKey: '1',
    items: items,
  },
};

export const CardWithAddButton: Story = {
  args: {
    type: 'editable-card',
    defaultActiveKey: '1',
    items: items,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Tabs size="large" items={items} />
      <Tabs size="middle" items={items} />
      <Tabs size="small" items={items} />
    </div>
  ),
};

export const Position: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Tabs tabPosition="top" items={items} />
      <Tabs tabPosition="left" items={items} style={{ height: 220 }} />
      <Tabs tabPosition="right" items={items} style={{ height: 220 }} />
      <Tabs tabPosition="bottom" items={items} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultActiveKey: '1',
    items: [
      {
        key: '1',
        label: 'Tab 1',
        children: 'Content of Tab 1',
      },
      {
        key: '2',
        label: 'Tab 2',
        children: 'Content of Tab 2',
        disabled: true,
      },
      {
        key: '3',
        label: 'Tab 3',
        children: 'Content of Tab 3',
      },
    ],
  },
};

export const WithIcon: Story = {
  args: {
    defaultActiveKey: '1',
    items: [
      {
        key: '1',
        label: 'Home',
        children: 'Content of Home',
      },
      {
        key: '2',
        label: 'Profile',
        children: 'Content of Profile',
      },
      {
        key: '3',
        label: 'Settings',
        children: 'Content of Settings',
      },
    ],
  },
};

export const ExtraContent: Story = {
  args: {
    defaultActiveKey: '1',
    items: items,
    tabBarExtraContent: <button>Extra Action</button>,
  },
};
