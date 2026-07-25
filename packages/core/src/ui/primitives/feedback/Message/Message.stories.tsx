/**
 * Message Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MessageProvider, useMessage } from './';

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

// ============================================================================
// Modern Engine Craft Stories
// ============================================================================

/**
 * Modern lifecycle: items enter on the skin's calm entrance, announce through
 * the stack's polite log live region, and exit with a short fade/slide before
 * removal -- including the async loading → success key-update pattern.
 */
export const ModernLifecycle: Story = {
  name: '🔁 Modern Lifecycle',
  render: () => {
    const message = useMessage();

    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            message.loading({ content: 'Uploading evidence package…', key: 'lc-upload', duration: 0 });
            setTimeout(() => {
              message.success({ content: 'Evidence package uploaded and queued for review.', key: 'lc-upload', duration: 4 });
            }, 1800);
          }}
        >
          Loading → Success (same key)
        </button>
        <button
          onClick={() =>
            message.warning({
              content:
                'Your session certificate expires in 10 minutes. Save in-progress work before renewing it from the security console.',
              duration: 6,
              closable: true,
            })
          }
        >
          Long warning (closable)
        </button>
        <button onClick={() => message.error({ content: 'Synchronization failed. Retry from the operations dashboard.', duration: 0, closable: true })}>
          Persistent error
        </button>
      </div>
    );
  },
};

/**
 * Bottom placement on the modern stack.
 */
export const ModernBottomPlacement: Story = {
  name: '⬇️ Modern Bottom Placement',
  render: () => (
    <MessageProvider placement="bottom">
      <BottomDemo />
    </MessageProvider>
  ),
};

const BottomDemo = () => {
  const message = useMessage();
  return (
    <button onClick={() => message.info('Bottom-placed modern message', 3)}>
      Show bottom message
    </button>
  );
};
