import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmModal } from './ConfirmModal';
import { Button, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const meta: Meta = {
  title: 'Feedback/Modal/ConfirmModal',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Modal especializado para confirmaciones importantes que requieren atención del usuario.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para acciones críticas que requieren confirmación explícita
- Cuando necesitas alertar al usuario de consecuencias importantes
- Para decisiones que no se pueden deshacer fácilmente
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Space>
      <Button
        onClick={() => {
          ConfirmModal.confirm({
            title: 'Do you want to delete these items?',
            content: 'When clicked the OK button, this dialog will be closed after 1 second',
            onOk() {
              return new Promise((resolve, reject) => {
                setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
              }).catch(() => console.log('Oops errors!'));
            },
            onCancel() {},
          });
        }}
      >
        Confirm
      </Button>
      <Button
        onClick={() => {
          ConfirmModal.info({
            title: 'This is a notification message',
            content: (
              <div>
                <p>Some messages...some messages...</p>
                <p>Some messages...some messages...</p>
              </div>
            ),
            onOk() {},
          });
        }}
      >
        Info
      </Button>
      <Button
        onClick={() => {
          ConfirmModal.success({
            title: 'This is a success message',
            content: 'Some messages...some messages...',
          });
        }}
      >
        Success
      </Button>
      <Button
        onClick={() => {
          ConfirmModal.error({
            title: 'This is an error message',
            content: 'Some messages...some messages...',
          });
        }}
      >
        Error
      </Button>
      <Button
        onClick={() => {
          ConfirmModal.warning({
            title: 'This is a warning message',
            content: 'Some messages...some messages...',
          });
        }}
      >
        Warning
      </Button>
    </Space>
  ),
};

export const WithCustomIcon: Story = {
  render: () => (
    <Button
      onClick={() => {
        ConfirmModal.confirm({
          title: 'Do you want to delete these items?',
          icon: <ExclamationCircleOutlined />,
          content: 'Some descriptions',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            console.log('OK');
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }}
    >
      Confirm with custom icon
    </Button>
  ),
};

export const AsyncConfirmation: Story = {
  render: () => (
    <Button
      onClick={() => {
        ConfirmModal.confirm({
          title: 'Do you want to delete these items?',
          content: 'When clicked the OK button, this dialog will be closed after 1 second',
          async onOk() {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('OK');
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }}
    >
      Async Confirmation
    </Button>
  ),
};

export const DestroyAll: Story = {
  render: () => {
    const countDown = () => {
      let secondsToGo = 5;
      const modal = ConfirmModal.success({
        title: 'This is a notification message',
        content: `This modal will be destroyed after ${secondsToGo} second.`,
      });

      const timer = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
          content: `This modal will be destroyed after ${secondsToGo} second.`,
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        modal.destroy();
      }, secondsToGo * 1000);
    };

    return (
      <Space>
        <Button onClick={countDown}>Open modal to close in 5s</Button>
        <Button onClick={ConfirmModal.destroyAll}>Destroy all</Button>
      </Space>
    );
  },
};

export const CustomFooter: Story = {
  render: () => (
    <Button
      onClick={() => {
        ConfirmModal.confirm({
          title: 'Confirm',
          content: 'Content with custom footer buttons',
          okText: 'Confirm',
          cancelText: 'Cancel',
          okButtonProps: {
            disabled: false,
          },
          cancelButtonProps: {
            disabled: false,
          },
        });
      }}
    >
      Custom Footer Buttons
    </Button>
  ),
};
