import type { Meta, StoryObj } from '@storybook/react';
import { Spin } from './Spin';
import { Space, Alert } from 'antd';

const meta: Meta<typeof Spin> = {
  title: 'Feedback/Spin',
  component: Spin,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de carga para mostrar el estado de carga de una página o sección.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/spin)
- [🎨 API de Props](https://ant.design/components/spin#api)
- [💡 Ejemplos](https://ant.design/components/spin#examples)

## Cuándo usar

- Para indicar que una operación está en progreso.
- Puede envolver contenido o mostrarse de forma independiente.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    spinning: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Spin>;

export const Basic: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <Space size="large">
      <Spin size="small" />
      <Spin />
      <Spin size="large" />
    </Space>
  ),
};

export const WithContainer: Story = {
  render: () => (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Spin>
        <Alert
          message="Alert message title"
          description="Further details about the context of this alert."
          type="info"
        />
      </Spin>
    </div>
  ),
};

export const WithTip: Story = {
  render: () => (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Spin tip="Loading...">
        <Alert
          message="Alert message title"
          description="Further details about the context of this alert."
          type="info"
        />
      </Spin>
    </div>
  ),
};

export const Embedded: Story = {
  render: () => (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Spin spinning={true}>
        <Alert
          message="Alert message title"
          description="Further details about the context of this alert."
          type="info"
        />
      </Spin>
    </div>
  ),
};

export const Delay: Story = {
  render: () => (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Spin spinning={true} delay={500}>
        <Alert
          message="Alert message title"
          description="Further details about the context of this alert."
          type="info"
        />
      </Spin>
    </div>
  ),
};

export const FullScreen: Story = {
  render: () => (
    <div style={{ height: 400, position: 'relative' }}>
      <Spin spinning={true} fullscreen />
      <div style={{ padding: 50 }}>
        <p>Some content here...</p>
        <p>Some content here...</p>
        <p>Some content here...</p>
      </div>
    </div>
  ),
};
