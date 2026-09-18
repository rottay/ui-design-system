/**
 * The column menu's drag transport, pinned against the implementation that
 * ships TODAY, before it adopts the shared drag kernel.
 *
 * The family has two drag identities on two different elements -- the handle is
 * the source, the row is the target -- and a DRAFT commit model: a drop writes
 * local state and the public `onColumnsChange` is reachable only from Apply.
 * Nothing below asserts a value this file would like the family to have; every
 * number is the measured behavior of the current code, so that a later change
 * to the transport has to state which line it moves and why.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { ColumnMenu } from '../index';
import type { ColumnMenuColumn, ColumnMenuProps } from '../index';
import { renderWithEngine } from '@tests/support/engine';
import { waitForPortalContent } from '@tests/support/skin-reachability';

const SURFACE = ".ds-structure.ds-column-menu-panel[data-part='surface']";

/** The family's documented external open/close route, spelled as it ships. */
const TOGGLE_EVENT = 'entity-table-workspace:toggle-columns-menu';

type MenuProps = ColumnMenuProps<ColumnMenuColumn>;

const COLUMNS: ColumnMenuColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'notes', title: 'Notes' },
];
const VISIBLE = ['name', 'email', 'notes'];

/**
 * A stub transfer. `setData` and `getData` are read back below; the two
 * enumerated properties are NOT, because this runner hands the handler a
 * shallow copy of the init object -- a mock call registers on the shared
 * function, an assignment to `effectAllowed` does not come back. A pin on
 * those two would measure the harness instead of the family.
 */
function transfer(text = '') {
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn(),
    getData: vi.fn(() => text),
  };
}

async function openMenu(
  onColumnsChange: MenuProps['onColumnsChange'] = vi.fn(),
  extra: Partial<MenuProps> = {},
) {
  const { container } = renderWithEngine(
    <ColumnMenu
      columns={COLUMNS}
      visibleColumns={VISIBLE}
      onColumnsChange={onColumnsChange}
      onReset={vi.fn()}
      {...extra}
    />,
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

/** Both stamped elements of one column: the row carries them and so does its handle. */
function stamps(surface: HTMLElement, title: string) {
  const row = rowFor(surface, title);
  const handle = handleFor(surface, title);
  return {
    dragging: [row.getAttribute('data-dragging'), handle.getAttribute('data-dragging')],
    target: [row.getAttribute('data-drag-target'), handle.getAttribute('data-drag-target')],
  };
}

describe('ColumnMenu drag transport', () => {
  it('drags from the handle and drops on the row', async () => {
    const { surface } = await openMenu();
    const row = rowFor(surface, 'Name');
    const handle = handleFor(surface, 'Name');

    // `draggable` is an attribute, not a handler: a dispatched event fires
    // without it, so only the DOM says where a pointer user may start.
    expect(handle).toHaveAttribute('draggable', 'true');
    expect(row.hasAttribute('draggable')).toBe(false);

    const dataTransfer = transfer();
    fireEvent.dragStart(handle, { dataTransfer });

    expect(dataTransfer.setData.mock.calls).toEqual([['text/plain', 'name']]);
    await waitFor(() => expect(row.getAttribute('data-dragging')).toBe('true'));
  });

  it('opens nothing when the gesture starts on the row', async () => {
    const { surface } = await openMenu();
    const row = rowFor(surface, 'Name');
    const dataTransfer = transfer();

    // The row owns `dragover`/`drop` only, so a gesture that starts on it
    // carries no key and can stamp nothing downstream.
    fireEvent.dragStart(row, { dataTransfer });
    fireEvent.dragOver(rowFor(surface, 'Notes'), { dataTransfer });

    expect(dataTransfer.setData).not.toHaveBeenCalled();
    expect(row.getAttribute('data-dragging')).toBe('false');
    expect(rowFor(surface, 'Notes').getAttribute('data-drag-target')).toBe('false');
  });

  it('stages a drop in the draft and commits it only on Apply', async () => {
    const onColumnsChange = vi.fn();
    const { surface } = await openMenu(onColumnsChange);
    const dataTransfer = transfer('name');

    fireEvent.dragStart(handleFor(surface, 'Name'), { dataTransfer });
    fireEvent.dragOver(rowFor(surface, 'Notes'), { dataTransfer });
    fireEvent.drop(rowFor(surface, 'Notes'), { dataTransfer });

    // The source leaves its slot and lands on the target's index.
    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Notes', 'Name']));
    expect(onColumnsChange).not.toHaveBeenCalled();

    fireEvent.dragEnd(handleFor(surface, 'Name'));
    fireEvent.click(applyButton(surface));

    expect(onColumnsChange.mock.calls).toEqual([
      [
        ['name', 'email', 'notes'],
        ['email', 'notes', 'name'],
      ],
    ]);
  });

  it('discards a staged drop when the panel closes without Apply', async () => {
    const onColumnsChange = vi.fn();
    const { surface } = await openMenu(onColumnsChange);
    const dataTransfer = transfer('name');

    fireEvent.dragStart(handleFor(surface, 'Name'), { dataTransfer });
    fireEvent.drop(rowFor(surface, 'Notes'), { dataTransfer });
    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Notes', 'Name']));

    fireEvent(window, new Event(TOGGLE_EVENT));
    await waitFor(() => expect(document.querySelector(SURFACE)).toBeNull());
    expect(onColumnsChange).not.toHaveBeenCalled();

    fireEvent(window, new Event(TOGGLE_EVENT));
    const reopened = await waitForPortalContent(waitFor, SURFACE, '[data-part="row"]', 1);

    expect(draftOrder(reopened)).toEqual(['Name', 'Email', 'Notes']);

    fireEvent.click(applyButton(reopened));
    expect(onColumnsChange.mock.calls).toEqual([
      [
        ['name', 'email', 'notes'],
        ['name', 'email', 'notes'],
      ],
    ]);
  });

  it('stamps and clears the source and the target through a whole drag', async () => {
    const { surface } = await openMenu();
    const dataTransfer = transfer('name');

    expect(stamps(surface, 'Name')).toEqual({ dragging: ['false', 'false'], target: ['false', 'false'] });

    fireEvent.dragStart(handleFor(surface, 'Name'), { dataTransfer });
    await waitFor(() => expect(stamps(surface, 'Name').dragging).toEqual(['true', 'true']));

    fireEvent.dragOver(rowFor(surface, 'Notes'), { dataTransfer });
    await waitFor(() => expect(stamps(surface, 'Notes').target).toEqual(['true', 'true']));

    // Hovering the source HOLDS the indicator where it was: the source is never
    // its own target, and a hover that resolves to nothing does not clear.
    fireEvent.dragOver(rowFor(surface, 'Name'), { dataTransfer });
    expect(stamps(surface, 'Name').target).toEqual(['false', 'false']);
    expect(stamps(surface, 'Notes').target).toEqual(['true', 'true']);

    fireEvent.drop(rowFor(surface, 'Notes'), { dataTransfer });
    await waitFor(() => expect(draftOrder(surface)).toEqual(['Email', 'Notes', 'Name']));
    expect(stamps(surface, 'Name')).toEqual({ dragging: ['false', 'false'], target: ['false', 'false'] });
    expect(stamps(surface, 'Notes')).toEqual({ dragging: ['false', 'false'], target: ['false', 'false'] });
  });

  it('clears both stamps when a drag ends with no drop', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const dataTransfer = transfer('name');

    fireEvent.dragStart(handleFor(surface, 'Name'), { dataTransfer });
    fireEvent.dragOver(rowFor(surface, 'Notes'), { dataTransfer });
    await waitFor(() => expect(stamps(surface, 'Notes').target).toEqual(['true', 'true']));

    fireEvent.dragEnd(handleFor(surface, 'Name'));

    await waitFor(() => expect(stamps(surface, 'Name').dragging).toEqual(['false', 'false']));
    expect(stamps(surface, 'Notes').target).toEqual(['false', 'false']);
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  it('refuses a drop that lands back on the source row', async () => {
    const { surface, onColumnsChange } = await openMenu();
    const dataTransfer = transfer('name');

    fireEvent.dragStart(handleFor(surface, 'Name'), { dataTransfer });
    fireEvent.dragOver(rowFor(surface, 'Notes'), { dataTransfer });
    fireEvent.drop(rowFor(surface, 'Name'), { dataTransfer });

    await waitFor(() => expect(stamps(surface, 'Name').dragging).toEqual(['false', 'false']));
    expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']);
    expect(stamps(surface, 'Notes').target).toEqual(['false', 'false']);
    expect(onColumnsChange).not.toHaveBeenCalled();
  });

  /**
   * A resting row renders both drag attributes with the literal string
   * `false`, and the axe-debt map in `ColumnMenu.causality.integration.test.tsx`
   * pins contrast targets whose ancestor chains contain exactly that spelling,
   * in both places a row can sit. An attribute that started rendering as
   * absent, or a row that changed parents, would redden four long selectors
   * that read as unrelated to dragging.
   */
  it('keeps the resting row spelling the causality debt map depends on', async () => {
    const { surface } = await openMenu(vi.fn(), {
      columns: [
        { key: 'name', title: 'Name', group: 'core' },
        { key: 'email', title: 'Email', group: 'core' },
        { key: 'notes', title: 'Notes' },
      ],
      groups: [{ key: 'core', label: 'Core', columns: ['name', 'email'] }],
    });

    expect(
      surface.querySelectorAll(
        '[data-part="root"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"]' +
          ' > div[data-part="row-content"]',
      ),
    ).toHaveLength(1);
    expect(
      surface.querySelectorAll(
        'div[data-part="group-content"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"]' +
          ':nth-child(1) > div[data-part="row-content"]',
      ),
    ).toHaveLength(1);
  });

  /**
   * DECLARED CHANGE, FLIPPED by the kernel adoption (WO-FAM-08, F-69 lot 2b).
   *
   * The hand-rolled drop handler recovered a key from `text/plain` with no
   * drag of its own in flight, so a drag that originated outside this panel
   * and happened to carry the text of a column key reordered the user's
   * columns. The kernel's drop opens on a session or not at all, so the same
   * gesture is now refused and the draft below is the UNCHANGED order -- the
   * one assertion in this file the adoption rewrites, and the reason it was
   * written before the adoption rather than after.
   *
   * The hover half did not move: an unstarted drag stamped nothing then and
   * stamps nothing now, so no indicator ever promised this drop.
   */
  it('refuses a foreign drag whose text matches a column key', async () => {
    const onColumnsChange = vi.fn();
    const { surface } = await openMenu(onColumnsChange);
    const dataTransfer = transfer('name');
    const target = rowFor(surface, 'Notes');

    fireEvent.dragOver(target, { dataTransfer });
    expect(stamps(surface, 'Notes').target).toEqual(['false', 'false']);

    fireEvent.drop(target, { dataTransfer });

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']));
    expect(onColumnsChange).not.toHaveBeenCalled();

    // Apply is the discriminating read: it publishes the draft React has
    // finished flushing, and would carry the reorder if the drop had landed.
    fireEvent.click(applyButton(surface));
    expect(onColumnsChange.mock.calls).toEqual([
      [
        ['name', 'email', 'notes'],
        ['name', 'email', 'notes'],
      ],
    ]);
  });

  /**
   * A foreign text that matches nothing is inert today, and stays inert after
   * any change: the control that proves the assertion above is about the
   * MATCHING key and not about foreign drags in general.
   */
  it('leaves the draft alone under a foreign drag whose text matches nothing', async () => {
    const onColumnsChange = vi.fn();
    const { surface } = await openMenu(onColumnsChange);
    const dataTransfer = transfer('zz');

    fireEvent.drop(rowFor(surface, 'Notes'), { dataTransfer });

    await waitFor(() => expect(draftOrder(surface)).toEqual(['Name', 'Email', 'Notes']));
    expect(onColumnsChange).not.toHaveBeenCalled();
  });
});

/**
 * DECLARED CHANGE, FLIPPED by the press-cancel repairs (WO-FAM-08, F-69 lots
 * 6a + 6b).
 *
 * The row and its handle each own an interaction-state instance, and an HTML5
 * drag swallows the `pointerup` that would end the press, so both used to stay
 * pressed after a drag that starts and ends on the handle -- the baseline this
 * file recorded before the repair. Each instance now takes `dragend` as its own
 * press-cancel: the row inside this family (6a) and the handle inside the
 * Button primitive (6b). The case below asserts the repaired pair, and it takes
 * both repairs to pass -- either one alone leaves its own instance latched.
 */
describe('ColumnMenu row press state through a drag', () => {
  it('stamps no state on a resting row or handle', async () => {
    const { surface } = await openMenu();

    expect(rowFor(surface, 'Name').hasAttribute('data-state')).toBe(false);
    expect(handleFor(surface, 'Name').hasAttribute('data-state')).toBe(false);
  });

  it('clears the press on BOTH instances after a drag that ends on the handle', async () => {
    const { surface } = await openMenu();
    const row = rowFor(surface, 'Name');
    const handle = handleFor(surface, 'Name');
    const dataTransfer = transfer('name');

    // The press lands on the handle and bubbles to the row, so both instances
    // see the pointer go down.
    fireEvent.pointerDown(handle);
    await waitFor(() => expect(row.getAttribute('data-state')).toContain('pressed'));
    expect(handle.getAttribute('data-state')).toContain('pressed');

    // The browser fires no pointerup for a drag gesture; `dragend` fires on the
    // handle and bubbles, which is how each instance reaches its own cancel.
    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.dragEnd(handle);
    await waitFor(() => expect(row.getAttribute('data-dragging')).toBe('false'));

    expect(row.getAttribute('data-state') ?? '').not.toContain('pressed');
    expect(handle.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('clears both presses on the next pointer up', async () => {
    const { surface } = await openMenu();
    const row = rowFor(surface, 'Name');
    const handle = handleFor(surface, 'Name');

    fireEvent.pointerDown(handle);
    await waitFor(() => expect(row.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(handle);

    await waitFor(() => expect(row.hasAttribute('data-state')).toBe(false));
    expect(handle.hasAttribute('data-state')).toBe(false);
  });
});
