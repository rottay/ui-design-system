import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import type { SavedViewsBarProps, SavedView } from '../contracts';
import ModernSavedViewsBar from '../engines/modern';

const views: SavedView[] = [
  { id: 'view-1', name: 'All Items', isDefault: true, config: {} },
  { id: 'view-2', name: 'Active Only', config: {} },
];

function props(overrides: Partial<SavedViewsBarProps> = {}): SavedViewsBarProps {
  return {
    views,
    activeViewId: 'view-1',
    onViewSelect: vi.fn(),
    onViewRename: vi.fn(),
    onViewCreate: vi.fn(),
    allowRename: true,
    allowCreate: true,
    ...overrides,
  };
}

/** Open the per-pill menu and start the inline rename editor for "Active Only". */
function openRenameEditor(): HTMLElement {
  act(() => {
    fireEvent.click(screen.getByLabelText('Active Only options'));
  });
  act(() => {
    fireEvent.click(screen.getByText('Rename'));
  });
  return screen.getByLabelText('Rename');
}

describe('ModernSavedViewsBar focus custody', () => {
  it('returns focus to the pill after Escape dismisses the rename editor', () => {
    renderWithEngine(<ModernSavedViewsBar {...props()} />, 'modern');

    const input = openRenameEditor();
    expect(input).toHaveFocus();

    act(() => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    expect(screen.getByRole('button', { name: 'Active Only' })).toHaveFocus();
  });

  it('returns focus to the pill after Enter commits the rename', () => {
    const onViewRename = vi.fn();
    renderWithEngine(
      <ModernSavedViewsBar {...props({ onViewRename })} />,
      'modern',
    );

    const input = openRenameEditor();
    act(() => {
      fireEvent.change(input, { target: { value: 'Renamed View' } });
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(onViewRename).toHaveBeenCalledWith('view-2', 'Renamed View');
    expect(screen.getByRole('button', { name: 'Active Only' })).toHaveFocus();
  });

  it('returns focus to the create button after Escape dismisses the create input', () => {
    renderWithEngine(<ModernSavedViewsBar {...props()} />, 'modern');

    const createButton = screen.getByTestId('create-view-button');
    act(() => {
      fireEvent.click(createButton);
    });

    const input = screen.getByTestId('new-view-input');
    act(() => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    expect(screen.getByTestId('create-view-button')).toHaveFocus();
  });

  it('leaves focus alone when a blur — not a key — dismisses the rename editor', () => {
    renderWithEngine(<ModernSavedViewsBar {...props()} />, 'modern');

    const input = openRenameEditor();
    const elsewhere = screen.getByTestId('create-view-button');

    act(() => {
      elsewhere.focus();
      fireEvent.blur(input);
    });

    // The pointer's new target keeps focus; the handback is keyboard-only.
    expect(elsewhere).toHaveFocus();
  });
});
