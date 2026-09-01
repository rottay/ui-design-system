import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernDrawer from '../engines/modern';

describe('Drawer modern — Escape and the overlay stack', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('dismisses only the top-most drawer when two are stacked', () => {
    const onCloseBase = vi.fn();
    const onCloseTop = vi.fn();

    render(
      <>
        <ModernDrawer open title="Filters" onClose={onCloseBase}>
          Base drawer
        </ModernDrawer>
        <ModernDrawer open title="Column settings" onClose={onCloseTop}>
          Top drawer
        </ModernDrawer>
      </>,
    );

    expect(screen.getByRole('dialog', { name: 'Column settings' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBase).not.toHaveBeenCalled();
  });

  it('still dismisses a lone drawer on Escape', () => {
    const onClose = vi.fn();

    render(
      <ModernDrawer open title="Filters" onClose={onClose}>
        Base drawer
      </ModernDrawer>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
