/**
 * Message Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MessageProvider, useMessage } from '../';

const meta: Meta = {
  title: 'Primitives/Feedback/Message',
  decorators: [
    (Story) => (
      <MessageProvider>
        <Story />
      </MessageProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const MessageDemo = () => {
  const message = useMessage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={() => message.success('Operation successful!')}>
        Success
      </button>
      <button onClick={() => message.error('Something went wrong')}>
        Error
      </button>
      <button onClick={() => message.warning('Please be careful')}>
        Warning
      </button>
      <button onClick={() => message.info('Here is some information')}>
        Info
      </button>
      <button onClick={() => message.loading('Loading...')}>
        Loading
      </button>
    </div>
  );
};

export const Default: Story = {
  render: () => <MessageDemo />,
};

export const Types: Story = {
  render: () => {
    const message = useMessage();
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['success', 'error', 'warning', 'info', 'loading'] as const).map((type) => (
          <button
            key={type}
            onClick={() => message[type](`This is a ${type} message`)}
            style={{ textTransform: 'capitalize' }}
          >
            {type}
          </button>
        ))}
      </div>
    );
  },
};

export const CustomDuration: Story = {
  render: () => {
    const message = useMessage();
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => message.info({ content: '1 second', duration: 1 })}>
          1s
        </button>
        <button onClick={() => message.info({ content: '5 seconds', duration: 5 })}>
          5s
        </button>
        <button onClick={() => message.info({ content: 'No auto close', duration: 0 })}>
          Persistent
        </button>
      </div>
    );
  },
};

export const UpdateMessage: Story = {
  render: () => {
    const message = useMessage();

    const handleClick = () => {
      message.loading({ content: 'Loading...', key: 'updatable', duration: 0 });

      setTimeout(() => {
        message.success({ content: 'Loaded!', key: 'updatable', duration: 2 });
      }, 2000);
    };

    return <button onClick={handleClick}>Show Loading → Success</button>;
  },
};

export const DestroyAll: Story = {
  render: () => {
    const message = useMessage();

    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            message.success({ content: 'Message 1', duration: 0 });
            message.info({ content: 'Message 2', duration: 0 });
            message.warning({ content: 'Message 3', duration: 0 });
          }}
        >
          Show Multiple
        </button>
        <button onClick={() => message.destroy()}>Destroy All</button>
      </div>
    );
  },
};

export const WithCallback: Story = {
  render: () => {
    const message = useMessage();

    return (
      <button
        onClick={() => {
          message.success({
            content: 'Message with callback',
            onClose: () => alert('Message closed!'),
          });
        }}
      >
        Show with Callback
      </button>
    );
  },
};
