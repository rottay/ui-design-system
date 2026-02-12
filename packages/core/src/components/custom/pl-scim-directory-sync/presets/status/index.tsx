'use client';

/**
 * PlScimDirectorySync - Status Preset
 * Dashboard showing sync health, configuration, user mappings, and recent activity
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  createEmptyStateStyle,
  createSectionHeaderStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlScimDirectorySyncProps,
  SyncMapping,
  SyncLog,
  SyncStatus,
  SyncLogStatus,
} from '../../core';
import { PL_SCIM_DIRECTORY_SYNC_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Users,
  Loader2,
  Settings,
  Link2,
  Zap,
  Pause,
  Shield,
  UserPlus,
  UserMinus,
  Edit3,
  Trash2,
  ExternalLink,
  Activity,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Wifi,
  WifiOff,
} from 'lucide-react';

// ─── Sync Status Config ──────────────────────────────────────────────────────

interface StatusVisual {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  icon: React.ReactNode;
}

function getSyncStatusVisual(status: SyncStatus, tokens: DesignTokens): StatusVisual {
  const iconSize = 18;
  switch (status) {
    case 'synced':
      return {
        label: 'Synced',
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[50],
        borderColor: tokens.colors.successScale[200],
        dotColor: tokens.colors.successScale[500],
        icon: <CheckCircle2 size={iconSize} color={tokens.colors.successScale[500]} />,
      };
    case 'syncing':
      return {
        label: 'Syncing',
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[50],
        borderColor: tokens.colors.infoScale[200],
        dotColor: tokens.colors.infoScale[500],
        icon: <Loader2 size={iconSize} color={tokens.colors.infoScale[500]} style={{ animation: 'spin 1s linear infinite' }} />,
      };
    case 'error':
      return {
        label: 'Error',
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[50],
        borderColor: tokens.colors.errorScale[200],
        dotColor: tokens.colors.errorScale[500],
        icon: <XCircle size={iconSize} color={tokens.colors.errorScale[500]} />,
      };
    case 'paused':
      return {
        label: 'Paused',
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[50],
        borderColor: tokens.colors.warningScale[200],
        dotColor: tokens.colors.warningScale[500],
        icon: <Pause size={iconSize} color={tokens.colors.warningScale[500]} />,
      };
    case 'pending':
      return {
        label: 'Pending',
        color: tokens.colors.neutral[600],
        bgColor: tokens.colors.neutral[100],
        borderColor: tokens.colors.neutral[200],
        dotColor: tokens.colors.neutral[400],
        icon: <Clock size={iconSize} color={tokens.colors.neutral[400]} />,
      };
  }
}

// ─── Log Status Config ───────────────────────────────────────────────────────

function getLogStatusColor(status: SyncLogStatus, tokens: DesignTokens): { color: string; bgColor: string; borderColor: string } {
  switch (status) {
    case 'success':
      return { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200] };
    case 'failure':
      return { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200] };
    case 'skipped':
      return { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200] };
  }
}

// ─── Mapping Status Badge Color ──────────────────────────────────────────────

function getMappingStatusBadge(status: SyncStatus): 'success' | 'info' | 'error' | 'warning' | 'secondary' {
  switch (status) {
    case 'synced': return 'success';
    case 'syncing': return 'info';
    case 'error': return 'error';
    case 'paused': return 'warning';
    case 'pending': return 'secondary';
  }
}

// ─── Operation Icon ──────────────────────────────────────────────────────────

function getOperationIcon(operation: string, tokens: DesignTokens): React.ReactNode {
  const size = 14;
  switch (operation) {
    case 'create':
    case 'provision':
      return <UserPlus size={size} color={tokens.colors.successScale[600]} />;
    case 'update':
      return <Edit3 size={size} color={tokens.colors.infoScale[600]} />;
    case 'delete':
    case 'deprovision':
      return <UserMinus size={size} color={tokens.colors.errorScale[600]} />;
    default:
      return <Activity size={size} color={tokens.colors.neutral[500]} />;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSyncInterval(minutes: number): string {
  if (minutes < 60) return `Every ${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
  return `Every ${hours}h ${mins}m`;
}

function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

// ─── Status Preset ───────────────────────────────────────────────────────────

export const StatusPlScimDirectorySync = createPreset<PlScimDirectorySyncProps>({
  name: 'PlScimDirectorySync.Status',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlScimDirectorySyncProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      config: configProp,
      mappings = [],
      logs = [],
      onSync,
      onResolveConflict,
      onToggleAutoProvision,
      onMappingClick,
      loading = PL_SCIM_DIRECTORY_SYNC_DEFAULTS.loading ?? false,
      className,
      style,
    } = props;

    // Provide default config if not provided
    const config = configProp || {
      provider: 'Unknown Provider',
      tenantUrl: '',
      status: 'pending' as const,
      totalMapped: 0,
      totalConflicts: 0,
      autoProvision: false,
      syncInterval: 60,
    };

    // ─── State ──────────────────────────────────────────────────────────

    const [hoveredMappingId, setHoveredMappingId] = useState<string | null>(null);
    const [mappingSortField, setMappingSortField] = useState<'displayName' | 'status' | 'lastSynced'>('displayName');
    const [mappingSortAsc, setMappingSortAsc] = useState(true);

    // ─── Computed Data ──────────────────────────────────────────────────

    const statusVisual = useMemo(() => getSyncStatusVisual(config.status, tokens), [config.status, tokens]);

    const conflictMappings = useMemo(() => {
      return mappings.filter(m => m.conflicts && m.conflicts.length > 0);
    }, [mappings]);

    const sortedMappings = useMemo(() => {
      const sorted = [...mappings];
      sorted.sort((a, b) => {
        let cmp = 0;
        switch (mappingSortField) {
          case 'displayName':
            cmp = (a.displayName || '').localeCompare(b.displayName || '');
            break;
          case 'status':
            cmp = (a.status || '').localeCompare(b.status || '');
            break;
          case 'lastSynced':
            cmp = (a.lastSynced?.getTime() || 0) - (b.lastSynced?.getTime() || 0);
            break;
        }
        return mappingSortAsc ? cmp : -cmp;
      });
      return sorted;
    }, [mappings, mappingSortField, mappingSortAsc]);

    const recentLogs = useMemo(() => {
      return [...logs]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
    }, [logs]);

    const successRate = useMemo(() => {
      if (logs.length === 0) return 100;
      const successes = logs.filter(l => l.status === 'success').length;
      return Math.round((successes / logs.length) * 100);
    }, [logs]);

    const avgDuration = useMemo(() => {
      const withDuration = logs.filter(l => l.duration !== undefined);
      if (withDuration.length === 0) return 0;
      const total = withDuration.reduce((sum, l) => sum + (l.duration || 0), 0);
      return Math.round(total / withDuration.length);
    }, [logs]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    // ─── Sort Handler ───────────────────────────────────────────────────

    const handleSort = useCallback((field: 'displayName' | 'status' | 'lastSynced') => {
      if (mappingSortField === field) {
        setMappingSortAsc(!mappingSortAsc);
      } else {
        setMappingSortField(field);
        setMappingSortAsc(true);
      }
    }, [mappingSortField, mappingSortAsc]);

    // ─── Render: Sync Status Hero Card ──────────────────────────────────

    const renderHeroCard = () => (
      <div
        style={{
          ...createCardStyle(tokens, { elevation: 'md', glass: isModern }),
          padding: tokens.spacing[6],
          marginBottom: tokens.spacing[4],
          ...glassCardStyle,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing[4],
        }}>
          {/* Left: Status indicator + provider info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            {/* Large status indicator */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusVisual.bgColor,
              border: `2px solid ${statusVisual.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative' as const,
            }}>
              {config.status === 'syncing' ? (
                <RefreshCw
                  size={28}
                  color={tokens.colors.infoScale[500]}
                  style={{ animation: 'spin 2s linear infinite' }}
                />
              ) : config.status === 'synced' ? (
                <CheckCircle2 size={28} color={tokens.colors.successScale[500]} />
              ) : config.status === 'error' ? (
                <XCircle size={28} color={tokens.colors.errorScale[500]} />
              ) : config.status === 'paused' ? (
                <Pause size={28} color={tokens.colors.warningScale[500]} />
              ) : (
                <Clock size={28} color={tokens.colors.neutral[400]} />
              )}
              {/* Pulse ring for syncing */}
              {config.status === 'syncing' && (
                <div style={{
                  position: 'absolute' as const,
                  inset: -4,
                  borderRadius: tokens.borderRadius.full,
                  border: `2px solid ${tokens.colors.infoScale[300]}`,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  opacity: 0.6,
                }} />
              )}
            </div>

            {/* Provider info */}
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
                marginBottom: tokens.spacing[1],
              }}>
                {config.provider}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[2],
              }}>
                <Link2 size={14} />
                <span style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs }}>
                  {config.tenantUrl}
                </span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusVisual.bgColor,
                color: statusVisual.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusVisual.borderColor}`,
              }}>
                <span style={{
                  ...createStatusDotStyle(tokens, statusVisual.dotColor),
                }} />
                {statusVisual.label}
              </div>
            </div>
          </div>

          {/* Right: Sync timing info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'flex-end' as const,
            gap: tokens.spacing[2],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: 2,
                }}>
                  Last Full Sync
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}>
                  {config.lastFullSync
                    ? formatDistanceToNow(config.lastFullSync, { addSuffix: true })
                    : 'Never'}
                </div>
              </div>
              <Clock size={16} color={tokens.colors.neutral[400]} />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: 2,
                }}>
                  Next Scheduled
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}>
                  {config.nextScheduledSync
                    ? formatDistanceToNow(config.nextScheduledSync, { addSuffix: true })
                    : 'Not scheduled'}
                </div>
              </div>
              <RefreshCw size={16} color={tokens.colors.neutral[400]} />
            </div>
          </div>
        </div>
      </div>
    );

    // ─── Render: Stats Row ──────────────────────────────────────────────

    const renderStatsRow = () => (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
      }}>
        {/* Total Mapped */}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          ...glassSurfaceStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} color={tokens.colors.primaryScale[600]} />
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: 1,
              }}>
                {config.totalMapped.toLocaleString()}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                Total Mapped
              </div>
            </div>
          </div>
        </div>

        {/* Conflicts */}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          ...glassSurfaceStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: config.totalConflicts > 0 ? tokens.colors.warningScale[100] : tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color={config.totalConflicts > 0 ? tokens.colors.warningScale[600] : tokens.colors.neutral[400]} />
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: config.totalConflicts > 0 ? tokens.colors.warningScale[700] : tokens.colors.neutral[900],
                lineHeight: 1,
              }}>
                {config.totalConflicts}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                Conflicts
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          ...glassSurfaceStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: successRate >= 90 ? tokens.colors.successScale[100] : successRate >= 70 ? tokens.colors.warningScale[100] : tokens.colors.errorScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={20} color={successRate >= 90 ? tokens.colors.successScale[600] : successRate >= 70 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: successRate >= 90 ? tokens.colors.successScale[700] : successRate >= 70 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700],
                lineHeight: 1,
              }}>
                {successRate}%
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                Success Rate
              </div>
            </div>
          </div>
        </div>

        {/* Avg Duration */}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          ...glassSurfaceStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.infoScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={20} color={tokens.colors.infoScale[600]} />
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: 1,
              }}>
                {avgDuration > 0 ? formatDurationMs(avgDuration) : '--'}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                Avg Duration
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // ─── Render: User Mappings Table ────────────────────────────────────

    const renderMappingsSortHeader = (label: string, field: 'displayName' | 'status' | 'lastSynced') => (
      <div
        onClick={() => handleSort(field)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: mappingSortField === field ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          userSelect: 'none' as const,
        }}
      >
        {label}
        {mappingSortField === field && (
          <span style={{ fontSize: '10px' }}>{mappingSortAsc ? '\u25B2' : '\u25BC'}</span>
        )}
      </div>
    );

    const renderMappingsTable = () => {
      if (mappings.length === 0) return null;

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
            marginBottom: tokens.spacing[4],
            overflow: 'hidden' as const,
            ...glassCardStyle,
          }}
        >
          {/* Section header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Users size={16} color={tokens.colors.neutral[600]} />
              <span style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                User Mappings
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 22,
                height: 22,
                padding: `0 ${tokens.spacing[1]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.neutral[200],
                color: tokens.colors.neutral[700],
              }}>
                {mappings.length}
              </span>
            </div>
            {conflictMappings.length > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.warningScale[100],
                color: tokens.colors.warningScale[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
              }}>
                <AlertTriangle size={12} />
                {conflictMappings.length} conflict{conflictMappings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Table header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr 1fr 130px 90px 120px 80px',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            alignItems: 'center',
          }}>
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              External ID
            </div>
            {renderMappingsSortHeader('Display Name', 'displayName')}
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Email
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Internal ID
            </div>
            {renderMappingsSortHeader('Status', 'status')}
            {renderMappingsSortHeader('Last Synced', 'lastSynced')}
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Conflicts
            </div>
          </div>

          {/* Table rows */}
          {sortedMappings.map((mapping) => {
            const hasConflicts = mapping.conflicts && mapping.conflicts.length > 0;
            const isHovered = hoveredMappingId === mapping.id;
            const statusBadgeColor = getMappingStatusBadge(mapping.status || 'pending');

            return (
              <div
                key={mapping.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr 1fr 130px 90px 120px 80px',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  backgroundColor: hasConflicts
                    ? tokens.colors.warningScale[50]
                    : isHovered
                      ? tokens.colors.neutral[50]
                      : 'transparent',
                  cursor: onMappingClick ? 'pointer' : 'default',
                  transition: `all ${tokens.motion.hover}`,
                  alignItems: 'center',
                  minHeight: 48,
                }}
                onMouseEnter={() => setHoveredMappingId(mapping.id || null)}
                onMouseLeave={() => setHoveredMappingId(null)}
                onClick={() => mapping.id && onMappingClick?.(mapping.id)}
              >
                {/* External ID */}
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: 'monospace',
                  color: tokens.colors.neutral[600],
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  whiteSpace: 'nowrap' as const,
                }}>
                  {mapping.externalId}
                </div>

                {/* Display Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}>
                    {mapping.displayName}
                  </span>
                  {hasConflicts && (
                    <AlertTriangle size={14} color={tokens.colors.warningScale[500]} />
                  )}
                </div>

                {/* Email */}
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  whiteSpace: 'nowrap' as const,
                }}>
                  {mapping.email}
                </div>

                {/* Internal ID */}
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: 'monospace',
                  color: tokens.colors.neutral[600],
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  whiteSpace: 'nowrap' as const,
                }}>
                  {mapping.internalId}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    ...createBadgeStyle(tokens, statusBadgeColor),
                    fontSize: '10px',
                    textTransform: 'capitalize' as const,
                  }}>
                    {mapping.status}
                  </span>
                </div>

                {/* Last Synced */}
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  {mapping.lastSynced
                    ? formatDistanceToNow(mapping.lastSynced, { addSuffix: true })
                    : 'Never'}
                </div>

                {/* Conflicts / Resolve */}
                <div>
                  {hasConflicts ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mapping.id) onResolveConflict?.(mapping.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: `2px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: '10px',
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: tokens.colors.warningScale[100],
                        color: tokens.colors.warningScale[700],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[300]}`,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        outline: 'none',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      Resolve
                    </button>
                  ) : (
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}>
                      --
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // ─── Render: Sync Configuration ─────────────────────────────────────

    const renderSyncConfiguration = () => (
      <div
        style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
          ...glassCardStyle,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[4],
        }}>
          <Settings size={16} color={tokens.colors.neutral[600]} />
          <span style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}>
            Sync Configuration
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[4],
        }}>
          {/* Auto-provision toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[1],
              }}>
                <Zap size={16} color={tokens.colors.primaryScale[600]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                }}>
                  Auto-Provision
                </span>
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                lineHeight: tokens.typography.lineHeight.relaxed,
                maxWidth: 400,
              }}>
                Automatically create local user accounts when new users are detected in the identity provider directory.
              </div>
            </div>
            <button
              onClick={() => onToggleAutoProvision?.(!config.autoProvision)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: config.autoProvision ? 'flex-end' : 'flex-start',
                width: 48,
                height: 26,
                padding: 3,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: config.autoProvision ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                boxShadow: tokens.shadows.sm,
                transition: `all ${tokens.motion.hover}`,
              }} />
            </button>
          </div>

          {/* Sync interval + Manual sync */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[3],
          }}>
            {/* Sync Interval */}
            <div style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                Sync Interval
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Clock size={16} color={tokens.colors.neutral[600]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                }}>
                  {formatSyncInterval(config.syncInterval)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
            }}>
              {/* Manual sync button */}
              <button
                onClick={onSync}
                disabled={loading || config.status === 'syncing'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  cursor: loading || config.status === 'syncing' ? 'not-allowed' : 'pointer',
                  opacity: loading || config.status === 'syncing' ? 0.6 : 1,
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  boxShadow: tokens.shadows.sm,
                  flex: 1,
                }}
              >
                {loading || config.status === 'syncing' ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <RefreshCw size={16} />
                )}
                {loading || config.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>

              {/* Connection test button */}
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flex: 1,
                }}
              >
                <Wifi size={16} />
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    // ─── Render: Recent Activity Timeline ───────────────────────────────

    const renderRecentActivity = () => {
      if (recentLogs.length === 0) return null;

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[4],
            ...glassCardStyle,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[4],
          }}>
            <Activity size={16} color={tokens.colors.neutral[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              Recent Activity
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              Last 5 operations
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 0,
            position: 'relative' as const,
          }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute' as const,
              left: 15,
              top: 24,
              bottom: 24,
              width: 2,
              backgroundColor: tokens.colors.neutral[200],
              borderRadius: tokens.borderRadius.full,
            }} />

            {recentLogs.map((log, index) => {
              const logStatusColor = getLogStatusColor(log.status, tokens);
              const isLast = index === recentLogs.length - 1;

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px 0`,
                    position: 'relative' as const,
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: logStatusColor.bgColor,
                    border: `2px solid ${logStatusColor.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}>
                    {getOperationIcon(log.operation, tokens)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      flexWrap: 'wrap' as const,
                      marginBottom: tokens.spacing[1],
                    }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                      }}>
                        {log.entityName}
                      </span>
                      <span style={{
                        ...createBadgeStyle(tokens, 'info'),
                        fontSize: '10px',
                        textTransform: 'capitalize' as const,
                      }}>
                        {log.operation}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `2px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: '10px',
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: logStatusColor.bgColor,
                        color: logStatusColor.color,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${logStatusColor.borderColor}`,
                        textTransform: 'capitalize' as const,
                      }}>
                        {log.status}
                      </span>
                      {log.duration !== undefined && (
                        <span style={{
                          fontSize: '10px',
                          color: tokens.colors.neutral[400],
                          fontFamily: 'monospace',
                        }}>
                          {formatDurationMs(log.duration)}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}>
                        {log.entity}
                      </span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}>
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    {log.message && log.status === 'failure' && (
                      <div style={{
                        marginTop: tokens.spacing[1],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.errorScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.errorScale[700],
                      }}>
                        {log.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // ─── Render: Loading Skeleton ────────────────────────────────────────

    const renderLoadingSkeleton = () => (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacing[4],
      }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              ...createCardStyle(tokens, { elevation: 'sm' }),
              padding: tokens.spacing[6],
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{
              height: 24,
              width: '40%',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[200],
              marginBottom: tokens.spacing[3],
            }} />
            <div style={{
              height: 16,
              width: '70%',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[100],
              marginBottom: tokens.spacing[2],
            }} />
            <div style={{
              height: 16,
              width: '55%',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[100],
            }} />
          </div>
        ))}
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────

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
        {/* Page header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
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
              SCIM Directory Sync
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Monitor synchronization health and manage identity provider configuration
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: config.status === 'syncing' ? tokens.colors.infoScale[50] : config.status === 'synced' ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${config.status === 'syncing' ? tokens.colors.infoScale[200] : config.status === 'synced' ? tokens.colors.successScale[200] : tokens.colors.neutral[200]}`,
            }}>
              {config.status === 'syncing' ? (
                <Loader2 size={12} color={tokens.colors.infoScale[600]} style={{ animation: 'spin 1s linear infinite' }} />
              ) : config.status === 'synced' ? (
                <Wifi size={12} color={tokens.colors.successScale[600]} />
              ) : (
                <WifiOff size={12} color={tokens.colors.neutral[500]} />
              )}
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: config.status === 'syncing' ? tokens.colors.infoScale[700] : config.status === 'synced' ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
              }}>
                {config.status === 'syncing' ? 'Sync in progress' : config.status === 'synced' ? 'Connected' : config.status === 'error' ? 'Connection error' : config.status === 'paused' ? 'Paused' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {loading ? renderLoadingSkeleton() : (
          <>
            {renderHeroCard()}
            {renderStatsRow()}
            {renderMappingsTable()}
            {renderSyncConfiguration()}
            {renderRecentActivity()}
          </>
        )}
      </div>
    );
  },
});
