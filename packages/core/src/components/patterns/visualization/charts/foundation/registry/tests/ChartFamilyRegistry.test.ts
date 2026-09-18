import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  CHART_FAMILY_IDS,
  CHART_FAMILY_REGISTRY,
  isChartFamilyId,
  type ChartFamilyId,
} from '../index';

const CHARTS_ROOT = join(
  process.cwd(),
  'src/components/patterns/visualization/charts',
);
const FAMILIES_DIR = join(CHARTS_ROOT, 'families');

function familyFolders(): string[] {
  return readdirSync(FAMILIES_DIR)
    .filter((entry) => statSync(join(FAMILIES_DIR, entry)).isDirectory())
    .sort();
}

describe('chart family registry', () => {
  it('has exactly one row per families/ folder, keyed by the folder basename', () => {
    expect([...CHART_FAMILY_IDS].sort()).toEqual(familyFolders());
  });

  it('keys every row by its own id', () => {
    for (const id of CHART_FAMILY_IDS) {
      expect(CHART_FAMILY_REGISTRY[id].id).toBe(id);
    }
  });

  it('assigns a distinct ds-chart-* namespace to every family', () => {
    const namespaces = CHART_FAMILY_IDS.map((id) => CHART_FAMILY_REGISTRY[id].namespace);
    expect(new Set(namespaces).size).toBe(namespaces.length);
    for (const namespace of namespaces) {
      expect(namespace.startsWith('ds-chart-')).toBe(true);
    }
  });

  it('records the four paint models at the measured cardinalities', () => {
    const byModel = CHART_FAMILY_IDS.reduce<Record<string, ChartFamilyId[]>>((acc, id) => {
      const model = CHART_FAMILY_REGISTRY[id].paintModel;
      (acc[model] ??= []).push(id);
      return acc;
    }, {});
    expect(byModel.categorical).toHaveLength(11);
    expect(byModel.sequential).toEqual(['calendar-heat-map', 'heat-map']);
    expect(byModel.semantic?.sort()).toEqual(['bullet', 'gauge', 'waterfall']);
    expect(byModel.single?.sort()).toEqual(['histogram', 'sparkline']);
  });

  it('declares a cadence only where a skin keys one', () => {
    const withCadence = CHART_FAMILY_IDS.filter(
      (id) => CHART_FAMILY_REGISTRY[id].cadenceSize !== null,
    );
    expect(withCadence.sort()).toEqual(['area-chart', 'bar-chart', 'line-chart', 'radar-chart']);
    expect(CHART_FAMILY_REGISTRY['bar-chart'].cadenceSize).toBe(2);
    expect(CHART_FAMILY_REGISTRY['line-chart'].cadenceSize).toBe(5);
  });

  it('honours the colors prop exactly where a family reads it today', () => {
    const honoured = CHART_FAMILY_IDS.filter(
      (id) => CHART_FAMILY_REGISTRY[id].honoursColorsProp,
    ).sort();
    expect(honoured).toEqual([
      'area-chart',
      'bar-chart',
      'funnel-chart',
      'gantt-chart',
      'line-chart',
      'network-graph',
      'pie-chart',
      'radar-chart',
      'sankey',
      'tree-map',
    ]);
    // Declares ChartColorsProps and drops it: the one categorical family whose
    // declared prop does nothing.
    expect(CHART_FAMILY_REGISTRY.scatter.honoursColorsProp).toBe(false);
  });

  it('matches each family source for the colors-prop verdict it records', () => {
    for (const id of CHART_FAMILY_IDS) {
      const source = readFileSync(join(FAMILIES_DIR, id, 'index.tsx'), 'utf8');
      const readsOverride = source.includes(
        'colors && colors.length > 0 ? colors : chartPersonality.colors',
      );
      expect(CHART_FAMILY_REGISTRY[id].honoursColorsProp, id).toBe(readsOverride);
    }
  });

  it('records the two families that own their geometry and the one that owns its a11y', () => {
    const familyOwned = CHART_FAMILY_IDS.filter(
      (id) => CHART_FAMILY_REGISTRY[id].geometry === 'family-owned',
    ).sort();
    expect(familyOwned).toEqual(['network-graph', 'sankey']);
    const ownA11y = CHART_FAMILY_IDS.filter((id) => CHART_FAMILY_REGISTRY[id].a11y === 'own');
    expect(ownA11y).toEqual(['sparkline']);
  });

  it('is frozen row by row', () => {
    expect(Object.isFrozen(CHART_FAMILY_REGISTRY)).toBe(true);
    for (const id of CHART_FAMILY_IDS) {
      expect(Object.isFrozen(CHART_FAMILY_REGISTRY[id])).toBe(true);
    }
  });

  it('narrows only registered ids', () => {
    expect(isChartFamilyId('pie-chart')).toBe(true);
    expect(isChartFamilyId('pie')).toBe(false);
    expect(isChartFamilyId('toString')).toBe(false);
    expect(isChartFamilyId(undefined)).toBe(false);
  });
});
