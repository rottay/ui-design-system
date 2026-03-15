import type { EngineAwareProps } from '../../../../types';

export type MaintenancePagePreset = 'maintenance' | 'coming-soon';

export interface MaintenancePageProps extends EngineAwareProps {
  preset?: MaintenancePagePreset;
  title?: string;
  description?: string;
  estimatedTime?: string;
  contactEmail?: string;
  illustration?: React.ReactNode;
  logo?: React.ReactNode;
  countdown?: {
    target: string; // ISO date string
  };
  className?: string;
  style?: React.CSSProperties;
}

export const MAINTENANCE_PAGE_DEFAULTS = {
  preset: 'maintenance' as MaintenancePagePreset,
  title: 'Under Maintenance',
  description: "We're currently performing scheduled maintenance. We'll be back soon!",
};
