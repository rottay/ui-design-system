/**
 * TagInput modern engine — focus ring authority.
 *
 * The focus halo must fall back to `--ds-shadow-focus-ring`, the channel every
 * tenant artifact re-declares (rottay light + dark), not `--ds-focus-ring`,
 * which is declared once in the default theme only and has a different shape
 * (a two-layer offset ring rather than the 3px halo). `--ds-tag-input-shadow-
 * focus` has no `:root` default anywhere, so the fallback below is the value
 * that actually reaches paint — this family was the only picker in the inputs
 * batch frozen at the default theme while TimePicker and TreeSelect followed
 * the tenant.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the header names the very channels asserted below, so
// raw text would both false-green the pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tag-input.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('TagInput modern engine — focus ring authority', () => {
  it('routes the focus halo through the tenant-writable ring channel', () => {
    expect(SKIN).toContain('var(--ds-tag-input-shadow-focus, var(--ds-shadow-focus-ring))');
  });

  it('never reads the default-theme-only offset ring', () => {
    expect(SKIN).not.toMatch(/var\(\s*--ds-focus-ring\s*[,)]/);
  });

  it('keeps the none-capable ring in a WHOLE-VALUE box-shadow position', () => {
    // A `none` authored by a tenant is legal only as an entire box-shadow
    // value; riding a comma list would void the whole declaration. The ring is
    // the SOLE value of its declaration — the only comma is the var fallback.
    expect(SKIN).toMatch(
      /box-shadow:\s*var\(--ds-tag-input-shadow-focus,\s*var\(--ds-shadow-focus-ring\)\);/
    );
  });
});
