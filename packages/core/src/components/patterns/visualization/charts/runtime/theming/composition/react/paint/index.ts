'use client';

/**
 * @fileoverview The React door onto the chart paint resolver.
 *
 * The family resolves. Everyone else reads. `useChartPaint` is callable from a
 * family root and publishes its decision on a context; a renderer, a legend, a
 * tooltip or a projection frame calls `useChartPaintDecision()` instead. The
 * renderer surface stamps `decision.rootAttributes`, so the stamped scope is by
 * construction the scheme the family resolved.
 *
 * The decision deliberately does NOT travel as a prop: a prop would let a
 * caller hand a renderer a different scheme than the one its family resolved,
 * which is the divergence this owner exists to make unrepresentable.
 */

import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';

import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';

import {
  resolveChartPaint,
  type ChartPaintDecision,
  type ChartPaintRequest,
} from '../../foundation/paint';

const ChartPaintContext = createContext<ChartPaintDecision | null>(null);

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
  const tokens = useTokens();
  const tokenScheme = tokens.personality.chart.colorScheme;
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
