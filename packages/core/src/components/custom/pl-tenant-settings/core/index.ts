/**
 * PlTenantSettings - Core Interface
 * Comprehensive tenant configuration panel with branding, security, integrations, and billing
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ────────────────────────────────────────────────────────────

export type PlTenantSettingsPreset = 'form' | 'tabs';

// ─── Settings Tab ───────────────────────────────────────────────────────────

export type SettingsTab = 'general' | 'branding' | 'security' | 'integrations' | 'billing';

// ─── Branding Config ────────────────────────────────────────────────────────

export interface BrandingConfig {
  /** Primary brand color (hex) */
  primaryColor: string;
  /** URL to the tenant logo image */
  logoUrl?: string;
  /** URL to the tenant favicon image */
  faviconUrl?: string;
  /** Custom domain for the tenant */
  customDomain?: string;
}

// ─── Security Config ────────────────────────────────────────────────────────

export interface SecurityConfig {
  /** Whether multi-factor authentication is required for all users */
  mfaRequired: boolean;
  /** Minimum password length requirement */
  passwordMinLength: number;
  /** Session timeout in minutes */
  sessionTimeout: number;
  /** List of whitelisted IP addresses or CIDR ranges */
  ipWhitelist: string[];
  /** Whether SSO is required (disables password login) */
  ssoRequired: boolean;
}

// ─── Tenant Settings Data ───────────────────────────────────────────────────

export interface TenantSettingsData {
  /** Unique tenant identifier */
  id: string;
  /** Display name of the tenant */
  name: string;
  /** URL-friendly slug (typically readonly) */
  slug: string;
  /** Optional description of the tenant */
  description?: string;
  /** IANA timezone identifier */
  timezone: string;
  /** ISO 639-1 language code */
  language: string;
  /** Branding configuration */
  branding: BrandingConfig;
  /** Security configuration */
  security: SecurityConfig;
  /** Webhook endpoint URL for event notifications */
  webhookUrl?: string;
  /** API rate limit (requests per minute) */
  apiRateLimit: number;
  /** Maximum file upload size in MB */
  maxFileSize: number;
}

// ─── Props ──────────────────────────────────────────────────────────────────

export interface PlTenantSettingsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlTenantSettingsPreset;
  /** The full tenant settings data object */
  settings: TenantSettingsData;
  /** Callback when the user saves settings (receives the modified data) */
  onSave?: (settings: TenantSettingsData) => void;
  /** Callback when the user clicks Reset to Defaults */
  onResetDefaults?: () => void;
  /** Currently active tab (controlled) */
  activeTab?: SettingsTab;
  /** Callback when the active tab changes */
  onTabChange?: (tab: SettingsTab) => void;
  /** Whether a save operation is in progress */
  saving?: boolean;
  /** Whether the settings are loading */
  loading?: boolean;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const PL_TENANT_SETTINGS_DEFAULTS: Partial<PlTenantSettingsProps> = {
  preset: 'form',
  saving: false,
  loading: false,
};

// ─── Constants ──────────────────────────────────────────────────────────────

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ru', label: 'Russian' },
];

export const SESSION_TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '24 hours' },
  { value: 10080, label: '7 days' },
  { value: 43200, label: '30 days' },
];

export const COLOR_SWATCHES = [
  '#3B82F6', '#2563EB', '#1D4ED8',
  '#8B5CF6', '#7C3AED', '#6D28D9',
  '#EC4899', '#DB2777', '#BE185D',
  '#EF4444', '#DC2626', '#B91C1C',
  '#F97316', '#EA580C', '#C2410C',
  '#EAB308', '#CA8A04', '#A16207',
  '#22C55E', '#16A34A', '#15803D',
  '#14B8A6', '#0D9488', '#0F766E',
  '#06B6D4', '#0891B2', '#0E7490',
  '#6366F1', '#4F46E5', '#4338CA',
  '#64748B', '#475569', '#334155',
  '#000000',
];
