/**
 * ConfirmDialog modern engine — overlay material commitment (edge).
 *
 * The confirm panel is the same widget class as AlertDialog: a floating layer,
 * so its edge joins the overlay material register instead of hard-wiring
 * `--ds-color-border-subtle`. The role channel is read DIRECTLY — no new public
 * `--ds-confirm-dialog-*` token is minted here. `--ds-material-overlay-border`
 * is declared nowhere under `foundation/tokens/css`, so the rung reaches paint.
 *
 * The panel's box-shadow stays untouched for the FAB-05 reason: it is a comma
 * list, and a none-capable role there would let `none` void the declaration.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('ConfirmDialog modern engine — overlay material commitment', () => {
  it('routes the panel edge through the overlay material role', () => {
    expect(SKIN).toContain(
      'border: 1px solid var(--ds-material-overlay-border, var(--ds-color-border-subtle));'
    );
    expect(SKIN).not.toContain('border: 1px solid var(--ds-color-border-subtle);');
    expect(SKIN).not.toContain('--ds-confirm-dialog-border-color');
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('leaves the intent tints governed and the panel depth in its comma list', () => {
    // The 10%/22% intent washes are semantic state affordances on the icon
    // well, not decorative primary sweeps — they stay.
    expect(SKIN).toContain('var(--ds-modal-shadow, var(--ds-elevation-4))');
    expect(SKIN).not.toContain('var(--ds-material-overlay-shadow');
  });
});
