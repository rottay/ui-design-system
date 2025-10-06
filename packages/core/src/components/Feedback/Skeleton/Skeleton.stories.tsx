import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { Space, Skeleton as AntSkeleton } from 'antd';

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de esqueleto para mostrar placeholder mientras se carga el contenido.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/skeleton)
- [🎨 API de Props](https://ant.design/components/skeleton#api)
- [💡 Ejemplos](https://ant.design/components/skeleton#examples)

## Cuándo usar

- Mientras el contenido se está cargando, se muestra un esqueleto para mejorar la experiencia del usuario.
- Soporta diferentes formas y tamaños para avatares, botones, inputs e imágenes.
        `,
      },
    },
  },
  argTypes: {
    active: { control: 'boolean' },
    loading: { control: 'boolean' },
    round: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  args: {},
};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const WithAvatar: Story = {
  args: {
    avatar: true,
    paragraph: { rows: 4 },
  },
};

export const Round: Story = {
  args: {
    avatar: true,
    round: true,
    paragraph: { rows: 4 },
  },
};

export const CustomRows: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 2 }} />
      <Skeleton active paragraph={{ rows: 4 }} />
    </Space>
  ),
};

export const SkeletonButton: Story = {
  render: () => (
    <Space>
      <AntSkeleton.Button active />
      <AntSkeleton.Button active size="small" />
      <AntSkeleton.Button active size="large" />
      <AntSkeleton.Button active shape="round" />
      <AntSkeleton.Button active shape="circle" />
    </Space>
  ),
};

export const SkeletonAvatar: Story = {
  render: () => (
    <Space>
      <AntSkeleton.Avatar active />
      <AntSkeleton.Avatar active size="small" />
      <AntSkeleton.Avatar active size="large" />
      <AntSkeleton.Avatar active shape="square" />
    </Space>
  ),
};

export const SkeletonInput: Story = {
  render: () => (
    <Space direction="vertical">
      <AntSkeleton.Input active />
      <AntSkeleton.Input active size="small" />
      <AntSkeleton.Input active size="large" />
    </Space>
  ),
};

export const SkeletonImage: Story = {
  render: () => (
    <Space>
      <AntSkeleton.Image />
      <AntSkeleton.Image style={{ width: 200, height: 200 }} />
    </Space>
  ),
};

export const WithContent: Story = {
  args: {
    loading: false,
    avatar: true,
    paragraph: { rows: 4 },
    children: (
      <div>
        <h4>Ant Design Title</h4>
        <p>
          Ant Design, a design language for background applications, is refined by Ant UED Team.
        </p>
      </div>
    ),
  },
};
