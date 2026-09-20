/**
 * The runtime producer behind the modern Table's interaction paint.
 *
 * The skin decides hover, press, focus-visible and disabled through
 * `:is([data-state~='x'], :x)` -- a kernel twin beside each pseudo-class
 * (F-37). Every painted part was a raw `th`/`td`/`tr`/`button`/`input` with a
 * literal `data-part` and nothing behind the twin, so only the pseudo half was
 * ever live. This pins the producer that closes it, part by part, and pins
 * that a part with no interaction semantics still says nothing.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import ModernTable from '../engines/modern';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { ColumnType } from '../contracts';

interface Row {
  key: string;
  name: string;
  owner: string;
}

const COLUMNS: ColumnType<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: true, editable: true, width: 160 },
  { key: 'owner', title: 'Owner', dataIndex: 'owner', filterSearch: true, width: 140 },
];

const DATA: Row[] = [
  { key: 'a', name: 'Alpha', owner: 'Ann' },
  { key: 'b', name: 'Beta', owner: 'Bob' },
];

const TENANT: TenantConfig = {
  slug: 'state-stamp',
  name: 'State Stamp',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'State Stamp' },
};

const renderTable = (overrides: Partial<React.ComponentProps<typeof ModernTable<Row>>> = {}) =>
  render(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
    <ModernTable<Row>
      columns={COLUMNS}
      dataSource={DATA}
      rowKey="key"
      onCellEdit={vi.fn()}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: [],
        onChange: vi.fn(),
        getCheckboxProps: (record) => ({ disabled: record.key === 'b' }),
      }}
      expandable={{ expandedRowRender: () => <span>detail</span> }}
      pagination={{ pageSize: 2 }}
      {...overrides}
    />
    </DesignSystemProvider>,
  );

afterEach(cleanup);

const query = (container: HTMLElement, selector: string) =>
  container.querySelector<HTMLElement>(selector)!;

const state = (element: HTMLElement) => element.getAttribute('data-state');

describe('Table modern state stamp', () => {
  it('says nothing at rest except on the parts the platform already disables', () => {
    const { container } = renderTable();
    const stamped = [...container.querySelectorAll<HTMLElement>('[data-state]')];

    // One page of two rows: row `b` is the disabled checkbox, and prev/next are
    // both at the end of their range. Every one of them already matched
    // `:disabled` -- the stamp is the inert twin of a state the platform was
    // reporting all along, and nothing else speaks at rest.
    expect(stamped.map((element) => `${element.dataset.part}=${state(element)}`)).toEqual([
      'selection-control=disabled',
      'pagination-button=disabled',
      'pagination-button=disabled',
    ]);
  });

  it('stamps a sortable header through pointer and keyboard focus', () => {
    const { container } = renderTable();
    const header = query(container, "[data-part='header-cell'][data-sortable='true']");

    fireEvent.pointerEnter(header);
    expect(state(header)).toBe('hovered');
    fireEvent.pointerDown(header);
    expect(state(header)).toContain('pressed');
    fireEvent.pointerUp(header);
    fireEvent.pointerLeave(header);
    expect(header.hasAttribute('data-state')).toBe(false);

    fireEvent.focus(header);
    expect(state(header)).toContain('focus-visible');
    fireEvent.blur(header);
    expect(header.hasAttribute('data-state')).toBe(false);
  });

  it('leaves an unsortable header silent, because its skin paints no state on it', () => {
    const { container } = renderTable();
    const header = [...container.querySelectorAll<HTMLElement>("[data-part='header-cell']")]
      .find((cell) => cell.getAttribute('data-sortable') !== 'true')!;

    fireEvent.pointerEnter(header);
    fireEvent.pointerDown(header);
    fireEvent.focus(header);
    expect(header.hasAttribute('data-state')).toBe(false);
  });

  it('stamps the resize handle, whose hover is the only state its skin paints', () => {
    const { container } = renderTable();
    const handle = query(container, "[data-part='resize-handle']");

    fireEvent.pointerEnter(handle);
    expect(state(handle)).toBe('hovered');
    fireEvent.pointerLeave(handle);
    expect(handle.hasAttribute('data-state')).toBe(false);
  });

  it('stamps a hoverable row and refuses a row the consumer turned hover off for', () => {
    const { container } = renderTable();
    const row = query(container, "[data-part='row'][data-hoverable='true']");

    fireEvent.pointerEnter(row);
    expect(state(row)).toBe('hovered');
    fireEvent.pointerLeave(row);
    expect(row.hasAttribute('data-state')).toBe(false);

    cleanup();
    const plain = renderTable({ rowHoverable: false });
    const inert = query(plain.container, "[data-part='row']");
    fireEvent.pointerEnter(inert);
    expect(inert.hasAttribute('data-state')).toBe(false);
  });

  it('never lets a container part claim a control inside it, which `:focus-visible` never does either', () => {
    const { container } = renderTable();
    const row = query(container, "[data-part='row'][data-hoverable='true']");
    const control = row.querySelector<HTMLElement>("[data-part='selection-control']")!;

    fireEvent.focus(control);
    expect(state(control)).toContain('focus-visible');
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('stamps an editable cell and leaves a read-only cell silent', () => {
    const { container } = renderTable();
    const editable = query(container, "[data-part='cell'][data-editable='true']");
    const readOnly = [...container.querySelectorAll<HTMLElement>("[data-part='cell']")]
      .find((cell) => cell.getAttribute('data-editable') !== 'true')!;

    fireEvent.pointerEnter(editable);
    expect(state(editable)).toBe('hovered');

    fireEvent.pointerEnter(readOnly);
    fireEvent.pointerDown(readOnly);
    expect(readOnly.hasAttribute('data-state')).toBe(false);
  });

  it('presses the expand button from the keyboard, the way the platform presses a button', () => {
    const { container } = renderTable();
    const button = query(container, "[data-part='expand-button']");

    fireEvent.pointerEnter(button);
    expect(state(button)).toBe('hovered');
    fireEvent.keyDown(button, { key: ' ' });
    expect(state(button)).toContain('pressed');
    fireEvent.keyUp(button, { key: ' ' });
    expect(state(button) ?? '').not.toContain('pressed');

    fireEvent.focus(button);
    expect(state(button)).toContain('focus-visible');
  });

  it('reports a disabled selection control and refuses to report it hovered', () => {
    const { container } = renderTable();
    const controls = [...container.querySelectorAll<HTMLElement>("[data-part='selection-control']")];
    const disabled = controls.find((control) => (control as HTMLInputElement).disabled)!;
    const enabled = controls.find((control) => !(control as HTMLInputElement).disabled)!;

    expect(state(disabled)).toBe('disabled');
    fireEvent.pointerEnter(disabled);
    expect(state(disabled)).toBe('disabled');

    fireEvent.focus(enabled);
    expect(state(enabled)).toContain('focus-visible');
  });

  it('stamps the filter field, where the skin re-asserts the governed focus ring', () => {
    const { container } = renderTable();
    const field = query(container, "[data-part='field'][data-field='filter']");

    fireEvent.focus(field);
    expect(state(field)).toContain('focus-visible');
    fireEvent.blur(field);
    expect(field.hasAttribute('data-state')).toBe(false);
  });

  it('stamps the inline cell editor, which is the same part under a different field', () => {
    const { container } = renderTable();
    fireEvent.click(query(container, "[data-part='cell'][data-editable='true']"));

    const editor = query(container, "[data-part='field'][data-field='edit']");
    fireEvent.focus(editor);
    expect(state(editor)).toContain('focus-visible');
  });

  it('stamps prev/next pagination and leaves the current-page readout alone', () => {
    const { container } = renderTable({ pagination: { pageSize: 1 } });
    const buttons = [...container.querySelectorAll<HTMLElement>("[data-part='pagination-button']")];
    const [previous, current, next] = buttons;

    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect(state(previous)).toBe('disabled');

    // `aria-disabled` without the platform's own `disabled`: the skin's
    // disabled rule never applied to the readout, so the stamp must not
    // invent it.
    expect(current.getAttribute('aria-disabled')).toBe('true');
    expect(current.hasAttribute('data-state')).toBe(false);

    fireEvent.pointerEnter(next);
    expect(state(next)).toBe('hovered');
    fireEvent.keyDown(next, { key: 'Enter' });
    expect(state(next)).toContain('pressed');
  });

  it('composes the consumer handlers it takes over instead of replacing them', () => {
    const onRowPointerEnter = vi.fn();
    const onCellPointerEnter = vi.fn();
    const columns: ColumnType<Row>[] = [
      {
        ...COLUMNS[0],
        onCell: () => ({ onPointerEnter: onCellPointerEnter }),
      },
      COLUMNS[1],
    ];
    const { container } = renderTable({
      columns,
      onRow: () => ({ onPointerEnter: onRowPointerEnter }),
    });

    const row = query(container, "[data-part='row'][data-hoverable='true']");
    fireEvent.pointerEnter(row);
    expect(onRowPointerEnter).toHaveBeenCalledTimes(1);
    expect(state(row)).toBe('hovered');

    const cell = query(container, "[data-part='cell'][data-editable='true']");
    fireEvent.pointerEnter(cell);
    expect(onCellPointerEnter).toHaveBeenCalledTimes(1);
    expect(state(cell)).toBe('hovered');
  });

  it('sees the pointer leave a cell whose gate closed under it, so no hover ghost survives the edit', () => {
    const { container } = renderTable();
    const cell = query(container, "[data-part='cell'][data-editable='true']");

    // The editor opens on click, which drops `data-editable` -- the gate the
    // stamp is keyed on. The pointer then leaves while that gate is shut, so a
    // kernel that stops tracking whenever it stops stamping re-opens holding a
    // hover that ended minutes ago.
    fireEvent.pointerEnter(cell);
    fireEvent.click(cell);
    fireEvent.pointerLeave(cell);

    const editor = query(container, "[data-part='field'][data-field='edit']");
    fireEvent.blur(editor);

    const reopened = query(container, "[data-part='cell'][data-editable='true']");
    expect(reopened.hasAttribute('data-state')).toBe(false);
  });

  it('keeps the inline editor committing through the blur the kernel also listens to', () => {
    const onCellEdit = vi.fn();
    const { container } = renderTable({ onCellEdit });
    fireEvent.click(query(container, "[data-part='cell'][data-editable='true']"));

    const editor = query(container, "[data-part='field'][data-field='edit']");
    fireEvent.change(editor, { target: { value: 'Alphabet' } });
    fireEvent.blur(editor);
    expect(onCellEdit).toHaveBeenCalledTimes(1);
  });
});
