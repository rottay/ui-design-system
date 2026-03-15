/**
 * Segmented Stories
 * Comprehensive Storybook documentation for the Segmented component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Segmented } from './';
import { DesignSystemProvider } from '../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Segmented> = {
  title: 'Primitives/Navigation/Segmented',
  component: Segmented,
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
The Segmented component is used to display multiple options and allows users to select one of them.

## Features
- **String or object options**: Pass simple strings or objects with label/value
- **Controlled and uncontrolled**: Works with value prop or defaultValue
- **Sizes**: small, middle, large
- **Block mode**: Full width layout
- **Icons**: Support for icons in options
- **Disabled**: Component or individual options
- **Engine support**: Works with Classic (Ant Design), Modern (Tailwind), and Rustic (Vanilla)

## Usage
\`\`\`tsx
import { Segmented } from '@rottay/design-system';

<Segmented
  options={['Daily', 'Weekly', 'Monthly']}
  onChange={(value) => console.log(value)}
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the segmented control',
    },
    block: {
      control: 'boolean',
      description: 'Fit width to parent',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all options',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Segmented>;

/**
 * Default Segmented with string options
 */
export const Default: Story = {
  args: {
    options: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    defaultValue: 'Weekly',
  },
};

/**
 * Different sizes available
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <p style={{ margin: '0 0 8px', textTransform: 'capitalize' }}>{size}</p>
          <Segmented
            size={size}
            options={['Option 1', 'Option 2', 'Option 3']}
            defaultValue="Option 1"
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * Block mode stretches to full width
 */
export const Block: Story = {
  render: () => (
    <div style={{ width: '100%' }}>
      <Segmented
        block
        options={['Daily', 'Weekly', 'Monthly']}
        defaultValue="Daily"
      />
    </div>
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    defaultValue: 'Option 1',
    disabled: true,
  },
};

/**
 * Options with icons
 */
export const WithIcons: Story = {
  render: () => (
    <Segmented
      options={[
        { label: 'List', value: 'list', icon: <span style={{ marginRight: 4 }}>📋</span> },
        { label: 'Grid', value: 'grid', icon: <span style={{ marginRight: 4 }}>📊</span> },
        { label: 'Map', value: 'map', icon: <span style={{ marginRight: 4 }}>🗺️</span> },
      ]}
      defaultValue="list"
    />
  ),
};

/**
 * Individual disabled options
 */
export const IndividualDisabled: Story = {
  render: () => (
    <Segmented
      options={[
        { label: 'Available', value: 'available' },
        { label: 'Disabled', value: 'disabled', disabled: true },
        { label: 'Available', value: 'available2' },
      ]}
      defaultValue="available"
    />
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Segmented across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Segmented rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Segmented}
      props={{
        options: ['Option 1', 'Option 2', 'Option 3'],
        defaultValue: 'Option 1',
      }}
      showDescriptions
    />
  ),
};

/**
 * Controlled component example
 */
export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | number>('monthly');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Segmented
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
          value={value}
          onChange={setValue}
        />
        <p>Selected: {value}</p>
      </div>
    );
  },
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    options: ['Small', 'Medium', 'Large'],
    defaultValue: 'Medium',
    size: 'middle',
    block: false,
    disabled: false,
  },
};
