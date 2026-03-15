import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');
const COMPONENTS_ROOT = join(SRC_ROOT, 'components');
const PACKAGE_MANIFEST = join(process.cwd(), 'package.json');

function collectSourceFiles(root: string): string[] {
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
        !filePath.includes('/theme/tokens/') &&
        !filePath.includes('/testing/') &&
        !filePath.includes('/__tests__/')
    );
    const matches: string[] = [];

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');

      if (source.includes('theme/tokens/ts')) {
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
    const tenantCssRoot = join(SRC_ROOT, 'theme', 'tokens', 'css', 'tenants');
    const tenantFiles = collectSourceFiles(tenantCssRoot).filter((filePath) => filePath.endsWith('.css'));
    const matches: string[] = [];

    for (const file of tenantFiles) {
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
    const visxPackages = dependencyNames.filter((dependency) => dependency.startsWith('@visx/'));

    expect(visxPackages).toEqual([]);
  });

  it('guards tenant css overrides so dark mode can win the cascade', () => {
    const tenantCssRoot = join(SRC_ROOT, 'theme', 'tokens', 'css', 'tenants');
    const tenantFiles = collectSourceFiles(tenantCssRoot).filter((filePath) => filePath.endsWith('.css'));
    const matches: string[] = [];
    const unguardedTenantSelector =
      /html\[data-tenant='(?:rottay|bithire|evnto)'\](?!:not\(\[data-theme='dark'\]\):not\(\.dark\))/;

    for (const file of tenantFiles) {
      const source = readFileSync(file, 'utf8');

      if (unguardedTenantSelector.test(source)) {
        matches.push(file);
      }
    }

    expect(matches).toEqual([]);
  });
});
