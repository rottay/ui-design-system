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
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import { useMotionPolicy } from '@/infrastructure/runtime/motion';
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
  runtime: 'loading' | 'static';
  style?: CSSProperties;
}

function ParticleFieldShell({
  children,
  className,
  effect,
  ownerRef,
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
  const motionPolicy = useMotionPolicy();
  const inView = useParticleInView(ownerRef, '200px');
  const eligible =
    isParticleAnimationEligible(inView, motionPolicy)
    && hasPotentialParticles(props.count, props.opacity);
  const {
    children,
    className,
    style,
    ...effectProps
  } = props;

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
      runtime={eligible ? 'loading' : 'static'}
      style={style}
    />
  );
}

ParticleField.displayName = 'ParticleField';

/** Backward-compatible alias for the earlier, simpler particle effect. */
export const Particles = ParticleField;
