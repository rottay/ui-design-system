/**
 * Button Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import {
  EngineComparison,
  VariantEngineMatrix,
  InteractiveEngineShowcase,
  TenantSwitcher,
  ComponentPlayground,
} from '../../../../../.storybook/helpers';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Inputs/Button',
  component: Button,
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
        component: `
A versatile button component supporting multiple variants, sizes, and states with multi-engine support.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | Rottay anatomy | Vanilla CSS |
| Styling | CSS-in-JS | Token skin | CSS Variables |
| Bundle | Heavier | Medium | Lightest |
| Ripple Effect | Yes | No | No |
| Icon Animation | Yes | Yes | Basic |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning', 'info', 'ai', 'default', 'text', 'dashed'],
      description: 'Visual variant of the button',
    },
    shape: {
      control: 'select',
      options: ['default', 'round', 'circle'],
      description: 'Shape of the button',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    pending: {
      control: 'boolean',
      description: 'Width-stable busy state for mutation actions',
    },
    pendingLabel: {
      control: 'text',
      description: 'Localized label announced and shown while pending',
    },
    danger: {
      control: 'boolean',
      description: 'Danger/destructive button style',
    },
    block: {
      control: 'boolean',
      description: 'Full width button',
    },
    shadow: { control: 'boolean' },
    gradient: { control: 'boolean' },
    pulse: { control: 'boolean' },
    bordered: { control: 'boolean' },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

const SparklesGlyph = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M15.5 12.5c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2Z" fill="currentColor" />
  </svg>
);

const ArrowGlyph = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsGlyph = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.05 5.05l1.06 1.06m7.78 7.78 1.06 1.06m0-9.9-1.06 1.06m-7.78 7.78-1.06 1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// Default Stories
// ============================================================================

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Button key={size} size={size} variant="primary">
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning', 'info', 'ai', 'default', 'text', 'dashed'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button shape="default">Default</Button>
      <Button shape="round">Round</Button>
      <Button shape="circle">C</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button loading variant="primary">Loading</Button>
      <Button loading variant="secondary">Loading</Button>
      <Button loading variant="outline">Loading</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button disabled variant="primary">Disabled</Button>
      <Button disabled variant="secondary">Disabled</Button>
      <Button disabled variant="outline">Disabled</Button>
    </div>
  ),
};

export const DangerButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="danger">Danger</Button>
      <Button danger variant="primary">Primary Danger</Button>
      <Button danger variant="outline">Outline Danger</Button>
    </div>
  ),
};

export const AIActions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="ai">Draft with AI</Button>
      <Button variant="ai" gradient icon={<span aria-hidden="true">✦</span>}>
        Generate shortlist
      </Button>
      <Button variant="ai" pending pendingLabel="Preparing evidence">
        Prepare evidence
      </Button>
      <Button variant="ai" disabled>
        Not available
      </Button>
    </div>
  ),
};

/**
 * Pass 1 contract evidence: anatomy, long localized copy, RTL, state parity,
 * responsive size and icon-only naming in one stable review surface.
 */
export const ModernContractMatrix: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Technical contract review for Modern. Pass 2 may refine optical craft without changing this anatomy.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 960 }}>
      <section style={{ display: 'grid', gap: 12 }}>
        <strong>Hierarchy and states</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button engine="modern" variant="primary">Primary action</Button>
          <Button engine="modern" variant="secondary">Secondary action</Button>
          <Button engine="modern" variant="ghost">Quiet action</Button>
          <Button engine="modern" variant="danger">Delete permanently</Button>
          <Button engine="modern" variant="ai" icon={<span aria-hidden="true">✦</span>}>
            Analyze with AI
          </Button>
          <Button engine="modern" pending pendingLabel="Saving">Save changes</Button>
          <Button engine="modern" disabled>Unavailable</Button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <strong>Localization and resilient layout</strong>
        <Button engine="modern" block>
          Review the complete candidate evidence before making the final decision
        </Button>
        <div dir="rtl" lang="ar" style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
          <Button engine="modern" variant="ai" icon={<span aria-hidden="true">✦</span>}>
            إنشاء ملخص باستخدام الذكاء الاصطناعي
          </Button>
          <Button engine="modern" variant="secondary">إلغاء</Button>
        </div>
      </section>

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Button engine="modern" size={{ base: 'sm', md: 'md', xl: 'lg' }}>
          Responsive control
        </Button>
        <Button.Icon aria-label="Open settings" icon={<span aria-hidden="true">⚙</span>} />
        <Button engine="modern" href="/docs" target="_blank" variant="link">
          Open documentation
        </Button>
      </section>
    </div>
  ),
};

/**
 * Pass 2 evidence: optical hierarchy, density, localization, compound
 * geometry and radically different public-token personalities.
 */
export const ModernCraftReview: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Adversarial craft surface for Modern Button. Both personality blocks use only public Button token channels a BrandTheme or DB TenantTheme can emit.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 28, maxWidth: 1040 }}>
      <section style={{ display: 'grid', gap: 12 }}>
        <strong>Action hierarchy and complete state language</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Button engine="modern" variant="primary" icon={<ArrowGlyph />} iconPosition="end">
            Continue
          </Button>
          <Button engine="modern" variant="default">Review evidence</Button>
          <Button engine="modern" variant="ghost">Not now</Button>
          <Button engine="modern" variant="danger">Delete permanently</Button>
          <Button engine="modern" variant="ai" icon={<SparklesGlyph />}>
            Generate with AI
          </Button>
          <Button engine="modern" pending pendingLabel="Saving">Save changes</Button>
          <Button engine="modern" disabled>Unavailable</Button>
          <Button.Icon icon={<SettingsGlyph />} aria-label="Open settings" tooltip="Open settings" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <strong>Container density and resilient localization</strong>
        {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
          <div key={density} data-density={density} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 88 }}>{density}</span>
            <Button engine="modern" size="sm">Secondary</Button>
            <Button engine="modern" size="md" variant="primary">Primary action</Button>
            <Button.Icon size="md" icon={<SettingsGlyph />} aria-label={`${density} settings`} />
          </div>
        ))}
        <Button engine="modern" block icon={<SparklesGlyph />} variant="ai">
          Review the complete candidate evidence before making the final decision with the hiring team
        </Button>
        <div dir="rtl" lang="ar" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Button engine="modern" variant="ai" icon={<SparklesGlyph />}>
            إنشاء ملخص باستخدام الذكاء الاصطناعي
          </Button>
          <Button engine="modern" variant="default">إلغاء</Button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <strong>Connected compound geometry in both writing directions</strong>
        <Button.Group connected aria-label="View mode">
          <Button engine="modern" variant="default">Overview</Button>
          <Button engine="modern" variant="default">Evidence</Button>
          <Button engine="modern" variant="default">Activity</Button>
        </Button.Group>
        <div dir="rtl">
          <Button.Group connected aria-label="طريقة العرض">
            <Button engine="modern" variant="default">نظرة عامة</Button>
            <Button engine="modern" variant="default">الأدلة</Button>
            <Button engine="modern" variant="default">النشاط</Button>
          </Button.Group>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            padding: 20,
            ['--ds-button-md-height' as string]: '36px',
            ['--ds-button-md-padding-x' as string]: '13px',
            ['--ds-button-md-radius' as string]: '8px',
            ['--ds-button-font-weight' as string]: 640,
            ['--ds-button-letter-spacing' as string]: '-0.012em',
            ['--ds-button-primary-bg' as string]: '#315f96',
            ['--ds-button-primary-bg-hover' as string]: '#254f80',
            ['--ds-button-primary-border' as string]: '#254f80',
          } as React.CSSProperties}
        >
          <Button engine="modern" variant="primary">Precision tenant</Button>
          <Button engine="modern" variant="default">Secondary</Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            padding: 20,
            ['--ds-button-md-height' as string]: '46px',
            ['--ds-button-md-padding-x' as string]: '22px',
            ['--ds-button-md-radius' as string]: '999px',
            ['--ds-button-font-family' as string]: 'Georgia, serif',
            ['--ds-button-font-weight' as string]: 600,
            ['--ds-button-letter-spacing' as string]: '0.012em',
            ['--ds-button-primary-bg' as string]: '#22201d',
            ['--ds-button-primary-bg-hover' as string]: '#4a433b',
            ['--ds-button-primary-border' as string]: '#22201d',
          } as React.CSSProperties}
        >
          <Button engine="modern" variant="primary">Editorial tenant</Button>
          <Button engine="modern" variant="default">Secondary</Button>
        </div>
      </section>
    </div>
  ),
};

export const Block: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Button block variant="primary">Full Width Button</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button icon={<span>🔍</span>}>Search</Button>
      <Button icon={<span>➕</span>} variant="primary">Add Item</Button>
      <Button icon={<span>💾</span>} variant="secondary">Save</Button>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button.Group>
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </Button.Group>
      <Button.Group>
        <Button variant="primary">One</Button>
        <Button variant="primary">Two</Button>
        <Button variant="primary">Three</Button>
      </Button.Group>
    </div>
  ),
};

export const IconButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button.Icon icon={<span>⚙️</span>} aria-label="Settings" />
      <Button.Icon icon={<span>❤️</span>} aria-label="Like" variant="outline" />
      <Button.Icon icon={<span>🗑️</span>} aria-label="Delete" variant="danger" />
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Button component across all 3 engines.
 * Shows how Classic, Modern, and Rustic render the same props differently.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Button rendered by Classic (Ant Design), Modern (Rottay anatomy + token skin), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Button}
      props={{ children: 'Click Me', variant: 'primary', size: 'md' }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all variants across all engines.
 * Perfect for visual regression testing and ensuring consistency.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all button variants across all engines. Useful for visual QA.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Button}
      baseProps={{ children: 'Button' }}
      variantProp="variant"
      variants={['primary', 'secondary', 'outline', 'ghost', 'link', 'danger']}
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all button sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Button}
      baseProps={{ children: 'Button', variant: 'primary' }}
      sizeProp="size"
      sizes={['xs', 'sm', 'md', 'lg', 'xl']}
    />
  ),
};

/**
 * Full matrix with both variants and sizes across engines.
 */
export const FullMatrix: Story = {
  name: '🎯 Full Variant × Size Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix showing variants and sizes across all engines. Most comprehensive view.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Button}
      baseProps={{ children: 'Btn' }}
      variantProp="variant"
      variants={['primary', 'secondary', 'outline']}
      sizeProp="size"
      sizes={['sm', 'md', 'lg']}
    />
  ),
};

// ============================================================================
// State Stories
// ============================================================================

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="primary">Normal</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="secondary">Normal</Button>
        <Button variant="secondary" loading>Loading</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="outline">Normal</Button>
        <Button variant="outline" loading>Loading</Button>
        <Button variant="outline" disabled>Disabled</Button>
      </div>
    </div>
  ),
};

/**
 * Loading state comparison across engines.
 */
export const LoadingComparison: Story = {
  name: '⏳ Loading State Comparison',
  render: () => (
    <EngineComparison
      component={Button}
      props={{ children: 'Loading', variant: 'primary', loading: true }}
      showDescriptions
    />
  ),
};

/**
 * Disabled state comparison across engines.
 */
export const DisabledComparison: Story = {
  name: '🚫 Disabled State Comparison',
  render: () => (
    <EngineComparison
      component={Button}
      props={{ children: 'Disabled', variant: 'primary', disabled: true }}
      showDescriptions
    />
  ),
};

// ============================================================================
// Interactive Stories
// ============================================================================

/**
 * Full interactive playground with engine and theme switching.
 * Switch between engines and themes in real-time.
 */
export const Playground: Story = {
  name: '🎮 Interactive Playground',
  parameters: {
    docs: {
      description: {
        story: 'Full interactive playground to test the Button across all engines and themes. Use the controls to switch views and configurations.',
      },
    },
  },
  render: () => (
    <ComponentPlayground
      component={Button}
      props={{ children: 'Click Me', variant: 'primary', size: 'md' }}
      componentName="Button"
      initialView="single"
    />
  ),
};

/**
 * Interactive engine comparison with multiple layout modes.
 */
export const InteractiveEngines: Story = {
  name: '🎛️ Interactive Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Interactive comparison with layout modes (horizontal, vertical, cards, tabs, slider) and zoom controls.',
      },
    },
  },
  render: () => (
    <InteractiveEngineShowcase
      component={Button}
      props={{ children: 'Button', variant: 'primary', size: 'md' }}
      title="Button Engine Comparison"
      description="Compare how the Button renders across different engines"
      showLayoutControls
      showZoomControls
      initialLayout="cards"
    />
  ),
};

/**
 * Theme/tenant switching with live preview.
 */
export const ThemeSwitcher: Story = {
  name: '🎨 Theme Switcher',
  parameters: {
    docs: {
      description: {
        story: 'Switch between different themes (Spotify, Stripe, Airbnb, etc.) to see how the Button adapts to brand colors.',
      },
    },
  },
  render: () => (
    <TenantSwitcher
      component={Button}
      props={{ children: 'Themed Button', variant: 'primary', size: 'md' }}
      title="Button Theme Preview"
      showEngineSelector
      initialEngine="classic"
      initialTenant="base"
    />
  ),
};

/**
 * Grid preview of all themes.
 */
export const AllThemes: Story = {
  name: '🌈 All Themes Grid',
  parameters: {
    docs: {
      description: {
        story: 'See the Button rendered in all available themes at once.',
      },
    },
  },
  render: () => (
    <TenantSwitcher
      component={Button}
      props={{ children: 'Button', variant: 'primary', size: 'md' }}
      title="Button in All Themes"
      gridPreview
      showEngineSelector
    />
  ),
};
