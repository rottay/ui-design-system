import { NextResponse } from 'next/server';
import {
  primitives,
  primitiveCategories,
  patterns,
  patternGroups,
  structures,
  structureGroups,
} from '@/data/registry';

/**
 * Card manifest driven by the component registries — the single source of truth.
 * The generator reads this to know which cards to harvest, so any newly
 * registered component automatically becomes a card with no extra wiring.
 */
export const dynamic = 'force-dynamic';

function labelLookup(groups: ReadonlyArray<{ slug: string; label: string }>) {
  const map: Record<string, string> = {};
  for (const group of groups) map[group.slug] = group.label;
  return map;
}

export function GET() {
  const primLabels = labelLookup(primitiveCategories);
  const patternLabels = labelLookup(patternGroups);
  const structureLabels = labelLookup(structureGroups);

  const cards = [
    ...primitives.map((entry) => ({
      tier: 'primitives' as const,
      tierLabel: 'Primitives',
      slug: entry.slug,
      name: entry.name,
      group: primLabels[entry.category] ?? entry.category,
      description: entry.description,
    })),
    ...patterns.map((entry) => ({
      tier: 'patterns' as const,
      tierLabel: 'Patterns',
      slug: entry.slug,
      name: entry.name,
      group: patternLabels[entry.group] ?? entry.group,
      description: entry.description,
    })),
    ...structures.map((entry) => ({
      tier: 'structures' as const,
      tierLabel: 'Structures',
      slug: entry.slug,
      name: entry.name,
      group: structureLabels[entry.group] ?? entry.group,
      description: entry.description,
    })),
  ];

  return NextResponse.json({
    generatedFrom: 'registry',
    engine: 'modern',
    count: cards.length,
    cards,
  });
}
