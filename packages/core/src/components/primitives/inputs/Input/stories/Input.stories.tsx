/**
 * Input Stories
 * Storybook stories for Input component
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Inputs/Input',
  component: Input,
  decorators: [(Story) => (<DesignSystemProvider><Story /></DesignSystemProvider>)],
  parameters: { docs: { description: { component: 'Input component for text entry with support for multiple engines, sizes, variants, and states.' } } },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], description: 'Size of the input' },
    variant: { control: 'select', options: ['outline', 'filled', 'flushed', 'unstyled'], description: 'Visual variant' },
    status: { control: 'select', options: ['default', 'error', 'warning', 'success'], description: 'Validation status' },
    engine: { control: 'select', options: ['titan', 'hermes', 'apollo'], description: 'Rendering engine' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    clearable: { control: 'boolean', description: 'Show clear button' },
    showCount: { control: 'boolean', description: 'Show character count' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Enter text...", size: "md", variant: "outline" } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (<Input key={size} size={size} placeholder={`Size: ${size}`} />))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["outline", "filled", "flushed", "unstyled"] as const).map((variant) => (<Input key={variant} variant={variant} placeholder={`Variant: ${variant}`} />))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read only" readOnly value="Read only value" />
      <Input placeholder="Error" error errorMessage="This field is required" />
      <Input placeholder="Success" status="success" />
      <Input placeholder="Warning" status="warning" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input placeholder="With prefix" prefix={<span>@</span>} />
      <Input placeholder="With suffix" suffix={<span>.com</span>} />
      <Input placeholder="With both" prefix={<span>https://</span>} suffix={<span>.com</span>} />
      <Input placeholder="Clearable" clearable defaultValue="Clear me" />
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["titan", "hermes", "apollo"] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: "0 0 8px 0", textTransform: "capitalize" }}>{engine}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Input engine={engine} placeholder="Default input" />
            <Input engine={engine} variant="filled" placeholder="Filled variant" />
            <Input engine={engine} error placeholder="Error state" />
            <Input engine={engine} disabled placeholder="Disabled" />
          </div>
        </div>
      ))}
    </div>
  ),
};

