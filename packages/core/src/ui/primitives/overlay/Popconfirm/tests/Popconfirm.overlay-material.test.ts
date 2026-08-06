/**
 * Popconfirm modern engine — overlay material commitment.
 *
 * The mini-confirm is a transient anchored panel of the SAME widget class as
 * Dropdown, ContextMenu and HoverCard, so it must read the SAME overlay
 * material role. Before this contract it hard-wired `--ds-surface-card`, its
 * own `--ds-color-border-subtle` border and a bare `--ds-elevation-3` depth,
 * and carried an ungoverned 5%-primary sweep no tenant could switch off.
 * None of the family channels below has a `:root` default anywhere, so the
 * inserted role rung reaches paint immediately.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header documents the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/popconfirm.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Popconfirm modern engine — overlay material commitment', () => {
  it('routes ground, texture and border through the overlay material role', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none)');
    expect(SKIN).toContain('var(--ds-material-overlay-background, var(--ds-surface-card))');
    // Family chrome stays senior, the role channel is the next rung, the
    // shipped subtle border survives as the terminal fallback.
    expect(SKIN).toMatch(
      /--ds-popconfirm-border-color,\s*var\(\s*--ds-material-overlay-border,\s*var\(--ds-color-border-subtle\)\s*\)/
    );
    expect(SKIN).not.toContain('border: 1px solid var(--ds-color-border-subtle);');
  });

  it('keeps the none-capable shadow role in a WHOLE-VALUE position', () => {
    // FAB-05: `none` is legal only as an entire box-shadow value. If this role
    // channel ever rides a comma list, a tenant authoring `none` voids the
    // whole declaration and silently amputates the panel's depth.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(\s*--ds-popconfirm-shadow,\s*var\(\s*--ds-material-overlay-shadow,\s*var\(--ds-elevation-3\)\s*\)\s*\);/
    );
    const panelShadow = SKIN.match(/box-shadow:\s*var\(\s*--ds-popconfirm-shadow[\s\S]*?;/)?.[0] ?? '';
    expect(panelShadow).not.toContain(',\n    0');
    expect(panelShadow).not.toContain('inset');
    // The bare, unreachable depth is gone.
    expect(SKIN).not.toContain('box-shadow: var(--ds-elevation-3);');
  });

  it('reads no retired highlight channel', () => {
    // Retired lane-wide for the same none-in-a-list reason (dropdown.css:209-212).
    expect(SKIN).not.toContain('--ds-material-overlay-highlight');
  });

  it('drops the ungoverned primary sweep from the anchored panel', () => {
    // One emphasis moment, spent on the lift. An accent gradient no tenant can
    // switch off is a role violation; context-menu.css retired the identical layer.
    expect(SKIN).not.toContain('color-mix(in srgb, var(--ds-color-primary) 5%, transparent)');
    // The dark-lift layer that carries the elevation step must remain.
    expect(SKIN).toContain(
      'linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3))'
    );
    expect(SKIN).not.toContain('background-color: var(--ds-surface-card);');
  });
});
