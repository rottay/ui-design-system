'use client';

/**
 * @fileoverview WorkspaceShell -- premium atmospheric shell for collection workspaces.
 *
 * Wraps premium workspace sections in a single continuous surface so headers,
 * command bars, controls, and table-top read as one coherent tool instead of
 * stacked independent cards.
 */

import { lazy, Suspense, type CSSProperties, type ReactNode } from 'react';

import type { WorkspaceShellPresentationConfig } from '../../foundation/contracts/collection';
import { Box } from '../../../primitives/layout/Box';

export interface WorkspaceShellProps extends WorkspaceShellPresentationConfig {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  focusActive?: boolean;
  previewActive?: boolean;
}

const LazyLiveParticleField = lazy(() =>
  import('../../../../motion/effects/particles').then(({ ParticleField }) => ({
    default: ParticleField,
  })),
);

const DEFAULT_STATIC_FIELD_LABEL =
  'Static atmospheric field indicating an AI-assisted collection workspace';

const SHELL_OPACITY = {
  low: 0.34,
  medium: 0.56,
  high: 0.74,
} as const;

const TOKENIZED_MASK_COLOR = 'var(--ds-workspace-shell-mask-color, var(--ds-color-primary))';
const TOKENIZED_MASK_STRONG =
  `color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 58%, transparent)`;
const TOKENIZED_MASK_MID =
  `color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 32%, transparent)`;
const TOKENIZED_MASK_LOW =
  `color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 8%, transparent)`;

interface StaticParticleFieldProps {
  fallbackLabel: string;
  fieldPattern: NonNullable<WorkspaceShellPresentationConfig['fieldPattern']>;
  intensity: NonNullable<WorkspaceShellPresentationConfig['intensity']>;
  mood: NonNullable<WorkspaceShellPresentationConfig['mood']>;
  state: 'quarantined' | 'loading';
}

/** CSS-only alternative: no Canvas, timers, observers, RAF, or module load. */
function StaticParticleField({
  fallbackLabel,
  fieldPattern,
  intensity,
  mood,
  state,
}: StaticParticleFieldProps) {
  return (
    <Box
      aria-label={fallbackLabel}
      className="ds-collection-shell__static-particle-field"
      data-cra-14-static-fallback="true"
      data-field-pattern={fieldPattern}
      data-intensity={intensity}
      data-mood={mood}
      data-part="particle-field-static-fallback"
      data-particle-field-runtime="static"
      data-particle-field-state={state}
      role="img"
    />
  );
}

export function WorkspaceShell({
  variant = 'default',
  mood = 'calm',
  fieldPattern = 'hybrid',
  intensity = 'medium',
  continuity = 'seamless',
  focusReaction = false,
  previewEmphasis = false,
  particleField,
  focusActive = false,
  previewActive = false,
  children,
  className,
  style,
}: WorkspaceShellProps) {
  const isAtmospheric = variant === 'ai-field';
  const particleFieldMode = particleField?.mode === 'live' ? 'live' : 'quarantined';
  const showOrbitalField = fieldPattern === 'orbital' || fieldPattern === 'hybrid';
  const showAmbientField = fieldPattern === 'ambient' || fieldPattern === 'hybrid';
  const fallbackLabel =
    typeof particleField?.fallbackLabel === 'string' && particleField.fallbackLabel.trim().length > 0
      ? particleField.fallbackLabel.trim()
      : DEFAULT_STATIC_FIELD_LABEL;

  const focalAreas =
    focusReaction && (focusActive || previewActive)
      ? [
          ...(focusActive ? [{ x: 0.28, y: 0.2, radius: 0.32, strength: mood === 'focus' ? 0.72 : 0.52 }] : []),
          ...(previewEmphasis && previewActive
            ? [{ x: 0.88, y: 0.48, radius: 0.28, strength: mood === 'focus' ? 0.68 : 0.46 }]
            : []),
        ]
      : undefined;

  return (
    <Box
      className={['ds-surface ds-collection-shell', className].filter(Boolean).join(' ')}
      data-part="root"
      data-variant={variant}
      data-mood={mood}
      data-intensity={intensity}
      data-continuity={continuity}
      data-field-pattern={fieldPattern}
      data-focus-reaction={focusReaction ? 'true' : 'false'}
      data-preview-emphasis={previewEmphasis ? 'true' : 'false'}
      data-focus-active={focusActive ? 'true' : 'false'}
      data-preview-active={previewActive ? 'true' : 'false'}
      data-particle-field-mode={isAtmospheric ? particleFieldMode : 'inactive'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        ...style,
      }}
    >
      {isAtmospheric ? (
        particleFieldMode === 'live' ? (
          <Suspense
            fallback={(
              <StaticParticleField
                fallbackLabel={fallbackLabel}
                fieldPattern={fieldPattern}
                intensity={intensity}
                mood={mood}
                state="loading"
              />
            )}
          >
            <>
              {showOrbitalField ? (
                <LazyLiveParticleField
                  className="ds-collection-shell__orbital-field"
                  count={intensity === 'high' ? 3600 : intensity === 'medium' ? 2800 : 2200}
                  density="high"
                  intensity={intensity}
                  mood={mood}
                  pattern="orbital"
                  shape="square"
                  blendMode="normal"
                  color="var(--ds-workspace-shell-particle-primary, color-mix(in srgb, var(--ds-color-primary) 34%, var(--ds-surface-card) 66%))"
                  sizeRange={mood === 'active' ? [0.85, 2.1] : [0.75, 1.85]}
                  opacity={Math.min(0.92, SHELL_OPACITY[intensity] + 0.12)}
                  focalAreas={focalAreas}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    WebkitMaskImage:
                      `linear-gradient(180deg, ${TOKENIZED_MASK_STRONG} 0%, ${TOKENIZED_MASK_STRONG} 24%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 46%, transparent) 54%, ${TOKENIZED_MASK_MID} 80%, ${TOKENIZED_MASK_LOW} 100%)`,
                    maskImage:
                      `linear-gradient(180deg, ${TOKENIZED_MASK_STRONG} 0%, ${TOKENIZED_MASK_STRONG} 24%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 46%, transparent) 54%, ${TOKENIZED_MASK_MID} 80%, ${TOKENIZED_MASK_LOW} 100%)`,
                  }}
                />
              ) : null}

              {showAmbientField ? (
                <LazyLiveParticleField
                  className="ds-collection-shell__ambient-field"
                  count={intensity === 'high' ? 1400 : intensity === 'medium' ? 980 : 700}
                  density="low"
                  intensity={intensity === 'high' ? 'medium' : 'low'}
                  mood={mood}
                  pattern="ambient"
                  shape="square"
                  color="var(--ds-workspace-shell-particle-secondary, color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-text-secondary) 24%, transparent))"
                  sizeRange={[0.35, 0.95]}
                  opacity={Math.max(0.14, SHELL_OPACITY[intensity] * 0.24)}
                  focalAreas={focalAreas}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    WebkitMaskImage:
                      `linear-gradient(180deg, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 36%, transparent) 0%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 42%, transparent) 40%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 18%, transparent) 100%)`,
                    maskImage:
                      `linear-gradient(180deg, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 36%, transparent) 0%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 42%, transparent) 40%, color-mix(in srgb, ${TOKENIZED_MASK_COLOR} 18%, transparent) 100%)`,
                  }}
                />
              ) : null}
            </>
          </Suspense>
        ) : (
          <StaticParticleField
            fallbackLabel={fallbackLabel}
            fieldPattern={fieldPattern}
            intensity={intensity}
            mood={mood}
            state="quarantined"
          />
        )
      ) : null}

      <Box
        className="ds-collection-shell__overlay"
        data-part="overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        className="ds-collection-shell__content"
        data-part="content"
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
