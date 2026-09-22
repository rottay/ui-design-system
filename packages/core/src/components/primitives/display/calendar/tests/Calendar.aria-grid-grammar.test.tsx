import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import CalendarModern from '../engines/modern';

// ARIA's grid grammar is `grid > row > gridcell`. Before the week rows landed,
// both panels put their cells straight under the grid: the display-collections
// route fired `aria-required-parent` on every day button and
// `aria-required-children` on every grid. These assertions are the law that
// stops the shape coming back, on both panels and in both writing directions.
const OWNERS = '[role="grid"], [role="rowgroup"], [role="table"], [role="treegrid"]';

function gridGrammarViolations(scope: ParentNode): string[] {
  const found: string[] = [];

  for (const cell of Array.from(scope.querySelectorAll('[role="gridcell"], [role="columnheader"]'))) {
    if (cell.parentElement?.getAttribute('role') !== 'row') {
      found.push(`${cell.getAttribute('role')} "${cell.textContent?.trim()}" has no row parent`);
    }
  }

  for (const row of Array.from(scope.querySelectorAll('[role="row"]'))) {
    if (!row.parentElement?.closest(OWNERS)) {
      found.push(`row "${row.textContent?.trim()}" sits outside a grid`);
    }
  }

  for (const grid of Array.from(scope.querySelectorAll('[role="grid"]'))) {
    if (!grid.querySelector('[role="row"]')) {
      found.push(`grid "${grid.getAttribute('aria-label')}" owns no row`);
    }
    const bare = Array.from(grid.children).filter((child) => child.getAttribute('role') === 'gridcell');
    if (bare.length > 0) {
      found.push(`grid "${grid.getAttribute('aria-label')}" holds ${bare.length} bare gridcells`);
    }
  }

  return found;
}

// August 2026 starts on a Saturday and runs 31 days, so all six week rows hold
// at least one day. February 2026 starts on a Sunday and runs 28, so its last
// two rows are nothing but adjacent-month spacers.
const FULL_MONTH = new Date(2026, 7, 15);
const SHORT_MONTH = new Date(2026, 1, 10);

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/calendar/index.css'),
  'utf8',
);

function ruleBlock(selector: string): string {
  const start = skin.indexOf(selector);
  if (start === -1) throw new Error(`No rule matching ${selector}`);
  const open = skin.indexOf('{', start + selector.length - 1);
  return skin.slice(open + 1, skin.indexOf('}', open));
}

describe('Calendar modern — ARIA grid grammar', () => {
  afterEach(cleanup);

  it('groups the day panel into week rows, so no gridcell hangs off the grid', () => {
    const { container } = render(<CalendarModern defaultValue={FULL_MONTH} />);
    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;

    expect(gridGrammarViolations(root)).toEqual([]);
    // Non-vacuity: the law ran over a full month of real cells and headers.
    expect(root.querySelectorAll('[role="gridcell"]')).toHaveLength(31);
    expect(root.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
    // Six week rows plus the weekday header row, all inside the one grid.
    expect(root.querySelectorAll('[data-part="week-row"]')).toHaveLength(6);
    expect(root.querySelectorAll('[role="row"]')).toHaveLength(7);
    for (const row of Array.from(root.querySelectorAll('[role="row"]'))) {
      expect(row.parentElement).toBe(root.querySelector('[data-part="grid"]'));
    }
  });

  it('leaves a week of nothing but adjacent-month spacers out of the a11y tree', () => {
    const { container } = render(<CalendarModern defaultValue={SHORT_MONTH} />);
    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;

    expect(gridGrammarViolations(root)).toEqual([]);
    expect(root.querySelectorAll('[role="gridcell"]')).toHaveLength(28);

    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-part="week-row"]'));
    expect(rows).toHaveLength(6);
    const inert = rows.filter((row) => row.getAttribute('aria-hidden') === 'true');
    // The last two rows carry only inert spacers: a `row` with no cell of its
    // own would fail `aria-required-children` in turn.
    expect(inert).toHaveLength(2);
    expect(rows.slice(4)).toEqual(inert);
    for (const row of inert) {
      expect(row.getAttribute('role')).toBeNull();
      expect(row.querySelector('[role="gridcell"]')).toBeNull();
    }
    // The 42-cell geometry is untouched: every row still draws seven boxes.
    for (const row of rows) {
      expect(row.children).toHaveLength(7);
    }
  });

  it('groups the year panel into rows of three', () => {
    const { container } = render(<CalendarModern mode="year" defaultValue={FULL_MONTH} />);
    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;

    expect(gridGrammarViolations(root)).toEqual([]);
    expect(root.querySelectorAll('[role="gridcell"]')).toHaveLength(12);
    expect(root.querySelectorAll('[role="row"]')).toHaveLength(4);
    for (const row of Array.from(root.querySelectorAll('[data-part="month-row"]'))) {
      expect(row.children).toHaveLength(3);
    }
  });

  it('reports the pre-repair shape it exists to forbid (drill)', () => {
    const flat = document.createElement('div');
    flat.innerHTML = [
      '<div data-part="weekday-row" role="row"><div role="columnheader">Sun</div></div>',
      '<div data-part="grid" role="grid" aria-label="Dates grid">',
      '<button role="gridcell">1</button><button role="gridcell">2</button>',
      '</div>',
    ].join('');

    // The exact three findings the axe batch measured: cells with no row
    // parent, a grid owning no row, and the weekday row outside any grid.
    expect(gridGrammarViolations(flat)).toEqual([
      'gridcell "1" has no row parent',
      'gridcell "2" has no row parent',
      'row "Sun" sits outside a grid',
      'grid "Dates grid" owns no row',
      'grid "Dates grid" holds 2 bare gridcells',
    ]);
  });

  it('carries the column track on the row box, so the grouping is geometry-neutral', () => {
    const gridBox = ruleBlock(".rottay-calendar.rottay-calendar--modern[data-part='root'] > [data-part='grid'] {");
    // The grid box only stacks: a track here would lay the ROWS out in columns.
    expect(gridBox).toContain('display: grid');
    expect(gridBox).not.toContain('grid-template-columns');

    const monthRow = ruleBlock(
      ".rottay-calendar.rottay-calendar--modern[data-part='root'][data-mode='month'] > [data-part='grid'] > [data-part='week-row'] {",
    );
    expect(monthRow).toContain('grid-template-columns: repeat(7, minmax(0, 1fr))');
    expect(monthRow).toContain('gap: var(--ds-spacing-1)');

    const yearRow = ruleBlock(
      ".rottay-calendar.rottay-calendar--modern[data-part='root'][data-mode='year'] > [data-part='grid'] > [data-part='month-row'] {",
    );
    expect(yearRow).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(yearRow).toContain('gap: var(--ds-spacing-2)');

    // The row rhythm is the former grid `gap`, moved onto adjacent rows.
    expect(
      ruleBlock(
        ".rottay-calendar.rottay-calendar--modern[data-part='root'][data-mode='month'] > [data-part='grid'] > [data-part='week-row'] + [data-part='week-row'] {",
      ),
    ).toContain('margin-block-start: var(--ds-spacing-1)');
    expect(
      ruleBlock(
        ".rottay-calendar.rottay-calendar--modern[data-part='root'][data-mode='year'] > [data-part='grid'] > [data-part='month-row'] + [data-part='month-row'] {",
      ),
    ).toContain('margin-block-start: var(--ds-spacing-2)');

    // The DatePicker and CalendarView panels make their row wrappers
    // `display: contents`. This family cannot: its weekday strip carries the
    // spacing-2 rhythm above the first week on its own box, which a
    // contents-hoisted wrapper would drop. Real row boxes keep that rhythm,
    // and the strip stays a `row` of the grid instead of an orphan.
    expect(skin).not.toContain('display: contents');
    const weekdayRow = ruleBlock(
      ".rottay-calendar.rottay-calendar--modern[data-part='root'] [data-part='weekday-row'] {",
    );
    expect(weekdayRow).toContain('margin-block-end: var(--ds-spacing-2)');
    expect(weekdayRow).toContain('grid-template-columns: repeat(7, minmax(0, 1fr))');
  });
});
