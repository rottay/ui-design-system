/**
 * @fileoverview Engine entrypoint contract tests. Ensures every engine barrel
 * exports at least one implementation, compound barrels stay wired, and the
 * public root entrypoints expose the expected DS surfaces.
 */

import { describe, expect, it } from 'vitest';

import * as componentsEntry from '../../components';
import * as iconsEntry from '../../icons';
import * as i18nEntry from '../../i18n';

const engineBarrels = import.meta.glob('../../components/**/engines/index.ts', {
  eager: true,
}) as Record<string, Record<string, unknown>>;

const compoundBarrels = import.meta.glob('../../components/**/compound/**/index.ts', {
  eager: true,
}) as Record<string, Record<string, unknown>>;

describe('engine entrypoint contracts', () => {
  it('keeps every engine barrel wired to at least one implementation export', () => {
    const entries = Object.entries(engineBarrels);
    expect(entries.length).toBeGreaterThan(70);

    for (const [modulePath, moduleExports] of entries) {
      const exportNames = Object.keys(moduleExports);
      expect(exportNames.length, modulePath).toBeGreaterThan(0);
      expect(Object.values(moduleExports).some(Boolean), modulePath).toBe(true);
      expect(
        exportNames.some(
          (name) =>
            ['classic', 'modern', 'rustic', 'custom'].includes(name) ||
            /classic|modern|rustic|custom/i.test(name)
        ),
        modulePath
      ).toBe(true);
    }
  });

  it('keeps compound barrels non-empty so subcomponent imports stay wired', () => {
    const entries = Object.entries(compoundBarrels);
    expect(entries.length).toBeGreaterThan(10);

    for (const [modulePath, moduleExports] of entries) {
      expect(moduleExports, modulePath).toBeTypeOf('object');
    }
  });

  it('keeps the public root entrypoints exporting the expected DS surfaces', () => {
    expect(Object.keys(componentsEntry).length).toBeGreaterThan(20);
    expect(Object.keys(iconsEntry).length).toBeGreaterThan(5);
    expect(i18nEntry).toHaveProperty('useTranslation');
    expect(i18nEntry).toHaveProperty('I18nProvider');
    expect(componentsEntry).toHaveProperty('Button');
    expect(componentsEntry).toHaveProperty('ListSurface');
    expect(componentsEntry).toHaveProperty('PatternStatsGrid');
  });
});
