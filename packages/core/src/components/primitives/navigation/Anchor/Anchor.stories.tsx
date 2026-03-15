/**
 * Anchor Stories
 * Comprehensive Storybook documentation for the Anchor component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Anchor } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Anchor> = {
  title: 'Primitives/Navigation/Anchor',
  component: Anchor,
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
The Anchor component provides navigation within a page by linking to different sections.

## Features
- **Nested links**: Support for hierarchical navigation
- **Scroll tracking**: Automatically highlights current section
- **Affix mode**: Sticky positioning during scroll
- **Direction**: Vertical or horizontal layout
- **Engine support**: Works with Classic (Ant Design), Modern (Tailwind), and Rustic (Vanilla)

## Usage
\`\`\`tsx
import { Anchor } from '@rottay/bootstrap';

<Anchor>
  <Anchor.Link href="#section1" title="Section 1" />
  <Anchor.Link href="#section2" title="Section 2" />
  <Anchor.Link href="#section3" title="Section 3">
    <Anchor.Link href="#section3-1" title="Section 3.1" />
  </Anchor.Link>
</Anchor>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction',
    },
    affix: {
      control: 'boolean',
      description: 'Sticky positioning',
    },
    offsetTop: {
      control: { type: 'number', min: 0, max: 200, step: 10 },
      description: 'Offset from top when affixed',
    },
    bounds: {
      control: { type: 'number', min: 0, max: 100, step: 5 },
      description: 'Bounds for active detection',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine',
    },
    onChange: {
      action: 'active changed',
      description: 'Callback when active link changes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Anchor>;

const ScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 24 }}>
    <div style={{ flex: 1, height: 400, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
      {children}
    </div>
  </div>
);

const SectionContent = ({ id, title }: { id: string; title: string }) => (
  <div id={id} style={{ marginBottom: 32, padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
    <h2>{title}</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.</p>
  </div>
);

/**
 * Default Anchor with vertical layout
 */
export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Anchor style={{ width: 120 }}>
        <Anchor.Link href="#introduction" title="Introduction" />
        <Anchor.Link href="#features" title="Features" />
        <Anchor.Link href="#usage" title="Usage" />
        <Anchor.Link href="#api" title="API" />
      </Anchor>
      <div style={{ flex: 1, height: 400, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
        <SectionContent id="introduction" title="Introduction" />
        <SectionContent id="features" title="Features" />
        <SectionContent id="usage" title="Usage" />
        <SectionContent id="api" title="API Reference" />
      </div>
    </div>
  ),
};

/**
 * Nested links for hierarchical navigation
 */
export const NestedLinks: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Anchor style={{ width: 150 }}>
        <Anchor.Link href="#getting-started" title="Getting Started">
          <Anchor.Link href="#installation" title="Installation" />
          <Anchor.Link href="#configuration" title="Configuration" />
        </Anchor.Link>
        <Anchor.Link href="#advanced" title="Advanced">
          <Anchor.Link href="#customization" title="Customization" />
          <Anchor.Link href="#theming" title="Theming" />
        </Anchor.Link>
      </Anchor>
      <div style={{ flex: 1, height: 400, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
        <SectionContent id="getting-started" title="Getting Started" />
        <SectionContent id="installation" title="Installation" />
        <SectionContent id="configuration" title="Configuration" />
        <SectionContent id="advanced" title="Advanced" />
        <SectionContent id="customization" title="Customization" />
        <SectionContent id="theming" title="Theming" />
      </div>
    </div>
  ),
};

/**
 * Horizontal layout
 */
export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Anchor direction="horizontal">
        <Anchor.Link href="#tab1" title="Tab 1" />
        <Anchor.Link href="#tab2" title="Tab 2" />
        <Anchor.Link href="#tab3" title="Tab 3" />
        <Anchor.Link href="#tab4" title="Tab 4" />
      </Anchor>
      <div style={{ height: 300, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
        <SectionContent id="tab1" title="Tab 1 Content" />
        <SectionContent id="tab2" title="Tab 2 Content" />
        <SectionContent id="tab3" title="Tab 3 Content" />
        <SectionContent id="tab4" title="Tab 4 Content" />
      </div>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Anchor across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Anchor rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Anchor}
      props={{
        direction: 'horizontal',
        children: (
          <>
            <Anchor.Link href="#section-1" title="Section 1" />
            <Anchor.Link href="#section-2" title="Section 2" />
            <Anchor.Link href="#section-3" title="Section 3" />
          </>
        ),
      }}
      showDescriptions
    />
  ),
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    direction: 'vertical',
    affix: false,
    offsetTop: 0,
    bounds: 5,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Anchor {...args} style={{ width: 120 }}>
        <Anchor.Link href="#section-a" title="Section A" />
        <Anchor.Link href="#section-b" title="Section B" />
        <Anchor.Link href="#section-c" title="Section C" />
      </Anchor>
      <div style={{ flex: 1, height: 400, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
        <SectionContent id="section-a" title="Section A" />
        <SectionContent id="section-b" title="Section B" />
        <SectionContent id="section-c" title="Section C" />
      </div>
    </div>
  ),
};
