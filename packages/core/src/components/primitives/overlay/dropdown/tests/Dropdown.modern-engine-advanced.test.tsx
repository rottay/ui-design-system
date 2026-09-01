import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';

describe('Dropdown modern engine advanced coverage', () => {
  afterEach(() => {
    cleanup();
  });

  it('covers click, placement, grouped items, menu clicks, disabled items, and outside dismissal', () => {
    const handleOpenChange = vi.fn();
    const handleMenuClick = vi.fn();
    const ref = React.createRef<HTMLDivElement>();

    const { container, rerender } = render(
      <ModernDropdown
        ref={ref}
        trigger={['click']}
        placement="topRight"
        onOpenChange={handleOpenChange}
        overlayClassName="coverage-overlay"
        overlayStyle={{ minWidth: 240 }}
        getPopupContainer={() => document.body}
        menu={{
          onClick: handleMenuClick,
          selectable: true,
          selectedKeys: ['edit'],
          items: [
            { key: 'group', type: 'group', label: 'Actions' },
            { key: 'edit', label: 'Edit' },
            { key: 'divider', type: 'divider' },
            { key: 'delete', label: 'Delete', danger: true },
            { key: 'disabled', label: 'Disabled', disabled: true },
            {
              key: 'share',
              label: 'Share',
              children: [{ key: 'copy-link', label: 'Copy link' }],
            },
          ],
        }}
      >
        <button type="button">Open modern menu</button>
      </ModernDropdown>
    );

    const trigger = container.firstElementChild;
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected modern dropdown trigger container');
    }

    expect(ref.current).toBeTruthy();
    expect(trigger).toHaveAttribute('data-placement', 'topRight');
    expect(trigger.className).not.toContain('dropdown-top');
    expect(trigger.className).not.toContain('dropdown-end');

    fireEvent.click(trigger);
    expect(document.body.querySelector('[data-part="surface"]')).not.toBeNull();
    expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('data-selected', 'true');
    expect(document.body.querySelector('.dropdown-content')).toBeNull();
    expect(document.body.querySelector('.menu')).toBeNull();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Share' }));
    expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeInTheDocument();

    const editButton = screen.getByRole('menuitem', { name: 'Edit' });
    fireEvent.click(editButton);
    expect(handleMenuClick).toHaveBeenCalledWith({ key: 'edit' });
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(trigger);
    expect(document.body.querySelector('[data-part="surface"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled' }));
    expect(handleMenuClick).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(document.body);
    expect(document.body.querySelector('[data-part="surface"]')).toBeNull();

    rerender(
      <ModernDropdown
        open
        menu={{ items: [{ key: 'persist', label: 'Persist' }] }}
      >
        <button type="button">Controlled menu</button>
      </ModernDropdown>
    );

    expect(document.body.querySelector('[data-part="surface"]')).not.toBeNull();
    expect(screen.getByText('Persist')).toBeInTheDocument();
  });

  it('covers hover, context-menu, disabled, and empty-placement branches', async () => {
    const handleOpenChange = vi.fn();

    const { container, rerender } = render(
      <ModernDropdown
        trigger={['hover']}
        placement={undefined}
        onOpenChange={handleOpenChange}
        menu={{ items: [{ key: 'preview', label: 'Preview' }] }}
      >
        <button type="button">Hover modern menu</button>
      </ModernDropdown>
    );

    const trigger = container.firstElementChild;
    if (!(trigger instanceof HTMLElement)) {
      throw new Error('Expected hover dropdown container');
    }

    fireEvent.mouseEnter(trigger);
    expect(container.querySelector('[data-part="surface"]')).not.toBeNull();
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(handleOpenChange).toHaveBeenCalledWith(false));

    rerender(
      <ModernDropdown
        trigger={['contextMenu']}
        onOpenChange={handleOpenChange}
        menu={{ items: [{ key: 'archive', label: 'Archive' }] }}
      >
        <button type="button">Context modern menu</button>
      </ModernDropdown>
    );

    fireEvent.contextMenu(container.firstElementChild as HTMLElement);
    expect(container.querySelector('[data-part="surface"]')).not.toBeNull();

    rerender(
      <ModernDropdown
        key="disabled"
        disabled
        trigger={['click', 'hover', 'contextMenu']}
        onOpenChange={handleOpenChange}
        menu={{ items: [{ key: 'disabled', label: 'Disabled' }] }}
      >
        <button type="button">Disabled modern menu</button>
      </ModernDropdown>
    );

    fireEvent.click(container.firstElementChild as HTMLElement);
    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    fireEvent.contextMenu(container.firstElementChild as HTMLElement);
    expect(container.querySelector('[data-part="surface"]')).toBeNull();
  });
});
