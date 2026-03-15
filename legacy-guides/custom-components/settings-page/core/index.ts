import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type SettingsPagePreset = 'sidebar-nav' | 'tabbed';

export interface SettingsSection {
  key: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  content: ReactNode;
}

export interface SettingsPageProps extends EngineAwareProps {
  preset?: SettingsPagePreset;
  title?: string;
  sections: SettingsSection[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SETTINGS_PAGE_DEFAULTS: Partial<SettingsPageProps> = {
  preset: 'sidebar-nav',
  title: 'Settings',
};
