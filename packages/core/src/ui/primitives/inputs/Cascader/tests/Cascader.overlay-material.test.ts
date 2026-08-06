/**
 * Cascader modern engine — overlay material commitment.
 *
 * The column dropdown is a floating anchored panel of the same widget class as
 * Popconfirm and Dropdown, so its ground, hairline and depth must read the
 * overlay material role. Before this contract the panel hard-wired
 * `--ds-surface-card`, `--ds-color-border` and a BARE `--ds-elevation-2` with
 * no tenant channel at all — no theme could restate the panel's material.
 * Reachability proof: `--ds-cascader-dropdown-{bg,border,shadow}` have zero
 * declarations anywhere in foundation/tokens/css, so no ancestor buries the
 * inserted rung.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header names the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/cascader.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Cascader modern engine — overlay material commitment', () => {
  it('routes the panel ground and hairline through the overlay material role', () => {
    expect(SKIN).toContain(
      'var(--ds-cascader-dropdown-bg, var(--ds-material-overlay-background, var(--ds-surface-card)))'
    );
    expect(SKIN).toMatch(
      /border-color:\s*var\(--ds-cascader-dropdown-border,\s*var\(--ds-material-overlay-border,\s*var\(--ds-color-border\)\)\);/
    );
    // The unreachable hard-wired ground is gone from the panel rule.
    expect(SKIN).not.toMatch(/\),\n\s*var\(--ds-surface-card\);/);
  });

  it('keeps the none-capable shadow role in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value. A role
    // channel riding a comma list lets a tenant `none` void the declaration.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(--ds-cascader-dropdown-shadow,\s*var\(--ds-material-overlay-shadow,\s*var\(--ds-elevation-2\)\)\);/
    );
    const panelShadow =
      SKIN.match(/box-shadow:\s*var\(--ds-cascader-dropdown-shadow[\s\S]*?;/)?.[0] ?? '';
    expect(panelShadow).not.toContain('inset');
    expect(panelShadow).not.toContain(', 0');
    // The bare, un-restateable depth is gone.
    expect(SKIN).not.toContain('box-shadow: var(--ds-elevation-2);');
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('keeps the inline combobox field on the control register, not overlay', () => {
    // Only the floating panel takes the overlay role; the trigger is a field.
    expect(SKIN).not.toMatch(/\[data-part='trigger'\][^{]*\{[^}]*--ds-material-overlay-/);
  });
});
