/**
 * The Modern breadcrumb's anatomy contract, executed: one `ds-breadcrumb`
 * namespace across the engine tree and the Item compound, the interaction
 * kernel deciding every crumb's state once, a trail axe accepts, and a trail
 * that survives a right-to-left locale.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernBreadcrumb from '../engines/modern';
import { BreadcrumbItem } from '../compound/item';

const ITEMS = [
  { key: 'home', label: 'Home', href: '/', icon: <span>H</span> },
  { key: 'catalog', label: 'Catalog', href: '/catalog' },
  { key: 'filters', label: 'Filters', onClick: () => undefined },
  { key: 'current', label: 'Current page' },
];

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr', 'list', 'listitem'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('one namespace', () => {
  it('emits ds-breadcrumb classes only, on the engine tree and on the compound', () => {
    const { container } = render(
      <>
        <ModernBreadcrumb items={ITEMS} />
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </>,
    );
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /(^|-)breadcrumb(-|$)/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-breadcrumb'))).toBe(true);
    expect(container.querySelector('[class*="rottay-breadcrumb"]')).toBeNull();
  });

  it('paints nothing inline on the compound either', () => {
    const { container } = render(
      <>
        <BreadcrumbItem href="/" icon={<span>H</span>}>Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </>,
    );
    for (const el of container.querySelectorAll('*')) {
      expect((el as HTMLElement).getAttribute('style')).toBeNull();
    }
    expect(container.querySelector('a[data-part="crumb"]')).toHaveAttribute('data-current', 'false');
    expect(container.querySelector('span[data-part="crumb"]')).toHaveAttribute('data-current', 'true');
  });
});

describe('the kernel decides state once', () => {
  it('stamps hover, press and focus on links and buttons, never on the current page', () => {
    render(<ModernBreadcrumb items={ITEMS} />);
    const home = screen.getByRole('link', { name: /Home/ });
    const filters = screen.getByRole('button', { name: 'Filters' });
    const current = screen.getByText('Current page').closest('[data-part="crumb"]') as HTMLElement;

    expect(home).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(home);
    expect(home).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(home);
    expect(home).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(home);
    fireEvent.pointerLeave(home);
    expect(home).not.toHaveAttribute('data-state');

    fireEvent.focus(filters);
    expect(filters).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(filters);
    expect(filters).not.toHaveAttribute('data-state');

    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
    fireEvent.pointerEnter(current);
    expect(current).not.toHaveAttribute('data-state');
  });

  it('governs the overflow trigger and the compound link the same way', async () => {
    const onClick = vi.fn();
    // The trigger composes the public Dropdown, which needs a declared engine and resolves behind Suspense.
    renderWithEngine(
      <>
        <ModernBreadcrumb items={ITEMS} overflow={{ maxVisible: 2, keepFirst: 1, keepLast: 1 }} />
        <BreadcrumbItem href="/x" onClick={onClick}>Compound</BreadcrumbItem>
      </>,
      'modern',
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });
    expect(trigger).toHaveAttribute('data-part', 'overflow-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-state', 'focused focus-visible');

    const compound = screen.getByRole('link', { name: 'Compound' });
    fireEvent.pointerEnter(compound);
    expect(compound).toHaveAttribute('data-state', 'hovered');
    fireEvent.click(compound);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('a trail axe accepts', () => {
  it('reports no structural violation with links, a button, a menu crumb and the overflow trigger', async () => {
    const { container } = renderWithEngine(
      <ModernBreadcrumb
        items={[...ITEMS.slice(0, 3), { key: 'v', label: 'Version', menu: [{ key: 'v1', label: 'v1' }] }, ITEMS[3]]}
        overflow={{ maxVisible: 3, keepFirst: 1, keepLast: 2 }}
      />,
      'modern',
    );
    await screen.findByRole('button', { name: 'Show hidden items' });
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: a control nested in an option and a list holding a bare div trip the same rules', async () => {
    const { container } = render(
      <div>
        <div role="listbox" aria-label="Rows">
          <div role="option" aria-selected="true">
            Row
            <button type="button" aria-label="Action" />
          </div>
        </div>
        <ul>
          <div>loose</div>
        </ul>
      </div>,
    );
    const ids = await violationIds(container, STRUCTURE_RULES);
    expect(ids).toContain('nested-interactive');
    expect(ids).toContain('list');
  });
});

describe('direction and locale', () => {
  it('keeps the current page last and every separator decorative under RTL', () => {
    document.documentElement.dir = 'rtl';
    const { container } = render(<ModernBreadcrumb items={ITEMS} />);
    const crumbs = Array.from(container.querySelectorAll('[data-part="crumb"]'));
    expect(crumbs).toHaveLength(4);
    expect(crumbs[3]).toHaveAttribute('aria-current', 'page');
    const separators = Array.from(container.querySelectorAll('[data-part="separator"]'));
    expect(separators).toHaveLength(3);
    expect(separators.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('keeps an Arabic label as the crumb name and its title', () => {
    const label = 'الصفحة الرئيسية';
    render(
      <div dir="rtl" lang="ar">
        <ModernBreadcrumb items={[{ key: 'ar', label, href: '/' }, { key: 'c', label: 'الحالي' }]} />
      </div>,
    );
    const link = screen.getByRole('link', { name: label });
    expect(link.querySelector('[data-part="label"]')).toHaveAttribute('title', label);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-count', '2');
  });
});
