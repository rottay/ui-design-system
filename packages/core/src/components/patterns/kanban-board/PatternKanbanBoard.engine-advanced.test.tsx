import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import type { KanbanBoardProps } from './KanbanBoard.types';
import ClassicKanbanBoard from './engines/classic';
import ModernKanbanBoard from './engines/modern';
import RusticKanbanBoard from './engines/rustic';

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
      expect(container.querySelector('.loading-spinner')).not.toBeNull();
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
