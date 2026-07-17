import {
  CONTINUOUS_GRAPHICS_RUNTIME_CLASSES,
  DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
  type ContinuousGraphicsRuntimeBudget,
  type ContinuousGraphicsRuntimeClass,
  type ContinuousGraphicsRuntimeGovernor,
  type ContinuousGraphicsRuntimeLeaseRequest,
  type ContinuousGraphicsRuntimeReason,
  type ContinuousGraphicsRuntimeSnapshot,
  type ContinuousGraphicsRuntimeTelemetryClass,
  type ContinuousGraphicsRuntimeTelemetryCode,
  type ContinuousGraphicsRuntimeTelemetryEvent,
  type ContinuousGraphicsRuntimeTelemetryListener,
} from '../../foundation/contracts';

interface ActiveLease {
  readonly runtimeClass: ContinuousGraphicsRuntimeClass;
}

interface WaitingLease extends ActiveLease {
  readonly onAvailable: () => void;
}

const RUNTIME_CLASS_SET: ReadonlySet<string> = new Set(
  CONTINUOUS_GRAPHICS_RUNTIME_CLASSES,
);

function isRuntimeClass(value: unknown): value is ContinuousGraphicsRuntimeClass {
  return typeof value === 'string' && RUNTIME_CLASS_SET.has(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function normalizeBudget(value: unknown): ContinuousGraphicsRuntimeBudget | null {
  if (!value || typeof value !== 'object') return null;
  try {
    const candidate = value as Partial<ContinuousGraphicsRuntimeBudget>;
    const maxActiveTotal = candidate.maxActiveTotal;
    const classBudget = candidate.maxActiveByClass;
    if (!isNonNegativeInteger(maxActiveTotal)) return null;
    if (!classBudget || typeof classBudget !== 'object') return null;

    const decorativeBudget = classBudget['decorative-2d'];
    const spatialBudget = classBudget['immersive-spatial'];
    if (
      !isNonNegativeInteger(decorativeBudget)
      || !isNonNegativeInteger(spatialBudget)
    ) {
      return null;
    }

    return Object.freeze({
      maxActiveTotal,
      maxActiveByClass: Object.freeze({
        'decorative-2d': decorativeBudget,
        'immersive-spatial': spatialBudget,
      }),
    });
  } catch {
    // Proxies/getters are untrusted at this internal JS boundary.
    return null;
  }
}

/**
 * Creates an isolated, DOM-free admission governor.
 *
 * Invalid budgets and malformed runtime requests fail closed. The governor
 * never reads browser globals, so importing or exercising it during SSR is
 * deterministic. Availability callbacks are notifications only and are
 * isolated from the release path.
 */
export function createContinuousGraphicsRuntimeGovernor(
  budgetInput: unknown,
  onTelemetry?: ContinuousGraphicsRuntimeTelemetryListener,
): ContinuousGraphicsRuntimeGovernor {
  const budget = normalizeBudget(budgetInput);
  const active = new Map<symbol, ActiveLease>();
  const waiting = new Map<symbol, WaitingLease>();

  const activeCount = (runtimeClass: ContinuousGraphicsRuntimeClass): number => {
    let count = 0;
    for (const lease of active.values()) {
      if (lease.runtimeClass === runtimeClass) count += 1;
    }
    return count;
  };

  const waitingCount = (runtimeClass: ContinuousGraphicsRuntimeClass): number => {
    let count = 0;
    for (const lease of waiting.values()) {
      if (lease.runtimeClass === runtimeClass) count += 1;
    }
    return count;
  };

  const emit = (
    code: ContinuousGraphicsRuntimeTelemetryCode,
    runtimeClass: ContinuousGraphicsRuntimeTelemetryClass,
    reason?: ContinuousGraphicsRuntimeReason,
  ): void => {
    if (typeof onTelemetry !== 'function') return;
    const event: ContinuousGraphicsRuntimeTelemetryEvent = Object.freeze({
      code,
      runtimeClass,
      activeTotal: active.size,
      activeForClass: runtimeClass === 'unknown' ? 0 : activeCount(runtimeClass),
      waitingTotal: waiting.size,
      ...(reason ? { reason } : {}),
    });
    try {
      onTelemetry(event);
    } catch {
      // Operational diagnostics must never break graphics disposal/admission.
    }
  };

  const resolveAdmissionReason = (
    runtimeClass: ContinuousGraphicsRuntimeClass,
  ): 'class-budget' | 'total-budget' | null => {
    if (!budget || active.size >= budget.maxActiveTotal) return 'total-budget';
    if (activeCount(runtimeClass) >= budget.maxActiveByClass[runtimeClass]) {
      return 'class-budget';
    }
    return null;
  };

  const promoteAvailableWaiters = (): void => {
    for (const [owner, lease] of [...waiting.entries()]) {
      const reason = resolveAdmissionReason(lease.runtimeClass);
      if (reason === 'total-budget') return;
      if (reason === 'class-budget') continue;

      waiting.delete(owner);
      emit('waiter-notified', lease.runtimeClass);
      try {
        lease.onAvailable();
      } catch {
        // A stale/broken waiter cannot prevent the next eligible owner.
      }
    }
  };

  const acquire = (request: ContinuousGraphicsRuntimeLeaseRequest): boolean => {
    let owner: unknown;
    let runtimeClassValue: unknown;
    let onAvailable: unknown;
    try {
      const candidate = request as Partial<ContinuousGraphicsRuntimeLeaseRequest> | null;
      if (!candidate || typeof candidate !== 'object') {
        emit('request-rejected', 'unknown', 'invalid-request');
        return false;
      }
      owner = candidate.owner;
      runtimeClassValue = candidate.runtimeClass;
      onAvailable = candidate.onAvailable;
    } catch {
      emit('request-rejected', 'unknown', 'invalid-request');
      return false;
    }

    const runtimeClass: ContinuousGraphicsRuntimeTelemetryClass = isRuntimeClass(
      runtimeClassValue,
    )
      ? runtimeClassValue
      : 'unknown';

    if (!budget) {
      emit('request-rejected', runtimeClass, 'invalid-budget');
      return false;
    }
    if (
      typeof owner !== 'symbol'
      || runtimeClass === 'unknown'
      || typeof onAvailable !== 'function'
    ) {
      emit('request-rejected', runtimeClass, 'invalid-request');
      return false;
    }
    const availabilityCallback = onAvailable as () => void;

    const activeLease = active.get(owner);
    if (activeLease) {
      if (activeLease.runtimeClass === runtimeClass) return true;
      emit('request-rejected', runtimeClass, 'owner-class-conflict');
      return false;
    }

    const waitingLease = waiting.get(owner);
    if (waitingLease) {
      if (waitingLease.runtimeClass !== runtimeClass) {
        emit('request-rejected', runtimeClass, 'owner-class-conflict');
        return false;
      }
      waiting.set(owner, {
        runtimeClass,
        onAvailable: availabilityCallback,
      });
      return false;
    }

    if (budget.maxActiveTotal === 0) {
      emit('request-rejected', runtimeClass, 'total-budget');
      return false;
    }
    if (budget.maxActiveByClass[runtimeClass] === 0) {
      emit('request-rejected', runtimeClass, 'class-budget');
      return false;
    }

    const reason = resolveAdmissionReason(runtimeClass);
    if (reason) {
      waiting.set(owner, {
        runtimeClass,
        onAvailable: availabilityCallback,
      });
      emit('lease-queued', runtimeClass, reason);
      return false;
    }

    active.set(owner, { runtimeClass });
    emit('lease-granted', runtimeClass);
    return true;
  };

  const release = (owner: symbol): void => {
    if (typeof owner !== 'symbol') return;

    const waitingLease = waiting.get(owner);
    if (waitingLease) {
      waiting.delete(owner);
      emit('waiter-cancelled', waitingLease.runtimeClass);
    }

    const activeLease = active.get(owner);
    if (!activeLease) return;
    active.delete(owner);
    emit('lease-released', activeLease.runtimeClass);
    promoteAvailableWaiters();
  };

  const snapshot = (): ContinuousGraphicsRuntimeSnapshot => Object.freeze({
    budgetValid: budget !== null,
    activeTotal: active.size,
    activeByClass: Object.freeze({
      'decorative-2d': activeCount('decorative-2d'),
      'immersive-spatial': activeCount('immersive-spatial'),
    }),
    waitingTotal: waiting.size,
    waitingByClass: Object.freeze({
      'decorative-2d': waitingCount('decorative-2d'),
      'immersive-spatial': waitingCount('immersive-spatial'),
    }),
  });

  const reset = (): void => {
    active.clear();
    waiting.clear();
  };

  return Object.freeze({ acquire, release, snapshot, reset });
}

const telemetryListeners = new Map<symbol, ContinuousGraphicsRuntimeTelemetryListener>();

function emitRuntimeTelemetry(event: ContinuousGraphicsRuntimeTelemetryEvent): void {
  for (const listener of telemetryListeners.values()) {
    try {
      listener(event);
    } catch {
      // One diagnostics sink cannot prevent other sinks from observing state.
    }
  }
}

const documentGovernor = createContinuousGraphicsRuntimeGovernor(
  DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
  emitRuntimeTelemetry,
);

export function acquireContinuousGraphicsRuntimeLease(
  request: ContinuousGraphicsRuntimeLeaseRequest,
): boolean {
  return documentGovernor.acquire(request);
}

export function releaseContinuousGraphicsRuntimeLease(owner: symbol): void {
  documentGovernor.release(owner);
}

export function getContinuousGraphicsRuntimeSnapshot(): ContinuousGraphicsRuntimeSnapshot {
  return documentGovernor.snapshot();
}

/** Installs an independently disposable, non-fatal lifecycle telemetry sink. */
export function installContinuousGraphicsRuntimeTelemetry(
  listener: ContinuousGraphicsRuntimeTelemetryListener,
): () => void {
  if (typeof listener !== 'function') return () => undefined;
  const token = Symbol('continuous-graphics-runtime-telemetry');
  telemetryListeners.set(token, listener);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    telemetryListeners.delete(token);
  };
}

/** Test-only reset; deliberately absent from package entrypoints. */
export function resetContinuousGraphicsRuntimeGovernorForTests(): void {
  documentGovernor.reset();
  telemetryListeners.clear();
}
