import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_JSON_PATH = join(TEST_DIR, '..', '..', 'package.json');

describe('public api contract', () => {
  // The root barrel lazily wires a large public surface area, so in full coverage
  // runs we allow a higher timeout to avoid penalizing the suite for cold imports.
  it('keeps the root entry focused on the canonical DS api', { timeout: 60000 }, async () => {
    const publicApi = await import('../index');

    expect(publicApi.DesignSystemProvider).toBeTypeOf('function');
    expect(publicApi.ListSurface).toBeTypeOf('function');
    expect(publicApi.DashboardSurface).toBeTypeOf('function');
    expect(publicApi.FormSurface).toBeTypeOf('function');
    expect(publicApi.ChatSurface).toBeTypeOf('function');

    expect(publicApi).not.toHaveProperty('custom');
    expect(publicApi).not.toHaveProperty('themePresets');
    expect(publicApi).not.toHaveProperty('bithireTheme');
    expect(publicApi).not.toHaveProperty('corporateTheme');
    expect(publicApi).not.toHaveProperty('evntoTheme');
    expect(publicApi).not.toHaveProperty('minimalTheme');
  });

  it('exposes only the supported package subpaths', () => {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as {
      exports: Record<string, unknown>;
    };

    expect(Object.keys(packageJson.exports).sort()).toEqual(
      ['.', './tokens', './tokens/css', './tokens/css/*', './i18n', './styles', './styles.css', './icons'].sort()
    );
  });
});
