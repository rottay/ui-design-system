import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  readSkinRules,
  waitForComposedContent,
  winningDecl,
} from '@tests/support/skin-reachability';
import { Dropdown as RusticDropdown } from '../engines/rustic';

/** Engine skins live outside the helper's default presentation root. */
const RUSTIC_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/rustic/skin';

/**
 * PARSED, not substring-matched. The rule is read through postcss so the
 * assertion pins the selector, the property and the exact value while staying
 * indifferent to indentation — a raw `toContain` on the declaration text also
 * fails when the file is merely reformatted, which is a false red rather than
 * a lost channel.
 */
const DROPDOWN_ITEM_HOVER = winningDecl(
  readSkinRules('dropdown', RUSTIC_SKIN_ROOT),
  'background-color',
  (rule) => rule.selector.includes("[data-part='item']") && rule.selector.includes(':hover')
);

describe('Dropdown rustic engine advanced coverage', () => {
  afterEach(() => {
    cleanup();
  });

  it('covers click, context menu, placement, item clicks, and outside dismissal', async () => {
    const handleOpenChange = vi.fn();
    const handleMenuClick = vi.fn();

    const { rerender, container } = render(
      <RusticDropdown
        trigger={['click']}
        placement="topRight"
        onOpenChange={handleOpenChange}
        menu={{
          onClick: handleMenuClick,
          items: [
            { key: 'group', type: 'group', label: 'Actions' },
            { key: 'edit', label: 'Edit' },
            { key: 'divider', type: 'divider' },
            { key: 'delete', label: 'Delete', danger: true },
            { key: 'disabled', label: 'Disabled', disabled: true },
          ],
        }}
      >
        <button type="button">Open menu</button>
      </RusticDropdown>
    );

    const trigger = container.firstElementChild as HTMLElement | null;
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected rustic dropdown trigger wrapper');
    }

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();

    // The hover ground is CSS, not inline: the rustic engine's mouseEnter only
    // toggles open state. This asserted an inline contract the CSS-first
    // migration removed, and passed because jest-dom parses the EXPECTED value
    // through happy-dom's typed parser, which discards a var() with a fallback
    // and leaves {} — an expectation that matches any element.
    const editItem = screen.getByRole('menuitem', { name: 'Edit' });
    const disabledItem = screen.getByRole('menuitem', { name: 'Disabled' });

    // Side one: the rule declares the channel, and keeps the guard that stops
    // it repainting a disabled row.
    expect(DROPDOWN_ITEM_HOVER?.decls['background-color']).toBe(
      'var(--ds-dropdown-item-hover-bg, var(--ds-color-neutral-100, #f3f4f6))'
    );
    expect(DROPDOWN_ITEM_HOVER?.selector).toContain(":not([data-disabled='true'])");

    // Side two: the DOM presents a node that selector can reach. Declaring a
    // rule and stamping the hook it needs are separate facts, and an engine
    // change can sever the second while the first still reads correct.
    const resting = DROPDOWN_ITEM_HOVER!.selector.replace(':hover', '');
    await waitForComposedContent(waitFor, document, resting, 1);
    expect(editItem.matches(resting)).toBe(true);
    expect(disabledItem.matches(resting)).toBe(false);

    fireEvent.mouseEnter(editItem);
    fireEvent.mouseLeave(editItem);

    fireEvent.click(editItem);
    expect(handleMenuClick).toHaveBeenCalledWith({ key: 'edit' });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(handleOpenChange.mock.calls.filter(([value]) => value === false).length).toBeGreaterThanOrEqual(2);
    });

    rerender(
      <RusticDropdown
        trigger={['contextMenu']}
        onOpenChange={handleOpenChange}
        menu={{
          onClick: handleMenuClick,
          items: [{ key: 'archive', label: 'Archive' }],
        }}
      >
        <button type="button">Context trigger</button>
      </RusticDropdown>
    );

    fireEvent.contextMenu(container.firstElementChild as HTMLElement);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });

  it('covers hover trigger and disabled guard branches', async () => {
    const handleOpenChange = vi.fn();

    const { rerender, container } = render(
      <RusticDropdown
        trigger={['hover']}
        onOpenChange={handleOpenChange}
        menu={{ items: [{ key: 'preview', label: 'Preview' }] }}
      >
        <button type="button">Hover trigger</button>
      </RusticDropdown>
    );

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    fireEvent.mouseLeave(container.firstElementChild as HTMLElement);
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <RusticDropdown
        disabled
        trigger={['click', 'hover']}
        onOpenChange={handleOpenChange}
        menu={{ items: [{ key: 'preview', label: 'Preview' }] }}
      >
        <button type="button">Disabled trigger</button>
      </RusticDropdown>
    );

    fireEvent.click(container.firstElementChild as HTMLElement);
    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
