import type {
  EffectDefinition,
  EffectId,
  EffectResolution,
  EffectResolutionReason,
  EffectRuntimeContext,
} from '../../../../../../foundation/contracts/runtime/effects';
import { getEffectDefinition } from '..';
import { isEffectDefinition, isEffectId } from '../../../foundation/validation';

interface NormalizedRuntimeContext {
  readonly reducedMotion: boolean;
  readonly pointer: 'coarse' | 'fine';
  readonly power: 'constrained' | 'normal';
  readonly pageVisible: boolean;
  readonly inView: boolean;
  readonly active: boolean;
  readonly userPaused: boolean;
  readonly allowAmbientMotion: boolean;
  readonly allowContinuousMotion: boolean;
  readonly continuousSlotAvailable: boolean;
  readonly enabledKillSwitches: ReadonlySet<string>;
}

const UNKNOWN_EFFECT = Object.freeze<EffectResolution>({
  id: null,
  mode: 'unavailable',
  reason: 'unknown-effect',
  fallback: null,
  definition: null,
});

function readContext(context: unknown): NormalizedRuntimeContext {
  try {
    const candidate = typeof context === 'object' && context !== null
      ? context as Record<string, unknown>
      : Object.create(null) as Record<string, unknown>;
    const switches = new Set<string>();

    if (Array.isArray(candidate.enabledKillSwitches)) {
      for (const value of candidate.enabledKillSwitches) {
        if (typeof value === 'string') switches.add(value);
      }
    }

    return {
      reducedMotion: candidate.reducedMotion !== false,
      pointer: candidate.pointer === 'fine' ? 'fine' : 'coarse',
      power: candidate.power === 'normal' ? 'normal' : 'constrained',
      pageVisible: candidate.pageVisible === true,
      inView: candidate.inView === true,
      active: candidate.active === true,
      userPaused: candidate.userPaused !== false,
      allowAmbientMotion: candidate.allowAmbientMotion === true,
      allowContinuousMotion: candidate.allowContinuousMotion === true,
      continuousSlotAvailable: candidate.continuousSlotAvailable === true,
      enabledKillSwitches: switches,
    };
  } catch {
    return {
      reducedMotion: true,
      pointer: 'coarse',
      power: 'constrained',
      pageVisible: false,
      inView: false,
      active: false,
      userPaused: true,
      allowAmbientMotion: false,
      allowContinuousMotion: false,
      continuousSlotAvailable: false,
      enabledKillSwitches: new Set(),
    };
  }
}

function result(
  definition: EffectDefinition,
  mode: EffectResolution['mode'],
  reason: EffectResolutionReason,
): EffectResolution {
  return Object.freeze({
    id: definition.id,
    mode,
    reason,
    fallback: mode === 'active' ? null : definition.fallback.static,
    definition,
  });
}

function readKnownId(definition: unknown): EffectId | null {
  try {
    if (typeof definition !== 'object' || definition === null) return null;
    const id = (definition as Record<string, unknown>).id;
    return isEffectId(id) ? id : null;
  } catch {
    return null;
  }
}

/**
 * Resolves an already-loaded definition without side effects. Every missing or
 * ambiguous runtime signal takes the static path; only certified definitions
 * can become active.
 */
export function resolveEffectDefinition(
  definition: unknown,
  context?: EffectRuntimeContext | unknown,
): EffectResolution {
  if (!isEffectDefinition(definition)) {
    return Object.freeze({
      id: readKnownId(definition),
      mode: 'unavailable',
      reason: 'invalid-definition',
      fallback: null,
      definition: null,
    });
  }

  if (definition.admission === 'candidate') {
    return result(definition, 'static', 'candidate-not-certified');
  }
  if (definition.admission === 'quarantined') {
    return result(definition, 'static', 'quarantined');
  }

  const runtime = readContext(context);

  if (
    definition.tier === 'lab'
    && !runtime.enabledKillSwitches.has(definition.killSwitch)
  ) {
    return result(definition, 'static', 'lab-kill-switch-closed');
  }
  if (runtime.reducedMotion) return result(definition, 'static', 'reduced-motion');
  if (runtime.pointer === 'coarse') return result(definition, 'static', 'coarse-pointer');
  if (runtime.power === 'constrained') return result(definition, 'static', 'constrained-power');
  if (definition.pauseWhenPageHidden && !runtime.pageVisible) {
    return result(definition, 'static', 'page-hidden');
  }
  if (definition.pauseWhenOffscreen && !runtime.inView) {
    return result(definition, 'static', 'offscreen');
  }
  if (runtime.userPaused) return result(definition, 'static', 'user-paused');

  if (definition.observed.loop === 'none') {
    return result(definition, 'active', 'eligible');
  }
  if (!runtime.active) return result(definition, 'static', 'inactive');
  if (definition.observed.loop === 'finite') {
    return result(definition, 'active', 'eligible');
  }
  if (definition.purpose === 'ambient' && !runtime.allowAmbientMotion) {
    return result(definition, 'static', 'ambient-disabled');
  }
  if (definition.purpose !== 'ambient' && !runtime.allowContinuousMotion) {
    return result(definition, 'static', 'continuous-disabled');
  }
  if (!runtime.continuousSlotAvailable) {
    return result(definition, 'static', 'continuous-slot-unavailable');
  }

  return result(definition, 'active', 'eligible');
}

/** Resolve a closed-catalog effect by ID. Unknown aliases fail closed. */
export function resolveEffect(
  id: unknown,
  context?: EffectRuntimeContext | unknown,
): EffectResolution {
  const definition = getEffectDefinition(id);
  return definition ? resolveEffectDefinition(definition, context) : UNKNOWN_EFFECT;
}
