/**
 * Textarea Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Textarea> = {
  title: 'Primitives/Inputs/Textarea',
  component: Textarea,
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
        component: 'A multi-line text input component with multi-engine support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the textarea',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'borderless'],
      description: 'Visual variant',
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
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    showCount: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    rows: { control: 'number' },
    maxLength: { control: 'number' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message here...',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Textarea key={size} size={size} placeholder={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['outlined', 'filled', 'borderless'] as const).map((variant) => (
        <Textarea key={variant} variant={variant} placeholder={`Variant: ${variant}`} />
      ))}
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'error', 'warning', 'success'] as const).map((status) => (
        <Textarea key={status} status={status} placeholder={`Status: ${status}`} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'This content is read-only and cannot be modified.',
    readOnly: true,
  },
};

export const WithCounter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Textarea placeholder="Character count without limit" showCount />
      <Textarea placeholder="Max 100 characters" showCount maxLength={100} />
    </div>
  ),
};

export const Resizable: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Textarea placeholder="Fixed rows (4 default)" rows={4} />
      <Textarea placeholder="Auto resize enabled" autoSize />
      <Textarea placeholder="Auto resize with min/max rows" autoSize={{ minRows: 2, maxRows: 6 }} />
    </div>
  ),
};

export const WithAllowClear: Story = {
  args: {
    placeholder: 'Type something then clear it',
    allowClear: true,
    defaultValue: 'Click the clear button to remove this text',
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Textarea engine={engine} placeholder={`${engine} - default`} />
            <Textarea engine={engine} placeholder={`${engine} - disabled`} disabled />
            <Textarea engine={engine} placeholder={`${engine} - with counter`} showCount maxLength={50} />
          </div>
        </div>
      ))}
    </div>
  ),
};
