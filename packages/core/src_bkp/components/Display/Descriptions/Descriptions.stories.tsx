import type { Meta, StoryObj } from '@storybook/react';
import { Descriptions } from './Descriptions';
import { Badge } from '../Badge';
import { Space } from 'antd';

const meta: Meta<typeof Descriptions> = {
  title: 'Display/Descriptions',
  component: Descriptions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de descripciones para mostrar información estructurada en pares clave-valor.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/descriptions)
- [🎨 API de Props](https://ant.design/components/descriptions#api)
- [💡 Ejemplos](https://ant.design/components/descriptions#examples)

## Cuándo usar

- Para mostrar información detallada de un objeto o entidad.
- Ideal para perfiles de usuario, detalles de productos o información de configuración.
        `,
      },
    },
  },
  argTypes: {
    bordered: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['default', 'middle', 'small'],
    },
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Descriptions>;

const items = [
  {
    key: '1',
    label: 'UserName',
    children: 'Zhou Maomao',
  },
  {
    key: '2',
    label: 'Telephone',
    children: '1810000000',
  },
  {
    key: '3',
    label: 'Live',
    children: 'Hangzhou, Zhejiang',
  },
  {
    key: '4',
    label: 'Remark',
    children: 'empty',
  },
  {
    key: '5',
    label: 'Address',
    children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
  },
];

export const Basic: Story = {
  args: {
    title: 'User Info',
    items,
  },
};

export const Bordered: Story = {
  args: {
    title: 'User Info',
    bordered: true,
    items,
  },
};

export const Sizes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Descriptions title="Small Size" size="small" items={items} />
      <Descriptions title="Default Size" size="default" items={items} />
      <Descriptions title="Middle Size" size="middle" items={items} />
    </Space>
  ),
};

export const Vertical: Story = {
  args: {
    title: 'User Info',
    layout: 'vertical',
    items,
  },
};

export const WithBadge: Story = {
  args: {
    title: 'User Info',
    items: [
      {
        key: '1',
        label: 'Product',
        children: 'Cloud Database',
      },
      {
        key: '2',
        label: 'Billing Mode',
        children: 'Prepaid',
      },
      {
        key: '3',
        label: 'Automatic Renewal',
        children: 'YES',
      },
      {
        key: '4',
        label: 'Order time',
        children: '2018-04-24 18:00:00',
      },
      {
        key: '5',
        label: 'Usage Time',
        children: '2019-04-24 18:00:00',
        span: 2,
      },
      {
        key: '6',
        label: 'Status',
        children: <Badge status="processing" text="Running" />,
        span: 3,
      },
    ],
  },
};
