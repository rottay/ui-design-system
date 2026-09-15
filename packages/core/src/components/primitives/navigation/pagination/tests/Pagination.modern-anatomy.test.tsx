/**
 * The Modern pagination's anatomy contract, executed: one `ds-pagination`
 * namespace, the interaction kernel deciding every control's state once
 * (buttons, the jumper input and the native size select), a toolbar axe
 * accepts, and numerals and names that survive a right-to-left locale.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';

import ModernPagination from '../engines/modern';

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr', 'select-name', 'label'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('one namespace', () => {
  it('emits ds-pagination classes only', () => {
    const { container } = render(<ModernPagination current={3} total={120} pageSize={10} showTotal showSizeChanger showQuickJumper />);
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /(^|-)pagination(-|$)/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-pagination'))).toBe(true);
    expect(container.querySelector('[class*="rottay-pagination"]')).toBeNull();
    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).getAttribute('style'), `${el.getAttribute('data-part')} carries inline style`).toBeNull();
    }
  });
});

describe('the kernel decides state once', () => {
  it('stamps hover, press and focus on page and nav buttons, and disabled on the edge', () => {
    render(<ModernPagination current={1} total={50} pageSize={10} />);
    const two = screen.getByRole('button', { name: '2' });
    const previous = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });

    expect(two).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(two);
    expect(two).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(two);
    expect(two).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(two);
    fireEvent.pointerLeave(two);
    expect(two).not.toHaveAttribute('data-state');

    fireEvent.focus(next);
    expect(next).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(next);
    expect(next).not.toHaveAttribute('data-state');

    expect(previous).toBeDisabled();
    expect(previous).toHaveAttribute('data-state', 'disabled');
    fireEvent.pointerEnter(previous);
    expect(previous).toHaveAttribute('data-state', 'disabled');
  });

  it('governs the jumper input and the size select, and dims their wrappers when disabled', () => {
    const { rerender } = render(<ModernPagination current={2} total={50} pageSize={10} showSizeChanger showQuickJumper />);
    const jumper = screen.getByRole('textbox', { name: 'Go to page' });
    const select = screen.getByRole('combobox', { name: 'Items per page' });
    expect(jumper).toHaveAttribute('data-part', 'quick-jumper');
    expect(select).toHaveAttribute('data-part', 'pagination-size-select');

    fireEvent.focus(jumper);
    expect(jumper).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(jumper);
    expect(jumper).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(select);
    expect(select).toHaveAttribute('data-state', 'hovered');

    rerender(<ModernPagination current={2} total={50} pageSize={10} showSizeChanger showQuickJumper disabled />);
    expect(jumper).toHaveAttribute('data-state', 'disabled');
    expect(select).toHaveAttribute('data-state', 'disabled');
    expect(jumper.closest('[data-part="pagination-jumper"]')).toHaveAttribute('data-disabled', 'true');
    expect(select.closest('[data-part="pagination-size-changer"]')).toHaveAttribute('data-disabled', 'true');
  });

  it('keeps the ellipsis inert readout', () => {
    const { container } = render(<ModernPagination current={6} total={200} pageSize={10} />);
    const ellipsis = container.querySelector('[data-part="ellipsis"]') as HTMLElement;
    expect(ellipsis.tagName).toBe('SPAN');
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    expect(ellipsis).not.toHaveAttribute('tabindex');
    expect(ellipsis).not.toHaveAttribute('data-state');
  });
});

describe('a toolbar axe accepts', () => {
  it('reports no structural or naming violation with every region rendered', async () => {
    const { container } = render(<ModernPagination current={6} total={200} pageSize={10} showTotal showSizeChanger showQuickJumper />);
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: an unnamed select trips the same rules', async () => {
    const { container } = render(
      <nav aria-label="Pages">
        <select>
          <option>10</option>
        </select>
      </nav>,
    );
    expect(await violationIds(container, STRUCTURE_RULES)).toContain('select-name');
  });
});

describe('direction and locale', () => {
  it('keeps the joined order, the current page and the glyph names under RTL', () => {
    document.documentElement.dir = 'rtl';
    const { container } = render(<ModernPagination current={2} total={50} pageSize={10} simple />);
    const controls = container.querySelector('[data-part="pagination-controls"]') as HTMLElement;
    const parts = Array.from(controls.children).map((el) => el.getAttribute('data-part'));
    expect(parts).toEqual(['pagination-nav-button', 'pagination-simple-text', 'pagination-nav-button']);
    expect(controls.firstElementChild).toHaveAttribute('data-direction', 'prev');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 5')).toHaveAttribute('data-part', 'pagination-simple-text');
  });

  it('keeps numerals as accessible names inside a right-to-left, Arabic-tagged host', () => {
    render(
      <div dir="rtl" lang="ar">
        <ModernPagination current={3} total={70} pageSize={10} />
      </div>,
    );
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });
});
