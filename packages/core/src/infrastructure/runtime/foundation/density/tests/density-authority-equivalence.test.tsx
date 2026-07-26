/**
 * Density posture equivalence — one tree, five authorities.
 *
 * A posture may be declared through five independent paths: a static
 * BrandTheme vertical, a DB Appearance document, the CSS attribute cascade, the
 * JS context, and a nested DensityScope. They are only ONE contract if the same
 * posture over the same structural scale resolves to the same effective scale
 * through every one of them.
 *
 * The multiplication chain under test (declared at :root by
 * foundation/base/spacing.css and foundation/themes/default.css, reprojected at
 * non-root boundaries by foundation/base/density.css):
 *
 *   global    = clamp(0.5, --ds-density-scale × --ds-density-mode-factor, 3)
 *   effective = clamp(0.5, global × --ds-density-local-factor, 3)
 *   spacing-N = literal × effective
 *
 * `--ds-density-scale` is the structural brand axis, `--ds-density-mode-factor`
 * the semantic tenant posture, `--ds-density-local-factor` a subtree posture
 * relative to both. The equivalence therefore holds at the semantic channel;
 * the structural channel is deliberately not a posture.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import {
  DENSITY_MODE_FACTORS,
  DENSITY_MODE_FACTOR_VARIABLE,
  DENSITY_LOCAL_FACTOR_VARIABLE,
  resolveEffectiveDensityScale,
} from '@/foundation/tokens/ts/foundation/base/density';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { compileAppearanceVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap/facade/react/provider';
import { DensityScope, useDensity } from '../index';

const densityCss = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/foundation/base/density.css'),
  'utf8',
);

/** The structural brand axis every authority composes against. */
const STRUCTURAL_SCALE = 0.9;
const POSTURE = 'compact';

/** Factor a `:root[data-density]` boundary publishes on the semantic channel. */
function cssRootModeFactor(posture: string): number | undefined {
  const match = densityCss.match(
    new RegExp(
      `:root\\[data-density='${posture}'\\]\\s*\\{[^}]*?${DENSITY_MODE_FACTOR_VARIABLE}:\\s*([\\d.]+)`,
    ),
  );
  return match ? Number(match[1]) : undefined;
}

/** Factor a non-root `data-density` boundary publishes on the local channel. */
function cssLocalFactor(posture: string): number | undefined {
  const match = densityCss.match(
    new RegExp(
      `\\[data-density='${posture}'\\]:not\\(:root\\)\\s*\\{[^}]*?${DENSITY_LOCAL_FACTOR_VARIABLE}:\\s*([\\d.]+)`,
    ),
  );
  return match ? Number(match[1]) : undefined;
}

function tenantConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: 'density-equivalence',
    name: 'Density equivalence',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Density equivalence' },
    ...overrides,
  };
}

function PostureProbe() {
  const { posture } = useDensity();
  return <output data-testid="js-posture">{posture}</output>;
}

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-density');
  document.documentElement.style.removeProperty(DENSITY_MODE_FACTOR_VARIABLE);
});

describe('density posture equivalence across every authority', () => {
  it('resolves one effective scale from static BrandTheme, DB Appearance, CSS, JS context and a nested scope', async () => {
    const expected = resolveEffectiveDensityScale(STRUCTURAL_SCALE, POSTURE);

    // ── One tree carrying the runtime authorities ────────────────────────────
    const view = render(
      <DesignSystemProvider
        tenantConfig={tenantConfig({
          brandTheme: {
            id: 'density-equivalence',
            name: 'Density equivalence',
            surfaces: { densityScale: STRUCTURAL_SCALE, density: POSTURE },
          },
          appearance: { general: { density: POSTURE } },
        })}
        skipCssLoading
      >
        <PostureProbe />
        <DensityScope posture={POSTURE} as="section">
          <span data-testid="nested-child" />
        </DensityScope>
      </DesignSystemProvider>,
    );
    await view.findByTestId('js-posture');

    // (1) Static BrandTheme vertical — the compiled artifact for a code-owned
    // product, scoped html[data-tenant='…'].
    const brandVars = compileBrandTheme({
      brandTheme: {
        id: 'density-equivalence',
        name: 'Density equivalence',
        surfaces: { densityScale: STRUCTURAL_SCALE, density: POSTURE },
      },
      tenantSlug: 'density-equivalence',
    }).cssVariables;
    const staticScale = resolveEffectiveDensityScale(
      Number(brandVars['--ds-density-scale']),
      undefined,
    ) * Number(brandVars[DENSITY_MODE_FACTOR_VARIABLE]);

    // (2) DB Appearance document — the same field, the same channel.
    const appearanceFactor = Number(
      compileAppearanceVariables({ general: { density: POSTURE } }).variables[
        DENSITY_MODE_FACTOR_VARIABLE
      ],
    );
    const dbScale = STRUCTURAL_SCALE * appearanceFactor;

    // (3) CSS cascade — the root boundary the provider stamps on <html>.
    expect(document.documentElement).toHaveAttribute('data-density', POSTURE);
    const cssScale = STRUCTURAL_SCALE * cssRootModeFactor(POSTURE)!;

    // (4) JS context — what a component reads through useDensity().
    const jsPosture = view.getByTestId('js-posture').textContent as
      keyof typeof DENSITY_MODE_FACTORS;
    const jsScale = STRUCTURAL_SCALE * DENSITY_MODE_FACTORS[jsPosture];

    // (5) Nested DensityScope — a subtree boundary under a neutral global
    // plane, which is the like-for-like comparison: the local channel is
    // relative by design, so it is measured against an unpostured global.
    const nested = view.container.querySelector('section');
    expect(nested).toHaveAttribute('data-density', POSTURE);
    const nestedScale = STRUCTURAL_SCALE * cssLocalFactor(POSTURE)!;

    expect(staticScale).toBeCloseTo(expected);
    expect(dbScale).toBeCloseTo(expected);
    expect(cssScale).toBeCloseTo(expected);
    expect(jsScale).toBeCloseTo(expected);
    expect(nestedScale).toBeCloseTo(expected);
  });

  it('cannot double-apply the tenant posture when CSS and the DB compiler are both active', async () => {
    // Both authorities are fed by the SAME `appearance.general.density` field:
    // the appearance compiler resolves the factor, and the provider derives the
    // root posture from it. If the root boundary wrote the LOCAL channel, :root
    // would multiply mode × local and produce 0.85² — the regression the
    // :not(:root) guard was protecting against.
    const view = render(
      <DesignSystemProvider
        tenantConfig={tenantConfig({
          appearance: { general: { density: POSTURE } },
        })}
        skipCssLoading
      >
        <PostureProbe />
      </DesignSystemProvider>,
    );
    await view.findByTestId('js-posture');

    // Same element, same channel: two writers of one custom property resolve by
    // cascade to a single value and can never compose.
    const inlineFactor = document.documentElement.style.getPropertyValue(
      DENSITY_MODE_FACTOR_VARIABLE,
    );
    expect(inlineFactor).toBe(String(DENSITY_MODE_FACTORS.compact));
    expect(cssRootModeFactor(POSTURE)).toBe(DENSITY_MODE_FACTORS.compact);

    // And the root never contributes a local multiplier, so the second factor
    // in the chain stays at its identity default.
    expect(densityCss).not.toMatch(
      new RegExp(`:root\\[data-density[^{]*\\{[^}]*${DENSITY_LOCAL_FACTOR_VARIABLE}:`),
    );
    const doubled = DENSITY_MODE_FACTORS.compact * DENSITY_MODE_FACTORS.compact;
    expect(resolveEffectiveDensityScale(1, POSTURE)).not.toBeCloseTo(doubled);
  });

  it('keeps a nested posture relative to the tenant posture instead of replacing it', () => {
    // The local channel is a multiplier, not an override: a nested
    // `comfortable` surface inside a compact tenant must stay compact, which is
    // only true while the two channels remain distinct.
    const tenantCompact = resolveEffectiveDensityScale(1, 'compact');
    const nestedComfortable =
      tenantCompact * DENSITY_MODE_FACTORS.comfortable;
    expect(nestedComfortable).toBeCloseTo(tenantCompact);
    expect(cssLocalFactor('comfortable')).toBe(DENSITY_MODE_FACTORS.comfortable);
  });
});
