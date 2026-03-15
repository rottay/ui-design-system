/**
 * Button Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
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
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Styling | CSS-in-JS | Tailwind | CSS Variables |
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
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'],
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
    danger: {
      control: 'boolean',
      description: 'Danger/destructive button style',
    },
    block: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

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
      {(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'] as const).map((variant) => (
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
        story: 'Compare the same Button rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
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
