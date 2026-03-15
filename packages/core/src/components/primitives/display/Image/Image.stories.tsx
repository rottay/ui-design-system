/**
 * Image Stories
 * Colocated with component following approved architecture.
 *
 * Showcases Image component features across all engines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Image } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Image> = {
  title: 'Primitives/Display/Image',
  component: Image,
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
        component:
          'Image component for displaying images with loading states, fallback handling, and zoom functionality. Supports multiple rendering engines.',
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility',
    },
    width: {
      control: 'number',
      description: 'Image width in pixels',
    },
    height: {
      control: 'number',
      description: 'Image height in pixels',
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
      description: 'CSS object-fit property',
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius style',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around image',
    },
    shadow: {
      control: 'boolean',
      description: 'Apply shadow effect',
    },
    zoomable: {
      control: 'boolean',
      description: 'Enable click-to-zoom functionality',
    },
    lazy: {
      control: 'boolean',
      description: 'Enable lazy loading',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Image>;

/**
 * Default image with standard configuration.
 */
export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Random landscape image',
    width: 400,
    height: 300,
  },
};

/**
 * Image with rounded corners.
 */
export const WithRadius: Story = {
  args: {
    src: 'https://picsum.photos/300/300',
    alt: 'Image with rounded corners',
    width: 300,
    height: 300,
    radius: 'lg',
  },
};

/**
 * Circular image (useful for avatars or profile pictures).
 */
export const Circular: Story = {
  args: {
    src: 'https://picsum.photos/200/200',
    alt: 'Circular image',
    width: 200,
    height: 200,
    radius: 'full',
  },
};

/**
 * Image with border and shadow.
 */
export const WithBorderAndShadow: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Image with border and shadow',
    width: 400,
    height: 300,
    bordered: true,
    shadow: true,
    radius: 'md',
  },
};

/**
 * Zoomable image - click to view full size.
 */
export const Zoomable: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Zoomable image - click to enlarge',
    width: 400,
    height: 300,
    zoomable: true,
    radius: 'md',
  },
};

/**
 * Different object-fit modes demonstration.
 */
export const ObjectFitModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['cover', 'contain', 'fill', 'none', 'scale-down'] as const).map((fit) => (
        <div key={fit} style={{ textAlign: 'center' }}>
          <Image
            src="https://picsum.photos/300/200"
            alt={`Image with ${fit} object-fit`}
            width={200}
            height={150}
            objectFit={fit}
            bordered
            radius="sm"
          />
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#666' }}>
            {fit}
          </p>
        </div>
      ))}
    </div>
  ),
};

/**
 * Different border radius options.
 */
export const RadiusOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
        <div key={r} style={{ textAlign: 'center' }}>
          <Image
            src="https://picsum.photos/150/150"
            alt={`Image with ${r} radius`}
            width={150}
            height={150}
            radius={r}
            bordered
          />
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#666' }}>
            {r}
          </p>
        </div>
      ))}
    </div>
  ),
};

/**
 * Image with error state (fallback displayed).
 */
export const WithFallback: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.jpg',
    alt: 'Image that fails to load',
    width: 300,
    height: 200,
    radius: 'md',
    fallback: (
      <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <path d="M40 8H8C6.9 8 6 8.9 6 10V38C6 39.1 6.9 40 8 40H40C41.1 40 42 39.1 42 38V10C42 8.9 41.1 8 40 8ZM16 34L22 26L26 32L32 24L38 34H16Z" />
        </svg>
        <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Image not available</p>
      </div>
    ),
  },
};

/**
 * Image with hover overlay.
 */
export const WithHoverOverlay: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Image with hover overlay',
    width: 400,
    height: 300,
    radius: 'md',
    hoverOverlay: (
      <div style={{ color: 'white', textAlign: 'center' }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <p style={{ margin: '8px 0 0' }}>View Details</p>
      </div>
    ),
  },
};

/**
 * Aspect ratio demonstration.
 */
export const AspectRatio: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <Image
          src="https://picsum.photos/400/300"
          alt="16:9 aspect ratio"
          width={320}
          aspectRatio="16/9"
          radius="md"
        />
        <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#666' }}>16:9</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Image
          src="https://picsum.photos/400/400"
          alt="1:1 aspect ratio"
          width={180}
          aspectRatio="1/1"
          radius="md"
        />
        <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#666' }}>1:1</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Image
          src="https://picsum.photos/300/400"
          alt="3:4 aspect ratio"
          width={150}
          aspectRatio="3/4"
          radius="md"
        />
        <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#666' }}>3:4</p>
      </div>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Image across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Image rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Image}
      props={{
        src: 'https://picsum.photos/200/150',
        alt: 'Sample image',
        width: 200,
        height: 150,
        radius: 'md',
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all radius variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Image radius variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Image}
      baseProps={{
        src: 'https://picsum.photos/150/150',
        alt: 'Sample image',
        width: 150,
        height: 150,
      }}
      variantProp="radius"
      variants={['none', 'sm', 'md', 'lg', 'full']}
    />
  ),
};

/**
 * Image gallery/grid layout.
 */
export const ImageGallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 600,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Image
          key={i}
          src={`https://picsum.photos/300/300?random=${i}`}
          alt={`Gallery image ${i + 1}`}
          width={180}
          height={180}
          radius="md"
          zoomable
        />
      ))}
    </div>
  ),
};

/**
 * Image.Skeleton compound component.
 */
export const SkeletonLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Image.Skeleton width={200} height={150} radius="md" />
      <Image.Skeleton width={150} height={150} radius="full" />
      <Image.Skeleton width={200} height={150} radius="none" />
    </div>
  ),
};

/**
 * Image.Fallback compound component.
 */
export const FallbackComponent: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Image.Fallback width={200} height={150} />
      <Image.Fallback width={200} height={150}>
        <span>Custom fallback content</span>
      </Image.Fallback>
    </div>
  ),
};
