/**
 * Supplier-neutral expressive-effect governance contracts.
 *
 * The registry describes admission and runtime requirements; it never grants
 * an app permission to load arbitrary code. Effects remain a closed DS-owned
 * catalog and tenant input cannot add definitions or alter their behavior.
 */

import type { EngineName } from '../../kernel/engine-identity';
import type { VerticalId } from '../../kernel/verticals';

export const EFFECT_IDS = Object.freeze([
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
] as const);

export type EffectId = (typeof EFFECT_IDS)[number];
export type EffectAdmission = 'candidate' | 'certified' | 'quarantined';
export type EffectTier = 'product' | 'expressive' | 'lab';
export type EffectPurpose =
  | 'state'
  | 'continuity'
  | 'hierarchy'
  | 'feedback'
  | 'narrative'
  | 'ambient';
export type EffectRenderer =
  | 'css'
  | 'waapi'
  | 'motion'
  | 'svg'
  | 'canvas2d'
  | 'webgl2';
export type EffectLoop = 'none' | 'finite' | 'while-live';
export type EffectAriaStrategy =
  | 'decorative-hidden'
  | 'semantic-host'
  | 'described-alternative';
export type EffectVertical = VerticalId;
/** Built-in render engines; tenant-defined `custom` is not registry-certifiable. */
export type EffectEngine = Exclude<EngineName, 'custom'>;

export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

/** Honest reference while source/license evidence is not yet certified. */
export interface ReferencedEffectProvenance {
  readonly verification: 'reference';
  readonly kind: 'repository-source' | 'canonical-audit';
  readonly reference: string;
  readonly sourceCopied: false;
}

/** Hash-pinned provenance. `reference-only` never authorizes source reuse. */
export interface VerifiedEffectProvenance {
  readonly verification: 'verified';
  readonly usage: 'source' | 'reference-only';
  readonly repository: string;
  readonly revision: string;
  /** License path inside the exact upstream revision, not a packaged DS path. */
  readonly licensePathAtRevision: string;
  /** SPDX identifier, or a namespaced LicenseRef when no SPDX expression exists. */
  readonly licenseId: string;
  readonly licenseSha256: string;
  readonly sourceCopied: false;
  readonly restriction?: 'restricted-reference';
}

export type EffectProvenance =
  | ReferencedEffectProvenance
  | VerifiedEffectProvenance;

export interface UnmeasuredEffectBudget {
  readonly status: 'unmeasured';
  readonly evidence: string;
}

export interface MeasuredEffectBudget {
  readonly status: 'measured';
  /** Exact compressed consumer budget; decimal/KB ambiguity is forbidden. */
  readonly bundleBudgetGzipBytes: number;
  /** DOM/canvas/compositor topology ceiling. */
  readonly maxLayers: number;
  /** Runtime loop ceiling is independent from visual layer count. */
  readonly maxContinuousLoops: 0 | 1;
  readonly evidence: string;
}

export type EffectBudget = UnmeasuredEffectBudget | MeasuredEffectBudget;

export interface EffectFallbackDefinition {
  readonly static: string;
  readonly touch: string;
  readonly reducedMotion: 'final-state' | 'static-alternative' | 'remove';
}

interface EffectDefinitionBase {
  readonly id: EffectId;
  readonly purpose: EffectPurpose;
  /** Current implementation facts; admission never rewrites observed state. */
  readonly observed: EffectObservedRuntime;
  readonly provenance: NonEmptyReadonlyArray<EffectProvenance>;
  readonly fallback: EffectFallbackDefinition;
  readonly pauseWhenOffscreen: boolean;
  readonly pauseWhenPageHidden: boolean;
  readonly ariaStrategy: EffectAriaStrategy;
  readonly supportedVerticals: NonEmptyReadonlyArray<EffectVertical>;
  readonly supportedEngines: NonEmptyReadonlyArray<EffectEngine>;
}

export interface EffectObservedRuntime {
  readonly renderer: EffectRenderer;
  readonly loop: EffectLoop;
  readonly lazy: boolean;
}

/** Target tier. Strict runtime laws become mandatory at certification. */
export interface ProductEffectMetadata {
  readonly tier: 'product';
}

/** Expressive effects target optional/lazy delivery with a named fallback. */
export interface ExpressiveEffectMetadata {
  readonly tier: 'expressive';
}

/** Lab effects are isolated resource-heavy runtimes with explicit controls. */
export interface LabEffectMetadata {
  readonly tier: 'lab';
  readonly owner: string;
  readonly telemetry: NonEmptyReadonlyArray<string>;
  /**
   * Runtime authority stays inside the DS. A provider can disable a complete
   * subtree and an individual component prop can disable one instance; neither
   * control is derived from tenant data.
   */
  readonly runtimeControl: 'provider-and-instance';
}

export type EffectTierMetadata =
  | ProductEffectMetadata
  | ExpressiveEffectMetadata
  | LabEffectMetadata;

export interface CandidateEffectAdmission {
  readonly admission: 'candidate';
  readonly certificationPending: string;
}

export interface QuarantinedEffectAdmission {
  readonly admission: 'quarantined';
  readonly quarantineReason: string;
  readonly rollback: string;
}

export interface CertifiedEffectAdmission {
  readonly admission: 'certified';
  readonly certificationEvidence: NonEmptyReadonlyArray<string>;
}

type PendingEffectDefinition = EffectDefinitionBase &
  EffectTierMetadata &
  (CandidateEffectAdmission | QuarantinedEffectAdmission) & {
    readonly budget: EffectBudget;
  };

type CertifiedProductRuntime = ProductEffectMetadata & {
  readonly observed: {
    readonly renderer: Exclude<EffectRenderer, 'canvas2d' | 'webgl2'>;
    readonly loop: 'none' | 'finite';
    readonly lazy: false;
  };
};

type CertifiedExpressiveRuntime = ExpressiveEffectMetadata & {
  readonly observed: {
    readonly renderer: Exclude<EffectRenderer, 'canvas2d' | 'webgl2'>;
    readonly loop: EffectLoop;
    readonly lazy: true;
  };
};

type CertifiedLabRuntime = LabEffectMetadata & {
  readonly observed: {
    readonly renderer: Extract<EffectRenderer, 'canvas2d' | 'webgl2'>;
    readonly loop: EffectLoop;
    readonly lazy: true;
  };
};

type CertifiedTierRuntime =
  | CertifiedProductRuntime
  | CertifiedExpressiveRuntime
  | CertifiedLabRuntime;

type VerifiedSourceEffectProvenance = Omit<
  VerifiedEffectProvenance,
  'usage' | 'restriction'
> & {
  readonly usage: 'source';
  readonly restriction?: never;
};

/**
 * Certification is structurally stricter than inventory: measured budgets and
 * verified source provenance are mandatory before an effect can resolve live.
 */
type CertifiedEffectDefinition = Omit<
  EffectDefinitionBase,
  'provenance'
> &
  CertifiedTierRuntime &
  CertifiedEffectAdmission & {
    readonly provenance: NonEmptyReadonlyArray<
      VerifiedSourceEffectProvenance
    >;
    readonly budget: MeasuredEffectBudget;
  };

export type EffectDefinition =
  | PendingEffectDefinition
  | CertifiedEffectDefinition;

export interface EffectRuntimeContext {
  /** Explicit DS/provider + component-instance control; missing fails closed. */
  readonly effectEnabled?: boolean;
  readonly reducedMotion?: boolean;
  readonly pointer?: 'coarse' | 'fine';
  readonly power?: 'constrained' | 'normal';
  readonly pageVisible?: boolean;
  readonly inView?: boolean;
  readonly active?: boolean;
  readonly userPaused?: boolean;
  readonly allowAmbientMotion?: boolean;
  readonly allowContinuousMotion?: boolean;
  readonly continuousSlotAvailable?: boolean;
}

export type EffectResolutionMode = 'unavailable' | 'static' | 'active';
export type EffectResolutionReason =
  | 'eligible'
  | 'unknown-effect'
  | 'invalid-definition'
  | 'candidate-not-certified'
  | 'quarantined'
  | 'effect-disabled'
  | 'reduced-motion'
  | 'coarse-pointer'
  | 'constrained-power'
  | 'page-hidden'
  | 'offscreen'
  | 'user-paused'
  | 'inactive'
  | 'ambient-disabled'
  | 'continuous-disabled'
  | 'continuous-slot-unavailable';

export interface EffectResolution {
  readonly id: EffectId | null;
  readonly mode: EffectResolutionMode;
  readonly reason: EffectResolutionReason;
  readonly fallback: string | null;
  readonly definition: EffectDefinition | null;
}

export interface EffectTelemetryState {
  readonly mode: EffectResolutionMode;
  readonly reason: EffectResolutionReason;
}

/** Emitted once when a mounted effect obtains its first governed resolution. */
export interface EffectResolutionTelemetryEvent {
  readonly schemaVersion: 1;
  readonly name: 'ds.effect.resolution';
  readonly effectId: EffectId;
  readonly current: EffectTelemetryState;
}

/** Emitted only when a mounted effect changes governed mode or reason. */
export interface EffectTransitionTelemetryEvent {
  readonly schemaVersion: 1;
  readonly name: 'ds.effect.transition';
  readonly effectId: EffectId;
  readonly previous: EffectTelemetryState;
  readonly current: EffectTelemetryState;
}

export type EffectRuntimeTelemetryEvent =
  | EffectResolutionTelemetryEvent
  | EffectTransitionTelemetryEvent;

/** Telemetry is observational and must never acquire runtime authority. */
export type EffectRuntimeTelemetryListener = (
  event: EffectRuntimeTelemetryEvent,
) => void;
