/**
 * Result Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Result } from '../';

const meta: Meta<typeof Result> = {
  title: 'Primitives/Feedback/Result',
  component: Result,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning', '404', '403', '500'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Result>;

export const Default: Story = {
  args: {
    title: 'Your operation has been executed',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
    title: 'Successfully Purchased Cloud Server ECS!',
    subTitle: 'Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait.',
    extra: [
      <button key="console" style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
        Go Console
      </button>,
      <button key="buy" style={{ padding: '8px 16px' }}>
        Buy Again
      </button>,
    ],
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    title: 'Submission Failed',
    subTitle: 'Please check and modify the following information before resubmitting.',
    extra: [
      <button key="again" style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
        Try Again
      </button>,
    ],
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    title: 'Your Operation is in Progress',
    subTitle: 'Please wait while we process your request.',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'There are Some Problems with Your Operation',
    subTitle: 'Please review the details below.',
  },
};

export const StatusTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['success', 'error', 'info', 'warning'] as const).map((status) => (
        <Result
          key={status}
          status={status}
          title={`${status.charAt(0).toUpperCase() + status.slice(1)} Result`}
          subTitle={`This is a ${status} result.`}
        />
      ))}
    </div>
  ),
};

export const NotFound404: Story = {
  args: {
    status: '404',
    title: '404',
    subTitle: 'Sorry, the page you visited does not exist.',
    extra: (
      <button style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
        Back Home
      </button>
    ),
  },
};

export const Forbidden403: Story = {
  args: {
    status: '403',
    title: '403',
    subTitle: 'Sorry, you are not authorized to access this page.',
    extra: (
      <button style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
        Back Home
      </button>
    ),
  },
};

export const ServerError500: Story = {
  args: {
    status: '500',
    title: '500',
    subTitle: 'Sorry, something went wrong.',
    extra: (
      <button style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
        Back Home
      </button>
    ),
  },
};

export const HTTPStatusCodes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['404', '403', '500'] as const).map((status) => (
        <Result
          key={status}
          status={status}
          title={status}
          subTitle={`HTTP ${status} Error`}
        />
      ))}
    </div>
  ),
};

export const CustomIcon: Story = {
  args: {
    icon: <span style={{ fontSize: 64 }}>🎉</span>,
    title: 'Congratulations!',
    subTitle: 'You have completed all tasks.',
    extra: (
      <button style={{ backgroundColor: '#52c41a', color: 'white', padding: '8px 16px' }}>
        Continue
      </button>
    ),
  },
};

export const WithDetails: Story = {
  render: () => (
    <Result
      status="error"
      title="Submission Failed"
      subTitle="Please check and modify the following information before resubmitting."
      extra={
        <button style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
          Try Again
        </button>
      }
    >
      <div style={{ backgroundColor: '#fafafa', padding: 24, borderRadius: 4 }}>
        <h4 style={{ marginBottom: 16 }}>The content you submitted has the following errors:</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#ff4d4f' }}>
          <li>Your account has been frozen. <a href="#">Thaw immediately &gt;</a></li>
          <li>Your account is not yet eligible to apply. <a href="#">Apply now &gt;</a></li>
        </ul>
      </div>
    </Result>
  ),
};

export const WithComplexExtra: Story = {
  render: () => (
    <Result
      status="success"
      title="Payment Successful"
      subTitle="Your payment of $500.00 has been processed."
      extra={
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px' }}>
            View Order
          </button>
          <button style={{ padding: '8px 16px' }}>
            Download Receipt
          </button>
          <button style={{ padding: '8px 16px' }}>
            Continue Shopping
          </button>
        </div>
      }
    />
  ),
};

export const InCard: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 400,
        padding: 24,
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        backgroundColor: 'white',
      }}
    >
      <Result
        status="success"
        title="Email Sent"
        subTitle="Check your inbox for the confirmation email."
      />
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ marginBottom: 16, textTransform: 'capitalize' }}>{engine} Engine</h4>
          <Result
            engine={engine}
            status="success"
            title="Operation Successful"
            subTitle={`Using ${engine} engine`}
          />
        </div>
      ))}
    </div>
  ),
};
