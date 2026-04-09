/**
 * @fileoverview Type definitions for the TenantPreview pattern. Defines
 * PreviewComponent variants and the props controlling tenant config preview,
 * color palette display, and personality info panel.
 */

import type { PatternBaseProps } from '../../foundation/types';
import type { TenantCreationConfig } from '../../../../hooks/tenant/create-tenant';

/**
 * Identifies which design system component samples are rendered
 * in the preview panel to demonstrate the tenant's visual theme.
 */
export type PreviewComponent = 'button' | 'card' | 'input' | 'badge' | 'table';

/**
 * Props for the TenantPreview pattern component.
 * Renders a live preview of how UI components will look under a given
 * tenant configuration, including themed color palette and personality traits.
 * Used during tenant creation or branding customization flows.
 *
 * @example
 * ```tsx
 * <TenantPreview
 *   config={tenantConfig}
 *   components={['button', 'card', 'input']}
 *   showColorPalette
 *   showPersonalityInfo
 * />
 * ```
 */
export interface TenantPreviewProps extends PatternBaseProps {
  /** The tenant creation config whose theme is being previewed */
  config: TenantCreationConfig;
  /** Subset of component samples to render (defaults to all five) */
  components?: PreviewComponent[];
  /** Whether to display the generated color palette swatch grid */
  showColorPalette?: boolean;
  /** Whether to display the tenant personality/brand traits panel */
  showPersonalityInfo?: boolean;
}
