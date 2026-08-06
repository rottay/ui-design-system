/**
 * Toast modern skin -- overlay-tier material commitment.
 *
 * A toast is a floating transient layer, so it must read the OVERLAY material
 * channels that drawer, popover, dropdown and tooltip already read. It used to
 * read --ds-material-card-texture, which stranded the transient layer on the
 * card facet whenever a tenant moved the overlay tier. The depth chain is a
 * whole-value read so a none-capable role cannot void the declaration.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/toast.css'),
  'utf8',
);

describe('Toast modern skin overlay material', () => {
  it('reads the overlay texture channel, never the card one', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none),');
    expect(SKIN).not.toMatch(/var\(--ds-material-card-texture/);
  });

  it('routes rest depth through the overlay shadow role as a whole value', () => {
    expect(SKIN).toContain(
      'box-shadow: var(--ds-material-overlay-shadow, var(--ds-elevation-3));',
    );
  });
});
