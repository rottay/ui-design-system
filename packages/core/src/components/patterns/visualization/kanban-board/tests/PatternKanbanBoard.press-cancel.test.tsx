import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernKanbanBoard from '../engines/modern';

/**
 * A card is a stateful part (F-37), so its press is decided once by the
 * interaction kernel. HTML5 drag SUPPRESSES the pointerup that would end that
 * press: a drag that starts and ends on the same card used to leave
 * `[data-state~='pressed']` -- and the skin's grabbing cursor -- latched until a
 * later pointerleave or blur. Drag end and pointer cancel now route through the
 * kernel's press-cancel.
 */

type Task = { id: string; title: string };

const columns = [
  { id: 'todo', title: 'To do', items: [{ id: 'task-1', title: 'A' }] },
  { id: 'doing', title: 'Doing', items: [] as Task[] },
];

function cardFor(title: string): HTMLElement {
  const card = screen.getByText(title).closest('[data-part="card"]');
  if (!card) throw new Error(`no card for ${title}`);
  return card as HTMLElement;
}

function renderBoard() {
  render(
    <ModernKanbanBoard<Task>
      columns={columns}
      itemKey={(task) => task.id}
      renderCard={(task) => <span>{task.title}</span>}
      onItemMove={vi.fn()}
    />,
  );
  return cardFor('A');
}

describe('KanbanBoard (modern) card press state', () => {
  it('stamps no state on a resting card', () => {
    expect(renderBoard().hasAttribute('data-state')).toBe(false);
  });

  it('holds the press while the pointer is down', () => {
    const card = renderBoard();
    fireEvent.pointerDown(card);
    expect(card.getAttribute('data-state')).toContain('pressed');
  });

  it('leaves no pressed state after a drag that ends on the same card', () => {
    const card = renderBoard();
    fireEvent.pointerDown(card);
    // The browser fires no pointerup for a drag gesture.
    fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragEnd(card);
    expect(card.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('leaves no pressed state after a cancelled pointer', () => {
    const card = renderBoard();
    fireEvent.pointerDown(card);
    fireEvent.pointerCancel(card);
    expect(card.getAttribute('data-state') ?? '').not.toContain('pressed');
  });
});
