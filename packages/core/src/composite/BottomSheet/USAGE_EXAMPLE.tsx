import React, { useState } from 'react';
import { BottomSheet } from '@es-rottay/designsystem-core';
import { Button, Space, Typography, List, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * Basic Bottom Sheet Example
 */
export const BasicExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open Bottom Sheet
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Basic Bottom Sheet"
      >
        <Paragraph>
          This is a basic bottom sheet with default snap points at 30%, 60%, and 90% of viewport height.
        </Paragraph>
        <Paragraph>
          Try dragging the handle up and down to snap between different heights!
        </Paragraph>
      </BottomSheet>
    </>
  );
};

/**
 * User Profile Menu Example
 */
export const UserProfileExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserOutlined /> Profile
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
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
      </BottomSheet>
    </>
  );
};

/**
 * Confirmation Dialog Example
 */
export const ConfirmationExample = () => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
    setOpen(false);
  };

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        Delete Item
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmation"
        snapPoints={[0.35]}
        footer={
          <Space style={{ width: '100%' }} direction="vertical">
            <Button type="primary" danger block size="large" onClick={handleConfirm}>
              Confirm Delete
            </Button>
            <Button block size="large" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={4}>Are you sure?</Title>
          <Paragraph>
            This action cannot be undone. The item will be permanently deleted from the system.
          </Paragraph>
        </Space>
      </BottomSheet>
    </>
  );
};

/**
 * Content List with Scroll Example
 */
export const ScrollableListExample = () => {
  const [open, setOpen] = useState(false);

  const data = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Select Item
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Select an Item"
        snapPoints={[0.5, 0.8]}
        initialSnapPointIndex={1}
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => {
                console.log('Selected:', item);
                setOpen(false);
              }}
            >
              <List.Item.Meta
                avatar={<Avatar>{item.id}</Avatar>}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </BottomSheet>
    </>
  );
};

/**
 * Custom Header with Actions Example
 */
export const CustomHeaderExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Custom Header
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        snapPoints={[0.5]}
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
              <Button type="primary" size="small" onClick={() => setOpen(false)}>
                Done
              </Button>
            </Space>
          </div>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Paragraph>
            This bottom sheet has a custom header with additional controls.
          </Paragraph>
          <Paragraph>
            You can add buttons, badges, or any other elements to the header.
          </Paragraph>
        </Space>
      </BottomSheet>
    </>
  );
};

/**
 * Full Height Sheet Example
 */
export const FullHeightExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Full Height
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Full Height Content"
        snapPoints={[0.95]}
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
      </BottomSheet>
    </>
  );
};

/**
 * Multiple Snap Points Example
 */
export const MultipleSnapPointsExample = () => {
  const [open, setOpen] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(0);
  const snapPoints = [0.25, 0.5, 0.75, 0.95];

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Multiple Snap Points
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Multiple Snap Points"
        snapPoints={snapPoints}
        onSnapPointChange={(index) => setCurrentSnap(index)}
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
        </Space>
      </BottomSheet>
    </>
  );
};
