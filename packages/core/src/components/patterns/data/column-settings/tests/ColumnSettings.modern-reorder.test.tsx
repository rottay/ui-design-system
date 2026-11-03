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

const announcerText = (container: HTMLElement) =>
  container.querySelector('[data-part="move-announcer"]')?.textContent;

function ControlledColumnSettings({ onReorder }: { onReorder: (order: string[]) => void }) {
  const [columnOrder, setColumnOrder] = React.useState(['name', 'status', 'owner']);
  return (
    <ModernColumnSettingsDropdown
      {...buildProps({
        columnOrder,
        onReorder: (order) => {
          onReorder(order);
          setColumnOrder(order);
        },
      })}
    />
  );
}

describe('ColumnSettings modern — moved row', () => {
  it('moves and names the row in its rendered order, not its allColumns position', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { container, findByRole } = render(
      <ModernColumnSettingsDropdown
        {...buildProps({ onReorder, columnOrder: ['owner', 'name', 'status'] })}
      />,
    );

    // Name renders second (columnOrder) while allColumns[1] is Status.
    await user.click(await findByRole('button', { name: 'Move column down: Name' }));

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith(['owner', 'status', 'name']);
    await waitFor(() => {
      expect(announcerText(container)).toBe('Name moved to position 3 of 3');
    });
  });

  it('falls back to the column key for a non-string header on the last row', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { container, findByRole } = render(
      <ModernColumnSettingsDropdown
        {...buildProps({
          onReorder,
          allColumns: [
            { key: 'name', header: 'Name' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: <>Owner</> },
          ],
        })}
      />,
    );

    await user.click(await findByRole('button', { name: 'Move column up: owner' }));

    expect(onReorder).toHaveBeenCalledWith(['name', 'owner', 'status']);
    await waitFor(() => {
      expect(announcerText(container)).toBe('owner moved to position 2 of 3');
    });
  });

  it('sends the first row to the last position with End and counts every row', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { container, findByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps({ onReorder })} />,
    );

    (await findByRole('button', { name: 'Move column down: Name' })).focus();
    await user.keyboard('{End}');

    expect(onReorder).toHaveBeenCalledWith(['status', 'owner', 'name']);
    await waitFor(() => {
      expect(announcerText(container)).toBe('Name moved to position 3 of 3');
    });
  });

  it('ignores edge keys that would not move the row', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { container, findByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps({ onReorder })} />,
    );

    (await findByRole('button', { name: 'Move column down: Name' })).focus();
    await user.keyboard('{ArrowUp}{Home}');
    (await findByRole('button', { name: 'Move column up: Owner' })).focus();
    await user.keyboard('{ArrowDown}{End}');

    expect(onReorder).not.toHaveBeenCalled();
    expect(announcerText(container)).toBe('');
  });

  it('pauses reordering while the search filter hides rows', async () => {
    const user = userEvent.setup();
    const { findByRole, queryByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps()} />,
    );

    // "n" keeps Name and Owner; unfiltered, Name could move down and Owner up.
    await user.type(await findByRole('textbox'), 'n');

    await waitFor(() => {
      expect(queryByRole('button', { name: 'Move column up: Status' })).toBeNull();
    });
    expect(await findByRole('button', { name: 'Move column down: Name' })).toBeDisabled();
    expect(await findByRole('button', { name: 'Move column up: Owner' })).toBeDisabled();
  });

  it('keeps focus on the moved row and hands it over at the top edge', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const { container, findByRole } = render(
      <ControlledColumnSettings onReorder={onReorder} />,
    );

    await user.click(await findByRole('button', { name: 'Move column up: Status' }));

    expect(onReorder).toHaveBeenCalledWith(['status', 'name', 'owner']);
    const statusDown = await findByRole('button', { name: 'Move column down: Status' });
    await waitFor(() => {
      expect(statusDown).toHaveFocus();
    });
    expect(statusDown.closest('[role="listitem"]')).toHaveAttribute('aria-posinset', '1');
    expect(await findByRole('button', { name: 'Move column up: Status' })).toBeDisabled();
    expect(announcerText(container)).toBe('Status moved to position 1 of 3');
  });
});
