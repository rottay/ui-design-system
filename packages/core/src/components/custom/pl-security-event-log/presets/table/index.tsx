'use client';

/**
 * PlSecurityEventLog - Table Preset
 * Full data table view of security events with stats ribbon, sortable columns,
 * severity color stripes, expandable row details, and export functionality
 */

import { useState, useCallback, useMemo, Fragment } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createSkeletonStyle,
  createStatusDotStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlSecurityEventLogProps,
  SecurityEvent,
  EventSeverity,
  EventType,
  EventLogFilter,
} from '../../core';
import { PL_SECURITY_EVENT_LOG_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  LogIn,
  LogOut,
  Shield,
  Key,
  AlertTriangle,
  Lock,
  UserX,
  Settings,
  FileText,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Monitor,
  Download,
  X,
  Info,
  AlertOctagon,
  XCircle,
  Fingerprint,
  Globe,
} from 'lucide-react';

// ─── Sort Field Type ─────────────────────────────────────────────────────────

type SortField = 'timestamp' | 'severity' | 'type' | 'actor' | 'ip';

// ─── Severity Order Map ──────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<EventSeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

// ─── Event Type Config ───────────────────────────────────────────────────────

function getEventTypeConfig(type: EventType): { icon: any; label: string } {
  const configs: Record<EventType, { icon: any; label: string }> = {
    login_success: { icon: LogIn, label: 'Login Success' },
    login_failure: { icon: AlertTriangle, label: 'Login Failed' },
    password_change: { icon: Key, label: 'Password Changed' },
    mfa_enabled: { icon: Shield, label: 'MFA Enabled' },
    mfa_disabled: { icon: Shield, label: 'MFA Disabled' },
    role_change: { icon: Settings, label: 'Role Changed' },
    permission_change: { icon: Settings, label: 'Permission Changed' },
    session_revoked: { icon: LogOut, label: 'Session Revoked' },
    account_locked: { icon: Lock, label: 'Account Locked' },
    suspicious_activity: { icon: AlertTriangle, label: 'Suspicious Activity' },
    api_key_created: { icon: Key, label: 'API Key Created' },
    data_export: { icon: FileText, label: 'Data Export' },
  };
  return configs[type];
}

// ─── Event Category Mapping ──────────────────────────────────────────────────

type EventCategory = 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system';

function getEventCategory(type: EventType): EventCategory {
  const mapping: Record<EventType, EventCategory> = {
    login_success: 'authentication',
    login_failure: 'authentication',
    password_change: 'authentication',
    mfa_enabled: 'authentication',
    mfa_disabled: 'authentication',
    session_revoked: 'authentication',
    role_change: 'authorization',
    permission_change: 'authorization',
    account_locked: 'system',
    suspicious_activity: 'system',
    api_key_created: 'configuration',
    data_export: 'data_access',
  };
  return mapping[type];
}

function getCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    authentication: 'Authentication',
    authorization: 'Authorization',
    data_access: 'Data Access',
    configuration: 'Configuration',
    system: 'System',
  };
  return labels[category];
}

function getCategoryBadgeColor(category: EventCategory): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' {
  const colorMap: Record<EventCategory, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
    authentication: 'primary',
    authorization: 'warning',
    data_access: 'info',
    configuration: 'secondary',
    system: 'error',
  };
  return colorMap[category];
}

// ─── Severity Config ─────────────────────────────────────────────────────────

function getSeverityConfig(severity: EventSeverity, tokens: DesignTokens): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  stripeColor: string;
  rowBgColor: string;
  icon: any;
} {
  switch (severity) {
    case 'info':
      return {
        label: 'Info',
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[50],
        borderColor: tokens.colors.infoScale[200],
        dotColor: tokens.colors.infoScale[500],
        stripeColor: tokens.colors.infoScale[400],
        rowBgColor: 'transparent',
        icon: Info,
      };
    case 'warning':
      return {
        label: 'Warning',
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[50],
        borderColor: tokens.colors.warningScale[200],
        dotColor: tokens.colors.warningScale[500],
        stripeColor: tokens.colors.warningScale[400],
        rowBgColor: 'transparent',
        icon: AlertTriangle,
      };
    case 'error':
      return {
        label: 'Error',
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[50],
        borderColor: tokens.colors.errorScale[200],
        dotColor: tokens.colors.errorScale[500],
        stripeColor: tokens.colors.errorScale[500],
        rowBgColor: 'transparent',
        icon: XCircle,
      };
    case 'critical':
      return {
        label: 'Critical',
        color: tokens.colors.errorScale[900],
        bgColor: tokens.colors.errorScale[100],
        borderColor: tokens.colors.errorScale[300],
        dotColor: tokens.colors.errorScale[600],
        stripeColor: tokens.colors.errorScale[600],
        rowBgColor: tokens.colors.errorScale[50],
        icon: AlertOctagon,
      };
  }
}

// ─── Format Absolute Timestamp ───────────────────────────────────────────────

function formatAbsoluteTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ─── Table Preset ────────────────────────────────────────────────────────────

export const TablePlSecurityEventLog = createPreset<PlSecurityEventLogProps>({
  name: 'PlSecurityEventLog.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSecurityEventLogProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      events,
      stats,
      filters: controlledFilters,
      onFilterChange,
      onEventClick,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      emptyText = PL_SECURITY_EVENT_LOG_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalFilters, setInternalFilters] = useState<EventLogFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [tooltipEventId, setTooltipEventId] = useState<string | null>(null);
    const [loading] = useState(false);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    // ─── Derived: Active Category Filter ─────────────────────────────────

    const activeCategoryFilter = useMemo(() => {
      if (!filters.type) return null;
      return getEventCategory(filters.type);
    }, [filters.type]);

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: EventLogFilter) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleSeverityFilter = useCallback((severity: EventSeverity | null) => {
      handleFilterChange({ ...filters, severity });
      setShowSeverityDropdown(false);
    }, [filters, handleFilterChange]);

    const handleCategoryFilter = useCallback((category: EventCategory | null) => {
      if (category === null) {
        handleFilterChange({ ...filters, type: null });
      } else {
        // Find the first event type for this category to use as a proxy
        const typeMap: Record<EventCategory, EventType> = {
          authentication: 'login_success',
          authorization: 'role_change',
          data_access: 'data_export',
          configuration: 'api_key_created',
          system: 'suspicious_activity',
        };
        handleFilterChange({ ...filters, type: typeMap[category] });
      }
      setShowCategoryDropdown(false);
    }, [filters, handleFilterChange]);

    const handleSort = useCallback((field: SortField) => {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    }, [sortField]);

    const toggleRowDetails = useCallback((eventId: string) => {
      setExpandedRowId(prev => prev === eventId ? null : eventId);
    }, []);

    const handleExport = useCallback(() => {
      // Trigger a simple CSV export of filtered events
      const headers = ['Timestamp', 'Severity', 'Type', 'Category', 'Actor', 'Email', 'IP', 'Location', 'User Agent'];
      const rows = filteredAndSortedEvents.map(e => [
        formatAbsoluteTime(e.timestamp),
        e.severity,
        getEventTypeConfig(e.type).label,
        getCategoryLabel(getEventCategory(e.type)),
        e.actor.name,
        e.actor.email,
        e.ip,
        e.location,
        e.userAgent,
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'security-events.csv';
      a.click();
      URL.revokeObjectURL(url);
    }, []);

    // ─── Filtered + Sorted Events ────────────────────────────────────────

    const filteredAndSortedEvents = useMemo(() => {
      let result = [...events];

      // Severity filter
      if (filters.severity) {
        result = result.filter(e => e.severity === filters.severity);
      }

      // Type/Category filter
      if (filters.type) {
        const targetCategory = getEventCategory(filters.type);
        result = result.filter(e => getEventCategory(e.type) === targetCategory);
      }

      // Search filter
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(e =>
          e.actor.name.toLowerCase().includes(lower) ||
          e.actor.email.toLowerCase().includes(lower) ||
          e.type.toLowerCase().includes(lower) ||
          e.ip.includes(lower) ||
          e.location.toLowerCase().includes(lower) ||
          getEventTypeConfig(e.type).label.toLowerCase().includes(lower)
        );
      }

      // Date range filter
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        result = result.filter(e => {
          const t = e.timestamp.getTime();
          return t >= start.getTime() && t <= end.getTime();
        });
      }

      // Sort
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case 'timestamp':
            aVal = a.timestamp.getTime();
            bVal = b.timestamp.getTime();
            break;
          case 'severity':
            aVal = SEVERITY_ORDER[a.severity];
            bVal = SEVERITY_ORDER[b.severity];
            break;
          case 'type':
            aVal = getEventTypeConfig(a.type).label;
            bVal = getEventTypeConfig(b.type).label;
            break;
          case 'actor':
            aVal = a.actor.name.toLowerCase();
            bVal = b.actor.name.toLowerCase();
            break;
          case 'ip':
            aVal = a.ip;
            bVal = b.ip;
            break;
        }

        if (typeof aVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });

      return result;
    }, [events, filters, searchQuery, sortField, sortDirection]);

    // ─── Computed Stats ──────────────────────────────────────────────────

    const computedStats = useMemo(() => {
      if (stats) return stats;
      return {
        total: events.length,
        critical: events.filter(e => e.severity === 'critical').length,
        warnings: events.filter(e => e.severity === 'warning').length,
        errors: events.filter(e => e.severity === 'error').length,
      };
    }, [stats, events]);

    // ─── Blocked Count (events with account_locked or suspicious_activity) ─

    const blockedCount = useMemo(() => {
      return events.filter(e =>
        e.type === 'account_locked' || e.type === 'suspicious_activity'
      ).length;
    }, [events]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Events',
          value: computedStats.total,
          scaleColor: tokens.colors.primaryScale,
          icon: Activity,
        },
        {
          label: 'Critical',
          value: computedStats.critical,
          scaleColor: tokens.colors.errorScale,
          icon: AlertOctagon,
        },
        {
          label: 'Warnings',
          value: computedStats.warnings,
          scaleColor: tokens.colors.warningScale,
          icon: AlertTriangle,
        },
        {
          label: 'Blocked',
          value: blockedCount,
          scaleColor: tokens.colors.infoScale,
          icon: Shield,
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
        }}>
          {statItems.map((item, idx) => {
            const StatIcon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  ...createSurfaceStyle(tokens, { elevation: 'sm' }),
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  backgroundColor: tokens.colors.common.white,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  ...glassSurfaceStyle,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: item.scaleColor[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <StatIcon size={18} color={item.scaleColor[500]} />
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                    marginBottom: 2,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}>
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // ─── Render: Toolbar (Search + Filters + Export) ─────────────────────

    const renderToolbar = () => {
      const allSeverities: (EventSeverity | null)[] = [null, 'info', 'warning', 'error', 'critical'];
      const allCategories: (EventCategory | null)[] = [null, 'authentication', 'authorization', 'data_access', 'configuration', 'system'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 260,
            flex: 1,
            maxWidth: 400,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search by name, email, IP, event type..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: 'transparent',
                flex: 1,
                padding: 0,
              }}
            />
            {searchQuery && (
              <X
                size={14}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>

          {/* Severity filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowSeverityDropdown(!showSeverityDropdown);
                setShowCategoryDropdown(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  filters.severity ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                backgroundColor: filters.severity ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filters.severity ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {filters.severity
                ? getSeverityConfig(filters.severity, tokens).label
                : 'All Severities'}
              <ChevronDown size={14} style={{
                transform: showSeverityDropdown ? 'rotate(180deg)' : 'none',
                transition: `transform ${tokens.motion.hover}`,
              }} />
            </button>
            {showSeverityDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 200,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                {allSeverities.map(sev => {
                  const isActive = filters.severity === sev || (sev === null && !filters.severity);
                  const label = sev === null ? 'All Severities' : getSeverityConfig(sev, tokens).label;
                  const SevIcon = sev ? getSeverityConfig(sev, tokens).icon : null;
                  return (
                    <div
                      key={sev ?? 'all'}
                      onClick={() => handleSeverityFilter(sev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {SevIcon && (
                        <SevIcon
                          size={14}
                          color={sev ? getSeverityConfig(sev, tokens).color : tokens.colors.neutral[500]}
                        />
                      )}
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowSeverityDropdown(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  activeCategoryFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                backgroundColor: activeCategoryFilter ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: activeCategoryFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {activeCategoryFilter
                ? getCategoryLabel(activeCategoryFilter)
                : 'All Categories'}
              <ChevronDown size={14} style={{
                transform: showCategoryDropdown ? 'rotate(180deg)' : 'none',
                transition: `transform ${tokens.motion.hover}`,
              }} />
            </button>
            {showCategoryDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 200,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                {allCategories.map(cat => {
                  const isActive = activeCategoryFilter === cat || (cat === null && !activeCategoryFilter);
                  const label = cat === null ? 'All Categories' : getCategoryLabel(cat);
                  return (
                    <div
                      key={cat ?? 'all'}
                      onClick={() => handleCategoryFilter(cat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {cat && (
                        <span style={{
                          ...createBadgeStyle(tokens, getCategoryBadgeColor(cat)),
                          padding: `1px ${tokens.spacing[1]}px`,
                          fontSize: '10px',
                        }}>
                          {label}
                        </span>
                      )}
                      {!cat && label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Export button */}
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      );
    };

    // ─── Render: Sort Indicator ──────────────────────────────────────────

    const renderSortIndicator = (field: SortField) => {
      if (sortField !== field) {
        return <ArrowUpDown size={12} color={tokens.colors.neutral[300]} />;
      }
      return sortDirection === 'asc'
        ? <ArrowUp size={12} color={tokens.colors.primaryScale[600]} />
        : <ArrowDown size={12} color={tokens.colors.primaryScale[600]} />;
    };

    // ─── Render: Table Header Cell ───────────────────────────────────────

    const renderHeaderCell = (
      label: string,
      field?: SortField,
      extraStyle?: React.CSSProperties
    ) => (
      <th
        onClick={() => field && handleSort(field)}
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          textAlign: 'left' as const,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: sortField === field ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[50],
          cursor: field ? 'pointer' : 'default',
          userSelect: 'none' as const,
          whiteSpace: 'nowrap' as const,
          transition: `color ${tokens.motion.hover}`,
          ...extraStyle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
          {label}
          {field && renderSortIndicator(field)}
        </div>
      </th>
    );

    // ─── Render: Severity Icon Cell ──────────────────────────────────────

    const renderSeverityCell = (severity: EventSeverity) => {
      const cfg = getSeverityConfig(severity, tokens);
      const SevIcon = cfg.icon;
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: severity === 'critical' ? tokens.borderRadius.md : tokens.borderRadius.full,
            backgroundColor: cfg.bgColor,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <SevIcon size={12} color={cfg.color} />
          </div>
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>
      );
    };

    // ─── Render: Table Row ───────────────────────────────────────────────

    const renderRow = (event: SecurityEvent) => {
      const typeCfg = getEventTypeConfig(event.type);
      const severityCfg = getSeverityConfig(event.severity, tokens);
      const category = getEventCategory(event.type);
      const Icon = typeCfg.icon;
      const isExpanded = expandedRowId === event.id;
      const isHovered = hoveredRowId === event.id;
      const isCritical = event.severity === 'critical';
      const isMessageTooltipVisible = tooltipEventId === event.id;

      const rowBgColor = isCritical
        ? severityCfg.rowBgColor
        : isHovered
          ? tokens.colors.neutral[50]
          : tokens.colors.common.white;

      const cellBorderStyle = `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`;

      return (
        <Fragment key={event.id}>
          <tr
            onMouseEnter={() => setHoveredRowId(event.id)}
            onMouseLeave={() => setHoveredRowId(null)}
            onClick={() => toggleRowDetails(event.id)}
            style={{
              backgroundColor: rowBgColor,
              cursor: 'pointer',
              transition: `background-color ${tokens.motion.hover}`,
            }}
          >
            {/* Severity stripe + icon */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px ${tokens.spacing[3]}px 0`,
              borderBottom: cellBorderStyle,
              position: 'relative' as const,
            }}>
              {/* Left severity color stripe */}
              <div style={{
                position: 'absolute' as const,
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: severityCfg.stripeColor,
                borderRadius: `${tokens.borderRadius.sm} 0 0 ${tokens.borderRadius.sm}`,
              }} />
              <div style={{ paddingLeft: tokens.spacing[4] }}>
                {renderSeverityCell(event.severity)}
              </div>
            </td>

            {/* Event type / name */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.neutral[600],
                  flexShrink: 0,
                }}>
                  <Icon size={14} />
                </div>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}>
                  {typeCfg.label}
                </span>
              </div>
            </td>

            {/* Category badge */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
            }}>
              <span style={{
                ...createBadgeStyle(tokens, getCategoryBadgeColor(category)),
              }}>
                {getCategoryLabel(category)}
              </span>
            </td>

            {/* Message (truncated with hover tooltip) */}
            <td
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: cellBorderStyle,
                maxWidth: 220,
                position: 'relative' as const,
              }}
              onMouseEnter={() => setTooltipEventId(event.id)}
              onMouseLeave={() => setTooltipEventId(null)}
            >
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {event.target
                  ? `${typeCfg.label} on ${event.target.name}`
                  : `${typeCfg.label} by ${event.actor.name}`}
              </div>
              {/* Tooltip on hover */}
              {isMessageTooltipVisible && (
                <div style={{
                  position: 'absolute' as const,
                  bottom: '100%',
                  left: 0,
                  marginBottom: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[900],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  borderRadius: tokens.borderRadius.md,
                  boxShadow: tokens.shadows.lg,
                  zIndex: 100,
                  whiteSpace: 'normal' as const,
                  maxWidth: 320,
                  pointerEvents: 'none' as const,
                }}>
                  {event.target
                    ? `${typeCfg.label} on ${event.target.name} (${event.target.type}: ${event.target.id})`
                    : `${typeCfg.label} performed by ${event.actor.name} (${event.actor.email})`}
                </div>
              )}
            </td>

            {/* User (actor) */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {event.actor.avatar ? (
                  <img
                    src={event.actor.avatar}
                    alt={event.actor.name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: tokens.borderRadius.full,
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                    flexShrink: 0,
                  }}>
                    {event.actor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[900],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {event.actor.name}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {event.actor.id}
                  </div>
                </div>
              </div>
            </td>

            {/* Source IP with location indicator */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Globe size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                    fontFamily: 'monospace',
                  }}>
                    {event.ip}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    <MapPin size={10} />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </td>

            {/* Result badge */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
            }}>
              {renderResultBadge(event)}
            </td>

            {/* Timestamp (relative + absolute on hover) */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: cellBorderStyle,
              whiteSpace: 'nowrap' as const,
            }}>
              <div
                title={formatAbsoluteTime(event.timestamp)}
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  cursor: 'help',
                }}
              >
                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
              </div>
              <div style={{
                fontSize: '10px',
                color: tokens.colors.neutral[400],
                marginTop: 1,
              }}>
                {formatAbsoluteTime(event.timestamp)}
              </div>
            </td>

            {/* Expand/collapse arrow */}
            <td style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
              borderBottom: cellBorderStyle,
              textAlign: 'center' as const,
              width: 40,
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : 'transparent',
                color: isExpanded ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                transition: `all ${tokens.motion.hover}`,
              }}>
                {isExpanded
                  ? <ChevronUp size={14} />
                  : <ChevronDown size={14} />
                }
              </div>
            </td>
          </tr>

          {/* ─── Expanded Detail Row ─────────────────────────────────── */}
          {isExpanded && (
            <tr>
              <td colSpan={9} style={{
                padding: 0,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <div style={{
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: tokens.spacing[4],
                  }}>
                    {/* Full Message */}
                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Full Details
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        <div style={{ marginBottom: tokens.spacing[1] }}>
                          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>Event: </span>
                          {typeCfg.label}
                        </div>
                        <div style={{ marginBottom: tokens.spacing[1] }}>
                          <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>Actor: </span>
                          {event.actor.name} ({event.actor.email})
                        </div>
                        {event.target && (
                          <div style={{ marginBottom: tokens.spacing[1] }}>
                            <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>Target: </span>
                            {event.target.name} ({event.target.type}: {event.target.id})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Agent + Geo */}
                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Connection Details
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                          marginBottom: tokens.spacing[2],
                        }}>
                          <Monitor size={14} color={tokens.colors.neutral[400]} style={{ marginTop: 3, flexShrink: 0 }} />
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            wordBreak: 'break-all' as const,
                          }}>
                            {event.userAgent}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          marginBottom: tokens.spacing[1],
                        }}>
                          <Globe size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
                          <span>{event.ip}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}>
                          <MapPin size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Metadata
                      </div>
                      {event.details && Object.keys(event.details).length > 0 ? (
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}>
                          {Object.entries(event.details).map(([key, value]) => (
                            <div
                              key={key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: tokens.spacing[2],
                                padding: `${tokens.spacing[1]}px 0`,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}
                            >
                              <span style={{
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[600],
                                fontSize: tokens.typography.fontSize.xs,
                              }}>
                                {key}
                              </span>
                              <span style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[800],
                                textAlign: 'right' as const,
                              }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[400],
                          fontStyle: 'italic',
                        }}>
                          No additional metadata
                        </div>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div style={{ marginTop: tokens.spacing[2] }}>
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div
                              key={key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: tokens.spacing[2],
                                padding: `${tokens.spacing[1]}px 0`,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}
                            >
                              <span style={{
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[600],
                                fontSize: tokens.typography.fontSize.xs,
                              }}>
                                {key}
                              </span>
                              <span style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[800],
                                textAlign: 'right' as const,
                              }}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action row in expanded */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    marginTop: tokens.spacing[3],
                    paddingTop: tokens.spacing[3],
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event.id);
                      }}
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
                        outline: 'none',
                      }}
                    >
                      View Full Event
                    </button>
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}>
                      Event ID: {event.id}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </Fragment>
      );
    };

    // ─── Render: Result Badge ────────────────────────────────────────────

    const renderResultBadge = (event: SecurityEvent) => {
      // Determine result from event type
      const isBlocked = event.type === 'account_locked' || event.type === 'suspicious_activity';
      const isFailure = event.type === 'login_failure';
      const isSuccess = !isBlocked && !isFailure;

      if (isBlocked) {
        return (
          <span style={{
            ...createBadgeStyle(tokens, 'info'),
            gap: tokens.spacing[1],
          }}>
            <Shield size={10} />
            Blocked
          </span>
        );
      }

      if (isFailure) {
        return (
          <span style={{
            ...createBadgeStyle(tokens, 'error'),
            gap: tokens.spacing[1],
          }}>
            <XCircle size={10} />
            Failure
          </span>
        );
      }

      return (
        <span style={{
          ...createBadgeStyle(tokens, 'success'),
          gap: tokens.spacing[1],
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.successScale[500],
            display: 'inline-block',
          }} />
          Success
        </span>
      );
    };

    // ─── Render: Loading State ───────────────────────────────────────────

    const renderLoadingState = () => {
      const skeletonBase = createSkeletonStyle(tokens);
      const rows = Array.from({ length: 6 }, (_, i) => i);

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
        }}>
          {/* Skeleton header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
          }}>
            {[80, 70, 90, 120, 80, 100, 60, 80].map((width, idx) => (
              <div
                key={idx}
                style={{
                  ...skeletonBase,
                  width,
                  height: 14,
                }}
              />
            ))}
          </div>
          {/* Skeleton rows */}
          {rows.map(rowIdx => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[4],
                padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}
            >
              <div style={{ ...skeletonBase, width: 3, height: 40, borderRadius: tokens.borderRadius.sm }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{ ...skeletonBase, width: 26, height: 26, borderRadius: tokens.borderRadius.full }} />
                <div style={{ ...skeletonBase, width: 50, height: 12 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{ ...skeletonBase, width: 24, height: 24, borderRadius: tokens.borderRadius.md }} />
                <div style={{ ...skeletonBase, width: 90, height: 12 }} />
              </div>
              <div style={{ ...skeletonBase, width: 80, height: 22, borderRadius: tokens.borderRadius.full }} />
              <div style={{ ...skeletonBase, width: 140, height: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <div style={{ ...skeletonBase, width: 24, height: 24, borderRadius: tokens.borderRadius.full }} />
                <div>
                  <div style={{ ...skeletonBase, width: 80, height: 12, marginBottom: 4 }} />
                  <div style={{ ...skeletonBase, width: 60, height: 10 }} />
                </div>
              </div>
              <div>
                <div style={{ ...skeletonBase, width: 100, height: 12, marginBottom: 4 }} />
                <div style={{ ...skeletonBase, width: 70, height: 10 }} />
              </div>
              <div style={{ ...skeletonBase, width: 60, height: 22, borderRadius: tokens.borderRadius.full }} />
              <div style={{ ...skeletonBase, width: 60, height: 12 }} />
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Empty State ─────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Shield size={32} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 420,
          lineHeight: tokens.typography.lineHeight.relaxed,
          marginBottom: tokens.spacing[4],
        }}>
          {searchQuery || filters.severity || filters.type
            ? 'Try adjusting your search query or filters to find the events you are looking for.'
            : 'Security events will appear here as login attempts, permission changes, and other actions are recorded.'}
        </div>
        {(searchQuery || filters.severity || filters.type) && (
          <button
            onClick={() => {
              handleSearchChange('');
              handleFilterChange({});
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>
    );

    // ─── Render: Results Summary ─────────────────────────────────────────

    const renderResultsSummary = () => {
      const hasActiveFilters = searchQuery || filters.severity || filters.type;
      if (!hasActiveFilters && filteredAndSortedEvents.length === events.length) return null;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[2],
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[500],
        }}>
          <span>
            Showing {filteredAndSortedEvents.length} of {events.length} events
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                handleSearchChange('');
                handleFilterChange({});
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `1px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[600],
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <X size={10} />
              Clear all
            </button>
          )}
        </div>
      );
    };

    // ─── Main Render ─────────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            fontFamily: 'inherit',
            ...style,
          }}
        >
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Security Event Log
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Detailed table view of all security events and actions
            </p>
          </div>
          {renderLoadingState()}
        </div>
      );
    }

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4],
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Security Event Log
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Detailed table view of all security events and actions
            </p>
          </div>
        </div>

        {/* Stats Ribbon */}
        {renderStatsRibbon()}

        {/* Toolbar (search + filters + export) */}
        {renderToolbar()}

        {/* Results summary */}
        {renderResultsSummary()}

        {/* Table or empty state */}
        {filteredAndSortedEvents.length === 0 ? renderEmptyState() : (
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: 0,
            overflow: 'auto' as const,
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
              tableLayout: 'auto' as const,
            }}>
              <thead>
                <tr>
                  {renderHeaderCell('Severity', 'severity', { paddingLeft: tokens.spacing[5] })}
                  {renderHeaderCell('Event', 'type')}
                  {renderHeaderCell('Category')}
                  {renderHeaderCell('Message')}
                  {renderHeaderCell('User', 'actor')}
                  {renderHeaderCell('Source IP', 'ip')}
                  {renderHeaderCell('Result')}
                  {renderHeaderCell('Time', 'timestamp')}
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                    borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.neutral[50],
                    width: 40,
                  }} />
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents.map(event => renderRow(event))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {filteredAndSortedEvents.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[3],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}>
            <span>
              {filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''} displayed
            </span>
            <span>
              Sorted by {sortField === 'timestamp' ? 'time' : sortField} ({sortDirection === 'desc' ? 'newest first' : 'oldest first'})
            </span>
          </div>
        )}
      </div>
    );
  },
});
