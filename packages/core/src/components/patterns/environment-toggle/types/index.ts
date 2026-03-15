/**
 * EnvironmentToggle - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface EnvironmentDef {
  id: string;
  name: string;
  color: string;
  icon?: ReactNode;
  badge?: string;
}

export interface EnvironmentToggleProps extends PatternBaseProps {
  /** Available environments */
  environments: EnvironmentDef[];
  /** ID of the currently active environment */
  activeEnvironment: string;
  /** Called when the user switches environments */
  onChange: (envId: string) => void;
  /** Visual variant */
  variant?: 'toggle' | 'dropdown' | 'pills';
  /** Show persistent banner when not in production */
  showBanner?: boolean;
  /** Custom banner message (defaults to environment name) */
  bannerMessage?: string;
  /** ID of the production environment (used for warning on switch) */
  productionId?: string;
  /** Confirmation message when switching to production */
  confirmProductionSwitch?: string;
}
