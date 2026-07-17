'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  EffectRuntimeTelemetryEvent,
  EffectRuntimeTelemetryListener,
} from '@/foundation/contracts/runtime/effects';

interface EffectRuntimeControlContextValue {
  readonly enabled: boolean;
  readonly listeners: readonly EffectRuntimeTelemetryListener[];
}

const NO_TELEMETRY_LISTENERS = Object.freeze(
  [] as EffectRuntimeTelemetryListener[],
);

const DEFAULT_EFFECT_RUNTIME_CONTROL = Object.freeze({
  enabled: true,
  listeners: NO_TELEMETRY_LISTENERS,
}) satisfies EffectRuntimeControlContextValue;

const EffectRuntimeControlContext = createContext<EffectRuntimeControlContextValue>(
  DEFAULT_EFFECT_RUNTIME_CONTROL,
);

export interface EffectRuntimeProviderProps {
  readonly children: ReactNode;
  /**
   * Global/subtree DS runtime switch. A disabled ancestor is monotonic: a
   * nested provider cannot reopen work that its parent disabled.
   */
  readonly enabled?: boolean;
  /** Observes all governed effect events emitted inside this subtree. */
  readonly onTelemetry?: EffectRuntimeTelemetryListener;
}

/**
 * DS-owned effect control. It intentionally accepts no tenant, hostname,
 * vertical or app configuration, so presentation data cannot authorize work.
 */
export function EffectRuntimeProvider({
  children,
  enabled,
  onTelemetry,
}: EffectRuntimeProviderProps) {
  const parent = useContext(EffectRuntimeControlContext);
  const locallyEnabled = (enabled ?? true) === true;
  const value = useMemo<EffectRuntimeControlContextValue>(() => {
    const listeners = typeof onTelemetry === 'function'
      ? Object.freeze([...parent.listeners, onTelemetry])
      : parent.listeners;

    return Object.freeze({
      enabled: parent.enabled && locallyEnabled,
      listeners,
    });
  }, [locallyEnabled, onTelemetry, parent.enabled, parent.listeners]);

  return (
    <EffectRuntimeControlContext.Provider value={value}>
      {children}
    </EffectRuntimeControlContext.Provider>
  );
}

export interface ResolvedEffectRuntimeControl {
  readonly enabled: boolean;
  readonly emitTelemetry: (event: EffectRuntimeTelemetryEvent) => void;
}

/** Internal composition seam used by governed public effect boundaries. */
export function useEffectRuntimeControl(
  instanceEnabled: unknown,
  instanceListener?: EffectRuntimeTelemetryListener,
): ResolvedEffectRuntimeControl {
  const control = useContext(EffectRuntimeControlContext);
  const enabled = control.enabled && (instanceEnabled ?? true) === true;
  const emitTelemetry = useCallback((event: EffectRuntimeTelemetryEvent) => {
    const listeners = new Set(control.listeners);
    if (typeof instanceListener === 'function') listeners.add(instanceListener);

    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
        // Observability must never change the governed runtime resolution.
      }
    }
  }, [control.listeners, instanceListener]);

  return useMemo(
    () => Object.freeze({ enabled, emitTelemetry }),
    [emitTelemetry, enabled],
  );
}
