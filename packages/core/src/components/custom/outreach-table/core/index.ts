/**
 * OutreachTable - Core Interface
 * Pin/CRM-style outreach contact list with status badges,
 * sidebar filters with counts, and progress steps.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type OutreachTablePreset = 'standard' | 'pipeline';

export type ContactStatus =
  | 'reaching-out'
  | 'missing-email'
  | 'replied'
  | 'interested'
  | 'scheduled'
  | 'no-response'
  | 'bounced'
  | 'opted-out';

export interface Contact {
  id: string;
  name: string;
  company?: string;
  avatar?: string;
  initials?: string;
  initialsColor?: string;
  status: ContactStatus;
  step?: { current: number; total: number };
  nextStep?: string;
  dateAdded?: string;
  lastContactDate?: string;
  email?: string;
  title?: string;
  linkedIn?: string;
}

export interface OutreachFilterItem {
  key: string;
  label: string;
  count: number;
  active?: boolean;
  icon?: ReactNode;
}

export interface OutreachStat {
  key: string;
  label: string;
  value: number | string;
  percentage?: string;
  icon?: ReactNode;
  color?: string;
}

export interface OutreachTableProps extends EngineAwareProps {
  preset?: OutreachTablePreset;
  contacts: Contact[];
  filters?: OutreachFilterItem[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  stats?: OutreachStat[];
  summaryStats?: OutreachStat[];
  title?: string;
  subtitle?: string;
  onContactClick?: (contact: Contact) => void;
  onAddCandidates?: () => void;
  onPauseOutreach?: () => void;
  onEditOutreach?: () => void;
  onExport?: () => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  columns?: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: number | string;
  }>;
  navItems?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    badge?: number | string;
    section?: string;
  }>;
  activeNavKey?: string;
  onNavSelect?: (key: string) => void;
  errorCount?: number;
  loading?: boolean;
  emptyText?: ReactNode;
  /** Enable inline contact editing (double-click name/email/title) */
  editable?: boolean;
  /** Contact field edit handler */
  onContactEdit?: (contactId: string, field: string, value: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const OUTREACH_TABLE_DEFAULTS: Partial<OutreachTableProps> = {
  preset: 'standard',
  title: 'Outreach',
  searchable: true,
  selectable: true,
  emptyText: 'No contacts',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface OutreachStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
}

export function getOutreachStatusConfig(tokens: DesignTokens): Record<ContactStatus, OutreachStatusConfig> {
  return {
    'reaching-out': { label: 'Reaching Out', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[50], borderColor: tokens.colors.neutral[300], headerBg: tokens.colors.neutral[100] },
    'missing-email': { label: 'Missing Email', color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200], headerBg: tokens.colors.errorScale[100] },
    'replied': { label: 'Replied', color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200], headerBg: tokens.colors.successScale[100] },
    'interested': { label: 'Interested', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200], headerBg: tokens.colors.successScale[100] },
    'scheduled': { label: 'Scheduled', color: tokens.colors.infoScale[600], bgColor: tokens.colors.infoScale[50], borderColor: tokens.colors.infoScale[200], headerBg: tokens.colors.infoScale[100] },
    'no-response': { label: 'No Response', color: tokens.colors.warningScale[600], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200], headerBg: tokens.colors.warningScale[100] },
    'bounced': { label: 'Bounced', color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200], headerBg: tokens.colors.errorScale[100] },
    'opted-out': { label: 'Opted Out', color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[50], borderColor: tokens.colors.neutral[300], headerBg: tokens.colors.neutral[100] },
  };
}

export function getInitialsColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[100],
    tokens.colors.secondaryScale[100],
    tokens.colors.successScale[100],
    tokens.colors.warningScale[100],
    tokens.colors.errorScale[100],
    tokens.colors.infoScale[100],
    tokens.colors.primaryScale[200],
    tokens.colors.secondaryScale[200],
    tokens.colors.successScale[200],
    tokens.colors.warningScale[200],
  ];
}

export function getInitialsColor(name: string, colors: string[]): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
