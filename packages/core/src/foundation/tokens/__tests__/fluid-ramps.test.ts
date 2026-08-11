/**
 * @fileoverview The fluid ramps introduce no new magnitudes (WO-ARC-05).
 *
 * A `clamp()` ramp is a path between two sizes, not a new size. WO-ARC-05's own
 * Do-NOT says so: "Do not invent fluid magnitudes outside the existing static
 * steps." This reads the shipped CSS and proves it -- both bounds of every fluid
 * token are values the static ramp already declares, and the linear term between
 * them lands on those bounds exactly at the two widths the WO-ENG-12 capture law
 * photographs (360px and 1280px).
 *
 * The arithmetic is re-derived here rather than trusted. A ramp whose slope and
 * intercept do not reproduce its own bounds is a ramp that lies about where it
 * starts and stops.
 *
 * THE CORPUS IS THE SHIPPED RAMP, NOT ONE FILE. `base/*.css` and
 * `themes/default.css` land in the same `rottay-tokens` layer, default.css
 * second, so where both declare a step the theme wins. Reading only the base
 * file measured the LOSING ramp: it passed until `edf91a41f` deleted the inert
 * base declarations, and the bounds it had been certifying turned out never to
 * have been shipped magnitudes.
 *
 * `--ds-font-size-fluid-{3xl,4xl,5xl}` are red for that reason and the red is
 * the finding: 1.875rem and 2.25rem are the base file's retired 3xl/4xl, which
 * default.css has always overridden with 1.5rem and 2rem. Re-anchoring them is
 * a repaint of the whole eight-ramp family across three verticals -- the five
 * that pass do so on overlapping values, not on a convention the shipped ramp
 * supports -- so it is a wave, not a test edit.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const FOUNDATION = join(__dirname, '../css/foundation/base');
const THEME = join(__dirname, '../css/foundation/themes/default.css');

const typography = readFileSync(join(FOUNDATION, 'typography.css'), 'utf-8');
const spacing = readFileSync(join(FOUNDATION, 'spacing.css'), 'utf-8');
/** The later declarer in the same layer, and therefore the winner. */
const theme = readFileSync(THEME, 'utf-8');

/** The widths the fluid ramps interpolate between, in rem. Mirrors WO-ENG-12's 360/1280. */
const MIN_WIDTH_REM = 22.5;
const MAX_WIDTH_REM = 80;

/**
 * Every value the static ramp declares, so a bound can be checked for
 * membership. Steps declare either a bare literal or the density-axis form
 * calc(<literal> * var(--ds-density-effective-scale, 1)); the literal is the
 * value at density 1 and the effective axis token is matched exactly so a
 * different multiplier cannot slip through as a plain step. The density
 * authority contract separately pins how that effective channel composes and
 * bounds its structural and semantic inputs.
 */
function staticSteps(css: string, prefix: string): Set<number> {
  const steps = new Set<number>();
  const pattern = new RegExp(
    `^\\s*${prefix}[a-z0-9-]+:\\s*(?:calc\\(\\s*)?([0-9.]+)rem(?:\\s*\\*\\s*var\\(--ds-density-effective-scale,\\s*1\\)\\s*\\))?;`,
    'gm'
  );
  for (const match of css.matchAll(pattern)) steps.add(Number(match[1]));
  return steps;
}

interface FluidRamp {
  name: string;
  min: number;
  intercept: number;
  slopePer100: number;
  max: number;
}

function fluidRamps(css: string, prefix: string): FluidRamp[] {
  const pattern = new RegExp(
    `^\\s*(${prefix}[a-z0-9-]+):\\s*clamp\\(\\s*([0-9.]+)rem,\\s*(-?[0-9.]+)rem \\+ (-?[0-9.]+)cqi,\\s*([0-9.]+)rem\\s*\\);`,
    'gm'
  );
  return [...css.matchAll(pattern)].map((match) => ({
    name: match[1],
    min: Number(match[2]),
    intercept: Number(match[3]),
    slopePer100: Number(match[4]),
    max: Number(match[5]),
  }));
}

const TYPE_RAMPS = fluidRamps(typography, '--ds-font-size-fluid-');
const SPACE_RAMPS = fluidRamps(spacing, '--ds-space-fluid-');
const TYPE_STEPS = staticSteps(`${typography}\n${theme}`, '--ds-font-size-');
const SPACE_STEPS = staticSteps(`${spacing}\n${theme}`, '--ds-spacing-');

const CASES = [
  { label: 'type', ramps: TYPE_RAMPS, steps: TYPE_STEPS, expected: 8, floor: 14 },
  { label: 'space', ramps: SPACE_RAMPS, steps: SPACE_STEPS, expected: 8, floor: 29 },
] as const;

describe.each(CASES)('the $label fluid ramp', ({ ramps, steps, expected, floor }) => {
  it('parses every declared fluid token', () => {
    // A ramp the regex cannot read is a ramp this file is not checking. Pin the
    // count so a hand-written token in a shape nothing validates fails here.
    expect(ramps).toHaveLength(expected);
  });

  it('reads a corpus that still holds the whole static ramp', () => {
    // The membership check below gets EASIER as the corpus shrinks, so the
    // corpus needs its own floor. Without one, deleting declarations silently
    // narrows what "a magnitude the ramp declares" means -- which is how the
    // type corpus fell from fifteen steps to five while this file stayed green.
    expect(steps.size).toBeGreaterThanOrEqual(floor);
  });

  it.each(ramps.map((ramp) => [ramp.name, ramp] as const))(
    '%s is bounded by two values the static ramp already declares',
    (_name, ramp) => {
      const shipped = [...steps].sort((a, b) => a - b).join(', ');
      expect(
        steps,
        `min ${ramp.min}rem is not a magnitude the shipped ramp declares (${shipped})`
      ).toContain(ramp.min);
      expect(
        steps,
        `max ${ramp.max}rem is not a magnitude the shipped ramp declares (${shipped})`
      ).toContain(ramp.max);
      expect(ramp.max).toBeGreaterThan(ramp.min);
    }
  );

  it.each(ramps.map((ramp) => [ramp.name, ramp] as const))(
    '%s reaches its own bounds at 360px and at 1280px',
    (_name, ramp) => {
      const at = (widthRem: number) => ramp.intercept + (ramp.slopePer100 / 100) * widthRem;
      // Four decimal places is the precision the tokens are authored to.
      expect(at(MIN_WIDTH_REM)).toBeCloseTo(ramp.min, 3);
      expect(at(MAX_WIDTH_REM)).toBeCloseTo(ramp.max, 3);
    }
  );
});

describe('the ramps interpolate against their container, not the viewport', () => {
  it('every fluid token uses cqi', () => {
    // A design system renders the same component at rail width, half width and
    // full width inside ONE viewport. A `vw` term cannot tell those apart.
    const declarations = [
      ...typography.matchAll(/--ds-font-size-fluid-[a-z0-9-]+:[^;]+;/g),
      ...spacing.matchAll(/--ds-space-fluid-[a-z0-9-]+:[^;]+;/g),
    ].map((match) => match[0]);

    expect(declarations.length).toBe(16);
    for (const declaration of declarations) {
      expect(declaration, `${declaration} interpolates against the viewport`).not.toMatch(/\d(vw|vi|vmin|vmax)\b/);
      expect(declaration).toContain('cqi');
    }
  });
});
