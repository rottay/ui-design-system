import type { CSSProperties } from 'react';

export const FEATURE_PICTOGRAM_NAMES = [
  'ai-assistant',
  'analytics-insight',
  'candidate-evidence',
  'empty-search',
  'event-moment',
  'secure-access',
  'team-collaboration',
  'workflow-automation',
] as const;

export type FeaturePictogramName = (typeof FEATURE_PICTOGRAM_NAMES)[number];

export interface FeaturePictogramCorpusEntry {
  readonly name: FeaturePictogramName;
  readonly family:
    | 'ai'
    | 'data'
    | 'bithire'
    | 'empty-state'
    | 'evnto'
    | 'security'
    | 'team'
    | 'workflow';
  readonly intent: string;
  readonly directional: false;
  readonly source: 'rottay-original';
}

export const FEATURE_PICTOGRAM_CORPUS: readonly FeaturePictogramCorpusEntry[] =
  Object.freeze([
    {
      name: 'ai-assistant',
      family: 'ai',
      intent: 'Explain an AI-assisted capability or onboarding step.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'analytics-insight',
      family: 'data',
      intent: 'Explain an analytical insight, report, or decision surface.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'candidate-evidence',
      family: 'bithire',
      intent: 'Explain evidence-backed candidate evaluation.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'empty-search',
      family: 'empty-state',
      intent: 'Explain that a bounded search returned no results.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'event-moment',
      family: 'evnto',
      intent: 'Explain a scheduled live event or memorable event moment.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'secure-access',
      family: 'security',
      intent: 'Explain protected access, identity, or trusted handling.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'team-collaboration',
      family: 'team',
      intent: 'Explain coordinated work between people.',
      directional: false,
      source: 'rottay-original',
    },
    {
      name: 'workflow-automation',
      family: 'workflow',
      intent: 'Explain an automated multi-step workflow.',
      directional: false,
      source: 'rottay-original',
    },
  ]);

export type FeaturePictogramSizeToken = 'sm' | 'md' | 'lg' | 'xl';
export type FeaturePictogramSize = FeaturePictogramSizeToken | number;
export type FeaturePictogramTone =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ai';

interface FeaturePictogramVisualProps {
  name: FeaturePictogramName;
  size?: FeaturePictogramSize;
  tone?: FeaturePictogramTone;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

type LabeledFeaturePictogram = {
  label: string;
  decorative?: false;
};

type DecorativeFeaturePictogram = {
  label?: never;
  decorative: true;
};

export type FeaturePictogramProps = FeaturePictogramVisualProps &
  (LabeledFeaturePictogram | DecorativeFeaturePictogram);

export interface FeaturePictogramProvenance {
  readonly name: FeaturePictogramName;
  readonly source: 'rottay-original';
  readonly license: 'LicenseRef-Rottay-Original-Product-Asset-1.0';
  readonly rightsHolder: 'Rottay';
  readonly distribution: 'internal-and-bundled-product';
  readonly supplier: null;
  readonly rendering: 'local-svg-ssr';
  readonly viewBox: '0 0 96 96';
  readonly authoredVersion: 1;
}

const FEATURE_PICTOGRAM_NAME_SET: ReadonlySet<string> = new Set(FEATURE_PICTOGRAM_NAMES);

export function isFeaturePictogramName(value: unknown): value is FeaturePictogramName {
  return typeof value === 'string' && FEATURE_PICTOGRAM_NAME_SET.has(value);
}
