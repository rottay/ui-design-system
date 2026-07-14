import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCalendarView from '../calendar-view/engines/modern';
import RusticCalendarView from '../calendar-view/engines/rustic';
import ModernKanbanBoard from '../kanban-board/engines/modern';
import RusticKanbanBoard from '../kanban-board/engines/rustic';
import ModernMapView from '../map-view/engines/modern';
import RusticMapView from '../map-view/engines/rustic';
import ModernTimeline from '../timeline/engines/modern';
import RusticTimeline from '../timeline/engines/rustic';
import ModernTreeView from '../tree-view/engines/modern';
import RusticTreeView from '../tree-view/engines/rustic';

// WO-SKIN-06 CK-E inert anatomy contract. These assertions cover the
// selector-bearing branches and finite states without depending on a skin.
const ENGINES = ['modern', 'rustic'] as const;

const q = (container: HTMLElement, selector: string) => container.querySelectorAll(selector);

function expectScope(container: HTMLElement, component: string, engine: (typeof ENGINES)[number]): HTMLElement {
  const root = container.querySelector('[data-part="root"]');
  expect(root).not.toBeNull();
  expect(root?.classList.contains(`ds-pattern-${component}`)).toBe(true);
  expect(root?.classList.contains(`ds-engine-${engine}`)).toBe(true);
  return root as HTMLElement;
}

describe('CK-E non-chart inert anatomy', () => {
  it.each(ENGINES)('pins CalendarView normal and loading anatomy (%s)', (engine) => {
    const Component = engine === 'modern' ? ModernCalendarView : RusticCalendarView;
    const today = new Date();
    const events = Array.from({ length: 4 }, (_, index) => ({
      id: `event-${index}`,
      title: `Event ${index}`,
      start: today,
      color: index === 0 ? 'rebeccapurple' : undefined,
    }));
    const normal = render(<Component events={events} currentDate={today} view="week" />);

    const root = expectScope(normal.container, 'calendar-view', engine);
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).toHaveAttribute('data-view-mode', 'week');
    expect(q(normal.container, '[data-part="toolbar-action"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="weekday"]')).toHaveLength(7);
    expect(q(normal.container, '[data-part="day-cell"][data-today="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="day-cell"][data-last-column="true"]').length).toBeGreaterThan(0);
    expect(q(normal.container, '[data-part="event"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="overflow-count"]')).toHaveLength(1);
    normal.unmount();

    const loading = render(<Component events={[]} loading />);
    expect(expectScope(loading.container, 'calendar-view', engine)).toHaveAttribute('data-loading', 'true');
    expect(q(loading.container, '[data-part="loading"]')).toHaveLength(1);
    expect(q(loading.container, '[data-part="spinner"]')).toHaveLength(engine === 'modern' ? 1 : 0);
  });

  it.each(ENGINES)('pins MapView normal, empty and loading anatomy (%s)', (engine) => {
    const Component = engine === 'modern' ? ModernMapView : RusticMapView;
    const markers = [
      { id: 'a', lat: 10, lng: 20, label: 'Alpha', color: 'rebeccapurple' },
      { id: 'b', lat: 30, lng: 40, label: 'Beta' },
    ];
    const normal = render(
      <Component
        markers={markers}
        selectedMarkerId="b"
        sidebar={<span>Sidebar</span>}
        renderPopup={(marker) => <span>{`Popup ${marker.id}`}</span>}
      />,
    );

    const root = expectScope(normal.container, 'map-view', engine);
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).toHaveAttribute('data-empty', 'false');
    expect(q(normal.container, '[data-part="placeholder-label"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="marker-row"]')).toHaveLength(2);
    expect(q(normal.container, '[data-part="marker-row"][data-selected="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="marker-row"][data-last="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="marker-color"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="coordinates"]')).toHaveLength(2);
    normal.unmount();

    const empty = render(<Component markers={[]} />);
    expect(expectScope(empty.container, 'map-view', engine)).toHaveAttribute('data-empty', 'true');
    expect(q(empty.container, '[data-part="empty"]')).toHaveLength(1);
    empty.unmount();

    const loading = render(<Component markers={[]} loading />);
    expect(expectScope(loading.container, 'map-view', engine)).toHaveAttribute('data-loading', 'true');
    expect(q(loading.container, '[data-part="loading"]')).toHaveLength(1);
    expect(q(loading.container, '[data-part="spinner"]')).toHaveLength(engine === 'modern' ? 1 : 0);
  });

  it.each(ENGINES)('pins KanbanBoard finite drag/drop and loading anatomy (%s)', (engine) => {
    const Component = engine === 'modern' ? ModernKanbanBoard : RusticKanbanBoard;
    const columns = [
      { id: 'todo', title: 'Todo', limit: 1, items: [{ id: 'task-1' }] },
      { id: 'doing', title: 'Doing', items: [] as Array<{ id: string }> },
      { id: 'done', title: 'Done', collapsed: true, items: [] as Array<{ id: string }> },
    ];
    const props = {
      columns,
      itemKey: (item: { id: string }) => item.id,
      renderCard: (item: { id: string }) => <span>{item.id}</span>,
      onItemMove: () => undefined,
      onItemClick: () => undefined,
      onAddItem: () => undefined,
      emptyColumn: <span>Empty</span>,
    };
    const normal = render(<Component {...props} />);

    const root = expectScope(normal.container, 'kanban-board', engine);
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(q(normal.container, '[data-part="column"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="column"][data-over-limit="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="column"][data-collapsed="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="column-body"]')).toHaveLength(2);
    expect(q(normal.container, '[data-part="empty-column"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="card"][data-clickable="true"]')).toHaveLength(1);

    const dataTransfer = { effectAllowed: 'move', dropEffect: 'move', setData: () => undefined };
    const card = normal.container.querySelector('[data-part="card"]') as HTMLElement;
    const dropZone = q(normal.container, '[data-part="column-body"]')[1] as HTMLElement;
    fireEvent.dragStart(card, { dataTransfer });
    expect(q(normal.container, '[data-part="card"][data-dragging="true"]')).toHaveLength(1);
    fireEvent.dragOver(dropZone, { dataTransfer });
    expect(q(normal.container, '[data-part="column-body"][data-dropping="true"]')).toHaveLength(1);
    normal.unmount();

    const loading = render(<Component {...props} loading />);
    expect(expectScope(loading.container, 'kanban-board', engine)).toHaveAttribute('data-loading', 'true');
    expect(q(loading.container, '[data-part="spinner"]')).toHaveLength(engine === 'modern' ? 1 : 0);
  });

  it.each(ENGINES)('pins Timeline semantic/grouped and terminal anatomy (%s)', (engine) => {
    const Component = engine === 'modern' ? ModernTimeline : RusticTimeline;
    const timestamp = new Date('2026-07-14T12:00:00Z');
    const items = [
      { key: 'one', timestamp, title: 'One', description: 'First', type: 'success' as const, user: { name: 'Ada', avatar: '/ada.png' } },
      { key: 'two', timestamp, title: 'Two', type: 'warning' as const, icon: <span>!</span> },
    ];
    const normal = render(<Component items={items} mode="alternate" groupByDate onItemClick={() => undefined} />);

    const root = expectScope(normal.container, 'timeline', engine);
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).toHaveAttribute('data-empty', 'false');
    expect(root).toHaveAttribute('data-grouped', 'true');
    expect(q(normal.container, '[data-part="date-group"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="item"]')).toHaveLength(2);
    expect(q(normal.container, '[data-part="marker"]')).toHaveLength(2);
    expect(q(normal.container, '[data-part="item-card"][data-clickable="true"]')).toHaveLength(2);
    expect(q(normal.container, '[data-part="avatar"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="type-badge"]')).toHaveLength(engine === 'modern' ? 2 : 0);
    normal.unmount();

    const empty = render(<Component items={[]} />);
    expect(expectScope(empty.container, 'timeline', engine)).toHaveAttribute('data-empty', 'true');
    expect(q(empty.container, '[data-part="empty"]')).toHaveLength(1);
    empty.unmount();

    const loading = render(<Component items={[]} loading />);
    expect(expectScope(loading.container, 'timeline', engine)).toHaveAttribute('data-loading', 'true');
    expect(q(loading.container, '[data-part="spinner"]')).toHaveLength(engine === 'modern' ? 1 : 0);
  });

  it.each(ENGINES)('pins TreeView selection/control and loading anatomy (%s)', (engine) => {
    const Component = engine === 'modern' ? ModernTreeView : RusticTreeView;
    const data = [
      { key: 'root', label: 'Root', children: [{ key: 'child', label: 'Child' }] },
      { key: 'disabled', label: 'Disabled', disabled: true },
    ];
    const normal = render(
      <Component
        data={data}
        expandedKeys={['root']}
        selectedKeys={['child']}
        checkedKeys={['child']}
        searchable
        checkable
        draggable
      />,
    );

    const root = expectScope(normal.container, 'tree-view', engine);
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).toHaveAttribute('data-empty', 'false');
    expect(q(normal.container, '[data-part="search-input"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="node"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="node-row"][data-selected="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="node-row"][data-disabled="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="toggle"][data-expanded="true"]')).toHaveLength(1);
    expect(q(normal.container, '[data-part="checkbox"]')).toHaveLength(3);
    expect(q(normal.container, '[data-part="drag-handle"]')).toHaveLength(3);
    normal.unmount();

    const loading = render(<Component data={[]} loading />);
    expect(expectScope(loading.container, 'tree-view', engine)).toHaveAttribute('data-loading', 'true');
    expect(q(loading.container, '[data-part="skeleton"]')).toHaveLength(5);
  });
});
