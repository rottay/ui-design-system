// Flag and scene vocabulary for /probe/whitelabel-torture and its scene routes.
// This module must stay free of component imports: `ds-reference` and every
// scene route read it, so a single section import here would pull all of them
// back into each of those graphs and dissolve the per-scene import boundary.

// Dispatcher order. The scene routes render their own subset in this order so
// a scene capture and a multi-flag legacy capture stack their sections alike.
export const TORTURE_SECTION_FLAGS = [
  'interactive',
  'tablestates',
  'fieldfilters',
  'filterpanel',
  'rail',
  'detailpanel',
  'datatable',
  'fields',
  'dropdowns',
  'pickers',
  'statusfb',
  'overlayfb',
  'overlay',
  'nav',
  'mediaStates',
  'dataDisplayStates',
  'layout',
  'forms',
  'record',
  'headers',
  'headers-patterns',
  'navigation',
  'dashboard',
  'communication',
  'workspace',
  'applicationSurfaces',
  'tenantBranding',
  'visualizations',
  'longTail',
] as const;

export type TortureSectionFlag = (typeof TORTURE_SECTION_FLAGS)[number];

export const TORTURE_SCENES = {
  primitives: {
    label: 'Primitives',
    flags: ['interactive', 'fields', 'dropdowns', 'pickers', 'statusfb', 'overlayfb', 'overlay', 'nav', 'mediaStates', 'dataDisplayStates', 'layout'],
  },
  forms: {
    label: 'Forms & input systems',
    flags: ['fieldfilters', 'fields', 'dropdowns', 'pickers', 'forms'],
  },
  data: {
    label: 'Data & collections',
    flags: ['tablestates', 'filterpanel', 'rail', 'detailpanel', 'datatable', 'headers', 'headers-patterns'],
  },
  workflow: {
    label: 'Workflow & communication',
    flags: ['record', 'navigation', 'communication', 'applicationSurfaces'],
  },
  dashboard: {
    label: 'Dashboards & charts',
    flags: ['dashboard', 'visualizations'],
  },
  shell: {
    label: 'Shell, navigation & structure',
    flags: ['nav', 'headers', 'headers-patterns', 'navigation', 'workspace', 'tenantBranding'],
  },
  surfaces: {
    label: 'Surfaces & long tail',
    flags: ['record', 'dashboard', 'workspace', 'applicationSurfaces', 'longTail'],
  },
  all: {
    label: 'Coverage atlas',
    // Intentionally renders the authored flagship galleries only. Mounting all
    // 252 families in one DOM made the lab itself non-iterable; total coverage
    // is the union of the seven focused scenes plus this atlas.
    flags: [],
  },
} as const satisfies Record<string, { label: string; flags: readonly TortureSectionFlag[] }>;

export type TortureSceneId = keyof typeof TORTURE_SCENES;

export const TORTURE_SCENE_IDS = Object.keys(TORTURE_SCENES) as TortureSceneId[];
