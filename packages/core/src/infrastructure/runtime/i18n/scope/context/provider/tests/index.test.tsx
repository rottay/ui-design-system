/**
 * I18nProvider contract: resolution determinism, configured-fallback
 * authority, direction, and server-rendered `lang`/`dir`.
 */

import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
} from '@/foundation/i18n/kernel/contracts';
import { outstandingRootClaims } from '@/infrastructure/runtime/foundation/root-attributes';
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

/**
 * `<html lang>` / `<html dir>` are the APPLICATION's channels. The provider
 * borrows them through the shared claim registry and hands the exact
 * predecessor back, so these drills assert through `getAttribute` /
 * `hasAttribute` rather than the reflected `.lang` / `.dir` properties: `dir`
 * is an ENUMERATED reflected attribute, so `.dir` lowercases valid values and
 * reads invalid ones as `''`. A claim restores the raw attribute byte for
 * byte, and only the attribute API can observe that.
 *
 * ORDERING LAW, load-bearing: every drill captures the handed-back state,
 * REPAIRS the root, and only then asserts. Asserting first would throw past
 * the repair and leave the leak in place -- and this project runs with
 * `retry: 1`, so the retry would re-baseline the dirty root and pass. Repair
 * first and a real leak fails on both attempts.
 */
describe('I18nProvider — root ownership', () => {
  const HOST_LANG = 'fr-CA';
  const HOST_DIR = 'ltr';

  let predecessor: readonly (readonly [string, string])[] = [];

  /** Reads the pair the way the claim registry stores it: absent is absent. */
  function readPair(): Record<'lang' | 'dir', string | null> {
    const root = document.documentElement;
    return { lang: root.getAttribute('lang'), dir: root.getAttribute('dir') };
  }

  function plantHostRoot(lang: string | null, dir: string | null): void {
    const root = document.documentElement;
    if (lang === null) root.removeAttribute('lang');
    else root.setAttribute('lang', lang);
    if (dir === null) root.removeAttribute('dir');
    else root.setAttribute('dir', dir);
  }

  beforeEach(() => {
    // Whatever the file's earlier drills left behind is this drill's host
    // document; it is restored verbatim afterwards.
    predecessor = Array.from(document.documentElement.attributes).map(
      (attribute) => [attribute.name, attribute.value] as const,
    );
  });

  afterEach(() => {
    const root = document.documentElement;
    const expected = new Map(predecessor);
    for (const name of Array.from(root.attributes).map((attribute) => attribute.name)) {
      if (!expected.has(name)) root.removeAttribute(name);
    }
    for (const [name, value] of predecessor) {
      if (root.getAttribute(name) !== value) root.setAttribute(name, value);
    }
  });

  // D1
  it('hands a planted host predecessor back on unmount', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);

    const view = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));

    view.unmount();
    const handedBack = readPair();
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(handedBack).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
  });

  // D2
  it('returns absent predecessors as absent, and empty ones as empty', async () => {
    plantHostRoot(null, null);

    const absentView = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));
    absentView.unmount();

    const root = document.documentElement;
    const afterAbsent = { lang: root.hasAttribute('lang'), dir: root.hasAttribute('dir') };

    // `dir=""` is a real, present attribute -- restoring it as ABSENT would be
    // a different document. This is the leg a bare `removeAttribute` cleanup
    // gets wrong in the opposite direction from D1.
    plantHostRoot('', '');
    const emptyView = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));
    emptyView.unmount();

    const afterEmpty = {
      present: { lang: root.hasAttribute('lang'), dir: root.hasAttribute('dir') },
      values: readPair(),
    };
    plantHostRoot(null, null);

    expect(afterAbsent).toEqual({ lang: false, dir: false });
    expect(afterEmpty).toEqual({
      present: { lang: true, dir: true },
      values: { lang: '', dir: '' },
    });
  });

  // D3
  it('keeps exactly one live owner per channel across a controlled ar -> en switch', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);
    const root = document.documentElement;

    const view = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));

    view.rerender(
      <I18nProvider locale="en">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'en', dir: 'ltr' }));

    // Two channels, one claim each. A switch that claimed without releasing
    // would read four here and still look correct in the DOM -- until the
    // stack unwound to the wrong value on unmount.
    const claimsWhileMounted = outstandingRootClaims(root);

    view.unmount();
    const handedBack = readPair();
    const claimsAfterUnmount = outstandingRootClaims(root);
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(claimsWhileMounted).toBe(2);
    expect(handedBack).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
    expect(claimsAfterUnmount).toBe(0);
  });

  // D4
  it('reaches the same fixed point under StrictMode double invocation', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);
    const root = document.documentElement;

    const view = render(
      <StrictMode>
        <I18nProvider locale="ar">
          <span>island</span>
        </I18nProvider>
      </StrictMode>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));
    const claimsWhileMounted = outstandingRootClaims(root);

    view.unmount();
    const handedBack = readPair();
    const claimsAfterUnmount = outstandingRootClaims(root);
    plantHostRoot(HOST_LANG, HOST_DIR);

    // StrictMode mounts, tears down, and remounts every effect. Identity-keyed
    // claims make that a fixed point; value-keyed ownership would not.
    expect(claimsWhileMounted).toBe(2);
    expect(handedBack).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
    expect(claimsAfterUnmount).toBe(0);
  });

  // D5
  it('leaves a channel an external writer took over, per channel', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);

    const view = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));

    // An app effect or a devtool takes `lang` while the claim is live. The
    // registry is no longer the owner and must not restore over it. This reads
    // as the opposite of D1 and is deliberate: it is the boundary of the
    // restore contract, not an exception to it. `dir` is untouched and so
    // still returns -- takeover is per channel, never wholesale.
    document.documentElement.setAttribute('lang', 'de');

    view.unmount();
    const handedBack = readPair();
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(handedBack).toEqual({ lang: 'de', dir: HOST_DIR });
  });

  // D6
  it('never touches the host root in element mode', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);
    const root = document.documentElement;

    const view = render(
      <I18nProvider locale="ar" directionScope="element">
        <span data-part="probe">محتوى</span>
      </I18nProvider>
    );
    await view.findByText('محتوى');

    // Asserted WHILE MOUNTED. After unmount, "never claimed" and "claimed then
    // restored" are indistinguishable in the DOM; the live claim count is the
    // only thing that separates them, and it is what this drill exists for.
    const whileMounted = { pair: readPair(), claims: outstandingRootClaims(root) };
    const wrapper = view.container.firstElementChild as HTMLElement;
    const published = {
      lang: wrapper.getAttribute('lang'),
      dir: wrapper.getAttribute('dir'),
    };

    view.unmount();
    const afterUnmount = readPair();
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(whileMounted).toEqual({
      pair: { lang: HOST_LANG, dir: HOST_DIR },
      claims: 0,
    });
    expect(published).toEqual({ lang: 'ar', dir: 'rtl' });
    expect(afterUnmount).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
  });

  // D7
  it('does not publish an island direction onto the document that contains it', async () => {
    // The kernel contract's second use for `element`: an island whose direction
    // DIFFERS from the surrounding document. Writing `<html dir>` here would
    // not merely overreach -- it would flip the containing document to the
    // island's direction, which is the inverse of the feature.
    plantHostRoot('en', 'ltr');

    const view = render(
      <I18nProvider locale="ar" directionScope="element">
        <span data-part="probe">محتوى</span>
      </I18nProvider>
    );
    await view.findByText('محتوى');

    const document_ = readPair();
    const island = (view.container.firstElementChild as HTMLElement).getAttribute('dir');
    view.unmount();
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(document_).toEqual({ lang: 'en', dir: 'ltr' });
    expect(island).toBe('rtl');
  });

  // D8
  it('releases the root pair when directionScope flips to element', async () => {
    plantHostRoot(HOST_LANG, HOST_DIR);
    const root = document.documentElement;

    const view = render(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));

    // The mode is a dependency of the claim, not just of the render. If it
    // were omitted the claims would survive the flip and strand the host root
    // on the island's locale for the life of the document.
    view.rerender(
      <I18nProvider locale="ar" directionScope="element">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(outstandingRootClaims(root)).toBe(0));
    const afterFlip = readPair();

    // Flipping back re-claims: the release is a handover, not a permanent
    // forfeit of the channel.
    view.rerender(
      <I18nProvider locale="ar">
        <span>island</span>
      </I18nProvider>
    );
    await waitFor(() => expect(readPair()).toEqual({ lang: 'ar', dir: 'rtl' }));
    const claimsAfterReclaim = outstandingRootClaims(root);

    view.unmount();
    const handedBack = readPair();
    plantHostRoot(HOST_LANG, HOST_DIR);

    expect(afterFlip).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
    expect(claimsAfterReclaim).toBe(2);
    expect(handedBack).toEqual({ lang: HOST_LANG, dir: HOST_DIR });
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
