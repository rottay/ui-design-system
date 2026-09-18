import { describe, expect, it } from 'vitest';

import {
  CHART_FAMILY_IDS,
  CHART_FAMILY_REGISTRY,
} from '../../../../../../foundation/registry';
import { resolveChartSeriesPaint } from '../../../../../chart-engine/foundation/grammar/palette';
import {
  CHART_CATEGORICAL_SIZE,
  materializeChartPaint,
  requireChartSemanticPaint,
  resolveChartPaint,
} from '../index';

const SCHEMES = ['default', 'pastel', 'vibrant', 'monochrome', 'accessible'] as const;

const CATEGORICAL = CHART_FAMILY_IDS.filter(
  (id) => CHART_FAMILY_REGISTRY[id].paintModel === 'categorical',
);

const SEMANTIC = CHART_FAMILY_IDS.filter(
  (id) => CHART_FAMILY_REGISTRY[id].paintModel === 'semantic',
);

describe('resolveChartPaint precedence', () => {
  it('takes the prop over the token over the default', () => {
    expect(resolveChartPaint({ family: 'bar-chart' }).scheme).toBe('default');
    expect(resolveChartPaint({ family: 'bar-chart', tokenScheme: 'vibrant' }).scheme).toBe(
      'vibrant',
    );
    expect(
      resolveChartPaint({ family: 'bar-chart', scheme: 'pastel', tokenScheme: 'vibrant' }).scheme,
    ).toBe('pastel');
  });

  it('stamps the scheme it resolved, so a scope cannot name another table', () => {
    for (const scheme of SCHEMES) {
      const decision = resolveChartPaint({ family: 'pie-chart', scheme });
      expect(decision.rootAttributes['data-chart-color-scheme']).toBe(decision.scheme);
      expect(decision.rootAttributes['data-chart-color-scheme']).toBe(scheme);
      expect(decision.rootAttributes['data-chart-paint-model']).toBe(decision.model);
    }
  });

  it('refuses an unregistered family by name, including a prototype key', () => {
    expect(() =>
      resolveChartPaint({ family: 'pie' as never }),
    ).toThrow(/unknown family "pie"/);
    expect(() =>
      resolveChartPaint({ family: 'toString' as never }),
    ).toThrow(/unknown family "toString"/);
  });
});

describe('the categorical model', () => {
  it('reuses the canonical chain rather than a second palette table', () => {
    for (const scheme of SCHEMES) {
      const decision = resolveChartPaint({ family: 'bar-chart', scheme });
      expect(decision.categorical?.slots).toEqual([...resolveChartSeriesPaint(scheme)]);
    }
  });

  it('gives every categorical family exactly CHART_CATEGORICAL_SIZE slots', () => {
    for (const family of CATEGORICAL) {
      const decision = resolveChartPaint({ family });
      expect(decision.categorical?.slots, family).toHaveLength(CHART_CATEGORICAL_SIZE);
    }
  });

  it('owns the modulus: paintFor cycles at ten for every family', () => {
    const decision = resolveChartPaint({ family: 'radar-chart' });
    const categorical = decision.categorical;
    expect(categorical).not.toBeNull();
    expect(categorical?.slotIndexFor(0)).toBe(0);
    expect(categorical?.slotIndexFor(9)).toBe(9);
    expect(categorical?.slotIndexFor(10)).toBe(0);
    expect(categorical?.slotIndexFor(23)).toBe(3);
    expect(categorical?.paintFor(12)).toBe(categorical?.paintFor(2));
  });

  it('keeps the cadence a separate quantity from the paint slot', () => {
    const line = resolveChartPaint({ family: 'line-chart' }).categorical;
    // line keys 1..4 in its skin: the cadence wraps at five while the slot
    // wraps at ten, which is why they cannot share one attribute.
    expect(line?.cadenceIndexFor(6)).toBe(1);
    expect(line?.slotIndexFor(6)).toBe(6);

    const bar = resolveChartPaint({ family: 'bar-chart' }).categorical;
    // bar's cadence is the forced-colors hollow/solid parity.
    expect(bar?.cadenceIndexFor(3)).toBe(1);
    expect(bar?.cadenceIndexFor(4)).toBe(0);

    const pie = resolveChartPaint({ family: 'pie-chart' }).categorical;
    expect(pie?.cadenceIndexFor(3)).toBeNull();
  });

  it('refuses a series index that is not a non-negative integer', () => {
    const categorical = resolveChartPaint({ family: 'bar-chart' }).categorical;
    expect(() => categorical?.slotIndexFor(-1)).toThrow(/non-negative integer/);
    expect(() => categorical?.slotIndexFor(1.5)).toThrow(/non-negative integer/);
    expect(() => categorical?.cadenceIndexFor(Number.NaN)).toThrow(/non-negative integer/);
  });
});

describe('the colors override', () => {
  it('is honoured only where the registry row says so', () => {
    const pie = resolveChartPaint({ family: 'pie-chart', override: ['#ff0000'] });
    expect(pie.overridden).toBe(true);
    expect(pie.categorical?.paintFor(0)).toBe('#ff0000');

    const scatter = resolveChartPaint({ family: 'scatter', override: ['#ff0000'] });
    expect(scatter.overridden).toBe(false);
    expect(scatter.categorical?.paintFor(0)).toBe(resolveChartSeriesPaint('default')[0]);
  });

  it('still fills exactly ten slots when the override is shorter', () => {
    const decision = resolveChartPaint({ family: 'pie-chart', override: ['#a', '#b', '#c'] });
    expect(decision.categorical?.slots).toEqual([
      '#a', '#b', '#c', '#a', '#b', '#c', '#a', '#b', '#c', '#a',
    ]);
  });

  it('treats an empty override as no override', () => {
    const decision = resolveChartPaint({ family: 'pie-chart', override: [] });
    expect(decision.overridden).toBe(false);
  });
});

describe('the non-categorical models', () => {
  it('gives a semantic family no slot machine at all', () => {
    for (const family of ['gauge', 'waterfall', 'bullet'] as const) {
      const decision = resolveChartPaint({ family });
      expect(decision.model, family).toBe('semantic');
      expect(decision.categorical, family).toBeNull();
      expect(decision.sequential, family).toBeNull();
    }
  });

  it('gives every semantic family a non-empty tone domain, and nobody else one', () => {
    expect(SEMANTIC.length).toBeGreaterThan(0);
    for (const family of CHART_FAMILY_IDS) {
      const decision = resolveChartPaint({ family });
      if (CHART_FAMILY_REGISTRY[family].paintModel === 'semantic') {
        expect(decision.semantic, family).not.toBeNull();
        expect(requireChartSemanticPaint(decision).tones.length, family).toBeGreaterThan(0);
        continue;
      }
      expect(decision.semantic, family).toBeNull();
      expect(() => requireChartSemanticPaint(decision)).toThrow(/has no semantic tones/u);
    }
  });

  it('chains a tone over the family namespace and lands on the root it means', () => {
    for (const family of SEMANTIC) {
      const tones = requireChartSemanticPaint(resolveChartPaint({ family }));
      const namespace = CHART_FAMILY_REGISTRY[family].namespace;
      for (const tone of tones.tones) {
        const expression = tones.toneFor(tone);
        expect(expression, `${family}/${tone}`).toMatch(
          new RegExp(`^var\\(--${namespace}-${tone}, var\\(--ds-color-[a-z0-9-]+\\)\\)$`, 'u'),
        );
      }
    }
  });

  it('keeps a tone out of the slot machine: no scheme moves it', () => {
    for (const family of SEMANTIC) {
      const baseline = requireChartSemanticPaint(resolveChartPaint({ family }));
      for (const scheme of SCHEMES) {
        const tones = requireChartSemanticPaint(resolveChartPaint({ family, scheme }));
        expect(tones.tones, `${family}/${scheme}`).toEqual(baseline.tones);
        for (const tone of tones.tones) {
          expect(tones.toneFor(tone), `${family}/${scheme}/${tone}`).toBe(baseline.toneFor(tone));
        }
      }
    }
  });

  it('refuses a tone the family never declared', () => {
    const tones = requireChartSemanticPaint(resolveChartPaint({ family: 'waterfall' }));
    expect(() => tones.toneFor('error')).toThrow(/outside the domain/u);
  });

  it('gives a single-colour family no slot machine either', () => {
    for (const family of ['histogram', 'sparkline'] as const) {
      const decision = resolveChartPaint({ family });
      expect(decision.model, family).toBe('single');
      expect(decision.categorical, family).toBeNull();
    }
  });

  it('gives a sequential family two stops drawn from the same chain', () => {
    const decision = resolveChartPaint({ family: 'heat-map', scheme: 'vibrant' });
    expect(decision.model).toBe('sequential');
    expect(decision.categorical).toBeNull();
    expect(decision.sequential?.stops[0]).toBe('var(--ds-color-info-bg)');
    expect(decision.sequential?.stops[1]).toBe(resolveChartSeriesPaint('vibrant')[0]);
  });

  it('quantizes where the family quantizes and interpolates where it does not', () => {
    const calendar = resolveChartPaint({ family: 'calendar-heat-map' }).sequential;
    expect(calendar?.steps).toBe(5);
    // Five stops means 0, 25, 50, 75, 100; 0.3 snaps to the 25% stop.
    expect(calendar?.stopFor(0.3)).toContain(' 25%,');
    expect(calendar?.stopFor(0)).toContain(' 0%,');
    expect(calendar?.stopFor(1)).toContain(' 100%,');

    const heat = resolveChartPaint({ family: 'heat-map' }).sequential;
    expect(heat?.steps).toBe(Number.POSITIVE_INFINITY);
    expect(heat?.stopFor(0.3)).toContain(' 30%,');
  });

  it('clamps a ramp position and refuses a non-finite one', () => {
    const heat = resolveChartPaint({ family: 'heat-map' }).sequential;
    expect(heat?.stopFor(-4)).toBe(heat?.stopFor(0));
    expect(heat?.stopFor(4)).toBe(heat?.stopFor(1));
    expect(() => heat?.stopFor(Number.NaN)).toThrow(/must be finite/);
  });
});

describe('decision identity', () => {
  it('returns one stable object per family and scheme', () => {
    expect(resolveChartPaint({ family: 'bar-chart', scheme: 'pastel' })).toBe(
      resolveChartPaint({ family: 'bar-chart', scheme: 'pastel' }),
    );
    expect(resolveChartPaint({ family: 'bar-chart', scheme: 'pastel' })).not.toBe(
      resolveChartPaint({ family: 'bar-chart', scheme: 'vibrant' }),
    );
  });

  it('freezes the decision and its slots', () => {
    const decision = resolveChartPaint({ family: 'bar-chart' });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.rootAttributes)).toBe(true);
    expect(Object.isFrozen(decision.categorical?.slots)).toBe(true);
  });

  it('covers every registered family without throwing', () => {
    for (const family of CHART_FAMILY_IDS) {
      for (const scheme of SCHEMES) {
        const decision = resolveChartPaint({ family, scheme });
        expect(decision.family, family).toBe(family);
        expect(decision.model, family).toBe(CHART_FAMILY_REGISTRY[family].paintModel);
      }
    }
  });
});

describe('materializeChartPaint', () => {
  it('resolves a categorical chain to concrete colours against one element', () => {
    const owner = document.createElement('div');
    owner.style.setProperty('--ds-chart-category-1', '#123456');
    document.body.appendChild(owner);
    try {
      const decision = resolveChartPaint({ family: 'bar-chart', scheme: 'accessible' });
      const materialized = materializeChartPaint(decision, owner);
      expect(materialized.scheme).toBe('accessible');
      expect(materialized.resolved).toHaveLength(CHART_CATEGORICAL_SIZE);
      expect(materialized.resolved[0]).toBe('#123456');
      // The chain's audited literal tail resolves with no stylesheet at all.
      expect(materialized.resolved[1]).toBe('#a23b72');
    } finally {
      owner.remove();
    }
  });

  it('resolves a sequential ramp to its two stops', () => {
    const owner = document.createElement('div');
    document.body.appendChild(owner);
    try {
      const materialized = materializeChartPaint(
        resolveChartPaint({ family: 'heat-map' }),
        owner,
      );
      expect(materialized.resolved).toHaveLength(2);
    } finally {
      owner.remove();
    }
  });

  it('resolves nothing for a semantic family, whose tones it does not model', () => {
    const owner = document.createElement('div');
    document.body.appendChild(owner);
    try {
      expect(materializeChartPaint(resolveChartPaint({ family: 'gauge' }), owner).resolved)
        .toEqual([]);
    } finally {
      owner.remove();
    }
  });
});
