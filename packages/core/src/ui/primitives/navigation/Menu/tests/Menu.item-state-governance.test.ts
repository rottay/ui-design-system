/**
 * Menu modern engine — item state-background governance.
 *
 * The item hover already routed its ground through the governed
 * `--ds-menu-item-bg-hover` -> `--ds-sidebar-item-bg-hover` chain, but the two
 * sibling states of the same role did not: the `:active` press and the open /
 * selected-descendant trigger each hard-wired a bare
 * `color-mix(var(--ds-color-primary) N%, ...)` with no family channel above
 * it. That is an ungoverned wash — no tenant could restate the pressed or open
 * item ground even though it could restate hover. Both now read the same
 * governed chain and keep their original mix as the terminal fallback, so an
 * ungoverned theme renders byte-identically.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header names the very declarations asserted
// below, so raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('Menu modern engine — item state-background governance', () => {
  it('routes the pressed item ground through the governed item channel', () => {
    expect(SKIN).toMatch(
      /background:\s*var\(\s*--ds-menu-item-bg-hover,\s*var\(\s*--ds-sidebar-item-bg-hover,\s*color-mix\(in srgb, var\(--ds-color-primary\) 8%, var\(--ds-card-bg, var\(--ds-surface-card\)\)\)\s*\)\s*\);/
    );
  });

  it('routes the open / selected-descendant trigger ground through the same channel', () => {
    expect(SKIN).toMatch(
      /background:\s*var\(\s*--ds-menu-item-bg-hover,\s*var\(\s*--ds-sidebar-item-bg-hover,\s*color-mix\(in srgb, var\(--ds-color-primary\) 5%, var\(--ds-card-bg, var\(--ds-surface-card\)\)\)\s*\)\s*\);/
    );
  });

  it('leaves no bare primary wash at whole-declaration position for item grounds', () => {
    // A `background:` that opens straight into color-mix is the ungoverned
    // shape this contract removes; inside a var() fallback it is governed.
    expect(SKIN).not.toMatch(
      /background:\s*color-mix\(in srgb, var\(--ds-color-primary\) [5-9]%, var\(--ds-card-bg/
    );
  });
});
