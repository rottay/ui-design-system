/**
 * Sheet modern engine — skin ownership + i18n floor pins (R2+R3 batch E).
 *
 * The engine stamps parts; `modern/skin/sheet.css` owns title typography and
 * the close button's geometry/states. These pins fail if typography creeps
 * back inline, and if the English accessibility floor breaks when no
 * I18nProvider is mounted.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { Sheet } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

function part(name: string): HTMLElement {
  const el = document.body.querySelector(`[data-part='${name}']`);
  expect(el, `expected data-part='${name}'`).not.toBeNull();
  return el as HTMLElement;
}

describe('Sheet modern — skin ownership + i18n floor', () => {
  it('stamps the title with NO inline typography and the close button with the English floor label', async () => {
    await import('../engines/modern');
    const onOpenChange = vi.fn();

    renderWithEngine(
      <Sheet engine="modern" open side="bottom" title="Filters" onOpenChange={onOpenChange}>
        Sheet body
      </Sheet>,
      'modern',
    );

    expect(await screen.findByText('Filters')).toBeInTheDocument();

    const title = part('title');
    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(title.style.lineHeight).toBe('');

    // English floor without an I18nProvider; geometry is skin-owned.
    const close = part('close-button');
    expect(close).toHaveAttribute('aria-label', 'Close');
    expect(close.style.width).toBe('');
    expect(close.style.height).toBe('');
    expect(close.style.display).toBe('');
    // Semantic ActionCloseIcon, decorative.
    const icon = close.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(close);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
