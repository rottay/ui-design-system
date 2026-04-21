import type { ComponentType } from 'react';
import {
  BracesIcon,
  GlobeIcon,
  HomeIcon,
  LayersIcon,
  LayoutGridIcon,
  LayoutTemplateIcon,
  RocketIcon,
  SettingsIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';
import { navigation, type NavItem, type NavSection } from '@/data/navigation';

type IconComponent = ComponentType<{ size?: number }>;

interface SectionMeta {
  accent: string;
  description: string;
  eyebrow: string;
  icon: IconComponent;
}

export const SECTION_META: Record<string, SectionMeta> = {
  showroom: {
    accent: '#0f172a',
    description: 'A multi-engine, multi-theme documentation shell for commercial-grade UI.',
    eyebrow: 'Design System',
    icon: HomeIcon,
  },
  foundations: {
    accent: '#0f766e',
    description: 'Tokens, engines, themes, and iconography that define the visual system.',
    eyebrow: 'System Layer',
    icon: LayersIcon,
  },
  primitives: {
    accent: '#2563eb',
    description: 'Base components arranged by category and ready for production composition.',
    eyebrow: 'Component Layer',
    icon: LayoutGridIcon,
  },
  patterns: {
    accent: '#7c3aed',
    description: 'Reusable UI patterns for complex workflows, data, and interactions.',
    eyebrow: 'Pattern Library',
    icon: LayoutTemplateIcon,
  },
  structures: {
    accent: '#ea580c',
    description: 'Page chrome, workspace building blocks, and reusable page-level structures.',
    eyebrow: 'Page Structure',
    icon: BracesIcon,
  },
  surfaces: {
    accent: '#0891b2',
    description: 'Full-page recipes showing how primitives and patterns ship together.',
    eyebrow: 'Surface Recipes',
    icon: SparklesIcon,
  },
  verticals: {
    accent: '#4f46e5',
    description: 'Tenant-specific adaptations that show the system in real product contexts.',
    eyebrow: 'Tenant Showcase',
    icon: GlobeIcon,
  },
  playground: {
    accent: '#d97706',
    description: 'Interactive tools to probe themes, tokens, and real-time system behavior.',
    eyebrow: 'Live Sandbox',
    icon: RocketIcon,
  },
  developers: {
    accent: '#475569',
    description: 'Implementation guidance, architecture notes, and onboarding documentation.',
    eyebrow: 'Developer Docs',
    icon: SettingsIcon,
  },
};

export interface NavigationRecord {
  count?: number;
  depth: number;
  description: string;
  item: NavItem;
  kind: 'section-overview' | 'group-overview' | 'entry';
  parents: NavItem[];
  section: NavSection;
}

export interface BreadcrumbItem {
  href: string;
  label: string;
}

interface PathMetadata {
  description: string;
  label: string;
  sectionSlug: string;
}

const PRESERVED_LABELS = new Set([
  'BitHire',
  'Classic',
  'Evnto',
  'Modern',
  'Platform',
  'Rottay',
  'Rustic',
]);

export function toTitleCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-_/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatShowroomLabel(value: string) {
  if (!value || value.includes(' ') || PRESERVED_LABELS.has(value)) {
    return value;
  }

  return value
    .replace(/^Pattern/, '')
    .replace(/Surface$/, '')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}

function buildPathMetadata() {
  const metadata = new Map<string, PathMetadata>();

  metadata.set('/', {
    label: 'Showroom',
    description: SECTION_META.showroom.description,
    sectionSlug: 'showroom',
  });

  metadata.set('/foundations', {
    label: 'Foundations',
    description: 'Explore tokens, themes, engines, and icon assets behind the system.',
    sectionSlug: 'foundations',
  });
  metadata.set('/foundations/tokens', {
    label: 'Tokens',
    description: 'Color, spacing, radius, motion, shadow, and typography foundations.',
    sectionSlug: 'foundations',
  });
  metadata.set('/foundations/themes', {
    label: 'Themes',
    description: 'Tenant visual identities and how they reshape the same component system.',
    sectionSlug: 'foundations',
  });
  metadata.set('/foundations/engines', {
    label: 'Engines',
    description: 'Preview the same design system across Classic, Modern, and Rustic engines.',
    sectionSlug: 'foundations',
  });
  metadata.set('/foundations/icons', {
    label: 'Icons',
    description: 'Shared icon vocabulary for navigation, actions, status, and data display.',
    sectionSlug: 'foundations',
  });

  metadata.set('/patterns', {
    label: 'Patterns',
    description: 'Composite solutions for dashboards, workflows, communication, and product operations.',
    sectionSlug: 'patterns',
  });
  metadata.set('/patterns/visualization/charts', {
    label: 'Charts',
    description: 'D3-backed chart recipes with token-aware styling.',
    sectionSlug: 'patterns',
  });
  metadata.set('/patterns/visualization', {
    label: 'Visualization',
    description: 'Patterns for charts, boards, timelines, maps, and other visual storytelling.',
    sectionSlug: 'patterns',
  });

  metadata.set('/structures', {
    label: 'Structures',
    description: 'Reusable page chrome and workspace scaffolding for operational products.',
    sectionSlug: 'structures',
  });

  metadata.set('/surfaces', {
    label: 'Surfaces',
    description: 'Full-page showcases demonstrating how the system behaves in realistic workflows.',
    sectionSlug: 'surfaces',
  });

  metadata.set('/verticals', {
    label: 'Verticals',
    description: 'Tenant-tailored examples connecting the system to real business use cases.',
    sectionSlug: 'verticals',
  });
  metadata.set('/verticals/platform', {
    label: 'Platform',
    description: 'Operational admin patterns for the flagship platform experience.',
    sectionSlug: 'verticals',
  });
  metadata.set('/verticals/bithire', {
    label: 'BitHire',
    description: 'Recruiting-focused adaptations of the shared design system.',
    sectionSlug: 'verticals',
  });
  metadata.set('/verticals/evnto', {
    label: 'Evnto',
    description: 'Event-product flows showing how the system flexes for experience-heavy UIs.',
    sectionSlug: 'verticals',
  });

  metadata.set('/playground', {
    label: 'Playground',
    description: 'Experiment with tokens, themes, and visual output in a live sandbox.',
    sectionSlug: 'playground',
  });
  metadata.set('/playground/theme-builder', {
    label: 'Theme Builder',
    description: 'Tune palette, typography, and surface behavior with immediate feedback.',
    sectionSlug: 'playground',
  });

  metadata.set('/developers', {
    label: 'Developers',
    description: 'Architecture, onboarding, and implementation guidance for the design system.',
    sectionSlug: 'developers',
  });
  metadata.set('/developers/getting-started', {
    label: 'Getting Started',
    description: 'Install, import, and begin composing the design system in product code.',
    sectionSlug: 'developers',
  });
  metadata.set('/developers/architecture', {
    label: 'Architecture',
    description: 'How tiers, engines, tokens, and tenant branding connect internally.',
    sectionSlug: 'developers',
  });

  return metadata;
}

const PATH_METADATA = buildPathMetadata();

function describeNavigationRecord(section: NavSection, item: NavItem, parents: NavItem[]) {
  const exactMetadata = PATH_METADATA.get(item.path);

  if (exactMetadata) {
    return exactMetadata.description;
  }

  if (item.children?.length) {
    const lineage = [section.label, ...parents.map((parent) => parent.label)]
      .filter(Boolean)
      .join(' / ');

    return `${lineage} contains ${item.children.length} documented entries.`;
  }

  return `${section.label} reference for ${formatShowroomLabel(item.label)}.`;
}

function flattenItems(
  section: NavSection,
  items: NavItem[],
  parents: NavItem[] = [],
  depth = 0
): NavigationRecord[] {
  return items.flatMap((item) => {
    const record: NavigationRecord = {
      count: item.children?.length,
      depth,
      description: describeNavigationRecord(section, item, parents),
      item,
      kind:
        depth === 0 ? 'section-overview' : item.children?.length ? 'group-overview' : 'entry',
      parents,
      section,
    };

    if (!item.children?.length) {
      return [record];
    }

    return [record, ...flattenItems(section, item.children, [...parents, item], depth + 1)];
  });
}

export const NAVIGATION_RECORDS = navigation.flatMap((section) =>
  flattenItems(section, section.children)
);
const SECTION_ENTRY_COUNTS = NAVIGATION_RECORDS.reduce<Record<string, number>>(
  (counts, record) => {
    if (!record.item.children?.length) {
      counts[record.section.slug] = (counts[record.section.slug] ?? 0) + 1;
    }

    return counts;
  },
  {}
);

export function getMetadataForPath(path: string) {
  return PATH_METADATA.get(path);
}

export function getSectionMeta(sectionSlug: string) {
  return SECTION_META[sectionSlug] ?? SECTION_META.showroom;
}

export function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function findBestNavigationRecord(pathname: string) {
  const exactMatch = NAVIGATION_RECORDS.find((record) => record.item.path === pathname);

  if (exactMatch) {
    return exactMatch;
  }

  return NAVIGATION_RECORDS
    .filter((record) => isPathActive(pathname, record.item.path))
    .sort((a, b) => b.item.path.length - a.item.path.length)[0];
}

export function getSectionOverviewPath(section: NavSection) {
  return `/${section.slug}`;
}

export function countSectionEntries(section: NavSection) {
  return SECTION_ENTRY_COUNTS[section.slug] ?? 0;
}

export function formatSegmentLabel(segment: string) {
  return toTitleCase(segment);
}

export function getRoutePresentation(pathname: string) {
  const activeRecord = findBestNavigationRecord(pathname);
  const metadata = PATH_METADATA.get(pathname);
  const extraSegments = activeRecord
    ? pathname
        .split('/')
        .filter(Boolean)
        .slice(activeRecord.item.path.split('/').filter(Boolean).length)
    : pathname.split('/').filter(Boolean);
  const activeSectionSlug =
    metadata?.sectionSlug ?? activeRecord?.section.slug ?? pathname.split('/').filter(Boolean)[0] ?? 'showroom';
  const sectionMeta = getSectionMeta(activeSectionSlug);
  const breadcrumbs: BreadcrumbItem[] = [];

  if (activeRecord) {
    if (activeRecord.kind !== 'section-overview') {
      breadcrumbs.push({
        href: getSectionOverviewPath(activeRecord.section),
        label: activeRecord.section.label,
      });
    }

    for (const parent of activeRecord.parents) {
      breadcrumbs.push({
        href: parent.path,
        label: formatShowroomLabel(parent.label),
      });
    }

    breadcrumbs.push({
      href: activeRecord.item.path,
      label: metadata?.label ?? formatShowroomLabel(activeRecord.item.label),
    });
  } else if (pathname !== '/') {
    pathname
      .split('/')
      .filter(Boolean)
      .forEach((segment, index, segments) => {
        breadcrumbs.push({
          href: `/${segments.slice(0, index + 1).join('/')}`,
          label: formatSegmentLabel(segment),
        });
      });
  }

  if (extraSegments.length) {
    const baseSegments = activeRecord?.item.path.split('/').filter(Boolean) ?? [];
    extraSegments.forEach((segment, index) => {
      breadcrumbs.push({
        href: `/${[...baseSegments, ...extraSegments.slice(0, index + 1)].join('/')}`,
        label: formatSegmentLabel(segment),
      });
    });
  }

  const title =
    metadata?.label ??
    (extraSegments.length
      ? formatSegmentLabel(extraSegments[extraSegments.length - 1])
      : activeRecord
        ? formatShowroomLabel(activeRecord.item.label)
        : sectionMeta.eyebrow);
  const description =
    metadata?.description ??
    activeRecord?.description ??
    sectionMeta.description;

  return {
    activeRecord,
    breadcrumbs,
    description,
    sectionMeta,
    sectionSlug: activeSectionSlug,
    title,
  };
}
