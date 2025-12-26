/**
 * InputNumber Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { InputNumber } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof InputNumber> = {
  title: 'Primitives/Inputs/InputNumber',
  component: InputNumber,
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
        component: 'A numeric input component with increment/decrement controls and multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the input',
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'warning'],
      description: 'Validation status',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'borderless', 'filled'],
      description: 'Visual variant',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    controls: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputNumber>;

export const Default: Story = {
  args: {
    placeholder: 'Enter number',
    defaultValue: 0,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber size="small" placeholder="Small" defaultValue={10} />
      <InputNumber size="default" placeholder="Default" defaultValue={20} />
      <InputNumber size="large" placeholder="Large" defaultValue={30} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 100,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 50,
  },
};

export const WithRange: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber min={0} max={100} defaultValue={50} placeholder="0-100" />
      <InputNumber min={-10} max={10} defaultValue={0} placeholder="-10 to 10" />
      <InputNumber min={0} max={1000} step={100} defaultValue={500} placeholder="Step by 100" />
    </div>
  ),
};

export const WithStep: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber step={1} defaultValue={1} placeholder="Step 1" />
      <InputNumber step={5} defaultValue={10} placeholder="Step 5" />
      <InputNumber step={0.1} defaultValue={1.5} placeholder="Step 0.1" />
    </div>
  ),
};

export const WithPrecision: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber precision={0} defaultValue={10} placeholder="No decimals" />
      <InputNumber precision={2} defaultValue={10.55} placeholder="2 decimals" />
      <InputNumber precision={4} defaultValue={10.1234} placeholder="4 decimals" />
    </div>
  ),
};

export const WithFormatter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber
        defaultValue={1000}
        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') || ''}
        placeholder="Currency"
      />
      <InputNumber
        defaultValue={50}
        min={0}
        max={100}
        formatter={(value) => `${value}%`}
        parser={(value) => value?.replace('%', '') || ''}
        placeholder="Percentage"
      />
    </div>
  ),
};

export const WithAddons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber addonBefore="$" defaultValue={100} />
      <InputNumber addonAfter="kg" defaultValue={50} />
      <InputNumber addonBefore="+" addonAfter="units" defaultValue={25} />
    </div>
  ),
};

export const WithPrefixSuffix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber prefix="$" defaultValue={100} />
      <InputNumber suffix="%" defaultValue={50} />
    </div>
  ),
};

export const WithoutControls: Story = {
  args: {
    controls: false,
    defaultValue: 42,
  },
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputNumber status="default" placeholder="Default" />
      <InputNumber status="error" placeholder="Error" />
      <InputNumber status="warning" placeholder="Warning" />
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            <InputNumber engine={engine} defaultValue={10} />
            <InputNumber engine={engine} disabled defaultValue={20} />
            <InputNumber engine={engine} status="error" defaultValue={30} />
          </div>
        </div>
      ))}
    </div>
  ),
};
