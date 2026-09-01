/**
 * AlertDialog modern engine — overlay material commitment (edge).
 *
 * The dialog panel is a genuinely floating layer, so its edge belongs to the
 * SAME overlay material register as ContextMenu, Popconfirm and Dropdown.
 * Before this contract it hard-wired `--ds-color-border-subtle` with no rung a
 * tenant could reach. The role channel is read DIRECTLY — no new public
 * `--ds-alert-dialog-*` token is minted here. `--ds-material-overlay-border` is
 * declared nowhere under `foundation/tokens/css`, so the rung reaches paint.
 *
 * The panel's box-shadow is deliberately NOT re-keyed: it is a comma list
 * (inset top-light + `--ds-modal-shadow`), and a none-capable role channel
 * inside a comma list lets an authored `none` void the whole declaration.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('AlertDialog modern engine — overlay material commitment', () => {
  it('routes the panel edge through the overlay material role', () => {
    // The role channel is the only rung; the shipped subtle border survives as
    // the terminal fallback. A family lane must not mint new public tokens.
    expect(SKIN).toContain(
      'border: 1px solid var(--ds-material-overlay-border, var(--ds-color-border-subtle));'
    );
    expect(SKIN).not.toContain('border: 1px solid var(--ds-color-border-subtle);');
    expect(SKIN).not.toContain('--ds-alert-dialog-border-color');
  });

  it('reads no retired highlight channel', () => {
    // Retired lane-wide for the none-in-a-list reason (dropdown.css:209-212).
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('keeps glass on the backdrop and off the panel', () => {
    // Spec section 5: backdrop-filter is a BACKDROP role. The only reads live
    // on [data-part='backdrop'] plus the neutralising `none` resets.
    const glassReads = SKIN.match(/^[^\n]*backdrop-filter:[^\n]*$/gm) ?? [];
    expect(glassReads.length).toBeGreaterThan(0);
    for (const read of glassReads) {
      expect(read).toMatch(/none|--ds-glass-backdrop-filter|--ds-modal-overlay-backdrop/);
    }
    expect(SKIN).toContain(
      "backdrop-filter: var(--ds-glass-backdrop-filter, var(--ds-modal-overlay-backdrop));"
    );
  });
});
