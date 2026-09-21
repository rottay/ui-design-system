/**
 * The formatter reads the PROVIDER's locale, not the runtime's.
 *
 * The regression this pins is the reason the hook exists: a component that
 * formats through `toLocaleDateString()` renders the server's language inside
 * a page the catalog is rendering in another one, and nothing in the type
 * system notices because both sides return a `string`.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { useFormatter, useOptionalFormatter } from '..';

const MARCH_14 = new Date(Date.UTC(2026, 2, 14, 15, 30));

function Probe({ hook = useFormatter }: { hook?: typeof useFormatter }) {
  const format = hook();
  return (
    <>
      <span data-testid="locale">{format.locale}</span>
      <span data-testid="month">{format.date(MARCH_14, { timeZone: 'UTC' })}</span>
      <span data-testid="number">{format.number(1234567.89)}</span>
      <span data-testid="percent">{format.percent(0.42)}</span>
      <span data-testid="currency">{format.currency(1234.5, 'EUR')}</span>
      <span data-testid="list">{format.list(['a', 'b', 'c'])}</span>
      <span data-testid="size">{format.fileSize(1536)}</span>
    </>
  );
}

function readAll(): Record<string, string> {
  return Object.fromEntries(
    ['locale', 'month', 'number', 'percent', 'currency', 'list', 'size'].map((id) => [
      id,
      screen.getByTestId(id).textContent ?? '',
    ]),
  );
}

function mount(locale: string) {
  const view = render(
    <I18nProvider locale={locale as never}>
      <Probe />
    </I18nProvider>,
  );
  const values = readAll();
  view.unmount();
  return values;
}

describe('useFormatter', () => {
  it('formats the month name in the provider locale', () => {
    // `date()` MERGES onto the helper's long-date defaults rather than
    // replacing them, so the assertion is on the whole rendered string.
    expect(mount('en').month).toBe('March 14, 2026');
    expect(mount('es').month).toBe('14 de marzo de 2026');
    expect(mount('fr').month).toBe('14 mars 2026');
  });

  it('separates numbers by the provider locale, not the runtime default', () => {
    expect(mount('en').number).toBe('1,234,567.89');
    expect(mount('es').number).toBe('1.234.567,89');
  });

  it('carries the locale through percent, currency, list and file size', () => {
    const en = mount('en');
    const es = mount('es');

    expect(en.percent).toBe('42%');
    expect(en.currency).toContain('€');
    expect(es.currency).toContain('€');
    expect(en.currency).not.toBe(es.currency);
    expect(en.list).toBe('a, b, and c');
    expect(es.list).toBe('a, b y c');
    expect(en.size).toBe('1.50 KB');
    expect(es.size).toBe('1,50 KB');
  });

  it('reports the same active locale the translation hooks resolve', () => {
    expect(mount('es').locale).toBe('es');
    // Normalized by the provider, so the formatter never sees a region tag.
    expect(mount('es-MX').locale).toBe('es');
    expect(mount('es-MX').month).toBe('14 de marzo de 2026');
  });

  it('formats a range and a relative time through the provider locale', () => {
    function RangeProbe() {
      const format = useFormatter();
      return (
        <span data-testid="range">
          {format.dateRange(MARCH_14, new Date(Date.UTC(2026, 2, 20)), {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </span>
      );
    }
    const { unmount } = render(
      <I18nProvider locale="es">
        <RangeProbe />
      </I18nProvider>,
    );
    expect(screen.getByTestId('range').textContent).toMatch(/mar/i);
    unmount();
  });
});

describe('useOptionalFormatter', () => {
  it('formats in the default locale with no provider mounted', () => {
    const { unmount } = render(<Probe hook={useOptionalFormatter} />);
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('month').textContent).toBe('March 14, 2026');
    unmount();
  });

  it('follows the provider when one is present', () => {
    const { unmount } = render(
      <I18nProvider locale="fr">
        <Probe hook={useOptionalFormatter} />
      </I18nProvider>,
    );
    expect(screen.getByTestId('month').textContent).toBe('14 mars 2026');
    unmount();
  });
});
