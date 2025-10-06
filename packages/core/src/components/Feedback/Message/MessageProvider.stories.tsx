import type { Meta, StoryObj } from '@storybook/react';
import { MessageProvider, useMessage } from './MessageProvider';
import { Button, Space, App } from 'antd';

const meta: Meta<typeof MessageProvider> = {
  title: 'Feedback/Message/MessageProvider',
  component: MessageProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Proveedor de contexto para mensajes globales con configuración personalizada.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/message)
- [🎨 API de Props](https://ant.design/components/message#api)
- [💡 Ejemplos](https://ant.design/components/message#examples)

## Cuándo usar

- Para configurar el comportamiento de mensajes a nivel de aplicación
- Cuando necesitas personalizar la duración o posición de todos los mensajes
- Para proveer configuración global a componentes Message
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <App>
        <Story />
      </App>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageProvider>;

const MessageDemo = () => {
  const message = useMessage();

  const showSuccess = () => {
    message.success('This is a success message');
  };

  const showError = () => {
    message.error('This is an error message');
  };

  const showWarning = () => {
    message.warning('This is a warning message');
  };

  const showInfo = () => {
    message.info('This is an info message');
  };

  const showLoading = () => {
    message.loading('This is a loading message', 2.5);
  };

  return (
    <Space>
      <Button onClick={showSuccess}>Success</Button>
      <Button onClick={showError}>Error</Button>
      <Button onClick={showWarning}>Warning</Button>
      <Button onClick={showInfo}>Info</Button>
      <Button onClick={showLoading}>Loading</Button>
    </Space>
  );
};

export const Basic: Story = {
  render: () => (
    <MessageProvider>
      <MessageDemo />
    </MessageProvider>
  ),
};

const CustomDurationDemo = () => {
  const message = useMessage();

  const showCustomDuration = () => {
    message.success('This message will last for 10 seconds', 10);
  };

  return <Button onClick={showCustomDuration}>Custom Duration (10s)</Button>;
};

export const CustomDuration: Story = {
  render: () => (
    <MessageProvider>
      <CustomDurationDemo />
    </MessageProvider>
  ),
};

const PromiseDemo = () => {
  const message = useMessage();

  const showPromise = () => {
    message
      .open({
        type: 'loading',
        content: 'Action in progress..',
        duration: 2.5,
      })
      .then(() => message.success('Loading finished', 2.5))
      .then(() => message.info('Closing the message', 2.5));
  };

  return <Button onClick={showPromise}>Display sequential messages</Button>;
};

export const PromiseInterface: Story = {
  render: () => (
    <MessageProvider>
      <PromiseDemo />
    </MessageProvider>
  ),
};

const UpdateDemo = () => {
  const message = useMessage();

  const showUpdate = () => {
    const key = 'updatable';
    message.open({
      key,
      type: 'loading',
      content: 'Loading...',
    });
    setTimeout(() => {
      message.open({
        key,
        type: 'success',
        content: 'Loaded!',
        duration: 2,
      });
    }, 2000);
  };

  return <Button onClick={showUpdate}>Open updatable message</Button>;
};

export const UpdateMessage: Story = {
  render: () => (
    <MessageProvider>
      <UpdateDemo />
    </MessageProvider>
  ),
};
