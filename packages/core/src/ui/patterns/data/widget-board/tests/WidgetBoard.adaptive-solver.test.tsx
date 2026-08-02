/**
 * C2 adaptive path (v2 flag) — behavioral evidence that the shared solver
 * drives real cell geometry, distinct from the legacy inline packing that
 * `WidgetBoard.layout.test.tsx` continues to pin for the default path.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WidgetBoardEngine } from '../engines/foundation';
import type { WidgetBoardItem, WidgetBoardLabels } from '../contracts';
import { heightPxToRows, widgetItemsToAdaptiveInputs } from '../runtime/solver/policy';

const LABELS: WidgetBoardLabels = {
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'No widgets',
  editHint: 'Edit hint',
  readHint: 'Read hint',
  move: 'Move',
  resize: 'Resize',
  remove: 'Remove',
};

function item(
  id: string,
  size: WidgetBoardItem['size'],
  order: number,
  overrides: Partial<WidgetBoardItem> = {}
): WidgetBoardItem {
  return {
    id,
    accessibleTitle: id,
    title: id,
    content: <div>{id}</div>,
    size,
    order,
    visible: true,
    ...overrides,
  };
}

function cellGrid(container: HTMLElement, id: string) {
  const cell = container.querySelector<HTMLElement>(`[data-widget-id="${id}"]`)!;
  return { column: cell.style.gridColumn, row: cell.style.gridRow };
}

describe('WidgetBoardEngine — shared adaptive solver (default engine)', () => {
  it('kills the lg+md dead columns: the solver grows the row to fill 12', () => {
    const { container } = render(
      <WidgetBoardEngine
        items={[item('big', 'lg', 0), item('side', 'md', 1)]}
        labels={LABELS}
      />
    );
    expect(cellGrid(container, 'big').column).toBe('1 / span 8');
    expect(cellGrid(container, 'side').column).toBe('9 / span 4');
  });

  it('keeps visual order equal to DOM order (no backfill), unlike the pinned legacy path', () => {
    // Legacy pins the third lg BESIDE the first (backfill into row 1);
    // the solver keeps strict row-major DOM order instead.
    const { container } = render(
      <WidgetBoardEngine
        items={[item('one', 'lg', 0), item('mid', 'wide', 1), item('two', 'lg', 2)]}
        labels={LABELS}
      />
    );
    const one = cellGrid(container, 'one');
    const mid = cellGrid(container, 'mid');
    const two = cellGrid(container, 'two');
    // Row 1: `mid` (wide, min 6) SHRINKS to complete the row beside `one` —
    // shrink-beats-hole, and visual order still equals DOM order.
    expect(one.row.startsWith('1 /')).toBe(true);
    expect(one.column).toBe('1 / span 6');
    expect(mid.row.startsWith('1 /')).toBe(true);
    expect(mid.column).toBe('7 / span 6');
    // Row 2: the trailing lg grows alone toward its max — never backfilled
    // above its DOM predecessors (the legacy path pinned it beside `one`).
    expect(two.row.startsWith('2 /')).toBe(true);
    expect(two.column).toBe('1 / span 8');
  });

  it('stamps BOTH grid lines inline so no tier inherits foreign row indices', () => {
    const { container } = render(
      <WidgetBoardEngine
        items={[item('a', 'sm', 0), item('b', 'sm', 1)]}
        labels={LABELS}
      />
    );
    const a = cellGrid(container, 'a');
    expect(a.column.length).toBeGreaterThan(0);
    expect(a.row.length).toBeGreaterThan(0);
  });

  it('the solver IS the default path — no flag, no legacy engine left', () => {
    // C2b: the migration flag was retired inside its own wave; the shared
    // solver is the only placement engine and the dead-column geometry is
    // structurally unreachable.
    const { container } = render(
      <WidgetBoardEngine
        items={[item('big', 'lg', 0), item('side', 'md', 1)]}
        labels={LABELS}
      />
    );
    expect(cellGrid(container, 'big').column).toBe('1 / span 8');
    expect(cellGrid(container, 'side').column).toBe('9 / span 4');
  });
});

describe('legacy adapter lowering', () => {
  it('lowers px heights into grid rows exactly once via the engine formula', () => {
    expect(heightPxToRows(180)).toBe(12);
    expect(heightPxToRows(220)).toBe(15);
    expect(heightPxToRows(0)).toBe(1);
    expect(heightPxToRows(Number.NaN)).toBe(1);
  });

  it('maps sizes to span ranges and order/visible/height into intents', () => {
    const { contracts, intents } = widgetItemsToAdaptiveInputs([
      item('a', 'wide', 3, { height: 220, visible: false }),
    ]);
    expect(contracts[0]).toMatchObject({
      minSpan: { cols: 6 },
      preferredSpan: { cols: 12 },
      maxSpan: { cols: 12 },
      visualReorder: 'forbid',
      priority: 'primary',
    });
    expect(intents[0]).toEqual({
      itemId: 'a',
      order: 3,
      visible: false,
      spanHint: { rows: 15 },
    });
  });
});
