/**
 * QRCode Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QRCode } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof QRCode> = {
  title: 'Primitives/Display/QRCode',
  component: QRCode,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
QRCode component for generating and displaying QR codes.

## Features
- Multiple render engines (Classic/Ant Design, Modern/DaisyUI, Rustic/Vanilla)
- Customizable size, colors, and error correction levels
- Support for center icons/logos
- Status states (active, loading, expired, scanned)
- Bordered and borderless variants

## Usage
\`\`\`tsx
import { QRCode } from '@es-rottay/designsystem-core';

<QRCode value="https://example.com" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The value to encode in the QR code',
    },
    size: {
      control: { type: 'range', min: 80, max: 400, step: 20 },
      description: 'Size of the QR code in pixels',
    },
    color: {
      control: 'color',
      description: 'Foreground color of the QR code',
    },
    bgColor: {
      control: 'color',
      description: 'Background color of the QR code',
    },
    errorLevel: {
      control: 'select',
      options: ['L', 'M', 'Q', 'H'],
      description: 'Error correction level',
    },
    status: {
      control: 'select',
      options: ['active', 'loading', 'expired', 'scanned'],
      description: 'Current status of the QR code',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show a border around the QR code',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QRCode>;

/**
 * Default QRCode example showing basic usage.
 */
export const Default: Story = {
  args: {
    value: 'https://rottay.com',
    size: 160,
  },
};

/**
 * QRCode with a center icon/logo.
 */
export const WithIcon: Story = {
  args: {
    value: 'https://rottay.com',
    icon: 'https://via.placeholder.com/32',
    size: 200,
    errorLevel: 'H', // Higher error correction needed when using icon
  },
};

/**
 * Different sizes of QR codes.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" size={80} />
        <p style={{ marginTop: 8, fontSize: 12 }}>80px</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" size={120} />
        <p style={{ marginTop: 8, fontSize: 12 }}>120px</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" size={160} />
        <p style={{ marginTop: 8, fontSize: 12 }}>160px (default)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" size={200} />
        <p style={{ marginTop: 8, fontSize: 12 }}>200px</p>
      </div>
    </div>
  ),
};

/**
 * Custom colors for the QR code.
 */
export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <QRCode value="https://rottay.com" color="#1890ff" bgColor="#e6f7ff" />
      <QRCode value="https://rottay.com" color="#52c41a" bgColor="#f6ffed" />
      <QRCode value="https://rottay.com" color="#722ed1" bgColor="#f9f0ff" />
      <QRCode value="https://rottay.com" color="#ff4d4f" bgColor="#fff1f0" />
    </div>
  ),
};

/**
 * Error correction levels comparison.
 */
export const ErrorLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['L', 'M', 'Q', 'H'] as const).map((level) => (
        <div key={level} style={{ textAlign: 'center' }}>
          <QRCode value="https://rottay.com" errorLevel={level} />
          <p style={{ marginTop: 8, fontSize: 12 }}>Level {level}</p>
        </div>
      ))}
    </div>
  ),
};

/**
 * Different status states.
 */
export const StatusStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" status="active" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Active</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" status="loading" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Loading</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode
          value="https://rottay.com"
          status="expired"
          onRefresh={() => alert('Refresh clicked!')}
        />
        <p style={{ marginTop: 8, fontSize: 12 }}>Expired</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" status="scanned" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Scanned</p>
      </div>
    </div>
  ),
};

/**
 * Bordered vs borderless QR codes.
 */
export const BorderVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" bordered={true} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Bordered (default)</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" bordered={false} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Borderless</p>
      </div>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of QRCode across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same QRCode rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={QRCode}
      props={{
        value: 'https://rottay.com',
        size: 160,
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all status variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all QRCode status variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={QRCode}
      baseProps={{
        value: 'https://rottay.com',
        size: 120,
      }}
      variantProp="status"
      variants={['active', 'loading', 'expired', 'scanned']}
    />
  ),
};

/**
 * QRCode for different content types.
 */
export const ContentTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="https://rottay.com" />
        <p style={{ marginTop: 8, fontSize: 12 }}>URL</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="tel:+1234567890" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Phone</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="mailto:hello@rottay.com" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Email</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <QRCode value="Hello, World!" />
        <p style={{ marginTop: 8, fontSize: 12 }}>Plain Text</p>
      </div>
    </div>
  ),
};
