import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternShortcutsOverlay } from './index';
import {
  ShortcutProvider,
  useGlobalShortcut,
  useGlobalShortcuts,
  useRegisteredShortcuts,
} from '../../../hooks/shortcuts';
import { createSurfaceStoryDecorator } from '../../../surfaces/common/story-helpers';
import type { ShortcutDisplayItem } from './ShortcutsOverlay.types';

const SAMPLE_SHORTCUTS: ShortcutDisplayItem[] = [
  { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
  { key: 'shift+?', description: 'Show keyboard shortcuts', category: 'Global' },
  { key: 'escape', description: 'Close dialog', category: 'Global' },
  { key: 'g+i', description: 'Go to Inbox', category: 'Navigation' },
  { key: 'g+p', description: 'Go to Projects', category: 'Navigation' },
  { key: 'g+s', description: 'Go to Settings', category: 'Navigation' },
  { key: 'g+d', description: 'Go to Dashboard', category: 'Navigation' },
  { key: 'c', description: 'Create new item', category: 'Actions' },
  { key: 'e', description: 'Edit selected item', category: 'Actions' },
  { key: 'ctrl+d', description: 'Duplicate item', category: 'Actions' },
  { key: 'delete', description: 'Delete selected item', category: 'Actions' },
  { key: 'ctrl+z', description: 'Undo', category: 'Editing' },
  { key: 'ctrl+shift+z', description: 'Redo', category: 'Editing' },
  { key: 'ctrl+c', description: 'Copy', category: 'Editing' },
  { key: 'ctrl+v', description: 'Paste', category: 'Editing' },
];

const meta: Meta<typeof PatternShortcutsOverlay> = {
  title: 'Patterns/ShortcutsOverlay',
  component: PatternShortcutsOverlay,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'generic.default', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternShortcutsOverlay>;

/**
 * Interactive story showing the full shortcut system wired together.
 */
function InteractiveDemo() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  useGlobalShortcut({
    key: 'shift+?',
    handler: () => setOverlayOpen(true),
    description: 'Show keyboard shortcuts',
    category: 'Global',
  });

  useGlobalShortcuts([
    { key: 'ctrl+k', handler: () => {}, description: 'Open command palette', category: 'Global' },
    { key: 'g+i', handler: () => {}, description: 'Go to Inbox', category: 'Navigation' },
    { key: 'g+p', handler: () => {}, description: 'Go to Projects', category: 'Navigation' },
    { key: 'c', handler: () => {}, description: 'Create new item', category: 'Actions' },
    { key: 'e', handler: () => {}, description: 'Edit selected item', category: 'Actions' },
    { key: 'escape', handler: () => setOverlayOpen(false), description: 'Close dialog', category: 'Global' },
  ]);

  const registered = useRegisteredShortcuts();

  return (
    <div>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ marginBottom: 16, color: 'var(--ds-color-text-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', border: '1px solid var(--ds-color-border)', borderRadius: 4 }}>?</kbd> to
          open the shortcuts overlay, or click the button below.
        </p>
        <button
          onClick={() => setOverlayOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-secondary)',
            cursor: 'pointer',
          }}
        >
          Show Shortcuts ({registered.length} registered)
        </button>
      </div>
      <PatternShortcutsOverlay
        open={overlayOpen}
        onOpenChange={setOverlayOpen}
        shortcuts={registered}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => (
    <ShortcutProvider>
      <InteractiveDemo />
    </ShortcutProvider>
  ),
};

export const StaticShortcuts: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    shortcuts: SAMPLE_SHORTCUTS,
    title: 'Keyboard Shortcuts',
  },
};

export const WithSearch: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    shortcuts: SAMPLE_SHORTCUTS,
    searchPlaceholder: 'Find a shortcut...',
  },
};

export const WithFooter: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    shortcuts: SAMPLE_SHORTCUTS.slice(0, 6),
    footer: 'Press Esc to close',
  },
};

export const Empty: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    shortcuts: [],
    emptyMessage: 'No shortcuts registered yet.',
  },
};
