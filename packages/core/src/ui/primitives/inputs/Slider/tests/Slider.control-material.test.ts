/**
 * Slider modern skin -- control-tier material commitment.
 *
 * The thumb is an in-flow control, so its rest depth must ride the CONTROL
 * material register and land on the one governed --ds-elevation-* scale. It
 * used to hard-wire --ds-shadow-sm, which stranded the thumb on a hand-tuned
 * shadow a tenant moving the control tier could never reach. The depth chain
 * is read at whole-value position so a none-capable role cannot void the
 * declaration, and the overlay register stays out of an in-flow control.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/slider.css'),
  'utf8',
);

describe('Slider modern skin control material', () => {
  it('routes thumb rest depth through the control shadow role as a whole value', () => {
    expect(SKIN).toContain(
      'box-shadow: var(--ds-slider-thumb-shadow, var(--ds-material-control-shadow, var(--ds-elevation-1)));',
    );
  });

  it('never falls back to the hand-tuned shadow scale for thumb rest depth', () => {
    expect(SKIN).not.toMatch(/var\(--ds-slider-thumb-shadow,\s*var\(--ds-shadow-sm\)\)/);
  });

  it('keeps the overlay register off the thumb and never reads the retired highlight', () => {
    expect(SKIN).not.toMatch(/--ds-slider-thumb-shadow,\s*var\(--ds-material-overlay-/);
    expect(SKIN).not.toMatch(/--ds-material-overlay-highlight/);
  });
});
