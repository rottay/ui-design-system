import type { Meta, StoryObj } from '@storybook/react';
import { DaisyAlert } from './DaisyAlert';
import { DaisyButton } from '../Button/DaisyButton';

const meta: Meta<typeof DaisyAlert> = {
  title: 'DaisyUI/DaisyAlert',
  component: DaisyAlert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DaisyUI Alert component with Tailwind CSS classes. Use the **DaisyUI Theme** selector in the toolbar to see different themes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Alert variant/type',
    },
    title: {
      control: 'text',
      description: 'Alert title',
    },
    message: {
      control: 'text',
      description: 'Alert message/description',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DaisyAlert>;

// Default alert
export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    message: 'This is an informational alert message.',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '500px' }}>
      <DaisyAlert
        variant="info"
        title="Info"
        message="This is an informational message."
      />
      <DaisyAlert
        variant="success"
        title="Success"
        message="Your operation completed successfully!"
      />
      <DaisyAlert
        variant="warning"
        title="Warning"
        message="Please review this before proceeding."
      />
      <DaisyAlert
        variant="error"
        title="Error"
        message="An error occurred during the operation."
      />
    </div>
  ),
};

// With actions
export const WithActions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '500px' }}>
      <DaisyAlert
        variant="info"
        title="New update available"
        message="Version 2.0 is now available. Would you like to update?"
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Later</DaisyButton>
            <DaisyButton variant="primary" size="sm">Update Now</DaisyButton>
          </>
        }
      />
      <DaisyAlert
        variant="success"
        title="Account created"
        message="Your account has been successfully created!"
        actions={
          <DaisyButton variant="success" size="sm">Get Started</DaisyButton>
        }
      />
      <DaisyAlert
        variant="warning"
        title="Storage almost full"
        message="You have used 95% of your available storage."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Dismiss</DaisyButton>
            <DaisyButton variant="warning" size="sm">Upgrade Storage</DaisyButton>
          </>
        }
      />
      <DaisyAlert
        variant="error"
        title="Payment failed"
        message="We couldn't process your payment. Please try again."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Cancel</DaisyButton>
            <DaisyButton variant="error" size="sm">Retry Payment</DaisyButton>
          </>
        }
      />
    </div>
  ),
};

// Message only (no title)
export const MessageOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '500px' }}>
      <DaisyAlert
        variant="info"
        message="Simple informational message without a title."
      />
      <DaisyAlert
        variant="success"
        message="Operation completed successfully!"
      />
      <DaisyAlert
        variant="warning"
        message="Please be cautious when proceeding."
      />
      <DaisyAlert
        variant="error"
        message="Something went wrong. Please try again."
      />
    </div>
  ),
};

// Title only (no message)
export const TitleOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '500px' }}>
      <DaisyAlert variant="info" title="Information" />
      <DaisyAlert variant="success" title="Success!" />
      <DaisyAlert variant="warning" title="Warning" />
      <DaisyAlert variant="error" title="Error" />
    </div>
  ),
};

// Theme showcase
export const ThemeShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '600px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Use the "DaisyUI Theme" selector in the toolbar to see different themes
        </h3>
      </div>

      <DaisyAlert
        variant="info"
        title="Information"
        message="New features are now available in the dashboard."
        actions={
          <DaisyButton variant="info" size="sm">Learn More</DaisyButton>
        }
      />

      <DaisyAlert
        variant="success"
        title="Success"
        message="Your changes have been saved successfully."
        actions={
          <DaisyButton variant="success" size="sm">Continue</DaisyButton>
        }
      />

      <DaisyAlert
        variant="warning"
        title="Warning"
        message="Your trial period will expire in 3 days."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Remind Later</DaisyButton>
            <DaisyButton variant="warning" size="sm">Upgrade Now</DaisyButton>
          </>
        }
      />

      <DaisyAlert
        variant="error"
        title="Error"
        message="Failed to connect to the server. Please check your connection."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Cancel</DaisyButton>
            <DaisyButton variant="error" size="sm">Retry</DaisyButton>
          </>
        }
      />
    </div>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '600px' }}>
      {/* Cookie consent */}
      <DaisyAlert
        variant="info"
        title="Cookie Consent"
        message="We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Decline</DaisyButton>
            <DaisyButton variant="primary" size="sm">Accept</DaisyButton>
          </>
        }
      />

      {/* Form submission success */}
      <DaisyAlert
        variant="success"
        title="Form Submitted"
        message="Thank you for your submission. We'll get back to you within 24 hours."
        actions={
          <DaisyButton variant="success" size="sm">Close</DaisyButton>
        }
      />

      {/* Session timeout warning */}
      <DaisyAlert
        variant="warning"
        title="Session Timeout Warning"
        message="Your session will expire in 5 minutes due to inactivity."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Logout</DaisyButton>
            <DaisyButton variant="warning" size="sm">Stay Logged In</DaisyButton>
          </>
        }
      />

      {/* Network error */}
      <DaisyAlert
        variant="error"
        title="Network Error"
        message="Unable to connect to the server. Please check your internet connection and try again."
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Go Offline</DaisyButton>
            <DaisyButton variant="error" size="sm">Retry Connection</DaisyButton>
          </>
        }
      />

      {/* Maintenance notice */}
      <DaisyAlert
        variant="info"
        title="Scheduled Maintenance"
        message="The system will be unavailable on Saturday, 2AM-4AM EST for scheduled maintenance."
      />

      {/* Verification success */}
      <DaisyAlert
        variant="success"
        message="Email verified successfully! You can now access all features."
      />

      {/* Storage warning */}
      <DaisyAlert
        variant="warning"
        message="You've used 90% of your storage quota. Consider upgrading your plan."
        actions={
          <DaisyButton variant="warning" size="sm">Upgrade Plan</DaisyButton>
        }
      />

      {/* Authentication error */}
      <DaisyAlert
        variant="error"
        message="Invalid credentials. Please check your username and password."
      />
    </div>
  ),
};

// Compact variants (different widths)
export const DifferentWidths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <DaisyAlert
        variant="info"
        message="Short message"
        style={{ width: '300px' }}
      />
      <DaisyAlert
        variant="success"
        title="Medium width"
        message="This alert has a medium width for better readability."
        style={{ width: '450px' }}
      />
      <DaisyAlert
        variant="warning"
        title="Full width"
        message="This alert spans the full width of its container, making it more prominent."
        style={{ width: '700px' }}
        actions={
          <DaisyButton variant="warning" size="sm">Action</DaisyButton>
        }
      />
    </div>
  ),
};
