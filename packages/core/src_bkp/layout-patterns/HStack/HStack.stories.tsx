import type { Meta, StoryObj } from '@storybook/react';
import { HStack } from './HStack';
import { Badge, Avatar } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';

const meta = {
  title: 'Layout Patterns/HStack',
  component: HStack,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Spacing between children',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of children',
    },
    wrap: {
      control: 'boolean',
      description: 'Whether children should wrap to new lines',
    },
  },
} satisfies Meta<typeof HStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gap: 'md',
    align: 'center',
    children: (
      <>
        <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        <div>
          <div style={{ fontWeight: 600 }}>John Doe</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Software Engineer</div>
        </div>
        <Badge count={5} style={{ marginLeft: 'auto' }} />
      </>
    ),
  },
};

export const DifferentGaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xs (4px)</h3>
        <HStack gap="xs">
          <div style={{ backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: sm (8px)</h3>
        <HStack gap="sm">
          <div style={{ backgroundColor: '#e6f7ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#e6f7ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#e6f7ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: md (16px)</h3>
        <HStack gap="md">
          <div style={{ backgroundColor: '#f6ffed', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f6ffed', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f6ffed', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: lg (24px)</h3>
        <HStack gap="lg">
          <div style={{ backgroundColor: '#fff7e6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#fff7e6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#fff7e6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xl (32px)</h3>
        <HStack gap="xl">
          <div style={{ backgroundColor: '#fff0f6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#fff0f6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#fff0f6', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: 2xl (48px)</h3>
        <HStack gap="2xl">
          <div style={{ backgroundColor: '#f9f0ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f9f0ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f9f0ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>Item 3</div>
        </HStack>
      </div>
    </div>
  ),
};

export const WithWrap: Story = {
  args: {
    gap: 'md',
    wrap: true,
    style: { maxWidth: '500px' },
    children: (
      <>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Navigation</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Dashboard</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Analytics</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Reports</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Settings</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Profile</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Notifications</div>
        <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Help</div>
      </>
    ),
  },
};

export const VerticalAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Align: start</h3>
        <HStack gap="md" align="start" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Small</div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', borderRadius: '4px' }}>Medium</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: center (default)</h3>
        <HStack gap="md" align="center" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Small</div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '1rem', borderRadius: '4px' }}>Medium</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: end</h3>
        <HStack gap="md" align="end" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Small</div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '1rem', borderRadius: '4px' }}>Medium</div>
        </HStack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: stretch</h3>
        <HStack gap="md" align="stretch" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>Small</div>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '1rem', borderRadius: '4px' }}>Medium</div>
        </HStack>
      </div>
    </div>
  ),
};

export const NavigationBar: Story = {
  render: () => (
    <HStack gap="lg" align="center" style={{ backgroundColor: '#001529', color: 'white', padding: '1rem 2rem' }}>
      <HomeOutlined style={{ fontSize: '24px' }} />
      <div style={{ fontWeight: 600, fontSize: '18px' }}>MyApp</div>
      <div style={{ flex: 1 }} />
      <HStack gap="md" align="center">
        <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        <SettingOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        <Avatar icon={<UserOutlined />} />
      </HStack>
    </HStack>
  ),
};
