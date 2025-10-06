import type { Meta, StoryObj } from '@storybook/react';
import { Tree } from './Tree';

const meta: Meta<typeof Tree> = {
  title: 'Display/Tree',
  component: Tree,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de árbol para mostrar datos jerárquicos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tree)
- [🎨 API de Props](https://ant.design/components/tree#api)
- [💡 Ejemplos](https://ant.design/components/tree#examples)

## Cuándo usar

- Para mostrar información con estructura jerárquica.
- Soporta selección, checkboxes, arrastre y búsqueda.
        `,
      },
    },
  },
  argTypes: {
    showLine: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    checkable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Tree>;

const treeData = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        disabled: true,
        children: [
          {
            title: 'leaf',
            key: '0-0-0-0',
            disableCheckbox: true,
          },
          {
            title: 'leaf',
            key: '0-0-0-1',
          },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ title: <span style={{ color: '#1890ff' }}>sss</span>, key: '0-0-1-0' }],
      },
    ],
  },
];

export const Basic: Story = {
  args: {
    treeData,
    defaultExpandAll: true,
  },
};

export const Checkable: Story = {
  args: {
    treeData,
    checkable: true,
    defaultExpandAll: true,
    defaultCheckedKeys: ['0-0-0', '0-0-1'],
  },
};

export const WithLine: Story = {
  args: {
    treeData,
    showLine: true,
    defaultExpandAll: true,
  },
};

export const WithIcon: Story = {
  args: {
    treeData,
    showIcon: true,
    defaultExpandAll: true,
  },
};

export const Draggable: Story = {
  args: {
    treeData,
    draggable: true,
    defaultExpandAll: true,
  },
};

export const BlockNode: Story = {
  args: {
    treeData,
    blockNode: true,
    defaultExpandAll: true,
  },
};
