/**
 * HoverCard modern engine — overlay material commitment.
 *
 * The card is a transient anchored panel of the SAME widget class as Dropdown
 * and ContextMenu, so it must read the SAME overlay material role: a tenant's
 * overlay material has to reach every anchored panel, not only some of them.
 * Before this contract the card hard-wired `--ds-surface-card` plus its own
 * border and carried an ungoverned 5%-primary sweep no tenant could switch off.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('HoverCard modern engine — overlay material commitment', () => {
  it('routes ground, texture and border through the overlay material role', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none)');
    expect(SKIN).toContain('var(--ds-material-overlay-background, var(--ds-surface-card))');
    // Family chrome stays senior, the role channel is the next rung, the old
    // mix survives as the terminal fallback (context-menu.css ordering).
    expect(SKIN).toMatch(
      /--ds-hover-card-border-color,\s*var\(\s*--ds-material-overlay-border,\s*color-mix\(in srgb, var\(--ds-color-border\) 86%, var\(--ds-color-primary\) 14%\)\s*\)/
    );
  });

  it('keeps the none-capable shadow role in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value. If this role
    // channel ever rides a comma list, a tenant authoring `none` voids the
    // whole declaration and silently amputates the card's depth.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(\s*--ds-hover-card-shadow,\s*var\(\s*--ds-material-overlay-shadow,\s*var\(--ds-elevation-3\)\s*\)\s*\);/
    );
    const panelShadow = SKIN.match(/box-shadow:\s*var\(\s*--ds-hover-card-shadow[\s\S]*?;/)?.[0] ?? '';
    expect(panelShadow).not.toContain(',\n    0');
    expect(panelShadow).not.toContain('inset');
  });

  it('reads no retired highlight channel', () => {
    // Retired lane-wide for the same none-in-a-list reason (dropdown.css:209-212).
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('drops the ungoverned primary sweep from the anchored card', () => {
    // One emphasis moment, spent on the lift. An accent gradient no tenant can
    // switch off is a role violation; context-menu.css retired the identical layer.
    expect(SKIN).not.toContain('color-mix(in srgb, var(--ds-color-primary) 5%, transparent)');
    // The dark-lift layer that carries the elevation step must remain.
    expect(SKIN).toContain(
      'linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3))'
    );
    expect(SKIN).not.toContain('background: var(--ds-surface-card);');
  });
});
