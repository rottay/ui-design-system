import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Space } from 'antd';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de alerta para mostrar mensajes importantes al usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/alert)
- [🎨 API de Props](https://ant.design/components/alert#api)
- [💡 Ejemplos](https://ant.design/components/alert#examples)

## Cuándo usar

- Cuando necesites mostrar un mensaje de advertencia que requiere atención del usuario.
- Los mensajes pueden ser de tipo success, info, warning o error.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Success: Story = {
  args: {
    message: 'Success',
    description: 'This is a success alert message',
    type: 'success',
  },
};

export const Info: Story = {
  args: {
    message: 'Info',
    description: 'This is an info alert message',
    type: 'info',
  },
};

export const Warning: Story = {
  args: {
    message: 'Warning',
    description: 'This is a warning alert message',
    type: 'warning',
  },
};

export const Error: Story = {
  args: {
    message: 'Error',
    description: 'This is an error alert message',
    type: 'error',
  },
};

export const AllTypes: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert message="Success Alert" type="success" />
      <Alert message="Info Alert" type="info" />
      <Alert message="Warning Alert" type="warning" />
      <Alert message="Error Alert" type="error" />
    </Space>
  ),
};

export const Closable: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert message="Success Alert" type="success" closable />
      <Alert message="Warning Alert" type="warning" closable />
    </Space>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message="Success"
        description="This is a detailed success description with more information."
        type="success"
        showIcon
      />
      <Alert
        message="Error"
        description="This is a detailed error description with more information."
        type="error"
        showIcon
      />
    </Space>
  ),
};
