/**
 * ContextMenu Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './';
import { DesignSystemProvider } from '../../../../runtime/bootstrap';

const meta: Meta<typeof ContextMenu> = {
  title: 'Primitives/Overlay/ContextMenu',
  component: ContextMenu,
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
type Story = StoryObj<typeof ContextMenu>;

const defaultItems = [
  { key: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
  { key: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
  { key: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
  { key: 'd1', label: '', type: 'divider' as const },
  { key: 'delete', label: 'Delete', danger: true },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    trigger: (
      <div style={{ padding: 40, background: '#f0f0f0', borderRadius: 8, textAlign: 'center' }}>
        Right-click me
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    items: defaultItems,
    disabled: true,
    trigger: (
      <div style={{ padding: 40, background: '#e0e0e0', borderRadius: 8, textAlign: 'center', opacity: 0.5 }}>
        Right-click (disabled)
      </div>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { key: 'edit', label: 'Edit', icon: <span>-</span> },
      { key: 'duplicate', label: 'Duplicate', icon: <span>+</span> },
      { key: 'd1', label: '', type: 'divider' as const },
      { key: 'archive', label: 'Archive' },
    ],
    trigger: (
      <div style={{ padding: 40, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
        Right-click for actions
      </div>
    ),
  },
};
