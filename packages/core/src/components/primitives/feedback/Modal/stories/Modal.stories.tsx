/**
 * Modal Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from '../';

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Feedback/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
    closable: {
      control: 'boolean',
    },
    centered: {
      control: 'boolean',
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalDemo = (props: any) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: () => (
    <ModalDemo title="Default Modal" size="md">
      <p>This is the modal content.</p>
      <p>You can put any content here.</p>
    </ModalDemo>
  ),
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)}>{s.toUpperCase()}</button>
          ))}
        </div>
        <Modal
          open={!!size}
          size={size || 'md'}
          title={`${size?.toUpperCase()} Modal`}
          onClose={() => setSize(null)}
        >
          <p>This is a {size} modal.</p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => (
    <ModalDemo
      title="Modal with Footer"
      okText="Confirm"
      cancelText="Cancel"
      onOk={() => alert('OK clicked')}
      onCancel={() => alert('Cancel clicked')}
    >
      <p>This modal has OK and Cancel buttons.</p>
    </ModalDemo>
  ),
};

export const CustomFooter: Story = {
  render: () => (
    <ModalDemo
      title="Custom Footer"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button>Custom Action 1</button>
          <button>Custom Action 2</button>
          <button style={{ backgroundColor: '#1890ff', color: 'white' }}>
            Custom Primary
          </button>
        </div>
      }
    >
      <p>This modal has a custom footer.</p>
    </ModalDemo>
  ),
};

export const NoFooter: Story = {
  render: () => (
    <ModalDemo title="No Footer" hideFooter>
      <p>This modal has no footer.</p>
      <p>Useful for simple informational dialogs.</p>
    </ModalDemo>
  ),
};

export const NotClosable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          title="Not Closable"
          closable={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footer={<button onClick={() => setOpen(false)}>Close via Button</button>}
        >
          <p>This modal can only be closed via the button below.</p>
        </Modal>
      </>
    );
  },
};

export const ConfirmLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          title="Async Operation"
          confirmLoading={loading}
          onOk={handleOk}
          onClose={() => setOpen(false)}
        >
          <p>Click OK to simulate an async operation.</p>
        </Modal>
      </>
    );
  },
};

export const EngineComparison: Story = {
  render: () => {
    const [engine, setEngine] = useState<'titan' | 'hermes' | 'apollo' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['titan', 'hermes', 'apollo'] as const).map((e) => (
            <button key={e} onClick={() => setEngine(e)} style={{ textTransform: 'capitalize' }}>
              {e}
            </button>
          ))}
        </div>
        <Modal
          open={!!engine}
          engine={engine || 'titan'}
          title={`${engine} Engine Modal`}
          onClose={() => setEngine(null)}
        >
          <p>This modal uses the {engine} engine.</p>
        </Modal>
      </>
    );
  },
};
