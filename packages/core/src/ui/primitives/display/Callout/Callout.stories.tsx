/**
 * Callout Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

const meta: Meta<typeof Callout> = {
  title: 'Primitives/Display/Callout',
  component: Callout,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ maxWidth: 500 }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    title: 'Information',
    children: 'This is an informational callout with useful details.',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Callout variant="info" title="Info">
        This is an informational message.
      </Callout>
      <Callout variant="success" title="Success">
        The operation completed successfully.
      </Callout>
      <Callout variant="warning" title="Warning">
        Please review the changes before proceeding.
      </Callout>
      <Callout variant="error" title="Error">
        Something went wrong. Please try again.
      </Callout>
    </div>
  ),
};

export const Closable: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissable',
    children: 'You can close this callout.',
    closable: true,
  },
};

export const WithAction: Story = {
  args: {
    variant: 'info',
    title: 'New Update Available',
    children: 'Version 2.0 is ready. Update now for new features.',
    action: <button style={{ fontSize: 13, padding: '4px 12px', cursor: 'pointer' }}>Update Now</button>,
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    children: 'File uploaded successfully. It will be processed shortly.',
  },
};

// ============================================================================
// Modern Engine Craft Stories
// ============================================================================

/**
 * Full hierarchy on the modern engine: icon well, title, wrapped body,
 * action tray and dismiss control across two tones.
 */
export const ModernHierarchy: Story = {
  name: '🧱 Modern Hierarchy',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Callout
        engine="modern"
        variant="warning"
        closable
        title="Certificate expiring in 14 days"
        action={<button style={{ fontSize: 13, padding: '4px 12px', cursor: 'pointer' }}>Renew now</button>}
      >
        The TLS certificate for the evidence archive expires soon. Renew it before the deadline to avoid
        interrupted synchronization for every workspace in this tenant.
      </Callout>
      <Callout
        engine="modern"
        variant="error"
        closable
        title="Payment method declined by the issuing bank during the automated monthly renewal"
        action={<button style={{ fontSize: 13, padding: '4px 12px', cursor: 'pointer' }}>Update billing</button>}
      >
        We retried the default card three times over the past 48 hours. Update the billing profile to keep
        premium features active; all data and configurations are preserved for 30 days regardless.
      </Callout>
    </div>
  ),
};

/**
 * RTL smoke test: icon well, body and close control mirror cleanly.
 */
export const ModernRTL: Story = {
  name: '🔄 Modern RTL',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Callout engine="modern" variant="info" closable title="تحديث متاح">
        يتوفر إصدار جديد من لوحة التحكم مع تحسينات على سرعة التحميل ودقة التقارير.
      </Callout>
      <Callout engine="modern" variant="success" title="تم الحفظ">
        تم حفظ جميع التغييرات ومشاركتها مع فريق المراجعة.
      </Callout>
    </div>
  ),
};
