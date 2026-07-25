/**
 * FormField Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper } from '../../../../../.storybook/helpers';

const meta: Meta<typeof FormField> = {
  title: 'Primitives/Inputs/FormField',
  component: FormField,
  decorators: [(Story) => <DesignSystemProvider><Story /></DesignSystemProvider>],
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
    children: <Input engine="modern" type="email" placeholder="Enter your email" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    required: true,
    error: 'Please enter a valid email address',
    children: <Input engine="modern" type="email" placeholder="Enter your email" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    name: 'fullName',
    required: true,
    children: <Input engine="modern" placeholder="Enter your full name" />,
  },
};

export const HorizontalLayout: Story = {
  args: {
    label: 'Username',
    name: 'username',
    layout: 'horizontal',
    labelWidth: '140px',
    help: 'Only lowercase letters and numbers',
    children: <Input engine="modern" placeholder="Enter username" />,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FormField label="Small Field" name="small" size="sm">
        <Input engine="modern" size="sm" placeholder="Small" />
      </FormField>
      <FormField label="Medium Field" name="medium" size="md">
        <Input engine="modern" size="md" placeholder="Medium" />
      </FormField>
      <FormField label="Large Field" name="large" size="lg">
        <Input engine="modern" size="lg" placeholder="Large" />
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
    children: <Input engine="modern" value="Read-only value" disabled />,
  },
};

export const FormExample: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <FormField label="Full Name" name="name" required>
        <Input engine="modern" placeholder="John Doe" />
      </FormField>
      <div style={{ height: 16 }} />
      <FormField label="Email" name="email" required error="Email is required" help="We need this to contact you">
        <Input engine="modern" type="email" placeholder="john@example.com" />
      </FormField>
      <div style={{ height: 16 }} />
      <FormField label="Bio" name="bio" help="Tell us about yourself">
        <Input.TextArea rows={3} placeholder="Write your bio..." />
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
        children: <Input engine="modern" type="email" placeholder="Enter email" />,
      }}
      showDescriptions
    />
  ),
};

/**
 * Modern-engine anatomy matrix: vertical/horizontal, required, help, long
 * error copy, disabled, and an Arabic RTL field wrapping modern controls.
 */
export const ModernStateMatrix: Story = {
  name: 'Modern State Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
      <FormField engine="modern" label="Email" name="m-email" required help="We only use this for account recovery.">
        <Input engine="modern" placeholder="you@company.com" />
      </FormField>
      <FormField
        engine="modern"
        label="Candidate portfolio URL with an intentionally overlong label that must wrap gracefully"
        name="m-portfolio"
        error="The URL you entered is not reachable from our servers. Check the address, including the protocol, and try again."
      >
        <Input engine="modern" defaultValue="htp://broken" />
      </FormField>
      <FormField engine="modern" label="Horizontal field" name="m-horizontal" layout="horizontal" help="Label sits beside the control on wide containers.">
        <Input engine="modern" placeholder="Horizontal" />
      </FormField>
      <FormField engine="modern" label="Disabled" name="m-disabled" disabled help="Everything quiets down.">
        <Input engine="modern" defaultValue="Locked" />
      </FormField>
      <FormField engine="modern" label="Notifications" name="m-switch">
        <Switch engine="modern" defaultChecked />
      </FormField>
      <div dir="rtl" lang="ar">
        <FormField
          engine="modern"
          label="البريد الإلكتروني للمرشح"
          name="m-arabic"
          required
          help="نستخدم هذا البريد فقط للمراسلات المتعلقة بالتوظيف ولن تتم مشاركته مع أي طرف ثالث."
        >
          <Input engine="modern" placeholder="name@example.com" />
        </FormField>
      </div>
    </div>
  ),
};
