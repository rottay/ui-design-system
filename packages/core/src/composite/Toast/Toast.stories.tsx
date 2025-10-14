import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button, Flex, Space, Divider } from 'antd';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import { ThemeProvider } from '../../providers/ThemeProvider';

const meta: Meta<typeof ToastProvider> = {
  title: 'Composite/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTemplate="spotify">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

// Demo component to showcase toast functionality
const ToastDemo: React.FC = () => {
  const toast = useToast();

  return (
    <div style={{ padding: 40, minWidth: 600 }}>
      <h2 style={{ marginBottom: 24 }}>Toast System Demo</h2>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Basic Toasts */}
        <div>
          <h3>Basic Toasts</h3>
          <Flex gap={8} wrap="wrap">
            <Button type="primary" onClick={() => toast.success('Success!')}>
              Success Toast
            </Button>
            <Button danger onClick={() => toast.error('Error occurred!')}>
              Error Toast
            </Button>
            <Button onClick={() => toast.warning('Warning message')}>
              Warning Toast
            </Button>
            <Button onClick={() => toast.info('Information')}>
              Info Toast
            </Button>
            <Button onClick={() => toast.loading('Loading...')}>
              Loading Toast
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* With Descriptions */}
        <div>
          <h3>With Descriptions</h3>
          <Flex gap={8} wrap="wrap">
            <Button
              type="primary"
              onClick={() =>
                toast.success('File uploaded', {
                  description: 'Your file has been successfully uploaded to the server.',
                })
              }
            >
              Success + Description
            </Button>
            <Button
              danger
              onClick={() =>
                toast.error('Upload failed', {
                  description: 'Failed to upload file. Please check your connection and try again.',
                })
              }
            >
              Error + Description
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* With Actions */}
        <div>
          <h3>With Actions</h3>
          <Flex gap={8} wrap="wrap">
            <Button
              onClick={() =>
                toast.info('Message deleted', {
                  description: 'The message has been moved to trash.',
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      toast.success('Message restored!');
                    },
                  },
                })
              }
            >
              Toast with Undo
            </Button>
            <Button
              onClick={() =>
                toast.warning('Connection unstable', {
                  action: {
                    label: 'Retry',
                    onClick: () => {
                      toast.loading('Reconnecting...');
                    },
                  },
                })
              }
            >
              Toast with Retry
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* Different Durations */}
        <div>
          <h3>Different Durations</h3>
          <Flex gap={8} wrap="wrap">
            <Button onClick={() => toast.info('Quick message', { duration: 2000 })}>
              2 seconds
            </Button>
            <Button onClick={() => toast.info('Normal message', { duration: 5000 })}>
              5 seconds (default)
            </Button>
            <Button onClick={() => toast.info('Long message', { duration: 10000 })}>
              10 seconds
            </Button>
            <Button
              onClick={() => {
                const id = toast.loading('Processing...', { duration: 0 });
                setTimeout(() => {
                  toast.dismiss(id);
                  toast.success('Done!');
                }, 3000);
              }}
            >
              Manual Dismiss (Loading)
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* Different Positions */}
        <div>
          <h3>Different Positions</h3>
          <Flex gap={8} wrap="wrap">
            <Button onClick={() => toast.info('Top Left', { position: 'top-left' })}>
              Top Left
            </Button>
            <Button onClick={() => toast.info('Top Center', { position: 'top-center' })}>
              Top Center
            </Button>
            <Button onClick={() => toast.info('Top Right', { position: 'top-right' })}>
              Top Right
            </Button>
            <Button onClick={() => toast.info('Bottom Left', { position: 'bottom-left' })}>
              Bottom Left
            </Button>
            <Button onClick={() => toast.info('Bottom Center', { position: 'bottom-center' })}>
              Bottom Center
            </Button>
            <Button onClick={() => toast.info('Bottom Right', { position: 'bottom-right' })}>
              Bottom Right
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* Multiple Toasts */}
        <div>
          <h3>Multiple Toasts</h3>
          <Flex gap={8} wrap="wrap">
            <Button
              onClick={() => {
                toast.success('First toast');
                setTimeout(() => toast.info('Second toast'), 200);
                setTimeout(() => toast.warning('Third toast'), 400);
                setTimeout(() => toast.error('Fourth toast'), 600);
              }}
            >
              Show Multiple (Stacked)
            </Button>
            <Button danger onClick={() => toast.dismissAll()}>
              Dismiss All
            </Button>
          </Flex>
        </div>

        <Divider />

        {/* Complex Example */}
        <div>
          <h3>Complex Example</h3>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              const loadingId = toast.loading('Uploading file...', {
                description: 'Please wait while we process your file.',
                duration: 0,
              });

              setTimeout(() => {
                toast.dismiss(loadingId);
                toast.success('Upload complete!', {
                  description: 'Your file has been successfully uploaded and processed.',
                  duration: 8000,
                  action: {
                    label: 'View File',
                    onClick: () => {
                      toast.info('Opening file...');
                    },
                  },
                });
              }, 3000);
            }}
          >
            Simulate Upload Process
          </Button>
        </div>
      </Space>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const SpotifyTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTemplate="spotify">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const StripeTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTemplate="stripe">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const NotionTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTemplate="notion">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const LinearTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTemplate="linear">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const TopLeft: Story = {
  render: () => (
    <ToastProvider defaultPosition="top-left">
      <div style={{ padding: 40 }}>
        <Button
          onClick={() => {
            const toast = useToast();
            toast.success('Top Left Toast');
          }}
        >
          This won't work - use the Default story
        </Button>
        <p>Note: Position should be set per-toast using the position option</p>
      </div>
    </ToastProvider>
  ),
};

export const WithMaxToasts: Story = {
  render: () => (
    <ToastProvider maxToasts={3}>
      <div style={{ padding: 40 }}>
        <Space>
          <Button
            onClick={() => {
              const toast = useToast();
              for (let i = 1; i <= 5; i++) {
                setTimeout(() => {
                  toast.info(`Toast ${i}`, {
                    description: `Only 3 toasts will be shown at once`,
                  });
                }, i * 300);
              }
            }}
          >
            Show 5 Toasts (Max 3)
          </Button>
        </Space>
      </div>
    </ToastProvider>
  ),
};
