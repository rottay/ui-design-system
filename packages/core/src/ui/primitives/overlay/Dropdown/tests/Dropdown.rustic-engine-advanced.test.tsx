import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const RUSTIC_DROPDOWN_SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/rustic/skin/dropdown.css'
  ),
  'utf8'
);

import { Dropdown as RusticDropdown } from '../engines/rustic';

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
    expect(RUSTIC_DROPDOWN_SKIN).toContain(
      "[data-part='item']:hover:not([data-disabled='true']) {\n  background-color: var(--ds-dropdown-item-hover-bg, var(--ds-color-neutral-100, #f3f4f6));"
    );
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
