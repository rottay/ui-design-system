import type { Meta, StoryObj } from '@storybook/react';
import { Center } from './Center';
import { Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const meta = {
  title: 'Layout Patterns/Center',
  component: Center,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    minHeight: {
      control: 'text',
      description: 'Minimum height (supports "screen", "full", or any CSS value)',
    },
    inline: {
      control: 'boolean',
      description: 'Whether to use inline-flex instead of flex',
    },
  },
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Card style={{ width: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '1rem' }} />
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Sign in to continue to your account
          </p>
        </div>
      </Card>
    ),
  },
};

export const FullScreen: Story = {
  args: {
    minHeight: 'screen',
    style: { backgroundColor: '#f0f2f5' },
    children: (
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#1890ff',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              color: 'white',
            }}
          >
            <UserOutlined />
          </div>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Login Required</h1>
          <p style={{ margin: 0, marginBottom: '2rem', color: '#666' }}>
            Please sign in to access your dashboard and manage your account.
          </p>
          <button
            style={{
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </Card>
    ),
  },
};

export const InlineCenter: Story = {
  args: {
    inline: true,
    style: {
      border: '2px dashed #d9d9d9',
      padding: '2rem',
    },
    children: (
      <div
        style={{
          backgroundColor: '#1890ff',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '4px',
        }}
      >
        I'm inline-centered!
      </div>
    ),
  },
};

export const WithCustomHeight: Story = {
  args: {
    minHeight: '400px',
    style: {
      border: '2px dashed #d9d9d9',
      backgroundColor: '#fafafa',
    },
    children: (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#52c41a',
            borderRadius: '8px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          }}
        >
          ✓
        </div>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Success!</h2>
        <p style={{ margin: 0, color: '#666' }}>
          Your operation completed successfully
        </p>
      </div>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    minHeight: '300px',
    style: {
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    children: (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <p style={{ margin: 0, color: '#666' }}>Loading content...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    ),
  },
};
