'use client';

/**
 * @fileoverview The React door onto the chart paint resolver.
 *
 * The family resolves. Everyone else reads. `useChartPaint` is callable from a
 * family root and publishes its decision on a context; a renderer, a legend or
 * a tooltip calls `useChartPaintDecision()` instead. The renderer surface
 * stamps `decision.rootAttributes`, so the stamped scope is by construction the
 * scheme the family resolved.
 *
 * The decision deliberately does NOT travel as a prop: a prop would let a
 * caller hand a renderer a different scheme than the one its family resolved,
 * which is the divergence this owner exists to make unrepresentable.
 *
 * Root-or-read completes that law for the second published mount shape. A
 * `ChartFrame` consumer mounts a RENDERER with no family above it, so the
 * renderer is the chart root; `useChartPaintRoot` reads the published decision
 * first and resolves for itself only when there is none. A family above
 * therefore always wins by construction.
 */

import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';

import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';

import type { ChartColorScheme } from '../../../../../contracts';
import {
  resolveChartPaint,
  type ChartPaintDecision,
  type ChartPaintFamily,
  type ChartPaintRequest,
} from '../../foundation/paint';

const ChartPaintContext = createContext<ChartPaintDecision | null>(null);

/**
 * The one token tier. It reads the canonical chart-personality resolution
 * rather than the token bag: both compute the same
 * `resolveChartPersonality({ compiled, productProfile })`, but the token bag
 * additionally demands a TenantProvider, and a chart root is valid standalone.
 */
function useTokenScheme(): ChartColorScheme | undefined {
  return useResolvedChartPersonality().colorScheme;
}

/**
 * Resolve this chart's paint decision once, from its own root.
 *
 * The token tier is read here rather than accepted as an argument, so no caller
 * can inject a scheme the active theme did not decide. Calling it below an
 * existing provider is refused: a second resolution inside one chart is exactly
 * the two-authority divergence the contract removes.
 */
export function useChartPaint(
  request: Omit<ChartPaintRequest, 'tokenScheme'>,
): ChartPaintDecision {
  const published = useContext(ChartPaintContext);
  const tokenScheme = useTokenScheme();
  const { family, scheme, override } = request;

  const decision = useMemo(
    () => resolveChartPaint({ family, scheme, tokenScheme, override }),
    [family, scheme, tokenScheme, override],
  );

  if (published) {
    throw new Error(
      `useChartPaint: "${family}" resolved paint below "${published.family}". `
        + 'A chart resolves once at its root; everything below it calls useChartPaintDecision().',
    );
  }
  return decision;
}

/**
 * The decision a chart ROOT surface must stamp, resolved or read.
 *
 * A renderer mounted under its family reads that family's decision -- the very
 * object the family published -- so it cannot stamp a scheme the family did not
 * resolve. A renderer mounted with no family above it is itself the chart root
 * and resolves through the same single door, with its own `scheme` prop as the
 * request's prop tier.
 *
 * It does not publish. The caller wraps its surface in `ChartPaintProvider`,
 * which is a no-op by value when a family already published.
 */
export function useChartPaintRoot(
  family: ChartPaintFamily,
  request: Omit<ChartPaintRequest, 'family' | 'tokenScheme'> = {},
): ChartPaintDecision {
  const published = useContext(ChartPaintContext);
  const tokenScheme = useTokenScheme();
  const { scheme, override } = request;

  const resolved = useMemo(
    () => resolveChartPaint({ family, scheme, tokenScheme, override }),
    [family, scheme, tokenScheme, override],
  );

  return published ?? resolved;
}

/**
 * The token-tier scope for chrome that sits ABOVE a chart root -- the
 * projection frame. It resolves and never publishes: the chart inside decides
 * its own scope, and a frame that published would pre-empt it.
 */
export function useChartTokenScheme(): ChartColorScheme {
  const tokenScheme = useTokenScheme();
  return resolveChartPaint({ family: null, tokenScheme }).scheme;
}

export interface ChartPaintProviderProps {
  decision: ChartPaintDecision;
  children: ReactNode;
}

/** Publish a family's decision to its renderer, legend, tooltip and frame. */
export function ChartPaintProvider({
  decision,
  children,
}: ChartPaintProviderProps): ReactNode {
  return createElement(ChartPaintContext.Provider, { value: decision }, children);
}

/**
 * Read the decision the owning family published. Throws outside a provider:
 * a renderer that cannot see a decision must not invent one.
 */
export function useChartPaintDecision(): ChartPaintDecision {
  const decision = useContext(ChartPaintContext);
  if (!decision) {
    throw new Error(
      'useChartPaintDecision: no chart paint decision in scope. '
        + 'Wrap the renderer in <ChartPaintProvider decision={useChartPaint(...)}>.',
    );
  }
  return decision;
}
