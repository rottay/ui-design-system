/**
 * Tenant configuration types
 * Multi-tenant system configuration
 */

import type { EngineName } from '../engine';
import type { PersonalityTokens } from '../tokens/personality';
import type { SurfaceTokens, MotionTokens } from '../tokens';

export type TenantPlan = 'starter' | 'pro' | 'enterprise';

export interface TenantBranding {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  companyName: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface TenantTokenOverrides {
  surface?: Partial<SurfaceTokens>;
  motion?: Partial<MotionTokens>;
  borderRadius?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  shadows?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  densityScale?: number;
}

export interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;

  engine: EngineName;
  theme: string;

  plan: TenantPlan;
  features: string[];

  branding: TenantBranding;

  /** Visual personality overrides (merged with engine defaults) */
  personality?: Partial<PersonalityTokens>;
  /** Direct token overrides that supersede engine defaults */
  tokenOverrides?: TenantTokenOverrides;
}

export interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
}
