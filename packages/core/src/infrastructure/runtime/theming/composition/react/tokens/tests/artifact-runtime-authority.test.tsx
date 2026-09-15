/**
 * `useTokens` reads the MOUNTED ARTIFACT's compile.
 *
 * The negative this file exists to prove is a precedence one. A tenant whose
 * compiled artifact says one thing and whose forged config fields say another
 * must get the ARTIFACT's answer — and it must get it because the hook reads
 * those fields nowhere, not because they happen to lose a comparison. Both
 * halves are asserted: the rendered value, and the absence of the read in the
 * hook's own source.
 *
 * Those fields cannot be written through the type, so the fixture smuggles
 * them past it with one cast. That is the point: even a transport that forges
 * them at runtime moves nothing.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import {
  compileTenantTheme,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { emitTenantThemeArtifactForSsr } from '@/infrastructure/runtime/theming/foundation/visual-authority';
import { stampTenantThemeScope } from '@/infrastructure/runtime/theming/foundation/visual-authority/tests/mount-fixture';
import { resolveEffectiveDensityScale } from '@/foundation/tokens/ts/foundation/base/density';

import { useTokens } from '..';

const SLUG = 'artifact-authority';

/**
 * One compile, two projections. `compileTenantTheme` returns the artifact and
 * the engine visual from the SAME lowering, so the CSS the mount proves and the
 * `ThemeCompilation.runtime` the hook reads cannot disagree by construction.
 */
const COMPILED = compileTenantTheme(
  hydrateTenantThemeConfig(
    {
      schemaVersion: 1,
      mode: 'simple',
      appearance: {
        palette: { primary: '#991b1b' },
        density: 'compact',
        motion: { intensity: 0.5 },
      },
    },
    { tenantId: `tenant_${SLUG}`, slug: SLUG, verticalKey: 'bithire', rowVersion: 1 },
  ),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

/**
 * What the config says instead. No field here exists on `TenantConfig`; the
 * cast is how a hostile or stale transport would still put them on the object,
 * and each one contradicts the compile above.
 */
const SMUGGLED = {
  slug: SLUG,
  name: 'Artifact authority',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  vertical: 'bithire',
  branding: { companyName: 'Artifact authority' },
  engine: 'rustic',
  personality: {
    animation: { intensity: 0.05 },
    card: { paddingDensity: 'spacious' },
  },
  tokenOverrides: { borderRadius: { md: '99px' }, densityScale: 3 },
  appearance: { general: { density: 'spacious' } },
  brandTheme: { id: SLUG, name: 'Artifact authority', surfaces: { densityScale: 3 } },
} as unknown as TenantConfig;

const mounted: HTMLStyleElement[] = [];

function mountArtifact(artifact: TenantThemeArtifact): void {
  const { attributes, css } = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });
  const style = document.createElement('style');
  for (const [name, value] of Object.entries(attributes)) style.setAttribute(name, value);
  style.textContent = css;
  document.head.appendChild(style);
  stampTenantThemeScope(artifact);
  mounted.push(style);
}

afterEach(() => {
  cleanup();
  while (mounted.length > 0) mounted.pop()?.remove();
});

function Probe(): React.ReactElement {
  const tokens = useTokens();
  return (
    <pre data-testid="tokens">
      {JSON.stringify({
        radiusMd: tokens.borderRadius.md,
        intensity: tokens.personality.animation.intensity,
        paddingDensity: tokens.personality.card.paddingDensity,
        spacing4: tokens.spacing[4],
      })}
    </pre>
  );
}

function readTokens(): Record<string, unknown> {
  return JSON.parse(screen.getByTestId('tokens').textContent ?? '{}');
}

describe('useTokens resolves the mounted artifact, not the config', () => {
  it('gives the ARTIFACT value on every channel the config contradicts', () => {
    mountArtifact(COMPILED.artifact);

    render(
      <DesignSystemProvider
        tenantConfig={SMUGGLED}
        visualAuthority={{ authority: 'compiled-artifact', artifact: COMPILED.artifact }}
        engineVisual={COMPILED.engineVisual}
        vertical="bithire"
        forceEngine="modern"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );

    const tokens = readTokens();
    const compiled = COMPILED.engineVisual.runtime;

    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // this delta over a bithire baseline that authors neither radius nor card
    // chrome publishes `borderRadius: {}` and `card: {}` (measured), so those
    // two channels moved from "the artifact outranks the config" to "the
    // artifact is silent AND the config is still not read" -- the same law,
    // read on its other side. The motion dial, which the compile does state,
    // carries the positive leg.

    // Personality: the compile's own dial, not the config's.
    expect(compiled.personality.animation?.intensity).toBe(0.5);
    expect(tokens.intensity).toBe(compiled.personality.animation?.intensity);
    expect(tokens.intensity).not.toBe(0.05);

    // Structural: the compile states no radius, so the baseline stands -- and
    // the config's forged `99px` reaches nothing either way.
    expect(compiled.tokenOverrides.borderRadius?.md).toBeUndefined();
    expect(tokens.radiusMd).not.toBe('99px');

    // Same on the card: silent compile, and the config's `spacious` is still
    // nowhere in the reading.
    expect(compiled.personality.card?.paddingDensity).toBeUndefined();
    expect(tokens.paddingDensity).not.toBe('spacious');

    // Density: the ARTIFACT's semantic posture still reaches the tokens, and
    // the config's `spacious` with a scale of 3 still reaches nothing.
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the compile publishes no structural `densityScale`, so the composition
    // can no longer be recomputed from its runtime half. It is measured
    // against the same provider with no artifact mounted instead, which keeps
    // the posture's effect asserted without pinning a scale the compile does
    // not carry: 16 with no artifact, 13 under this compact artifact.
    expect(compiled.tokenOverrides.densityScale).toBeUndefined();
    cleanup();

    render(
      <DesignSystemProvider
        tenantConfig={SMUGGLED}
        vertical="bithire"
        forceEngine="modern"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );
    const baseline = readTokens();

    expect(baseline.spacing4).toBe(Math.round(16 * resolveEffectiveDensityScale(undefined, 'normal')));
    expect(tokens.spacing4).toBeLessThan(Number(baseline.spacing4));
    expect(tokens.spacing4).toBe(13);
  });

  it('publishes the compiled half from the ARTIFACT, with no engineVisual prop', () => {
    // The connection this file's first case could not state: the artifact
    // carries the non-CSS half of its own compile, so an application that
    // mounts it and passes nothing else gets the same tenant layer. Measured by
    // rendering the identical tree twice -- once with the prop, once without --
    // and comparing the readings rather than re-pinning them.
    mountArtifact(COMPILED.artifact);

    render(
      <DesignSystemProvider
        tenantConfig={SMUGGLED}
        visualAuthority={{ authority: 'compiled-artifact', artifact: COMPILED.artifact }}
        engineVisual={COMPILED.engineVisual}
        vertical="bithire"
        forceEngine="modern"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );
    const withProp = readTokens();
    cleanup();

    render(
      <DesignSystemProvider
        tenantConfig={SMUGGLED}
        visualAuthority={{ authority: 'compiled-artifact', artifact: COMPILED.artifact }}
        vertical="bithire"
        forceEngine="modern"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );
    const withoutProp = readTokens();

    expect(withoutProp).toEqual(withProp);
    // Not vacuous: this reading is the tenant's, not the baseline's, so the
    // comparison above would also fail if BOTH trees had fallen back.
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the anchor moves to the motion dial, the channel this compile still
    // states, because radius and card padding are now empty in its runtime
    // half. 0.5 is the tenant's own decision and differs from the bithire
    // preset's 0.55, so a fallback could not produce it.
    expect(withoutProp.intensity).toBe(
      COMPILED.artifact.runtime?.runtime.personality.animation?.intensity,
    );
    expect(withoutProp.intensity).toBe(0.5);

    // NEGATIVE CONTROL. `palette.primary` is a paint decision: it belongs to
    // the artifact's CSS and must not arrive a second time as a JS value, or
    // the runtime becomes the second painter the authority barrier exists to
    // prevent. It is in the artifact's variables and nowhere in its runtime
    // half, which is what makes the absence in the readings a law and not an
    // accident of what `Probe` happens to print.
    expect(COMPILED.artifact.variables['--ds-color-primary']).toBe('#991b1b');
    expect(JSON.stringify(COMPILED.artifact.runtime?.runtime)).not.toContain('#991b1b');
  });

  it('resolves the engine/vertical baseline when no artifact is mounted', () => {
    // The other side of the same law: absence is absence. A tenant that
    // published no compile contributes no tenant layer, rather than falling
    // back to whatever the config happens to carry.
    render(
      <DesignSystemProvider
        tenantConfig={{
          slug: 'no-artifact',
          name: 'No artifact',
          theme: 'light',
          plan: 'enterprise',
          features: ['all'],
          vertical: 'bithire',
          branding: { companyName: 'No artifact' },
        }}
        vertical="bithire"
        forceEngine="modern"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>,
    );

    const tokens = readTokens();
    expect(tokens.radiusMd).not.toBe(COMPILED.engineVisual.runtime.tokenOverrides.borderRadius?.md);
    expect(tokens.paddingDensity).not.toBe('compact');
  });

  it('deleted the config merge instead of letting it lose', () => {
    // A precedence assertion alone would stay green against a losing branch
    // that still existed. The source names none of these reads.
    const source = readFileSync(resolve(__dirname, '../index.ts'), 'utf8');
    for (const read of [
      'config.brandTheme',
      'config.tokenOverrides',
      'config.personality',
      'config.appearance',
      'flatThemeToPersonality',
      'flatThemeToTokenOverrides',
    ]) {
      expect(source, read).not.toContain(read);
    }
    // ...and the one read that replaces them is present.
    expect(source).toContain('useEngineVisualDeclaration()?.runtime');
  });
});
