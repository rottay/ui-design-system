import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { Space } from 'antd';

const meta: Meta<typeof Table> = {
  title: 'Display/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de tabla para mostrar datos en formato tabular.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/table)
- [🎨 API de Props](https://ant.design/components/table#api)
- [💡 Ejemplos](https://ant.design/components/table#examples)

## Cuándo usar

- Para mostrar conjuntos de datos estructurados en filas y columnas.
- Soporta ordenamiento, filtrado, paginación y selección de filas.
        `,
      },
    },
  },
  argTypes: {
    bordered: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags?: string[];
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
  },
];

export const Basic: Story = {
  args: {
    columns,
    dataSource: data,
  },
};

export const Bordered: Story = {
  args: {
    columns,
    dataSource: data,
    bordered: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Table columns={columns} dataSource={data} size="small" />
      <Table columns={columns} dataSource={data} size="middle" />
      <Table columns={columns} dataSource={data} size="large" />
    </Space>
  ),
};

export const WithPagination: Story = {
  args: {
    columns,
    dataSource: [...data, ...data, ...data],
    pagination: {
      pageSize: 5,
    },
  },
};

export const Striped: Story = {
  args: {
    columns,
    dataSource: data,
    rowClassName: (_: unknown, index: number) =>
      index % 2 === 0 ? '' : 'striped-row',
  },
};

export const Loading: Story = {
  args: {
    columns,
    dataSource: data,
    loading: true,
  },
};
