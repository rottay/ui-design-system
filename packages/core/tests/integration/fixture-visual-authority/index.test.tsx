/**
 * @fileoverview Generic render helpers must carry NO runtime visual payload.
 *
 * THE FAILURE THIS FENCES. `DesignSystemProvider` fails closed on a visual
 * authority conflict: a tenant that carries runtime paint (`branding` colours
 * or fonts, `tokenOverrides`, `appearance`, `personality`, `brandTheme`)
 * without a verified, mounted, compiled artifact is refused, and the provider
 * renders `<LoadingScreen />` instead of its children. That is the correct
 * production law. Applied to a *shared test fixture* it is silent and total:
 * every suite behind that helper renders an empty tree, every `findBy*` waits
 * out its own timeout, and the run reports opaque per-test timeouts that read
 * like a hung worker rather than a refused tenant.
 *
 * Both generic helpers shipped decorative brand colours that no assertion in
 * any suite ever read — `renderSurface` (98 suites) declared four, and
 * `renderWithEngine` (233 suites) declared six. They claimed a paint authority
 * they never exercised, so the barrier refused them and took every anatomy
 * suite behind them down at once.
 *
 * WHAT THIS FILE PINS, and deliberately not more:
 *
 * 1. each generic helper mounts its children — the default fixture is admitted;
 * 2. the barrier is live, so (1) is a real result and not a vacuous pass;
 * 3. the census law itself: identity is not paint, one colour is.
 *
 * It does NOT scan the helper sources for colour keys. A future helper that
 * genuinely needs tenant paint may mount a verified artifact and declare its
 * authority — that is the sanctioned path, and a source scan would forbid it.
 * What must never happen again is a helper carrying paint it cannot justify,
 * and that is exactly what a failed mount here reports.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '../../../src/foundation/contracts';
import { censusRuntimeVisualPayload } from '../../../src/infrastructure/runtime/theming/foundation/visual-authority';
import { renderSurface } from '../../../src/components/surfaces/foundation/common/test-utils';
import { renderWithEngine } from '../../support/engine';

const PROBE = 'fixture-visual-authority-probe';

function Probe(): React.ReactElement {
  return <div data-testid={PROBE} />;
}

/**
 * A single brand colour is enough to be refused. This is the negative control:
 * it proves the barrier is switched on in this environment, which is what makes
 * the two admission assertions above it meaningful.
 */
const PAINTED_TENANT: TenantConfig = {
  slug: 'painted-without-artifact',
  name: 'Painted Without Artifact',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Painted Without Artifact',
    primaryColor: '#2563eb',
  },
};

describe('generic render helpers carry no runtime visual payload', () => {
  it('mounts children through renderSurface', () => {
    const { queryByTestId } = renderSurface(<Probe />);

    expect(queryByTestId(PROBE)).not.toBeNull();
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'mounts children through renderWithEngine (%s)',
    (engine) => {
      const { queryByTestId } = renderWithEngine(<Probe />, engine);

      expect(queryByTestId(PROBE)).not.toBeNull();
    }
  );

  it('refuses a fixture that carries paint without a verified artifact', () => {
    const { queryByTestId } = renderSurface(<Probe />, { tenantConfig: PAINTED_TENANT });

    expect(queryByTestId(PROBE)).toBeNull();
  });
});

describe('the census law the helpers are admitted under', () => {
  it('does not count identity as paint', () => {
    const census = censusRuntimeVisualPayload({
      branding: { companyName: 'Surface Test Tenant' },
    });

    expect(census.visualBranding).toBe(false);
    expect(census.tokenOverrides).toBe(false);
    expect(census.personality).toBe(false);
    expect(census.brandTheme).toBe(false);
    expect(census.appearance).toBeUndefined();
  });

  it('counts a single brand colour as paint', () => {
    expect(
      censusRuntimeVisualPayload({
        branding: { companyName: 'Painted', primaryColor: '#2563eb' },
      }).visualBranding
    ).toBe(true);
  });
});
