import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button, Space, Typography, List, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const meta: Meta<typeof BottomSheet> = {
  title: 'Composite/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A mobile-first bottom sheet component with snap points, drag-to-dismiss, and theme-aware styling.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

// Interactive wrapper component
const BottomSheetDemo = ({ children, ...props }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '20px', height: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Bottom Sheet Demo</Title>
          <Paragraph>
            Click the button below to open the bottom sheet. You can:
          </Paragraph>
          <ul>
            <li>Drag the handle to resize between snap points</li>
            <li>Drag down to dismiss (from smallest snap point)</li>
            <li>Click the backdrop to close</li>
          </ul>
        </div>
        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Open Bottom Sheet
        </Button>
      </Space>

      <BottomSheet {...props} open={open} onClose={() => setOpen(false)}>
        {children}
      </BottomSheet>
    </div>
  );
};

// Basic Example
export const Basic: Story = {
  render: () => (
    <BottomSheetDemo title="Basic Bottom Sheet">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph>
          This is a basic bottom sheet with default snap points at 30%, 60%, and 90% of viewport height.
        </Paragraph>
        <Paragraph>
          Try dragging the handle up and down to snap between different heights!
        </Paragraph>
      </Space>
    </BottomSheetDemo>
  ),
};

// User Profile Menu
export const UserProfile: Story = {
  render: () => (
    <BottomSheetDemo
      title="Profile"
      snapPoints={[0.4, 0.7]}
      footer={
        <Button type="primary" block size="large">
          Edit Profile
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
            John Doe
          </Title>
          <Text type="secondary">john.doe@example.com</Text>
        </div>

        <List
          dataSource={[
            { icon: <UserOutlined />, title: 'Account Settings', description: 'Manage your account' },
            { icon: <BellOutlined />, title: 'Notifications', description: 'Configure alerts' },
            { icon: <SettingOutlined />, title: 'Preferences', description: 'App settings' },
            { icon: <LogoutOutlined />, title: 'Sign Out', description: 'Logout from app' },
          ]}
          renderItem={(item) => (
            <List.Item style={{ cursor: 'pointer' }}>
              <List.Item.Meta
                avatar={<Avatar icon={item.icon} />}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Space>
    </BottomSheetDemo>
  ),
};

// Content List
export const ContentList: Story = {
  render: () => (
    <BottomSheetDemo
      title="Select an Item"
      snapPoints={[0.5, 0.8]}
      initialSnapPointIndex={1}
    >
      <List
        dataSource={Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          title: `Item ${i + 1}`,
          description: `Description for item ${i + 1}`,
        }))}
        renderItem={(item) => (
          <List.Item style={{ cursor: 'pointer' }}>
            <List.Item.Meta
              avatar={<Avatar>{item.id}</Avatar>}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </BottomSheetDemo>
  ),
};

// Custom Header
export const CustomHeader: Story = {
  render: () => (
    <BottomSheetDemo
      header={
        <div style={{ padding: '12px 0' }}>
          <div
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#d9d9d9',
              borderRadius: 2,
              margin: '0 auto 16px',
            }}
          />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Custom Header
            </Title>
            <Button type="text" size="small">
              Done
            </Button>
          </Space>
        </div>
      }
      snapPoints={[0.4, 0.7]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph>
          This bottom sheet has a custom header with additional controls.
        </Paragraph>
        <Paragraph>
          You can add buttons, badges, or any other elements to the header.
        </Paragraph>
      </Space>
    </BottomSheetDemo>
  ),
};

// No Drag Handle
export const NoDragHandle: Story = {
  render: () => (
    <BottomSheetDemo
      title="No Drag Handle"
      showDragHandle={false}
      dismissOnDrag={false}
      snapPoints={[0.5]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph>
          This bottom sheet has no drag handle and cannot be dismissed by dragging.
        </Paragraph>
        <Paragraph>
          It only has one snap point and can only be closed by clicking the backdrop or a close button.
        </Paragraph>
        <Button type="default" block>
          Action Button
        </Button>
      </Space>
    </BottomSheetDemo>
  ),
};

// Full Height
export const FullHeight: Story = {
  render: () => (
    <BottomSheetDemo
      title="Full Height Sheet"
      snapPoints={[0.95]}
      initialSnapPointIndex={0}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={4}>Full Height Content</Title>
        <Paragraph>
          This bottom sheet takes up 95% of the viewport height, perfect for detailed content or forms.
        </Paragraph>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <Title level={5}>Section {i + 1}</Title>
            <Paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Paragraph>
          </div>
        ))}
      </Space>
    </BottomSheetDemo>
  ),
};

// Multiple Snap Points
export const MultipleSnapPoints: Story = {
  render: () => {
    const [currentSnap, setCurrentSnap] = useState(0);
    const snapPoints = [0.25, 0.5, 0.75, 0.95];

    return (
      <BottomSheetDemo
        title="Multiple Snap Points"
        snapPoints={snapPoints}
        onSnapPointChange={(index: number) => setCurrentSnap(index)}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Paragraph>
            This bottom sheet has 4 snap points: 25%, 50%, 75%, and 95%.
          </Paragraph>
          <Paragraph>
            <strong>Current snap point:</strong> {Math.round(snapPoints[currentSnap] * 100)}%
          </Paragraph>
          <Paragraph>
            Drag the handle to move between different heights. The sheet will automatically snap to
            the closest point when you release.
          </Paragraph>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <Text>Content item {i + 1}</Text>
            </div>
          ))}
        </Space>
      </BottomSheetDemo>
    );
  },
};

// With Footer Actions
export const WithFooter: Story = {
  render: () => (
    <BottomSheetDemo
      title="Confirmation"
      snapPoints={[0.4]}
      footer={
        <Space style={{ width: '100%' }} direction="vertical">
          <Button type="primary" block size="large">
            Confirm
          </Button>
          <Button block size="large">
            Cancel
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={4}>Are you sure?</Title>
        <Paragraph>
          This action cannot be undone. Please confirm that you want to proceed with this operation.
        </Paragraph>
      </Space>
    </BottomSheetDemo>
  ),
};
