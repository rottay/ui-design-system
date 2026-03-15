/**
 * Stack Stories
 * Comprehensive Storybook stories for the Stack component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../';
import { DesignSystemProvider } from '../../../../../design-system';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Layout/Stack',
  component: Stack,
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
Stack is a layout primitive for stacking elements vertically or horizontally with configurable spacing and alignment.

### Features
- Vertical and horizontal stacking via \`direction\` prop
- Flexible spacing with preset values or numeric pixels via \`spacing\`/\`gap\` props
- Cross-axis alignment with \`align\` prop (start, center, end, stretch, baseline)
- Main-axis justification with \`justify\` prop (start, center, end, space-between, space-around, space-evenly)
- Optional wrapping with \`wrap\` prop
- Custom or default dividers between items via \`divider\` prop
- Polymorphic rendering with \`as\` prop
- Reverse order with \`reverse\` prop
- Support for all three engines (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'span', 'section', 'article', 'nav', 'ul', 'ol'],
      description: 'HTML element to render as',
    },
    direction: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Stack direction',
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Spacing between items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Cross-axis alignment',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Main-axis justification',
    },
    wrap: {
      control: 'boolean',
      description: 'Enable wrapping',
    },
    reverse: {
      control: 'boolean',
      description: 'Reverse item order',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Take full width of container',
    },
    fullHeight: {
      control: 'boolean',
      description: 'Take full height of container',
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
type Story = StoryObj<typeof Stack>;

// Helper component for visual items
const Item = ({ children, color = '#6366f1' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      padding: '12px 24px',
      backgroundColor: color,
      color: 'white',
      borderRadius: '8px',
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

// Default story
export const Default: Story = {
  args: {
    spacing: 'md',
    children: (
      <>
        <Item>Item 1</Item>
        <Item>Item 2</Item>
        <Item>Item 3</Item>
      </>
    ),
  },
};

// Direction variants
export const DirectionVertical: Story = {
  name: 'Direction: Vertical',
  render: () => (
    <Stack direction="vertical" spacing="md">
      <Item>First</Item>
      <Item>Second</Item>
      <Item>Third</Item>
    </Stack>
  ),
};

export const DirectionHorizontal: Story = {
  name: 'Direction: Horizontal',
  render: () => (
    <Stack direction="horizontal" spacing="md">
      <Item>First</Item>
      <Item>Second</Item>
      <Item>Third</Item>
    </Stack>
  ),
};

// Spacing variants
export const SpacingSizes: Story = {
  name: 'Spacing Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((spacing) => (
        <div key={spacing}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            spacing="{spacing}"
          </h4>
          <Stack direction="horizontal" spacing={spacing}>
            <Item color="#3b82f6">A</Item>
            <Item color="#3b82f6">B</Item>
            <Item color="#3b82f6">C</Item>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const NumericSpacing: Story = {
  name: 'Numeric Spacing (pixels)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {[8, 16, 24, 32, 48].map((gap) => (
        <div key={gap}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            gap={`{${gap}}`} ({gap}px)
          </h4>
          <Stack direction="horizontal" gap={gap}>
            <Item color="#10b981">A</Item>
            <Item color="#10b981">B</Item>
            <Item color="#10b981">C</Item>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

// Alignment variants
export const AlignmentOptions: Story = {
  name: 'Alignment Options',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <div key={align}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            align="{align}"
          </h4>
          <Stack
            direction="horizontal"
            spacing="md"
            align={align}
            style={{ height: '100px', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '8px' }}
          >
            <Item color="#8b5cf6">Short</Item>
            <Item color="#8b5cf6" style={{ padding: '24px' }}>Tall</Item>
            <Item color="#8b5cf6">Medium</Item>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

// Justification variants
export const JustificationOptions: Story = {
  name: 'Justification Options',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const).map((justify) => (
        <div key={justify}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            justify="{justify}"
          </h4>
          <Stack
            direction="horizontal"
            spacing="md"
            justify={justify}
            fullWidth
            style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '8px' }}
          >
            <Item color="#ec4899">A</Item>
            <Item color="#ec4899">B</Item>
            <Item color="#ec4899">C</Item>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

// Wrap behavior
export const WrapBehavior: Story = {
  name: 'Wrap Behavior',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          wrap={'{false}'} (default)
        </h4>
        <Stack
          direction="horizontal"
          spacing="md"
          wrap={false}
          style={{ maxWidth: '300px', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '8px' }}
        >
          <Item color="#f59e0b">One</Item>
          <Item color="#f59e0b">Two</Item>
          <Item color="#f59e0b">Three</Item>
          <Item color="#f59e0b">Four</Item>
          <Item color="#f59e0b">Five</Item>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          wrap={'{true}'}
        </h4>
        <Stack
          direction="horizontal"
          spacing="md"
          wrap
          style={{ maxWidth: '300px', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '8px' }}
        >
          <Item color="#f59e0b">One</Item>
          <Item color="#f59e0b">Two</Item>
          <Item color="#f59e0b">Three</Item>
          <Item color="#f59e0b">Four</Item>
          <Item color="#f59e0b">Five</Item>
        </Stack>
      </div>
    </div>
  ),
};

// Reverse order
export const ReverseOrder: Story = {
  name: 'Reverse Order',
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Vertical (normal)
        </h4>
        <Stack direction="vertical" spacing="sm">
          <Item color="#06b6d4">1</Item>
          <Item color="#06b6d4">2</Item>
          <Item color="#06b6d4">3</Item>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Vertical (reversed)
        </h4>
        <Stack direction="vertical" spacing="sm" reverse>
          <Item color="#06b6d4">1</Item>
          <Item color="#06b6d4">2</Item>
          <Item color="#06b6d4">3</Item>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Horizontal (normal)
        </h4>
        <Stack direction="horizontal" spacing="sm">
          <Item color="#06b6d4">1</Item>
          <Item color="#06b6d4">2</Item>
          <Item color="#06b6d4">3</Item>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Horizontal (reversed)
        </h4>
        <Stack direction="horizontal" spacing="sm" reverse>
          <Item color="#06b6d4">1</Item>
          <Item color="#06b6d4">2</Item>
          <Item color="#06b6d4">3</Item>
        </Stack>
      </div>
    </div>
  ),
};

// Dividers
export const DefaultDivider: Story = {
  name: 'Default Divider',
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Vertical with divider
        </h4>
        <Stack direction="vertical" spacing="md" divider>
          <Item color="#14b8a6">Section 1</Item>
          <Item color="#14b8a6">Section 2</Item>
          <Item color="#14b8a6">Section 3</Item>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Horizontal with divider
        </h4>
        <Stack direction="horizontal" spacing="md" divider style={{ height: '60px' }}>
          <Item color="#14b8a6">A</Item>
          <Item color="#14b8a6">B</Item>
          <Item color="#14b8a6">C</Item>
        </Stack>
      </div>
    </div>
  ),
};

export const CustomDivider: Story = {
  name: 'Custom Divider',
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Custom React element
        </h4>
        <Stack
          direction="horizontal"
          spacing="md"
          align="center"
          divider={<span style={{ color: '#9ca3af', fontSize: '20px' }}>|</span>}
        >
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
          Icon divider
        </h4>
        <Stack
          direction="horizontal"
          spacing="md"
          align="center"
          divider={<span style={{ color: '#ec4899' }}>{">"}</span>}
        >
          <span>Dashboard</span>
          <span>Settings</span>
          <span>Profile</span>
        </Stack>
      </div>
    </div>
  ),
};

// Polymorphic elements
export const PolymorphicElements: Story = {
  name: 'Polymorphic Elements',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Stack as="nav" direction="horizontal" spacing="lg" style={{ padding: '16px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Products</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
      </Stack>
      <Stack as="ul" direction="vertical" spacing="sm" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <li style={{ padding: '8px 16px', backgroundColor: '#e0e7ff', borderRadius: '4px' }}>List Item 1</li>
        <li style={{ padding: '8px 16px', backgroundColor: '#e0e7ff', borderRadius: '4px' }}>List Item 2</li>
        <li style={{ padding: '8px 16px', backgroundColor: '#e0e7ff', borderRadius: '4px' }}>List Item 3</li>
      </Stack>
      <Stack as="article" direction="vertical" spacing="md" style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h3 style={{ margin: 0 }}>Article Title</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>This is article content rendered inside a Stack component using as="article".</p>
      </Stack>
    </div>
  ),
};

// Full width and height
export const FullDimensions: Story = {
  name: 'Full Width & Height',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', height: '200px' }}>
      <div style={{ width: '300px', border: '2px dashed #d1d5db', borderRadius: '8px' }}>
        <Stack fullWidth spacing="md" style={{ backgroundColor: '#fef3c7', padding: '8px' }}>
          <Item color="#f59e0b">Full Width</Item>
          <Item color="#f59e0b">Stack</Item>
        </Stack>
      </div>
      <div style={{ width: '150px', height: '200px', border: '2px dashed #d1d5db', borderRadius: '8px' }}>
        <Stack fullHeight spacing="md" justify="space-between" style={{ backgroundColor: '#dcfce7', padding: '8px' }}>
          <Item color="#22c55e">Top</Item>
          <Item color="#22c55e">Bottom</Item>
        </Stack>
      </div>
      <div style={{ width: '200px', height: '200px', border: '2px dashed #d1d5db', borderRadius: '8px' }}>
        <Stack fullWidth fullHeight spacing="md" align="center" justify="center" style={{ backgroundColor: '#dbeafe', padding: '8px' }}>
          <Item color="#3b82f6">Centered</Item>
          <Item color="#3b82f6">Both</Item>
        </Stack>
      </div>
    </div>
  ),
};

// Nested stacks
export const NestedStacks: Story = {
  name: 'Nested Stacks',
  render: () => (
    <Stack spacing="lg" style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
      <h3 style={{ margin: 0 }}>Dashboard</h3>
      <Stack direction="horizontal" spacing="lg" wrap>
        <Stack spacing="md" style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
          <h4 style={{ margin: 0, color: '#3b82f6' }}>Revenue</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>$24,500</div>
          <div style={{ color: '#10b981', fontSize: '14px' }}>+12% from last month</div>
        </Stack>
        <Stack spacing="md" style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
          <h4 style={{ margin: 0, color: '#8b5cf6' }}>Users</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1,234</div>
          <div style={{ color: '#10b981', fontSize: '14px' }}>+5% from last month</div>
        </Stack>
        <Stack spacing="md" style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
          <h4 style={{ margin: 0, color: '#ec4899' }}>Orders</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>856</div>
          <div style={{ color: '#ef4444', fontSize: '14px' }}>-3% from last month</div>
        </Stack>
      </Stack>
    </Stack>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Stack across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Stack rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Stack}
      props={{
        children: (
          <>
            <Item>Item 1</Item>
            <Item color="#10b981">Item 2</Item>
            <Item color="#8b5cf6">Item 3</Item>
          </>
        ),
        direction: 'horizontal',
        spacing: 'md',
        align: 'center',
      }}
      showDescriptions
    />
  ),
};

// Real-world examples
export const NavigationBar: Story = {
  name: 'Real World: Navigation Bar',
  render: () => (
    <Stack
      as="nav"
      direction="horizontal"
      spacing="lg"
      align="center"
      justify="space-between"
      fullWidth
      style={{
        padding: '16px 24px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px',
      }}
    >
      <Stack direction="horizontal" spacing="sm" align="center">
        <div style={{ width: '32px', height: '32px', backgroundColor: '#6366f1', borderRadius: '8px' }} />
        <span style={{ fontWeight: 600, fontSize: '18px' }}>Brand</span>
      </Stack>
      <Stack direction="horizontal" spacing="md" align="center">
        <a href="#" style={{ color: '#4b5563', textDecoration: 'none' }}>Home</a>
        <a href="#" style={{ color: '#4b5563', textDecoration: 'none' }}>Features</a>
        <a href="#" style={{ color: '#4b5563', textDecoration: 'none' }}>Pricing</a>
        <a href="#" style={{ color: '#4b5563', textDecoration: 'none' }}>About</a>
      </Stack>
      <Stack direction="horizontal" spacing="sm">
        <button style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>
          Log in
        </button>
        <button style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>
          Sign up
        </button>
      </Stack>
    </Stack>
  ),
};

export const FormLayout: Story = {
  name: 'Real World: Form Layout',
  render: () => (
    <Stack spacing="lg" style={{ maxWidth: '400px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: 0 }}>Contact Us</h3>
      <Stack spacing="md">
        <Stack spacing="xs">
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </Stack>
        <Stack spacing="xs">
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </Stack>
        <Stack spacing="xs">
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Message</label>
          <textarea
            placeholder="Enter your message"
            rows={4}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
          />
        </Stack>
      </Stack>
      <button style={{ padding: '12px 24px', border: 'none', borderRadius: '6px', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 500 }}>
        Send Message
      </button>
    </Stack>
  ),
};

export const CardGrid: Story = {
  name: 'Real World: Card Grid',
  render: () => (
    <Stack direction="horizontal" spacing="lg" wrap>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Stack
          key={n}
          spacing="md"
          style={{
            width: '250px',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              height: '120px',
              backgroundColor: `hsl(${n * 40}, 70%, 60%)`,
              borderRadius: '8px',
            }}
          />
          <h4 style={{ margin: 0 }}>Card Title {n}</h4>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            This is a card description with some sample text content.
          </p>
          <Stack direction="horizontal" spacing="sm" justify="end">
            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontSize: '12px' }}>
              Details
            </button>
            <button style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
              Action
            </button>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
