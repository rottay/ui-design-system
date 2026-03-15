/**
 * Watermark Stories
 * Colocated with component following approved architecture.
 *
 * @module Watermark/stories
 * @description Storybook stories for the Watermark component demonstrating
 * all features, variants, and engine implementations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Watermark } from './';
import { DesignSystemProvider } from '../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Watermark component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Watermark> = {
  title: 'Primitives/Overlay/Watermark',
  component: Watermark,
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
Watermark component for adding visual watermarks to content.
Supports text and image watermarks with customizable styling.

**Features:**
- Text or image watermarks
- Multiple lines of text
- Customizable rotation angle
- Configurable gap and offset
- Font customization (color, size, weight, family)
- Responsive sizing
- Z-index control
- Three engine implementations (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'Watermark text content (string or array of strings)',
    },
    image: {
      control: 'text',
      description: 'URL of the watermark image',
    },
    width: {
      control: 'number',
      description: 'Width of the watermark',
    },
    height: {
      control: 'number',
      description: 'Height of the watermark',
    },
    rotate: {
      control: { type: 'range', min: -180, max: 180 },
      description: 'Rotation angle of the watermark',
    },
    zIndex: {
      control: 'number',
      description: 'Z-index of the watermark overlay',
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
type Story = StoryObj<typeof Watermark>;

const sampleContent = (
  <div
    style={{
      height: '300px',
      padding: '24px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
    }}
  >
    <h3 style={{ marginTop: 0 }}>Document Content</h3>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris.
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident.
    </p>
  </div>
);

/**
 * Default watermark with text content.
 */
export const Default: Story = {
  args: {
    content: 'Watermark',
    children: sampleContent,
  },
};

/**
 * Multiple lines of text.
 */
export const MultiLineText: Story = {
  args: {
    content: ['Company Name', 'Confidential'],
    children: sampleContent,
  },
};

/**
 * Custom rotation angle.
 */
export const CustomRotation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Watermark content="Rotated -45°" rotate={-45}>
        <div style={{ height: '200px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Content with -45° rotation watermark</p>
        </div>
      </Watermark>
      <Watermark content="Rotated 0°" rotate={0}>
        <div style={{ height: '200px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Content with 0° rotation watermark (horizontal)</p>
        </div>
      </Watermark>
      <Watermark content="Rotated 45°" rotate={45}>
        <div style={{ height: '200px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Content with 45° rotation watermark</p>
        </div>
      </Watermark>
    </div>
  ),
};

/**
 * Font customization.
 */
export const FontCustomization: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Watermark
        content="Default Font"
      >
        <div style={{ height: '150px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Default font settings</p>
        </div>
      </Watermark>
      <Watermark
        content="Large Blue"
        font={{ color: 'rgba(0, 0, 255, 0.15)', fontSize: 24, fontWeight: 'bold' }}
      >
        <div style={{ height: '150px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Large blue bold font</p>
        </div>
      </Watermark>
      <Watermark
        content="Small Red"
        font={{ color: 'rgba(255, 0, 0, 0.1)', fontSize: 12 }}
      >
        <div style={{ height: '150px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Small red font</p>
        </div>
      </Watermark>
    </div>
  ),
};

/**
 * Custom gap between watermarks.
 */
export const CustomGap: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Watermark content="Dense" gap={[50, 50]}>
        <div style={{ height: '200px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Dense watermark pattern (gap: 50x50)</p>
        </div>
      </Watermark>
      <Watermark content="Sparse" gap={[200, 200]}>
        <div style={{ height: '200px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <p>Sparse watermark pattern (gap: 200x200)</p>
        </div>
      </Watermark>
    </div>
  ),
};

/**
 * Custom offset.
 */
export const CustomOffset: Story = {
  args: {
    content: 'Offset Watermark',
    offset: [100, 50],
    children: sampleContent,
  },
};

/**
 * With image watermark.
 */
export const WithImage: Story = {
  render: () => (
    <Watermark
      image="https://via.placeholder.com/100x50?text=LOGO"
      width={100}
      height={50}
    >
      {sampleContent}
    </Watermark>
  ),
};

/**
 * Custom dimensions.
 */
export const CustomDimensions: Story = {
  args: {
    content: 'Wide Watermark',
    width: 200,
    height: 40,
    children: sampleContent,
  },
};

/**
 * High z-index.
 */
export const HighZIndex: Story = {
  args: {
    content: 'Above Everything',
    zIndex: 9999,
    children: (
      <div style={{ position: 'relative', height: '300px', padding: '24px', backgroundColor: '#f5f5f5' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '24px', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 }}>
          Modal Content (z-index: 100)
        </div>
        <p>Background content</p>
      </div>
    ),
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Watermark across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Watermark rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Watermark}
      props={{
        content: 'Watermark',
        children: (
          <div style={{ height: '150px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <p>Content with watermark overlay</p>
          </div>
        ),
      }}
      showDescriptions
    />
  ),
};

/**
 * Real-world example: Document preview.
 */
export const DocumentPreview: Story = {
  render: () => (
    <Watermark
      content={['CONFIDENTIAL', 'Do Not Distribute']}
      font={{ color: 'rgba(255, 0, 0, 0.08)', fontSize: 18, fontWeight: 'bold' }}
      rotate={-30}
      gap={[150, 150]}
    >
      <div
        style={{
          maxWidth: '600px',
          padding: '32px',
          backgroundColor: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Quarterly Financial Report</h2>
        <h4>Q4 2024 Summary</h4>
        <p>
          This document contains confidential financial information for internal
          use only. The data presented herein is subject to change and should not
          be distributed without proper authorization.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #333', padding: '8px' }}>Metric</th>
              <th style={{ textAlign: 'right', borderBottom: '2px solid #333', padding: '8px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Revenue</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>$1,234,567</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Expenses</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>$876,543</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Net Profit</td>
              <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'right', color: 'green' }}>$358,024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Watermark>
  ),
};

/**
 * Real-world example: Image gallery.
 */
export const ImageGallery: Story = {
  render: () => (
    <Watermark
      content="© 2024 My Studio"
      font={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}
      rotate={0}
      gap={[150, 150]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              backgroundColor: `hsl(${i * 60}, 70%, 80%)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            Image {i}
          </div>
        ))}
      </div>
    </Watermark>
  ),
};
