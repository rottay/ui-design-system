import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernBreadcrumb from '../engines/modern';
import type { BreadcrumbItem } from '../contracts';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * New-contract coverage for `BreadcrumbItem.menu` and `BreadcrumbProps.overflow`.
 * Non-regression for the rest of the family (including the legacy `maxItems`
 * shape) lives in `Breadcrumb.modern-engine.test.tsx` (untouched); the last
 * describe block below re-proves that exact scenario from this file's own
 * refactored code path.
 *
 * `Dropdown` is composed here through its public facade (`createEngineComponent`),
 * per the family composition convention -- NOT its modern engine module
 * directly. Two consequences for these tests:
 *
 * 1. Without an ambient `EngineProvider`, the facade's `useEngineContext()`
 *    falls back to the GLOBAL default engine (`classic`), not `modern` --
 *    real vertical apps set an app-wide `defaultEngine="modern"` provider,
 *    which is exactly what `renderWithEngine(ui, 'modern')` (the family's
 *    own `Pagination.engine-advanced.test.tsx` precedent) reproduces. Tests
 *    that touch Dropdown-composed content use it instead of plain `render`.
 * 2. The facade lazy-loads the resolved engine behind a `Suspense` boundary,
 *    so anything that is Dropdown's `children` -- the overflow-trigger
 *    button, or a menu-bearing crumb -- is absent from the DOM until that
 *    dynamic import resolves, even against an already-cached module (a
 *    dynamic `import()` always yields at least one microtask). Those tests
 *    use `findBy*` for the first such query; once resolved, Dropdown's own
 *    interaction (open/close, menu items) is synchronous, matching the
 *    existing `Dropdown.modern-disclosure.test.tsx` precedent (`fireEvent.click`
 *    immediately followed by a synchronous `getByRole`).
 */
describe('Modern Breadcrumb overflow collapse', () => {
  const items: BreadcrumbItem[] = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'a', label: 'Level A', href: '/a' },
    { key: 'b', label: 'Level B', href: '/b' },
    { key: 'c', label: 'Level C', href: '/c' },
    { key: 'd', label: 'Level D', href: '/d' },
    { key: 'current', label: 'Current page' },
  ];

  it('collapses behind a real trigger (not an inert ellipsis) that opens a menu with the hidden items', async () => {
    const onClick = vi.fn();
    const collapsibleItems: BreadcrumbItem[] = [
      items[0],
      { key: 'a', label: 'Level A', onClick },
      items[2],
      items[3],
      items[4],
      items[5],
    ];

    const { container } = renderWithEngine(
      <ModernBreadcrumb items={collapsibleItems} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern'
    );

    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });
    // No inert role="note" ellipsis anywhere -- a real button instead.
    expect(container.querySelector('[role="note"]')).toBeNull();
    expect(trigger).toHaveAttribute('data-part', 'overflow-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    // hidden = items strictly between keepFirst(1) and the last keepLast(2): a, b, c
    expect(within(menu).getByRole('menuitem', { name: 'Level A' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Level B' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Level C' })).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Level A' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('navigates (full page load) for a hidden href-only item', async () => {
    const originalLocation = window.location;
    // `window.location` is declared `string & Location` so that assigning a URL
    // string navigates; the stub below is an object, so it is installed through
    // a view that keeps only the `Location` half.
    const navigable = window as unknown as { location: Location };
    // @ts-expect-error -- narrow jsdom navigation stub, restored below
    delete window.location;
    navigable.location = { href: '' } as unknown as Location;

    try {
      renderWithEngine(
        <ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
        'modern'
      );

      const trigger = await screen.findByRole('button', { name: 'Show hidden items' });
      fireEvent.click(trigger);
      fireEvent.click(screen.getByRole('menuitem', { name: 'Level B' }));

      expect(window.location.href).toBe('/b');
    } finally {
      navigable.location = originalLocation;
    }
  });

  it('respects keepFirst and keepLast', () => {
    render(<ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 2, keepLast: 1 }} />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Level A' })).toBeInTheDocument();
    expect(screen.getByText('Current page')).toBeInTheDocument();
    // The middle items (b, c, d) are hidden behind the trigger, not rendered
    // directly as links. Which engine the (unqueried) trigger itself resolves
    // to is irrelevant here, so plain `render` is enough.
    expect(screen.queryByRole('link', { name: 'Level B' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Level C' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Level D' })).toBeNull();
  });

  it('keeps aria-current="page" on the true last item regardless of collapse', () => {
    render(<ModernBreadcrumb items={items} overflow={{ maxVisible: 4 }} />);
    const current = screen.getByText('Current page').closest('[data-part="crumb"]') as HTMLElement;
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-current', 'true');
  });

  it('ignores maxItems entirely once overflow is present', async () => {
    // maxItems=3 alone would legally collapse to a 1 + ellipsis + 1 shape;
    // overflow governs instead (default keepFirst=1/keepLast=2), so 3 real
    // crumbs plus a real trigger render.
    renderWithEngine(<ModernBreadcrumb items={items} maxItems={3} overflow={{ maxVisible: 4 }} />, 'modern');

    expect(await screen.findByRole('button', { name: 'Show hidden items' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('does not collapse when items fit within maxVisible', () => {
    render(<ModernBreadcrumb items={items.slice(0, 3)} overflow={{ maxVisible: 4 }} />);
    expect(screen.queryByRole('button', { name: 'Show hidden items' })).toBeNull();
    for (const item of items.slice(0, 3)) {
      const label = typeof item.label === 'string' ? item.label : '';
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe('Modern Breadcrumb per-item menu', () => {
  it('opens a Dropdown menu for an item carrying .menu, independent of overflow/maxItems', async () => {
    const versionItems: BreadcrumbItem[] = [
      { key: 'home', label: 'Home', href: '/' },
      {
        key: 'version',
        label: 'v2.4',
        menu: [
          { key: 'v2.3', label: 'v2.3', href: '/docs/v2.3' },
          { key: 'v2.2', label: 'v2.2', href: '/docs/v2.2' },
        ],
      },
      { key: 'current', label: 'Current page' },
    ];

    renderWithEngine(<ModernBreadcrumb items={versionItems} />, 'modern');

    expect(screen.queryByRole('menu')).toBeNull();
    const trigger = (await screen.findByText('v2.4')).closest('[data-part="crumb"]') as HTMLElement;
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'v2.3' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'v2.2' })).toBeInTheDocument();
  });

  it('renders a plain crumb (no Dropdown) when .menu is absent', () => {
    render(
      <ModernBreadcrumb
        items={[{ key: 'home', label: 'Home', href: '/' }, { key: 'current', label: 'Current' }]}
      />
    );
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-haspopup');
  });
});

describe('Modern Breadcrumb legacy maxItems (no overflow prop) -- intact', () => {
  it('keeps the inert role="note" ellipsis unchanged, with no overflow-trigger anywhere', () => {
    const { container } = render(
      <ModernBreadcrumb
        maxItems={3}
        items={[
          { key: '1', label: 'Level 1', href: '/1' },
          { key: '2', label: 'Level 2', href: '/2' },
          { key: '3', label: 'Level 3', href: '/3' },
          { key: '4', label: 'Level 4', href: '/4' },
          { key: '5', label: 'Level 5' },
        ]}
      />
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-truncated', 'true');
    expect(root).toHaveAttribute('data-count', '3');

    const ellipsis = container.querySelector('[data-ellipsis="true"] [data-part="crumb"]') as HTMLElement;
    expect(ellipsis.tagName).toBe('SPAN');
    expect(ellipsis).toHaveAttribute('role', 'note');
    expect(ellipsis).not.toHaveAttribute('data-clickable');
    // The legacy path never touches Dropdown, so this never renders here.
    expect(container.querySelector('[data-part="overflow-trigger"]')).toBeNull();

    const current = screen.getByText('Level 5').closest('[data-part="crumb"]') as HTMLElement;
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });
});
