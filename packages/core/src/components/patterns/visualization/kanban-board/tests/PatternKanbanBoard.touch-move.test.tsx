import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import ModernKanbanBoard from '../engines/modern';

/**
 * P1 regression: HTML5 drag-and-drop never fires on a coarse pointer and the
 * arrow-key move protocol needs a keyboard, so the board used to be read-only
 * on touch. The rail exposes the same controlled protocol as real Buttons.
 */

type Task = { id: string; title: string };

const columns = [
  { id: 'todo', title: 'To do', items: [{ id: 'task-1', title: 'A' }, { id: 'task-2', title: 'B' }] },
  { id: 'doing', title: 'Doing', items: [] as Task[] },
];

function renderBoard(
  onItemMove = vi.fn(),
  onItemClick?: (item: Task, columnId: string) => void,
  dir?: 'rtl',
) {
  const utils = render(
    <div dir={dir}>
      <ModernKanbanBoard<Task>
        columns={columns}
        itemKey={(task) => task.id}
        renderCard={(task) => <span>{task.title}</span>}
        onItemMove={onItemMove}
        onItemClick={onItemClick}
      />
    </div>,
  );
  return { ...utils, onItemMove };
}

/** The first card's move rail, scoped so sibling cards cannot answer. */
function railFor(title: string): HTMLElement {
  const card = screen.getByText(title).closest('[data-part="card"]');
  if (!card) throw new Error(`no card for ${title}`);
  return card as HTMLElement;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('KanbanBoard (modern) coarse-pointer move rail', () => {
  it('renders no rail on a fine pointer', () => {
    mockMatchMedia(1280);
    renderBoard();

    expect(screen.queryByLabelText('Move to next column')).toBeNull();
  });

  it('exposes the four logical move controls on a coarse pointer', () => {
    mockMatchMedia(390);
    renderBoard();

    const rail = within(railFor('A'));
    expect(rail.getByLabelText('Move up')).toBeInTheDocument();
    expect(rail.getByLabelText('Move down')).toBeInTheDocument();
    expect(rail.getByLabelText('Move to previous column')).toBeInTheDocument();
    expect(rail.getByLabelText('Move to next column')).toBeInTheDocument();
  });

  it('moves a card across columns through the controlled onItemMove contract', () => {
    mockMatchMedia(390);
    const onItemMove = vi.fn();
    renderBoard(onItemMove);

    fireEvent.click(within(railFor('A')).getByLabelText('Move to next column'));

    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'doing', 0);
  });

  it('reorders inside the column and never fires the card click', () => {
    mockMatchMedia(390);
    const onItemMove = vi.fn();
    const onItemClick = vi.fn();
    renderBoard(onItemMove, onItemClick);

    fireEvent.click(within(railFor('B')).getByLabelText('Move up'));

    expect(onItemMove).toHaveBeenCalledWith('task-2', 'todo', 'todo', 0);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('announces a blocked edge instead of moving', () => {
    mockMatchMedia(390);
    const onItemMove = vi.fn();
    const { container } = renderBoard(onItemMove);

    fireEvent.click(within(railFor('A')).getByLabelText('Move up'));

    expect(onItemMove).not.toHaveBeenCalled();
    expect(container.querySelector('[data-part="move-announcer"]')).toHaveTextContent(
      'Cannot move further in that direction',
    );
  });

  it('keeps the move intent logical under RTL', () => {
    mockMatchMedia(390);
    const onItemMove = vi.fn();
    renderBoard(onItemMove, undefined, 'rtl');

    fireEvent.click(within(railFor('A')).getByLabelText('Move to next column'));

    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'doing', 0);
  });
});
