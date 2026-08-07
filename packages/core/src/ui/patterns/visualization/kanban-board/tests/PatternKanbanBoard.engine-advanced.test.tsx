import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { KanbanBoardProps } from '../contracts';
import ClassicKanbanBoard from '../engines/classic';
import ModernKanbanBoard from '../engines/modern';
import RusticKanbanBoard from '../engines/rustic';

type Task = { id: string; title: string };

const COMPONENTS: Record<StableEngineName, React.ComponentType<KanbanBoardProps<Task>>> = {
  classic: ClassicKanbanBoard,
  modern: ModernKanbanBoard,
  rustic: RusticKanbanBoard,
};

const baseColumns = [
  {
    id: 'todo',
    title: 'To do',
    color: '#2563eb',
    limit: 1,
    items: [{ id: 'task-1', title: 'Task A' }],
  },
  {
    id: 'doing',
    title: 'Doing',
    items: [] as Task[],
  },
  {
    id: 'done',
    title: 'Done',
    collapsed: true,
    items: [{ id: 'task-2', title: 'Task B' }],
  },
];

function createBoardProps(overrides: Partial<KanbanBoardProps<Task>> = {}): KanbanBoardProps<Task> {
  return {
    columns: baseColumns,
    itemKey: (item) => item.id,
    renderCard: (item) => <div>{item.title}</div>,
    onItemMove: vi.fn(),
    toolbar: <div>Board toolbar</div>,
    emptyColumn: <div>Nothing here</div>,
    onAddItem: vi.fn(),
    onItemClick: vi.fn(),
    ...overrides,
  };
}

describe('PatternKanbanBoard advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers loading states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const { container } = renderWithEngine(
      <Component {...createBoardProps()} loading />,
      engine
    );

    expect(screen.queryByText('Task A')).not.toBeInTheDocument();

    if (engine === 'classic') {
      expect(container.querySelector('.ant-spin')).not.toBeNull();
    } else if (engine === 'modern') {
      expect(container.querySelector('.rottay-spinner--modern')).not.toBeNull();
    } else {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    }
  });

  it.each(STABLE_ENGINES)('covers fallback headers, drag-drop, click, add-item, and collapsed columns through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const onItemMove = vi.fn();
    const onItemClick = vi.fn();
    const onAddItem = vi.fn();
    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
      getData: vi.fn(),
    };

    const { container } = renderWithEngine(
      <Component
        {...createBoardProps({
          onItemMove,
          onItemClick,
          onAddItem,
        })}
      />,
      engine
    );

    expect(screen.getByText('Board toolbar')).toBeInTheDocument();
    expect(screen.getByText('To do')).toBeInTheDocument();
    expect(screen.getByText('Doing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-loading',
      'false'
    );
    expect(container.querySelector('[data-part="board"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-part="column"]')).toHaveLength(3);

    fireEvent.click(screen.getByText('Task A'));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', title: 'Task A' }),
      'todo'
    );

    const addButtons = screen.getAllByRole('button', { name: /add item/i });
    fireEvent.click(addButtons[0]);
    expect(onAddItem).toHaveBeenCalledWith('todo');

    const draggableCard = container.querySelector('[draggable="true"]');
    const dropZone = screen.getByText('Nothing here').parentElement;

    if (!(draggableCard instanceof HTMLElement) || !(dropZone instanceof HTMLElement)) {
      throw new Error('Expected a draggable card and empty-column drop zone');
    }

    fireEvent.dragStart(draggableCard, { dataTransfer });
    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });
    fireEvent.dragEnd(draggableCard, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'task-1');
    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'doing', 0);

    // The collapsed column should still render its title, but not the inner card content.
    expect(screen.queryByText('Task B')).not.toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('covers custom column headers through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];

    renderWithEngine(
      <Component
        {...createBoardProps({
          renderColumnHeader: (column, count) => (
            <div>{`${column.title} custom ${count}`}</div>
          ),
        })}
      />,
      engine
    );

    expect(screen.getByText('To do custom 1')).toBeInTheDocument();
    expect(screen.getByText('Doing custom 0')).toBeInTheDocument();
  });
});

describe('PatternKanbanBoard modern drop and empty-column defaults', () => {
  it('emits exactly one move when a card is dropped onto another card', async () => {
    const onItemMove = vi.fn();
    renderWithEngine(
      <ModernKanbanBoard
        {...createBoardProps({
          columns: [
            {
              id: 'todo',
              title: 'To do',
              items: [
                { id: 'task-1', title: 'Task A' },
                { id: 'task-2', title: 'Task B' },
              ],
            },
          ],
          onItemMove,
        })}
      />,
      'modern'
    );

    const cards = await screen.findAllByRole('listitem');
    const source = cards[0];
    const target = cards[1];

    fireEvent.dragStart(source, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragOver(target, { dataTransfer: { dropEffect: '' } });
    fireEvent.drop(target, { dataTransfer: { getData: () => 'task-1' } });

    expect(onItemMove).toHaveBeenCalledTimes(1);
    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'todo', 1);
  });

  it('renders a governed default in an empty column when no emptyColumn is supplied', async () => {
    renderWithEngine(
      <ModernKanbanBoard
        {...createBoardProps({
          columns: [{ id: 'doing', title: 'Doing', items: [] as Task[] }],
          emptyColumn: undefined,
        })}
      />,
      'modern'
    );

    const emptyColumn = await screen.findByText('No items');
    expect(emptyColumn).toBeInTheDocument();
    expect(emptyColumn.closest('[data-part="empty-column"]')).not.toBeNull();
  });

  it('keeps the card drop indicator from being overwritten by the column-end indicator', async () => {
    const onItemMove = vi.fn();
    const { container } = renderWithEngine(
      <ModernKanbanBoard
        {...createBoardProps({
          columns: [
            {
              id: 'todo',
              title: 'To do',
              items: [
                { id: 'task-1', title: 'Task A' },
                { id: 'task-2', title: 'Task B' },
              ],
            },
          ],
          onItemMove,
        })}
      />,
      'modern',
    );

    const cards = await screen.findAllByRole('listitem');
    fireEvent.dragStart(cards[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragOver(cards[1], { dataTransfer: { dropEffect: '' } });

    // dragOver on a card must not bubble: the column body would otherwise
    // recompute the target as an append and clobber the before-card indicator.
    expect(cards[1].getAttribute('data-drop-before')).toBe('true');
    const body = container.querySelector('[data-part="column-body"]');
    expect(body?.getAttribute('data-drop-at-end')).not.toBe('true');
  });
});

describe('PatternKanbanBoard modern card-slot and column naming', () => {
  const withControlColumns = () => ({
    columns: [
      {
        id: 'todo',
        title: 'To do',
        items: [
          { id: 'task-1', title: 'Task A' },
          { id: 'task-2', title: 'Task B' },
        ],
      },
      { id: 'doing', title: 'Doing', items: [{ id: 'task-3', title: 'Task C' }] },
    ],
  });

  it('leaves keys pressed inside consumer card content to that control', () => {
    const onItemMove = vi.fn();
    const onItemClick = vi.fn();
    renderWithEngine(
      <ModernKanbanBoard
        {...createBoardProps({
          ...withControlColumns(),
          onItemMove,
          onItemClick,
          renderCard: (item) => (
            <div>
              <span>{item.title}</span>
              <input aria-label={`rename ${item.id}`} defaultValue={item.title} />
              <button type="button">open {item.id}</button>
            </div>
          ),
        })}
      />,
      'modern',
    );

    const field = screen.getByLabelText('rename task-1');
    // ArrowRight inside a text field moves the caret; it must never move the
    // card to the next column.
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    fireEvent.keyDown(field, { key: 'ArrowLeft' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(onItemMove).not.toHaveBeenCalled();

    // Enter on a nested button activates the button; it must not be swallowed
    // by the card's move protocol.
    fireEvent.keyDown(screen.getByRole('button', { name: 'open task-1' }), { key: 'Enter' });
    expect(onItemClick).not.toHaveBeenCalled();

    // The card itself still owns the protocol.
    const card = field.closest('[data-part="card"]') as HTMLElement;
    fireEvent.keyDown(card, { key: 'ArrowDown' });
    expect(onItemMove).toHaveBeenCalledWith('task-1', 'todo', 'todo', 1);
  });

  it('names every column card list by its column title', async () => {
    renderWithEngine(
      <ModernKanbanBoard {...createBoardProps(withControlColumns())} />,
      'modern',
    );

    // Without the name a screen-reader user hears "list, 2 items" and cannot
    // tell which column the focused card belongs to.
    const todo = await screen.findByRole('list', { name: 'To do' });
    const doing = await screen.findByRole('list', { name: 'Doing' });
    expect(within(todo).getAllByRole('listitem')).toHaveLength(2);
    expect(within(doing).getAllByRole('listitem')).toHaveLength(1);
  });

  it('keeps an ellipsised column title recoverable for sighted pointer users', () => {
    const { container } = renderWithEngine(
      <ModernKanbanBoard
        {...createBoardProps({
          columns: [
            {
              id: 'todo',
              title: 'Awaiting procurement approval and vendor onboarding',
              items: [] as Task[],
            },
          ],
        })}
      />,
      'modern',
    );

    const title = container.querySelector('[data-part="column-title"]');
    expect(title).toHaveAttribute(
      'title',
      'Awaiting procurement approval and vendor onboarding',
    );
  });
});
