/**
 * @fileoverview Tabs modern engine — i18n channel tests (R2+R3 batch B).
 *
 * Pins the landing of the `components.tabs.*` catalog keys (en/es/ar full
 * locales), resolution through the I18nProvider, `accessibilityLabels`
 * precedence over the catalog, and the provider-less English floor for the
 * overflow controls and the loading announcement.
 */

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import ModernTabs from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';

const TABS_CATALOG_KEYS = ['previous', 'next', 'more', 'loading'] as const;

const EN_FLOOR: Record<(typeof TABS_CATALOG_KEYS)[number], string> = {
  previous: 'Previous tabs',
  next: 'Next tabs',
  more: 'More tabs',
  loading: 'Loading',
};

const ITEMS = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'intel', label: 'Inteligencia', loading: true, children: 'AI content' },
];

describe('Tabs modern i18n (R2+R3)', () => {
  afterEach(async () => {
    // W4 idiom: locale observers re-fire on dir/lang removal; keep the
    // teardown inside act with a drain for pending follow-ups.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  describe('catalog landing', () => {
    it('lands the tabs keys in every full locale (en/es/ar)', () => {
      for (const locale of ['en', 'es', 'ar'] as const) {
        const entry = (
          TRANSLATION_CATALOG[locale].components as Record<string, Record<string, string>>
        ).tabs;
        expect(entry, `components.tabs missing in ${locale}`).toBeDefined();
        expect(Object.keys(entry).sort(), `key set mismatch in ${locale}`).toEqual(
          [...TABS_CATALOG_KEYS].sort()
        );
      }
    });

    it('keeps the en catalog identical to the historical English floor', () => {
      const entry = (
        TRANSLATION_CATALOG.en.components as Record<string, Record<string, string>>
      ).tabs;
      for (const key of TABS_CATALOG_KEYS) {
        expect(entry[key], `en drifted from the floor for ${key}`).toBe(EN_FLOOR[key]);
      }
    });
  });

  describe('modern engine resolution', () => {
    it('falls back to the English floor without a provider', () => {
      render(<ModernTabs items={ITEMS} />);

      expect(screen.getByRole('status')).toHaveTextContent('Inteligencia Loading');
    });

    it('resolves Spanish chrome copy through the I18nProvider', () => {
      render(
        <I18nProvider locale="es" fallbackLocale="es">
          <ModernTabs items={ITEMS} />
        </I18nProvider>
      );

      expect(screen.getByRole('status')).toHaveTextContent('Inteligencia Cargando');
    });

    it('resolves Arabic chrome copy through the I18nProvider', () => {
      render(
        <I18nProvider locale="ar" fallbackLocale="ar">
          <ModernTabs items={ITEMS} />
        </I18nProvider>
      );

      expect(screen.getByRole('status')).toHaveTextContent('قيد التحميل');
    });

    it('keeps accessibilityLabels precedence over the catalog', () => {
      render(
        <I18nProvider locale="es" fallbackLocale="es">
          <ModernTabs items={ITEMS} accessibilityLabels={{ loading: 'actualizando' }} />
        </I18nProvider>
      );

      expect(screen.getByRole('status')).toHaveTextContent('Inteligencia actualizando');
    });
  });
});
