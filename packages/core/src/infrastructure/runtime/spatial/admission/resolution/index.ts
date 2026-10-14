import type {
  SpatialCapability,
  SpatialContextState,
  SpatialMode,
  SpatialPolicyInput,
  SpatialPointer,
  SpatialPower,
  SpatialQuality,
  SpatialResolution,
  SpatialResolutionReason,
} from '../../../../../foundation/contracts/kernel/spatial';
import { resolveSpatialQualityBudget } from '../../foundation/quality';

type SpatialPolicyKey = keyof SpatialPolicyInput;

function safeRead(value: unknown, key: SpatialPolicyKey): unknown {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return undefined;
  }

  try {
    const input = value as SpatialPolicyInput;
    switch (key) {
      case 'enabled': return input.enabled;
      case 'hydrated': return input.hydrated;
      case 'capability': return input.capability;
      case 'contextState': return input.contextState;
      case 'lease': return input.lease;
      case 'visible': return input.visible;
      case 'inView': return input.inView;
      case 'reduce': return input.reduce;
      case 'phone': return input.phone;
      case 'tablet': return input.tablet;
      case 'pointer': return input.pointer;
      case 'power': return input.power;
      case 'quality': return input.quality;
      case 'adaptiveLow': return input.adaptiveLow;
      case 'contractReady': return input.contractReady;
    }
  } catch {
    return undefined;
  }
}

function normalizeCapability(value: unknown): SpatialCapability {
  return value === 'webgl2' || value === 'none' ? value : 'unknown';
}

function normalizeContextState(value: unknown): SpatialContextState {
  return value === 'ready' || value === 'lost' || value === 'error'
    ? value
    : 'error';
}

function normalizePointer(value: unknown): SpatialPointer {
  return value === 'fine' ? 'fine' : 'coarse';
}

function normalizePower(value: unknown): SpatialPower {
  return value === 'normal' ? 'normal' : 'constrained';
}

function normalizeQuality(value: unknown): SpatialQuality {
  return value === 'auto' || value === 'high' || value === 'low'
    ? value
    : 'low';
}

function resolution(
  mode: SpatialMode,
  reason: SpatialResolutionReason,
): SpatialResolution {
  const live = mode === 'live-low' || mode === 'live-high';
  return Object.freeze({
    mode,
    backend: live ? 'webgl2' : 'none',
    reason,
    shouldLoad: live,
    shouldMount: live,
    shouldRun: live,
    budget: resolveSpatialQualityBudget(mode),
  });
}

const STATIC = (reason: Exclude<
  SpatialResolutionReason,
  'reduced-motion' | 'eligible-low' | 'eligible-high'
>): SpatialResolution => resolution('static', reason);

/**
 * Resolve one spatial posture without touching React, the DOM or a renderer.
 *
 * The order is deliberate: server/contract/visibility gates prevent all work;
 * reduced motion then selects its meaningful reduced node without requiring a
 * GPU probe or context lease. Every remaining missing or constrained signal is
 * static. A caller can request lower quality, never force a constrained device
 * into a higher posture.
 */
export function resolveSpatialPolicy(input: SpatialPolicyInput): SpatialResolution;
export function resolveSpatialPolicy(input: unknown): SpatialResolution;
export function resolveSpatialPolicy(input: unknown): SpatialResolution {
  if (safeRead(input, 'enabled') !== true) return STATIC('disabled');
  if (safeRead(input, 'hydrated') !== true) return STATIC('not-hydrated');
  if (safeRead(input, 'contractReady') !== true) return STATIC('contract-not-ready');
  if (safeRead(input, 'visible') !== true) return STATIC('page-hidden');
  if (safeRead(input, 'inView') !== true) return STATIC('offscreen');

  // Reduced content is React-owned and meaningful on its own. It must not wait
  // for or trigger capability probing, module loading or lease acquisition.
  if (safeRead(input, 'reduce') !== false) {
    return resolution('reduced', 'reduced-motion');
  }

  // Device/network policy is cheaper than allocating even a temporary WebGL2
  // probe context, so constrained environments resolve before capability.
  if (safeRead(input, 'phone') !== false) return STATIC('phone');
  if (normalizePointer(safeRead(input, 'pointer')) === 'coarse') {
    return STATIC('coarse-pointer');
  }
  if (normalizePower(safeRead(input, 'power')) === 'constrained') {
    return STATIC('constrained-power');
  }

  const contextState = normalizeContextState(safeRead(input, 'contextState'));
  if (contextState === 'error') return STATIC('context-error');
  if (contextState === 'lost') return STATIC('context-lost');

  const capability = normalizeCapability(safeRead(input, 'capability'));
  if (capability === 'unknown') return STATIC('capability-unknown');
  if (capability === 'none') return STATIC('webgl2-unsupported');

  if (safeRead(input, 'lease') !== true) return STATIC('context-busy');

  const quality = normalizeQuality(safeRead(input, 'quality'));
  const low = safeRead(input, 'tablet') !== false
    || quality === 'low'
    || safeRead(input, 'adaptiveLow') === true;

  return low
    ? resolution('live-low', 'eligible-low')
    : resolution('live-high', 'eligible-high');
}
