import { describe, expect, it } from 'vitest';

import { EFFECT_IDS, type EffectId } from '../../../../../foundation/contracts/runtime/effects';
import {
  EFFECT_DEFINITIONS,
  EFFECT_REGISTRY,
  EFFECT_REGISTRY_VERSION,
  EFFECT_RESEARCH_PROVENANCE,
  getEffectDefinition,
} from '../../runtime/registry';
import { resolveEffect, resolveEffectDefinition } from '../../runtime/registry/resolution';
import { isEffectDefinition, isEffectId } from '../../foundation/validation';

const SAFE_CONTEXT = Object.freeze({
  reducedMotion: false,
  pointer: 'fine' as const,
  power: 'normal' as const,
  pageVisible: true,
  inView: true,
  active: true,
  userPaused: false,
  allowAmbientMotion: true,
  allowContinuousMotion: true,
  continuousSlotAvailable: true,
});

// Real, pinned provenance for this repository's own MIT-licensed source. It is
// used only to exercise certification; no external research source is promoted.
const AUTHORIZED_SOURCE = Object.freeze({
  verification: 'verified' as const,
  usage: 'source' as const,
  repository: 'https://github.com/rottay/ui-design-system',
  revision: '3eaac217ccd4f26b59269ca92637b7f9a453c47e',
  licensePathAtRevision: 'LICENSE',
  licenseId: 'MIT',
  licenseSha256: '44576d15c34e9b97b6ccc17352b96ddee2d85ff22dcea7e30ab63e05cd5b27e3',
  sourceCopied: false as const,
});

function measuredBudget(loop: 'none' | 'finite' | 'while-live') {
  return {
    status: 'measured' as const,
    bundleBudgetGzipBytes: 8_192,
    maxLayers: 4,
    maxContinuousLoops: loop === 'while-live' ? 1 as const : 0 as const,
    evidence: 'packages/core/src/infrastructure/runtime/effects/facade/tests/effect-registry.test.ts',
  };
}

function certifiedFixture(
  id: EffectId,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const definition = EFFECT_REGISTRY[id] as unknown as Record<string, unknown>;
  const copy = { ...definition };
  delete copy.certificationPending;
  delete copy.quarantineReason;
  delete copy.rollback;

  const observed = {
    ...(definition.observed as Record<string, unknown>),
    ...((overrides.observed as Record<string, unknown> | undefined) ?? {}),
  };
  const loop = observed.loop as 'none' | 'finite' | 'while-live';

  return {
    ...copy,
    admission: 'certified',
    certificationEvidence: ['focused registry contract test'],
    provenance: [AUTHORIZED_SOURCE],
    budget: measuredBudget(loop),
    ...overrides,
    observed,
  };
}

function expectDeeplyFrozen(value: unknown, seen = new Set<unknown>()): void {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  for (const key of Reflect.ownKeys(value)) {
    expectDeeplyFrozen((value as Record<PropertyKey, unknown>)[key], seen);
  }
}

describe('EffectRegistry closed inventory', () => {
  it('contains exactly eleven canonical capabilities and treats Particles as no ID', () => {
    expect(EFFECT_REGISTRY_VERSION).toBe(1);
    expect(EFFECT_IDS).toEqual([
      'aurora',
      'glass-card',
      'glow-effect',
      'gradient-background',
      'grid-pattern',
      'magnetic',
      'noise-texture',
      'parallax',
      'particle-field',
      'shimmer-text',
      'spotlight',
    ]);
    expect(EFFECT_DEFINITIONS.map(({ id }) => id)).toEqual(EFFECT_IDS);
    expect(new Set(EFFECT_DEFINITIONS.map(({ id }) => id))).toHaveLength(11);
    expect(isEffectId('particles')).toBe(false);
    expect(getEffectDefinition('particles')).toBeUndefined();
  });

  it('deep-freezes the IDs, definitions, registry and research provenance', () => {
    expectDeeplyFrozen(EFFECT_IDS);
    expectDeeplyFrozen(EFFECT_DEFINITIONS);
    expectDeeplyFrozen(EFFECT_REGISTRY);
    expectDeeplyFrozen(EFFECT_RESEARCH_PROVENANCE);
  });

  it('records target tier separately from honest observed pending runtime', () => {
    expect(EFFECT_DEFINITIONS.filter(({ tier }) => tier === 'product')).toHaveLength(5);
    expect(EFFECT_DEFINITIONS.filter(({ tier }) => tier === 'expressive')).toHaveLength(5);
    expect(EFFECT_DEFINITIONS.filter(({ tier }) => tier === 'lab')).toHaveLength(1);
    expect(EFFECT_DEFINITIONS.filter(({ admission }) => admission === 'candidate')).toHaveLength(10);
    expect(EFFECT_REGISTRY['particle-field'].admission).toBe('quarantined');

    for (const id of ['aurora', 'glow-effect', 'gradient-background', 'grid-pattern', 'shimmer-text'] as const) {
      const definition = EFFECT_REGISTRY[id];
      expect(definition.observed).toMatchObject({ loop: 'while-live', lazy: false });
      expect(definition.pauseWhenOffscreen).toBe(false);
      expect(definition.pauseWhenPageHidden).toBe(false);
    }

    for (const definition of EFFECT_DEFINITIONS.filter(({ tier }) => tier === 'product')) {
      expect(definition.observed.loop).not.toBe('while-live');
    }
  });

  it('keeps lab ownership, telemetry, kill switch and decorative canvas semantics explicit', () => {
    const particle = EFFECT_REGISTRY['particle-field'];
    expect(particle).toMatchObject({
      admission: 'quarantined',
      tier: 'lab',
      owner: 'visualization-runtime',
      killSwitch: 'app-platform:PARTICLE_FIELD_ROUTE_KILL_SWITCHES',
      ariaStrategy: 'decorative-hidden',
      observed: { renderer: 'canvas2d', loop: 'while-live', lazy: true },
    });
    if (particle.tier === 'lab') expect(particle.telemetry).toHaveLength(3);
  });

  it('pins factual research revisions, SPDX/LicenseRef IDs and license hashes as reference-only', () => {
    expect(EFFECT_RESEARCH_PROVENANCE).toEqual([
      expect.objectContaining({
        repository: 'https://github.com/DavidHDev/react-bits',
        revision: '271b49c3ba1db60686e53c8c9a28b7583d5477d5',
        licenseId: 'LicenseRef-MIT-Commons-Clause-1.0',
        licenseSha256: 'f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9',
        restriction: 'restricted-reference',
      }),
      expect.objectContaining({
        repository: 'https://github.com/ibelick/motion-primitives',
        revision: '92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d',
        licenseId: 'MIT',
        licenseSha256: 'f668f5ef3635eb906f10b1eea9a32e449eb6e1a183ab6879ef6d56c0980dd2f3',
      }),
      expect.objectContaining({
        repository: 'https://github.com/magicuidesign/magicui',
        revision: '61f1aa5aa28dafa459e7d011e46ce2392b22ee24',
        licenseId: 'MIT',
        licenseSha256: '0147b84235ed916b8b4e89c1f80655351c5afe7d211b629be61f553a227b34ba',
      }),
      expect.objectContaining({
        repository: 'https://github.com/nolly-studio/cult-ui',
        revision: 'a3308bad8496b036adf2fbd29d50b877fb3c5987',
        licenseId: 'MIT',
        licenseSha256: 'd0470e1591e3b0f38e13719d20ef872ee68adbc5fa1a843e0a761ef5bdd5cc63',
      }),
    ]);
    for (const source of EFFECT_RESEARCH_PROVENANCE) {
      expect(source).toMatchObject({ usage: 'reference-only', sourceCopied: false });
    }
  });
});

describe('EffectDefinition certification laws', () => {
  it('accepts current pending definitions without pretending target-tier laws already pass', () => {
    for (const definition of EFFECT_DEFINITIONS) expect(isEffectDefinition(definition)).toBe(true);

    const pendingMeasured = {
      ...EFFECT_REGISTRY.aurora,
      budget: measuredBudget('while-live'),
    };
    expect(pendingMeasured.pauseWhenOffscreen).toBe(false);
    expect(isEffectDefinition(pendingMeasured)).toBe(true);
  });

  it('certifies product none/finite effects but forbids product perpetual loops', () => {
    expect(isEffectDefinition(certifiedFixture('glass-card'))).toBe(true);
    expect(isEffectDefinition(certifiedFixture('glass-card', {
      observed: { loop: 'finite' },
    }))).toBe(true);
    expect(isEffectDefinition(certifiedFixture('glass-card', {
      observed: { loop: 'while-live' },
      pauseWhenOffscreen: true,
      pauseWhenPageHidden: true,
    }))).toBe(false);
  });

  it('requires certified expressive and lab runtimes to be lazy and renderer-bounded', () => {
    const expressive = certifiedFixture('aurora', {
      observed: { lazy: true },
      pauseWhenOffscreen: true,
      pauseWhenPageHidden: true,
    });
    expect(isEffectDefinition(expressive)).toBe(true);
    expect(isEffectDefinition({
      ...expressive,
      observed: { ...(expressive.observed as object), lazy: false },
    })).toBe(false);

    const lab = certifiedFixture('particle-field');
    expect(isEffectDefinition(lab)).toBe(true);
    const { owner: _owner, ...labWithoutOwner } = lab;
    expect(isEffectDefinition(labWithoutOwner)).toBe(false);
  });

  it('requires certified source provenance and rejects restricted reference material', () => {
    const certified = certifiedFixture('glass-card');
    expect(isEffectDefinition({
      ...certified,
      provenance: [{ ...AUTHORIZED_SOURCE, usage: 'reference-only' }],
    })).toBe(false);
    expect(isEffectDefinition({
      ...certified,
      provenance: [{ ...AUTHORIZED_SOURCE, restriction: 'restricted-reference' }],
    })).toBe(false);
  });

  it('cross-validates measured loop budgets and suspension only at certification', () => {
    const none = certifiedFixture('glass-card');
    expect(isEffectDefinition({
      ...none,
      budget: { ...(none.budget as object), maxContinuousLoops: 1 },
    })).toBe(false);

    const perpetual = certifiedFixture('aurora', {
      observed: { lazy: true },
      pauseWhenOffscreen: true,
      pauseWhenPageHidden: true,
    });
    expect(isEffectDefinition({
      ...perpetual,
      budget: { ...(perpetual.budget as object), maxContinuousLoops: 0 },
    })).toBe(false);
    expect(isEffectDefinition({ ...perpetual, pauseWhenOffscreen: false })).toBe(false);
    expect(isEffectDefinition({ ...perpetual, pauseWhenPageHidden: false })).toBe(false);
  });

  it('uses canonical verticals and built-in engines, never tenant or personality aliases', () => {
    expect(isEffectDefinition({
      ...EFFECT_REGISTRY['glass-card'],
      supportedVerticals: ['rottay'],
    })).toBe(false);
    expect(isEffectDefinition({
      ...EFFECT_REGISTRY['glass-card'],
      supportedEngines: ['custom'],
    })).toBe(false);
    expect(isEffectDefinition({
      ...EFFECT_REGISTRY['glass-card'],
      supportedEngines: undefined,
      supportedPersonalities: ['classic'],
    })).toBe(false);
  });

  it('rejects crossed admission/tier discriminators and hostile objects without throwing', () => {
    expect(isEffectDefinition({
      ...EFFECT_REGISTRY['glass-card'],
      quarantineReason: 'crossed discriminator',
    })).toBe(false);
    expect(isEffectDefinition({
      ...EFFECT_REGISTRY['glass-card'],
      owner: 'not-a-lab',
    })).toBe(false);

    const hostile = new Proxy({}, {
      get() {
        throw new Error('hostile getter');
      },
    });
    expect(() => isEffectDefinition(hostile)).not.toThrow();
    expect(isEffectDefinition(hostile)).toBe(false);
    expect(() => resolveEffectDefinition(hostile)).not.toThrow();
    expect(resolveEffectDefinition(hostile)).toMatchObject({
      mode: 'unavailable',
      reason: 'invalid-definition',
    });
  });
});

describe('fail-closed effect resolution', () => {
  it('never activates candidates, quarantined effects, unknown IDs or aliases', () => {
    for (const definition of EFFECT_DEFINITIONS) {
      expect(resolveEffect(definition.id, SAFE_CONTEXT)).toMatchObject({
        id: definition.id,
        mode: 'static',
        reason: definition.admission === 'candidate'
          ? 'candidate-not-certified'
          : 'quarantined',
        fallback: definition.fallback.static,
      });
    }
    expect(resolveEffect('missing')).toEqual({
      id: null,
      mode: 'unavailable',
      reason: 'unknown-effect',
      fallback: null,
      definition: null,
    });
    expect(resolveEffect('particles').reason).toBe('unknown-effect');
  });

  it('activates a certified product effect only under explicit safe context', () => {
    const product = certifiedFixture('glass-card');
    expect(resolveEffectDefinition(product, SAFE_CONTEXT)).toMatchObject({
      mode: 'active',
      reason: 'eligible',
      fallback: null,
    });
    expect(resolveEffectDefinition(product)).toMatchObject({
      mode: 'static',
      reason: 'reduced-motion',
    });
  });

  it('requires active intent and all continuous ambient gates', () => {
    const ambient = certifiedFixture('aurora', {
      observed: { lazy: true },
      pauseWhenOffscreen: true,
      pauseWhenPageHidden: true,
    });
    expect(resolveEffectDefinition(ambient, SAFE_CONTEXT).mode).toBe('active');

    const cases = [
      [{ reducedMotion: true }, 'reduced-motion'],
      [{ pointer: 'coarse' }, 'coarse-pointer'],
      [{ power: 'constrained' }, 'constrained-power'],
      [{ pageVisible: false }, 'page-hidden'],
      [{ inView: false }, 'offscreen'],
      [{ userPaused: true }, 'user-paused'],
      [{ active: false }, 'inactive'],
      [{ allowAmbientMotion: false }, 'ambient-disabled'],
      [{ continuousSlotAvailable: false }, 'continuous-slot-unavailable'],
    ] as const;

    for (const [context, reason] of cases) {
      expect(resolveEffectDefinition(ambient, { ...SAFE_CONTEXT, ...context }).reason).toBe(reason);
    }
  });

  it('requires the continuous policy for non-ambient loops', () => {
    const feedback = certifiedFixture('glow-effect', {
      observed: { lazy: true },
      pauseWhenOffscreen: true,
      pauseWhenPageHidden: true,
    });
    expect(resolveEffectDefinition(feedback, {
      ...SAFE_CONTEXT,
      allowContinuousMotion: false,
    }).reason).toBe('continuous-disabled');
  });

  it('requires a lab definition exact registry-owned switch', () => {
    const lab = certifiedFixture('particle-field');
    expect(resolveEffectDefinition(lab, SAFE_CONTEXT).reason).toBe('lab-kill-switch-closed');
    expect(resolveEffectDefinition(lab, {
      ...SAFE_CONTEXT,
      enabledKillSwitches: ['wrong-switch'],
    }).reason).toBe('lab-kill-switch-closed');
    expect(resolveEffectDefinition(lab, {
      ...SAFE_CONTEXT,
      enabledKillSwitches: ['app-platform:PARTICLE_FIELD_ROUTE_KILL_SWITCHES'],
    }).mode).toBe('active');
  });

  it('returns frozen results and never mutates caller definitions or context', () => {
    const product = certifiedFixture('glass-card');
    const context = { ...SAFE_CONTEXT };
    const beforeDefinition = JSON.stringify(product);
    const beforeContext = JSON.stringify(context);
    const resolution = resolveEffectDefinition(product, context);

    expect(Object.isFrozen(resolution)).toBe(true);
    expect(JSON.stringify(product)).toBe(beforeDefinition);
    expect(JSON.stringify(context)).toBe(beforeContext);
    expect(Object.isFrozen(resolveEffect('missing'))).toBe(true);
  });
});
