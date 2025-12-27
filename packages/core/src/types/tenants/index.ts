/**
 * Tenant configuration types
 * Multi-tenant system configuration
 */

import type { EngineName } from '../engine';

export type TenantPlan = 'starter' | 'pro' | 'enterprise';

export interface TenantBranding {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  companyName: string;
  primaryColor?: string;
  accentColor?: string;
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
}

export interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
}
