import type { Meta, StoryObj } from '@storybook/react';
import { Spacer } from './Spacer';
import { HStack } from '../HStack';
import { Stack } from '../Stack';

const meta = {
  title: 'Layout Patterns/Spacer',
  component: Spacer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HStack style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
      <div
        style={{
          backgroundColor: '#1890ff',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '4px',
          fontWeight: 600,
        }}
      >
        Logo
      </div>
      <Spacer />
      <button
        style={{
          backgroundColor: '#52c41a',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Sign In
      </button>
    </HStack>
  ),
};

export const InVerticalStack: Story = {
  render: () => (
    <Stack style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '400px' }}>
      <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
        <h3 style={{ margin: 0 }}>Header</h3>
      </div>
      <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
        <h3 style={{ margin: 0 }}>Content</h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
          This content is at the top
        </p>
      </div>
      <Spacer />
      <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
        <strong>Footer - Pushed to bottom</strong>
      </div>
    </Stack>
  ),
};

export const MultipleSpacers: Story = {
  render: () => (
    <HStack style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
      <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px' }}>
        Left
      </div>
      <Spacer />
      <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px' }}>
        Center
      </div>
      <Spacer />
      <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px' }}>
        Right
      </div>
    </HStack>
  ),
};

export const NavigationBar: Story = {
  render: () => (
    <HStack
      style={{
        backgroundColor: '#001529',
        color: 'white',
        padding: '1rem 2rem',
      }}
      align="center"
    >
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>MyApp</div>
      <HStack gap="lg" style={{ marginLeft: '2rem' }}>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Features</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
      </HStack>
      <Spacer />
      <HStack gap="md">
        <button
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
        <button
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
      </HStack>
    </HStack>
  ),
};

export const CardWithActions: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', border: '1px solid #d9d9d9', borderRadius: '8px', padding: '1.5rem' }}>
      <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Card Title</h3>
      <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
        This is a card with some content. The action buttons are pushed to the right using Spacer.
      </p>
      <HStack gap="md">
        <div style={{ color: '#666', fontSize: '14px' }}>Last updated: 2 hours ago</div>
        <Spacer />
        <button
          style={{
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #d9d9d9',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </HStack>
    </div>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <HStack
        style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #d9d9d9',
        }}
        align="center"
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>Dashboard</div>
        <Spacer />
        <div style={{ color: '#666' }}>Welcome, John Doe</div>
      </HStack>

      {/* Content */}
      <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <h1 style={{ marginTop: 0 }}>Main Content</h1>
        <p style={{ color: '#666' }}>
          The header stays at the top, content fills available space, and footer stays at the bottom.
        </p>
      </div>

      {/* Footer */}
      <HStack
        style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderTop: '1px solid #d9d9d9',
        }}
        align="center"
      >
        <div style={{ color: '#666', fontSize: '14px' }}>© 2024 MyApp. All rights reserved.</div>
        <Spacer />
        <HStack gap="lg">
          <a href="#" style={{ color: '#666', fontSize: '14px' }}>Privacy</a>
          <a href="#" style={{ color: '#666', fontSize: '14px' }}>Terms</a>
          <a href="#" style={{ color: '#666', fontSize: '14px' }}>Contact</a>
        </HStack>
      </HStack>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
