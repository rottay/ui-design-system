import type { ChartGrammar, ChartGrammarId } from '../..';
import { isChartGrammar, isChartGrammarId } from '..';

export const CHART_GRAMMAR_IDS = Object.freeze([
  'neutral',
  'bithire',
  'platform',
  'evnto',
] as const satisfies readonly ChartGrammarId[]);

const DEFINITIONS = [
  {
    id: 'neutral',
    posture: 'neutral',
    channels: {
      categorical: 'chart.palette.categorical.neutral',
      sequential: 'chart.palette.sequential.neutral',
      diverging: 'chart.palette.diverging.neutral',
      status: 'chart.palette.status.semantic',
    },
    grid: 'balanced',
    axes: 'balanced',
    marks: 'balanced',
    annotations: 'general',
    motion: 'calm',
  },
  {
    id: 'bithire',
    posture: 'evidence-led',
    channels: {
      categorical: 'chart.palette.categorical.bithire',
      sequential: 'chart.palette.sequential.bithire',
      diverging: 'chart.palette.diverging.bithire',
      status: 'chart.palette.status.semantic',
    },
    grid: 'light-sparse',
    axes: 'border-led',
    marks: 'human-rounded',
    annotations: 'evidence-decision',
    motion: 'calm-continuity',
  },
  {
    id: 'platform',
    posture: 'control-plane',
    channels: {
      categorical: 'chart.palette.categorical.platform',
      sequential: 'chart.palette.sequential.platform',
      diverging: 'chart.palette.diverging.platform',
      status: 'chart.palette.status.semantic',
    },
    grid: 'precise-compact',
    axes: 'high-contrast-compact',
    marks: 'technical-sharp',
    annotations: 'threshold-policy-incident',
    motion: 'fast-operational',
  },
  {
    id: 'evnto',
    posture: 'editorial-temporal',
    channels: {
      categorical: 'chart.palette.categorical.evnto',
      sequential: 'chart.palette.sequential.evnto',
      diverging: 'chart.palette.diverging.evnto',
      status: 'chart.palette.status.semantic',
    },
    grid: 'soft-temporal',
    axes: 'soft-editorial',
    marks: 'tactile-temporal',
    annotations: 'milestone-capacity-schedule',
    motion: 'composed-editorial',
  },
] as const satisfies readonly ChartGrammar[];

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(Reflect.get(value, key));
  }
  return Object.freeze(value);
}

function buildRegistry(
  definitions: readonly ChartGrammar[],
): Readonly<Record<ChartGrammarId, ChartGrammar>> {
  const registry = Object.create(null) as Record<ChartGrammarId, ChartGrammar>;
  const seen = new Set<ChartGrammarId>();

  for (const definition of definitions) {
    if (!isChartGrammar(definition) || seen.has(definition.id)) {
      throw new TypeError('[ChartGrammar] Invalid closed-registry definition.');
    }
    seen.add(definition.id);
    Reflect.set(registry, definition.id, deepFreeze(definition));
  }

  if (
    seen.size !== CHART_GRAMMAR_IDS.length
    || CHART_GRAMMAR_IDS.some((id) => !seen.has(id))
  ) {
    throw new TypeError('[ChartGrammar] Incomplete closed registry.');
  }

  return deepFreeze(registry);
}

export const CHART_GRAMMAR_REGISTRY = buildRegistry(DEFINITIONS);

export const CHART_GRAMMARS: readonly ChartGrammar[] = deepFreeze(
  CHART_GRAMMAR_IDS.map((id) => CHART_GRAMMAR_REGISTRY[id]),
);

/**
 * Resolves a canonical vertical identity only. Tenant slugs, hostnames,
 * aliases, boxed strings, and malformed values deliberately fall back to the
 * frozen neutral recipe. Call `isChartGrammarId` when the distinction between
 * an explicit neutral selection and an invalid input matters.
 */
export function resolveChartGrammar(id: unknown): ChartGrammar {
  return isChartGrammarId(id)
    ? CHART_GRAMMAR_REGISTRY[id]
    : CHART_GRAMMAR_REGISTRY.neutral;
}
