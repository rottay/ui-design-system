/**
 * Affix Stories
 * Comprehensive Storybook documentation for the Affix component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useRef } from 'react';
import { Affix } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Affix> = {
  title: 'Primitives/Navigation/Affix',
  component: Affix,
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
The Affix component makes elements stick to the viewport when scrolling past a threshold.

## Features
- **offsetTop**: Pixels from top of viewport to trigger affix
- **offsetBottom**: Pixels from bottom of viewport (overrides offsetTop)
- **target**: Custom scroll container
- **onChange**: Callback when affixed state changes
- **Engine support**: Works with Classic (Ant Design), Modern (Tailwind), and Rustic (Vanilla)

## Usage
\`\`\`tsx
import { Affix } from '@rottay/design-system';

// Basic sticky header
<Affix offsetTop={0}>
  <header>Sticky Header</header>
</Affix>

// With onChange callback
<Affix offsetTop={100} onChange={(affixed) => console.log('Affixed:', affixed)}>
  <nav>Navigation</nav>
</Affix>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    offsetTop: {
      control: { type: 'number', min: 0, max: 200, step: 10 },
      description: 'Pixels from top of viewport to trigger affix',
      defaultValue: 0,
    },
    offsetBottom: {
      control: { type: 'number', min: 0, max: 200, step: 10 },
      description: 'Pixels from bottom of viewport (overrides offsetTop)',
    },
    zIndex: {
      control: { type: 'number', min: 1, max: 100, step: 1 },
      description: 'z-index when affixed',
      defaultValue: 10,
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    onChange: {
      action: 'affixed changed',
      description: 'Callback when affixed state changes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Affix>;

// Scrollable container wrapper for stories
const ScrollContainer = ({ children, height = 400 }: { children: React.ReactNode; height?: number }) => (
  <div
    style={{
      height,
      overflow: 'auto',
      border: '1px solid #e8e8e8',
      borderRadius: 4,
      padding: 16,
    }}
  >
    {children}
  </div>
);

// Placeholder content to enable scrolling
const PlaceholderContent = ({ count = 20 }: { count?: number }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <p key={i} style={{ margin: '16px 0', color: '#666' }}>
        Scroll down to see the affix in action. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Paragraph {i + 1} of {count}.
      </p>
    ))}
  </>
);

// Styled affix content
const AffixContent = ({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warning';
}) => {
  const colors = {
    primary: { bg: '#1890ff', color: '#fff' },
    secondary: { bg: '#52c41a', color: '#fff' },
    warning: { bg: '#faad14', color: '#fff' },
  };

  return (
    <div
      style={{
        padding: '12px 24px',
        backgroundColor: colors[variant].bg,
        color: colors[variant].color,
        borderRadius: 4,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Default Affix behavior - sticks to top when scrolled
 */
export const Default: Story = {
  render: () => (
    <ScrollContainer height={300}>
      <p>Scroll down to see the affix stick to the top.</p>
      <PlaceholderContent count={3} />
      <Affix offsetTop={0}>
        <AffixContent>Sticky Content (offsetTop: 0)</AffixContent>
      </Affix>
      <PlaceholderContent count={10} />
    </ScrollContainer>
  ),
};

/**
 * Affix with offset from top
 */
export const WithOffsetTop: Story = {
  render: () => (
    <ScrollContainer height={300}>
      <p>Scroll down - the element will stick 50px from the top.</p>
      <PlaceholderContent count={3} />
      <Affix offsetTop={50}>
        <AffixContent>Sticky Content (offsetTop: 50px)</AffixContent>
      </Affix>
      <PlaceholderContent count={10} />
    </ScrollContainer>
  ),
};

/**
 * Affix fixed to bottom of viewport
 */
export const WithOffsetBottom: Story = {
  render: () => (
    <ScrollContainer height={300}>
      <PlaceholderContent count={5} />
      <Affix offsetBottom={20}>
        <AffixContent variant="secondary">Sticky Footer (offsetBottom: 20px)</AffixContent>
      </Affix>
      <PlaceholderContent count={10} />
    </ScrollContainer>
  ),
};

/**
 * Affix with onChange callback to track state
 */
export const WithOnChange: Story = {
  render: function Render() {
    const [affixed, setAffixed] = useState(false);

    return (
      <ScrollContainer height={300}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            padding: 8,
            backgroundColor: affixed ? '#f6ffed' : '#fff7e6',
            borderBottom: '1px solid #e8e8e8',
            marginBottom: 16,
            zIndex: 20,
            transition: 'background-color 0.3s',
          }}
        >
          Status: {affixed ? 'Affixed (stuck to top)' : 'Not affixed (scrolling normally)'}
        </div>
        <PlaceholderContent count={3} />
        <Affix offsetTop={50} onChange={setAffixed}>
          <AffixContent variant={affixed ? 'secondary' : 'primary'}>
            {affixed ? 'I am now affixed!' : 'Scroll to affix me'}
          </AffixContent>
        </Affix>
        <PlaceholderContent count={10} />
      </ScrollContainer>
    );
  },
};

/**
 * Custom target container for affix
 */
export const WithCustomTarget: Story = {
  render: function Render() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={containerRef}
        style={{
          height: 300,
          overflow: 'auto',
          border: '2px solid #1890ff',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <p style={{ color: '#1890ff', fontWeight: 500 }}>
          Custom scroll container (blue border)
        </p>
        <PlaceholderContent count={3} />
        <Affix offsetTop={10} target={() => containerRef.current}>
          <AffixContent>Affixed to custom container</AffixContent>
        </Affix>
        <PlaceholderContent count={10} />
      </div>
    );
  },
};

/**
 * Multiple affix elements on the same page
 */
export const MultipleAffix: Story = {
  render: () => (
    <ScrollContainer height={400}>
      <Affix offsetTop={0}>
        <AffixContent>Header (offsetTop: 0)</AffixContent>
      </Affix>
      <PlaceholderContent count={5} />
      <Affix offsetTop={60}>
        <AffixContent variant="secondary">Sub-header (offsetTop: 60px)</AffixContent>
      </Affix>
      <PlaceholderContent count={5} />
      <Affix offsetTop={120}>
        <AffixContent variant="warning">Navigation (offsetTop: 120px)</AffixContent>
      </Affix>
      <PlaceholderContent count={15} />
    </ScrollContainer>
  ),
};

/**
 * Custom z-index for layering
 */
export const CustomZIndex: Story = {
  render: () => (
    <ScrollContainer height={300}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          padding: 12,
          backgroundColor: '#ff4d4f',
          color: '#fff',
          zIndex: 5,
          marginBottom: 16,
        }}
      >
        Lower z-index (5) - will be covered
      </div>
      <PlaceholderContent count={2} />
      <Affix offsetTop={0} zIndex={20}>
        <AffixContent>Higher z-index (20) - stays on top</AffixContent>
      </Affix>
      <PlaceholderContent count={10} />
    </ScrollContainer>
  ),
};

/**
 * Affix with custom styling
 */
export const CustomStyling: Story = {
  render: () => (
    <ScrollContainer height={300}>
      <PlaceholderContent count={3} />
      <Affix
        offsetTop={20}
        className="custom-affix"
        style={{
          padding: '16px 32px',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: 8,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          CUSTOM STYLED AFFIX
        </div>
      </Affix>
      <PlaceholderContent count={10} />
    </ScrollContainer>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Affix across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Affix rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Affix}
      props={{
        offsetTop: 0,
        children: <AffixContent>Sticky Content</AffixContent>,
      }}
      showDescriptions
    />
  ),
};

/**
 * Real-world example: Sticky header with navigation
 */
export const StickyHeader: Story = {
  render: () => (
    <ScrollContainer height={400}>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1>Welcome to Our Website</h1>
        <p>Scroll down to see the sticky navigation</p>
      </div>
      <Affix offsetTop={0}>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 18 }}>Logo</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ color: '#333', cursor: 'pointer' }}>Home</span>
            <span style={{ color: '#333', cursor: 'pointer' }}>Products</span>
            <span style={{ color: '#333', cursor: 'pointer' }}>About</span>
            <span style={{ color: '#333', cursor: 'pointer' }}>Contact</span>
          </div>
        </nav>
      </Affix>
      <main style={{ padding: '24px' }}>
        <h2>Main Content</h2>
        <PlaceholderContent count={15} />
      </main>
    </ScrollContainer>
  ),
};

/**
 * Real-world example: Floating action button
 */
export const FloatingActionButton: Story = {
  render: () => (
    <ScrollContainer height={400}>
      <PlaceholderContent count={20} />
      <Affix offsetBottom={20}>
        <button
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
        >
          +
        </button>
      </Affix>
    </ScrollContainer>
  ),
};

/**
 * Real-world example: Table of contents sidebar
 */
export const TableOfContents: Story = {
  render: () => (
    <ScrollContainer height={400}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h2 id="section1">Section 1: Introduction</h2>
          <PlaceholderContent count={5} />
          <h2 id="section2">Section 2: Getting Started</h2>
          <PlaceholderContent count={5} />
          <h2 id="section3">Section 3: Advanced Usage</h2>
          <PlaceholderContent count={5} />
          <h2 id="section4">Section 4: API Reference</h2>
          <PlaceholderContent count={5} />
        </div>
        <Affix offsetTop={20}>
          <aside
            style={{
              width: 200,
              padding: 16,
              backgroundColor: '#fafafa',
              borderRadius: 8,
              border: '1px solid #e8e8e8',
            }}
          >
            <h4 style={{ margin: '0 0 12px' }}>Contents</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <span style={{ color: '#1890ff', cursor: 'pointer' }}>1. Introduction</span>
              </li>
              <li style={{ marginBottom: 8 }}>
                <span style={{ color: '#1890ff', cursor: 'pointer' }}>2. Getting Started</span>
              </li>
              <li style={{ marginBottom: 8 }}>
                <span style={{ color: '#1890ff', cursor: 'pointer' }}>3. Advanced Usage</span>
              </li>
              <li>
                <span style={{ color: '#1890ff', cursor: 'pointer' }}>4. API Reference</span>
              </li>
            </ul>
          </aside>
        </Affix>
      </div>
    </ScrollContainer>
  ),
};

/**
 * Interactive playground with controls
 */
export const Playground: Story = {
  args: {
    offsetTop: 20,
    zIndex: 10,
  },
  render: (args) => (
    <ScrollContainer height={350}>
      <p>Use the Storybook controls to adjust offsetTop and zIndex.</p>
      <PlaceholderContent count={3} />
      <Affix {...args}>
        <AffixContent>
          Playground Affix (offsetTop: {args.offsetTop}px, zIndex: {args.zIndex})
        </AffixContent>
      </Affix>
      <PlaceholderContent count={12} />
    </ScrollContainer>
  ),
};
