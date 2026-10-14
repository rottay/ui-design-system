/**
 * WHO MAY COMPILE A THEME AT RUNTIME, pinned.
 *
 * The mount law's claim is that the runtime consumes an artifact and never
 * recompiles one. The claim is scoped here, in code, to what it actually
 * governs: every module under `infrastructure/runtime` that imports a semantic
 * theme compiler is listed, and the list is the measured one.
 *
 * THE BOUNDARY. There is one runtime door onto a compiler:
 *
 *  - `server-mount` — `mountTenantTheme` renders a code-owned vertical's
 *    artifact on the SERVER, once per vertical per process. Expected server
 *    work; it never runs during hydration.
 *
 * What must have NO door is the hydration path itself: mounting the provider,
 * resolving visual authority, and painting a tenant that already exists. That
 * is the assertion below — the census must contain that one entry and no
 * second, and no entry may be a client module.
 *
 * OUTSIDE THIS CENSUS. A draft a human is editing is compiled by the
 * customization patterns (tenant-preview, brand-studio tenant-theme-preview)
 * under `components/patterns/customization`, which are not runtime modules: no
 * provider mount reaches them, and an application that never renders a preview
 * never loads them.
 *
 * NOT A COMPILE. `emitTenantArtifactCss` re-renders an already-compiled
 * artifact's bytes so the mount proof can compare them. Re-serializing a
 * compiled object is not semantic theme compilation, and the admission module
 * that does it is deliberately outside this census.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const RUNTIME_ROOT = resolve(process.cwd(), 'src/infrastructure/runtime');

/** Entry points that perform a semantic theme compile. */
const COMPILER_SYMBOLS: readonly string[] = [
  'compileTheme',
  'compileThemeIntent',
  'compileTenantThemeConfig',
  'renderFirstPartyArtifact',
];

interface CompileDoor {
  readonly kind: 'server-mount';
  readonly client: boolean;
  readonly reason: string;
}

const DOORS: Readonly<Record<string, CompileDoor>> = {
  'theming/composition/mount/index.ts': {
    kind: 'server-mount',
    client: false,
    reason:
      'mountTenantTheme renders a code-owned vertical artifact on the server, cached one compile per vertical per process. Never reached from hydration.',
  },
};

function isProductionSource(path: string): boolean {
  if (!path.endsWith('.ts') && !path.endsWith('.tsx')) return false;
  if (path.endsWith('.d.ts') || path.includes('.test.') || path.includes('.stories.')) return false;
  return !path.split(sep).includes('tests');
}

function collectSources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) collectSources(absolute, found);
    else if (isProductionSource(absolute)) found.push(absolute);
  }
  return found;
}

/** Named bindings a module actually imports, ignoring prose that mentions them. */
export function importedCompilerSymbols(source: string): string[] {
  const found = new Set<string>();
  for (const match of source.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"][^'"]+['"]/g)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
      if (COMPILER_SYMBOLS.includes(name)) found.add(name);
    }
  }
  return [...found].sort();
}

function isClientModule(source: string): boolean {
  return /^\s*(?:\/\*[\s\S]*?\*\/\s*)*['"]use client['"]\s*;/.test(source)
    || source.split('\n').slice(0, 60).some((line) => line.trim() === "'use client';");
}

const SOURCES = collectSources(RUNTIME_ROOT);
const CENSUS = new Map<string, { symbols: string[]; client: boolean }>();
for (const absolute of SOURCES) {
  const source = readFileSync(absolute, 'utf8');
  const symbols = importedCompilerSymbols(source);
  if (symbols.length === 0) continue;
  CENSUS.set(relative(RUNTIME_ROOT, absolute).split(sep).join('/'), {
    symbols,
    client: isClientModule(source),
  });
}

describe('runtime compile doors', () => {
  it('scans a real corpus', () => {
    // Anti-cheat: a census that matched nothing satisfies every assertion below
    // for free.
    expect(SOURCES.length).toBeGreaterThan(150);
    expect(CENSUS.size).toBeGreaterThan(0);
  });

  it('admits no compile door outside the named one', () => {
    expect([...CENSUS.keys()].sort()).toEqual(Object.keys(DOORS).sort());
  });

  it('keeps no CLIENT compile door', () => {
    const clientDoors = [...CENSUS.entries()]
      .filter(([, entry]) => entry.client)
      .map(([path]) => path);

    expect(clientDoors).toEqual([]);
    for (const [path, door] of Object.entries(DOORS)) {
      expect(CENSUS.get(path)?.client, `${path} client posture`).toBe(door.client);
      expect(door.reason.length).toBeGreaterThan(60);
    }
  });

  it('flags a planted compile door instead of passing over it', () => {
    const planted = 'theming/composition/react/provider/index.tsx';
    const plantedCensus = new Map(CENSUS).set(planted, {
      symbols: ['compileTenantThemeConfig'],
      client: true,
    });

    expect([...plantedCensus.keys()].filter((path) => !(path in DOORS))).toEqual([planted]);
    expect(
      [...plantedCensus.entries()].filter(([, entry]) => entry.client).map(([path]) => path),
    ).toEqual([planted]);
    // And the detector reads imports, not prose: a comment naming the compiler
    // must not enter the census, or the fence would be unmaintainable noise.
    expect(importedCompilerSymbols("// compiled once by compileTenantThemeConfig\n")).toEqual([]);
    expect(
      importedCompilerSymbols("import { compileTheme } from '@/x';\n"),
    ).toEqual(['compileTheme']);
  });
});
