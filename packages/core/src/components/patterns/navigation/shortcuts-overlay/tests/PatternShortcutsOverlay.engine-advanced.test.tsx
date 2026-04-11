import React from 'react';
import { fireEvent, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { StableEngineName } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import type { ShortcutsOverlayProps } from '../ShortcutsOverlay.types';
import ClassicShortcutsOverlay from '../engines/classic';
import ModernShortcutsOverlay from '../engines/modern';
import RusticShortcutsOverlay from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<ShortcutsOverlayProps>> = {
  classic: ClassicShortcutsOverlay,
  modern: ModernShortcutsOverlay,
  rustic: RusticShortcutsOverlay,
};

const SAMPLE_SHORTCUTS = [
  { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
  { key: 'g+i', description: 'Go to inbox', category: 'Navigation' },
  { key: 'g+p', description: 'Go to projects', category: 'Navigation' },
  { key: 'c', description: 'Create new item', category: 'Actions' },
  { key: 'escape', description: 'Close dialog', category: 'Global' },
];

function createProps(overrides: Partial<ShortcutsOverlayProps> = {}): ShortcutsOverlayProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    shortcuts: SAMPLE_SHORTCUTS,
    ...overrides,
  };
}

// Only test rustic/modern (non-Ant) inline since they don't require
// the full Ant Design provider setup and render conditionally on `open`.
for (const engineName of ['modern', 'rustic'] as const) {
  describe(`ShortcutsOverlay - ${engineName} engine`, () => {
    const Component = COMPONENTS[engineName];

    it('renders nothing when closed', () => {
      const { container } = renderWithEngine(
        <Component {...createProps({ open: false })} />,
        engineName
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders when open', () => {
      renderWithEngine(<Component {...createProps()} />, engineName);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('shows shortcut descriptions', () => {
      renderWithEngine(<Component {...createProps()} />, engineName);
      expect(screen.getByText('Open command palette')).toBeTruthy();
      expect(screen.getByText('Go to inbox')).toBeTruthy();
      expect(screen.getByText('Create new item')).toBeTruthy();
    });

    it('groups shortcuts by category', () => {
      renderWithEngine(<Component {...createProps()} />, engineName);
      expect(screen.getByText('Global')).toBeTruthy();
      expect(screen.getByText('Navigation')).toBeTruthy();
      expect(screen.getByText('Actions')).toBeTruthy();
    });

    it('filters shortcuts by search query', async () => {
      renderWithEngine(<Component {...createProps()} />, engineName);

      const input = screen.getByPlaceholderText('Search shortcuts...');
      fireEvent.change(input, { target: { value: 'inbox' } });

      // Should show matching
      expect(screen.getByText('Go to inbox')).toBeTruthy();
      // Should hide non-matching
      expect(screen.queryByText('Create new item')).toBeNull();
    });

    it('shows empty message when no shortcuts match', () => {
      renderWithEngine(<Component {...createProps()} />, engineName);

      const input = screen.getByPlaceholderText('Search shortcuts...');
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });

      expect(screen.getByText('No matching shortcuts.')).toBeTruthy();
    });

    it('calls onOpenChange(false) when close button clicked', () => {
      const onOpenChange = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onOpenChange })} />,
        engineName
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders custom title', () => {
      renderWithEngine(
        <Component {...createProps({ title: 'My Shortcuts' })} />,
        engineName
      );
      expect(screen.getByText('My Shortcuts')).toBeTruthy();
    });

    it('renders footer content', () => {
      renderWithEngine(
        <Component
          {...createProps({ footer: <span>Press ? to toggle</span> })}
        />,
        engineName
      );
      expect(screen.getByText('Press ? to toggle')).toBeTruthy();
    });
  });
}
