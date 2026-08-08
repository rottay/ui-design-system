import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernActivityLog from '../engines/modern';
import type { ActivityLogProps } from '../contracts';

// Locks the activityLog.diff.* catalog contract: keys exist in every locale,
// carry the same interpolation, and render instead of the English floor.

const LOCALES = ['en', 'es', 'fr', 'pt', 'ar'] as const;
const DIFF_KEYS = [
  'from',
  'to',
  'empty',
  'opaque',
  'listMore',
  'itemCount',
  'valueCount',
  'moreChanges',
] as const;
const PARAMETRIC = new Set(['listMore', 'itemCount', 'valueCount', 'moreChanges']);

function catalog(locale: string): Record<string, string> {
  const path = resolve(
    __dirname,
    `../../../../../foundation/i18n/runtime/catalog/translations/locales/${locale}/components.json`,
  );
  return JSON.parse(readFileSync(path, 'utf8')).activityLog.diff;
}

function buildProps(diff: Record<string, { from: unknown; to: unknown }>): ActivityLogProps {
  return {
    activities: [
      {
        id: 'a1',
        user: { name: 'Alice' },
        action: 'updated',
        timestamp: '2026-05-18T14:22:00.000Z',
        diff,
      },
    ],
  } as ActivityLogProps;
}

describe('ActivityLog diff copy is catalogued in every locale', () => {
  it('declares all eight keys in all five catalogs', () => {
    for (const locale of LOCALES) {
      const entries = catalog(locale);
      expect(Object.keys(entries).sort()).toEqual([...DIFF_KEYS].sort());
    }
  });

  it('keeps interpolation identical across locales', () => {
    for (const locale of LOCALES) {
      const entries = catalog(locale);
      for (const key of DIFF_KEYS) {
        // A parametric floor that loses {count} prints a bare number or drops
        // it entirely; a non-parametric one that gains it prints a raw token.
        expect(entries[key].includes('{count}')).toBe(PARAMETRIC.has(key));
        expect(entries[key]).not.toMatch(/\{(?!count\})\w+\}/);
      }
    }
  });

  it('never reuses the English string for a translated locale', () => {
    const en = catalog('en');
    for (const locale of ['es', 'fr', 'pt', 'ar'] as const) {
      const entries = catalog(locale);
      for (const key of DIFF_KEYS) {
        expect(entries[key]).not.toBe(en[key]);
      }
    }
  });
});

describe('ActivityLog diff copy reaches the DOM under a translated ground', () => {
  it('renders the Spanish absent-value label, not the English floor', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernActivityLog {...buildProps({ owner: { from: undefined, to: 'Ana' } })} />
      </I18nProvider>,
    );

    const cell = await screen.findByText(catalog('es').empty);
    expect(cell).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(catalog('en').empty);
  });

  it('renders the Arabic overflow trace with its count interpolated', async () => {
    const from: Record<string, number> = {};
    const to: Record<string, number> = {};
    for (let i = 0; i < 9; i += 1) {
      from[`k${i}`] = i;
      to[`k${i}`] = i + 1;
    }

    render(
      <I18nProvider locale="ar" fallbackLocale="ar">
        <ModernActivityLog {...buildProps({ config: { from, to } })} />
      </I18nProvider>,
    );

    const expected = catalog('ar').moreChanges.replace('{count}', '3');
    const trace = await screen.findByText(expected);
    expect(trace).toBeInTheDocument();
    expect(trace.textContent).not.toContain('{count}');
    expect(document.body.textContent).not.toContain('more changes');
  });
});
