/**
 * Toggle Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Toggle> = {
  title: 'Primitives/Inputs/Toggle',
  component: Toggle,
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
        component: 'A toggle/switch component for binary on/off states with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the toggle',
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
    loading: { control: 'boolean' },
    checked: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: 'Enable feature',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Toggle key={size} size={size} label={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((color) => (
        <Toggle key={color} color={color} defaultChecked label={`Color: ${color}`} />
      ))}
    </div>
  ),
};

export const Checked: Story = {
  args: {
    label: 'Notifications enabled',
    checked: true,
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle disabled label="Disabled off" />
      <Toggle disabled checked label="Disabled on" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle loading label="Saving..." />
      <Toggle loading checked label="Saving..." />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle checkedLabel="ON" uncheckedLabel="OFF" label="Power" />
      <Toggle checkedLabel="Yes" uncheckedLabel="No" label="Accept terms" />
      <Toggle checkedLabel="1" uncheckedLabel="0" label="Binary" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Email notifications',
    description: 'Receive email updates about your account activity',
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', gap: 24 }}>
            <Toggle engine={engine} label="Off" />
            <Toggle engine={engine} defaultChecked label="On" />
            <Toggle engine={engine} disabled label="Disabled" />
            <Toggle engine={engine} loading label="Loading" />
          </div>
        </div>
      ))}
    </div>
  ),
};
