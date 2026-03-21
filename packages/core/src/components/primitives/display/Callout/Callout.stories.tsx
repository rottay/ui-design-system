/**
 * Callout Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './Callout';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';

const meta: Meta<typeof Callout> = {
  title: 'Primitives/Display/Callout',
  component: Callout,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ maxWidth: 500 }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    title: 'Information',
    children: 'This is an informational callout with useful details.',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Callout variant="info" title="Info">
        This is an informational message.
      </Callout>
      <Callout variant="success" title="Success">
        The operation completed successfully.
      </Callout>
      <Callout variant="warning" title="Warning">
        Please review the changes before proceeding.
      </Callout>
      <Callout variant="error" title="Error">
        Something went wrong. Please try again.
      </Callout>
    </div>
  ),
};

export const Closable: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissable',
    children: 'You can close this callout.',
    closable: true,
  },
};

export const WithAction: Story = {
  args: {
    variant: 'info',
    title: 'New Update Available',
    children: 'Version 2.0 is ready. Update now for new features.',
    action: <button style={{ fontSize: 13, padding: '4px 12px', cursor: 'pointer' }}>Update Now</button>,
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    children: 'File uploaded successfully. It will be processed shortly.',
  },
};
