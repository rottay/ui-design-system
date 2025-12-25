import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { Space, Avatar as AntAvatar } from 'antd';

const meta: Meta<typeof Avatar> = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de avatar para representar usuarios o entidades.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/avatar)
- [🎨 API de Props](https://ant.design/components/avatar#api)
- [💡 Ejemplos](https://ant.design/components/avatar#examples)

## Cuándo usar

- Para representar personas o entidades con imágenes, íconos o iniciales.
- Puede ser circular o cuadrado y de diferentes tamaños.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Basic: Story = {
  args: {
    children: 'U',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
  },
};

export const Sizes: Story = {
  render: () => (
    <Space size="middle">
      <Avatar size={32}>U</Avatar>
      <Avatar size={40}>U</Avatar>
      <Avatar size={64}>U</Avatar>
      <Avatar size={80}>U</Avatar>
    </Space>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Space size="middle">
      <Avatar shape="circle">U</Avatar>
      <Avatar shape="square">U</Avatar>
    </Space>
  ),
};

export const Group: Story = {
  render: () => (
    <AntAvatar.Group maxCount={3}>
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=3" />
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=4" />
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=5" />
    </AntAvatar.Group>
  ),
};
