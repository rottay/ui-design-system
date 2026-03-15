/**
 * OTPInput Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OTPInput } from './';
import { DesignSystemProvider } from '../../../../bootstrap';

const meta: Meta<typeof OTPInput> = {
  title: 'Primitives/Inputs/OTPInput',
  component: OTPInput,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OTPInput>;

const OTPDemo = (props: any) => {
  const [value, setValue] = useState('');
  return (
    <div>
      <OTPInput {...props} value={value} onChange={setValue} />
      <p style={{ marginTop: 8, fontSize: 14, color: '#666' }}>Value: {value || '(empty)'}</p>
    </div>
  );
};

export const Default: Story = {
  render: () => <OTPDemo autoFocus />,
};

export const FourDigit: Story = {
  render: () => <OTPDemo length={4} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <OTPDemo key={size} size={size} length={4} />
      ))}
    </div>
  ),
};

export const Masked: Story = {
  render: () => <OTPDemo mask />,
};

export const WithError: Story = {
  render: () => <OTPDemo error errorMessage="Invalid verification code" />,
};

export const Disabled: Story = {
  render: () => <OTPDemo disabled value="123456" />,
};

export const Alphanumeric: Story = {
  render: () => <OTPDemo type="alphanumeric" length={4} />,
};
