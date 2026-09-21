/**
 * The catalog's rendering floor, end to end through the provider.
 *
 * Two promises are pinned here. A key the active locale has no copy for
 * renders ENGLISH, never the dotted key a reader cannot parse. And a locale
 * the catalog does not carry — a region tag, or a language nobody translated —
 * resolves down the configured chain instead of crashing the subtree, which is
 * what it used to do: `LOCALE_CONFIGS['de']` is `undefined`, and the provider
 * read `.code` off it before a single string was looked up.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';
import { resolveTranslationEntry } from '@/foundation/i18n/runtime/resolution';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { I18nProvider, useTranslation } from '@/infrastructure/runtime/i18n';

function flatten(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix];
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  );
}

/** Keys English has copy for and `locale` does not — the floor's real corpus. */
function floorCorpus(locale: SupportedLocale): string[] {
  const english = new Set(flatten(TRANSLATION_CATALOG.en.components));
  const translated = new Set(flatten(TRANSLATION_CATALOG[locale].components));
  return [...english].filter((key) => !translated.has(key)).sort();
}

const FR_FLOOR_KEYS = floorCorpus('fr');

function Probe({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation('components');
  return <span data-testid="out">{t(translationKey)}</span>;
}

function renderKey(locale: string, translationKey: string, fallbackLocale?: string) {
  const view = render(
    <I18nProvider locale={locale as never} fallbackLocale={fallbackLocale as never}>
      <Probe translationKey={translationKey} />
    </I18nProvider>,
  );
  const text = screen.getByTestId('out').textContent ?? '';
  view.unmount();
  return text;
}

describe('English floor', () => {
  it('has a real corpus to rescue', () => {
    // Derived, not pinned to a key that could be translated tomorrow. If the
    // French catalog ever reaches parity this assertion is the notice to point
    // the floor test at another locale rather than to delete it.
    expect(FR_FLOOR_KEYS.length).toBeGreaterThanOrEqual(12);
  });

  it('renders the English copy, never the raw key', () => {
    for (const key of FR_FLOOR_KEYS.slice(0, 12)) {
      const rendered = renderKey('fr', key);
      const english = resolveTranslationEntry({
        key: `components.${key}`,
        locale: 'en',
        fallbackLocale: 'en',
        catalog: TRANSLATION_CATALOG,
      });

      expect(rendered, key).toBe(english.value);
      expect(rendered, key).not.toBe(key);
      expect(rendered, key).not.toMatch(/^[a-z][\w]*(\.[\w]+)+$/);
    }
  });

  it('is consulted only after the CONFIGURED fallback has its turn', () => {
    // Spanish is complete where French is not, so an app declaring
    // fallbackLocale="es" gets Spanish here — its own policy, not the floor.
    const key = FR_FLOOR_KEYS[0];
    const viaSpanish = renderKey('fr', key, 'es');
    const viaFloor = renderKey('fr', key, 'fr');

    expect(viaSpanish).toBe(
      resolveTranslationEntry({
        key: `components.${key}`,
        locale: 'es',
        fallbackLocale: 'es',
        catalog: TRANSLATION_CATALOG,
      }).value,
    );
    expect(viaFloor).toBe(
      resolveTranslationEntry({
        key: `components.${key}`,
        locale: 'en',
        fallbackLocale: 'en',
        catalog: TRANSLATION_CATALOG,
      }).value,
    );
    expect(viaSpanish).not.toBe(viaFloor);
  });
});

describe('locale normalization', () => {
  it('resolves a region tag to its base language', () => {
    expect(renderKey('es-MX', 'pagination.next')).toBe(
      renderKey('es', 'pagination.next'),
    );
  });

  it('falls back down the configured chain for a locale the catalog lacks', () => {
    expect(renderKey('de', 'pagination.next', 'es')).toBe(
      renderKey('es', 'pagination.next'),
    );
    expect(renderKey('de', 'pagination.next')).toBe(
      renderKey('en', 'pagination.next'),
    );
  });

  it('publishes the resolved locale onto the document, not the requested one', () => {
    const view = render(
      <I18nProvider locale={'ar-SA' as never}>
        <Probe translationKey="pagination.next" />
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    view.unmount();
  });
});
