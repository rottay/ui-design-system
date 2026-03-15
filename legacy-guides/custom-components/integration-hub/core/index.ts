import type { EngineAwareProps } from '../../../../types';

export type IntegrationHubPreset = 'grid' | 'list';

export interface Integration {
  key: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
  installed?: boolean;
  popular?: boolean;
  author?: string;
}

export interface IntegrationHubProps extends EngineAwareProps {
  preset?: IntegrationHubPreset;
  integrations: Integration[];
  categories?: { key: string; label: string }[];
  onInstall?: (key: string) => void;
  onUninstall?: (key: string) => void;
  onSelect?: (key: string) => void;
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const INTEGRATION_HUB_DEFAULTS = {
  preset: 'grid' as IntegrationHubPreset,
  searchable: true,
};
