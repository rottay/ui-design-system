import type { Meta, StoryObj } from '@storybook/react';
import { Message } from './Message';
import { Space, Button } from 'antd';

const meta: Meta<typeof Message> = {
  title: 'Feedback/Message',
  component: Message as any,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para mostrar mensajes de retroalimentación globales.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/message)
- [🎨 API de Props](https://ant.design/components/message#api)
- [💡 Ejemplos](https://ant.design/components/message#examples)

## Cuándo usar

- Para mostrar retroalimentación ligera sobre operaciones del usuario.
- Mensajes flotantes que desaparecen automáticamente después de un tiempo.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Message>;

export const Basic: Story = {
  render: () => (
    <Space>
      <Button onClick={() => Message.info('This is a normal message')}>
        Display normal message
      </Button>
    </Space>
  ),
};

export const Types: Story = {
  render: () => (
    <Space>
      <Button onClick={() => Message.success('This is a success message')}>
        Success
      </Button>
      <Button onClick={() => Message.error('This is an error message')}>
        Error
      </Button>
      <Button onClick={() => Message.warning('This is a warning message')}>
        Warning
      </Button>
      <Button onClick={() => Message.info('This is an info message')}>
        Info
      </Button>
      <Button onClick={() => Message.loading('Action in progress..', 2.5)}>
        Loading
      </Button>
    </Space>
  ),
};

export const Duration: Story = {
  render: () => (
    <Space>
      <Button onClick={() => Message.success('This is a prompt message for success, and it will disappear in 10 seconds', 10)}>
        Customized display duration
      </Button>
    </Space>
  ),
};

export const WithPromise: Story = {
  render: () => (
    <Space>
      <Button
        onClick={() => {
          Message.loading('Action in progress..', 2.5)
            .then(() => Message.success('Loading finished', 2.5))
            .then(() => Message.info('Loading finished is finished', 2.5));
        }}
      >
        Display sequential messages
      </Button>
    </Space>
  ),
};

export const UpdateMessage: Story = {
  render: () => {
    const key = 'updatable';

    return (
      <Space>
        <Button
          onClick={() => {
            Message.loading({ content: 'Loading...', key });
            setTimeout(() => {
              Message.success({ content: 'Loaded!', key, duration: 2 });
            }, 1000);
          }}
        >
          Open the message box
        </Button>
      </Space>
    );
  },
};
