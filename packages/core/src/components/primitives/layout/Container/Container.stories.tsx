/**
 * Container Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Container> = {
  title: 'Primitives/Layout/Container',
  component: Container,
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
Container is a layout primitive that constrains content to a maximum width and optionally centers it.
It's commonly used as a wrapper for page content to maintain consistent margins and readable line lengths.

### Features
- Configurable maximum width (sm, md, lg, xl, 2xl, full, or custom)
- Optional horizontal centering
- Configurable padding
- Fluid mode for full-width layouts
- Support for all three engines (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Maximum width of the container',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding inside the container',
    },
    center: {
      control: 'boolean',
      description: 'Center the container horizontally',
    },
    fluid: {
      control: 'boolean',
      description: 'Container takes full width of parent',
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
type Story = StoryObj<typeof Container>;

// Helper component for visual demonstration
const ContentBlock = ({ label }: { label: string }) => (
  <div style={{
    padding: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 500,
  }}>
    {label}
  </div>
);

// Default story
export const Default: Story = {
  args: {
    maxWidth: 'lg',
    padding: 'md',
    center: true,
    children: <ContentBlock label="Default Container (lg)" />,
  },
};

// Max width variants
export const MaxWidthVariants: Story = {
  name: 'Max Width Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#f5f5f5', padding: '16px' }}>
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => (
        <Container key={size} maxWidth={size} style={{ background: '#fff' }}>
          <ContentBlock label={`maxWidth="${size}"`} />
        </Container>
      ))}
    </div>
  ),
};

// Custom max width
export const CustomMaxWidth: Story = {
  name: 'Custom Max Width',
  render: () => (
    <div style={{ background: '#f5f5f5', padding: '16px' }}>
      <Container maxWidth={800} style={{ background: '#fff' }}>
        <ContentBlock label="maxWidth={800} (800px)" />
      </Container>
    </div>
  ),
};

// Padding variants
export const PaddingVariants: Story = {
  name: 'Padding Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Container key={padding} maxWidth="md" padding={padding} style={{ background: '#e0e7ff' }}>
          <div style={{
            background: '#6366f1',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            padding="{padding}"
          </div>
        </Container>
      ))}
    </div>
  ),
};

// Center vs non-centered
export const CenteringBehavior: Story = {
  name: 'Centering Behavior',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#f5f5f5', padding: '16px' }}>
      <Container maxWidth="md" center style={{ background: '#d1fae5' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          center={'{true}'} (default) - Container is centered
        </div>
      </Container>
      <Container maxWidth="md" center={false} style={{ background: '#fee2e2' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          center={'{false}'} - Container aligns to the left
        </div>
      </Container>
    </div>
  ),
};

// Fluid container
export const FluidContainer: Story = {
  name: 'Fluid Container',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#f5f5f5', padding: '16px' }}>
      <Container maxWidth="lg" style={{ background: '#dbeafe' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          fluid={'{false}'} (default) - Constrained to maxWidth
        </div>
      </Container>
      <Container fluid style={{ background: '#fef3c7' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          fluid={'{true}'} - Takes full width regardless of maxWidth
        </div>
      </Container>
    </div>
  ),
};

// Page layout example
export const PageLayoutExample: Story = {
  name: 'Page Layout Example',
  render: () => (
    <div style={{ background: '#f5f5f5', minHeight: '400px' }}>
      {/* Header - Full width */}
      <div style={{ background: '#1f2937', color: 'white', padding: '16px 0' }}>
        <Container maxWidth="xl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Logo</span>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
            </nav>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container maxWidth="xl" padding="lg">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '24px' }}>
          <main style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
            <h1 style={{ margin: '0 0 16px 0' }}>Main Content</h1>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
              This demonstrates how Container can be used to build page layouts.
              The content is constrained to a maximum width while the background
              can extend full width.
            </p>
          </main>
          <aside style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Sidebar</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Additional content goes here.
            </p>
          </aside>
        </div>
      </Container>

      {/* Footer */}
      <div style={{ background: '#374151', color: 'white', padding: '24px 0', marginTop: '48px' }}>
        <Container maxWidth="xl">
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
            © 2024 Your Company. All rights reserved.
          </div>
        </Container>
      </div>
    </div>
  ),
};

// Nested containers
export const NestedContainers: Story = {
  name: 'Nested Containers',
  render: () => (
    <Container maxWidth="xl" padding="lg" style={{ background: '#f3f4f6' }}>
      <h2 style={{ margin: '0 0 16px 0' }}>Outer Container (xl)</h2>
      <Container maxWidth="md" padding="md" style={{ background: '#e0e7ff' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Middle Container (md)</h3>
        <Container maxWidth="sm" padding="sm" style={{ background: '#6366f1', color: 'white' }}>
          <p style={{ margin: 0, textAlign: 'center' }}>Inner Container (sm)</p>
        </Container>
      </Container>
    </Container>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Container across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Container rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Container}
      props={{
        children: (
          <div style={{
            background: '#3b82f6',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            Container Content
          </div>
        ),
        maxWidth: 'md',
        padding: 'md',
        style: { background: '#dbeafe' },
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

// Responsive content
export const ResponsiveContent: Story = {
  name: 'Responsive Content',
  render: () => (
    <Container maxWidth="lg" padding="md">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            Card {item}
          </div>
        ))}
      </div>
    </Container>
  ),
};

// Article/Blog layout
export const ArticleLayout: Story = {
  name: 'Article Layout',
  render: () => (
    <Container maxWidth="md" padding="lg">
      <article>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Building Scalable Design Systems
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Published on December 26, 2024 · 5 min read
        </p>
        <img
          src="https://picsum.photos/800/400"
          alt="Article hero"
          style={{ width: '100%', borderRadius: '8px', marginBottom: '24px' }}
        />
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#374151' }}>
          Design systems have become essential for building consistent, scalable user interfaces.
          They provide a shared language between designers and developers, ensuring that components
          look and behave the same way across an entire application.
        </p>
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#374151' }}>
          The Container component is a fundamental building block in any design system. It provides
          consistent horizontal spacing and maximum widths, making content readable on all screen sizes.
        </p>
        <blockquote style={{
          borderLeft: '4px solid #6366f1',
          paddingLeft: '24px',
          margin: '32px 0',
          fontStyle: 'italic',
          color: '#4b5563',
        }}>
          "A good design system removes the need to think about mundane decisions, freeing designers
          and developers to focus on solving real problems."
        </blockquote>
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#374151' }}>
          By using the Container component consistently, you ensure that all pages in your application
          have proper margins and readable line lengths, regardless of the viewport size.
        </p>
      </article>
    </Container>
  ),
};
