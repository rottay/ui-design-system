import type { Meta, StoryObj } from '@storybook/react';
import { DaisyCard } from './DaisyCard';
import { DaisyButton } from '../Button/DaisyButton';

const meta: Meta<typeof DaisyCard> = {
  title: 'DaisyUI/DaisyCard',
  component: DaisyCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DaisyUI Card component with Tailwind CSS classes. Use the **DaisyUI Theme** selector in the toolbar to see different themes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['normal', 'bordered', 'compact'],
      description: 'Card variant style',
    },
    imagePosition: {
      control: 'select',
      options: ['top', 'side'],
      description: 'Image position relative to content',
    },
    shadow: {
      control: 'boolean',
      description: 'Add shadow effect',
    },
    glass: {
      control: 'boolean',
      description: 'Glass effect (translucent)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DaisyCard>;

// Default card
export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a simple card with title and description.',
  },
};

// Card with image
export const WithImage: Story = {
  args: {
    title: 'Card with Image',
    description: 'Card featuring an image at the top.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
  },
};

// Card with actions
export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    description: 'This card includes action buttons at the bottom.',
    actions: (
      <>
        <DaisyButton variant="ghost" size="sm">Cancel</DaisyButton>
        <DaisyButton variant="primary" size="sm">Confirm</DaisyButton>
      </>
    ),
  },
};

// Complete card with image and actions
export const Complete: Story = {
  args: {
    title: 'Product Card',
    description: 'Premium running shoes with advanced cushioning technology.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    actions: (
      <>
        <DaisyButton variant="ghost" size="sm">Details</DaisyButton>
        <DaisyButton variant="primary" size="sm">Buy Now</DaisyButton>
      </>
    ),
  },
};

// Variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
      <DaisyCard
        title="Normal Card"
        description="This is a normal card variant."
        variant="normal"
        style={{ width: '280px' }}
      />
      <DaisyCard
        title="Bordered Card"
        description="This card has a border."
        variant="bordered"
        style={{ width: '280px' }}
      />
      <DaisyCard
        title="Compact Card"
        description="This is a compact card variant with less padding."
        variant="compact"
        style={{ width: '280px' }}
      />
    </div>
  ),
};

// Shadow effect
export const Shadow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
      <DaisyCard
        title="Without Shadow"
        description="Card without shadow effect."
        style={{ width: '280px' }}
      />
      <DaisyCard
        title="With Shadow"
        description="Card with shadow effect for depth."
        shadow
        style={{ width: '280px' }}
      />
    </div>
  ),
};

// Glass effect
export const Glass: Story = {
  render: () => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px',
      borderRadius: '8px',
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      <DaisyCard
        title="Glass Card"
        description="Translucent card with glass effect."
        glass
        style={{ width: '280px' }}
        actions={
          <DaisyButton variant="primary" size="sm" glass>
            Action
          </DaisyButton>
        }
      />
      <DaisyCard
        title="Glass with Image"
        description="Glass effect works great with images."
        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop"
        glass
        style={{ width: '280px' }}
      />
    </div>
  ),
};

// Image positions
export const ImagePositions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
      <DaisyCard
        title="Image on Top"
        description="Image positioned at the top of the card."
        image="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop"
        imagePosition="top"
        shadow
        style={{ width: '280px' }}
      />
      <DaisyCard
        title="Image on Side"
        description="Image positioned on the side of the card."
        image="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&h=300&fit=crop"
        imagePosition="side"
        shadow
        style={{ width: '400px' }}
      />
    </div>
  ),
};

// Theme showcase
export const ThemeShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Use the "DaisyUI Theme" selector in the toolbar to see different themes
        </h3>
      </div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <DaisyCard
          title="Normal Card"
          description="Standard card in current theme."
          variant="normal"
          shadow
          style={{ width: '280px' }}
          actions={
            <DaisyButton variant="primary" size="sm">Action</DaisyButton>
          }
        />
        <DaisyCard
          title="Bordered Card"
          description="Card with border in current theme."
          variant="bordered"
          shadow
          style={{ width: '280px' }}
          actions={
            <DaisyButton variant="secondary" size="sm">Action</DaisyButton>
          }
        />
        <DaisyCard
          title="Card with Image"
          description="Image card in current theme."
          image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
          shadow
          style={{ width: '280px' }}
          actions={
            <DaisyButton variant="accent" size="sm">Action</DaisyButton>
          }
        />
      </div>
    </div>
  ),
};

// E-commerce example
export const EcommerceExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
      <DaisyCard
        title="Running Shoes"
        description="$129.99 - Premium athletic footwear"
        image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
        variant="bordered"
        shadow
        style={{ width: '280px' }}
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Details</DaisyButton>
            <DaisyButton variant="primary" size="sm">Add to Cart</DaisyButton>
          </>
        }
      />
      <DaisyCard
        title="Smart Watch"
        description="$399.99 - Latest fitness tracker"
        image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
        variant="bordered"
        shadow
        style={{ width: '280px' }}
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Details</DaisyButton>
            <DaisyButton variant="primary" size="sm">Add to Cart</DaisyButton>
          </>
        }
      />
      <DaisyCard
        title="Backpack"
        description="$79.99 - Durable travel companion"
        image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
        variant="bordered"
        shadow
        style={{ width: '280px' }}
        actions={
          <>
            <DaisyButton variant="ghost" size="sm">Details</DaisyButton>
            <DaisyButton variant="primary" size="sm">Add to Cart</DaisyButton>
          </>
        }
      />
    </div>
  ),
};
