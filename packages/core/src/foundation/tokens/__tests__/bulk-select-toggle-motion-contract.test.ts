import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BULK_SELECT_CSS = readFileSync(
  resolve(TEST_DIR, '..', 'css/presentation/components/skin/bulk-select-toggle.css'),
  'utf8',
);

describe('BulkSelectToggle stable motion contract', () => {
  it('owns its namespaced keyframe without a runtime style dependency', () => {
    expect(BULK_SELECT_CSS).toContain('@keyframes ds-bulk-select-toggle-enter');
    expect(BULK_SELECT_CSS.match(/ds-bulk-select-toggle-enter/g)).toHaveLength(3);
    expect(BULK_SELECT_CSS).not.toContain('ds-table-checkbox-slide-in');
  });

  it('transitions only paint properties instead of all', () => {
    expect(BULK_SELECT_CSS).not.toMatch(/transition:\s*all\b/);
    expect(BULK_SELECT_CSS).not.toMatch(/\b0\.2s\b/);
    expect(BULK_SELECT_CSS).toContain(
      'background-color var(--ds-motion-normal) var(--ds-motion-ease-move, ease)',
    );
    expect(BULK_SELECT_CSS).toContain(
      'box-shadow var(--ds-motion-normal) var(--ds-motion-ease-move, ease)',
    );
    expect(BULK_SELECT_CSS).not.toContain('--ds-duration-normal');
    expect(BULK_SELECT_CSS).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none;[\s\S]*animation: none;/,
    );
  });
});
