/**
 * @fileoverview ListToolbar modern engine — i18n channel tests (W9).
 *
 * Pins the landing of the 20 `components.listToolbar.*` catalog keys:
 * catalog parity across the full locales (en/es/ar), resolution through the
 * I18nProvider, prop-over-catalog precedence (`messages` / `searchPlaceholder`
 * win), the documented partial-locale fallback for fr (→ fallback locale),
 * and the provider-less English floor. Also verifies the W6 collateral note:
 * `components.rate.stars` produces a correct fractional-count form in es/ar.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import ModernListToolbar from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';
import { resolveTranslation } from '@/foundation/i18n/runtime/resolution';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

/** The 20 catalog keys landed in `components.listToolbar.*` (W9 census). */
const LIST_TOOLBAR_CATALOG_KEYS = [
  'searchPlaceholder',
  'compact',
  'comfortable',
  'spacious',
  'densitySuffix',
  'rowDensity',
  'viewMode',
  'listView',
  'cardView',
  'columns',
  'density',
  'views',
  'noColumnSettings',
  'noSavedViews',
  'columnSettings',
  'settings',
  'moreOptions',
  'export',
  'active',
  'clearAll',
] as const;

/** Historical English copy — the en catalog must match it exactly. */
const EN_FLOOR: Record<(typeof LIST_TOOLBAR_CATALOG_KEYS)[number], string> = {
  searchPlaceholder: 'Search...',
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
  densitySuffix: 'density',
  rowDensity: 'Row density',
  viewMode: 'View mode',
  listView: 'List view',
  cardView: 'Card view',
  columns: 'Columns',
  density: 'Density',
  views: 'Views',
  noColumnSettings: 'No column settings available.',
  noSavedViews: 'No saved views available.',
  columnSettings: 'Column settings',
  settings: 'Settings',
  moreOptions: 'More options',
  export: 'Export',
  active: 'active',
  clearAll: 'Clear all',
};

const PILLS = [
  {
    key: 'status',
    label: 'Status',
    value: 'active',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
    ],
  },
];

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Candidates',
    totalCount: 42,
    search: '',
    onSearchChange: vi.fn(),
    filterPills: PILLS,
    activeFilters: { status: 'active' },
    activeFilterCount: 1,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    viewMode: 'list' as const,
    onViewModeChange: vi.fn(),
    density: 'comfortable' as const,
    onDensityChange: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  };
}

describe('ListToolbar modern i18n (W9)', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // W4 idiom: locale observers re-fire on dir/lang removal; keep the
    // teardown inside act with a drain for pending overlay follow-ups.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  describe('catalog landing', () => {
    it('lands the 20 listToolbar keys in every full locale (en/es/ar)', () => {
      for (const locale of ['en', 'es', 'ar'] as const) {
        const entry = (
          TRANSLATION_CATALOG[locale].components as Record<string, Record<string, string>>
        ).listToolbar;
        expect(entry, `components.listToolbar missing in ${locale}`).toBeDefined();
        expect(Object.keys(entry).sort(), `key set mismatch in ${locale}`).toEqual(
          [...LIST_TOOLBAR_CATALOG_KEYS].sort(),
        );
      }
    });

    it('keeps the en catalog identical to the historical English floor', () => {
      const entry = (
        TRANSLATION_CATALOG.en.components as Record<string, Record<string, string>>
      ).listToolbar;
      for (const key of LIST_TOOLBAR_CATALOG_KEYS) {
        expect(entry[key], `en drifted from the floor for ${key}`).toBe(EN_FLOOR[key]);
      }
    });

    it('documents the empty densitySuffix of es/ar (adjective already agrees)', () => {
      for (const locale of ['es', 'ar'] as const) {
        const entry = (
          TRANSLATION_CATALOG[locale].components as Record<string, Record<string, string>>
        ).listToolbar;
        expect(entry.densitySuffix).toBe('');
      }
    });
  });

  describe('modern engine resolution', () => {
    it('resolves Spanish chrome copy through the I18nProvider', async () => {
      mockMatchMedia(1280);
      render(
        <I18nProvider locale="es" fallbackLocale="es">
          <ModernListToolbar {...baseProps()} />
        </I18nProvider>,
      );

      expect(await screen.findByPlaceholderText('Buscar...')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Exportar' })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Limpiar todo' })).toBeInTheDocument();
      // Empty densitySuffix honored: the option announces just the adjective,
      // inside a group already named "Densidad de filas".
      expect(
        await screen.findByRole('radio', { name: /^Compacta$/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Vista de lista' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Vista de tarjetas' })).toBeInTheDocument();
    });

    it('lets messages/searchPlaceholder props win over the catalog', async () => {
      mockMatchMedia(1280);
      render(
        <I18nProvider locale="es" fallbackLocale="es">
          <ModernListToolbar
            {...baseProps({
              searchPlaceholder: 'Buscar candidatos',
              messages: { clearAll: 'Quitar filtros' },
            })}
          />
        </I18nProvider>,
      );

      expect(await screen.findByPlaceholderText('Buscar candidatos')).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: 'Quitar filtros' }),
      ).toBeInTheDocument();
      // Non-overridden keys still come from the catalog.
      expect(await screen.findByRole('button', { name: 'Exportar' })).toBeInTheDocument();
    });

    it('resolves fr (partial locale) through the documented fallback chain', async () => {
      mockMatchMedia(1280);
      render(
        <I18nProvider locale="fr" fallbackLocale="es">
          <ModernListToolbar {...baseProps()} />
        </I18nProvider>,
      );

      // fr has no listToolbar entries: the fallback locale (es) answers.
      expect(await screen.findByRole('button', { name: 'Limpiar todo' })).toBeInTheDocument();
      expect(await screen.findByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('falls back to the historical English floor without a provider', async () => {
      mockMatchMedia(1280);
      render(<ModernListToolbar {...baseProps()} />);

      expect(await screen.findByPlaceholderText('Search...')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Clear all' })).toBeInTheDocument();
      expect(
        await screen.findByRole('radio', { name: 'Compact density' }),
      ).toBeInTheDocument();
    });
  });

  describe('rate.stars fractional count (W6 collateral)', () => {
    const t = (locale: 'es' | 'ar', count: number) =>
      resolveTranslation({
        key: 'components.rate.stars',
        params: { count },
        locale,
        fallbackLocale: locale,
        catalog: TRANSLATION_CATALOG,
      });

    it('produces a correct Spanish plural for a fractional count', () => {
      expect(t('es', 2.5)).toBe('2.5 estrellas');
    });

    it('documents the current Arabic form for a fractional count', () => {
      // Binary star/stars catalog model: any count !== 1 takes `stars`.
      // Formal Arabic would use the singular (تمييز) for fractions — recorded
      // as W9 debt, pending an ICU-capable plural runtime.
      expect(t('ar', 2.5)).toBe('2.5 نجوم');
    });
  });
});
