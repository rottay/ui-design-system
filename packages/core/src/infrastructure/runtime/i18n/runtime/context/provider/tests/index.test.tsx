/**
 * I18nProvider contract: resolution determinism, configured-fallback
 * authority, direction, and server-rendered `lang`/`dir`.
 */

import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
} from '@/foundation/i18n/kernel/contracts';
import {
  I18nProvider,
  useDirection,
  useI18nContext,
  useOptionalDirection,
  useTranslation,
} from '@/infrastructure/runtime/i18n';

/**
 * A key the mandatory locales carry and both partial catalogs currently omit.
 * Its only purpose is to make the configured-fallback tier observable.
 */
const FALLBACK_PROBE = 'components.pagination.navigation';
const FALLBACK_PROBE_EN = 'Pagination';
const FALLBACK_PROBE_ES = 'Paginación';

describe('I18nProvider — locale and direction', () => {
  it('renders English left-to-right', async () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });

    expect(result.current.locale).toBe('en');
    expect(result.current.direction).toBe('ltr');
    expect(result.current.config.code).toBe('en');
    expect(result.current.t('common.yes')).toBe('Yes');
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  it('renders Spanish left-to-right', async () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => <I18nProvider locale="es">{children}</I18nProvider>,
    });

    expect(result.current.locale).toBe('es');
    expect(result.current.direction).toBe('ltr');
    expect(result.current.t('common.yes')).toBe('Sí');
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('es');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  it('renders Arabic right-to-left with real Arabic copy', async () => {
    const { result } = renderHook(() => useTranslation('components'), {
      wrapper: ({ children }) => <I18nProvider locale="ar">{children}</I18nProvider>,
    });

    expect(result.current.t('button.save')).toBe('حفظ');
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  it('exposes direction through useDirection instead of the DOM', () => {
    const rtl = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <I18nProvider locale="ar">{children}</I18nProvider>,
    });
    expect(rtl.result.current).toBe('rtl');

    const ltr = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <I18nProvider locale="fr">{children}</I18nProvider>,
    });
    expect(ltr.result.current).toBe('ltr');
  });

  it('useOptionalDirection answers ltr without a provider instead of throwing', () => {
    const { result } = renderHook(() => useOptionalDirection());
    expect(result.current).toBe('ltr');
  });
});

describe('I18nProvider — configured fallback authority', () => {
  it('honours the CONFIGURED fallback locale, not English', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="fr" fallbackLocale="es">
          {children}
        </I18nProvider>
      ),
    });

    expect(result.current.fallbackLocale).toBe('es');
    // French has no copy for this key; the configured fallback is Spanish, so
    // Spanish is what must appear.
    expect(result.current.t(FALLBACK_PROBE)).toBe(FALLBACK_PROBE_ES);
    expect(result.current.t(FALLBACK_PROBE)).not.toBe(FALLBACK_PROBE_EN);
  });

  it('renders the English floor rather than a raw key when the configured chain misses', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="fr" fallbackLocale="pt">
          {children}
        </I18nProvider>
      ),
    });

    // Neither French nor the configured Portuguese fallback carries the key.
    // What a reader used to get here was the literal string
    // "components.calendar.navNextMonth" painted into the UI. English copy is
    // the correct floor: it serves the reader without overruling `pt`, which
    // was already consulted and had nothing.
    expect(result.current.t(FALLBACK_PROBE)).toBe(FALLBACK_PROBE_EN);
    expect(result.current.t(FALLBACK_PROBE)).not.toBe(FALLBACK_PROBE);
    // A caller-owned floor still wins over the English one: `tOr` is an
    // explicit local decision and outranks the system default.
    expect(result.current.tOr(FALLBACK_PROBE, 'Suivant')).toBe('Suivant');
  });

  it('defaults to the single declared locale rather than a second implicit language', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => (
        <I18nProvider locale={DEFAULT_LOCALE}>{children}</I18nProvider>
      ),
    });

    expect(result.current.fallbackLocale).toBe(DEFAULT_FALLBACK_LOCALE);
    expect(DEFAULT_FALLBACK_LOCALE).toBe(DEFAULT_LOCALE);
  });

  it('skips the fallback tier when it is the active locale', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => (
        <I18nProvider locale="es" fallbackLocale="es">
          {children}
        </I18nProvider>
      ),
    });

    expect(result.current.t('common.yes')).toBe('Sí');
    expect(result.current.t('components.does.not.exist')).toBe('components.does.not.exist');
  });
});

describe('I18nProvider — missing keys', () => {
  it('t() echoes the raw key and tOr() returns the caller floor', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });

    expect(result.current.t('components.no.such.key')).toBe('components.no.such.key');
    expect(result.current.tOr('components.no.such.key', 'Floor')).toBe('Floor');
  });

  it('interpolates the floor with the same params as catalog copy', () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });

    expect(result.current.tOr('components.no.such.key', '{count} stars', { count: 3 }))
      .toBe('3 stars');
  });

  it('does NOT treat an empty translation as a miss', () => {
    // es/ar deliberately land `listToolbar.densitySuffix` as "" — their density
    // adjectives already agree with the noun. A floor helper written as
    // `if (!resolved) return fallback` silently replaces that decision with
    // English; `tOr` keys off the resolution tier instead of truthiness.
    const { result } = renderHook(() => useTranslation('components'), {
      wrapper: ({ children }) => <I18nProvider locale="es">{children}</I18nProvider>,
    });

    expect(result.current.tOr('listToolbar.densitySuffix', 'density')).toBe('');
  });

  it('resolves tenant overrides ahead of every locale tier', () => {
    const { result } = renderHook(() => useTranslation('components'), {
      wrapper: ({ children }) => (
        <I18nProvider
          locale="en"
          customTranslations={{
            components: { pagination: { page: 'Tenant {current}/{total}' } },
          }}
        >
          {children}
        </I18nProvider>
      ),
    });

    expect(result.current.t('pagination.page', { current: 2, total: 9 })).toBe('Tenant 2/9');
    expect(result.current.tOr('pagination.page', 'Floor', { current: 2, total: 9 }))
      .toBe('Tenant 2/9');
  });
});

describe('I18nProvider — server rendering', () => {
  it('emits lang and dir in the SERVER html for Arabic', () => {
    const html = renderToString(
      <I18nProvider locale="ar" directionScope="element">
        <span>محتوى</span>
      </I18nProvider>
    );

    // The regression this closes: without a server-rendered direction owner the
    // first paint is LTR and flips after hydration.
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('محتوى');
  });

  it('emits ltr in the SERVER html for a Latin locale', () => {
    const html = renderToString(
      <I18nProvider locale="en" directionScope="element">
        <span>content</span>
      </I18nProvider>
    );

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('lang="en"');
  });

  it('hydrates the direction scope without a mismatch', async () => {
    const element = (
      <I18nProvider locale="ar" directionScope="element">
        <span data-part="probe">محتوى</span>
      </I18nProvider>
    );
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.getAttribute('dir')).toBe('rtl');
    // Layout-transparent: the scope carries direction without introducing a box.
    expect(scope.style.display).toBe('contents');

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(container.querySelector('[data-part="probe"]')).not.toBeNull();
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration'))
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
    consoleError.mockRestore();
  });

  it('renders no element of its own by default', () => {
    // The default keeps the DS's DOM contract: direction reaches components
    // through context, and `<html>` — which the application owns — carries the
    // document-level pair.
    const { container } = render(
      <I18nProvider locale="ar">
        <span data-part="probe">محتوى</span>
      </I18nProvider>
    );

    expect(container.firstElementChild?.getAttribute('data-part')).toBe('probe');
  });
});

describe('I18nProvider — long content', () => {
  it('interpolates long copy without truncation', () => {
    const long = 'ا'.repeat(2000);
    const { result } = renderHook(() => useTranslation('components'), {
      wrapper: ({ children }) => (
        <I18nProvider
          locale="ar"
          customTranslations={{ components: { pagination: { page: '{current}' } } }}
        >
          {children}
        </I18nProvider>
      ),
    });

    const rendered = result.current.t('pagination.page', { current: long });
    expect(rendered).toHaveLength(2000);
    expect(rendered).toBe(long);
  });

  it('renders long right-to-left copy into the DOM intact', () => {
    const long = `${'مرحبا '.repeat(400)}`.trim();
    const { container } = render(
      <I18nProvider locale="ar" directionScope="element">
        <span data-part="long">{long}</span>
      </I18nProvider>
    );

    expect(container.querySelector('[data-part="long"]')?.textContent).toBe(long);
    expect(container.firstElementChild?.getAttribute('dir')).toBe('rtl');
  });
});
