import {
  EFFECT_IDS,
  type EffectDefinition,
  type EffectId,
  type EffectProvenance,
  type NonEmptyReadonlyArray,
  type VerifiedEffectProvenance,
} from '../../../../../foundation/contracts/runtime/effects';
import { isEffectDefinition } from '../../foundation/validation';

const CANONICAL_EFFECT_AUDIT =
  'docs-engineering/engineering/audits/ds-improvements/12-data-visualization-spatial-and-expressive-system.md';
const OWNER_CONTINUATION = 'roadmap/craft.md#owner-continuation--efx-01a-effect-registry';

const ALL_VERTICALS = ['platform', 'evnto', 'bithire'] as const;
const ALL_ENGINES = ['classic', 'modern', 'rustic'] as const;
const UNMEASURED_BUDGET = {
  status: 'unmeasured',
  evidence: OWNER_CONTINUATION,
} as const;

/** Versioned independently from package releases for manifest consumers. */
export const EFFECT_REGISTRY_VERSION = 2 as const;

function sourceProvenance(path: string): NonEmptyReadonlyArray<EffectProvenance> {
  return [
    {
      verification: 'reference',
      kind: 'repository-source',
      reference: path,
      sourceCopied: false,
    },
    {
      verification: 'reference',
      kind: 'canonical-audit',
      reference: CANONICAL_EFFECT_AUDIT,
      sourceCopied: false,
    },
  ];
}

/**
 * Hashes are copied from the pinned DS audit evidence. These are research-only
 * references; none authorizes source redistribution or claims source reuse.
 */
export const EFFECT_RESEARCH_PROVENANCE: readonly VerifiedEffectProvenance[] = deepFreeze([
  {
    verification: 'verified',
    usage: 'reference-only',
    repository: 'https://github.com/DavidHDev/react-bits',
    revision: '271b49c3ba1db60686e53c8c9a28b7583d5477d5',
    licensePathAtRevision: 'LICENSE.md',
    licenseId: 'LicenseRef-MIT-Commons-Clause-1.0',
    licenseSha256: 'f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9',
    sourceCopied: false,
    restriction: 'restricted-reference',
  },
  {
    verification: 'verified',
    usage: 'reference-only',
    repository: 'https://github.com/ibelick/motion-primitives',
    revision: '92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d',
    licensePathAtRevision: 'LICENCE.md',
    licenseId: 'MIT',
    licenseSha256: 'f668f5ef3635eb906f10b1eea9a32e449eb6e1a183ab6879ef6d56c0980dd2f3',
    sourceCopied: false,
  },
  {
    verification: 'verified',
    usage: 'reference-only',
    repository: 'https://github.com/magicuidesign/magicui',
    revision: '61f1aa5aa28dafa459e7d011e46ce2392b22ee24',
    licensePathAtRevision: 'LICENSE.md',
    licenseId: 'MIT',
    licenseSha256: '0147b84235ed916b8b4e89c1f80655351c5afe7d211b629be61f553a227b34ba',
    sourceCopied: false,
  },
  {
    verification: 'verified',
    usage: 'reference-only',
    repository: 'https://github.com/nolly-studio/cult-ui',
    revision: 'a3308bad8496b036adf2fbd29d50b877fb3c5987',
    licensePathAtRevision: 'LICENSE.md',
    licenseId: 'MIT',
    licenseSha256: 'd0470e1591e3b0f38e13719d20ef872ee68adbc5fa1a843e0a761ef5bdd5cc63',
    sourceCopied: false,
  },
]);

const DEFINITIONS = [
  {
    id: 'aurora',
    admission: 'candidate',
    certificationPending: 'Suspend every blob loop through the shared policy and record layer/bundle budgets.',
    tier: 'expressive',
    purpose: 'ambient',
    observed: { renderer: 'css', loop: 'while-live', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/aurora/index.tsx'),
    fallback: {
      static: 'Render the settled provider-colored gradient without moving blobs.',
      touch: 'Use the same static gradient with no pointer-only meaning.',
      reducedMotion: 'static-alternative',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'glass-card',
    admission: 'candidate',
    certificationPending: 'Bound blur/layer cost and prove forced-colors plus fallback behavior.',
    tier: 'product',
    purpose: 'hierarchy',
    observed: { renderer: 'css', loop: 'none', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/glass-card/index.tsx'),
    fallback: {
      static: 'Render an opaque tokenized surface and border when backdrop filtering is unavailable.',
      touch: 'Preserve the same non-interactive hierarchy treatment.',
      reducedMotion: 'final-state',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'semantic-host',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'glow-effect',
    admission: 'candidate',
    certificationPending: 'Replace the paint-property perpetual pulse with a state-bound governed treatment.',
    tier: 'expressive',
    purpose: 'feedback',
    observed: { renderer: 'motion', loop: 'while-live', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/glow-effect/index.tsx'),
    fallback: {
      static: 'Render one bounded tokenized glow at its settled intensity.',
      touch: 'Use the static glow only when another visible state carries the same meaning.',
      reducedMotion: 'static-alternative',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'semantic-host',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'gradient-background',
    admission: 'candidate',
    certificationPending: 'Remove default-on paint animation and prove lazy/static/offscreen behavior.',
    tier: 'expressive',
    purpose: 'ambient',
    observed: { renderer: 'motion', loop: 'while-live', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/gradient-background/index.tsx'),
    fallback: {
      static: 'Render the provider-scoped gradient at a deterministic settled position.',
      touch: 'Use the identical static gradient on coarse pointers.',
      reducedMotion: 'static-alternative',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'grid-pattern',
    admission: 'candidate',
    certificationPending: 'Separate the safe static pattern from its ungoverned optional pulse.',
    tier: 'expressive',
    purpose: 'ambient',
    observed: { renderer: 'svg', loop: 'while-live', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/grid-pattern/index.tsx'),
    fallback: {
      static: 'Render the uniquely identified SVG dot grid without opacity animation.',
      touch: 'Use the same static grid with no hover dependency.',
      reducedMotion: 'static-alternative',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'magnetic',
    admission: 'candidate',
    certificationPending: 'Record reversal, optical displacement and consumer evidence after the coarse-pointer gate.',
    tier: 'product',
    purpose: 'feedback',
    observed: { renderer: 'motion', loop: 'none', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/primitives/magnetic/index.tsx'),
    fallback: {
      static: 'Render the control in its settled position.',
      touch: 'Use ordinary pressed/focus feedback without pointer attraction.',
      reducedMotion: 'final-state',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'semantic-host',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'noise-texture',
    admission: 'candidate',
    certificationPending: 'Prove unique filter ownership, bounded paint cost and decorative accessibility.',
    tier: 'product',
    purpose: 'hierarchy',
    observed: { renderer: 'svg', loop: 'none', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/noise-texture/index.tsx'),
    fallback: {
      static: 'Omit the decorative texture while preserving the underlying surface.',
      touch: 'Use the same static texture or omit it under the paint budget.',
      reducedMotion: 'final-state',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'parallax',
    admission: 'candidate',
    certificationPending: 'Record scroll lifecycle, reversal and adoption evidence after policy integration.',
    tier: 'product',
    purpose: 'hierarchy',
    observed: { renderer: 'motion', loop: 'none', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/primitives/parallax/index.tsx'),
    fallback: {
      static: 'Render content at its settled transform.',
      touch: 'Render the settled layout without scroll-linked displacement.',
      reducedMotion: 'final-state',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: true,
    pauseWhenPageHidden: true,
    ariaStrategy: 'semantic-host',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'particle-field',
    admission: 'certified',
    certificationEvidence: [
      'packages/core/src/graphics/motion/react/presentation/effects/particles/runtime/canvas/tests/ParticleField.test.tsx',
      'packages/core/src/graphics/motion/react/presentation/effects/particles/tests/PublicParticleFieldGate.test.tsx',
      'packages/showroom/e2e/responsive/particle-runtime.spec.ts',
    ],
    tier: 'lab',
    purpose: 'ambient',
    observed: { renderer: 'canvas2d', loop: 'while-live', lazy: true },
    owner: 'visualization-runtime',
    telemetry: [
      'ds.effect.resolution',
      'ds.effect.transition',
      'particle-field.raf-state',
    ],
    runtimeControl: 'provider-and-instance',
    provenance: [
      {
        verification: 'verified',
        usage: 'source',
        repository: 'https://github.com/rottay/ui-design-system',
        revision: '8015fabaf5fccca7c38c663971b9da2cce8843ab',
        licensePathAtRevision: 'LICENSE',
        licenseId: 'MIT',
        licenseSha256: '44576d15c34e9b97b6ccc17352b96ddee2d85ff22dcea7e30ab63e05cd5b27e3',
        sourceCopied: false,
      },
    ],
    fallback: {
      static: 'Preserve stable host content without Canvas or RAF.',
      touch: 'Preserve the same stable host content without Canvas or RAF.',
      reducedMotion: 'static-alternative',
    },
    budget: {
      status: 'measured',
      bundleBudgetGzipBytes: 16_384,
      maxLayers: 1,
      maxContinuousLoops: 1,
      evidence: 'packages/core/scripts/analyze-bundle.mjs --effects',
    },
    pauseWhenOffscreen: true,
    pauseWhenPageHidden: true,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'shimmer-text',
    admission: 'candidate',
    certificationPending: 'Bind shimmer to a live semantic state and stop it immediately on completion.',
    tier: 'expressive',
    purpose: 'state',
    observed: { renderer: 'css', loop: 'while-live', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/shimmer-text/index.tsx'),
    fallback: {
      static: 'Render readable provider text without a moving gradient.',
      touch: 'Keep the same live-state meaning without pointer interaction.',
      reducedMotion: 'static-alternative',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: false,
    pauseWhenPageHidden: false,
    ariaStrategy: 'semantic-host',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
  {
    id: 'spotlight',
    admission: 'candidate',
    certificationPending: 'Add the fine-pointer policy gate and prove cleanup plus non-hover meaning.',
    tier: 'product',
    purpose: 'feedback',
    observed: { renderer: 'css', loop: 'none', lazy: false },
    provenance: sourceProvenance('packages/core/src/graphics/motion/react/presentation/effects/spotlight/index.tsx'),
    fallback: {
      static: 'Remove the decorative cursor highlight while preserving all content.',
      touch: 'Use focus/pressed surface feedback instead of cursor tracking.',
      reducedMotion: 'remove',
    },
    budget: UNMEASURED_BUDGET,
    pauseWhenOffscreen: true,
    pauseWhenPageHidden: true,
    ariaStrategy: 'decorative-hidden',
    supportedVerticals: ALL_VERTICALS,
    supportedEngines: ALL_ENGINES,
  },
] as const satisfies readonly EffectDefinition[];

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (Object.isFrozen(value)) return value;

  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(Reflect.get(value, key));
  }
  return Object.freeze(value);
}

function buildRegistry(
  definitions: readonly EffectDefinition[],
): Readonly<Record<EffectId, EffectDefinition>> {
  const registry = Object.create(null) as Record<EffectId, EffectDefinition>;
  const seen = new Set<EffectId>();

  for (const definition of definitions) {
    if (!isEffectDefinition(definition)) {
      throw new TypeError('Invalid effect definition in closed registry');
    }
    if (seen.has(definition.id)) {
      throw new TypeError(`Duplicate effect definition: ${definition.id}`);
    }
    seen.add(definition.id);
    Reflect.set(registry, definition.id, definition);
  }

  const missing = EFFECT_IDS.filter((id) => !seen.has(id));
  if (seen.size !== EFFECT_IDS.length || missing.length > 0) {
    throw new TypeError(`Effect inventory mismatch; missing: ${missing.join(', ') || 'none'}`);
  }

  return deepFreeze(registry);
}

export const EFFECT_REGISTRY = buildRegistry(DEFINITIONS);
export const EFFECT_DEFINITIONS: readonly EffectDefinition[] = deepFreeze(
  EFFECT_IDS.map((id) => Reflect.get(EFFECT_REGISTRY, id) as EffectDefinition),
);

export function getEffectDefinition(id: unknown): EffectDefinition | undefined {
  return typeof id === 'string'
    && Object.prototype.hasOwnProperty.call(EFFECT_REGISTRY, id)
    ? Reflect.get(EFFECT_REGISTRY, id) as EffectDefinition
    : undefined;
}
