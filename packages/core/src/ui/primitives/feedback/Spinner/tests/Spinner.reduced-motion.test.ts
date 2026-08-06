/**
 * Modern Spinner skin -- reduced-motion is a real second state.
 *
 * Under prefers-reduced-motion the spinner must remain a legible, static
 * indicator: neither spinning nor collapsing into an ambiguous ring. The guard
 * therefore FREEZES the sweep instead of removing it, and promotes the resting
 * arc to full accent so the stopped ring still reads as a deliberate
 * two-segment indicator rather than a faint decorative circle.
 *
 * `animation: none` is forbidden here on two counts: it zeroes computed
 * `animationName`, which is the exact signal presence-gated unmounts read in
 * this codebase, and it discards the arc rather than stopping it. The paired
 * `animation-duration: 1ms` idiom is also wrong for THIS element: the sweep is
 * `infinite`, so a 1ms cadence flickers instead of resting, and a raw ms is not
 * a governed --ds-motion-* value. `animation-play-state: paused` carries no
 * time value at all and satisfies both laws.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/spinner.css'),
  'utf8',
);

const REDUCED_MOTION_BLOCK = (() => {
  const start = SKIN.indexOf('@media (prefers-reduced-motion: reduce)');
  expect(start).toBeGreaterThan(-1);
  const end = SKIN.indexOf('\n}', SKIN.indexOf('\n  }', start));
  return SKIN.slice(start, end);
})();

describe('Spinner modern skin reduced-motion state', () => {
  it('freezes the sweep instead of removing it', () => {
    expect(REDUCED_MOTION_BLOCK).toContain('animation-play-state: paused;');
  });

  it('never zeroes animationName, the presence-unmount signal', () => {
    expect(REDUCED_MOTION_BLOCK).not.toMatch(/animation:\s*none/);
    expect(REDUCED_MOTION_BLOCK).not.toMatch(/animation-name:\s*none/);
  });

  it('carries no raw ms or bezier literal, only governed motion values', () => {
    expect(REDUCED_MOTION_BLOCK).not.toMatch(/\d+m?s\b/);
    expect(REDUCED_MOTION_BLOCK).not.toMatch(/cubic-bezier\(/);
  });

  it('keeps the stopped ring legible by promoting the resting arc to full accent', () => {
    expect(REDUCED_MOTION_BLOCK).toContain(
      'border-inline-end-color: var(--ds-spinner-color, var(--ds-color-primary));',
    );
  });

  it('leaves the animated default untouched outside the guard', () => {
    expect(SKIN).toContain('animation: ds-spinner-modern-spin');
    expect(SKIN).toContain('var(--ds-spinner-spin-easing, linear) infinite;');
  });
});
