/**
 * Alert Component Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Alert> = {
  title: 'Primitives/Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'The type of alert',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the icon',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the alert can be closed',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    message: 'This is an informational message',
    type: 'info',
  },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" message="Info Alert" description="This is an info alert" />
      <Alert type="success" message="Success Alert" description="This is a success alert" />
      <Alert type="warning" message="Warning Alert" description="This is a warning alert" />
      <Alert type="error" message="Error Alert" description="This is an error alert" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    type: 'success',
    message: 'Success!',
    description: 'Your operation was completed successfully. You can now proceed with the next step.',
  },
};

export const Closable: Story = {
  args: {
    type: 'warning',
    message: 'This alert can be closed',
    description: 'Click the X button to dismiss this alert.',
    closable: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    type: 'info',
    message: 'Alert without icon',
    showIcon: false,
  },
};

export const CustomIcon: Story = {
  args: {
    type: 'info',
    message: 'Custom icon alert',
    icon: <span>🎉</span>,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Alert across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Alert rendered by Classic (Ant Design), Modern (token skin), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Alert}
      props={{ type: 'success', message: 'Success Alert', description: 'This is a success alert message.', closable: true }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all types across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Alert}
      baseProps={{ message: 'Alert Message', description: 'This is an alert description.' }}
      variantProp="type"
      variants={['info', 'success', 'warning', 'error']}
    />
  ),
};

// ============================================================================
// Modern Engine Craft Stories
// ============================================================================

/**
 * Compact vs spacious density on the modern engine, both tones dismissible.
 */
export const ModernDensity: Story = {
  name: '🧱 Modern Density',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert engine="modern" compact type="success" closable message="Compact success" description="Reduced padding and type for dense toolbars." />
      <Alert engine="modern" type="warning" closable message="Spacious warning" description="Default posture with the full icon well, governed tint surface and relaxed line-height for long-form guidance copy that wraps across multiple lines without crowding the dismiss control." />
    </div>
  ),
};

/**
 * Overlong content must wrap cleanly: the icon well and dismiss control stay
 * pinned to the start edge, the body never slides under either control.
 */
export const ModernLongContent: Story = {
  name: '📏 Modern Long Content',
  render: () => (
    <Alert
      engine="modern"
      type="error"
      closable
      message="Synchronization failed for the quarterly compliance evidence package after three automatic retries"
      description="The remote archive rejected the transfer because the session certificate expired while the payload was streaming. Renew the certificate from the security console, then resume the synchronization from the operations dashboard — no local changes will be lost in the meantime."
    />
  ),
};

/**
 * RTL smoke test: logical properties keep icon/text/dismiss order mirrored.
 */
export const ModernRTL: Story = {
  name: '🔄 Modern RTL',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert engine="modern" type="info" closable message="اكتملت المراجعة" description="تم حفظ جميع التغييرات في مساحة العمل المشتركة ويمكن للفريق الاطلاع عليها الآن." />
      <Alert engine="modern" type="success" message="تم الرفع بنجاح" description="تم رفع حزمة الأدلة الفصلية وأصبحت جاهزة للمراجعة النهائية من قبل مدير الامتثال." />
    </div>
  ),
};
