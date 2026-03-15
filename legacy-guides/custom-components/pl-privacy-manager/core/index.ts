/**
 * PlPrivacyManager - Core Types & Defaults
 * Privacy management with GDPR compliance, consent tracking, and data request handling
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset ──────────────────────────────────────────────────────────────────

export type PlPrivacyManagerPreset = 'panel' | 'wizard';

// ─── Consent Types ────────────────────────────────────────────────────────────

export type ConsentStatus = 'granted' | 'denied' | 'pending' | 'expired';

export type DataCategory = 'personal' | 'financial' | 'health' | 'behavioral' | 'technical';

export type LegalBasis = 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';

export type ConsentCategory =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'personalization'
  | 'third_party';

export type LawfulBasis =
  | 'consent'
  | 'contract'
  | 'legitimate_interest'
  | 'legal_obligation';

export interface ConsentRecord {
  id: string;
  purpose: string;
  description: string;
  category: DataCategory;
  legalBasis: LegalBasis;
  status: ConsentStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  version: string;
  required: boolean;
  /** Legacy compat fields */
  name?: string;
  isRequired?: boolean;
  isGranted?: boolean;
  revokedAt?: Date;
  lawfulBasis?: LawfulBasis;
  dataRetentionDays?: number;
  thirdParties?: string[];
}

// ─── Data Request Types ───────────────────────────────────────────────────────

export type DataRequestType =
  | 'access'
  | 'deletion'
  | 'portability'
  | 'rectification';

export type DataRequestStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'rejected';

export interface DataRequest {
  id: string;
  type: DataRequestType;
  status: DataRequestStatus;
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  data?: unknown;
}

// ─── Privacy Settings ─────────────────────────────────────────────────────────

export interface PrivacySettings {
  cookieConsent: boolean;
  doNotTrack: boolean;
  dataRetention: number; // days
  marketingOptIn: boolean;
  analyticsOptIn: boolean;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface PrivacyStats {
  totalConsents: number;
  pendingRequests: number;
  dataRequestsThisMonth: number;
  complianceScore: number; // 0-100
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PlPrivacyManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlPrivacyManagerPreset;

  /** List of consent records */
  consents: ConsentRecord[];

  /** List of data requests */
  dataRequests?: DataRequest[];

  /** Current privacy settings */
  settings?: PrivacySettings;

  /** Privacy statistics */
  stats?: PrivacyStats;

  /** Callback when consent is toggled */
  onConsentToggle?: (consentId: string, granted: boolean) => void;

  /** Callback when a data access request is submitted */
  onRequestAccess?: () => void;

  /** Callback when a data deletion request is submitted */
  onRequestDeletion?: () => void;

  /** Callback when data export is requested */
  onExportData?: () => void;

  /** Callback when a new data request is created (generic) */
  onCreateDataRequest?: (type: DataRequestType) => void;

  /** Callback when settings are updated */
  onUpdateSettings?: (settings: Partial<PrivacySettings>) => void;

  /** Callback when privacy audit is requested */
  onRunAudit?: () => void;

  /** Callback when privacy report download is requested */
  onDownloadReport?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: CSSProperties;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const PL_PRIVACY_MANAGER_DEFAULTS = {
  preset: 'panel' as PlPrivacyManagerPreset,
  emptyText: 'No privacy data available',
  consents: [] as ConsentRecord[],
  dataRequests: [] as DataRequest[],
} as const;
