/**
 * PasswordInput Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput } from './';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';
import { EngineComparison } from '../../../../../.storybook/helpers';

const meta: Meta<typeof PasswordInput> = {
  title: 'Primitives/Inputs/PasswordInput',
  component: PasswordInput,
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
A password input component with visibility toggle and optional strength indicator.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|---------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Toggle | Built-in | Custom button | Custom button |
| Strength Bar | Custom | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    showToggle: { control: 'boolean' },
    strengthIndicator: { control: 'boolean' },
    strengthLevel: {
      control: 'select',
      options: ['weak', 'fair', 'good', 'strong'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: { placeholder: 'Enter password' },
};

export const WithStrengthIndicator: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <PasswordInput placeholder="Weak" strengthIndicator strengthLevel="weak" />
      <PasswordInput placeholder="Fair" strengthIndicator strengthLevel="fair" />
      <PasswordInput placeholder="Good" strengthIndicator strengthLevel="good" />
      <PasswordInput placeholder="Strong" strengthIndicator strengthLevel="strong" />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter password',
    error: true,
    errorMessage: 'Password must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled password',
    disabled: true,
  },
};

export const NoToggle: Story = {
  args: {
    placeholder: 'No visibility toggle',
    showToggle: false,
  },
};

export const CompareEngines: Story = {
  name: 'Engine Comparison',
  render: () => (
    <EngineComparison
      component={PasswordInput}
      props={{ placeholder: 'Enter password', strengthIndicator: true, strengthLevel: 'good' }}
      showDescriptions
    />
  ),
};
