/**
 * Checkbox Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Inputs/Checkbox',
  component: Checkbox,
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
        component: 'A checkbox component for selecting one or multiple options with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the checkbox',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    children: 'Accept terms and conditions',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Checkbox key={size} size={size}>
          Size: {size}
        </Checkbox>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((color) => (
        <Checkbox key={color} color={color} defaultChecked>
          Color: {color}
        </Checkbox>
      ))}
    </div>
  ),
};

export const Checked: Story = {
  args: {
    children: 'This is checked',
    checked: true,
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox disabled>Disabled unchecked</Checkbox>
      <Checkbox disabled checked>Disabled checked</Checkbox>
    </div>
  ),
};

export const Indeterminate: Story = {
  args: {
    children: 'Select all',
    indeterminate: true,
  },
};

export const CheckboxGroup: Story = {
  render: () => (
    <Checkbox.Group
      options={[
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
        { value: 'grape', label: 'Grape', disabled: true },
      ]}
      defaultValue={['apple']}
    />
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            <Checkbox engine={engine}>Unchecked</Checkbox>
            <Checkbox engine={engine} defaultChecked>Checked</Checkbox>
            <Checkbox engine={engine} disabled>Disabled</Checkbox>
          </div>
        </div>
      ))}
    </div>
  ),
};
