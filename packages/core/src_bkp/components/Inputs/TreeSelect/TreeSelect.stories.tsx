import type { Meta, StoryObj } from '@storybook/react';
import { TreeSelect } from './TreeSelect';
import { Space } from 'antd';

const meta: Meta<typeof TreeSelect> = {
  title: 'Inputs/TreeSelect',
  component: TreeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Selector en forma de árbol que permite elegir elementos de una estructura jerárquica.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tree-select)
- [🎨 API de Props](https://ant.design/components/tree-select#api)
- [💡 Ejemplos](https://ant.design/components/tree-select#examples)

## Cuándo usar

- Para seleccionar elementos de datos jerárquicos como categorías
- Cuando necesitas navegación en estructuras de árbol organizacionales
- Para filtros o selección de elementos con relaciones padre-hijo
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    multiple: {
      control: 'boolean',
    },
    treeCheckable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TreeSelect>;

const treeData = [
  {
    title: 'Node1',
    value: '0-0',
    children: [
      {
        title: 'Child Node1',
        value: '0-0-1',
      },
      {
        title: 'Child Node2',
        value: '0-0-2',
      },
    ],
  },
  {
    title: 'Node2',
    value: '0-1',
    children: [
      {
        title: 'Child Node3',
        value: '0-1-1',
      },
      {
        title: 'Child Node4',
        value: '0-1-2',
      },
    ],
  },
];

export const Basic: Story = {
  args: {
    treeData,
    placeholder: 'Please select',
    style: { width: '100%' },
  },
};

export const Multiple: Story = {
  args: {
    treeData,
    multiple: true,
    placeholder: 'Select multiple',
    style: { width: '100%' },
    maxTagCount: 'responsive',
  },
};

export const Checkable: Story = {
  args: {
    treeData,
    treeCheckable: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    placeholder: 'Please select',
    style: { width: '100%' },
  },
};

export const Disabled: Story = {
  args: {
    treeData,
    disabled: true,
    placeholder: 'Disabled',
    style: { width: '100%' },
  },
};

export const ShowSearch: Story = {
  args: {
    treeData,
    showSearch: true,
    placeholder: 'Search to select',
    style: { width: '100%' },
    treeNodeFilterProp: 'title',
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <TreeSelect
        treeData={treeData}
        size="small"
        placeholder="Small"
        style={{ width: '100%' }}
      />
      <TreeSelect
        treeData={treeData}
        size="middle"
        placeholder="Middle (default)"
        style={{ width: '100%' }}
      />
      <TreeSelect
        treeData={treeData}
        size="large"
        placeholder="Large"
        style={{ width: '100%' }}
      />
    </Space>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    treeData,
    defaultValue: '0-0-1',
    placeholder: 'Please select',
    style: { width: '100%' },
  },
};

export const AllowClear: Story = {
  args: {
    treeData,
    allowClear: true,
    placeholder: 'Select with clear',
    style: { width: '100%' },
  },
};

export const TreeDefaultExpandAll: Story = {
  args: {
    treeData,
    treeDefaultExpandAll: true,
    placeholder: 'All nodes expanded',
    style: { width: '100%' },
  },
};
