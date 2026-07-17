'use client';

/**
 * Public ParticleField boundary.
 *
 * Policy and viewport gating stay in this lightweight module. The canvas
 * implementation is not requested until the field can actually animate.
 */

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import { useMotionPolicy } from '@/infrastructure/runtime/motion';
import {
  useEffectRuntimeControl,
} from '@/infrastructure/runtime/effects/composition/react/provider';
import { resolveEffect } from '@/infrastructure/runtime/effects';
import type {
  EffectTelemetryState,
} from '@/foundation/contracts/runtime/effects';
import type { ParticleFieldProps } from '@/graphics/motion/foundation/contracts';
import {
  hasPotentialParticles,
  isParticleAnimationEligible,
} from '@/graphics/motion/foundation/particles/eligibility';
import { useParticleInView } from './runtime/foundation/visibility';

const LazyParticleFieldRuntime = lazy(() =>
  import('./runtime/canvas').then(({ ParticleField }) => ({ default: ParticleField })),
);

const PARTICLE_FIELD_CONTENT_STYLE: CSSProperties = {
  position: 'relative',
  zIndex: 1,
};

const PARTICLE_FIELD_RUNTIME_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
};

interface ParticleFieldShellProps {
  children?: ReactNode;
  className?: string;
  effect?: ReactNode;
  ownerRef?: RefObject<HTMLDivElement | null>;
  resolution?: EffectTelemetryState;
  runtime: 'loading' | 'static';
  style?: CSSProperties;
}

function ParticleFieldShell({
  children,
  className,
  effect,
  ownerRef,
  resolution,
  runtime,
  style,
}: ParticleFieldShellProps) {
  const resolvedStyle: CSSProperties = {
    position: 'relative',
    isolation: 'isolate',
    ...style,
  };

  return (
    <div
      ref={ownerRef}
      className={className}
      data-effect-id={resolution ? 'particle-field' : undefined}
      data-effect-mode={resolution?.mode}
      data-effect-reason={resolution?.reason}
      data-particle-field-policy={runtime === 'static' ? 'blocked' : 'eligible'}
      data-particle-field-raf="none"
      data-particle-field-runtime={runtime}
      style={resolvedStyle}
    >
      {effect}
      {children ? (
        <div
          data-particle-field-content="true"
          style={PARTICLE_FIELD_CONTENT_STYLE}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ParticleFieldLoadingFallback({
  children,
  className,
  style,
}: Pick<ParticleFieldProps, 'children' | 'className' | 'style'>) {
  return (
    <ParticleFieldShell
      children={children}
      className={className}
      runtime="loading"
      style={style}
    />
  );
}

/** Backward-compatible public component; canvas remains an eligible-only opt-in. */
export function ParticleField(props: ParticleFieldProps) {
  const ownerRef = useRef<HTMLDivElement>(null);
  const previousTelemetryStateRef = useRef<EffectTelemetryState | null>(null);
  const motionPolicy = useMotionPolicy();
  const inView = useParticleInView(ownerRef, '200px');
  const {
    children,
    className,
    enabled,
    onTelemetry,
    style,
    ...effectProps
  } = props;
  const runtimeControl = useEffectRuntimeControl(enabled, onTelemetry);
  const hasParticles = hasPotentialParticles(props.count, props.opacity);
  const resolution = resolveEffect('particle-field', {
    effectEnabled: runtimeControl.enabled,
    reducedMotion: motionPolicy.reduce,
    pointer: motionPolicy.pointer,
    power: motionPolicy.power,
    pageVisible: motionPolicy.visible,
    inView,
    active: hasParticles,
    userPaused: false,
    allowAmbientMotion: motionPolicy.allowAmbientMotion,
    allowContinuousMotion: motionPolicy.maxContinuousLoops === 1,
    continuousSlotAvailable: motionPolicy.maxContinuousLoops === 1,
  });
  const eligible = resolution.mode === 'active'
    && isParticleAnimationEligible(inView, motionPolicy);

  useEffect(() => {
    const current = Object.freeze({
      mode: resolution.mode,
      reason: resolution.reason,
    }) satisfies EffectTelemetryState;
    const previous = previousTelemetryStateRef.current;

    if (previous === null) {
      runtimeControl.emitTelemetry(Object.freeze({
        schemaVersion: 1,
        name: 'ds.effect.resolution',
        effectId: 'particle-field',
        current,
      }));
    } else if (
      previous.mode !== current.mode
      || previous.reason !== current.reason
    ) {
      runtimeControl.emitTelemetry(Object.freeze({
        schemaVersion: 1,
        name: 'ds.effect.transition',
        effectId: 'particle-field',
        previous,
        current,
      }));
    }

    previousTelemetryStateRef.current = current;
  }, [resolution.mode, resolution.reason, runtimeControl]);

  return (
    <ParticleFieldShell
      children={children}
      className={className}
      effect={eligible ? (
        <Suspense fallback={null}>
          <LazyParticleFieldRuntime
            {...effectProps}
            style={PARTICLE_FIELD_RUNTIME_STYLE}
          />
        </Suspense>
      ) : null}
      ownerRef={ownerRef}
      resolution={{ mode: resolution.mode, reason: resolution.reason }}
      runtime={eligible ? 'loading' : 'static'}
      style={style}
    />
  );
}

ParticleField.displayName = 'ParticleField';

/** Backward-compatible alias for the earlier, simpler particle effect. */
export const Particles = ParticleField;
