/**
 * @fileoverview Carousel Component Stories
 * @description Storybook stories for the Carousel component showcasing
 * various configurations, engines, and use cases.
 * @module components/primitives/display/Carousel/stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Sample slide content for demonstrations
 */
const slideStyle = (color: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  background: color,
  color: 'white',
  fontSize: '24px',
  fontWeight: 'bold',
});

const meta: Meta<typeof Carousel> = {
  title: 'Primitives/Display/Carousel',
  component: Carousel,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
A flexible carousel/slider component for displaying rotating content such as
images, cards, or any custom content. Supports multiple rendering engines
(Classic/Ant Design, Modern/DaisyUI, Rustic/Vanilla) with consistent API.

## Features
- Autoplay with configurable speed
- Navigation dots and arrows
- Fade or slide transitions
- Vertical mode support
- Infinite loop option
- Pause on hover
- Programmatic control via ref
- Full accessibility support
        `,
      },
    },
  },
  argTypes: {
    autoplay: {
      control: 'boolean',
      description: 'Enable automatic slide advancement',
      table: { defaultValue: { summary: 'false' } },
    },
    autoplaySpeed: {
      control: { type: 'number', min: 500, max: 10000, step: 500 },
      description: 'Time between auto-advances in milliseconds',
      table: { defaultValue: { summary: '3000' } },
    },
    dots: {
      control: 'boolean',
      description: 'Show navigation dots',
      table: { defaultValue: { summary: 'true' } },
    },
    dotPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of navigation dots',
      table: { defaultValue: { summary: 'bottom' } },
    },
    arrows: {
      control: 'boolean',
      description: 'Show prev/next navigation arrows',
      table: { defaultValue: { summary: 'false' } },
    },
    fade: {
      control: 'boolean',
      description: 'Use fade transition instead of slide',
      table: { defaultValue: { summary: 'false' } },
    },
    vertical: {
      control: 'boolean',
      description: 'Enable vertical carousel mode',
      table: { defaultValue: { summary: 'false' } },
    },
    infinite: {
      control: 'boolean',
      description: 'Enable infinite loop',
      table: { defaultValue: { summary: 'true' } },
    },
    speed: {
      control: { type: 'number', min: 100, max: 2000, step: 100 },
      description: 'Transition animation duration in milliseconds',
      table: { defaultValue: { summary: '500' } },
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
type Story = StoryObj<typeof Carousel>;

/**
 * Default carousel with navigation dots
 */
export const Default: Story = {
  args: {
    dots: true,
  },
  render: (args) => (
    <Carousel {...args}>
      <div style={slideStyle('#1890ff')}>Slide 1</div>
      <div style={slideStyle('#52c41a')}>Slide 2</div>
      <div style={slideStyle('#faad14')}>Slide 3</div>
      <div style={slideStyle('#f5222d')}>Slide 4</div>
    </Carousel>
  ),
};

/**
 * Carousel with navigation arrows
 */
export const WithArrows: Story = {
  args: {
    dots: true,
    arrows: true,
  },
  render: (args) => (
    <Carousel {...args}>
      <div style={slideStyle('#722ed1')}>Slide 1</div>
      <div style={slideStyle('#13c2c2')}>Slide 2</div>
      <div style={slideStyle('#eb2f96')}>Slide 3</div>
    </Carousel>
  ),
};

/**
 * Autoplay carousel with pause on hover
 */
export const Autoplay: Story = {
  args: {
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    pauseOnHover: true,
  },
  render: (args) => (
    <Carousel {...args}>
      <div style={slideStyle('#1890ff')}>Auto Slide 1</div>
      <div style={slideStyle('#52c41a')}>Auto Slide 2</div>
      <div style={slideStyle('#faad14')}>Auto Slide 3</div>
    </Carousel>
  ),
};

/**
 * Carousel with fade transition effect
 */
export const FadeEffect: Story = {
  args: {
    fade: true,
    dots: true,
    arrows: true,
  },
  render: (args) => (
    <Carousel {...args}>
      <div style={slideStyle('#1890ff')}>Fade 1</div>
      <div style={slideStyle('#52c41a')}>Fade 2</div>
      <div style={slideStyle('#faad14')}>Fade 3</div>
    </Carousel>
  ),
};

/**
 * Vertical carousel mode
 */
export const Vertical: Story = {
  args: {
    vertical: true,
    dots: true,
    dotPosition: 'right',
    arrows: true,
  },
  render: (args) => (
    <Carousel {...args} style={{ height: '200px' }}>
      <div style={slideStyle('#722ed1')}>Vertical 1</div>
      <div style={slideStyle('#13c2c2')}>Vertical 2</div>
      <div style={slideStyle('#eb2f96')}>Vertical 3</div>
    </Carousel>
  ),
};

/**
 * Dot positions showcase
 */
export const DotPositions: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((position) => (
        <div key={position}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>
            Dots: {position}
          </h4>
          <Carousel dots dotPosition={position} style={{ height: '150px' }}>
            <div style={slideStyle('#1890ff')}>1</div>
            <div style={slideStyle('#52c41a')}>2</div>
            <div style={slideStyle('#faad14')}>3</div>
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Carousel across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Carousel rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Carousel}
      props={{
        dots: true,
        arrows: true,
        children: [
          <div key="1" style={slideStyle('#1890ff')}>Slide 1</div>,
          <div key="2" style={slideStyle('#52c41a')}>Slide 2</div>,
          <div key="3" style={slideStyle('#faad14')}>Slide 3</div>,
        ],
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing all dot positions across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Carousel dotPosition variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Carousel}
      baseProps={{
        dots: true,
        style: { height: '150px' },
        children: [
          <div key="1" style={slideStyle('#1890ff')}>1</div>,
          <div key="2" style={slideStyle('#52c41a')}>2</div>,
          <div key="3" style={slideStyle('#faad14')}>3</div>,
        ],
      }}
      variantProp="dotPosition"
      variants={['top', 'bottom', 'left', 'right']}
    />
  ),
};

/**
 * Using the Carousel.Item compound component
 */
export const WithCarouselItem: Story = {
  render: () => (
    <Carousel dots arrows>
      <Carousel.Item backgroundColor="#1890ff" align="center" justify="center">
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Welcome</h2>
          <p>Using Carousel.Item</p>
        </div>
      </Carousel.Item>
      <Carousel.Item backgroundColor="#52c41a" align="center" justify="center">
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Features</h2>
          <p>Styled container</p>
        </div>
      </Carousel.Item>
      <Carousel.Item backgroundColor="#faad14" align="center" justify="center">
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Get Started</h2>
          <p>Easy to use</p>
        </div>
      </Carousel.Item>
    </Carousel>
  ),
};

/**
 * Image gallery carousel
 */
export const ImageGallery: Story = {
  args: {
    autoplay: true,
    autoplaySpeed: 4000,
    dots: true,
    arrows: true,
    fade: true,
  },
  render: (args) => (
    <Carousel {...args} style={{ height: '300px' }}>
      <img
        src="https://picsum.photos/600/300?random=1"
        alt="Gallery image 1"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <img
        src="https://picsum.photos/600/300?random=2"
        alt="Gallery image 2"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <img
        src="https://picsum.photos/600/300?random=3"
        alt="Gallery image 3"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Carousel>
  ),
};

/**
 * Non-infinite carousel (stops at boundaries)
 */
export const NonInfinite: Story = {
  args: {
    infinite: false,
    dots: true,
    arrows: true,
  },
  render: (args) => (
    <Carousel {...args}>
      <div style={slideStyle('#1890ff')}>First (can&apos;t go back)</div>
      <div style={slideStyle('#52c41a')}>Middle</div>
      <div style={slideStyle('#faad14')}>Last (can&apos;t go forward)</div>
    </Carousel>
  ),
};
