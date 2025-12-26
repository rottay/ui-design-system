/**
 * Select Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Inputs/Select',
  component: Select,
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
        component: 'A flexible select component supporting single/multiple selection, search, and custom options with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the select',
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'flushed', 'default'],
      description: 'Visual variant of the select',
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'warning', 'success'],
      description: 'Validation status',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
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
    multiple: {
      control: 'boolean',
      description: 'Allow multiple selection',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality',
    },
    clearable: {
      control: 'boolean',
      description: 'Show clear button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

const defaultOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Select a framework',
    size: 'md',
    variant: 'outline',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Select
          key={size}
          size={size}
          options={defaultOptions}
          placeholder={`Size: ${size}`}
        />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
      {(['outline', 'filled', 'flushed', 'default'] as const).map((variant) => (
        <Select
          key={variant}
          variant={variant}
          options={defaultOptions}
          placeholder={`Variant: ${variant}`}
        />
      ))}
    </div>
  ),
};

export const ValidationStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
      <Select status="default" options={defaultOptions} placeholder="Default" />
      <Select status="success" options={defaultOptions} placeholder="Success" />
      <Select status="warning" options={defaultOptions} placeholder="Warning" />
      <Select status="error" options={defaultOptions} placeholder="Error" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Disabled select',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Loading...',
    loading: true,
  },
};

export const Searchable: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Search frameworks...',
    searchable: true,
    showSearch: true,
  },
};

export const Clearable: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Select to clear',
    clearable: true,
    allowClear: true,
    defaultValue: 'react',
  },
};

export const Multiple: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Select multiple',
    multiple: true,
  },
};

export const WithOptionGroups: Story = {
  render: () => (
    <Select placeholder="Select a language" style={{ width: 300 }}>
      <Select.OptGroup label="Frontend">
        <Select.Option value="react">React</Select.Option>
        <Select.Option value="vue">Vue</Select.Option>
        <Select.Option value="angular">Angular</Select.Option>
      </Select.OptGroup>
      <Select.OptGroup label="Backend">
        <Select.Option value="node">Node.js</Select.Option>
        <Select.Option value="python">Python</Select.Option>
        <Select.Option value="go">Go</Select.Option>
      </Select.OptGroup>
    </Select>
  ),
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular', disabled: true },
      { value: 'svelte', label: 'Svelte' },
      { value: 'ember', label: 'Ember', disabled: true },
    ],
    placeholder: 'Some options disabled',
  },
};

export const WithIcons: Story = {
  args: {
    options: [
      { value: 'react', label: 'React', icon: '⚛️' },
      { value: 'vue', label: 'Vue', icon: '💚' },
      { value: 'angular', label: 'Angular', icon: '🅰️' },
      { value: 'svelte', label: 'Svelte', icon: '🔥' },
    ],
    placeholder: 'Select with icons',
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Select
              engine={engine}
              options={defaultOptions}
              placeholder="Default"
              style={{ width: 180 }}
            />
            <Select
              engine={engine}
              options={defaultOptions}
              placeholder="Disabled"
              disabled
              style={{ width: 180 }}
            />
            <Select
              engine={engine}
              options={defaultOptions}
              placeholder="With value"
              defaultValue="react"
              style={{ width: 180 }}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600 }}>
      <Select options={defaultOptions} placeholder="Normal" />
      <Select options={defaultOptions} placeholder="Disabled" disabled />
      <Select options={defaultOptions} placeholder="Loading" loading />
      <Select options={defaultOptions} placeholder="Success" status="success" />
      <Select options={defaultOptions} placeholder="Warning" status="warning" />
      <Select options={defaultOptions} placeholder="Error" status="error" />
    </div>
  ),
};
