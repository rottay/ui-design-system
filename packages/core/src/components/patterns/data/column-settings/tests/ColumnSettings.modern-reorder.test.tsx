import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernColumnSettingsDropdown from '../engines/modern';
import type { ColumnSettingsProps } from '../contracts';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

function buildProps(overrides: Partial<ColumnSettingsProps> = {}): ColumnSettingsProps {
  return {
    allColumns: [
      { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' },
      { key: 'owner', header: 'Owner' },
    ],
    visibleColumns: ['name', 'status'],
    lockedColumns: [],
    columnOrder: ['name', 'status', 'owner'],
    pinnedColumns: { left: [], right: [] },
    onToggleVisibility: vi.fn(),
    onReorder: vi.fn(),
    onTogglePin: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

describe('ColumnSettings modern — pointer and touch reorder', () => {
  it('reorders on a plain click, not only on a key press', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { findByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps({ onReorder })} />,
    );

    // Before: the sole reorder control was a grip Button carrying onKeyDown
    // ONLY — no onClick, no drag handlers — so pointer and touch users could
    // not reorder at all while a grip icon advertised that they could.
    await user.click(await findByRole('button', { name: 'Move column down: Name' }));

    expect(onReorder).toHaveBeenCalledWith(['status', 'name', 'owner']);
  });

  it('offers both directions and disables them only at the edges', async () => {
    const { findByRole } = render(<ModernColumnSettingsDropdown {...buildProps()} />);

    expect(await findByRole('button', { name: 'Move column up: Name' })).toBeDisabled();
    expect(await findByRole('button', { name: 'Move column down: Name' })).toBeEnabled();
    expect(await findByRole('button', { name: 'Move column up: Owner' })).toBeEnabled();
    expect(await findByRole('button', { name: 'Move column down: Owner' })).toBeDisabled();
  });

  it('keeps the ArrowUp/ArrowDown keyboard contract on the same controls', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { findByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps({ onReorder })} />,
    );

    (await findByRole('button', { name: 'Move column up: Owner' })).focus();
    await user.keyboard('{ArrowUp}');

    expect(onReorder).toHaveBeenCalledWith(['name', 'owner', 'status']);
  });
});

describe('ColumnSettings modern — move announcement', () => {
  it('mounts a polite region empty and announces the new position after a move', async () => {
    const user = userEvent.setup();
    const { container, findByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps()} />,
    );
    const moveDown = await findByRole('button', { name: 'Move column down: Name' });

    // Before: a move was completely silent — no live region existed at all.
    const announcer = container.querySelector('[data-part="move-announcer"]');
    expect(announcer).not.toBeNull();
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer?.textContent).toBe('');

    await user.click(moveDown);

    await waitFor(() => {
      expect(
        container.querySelector('[data-part="move-announcer"]')?.textContent,
      ).toBe('Name moved to position 2 of 3');
    });
  });
});
