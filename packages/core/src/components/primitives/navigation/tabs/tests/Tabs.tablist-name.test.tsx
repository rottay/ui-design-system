import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernTabs from '../engines/modern';
import type { TabsProps } from '../contracts';

const ITEMS = [
  { key: 'all', label: 'All', children: 'All body' },
  { key: 'mine', label: 'Mine', children: 'Mine body' },
];

const tablist = () => screen.getByRole('tablist');

describe('Modern Tabs names its tablist from the caller', () => {
  it('resolves the tablist by role and aria-label', () => {
    render(<ModernTabs items={ITEMS} aria-label="Saved views" />);
    expect(screen.getByRole('tablist', { name: 'Saved views' })).toBe(tablist());
  });

  it('takes its name from the element aria-labelledby points at', () => {
    render(
      <>
        <h2 id="views-heading">Views</h2>
        <ModernTabs items={ITEMS} aria-labelledby="views-heading" />
      </>,
    );
    expect(screen.getByRole('tablist', { name: 'Views' })).toBe(tablist());
  });

  it('emits both when both are supplied, and aria-labelledby wins the name', () => {
    render(
      <>
        <h2 id="views-heading">Views</h2>
        <ModernTabs items={ITEMS} aria-label="Saved views" aria-labelledby="views-heading" />
      </>,
    );
    expect(tablist()).toHaveAttribute('aria-label', 'Saved views');
    expect(tablist()).toHaveAttribute('aria-labelledby', 'views-heading');
    expect(screen.getByRole('tablist', { name: 'Views' })).toBe(tablist());
  });

  it('puts the attributes on the tablist only, never on the root or the panel', () => {
    const { container } = render(<ModernTabs items={ITEMS} aria-label="Saved views" aria-labelledby="x" />);
    const holders = Array.from(container.querySelectorAll('[aria-label="Saved views"], [aria-labelledby="x"]'));
    expect(holders).toEqual([tablist()]);
    const root = container.querySelector('[data-part="root"]');
    const panel = screen.getByRole('tabpanel');
    for (const element of [root, panel]) {
      expect(element).not.toHaveAttribute('aria-label');
      expect(element?.getAttribute('aria-labelledby')).not.toBe('x');
    }
  });

  it.each([
    ['absent', {}],
    ['empty strings', { 'aria-label': '', 'aria-labelledby': '' }],
  ])('forwards nothing when the props are %s', (_case, props) => {
    render(<ModernTabs items={ITEMS} {...props} />);
    expect(tablist()).not.toHaveAttribute('aria-label');
    expect(tablist()).not.toHaveAttribute('aria-labelledby');
  });

  it('names the tablist with the caller-resolved string under a non-English locale (Tabs adds no default)', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernTabs items={ITEMS} aria-label="Vistas guardadas" />
      </I18nProvider>,
    );
    expect(screen.getByRole('tablist', { name: 'Vistas guardadas' })).toBe(tablist());
  });

  it('types both members on TabsProps as optional strings', () => {
    expectTypeOf<TabsProps['aria-label']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<TabsProps['aria-labelledby']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<TabsProps>().toHaveProperty('aria-label');
    expectTypeOf<TabsProps>().toHaveProperty('aria-labelledby');
  });
});
