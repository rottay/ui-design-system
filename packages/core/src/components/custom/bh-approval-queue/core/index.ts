/**
 * BhApprovalQueue - Core Interface
 * Pending Approvals Queue for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhApprovalQueuePreset = 'standard';

/* -- Categories ------------------------------------------------------- */

export type ApprovalCategory = 'clients' | 'positions' | 'offers' | 'other';

/* -- Approval Item ---------------------------------------------------- */

export interface ApprovalItem {
  id: string;
  type: ApprovalCategory;
  entityName: string;
  requesterName: string;
  requesterAvatar?: string;
  submittedDate: string;
  urgency: 'low' | 'medium' | 'high';
  summary: string;
  approvalChainProgress: number;
}

/* -- Approval Detail -------------------------------------------------- */

export interface ApprovalDetail {
  context: string;
  requesterNotes: string;
  relatedData: { label: string; value: string }[];
  chainSteps: {
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    name?: string;
  }[];
}

/* -- Stats ------------------------------------------------------------ */

export interface ApprovalStats {
  pending: Record<ApprovalCategory, number>;
  oldestPendingDays: number;
  avgApprovalTime: number;
}

/* -- History ---------------------------------------------------------- */

export interface ApprovalHistory {
  id: string;
  entityName: string;
  type: ApprovalCategory;
  outcome: 'approved' | 'rejected';
  decidedBy: string;
  decidedAt: string;
  timing: number;
}

/* -- Main Props ------------------------------------------------------- */

export interface BhApprovalQueueProps extends EngineAwareProps {
  preset?: BhApprovalQueuePreset;

  /* data */
  stats?: ApprovalStats;
  items?: ApprovalItem[];
  detail?: ApprovalDetail;
  history?: ApprovalHistory[];

  /* state & callbacks */
  activeCategory?: ApprovalCategory;
  onCategoryChange?: (category: ApprovalCategory) => void;
  selectedApproval?: string | null;
  onApprovalSelect?: (id: string | null) => void;
  onApprove?: (id: string, notes?: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDelegate?: (id: string, delegateTo: string) => void;
  approvalNotes?: string;
  onNotesChange?: (notes: string) => void;
  rejectReason?: string;
  onRejectReasonChange?: (reason: string) => void;
  showHistory?: boolean;
  onHistoryToggle?: () => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_APPROVAL_QUEUE_DEFAULTS: Partial<BhApprovalQueueProps> = {
  preset: 'standard',
  items: [],
  history: [],
  showHistory: false,
  approvalNotes: '',
  rejectReason: '',
};

/* -- Helpers ---------------------------------------------------------- */

export function getUrgencyColors(tokens: DesignTokens) {
  return {
    low: {
      color: tokens.colors.infoScale[700],
      bg: tokens.colors.infoScale[50],
      dot: tokens.colors.infoScale[400],
      border: tokens.colors.infoScale[200],
    },
    medium: {
      color: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[50],
      dot: tokens.colors.warningScale[400],
      border: tokens.colors.warningScale[200],
    },
    high: {
      color: tokens.colors.errorScale[700],
      bg: tokens.colors.errorScale[50],
      dot: tokens.colors.errorScale[400],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getCategoryColors(tokens: DesignTokens) {
  return {
    clients: {
      color: tokens.colors.primaryScale[700],
      bg: tokens.colors.primaryScale[50],
      border: tokens.colors.primaryScale[200],
    },
    positions: {
      color: tokens.colors.secondaryScale[700],
      bg: tokens.colors.secondaryScale[50],
      border: tokens.colors.secondaryScale[200],
    },
    offers: {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
    },
    other: {
      color: tokens.colors.neutral[700],
      bg: tokens.colors.neutral[50],
      border: tokens.colors.neutral[200],
    },
  };
}

export function getOutcomeColors(tokens: DesignTokens) {
  return {
    approved: {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[100],
      border: tokens.colors.successScale[200],
    },
    rejected: {
      color: tokens.colors.errorScale[700],
      bg: tokens.colors.errorScale[100],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getChainStepColors(tokens: DesignTokens) {
  return {
    pending: {
      color: tokens.colors.neutral[500],
      bg: tokens.colors.neutral[100],
      border: tokens.colors.neutral[300],
    },
    approved: {
      color: tokens.colors.successScale[600],
      bg: tokens.colors.successScale[100],
      border: tokens.colors.successScale[400],
    },
    rejected: {
      color: tokens.colors.errorScale[600],
      bg: tokens.colors.errorScale[100],
      border: tokens.colors.errorScale[400],
    },
  };
}

export function formatDaysAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export const CATEGORY_LABELS: Record<ApprovalCategory, string> = {
  clients: 'Clients',
  positions: 'Positions',
  offers: 'Offers',
  other: 'Other',
};
