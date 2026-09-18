import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernKanbanBoard from '../engines/modern';
import type { KanbanColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * The board's transport runs on the shared drag session. These are the
 * assertions the family's own suite cannot make: the FLIP snapshot's contents
 * and its ordering against the parent's reorder, the start column the
 * four-argument callback reports when the parent moves the card mid-drag, the
 * absence of a grabbed phase in the arrow protocol, and the one declared
 * behaviour change -- a drag that did not start here marks nothing.
 */

type Task = { id: string; title: string };

const ZERO_RECT = {
  x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON() {},
} as DOMRect;

function boardProps(columns: KanbanColumnDef<Task>[], overrides: Record<string, unknown> = {}) {
  return {
    columns,
    itemKey: (task: Task) => task.id,
    renderCard: (task: Task) => <div>{task.title}</div>,
    onItemMove: vi.fn(),
    ...overrides,
  };
}

/** A board laid out at 300px per column and 50px per row, read from the live
    DOM so a re-parented card's "first" and "last" rects genuinely differ. */
function laidOutRect(element: HTMLElement): DOMRect {
  if (element.getAttribute('data-part') !== 'card') return ZERO_RECT;
  const list = element.parentElement;
  const column = element.closest('[data-part="column"]');
  const board = column?.parentElement ?? null;
  const row = list ? Array.prototype.indexOf.call(list.children, element) : 0;
  const lane = board && column ? Array.prototype.indexOf.call(board.children, column) : 0;
  const left = lane * 300;
  const top = row * 50;
  return {
    x: left, y: top, left, top, right: left + 280, bottom: top + 40,
    width: 280, height: 40, toJSON() {},
  } as DOMRect;
}

/** The controlled reorder a parent applies when the board reports a move. */
function moveItem(
  columns: KanbanColumnDef<Task>[],
  id: string,
  from: string,
  to: string,
  position: number,
): KanbanColumnDef<Task>[] {
  const moved = columns
    .find((column) => column.id === from)
    ?.items.find((item: Task) => item.id === id);
  if (!moved) return columns;
  return columns.map((column) => {
    if (column.id === from && column.id === to) {
      const rest = column.items.filter((item: Task) => item.id !== id);
      return { ...column, items: [...rest.slice(0, position), moved, ...rest.slice(position)] };
    }
    if (column.id === from) {
      return { ...column, items: column.items.filter((item: Task) => item.id !== id) };
    }
    if (column.id === to) {
      return {
        ...column,
        items: [...column.items.slice(0, position), moved, ...column.items.slice(position)],
      };
    }
    return column;
  });
}

function cardFor(title: string): HTMLElement {
  const card = screen.getByText(title).closest('[data-part="card"]');
  if (!card) throw new Error(`no card for ${title}`);
  return card as HTMLElement;
}

/** The transfer stubs the browser supplies and happy-dom does not. */
const startTransfer = () => ({ dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
const overTransfer = () => ({ dataTransfer: { dropEffect: '' } });
const dropTransfer = (key = '') => ({ dataTransfer: { getData: () => key } });

afterEach(() => {
  // @ts-expect-error -- removing the test-local WAAPI stand-in installed above.
  delete Element.prototype.animate;
  // @ts-expect-error -- removing the test-local WAAPI stand-in installed above.
  delete Element.prototype.getAnimations;
  vi.restoreAllMocks();
});

describe('KanbanBoard (modern) FLIP coupling', () => {
  const columns: KanbanColumnDef<Task>[] = [
    {
      id: 'todo',
      title: 'To do',
      items: [{ id: 'task-1', title: 'Task A' }, { id: 'task-2', title: 'Task B' }],
    },
  ];

  const crossColumns: KanbanColumnDef<Task>[] = [
    {
      id: 'todo',
      title: 'To do',
      items: [{ id: 'task-1', title: 'Task A' }, { id: 'task-2', title: 'Task B' }],
    },
    { id: 'doing', title: 'Doing', items: [] },
  ];

  it('snapshots every registered card BEFORE the parent reorders', () => {
    const trace: string[] = [];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute('data-part') === 'card') trace.push(`measure:${this.textContent}`);
        return ZERO_RECT;
      },
    );
    const onItemMove = vi.fn(() => {
      trace.push('move');
    });
    render(<ModernKanbanBoard<Task> {...boardProps(columns, { onItemMove })} />);

    const source = cardFor('Task A');
    const target = cardFor('Task B');
    fireEvent.dragStart(source, startTransfer());
    fireEvent.dragOver(target, overTransfer());
    fireEvent.drop(target, dropTransfer('task-1'));

    // The ordering assertion alone is green on a measure() that snapshots
    // nothing, so the snapshot's CONTENTS are the assertion: every registered
    // card, then the parent's reorder. (The reads AFTER the reorder are the
    // FLIP play step's own "last" measurement, a different question.)
    const reorderedAt = trace.indexOf('move');
    expect(reorderedAt).toBeGreaterThan(-1);
    expect(trace.slice(0, reorderedAt).sort()).toEqual([
      'measure:Task A',
      'measure:Task B',
    ]);
    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'todo', 1);
  });

  it('plays a transition on the card a drop re-parented', () => {
    const animated: Element[] = [];
    Element.prototype.animate = function (this: Element) {
      animated.push(this);
      return { cancel() {}, commitStyles() {}, finished: Promise.resolve() } as unknown as Animation;
    } as typeof Element.prototype.animate;
    Element.prototype.getAnimations = (() => []) as typeof Element.prototype.getAnimations;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return laidOutRect(this);
      },
    );
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: (name: string) =>
            name === '--ds-motion-normal' ? '200ms' : 'ease-out',
        }) as unknown as CSSStyleDeclaration,
    );

    function Harness() {
      const [live, setLive] = useState(crossColumns);
      return (
        <ModernKanbanBoard<Task>
          {...boardProps(live, {
            onItemMove: (id: string, from: string, to: string, position: number) =>
              setLive(moveItem(live, id, from, to, position)),
          })}
        />
      );
    }
    const { container } = render(<Harness />);

    const source = cardFor('Task A');
    const body = container.querySelectorAll('[data-part="column-body"]')[1];
    fireEvent.dragStart(source, startTransfer());
    fireEvent.dragOver(body, overTransfer());
    fireEvent.drop(body, dropTransfer('task-1'));

    expect(cardFor('Task A').closest('[data-part="column"]')).toBe(
      container.querySelectorAll('[data-part="column"]')[1],
    );
    expect(animated.map((node) => node.textContent)).toContain('Task A');
  });
});

describe('KanbanBoard (modern) start-column snapshot', () => {
  const INITIAL: KanbanColumnDef<Task>[] = [
    { id: 'todo', title: 'To do', items: [{ id: 'x', title: 'Card X' }] },
    { id: 'doing', title: 'Doing', items: [] },
    { id: 'done', title: 'Done', items: [] },
  ];
  const REPARENTED: KanbanColumnDef<Task>[] = [
    { id: 'todo', title: 'To do', items: [] },
    { id: 'doing', title: 'Doing', items: [{ id: 'x', title: 'Card X' }] },
    { id: 'done', title: 'Done', items: [] },
  ];

  it('reports the column the card STARTED in when the parent moves it mid-drag', () => {
    const onItemMove = vi.fn();
    let reparent: () => void = () => {};

    function Harness() {
      const [columns, setColumns] = useState(INITIAL);
      reparent = () => setColumns(REPARENTED);
      return <ModernKanbanBoard<Task> {...boardProps(columns, { onItemMove })} />;
    }
    const { container } = render(<Harness />);

    fireEvent.dragStart(cardFor('Card X'), startTransfer());
    act(() => reparent());

    const bodies = container.querySelectorAll('[data-part="column-body"]');
    fireEvent.dragOver(bodies[2], overTransfer());
    fireEvent.drop(bodies[2], dropTransfer('x'));

    // A current-column lookup would report "doing" here and would be green on
    // an undisturbed drag; the payload carries the capture taken at dragstart.
    expect(onItemMove).toHaveBeenCalledWith('x', 'todo', 'done', 0);
  });
});

describe('KanbanBoard (modern) arrow protocol', () => {
  const columns: KanbanColumnDef<Task>[] = [
    {
      id: 'todo',
      title: 'To do',
      items: [{ id: 'task-1', title: 'Task A' }, { id: 'task-2', title: 'Task B' }],
    },
    { id: 'doing', title: 'Doing', items: [] },
  ];

  it('moves on the arrow itself and never enters a grabbed phase', () => {
    const onItemMove = vi.fn();
    const onItemClick = vi.fn();
    const { container } = render(
      <ModernKanbanBoard<Task> {...boardProps(columns, { onItemMove, onItemClick })} />,
    );
    const card = cardFor('Task A');

    fireEvent.keyDown(card, { key: 'ArrowDown' });
    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'todo', 1);
    expect(container.querySelector('[data-dragging="true"]')).toBeNull();
    expect(container.querySelector('[data-dropping="true"]')).toBeNull();

    // A second arrow moves again: nothing is waiting for a commit key.
    fireEvent.keyDown(card, { key: 'ArrowDown' });
    expect(onItemMove).toHaveBeenCalledTimes(2);

    // Enter stays the card's own activation and never commits a move.
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1' }),
      'todo',
    );
    expect(onItemMove).toHaveBeenCalledTimes(2);

    // Home and End are not move keys.
    fireEvent.keyDown(card, { key: 'Home' });
    fireEvent.keyDown(card, { key: 'End' });
    expect(onItemMove).toHaveBeenCalledTimes(2);
  });

  it('announces the keyboard move and stays silent on a pointer drop', () => {
    const { container } = render(<ModernKanbanBoard<Task> {...boardProps(columns)} />);
    const announcer = container.querySelector('[data-part="move-announcer"]');

    fireEvent.keyDown(cardFor('Task A'), { key: 'ArrowRight' });
    expect(announcer).toHaveTextContent('Moved to Doing, position 1');

    fireEvent.keyDown(cardFor('Task A'), { key: 'ArrowUp' });
    expect(announcer).toHaveTextContent('Cannot move further in that direction');
  });

  it('leaves the live region untouched for a pointer drop', () => {
    const { container } = render(<ModernKanbanBoard<Task> {...boardProps(columns)} />);
    const announcer = container.querySelector('[data-part="move-announcer"]');

    const source = cardFor('Task A');
    fireEvent.dragStart(source, startTransfer());
    fireEvent.dragOver(cardFor('Task B'), overTransfer());
    fireEvent.drop(cardFor('Task B'), dropTransfer('task-1'));
    fireEvent.dragEnd(source);

    expect(announcer?.textContent).toBe('');
  });

  /**
   * A live region is spoken when its own text changes, so a repeated identical
   * outcome written into one region is silent the second time. Both legs press
   * the same key twice against a parent that does not reorder, which is the
   * only way the two messages are byte-identical: the blocked edge, and a move
   * that lands in the same place. The assertion is that the REGION CONTENTS
   * change while the message does not -- a fix that distinguished the second
   * announcement by altering the string would fail the second half.
   */
  it.each([
    ['a blocked edge', 'ArrowUp', 'Cannot move further in that direction'],
    ['an identical move', 'ArrowDown', 'Moved to position 2 in To do'],
  ])('re-announces %s pressed twice', (_leg, key, message) => {
    const { container } = render(<ModernKanbanBoard<Task> {...boardProps(columns)} />);
    const announcer = container.querySelector('[data-part="move-announcer"]');
    const regions = () =>
      Array.from(announcer?.querySelectorAll('[aria-live="polite"]') ?? []).map(
        (region) => region.textContent,
      );

    fireEvent.keyDown(cardFor('Task A'), { key });
    const first = regions();
    fireEvent.keyDown(cardFor('Task A'), { key });
    const second = regions();

    expect(first).not.toEqual(second);
    expect(first.filter(Boolean)).toEqual([message]);
    expect(second.filter(Boolean)).toEqual([message]);
  });
});

describe('KanbanBoard (modern) drop targets', () => {
  const columns: KanbanColumnDef<Task>[] = [
    {
      id: 'todo',
      title: 'To do',
      items: [{ id: 'task-1', title: 'Task A' }, { id: 'task-2', title: 'Task B' }],
    },
  ];

  /**
   * DECLARED CHANGE (the lot's only one): a drag that did not start on this
   * board no longer marks a column, because a highlight promises a drop that
   * will not happen -- the board refuses to reorder on the coincidence that a
   * foreign payload's text matches an item key.
   */
  it('marks nothing and commits nothing for a drag it did not start', () => {
    const onItemMove = vi.fn();
    const { container } = render(
      <ModernKanbanBoard<Task> {...boardProps(columns, { onItemMove })} />,
    );
    const body = container.querySelector('[data-part="column-body"]') as HTMLElement;

    fireEvent.dragOver(body, overTransfer());
    expect(body).toHaveAttribute('data-dropping', 'false');
    expect(container.querySelector('[data-drop-before="true"]')).toBeNull();
    expect(container.querySelector('[data-drop-at-end="true"]')).toBeNull();

    fireEvent.drop(body, dropTransfer('task-1'));
    expect(onItemMove).not.toHaveBeenCalled();
  });

  it('marks the hovered card and clears the mark when the drag ends', () => {
    const { container } = render(<ModernKanbanBoard<Task> {...boardProps(columns)} />);
    const source = cardFor('Task A');
    const target = cardFor('Task B');

    fireEvent.dragStart(source, startTransfer());
    expect(source).toHaveAttribute('data-dragging', 'true');
    fireEvent.dragOver(target, overTransfer());
    expect(target).toHaveAttribute('data-drop-before', 'true');

    fireEvent.dragEnd(source);
    expect(container.querySelector('[data-dragging="true"]')).toBeNull();
    expect(container.querySelector('[data-drop-before="true"]')).toBeNull();
  });

  it('still commits a card dropped on itself', () => {
    const onItemMove = vi.fn();
    render(<ModernKanbanBoard<Task> {...boardProps(columns, { onItemMove })} />);
    const source = cardFor('Task A');

    fireEvent.dragStart(source, startTransfer());
    fireEvent.dragOver(source, overTransfer());
    fireEvent.drop(source, dropTransfer('task-1'));

    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'todo', 0);
  });
});
