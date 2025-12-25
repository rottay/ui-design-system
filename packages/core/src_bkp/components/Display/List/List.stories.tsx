import type { Meta, StoryObj } from '@storybook/react';
import { List } from './List';
import { Avatar } from '../Avatar';
import { Space, List as AntList } from 'antd';

const meta: Meta<typeof List> = {
  title: 'Display/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de lista para mostrar conjuntos de datos de manera estructurada.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/list)
- [🎨 API de Props](https://ant.design/components/list#api)
- [💡 Ejemplos](https://ant.design/components/list#examples)

## Cuándo usar

- Para mostrar listas simples o complejas de elementos.
- Soporta configuraciones en cuadrícula, con avatares, acciones y paginación.
        `,
      },
    },
  },
  argTypes: {
    bordered: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof List>;

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
];

const dataWithDescription = [
  {
    title: 'Ant Design Title 1',
    description: 'Ant Design, a design language for background applications',
  },
  {
    title: 'Ant Design Title 2',
    description: 'Ant Design, a design language for background applications',
  },
  {
    title: 'Ant Design Title 3',
    description: 'Ant Design, a design language for background applications',
  },
  {
    title: 'Ant Design Title 4',
    description: 'Ant Design, a design language for background applications',
  },
];

export const Basic: Story = {
  args: {
    bordered: true,
    dataSource: data,
    renderItem: (item: any) => <AntList.Item>{item.title}</AntList.Item>,
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <List
        size="small"
        bordered
        dataSource={data}
        renderItem={(item: any) => <AntList.Item>{item.title}</AntList.Item>}
      />
      <List
        size="default"
        bordered
        dataSource={data}
        renderItem={(item: any) => <AntList.Item>{item.title}</AntList.Item>}
      />
      <List
        size="large"
        bordered
        dataSource={data}
        renderItem={(item: any) => <AntList.Item>{item.title}</AntList.Item>}
      />
    </Space>
  ),
};

export const WithAvatar: Story = {
  args: {
    itemLayout: 'horizontal',
    dataSource: dataWithDescription,
    renderItem: (item: any) => (
      <AntList.Item>
        <AntList.Item.Meta
          avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />}
          title={<a href="https://ant.design">{item.title}</a>}
          description={item.description}
        />
      </AntList.Item>
    ),
  },
};

export const Grid: Story = {
  args: {
    grid: {
      gutter: 16,
      column: 4,
    },
    dataSource: [
      'Racing car sprays burning fuel into crowd.',
      'Japanese princess to wed commoner.',
      'Australian walks 100km after outback crash.',
      'Man charged over missing wedding girl.',
      'Los Angeles battles huge wildfires.',
    ],
    renderItem: (item: any) => (
      <AntList.Item>
        <div>{item}</div>
      </AntList.Item>
    ),
  },
};

export const LoadMore: Story = {
  args: {
    dataSource: data,
    loadMore: <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
      <a>loading more</a>
    </div>,
    renderItem: (item: any) => <AntList.Item>{item.title}</AntList.Item>,
  },
};
