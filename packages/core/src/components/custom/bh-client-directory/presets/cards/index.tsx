'use client';

/**
 * BhClientDirectory - Cards Preset
 * Card grid layout with expandable client cards
 */

import { useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhClientDirectoryProps,
  ClientItem,
  ClientFilter,
  ClientContact,
  ClientType,
  ClientStatus,
  ClientTier,
  ApprovalStatus,
  ViewMode,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  Plus,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Edit3,
  Users,
  TrendingUp,
  Star,
  Shield,
  Eye,
  MapPin,
  MoreHorizontal,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<ClientStatus, { label: string; colorKey: 'success' | 'error' | 'warning' | 'info' }> = {
  active: { label: 'Active', colorKey: 'success' },
  inactive: { label: 'Inactive', colorKey: 'error' },
  pending_approval: { label: 'Pending', colorKey: 'warning' },
  suspended: { label: 'Suspended', colorKey: 'error' },
};

const TIER_MAP: Record<ClientTier, { label: string; colorKey: 'primary' | 'warning' | 'secondary' }> = {
  standard: { label: 'Standard', colorKey: 'primary' },
  premium: { label: 'Premium', colorKey: 'warning' },
  enterprise: { label: 'Enterprise', colorKey: 'secondary' },
};

const APPROVAL_MAP: Record<ApprovalStatus, { label: string; colorKey: 'warning' | 'info' | 'success' | 'error'; icon: typeof Clock }> = {
  pending: { label: 'Pending', colorKey: 'warning', icon: Clock },
  reviewed: { label: 'Reviewed', colorKey: 'info', icon: Eye },
  approved: { label: 'Approved', colorKey: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', colorKey: 'error', icon: XCircle },
};

function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatFee(feeStructure: ClientItem['feeStructure']): string {
  if (!feeStructure) return 'N/A';
  const currency = feeStructure.currency ?? 'USD';
  switch (feeStructure.type) {
    case 'percentage':
      return `${feeStructure.value}%`;
    case 'fixed':
      return `${currency} ${feeStructure.value.toLocaleString()}`;
    case 'retainer':
      return `${currency} ${feeStructure.value.toLocaleString()}/mo`;
    default:
      return 'N/A';
  }
}

function filterClients(clients: ClientItem[], filters: ClientFilter): ClientItem[] {
  return clients.filter((client) => {
    if (filters.type && filters.type !== 'all' && client.type !== filters.type) return false;
    if (filters.status && filters.status !== 'all' && client.status !== filters.status) return false;
    if (filters.tier && filters.tier !== 'all' && client.tier !== filters.tier) return false;
    if (filters.industry && client.industry.toLowerCase().indexOf(filters.industry.toLowerCase()) === -1) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = client.name.toLowerCase().indexOf(q) !== -1;
      const industryMatch = client.industry.toLowerCase().indexOf(q) !== -1;
      const contactMatch = client.contacts.some(
        (c) => c.name.toLowerCase().indexOf(q) !== -1 || c.email.toLowerCase().indexOf(q) !== -1,
      );
      if (!nameMatch && !industryMatch && !contactMatch) return false;
    }
    return true;
  });
}

function getStatusDotColor(tokens: DesignTokens, status: ClientStatus): string {
  const mapping: Record<ClientStatus, string> = {
    active: tokens.colors.successScale[500],
    inactive: tokens.colors.neutral[400],
    pending_approval: tokens.colors.warningScale[500],
    suspended: tokens.colors.errorScale[500],
  };
  return mapping[status];
}

function getScaleForColor(tokens: DesignTokens, colorKey: string) {
  const map: Record<string, any> = {
    primary: tokens.colors.primaryScale,
    secondary: tokens.colors.secondaryScale,
    success: tokens.colors.successScale,
    warning: tokens.colors.warningScale,
    error: tokens.colors.errorScale,
    info: tokens.colors.infoScale,
  };
  return map[colorKey] ?? tokens.colors.neutral;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CardsBhClientDirectory = createPreset<BhClientDirectoryProps>(
  'CardsBhClientDirectory',
  ({ primitives, props, tokens, engine }: PresetContext<BhClientDirectoryProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const {
      clients = [],
      filters: filtersProp,
      onFilterChange,
      onClientSelect,
      selectedClient: selectedClientProp,
      onAddClient,
      onEditClient,
      viewMode: viewModeProp,
      onViewModeChange,
      className,
      style,
    } = props;

    /* -- local state ------------------------------------------------ */
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [internalViewMode, setInternalViewMode] = useState<ViewMode>(viewModeProp ?? 'grid');
    const [internalFilters, setInternalFilters] = useState<ClientFilter>(
      filtersProp ?? { type: 'all', status: 'all', tier: 'all', industry: '', search: '' },
    );
    const [showAddForm, setShowAddForm] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const viewMode = viewModeProp ?? internalViewMode;
    const filters = filtersProp ?? internalFilters;

    /* -- handlers --------------------------------------------------- */
    const updateFilter = useCallback(
      (patch: Partial<ClientFilter>) => {
        const next = { ...filters, ...patch };
        setInternalFilters(next);
        onFilterChange?.(next);
      },
      [filters, onFilterChange],
    );

    const toggleExpand = useCallback(
      (id: string) => {
        const next = expandedCard === id ? null : id;
        setExpandedCard(next);
        onClientSelect?.(id);
      },
      [expandedCard, onClientSelect],
    );

    /* -- derived ----------------------------------------------------- */
    const filteredClients = filterClients(clients, filters);

    /* -- glassmorphism ----------------------------------------------- */
    const glassStyle = isModern && tokens.glass
      ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
        }
      : {};

    /* ================================================================ */
    /*  STYLES                                                          */
    /* ================================================================ */

    const rootStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: 'inherit',
      color: tokens.colors.neutral[900],
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      ...glassStyle,
    };

    const filterRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      flexWrap: 'wrap',
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: tokens.spacing[4],
      padding: tokens.spacing[5],
      overflowY: 'auto',
      flex: 1,
    };

    const searchWrapStyle: React.CSSProperties = {
      position: 'relative',
      flex: 1,
      minWidth: '220px',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
      transition: `all ${tokens.motion.hover}`,
    };

    const pillStyle = (active: boolean): React.CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      backgroundColor: active ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100],
      color: active ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${active ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
    });

    const selectStyle: React.CSSProperties = {
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      outline: 'none',
    };

    const addBtnStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      backgroundColor: tokens.colors.primaryScale[600],
      color: tokens.colors.common.white,
      border: 'none',
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    };

    const badgeSmallStyle = (colorKey: string): React.CSSProperties => {
      const scale = getScaleForColor(tokens, colorKey);
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: `0px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: scale[100],
        color: scale[700],
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale[200]}`,
        lineHeight: '1.6',
      };
    };

    const cardBaseStyle = (id: string): React.CSSProperties => {
      const isHovered = hoveredCard === id;
      const isExpanded = expandedCard === id;
      const baseCard = useMemo(() => createCardStyle(tokens, {
        elevation: isHovered ? 'md' : 'sm',
        glass: isModern,
        interactive: true,
      }), [tokens, isModern]);

      return {
        ...baseCard,
        padding: 0,
        overflow: 'hidden',
        borderRadius: tokens.borderRadius.lg,
        transform: isHovered ? tokens.motion.transform : 'none',
        border: isExpanded
          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      };
    };

    const cardHeaderStyle = (type: ClientType): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: tokens.spacing[4],
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    });

    const avatarStyle = (type: ClientType): React.CSSProperties => ({
      width: tokens.spacing[11],
      height: tokens.spacing[11],
      borderRadius: type === 'company' ? tokens.borderRadius.md : tokens.borderRadius.full,
      backgroundColor: type === 'company' ? tokens.colors.primaryScale[100] : tokens.colors.secondaryScale[100],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: type === 'company' ? tokens.colors.primaryScale[600] : tokens.colors.secondaryScale[600],
      flexShrink: 0,
    });

    const statusDotStyle = (status: ClientStatus): React.CSSProperties => ({
      width: tokens.spacing[2],
      height: tokens.spacing[2],
      borderRadius: tokens.borderRadius.full,
      backgroundColor: getStatusDotColor(tokens, status),
      flexShrink: 0,
    });

    const cardStatsRowStyle: React.CSSProperties = {
      display: 'flex',
      gap: tokens.spacing[4],
      padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
    };

    const cardStatStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
    };

    const cardStatValue: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.primaryScale[700],
    };

    const cardStatLabel: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
    };

    const cardFooterStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.neutral[50],
    };

    const expandedSectionStyle: React.CSSProperties = {
      padding: tokens.spacing[4],
      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50],
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[800],
      marginBottom: tokens.spacing[2],
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const contactRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      marginBottom: tokens.spacing[2],
    };

    const metricMiniStyle: React.CSSProperties = {
      display: 'flex',
      gap: tokens.spacing[2],
      marginTop: tokens.spacing[2],
    };

    const metricMiniBox: React.CSSProperties = {
      flex: 1,
      padding: tokens.spacing[2],
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      textAlign: 'center',
    };

    /* -- slide-in add form ------------------------------------------ */
    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: tokens.overlay?.light,
      zIndex: 999,
      display: showAddForm ? 'block' : 'none',
    };

    const slideFormStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      backgroundColor: tokens.colors.common.white,
      boxShadow: tokens.shadows.xl,
      zIndex: 1000,
      overflowY: 'auto',
      padding: tokens.spacing[5],
      transform: showAddForm ? 'translateX(0)' : 'translateX(100%)',
      transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
      ...glassStyle,
    };

    const formLabelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[600],
      marginBottom: tokens.spacing[1],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
    };

    const formInputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
      boxSizing: 'border-box' as const,
    };

    /* ================================================================ */
    /*  RENDER CARD                                                     */
    /* ================================================================ */

    const renderCard = (client: ClientItem) => {
      const isExpanded = expandedCard === client.id;
      const statusInfo = STATUS_MAP[client.status];
      const tierInfo = TIER_MAP[client.tier];
      const approvalInfo = APPROVAL_MAP[client.approvalStatus];
      const ApprovalIcon = approvalInfo.icon;

      return (
        <div
          key={client.id}
          style={cardBaseStyle(client.id)}
          onMouseEnter={() => setHoveredCard(client.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Card header */}
          <div style={cardHeaderStyle(client.type)} onClick={() => toggleExpand(client.id)}>
            <div style={avatarStyle(client.type)}>
              {client.type === 'company' ? <Building2 size={20} /> : <User size={20} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[1],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {client.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                <span style={badgeSmallStyle(tierInfo.colorKey)}>
                  <Star size={9} /> {tierInfo.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  <div style={statusDotStyle(client.status)} />
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <div style={{ color: tokens.colors.neutral[400] }}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {/* Stats row */}
          <div style={cardStatsRowStyle}>
            <div style={cardStatStyle}>
              <div style={cardStatValue}>{client.positionsCount}</div>
              <div style={cardStatLabel}>Positions</div>
            </div>
            <div style={cardStatStyle}>
              <div style={{ ...cardStatValue, color: tokens.colors.successScale[600] }}>{formatRevenue(client.revenue)}</div>
              <div style={cardStatLabel}>Revenue</div>
            </div>
            <div style={cardStatStyle}>
              <div style={{ ...cardStatValue, color: tokens.colors.infoScale[600] }}>{client.contacts.length}</div>
              <div style={cardStatLabel}>Contacts</div>
            </div>
          </div>

          {/* Footer with badges */}
          <div style={cardFooterStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={badgeSmallStyle(approvalInfo.colorKey)}>
                <ApprovalIcon size={10} /> {approvalInfo.label}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                {client.industry}
              </span>
            </div>
            {client.feeStructure && (
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
              }}>
                {formatFee(client.feeStructure)}
              </span>
            )}
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div style={expandedSectionStyle}>
              {/* Contacts */}
              <div style={{ marginBottom: tokens.spacing[4] }}>
                <div style={sectionTitleStyle}>
                  <Users size={14} color={tokens.colors.primaryScale[500]} />
                  Contacts
                </div>
                {client.contacts.map((contact, idx) => (
                  <div key={idx} style={contactRowStyle}>
                    <div style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.secondaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.secondaryScale[600],
                      flexShrink: 0,
                    }}>
                      <User size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {contact.name}
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}>
                        {contact.role}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                      <Mail
                        size={14}
                        style={{
                          color: tokens.colors.primaryScale[500],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      />
                      <Phone
                        size={14}
                        style={{
                          color: tokens.colors.primaryScale[500],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {client.contacts.length === 0 && (
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[400],
                    textAlign: 'center',
                    padding: tokens.spacing[3],
                  }}>
                    No contacts
                  </div>
                )}
              </div>

              {/* Contract Info */}
              {client.contractInfo && (
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <div style={sectionTitleStyle}>
                    <FileText size={14} color={tokens.colors.primaryScale[500]} />
                    Contract
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Terms</div>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                        {client.contractInfo.terms}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Fee</div>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                        {formatFee(client.feeStructure)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Start</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                        <Calendar size={11} /> {client.contractInfo.startDate}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>End</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                        <Calendar size={11} /> {client.contractInfo.endDate}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Status */}
              <div style={{ marginBottom: tokens.spacing[4] }}>
                <div style={sectionTitleStyle}>
                  <Shield size={14} color={tokens.colors.primaryScale[500]} />
                  Approval
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  {(['pending', 'reviewed', 'approved'] as ApprovalStatus[]).map((step, idx) => {
                    const stepIndex = ['pending', 'reviewed', 'approved'].indexOf(step);
                    const currentIndex = ['pending', 'reviewed', 'approved'].indexOf(
                      client.approvalStatus === 'rejected' ? 'reviewed' : client.approvalStatus,
                    );
                    const isCompleted = stepIndex <= currentIndex;
                    const isRejected = client.approvalStatus === 'rejected' && step === 'approved';
                    const StepIcon = isRejected ? XCircle : APPROVAL_MAP[step].icon;
                    const displayLabel = isRejected ? 'Rejected' : APPROVAL_MAP[step].label;

                    let dotColor = tokens.colors.neutral[300];
                    let textColor = tokens.colors.neutral[500];
                    if (isRejected) {
                      dotColor = tokens.colors.errorScale[500];
                      textColor = tokens.colors.errorScale[600];
                    } else if (isCompleted) {
                      dotColor = tokens.colors.successScale[500];
                      textColor = tokens.colors.successScale[700];
                    }

                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? 1 : undefined, gap: tokens.spacing[1] }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}>
                          <div style={{
                            width: tokens.spacing[6],
                            height: tokens.spacing[6],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: isRejected
                              ? tokens.colors.errorScale[100]
                              : isCompleted
                                ? tokens.colors.successScale[100]
                                : tokens.colors.neutral[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isRejected
                              ? tokens.colors.errorScale[600]
                              : isCompleted
                                ? tokens.colors.successScale[600]
                                : tokens.colors.neutral[400],
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${dotColor}`,
                          }}>
                            <StepIcon size={10} />
                          </div>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: textColor, fontWeight: tokens.typography.fontWeight.medium }}>
                            {displayLabel}
                          </span>
                        </div>
                        {idx < 2 && (
                          <div style={{
                            flex: 1,
                            height: '2px',
                            backgroundColor: isCompleted && stepIndex < currentIndex
                              ? tokens.colors.successScale[400]
                              : tokens.colors.neutral[200],
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue metrics */}
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <div style={sectionTitleStyle}>
                  <TrendingUp size={14} color={tokens.colors.primaryScale[500]} />
                  Metrics
                </div>
                <div style={metricMiniStyle}>
                  <div style={metricMiniBox}>
                    <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                      {client.positionsCount}
                    </div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Positions</div>
                  </div>
                  <div style={metricMiniBox}>
                    <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>
                      {formatRevenue(client.revenue)}
                    </div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Revenue</div>
                  </div>
                  <div style={metricMiniBox}>
                    <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[600] }}>
                      {client.positionsCount > 0 ? formatRevenue(Math.round(client.revenue / client.positionsCount)) : '$0'}
                    </div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Avg/Pos</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                gap: tokens.spacing[2],
                justifyContent: 'flex-end',
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: tokens.colors.neutral[100],
                    color: tokens.colors.neutral[700],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onClick={() => onEditClient?.(client.id, {})}
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    border: 'none',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onClick={() => onClientSelect?.(client.id)}
                >
                  <Briefcase size={12} /> View Details
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */

    return (
      <div style={rootStyle} className={className}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Building2 size={20} color={tokens.colors.primaryScale[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              Client Directory
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {filteredClients.length} clients
            </span>
          </div>
          <button style={addBtnStyle} onClick={() => setShowAddForm(true)}>
            <Plus size={14} /> Add Client
          </button>
        </div>

        {/* Filter row */}
        <div style={filterRowStyle}>
          <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            <span
              style={pillStyle(!filters.type || filters.type === 'all')}
              onClick={() => updateFilter({ type: 'all' })}
            >
              <Users size={12} /> All
            </span>
            <span
              style={pillStyle(filters.type === 'company')}
              onClick={() => updateFilter({ type: 'company' })}
            >
              <Building2 size={12} /> Companies
            </span>
            <span
              style={pillStyle(filters.type === 'individual')}
              onClick={() => updateFilter({ type: 'individual' })}
            >
              <User size={12} /> Individuals
            </span>
          </div>

          <select
            style={selectStyle}
            value={filters.status ?? 'all'}
            onChange={(e) => updateFilter({ status: e.target.value as ClientStatus | 'all' })}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_approval">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            style={selectStyle}
            value={filters.tier ?? 'all'}
            onChange={(e) => updateFilter({ tier: e.target.value as ClientTier | 'all' })}
          >
            <option value="all">All Tiers</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <div style={searchWrapStyle}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: tokens.colors.neutral[400],
              }}
            />
            <input
              style={inputStyle}
              placeholder="Search clients..."
              value={filters.search ?? ''}
              onChange={(e) => updateFilter({ search: e.target.value })}
            />
            {filters.search && (
              <X
                size={14}
                style={{
                  position: 'absolute',
                  right: tokens.spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: tokens.colors.neutral[400],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => updateFilter({ search: '' })}
              />
            )}
          </div>
        </div>

        {/* Card grid */}
        <div style={gridStyle}>
          {filteredClients.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[10],
              color: tokens.colors.neutral[400],
            }}>
              <Search size={36} style={{ marginBottom: tokens.spacing[3], opacity: 0.5 }} />
              <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium }}>
                No clients found
              </span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, marginTop: tokens.spacing[1] }}>
                Try adjusting your search or filters
              </span>
            </div>
          )}
          {filteredClients.map(renderCard)}
        </div>

        {/* Slide-in add form */}
        <div style={overlayStyle} onClick={() => setShowAddForm(false)} />
        <div style={slideFormStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[5],
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              Add New Client
            </span>
            <X
              size={20}
              style={{ cursor: 'pointer', color: tokens.colors.neutral[500] }}
              onClick={() => setShowAddForm(false)}
            />
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Client Type</label>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <span style={pillStyle(true)}>
                <Building2 size={12} /> Company
              </span>
              <span style={pillStyle(false)}>
                <User size={12} /> Individual
              </span>
            </div>
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Client Name</label>
            <input style={formInputStyle} placeholder="Enter client name" />
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Industry</label>
            <input style={formInputStyle} placeholder="e.g. Technology, Healthcare" />
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Client Tier</label>
            <select style={{ ...formInputStyle, cursor: 'pointer' }}>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Fee Type</label>
            <select style={{ ...formInputStyle, cursor: 'pointer' }}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={formLabelStyle}>Fee Value</label>
            <input style={formInputStyle} type="number" placeholder="e.g. 20" />
          </div>

          {/* Contact */}
          <div style={{
            padding: tokens.spacing[3],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.neutral[50],
            marginBottom: tokens.spacing[4],
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[3],
            }}>
              Primary Contact
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[2] }}>
              <div>
                <label style={formLabelStyle}>Name</label>
                <input style={formInputStyle} placeholder="Contact name" />
              </div>
              <div>
                <label style={formLabelStyle}>Role</label>
                <input style={formInputStyle} placeholder="e.g. HR Director" />
              </div>
              <div>
                <label style={formLabelStyle}>Email</label>
                <input style={formInputStyle} type="email" placeholder="email@company.com" />
              </div>
              <div>
                <label style={formLabelStyle}>Phone</label>
                <input style={formInputStyle} type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: tokens.spacing[3],
            paddingTop: tokens.spacing[3],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <button
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onClick={() => {
                onAddClient?.({});
                setShowAddForm(false);
              }}
            >
              Create Client
            </button>
          </div>
        </div>
      </div>
    );
  },
);
