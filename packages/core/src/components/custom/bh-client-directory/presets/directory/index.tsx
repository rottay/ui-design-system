'use client';

/**
 * BhClientDirectory - Directory Preset
 * Split panel layout with filter bar, client list, and detail panel
 */

import { useState, useCallback } from 'react';
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
  LayoutList,
  LayoutGrid,
  Filter,
  Users,
  TrendingUp,
  Hash,
  Star,
  Shield,
  Eye,
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

const APPROVAL_STEPS: ApprovalStatus[] = ['pending', 'reviewed', 'approved'];

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

export const DirectoryBhClientDirectory = createPreset<BhClientDirectoryProps>(
  'DirectoryBhClientDirectory',
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
    const [internalSelected, setInternalSelected] = useState<string | null>(selectedClientProp ?? null);
    const [internalViewMode, setInternalViewMode] = useState<ViewMode>(viewModeProp ?? 'list');
    const [internalFilters, setInternalFilters] = useState<ClientFilter>(
      filtersProp ?? { type: 'all', status: 'all', tier: 'all', industry: '', search: '' },
    );
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

    const selectedId = selectedClientProp ?? internalSelected;
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

    const selectClient = useCallback(
      (id: string) => {
        setInternalSelected(id);
        onClientSelect?.(id);
      },
      [onClientSelect],
    );

    const changeViewMode = useCallback(
      (mode: ViewMode) => {
        setInternalViewMode(mode);
        onViewModeChange?.(mode);
      },
      [onViewModeChange],
    );

    const openAddForm = useCallback(() => {
      setFormMode('add');
      setShowForm(true);
    }, []);

    const openEditForm = useCallback(() => {
      setFormMode('edit');
      setShowForm(true);
    }, []);

    const closeForm = useCallback(() => {
      setShowForm(false);
    }, []);

    /* -- derived ----------------------------------------------------- */
    const filteredClients = filterClients(clients, filters);
    const selectedClientData = clients.find((c) => c.id === selectedId) ?? null;

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

    const headerBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      ...glassStyle,
    };

    const filterBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      flexWrap: 'wrap',
      ...glassStyle,
    };

    const splitStyle: React.CSSProperties = {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    };

    const listPanelStyle: React.CSSProperties = {
      width: selectedClientData ? '380px' : '100%',
      minWidth: selectedClientData ? '380px' : undefined,
      borderRight: selectedClientData
        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`
        : 'none',
      overflowY: 'auto',
      backgroundColor: tokens.colors.common.white,
    };

    const detailPanelStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing[5],
    };

    const searchInputStyle: React.CSSProperties = {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
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

    const clientRowStyle = (isSelected: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
    });

    const avatarStyle = (type: ClientType): React.CSSProperties => ({
      width: tokens.spacing[10],
      height: tokens.spacing[10],
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

    const sectionCardStyle: React.CSSProperties = {
      ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
      marginBottom: tokens.spacing[4],
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[800],
      marginBottom: tokens.spacing[3],
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const contactCardStyle: React.CSSProperties = {
      padding: tokens.spacing[3],
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50],
      marginBottom: tokens.spacing[2],
    };

    const addButtonStyle: React.CSSProperties = {
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

    const viewToggleStyle = (active: boolean): React.CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: tokens.spacing[1],
      borderRadius: tokens.borderRadius.sm,
      cursor: 'pointer',
      backgroundColor: active ? tokens.colors.primaryScale[100] : 'transparent',
      color: active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
      transition: `all ${tokens.motion.hover}`,
      border: 'none',
    });

    /* -- slide-in form ---------------------------------------------- */
    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: tokens.overlay?.light,
      zIndex: 999,
      display: showForm ? 'block' : 'none',
    };

    const slideFormStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      backgroundColor: tokens.colors.common.white,
      boxShadow: tokens.shadows.xl,
      zIndex: 1000,
      overflowY: 'auto',
      padding: tokens.spacing[5],
      transform: showForm ? 'translateX(0)' : 'translateX(100%)',
      transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
      ...glassStyle,
    };

    const formFieldStyle: React.CSSProperties = {
      marginBottom: tokens.spacing[4],
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

    const cancelBtnStyle: React.CSSProperties = {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: tokens.colors.neutral[100],
      color: tokens.colors.neutral[700],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    };

    const submitBtnStyle: React.CSSProperties = {
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

    /* -- approval tracker styles ------------------------------------ */
    const approvalTrackerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      marginTop: tokens.spacing[2],
    };

    const approvalStepCircle = (step: ApprovalStatus, currentStatus: ApprovalStatus): React.CSSProperties => {
      const stepIndex = APPROVAL_STEPS.indexOf(step);
      const currentIndex = APPROVAL_STEPS.indexOf(currentStatus === 'rejected' ? 'reviewed' : currentStatus);
      const isCompleted = stepIndex <= currentIndex;
      const isRejected = currentStatus === 'rejected' && step === 'approved';

      let bgColor = tokens.colors.neutral[200];
      let borderColor = tokens.colors.neutral[300];
      let textColor = tokens.colors.neutral[500];

      if (isRejected) {
        bgColor = tokens.colors.errorScale[100];
        borderColor = tokens.colors.errorScale[400];
        textColor = tokens.colors.errorScale[600];
      } else if (isCompleted) {
        bgColor = tokens.colors.successScale[100];
        borderColor = tokens.colors.successScale[400];
        textColor = tokens.colors.successScale[600];
      }

      return {
        width: tokens.spacing[8],
        height: tokens.spacing[8],
        borderRadius: tokens.borderRadius.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${borderColor}`,
        color: textColor,
        flexShrink: 0,
      };
    };

    const approvalLineStyle = (step: ApprovalStatus, currentStatus: ApprovalStatus): React.CSSProperties => {
      const stepIndex = APPROVAL_STEPS.indexOf(step);
      const currentIndex = APPROVAL_STEPS.indexOf(currentStatus === 'rejected' ? 'reviewed' : currentStatus);
      const isCompleted = stepIndex < currentIndex;

      return {
        flex: 1,
        height: '2px',
        backgroundColor: isCompleted ? tokens.colors.successScale[400] : tokens.colors.neutral[200],
        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
      };
    };

    /* -- metrics style ---------------------------------------------- */
    const metricBoxStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: tokens.spacing[3],
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.neutral[50],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      flex: 1,
    };

    const metricValueStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xl,
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.primaryScale[700],
    };

    const metricLabelStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
      marginTop: tokens.spacing[1],
    };

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */

    const renderFilterBar = () => (
      <div style={filterBarStyle}>
        {/* Type pills */}
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

        {/* Status dropdown */}
        <select
          style={selectStyle}
          value={filters.status ?? 'all'}
          onChange={(e) => updateFilter({ status: e.target.value as ClientStatus | 'all' })}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="suspended">Suspended</option>
        </select>

        {/* Tier badges */}
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

        {/* Industry selector */}
        <input
          style={{
            ...formInputStyle,
            width: '140px',
            fontSize: tokens.typography.fontSize.xs,
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          }}
          placeholder="Industry..."
          value={filters.industry ?? ''}
          onChange={(e) => updateFilter({ industry: e.target.value })}
        />

        {/* Search input */}
        <div style={searchInputStyle}>
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
    );

    const renderClientRow = (client: ClientItem) => {
      const isSelected = client.id === selectedId;
      return (
        <div
          key={client.id}
          style={clientRowStyle(isSelected)}
          onClick={() => selectClient(client.id)}
        >
          <div style={avatarStyle(client.type)}>
            {client.type === 'company' ? <Building2 size={18} /> : <User size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {client.name}
              </span>
              <span style={badgeSmallStyle(TIER_MAP[client.tier].colorKey)}>
                {TIER_MAP[client.tier].label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <div style={statusDotStyle(client.status)} />
                {STATUS_MAP[client.status].label}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Briefcase size={11} /> {client.positionsCount} positions
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <DollarSign size={11} /> {formatRevenue(client.revenue)}
              </span>
            </div>
          </div>
        </div>
      );
    };

    const renderDetailPanel = () => {
      if (!selectedClientData) return null;
      const client = selectedClientData;
      const statusInfo = STATUS_MAP[client.status];
      const tierInfo = TIER_MAP[client.tier];
      const approvalInfo = APPROVAL_MAP[client.approvalStatus];
      const ApprovalIcon = approvalInfo.icon;

      return (
        <div style={detailPanelStyle}>
          {/* Header */}
          <div style={{ ...sectionCardStyle, padding: tokens.spacing[5] }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <div style={{
                  ...avatarStyle(client.type),
                  width: tokens.spacing[12],
                  height: tokens.spacing[12],
                }}>
                  {client.type === 'company' ? <Building2 size={24} /> : <User size={24} />}
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                  }}>
                    {client.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                    <span style={badgeSmallStyle(tierInfo.colorKey)}>
                      <Star size={10} /> {tierInfo.label}
                    </span>
                    <span style={badgeSmallStyle(statusInfo.colorKey)}>
                      {statusInfo.label}
                    </span>
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
                </div>
              </div>
              <button
                style={{
                  ...addButtonStyle,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                }}
                onClick={openEditForm}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          </div>

          {/* Contacts Section */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Users size={16} color={tokens.colors.primaryScale[500]} />
              Contacts ({client.contacts.length})
            </div>
            {client.contacts.map((contact, idx) => (
              <div key={idx} style={contactCardStyle}>
                <div style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}>
                  {contact.name}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[1],
                }}>
                  {contact.role}
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[4], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Mail size={11} /> {contact.email}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Phone size={11} /> {contact.phone}
                  </span>
                </div>
              </div>
            ))}
            {client.contacts.length === 0 && (
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], padding: tokens.spacing[3], textAlign: 'center' }}>
                No contacts added yet
              </div>
            )}
          </div>

          {/* Contract Info */}
          {client.contractInfo && (
            <div style={sectionCardStyle}>
              <div style={sectionTitleStyle}>
                <FileText size={16} color={tokens.colors.primaryScale[500]} />
                Contract Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    Terms
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                    {client.contractInfo.terms}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    Fee Structure
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                    {formatFee(client.feeStructure)}
                    {client.feeStructure && (
                      <span style={badgeSmallStyle('info')}>
                        {client.feeStructure.type}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    Start Date
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                    <Calendar size={12} /> {client.contractInfo.startDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    End Date
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                    <Calendar size={12} /> {client.contractInfo.endDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval Status Tracker */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Shield size={16} color={tokens.colors.primaryScale[500]} />
              Approval Workflow
            </div>
            <div style={approvalTrackerStyle}>
              {APPROVAL_STEPS.map((step, idx) => {
                const isRejected = client.approvalStatus === 'rejected' && step === 'approved';
                const StepIcon = isRejected ? XCircle : APPROVAL_MAP[step].icon;
                const displayLabel = isRejected ? 'Rejected' : APPROVAL_MAP[step].label;

                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < APPROVAL_STEPS.length - 1 ? 1 : undefined, gap: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <div style={approvalStepCircle(step, client.approvalStatus)}>
                        <StepIcon size={14} />
                      </div>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {displayLabel}
                      </span>
                    </div>
                    {idx < APPROVAL_STEPS.length - 1 && (
                      <div style={approvalLineStyle(step, client.approvalStatus)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Metrics */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <TrendingUp size={16} color={tokens.colors.primaryScale[500]} />
              Revenue Metrics
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
              <div style={metricBoxStyle}>
                <div style={metricValueStyle}>{client.positionsCount}</div>
                <div style={metricLabelStyle}>Positions</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={metricValueStyle}>{formatRevenue(client.revenue)}</div>
                <div style={metricLabelStyle}>Total Revenue</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={{
                  ...metricValueStyle,
                  color: tokens.colors.successScale[600],
                }}>
                  {client.positionsCount > 0 ? Math.round(client.revenue / client.positionsCount / 100) * 100 : 0}
                </div>
                <div style={metricLabelStyle}>Avg Fee / Position</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={{
                  ...metricValueStyle,
                  color: tokens.colors.infoScale[600],
                }}>
                  {client.contacts.length}
                </div>
                <div style={metricLabelStyle}>Contacts</div>
              </div>
            </div>
          </div>

          {/* Positions linked mini table */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Briefcase size={16} color={tokens.colors.primaryScale[500]} />
              Positions Linked ({client.positionsCount})
            </div>
            <div style={{
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.neutral[50],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
              }}>
                <span>Position</span>
                <span>Status</span>
                <span>Candidates</span>
                <span>Fee</span>
              </div>
              {/* Placeholder rows showing positions belong to this client */}
              {Array.from({ length: Math.min(client.positionsCount, 5) }).map((_, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  borderBottom: idx < Math.min(client.positionsCount, 5) - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}>
                  <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>
                    Position #{idx + 1}
                  </span>
                  <span>
                    <span style={badgeSmallStyle(idx % 2 === 0 ? 'success' : 'warning')}>
                      {idx % 2 === 0 ? 'Open' : 'In Progress'}
                    </span>
                  </span>
                  <span>{Math.floor(Math.random() * 20) + 1}</span>
                  <span>{formatFee(client.feeStructure)}</span>
                </div>
              ))}
              {client.positionsCount > 5 && (
                <div style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[600],
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  View all {client.positionsCount} positions
                </div>
              )}
              {client.positionsCount === 0 && (
                <div style={{
                  padding: tokens.spacing[4],
                  textAlign: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}>
                  No positions linked to this client
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderSlideForm = () => (
      <>
        <div style={overlayStyle} onClick={closeForm} />
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
              {formMode === 'add' ? 'Add New Client' : 'Edit Client'}
            </span>
            <X
              size={20}
              style={{ cursor: 'pointer', color: tokens.colors.neutral[500] }}
              onClick={closeForm}
            />
          </div>

          {/* Client Type */}
          <div style={formFieldStyle}>
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

          {/* Name */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Client Name</label>
            <input
              style={formInputStyle}
              placeholder="Enter client name"
              defaultValue={formMode === 'edit' && selectedClientData ? selectedClientData.name : ''}
            />
          </div>

          {/* Industry */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Industry</label>
            <input
              style={formInputStyle}
              placeholder="e.g. Technology, Healthcare"
              defaultValue={formMode === 'edit' && selectedClientData ? selectedClientData.industry : ''}
            />
          </div>

          {/* Tier */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Client Tier</label>
            <select
              style={{ ...formInputStyle, cursor: 'pointer' }}
              defaultValue={formMode === 'edit' && selectedClientData ? selectedClientData.tier : 'standard'}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Status</label>
            <select
              style={{ ...formInputStyle, cursor: 'pointer' }}
              defaultValue={formMode === 'edit' && selectedClientData ? selectedClientData.status : 'pending_approval'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Contract Terms */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Contract Terms</label>
            <input
              style={formInputStyle}
              placeholder="e.g. Net 30, Annual"
              defaultValue={formMode === 'edit' && selectedClientData?.contractInfo ? selectedClientData.contractInfo.terms : ''}
            />
          </div>

          {/* Fee Structure */}
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Fee Type</label>
            <select
              style={{ ...formInputStyle, cursor: 'pointer' }}
              defaultValue={formMode === 'edit' && selectedClientData?.feeStructure ? selectedClientData.feeStructure.type : 'percentage'}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>

          <div style={formFieldStyle}>
            <label style={formLabelStyle}>Fee Value</label>
            <input
              style={formInputStyle}
              type="number"
              placeholder="e.g. 20 (for 20%)"
              defaultValue={formMode === 'edit' && selectedClientData?.feeStructure ? selectedClientData.feeStructure.value : ''}
            />
          </div>

          {/* Contract Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3], ...formFieldStyle }}>
            <div>
              <label style={formLabelStyle}>Start Date</label>
              <input
                style={formInputStyle}
                type="date"
                defaultValue={formMode === 'edit' && selectedClientData?.contractInfo ? selectedClientData.contractInfo.startDate : ''}
              />
            </div>
            <div>
              <label style={formLabelStyle}>End Date</label>
              <input
                style={formInputStyle}
                type="date"
                defaultValue={formMode === 'edit' && selectedClientData?.contractInfo ? selectedClientData.contractInfo.endDate : ''}
              />
            </div>
          </div>

          {/* Contact (first contact) */}
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
                <input
                  style={formInputStyle}
                  placeholder="Contact name"
                  defaultValue={formMode === 'edit' && selectedClientData?.contacts?.[0] ? selectedClientData.contacts[0].name : ''}
                />
              </div>
              <div>
                <label style={formLabelStyle}>Role</label>
                <input
                  style={formInputStyle}
                  placeholder="e.g. HR Director"
                  defaultValue={formMode === 'edit' && selectedClientData?.contacts?.[0] ? selectedClientData.contacts[0].role : ''}
                />
              </div>
              <div>
                <label style={formLabelStyle}>Email</label>
                <input
                  style={formInputStyle}
                  type="email"
                  placeholder="email@company.com"
                  defaultValue={formMode === 'edit' && selectedClientData?.contacts?.[0] ? selectedClientData.contacts[0].email : ''}
                />
              </div>
              <div>
                <label style={formLabelStyle}>Phone</label>
                <input
                  style={formInputStyle}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  defaultValue={formMode === 'edit' && selectedClientData?.contacts?.[0] ? selectedClientData.contacts[0].phone : ''}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing[3], paddingTop: tokens.spacing[3], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <button style={cancelBtnStyle} onClick={closeForm}>
              Cancel
            </button>
            <button
              style={submitBtnStyle}
              onClick={() => {
                if (formMode === 'add') {
                  onAddClient?.({});
                } else if (selectedClientData) {
                  onEditClient?.(selectedClientData.id, {});
                }
                closeForm();
              }}
            >
              {formMode === 'add' ? 'Create Client' : 'Save Changes'}
            </button>
          </div>
        </div>
      </>
    );

    return (
      <div style={rootStyle} className={className}>
        {/* Header bar */}
        <div style={headerBarStyle}>
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
              {filteredClients.length} of {clients.length} clients
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], padding: tokens.spacing[1], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
              <button
                style={viewToggleStyle(viewMode === 'list')}
                onClick={() => changeViewMode('list')}
              >
                <LayoutList size={16} />
              </button>
              <button
                style={viewToggleStyle(viewMode === 'grid')}
                onClick={() => changeViewMode('grid')}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button style={addButtonStyle} onClick={openAddForm}>
              <Plus size={14} /> Add Client
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {renderFilterBar()}

        {/* Split panel */}
        <div style={splitStyle}>
          {/* Client list */}
          <div style={listPanelStyle}>
            {filteredClients.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: tokens.spacing[8],
                color: tokens.colors.neutral[400],
              }}>
                <Search size={32} style={{ marginBottom: tokens.spacing[3], opacity: 0.5 }} />
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>
                  No clients found
                </span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, marginTop: tokens.spacing[1] }}>
                  Try adjusting your filters
                </span>
              </div>
            )}
            {filteredClients.map(renderClientRow)}
          </div>

          {/* Detail panel */}
          {selectedClientData && renderDetailPanel()}
          {!selectedClientData && filteredClients.length > 0 && (
            <div style={{
              ...detailPanelStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
            }}>
              <Users size={40} style={{ marginBottom: tokens.spacing[3], opacity: 0.4 }} />
              <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium }}>
                Select a client to view details
              </span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, marginTop: tokens.spacing[1] }}>
                Choose from the list on the left
              </span>
            </div>
          )}
        </div>

        {/* Slide-in form */}
        {renderSlideForm()}
      </div>
    );
  },
);
