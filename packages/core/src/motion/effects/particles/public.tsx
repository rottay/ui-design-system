'use client';

/**
 * Public ParticleField facade.
 *
 * The canvas implementation stays behind a dynamic boundary so importing the
 * package root cannot make the browser request that runtime. Rendering this
 * component remains the explicit opt-in that requests it.
 */

import { lazy, Suspense } from 'react';

import type { ParticleFieldProps } from '../../types';

const LazyParticleFieldRuntime = lazy(() =>
  import('./index').then(({ ParticleField }) => ({ default: ParticleField })),
);

function ParticleFieldLoadingFallback({
  children,
  className,
  style,
}: Pick<ParticleFieldProps, 'children' | 'className' | 'style'>) {
  return (
    <div
      className={className}
      data-particle-field-runtime="loading"
      style={style}
    >
      {children}
    </div>
  );
}

/** Backward-compatible public component; its canvas runtime loads on render. */
export function ParticleField(props: ParticleFieldProps) {
  return (
    <Suspense
      fallback={(
        <ParticleFieldLoadingFallback
          children={props.children}
          className={props.className}
          style={props.style}
        />
      )}
    >
      <LazyParticleFieldRuntime {...props} />
    </Suspense>
  );
}

ParticleField.displayName = 'ParticleField';

/** Backward-compatible alias for the earlier, simpler particle effect. */
export const Particles = ParticleField;
