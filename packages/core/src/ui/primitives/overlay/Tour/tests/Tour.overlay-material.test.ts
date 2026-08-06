/**
 * Tour modern engine — overlay material commitment (depth).
 *
 * The step panel floats above a spotlight scrim, so its depth belongs to the
 * overlay material register. It previously carried a BARE `--ds-elevation-3`
 * with no rung any tenant could reach. The role channel is read DIRECTLY — no
 * new public `--ds-tour-*` token is minted. `--ds-material-overlay-shadow` is
 * declared nowhere under `foundation/tokens/css`, so the rung reaches paint.
 *
 * The panel's background deliberately stays on the CARD material role: the
 * shipped chain is tenant-authored per vertical and re-keying it would change
 * the resolved fill, which is out of scope for a depth commitment.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tour.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Tour modern engine — overlay material commitment', () => {
  it('keeps the none-capable shadow role in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value. If this role
    // channel ever rides a comma list, a tenant authoring `none` voids the
    // whole declaration and silently amputates the step panel's depth.
    expect(SKIN).toContain(
      'box-shadow: var(--ds-material-overlay-shadow, var(--ds-elevation-3));'
    );
    const panelShadow =
      SKIN.match(/box-shadow:\s*var\(\s*--ds-material-overlay-shadow[\s\S]*?;/)?.[0] ?? '';
    expect(panelShadow).not.toContain('inset');
    expect(panelShadow).not.toContain(', 0');
    // The bare, unreachable depth is gone, and no new family token replaced it.
    expect(SKIN).not.toContain('box-shadow: var(--ds-elevation-3);');
    expect(SKIN).not.toContain('--ds-tour-shadow');
  });

  it('reads no retired highlight channel', () => {
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('leaves the panel fill on its shipped card material chain', () => {
    expect(SKIN).toContain(
      'var(--ds-tour-surface-bg, var(--ds-material-card-background, var(--ds-surface-card)))'
    );
  });

  it('takes the next-action ink from the contrast-safe primary foreground', () => {
    // The overlay-foreground arm is unauthored on some tenants, so the chain
    // fell through to the dark on-primary base and painted black on black.
    const nextInk = SKIN.match(/--ds-tour-action-next-ink,[^;]*/g) ?? [];
    expect(nextInk.length).toBeGreaterThan(0);
    for (const decl of nextInk) {
      expect(decl).toContain('--ds-color-primary-foreground');
      expect(decl).toContain('--ds-color-text-inverse');
      expect(decl).not.toContain('--ds-material-overlay-foreground');
    }
  });
});
