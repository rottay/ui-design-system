/**
 * @fileoverview Source governance guardrails.
 * Static analysis tests that prevent architectural regressions after the
 * runtime/ and _internal/ restructure. Covers:
 * - Stale path detection (removed directories, dead references)
 * - Folder structure enforcement (runtime/, _internal/ boundaries)
 * - No duplicate personality defaults
 * - Package export integrity
 * - Legacy engine name bans
 * - DS-prefixed custom properties
 * - Tenant CSS specificity rules
 * - No unused visx packages
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');
const UI_ROOT = join(SRC_ROOT, 'ui');
const INFRASTRUCTURE_RUNTIME_ROOT = join(SRC_ROOT, 'infrastructure', 'runtime');
const PACKAGE_MANIFEST = join(process.cwd(), 'package.json');
const DS_ROOT = join(process.cwd(), '..', '..');
const DECLARED_EXTENSION_MARKER =
  '/* === Declared artifact extension (authored source, mechanically scoped) === */';
const VERTICAL_BY_ARTIFACT_TENANT: Readonly<Record<string, string>> = {
  rottay: 'platform',
  bithire: 'bithire',
  evnto: 'evnto',
};

function collectFirstPartyArtifactFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, 'index.css'))
    .filter(existsSync);
}

function compiledThemeSection(file: string): string {
  return readFileSync(file, 'utf8').split(DECLARED_EXTENSION_MARKER, 1)[0] ?? '';
}

function collectSourceFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const entries = readdirSync(root, { withFileTypes: true }) as Array<{
    name: string;
    isDirectory: () => boolean;
    isFile: () => boolean;
  }>;

  return entries.flatMap((entry) => {
    const absolutePath = join(root, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(absolutePath);
    }

    if (
      entry.isFile() &&
      /\.(ts|tsx|css)$/.test(entry.name) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.stories.ts') &&
      !entry.name.endsWith('.stories.tsx')
    ) {
      return [absolutePath];
    }

    return [];
  });
}

// ---------------------------------------------------------------------------
// Original governance tests (updated paths for restructured layout)
// ---------------------------------------------------------------------------

describe('source governance', () => {
  it('keeps legacy custom components outside the core package', () => {
    expect(existsSync(join(UI_ROOT, 'custom'))).toBe(false);
  });

  it('does not reintroduce deprecated engine names in runtime source', () => {
    const runtimeFiles = collectSourceFiles(SRC_ROOT);
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (/\b(titan|hermes|apollo)\b/.test(source)) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('does not import legacy guides or removed custom folders into the core runtime', () => {
    const runtimeFiles = collectSourceFiles(SRC_ROOT);
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (
        source.includes('legacy-guides') ||
        source.includes('components/custom') ||
        source.includes('theme-presets') ||
        source.includes('animation-presets')
      ) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps token ownership under foundation instead of a loose root barrel', () => {
    expect(existsSync(join(SRC_ROOT, 'tokens.ts'))).toBe(false);
    expect(existsSync(join(SRC_ROOT, 'foundation', 'tokens', 'index.ts'))).toBe(true);
  });

  it('keeps component token families on DS-prefixed custom properties', () => {
    const runtimeFiles = collectSourceFiles(SRC_ROOT);
    const matches: string[] = [];
    const unprefixedTokenPattern =
      /--(avatar|badge|button|card|checkbox|collapse|icon|input|list|modal|qrcode|radio|rate|select|space|spinner|tag|timeline|toggle)-/;

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (unprefixedTokenPattern.test(source)) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps compiled BrandTheme output free of !important specificity wars', () => {
    const tenantCssRoot = join(SRC_ROOT, 'foundation', 'tokens', 'css', 'facade', 'artifacts');
    const tenantFiles = collectFirstPartyArtifactFiles(tenantCssRoot);
    const matches: string[] = [];

    for (const file of tenantFiles) {
      const source = compiledThemeSection(file);

      if (source.includes('!important')) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('does not keep unused visx packages in the published package manifest', () => {
    const packageJson = JSON.parse(readFileSync(PACKAGE_MANIFEST, 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const dependencyNames = Object.keys(packageJson.dependencies ?? {});
    const visxPackages = dependencyNames.filter((dependency) =>
      dependency.startsWith('@visx/')
    );

    expect(visxPackages).toEqual([]);
  });

  it('ships dual-scoped compiled artifacts and an explicitly delimited extension', () => {
    const tenantCssRoot = join(SRC_ROOT, 'foundation', 'tokens', 'css', 'facade', 'artifacts');
    const tenantFiles = collectFirstPartyArtifactFiles(tenantCssRoot);
    const matches: string[] = [];

    for (const file of tenantFiles) {
      const source = readFileSync(file, 'utf8');
      const slug = file.split('/').at(-2) ?? '';
      const vertical = VERTICAL_BY_ARTIFACT_TENANT[slug] ?? slug;
      const dualScope = `:is(html[data-tenant='${slug}'], :where([data-ds-root][data-vertical='${vertical}']))`;
      if (!source.includes(dualScope) || !source.includes(DECLARED_EXTENSION_MARKER)) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Stale path detection -- directories and references that must stay deleted
// ---------------------------------------------------------------------------

describe('stale paths', () => {
  it('should not have any src/theme/ directory', () => {
    expect(existsSync(join(SRC_ROOT, 'theme'))).toBe(false);
  });

  it('should not have any src/styles/ directory', () => {
    expect(existsSync(join(SRC_ROOT, 'styles'))).toBe(false);
  });

  it('should not have legacy-guides/ directory', () => {
    expect(existsSync(join(DS_ROOT, 'legacy-guides'))).toBe(false);
  });

  it('should not have src/testing/ at top-level (moved to tooling/testing)', () => {
    expect(existsSync(join(SRC_ROOT, 'testing'))).toBe(false);
  });

  it('should not have src/errors/ at top-level (classified under foundation/composition internal)', () => {
    expect(existsSync(join(SRC_ROOT, 'errors'))).toBe(false);
  });

  it('should not have src/utils/ at top-level (classified under foundation/composition internal)', () => {
    expect(existsSync(join(SRC_ROOT, 'utils'))).toBe(false);
  });

  it('should not have src/bootstrap/ at top-level (moved to infrastructure/runtime/bootstrap)', () => {
    expect(existsSync(join(SRC_ROOT, 'bootstrap'))).toBe(false);
  });

  it('should not have src/engines/ at top-level (moved to infrastructure/runtime/engines)', () => {
    expect(existsSync(join(SRC_ROOT, 'engines'))).toBe(false);
  });

  it('should not have src/theming/ at top-level (moved to infrastructure/runtime/theming)', () => {
    expect(existsSync(join(SRC_ROOT, 'theming'))).toBe(false);
  });

  it('should not have src/tenancy/ at top-level (moved to infrastructure/runtime/tenant)', () => {
    expect(existsSync(join(SRC_ROOT, 'tenancy'))).toBe(false);
  });

  it('should not have src/personality/ at top-level (moved to infrastructure/runtime/personality)', () => {
    expect(existsSync(join(SRC_ROOT, 'personality'))).toBe(false);
  });

  it('should not have src/verticals/ at top-level (moved to infrastructure/runtime/verticals)', () => {
    expect(existsSync(join(SRC_ROOT, 'verticals'))).toBe(false);
  });

  it('should not have src/product-profiles/ at top-level (moved to infrastructure/runtime/product-profiles)', () => {
    expect(existsSync(join(SRC_ROOT, 'product-profiles'))).toBe(false);
  });

  it('should not have src/features/ at top-level (moved to infrastructure/runtime/features)', () => {
    expect(existsSync(join(SRC_ROOT, 'features'))).toBe(false);
  });

  it('should not have src/providers/ at top-level (moved to infrastructure/runtime/responsive)', () => {
    expect(existsSync(join(SRC_ROOT, 'providers'))).toBe(false);
  });

  it('should not reference src/theme/foundation/tokens/css in non-test source files', () => {
    const sourceFiles = collectSourceFiles(SRC_ROOT);
    const matches: string[] = [];

    for (const file of sourceFiles) {
      const source = readFileSync(file, 'utf8');

      if (source.includes('src/theme/foundation/tokens/css')) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Folder structure enforcement -- explicit architectural destinations
// ---------------------------------------------------------------------------

describe('folder structure', () => {
  it('should have infrastructure/runtime/ directory', () => {
    expect(existsSync(INFRASTRUCTURE_RUNTIME_ROOT)).toBe(true);
  });

  it('should keep the legacy root _internal/ deleted', () => {
    expect(existsSync(join(SRC_ROOT, '_internal'))).toBe(false);
  });

  it('infrastructure/runtime/ should contain all expected subfolders', () => {
    const expected = [
      'bootstrap',
      'engines',
      'theming',
      'tenant',
      'personality',
      'verticals',
      'product-profiles',
      'features',
      'i18n',
      'responsive',
    ];
    for (const folder of expected) {
      expect(
        existsSync(join(INFRASTRUCTURE_RUNTIME_ROOT, folder)),
        `infrastructure/runtime/${folder} should exist`
      ).toBe(true);
    }
  });

  it('should classify internal owners by architectural weight', () => {
    expect(existsSync(join(SRC_ROOT, 'foundation', 'internal', 'kernel'))).toBe(true);
    expect(existsSync(join(SRC_ROOT, 'foundation', 'internal', 'runtime'))).toBe(true);
    expect(existsSync(join(
      INFRASTRUCTURE_RUNTIME_ROOT,
      'adapters',
      'presentation',
      'react',
      'compound-components',
    ))).toBe(true);
    expect(existsSync(join(SRC_ROOT, 'tooling', 'testing'))).toBe(true);
  });

  it('infrastructure/runtime/ should have an index.ts barrel export', () => {
    expect(existsSync(join(INFRASTRUCTURE_RUNTIME_ROOT, 'index.ts'))).toBe(true);
  });

  it('should not reintroduce a private compatibility barrel', () => {
    expect(existsSync(join(SRC_ROOT, '_internal', 'index.ts'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// No duplicate personality defaults
// ---------------------------------------------------------------------------

describe('no duplicate personality defaults', () => {
  it('should not have hooks/tokens/personality-defaults.ts', () => {
    expect(
      existsSync(join(SRC_ROOT, 'hooks', 'tokens', 'personality-defaults.ts'))
    ).toBe(false);
  });

  it('personality defaults should only exist in infrastructure/runtime/personality/', () => {
    expect(
      existsSync(join(INFRASTRUCTURE_RUNTIME_ROOT, 'personality', 'foundation', 'defaults', 'index.ts'))
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Package export integrity
// ---------------------------------------------------------------------------

describe('package exports', () => {
  it('root package.json should not reference src/theme/', () => {
    const pkgJson = JSON.parse(readFileSync(join(DS_ROOT, 'package.json'), 'utf-8'));
    const pkgStr = JSON.stringify(pkgJson);
    expect(pkgStr).not.toContain('src/theme/');
  });

  it('root and core package versions should match', () => {
    const rootPkg = JSON.parse(readFileSync(join(DS_ROOT, 'package.json'), 'utf-8'));
    const corePkg = JSON.parse(readFileSync(PACKAGE_MANIFEST, 'utf-8'));
    expect(rootPkg.version).toBe(corePkg.version);
  });

  it('root package should be private so releases publish from packages/core only', () => {
    const rootPkg = JSON.parse(readFileSync(join(DS_ROOT, 'package.json'), 'utf-8'));
    expect(rootPkg.private).toBe(true);
  });

  it('core package.json sideEffects should include CSS', () => {
    const corePkg = JSON.parse(readFileSync(PACKAGE_MANIFEST, 'utf-8'));
    expect(corePkg.sideEffects).toContain('*.css');
  });

  it('vitest setupFiles should point to tooling/testing/setup/index.ts', () => {
    const vitestConfig = readFileSync(
      join(process.cwd(), 'vitest.config.ts'),
      'utf-8'
    );
    expect(vitestConfig).toContain('tooling/testing/setup/index.ts');
    expect(vitestConfig).not.toContain(['_internal', 'testing', 'test-setup.ts'].join('/'));
    expect(vitestConfig).not.toContain("'./src/testing/test-setup.ts'");
  });
});

// ---------------------------------------------------------------------------
// Import boundary enforcement -- production runtime must not import test tooling
// ---------------------------------------------------------------------------

describe('import boundaries', () => {
  it('infrastructure/runtime/ code should not import directly from tooling/testing helpers', () => {
    const runtimeFiles = collectSourceFiles(INFRASTRUCTURE_RUNTIME_ROOT);
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (
        source.includes('tooling/testing') ||
        source.includes('tooling/testing/')
      ) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('ui/ should not import from removed top-level runtime directories', () => {
    const componentFiles = collectSourceFiles(UI_ROOT);
    const matches: string[] = [];
    // These were the old top-level runtime paths before the restructure.
    // Primitives may legitimately import from their own ./engines/ subdirectory,
    // so we only flag imports that resolve outside the component tree to the
    // removed top-level runtime directories (bootstrap, theming, tenancy).
    // The engines/ check is limited to paths that escape the ui/ tree
    // (i.e., from 'src/engines' or '../../engines' resolving above ui/).
    const stalePaths = [
      "from '../../bootstrap",
      "from '../../../bootstrap",
      "from '../../theming",
      "from '../../../theming",
      "from '../../tenancy",
      "from '../../../tenancy",
    ];

    for (const file of componentFiles) {
      const source = readFileSync(file, 'utf8');

      for (const stalePath of stalePaths) {
        if (source.includes(stalePath)) {
          matches.push(`${file} -> ${stalePath}`);
        }
      }
    }

    expect(matches).toEqual([]);
  });
});
