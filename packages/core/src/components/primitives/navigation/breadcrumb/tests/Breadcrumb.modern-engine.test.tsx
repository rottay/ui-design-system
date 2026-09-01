import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernBreadcrumb from '../engines/modern';

const items = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'catalog', label: 'Catalog', href: '/catalog' },
  { key: 'current', label: 'Current page' },
];

/**
 * Real-engine contract for modern Breadcrumb (K3-B Pass 1): zero inline
 * styles, named nav landmark, `aria-current` on the last crumb, and real
 * interactive elements for every clickable row.
 */
describe('Modern Breadcrumb public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(<ModernBreadcrumb items={items} />);

    const root = container.querySelector(
      '.rottay-breadcrumb-shell--modern[data-part="root"]'
    ) as HTMLElement;
    expect(root).toHaveAttribute('data-count', '3');

    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).style.cssText, `${el.getAttribute('data-part')} carries inline style`).toBe('');
    }
  });

  it('is a named nav landmark with aria-current="page" on the last crumb only', () => {
    render(<ModernBreadcrumb items={items} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();

    const current = screen.getByText('Current page').closest('[data-part="crumb"]') as HTMLElement;
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-current', 'true');

    for (const label of ['Home', 'Catalog']) {
      const crumb = screen.getByText(label).closest('[data-part="crumb"]') as HTMLElement;
      expect(crumb).not.toHaveAttribute('aria-current');
      expect(crumb).toHaveAttribute('data-current', 'false');
    }
  });

  it('renders href items as links and onClick-only items as real buttons', () => {
    const onClick = vi.fn();
    render(
      <ModernBreadcrumb
        items={[
          { key: 'home', label: 'Home', href: '/' },
          { key: 'action', label: 'Open filters', onClick },
          { key: 'current', label: 'Current page' },
        ]}
      />
    );

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');

    // A span with a click handler would be keyboard-invisible; the contract
    // is a native button instead.
    const button = screen.getByRole('button', { name: 'Open filters' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the current page and the truncation ellipsis inert', () => {
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
    expect(ellipsis).not.toHaveAttribute('data-clickable');

    const current = screen.getByText('Level 5').closest('[data-part="crumb"]') as HTMLElement;
    expect(current.tagName).toBe('SPAN');
  });

  it('keeps the English standalone fallback when no i18n provider is mounted', () => {
    // No I18nProvider here: useOptionalTranslation must not throw and the
    // documented English aria-label applies.
    render(<ModernBreadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders a custom separator node between items', () => {
    render(<ModernBreadcrumb items={items} separator="›" />);
    const separators = document.querySelectorAll('[data-part="separator"]');
    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveTextContent('›');
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps label and icon anatomy intact in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernBreadcrumb
          items={[
            { key: 'home', label: 'الرئيسية', href: '/', icon: <span data-testid="home-icon">⌂</span> },
            { key: 'current', label: 'الصفحة الحالية' },
          ]}
        />
      </div>
    );

    expect(screen.getByText('الرئيسية')).toHaveAttribute('data-part', 'label');
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(container.querySelector('[data-part="icon"]')).toBeInTheDocument();
  });
});
