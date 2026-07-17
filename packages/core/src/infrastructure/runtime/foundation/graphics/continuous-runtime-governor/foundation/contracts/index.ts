/** Supplier-neutral classes of graphics work that remains live while visible. */
export const CONTINUOUS_GRAPHICS_RUNTIME_CLASSES = [
  'decorative-2d',
  'immersive-spatial',
] as const;

export type ContinuousGraphicsRuntimeClass =
  (typeof CONTINUOUS_GRAPHICS_RUNTIME_CLASSES)[number];

export interface ContinuousGraphicsRuntimeBudget {
  /** Maximum number of continuous graphics runtimes in one document. */
  readonly maxActiveTotal: number;
  /** Class-specific ceilings. A zero disables the class without a special case. */
  readonly maxActiveByClass: Readonly<Record<ContinuousGraphicsRuntimeClass, number>>;
}

/**
 * Conservative document budget shared by every continuous graphics adapter.
 *
 * Both classes retain their own explicit ceiling, while the total ceiling
 * prevents a decorative canvas and a spatial context from competing for the
 * same frame budget. Static representations do not consume this budget.
 */
export const DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET:
  ContinuousGraphicsRuntimeBudget = Object.freeze({
  maxActiveTotal: 1,
  maxActiveByClass: Object.freeze({
    'decorative-2d': 1,
    'immersive-spatial': 1,
  }),
});

export const CONTINUOUS_GRAPHICS_RUNTIME_TELEMETRY_CODES = [
  'lease-granted',
  'lease-queued',
  'lease-released',
  'waiter-cancelled',
  'waiter-notified',
  'request-rejected',
] as const;

export type ContinuousGraphicsRuntimeTelemetryCode =
  (typeof CONTINUOUS_GRAPHICS_RUNTIME_TELEMETRY_CODES)[number];

export const CONTINUOUS_GRAPHICS_RUNTIME_REASONS = [
  'class-budget',
  'total-budget',
  'invalid-budget',
  'invalid-request',
  'owner-class-conflict',
] as const;

export type ContinuousGraphicsRuntimeReason =
  (typeof CONTINUOUS_GRAPHICS_RUNTIME_REASONS)[number];

export type ContinuousGraphicsRuntimeTelemetryClass =
  | ContinuousGraphicsRuntimeClass
  | 'unknown';

/** Bounded, identity-free lifecycle telemetry. No frame-level events are emitted. */
export interface ContinuousGraphicsRuntimeTelemetryEvent {
  readonly code: ContinuousGraphicsRuntimeTelemetryCode;
  readonly runtimeClass: ContinuousGraphicsRuntimeTelemetryClass;
  readonly activeTotal: number;
  readonly activeForClass: number;
  readonly waitingTotal: number;
  readonly reason?: ContinuousGraphicsRuntimeReason;
}

export type ContinuousGraphicsRuntimeTelemetryListener = (
  event: ContinuousGraphicsRuntimeTelemetryEvent,
) => void;

export interface ContinuousGraphicsRuntimeLeaseRequest {
  readonly owner: symbol;
  readonly runtimeClass: ContinuousGraphicsRuntimeClass;
  /** Notification only. The owner must acquire again before starting work. */
  readonly onAvailable: () => void;
}

export interface ContinuousGraphicsRuntimeSnapshot {
  readonly budgetValid: boolean;
  readonly activeTotal: number;
  readonly activeByClass: Readonly<Record<ContinuousGraphicsRuntimeClass, number>>;
  readonly waitingTotal: number;
  readonly waitingByClass: Readonly<Record<ContinuousGraphicsRuntimeClass, number>>;
}

export interface ContinuousGraphicsRuntimeGovernor {
  readonly acquire: (request: ContinuousGraphicsRuntimeLeaseRequest) => boolean;
  readonly release: (owner: symbol) => void;
  readonly snapshot: () => ContinuousGraphicsRuntimeSnapshot;
  /** Internal deterministic cleanup used by adapter tests. */
  readonly reset: () => void;
}
