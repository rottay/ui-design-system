/**
 * Contract for the three-channel density axis.
 *
 * `--ds-density-scale` is structural and white-labelable. The semantic
 * compact/comfortable/spacious tenant appearance lives in
 * `--ds-density-mode-factor`; a component/subtree posture lives in the separate
 * `--ds-density-local-factor`. CSS projects the same canonical factor map for
 * local posture, while appearance compilation and useTokens call the canonical
 * resolver for global appearance.
 *
 * Which boundary writes which channel is itself the law: a NON-root
 * `data-density` boundary writes only the local factor, and the root boundary
 * writes only the semantic factor it already represents. Neither writes both,
 * so the two channels can never multiply the same decision twice.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DENSITY_MODE_FACTORS,
  DENSITY_SCALE_BOUNDS,
  resolveEffectiveDensityScale,
} from '@/foundation/tokens/ts/foundation/base/density';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const densityCss = source('src/foundation/tokens/css/foundation/base/density.css');
const spacingCss = source('src/foundation/tokens/css/foundation/base/spacing.css');
const defaultThemeCss = source('src/foundation/tokens/css/foundation/themes/default.css');
const useTokensSource = source(
  'src/infrastructure/runtime/theming/composition/react/tokens/index.ts',
);
const appearanceSource = source(
  'src/infrastructure/compilers/kernel/runtime/appearance/index.ts',
);
const appearancePostureSource = source(
  'src/infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts',
);

function parseCssFactors(css: string): Record<string, number> {
  const factors: Record<string, number> = {};
  const rule =
    /\[data-density=['"](compact|comfortable|spacious)['"]\]:not\(:root\)\s*\{[^}]*?--ds-density-local-factor:\s*([\d.]+)\s*;?[^}]*\}/g;
  for (const match of css.matchAll(rule)) factors[match[1]] = Number(match[2]);
  return factors;
}

function parseRootFactors(css: string): Record<string, number> {
  const factors: Record<string, number> = {};
  const rule =
    /:root\[data-density=['"](compact|comfortable|spacious)['"]\]\s*\{[^}]*?--ds-density-mode-factor:\s*([\d.]+)\s*;?[^}]*\}/g;
  for (const match of css.matchAll(rule)) factors[match[1]] = Number(match[2]);
  return factors;
}

function spacingDeclarations(css: string): string[] {
  return [...css.matchAll(/--ds-spacing-(?!0\b)\d+\s*:\s*calc\([^;]+\);/g)]
    .map((match) => match[0]);
}

function globalEffectiveScaleBounds(css: string): { min: number; max: number } | null {
  const match = css.match(
    /--ds-density-global-effective-scale\s*:\s*clamp\(\s*([\d.]+),\s*calc\(var\(--ds-density-scale,\s*1\)\s*\*\s*var\(--ds-density-mode-factor,\s*1\)\),\s*([\d.]+)\s*\);/,
  );
  return match ? { min: Number(match[1]), max: Number(match[2]) } : null;
}

function localEffectiveScaleBounds(css: string): { min: number; max: number } | null {
  const match = css.match(
    /--ds-density-effective-scale\s*:\s*clamp\(\s*([\d.]+),\s*calc\(\s*var\(--ds-density-global-effective-scale,\s*1\)\s*\*\s*var\(--ds-density-local-factor,\s*1\)\s*\),\s*([\d.]+)\s*\);/,
  );
  return match ? { min: Number(match[1]), max: Number(match[2]) } : null;
}

const cssFactors = parseCssFactors(densityCss);
const rootFactors = parseRootFactors(densityCss);
const LOCAL_PROJECTION_SELECTOR =
  ":where(\n  [data-density='compact']:not(:root),";
const NUMERIC_SPACING_STEPS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40,
  44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const;
const SEMANTIC_SPACING_ALIASES = [
  'xxxs',
  'xxs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  'gutter',
  'section',
  'container',
  'component-gap',
  'component-padding',
  'component-margin',
] as const;

describe('density authority contract', () => {
  it('projects every CSS attribute mode from the canonical factor table', () => {
    expect(cssFactors).toEqual({
      compact: DENSITY_MODE_FACTORS.compact,
      comfortable: DENSITY_MODE_FACTORS.comfortable,
      spacious: DENSITY_MODE_FACTORS.spacious,
    });
    expect(DENSITY_MODE_FACTORS.normal).toBe(DENSITY_MODE_FACTORS.comfortable);
  });

  it('composes structural and semantic density identically for numeric tokens', () => {
    expect(resolveEffectiveDensityScale(0.9, 'compact')).toBeCloseTo(
      0.9 * cssFactors.compact,
    );
    expect(resolveEffectiveDensityScale(1.125, 'spacious')).toBeCloseTo(
      1.125 * cssFactors.spacious,
    );
  });

  it('requires useTokens and appearance to consume the canonical resolver', () => {
    expect(useTokensSource).toContain('resolveEffectiveDensityScale');
    expect(useTokensSource).not.toContain('appearanceDensityFactor');
    expect(appearanceSource).toContain('appearancePostureToVariables');
    expect(appearancePostureSource).toContain('resolveDensityModeFactor');
    expect(appearancePostureSource).toContain('DENSITY_MODE_FACTOR_VARIABLE');
  });

  it('keeps global appearance and local component posture on separate channels', () => {
    expect(densityCss).toContain('--ds-density-local-factor: 0.85');
    expect(densityCss).toContain("[data-density='compact']:not(:root)");
    // The root must never contribute a LOCAL multiplier. :root already folds
    // the mode factor into --ds-density-effective-scale, so a root local factor
    // is exactly the double application this contract exists to prevent.
    expect(densityCss).not.toMatch(
      /\[data-density=['"]compact['"]\]\s*\{[^}]*--ds-density-local-factor:/,
    );
    // ...and a non-root boundary must never claim the global semantic channel,
    // which would erase the tenant posture for its whole subtree.
    expect(densityCss).not.toMatch(
      /\[data-density=['"]compact['"]\]:not\(:root\)\s*\{[^}]*--ds-density-mode-factor:/,
    );
    expect(appearancePostureSource).toContain('DENSITY_MODE_FACTOR_VARIABLE');
    expect(appearancePostureSource).not.toContain('DENSITY_LOCAL_FACTOR_VARIABLE');
  });

  it('paints the root posture through the semantic channel it represents', () => {
    // Without this the root boundary is inert: every posture rule was scoped
    // :not(:root) while RootDensityProvider stamps document.documentElement.
    expect(rootFactors).toEqual({
      compact: DENSITY_MODE_FACTORS.compact,
      spacious: DENSITY_MODE_FACTORS.spacious,
    });
    // `comfortable` is the identity factor and is deliberately undeclared:
    // RootDensityProvider stamps it whenever no preference exists, so writing
    // `1` at :root[data-density] specificity would erase a static BrandTheme
    // posture compiled into the lower-specificity html[data-tenant] artifact.
    expect(densityCss).not.toMatch(/:root\[data-density=['"]comfortable['"]\]/);
  });

  it.each([
    ['base spacing', spacingCss],
    ['default theme spacing', defaultThemeCss],
  ])('%s composes structural, appearance and local factors', (_label, css) => {
    const declarations = spacingDeclarations(css);
    expect(declarations.length).toBeGreaterThan(0);
    expect(globalEffectiveScaleBounds(css)).toEqual(DENSITY_SCALE_BOUNDS);
    expect(localEffectiveScaleBounds(css)).toEqual(DENSITY_SCALE_BOUNDS);
    for (const declaration of declarations) {
      expect(declaration).toContain('var(--ds-density-effective-scale, 1)');
    }
  });

  it('reprojects the effective ramp at local density boundaries', () => {
    // A factor declared on a descendant cannot retroactively recompute a
    // custom property inherited from :root. This local redeclaration is what
    // makes nested compact/comfortable/spacious subtrees real rather than an
    // attribute-only promise.
    expect(densityCss).toContain(LOCAL_PROJECTION_SELECTOR);
    expect(globalEffectiveScaleBounds(densityCss)).toEqual(DENSITY_SCALE_BOUNDS);
    expect(localEffectiveScaleBounds(densityCss)).toEqual(DENSITY_SCALE_BOUNDS);
    for (const step of NUMERIC_SPACING_STEPS) {
      const declaration = new RegExp(
        `--ds-spacing-${step}\\s*:\\s*calc\\([^;]+var\\(--ds-density-effective-scale,\\s*1\\)[^;]*\\);`,
      );
      expect(densityCss).toMatch(declaration);
    }
    for (const alias of SEMANTIC_SPACING_ALIASES) {
      expect(densityCss).toContain(`--ds-spacing-${alias}:`);
    }
  });

  it('keeps fixed accessibility floors outside density projection', () => {
    expect(densityCss).not.toContain('--ds-touch-target-min:');
    expect(densityCss).not.toContain('!important');
  });
});
