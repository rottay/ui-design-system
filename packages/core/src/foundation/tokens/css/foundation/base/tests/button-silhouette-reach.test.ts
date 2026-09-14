/**
 * Contract for the button silhouette's reach: `--ds-radius-button` is the
 * DECISION channel `shape.button-style` declares, and the five
 * `--ds-button-{size}-radius` siblings are the live path the Modern skin paints
 * through. The decision has to sit between them and the surface ramp, or it is
 * emitted by both compilers and read by nobody.
 *
 * The defect this pins: the alias carried an unconditional `:root` value while
 * the per-size channels carried the ramp, so every corner resolved the ramp and
 * the declared channel moved nothing a reviewer could see.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const BORDERS = 'src/foundation/tokens/css/foundation/base/borders/index.css';
const BUTTON_BASE = 'src/foundation/tokens/css/presentation/components/button/index.css';
const BUTTON_SKIN = 'src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css';
const GEOMETRY = 'src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/geometry/index.ts';

const bordersCss = source(BORDERS);
const buttonBaseCss = source(BUTTON_BASE);
const buttonSkinCss = source(BUTTON_SKIN);
const geometrySource = source(GEOMETRY);

/** The ramp step each size falls back to when no silhouette is decided. */
const RAMP_STEP: Record<string, string> = {
  xs: '--ds-radius-sm',
  sm: '--ds-radius-md',
  md: '--ds-radius-md',
  lg: '--ds-radius-lg',
  xl: '--ds-radius-lg',
};

const SIZES = Object.keys(RAMP_STEP);

/** Collapse whitespace so a multi-line `var()` chain reads as one string. */
const flat = (css: string) => css.replace(/\s+/g, ' ');

describe('the button silhouette decision reaches the painted corner', () => {
  it('states no default, so the per-size ramp resolves underneath it', () => {
    // A value here would shadow every size: the alias is one channel and the
    // ramp is five steps, so a seeded alias flattens xs, sm, lg and xl.
    expect(flat(bordersCss)).toContain('--ds-radius-button: initial;');
    expect(flat(bordersCss)).not.toContain('--ds-radius-button: var(--ds-radius-md)');
  });

  it.each(SIZES)('lets the decision win over the ramp for size %s', (size) => {
    expect(flat(buttonBaseCss)).toContain(
      `--ds-button-${size}-radius: var( --ds-radius-button, var(--ds-button-${size}-border-radius) );`,
    );
  });

  it.each(SIZES)('keeps the ramp step for size %s underneath the decision', (size) => {
    expect(flat(buttonBaseCss)).toContain(
      `--ds-button-${size}-border-radius: var(${RAMP_STEP[size]});`,
    );
  });

  it.each(SIZES)('keeps the skin painting through the per-size channel for %s', (size) => {
    // The skin owns no radius policy: it reads the family channel, which is
    // where the decision enters.
    expect(flat(buttonSkinCss)).toContain(`var(--ds-button-${size}-radius,`);
  });

  it('leaves no reader of the decision without a fallback', () => {
    // The alias resolves to nothing until a tenant decides, so a bare
    // `var(--ds-radius-button)` is now a dropped declaration.
    const roots = ['src/foundation/tokens/css', 'src/components'];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })) {
        const child = join(dir, entry.name);
        if (entry.isDirectory()) walk(child);
        else if (entry.name.endsWith('.css') && !child.includes('/facade/artifacts/')) {
          if (source(child).includes('var(--ds-radius-button)')) offenders.push(child);
        }
      }
    };
    for (const root of roots) walk(root);
    expect(offenders, 'a bare var(--ds-radius-button) paints nothing at rest').toEqual([]);
    expect(
      source('src/foundation/tokens/ts/foundation/base/borders/index.ts'),
    ).toContain("button: 'var(--ds-radius-button, var(--ds-radius-md))'");
  });

  it('keeps the compiler writing the decision AND the five siblings for a chosen word', () => {
    // The wiring above is what makes the alias-only producer (a profile
    // default) reach paint; a chosen word still writes both.
    for (const channel of ['--ds-radius-button', ...SIZES.map((s) => `--ds-button-${s}-radius`)]) {
      expect(geometrySource).toContain(`"${channel}": radius`);
    }
  });
});
