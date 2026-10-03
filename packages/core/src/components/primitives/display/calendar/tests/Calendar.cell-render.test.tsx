import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Calendar } from '..';
import type { CalendarCellInfo } from '../contracts';
import CalendarClassic from '../engines/classic';
import CalendarModern from '../engines/modern';

const SELECTED = new Date(2026, 2, 15);
const CELL_ATTRIBUTES = [
  'role',
  'type',
  'data-part',
  'data-selected',
  'data-today',
  'data-disabled',
  'aria-selected',
  'aria-current',
  'aria-label',
  'tabindex',
  'disabled',
] as const;

function cells(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-part='cell']"));
}

function cellByLabel(container: HTMLElement, label: string): HTMLElement {
  const match = cells(container).find((cell) => cell.getAttribute('aria-label') === label);
  if (!match) throw new Error(`Missing cell ${label}`);
  return match;
}

function monthCell(container: HTMLElement, month: string): HTMLElement {
  const match = cells(container).find((cell) => cell.textContent?.startsWith(month));
  if (!match) throw new Error(`Missing month cell ${month}`);
  return match;
}

function cellSemantics(container: HTMLElement): Array<Record<string, string | null>> {
  return cells(container).map((cell) =>
    Object.fromEntries(CELL_ATTRIBUTES.map((name) => [name, cell.getAttribute(name)])),
  );
}

function sameDay(left: Date, right: Date): boolean {
  return left.toDateString() === right.toDateString();
}

afterEach(cleanup);

describe('Calendar modern — canonical cellRender', () => {
  it('appends date-cell content after the default day label', () => {
    const cellRender = vi.fn((date: Date, info: CalendarCellInfo) =>
      date.getDate() === 15 ? <span>{`event-${info.type}`}</span> : null,
    );
    const { container } = render(
      <CalendarModern defaultValue={SELECTED} fullscreen={false} cellRender={cellRender} />,
    );

    const cell = cellByLabel(container, SELECTED.toDateString());
    const content = cell.querySelector("[data-part='cell-content']");
    expect(cell.firstElementChild?.tagName).toBe('SPAN');
    expect(cell.firstElementChild).toHaveTextContent('15');
    expect(content).toHaveTextContent('event-date');
    expect(content?.previousElementSibling).toBe(cell.firstElementChild);

    expect(cellRender).toHaveBeenCalledTimes(31);
    const [date, info] = cellRender.mock.calls[14];
    expect(sameDay(date, SELECTED)).toBe(true);
    expect(info.type).toBe('date');
    expect(sameDay(info.today, new Date())).toBe(true);
    expect(React.isValidElement(info.originNode)).toBe(true);
  });

  it('appends month-cell content in year view with type "month"', () => {
    const cellRender = vi.fn((date: Date, info: CalendarCellInfo) =>
      date.getMonth() === 3 ? <span>{`roadmap-${info.type}`}</span> : null,
    );
    const { container } = render(
      <CalendarModern defaultValue={SELECTED} mode="year" cellRender={cellRender} />,
    );

    const april = monthCell(container, 'April');
    expect(april.firstElementChild).toHaveTextContent('April');
    expect(april.querySelector("[data-part='cell-content']")).toHaveTextContent('roadmap-month');
    expect(cellRender).toHaveBeenCalledTimes(12);
    const [date, info] = cellRender.mock.calls[3];
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3);
    expect(date.getDate()).toBe(1);
    expect(info.type).toBe('month');
  });

  it('wins over the legacy pair in both views', () => {
    const dateCellRender = vi.fn(() => <span>legacy-date</span>);
    const monthCellRender = vi.fn(() => <span>legacy-month</span>);
    const cellRender = (_date: Date, info: CalendarCellInfo) => <span>{`canonical-${info.type}`}</span>;

    const { container, rerender } = render(
      <CalendarModern
        defaultValue={SELECTED}
        mode="month"
        cellRender={cellRender}
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
      />,
    );
    expect(cellByLabel(container, SELECTED.toDateString())).toHaveTextContent('canonical-date');
    expect(screen.queryByText('legacy-date')).toBeNull();

    rerender(
      <CalendarModern
        defaultValue={SELECTED}
        mode="year"
        cellRender={cellRender}
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
      />,
    );
    expect(monthCell(container, 'April')).toHaveTextContent('canonical-month');
    expect(screen.queryByText('legacy-month')).toBeNull();
    expect(dateCellRender).not.toHaveBeenCalled();
    expect(monthCellRender).not.toHaveBeenCalled();
  });

  it('still honours the legacy pair when the canonical props are absent', () => {
    const { container, rerender } = render(
      <CalendarModern
        defaultValue={SELECTED}
        mode="month"
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Milestone</span> : null)}
        monthCellRender={(date) => (date.getMonth() === 3 ? <span>Roadmap</span> : null)}
      />,
    );
    expect(
      cellByLabel(container, SELECTED.toDateString()).querySelector("[data-part='cell-content']"),
    ).toHaveTextContent('Milestone');

    rerender(
      <CalendarModern
        defaultValue={SELECTED}
        mode="year"
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Milestone</span> : null)}
        monthCellRender={(date) => (date.getMonth() === 3 ? <span>Roadmap</span> : null)}
      />,
    );
    expect(monthCell(container, 'April').querySelector("[data-part='cell-content']")).toHaveTextContent(
      'Roadmap',
    );
  });

  it('leaves the cell markup untouched when no renderer is passed', () => {
    const { container } = render(<CalendarModern defaultValue={SELECTED} />);
    const cell = cellByLabel(container, SELECTED.toDateString());

    expect(cell.children).toHaveLength(1);
    expect(container.querySelector("[data-part='cell-content']")).toBeNull();
  });
});

describe('Calendar modern — canonical fullCellRender', () => {
  it('replaces the date cell children and hands the default label as originNode', () => {
    const fullCellRender = vi.fn((date: Date, info: CalendarCellInfo) =>
      date.getDate() === 15 ? (
        <strong data-testid="full">{info.originNode}!</strong>
      ) : (
        <em>{`${date.getDate()}-${info.type}`}</em>
      ),
    );
    const { container } = render(
      <CalendarModern defaultValue={SELECTED} fullscreen={false} fullCellRender={fullCellRender} />,
    );

    const selected = cellByLabel(container, SELECTED.toDateString());
    expect(selected.children).toHaveLength(1);
    expect(selected.firstElementChild).toBe(screen.getByTestId('full'));
    expect(selected).toHaveTextContent('15!');
    expect(container.querySelector("[data-part='cell-content']")).toBeNull();

    const other = cellByLabel(container, new Date(2026, 2, 16).toDateString());
    expect(other.innerHTML).toBe('<em>16-date</em>');
    expect(fullCellRender).toHaveBeenCalledTimes(31);
    expect(sameDay(fullCellRender.mock.calls[0][1].today, new Date())).toBe(true);
  });

  it('replaces the month cell children in year view and keeps the month as the accessible name', () => {
    const { container } = render(
      <CalendarModern
        defaultValue={SELECTED}
        mode="year"
        fullCellRender={(date, info) => <em>{`m${date.getMonth() + 1}-${info.type}`}</em>}
      />,
    );

    const april = screen.getByRole('gridcell', { name: 'April' });
    expect(april.innerHTML).toBe('<em>m4-month</em>');
    expect(cells(container)).toHaveLength(12);
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveAttribute('aria-selected', 'true');
  });

  it('wins over cellRender and over the legacy pair', () => {
    const cellRender = vi.fn(() => <span>appended</span>);
    const dateCellRender = vi.fn(() => <span>legacy</span>);
    const { container } = render(
      <CalendarModern
        defaultValue={SELECTED}
        fullCellRender={() => <em>full</em>}
        cellRender={cellRender}
        dateCellRender={dateCellRender}
      />,
    );

    expect(cellByLabel(container, SELECTED.toDateString()).innerHTML).toBe('<em>full</em>');
    expect(cellRender).not.toHaveBeenCalled();
    expect(dateCellRender).not.toHaveBeenCalled();
  });
});

describe('Calendar modern — cell accessibility under the canonical renderers', () => {
  const range: [Date, Date] = [new Date(2026, 2, 10), new Date(2026, 2, 20)];
  const disabledDate = (date: Date) => date.getDate() === 12;

  it('keeps every day cell role, name, state and tab stop', () => {
    const plain = render(
      <CalendarModern defaultValue={SELECTED} validRange={range} disabledDate={disabledDate} />,
    );
    const baseline = cellSemantics(plain.container);
    const baselineRows = plain.container.querySelectorAll('[role="row"]').length;
    plain.unmount();

    expect(baselineRows).toBe(6);
    expect(baseline).toHaveLength(31);
    expect(baseline.filter((cell) => cell.tabindex === '0')).toHaveLength(1);
    expect(baseline.filter((cell) => cell.disabled !== null)).toHaveLength(21);
    expect(baseline[14]['aria-selected']).toBe('true');
    expect(baseline[14]['aria-label']).toBe(SELECTED.toDateString());

    const appended = render(
      <CalendarModern
        defaultValue={SELECTED}
        validRange={range}
        disabledDate={disabledDate}
        cellRender={() => <span>event</span>}
      />,
    );
    expect(cellSemantics(appended.container)).toEqual(baseline);
    appended.unmount();

    const replaced = render(
      <CalendarModern
        defaultValue={SELECTED}
        validRange={range}
        disabledDate={disabledDate}
        fullCellRender={() => <em>x</em>}
      />,
    );
    expect(cellSemantics(replaced.container)).toEqual(baseline);
    expect(replaced.container.querySelectorAll('[role="row"]')).toHaveLength(baselineRows);
    expect(replaced.container.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
  });

  it('keeps month cell semantics, adding only the explicit name under fullCellRender', () => {
    const plain = render(<CalendarModern defaultValue={SELECTED} mode="year" />);
    const baseline = cellSemantics(plain.container);
    plain.unmount();
    expect(baseline).toHaveLength(12);

    const appended = render(
      <CalendarModern defaultValue={SELECTED} mode="year" cellRender={() => <span>event</span>} />,
    );
    expect(cellSemantics(appended.container)).toEqual(baseline);
    appended.unmount();

    const replaced = render(
      <CalendarModern defaultValue={SELECTED} mode="year" fullCellRender={() => <em>x</em>} />,
    );
    const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    expect(cellSemantics(replaced.container)).toEqual(
      baseline.map((cell, index) => ({ ...cell, 'aria-label': names[index] })),
    );
  });

  it('keeps keyboard travel, selection and disabled refusal with fully replaced cells', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CalendarModern
        defaultValue={SELECTED}
        disabledDate={disabledDate}
        onSelect={onSelect}
        fullCellRender={(date) => <em>{`d${date.getDate()}`}</em>}
      />,
    );
    const grid = screen.getByRole('grid');
    const tabStop = () => grid.querySelector<HTMLElement>("[data-part='cell'][tabindex='0']");

    expect(tabStop()).toHaveAttribute('aria-label', SELECTED.toDateString());
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(tabStop()).toHaveAttribute('aria-label', new Date(2026, 2, 22).toDateString());
    expect(tabStop()).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(tabStop()).toHaveAttribute('aria-label', new Date(2026, 2, 23).toDateString());

    fireEvent.click(within(tabStop()!).getByText('d23'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(sameDay(onSelect.mock.calls[0][0], new Date(2026, 2, 23))).toBe(true);
    expect(onSelect.mock.calls[0][1]).toEqual({ source: 'date' });

    const disabled = cellByLabel(container, new Date(2026, 2, 12).toDateString());
    expect(disabled).toBeDisabled();
    fireEvent.click(within(disabled).getByText('d12'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('Calendar — canonical cell renderers on the real Classic and Modern engines', () => {
  const engines = [
    { name: 'classic', Engine: CalendarClassic },
    { name: 'modern', Engine: CalendarModern },
  ] as const;

  for (const { name, Engine } of engines) {
    it(`${name}: cellRender receives (date, info) per date cell and keeps the default day label`, () => {
      const seen: CalendarCellInfo['type'][] = [];
      const cellRender = vi.fn((date: Date, info: CalendarCellInfo) => {
        seen.push(info.type);
        return sameDay(date, SELECTED) ? <span data-testid="event">{`event-${info.type}`}</span> : null;
      });
      render(<Engine value={SELECTED} mode="month" fullscreen={false} cellRender={cellRender} />);

      const event = screen.getByTestId('event');
      expect(event).toHaveTextContent('event-date');
      expect(event.closest('td, [data-part="cell"]')).toHaveTextContent(/^15event-date$/);
      expect(new Set(seen)).toEqual(new Set(['date']));
      const [date, info] = cellRender.mock.calls[0];
      expect(date).toBeInstanceOf(Date);
      expect(info.today).toBeInstanceOf(Date);
      expect(sameDay(info.today, new Date())).toBe(true);
    });

    it(`${name}: cellRender receives type "month" in year view`, () => {
      const cellRender = vi.fn((date: Date, info: CalendarCellInfo) =>
        date.getMonth() === 3 ? <span data-testid="event">{`roadmap-${info.type}`}</span> : null,
      );
      render(<Engine value={SELECTED} mode="year" fullscreen={false} cellRender={cellRender} />);

      expect(screen.getByTestId('event')).toHaveTextContent('roadmap-month');
      expect(cellRender.mock.calls.length).toBeGreaterThanOrEqual(12);
      expect(new Set(cellRender.mock.calls.map(([, info]) => info.type))).toEqual(new Set(['month']));
    });

    it(`${name}: fullCellRender replaces the default label, which survives only through originNode`, () => {
      render(
        <Engine
          value={SELECTED}
          mode="month"
          fullscreen={false}
          cellRender={() => <span>appended</span>}
          fullCellRender={(date, info) =>
            sameDay(date, SELECTED) ? (
              <span data-testid="full">{info.originNode}</span>
            ) : (
              <span data-testid="blank">{`x-${info.type}`}</span>
            )
          }
        />,
      );

      expect(screen.getByTestId('full')).toHaveTextContent(/^15$/);
      expect(screen.queryByText('appended')).toBeNull();
      const blank = screen.getAllByTestId('blank')[0];
      expect(blank).toHaveTextContent('x-date');
      expect(blank.closest('td, [data-part="cell"]')).toHaveTextContent(/^x-date$/);
    });
  }
});

describe('Calendar facade — the showroom display-collections probe call', () => {
  const UNBROKEN = 'Supercalifragilisticexpialidocious_unbroken_event_label_0123456789';

  it('renders the unbroken event label in the 15 August cell on the Modern engine', async () => {
    const { container } = render(
      <Calendar
        engine="modern"
        defaultValue={new Date('2026-08-15T00:00:00')}
        mode="month"
        fullscreen={false}
        cellRender={(date) =>
          date.getDate() === 15 ? (
            <span
              style={{
                display: 'block',
                fontSize: '0.625rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {UNBROKEN}
            </span>
          ) : null
        }
      />,
    );

    const label = await screen.findByText(UNBROKEN);
    expect(container.querySelector('.rottay-calendar--modern')).not.toBeNull();
    const cell = label.closest<HTMLElement>("[data-part='cell']");
    expect(cell).toHaveAttribute('aria-label', new Date(2026, 7, 15).toDateString());
    expect(label.parentElement).toHaveAttribute('data-part', 'cell-content');
    expect(screen.getAllByText(UNBROKEN)).toHaveLength(1);
  });
});
