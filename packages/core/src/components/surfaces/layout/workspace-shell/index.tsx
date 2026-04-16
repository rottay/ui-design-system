'use client';

/**
 * @fileoverview WorkspaceShell -- premium atmospheric shell for collection workspaces.
 *
 * Wraps premium workspace sections in a single continuous surface so headers,
 * command bars, controls, and table-top read as one coherent tool instead of
 * stacked independent cards.
 */

import type { CSSProperties, ReactNode } from 'react';

import { ParticleField } from '../../../../motion';
import type { WorkspaceShellPresentationConfig } from '../../foundation/contracts/collection';
import { Box } from '../../../primitives/layout/Box';

export interface WorkspaceShellProps extends WorkspaceShellPresentationConfig {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  focusActive?: boolean;
  previewActive?: boolean;
}

const SHELL_OPACITY = {
  low: 0.34,
  medium: 0.56,
  high: 0.74,
} as const;

export function WorkspaceShell({
  variant = 'default',
  mood = 'calm',
  fieldPattern = 'hybrid',
  intensity = 'medium',
  continuity = 'seamless',
  focusReaction = false,
  previewEmphasis = false,
  focusActive = false,
  previewActive = false,
  children,
  className,
  style,
}: WorkspaceShellProps) {
  const isAtmospheric = variant === 'ai-field';
  const rounded = continuity === 'seamless' ? 24 : 18;
  const showOrbitalField = fieldPattern === 'orbital' || fieldPattern === 'hybrid';
  const showAmbientField = fieldPattern === 'ambient' || fieldPattern === 'hybrid';
  const borderColor =
    continuity === 'seamless'
      ? 'color-mix(in srgb, var(--ds-color-border-subtle) 52%, transparent)'
      : 'var(--ds-color-border-subtle)';

  const focalAreas =
    focusReaction && (focusActive || previewActive)
      ? [
          ...(focusActive ? [{ x: 0.28, y: 0.2, radius: 0.32, strength: mood === 'focus' ? 0.72 : 0.52 }] : []),
          ...(previewEmphasis && previewActive
            ? [{ x: 0.88, y: 0.48, radius: 0.28, strength: mood === 'focus' ? 0.68 : 0.46 }]
            : []),
        ]
      : undefined;

  const overlayBackground = [
    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-canvas) 22%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-canvas) 10%, transparent) 36%, color-mix(in srgb, var(--ds-color-bg-canvas) 44%, transparent) 72%, color-mix(in srgb, var(--ds-color-bg-canvas) 62%, transparent) 100%)',
    previewEmphasis && previewActive
      ? 'radial-gradient(38% 48% at 92% 48%, color-mix(in srgb, var(--ds-color-primary) 10%, transparent) 0%, transparent 74%)'
      : null,
    focusReaction && focusActive
      ? 'radial-gradient(46% 38% at 28% 18%, color-mix(in srgb, var(--ds-color-primary) 8%, transparent) 0%, transparent 78%)'
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        borderRadius: rounded,
        border: `1px solid ${borderColor}`,
        background:
          continuity === 'seamless'
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-canvas) 8%) 0%, color-mix(in srgb, var(--ds-surface-card) 84%, var(--ds-color-bg-primary) 16%) 44%, color-mix(in srgb, var(--ds-color-bg-canvas) 82%, var(--ds-surface-card) 18%) 100%)'
            : 'var(--ds-surface-card)',
        boxShadow:
          '0 28px 60px color-mix(in srgb, #000 24%, transparent), inset 0 1px 0 color-mix(in srgb, white 5%, transparent)',
        ...style,
      }}
    >
      {isAtmospheric && (
        <>
          {showOrbitalField && (
            <ParticleField
              count={intensity === 'high' ? 3600 : intensity === 'medium' ? 2800 : 2200}
              density="high"
              intensity={intensity}
              mood={mood}
              pattern="orbital"
              shape="square"
              blendMode="normal"
              color="rgba(247, 247, 243, 0.99)"
              sizeRange={mood === 'active' ? [0.85, 2.1] : [0.75, 1.85]}
              opacity={Math.min(0.92, SHELL_OPACITY[intensity] + 0.12)}
              focalAreas={focalAreas}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                WebkitMaskImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.9) 54%, rgba(0,0,0,0.52) 80%, rgba(0,0,0,0.12) 100%)',
                maskImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.9) 54%, rgba(0,0,0,0.52) 80%, rgba(0,0,0,0.12) 100%)',
              }}
            />
          )}
          {showAmbientField && (
            <ParticleField
              count={intensity === 'high' ? 1400 : intensity === 'medium' ? 980 : 700}
              density="low"
              intensity={intensity === 'high' ? 'medium' : 'low'}
              mood={mood}
              pattern="ambient"
              shape="square"
              color="rgba(221, 224, 227, 0.8)"
              sizeRange={[0.35, 0.95]}
              opacity={Math.max(0.14, SHELL_OPACITY[intensity] * 0.24)}
              focalAreas={focalAreas}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                WebkitMaskImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.86) 40%, rgba(0,0,0,0.42) 100%)',
                maskImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.86) 40%, rgba(0,0,0,0.42) 100%)',
              }}
            />
          )}
        </>
      )}

      <Box
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: overlayBackground,
        }}
      />

      <Box
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: rounded,
          background: isAtmospheric
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 16%, transparent) 0%, transparent 100%)'
            : undefined,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
