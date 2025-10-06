import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Popconfirm } from './Popconfirm';
import { Button, Space, message, Typography, Switch, Divider } from 'antd';
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const meta: Meta<typeof Popconfirm> = {
  title: 'Overlay/Popconfirm',
  component: Popconfirm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Confirmación emergente simple que solicita confirmación del usuario antes de ejecutar una acción.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/popconfirm)
- [🎨 API de Props](https://ant.design/components/popconfirm#api)
- [💡 Ejemplos](https://ant.design/components/popconfirm#examples)

## Cuándo usar

- Para confirmaciones rápidas de acciones destructivas
- Cuando necesitas confirmación sin interrumpir el flujo con un modal
- Para eliminar, desactivar, o ejecutar acciones que requieren confirmación
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'left',
        'right',
        'bottom',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
        'leftTop',
        'leftBottom',
        'rightTop',
        'rightBottom',
      ],
    },
    okType: {
      control: 'select',
      options: ['primary', 'default', 'dashed', 'text', 'link'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popconfirm>;

/**
 * Basic confirmation popover.
 * Use for simple yes/no confirmations before destructive actions.
 */
export const Basic: Story = {
  render: () => {
    const confirm = () => {
      message.success('Action confirmed');
    };

    const cancel = () => {
      message.error('Action cancelled');
    };

    return (
      <Popconfirm
        title="Delete the task"
        description="Are you sure to delete this task?"
        onConfirm={confirm}
        onCancel={cancel}
        okText="Yes"
        cancelText="No"
      >
        <Button danger>Delete</Button>
      </Popconfirm>
    );
  },
};

/**
 * Different placements for the confirmation popup.
 * Choose placement based on available space and UI layout.
 */
export const Placements: Story = {
  render: () => {
    const confirm = () => {
      message.success('Confirmed');
    };

    const buttonWidth = 100;

    return (
      <div style={{ padding: '50px' }}>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Space size="small">
            <Popconfirm
              title="Are you sure?"
              placement="topLeft"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>TL</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="top"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>Top</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="topRight"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>TR</Button>
            </Popconfirm>
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space direction="vertical" size="small">
            <Popconfirm
              title="Are you sure?"
              placement="leftTop"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>LT</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="left"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>Left</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="leftBottom"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>LB</Button>
            </Popconfirm>
          </Space>

          <Space direction="vertical" size="small">
            <Popconfirm
              title="Are you sure?"
              placement="rightTop"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>RT</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="right"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>Right</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="rightBottom"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>RB</Button>
            </Popconfirm>
          </Space>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="small">
            <Popconfirm
              title="Are you sure?"
              placement="bottomLeft"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>BL</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="bottom"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>Bottom</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure?"
              placement="bottomRight"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ width: buttonWidth }}>BR</Button>
            </Popconfirm>
          </Space>
        </div>
      </div>
    );
  },
};

/**
 * Custom button text and types.
 * Customize the OK and Cancel button appearance.
 */
export const CustomButtons: Story = {
  render: () => {
    const confirm = () => {
      message.success('Deleted successfully');
    };

    return (
      <Space wrap size="large">
        <Popconfirm
          title="Delete this item?"
          description="This action cannot be undone."
          onConfirm={confirm}
          okText="Delete"
          cancelText="Cancel"
          okType="danger"
        >
          <Button danger>Danger OK Button</Button>
        </Popconfirm>

        <Popconfirm
          title="Save changes?"
          description="Do you want to save your changes?"
          onConfirm={confirm}
          okText="Save"
          cancelText="Discard"
          okType="primary"
        >
          <Button type="primary">Primary OK Button</Button>
        </Popconfirm>

        <Popconfirm
          title="Continue?"
          description="Are you sure you want to continue?"
          onConfirm={confirm}
          okText="Proceed"
          cancelText="Go Back"
          okType="default"
        >
          <Button>Default OK Button</Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * Custom icons for different confirmation types.
 * Use appropriate icons to communicate the action severity.
 */
export const CustomIcons: Story = {
  render: () => {
    const confirm = () => {
      message.success('Action completed');
    };

    return (
      <Space wrap size="large">
        <Popconfirm
          title="Are you sure?"
          description="This is a question."
          icon={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
          onConfirm={confirm}
        >
          <Button>Question Icon</Button>
        </Popconfirm>

        <Popconfirm
          title="Warning!"
          description="This action requires attention."
          icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          onConfirm={confirm}
        >
          <Button>Warning Icon</Button>
        </Popconfirm>

        <Popconfirm
          title="Delete item?"
          description="This action cannot be undone."
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          onConfirm={confirm}
          okType="danger"
        >
          <Button danger>Error Icon</Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * Popconfirm without icon.
 * Clean, minimal confirmation style.
 */
export const WithoutIcon: Story = {
  render: () => {
    const confirm = () => {
      message.success('Confirmed');
    };

    return (
      <Popconfirm
        title="Continue with this action?"
        description="This confirmation has no icon."
        icon={null}
        onConfirm={confirm}
        okText="Continue"
        cancelText="Cancel"
      >
        <Button type="primary">No Icon</Button>
      </Popconfirm>
    );
  },
};

/**
 * Async confirmation with loading state.
 * Use when confirmation triggers an API call or async operation.
 */
export const AsyncConfirmation: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);

    const confirm = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        message.success('Action completed successfully');
      }, 2000);
    };

    return (
      <Popconfirm
        title="Delete this record?"
        description="This will permanently delete the record from the database."
        onConfirm={confirm}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
        okButtonProps={{ loading }}
      >
        <Button danger icon={<DeleteOutlined />}>
          Delete Record
        </Button>
      </Popconfirm>
    );
  },
};

/**
 * Conditional trigger for Popconfirm.
 * Show confirmation only under certain conditions.
 */
export const ConditionalTrigger: Story = {
  render: () => {
    const [requiresConfirmation, setRequiresConfirmation] = useState(true);

    const handleClick = () => {
      if (!requiresConfirmation) {
        message.info('Action executed without confirmation');
      }
    };

    const confirm = () => {
      message.success('Action confirmed and executed');
    };

    return (
      <Space direction="vertical" size="large">
        <Space>
          <Text>Require confirmation:</Text>
          <Switch checked={requiresConfirmation} onChange={setRequiresConfirmation} />
        </Space>

        <Popconfirm
          title="Execute this action?"
          description="Are you sure you want to proceed?"
          onConfirm={confirm}
          disabled={!requiresConfirmation}
        >
          <Button type="primary" onClick={handleClick}>
            Execute Action
          </Button>
        </Popconfirm>

        <Text type="secondary">
          {requiresConfirmation
            ? 'Confirmation required before action'
            : 'Action executes immediately'}
        </Text>
      </Space>
    );
  },
};

/**
 * Delete confirmation pattern.
 * Common pattern for delete operations.
 */
export const DeletePattern: Story = {
  render: () => {
    const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);

    const deleteItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      message.success('Item deleted successfully');
    };

    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text strong>Items ({items.length})</Text>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '12px 16px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text>{item}</Text>
            <Popconfirm
              title="Delete this item?"
              description="This action cannot be undone."
              onConfirm={() => deleteItem(index)}
              okText="Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        ))}
      </Space>
    );
  },
};

/**
 * Batch action confirmation.
 * Confirm bulk operations on multiple items.
 */
export const BatchActionPattern: Story = {
  render: () => {
    const [selectedCount, setSelectedCount] = useState(3);

    const confirmBatchDelete = () => {
      message.success(`${selectedCount} items deleted successfully`);
      setSelectedCount(0);
    };

    return (
      <Space direction="vertical" size="large">
        <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <Text>{selectedCount} items selected</Text>
        </div>

        <Popconfirm
          title={`Delete ${selectedCount} items?`}
          description={`Are you sure you want to delete ${selectedCount} selected items? This action cannot be undone.`}
          onConfirm={confirmBatchDelete}
          okText="Delete All"
          cancelText="Cancel"
          okType="danger"
          disabled={selectedCount === 0}
        >
          <Button danger disabled={selectedCount === 0}>
            Delete Selected ({selectedCount})
          </Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * Status change confirmation.
 * Confirm before changing important status values.
 */
export const StatusChangePattern: Story = {
  render: () => {
    const [status, setStatus] = useState<'active' | 'inactive'>('active');

    const confirmStatusChange = () => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      setStatus(newStatus);
      message.success(`Status changed to ${newStatus}`);
    };

    return (
      <Space direction="vertical" size="large">
        <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
          <Space>
            <Text strong>Current Status:</Text>
            <Text
              style={{
                color: status === 'active' ? '#52c41a' : '#ff4d4f',
                textTransform: 'uppercase',
              }}
            >
              {status}
            </Text>
          </Space>
        </div>

        <Popconfirm
          title={`Change status to ${status === 'active' ? 'inactive' : 'active'}?`}
          description="This will affect the service availability."
          onConfirm={confirmStatusChange}
          okText="Change Status"
          cancelText="Keep Current"
        >
          <Button>{status === 'active' ? 'Deactivate' : 'Activate'}</Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * Logout confirmation pattern.
 * Confirm before logging out or ending session.
 */
export const LogoutPattern: Story = {
  render: () => {
    const confirmLogout = () => {
      message.info('Logging out...');
      setTimeout(() => {
        message.success('You have been logged out');
      }, 1000);
    };

    return (
      <Popconfirm
        title="Logout from account?"
        description="You will need to login again to access your account."
        onConfirm={confirmLogout}
        okText="Logout"
        cancelText="Stay"
        okType="primary"
      >
        <Button>Logout</Button>
      </Popconfirm>
    );
  },
};

/**
 * Unsaved changes confirmation.
 * Warn before discarding unsaved changes.
 */
export const UnsavedChangesPattern: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = useState(true);

    const confirmDiscard = () => {
      setHasChanges(false);
      message.warning('Changes discarded');
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasChanges(e.target.value.length > 0);
    };

    return (
      <Space direction="vertical" size="large" style={{ width: 400 }}>
        <div>
          <Text strong>Edit Content</Text>
          <textarea
            style={{
              width: '100%',
              minHeight: 100,
              marginTop: 8,
              padding: 8,
              borderRadius: 4,
              border: '1px solid #d9d9d9',
            }}
            placeholder="Type something..."
            onChange={handleTextChange}
          />
        </div>

        <Space>
          <Button type="primary">Save</Button>
          <Popconfirm
            title="Discard unsaved changes?"
            description="Your changes will be lost if you don't save them."
            onConfirm={confirmDiscard}
            okText="Discard"
            cancelText="Keep Editing"
            okType="danger"
            disabled={!hasChanges}
          >
            <Button disabled={!hasChanges}>Discard</Button>
          </Popconfirm>
        </Space>

        {hasChanges && <Text type="warning">You have unsaved changes</Text>}
      </Space>
    );
  },
};

/**
 * Payment/Purchase confirmation.
 * High-stakes confirmation for financial actions.
 */
export const PaymentConfirmation: Story = {
  render: () => {
    const [processing, setProcessing] = useState(false);

    const confirmPayment = () => {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        message.success('Payment processed successfully');
      }, 2000);
    };

    return (
      <Space direction="vertical" size="large">
        <div
          style={{
            padding: 20,
            border: '2px solid #1890ff',
            borderRadius: 8,
            background: '#f0f5ff',
          }}
        >
          <Space direction="vertical">
            <Text strong style={{ fontSize: 16 }}>
              Order Summary
            </Text>
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text strong>$99.99</Text>
            </Space>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text>Tax:</Text>
              <Text strong>$8.00</Text>
            </Space>
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>Total:</Text>
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                $107.99
              </Text>
            </Space>
          </Space>
        </div>

        <Popconfirm
          title="Confirm payment?"
          description={
            <div>
              <Paragraph style={{ marginBottom: 4 }}>
                You will be charged <strong>$107.99</strong>
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                This action cannot be undone.
              </Paragraph>
            </div>
          }
          onConfirm={confirmPayment}
          okText="Pay Now"
          cancelText="Cancel"
          okType="primary"
          okButtonProps={{ loading: processing }}
        >
          <Button type="primary" size="large" block>
            Complete Purchase
          </Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * Controlled Popconfirm.
 * Programmatic control over popup visibility.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const confirm = () => {
      message.success('Confirmed');
      setOpen(false);
    };

    const cancel = () => {
      message.error('Cancelled');
      setOpen(false);
    };

    return (
      <Space direction="vertical" size="large">
        <Space>
          <Button onClick={() => setOpen(!open)}>Toggle from outside</Button>
          <Text type="secondary">Popconfirm is {open ? 'open' : 'closed'}</Text>
        </Space>
        <Popconfirm
          title="Controlled confirmation"
          description="This popconfirm can be controlled externally."
          open={open}
          onConfirm={confirm}
          onCancel={cancel}
          onOpenChange={setOpen}
        >
          <Button type="primary">Controlled Popconfirm</Button>
        </Popconfirm>
      </Space>
    );
  },
};

/**
 * With description for more context.
 * Add detailed description to help users make informed decisions.
 */
export const WithDescription: Story = {
  render: () => {
    const confirm = () => {
      message.success('Account deleted');
    };

    return (
      <Popconfirm
        title="Delete your account?"
        description={
          <div style={{ maxWidth: 250 }}>
            <Paragraph style={{ marginBottom: 8 }}>
              This will permanently delete your account and all associated data.
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }} type="secondary">
              This action cannot be undone and you will lose access to all your content.
            </Paragraph>
          </div>
        }
        onConfirm={confirm}
        okText="Delete Account"
        cancelText="Cancel"
        okType="danger"
      >
        <Button danger>Delete Account</Button>
      </Popconfirm>
    );
  },
};
