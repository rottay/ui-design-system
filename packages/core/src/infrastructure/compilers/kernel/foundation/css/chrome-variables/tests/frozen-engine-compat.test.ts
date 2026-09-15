import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { BrandChrome } from '@/foundation/contracts/composition/tenants/themes';
import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import { FROZEN_ENGINE_COMPAT_CHANNELS, chromeToVariables } from '..';

const rottayFlatTheme = firstPartyFixture('rottay');

const SRC = resolve(process.cwd(), 'src');
const FROZEN_ROOTS = [
  'foundation/tokens/css/runtime/engines/rustic',
  'foundation/tokens/css/runtime/engines/classic',
  'components',
];

/** The pre-cut prefix of each family this cut renamed, and the namespace it answers to now. */
const CUT_RENAMES: ReadonlyArray<readonly [legacy: string, current: string]> = [
  ['--ds-autocomplete-', '--ds-auto-complete-'],
  ['--ds-datepicker-', '--ds-date-picker-'],
  ['--ds-message-', '--ds-notifier-message-'],
  ['--ds-notification-', '--ds-notifier-notification-'],
  ['--ds-timepicker-', '--ds-time-picker-'],
];

function frozenSources(dir: string, inComponents: boolean): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === 'node_modules') continue;
      files.push(...frozenSources(path, inComponents));
    } else if (inComponents ? /\/engines\/(rustic|classic)\/.*\.tsx?$/.test(path) : entry.name.endsWith('.css')) {
      files.push(path);
    }
  }
  return files;
}

/** Every `--ds-*` name a frozen Rustic or Classic skin or engine reads, fallback positions included. */
function frozenReads(): Set<string> {
  const reads = new Set<string>();
  for (const root of FROZEN_ROOTS) {
    for (const file of frozenSources(resolve(SRC, root), root === 'components')) {
      const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of text.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) reads.add(match[1]);
    }
  }
  return reads;
}

/** Every channel the emitter writes for the renamed families when each of their leaves is authored. */
function emittedFamilyChannels(): Set<string> {
  const everyLeaf = new Proxy({}, { get: (_target, key) => (typeof key === 'string' ? '#010203' : undefined) });
  const chrome = {
    controls: { autocomplete: everyLeaf, datePicker: everyLeaf, timePicker: everyLeaf },
    message: { bg: '#010203', closeColor: '#010203', closeColorHover: '#010203', shadow: '0 0 0 1px #010203' },
    notification: { bg: '#010203', shadow: '0 0 0 1px #010203', titleColor: '#010203' },
    surface: { popoverShadow: '0 0 0 1px #010203' },
  } as unknown as BrandChrome;
  return new Set(Object.keys(chromeToVariables(chrome)));
}

describe('frozen engine compatibility channels', () => {
  it('restates an authored family channel under its pre-cut name, and nothing unauthored', () => {
    const vars = chromeToVariables({ controls: { autocomplete: { bg: '#010203' } } });
    expect(vars['--ds-auto-complete-bg']).toBe('#010203');
    expect(vars['--ds-autocomplete-bg']).toBe('#010203');
    expect(vars['--ds-autocomplete-border']).toBeUndefined();
  });

  it('keeps every pre-cut name a frozen skin reads whose renamed family channel the emitter writes', () => {
    const emitted = emittedFamilyChannels();
    const reads = frozenReads();
    const required = [...reads]
      .flatMap((name) => {
        const rename = CUT_RENAMES.find(([legacy]) => name.startsWith(legacy));
        if (!rename) return [];
        const current = `${rename[1]}${name.slice(rename[0].length)}`;
        return emitted.has(current) ? [[name, current] as const] : [];
      })
      .sort(([left], [right]) => left.localeCompare(right));

    expect(required.length).toBeGreaterThan(0);
    for (const [legacy, current] of required) {
      expect(FROZEN_ENGINE_COMPAT_CHANNELS, `${legacy} is read by a frozen skin`).toHaveProperty(legacy, current);
    }
    // The table carries nothing beyond that set: no name a frozen skin never reads.
    expect(Object.keys(FROZEN_ENGINE_COMPAT_CHANNELS).sort()).toEqual(required.map(([legacy]) => legacy));
  });

  it('restates a tenant-authored Rustic autocomplete surface in the rottay dark artifact', () => {
    // rottay's preset authors no chrome; the surface is a tenant's own literal.
    const tenant = {
      ...rottayFlatTheme,
      chrome: {
        ...rottayFlatTheme.chrome,
        controls: { ...rottayFlatTheme.chrome?.controls, autocomplete: { bg: '#1B1B1F' } },
      },
    };
    const compiled = lowerFlatThemeFixture({ flatTheme: tenant as never, tenantSlug: 'rottay' });
    expect(compiled.colorScheme).toBe('dark');
    expect(compiled.cssVariables['--ds-auto-complete-bg']).toBe('#1B1B1F');
    expect(compiled.cssVariables['--ds-autocomplete-bg']).toBe('#1B1B1F');
    expect(compiled.cssString).toContain('--ds-autocomplete-bg: #1B1B1F;');
  });
});
