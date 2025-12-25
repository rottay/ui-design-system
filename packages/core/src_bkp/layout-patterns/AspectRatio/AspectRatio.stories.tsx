import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './AspectRatio';

const meta = {
  title: 'Layout Patterns/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'select',
      options: ['square', 'video', 'portrait', 'landscape', 'ultrawide'],
      description: 'Aspect ratio preset or custom number',
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = {
  args: {
    ratio: 'square',
    style: { maxWidth: '400px' },
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        1:1 Square
      </div>
    ),
  },
};

export const Video: Story = {
  args: {
    ratio: 'video',
    style: { maxWidth: '800px' },
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        <div>16:9 Video</div>
        <div style={{ fontSize: '14px', marginTop: '0.5rem', opacity: 0.9 }}>
          Perfect for YouTube and widescreen content
        </div>
      </div>
    ),
  },
};

export const Portrait: Story = {
  args: {
    ratio: 'portrait',
    style: { maxWidth: '300px' },
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        3:4 Portrait
      </div>
    ),
  },
};

export const Landscape: Story = {
  args: {
    ratio: 'landscape',
    style: { maxWidth: '600px' },
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        4:3 Landscape
      </div>
    ),
  },
};

export const Ultrawide: Story = {
  args: {
    ratio: 'ultrawide',
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        21:9 Ultrawide
      </div>
    ),
  },
};

export const CustomRatio: Story = {
  args: {
    ratio: 2.5,
    style: { maxWidth: '800px' },
    children: (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Custom 2.5:1
      </div>
    ),
  },
};

export const WithImage: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <AspectRatio ratio="video">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0), linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '18px',
          }}
        >
          Image Placeholder (16:9)
        </div>
      </AspectRatio>
    </div>
  ),
};

export const WithIframe: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <AspectRatio ratio="video">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>▶</div>
            <div>Video Player (16:9)</div>
            <div style={{ fontSize: '14px', marginTop: '0.5rem', opacity: 0.7 }}>
              Replace this with an iframe for actual video
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 1
        </div>
      </AspectRatio>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 2
        </div>
      </AspectRatio>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 3
        </div>
      </AspectRatio>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#fa8c16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 4
        </div>
      </AspectRatio>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#eb2f96', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 5
        </div>
      </AspectRatio>
      <AspectRatio ratio="square">
        <div style={{ width: '100%', height: '100%', backgroundColor: '#13c2c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Image 6
        </div>
      </AspectRatio>
    </div>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
        <AspectRatio ratio="square">
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
            }}
          >
            Product Image
          </div>
        </AspectRatio>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Product Name</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
            Short description of the product
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$99.99</div>
            <button
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
};
