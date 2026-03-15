import type { EngineAwareProps } from '../../../../types';

export type ChangelogSectionPreset = 'timeline' | 'cards';
export type ChangelogType = 'feature' | 'improvement' | 'fix' | 'breaking';

export interface ChangelogEntry {
  key: string;
  version: string;
  date: string;
  title: string;
  description?: string;
  type: ChangelogType;
  items?: string[];
}

export interface ChangelogSectionProps extends EngineAwareProps {
  preset?: ChangelogSectionPreset;
  entries: ChangelogEntry[];
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CHANGELOG_SECTION_DEFAULTS = {
  preset: 'timeline' as ChangelogSectionPreset,
};
