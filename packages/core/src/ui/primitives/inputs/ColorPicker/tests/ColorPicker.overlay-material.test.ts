/**
 * ColorPicker modern engine — overlay material commitment.
 *
 * The picker dropdown is a floating panel, so its ground, hairline and depth
 * belong to the overlay material role. The file's own comment already called
 * the panel frame the "overlay register", but the paint was hard-wired:
 * `--ds-surface-card`, a BARE `--ds-elevation-2` and a literal
 * `--ds-color-border-subtle`, none of them restateable by a tenant.
 * Reachability proof: `--ds-colorpicker-panel-{bg,border,shadow}` have zero
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
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/color-picker.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('ColorPicker modern engine — overlay material commitment', () => {
  it('routes the panel ground and hairline through the overlay material role', () => {
    expect(SKIN).toContain(
      'var(--ds-colorpicker-panel-bg, var(--ds-material-overlay-background, var(--ds-surface-card)))'
    );
    expect(SKIN).toContain(
      'border: 1px solid var(--ds-colorpicker-panel-border, var(--ds-material-overlay-border, var(--ds-color-border-subtle)));'
    );
    expect(SKIN).not.toContain('border: 1px solid var(--ds-color-border-subtle);');
  });

  it('keeps the none-capable shadow role in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value. A role
    // channel riding a comma list lets a tenant `none` void the declaration.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(--ds-colorpicker-panel-shadow,\s*var\(--ds-material-overlay-shadow,\s*var\(--ds-elevation-2\)\)\);/
    );
    const panelShadow =
      SKIN.match(/box-shadow:\s*var\(--ds-colorpicker-panel-shadow[\s\S]*?;/)?.[0] ?? '';
    expect(panelShadow).not.toContain('inset');
    expect(panelShadow).not.toContain(', 0');
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('leaves the inline swatch and trigger on their own depth, not the overlay role', () => {
    // The swatch chip is an inline control, not a floating sub-layer; the
    // overlay register must not leak onto it.
    expect(SKIN).toMatch(/\[data-part='swatch'\]\s*\{[\s\S]*?box-shadow:\s*var\(--ds-elevation-1\);/);
    expect(SKIN).not.toMatch(/\[data-part='swatch'\][^{]*\{[^}]*--ds-material-overlay-/);
  });
});
