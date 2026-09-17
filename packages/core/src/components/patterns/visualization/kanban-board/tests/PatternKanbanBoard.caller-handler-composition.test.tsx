/**
 * The board card composes the caller's handler bag with the kernel's instead of
 * spreading one over the other. Every one of the six kernel handlers must
 * survive that composition, including the pointerup the drag contract reuses.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernKanbanBoard from '../engines/modern';

type Task = { id: string; title: string };

const columns = [
  { id: 'todo', title: 'To do', items: [{ id: 'task-1', title: 'A' }] },
  { id: 'doing', title: 'Doing', items: [] as Task[] },
];

describe('the composed handler bag keeps every kernel handler', () => {
  it('routes hover, press and focus on a card', () => {
    render(
      <ModernKanbanBoard<Task>
        columns={columns}
        itemKey={(task) => task.id}
        renderCard={(task) => <span>{task.title}</span>}
        onItemMove={vi.fn()}
      />,
    );
    const card = screen.getByText('A').closest('[data-part="card"]') as HTMLElement;

    expect(card).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(card);
    expect(card).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(card);
    expect(card).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(card);
    expect(card).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(card);
    expect(card).not.toHaveAttribute('data-state');
    fireEvent.focus(card);
    expect(card).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(card);
    expect(card).not.toHaveAttribute('data-state');
  });
});
