/**
 * PlTenantManager - Core Interface
 * Comprehensive tenant management for multi-tenant SaaS platforms.
 * Supports tenant lifecycle, plan tiers, usage tracking, and billing.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Enums / Unions ──────────────────────────────────────────────────────────

export type PlTenantManagerPreset = 'table' | 'cards';

export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial';

export type TenantPlan = 'free' | 'starter' | 'business' | 'enterprise';

// ─── Data Model ──────────────────────────────────────────────────────────────

export interface Tenant {
  /** Unique tenant identifier */
  id: string;
  /** Display name of the tenant organization */
  name: string;
  /** URL-safe slug for the tenant */
  slug: string;
  /** Current lifecycle status */
  status: TenantStatus;
  /** Subscription plan tier */
  plan: TenantPlan;
  /** Custom domain, if configured */
  domain?: string;
  /** Logo URL or data URI */
  logo?: string;
  /** Name of the tenant owner / admin */
  ownerName: string;
  /** Email of the tenant owner / admin */
  ownerEmail: string;
  /** Current number of users in the tenant */
  usersCount: number;
  /** Maximum allowed users for the current plan */
  maxUsers: number;
  /** Storage consumed in bytes */
  storageUsed: number;
  /** Storage limit in bytes for the current plan */
  storageLimit: number;
  /** Data center region identifier (e.g. "us-east-1", "eu-west-1") */
  region: string;
  /** Tenant creation timestamp */
  createdAt: Date;
  /** Trial expiration date (only relevant when status is 'trial') */
  trialEndsAt?: Date;
  /** Last activity timestamp */
  lastActive?: Date;
  /** Monthly recurring revenue in cents */
  mrr?: number;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface PlTenantManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlTenantManagerPreset;

  /** Array of tenant objects to display */
  tenants: Tenant[];

  /** Callback when a tenant row or card is clicked */
  onTenantClick?: (tenantId: string) => void;
  /** Callback to create a new tenant */
  onCreate?: () => void;
  /** Callback to suspend a tenant */
  onSuspend?: (tenantId: string) => void;
  /** Callback to activate / reactivate a tenant */
  onActivate?: (tenantId: string) => void;
  /** Callback to delete a tenant */
  onDelete?: (tenantId: string) => void;

  /** Controlled search query */
  searchQuery?: string;
  /** Callback when search input changes */
  onSearchChange?: (query: string) => void;

  /** Controlled status filter */
  filterStatus?: TenantStatus | null;
  /** Callback when status filter changes */
  onFilterStatus?: (status: TenantStatus | null) => void;

  /** Controlled plan filter */
  filterPlan?: TenantPlan | null;
  /** Callback when plan filter changes */
  onFilterPlan?: (plan: TenantPlan | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_TENANT_MANAGER_DEFAULTS: Partial<PlTenantManagerProps> = {
  preset: 'table',
  loading: false,
};
