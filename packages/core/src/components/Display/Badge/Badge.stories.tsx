import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Avatar } from '../Avatar';
import { Space } from 'antd';

const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de insignia para mostrar un pequeño recuento o estado.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/badge)
- [🎨 API de Props](https://ant.design/components/badge#api)
- [💡 Ejemplos](https://ant.design/components/badge#examples)

## Cuándo usar

- Se usa para llamar la atención sobre elementos no leídos, notificaciones o mensajes importantes.
- Puede mostrar conteos numéricos o estados mediante puntos de colores.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Basic: Story = {
  args: {
    count: 5,
    children: <Avatar shape="square" size={40}>U</Avatar>,
  },
};

export const Standalone: Story = {
  render: () => (
    <Space size="middle">
      <Badge count={5} />
      <Badge count={0} showZero />
      <Badge count={99} />
      <Badge count={100} />
      <Badge count={99} overflowCount={10} />
    </Space>
  ),
};

export const Status: Story = {
  render: () => (
    <Space size="middle" direction="vertical">
      <Badge status="success" text="Success" />
      <Badge status="error" text="Error" />
      <Badge status="default" text="Default" />
      <Badge status="processing" text="Processing" />
      <Badge status="warning" text="Warning" />
    </Space>
  ),
};

export const Dot: Story = {
  render: () => (
    <Space size="middle">
      <Badge dot>
        <Avatar shape="square" size={40}>U</Avatar>
      </Badge>
      <Badge dot status="processing">
        <Avatar shape="square" size={40}>U</Avatar>
      </Badge>
    </Space>
  ),
};
