'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import type {
  SpatialContextState,
  SpatialPolicyInput,
} from '../../../../../foundation/contracts/kernel/spatial';
import { useMotionPolicy } from '@/infrastructure/runtime/foundation/motion/composition/react/preference';
import { isSpatialSceneModule } from '../../foundation/validation';
import { resolveSpatialPolicy } from '../../runtime/resolution';
import { SpatialErrorBoundary } from './error-boundary';
import {
  acquireSpatialContextLease,
  releaseSpatialContextLease,
} from '../../runtime/browser/context-lease';
import type {
  SpatialExperienceEvent,
  SpatialExperienceProps,
  SpatialSceneModule,
  SpatialSceneRuntimeProps,
} from '../../composition/react/contracts/types';
import { invalidateWebGL2Capability } from '../../runtime/browser/capability/webgl2';
import { useHydrated } from '../../composition/react/hydrated';
import { useSpatialInView } from '../../composition/react/in-view';
import { useSpatialViewport } from '../../composition/react/viewport';
import { useWebGL2Capability } from '../../composition/react/webgl2-capability';

const VISUALLY_HIDDEN_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

type FailurePhase = 'load' | 'module' | 'render' | 'scene' | 'context';

interface SceneRecord {
  readonly loader: SpatialExperienceProps['loadScene'];
  readonly module: SpatialSceneModule;
}

interface LoaderPromiseRecord {
  readonly loader: SpatialExperienceProps['loadScene'];
  readonly promise: Promise<unknown>;
  readonly startedAt: number;
}

const SPATIAL_SCENE_LOAD_TIMEOUT_MS = 15_000;

interface CanvasRegistration {
  readonly cleanup: () => void;
  readonly dispose?: () => void;
}

function hasRenderableNode(value: unknown): boolean {
  return value !== null && value !== undefined && value !== false;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function resolveContractReady(props: SpatialExperienceProps): boolean {
  if (
    !isNonEmptyString(props.id)
    || !isNonEmptyString(props.label)
    || !isNonEmptyString(props.description)
    || !hasRenderableNode(props.poster)
    || !hasRenderableNode(props.reduced)
    || typeof props.loadScene !== 'function'
  ) {
    return false;
  }

  const interaction = props.interaction ?? 'none';
  if (interaction === 'none') return true;

  return hasRenderableNode(props.controls)
    && hasRenderableNode(props.alternative)
    && isNonEmptyString(props.labels?.controls)
    && isNonEmptyString(props.labels?.alternative);
}

function safeDispose(dispose: (() => void) | undefined): void {
  if (!dispose) return;
  try {
    dispose();
  } catch {
    // Teardown remains idempotent/fail-closed; raw scene errors are never UI.
  }
}

function restoreAttribute(
  element: Element,
  name: string,
  previousValue: string | null,
): void {
  try {
    if (previousValue === null) element.removeAttribute(name);
    else element.setAttribute(name, previousValue);
  } catch {
    // A hostile DOM implementation cannot interrupt the remaining teardown.
  }
}

interface GuardedSpatialSceneProps {
  readonly Scene: SpatialSceneModule['Scene'];
  readonly runtime: SpatialSceneRuntimeProps;
}

/** Isolates callbacks retained by a scene after its React mount is gone. */
function GuardedSpatialScene({ Scene, runtime }: GuardedSpatialSceneProps) {
  const activeRef = useRef(true);
  const readyReportedRef = useRef(false);

  useLayoutEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      readyReportedRef.current = false;
    };
  }, []);

  const registerCanvas = useCallback((
    canvas: HTMLCanvasElement,
    dispose?: () => void,
  ): (() => void) => {
    if (!activeRef.current) {
      safeDispose(dispose);
      return () => undefined;
    }
    const cleanup = runtime.registerCanvas(canvas, dispose);
    return () => {
      readyReportedRef.current = false;
      cleanup();
    };
  }, [runtime.registerCanvas]);

  const reportReady = useCallback((): void => {
    if (!activeRef.current || readyReportedRef.current) return;
    readyReportedRef.current = true;
    runtime.reportReady();
  }, [runtime.reportReady]);

  const reportError = useCallback((error: unknown): void => {
    if (activeRef.current) runtime.reportError(error);
  }, [runtime.reportError]);

  const reportPerformance = useCallback((sample: { frameTimeMs: number }): void => {
    if (activeRef.current) runtime.reportPerformance(sample);
  }, [runtime.reportPerformance]);

  return (
    <Scene
      {...runtime}
      registerCanvas={registerCanvas}
      reportError={reportError}
      reportPerformance={reportPerformance}
      reportReady={reportReady}
    />
  );
}

/**
 * Supplier-neutral spatial lifecycle host.
 *
 * The app owns the lazy scene, domain meaning, controls and equivalent 2D
 * representation. This host owns admission, one-context leasing, capability,
 * suspension, fallback, Canvas registration, failure and adaptive quality.
 */
export function SpatialExperience(props: SpatialExperienceProps) {
  const {
    id,
    label,
    purpose,
    description,
    poster,
    reduced,
    alternative,
    controls,
    labels,
    loadScene,
    quality = 'auto',
    interaction = 'none',
    enabled = true,
    className,
    style,
  } = props;
  const hostRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const leaseOwnerRef = useRef(Symbol(`spatial-context:${id}`));
  const hostActiveRef = useRef(true);
  const onEventRef = useRef(props.onEvent);
  const failureRef = useRef<FailurePhase | null>(null);
  const canvasCleanupsRef = useRef(new Map<HTMLCanvasElement, CanvasRegistration>());
  const loaderPromiseRef = useRef<LoaderPromiseRecord | null>(null);
  const loadGenerationRef = useRef(0);
  const readySceneRef = useRef<SceneRecord | null>(null);
  const lastModeEventRef = useRef<string | null>(null);
  const slowFrameCountRef = useRef(0);
  const adaptiveLowRef = useRef(false);
  const [failure, setFailure] = useState<FailurePhase | null>(null);
  const [sceneRecord, setSceneRecord] = useState<SceneRecord | null>(null);
  const [leaseGranted, setLeaseGranted] = useState(false);
  const [ready, setReady] = useState(false);
  const [adaptiveLow, setAdaptiveLow] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [probeKey, setProbeKey] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const hydrated = useHydrated();
  const inView = useSpatialInView(hostRef);
  const viewport = useSpatialViewport();
  const motionPolicy = useMotionPolicy();
  const contractReady = resolveContractReady(props);

  onEventRef.current = props.onEvent;

  const emit = useCallback((event: SpatialExperienceEvent): void => {
    if (!hostActiveRef.current) return;
    try {
      onEventRef.current?.(event);
    } catch {
      // Observability is never allowed to break the experience lifecycle.
    }
  }, []);

  const cleanupCanvases = useCallback((): void => {
    const cleanups = [...canvasCleanupsRef.current.values()]
      .map((registration) => registration.cleanup);
    canvasCleanupsRef.current.clear();
    cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    hostActiveRef.current = true;
    return () => {
      hostActiveRef.current = false;
      loadGenerationRef.current += 1;
      readySceneRef.current = null;
      cleanupCanvases();
    };
  }, [cleanupCanvases]);

  const recordFailure = useCallback((phase: FailurePhase): void => {
    if (!hostActiveRef.current || failureRef.current !== null) return;
    failureRef.current = phase;
    readySceneRef.current = null;
    setFailure(phase);
    setReady(false);
    emit({ type: 'error', id, phase });
  }, [emit, id]);

  const cheapCapabilityAdmission = enabled
    && !userPaused
    && contractReady
    && hydrated
    && inView
    && motionPolicy.visible
    && !motionPolicy.reduce
    && motionPolicy.pointer === 'fine'
    && motionPolicy.power === 'normal'
    && !viewport.phone
    && failure === null;
  const capability = useWebGL2Capability(cheapCapabilityAdmission, probeKey);
  const contextState: SpatialContextState = failure === 'context'
    ? 'lost'
    : failure === null
      ? 'ready'
      : 'error';

  const policyInputBase = useMemo<Omit<SpatialPolicyInput, 'lease'>>(() => ({
    enabled: enabled && !userPaused,
    hydrated,
    contractReady,
    capability,
    contextState,
    visible: motionPolicy.visible,
    inView,
    reduce: motionPolicy.reduce,
    phone: viewport.phone,
    tablet: viewport.tablet,
    pointer: motionPolicy.pointer,
    power: motionPolicy.power,
    quality,
    adaptiveLow,
  }), [
    adaptiveLow,
    capability,
    contextState,
    contractReady,
    enabled,
    hydrated,
    inView,
    motionPolicy.pointer,
    motionPolicy.power,
    motionPolicy.reduce,
    motionPolicy.visible,
    quality,
    userPaused,
    viewport.phone,
    viewport.tablet,
  ]);
  const candidateResolution = useMemo(
    () => resolveSpatialPolicy({ ...policyInputBase, lease: true }),
    [policyInputBase],
  );

  useEffect(() => {
    const owner = leaseOwnerRef.current;
    if (!candidateResolution.shouldMount) {
      releaseSpatialContextLease(owner);
      setLeaseGranted(false);
      return undefined;
    }

    let mounted = true;
    const tryAcquire = (): void => {
      if (!mounted) return;
      const acquired = acquireSpatialContextLease(owner, tryAcquire);
      setLeaseGranted(acquired);
    };
    tryAcquire();

    return () => {
      mounted = false;
      releaseSpatialContextLease(owner);
    };
  }, [candidateResolution.shouldMount]);

  const resolution = useMemo(
    () => resolveSpatialPolicy({ ...policyInputBase, lease: leaseGranted }),
    [leaseGranted, policyInputBase],
  );

  useEffect(() => {
    const eventKey = [id, resolution.mode, resolution.backend, resolution.reason].join('|');
    if (lastModeEventRef.current === eventKey) return;
    lastModeEventRef.current = eventKey;
    emit({
      type: 'mode',
      id,
      mode: resolution.mode,
      backend: resolution.backend,
      reason: resolution.reason,
    });
  }, [emit, id, resolution.backend, resolution.mode, resolution.reason]);

  useEffect(() => {
    if (resolution.shouldMount) return undefined;
    readySceneRef.current = null;
    setReady(false);
    cleanupCanvases();
    return undefined;
  }, [cleanupCanvases, resolution.shouldMount]);

  const sceneModule = sceneRecord?.loader === loadScene
    ? sceneRecord.module
    : null;

  useEffect(() => {
    if (!resolution.shouldLoad || sceneModule || failure !== null) return undefined;

    let mounted = true;
    let record = loaderPromiseRef.current;
    if (!record || record.loader !== loadScene) {
      loadGenerationRef.current += 1;
      readySceneRef.current = null;
      setReady(false);
      let promise: Promise<unknown>;
      try {
        promise = Promise.resolve(loadScene());
      } catch (error) {
        promise = Promise.reject(error);
      }
      record = { loader: loadScene, promise, startedAt: Date.now() };
      loaderPromiseRef.current = record;
      emit({ type: 'load-start', id });
    }
    const generation = loadGenerationRef.current;
    const timeoutMs = Math.max(
      0,
      SPATIAL_SCENE_LOAD_TIMEOUT_MS - (Date.now() - record.startedAt),
    );
    const timeout = window.setTimeout(() => {
      if (
        mounted
        && hostActiveRef.current
        && failureRef.current === null
        && generation === loadGenerationRef.current
        && loaderPromiseRef.current === record
      ) recordFailure('load');
    }, timeoutMs);

    record.promise.then(
      (candidate) => {
        window.clearTimeout(timeout);
        if (
          !mounted
          || !hostActiveRef.current
          || failureRef.current !== null
          || generation !== loadGenerationRef.current
          || loaderPromiseRef.current !== record
        ) return;
        if (!isSpatialSceneModule(candidate)) {
          recordFailure('module');
          return;
        }
        const module = candidate as SpatialSceneModule;
        if (module.backend !== resolution.backend) {
          recordFailure('module');
          return;
        }
        setSceneRecord({ loader: loadScene, module });
      },
      () => {
        window.clearTimeout(timeout);
        if (
          mounted
          && hostActiveRef.current
          && generation === loadGenerationRef.current
          && loaderPromiseRef.current === record
        ) recordFailure('load');
      },
    );

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [
    emit,
    failure,
    id,
    loadScene,
    recordFailure,
    resolution.backend,
    resolution.shouldLoad,
    sceneModule,
  ]);

  const registerCanvas = useCallback((
    canvas: HTMLCanvasElement,
    dispose?: () => void,
  ): (() => void) => {
    const visual = visualRef.current;
    let validCanvas = false;
    try {
      validCanvas = hostActiveRef.current
        && failureRef.current === null
        && typeof HTMLCanvasElement !== 'undefined'
        && canvas instanceof HTMLCanvasElement
        && visual?.contains(canvas) === true;
    } catch {
      validCanvas = false;
    }
    if (!validCanvas) {
      safeDispose(dispose);
      if (hostActiveRef.current) recordFailure('scene');
      return () => undefined;
    }

    const existing = canvasCleanupsRef.current.get(canvas);
    if (existing) {
      if (dispose && dispose !== existing.dispose) safeDispose(dispose);
      recordFailure('scene');
      return () => undefined;
    }
    if (
      canvasCleanupsRef.current.size > 0
    ) {
      safeDispose(dispose);
      recordFailure('scene');
      return () => undefined;
    }

    const previousAriaHidden = canvas.getAttribute('aria-hidden');
    const previousRole = canvas.getAttribute('role');
    const previousTabIndex = canvas.getAttribute('tabindex');
    const previousExperience = canvas.getAttribute('data-spatial-experience-canvas');
    let cleaned = false;
    let listenerAttached = false;

    const onContextLost = (event: Event): void => {
      try {
        event.preventDefault();
      } catch {
        // A malformed event still poisons the context and must fail closed.
      }
      recordFailure('context');
    };
    const cleanup = (): void => {
      if (cleaned) return;
      cleaned = true;
      canvasCleanupsRef.current.delete(canvas);
      if (listenerAttached) {
        try {
          canvas.removeEventListener('webglcontextlost', onContextLost);
        } catch {
          // Continue restoring semantics and disposing renderer resources.
        }
      }
      safeDispose(dispose);
      restoreAttribute(canvas, 'aria-hidden', previousAriaHidden);
      restoreAttribute(canvas, 'role', previousRole);
      restoreAttribute(canvas, 'tabindex', previousTabIndex);
      restoreAttribute(canvas, 'data-spatial-experience-canvas', previousExperience);
    };

    try {
      canvas.setAttribute('aria-hidden', 'true');
      canvas.setAttribute('role', 'presentation');
      canvas.setAttribute('tabindex', '-1');
      canvas.setAttribute('data-spatial-experience-canvas', id);
      canvas.addEventListener('webglcontextlost', onContextLost);
      listenerAttached = true;
      canvasCleanupsRef.current.set(canvas, { cleanup, dispose });
    } catch {
      cleanup();
      recordFailure('scene');
      return () => undefined;
    }
    return cleanup;
  }, [id, recordFailure]);

  const reportReady = useCallback((): void => {
    const [canvas] = canvasCleanupsRef.current.keys();
    let validCanvas = false;
    try {
      validCanvas = hostActiveRef.current
        && failureRef.current === null
        && sceneModule !== null
        && canvasCleanupsRef.current.size === 1
        && canvas !== undefined
        && visualRef.current?.contains(canvas) === true;
    } catch {
      validCanvas = false;
    }
    if (!validCanvas || !sceneModule) {
      recordFailure('scene');
      return;
    }
    const previousReadyScene = readySceneRef.current;
    if (previousReadyScene?.loader === loadScene && previousReadyScene.module === sceneModule) return;
    readySceneRef.current = { loader: loadScene, module: sceneModule };
    setReady(true);
    emit({ type: 'ready', id });
  }, [emit, id, loadScene, recordFailure, sceneModule]);

  const reportPerformance = useCallback((sample: { frameTimeMs: number }): void => {
    if (!hostActiveRef.current || quality !== 'auto' || adaptiveLowRef.current) return;
    if (!Number.isFinite(sample?.frameTimeMs) || sample.frameTimeMs < 0) return;

    slowFrameCountRef.current = sample.frameTimeMs >= 25
      ? slowFrameCountRef.current + 1
      : Math.max(0, slowFrameCountRef.current - 1);
    if (slowFrameCountRef.current < 8) return;

    slowFrameCountRef.current = 0;
    adaptiveLowRef.current = true;
    setAdaptiveLow(true);
    emit({ type: 'quality', id, mode: 'live-low' });
  }, [emit, id, quality]);

  const retry = useCallback((): void => {
    loadGenerationRef.current += 1;
    cleanupCanvases();
    releaseSpatialContextLease(leaseOwnerRef.current);
    setLeaseGranted(false);
    failureRef.current = null;
    setFailure(null);
    readySceneRef.current = null;
    setReady(false);
    setSceneRecord(null);
    setAdaptiveLow(false);
    adaptiveLowRef.current = false;
    slowFrameCountRef.current = 0;
    loaderPromiseRef.current = null;
    invalidateWebGL2Capability();
    setProbeKey((value) => value + 1);
    setRetryKey((value) => value + 1);
    emit({ type: 'retry', id });
  }, [cleanupCanvases, emit, id]);

  const Scene = sceneModule?.Scene;
  const live = resolution.shouldMount && Scene !== undefined;
  const labelId = `${useId()}-label`;
  const descriptionId = `${useId()}-description`;
  const showReduced = resolution.mode === 'reduced';
  const showPoster = !showReduced && (!live || !ready);
  const pauseAvailable = isNonEmptyString(labels?.pause)
    && isNonEmptyString(labels?.resume);
  const rootStyle: CSSProperties = {
    position: 'relative',
    isolation: 'isolate',
    ...style,
  };

  return (
    <section
      ref={hostRef}
      aria-describedby={descriptionId}
      aria-labelledby={labelId}
      className={className}
      data-spatial-backend={resolution.backend}
      data-spatial-mode={resolution.mode}
      data-spatial-purpose={purpose}
      data-spatial-ready={ready ? 'true' : 'false'}
      data-spatial-reason={resolution.reason}
      role="region"
      style={rootStyle}
    >
      <span id={labelId} style={VISUALLY_HIDDEN_STYLE}>{label}</span>
      <p id={descriptionId} style={VISUALLY_HIDDEN_STYLE}>{description}</p>

      <div data-spatial-visual="true" style={{ position: 'relative' }}>
        <div
          aria-hidden={live && ready ? 'true' : undefined}
          data-spatial-fallback={showReduced ? 'reduced' : 'poster'}
          style={live && ready ? { visibility: 'hidden' } : undefined}
        >
          {showReduced ? reduced : poster}
        </div>

        {live && Scene ? (
          <div
            ref={visualRef}
            aria-hidden="true"
            data-spatial-scene="true"
            style={{ position: 'absolute', inset: 0 }}
          >
            <SpatialErrorBoundary
              fallback={null}
              onError={() => recordFailure('render')}
              resetKey={retryKey}
            >
              <GuardedSpatialScene
                Scene={Scene}
                runtime={{
                  active: true,
                  backend: 'webgl2',
                  id,
                  interaction,
                  mode: resolution.mode === 'live-low' ? 'live-low' : 'live-high',
                  quality: resolution.budget!,
                  registerCanvas,
                  reportError: () => recordFailure('scene'),
                  reportPerformance,
                  reportReady,
                }}
              />
            </SpatialErrorBoundary>
          </div>
        ) : null}
      </div>

      {live && ready && interaction !== 'none' && hasRenderableNode(controls) && labels?.controls ? (
        <div aria-label={labels.controls} data-spatial-controls="true" role="group">
          {controls}
        </div>
      ) : null}

      {hasRenderableNode(alternative) && labels?.alternative ? (
        <details data-spatial-alternative="true">
          <summary>{labels.alternative}</summary>
          <div>{alternative}</div>
        </details>
      ) : null}

      {pauseAvailable && ((live && ready) || userPaused) ? (
        <button
          aria-pressed={userPaused}
          data-spatial-pause="true"
          onClick={() => setUserPaused((value) => !value)}
          type="button"
        >
          {userPaused ? labels?.resume : labels?.pause}
        </button>
      ) : null}

      {failure !== null && labels?.retry ? (
        <button data-spatial-retry="true" onClick={retry} type="button">
          {labels.retry}
        </button>
      ) : null}
    </section>
  );
}

SpatialExperience.displayName = 'SpatialExperience';
