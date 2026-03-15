/**
 * FormField Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from '../';
import { EngineComparison as EngineComparisonHelper } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof FormField> = {
  title: 'Primitives/Inputs/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    help: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    help: "We'll never share your email",
    children: <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    required: true,
    error: 'Please enter a valid email address',
    children: <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ef4444' }} />,
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    name: 'fullName',
    required: true,
    children: <input type="text" placeholder="Enter your full name" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />,
  },
};

export const HorizontalLayout: Story = {
  args: {
    label: 'Username',
    name: 'username',
    layout: 'horizontal',
    labelWidth: '140px',
    help: 'Only lowercase letters and numbers',
    children: <input type="text" placeholder="Enter username" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FormField label="Small Field" name="small" size="sm">
        <input type="text" placeholder="Small" style={{ width: '100%', padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
      </FormField>
      <FormField label="Medium Field" name="medium" size="md">
        <input type="text" placeholder="Medium" style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
      </FormField>
      <FormField label="Large Field" name="large" size="lg">
        <input type="text" placeholder="Large" style={{ width: '100%', padding: '10px 12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
      </FormField>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    name: 'disabled',
    disabled: true,
    help: 'This field cannot be edited',
    children: <input type="text" value="Read-only value" disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />,
  },
};

export const FormExample: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <FormField label="Full Name" name="name" required>
        <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
      </FormField>
      <div style={{ height: 16 }} />
      <FormField label="Email" name="email" required error="Email is required" help="We need this to contact you">
        <input type="email" placeholder="john@example.com" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ef4444' }} />
      </FormField>
      <div style={{ height: 16 }} />
      <FormField label="Bio" name="bio" help="Tell us about yourself">
        <textarea placeholder="Write your bio..." rows={3} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }} />
      </FormField>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

export const CompareEngines: Story = {
  name: 'Engine Comparison',
  render: () => (
    <EngineComparisonHelper
      component={FormField}
      props={{
        label: 'Email Address',
        name: 'email',
        required: true,
        help: "We'll never share your email",
        children: <input type="email" placeholder="Enter email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }} />,
      }}
      showDescriptions
    />
  ),
};
