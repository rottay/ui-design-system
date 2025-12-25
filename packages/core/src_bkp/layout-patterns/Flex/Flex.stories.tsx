import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from './Flex';

const meta = {
  title: 'Layout Patterns/Flex',
  component: Flex,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Flex direction',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Align items',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Justify content',
    },
    wrap: {
      control: 'boolean',
      description: 'Whether children should wrap',
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between children',
    },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children, color = '#1890ff' }: { children: React.ReactNode; color?: string }) => (
  <div style={{ backgroundColor: color, color: 'white', padding: '1rem', borderRadius: '4px', minWidth: '80px', textAlign: 'center' }}>
    {children}
  </div>
);

export const Default: Story = {
  args: {
    direction: 'row',
    gap: 'md',
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: 'column',
    gap: 'md',
    children: (
      <>
        <Box>First</Box>
        <Box>Second</Box>
        <Box>Third</Box>
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'space-between',
    align: 'center',
    style: { border: '2px dashed #d9d9d9', padding: '1rem' },
    children: (
      <>
        <Box>Left</Box>
        <Box>Center</Box>
        <Box>Right</Box>
      </>
    ),
  },
};

export const Centered: Story = {
  args: {
    direction: 'row',
    justify: 'center',
    align: 'center',
    style: { border: '2px dashed #d9d9d9', padding: '2rem', minHeight: '200px' },
    children: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎯</div>
        <h3 style={{ margin: 0 }}>Perfectly Centered</h3>
      </div>
    ),
  },
};

export const WithWrap: Story = {
  args: {
    direction: 'row',
    wrap: true,
    gap: 'md',
    style: { maxWidth: '400px', border: '2px dashed #d9d9d9', padding: '1rem' },
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
        <Box>Item 7</Box>
        <Box>Item 8</Box>
      </>
    ),
  },
};

export const JustifyVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Justify: start</h3>
        <Flex justify="start" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#1890ff">A</Box>
          <Box color="#1890ff">B</Box>
          <Box color="#1890ff">C</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: center</h3>
        <Flex justify="center" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#52c41a">A</Box>
          <Box color="#52c41a">B</Box>
          <Box color="#52c41a">C</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: end</h3>
        <Flex justify="end" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#722ed1">A</Box>
          <Box color="#722ed1">B</Box>
          <Box color="#722ed1">C</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: space-between</h3>
        <Flex justify="space-between" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#fa8c16">A</Box>
          <Box color="#fa8c16">B</Box>
          <Box color="#fa8c16">C</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: space-around</h3>
        <Flex justify="space-around" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#eb2f96">A</Box>
          <Box color="#eb2f96">B</Box>
          <Box color="#eb2f96">C</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: space-evenly</h3>
        <Flex justify="space-evenly" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <Box color="#13c2c2">A</Box>
          <Box color="#13c2c2">B</Box>
          <Box color="#13c2c2">C</Box>
        </Flex>
      </div>
    </div>
  ),
};

export const AlignVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Align: start</h3>
        <Flex align="start" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <Box color="#1890ff">Small</Box>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <Box color="#1890ff">Small</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: center</h3>
        <Flex align="center" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <Box color="#52c41a">Small</Box>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <Box color="#52c41a">Small</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: end</h3>
        <Flex align="end" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <Box color="#722ed1">Small</Box>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>Large</div>
          <Box color="#722ed1">Small</Box>
        </Flex>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: stretch</h3>
        <Flex align="stretch" gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem', minHeight: '120px' }}>
          <Box color="#fa8c16">Stretched</Box>
          <Box color="#fa8c16">Stretched</Box>
          <Box color="#fa8c16">Stretched</Box>
        </Flex>
      </div>
    </div>
  ),
};
