/**
 * Select modern engine — floating panel overlay material commitment.
 *
 * The option list is PORTALED, so the panel is a floating layer of the same
 * widget class as Dropdown and ContextMenu and must carry their overlay
 * material, not the CARD tier it was pinned to. Only rungs proven reachable
 * are asserted: `--ds-material-overlay-texture` and `--ds-elevation-surface-3`
 * are read at top level with no ancestor channel. The ground/border/shadow
 * role rungs are deliberately ABSENT — `--ds-select-dropdown-{bg,shadow,
 * border-color}` all carry `:root` defaults in
 * presentation/components/select/index.css, so a rung beneath them could never
 * reach paint. The inline trigger keeps the CONTROL register.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/select/index.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Select modern engine — floating panel overlay material', () => {
  it('routes the portaled panel through the overlay material register', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none)');
    expect(SKIN).toContain(
      'linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3))'
    );
    // The flat CARD-tier commitment is gone as a standalone ground.
    expect(SKIN).not.toContain('background: var(--ds-select-dropdown-bg, var(--ds-surface-card));');
  });

  it('keeps the none-capable depth in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value, so the panel
    // depth must never become a comma list.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(--ds-select-dropdown-shadow,\s*var\(--ds-elevation-3\)\);/
    );
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('drops the ungoverned primary sweeps from the option states', () => {
    // These mixed against the CARD ground while their own panel sits in the
    // overlay register — a role violation, not a role instance. Row feedback
    // survives through colour and border.
    expect(SKIN).not.toContain('color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card))');
    expect(SKIN).not.toContain('color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card))');
    expect(SKIN).toContain('var(--ds-select-option-bg-hover, transparent)');
    expect(SKIN).toContain('var(--ds-select-option-bg-selected, transparent)');
  });
});
