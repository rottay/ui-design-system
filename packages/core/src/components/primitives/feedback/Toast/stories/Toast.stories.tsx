/**
 * Toast Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from '../';

const meta: Meta = {
  title: 'Primitives/Feedback/Toast',
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ToastDemo = () => {
  const toast = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => toast.success('Operation successful!')}>
        Success Toast
      </button>
      <button onClick={() => toast.error('Something went wrong')}>
        Error Toast
      </button>
      <button onClick={() => toast.warning('Please be careful')}>
        Warning Toast
      </button>
      <button onClick={() => toast.info('Here is some information')}>
        Info Toast
      </button>
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastDemo />,
};

export const Variants: Story = {
  render: () => {
    const toast = useToast();
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(['default', 'success', 'error', 'warning', 'info', 'primary', 'secondary'] as const).map(
          (variant) => (
            <button
              key={variant}
              onClick={() =>
                toast.show({
                  title: `${variant} toast`,
                  variant,
                })
              }
            >
              {variant}
            </button>
          )
        )}
      </div>
    );
  },
};

export const WithTitleAndDescription: Story = {
  render: () => {
    const toast = useToast();
    return (
      <button
        onClick={() =>
          toast.success({
            title: 'Success!',
            description: 'Your changes have been saved successfully.',
          })
        }
      >
        Show Toast with Description
      </button>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const toast = useToast();
    return (
      <button
        onClick={() =>
          toast.show({
            title: 'File deleted',
            description: 'The file has been permanently deleted.',
            action: {
              label: 'Undo',
              onClick: () => alert('Undo clicked!'),
            },
          })
        }
      >
        Toast with Action
      </button>
    );
  },
};

export const Positions: Story = {
  render: () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          'top-left',
          'top-center',
          'top-right',
          'bottom-left',
          'bottom-center',
          'bottom-right',
        ].map((position) => (
          <ToastProvider key={position} position={position as any}>
            <PositionButton position={position} />
          </ToastProvider>
        ))}
      </div>
    );
  },
};

const PositionButton = ({ position }: { position: string }) => {
  const toast = useToast();
  return (
    <button onClick={() => toast.info(`Toast at ${position}`)}>
      {position}
    </button>
  );
};

export const CustomDuration: Story = {
  render: () => {
    const toast = useToast();
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => toast.info({ title: '1 second', duration: 1000 })}>
          1s
        </button>
        <button onClick={() => toast.info({ title: '3 seconds', duration: 3000 })}>
          3s
        </button>
        <button onClick={() => toast.info({ title: 'No auto dismiss', duration: 0 })}>
          Persistent
        </button>
      </div>
    );
  },
};

export const ProgrammaticDismiss: Story = {
  render: () => {
    const toast = useToast();
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            const id = toast.success({ title: 'Click dismiss to close', duration: 0 });
            setTimeout(() => {
              if (confirm('Dismiss the toast?')) {
                toast.dismiss(id);
              }
            }, 500);
          }}
        >
          Show & Dismiss
        </button>
        <button onClick={() => toast.dismissAll()}>Dismiss All</button>
      </div>
    );
  },
};

export const MultipleToasts: Story = {
  render: () => {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          toast.success('First toast');
          setTimeout(() => toast.info('Second toast'), 200);
          setTimeout(() => toast.warning('Third toast'), 400);
          setTimeout(() => toast.error('Fourth toast'), 600);
        }}
      >
        Show Multiple Toasts
      </button>
    );
  },
};
