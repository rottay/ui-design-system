import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernFilterPanel from '../forms/filter-panel/engines/modern';
import ModernLocaleSwitcher from '../navigation/locale-switcher/engines/modern';
import type { FilterDef } from '../forms/filter-panel/contracts';

/** Locks the full governed tOr() key set: every key exists in every locale,
    placeholder sets match English, and no key silently reuses the English */

const LOCALES = ['en', 'es', 'fr', 'pt', 'ar'] as const;

/** Values that are punctuation plus placeholders only are identical in every
    locale by design and are exempt from the "must differ from English" rule. */
const PLACEHOLDER_ONLY = new Set([
  'notificationCenter.markItemAsRead',
  'notificationCenter.dismissItem',
]);

const GOVERNED_KEYS = [
  'activityLog.diff.from',
  'activityLog.diff.to',
  'activityLog.diff.empty',
  'activityLog.diff.opaque',
  'activityLog.diff.listMore',
  'activityLog.diff.itemCount',
  'activityLog.diff.valueCount',
  'activityLog.diff.moreChanges',
  'pricingTable.savings',
  'pricingTable.comparison',
  'comment_thread.hidden_reply',
  'comment_thread.hidden_replies',
  'liveFeed.feedLabel',
  'liveFeed.newItemsAnnouncement',
  'notificationCenter.markItemAsRead',
  'notificationCenter.dismissItem',
  'notificationCenter.moreNotShown',
  'detailPanel.loading',
  'fileManager.listLabel',
  'fileManager.selectItem',
  'filter_panel.range_start',
  'filter_panel.range_end',
  'filter_panel.active_count',
  'locale_switcher.panel_aria',
] as const;

function catalog(locale: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        `../../../foundation/i18n/runtime/catalog/translations/locales/${locale}/components.json`,
      ),
      'utf8',
    ),
  );
}

function lookup(root: Record<string, unknown>, dotted: string): string | undefined {
  let cur: unknown = root;
  for (const part of dotted.split('.')) {
    if (typeof cur !== 'object' || cur === null || !(part in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

const placeholders = (s: string) => [...new Set(s.match(/\{(\w+)\}/g) ?? [])].sort();

describe('modern-rescue governed catalog keys', () => {
  const catalogs = Object.fromEntries(LOCALES.map((l) => [l, catalog(l)]));

  it('declares every governed key in all five locales', () => {
    const missing: string[] = [];
    for (const locale of LOCALES) {
      for (const key of GOVERNED_KEYS) {
        if (lookup(catalogs[locale], key) === undefined) missing.push(`${locale}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps placeholder sets identical to English for every key', () => {
    for (const locale of LOCALES) {
      for (const key of GOVERNED_KEYS) {
        expect(placeholders(lookup(catalogs[locale], key) as string)).toEqual(
          placeholders(lookup(catalogs.en, key) as string),
        );
      }
    }
  });

  it('never reuses the English string except for placeholder-only templates', () => {
    const reused: string[] = [];
    for (const locale of ['es', 'fr', 'pt', 'ar'] as const) {
      for (const key of GOVERNED_KEYS) {
        if (PLACEHOLDER_ONLY.has(key)) continue;
        if (lookup(catalogs[locale], key) === lookup(catalogs.en, key)) reused.push(`${locale}:${key}`);
      }
    }
    expect(reused).toEqual([]);
  });
});

// range_start/range_end name the two DATE-RANGE bounds; number-range uses
// min/max instead, so the type here decides whether the keys render at all.
const RANGE_FILTERS: FilterDef[] = [
  { key: 'window', label: 'Interview window', type: 'date-range' },
];

describe('governed keys reach the DOM under a translated ground', () => {
  it('names both range bounds in Spanish, not the English floor', async () => {
    const es = catalogs_es();
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernFilterPanel filters={RANGE_FILTERS} values={{}} onChange={vi.fn()} />
      </I18nProvider>,
    );

    expect(await screen.findByLabelText(new RegExp(es.rangeStart))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(es.rangeEnd))).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('Active filters');
  });

  it('names the locale panel in Arabic, not the English floor', async () => {
    render(
      <I18nProvider locale="ar" fallbackLocale="ar">
        <ModernLocaleSwitcher locale="en" onChange={vi.fn()} />
      </I18nProvider>,
    );

    const trigger = await screen.findByTestId('locale-switcher-trigger');
    trigger.click();
    const panel = await screen.findByTestId('locale-switcher-menu');
    expect(panel.getAttribute('aria-label')).toBe(
      lookup(catalog('ar'), 'locale_switcher.panel_aria'),
    );
    expect(panel.getAttribute('aria-label')).not.toBe('Languages');
  });
});

function catalogs_es() {
  const es = catalog('es');
  return {
    rangeStart: lookup(es, 'filter_panel.range_start') as string,
    rangeEnd: lookup(es, 'filter_panel.range_end') as string,
  };
}
