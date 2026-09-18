/**
 * The keyboard reorder protocol the panel GAINED in WO-FAM-08 / F-69 lot 6 — a
 * DECLARED ADDITION, not a transport pin. Before this lot the drag handle was
 * pointer-only (Space and Enter on it produced a prevented click), the Move
 * buttons moved a column with no feedback, and nothing was ever announced.
 *
 * The draft model is what makes the Escape leg readable here: a grab stages
 * nothing, so cancelling restores the DRAFT order, and a keyboard drop still
 * only writes the draft — `onColumnsChange` stays reachable from Apply alone.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { ColumnMenu } from '../index';
import type { ColumnMenuColumn, ColumnMenuProps } from '../index';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { renderWithEngine } from '@tests/support/engine';
import { waitForPortalContent } from '@tests/support/skin-reachability';

const SURFACE = ".ds-structure.ds-column-menu-panel[data-part='surface']";

type MenuProps = ColumnMenuProps<ColumnMenuColumn>;

const COLUMNS: ColumnMenuColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'notes', title: 'Notes' },
];
const VISIBLE = ['name', 'email', 'notes'];

async function openMenu(
  options: { dir?: 'ltr' | 'rtl'; extra?: Partial<MenuProps> } = {},
) {
  const onColumnsChange = vi.fn();
  const menu = (
    <ColumnMenu
      columns={COLUMNS}
      visibleColumns={VISIBLE}
      onColumnsChange={onColumnsChange}
      onReset={vi.fn()}
      {...options.extra}
    />
  );
  const { container } = renderWithEngine(
    options.dir === 'rtl' ? (
      <I18nProvider locale="ar" fallbackLocale="en">
        {menu}
      </I18nProvider>
    ) : (
      menu
    ),
    'modern',
  );
  const control = await waitFor(() => {
    const node = container.querySelector('[data-part="control"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(control);
  const surface = await waitForPortalContent(waitFor, SURFACE, '[data-part="row"]', 1);
  return { surface, onColumnsChange };
}

/** The draft order, read where the user reads it: the order of the rows. */
function draftOrder(surface: HTMLElement): string[] {
  return Array.from(surface.querySelectorAll('[data-part="row"] [data-part="title"]')).map(
    (node) => node.textContent ?? '',
  );
}

function rowFor(surface: HTMLElement, title: string): HTMLElement {
  const row = Array.from(surface.querySelectorAll('[data-part="row"]')).find(
    (candidate) => candidate.querySelector('[data-part="title"]')?.textContent === title,
  );
  if (!row) throw new Error(`no column row titled ${title}`);
  return row as HTMLElement;
}

function handleFor(surface: HTMLElement, title: string): HTMLElement {
  const handle = rowFor(surface, title).querySelector('[data-part="drag-handle"]');
  if (!handle) throw new Error(`no drag handle in the row titled ${title}`);
  return handle as HTMLElement;
}

function applyButton(surface: HTMLElement): HTMLElement {
  return surface.querySelector('[data-part="apply"]') as HTMLElement;
}

/**
 * The pair is identified by what it IS — two polite status regions — because the
 * announcer stamps no `data-part`: the VisuallyHidden primitive owns the clip,
 * so there is no anatomy for a skin rule to paint.
 */
function regions(surface: HTMLElement): string[] {
  const found = Array.from(surface.querySelectorAll('[role="status"][aria-live="polite"]'));
  expect(found).toHaveLength(2);
  return found.map((node) => node.textContent ?? '');
}

function announced(surface: HTMLElement): string {
  return regions(surface).join('');
}

describe('ColumnMenu keyboard reorder', () => {
  it('starts with two empty polite regions', async () => {
    const { surface } = await openMenu();

    expect(regions(surface)).toEqual(['', '']);
    for (const region of surface.querySelectorAll('[role="status"]')) {
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region.className).toContain('ds-visually-hidden');
    }
  });

  it('the grab key announces the protocol and stages nothing', async () => {
    const { surface, onColumnsChange } = await openMenu();

    fireEvent.keyDown(handleFor(surface, 'Name'), { key: ' ' });

    await waitFor(() => expect(announced(surface)).toContain('Reordering Name'));
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  it('every arrow changes what the region says, and stages nothing on the way', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await waitFor(() => expect(announced(surface)).toContain('Position 2 of 3'));
    const first = announced(surface);

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await waitFor(() => expect(announced(surface)).toContain('Position 3 of 3'));

    expect(announced(surface)).not.toEqual(first);
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  /**
   * The identical-outcome case §6.2 names: a second blocked press writes the
   * SAME string, so it only re-announces because the two regions alternate.
   */
  it('a blocked edge announces, moves nothing, and re-announces when repeated', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    await waitFor(() => expect(announced(surface)).toContain('Cannot move Name further'));
    const firstRegions = regions(surface);

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    await waitFor(() => expect(regions(surface)).not.toEqual(firstRegions));

    expect(regions(surface).filter(Boolean)).toEqual(firstRegions.filter(Boolean));
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  /**
   * Escape belongs to the grab while one is live. The panel's own Escape route
   * is a capture-phase document listener owned by the layer stack, so this
   * asserts BOTH halves: the draft survives and the panel is still open.
   */
  it('Escape cancels the grab, keeps the draft and leaves the panel open', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await waitFor(() => expect(announced(surface)).toContain('Position 2 of 3'));

    fireEvent.keyDown(handle, { key: 'Escape' });

    await waitFor(() => expect(announced(surface)).toContain('Reorder cancelled'));
    expect(announced(surface)).toContain('position 1 of 3');
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(document.querySelector(SURFACE)).not.toBeNull();
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  it('Escape still closes the panel when no column is grabbed', async () => {
    const { surface } = await openMenu();

    fireEvent.keyDown(handleFor(surface, 'Name'), { key: 'Escape' });

    await waitFor(() => expect(document.querySelector(SURFACE)).toBeNull());
  });

  it('a keyboard drop writes the DRAFT, and only Apply publishes it', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: ' ' });

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Name', 'Notes']));
    expect(announced(surface)).toContain('Name moved to position 2 of 3');
    expect(onColumnsChange).not.toHaveBeenCalled();

    fireEvent.click(applyButton(surface));
    expect(onColumnsChange.mock.calls).toEqual([
      [
        ['name', 'email', 'notes'],
        ['email', 'name', 'notes'],
      ],
    ]);
  });

  it('returns focus to the handle of the row that moved', async () => {
    const { surface } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: ' ' });

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Name', 'Notes']));
    expect(handleFor(surface, 'Name')).toHaveFocus();
    expect(draftOrder(surface).indexOf('Name')).toBe(1);
  });

  it('two moves in one grab land the column two positions away', async () => {
    const { surface } = await openMenu();
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: ' ' });

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Notes', 'Name']));
  });

  /**
   * The rows run down the panel, so the family declares the BLOCK axis and no
   * cross axis: the inline arrows resolve no intent at all, in either reading
   * direction. That is this family's RTL statement — there is no inline axis to
   * mirror, and an inline key must not silently reorder a vertical list.
   */
  it.each(['ltr', 'rtl'] as const)('ignores the inline arrows under dir=%s', async (dir) => {
    const { surface, onColumnsChange } = await openMenu({ dir });
    const handle = handleFor(surface, 'Name');

    fireEvent.keyDown(handle, { key: ' ' });
    await waitFor(() => expect(announced(surface)).toContain('Reordering Name'));
    const grabbed = regions(surface);

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });

    expect(regions(surface)).toEqual(grabbed);
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(onColumnsChange).not.toHaveBeenCalled();

    // The block axis still answers, so the refusal above is about the AXIS and
    // not about a session that failed to open.
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await waitFor(() => expect(announced(surface)).toContain('Position 2 of 3'));
  });

  it('moves a column across a group boundary on the complete order', async () => {
    const { surface } = await openMenu({
      extra: {
        columns: [
          { key: 'name', title: 'Name', group: 'core' },
          { key: 'email', title: 'Email', group: 'core' },
          { key: 'notes', title: 'Notes' },
        ],
        groups: [{ key: 'core', label: 'Core', columns: ['name', 'email'] }],
      },
    });

    const handle = handleFor(surface, 'Email');
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await waitFor(() => expect(announced(surface)).toContain('Position 3 of 3'));

    fireEvent.keyDown(handle, { key: ' ' });
    await waitFor(() => expect(announced(surface)).toContain('Email moved to position 3 of 3'));
  });
});

/**
 * Every control in this panel that owned Space or Enter before the lot. The
 * grab protocol binds on the handle alone, and the kernel ignores a key pressed
 * on anything inside the drag source, so none of them changed hands.
 */
describe('ColumnMenu keys the reorder protocol must not take', () => {
  it('keeps the Move controls their accessible names and their click route', async () => {
    const { surface, onColumnsChange } = await openMenu();

    const moveDown = surface.querySelector(
      '[data-part="row"] [aria-label="Move Name down"]',
    ) as HTMLElement;
    expect(moveDown).not.toBeNull();
    expect(
      surface.querySelector('[data-part="row"] [aria-label="Move Email up"]'),
    ).not.toBeNull();

    fireEvent.click(moveDown);

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Name', 'Notes']));
    // The buttons are a one-shot control, not a session: nothing is announced
    // and nothing is grabbed by pressing one.
    expect(announced(surface)).toEqual('');
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  it('leaves the visibility checkbox its own Space', async () => {
    const { surface } = await openMenu();
    const checkbox = rowFor(surface, 'Name').querySelector(
      'input[type="checkbox"]',
    ) as HTMLElement;

    fireEvent.keyDown(checkbox, { key: ' ' });
    fireEvent.click(checkbox);

    await waitFor(() =>
      expect(rowFor(surface, 'Name').getAttribute('data-visible')).toBe('false'),
    );
    expect(announced(surface)).toEqual('');
  });

  it('leaves the pin toggles their own keys and their pressed state', async () => {
    const { surface } = await openMenu({
      extra: { pinnedColumns: { left: [], right: [] }, onPinChange: vi.fn() },
    });
    const pinLeft = surface.querySelector(
      '[aria-label="Pin Name to left"]',
    ) as HTMLElement;
    expect(pinLeft).not.toBeNull();

    fireEvent.keyDown(pinLeft, { key: 'Enter' });
    expect(announced(surface)).toEqual('');

    fireEvent.click(pinLeft);
    await waitFor(() =>
      expect(
        surface.querySelector('[aria-label="Unpin Name from left"]'),
      ).not.toBeNull(),
    );
    expect(announced(surface)).toEqual('');
  });

  /**
   * MEASURED, and pre-existing: the width editor's own `Escape` handler never
   * runs, because the layer stack's capture-phase router dismisses the panel
   * first. The lot does not change that — it only takes Escape while a column
   * is GRABBED — so what this leg protects is that the editor's key produces no
   * reorder message and opens no session.
   */
  it('leaves the width editor alone, and stays silent on its Escape', async () => {
    const { surface } = await openMenu({
      extra: { columnWidths: { name: 200 }, onColumnResize: vi.fn() },
    });
    const widthBadge = rowFor(surface, 'Name').querySelector(
      '[data-part="width-badge"]',
    ) as HTMLElement;
    expect(widthBadge).not.toBeNull();

    fireEvent.click(widthBadge);
    const editor = await waitFor(() => {
      const node = surface.querySelector('[data-part="width-input"]') as HTMLElement;
      expect(node).not.toBeNull();
      return node;
    });
    expect(announced(surface)).toEqual('');

    fireEvent.keyDown(editor, { key: 'Escape' });

    // The panel's dismissal, not the grab's cancel: no session was open.
    await waitFor(() => expect(document.querySelector(SURFACE)).toBeNull());
    expect(announced(surface)).toEqual('');
  });
});
