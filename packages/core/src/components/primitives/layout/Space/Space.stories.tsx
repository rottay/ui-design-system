/**
 * Space Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Space } from './';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Space> = {
  title: 'Primitives/Layout/Space',
  component: Space,
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
        component: 'Space component for adding consistent spacing between elements with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of spacing between items',
    },
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of spacing',
    },
    wrap: {
      control: 'boolean',
      description: 'Whether to wrap items',
    },
    align: {
      control: 'select',
      options: ['start', 'end', 'center', 'baseline'],
      description: 'Alignment of items',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Space>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '8px 16px',
      backgroundColor: '#1677ff',
      color: 'white',
      borderRadius: 4,
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  args: {
    size: 'small',
  },
  render: (args) => (
    <Space {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Space>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0' }}>size: {size}</h4>
          <Space size={size}>
            <Box>Item 1</Box>
            <Box>Item 2</Box>
            <Box>Item 3</Box>
          </Space>
        </div>
      ))}
    </div>
  ),
};

export const CustomSize: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>size: 32 (number)</h4>
        <Space size={32}>
          <Box>Item 1</Box>
          <Box>Item 2</Box>
          <Box>Item 3</Box>
        </Space>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>size: [8, 24] (array)</h4>
        <Space size={[8, 24]} wrap style={{ width: 200 }}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
          <Box>D</Box>
          <Box>E</Box>
        </Space>
      </div>
    </div>
  ),
};

export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      {(['horizontal', 'vertical'] as const).map((direction) => (
        <div key={direction}>
          <h4 style={{ margin: '0 0 8px 0' }}>{direction}</h4>
          <Space direction={direction} size="middle">
            <Box>Item 1</Box>
            <Box>Item 2</Box>
            <Box>Item 3</Box>
          </Space>
        </div>
      ))}
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['start', 'end', 'center', 'baseline'] as const).map((align) => (
        <div key={align}>
          <h4 style={{ margin: '0 0 8px 0' }}>align: {align}</h4>
          <Space align={align} size="middle" style={{ backgroundColor: '#f0f0f0', padding: 8 }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#1677ff', color: 'white' }}>Small</div>
            <div style={{ padding: '16px 8px', backgroundColor: '#52c41a', color: 'white' }}>Medium</div>
            <div style={{ padding: '32px 8px', backgroundColor: '#faad14', color: 'white' }}>Large</div>
          </Space>
        </div>
      ))}
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ width: 300, backgroundColor: '#f0f0f0', padding: 8 }}>
      <Space wrap size="middle">
        {Array.from({ length: 10 }, (_, i) => (
          <Box key={i}>Item {i + 1}</Box>
        ))}
      </Space>
    </div>
  ),
};

export const WithSplit: Story = {
  render: () => (
    <Space split={<span style={{ color: '#d9d9d9' }}>|</span>} size="middle">
      <a href="#">Link 1</a>
      <a href="#">Link 2</a>
      <a href="#">Link 3</a>
    </Space>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Space across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Space rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Space}
      props={{
        children: (
          <>
            <Box>Item 1</Box>
            <Box>Item 2</Box>
            <Box>Item 3</Box>
          </>
        ),
        size: 'middle',
      }}
      showDescriptions
    />
  ),
};
