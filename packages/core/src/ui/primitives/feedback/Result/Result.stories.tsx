/**
 * @fileoverview Result Component Stories - Rottay Design System
 * @description Storybook stories for the Result component.
 * Demonstrates all status types, engine variations, and use cases.
 *
 * @remarks
 * This file provides comprehensive Storybook documentation for the Result
 * component, showcasing:
 * - All 7 status types (success, error, info, warning, 404, 403, 500)
 * - Multi-engine support (Classic, Modern, Rustic)
 * - Custom icons and content
 * - Real-world usage patterns
 *
 * @example Running Stories
 * ```bash
 * npm run storybook
 * # Navigate to Primitives/Feedback/Result
 * ```
 *
 * @see {@link Result} - Main component
 * @see {@link ResultProps} - Component props
 * @module Result/Stories
 * @category Feedback
 * @package @rottay/design-system
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Result } from './';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

// ============================================================================
// Meta Configuration
// ============================================================================

/**
 * Storybook meta configuration for the Result component.
 * Configures controls, decorators, and documentation settings.
 */
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
      options: ['classic', 'modern', 'rustic'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Result>;

// ============================================================================
// Basic Stories
// ============================================================================

/**
 * Default Result story.
 * Shows a basic result with just a title.
 */
export const Default: Story = {
  args: {
    title: 'Your operation has been executed',
  },
};

/**
 * Success Result story.
 * Demonstrates a successful operation confirmation.
 */
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

/**
 * Error Result story.
 * Demonstrates a failed operation message.
 */
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

/**
 * Info Result story.
 * Demonstrates an informational message.
 */
export const Info: Story = {
  args: {
    status: 'info',
    title: 'Your Operation is in Progress',
    subTitle: 'Please wait while we process your request.',
  },
};

/**
 * Warning Result story.
 * Demonstrates a warning message.
 */
export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'There are Some Problems with Your Operation',
    subTitle: 'Please review the details below.',
  },
};

// ============================================================================
// Status Type Comparison
// ============================================================================

/**
 * All Status Types story.
 * Displays all four standard status types side by side.
 */
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

// ============================================================================
// HTTP Status Pages
// ============================================================================

/**
 * 404 Not Found story.
 * Demonstrates a page not found error page.
 */
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

/**
 * 403 Forbidden story.
 * Demonstrates an access denied error page.
 */
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

/**
 * 500 Server Error story.
 * Demonstrates a server error page.
 */
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

/**
 * All HTTP Status Codes story.
 * Displays all HTTP error status codes together.
 */
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

// ============================================================================
// Custom Content Stories
// ============================================================================

/**
 * Custom Icon story.
 * Demonstrates using a custom icon instead of the default status icon.
 */
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

/**
 * With Details story.
 * Demonstrates a result with additional error details in children.
 */
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

/**
 * With Complex Extra story.
 * Demonstrates multiple action buttons in the extra area.
 */
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

// ============================================================================
// Layout Integration Stories
// ============================================================================

/**
 * In Card story.
 * Demonstrates a result displayed within a card container.
 */
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

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Result across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Result rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Result}
      props={{ status: 'success', title: 'Operation Successful', subTitle: 'Your operation was completed successfully.' }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing all status types across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Result}
      baseProps={{ title: 'Result Title', subTitle: 'Result description' }}
      variantProp="status"
      variants={['success', 'error', 'info', 'warning']}
    />
  ),
};
