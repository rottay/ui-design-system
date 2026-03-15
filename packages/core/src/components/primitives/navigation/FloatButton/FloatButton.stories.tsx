/**
 * FloatButton Stories
 * Comprehensive Storybook documentation for the FloatButton component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FloatButton } from './';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof FloatButton> = {
  title: 'Primitives/Navigation/FloatButton',
  component: FloatButton,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ height: 300, position: 'relative' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The FloatButton component provides a floating action button for quick actions.

## Features
- **Icon and description**: Customizable content
- **Types**: default and primary
- **Shapes**: circle and square
- **Badge**: Support for dot or count
- **Group**: Multiple buttons with expand/collapse
- **BackTop**: Scroll to top functionality
- **Engine support**: Works with Classic (Ant Design), Modern (Tailwind), and Rustic (Vanilla)

## Usage
\`\`\`tsx
import { FloatButton } from '@rottay/design-system';

<FloatButton icon={<PlusIcon />} />

// With Group
<FloatButton.Group>
  <FloatButton icon={<EditIcon />} />
  <FloatButton icon={<DeleteIcon />} />
</FloatButton.Group>

// BackTop
<FloatButton.BackTop />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary'],
      description: 'Button type',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Button shape',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine',
    },
    onClick: {
      action: 'clicked',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FloatButton>;

const PlusIcon = () => <span style={{ fontSize: 20 }}>+</span>;
const EditIcon = () => <span style={{ fontSize: 16 }}>✎</span>;
const SearchIcon = () => <span style={{ fontSize: 16 }}>🔍</span>;
const ShareIcon = () => <span style={{ fontSize: 16 }}>↗</span>;

/**
 * Default FloatButton
 */
export const Default: Story = {
  args: {
    icon: <PlusIcon />,
  },
};

/**
 * Different types
 */
export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <FloatButton type="default" icon={<PlusIcon />} style={{ position: 'relative' }} />
      <FloatButton type="primary" icon={<PlusIcon />} style={{ position: 'relative' }} />
    </div>
  ),
};

/**
 * Different shapes
 */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <FloatButton shape="circle" icon={<PlusIcon />} style={{ position: 'relative' }} />
      <FloatButton shape="square" icon={<PlusIcon />} style={{ position: 'relative' }} />
    </div>
  ),
};

/**
 * With tooltip
 */
export const WithTooltip: Story = {
  args: {
    icon: <PlusIcon />,
    tooltip: 'Add new item',
  },
};

/**
 * With description
 */
export const WithDescription: Story = {
  render: () => (
    <FloatButton shape="square" icon={<EditIcon />} description="Edit" style={{ position: 'relative', width: 60, height: 60 }} />
  ),
};

/**
 * With badge
 */
export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <FloatButton icon={<PlusIcon />} badge={{ dot: true }} style={{ position: 'relative' }} />
      <FloatButton icon={<PlusIcon />} badge={{ count: 5 }} style={{ position: 'relative' }} />
      <FloatButton icon={<PlusIcon />} badge={{ count: 100 }} style={{ position: 'relative' }} />
    </div>
  ),
};

/**
 * As a link
 */
export const AsLink: Story = {
  args: {
    icon: <ShareIcon />,
    href: 'https://example.com',
    target: '_blank',
    tooltip: 'Open link',
  },
};

/**
 * Button Group with click trigger
 */
export const Group: Story = {
  render: () => (
    <FloatButton.Group trigger="click" icon={<PlusIcon />}>
      <FloatButton icon={<EditIcon />} tooltip="Edit" />
      <FloatButton icon={<SearchIcon />} tooltip="Search" />
      <FloatButton icon={<ShareIcon />} tooltip="Share" />
    </FloatButton.Group>
  ),
};

/**
 * Button Group with hover trigger
 */
export const GroupHover: Story = {
  render: () => (
    <FloatButton.Group trigger="hover" icon={<PlusIcon />} type="primary">
      <FloatButton icon={<EditIcon />} />
      <FloatButton icon={<SearchIcon />} />
    </FloatButton.Group>
  ),
};

/**
 * BackTop button
 */
export const BackTopButton: Story = {
  render: () => (
    <div style={{ height: 800, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
      <p>Scroll down to see the BackTop button appear.</p>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} style={{ margin: '16px 0', color: '#666' }}>Paragraph {i + 1}</p>
      ))}
      <FloatButton.BackTop visibilityHeight={100} />
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of FloatButton across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same FloatButton rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={FloatButton}
      props={{
        icon: <PlusIcon />,
        type: 'primary',
        style: { position: 'relative' },
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
    icon: <PlusIcon />,
    type: 'default',
    shape: 'circle',
    tooltip: 'Action',
  },
};
