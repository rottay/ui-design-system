import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta = {
  title: 'Layout Patterns/Container',
  component: Container,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Maximum width of the container',
    },
    padding: {
      control: 'boolean',
      description: 'Whether to add horizontal padding',
    },
    centered: {
      control: 'boolean',
      description: 'Whether to center the container with auto margins',
    },
    fluid: {
      control: 'boolean',
      description: 'Whether to make container full width (ignores size)',
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: '#1890ff',
      color: 'white',
      padding: '2rem',
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  args: {
    size: 'lg',
    children: (
      <DemoBox>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Default Container</h2>
        <p style={{ margin: 0 }}>
          This container has a max-width of 1280px (size: lg) and is centered on the page.
        </p>
      </DemoBox>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Container size="xs">
        <DemoBox>
          <strong>xs</strong> - 640px max-width
        </DemoBox>
      </Container>
      <Container size="sm">
        <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>sm</strong> - 768px max-width
        </div>
      </Container>
      <Container size="md">
        <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>md</strong> - 1024px max-width
        </div>
      </Container>
      <Container size="lg">
        <div style={{ backgroundColor: '#fa8c16', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>lg</strong> - 1280px max-width
        </div>
      </Container>
      <Container size="xl">
        <div style={{ backgroundColor: '#eb2f96', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>xl</strong> - 1536px max-width
        </div>
      </Container>
      <Container size="2xl">
        <div style={{ backgroundColor: '#13c2c2', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>2xl</strong> - 1600px max-width
        </div>
      </Container>
      <Container size="full">
        <div style={{ backgroundColor: '#f5222d', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <strong>full</strong> - 100% width
        </div>
      </Container>
    </div>
  ),
};

export const WithoutPadding: Story = {
  args: {
    size: 'lg',
    padding: false,
    children: (
      <div
        style={{
          backgroundColor: '#f0f0f0',
          border: '2px dashed #d9d9d9',
          padding: '2rem',
        }}
      >
        <p style={{ margin: 0 }}>
          This container has no horizontal padding. Content extends to the edges.
        </p>
      </div>
    ),
  },
};

export const NotCentered: Story = {
  args: {
    size: 'md',
    centered: false,
    children: (
      <DemoBox>
        <p style={{ margin: 0 }}>
          This container is not centered. It aligns to the left side of its parent.
        </p>
      </DemoBox>
    ),
  },
};

export const Fluid: Story = {
  args: {
    size: 'lg',
    fluid: true,
    children: (
      <DemoBox>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Fluid Container</h2>
        <p style={{ margin: 0 }}>
          This container spans the full width of its parent, regardless of the size prop.
        </p>
      </DemoBox>
    ),
  },
};
