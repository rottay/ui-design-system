/**
 * Drawer modern engine — i18n English floor pin (R2+R3 batch E).
 *
 * The optional translation channel must keep the drawer rendering standalone:
 * without an I18nProvider the close button falls back to the English
 * accessibility label instead of crashing or echoing a raw key.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernDrawer from '../engines/modern';

describe('Drawer modern — i18n English floor (no I18nProvider)', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders standalone and labels the close button with the English floor', () => {
    const onClose = vi.fn();
    render(
      <ModernDrawer open title="Filters" onClose={onClose}>
        Drawer body
      </ModernDrawer>,
    );

    const close = screen.getByLabelText('Close');
    expect(close).toHaveAttribute('data-part', 'close-button');

    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
