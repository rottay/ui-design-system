/**
 * @fileoverview Type definitions for the EnvironmentToggle pattern. Defines
 * EnvironmentDef (id, name, color, badge) and the component props controlling
 * variant (toggle/dropdown/pills), production switch confirmation, and banner.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Defines a single environment available in the toggle.
 * Each environment has a unique identity, a color for visual distinction,
 * and an optional badge (e.g. "BETA", "NEW") rendered alongside the name.
 */
export interface EnvironmentDef {
  /** Unique identifier for this environment (e.g. "production", "staging", "dev") */
  id: string;
  /** Human-readable display name */
  name: string;
  /** CSS color value used for the environment indicator and banner */
  color: string;
  /** Optional icon rendered next to the environment name */
  icon?: ReactNode;
  /** Optional badge text shown as a small label (e.g. "BETA") */
  badge?: string;
}

/**
 * Props for the EnvironmentToggle pattern component.
 * Renders a control that lets users switch between deployment environments
 * (e.g. production, staging, development) with optional safety confirmation
 * when switching to production and a persistent non-production banner.
 *
 * @example
 * ```tsx
 * <EnvironmentToggle
 *   environments={[
 *     { id: 'prod', name: 'Production', color: '#e53e3e' },
 *     { id: 'staging', name: 'Staging', color: '#dd6b20' },
 *     { id: 'dev', name: 'Development', color: '#38a169', badge: 'LOCAL' },
 *   ]}
 *   activeEnvironment="staging"
 *   onChange={(envId) => switchEnvironment(envId)}
 *   variant="pills"
 *   showBanner
 *   productionId="prod"
 *   confirmProductionSwitch="Are you sure you want to switch to Production?"
 * />
 * ```
 */
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
