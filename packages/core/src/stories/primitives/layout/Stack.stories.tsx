/**
 * Stack Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../../components/primitives/layout/Stack';
import { Box } from '../../../components/primitives/layout/Box';
import { DesignSystemProvider } from '../../../system/providers/root';

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
        component: 'Stack component for vertical/horizontal layouts with consistent spacing.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stack>;

const SampleBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    style={{
      padding: 16,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      textAlign: 'center',
    }}
  >
    {children}
  </Box>
);

export const Vertical: Story = {
  render: () => (
    <Stack direction="vertical" gap="md">
      <SampleBox>Item 1</SampleBox>
      <SampleBox>Item 2</SampleBox>
      <SampleBox>Item 3</SampleBox>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack direction="horizontal" gap="md">
      <SampleBox>Item 1</SampleBox>
      <SampleBox>Item 2</SampleBox>
      <SampleBox>Item 3</SampleBox>
    </Stack>
  ),
};

export const GapSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4>XS Gap</h4>
        <Stack direction="horizontal" gap="xs">
          <SampleBox>A</SampleBox>
          <SampleBox>B</SampleBox>
          <SampleBox>C</SampleBox>
        </Stack>
      </div>
      <div>
        <h4>MD Gap</h4>
        <Stack direction="horizontal" gap="md">
          <SampleBox>A</SampleBox>
          <SampleBox>B</SampleBox>
          <SampleBox>C</SampleBox>
        </Stack>
      </div>
      <div>
        <h4>XL Gap</h4>
        <Stack direction="horizontal" gap="xl">
          <SampleBox>A</SampleBox>
          <SampleBox>B</SampleBox>
          <SampleBox>C</SampleBox>
        </Stack>
      </div>
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Titan</h4>
        <Stack engine="titan" direction="horizontal" gap="sm">
          <SampleBox>1</SampleBox>
          <SampleBox>2</SampleBox>
          <SampleBox>3</SampleBox>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Hermes</h4>
        <Stack engine="hermes" direction="horizontal" gap="sm">
          <SampleBox>1</SampleBox>
          <SampleBox>2</SampleBox>
          <SampleBox>3</SampleBox>
        </Stack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Apollo</h4>
        <Stack engine="apollo" direction="horizontal" gap="sm">
          <SampleBox>1</SampleBox>
          <SampleBox>2</SampleBox>
          <SampleBox>3</SampleBox>
        </Stack>
      </div>
    </div>
  ),
};
