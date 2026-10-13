export interface VerticalDemoItem {
  title: string;
  description: string;
  components: string[];
}

interface TierMix {
  patterns: number;
  structures: number;
  primitives: number;
}

export interface VerticalCategoryAppendixProps {
  backHref: string;
  backLabel: string;
  label: string;
  headline: string;
  summary: string;
  operators: string[];
  tempo: string;
  principles: string[];
  demos: VerticalDemoItem[];
}

const STRUCTURE_COMPONENTS = new Set([
  'CollectionHeader',
  'TableToolbar',
  'RecordFieldGrid',
  'DetailHeader',
  'FormHeader',
  'StatsHeader',
]);

export const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
export const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
export const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
export const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
export const TEXT_MUTED = 'var(--ds-color-text-muted)';
export const FEATURED_COMPONENT_LIMIT = 4;
export const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
export const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
export const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 90%, var(--ds-color-bg-secondary, #f1f5f9) 10%) 0%, ${SURFACE} 100%)`;

export const SCENARIO_READING_GUIDE = [
  {
    label: 'Read order',
    detail:
      'Start with the title and archetype, then inspect composition balance and the part sample.',
  },
  {
    label: 'Proof check',
    detail:
      'Confirm the lane still reads like one product module after the runtime changes tone, density, and contrast.',
  },
];

export function inferArchetype(components: string[]) {
  if (
    components.some(
      (component) =>
        component.includes('Chart') ||
        component.includes('Statistic') ||
        component.includes('HeatMap'),
    )
  ) {
    return 'Analytics surface';
  }

  if (
    components.some(
      (component) =>
        component.includes('Form') ||
        component.includes('Builder') ||
        component.includes('Editor'),
    )
  ) {
    return 'Configuration flow';
  }

  if (
    components.some(
      (component) =>
        component.includes('Table') ||
        component.includes('List') ||
        component.includes('Kanban') ||
        component.includes('DataTable'),
    )
  ) {
    return 'Operational index';
  }

  if (
    components.some(
      (component) =>
        component.includes('Timeline') ||
        component.includes('Calendar') ||
        component.includes('Stepper'),
    )
  ) {
    return 'Process workspace';
  }

  return 'Task module';
}

export function getTierMix(components: string[]): TierMix {
  return components.reduce(
    (accumulator, component) => {
      if (component.startsWith('Pattern')) {
        accumulator.patterns += 1;
      } else if (STRUCTURE_COMPONENTS.has(component)) {
        accumulator.structures += 1;
      } else {
        accumulator.primitives += 1;
      }

      return accumulator;
    },
    { patterns: 0, structures: 0, primitives: 0 },
  );
}

export function formatTierMix(tierMix: TierMix) {
  return `${tierMix.patterns}P / ${tierMix.structures}S / ${tierMix.primitives}Pr`;
}

export function buildInspectionNote(components: string[]) {
  const archetype = inferArchetype(components);

  if (archetype === 'Analytics surface') {
    return 'Check whether chart emphasis, contrast, and labels stay legible under the active provider.';
  }

  if (archetype === 'Configuration flow') {
    return 'Check whether grouping, spacing, and field hierarchy still feel calm when the runtime changes.';
  }

  if (archetype === 'Operational index') {
    return 'Check whether scanning rhythm, action placement, and row density still feel safe and fast.';
  }

  if (archetype === 'Process workspace') {
    return 'Check whether sequence, progress cues, and handoff points remain easy to follow.';
  }

  return 'Check whether the module still feels product-grade rather than like an isolated component demo.';
}

export function describeTierMix(tierMix: TierMix) {
  if (
    tierMix.patterns >= tierMix.structures &&
    tierMix.patterns >= tierMix.primitives
  ) {
    return 'Pattern-led composition';
  }

  if (
    tierMix.structures >= tierMix.patterns &&
    tierMix.structures >= tierMix.primitives
  ) {
    return 'Structure-led composition';
  }

  return 'Primitive-heavy assembly';
}

export function buildRuntimeChecks({
  label,
  tempo,
  operators,
  dominantArchetype,
}: {
  label: string;
  tempo: string;
  operators: string[];
  dominantArchetype: string;
}) {
  const operatorSummary =
    operators.length > 2
      ? `${operators[0]}, ${operators[1]}, and ${operators.length - 2} more`
      : operators.join(' and ');

  return [
    {
      label: 'Keep stable',
      detail: `${label} still needs to feel native for ${operatorSummary} even while the provider changes the surrounding chrome.`,
    },
    {
      label: 'Stress point',
      detail: `${tempo} means hierarchy, action placement, and contrast cannot become ambiguous under a different runtime.`,
    },
    {
      label: 'Read as one lane',
      detail: `${dominantArchetype} should feel like one coherent chapter here rather than a stack of isolated component demos.`,
    },
  ];
}
