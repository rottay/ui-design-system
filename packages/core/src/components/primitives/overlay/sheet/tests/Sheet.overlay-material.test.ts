/**
 * Sheet modern engine — overlay material commitment (edge).
 *
 * A sheet slides in as a genuinely floating layer, so its edge reads the
 * overlay material role rather than a hard-wired `--ds-color-border-subtle`.
 * The role channel is read DIRECTLY — no new public `--ds-sheet-*` token is
 * minted. `--ds-material-overlay-border` is declared nowhere under
 * `foundation/tokens/css`, so the rung reaches paint immediately.
 *
 * The surface box-shadow is left alone: the inset top-light rides the same
 * comma list, and a none-capable role there would void the declaration.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Sheet modern engine — overlay material commitment', () => {
  it('routes the sliding panel edge through the overlay material role', () => {
    expect(SKIN).toContain(
      'border: 1px solid var(--ds-material-overlay-border, var(--ds-color-border-subtle));'
    );
    expect(SKIN).not.toContain('border: 1px solid var(--ds-color-border-subtle);');
    expect(SKIN).not.toContain('--ds-sheet-border-color');
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('keeps glass on the backdrop only', () => {
    // Spec section 5: the frosted layer is a backdrop role, never a panel one.
    const surfaceBlock =
      SKIN.match(/\[data-part='root'\] > \[data-part='surface'\] \{[\s\S]*?\}/)?.[0] ?? '';
    expect(surfaceBlock).not.toContain('backdrop-filter');
    expect(SKIN).toContain('backdrop-filter: var(--ds-glass-backdrop-filter);');
  });
});
