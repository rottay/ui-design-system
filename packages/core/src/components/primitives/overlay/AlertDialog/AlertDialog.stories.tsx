/**
 * AlertDialog Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog } from './';
import { DesignSystemProvider } from '../../../../core/providers/root';

const meta: Meta<typeof AlertDialog> = {
  title: 'Primitives/Overlay/AlertDialog',
  component: AlertDialog,
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
A confirmation dialog with destructive action emphasis using an action slot pattern.

Unlike ConfirmDialog which uses onConfirm/onCancel callbacks, AlertDialog accepts
an \`action\` ReactNode giving the consumer full control over the primary action button.

By default, clicking the backdrop does NOT close the dialog.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|---------|--------|--------|
| Modal | Ant Design Modal | DaisyUI modal | Pure CSS |
| Action Slot | ReactNode | ReactNode | ReactNode |
| Backdrop Close | Disabled by default | Disabled by default | Disabled by default |
`,
      },
    },
  },
  argTypes: {
    cancelLabel: { control: 'text' },
    closeOnBackdropClick: { control: 'boolean' },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

const DangerButton = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      borderRadius: '6px',
      backgroundColor: '#ff4d4f',
      color: '#fff',
      border: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      fontSize: '14px',
    }}
  >
    {children}
  </button>
);

const AlertDialogDemo = (props: Partial<React.ComponentProps<typeof AlertDialog>>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d9d9d9', cursor: 'pointer' }}>
        Open Alert Dialog
      </button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Account"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        action={<DangerButton onClick={() => setOpen(false)}>Delete Account</DangerButton>}
        {...props}
      />
    </>
  );
};

export const Default: Story = {
  render: () => <AlertDialogDemo />,
};

export const CustomLabels: Story = {
  render: () => (
    <AlertDialogDemo
      title="Remove Member"
      description="Are you sure you want to remove this member from the team?"
      cancelLabel="Keep Member"
      action={
        <DangerButton>Remove Member</DangerButton>
      }
    />
  ),
};

export const WithBackdropClose: Story = {
  render: () => (
    <AlertDialogDemo
      closeOnBackdropClick
      title="Discard Changes"
      description="You have unsaved changes. Are you sure you want to discard them?"
      action={<DangerButton>Discard</DangerButton>}
    />
  ),
};
