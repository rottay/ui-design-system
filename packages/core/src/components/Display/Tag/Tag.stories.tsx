import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';
import { Space } from 'antd';

const meta: Meta<typeof Tag> = {
  title: 'Display/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de etiqueta para categorización y marcado de elementos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tag)
- [🎨 API de Props](https://ant.design/components/tag#api)
- [💡 Ejemplos](https://ant.design/components/tag#examples)

## Cuándo usar

- Para categorizar o etiquetar elementos.
- Para mostrar atributos, estados o propiedades de elementos.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Basic: Story = {
  args: {
    children: 'Tag',
  },
};

export const Colors: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="success">Success</Tag>
      <Tag color="processing">Processing</Tag>
      <Tag color="error">Error</Tag>
      <Tag color="warning">Warning</Tag>
      <Tag color="default">Default</Tag>
    </Space>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="#1DB954">Spotify Green</Tag>
      <Tag color="#f50">Red</Tag>
      <Tag color="#2db7f5">Blue</Tag>
      <Tag color="#87d068">Green</Tag>
      <Tag color="#108ee9">Cyan</Tag>
    </Space>
  ),
};

export const Closable: Story = {
  render: () => (
    <Space size="small">
      <Tag closable onClose={() => console.log('Closed')}>
        Closable Tag
      </Tag>
      <Tag closable color="success" onClose={() => console.log('Closed')}>
        Success
      </Tag>
    </Space>
  ),
};
