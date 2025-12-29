/**
 * Flex Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';
import React from 'react';

const meta: Meta<typeof Flex> = {
  title: 'Primitives/Layout/Flex',
  component: Flex,
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
        component: 'Flex container component with multi-engine support for flexbox layouts.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Flex direction',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
    justify: {
      control: 'select',
      options: ['start', 'end', 'center', 'between', 'around', 'evenly'],
      description: 'Justify content alignment',
    },
    align: {
      control: 'select',
      options: ['start', 'end', 'center', 'baseline', 'stretch'],
      description: 'Align items alignment',
    },
    gap: {
      control: 'number',
      description: 'Gap between items in pixels',
    },
    inline: {
      control: 'boolean',
      description: 'Use inline-flex instead of flex',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Flex>;

const Box = ({ children, color = '#1677ff', style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) => (
  <div
    style={{
      padding: '16px 24px',
      backgroundColor: color,
      color: 'white',
      borderRadius: 4,
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  args: {
    gap: 8,
  },
  render: (args) => (
    <Flex {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Flex>
  ),
};

export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['row', 'row-reverse', 'column', 'column-reverse'] as const).map((direction) => (
        <div key={direction}>
          <h4 style={{ margin: '0 0 8px 0' }}>{direction}</h4>
          <Flex direction={direction} gap={8}>
            <Box>1</Box>
            <Box color="#52c41a">2</Box>
            <Box color="#faad14">3</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
};

export const JustifyContent: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['start', 'end', 'center', 'between', 'around', 'evenly'] as const).map((justify) => (
        <div key={justify}>
          <h4 style={{ margin: '0 0 8px 0' }}>justify: {justify}</h4>
          <Flex justify={justify} gap={8} style={{ backgroundColor: '#f0f0f0', padding: 8 }}>
            <Box>1</Box>
            <Box color="#52c41a">2</Box>
            <Box color="#faad14">3</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
};

export const AlignItems: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['start', 'end', 'center', 'baseline', 'stretch'] as const).map((align) => (
        <div key={align}>
          <h4 style={{ margin: '0 0 8px 0' }}>align: {align}</h4>
          <Flex
            align={align}
            gap={8}
            style={{ backgroundColor: '#f0f0f0', padding: 8, height: 100 }}
          >
            <Box>Short</Box>
            <Box color="#52c41a" style={{ padding: '32px 24px' }}>
              Tall
            </Box>
            <Box color="#faad14">Medium</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
};

export const Gap: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[0, 8, 16, 24, 32].map((gap) => (
        <div key={gap}>
          <h4 style={{ margin: '0 0 8px 0' }}>gap: {gap}px</h4>
          <Flex gap={gap} style={{ backgroundColor: '#f0f0f0', padding: 8 }}>
            <Box>1</Box>
            <Box color="#52c41a">2</Box>
            <Box color="#faad14">3</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['nowrap', 'wrap', 'wrap-reverse'] as const).map((wrap) => (
        <div key={wrap}>
          <h4 style={{ margin: '0 0 8px 0' }}>wrap: {wrap}</h4>
          <Flex
            wrap={wrap}
            gap={8}
            style={{ backgroundColor: '#f0f0f0', padding: 8, width: 300 }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Box key={n}>{n}</Box>
            ))}
          </Flex>
        </div>
      ))}
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <div>
      <p>
        Text before{' '}
        <Flex inline gap={4} align="center">
          <Box>Inline</Box>
          <Box color="#52c41a">Flex</Box>
        </Flex>{' '}
        text after.
      </p>
    </div>
  ),
};

export const CombinedLayout: Story = {
  render: () => (
    <Flex direction="column" gap={16}>
      <Flex justify="between" align="center" style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
        <Box>Logo</Box>
        <Flex gap={8}>
          <Box color="#52c41a">Nav 1</Box>
          <Box color="#faad14">Nav 2</Box>
          <Box color="#ff4d4f">Nav 3</Box>
        </Flex>
      </Flex>
      <Flex gap={16} style={{ height: 200 }}>
        <Flex
          direction="column"
          gap={8}
          style={{ backgroundColor: '#f5f5f5', padding: 16, width: 200 }}
        >
          <Box>Sidebar 1</Box>
          <Box color="#52c41a">Sidebar 2</Box>
        </Flex>
        <Flex flex={1} justify="center" align="center" style={{ backgroundColor: '#fafafa' }}>
          <Box color="#722ed1">Main Content</Box>
        </Flex>
      </Flex>
    </Flex>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Flex across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Flex rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Flex}
      props={{
        children: (
          <>
            <Box>Item 1</Box>
            <Box color="#52c41a">Item 2</Box>
            <Box color="#faad14">Item 3</Box>
          </>
        ),
        gap: 8,
        justify: 'center',
        align: 'center',
      }}
      showDescriptions
    />
  ),
};
