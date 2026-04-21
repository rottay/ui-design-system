import { navigation } from '@/data/navigation';
import { charts } from '@/data/registry/charts';
import {
  NAVIGATION_RECORDS,
  countSectionEntries,
  getMetadataForPath,
  getSectionMeta,
  toTitleCase,
  type NavigationRecord,
} from './config';

const SECTION_OVERVIEW_RECORDS: NavigationRecord[] = navigation
  .filter((section) => getMetadataForPath(`/${section.slug}`))
  .map((section) => ({
    count: countSectionEntries(section),
    depth: 0,
    description:
      getMetadataForPath(`/${section.slug}`)?.description ??
      getSectionMeta(section.slug).description,
    item: {
      label: section.label,
      path: `/${section.slug}`,
      slug: section.slug,
    },
    kind: 'section-overview' as const,
    parents: [],
    section,
  }));

export const SEARCHABLE_RECORDS = [
  ...SECTION_OVERVIEW_RECORDS,
  ...NAVIGATION_RECORDS,
  ...charts.map((chart) => ({
    count: chart.variants?.length,
    depth: 3,
    description: chart.description,
    item: {
      badge: chart.variants?.length ? String(chart.variants.length) : undefined,
      label: toTitleCase(chart.name),
      path: `/patterns/visualization/charts/${chart.slug}`,
      slug: chart.slug,
    },
    kind: 'entry' as const,
    parents: [
      {
        label: 'Visualization',
        path: '/patterns/visualization',
        slug: 'visualization',
      },
      {
        badge: String(charts.length),
        label: 'Charts',
        path: '/patterns/visualization/charts',
        slug: 'charts',
      },
    ],
    section: navigation.find((section) => section.slug === 'patterns') ?? navigation[0],
  })),
];

export const POPULAR_PATHS = [
  '/foundations',
  '/primitives',
  '/patterns/visualization/charts',
  '/structures/workspace/search-command-bar',
  '/surfaces/workspace/collection-workspace',
  '/playground/theme-builder',
  '/developers/getting-started',
];
