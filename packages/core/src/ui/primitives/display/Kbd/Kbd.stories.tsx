/**
 * Kbd Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

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


// ============================================================================
// State Matrix Stories (K1 Lane A)
// ============================================================================

const matrixLabel = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.55,
  marginBottom: 8,
} as const;

/**
 * Modern craft matrix: multi-key chords, sizes, baseline alignment inside body
 * copy, dense shortcut collections, and long key names.
 */
export const ChordsAndBaseline: Story = {
  name: '🧪 Chords & Baseline',
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
      <div>
        <div style={matrixLabel}>Chords</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Kbd>⌘</Kbd>+<Kbd>K</Kbd>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+<Kbd>P</Kbd>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>Supr</Kbd>
          </span>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Sizes</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Kbd size="sm">Esc</Kbd>
          <Kbd size="md">Esc</Kbd>
          <Kbd size="lg">Esc</Kbd>
        </div>
      </div>
      <div>
        <div style={matrixLabel}>Baseline inside text</div>
        <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.6, fontSize: 14 }}>
          Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette, then type to filter.
          Use <Kbd>↑</Kbd> and <Kbd>↓</Kbd> to move, <Kbd>Enter</Kbd> to confirm, and{' '}
          <Kbd>Esc</Kbd> to dismiss without losing your place in the list.
        </p>
      </div>
      <div>
        <div style={matrixLabel}>Dense collection & long names</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 320 }}>
          <Kbd>Backspace</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>⇪</Kbd>
          <Kbd>Fn</Kbd>
          <Kbd>Espacio</Kbd>
          <Kbd>مسافة</Kbd>
        </div>
      </div>
    </div>
  ),
};
