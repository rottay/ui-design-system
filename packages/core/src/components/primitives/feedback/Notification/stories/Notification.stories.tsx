/**
 * Notification Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NotificationProvider, useNotification } from '../';

const meta: Meta = {
  title: 'Primitives/Feedback/Notification',
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
      </NotificationProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const NotificationDemo = () => {
  const notification = useNotification();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={() =>
          notification.success({
            message: 'Success',
            description: 'Operation completed successfully!',
          })
        }
      >
        Success
      </button>
      <button
        onClick={() =>
          notification.error({
            message: 'Error',
            description: 'Something went wrong.',
          })
        }
      >
        Error
      </button>
      <button
        onClick={() =>
          notification.warning({
            message: 'Warning',
            description: 'Please be careful.',
          })
        }
      >
        Warning
      </button>
      <button
        onClick={() =>
          notification.info({
            message: 'Info',
            description: 'Here is some information.',
          })
        }
      >
        Info
      </button>
    </div>
  );
};

export const Default: Story = {
  render: () => <NotificationDemo />,
};

export const Types: Story = {
  render: () => {
    const notification = useNotification();
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['success', 'error', 'warning', 'info'] as const).map((type) => (
          <button
            key={type}
            onClick={() =>
              notification[type]({
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
                description: `This is a ${type} notification.`,
              })
            }
            style={{ textTransform: 'capitalize' }}
          >
            {type}
          </button>
        ))}
      </div>
    );
  },
};

export const Placements: Story = {
  render: () => {
    const notification = useNotification();
    const placements = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {placements.map((placement) => (
          <button
            key={placement}
            onClick={() =>
              notification.open({
                message: `${placement} Notification`,
                description: `This notification appears at ${placement}.`,
                placement,
              })
            }
          >
            {placement}
          </button>
        ))}
      </div>
    );
  },
};

export const CustomDuration: Story = {
  render: () => {
    const notification = useNotification();
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() =>
            notification.info({
              message: '1 Second',
              description: 'This notification closes in 1 second.',
              duration: 1,
            })
          }
        >
          1s
        </button>
        <button
          onClick={() =>
            notification.info({
              message: '5 Seconds',
              description: 'This notification closes in 5 seconds.',
              duration: 5,
            })
          }
        >
          5s
        </button>
        <button
          onClick={() =>
            notification.info({
              message: 'Persistent',
              description: 'This notification will not auto close.',
              duration: 0,
            })
          }
        >
          No Auto Close
        </button>
      </div>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const notification = useNotification();

    const handleOpen = () => {
      notification.open({
        message: 'Action Required',
        description: 'Click the button to perform an action.',
        btn: (
          <button
            onClick={() => {
              notification.destroy();
              alert('Action performed!');
            }}
            style={{ backgroundColor: '#1890ff', color: 'white', padding: '4px 12px' }}
          >
            Confirm
          </button>
        ),
        duration: 0,
      });
    };

    return <button onClick={handleOpen}>Show with Action</button>;
  },
};

export const UpdateNotification: Story = {
  render: () => {
    const notification = useNotification();

    const handleClick = () => {
      notification.open({
        key: 'updatable',
        message: 'Loading...',
        description: 'Please wait while we process.',
        duration: 0,
      });

      setTimeout(() => {
        notification.success({
          key: 'updatable',
          message: 'Completed!',
          description: 'The operation was successful.',
          duration: 2,
        });
      }, 2000);
    };

    return <button onClick={handleClick}>Show Loading → Success</button>;
  },
};

export const DestroyAll: Story = {
  render: () => {
    const notification = useNotification();

    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            notification.success({ message: 'Notification 1', duration: 0 });
            notification.info({ message: 'Notification 2', duration: 0 });
            notification.warning({ message: 'Notification 3', duration: 0 });
          }}
        >
          Show Multiple
        </button>
        <button onClick={() => notification.destroy()}>Destroy All</button>
      </div>
    );
  },
};

export const WithCallback: Story = {
  render: () => {
    const notification = useNotification();

    return (
      <button
        onClick={() => {
          notification.success({
            message: 'Callback Notification',
            description: 'This notification has an onClose callback.',
            onClose: () => alert('Notification closed!'),
          });
        }}
      >
        Show with Callback
      </button>
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <NotificationProvider key={engine} engine={engine}>
          <EngineNotificationDemo engine={engine} />
        </NotificationProvider>
      ))}
    </div>
  ),
};

const EngineNotificationDemo = ({ engine }: { engine: string }) => {
  const notification = useNotification();
  return (
    <div>
      <h4 style={{ marginBottom: 8, textTransform: 'capitalize' }}>{engine}</h4>
      <button
        onClick={() =>
          notification.success({
            message: `${engine} Notification`,
            description: `Using ${engine} engine.`,
          })
        }
      >
        Show {engine} Notification
      </button>
    </div>
  );
};
