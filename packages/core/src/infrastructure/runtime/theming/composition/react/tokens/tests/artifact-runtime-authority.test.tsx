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

    // Structural: the compile's radius, not the config's `99px`.
    expect(tokens.radiusMd).toBe(compiled.tokenOverrides.borderRadius?.md);
    expect(tokens.radiusMd).not.toBe('99px');

    // Personality: the compile's dial and padding, not the config's.
    expect(tokens.intensity).toBe(compiled.personality.animation?.intensity);
    expect(tokens.intensity).not.toBe(0.05);
    expect(tokens.paddingDensity).toBe('compact');
    expect(tokens.paddingDensity).not.toBe('spacious');

    // Density: the ARTIFACT's semantic posture composed over the compile's own
    // structural scale. The config asked for `spacious` and a scale of 3.
    const expected = Math.round(
      16 * resolveEffectiveDensityScale(compiled.tokenOverrides.densityScale, 'compact'),
    );
    expect(tokens.spacing4).toBe(expected);
    expect(tokens.spacing4).toBe(
      Math.round(16 * resolveEffectiveDensityScale(compiled.tokenOverrides.densityScale, 'compact')),
    );
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
    // Not vacuous: these readings are the tenant's, not the baseline's, so the
    // comparison above would also fail if BOTH trees had fallen back.
    expect(withoutProp.paddingDensity).toBe('compact');
    expect(withoutProp.radiusMd).toBe(
      COMPILED.artifact.runtime?.runtime.tokenOverrides.borderRadius?.md,
    );

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
      'brandThemeToPersonality',
      'brandThemeToTokenOverrides',
    ]) {
      expect(source, read).not.toContain(read);
    }
    // ...and the one read that replaces them is present.
    expect(source).toContain('useEngineVisualDeclaration()?.runtime');
  });
});
