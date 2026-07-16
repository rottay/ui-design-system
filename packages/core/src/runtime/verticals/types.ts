/**
 * @fileoverview Type definitions for the vertical preset system.
 *
 * Verticals represent industry-specific configurations that bundle together
 * an engine preference, personality tokens, density, and surface defaults.
 *
 * Each Rottay application (Evnto, BitHire, Platform) maps to a vertical preset,
 * providing a single entry point for configuring the entire design system
 * experience for that product domain.
 */

import type { EngineName } from '../../contracts/engine';
import type { PersonalityTokens } from '../../contracts/tokens/personality';
import type { TenantTokenOverrides } from '../../contracts/tenants';
import type { ProductProfileKey } from '../../contracts/product-profiles';
import type { MotionProfile } from '../../contracts/verticals';

/**
 * Known vertical keys.
 *
 * The string union is intentionally open-ended via `(string & {})` so product
 * teams can register custom verticals without waiting for a DS release.
 */
export type VerticalKey =
  | 'evnto'
  | 'bithire'
  | 'platform'
  | (string & {});

/**
 * A vertical preset bundles all design system configuration for a product domain.
 *
 * It sits above product profiles and below explicit provider props in the
 * resolution chain:
 *
 *   DesignSystemProvider props (highest priority)
 *     > Tenant config
 *       > Vertical preset
 *         > Product profile
 *           > Engine defaults (lowest priority)
 */
export interface VerticalPreset {
  /** Unique key identifying this vertical */
  key: VerticalKey;
  /** Human-readable label for UI display */
  label: string;
  /** Optional description of the vertical's purpose */
  description?: string;
  /** Preferred rendering engine for this vertical */
  engine: EngineName;
  /**
   * Semantic motion envelope for the vertical. Optional for one compatibility
   * minor so externally registered presets keep resolving to the calm default.
   */
  motionProfile?: MotionProfile;
  /** Default UI density */
  density: 'compact' | 'comfortable' | 'spacious';
  /** Personality tokens that define the visual mood of this vertical */
  personality: PersonalityTokens;
  /** Optional token overrides (border radius, shadows, density scale) */
  tokenOverrides?: TenantTokenOverrides;
  /** Default product profile to use when no explicit profile is provided */
  defaultProductProfile: ProductProfileKey;
  /** Feature flags enabled by default for this vertical */
  features: string[];
  /** Default surface-level display preferences */
  surfaceDefaults: {
    listView: 'table' | 'cards';
    density: 'compact' | 'comfortable' | 'spacious';
    schedulerView?: 'month' | 'week' | 'day';
  };
  /** Suggested brand palette for new tenants in this vertical */
  suggestedPalette?: {
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}
