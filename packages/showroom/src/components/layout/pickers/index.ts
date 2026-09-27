import type { ShowroomEngine, ShowroomTheme } from '@/components/showroom-context';
import { SHOWROOM_CATALOG, SHOWROOM_TENANTS } from '@/components/showroom-context/catalog';

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

export const THEME_OPTIONS: PreviewOption<ShowroomTheme>[] = SHOWROOM_TENANTS.map((key) => {
  const { name, shortLabel, accent, hint } = SHOWROOM_CATALOG[key];
  return { key, label: name, shortLabel, accent, hint };
});

export function getPreviewOption<T extends string>(
  options: PreviewOption<T>[],
  key: T
) {
  return options.find((option) => option.key === key) ?? options[0];
}
