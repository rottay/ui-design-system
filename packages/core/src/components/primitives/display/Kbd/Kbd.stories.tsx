/**
 * Kbd Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from './Kbd';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';

const meta: Meta<typeof Kbd> = {
  title: 'Primitives/Display/Kbd',
  component: Kbd,
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
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: { children: 'Ctrl' },
};

export const Shortcut: Story = {
  render: () => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
      Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save
    </span>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Kbd key={size} size={size}>Esc</Kbd>
      ))}
    </div>
  ),
};

export const CommonKeys: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Kbd>Ctrl</Kbd>
      <Kbd>Alt</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Backspace</Kbd>
      <Kbd>Delete</Kbd>
    </div>
  ),
};
