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
// The test lives four levels below the package root.
const PACKAGE_JSON_PATH = join(TEST_DIR, '..', '..', '..', '..', 'package.json');

describe('public api contract', () => {
  // The root barrel lazily wires a large public surface area, so in full coverage
  // runs we allow a higher timeout to avoid penalizing the suite for cold imports.
  it('keeps the root entry focused on the canonical DS api', { timeout: 60000 }, async () => {
    const publicApi = await import('../../../../src/index');

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
    expect(publicApi).not.toHaveProperty('SpatialExperience');
  });

  it('exposes only the supported package subpaths', () => {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as {
      exports: Record<string, unknown>;
    };

    // Current canonical exports: root, server, icons and the canonical CSS door.
    // RET-01-E (2026-10-02): the per-family subpaths, ./styles, ./styles/default,
    // ./effects and ./spatial/spec retired census-backed (zero consumers measured);
    // ./styles/rottay stays; ./styles/modern retired with WO-RET-06 W-1 (no importer: app-platform's
    // next.config carries an alias that resolves a file path, not the door).
    const currentExports = Object.keys(packageJson.exports).sort();

    // Required subpaths that must exist
    const required = ['.', './server', './icons', './styles.css'];
    for (const path of required) {
      expect(currentExports, `missing required export: ${path}`).toContain(path);
    }

    const focusedRuntimeBoundaries = [
      './marks',
      './charts',
      './charts/spec',
      './charts/access',
      './charts/renderers',
      './motion',
      './spatial',
    ];
    for (const path of focusedRuntimeBoundaries) {
      expect(currentExports, `missing focused export: ${path}`).toContain(path);
    }

    // Per-vertical CSS bundles (the canonical app-facing contract)
    const verticalStyles = ['./styles/rottay', './styles/bithire', './styles/evnto'];
    for (const path of verticalStyles) {
      expect(currentExports, `missing vertical style export: ${path}`).toContain(path);
    }

    // The engine sheet ships inside every bundle; it has no door of its own (WO-RET-06 W-1).
    expect(currentExports).not.toContain('./styles/modern');

    // Neutral consumers request the canonical bundle through ./styles.css.

    // No ghost exports from previous API versions
    const forbidden = ['./tokens', './foundation/tokens/css', './foundation/tokens/css/*', './i18n', './effects', './spatial/spec', './styles', './styles/default'];
    for (const path of forbidden) {
      expect(currentExports, `ghost export should not exist: ${path}`).not.toContain(path);
    }
  });
});
