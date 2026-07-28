import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPagination from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Real-engine contract for modern Pagination (K3-B Pass 1): the engine stamps
 * anatomy + accessibility state and paints nothing inline; the skin owns all
 * layout and paint.
 */
describe('Modern Pagination public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(<ModernPagination current={3} total={120} pageSize={10} size="lg" />);

    const root = container.querySelector('.rottay-pagination--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root.style.cssText).toBe('');

    const controls = container.querySelector('[data-part="pagination-controls"]') as HTMLElement;
    expect(controls.style.cssText).toBe('');

    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).style.cssText, `${el.getAttribute('data-part')} carries inline style`).toBe('');
    }
  });

  it('is a named nav landmark with aria-current on the current page', () => {
    render(<ModernPagination current={2} total={50} pageSize={10} />);

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeInTheDocument();

    const current = screen.getByRole('button', { name: '2' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-current', 'true');

    for (const label of ['1', '3', '4', '5']) {
      expect(screen.getByRole('button', { name: label })).not.toHaveAttribute('aria-current');
    }
  });

  it('names the glyph-only prev/next buttons and guards the boundaries', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ModernPagination current={1} total={30} onChange={onChange} />);

    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();

    fireEvent.click(prev);
    expect(onChange).not.toHaveBeenCalled();

    rerender(<ModernPagination current={3} total={30} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('renders the ellipsis as an inert span, never a focusable control', () => {
    const { container } = render(<ModernPagination current={6} total={200} pageSize={10} />);

    const ellipses = container.querySelectorAll('[data-part="ellipsis"]');
    expect(ellipses).toHaveLength(2);
    for (const el of ellipses) {
      expect(el.tagName).toBe('SPAN');
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).not.toHaveAttribute('tabindex');
    }
  });

  it('keeps the English standalone fallback when no i18n provider is mounted', () => {
    render(<ModernPagination current={1} total={200} pageSize={10} showTotal />);

    // No I18nProvider here: the documented standalone English contract.
    expect(screen.getByText('Total 200 items')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('blocks every control when disabled', () => {
    const onChange = vi.fn();
    render(<ModernPagination current={2} total={50} disabled onChange={onChange} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders long totals and keeps anatomy intact in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernPagination current={4} total={200} pageSize={10} />
      </div>
    );

    expect(container.querySelector('[data-part="root"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute('aria-current', 'page');
  });

  it('contains the joined controls row inside narrow frames instead of overflowing the page', () => {
    // K3-B Pass-2 regression pin: at a 390px frame the joined controls row
    // measured 377px against a 342px container and pushed 11px of horizontal
    // page overflow (sighted on the k3-lane-b mobile captures, both
    // tenants). The skin must clip the row to its container and scroll it
    // internally (breadcrumb.css's root precedent).
    const PAGINATION_SKIN = readFileSync(
      join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pagination.css'),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const controlsRule = PAGINATION_SKIN.match(
      /\[data-part='pagination-controls'\]\s*\{[^}]*\}/
    );
    expect(controlsRule, 'controls rule not found').not.toBeNull();
    expect(controlsRule?.[0]).toContain('max-inline-size: 100%');
    expect(controlsRule?.[0]).toContain('overflow-x: auto');
  });
});

/**
 * R2+R3 (BATCH C) Pass-2 pins: the nav glyphs are semantic icons (consistent
 * with the rest of the modern fleet, auto-mirrored in RTL) and the numerals
 * are tabular so page columns never jitter across widths.
 */
describe('Modern Pagination premium craft', () => {
  it('renders semantic chevron icons instead of text guillemets', () => {
    const { container } = render(<ModernPagination current={2} total={50} pageSize={10} />);

    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(prev.querySelector('svg')).not.toBeNull();
    expect(next.querySelector('svg')).not.toBeNull();
    expect(prev.textContent).not.toContain('«');
    expect(next.textContent).not.toContain('»');
    // The glyphs are decorative: the accessible name stays the i18n label.
    expect(prev.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-part="pagination-nav-button"]')).toBeInTheDocument();
  });

  it('pins tabular numerals in the skin for controls and the range readout', () => {
    const PAGINATION_SKIN = readFileSync(
      join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pagination.css'),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    // The shared controls rule (nav + page buttons + ellipsis) and the range
    // readout both set the tabular channel — two declaration sites.
    const sites = PAGINATION_SKIN.match(
      /font-variant-numeric: var\(--ds-pagination-numeric, tabular-nums\)/g
    );
    expect(sites).toHaveLength(2);

    const rangeRule = PAGINATION_SKIN.match(/\[data-part='pagination-range'\]\s*\{[^}]*\}/);
    expect(rangeRule?.[0]).toContain('font-variant-numeric');
  });
});
