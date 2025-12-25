import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button, Space, Modal as AntModal } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Feedback/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente modal para mostrar contenido en una capa flotante sobre la página.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/modal)
- [🎨 API de Props](https://ant.design/components/modal#api)
- [💡 Ejemplos](https://ant.design/components/modal#examples)

## Cuándo usar

- Para mostrar información importante que requiere atención inmediata del usuario.
- Para confirmaciones, formularios o contenido que necesita el foco completo del usuario.
        `,
      },
    },
  },
  argTypes: {
    centered: { control: 'boolean' },
    closable: { control: 'boolean' },
    maskClosable: { control: 'boolean' },
    width: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
        <Modal
          title="Basic Modal"
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
};

export const Centered: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Centered Modal
        </Button>
        <Modal
          title="Centered Modal"
          centered
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
};

export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Modal with custom footer
        </Button>
        <Modal
          title="Modal with custom footer"
          open={open}
          onCancel={() => setOpen(false)}
          footer={[
            <Button key="back" onClick={() => setOpen(false)}>
              Return
            </Button>,
            <Button key="submit" type="primary" onClick={() => setOpen(false)}>
              Submit
            </Button>,
          ]}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
};

export const NoFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Modal without footer
        </Button>
        <Modal
          title="Modal without footer"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
};

export const ConfirmModal: Story = {
  render: () => (
    <Space>
      <Button
        onClick={() => {
          AntModal.confirm({
            title: 'Do you want to delete these items?',
            content: 'Some descriptions',
            onOk() {
              console.log('OK');
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        }}
      >
        Confirm
      </Button>
      <Button
        onClick={() => {
          AntModal.success({
            title: 'This is a success message',
            content: 'Some descriptions',
          });
        }}
      >
        Success
      </Button>
      <Button
        onClick={() => {
          AntModal.error({
            title: 'This is an error message',
            content: 'Some descriptions',
          });
        }}
      >
        Error
      </Button>
      <Button
        onClick={() => {
          AntModal.warning({
            title: 'This is a warning message',
            content: 'Some descriptions',
          });
        }}
      >
        Warning
      </Button>
      <Button
        onClick={() => {
          AntModal.info({
            title: 'This is an info message',
            content: 'Some descriptions',
          });
        }}
      >
        Info
      </Button>
    </Space>
  ),
};

export const AsyncClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = () => {
      setOpen(true);
    };

    const handleOk = () => {
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    };

    const handleCancel = () => {
      setOpen(false);
    };

    return (
      <>
        <Button type="primary" onClick={showModal}>
          Open Modal with async logic
        </Button>
        <Modal
          title="Title"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <p>Some contents...</p>
        </Modal>
      </>
    );
  },
};
