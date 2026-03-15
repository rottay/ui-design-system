/**
 * ConfirmDialog Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './ConfirmDialog';
import { DesignSystemProvider } from '../../../../bootstrap';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Primitives/Overlay/ConfirmDialog',
  component: ConfirmDialog,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
An "Are you sure?" confirmation dialog pattern with variant support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|---------|--------|--------|
| Modal | Ant Design Modal | DaisyUI modal | Pure CSS |
| Buttons | AntButton | DaisyUI btn | Inline styled |
| Animation | Ant transition | CSS | None |
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'danger'],
    },
    loading: { control: 'boolean' },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

const ConfirmDialogDemo = (props: Partial<React.ComponentProps<typeof ConfirmDialog>>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d9d9d9', cursor: 'pointer' }}>
        Open Dialog
      </button>
      <ConfirmDialog
        open={open}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action?"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        {...props}
      />
    </>
  );
};

export const Default: Story = {
  render: () => <ConfirmDialogDemo />,
};

export const InfoVariant: Story = {
  render: () => (
    <ConfirmDialogDemo
      variant="info"
      title="Save Changes"
      description="Do you want to save changes before leaving?"
      confirmLabel="Save"
    />
  ),
};

export const WarningVariant: Story = {
  render: () => (
    <ConfirmDialogDemo
      variant="warning"
      title="Unsaved Changes"
      description="You have unsaved changes that will be lost."
      confirmLabel="Discard"
    />
  ),
};

export const DangerVariant: Story = {
  render: () => (
    <ConfirmDialogDemo
      variant="danger"
      title="Delete Item"
      description="This action cannot be undone. All data will be permanently deleted."
      confirmLabel="Delete"
    />
  ),
};

export const WithLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d9d9d9', cursor: 'pointer' }}>
          Open Dialog
        </button>
        <ConfirmDialog
          open={open}
          title="Processing..."
          description="Please wait while we process your request."
          loading={loading}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => { setLoading(false); setOpen(false); }, 2000);
          }}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};
