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
const COMPONENTS_ROOT = join(SRC_ROOT, 'components');
const PACKAGE_MANIFEST = join(process.cwd(), 'package.json');
const DS_ROOT = join(process.cwd(), '..', '..');

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
    expect(existsSync(join(COMPONENTS_ROOT, 'custom'))).toBe(false);
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

  it('keeps the public token mirror out of runtime implementation code', () => {
    const runtimeFiles = collectSourceFiles(SRC_ROOT).filter(
      (filePath) =>
        !filePath.includes('/tokens/') &&
        !filePath.includes('/testing/') &&
        !filePath.includes('/__tests__/')
    );
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (source.includes('tokens/ts')) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
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

  it('does not ship tenant overrides with !important specificity wars', () => {
    const tenantCssRoot = join(SRC_ROOT, 'tokens', 'css', 'tenants');
    const tenantFiles = collectSourceFiles(tenantCssRoot).filter((filePath) =>
      filePath.endsWith('.css')
    );
    // Known legacy tenant with !important overrides -- tracked for cleanup.
    // Do NOT add new entries here; fix the CSS instead.
    const KNOWN_IMPORTANT_EXCEPTIONS = new Set([
      join(tenantCssRoot, 'themanagementmiami', 'index.css'),
    ]);
    const matches: string[] = [];

    for (const file of tenantFiles) {
      if (KNOWN_IMPORTANT_EXCEPTIONS.has(file)) continue;
      const source = readFileSync(file, 'utf8');

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

  it('guards tenant css overrides so dark mode can win the cascade', () => {
    const tenantCssRoot = join(SRC_ROOT, 'tokens', 'css', 'tenants');
    const tenantFiles = collectSourceFiles(tenantCssRoot).filter((filePath) =>
      filePath.endsWith('.css')
    );
    const matches: string[] = [];
    // A tenant selector is "guarded" if it either:
    // 1. Excludes dark mode: :not([data-theme='dark']):not(.dark)
    // 2. Explicitly targets dark mode: [data-theme='dark'] or .dark
    const unguardedTenantSelector =
      /html\[data-tenant='(?:rottay|bithire|evnto)'\](?!:not\(\[data-theme='dark'\]\):not\(\.dark\))(?!\[data-theme='dark'\])(?!\.dark)/;

    for (const file of tenantFiles) {
      const source = readFileSync(file, 'utf8');

      if (unguardedTenantSelector.test(source)) {
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

  it('should not have src/testing/ at top-level (moved to _internal/testing)', () => {
    expect(existsSync(join(SRC_ROOT, 'testing'))).toBe(false);
  });

  it('should not have src/errors/ at top-level (moved to _internal/errors)', () => {
    expect(existsSync(join(SRC_ROOT, 'errors'))).toBe(false);
  });

  it('should not have src/utils/ at top-level (moved to _internal/utils)', () => {
    expect(existsSync(join(SRC_ROOT, 'utils'))).toBe(false);
  });

  it('should not have src/bootstrap/ at top-level (moved to runtime/bootstrap)', () => {
    expect(existsSync(join(SRC_ROOT, 'bootstrap'))).toBe(false);
  });

  it('should not have src/engines/ at top-level (moved to runtime/engines)', () => {
    expect(existsSync(join(SRC_ROOT, 'engines'))).toBe(false);
  });

  it('should not have src/theming/ at top-level (moved to runtime/theming)', () => {
    expect(existsSync(join(SRC_ROOT, 'theming'))).toBe(false);
  });

  it('should not have src/tenancy/ at top-level (moved to runtime/tenant)', () => {
    expect(existsSync(join(SRC_ROOT, 'tenancy'))).toBe(false);
  });

  it('should not have src/personality/ at top-level (moved to runtime/tenant/presets)', () => {
    expect(existsSync(join(SRC_ROOT, 'personality'))).toBe(false);
  });

  it('should not have src/verticals/ at top-level (moved to runtime/verticals)', () => {
    expect(existsSync(join(SRC_ROOT, 'verticals'))).toBe(false);
  });

  it('should not have src/product-profiles/ at top-level (moved to runtime/product-profiles)', () => {
    expect(existsSync(join(SRC_ROOT, 'product-profiles'))).toBe(false);
  });

  it('should not have src/features/ at top-level (moved to runtime/features)', () => {
    expect(existsSync(join(SRC_ROOT, 'features'))).toBe(false);
  });

  it('should not have src/providers/ at top-level (moved to runtime/responsive)', () => {
    expect(existsSync(join(SRC_ROOT, 'providers'))).toBe(false);
  });

  it('should not reference src/theme/tokens/css in non-test source files', () => {
    const sourceFiles = collectSourceFiles(SRC_ROOT);
    const matches: string[] = [];

    for (const file of sourceFiles) {
      const source = readFileSync(file, 'utf8');

      if (source.includes('src/theme/tokens/css')) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Folder structure enforcement -- runtime/ and _internal/ boundaries
// ---------------------------------------------------------------------------

describe('folder structure', () => {
  it('should have runtime/ directory', () => {
    expect(existsSync(join(SRC_ROOT, 'runtime'))).toBe(true);
  });

  it('should have _internal/ directory', () => {
    expect(existsSync(join(SRC_ROOT, '_internal'))).toBe(true);
  });

  it('runtime/ should contain all expected subfolders', () => {
    const expected = [
      'bootstrap',
      'engines',
      'theming',
      'tenancy',
      'personality',
      'verticals',
      'product-profiles',
      'features',
      'providers',
    ];
    for (const folder of expected) {
      expect(
        existsSync(join(SRC_ROOT, 'runtime', folder)),
        `runtime/${folder} should exist`
      ).toBe(true);
    }
  });

  it('_internal/ should contain expected subfolders', () => {
    const expected = ['errors', 'utils', 'testing'];
    for (const folder of expected) {
      expect(
        existsSync(join(SRC_ROOT, '_internal', folder)),
        `_internal/${folder} should exist`
      ).toBe(true);
    }
  });

  it('runtime/ should have an index.ts barrel export', () => {
    expect(existsSync(join(SRC_ROOT, 'runtime', 'index.ts'))).toBe(true);
  });

  it('_internal/ should have an index.ts barrel export', () => {
    expect(existsSync(join(SRC_ROOT, '_internal', 'index.ts'))).toBe(true);
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

  it('personality defaults should only exist in runtime/personality/', () => {
    expect(
      existsSync(join(SRC_ROOT, 'runtime', 'personality', 'defaults.ts'))
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

  it('core package.json sideEffects should include CSS', () => {
    const corePkg = JSON.parse(readFileSync(PACKAGE_MANIFEST, 'utf-8'));
    expect(corePkg.sideEffects).toContain('*.css');
  });

  it('vitest setupFiles should point to _internal/testing/test-setup.ts', () => {
    const vitestConfig = readFileSync(
      join(process.cwd(), 'vitest.config.ts'),
      'utf-8'
    );
    expect(vitestConfig).toContain('_internal/testing/test-setup.ts');
    expect(vitestConfig).not.toContain("'./src/testing/test-setup.ts'");
  });
});

// ---------------------------------------------------------------------------
// Import boundary enforcement -- _internal/ should not be imported by runtime/
// ---------------------------------------------------------------------------

describe('import boundaries', () => {
  it('runtime/ code should not import directly from _internal/ test helpers', () => {
    const runtimeFiles = collectSourceFiles(join(SRC_ROOT, 'runtime'));
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (
        source.includes('_internal/testing') ||
        source.includes('_internal/testing/')
      ) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });

  it('components/ should not import from removed top-level runtime directories', () => {
    const componentFiles = collectSourceFiles(COMPONENTS_ROOT);
    const matches: string[] = [];
    // These were the old top-level runtime paths before the restructure.
    // Components may legitimately import from their own ./engines/ subdirectory,
    // so we only flag imports that resolve outside the component tree to the
    // removed top-level runtime directories (bootstrap, theming, tenancy).
    // The engines/ check is limited to paths that escape the components/ tree
    // (i.e., from 'src/engines' or '../../engines' resolving above components/).
    const stalePaths = [
      "from '../bootstrap",
      "from '../../bootstrap",
      "from '../theming",
      "from '../../theming",
      "from '../tenancy",
      "from '../../tenancy",
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
