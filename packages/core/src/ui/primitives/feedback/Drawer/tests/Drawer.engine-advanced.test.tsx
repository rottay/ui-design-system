import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernDrawer from '../engines/modern';
import RusticDrawer from '../engines/rustic';

describe('Drawer advanced engine coverage', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('covers modern placement sizing, overlay closing, escape handling, footer rendering, and hidden branches', () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();

    const { container, rerender } = render(
      <ModernDrawer
        open
        placement="top"
        size="lg"
        title="Filters"
        footer={<div>Footer actions</div>}
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        Drawer body
      </ModernDrawer>
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
    expect(container.querySelector('.rottay-drawer')?.getAttribute('style') ?? '').toContain('height: 520px');

    fireEvent.click(container.querySelector('.rottay-drawer-overlay') as HTMLDivElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(3);

    rerender(
      <ModernDrawer
        open
        placement="left"
        width="420px"
        mask={false}
        closable={false}
        hideFooter
        closeOnEscape={false}
        closeOnOverlayClick={false}
        title="No chrome"
      >
        Compact body
      </ModernDrawer>
    );

    expect(container.querySelector('.rottay-drawer-overlay')).toBeNull();
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    expect(screen.queryByText('Footer actions')).not.toBeInTheDocument();
    expect(container.querySelector('.rottay-drawer')?.getAttribute('style') ?? '').toContain('width: 420px');
  });

  it('covers rustic placement sizing, mask opacity, overlay/escape guards, and footer visibility branches', () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();

    const { container, rerender } = render(
      <RusticDrawer
        open
        placement="bottom"
        size="sm"
        maskOpacity={0.3}
        title="Rustic drawer"
        footer={<div>Rustic footer</div>}
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        Rustic body
      </RusticDrawer>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Rustic footer')).toBeInTheDocument();
    // The mask rides a custom property the skin's backdrop rule consumes; the
    // blur itself stays personality.css's, which is why rustic declares no
    // backdrop-filter of its own.
    expect(container.querySelector('.rottay-drawer-overlay')?.getAttribute('style') ?? '').toContain(
      '--ds-drawer-overlay-opacity: 0.3'
    );
    expect(container.querySelector('.rottay-drawer')?.getAttribute('style') ?? '').toContain('height: 256px');

    fireEvent.click(container.querySelector('.rottay-drawer-overlay') as HTMLDivElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(
      <RusticDrawer
        open
        placement="right"
        width="420px"
        mask={false}
        closable={false}
        hideFooter
        closeOnOverlayClick={false}
        closeOnEscape={false}
        title="Guarded drawer"
      >
        Guarded body
      </RusticDrawer>
    );

    expect(container.querySelector('.rottay-drawer-overlay')).toBeNull();
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    expect(screen.queryByText('Rustic footer')).not.toBeInTheDocument();
    expect(container.querySelector('.rottay-drawer')?.getAttribute('style') ?? '').toContain('width: 420px');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
