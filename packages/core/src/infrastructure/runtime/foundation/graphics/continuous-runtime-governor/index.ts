export type {
  ContinuousGraphicsRuntimeBudget,
  ContinuousGraphicsRuntimeClass,
  ContinuousGraphicsRuntimeGovernor,
  ContinuousGraphicsRuntimeLeaseRequest,
  ContinuousGraphicsRuntimeReason,
  ContinuousGraphicsRuntimeSnapshot,
  ContinuousGraphicsRuntimeTelemetryCode,
  ContinuousGraphicsRuntimeTelemetryEvent,
  ContinuousGraphicsRuntimeTelemetryListener,
} from './foundation/contracts';

export {
  CONTINUOUS_GRAPHICS_RUNTIME_CLASSES,
  CONTINUOUS_GRAPHICS_RUNTIME_REASONS,
  CONTINUOUS_GRAPHICS_RUNTIME_TELEMETRY_CODES,
  DEFAULT_CONTINUOUS_GRAPHICS_RUNTIME_BUDGET,
} from './foundation/contracts';

export {
  acquireContinuousGraphicsRuntimeLease,
  createContinuousGraphicsRuntimeGovernor,
  getContinuousGraphicsRuntimeSnapshot,
  installContinuousGraphicsRuntimeTelemetry,
  releaseContinuousGraphicsRuntimeLease,
} from './runtime/admission';
