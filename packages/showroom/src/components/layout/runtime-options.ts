import type { ShowroomEngine, ShowroomTheme } from '@/components/showroom-context';

export interface PreviewOption<T extends string> {
  key: T;
  label: string;
  shortLabel: string;
  accent: string;
  hint: string;
}

export const ENGINE_OPTIONS: PreviewOption<ShowroomEngine>[] = [
  {
    key: 'classic',
    label: 'Classic',
    shortLabel: 'CL',
    accent: '#8b5cf6',
    hint: 'Balanced defaults and timeless UI proportions.',
  },
  {
    key: 'modern',
    label: 'Modern',
    shortLabel: 'MD',
    accent: '#0f766e',
    hint: 'Sharper contrast, cleaner spacing, and product polish.',
  },
  {
    key: 'rustic',
    label: 'Rustic',
    shortLabel: 'RS',
    accent: '#c2410c',
    hint: 'Warmer surfaces with softer rhythm and stronger personality.',
  },
];

export const THEME_OPTIONS: PreviewOption<ShowroomTheme>[] = [
  {
    key: 'rottay',
    label: 'Platform',
    shortLabel: 'PF',
    accent: 'var(--ds-color-primary-500)',
    hint: 'Flagship admin baseline powered by the Rottay tenant and platform vertical preset.',
  },
  {
    key: 'bithire',
    label: 'BitHire',
    shortLabel: 'BH',
    accent: '#4f46e5',
    hint: 'Recruiting tenant layered with the BitHire vertical defaults.',
  },
  {
    key: 'evnto',
    label: 'Evnto',
    shortLabel: 'EV',
    accent: '#db2777',
    hint: 'Event product tenant layered with the Evnto vertical defaults.',
  },
];

export const DOC_COUNTS = {
  primitives: 97,
  patterns: 47,
  structures: 21,
  surfaces: 33,
  charts: 18,
  icons: 109,
  total: 325,
};

export function getPreviewOption<T extends string>(
  options: PreviewOption<T>[],
  key: T
) {
  return options.find((option) => option.key === key) ?? options[0];
}
