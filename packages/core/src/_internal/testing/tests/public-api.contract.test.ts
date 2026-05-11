/**
 * @fileoverview Public API contract tests. Validates the root barrel exports
 * canonical DS surfaces (ListSurface, DashboardSurface, etc.), excludes
 * removed/legacy exports, and verifies package.json exposes only the
 * supported subpaths.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
// Navigate from src/_internal/testing/ up to the package root
const PACKAGE_JSON_PATH = join(TEST_DIR, '..', '..', '..', '..', 'package.json');

describe('public api contract', () => {
  // The root barrel lazily wires a large public surface area, so in full coverage
  // runs we allow a higher timeout to avoid penalizing the suite for cold imports.
  it('keeps the root entry focused on the canonical DS api', { timeout: 60000 }, async () => {
    const publicApi = await import('../../../index');

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

    // Current canonical exports: root, server, icons, per-vertical styles, and internal paths
    const currentExports = Object.keys(packageJson.exports).sort();

    // Required subpaths that must exist
    const required = ['.', './server', './icons', './styles', './styles.css'];
    for (const path of required) {
      expect(currentExports, `missing required export: ${path}`).toContain(path);
    }

    // Per-vertical CSS bundles (the canonical app-facing contract)
    const verticalStyles = ['./styles/platform', './styles/bithire', './styles/evnto'];
    for (const path of verticalStyles) {
      expect(currentExports, `missing vertical style export: ${path}`).toContain(path);
    }

    // Engine-specific styles exist as optimization path (not required by apps)
    expect(currentExports).toContain('./styles/modern');

    // Legacy rottay alias exists for backward compatibility
    expect(currentExports).toContain('./styles/rottay');

    // No ghost exports from previous API versions
    const forbidden = ['./tokens', './tokens/css', './tokens/css/*', './i18n'];
    for (const path of forbidden) {
      expect(currentExports, `ghost export should not exist: ${path}`).not.toContain(path);
    }
  });
});
