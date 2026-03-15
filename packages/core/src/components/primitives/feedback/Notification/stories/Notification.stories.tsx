/**
 * Notification Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NotificationProvider, useNotification } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

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
        actions: (
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

// ============================================================================
// Engine Comparison Stories
// ============================================================================

const EngineNotificationDemo = ({ engine }: { engine: string }) => {
  const notification = useNotification();
  return (
    <button
      onClick={() =>
        notification.success({
          message: `${engine} Notification`,
          description: `Using ${engine} engine.`,
        })
      }
      style={{ padding: '8px 16px' }}
    >
      Show {engine} Notification
    </button>
  );
};

/**
 * Side-by-side comparison of Notification across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Notification rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS). Click each button to trigger a notification.',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={({ engineName }: { engineName: 'classic' | 'modern' | 'rustic' }) => (
        <NotificationProvider engine={engineName}>
          <EngineNotificationDemo engine={engineName} />
        </NotificationProvider>
      )}
      props={{ engineName: 'classic' }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all notification types across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Click buttons to show notifications of different types across engines.',
      },
    },
  },
  render: () => {
    const engines = ['classic', 'modern', 'rustic'] as const;
    const types = ['success', 'error', 'warning', 'info'] as const;

    const TypeButton = ({ engine, type }: { engine: typeof engines[number]; type: typeof types[number] }) => {
      const notification = useNotification();
      return (
        <button
          onClick={() => notification[type]({ message: `${type} Notification`, description: `${engine} engine` })}
          style={{ padding: '6px 12px', textTransform: 'capitalize' }}
        >
          {type}
        </button>
      );
    };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: 16 }}>
        <div style={{ fontWeight: 600 }}>Type</div>
        {engines.map((e) => (
          <div key={e} style={{ textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}>{e}</div>
        ))}
        {types.map((type) => (
          <>
            <div key={`label-${type}`} style={{ textTransform: 'capitalize' }}>{type}</div>
            {engines.map((engine) => (
              <NotificationProvider key={`${engine}-${type}`} engine={engine}>
                <TypeButton engine={engine} type={type} />
              </NotificationProvider>
            ))}
          </>
        ))}
      </div>
    );
  },
};
