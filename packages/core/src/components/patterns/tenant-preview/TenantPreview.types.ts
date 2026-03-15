/**
 * TenantPreview Pattern - Types
 *
 * A pattern that renders a live preview of how components look with
 * a given tenant configuration. Used during tenant onboarding to
 * visualize branding choices before committing.
 */

import type { PatternBaseProps } from '../types';
import type { TenantCreationConfig } from '../../../hooks/tenant/create-tenant';

export type PreviewComponent = 'button' | 'card' | 'input' | 'badge' | 'table';

export interface TenantPreviewProps extends PatternBaseProps {
  /** The tenant creation config to preview */
  config: TenantCreationConfig;
  /** Which component samples to show (defaults to all) */
  components?: PreviewComponent[];
  /** Show the generated color palette */
  showColorPalette?: boolean;
  /** Show personality information panel */
  showPersonalityInfo?: boolean;
}
