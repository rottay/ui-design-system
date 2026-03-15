/**
 * Divider Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '../';
import { DesignSystemProvider } from '../../../../../design-system';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Layout/Divider',
  component: Divider,
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
Divider is a visual separator component that can be used to divide content sections.

### Features
- Horizontal and vertical orientations
- Solid, dashed, and dotted line variants
- Optional text content with customizable position
- Thickness presets (thin, medium, thick) or custom pixel values
- Spacing presets for margin control
- Custom color support
- Plain text mode without styling
- Support for all three engines (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider line',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Visual style of the divider line',
    },
    dashed: {
      control: 'boolean',
      description: 'Shorthand for variant="dashed"',
    },
    textPosition: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Position of text content',
    },
    plain: {
      control: 'boolean',
      description: 'Display text without styling',
    },
    thickness: {
      control: 'select',
      options: ['thin', 'medium', 'thick', 1, 2, 3, 4, 5],
      description: 'Thickness of the divider line',
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spacing (margin) around the divider',
    },
    color: {
      control: 'color',
      description: 'Custom color for the divider line',
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
type Story = StoryObj<typeof Divider>;

// Default story
export const Default: Story = {
  args: {},
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <p>Content above the divider</p>
      <Divider {...args} />
      <p>Content below the divider</p>
    </div>
  ),
};

// Horizontal orientation (default)
export const Horizontal: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>First section</p>
      <Divider orientation="horizontal" />
      <p>Second section</p>
      <Divider orientation="horizontal" />
      <p>Third section</p>
    </div>
  ),
};

// Vertical orientation
export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: '100px', padding: '20px' }}>
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Middle</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

// Variant styles
export const Variants: Story = {
  name: 'Line Variants',
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>Solid (default)</p>
      <Divider variant="solid" />
      <p>Dashed</p>
      <Divider variant="dashed" />
      <p>Dotted</p>
      <Divider variant="dotted" />
      <p>Using dashed prop shorthand</p>
      <Divider dashed />
    </div>
  ),
};

// With text content
export const WithText: Story = {
  name: 'With Text Content',
  render: () => (
    <div style={{ padding: '20px' }}>
      <Divider>Section Title</Divider>
      <p>Some content here...</p>
      <Divider>OR</Divider>
      <p>Alternative content...</p>
      <Divider>Continue Reading</Divider>
    </div>
  ),
};

// Text position variants
export const TextPositions: Story = {
  name: 'Text Positions',
  render: () => (
    <div style={{ padding: '20px' }}>
      <Divider textPosition="left">Left Aligned</Divider>
      <p>Some content...</p>
      <Divider textPosition="center">Center Aligned (default)</Divider>
      <p>Some content...</p>
      <Divider textPosition="right">Right Aligned</Divider>
    </div>
  ),
};

// Plain text mode
export const PlainText: Story = {
  name: 'Plain Text Mode',
  render: () => (
    <div style={{ padding: '20px', fontSize: '14px' }}>
      <Divider plain={false}>Styled Text (default)</Divider>
      <p>Notice the styled text above with custom font weight and size.</p>
      <Divider plain>Plain Text</Divider>
      <p>The text above inherits the parent styling.</p>
    </div>
  ),
};

// Thickness variants
export const Thickness: Story = {
  name: 'Line Thickness',
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>Thin (1px - default)</p>
      <Divider thickness="thin" />
      <p>Medium (2px)</p>
      <Divider thickness="medium" />
      <p>Thick (3px)</p>
      <Divider thickness="thick" />
      <p>Custom (5px)</p>
      <Divider thickness={5} />
    </div>
  ),
};

// Spacing variants
export const Spacing: Story = {
  name: 'Spacing/Margin',
  render: () => (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '10px' }}>
        <p>spacing="none"</p>
        <Divider spacing="none" />
        <p>No margin around divider</p>
      </div>
      <div style={{ background: 'white', padding: '10px', marginTop: '20px' }}>
        <p>spacing="xs"</p>
        <Divider spacing="xs" />
        <p>Extra small margin</p>
      </div>
      <div style={{ background: 'white', padding: '10px', marginTop: '20px' }}>
        <p>spacing="md" (default)</p>
        <Divider spacing="md" />
        <p>Medium margin</p>
      </div>
      <div style={{ background: 'white', padding: '10px', marginTop: '20px' }}>
        <p>spacing="xl"</p>
        <Divider spacing="xl" />
        <p>Extra large margin</p>
      </div>
    </div>
  ),
};

// Custom colors
export const CustomColors: Story = {
  name: 'Custom Colors',
  render: () => (
    <div style={{ padding: '20px' }}>
      <Divider color="#3b82f6">Blue Divider</Divider>
      <p>Content</p>
      <Divider color="#10b981">Green Divider</Divider>
      <p>Content</p>
      <Divider color="#ef4444">Red Divider</Divider>
      <p>Content</p>
      <Divider color="#8b5cf6">Purple Divider</Divider>
    </div>
  ),
};

// Combined features
export const CombinedFeatures: Story = {
  name: 'Combined Features',
  render: () => (
    <div style={{ padding: '20px' }}>
      <Divider
        variant="dashed"
        textPosition="left"
        thickness="medium"
        color="#3b82f6"
      >
        Custom Styled Divider
      </Divider>
      <p>This divider combines multiple customization options.</p>

      <Divider
        variant="dotted"
        textPosition="right"
        thickness="thick"
        color="#10b981"
        spacing="lg"
        plain
      >
        Another Custom Style
      </Divider>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Divider across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Divider rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Divider}
      props={{
        children: 'Section Divider',
      }}
      showDescriptions
    />
  ),
};

// Use case: Login form
export const LoginFormExample: Story = {
  name: 'Example: Login Form',
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Sign In</h3>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="email"
          placeholder="Email"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="password"
          placeholder="Password"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
      </div>
      <button
        style={{
          width: '100%',
          padding: '10px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Sign In
      </button>

      <Divider spacing="lg">OR</Divider>

      <button
        style={{
          width: '100%',
          padding: '10px',
          background: 'white',
          color: '#333',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Continue with Google
      </button>
    </div>
  ),
};

// Use case: Card sections
export const CardSectionsExample: Story = {
  name: 'Example: Card Sections',
  render: () => (
    <div
      style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>Order Summary</h3>
      <p style={{ margin: '0', color: '#666' }}>Review your order details</p>

      <Divider spacing="md" />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span>Subtotal</span>
        <span>$99.00</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span>Shipping</span>
        <span>$5.00</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span>Tax</span>
        <span>$8.32</span>
      </div>

      <Divider dashed spacing="sm" />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Total</span>
        <span>$112.32</span>
      </div>
    </div>
  ),
};

// Use case: Navigation
export const NavigationExample: Story = {
  name: 'Example: Inline Navigation',
  render: () => (
    <nav style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
      <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Home</a>
      <Divider orientation="vertical" spacing="sm" />
      <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Products</a>
      <Divider orientation="vertical" spacing="sm" />
      <a href="#" style={{ textDecoration: 'none', color: '#333' }}>About</a>
      <Divider orientation="vertical" spacing="sm" />
      <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Contact</a>
    </nav>
  ),
};

// Accessibility
export const Accessibility: Story = {
  name: 'Accessibility Features',
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>
        The Divider component includes proper accessibility attributes:
      </p>
      <ul style={{ marginBottom: '16px' }}>
        <li><code>role="separator"</code> - Indicates the element is a separator</li>
        <li><code>aria-orientation</code> - Indicates horizontal or vertical orientation</li>
        <li>Lines are marked with <code>aria-hidden="true"</code> when text is present</li>
      </ul>
      <Divider>Accessible Divider</Divider>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Inspect the element to see the accessibility attributes.
      </p>
    </div>
  ),
};

// Type prop (alias for orientation)
export const TypeAlias: Story = {
  name: 'Type Prop (Alias)',
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>Using <code>type</code> prop as alias for <code>orientation</code>:</p>
      <Divider type="horizontal">Horizontal (type prop)</Divider>
      <div style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
        <span>Left</span>
        <Divider type="vertical" />
        <span>Right</span>
      </div>
    </div>
  ),
};

// Responsive usage
export const ResponsiveUsage: Story = {
  name: 'Responsive Usage',
  render: () => (
    <div style={{ padding: '20px' }}>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Dividers automatically adapt to container width. Vertical dividers adapt to container height.
      </p>
      <div style={{ width: '100%' }}>
        <Divider>Full Width</Divider>
      </div>
      <div style={{ width: '50%', marginTop: '16px' }}>
        <Divider>50% Width Container</Divider>
      </div>
      <div style={{ width: '25%', marginTop: '16px' }}>
        <Divider>25% Width</Divider>
      </div>
    </div>
  ),
};
