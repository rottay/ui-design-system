/**
 * @fileoverview Fail-closed gate: density has one type and one name per axis (WO-RET-06 W-3a, F-84 (a)).
 *
 * TWO AXES. The rendered density posture is `DensityPosture` (`compact | comfortable | spacious`),
 * declared once in the token density module and stamped as `data-density`. The tenant appearance
 * decision is `DensityMode` (`density.mode`, `compact | normal | spacious`), declared once in the theme
 * decisions. The two compose (the mode factor at the root, the local factor below it); every other
 * name that respelled the posture axis is retired into it, and a two-step component writes
 * `Exclude<DensityPosture, 'spacious'>` at its prop instead of taking a name.
 *
 * A retirement holds only while nobody declares the next `FooDensity` beside the survivors, so this
 * file walks both source trees for declarations rather than trusting a list of known names. The
 * mutation block at the bottom proves every scan can fail.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  ActionDockProps,
  DensityPosture,
  MarkdownViewProps,
  PopoverProps,
  TooltipProps,
  VerticalManifest,
} from '@rottay/design-system';
import { DENSITY_MODES, type DensityMode } from '@rottay/design-system/server';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const ROOTS = {
  core: join(PACKAGE_ROOT, 'src'),
  showroom: resolve(PACKAGE_ROOT, '../showroom/src'),
} as const;

/** A declaration inside a `tests/` folder is test-local and outside the rule. */
const TEST_FOLDER = /(?:^|\/)tests\//u;

/** Each admitted declaration, keyed `name @ path` (paths relative to `packages/`). */
const ADMITTED: Readonly<Record<string, string>> = {
  // The two survivors, one declaration each.
  'DensityPosture @ core/src/foundation/tokens/ts/foundation/base/density/index.ts': 'axis P: rendered density posture',
  'DensityMode @ core/src/contracts/theme/foundation/decisions/index.ts': 'axis A: tenant appearance decision',
  // Carrier and config shapes: they carry a posture, they are not a vocabulary of one.
  'DensityScopeProps @ core/src/infrastructure/runtime/foundation/density/index.ts': 'carrier',
  'DensityScopeValue @ core/src/infrastructure/runtime/foundation/density/index.ts': 'carrier',
  'DensityPreset @ core/src/foundation/tokens/ts/foundation/base/density/index.ts': 'carrier',
  'RootDensityProviderProps @ core/src/infrastructure/runtime/density/composition/react/provider/index.tsx': 'carrier',
  'ThemeCompilationDensityScopeBlock @ core/src/foundation/contracts/composition/tenants/themes/compiled/index.ts': 'carrier',
  'WorkspaceDensityConfig @ core/src/components/surfaces/foundation/contracts/adaptive/collection/index.ts': 'config',
  // Homonyms of another concept, measured 2026-10-07: the name matches, the domain is not density.
  'Density @ core/src/graphics/motion/foundation/particles/config/index.ts': 'module-local particle amount, `low | medium | high`',
  'DensityAuthoritySource @ showroom/src/components/density-authority/index.tsx': 'the density-authority probe: its source switch',
  'DensityAuthorityLocale @ showroom/src/components/density-authority/index.tsx': 'the density-authority probe: its locale switch',
  'DensityAuthorityProbeProps @ showroom/src/components/density-authority/index.tsx': 'the density-authority probe: its props',
};

/** The retired names, spelled by `join` so this file never matches its own text scan. */
const RETIRED = [
  ['Document', 'Density', 'Posture'],
  ['Surface', 'Density'],
  ['normalize', 'Surface', 'Density'],
  ['Action', 'Dock', 'Density'],
  ['Tooltip', 'Density'],
  ['Popover', 'Density'],
  ['Markdown', 'Density'],
  ['Density', 'Preference'],
  ['Density', 'Profile'],
].map((parts) => parts.join(''));

/** The bare retired `Density` cannot be text-scanned (UI copy says "Density"); it is checked as a binding. */
const RETIRED_BARE = ['Den', 'sity'].join('');

function walk(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.next') continue;
    const absolute = join(root, entry);
    if (statSync(absolute).isDirectory()) found.push(...walk(absolute));
    else if (/\.[cm]?tsx?$/u.test(absolute)) found.push(absolute);
  }
  return found;
}

function sources(): string[] {
  for (const root of Object.values(ROOTS)) expect(existsSync(root), `source root moved: ${root}`).toBe(true);
  return Object.values(ROOTS).flatMap(walk);
}

const label = (file: string) => relative(resolve(PACKAGE_ROOT, '..'), file).split(sep).join('/');

interface DensityDeclaration {
  readonly key: string;
  readonly exported: boolean;
}

/** Every type alias or interface whose name contains `Density`, at any depth. */
function densityDeclarations(file: string, text: string): DensityDeclaration[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: DensityDeclaration[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && /Density/u.test(node.name.text)) {
      const exported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      found.push({ key: `${node.name.text} @ ${label(file)}`, exported });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/** Import or export specifiers that bind the bare retired name. */
function bareBindings(file: string, text: string): string[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isImportSpecifier(node) || ts.isExportSpecifier(node))
      && [node.name.text, node.propertyName?.getText()].includes(RETIRED_BARE)) {
      found.push(`${label(file)}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function filesNaming(files: readonly string[], names: readonly string[]): string[] {
  const pattern = new RegExp(`\\b(?:${names.join('|')})\\b`, 'u');
  return files.filter((file) => pattern.test(readFileSync(file, 'utf8'))).map(label);
}

describe('(a) one declaration per axis, plus an exact allowlist of carriers', () => {
  it('declares no other type or interface named after density in core or the showroom', () => {
    const declared = sources()
      .filter((file) => !TEST_FOLDER.test(label(file)))
      .flatMap((file) => densityDeclarations(file, readFileSync(file, 'utf8')))
      .map((declaration) => declaration.key)
      .sort();
    expect(declared).toEqual(Object.keys(ADMITTED).sort());
  });

  it('keeps the bare homonym module-local: no exported `Density` anywhere', () => {
    const exported = sources()
      .flatMap((file) => densityDeclarations(file, readFileSync(file, 'utf8')))
      .filter((declaration) => declaration.exported && declaration.key.startsWith(`${RETIRED_BARE} @`));
    expect(exported).toEqual([]);
  });
});

describe('(b) the ten retired names are gone from both trees', () => {
  it('names none of the nine compound names anywhere, tests included', () => {
    const files = sources().filter((file) => file !== __filename);
    expect(filesNaming(files, RETIRED)).toEqual([]);
  });

  it('binds the bare `Density` in no import or export', () => {
    expect(sources().flatMap((file) => bareBindings(file, readFileSync(file, 'utf8')))).toEqual([]);
  });
});

describe('(c) every component prop is typed by the posture axis', () => {
  it('pins the three-step props to DensityPosture', () => {
    expectTypeOf<TooltipProps['density']>().toEqualTypeOf<DensityPosture | undefined>();
    expectTypeOf<PopoverProps['density']>().toEqualTypeOf<DensityPosture | undefined>();
    expectTypeOf<ActionDockProps['density']>().toEqualTypeOf<DensityPosture | undefined>();
    expectTypeOf<VerticalManifest['density']>().toEqualTypeOf<DensityPosture>();
  });

  it('pins the two-step prop to the posture axis restricted, not to a name of its own', () => {
    expectTypeOf<MarkdownViewProps['density']>().toEqualTypeOf<Exclude<DensityPosture, 'spacious'> | undefined>();
  });
});

describe('(d) the tenant appearance axis is unchanged', () => {
  it('keeps its persisted vocabulary, `normal` included', () => {
    expect([...DENSITY_MODES]).toEqual(['compact', 'normal', 'spacious']);
    expectTypeOf<DensityMode>().toEqualTypeOf<'compact' | 'normal' | 'spacious'>();
  });
});

describe('the scans can fail', () => {
  it('reports a planted declaration of a new density vocabulary', () => {
    const planted = densityDeclarations('planted.ts', "export type CardDensity = 'compact' | 'comfortable';");
    expect(planted.map((declaration) => declaration.key.split(' @ ')[0])).toEqual(['CardDensity']);
  });

  it('reports a planted retired name and a planted bare binding', () => {
    expect(filesNaming([__filename], [RETIRED_BARE + 'Profile'])).toHaveLength(0);
    expect(RETIRED.every((name) => new RegExp(`\\b${name}\\b`, 'u').test(`type X = ${name};`))).toBe(true);
    expect(bareBindings('planted.ts', `import type { ${RETIRED_BARE} } from '@rottay/design-system';`)).toHaveLength(1);
  });
});
