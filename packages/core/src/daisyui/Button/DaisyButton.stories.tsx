import type { Meta, StoryObj } from '@storybook/react';
import { DaisyButton } from './DaisyButton';

const meta: Meta<typeof DaisyButton> = {
  title: 'DaisyUI/DaisyButton',
  component: DaisyButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DaisyUI Button component with Tailwind CSS classes. Use the **DaisyUI Theme** selector in the toolbar to see different themes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost', 'link', 'info', 'success', 'warning', 'error'],
      description: 'Button variant/color',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Button size',
    },
    outline: {
      control: 'boolean',
      description: 'Outline style',
    },
    glass: {
      control: 'boolean',
      description: 'Glass effect',
    },
    wide: {
      control: 'boolean',
      description: 'Wide button',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    shape: {
      control: 'select',
      options: ['square', 'circle'],
      description: 'Button shape',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DaisyButton>;

// Default button
export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <DaisyButton>Default</DaisyButton>
      <DaisyButton variant="primary">Primary</DaisyButton>
      <DaisyButton variant="secondary">Secondary</DaisyButton>
      <DaisyButton variant="accent">Accent</DaisyButton>
      <DaisyButton variant="ghost">Ghost</DaisyButton>
      <DaisyButton variant="link">Link</DaisyButton>
      <DaisyButton variant="info">Info</DaisyButton>
      <DaisyButton variant="success">Success</DaisyButton>
      <DaisyButton variant="warning">Warning</DaisyButton>
      <DaisyButton variant="error">Error</DaisyButton>
    </div>
  ),
};

// Outline style
export const Outline: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <DaisyButton outline>Default</DaisyButton>
      <DaisyButton variant="primary" outline>Primary</DaisyButton>
      <DaisyButton variant="secondary" outline>Secondary</DaisyButton>
      <DaisyButton variant="accent" outline>Accent</DaisyButton>
      <DaisyButton variant="info" outline>Info</DaisyButton>
      <DaisyButton variant="success" outline>Success</DaisyButton>
      <DaisyButton variant="warning" outline>Warning</DaisyButton>
      <DaisyButton variant="error" outline>Error</DaisyButton>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <DaisyButton variant="primary" size="xs">Extra Small</DaisyButton>
      <DaisyButton variant="primary" size="sm">Small</DaisyButton>
      <DaisyButton variant="primary" size="md">Medium</DaisyButton>
      <DaisyButton variant="primary" size="lg">Large</DaisyButton>
    </div>
  ),
};

// Loading state
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <DaisyButton loading>Loading</DaisyButton>
      <DaisyButton variant="primary" loading>Loading</DaisyButton>
      <DaisyButton variant="secondary" loading>Loading</DaisyButton>
      <DaisyButton variant="accent" loading>Loading</DaisyButton>
    </div>
  ),
};

// Glass effect
export const Glass: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px' }}>
      <DaisyButton glass>Glass</DaisyButton>
      <DaisyButton variant="primary" glass>Glass Primary</DaisyButton>
      <DaisyButton variant="secondary" glass>Glass Secondary</DaisyButton>
      <DaisyButton variant="accent" glass>Glass Accent</DaisyButton>
    </div>
  ),
};

// Shapes
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <DaisyButton variant="primary" shape="square">SQ</DaisyButton>
      <DaisyButton variant="primary" shape="circle">C</DaisyButton>
      <DaisyButton variant="secondary" shape="square" size="lg">SQ</DaisyButton>
      <DaisyButton variant="secondary" shape="circle" size="lg">C</DaisyButton>
    </div>
  ),
};

// Wide buttons
export const Wide: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px' }}>
      <DaisyButton variant="primary" wide>Wide Button</DaisyButton>
      <DaisyButton variant="secondary" wide>Wide Button</DaisyButton>
      <DaisyButton variant="accent" wide>Wide Button</DaisyButton>
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <DaisyButton disabled>Disabled</DaisyButton>
      <DaisyButton variant="primary" disabled>Primary Disabled</DaisyButton>
      <DaisyButton variant="secondary" disabled>Secondary Disabled</DaisyButton>
      <DaisyButton variant="accent" disabled>Accent Disabled</DaisyButton>
    </div>
  ),
};

// Theme showcase - shows how button looks in current selected theme
export const ThemeShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Use the "DaisyUI Theme" selector in the toolbar to see different themes
        </h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <DaisyButton variant="primary">Primary</DaisyButton>
        <DaisyButton variant="secondary">Secondary</DaisyButton>
        <DaisyButton variant="accent">Accent</DaisyButton>
        <DaisyButton variant="info">Info</DaisyButton>
        <DaisyButton variant="success">Success</DaisyButton>
        <DaisyButton variant="warning">Warning</DaisyButton>
        <DaisyButton variant="error">Error</DaisyButton>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <DaisyButton variant="primary" outline>Primary</DaisyButton>
        <DaisyButton variant="secondary" outline>Secondary</DaisyButton>
        <DaisyButton variant="accent" outline>Accent</DaisyButton>
        <DaisyButton variant="ghost">Ghost</DaisyButton>
        <DaisyButton variant="link">Link</DaisyButton>
      </div>
    </div>
  ),
};
