import type { Meta, StoryObj } from '@storybook/react';
import { Notification } from './Notification';
import { Button, Space } from 'antd';

const meta: Meta<typeof Notification> = {
  title: 'Feedback/Notification',
  component: Notification as any,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para mostrar notificaciones globales.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/notification)
- [🎨 API de Props](https://ant.design/components/notification#api)
- [💡 Ejemplos](https://ant.design/components/notification#examples)

## Cuándo usar

- Para mostrar notificaciones con más información y contexto que un Message.
- Soporta diferentes posiciones, duraciones y botones de acción.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Notification>;

export const Basic: Story = {
  render: () => (
    <Space>
      <Button
        type="primary"
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description:
              'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
          });
        }}
      >
        Open the notification box
      </Button>
    </Space>
  ),
};

export const Types: Story = {
  render: () => (
    <Space>
      <Button
        onClick={() => {
          Notification.success({
            message: 'Success Notification',
            description:
              'This is the content of the success notification.',
          });
        }}
      >
        Success
      </Button>
      <Button
        onClick={() => {
          Notification.error({
            message: 'Error Notification',
            description:
              'This is the content of the error notification.',
          });
        }}
      >
        Error
      </Button>
      <Button
        onClick={() => {
          Notification.warning({
            message: 'Warning Notification',
            description:
              'This is the content of the warning notification.',
          });
        }}
      >
        Warning
      </Button>
      <Button
        onClick={() => {
          Notification.info({
            message: 'Info Notification',
            description:
              'This is the content of the info notification.',
          });
        }}
      >
        Info
      </Button>
    </Space>
  ),
};

export const Placement: Story = {
  render: () => (
    <Space wrap>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'topLeft',
          });
        }}
      >
        topLeft
      </Button>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'top',
          });
        }}
      >
        top
      </Button>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'topRight',
          });
        }}
      >
        topRight
      </Button>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'bottomLeft',
          });
        }}
      >
        bottomLeft
      </Button>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'bottom',
          });
        }}
      >
        bottom
      </Button>
      <Button
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description: 'This is the content of the notification.',
            placement: 'bottomRight',
          });
        }}
      >
        bottomRight
      </Button>
    </Space>
  ),
};

export const Duration: Story = {
  render: () => (
    <Space>
      <Button
        type="primary"
        onClick={() => {
          Notification.open({
            message: 'Notification Title',
            description:
              'This notification will not auto-close.',
            duration: 0,
          });
        }}
      >
        Open the notification (never auto-close)
      </Button>
    </Space>
  ),
};

export const WithAction: Story = {
  render: () => {
    const key = `open${Date.now()}`;

    return (
      <Space>
        <Button
          type="primary"
          onClick={() => {
            Notification.open({
              message: 'Notification Title',
              description:
                'A function will be called after the notification is closed (automatically after the "duration" time of manually).',
              btn: (
                <Button type="primary" size="small" onClick={() => Notification.destroy(key)}>
                  Confirm
                </Button>
              ),
              key,
            });
          }}
        >
          Open the notification with action
        </Button>
      </Space>
    );
  },
};
