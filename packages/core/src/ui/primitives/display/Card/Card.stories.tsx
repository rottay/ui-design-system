/**
 * @fileoverview Card Component Stories
 * @description Storybook stories for the Card component, showcasing all variants,
 * engines, compound components, and interactive states.
 *
 * Colocated with component following approved architecture.
 *
 * @module Card/stories
 * @package @es-rottay/designsystem-core
 */

import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import { Card } from './';
import { Button } from '../../inputs/Button';
import { ContentImageIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-image';
import { chromeToVariables } from '@/infrastructure/compilers/kernel/foundation/css/chrome-variables';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Card component meta configuration for Storybook.
 */
const meta: Meta<typeof Card> = {
  title: 'Primitives/Display/Card',
  component: Card,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Card component for displaying content in a contained, styled container.

## Features
- Multiple visual variants (elevated, outlined, filled, ghost)
- Three rendering engines (Classic, Modern, Rustic)
- Compound components (Header, Body, Footer, Image)
- Loading state with skeleton
- Hover and click interactions
- Configurable padding, radius, and shadow

## Usage
\`\`\`tsx
import { Card } from '@es-rottay/designsystem-core';

<Card variant="elevated">
  <Card.Header title="Card Title" subtitle="Subtitle" />
  <Card.Body>Content goes here</Card.Body>
  <Card.Footer actions={[<Button>Action</Button>]} />
</Card>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'filled', 'ghost'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'elevated' },
      },
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Content padding size',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Border radius size',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    clickable: {
      control: 'boolean',
      description: 'Make card clickable with cursor pointer',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    bordered: {
      control: 'boolean',
      description: 'Show border',
      table: {
        defaultValue: { summary: 'true' },
      },
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
type Story = StoryObj<typeof Card>;

/**
 * Default Card story with basic content.
 */
export const Default: Story = {
  args: {
    children: (
      <p style={{ margin: 0 }}>
        This is a basic card with default settings. Cards are versatile containers
        for displaying related content and actions.
      </p>
    ),
  },
};

/**
 * Card with compound components showing full structure.
 */
export const WithCompoundComponents: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header
        title="Card Title"
        subtitle="A brief description of the card content"
      />
      <Card.Body>
        <p style={{ margin: 0 }}>
          This card demonstrates the use of compound components for structured layouts.
          Use Card.Header, Card.Body, and Card.Footer to organize your content.
        </p>
      </Card.Body>
      <Card.Footer divider align="end">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Submit</Button>
      </Card.Footer>
    </Card>
  ),
};

/**
 * All visual variants displayed together.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['elevated', 'outlined', 'filled', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant} padding="md">
          <Card.Header title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Variant`} />
          <Card.Body>
            <p style={{ margin: 0 }}>
              This is the {variant} variant of the Card component.
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Card with image using Card.Image compound component.
 */
export const WithImage: Story = {
  render: () => (
    <Card variant="elevated" padding="none">
      <Card.Image
        src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=200&fit=crop"
        alt="Beautiful landscape"
        height={200}
      />
      <Card.Header title="Mountain Vista" subtitle="Nature Photography" />
      <Card.Body>
        <p style={{ margin: 0 }}>
          A stunning view of mountain landscapes captured during golden hour.
        </p>
      </Card.Body>
      <Card.Footer divider>
        <Button variant="primary">View details</Button>
      </Card.Footer>
    </Card>
  ),
};

/**
 * Interactive card with hover effects.
 */
export const Hoverable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Card hoverable style={{ flex: 1 }}>
        <Card.Header title="Hoverable Card" />
        <Card.Body>
          <p style={{ margin: 0 }}>Hover over this card to see the shadow effect.</p>
        </Card.Body>
      </Card>
      <Card hoverable clickable onClick={() => alert('Card clicked!')} style={{ flex: 1 }}>
        <Card.Header title="Clickable Card" />
        <Card.Body>
          <p style={{ margin: 0 }}>This card is both hoverable and clickable.</p>
        </Card.Body>
      </Card>
    </div>
  ),
};

/**
 * Card in loading state.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: (
      <>
        <Card.Header title="Loading Card" />
        <Card.Body>
          <p>This content is hidden while loading.</p>
        </Card.Body>
      </>
    ),
  },
};

/**
 * Different padding sizes.
 */
export const PaddingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} variant="outlined" padding={padding}>
          <Card.Header title={`Padding: ${padding}`} />
          <Card.Body padding={padding}>
            <p style={{ margin: 0, background: '#f0f0f0', padding: '8px' }}>
              Content with {padding} padding
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Different border radius sizes.
 */
export const RadiusSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
        <Card key={radius} variant="elevated" radius={radius} style={{ width: '150px' }}>
          <Card.Body>
            <p style={{ margin: 0, textAlign: 'center' }}>radius: {radius}</p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Card across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Card contract across Classic, token-native Modern, and Rustic engines.',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Card}
      props={{ children: <p style={{ margin: 0 }}>Card content</p>, variant: 'elevated' }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all card variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Card}
      baseProps={{ children: <p style={{ margin: 0 }}>Content</p>, padding: 'md' }}
      variantProp="variant"
      variants={['elevated', 'outlined', 'filled', 'ghost']}
    />
  ),
};

/**
 * Card with header avatar and extra content.
 */
export const WithHeaderAvatar: Story = {
  render: () => (
    <Card variant="outlined">
      <Card.Header
        title="John Doe"
        subtitle="Software Engineer"
        avatar={
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            JD
          </div>
        }
        extra={
          <Button size="sm" variant="secondary">Follow</Button>
        }
        divider
      />
      <Card.Body>
        <p style={{ margin: 0 }}>
          Passionate about building great user experiences and scalable systems.
          Currently working on design systems and component libraries.
        </p>
      </Card.Body>
    </Card>
  ),
};

/**
 * Card grid layout example.
 */
export const CardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxWidth: '600px',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="elevated" hoverable>
          <Card.Header title={`Card ${i}`} />
          <Card.Body>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Grid item {i} content
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

/** Pass 1 contract evidence: finite anatomy, semantic state and DS-owned actions. */
export const ModernPass1Contract: Story = {
  name: 'Modern · Pass 1 contract',
  render: () => (
    <Card
      engine="modern"
      variant="outlined"
      selectable
      selected
      onSelect={() => undefined}
      aria-label="Selected decision evidence card"
    >
      <Card.Header
        eyebrow="Decision intelligence"
        icon={<ContentImageIcon decorative size={18} />}
        headingLevel={2}
        title="Evidence readiness"
        subtitle="A token-owned card shell with explicit hierarchy and state."
        extra={<Button size="sm">Review</Button>}
        divider
      />
      <Card.Body>
        Strong fit evidence is verified across the active role and candidate context.
      </Card.Body>
      <Card.Footer
        divider
        actions={[
          <Button key="details" variant="secondary" size="sm">Details</Button>,
          <Button key="continue" variant="primary" size="sm">Continue</Button>,
        ]}
      />
    </Card>
  ),
};

type CardTokenStyle = CSSProperties & Record<`--${string}`, string | number>;

const CANDIDATE_COVER = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#dbe8f4"/><stop offset="1" stop-color="#f2eadf"/></linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="400" cy="190" r="82" fill="#fff" fill-opacity=".86"/>
    <path d="M240 450c16-104 76-158 160-158s144 54 160 158" fill="#fff" fill-opacity=".86"/>
  </svg>
`)}`;

const BITHIRE_CARD_TOKENS = chromeToVariables({
  cardComponent: {
    bg: '#FFFFFF',
    bgHover: '#F7FAFD',
    border: '#D4E0EA',
    radius: '12px',
    shadow: '0 1px 2px rgba(20, 40, 59, 0.06)',
    shadowHover: '0 12px 28px rgba(20, 40, 59, 0.10)',
    headerBg: 'linear-gradient(112deg, #EDF5FC, #FFFFFF 58%, #F6F2EA)',
    titleColor: '#14283B',
    bodyColor: '#53697E',
    titleFontSize: '0.875rem',
    titleLetterSpacing: '-0.01em',
    headerIconColor: '#3A6FB0',
    coverAspectRatio: '16 / 9',
    coverObjectPosition: '50% 32%',
    hoverTransform: 'translateY(-1px)',
    transitionDuration: '160ms',
    texture: 'linear-gradient(90deg, transparent, rgba(58,111,176,.07))',
    textureOpacity: 0.06,
    surfaceGradient: 'linear-gradient(180deg, #FFFFFF, #F9FBFD)',
    stateOverlayHoverOpacity: 0.28,
    headerGap: '10px',
    bodyLineHeight: '1.5',
  },
}) as CardTokenStyle;

const MANAGEMENT_CARD_TOKENS = chromeToVariables({
  cardComponent: {
    bg: '#FFFEFB',
    bgHover: '#FBF5EB',
    border: '#9B8A73',
    radius: '6px',
    shadow: '0 8px 24px rgba(46, 38, 28, 0.12)',
    shadowHover: '0 16px 38px rgba(46, 38, 28, 0.16)',
    headerBg: 'linear-gradient(112deg, #FFFFFF, #FBF3E7)',
    titleColor: '#2E261C',
    bodyColor: '#74644F',
    titleFontSize: '1rem',
    titleLetterSpacing: '0.01em',
    headerIconColor: '#0F766E',
    coverAspectRatio: '4 / 3',
    coverObjectPosition: '50% 18%',
    hoverTransform: 'translateY(-2px)',
    transitionDuration: '240ms',
    texture: 'radial-gradient(circle, rgba(155,138,115,.18) 1px, transparent 1px)',
    textureSize: '18px 18px',
    textureOpacity: 0.12,
    surfaceGradient: 'linear-gradient(180deg, #FFFEFB, #FBF3E7)',
    stateOverlayHoverOpacity: 0.52,
    headerGap: '14px',
    bodyLineHeight: '1.65',
  },
}) as CardTokenStyle;

function TenantCardFixture({ tenant }: { tenant: 'bithire' | 'management' }) {
  const bithire = tenant === 'bithire';
  return (
    <div lang={bithire ? 'en' : 'es'} style={bithire ? BITHIRE_CARD_TOKENS : MANAGEMENT_CARD_TOKENS}>
      <Card engine="modern" variant="elevated" hoverable selectable onSelect={() => undefined} padding="none">
        <Card.Image
          src={CANDIDATE_COVER}
          alt={bithire ? 'Candidate profile illustration' : 'Ilustración del perfil de la candidata'}
          height="auto"
          style={{ aspectRatio: 'var(--ds-card-cover-aspect-ratio)' }}
        />
        <Card.Header
          eyebrow={bithire ? 'Decision intelligence' : 'Inteligencia de decisión'}
          icon={<ContentImageIcon decorative size={18} />}
          headingLevel={2}
          title={bithire ? 'Candidate ready for the next decision' : 'Candidata lista para la próxima decisión'}
          subtitle={bithire
            ? 'Verified evidence, active context, and the next recommended action in one calm surface.'
            : 'Evidencia verificada, contexto activo y la próxima acción recomendada en una única superficie.'}
          extra={<Button size="sm">{bithire ? 'Review' : 'Revisar'}</Button>}
          divider
        />
        <Card.Body>
          {bithire
            ? 'The same component tree receives the static BitHire preset.'
            : 'El mismo árbol de componentes recibe el tema del tenant desde la configuración publicada.'}
        </Card.Body>
        <Card.Footer
          divider
          actions={[
            <Button key="secondary" variant="secondary" size="sm">{bithire ? 'Evidence' : 'Evidencia'}</Button>,
            <Button key="primary" variant="primary" size="sm">{bithire ? 'Continue' : 'Continuar'}</Button>,
          ]}
        />
      </Card>
    </div>
  );
}

/** Same DS tree, two materially different token configurations and locales. */
export const ModernTenantAndLocaleDivergence: Story = {
  name: 'Modern · tenant × locale divergence',
  render: () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <TenantCardFixture tenant="bithire" />
      <TenantCardFixture tenant="management" />
    </div>
  ),
};

/** RTL and long-copy stress fixture for logical media and container reflow. */
export const ModernRtlLongCopy: Story = {
  name: 'Modern · RTL + long copy',
  render: () => (
    <div dir="rtl" lang="ar">
      <Card
        engine="modern"
        variant="outlined"
        cover={CANDIDATE_COVER}
        coverAlt="صورة توضيحية للمرشحة"
        coverPosition="start"
        titleHeadingLevel={2}
        title="ملخص القرار المهني الطويل الذي يجب أن يلتف بوضوح من دون تداخل أو قص للمحتوى"
        description="تجمع هذه البطاقة الأدلة الموثقة والسياق النشط والتوصية التالية في تسلسل هرمي واضح ومتجاوب."
        actions={[<Button key="review" size="sm">مراجعة الأدلة</Button>]}
      >
        تظهر الصورة في البداية المنطقية وتنتقل تلقائيًا مع اتجاه الكتابة.
      </Card>
    </div>
  ),
};

/** Container and breakpoint stress fixture: media reflows, actions wrap, and the
 * responsive padding contract reaches the visible body rather than the shell. */
export const ModernResponsiveComposition: Story = {
  name: 'Modern · responsive composition',
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
  render: () => (
    <Card
      engine="modern"
      variant="elevated"
      cover={CANDIDATE_COVER}
      coverAlt="Candidate profile illustration"
      coverPosition="start"
      padding={{ xs: 'sm', md: 'md', xl: 'lg' }}
      titleHeadingLevel={2}
      title="Decision context stays legible at every card width"
      description="Logical media, balanced headings, long copy, and action wrapping are owned by the same responsive anatomy."
      extra={<Button size="sm" variant="secondary">Inspect</Button>}
      actions={[
        <Button key="evidence" size="sm" variant="secondary">Open evidence</Button>,
        <Button key="decision" size="sm" variant="primary">Continue decision</Button>,
      ]}
    >
      Resize the story canvas below the compact threshold to inspect the media and action reflow.
    </Card>
  ),
};

/** Terminal-state evidence for selection, disabled paint, semantic tone and load. */
export const ModernStateMatrix: Story = {
  name: 'Modern · state matrix',
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card engine="modern" variant="outlined" hoverable onClick={() => undefined}>
        <Card.Header title="Interactive" subtitle="Hover, press, and keyboard focus preserve the material ladder." />
      </Card>
      <Card engine="modern" variant="elevated" selectable selected onSelect={() => undefined}>
        <Card.Header title="Selected" subtitle="A complete outline and calm tint communicate selection." />
      </Card>
      <Card engine="modern" variant="filled" colorVariant="warning" selectable selected onSelect={() => undefined}>
        <Card.Header title="Selected semantic tone" subtitle="Tone and selection remain independently legible." />
      </Card>
      <Card engine="modern" variant="elevated" disabled onClick={() => undefined}>
        <Card.Header title="Unavailable" subtitle="Disabled paint is terminal across every anatomy recipe." />
      </Card>
      <Card engine="modern" variant="outlined" loading aria-label="Loading decision evidence">
        Loading
      </Card>
    </div>
  ),
};
