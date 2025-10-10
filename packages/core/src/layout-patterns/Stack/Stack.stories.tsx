import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { Divider } from 'antd';
import { Card } from 'antd';

const meta = {
  title: 'Layout Patterns/Stack',
  component: Stack,
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
      description: 'Horizontal alignment of children',
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gap: 'md',
    children: (
      <>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>User Profile</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Manage your account settings and preferences
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Notifications</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Configure how you receive updates and alerts
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Security</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Update your password and security settings
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Privacy</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Control your data and privacy preferences
          </p>
        </Card>
      </>
    ),
  },
};

export const DifferentGaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xs (4px)</h3>
        <Stack gap="xs">
          <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: sm (8px)</h3>
        <Stack gap="sm">
          <div style={{ backgroundColor: '#e6f7ff', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#e6f7ff', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#e6f7ff', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: md (16px)</h3>
        <Stack gap="md">
          <div style={{ backgroundColor: '#f6ffed', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f6ffed', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f6ffed', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: lg (24px)</h3>
        <Stack gap="lg">
          <div style={{ backgroundColor: '#fff7e6', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#fff7e6', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#fff7e6', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xl (32px)</h3>
        <Stack gap="xl">
          <div style={{ backgroundColor: '#fff0f6', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#fff0f6', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#fff0f6', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: 2xl (48px)</h3>
        <Stack gap="2xl">
          <div style={{ backgroundColor: '#f9f0ff', padding: '1rem', borderRadius: '4px' }}>Item 1</div>
          <div style={{ backgroundColor: '#f9f0ff', padding: '1rem', borderRadius: '4px' }}>Item 2</div>
          <div style={{ backgroundColor: '#f9f0ff', padding: '1rem', borderRadius: '4px' }}>Item 3</div>
        </Stack>
      </div>
    </div>
  ),
};

export const WithDivider: Story = {
  args: {
    gap: 'md',
    divider: <Divider style={{ margin: 0 }} />,
    children: (
      <>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Introduction</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Welcome to our platform. Here you'll find everything you need to get started.
          </p>
        </div>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Getting Started</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Follow these simple steps to set up your account and begin using our services.
          </p>
        </div>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Best Practices</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Learn the recommended ways to make the most of our platform.
          </p>
        </div>
      </>
    ),
  },
};

export const AlignmentVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Align: start</h3>
        <Stack gap="md" align="start" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', width: '200px' }}>Item 1</div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', width: '300px' }}>Item 2</div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', width: '150px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: center</h3>
        <Stack gap="md" align="center" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '1rem', width: '200px' }}>Item 1</div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '1rem', width: '300px' }}>Item 2</div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '1rem', width: '150px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: end</h3>
        <Stack gap="md" align="end" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '1rem', width: '200px' }}>Item 1</div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '1rem', width: '300px' }}>Item 2</div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '1rem', width: '150px' }}>Item 3</div>
        </Stack>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: stretch</h3>
        <Stack gap="md" align="stretch" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '1rem' }}>Item 1 (full width)</div>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '1rem' }}>Item 2 (full width)</div>
          <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '1rem' }}>Item 3 (full width)</div>
        </Stack>
      </div>
    </div>
  ),
};
