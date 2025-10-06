import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';
import { Space } from 'antd';

const meta: Meta<typeof Progress> = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de progreso para mostrar el estado actual de una operación.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/progress)
- [🎨 API de Props](https://ant.design/components/progress#api)
- [💡 Ejemplos](https://ant.design/components/progress#examples)

## Cuándo usar

- Para mostrar el progreso de operaciones o tareas de larga duración.
- Disponible en formatos de línea, círculo y dashboard.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Line: Story = {
  args: {
    percent: 50,
  },
};

export const LineStates: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Progress percent={30} />
      <Progress percent={50} status="active" />
      <Progress percent={70} status="exception" />
      <Progress percent={100} />
    </Space>
  ),
};

export const Circle: Story = {
  args: {
    type: 'circle',
    percent: 75,
  },
};

export const CircleSizes: Story = {
  render: () => (
    <Space size="large">
      <Progress type="circle" percent={75} width={80} />
      <Progress type="circle" percent={100} width={100} />
      <Progress type="circle" percent={50} width={120} status="exception" />
    </Space>
  ),
};

export const Dashboard: Story = {
  args: {
    type: 'dashboard',
    percent: 75,
  },
};
