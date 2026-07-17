import { describe, expect, it } from 'vitest';

import {
  CHART_GRAMMAR_IDS,
  CHART_GRAMMAR_REGISTRY,
  CHART_GRAMMARS,
  isChartGrammar,
  isChartGrammarId,
  isChartInsightSpec,
  isChartInsightSummary,
  resolveChartGrammar,
  type ChartGrammar,
  type ChartInsightSpec,
  type ChartInsightSummary,
} from '..';

function expectDeeplyFrozen(value: unknown): void {
  if (typeof value !== 'object' || value === null) return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const key of Reflect.ownKeys(value)) {
    expectDeeplyFrozen(Reflect.get(value, key));
  }
}

const INSIGHTS = [
  {
    id: 'hiring-goal',
    type: 'target',
    value: 24,
    label: 'Hiring goal',
  },
  {
    id: 'healthy-range',
    type: 'band',
    lower: 0.72,
    upper: 0.9,
    label: 'Healthy range',
  },
  {
    id: 'direct-label-candidate-42',
    type: 'direct-label',
    datumId: 'candidate-42',
    label: 'Ready for decision',
  },
  {
    id: 'policy-change',
    type: 'event',
    at: '2026-07-09T00:00:00Z',
    label: 'Policy changed',
  },
] as const satisfies readonly ChartInsightSpec[];

const SUMMARIES = [
  {
    id: 'pipeline-delta',
    mode: 'computed',
    text: 'The qualified pipeline increased by 8%.',
    provenance: {
      sourceIds: ['pipeline.current', 'pipeline.previous'],
      methodId: 'delta.percentage.v1',
    },
  },
  {
    id: 'pipeline-explanation',
    mode: 'generated',
    text: 'The declared aggregates show a larger qualified pipeline.',
    provenance: {
      sourceIds: ['pipeline.current', 'pipeline.previous'],
      methodId: 'insight-generator.v1',
    },
  },
] as const satisfies readonly ChartInsightSummary[];

describe('ChartGrammar closed registry', () => {
  it('contains exactly neutral and the three canonical vertical recipes', () => {
    expect(CHART_GRAMMAR_IDS).toEqual([
      'neutral',
      'bithire',
      'platform',
      'evnto',
    ]);
    expect(Object.keys(CHART_GRAMMAR_REGISTRY)).toEqual(CHART_GRAMMAR_IDS);
    expect(CHART_GRAMMARS.map(({ id }) => id)).toEqual(CHART_GRAMMAR_IDS);
  });

  it('resolves each canonical identity deterministically', () => {
    for (const id of CHART_GRAMMAR_IDS) {
      expect(resolveChartGrammar(id)).toBe(CHART_GRAMMAR_REGISTRY[id]);
      expect(resolveChartGrammar(id)).toBe(resolveChartGrammar(id));
    }
  });

  it('keeps every registry layer deeply immutable', () => {
    expectDeeplyFrozen(CHART_GRAMMAR_IDS);
    expectDeeplyFrozen(CHART_GRAMMAR_REGISTRY);
    expectDeeplyFrozen(CHART_GRAMMARS);
  });

  it('uses separate semantic palette channels and preserves status meaning', () => {
    for (const grammar of CHART_GRAMMARS) {
      expect(grammar.channels).toEqual({
        categorical: `chart.palette.categorical.${grammar.id}`,
        sequential: `chart.palette.sequential.${grammar.id}`,
        diverging: `chart.palette.diverging.${grammar.id}`,
        status: 'chart.palette.status.semantic',
      });
      expect(Object.values(grammar.channels).every(
        (reference) => reference.startsWith('chart.palette.'),
      )).toBe(true);
    }
  });

  it('encodes the DS-IMP-101 vertical postures without changing semantics', () => {
    expect(resolveChartGrammar('bithire')).toMatchObject({
      posture: 'evidence-led',
      grid: 'light-sparse',
      axes: 'border-led',
      marks: 'human-rounded',
      annotations: 'evidence-decision',
      motion: 'calm-continuity',
    });
    expect(resolveChartGrammar('platform')).toMatchObject({
      posture: 'control-plane',
      grid: 'precise-compact',
      axes: 'high-contrast-compact',
      marks: 'technical-sharp',
      annotations: 'threshold-policy-incident',
      motion: 'fast-operational',
    });
    expect(resolveChartGrammar('evnto')).toMatchObject({
      posture: 'editorial-temporal',
      grid: 'soft-temporal',
      axes: 'soft-editorial',
      marks: 'tactile-temporal',
      annotations: 'milestone-capacity-schedule',
      motion: 'composed-editorial',
    });
  });

  it.each([
    'BitHire',
    'rottay',
    'tenant-bithire',
    'themanagement',
    'themanagement.miami',
    'platform.example.com',
    '',
    null,
    0,
    new String('bithire'),
  ])('falls back to frozen neutral for a non-canonical runtime identity: %s', (identity) => {
    expect(isChartGrammarId(identity)).toBe(false);
    expect(resolveChartGrammar(identity)).toBe(CHART_GRAMMAR_REGISTRY.neutral);
  });

  it('fails closed for hostile lookup input', () => {
    const hostile = new Proxy({}, {
      getPrototypeOf() {
        throw new Error('hostile prototype');
      },
      get() {
        throw new Error('hostile property');
      },
    });

    expect(resolveChartGrammar(hostile)).toBe(CHART_GRAMMAR_REGISTRY.neutral);
    expect(resolveChartGrammar(Symbol('bithire'))).toBe(CHART_GRAMMAR_REGISTRY.neutral);
  });

  it('survives JSON roundtrip as a valid semantic contract', () => {
    for (const grammar of CHART_GRAMMARS) {
      const roundTripped = JSON.parse(JSON.stringify(grammar)) as ChartGrammar;
      expect(roundTripped).toEqual(grammar);
      expect(isChartGrammar(roundTripped)).toBe(true);
    }
  });

  it('rejects extra, accessor, inherited, and cross-vertical grammar fields', () => {
    const valid = JSON.parse(JSON.stringify(resolveChartGrammar('bithire'))) as ChartGrammar;

    expect(isChartGrammar({ ...valid, tenantSlug: 'bithire' })).toBe(false);
    expect(isChartGrammar({
      ...valid,
      channels: { ...valid.channels, renderer: 'svg' },
    })).toBe(false);
    expect(isChartGrammar({
      ...valid,
      channels: {
        ...valid.channels,
        categorical: 'chart.palette.categorical.evnto',
      },
    })).toBe(false);
    expect(isChartGrammar(Object.assign(Object.create({ inherited: true }), valid))).toBe(false);

    const accessor = { ...valid } as Record<string, unknown>;
    Object.defineProperty(accessor, 'motion', {
      enumerable: true,
      get: () => 'calm-continuity',
    });
    expect(isChartGrammar(accessor)).toBe(false);
  });

  it('catches hostile grammar objects instead of leaking validator errors', () => {
    const hostile = new Proxy({}, {
      ownKeys() {
        throw new Error('hostile keys');
      },
    });
    expect(isChartGrammar(hostile)).toBe(false);
  });
});

describe('ChartInsightSpec JSON contract', () => {
  it.each(INSIGHTS)('accepts and round-trips $type', (insight) => {
    expect(isChartInsightSpec(insight)).toBe(true);
    const roundTripped = JSON.parse(JSON.stringify(insight)) as ChartInsightSpec;
    expect(roundTripped).toEqual(insight);
    expect(isChartInsightSpec(roundTripped)).toBe(true);
  });

  it.each([
    { id: 'nan', type: 'target', value: Number.NaN, label: 'NaN' },
    { id: 'positive-infinity', type: 'target', value: Infinity, label: 'Infinity' },
    { id: 'negative-infinity', type: 'target', value: -Infinity, label: '-Infinity' },
    { id: 'event-infinity', type: 'event', at: Infinity, label: 'Infinity' },
    { id: 'lower-infinity', type: 'band', lower: -Infinity, upper: 1, label: 'Band' },
    { id: 'upper-infinity', type: 'band', lower: 0, upper: Infinity, label: 'Band' },
  ])('rejects non-finite numbers: $id', (insight) => {
    expect(isChartInsightSpec(insight)).toBe(false);
  });

  it('rejects an inverted band and accepts an explicit zero-width threshold band', () => {
    expect(isChartInsightSpec({
      id: 'inverted',
      type: 'band',
      lower: 10,
      upper: 5,
      label: 'Inverted',
    })).toBe(false);
    expect(isChartInsightSpec({
      id: 'threshold',
      type: 'band',
      lower: 5,
      upper: 5,
      label: 'Threshold',
    })).toBe(true);
  });

  it('rejects unknown, missing, empty, inherited, accessor, and extra fields', () => {
    const target = INSIGHTS[0];
    expect(isChartInsightSpec({ ...target, renderer: 'canvas' })).toBe(false);
    expect(isChartInsightSpec({ ...target, label: '' })).toBe(false);
    expect(isChartInsightSpec({ ...target, type: 'forecast' })).toBe(false);
    expect(isChartInsightSpec({ id: 'missing', type: 'target', label: 'Missing' })).toBe(false);
    expect(isChartInsightSpec(Object.assign(Object.create({ inherited: true }), target))).toBe(false);

    const accessor = { ...target } as Record<string, unknown>;
    Object.defineProperty(accessor, 'value', {
      enumerable: true,
      get: () => 24,
    });
    expect(isChartInsightSpec(accessor)).toBe(false);
  });
});

describe('ChartInsightSummary provenance contract', () => {
  it.each(SUMMARIES)('accepts and round-trips $mode summaries', (summary) => {
    expect(isChartInsightSummary(summary)).toBe(true);
    const roundTripped = JSON.parse(JSON.stringify(summary)) as ChartInsightSummary;
    expect(roundTripped).toEqual(summary);
    expect(isChartInsightSummary(roundTripped)).toBe(true);
  });

  it.each([
    {
      id: 'missing-provenance',
      mode: 'computed',
      text: 'A fact.',
    },
    {
      id: 'empty-sources',
      mode: 'generated',
      text: 'An interpretation.',
      provenance: { sourceIds: [], methodId: 'generator.v1' },
    },
    {
      id: 'duplicate-sources',
      mode: 'computed',
      text: 'A fact.',
      provenance: { sourceIds: ['metric.a', 'metric.a'], methodId: 'sum.v1' },
    },
    {
      id: 'missing-method',
      mode: 'generated',
      text: 'An interpretation.',
      provenance: { sourceIds: ['metric.a'], methodId: '' },
    },
    {
      id: 'unknown-mode',
      mode: 'inferred',
      text: 'An interpretation.',
      provenance: { sourceIds: ['metric.a'], methodId: 'model.v1' },
    },
  ])('rejects invalid provenance or summary modes: $id', (summary) => {
    expect(isChartInsightSummary(summary)).toBe(false);
  });

  it('rejects sparse provenance arrays and silent extensions', () => {
    const sparse = Array(2) as string[];
    sparse[1] = 'metric.a';
    expect(isChartInsightSummary({
      id: 'sparse',
      mode: 'computed',
      text: 'A fact.',
      provenance: { sourceIds: sparse, methodId: 'sum.v1' },
    })).toBe(false);

    expect(isChartInsightSummary({
      ...SUMMARIES[0],
      provenance: {
        ...SUMMARIES[0].provenance,
        model: 'hidden-provider',
      },
    })).toBe(false);
    expect(isChartInsightSummary({ ...SUMMARIES[0], causal: true })).toBe(false);
  });
});
