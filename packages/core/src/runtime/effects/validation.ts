import {
  EFFECT_IDS,
  type EffectDefinition,
  type EffectId,
} from '../../contracts/effects';

const PURPOSES = new Set([
  'state',
  'continuity',
  'hierarchy',
  'feedback',
  'narrative',
  'ambient',
]);
const PRODUCT_PURPOSES = new Set([
  'state',
  'continuity',
  'hierarchy',
  'feedback',
]);
const RENDERERS = new Set([
  'css',
  'waapi',
  'motion',
  'svg',
  'canvas2d',
  'webgl2',
]);
const LIGHTWEIGHT_RENDERERS = new Set(['css', 'waapi', 'motion', 'svg']);
const LAB_RENDERERS = new Set(['canvas2d', 'webgl2']);
const LOOPS = new Set(['none', 'finite', 'while-live']);
const ARIA_STRATEGIES = new Set([
  'decorative-hidden',
  'semantic-host',
  'described-alternative',
]);
const VERTICALS = new Set(['platform', 'evnto', 'bithire']);
const ENGINES = new Set(['classic', 'modern', 'rustic']);
const REDUCED_FALLBACKS = new Set([
  'final-state',
  'static-alternative',
  'remove',
]);
const EFFECT_ID_SET = new Set<string>(EFFECT_IDS);
const REVISION_PATTERN = /^[a-f0-9]{40}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const LICENSE_ID_PATTERN = /^[A-Za-z0-9.+-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUniqueStringArray(value: unknown, allowed?: ReadonlySet<string>): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const normalized = value.filter(isNonEmptyString);
  if (normalized.length !== value.length || new Set(normalized).size !== value.length) {
    return false;
  }
  return !allowed || normalized.every((item) => allowed.has(item));
}

function isFallback(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.static)
    && isNonEmptyString(value.touch)
    && REDUCED_FALLBACKS.has(String(value.reducedMotion));
}

function isProvenance(value: unknown): boolean {
  if (!isRecord(value) || value.sourceCopied !== false) return false;

  if (value.verification === 'reference') {
    return (value.kind === 'repository-source' || value.kind === 'canonical-audit')
      && isNonEmptyString(value.reference);
  }

  if (value.verification !== 'verified') return false;
  return (value.usage === 'source' || value.usage === 'reference-only')
    && isNonEmptyString(value.repository)
    && /^https:\/\//.test(value.repository)
    && typeof value.revision === 'string'
    && REVISION_PATTERN.test(value.revision)
    && isNonEmptyString(value.licensePathAtRevision)
    && typeof value.licenseId === 'string'
    && LICENSE_ID_PATTERN.test(value.licenseId)
    && typeof value.licenseSha256 === 'string'
    && SHA256_PATTERN.test(value.licenseSha256)
    && (value.restriction === undefined || value.restriction === 'restricted-reference');
}

function isBudget(value: unknown, requireMeasured: boolean): boolean {
  if (!isRecord(value) || !isNonEmptyString(value.evidence)) return false;
  if (value.status === 'unmeasured') return !requireMeasured;
  if (value.status !== 'measured') return false;
  return typeof value.bundleBudgetGzipBytes === 'number'
    && Number.isInteger(value.bundleBudgetGzipBytes)
    && value.bundleBudgetGzipBytes > 0
    && typeof value.maxLayers === 'number'
    && Number.isInteger(value.maxLayers)
    && value.maxLayers > 0
    && (value.maxContinuousLoops === 0 || value.maxContinuousLoops === 1);
}

function measuredBudgetMatchesLoop(
  budget: Record<string, unknown>,
  loop: unknown,
  pauseWhenOffscreen: unknown,
  pauseWhenPageHidden: unknown,
): boolean {
  if (budget.status !== 'measured') return true;
  if (loop === 'while-live') {
    return budget.maxContinuousLoops === 1
      && pauseWhenOffscreen === true
      && pauseWhenPageHidden === true;
  }
  return budget.maxContinuousLoops === 0;
}

/**
 * Runtime counterpart to the discriminated TypeScript contract. Manifests can
 * arrive from JSON/build tooling, so invalid or hostile shapes must fail closed
 * instead of acquiring certified status through a cast.
 */
export function isEffectDefinition(value: unknown): value is EffectDefinition {
  try {
    if (!isRecord(value)) return false;
    if (!EFFECT_ID_SET.has(String(value.id))) return false;
    if (!PURPOSES.has(String(value.purpose))) return false;
    if (!isRecord(value.observed)) return false;
    if (!RENDERERS.has(String(value.observed.renderer))) return false;
    if (!LOOPS.has(String(value.observed.loop))) return false;
    if (typeof value.observed.lazy !== 'boolean') return false;
    if (!isFallback(value.fallback)) return false;
    if (typeof value.pauseWhenOffscreen !== 'boolean') return false;
    if (typeof value.pauseWhenPageHidden !== 'boolean') return false;
    if (!ARIA_STRATEGIES.has(String(value.ariaStrategy))) return false;
    if (!isUniqueStringArray(value.supportedVerticals, VERTICALS)) return false;
    if (!isUniqueStringArray(value.supportedEngines, ENGINES)) return false;
    if (!Array.isArray(value.provenance) || value.provenance.length === 0) return false;
    if (!value.provenance.every(isProvenance)) return false;

    if (value.tier === 'product') {
      if (!PRODUCT_PURPOSES.has(String(value.purpose))) return false;
      if (hasOwn(value, 'owner') || hasOwn(value, 'telemetry') || hasOwn(value, 'killSwitch')) {
        return false;
      }
    } else if (value.tier === 'expressive') {
      // Pending inventory records observed gaps honestly. Lazy/lightweight laws
      // become blocking only when admission changes to certified.
      if (hasOwn(value, 'owner') || hasOwn(value, 'telemetry') || hasOwn(value, 'killSwitch')) {
        return false;
      }
    } else if (value.tier === 'lab') {
      if (!isNonEmptyString(value.owner)) return false;
      if (!isUniqueStringArray(value.telemetry)) return false;
      if (!isNonEmptyString(value.killSwitch)) return false;
    } else {
      return false;
    }

    if (value.admission === 'candidate') {
      return isNonEmptyString(value.certificationPending)
        && !hasOwn(value, 'quarantineReason')
        && !hasOwn(value, 'rollback')
        && !hasOwn(value, 'certificationEvidence')
        && isBudget(value.budget, false);
    }

    if (value.admission === 'quarantined') {
      return isNonEmptyString(value.quarantineReason)
        && isNonEmptyString(value.rollback)
        && !hasOwn(value, 'certificationPending')
        && !hasOwn(value, 'certificationEvidence')
        && isBudget(value.budget, false);
    }

    if (value.admission !== 'certified') return false;
    if (!isUniqueStringArray(value.certificationEvidence)) return false;
    if (hasOwn(value, 'certificationPending') || hasOwn(value, 'quarantineReason') || hasOwn(value, 'rollback')) {
      return false;
    }
    if (!isBudget(value.budget, true)) return false;
    if (!isRecord(value.budget)) return false;
    if (!measuredBudgetMatchesLoop(
      value.budget,
      value.observed.loop,
      value.pauseWhenOffscreen,
      value.pauseWhenPageHidden,
    )) return false;

    if (value.tier === 'product') {
      if (
        (value.observed.loop !== 'none' && value.observed.loop !== 'finite')
        || value.observed.lazy !== false
        || !LIGHTWEIGHT_RENDERERS.has(String(value.observed.renderer))
      ) return false;
    } else if (value.tier === 'expressive') {
      if (
        value.observed.lazy !== true
        || !LIGHTWEIGHT_RENDERERS.has(String(value.observed.renderer))
      ) return false;
    } else if (
      value.observed.lazy !== true
      || !LAB_RENDERERS.has(String(value.observed.renderer))
    ) {
      return false;
    }

    return value.provenance.every((item) => (
      isRecord(item)
      && item.verification === 'verified'
      && item.usage === 'source'
      && item.restriction !== 'restricted-reference'
    ));
  } catch {
    return false;
  }
}

export function isEffectId(value: unknown): value is EffectId {
  return typeof value === 'string' && EFFECT_ID_SET.has(value);
}
