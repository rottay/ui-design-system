/**
 * BackTop Stories
 * Comprehensive Storybook documentation for the BackTop component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef } from 'react';
import { BackTop } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof BackTop> = {
  title: 'Primitives/Navigation/BackTop',
  component: BackTop,
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
The BackTop component provides a button that scrolls to the top of the page when clicked.

## Features
- **visibilityHeight**: Scroll position threshold to show the button
- **target**: Custom scroll container
- **duration**: Animation duration for scrolling
- **Custom content**: Supports custom icon or content
- **Engine support**: Works with Classic (Ant Design), Modern (Tailwind), and Rustic (Vanilla)

## Usage
\`\`\`tsx
import { BackTop } from '@rottay/bootstrap';

<BackTop />

// With custom visibility height
<BackTop visibilityHeight={200} />

// With custom content
<BackTop>
  <div>Back to Top</div>
</BackTop>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    visibilityHeight: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Scroll height to show button',
      defaultValue: 400,
    },
    duration: {
      control: { type: 'number', min: 100, max: 2000, step: 50 },
      description: 'Animation duration in ms',
      defaultValue: 450,
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when button is clicked',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackTop>;

const ScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: 400,
      overflow: 'auto',
      border: '1px solid #e8e8e8',
      borderRadius: 8,
      padding: 16,
      position: 'relative',
    }}
  >
    {children}
  </div>
);

const LongContent = () => (
  <>
    {Array.from({ length: 50 }, (_, i) => (
      <p key={i} style={{ margin: '16px 0', color: '#666' }}>
        Scroll down to see the BackTop button appear. This is paragraph {i + 1}.
      </p>
    ))}
  </>
);

/**
 * Default BackTop - appears after scrolling 400px
 */
export const Default: Story = {
  render: () => (
    <ScrollContainer>
      <p>Scroll down in this container to see the BackTop button.</p>
      <LongContent />
      <BackTop />
    </ScrollContainer>
  ),
};

/**
 * Custom visibility height
 */
export const CustomVisibilityHeight: Story = {
  render: () => (
    <ScrollContainer>
      <p>This BackTop appears after scrolling only 100px.</p>
      <LongContent />
      <BackTop visibilityHeight={100} />
    </ScrollContainer>
  ),
};

/**
 * Custom content instead of default icon
 */
export const CustomContent: Story = {
  render: () => (
    <ScrollContainer>
      <p>BackTop with custom content.</p>
      <LongContent />
      <BackTop>
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#52c41a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          UP
        </div>
      </BackTop>
    </ScrollContainer>
  ),
};

/**
 * With custom scroll target
 */
export const WithCustomTarget: Story = {
  render: function Render() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={containerRef}
        style={{
          height: 400,
          overflow: 'auto',
          border: '2px solid #1890ff',
          borderRadius: 8,
          padding: 16,
          position: 'relative',
        }}
      >
        <p style={{ color: '#1890ff', fontWeight: 500 }}>
          Custom scroll container (blue border)
        </p>
        <LongContent />
        <BackTop target={() => containerRef.current!} />
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of BackTop across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same BackTop rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={BackTop}
      props={{
        visibilityHeight: 50,
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
    visibilityHeight: 400,
    duration: 450,
  },
  render: (args) => (
    <ScrollContainer>
      <p>Use the Storybook controls to adjust BackTop behavior.</p>
      <LongContent />
      <BackTop {...args} />
    </ScrollContainer>
  ),
};
