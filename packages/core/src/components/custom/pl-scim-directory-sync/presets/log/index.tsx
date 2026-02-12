'use client';

/**
 * PlScimDirectorySync - Log Preset
 * Detailed sync log view with filters, expandable rows, stats, and attribute mappings
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlScimDirectorySyncProps,
  SyncOperationRecord,
  SyncProvider,
  SyncMapping,
  SyncOperationType,
  SyncOperationStatus,
  MappingDirection,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ArrowLeftRight,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

function getOperationStatusConfig(tokens: DesignTokens): Record<SyncOperationStatus, StatusConfig> {
  return {
    running: {
      label: 'Running',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
      dotColor: tokens.colors.infoScale[500],
    },
    completed: {
      label: 'Completed',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
    },
    failed: {
      label: 'Failed',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
    },
    partial: {
      label: 'Partial',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

// ─── Log Preset ───────────────────────────────────────────────────────────────

export const LogPlScimDirectorySync = createPreset<PlScimDirectorySyncProps>({
  name: 'PlScimDirectorySync.Log',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlScimDirectorySyncProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const OPERATION_STATUS_CONFIG = useMemo(() => getOperationStatusConfig(tokens), [tokens]);

    const {
      providers = [],
      operations = [],
      mappings = [],
      onOperationClick,
      onExportLogs,
      filterProviderId,
      filterOperationType,
      filterOperationStatus,
      filterDateStart,
      filterDateEnd,
      onFilterChange,
      className,
      style,
    } = props;

    // ─── State ──────────────────────────────────────────────────────────

    const [expandedOperationId, setExpandedOperationId] = useState<string | null>(null);
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showMappings, setShowMappings] = useState(false);

    // ─── Filtered Operations ────────────────────────────────────────────

    const filteredOperations = useMemo(() => {
      let result = [...operations];

      if (filterProviderId) {
        result = result.filter(op => op.providerId === filterProviderId);
      }
      if (filterOperationType) {
        result = result.filter(op => op.type === filterOperationType);
      }
      if (filterOperationStatus) {
        result = result.filter(op => op.status === filterOperationStatus);
      }
      if (filterDateStart) {
        result = result.filter(op => new Date(op.startedAt) >= new Date(filterDateStart));
      }
      if (filterDateEnd) {
        result = result.filter(op => new Date(op.startedAt) <= new Date(filterDateEnd));
      }

      return result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }, [operations, filterProviderId, filterOperationType, filterOperationStatus, filterDateStart, filterDateEnd]);

    // ─── Stats ──────────────────────────────────────────────────────────

    const stats = useMemo(() => {
      const total = filteredOperations.length;
      const successCount = filteredOperations.filter(op => op.status === 'completed').length;
      const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '0.0';
      const avgDuration = total > 0
        ? (filteredOperations.reduce((sum, op) => sum + (op.duration || 0), 0) / total).toFixed(1)
        : '0.0';

      const recentOps = filteredOperations.slice(0, 5);
      const olderOps = filteredOperations.slice(5, 10);
      const recentErrors = recentOps.reduce((sum, op) => sum + (op.stats.errors || 0), 0);
      const olderErrors = olderOps.reduce((sum, op) => sum + (op.stats.errors || 0), 0);
      const errorTrend = recentErrors > olderErrors ? 'up' : recentErrors < olderErrors ? 'down' : 'stable';

      return { total, successRate, avgDuration, errorTrend };
    }, [filteredOperations]);

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

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
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
            SCIM Sync Logs
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Detailed view of all sync operations and attribute mappings
          </p>
        </div>

        {onExportLogs && (
          <button
            onClick={onExportLogs}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
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
            }}
          >
            <Download size={16} />
            Export Logs
          </button>
        )}
      </div>
    );

    // ─── Render: Stats Bar ──────────────────────────────────────────────

    const renderStatsBar = () => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
        }}
      >
        <div
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            ...glassSurfaceStyle,
          }}
        >
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[1],
          }}>
            Total Operations
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}>
            {stats.total}
          </div>
        </div>

        <div
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            ...glassSurfaceStyle,
          }}
        >
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[1],
          }}>
            Success Rate
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.successScale[600],
          }}>
            {stats.successRate}%
          </div>
        </div>

        <div
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            ...glassSurfaceStyle,
          }}
        >
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[1],
          }}>
            Avg Duration
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}>
            {stats.avgDuration}s
          </div>
        </div>

        <div
          style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            ...glassSurfaceStyle,
          }}
        >
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[1],
          }}>
            Error Trend
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
          }}>
            {stats.errorTrend === 'up' && <TrendingUp size={20} color={tokens.colors.errorScale[600]} />}
            {stats.errorTrend === 'down' && <TrendingDown size={20} color={tokens.colors.successScale[600]} />}
            {stats.errorTrend === 'stable' && <Minus size={20} color={tokens.colors.neutral[400]} />}
            <span style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: stats.errorTrend === 'up' ? tokens.colors.errorScale[600] : stats.errorTrend === 'down' ? tokens.colors.successScale[600] : tokens.colors.neutral[600],
            }}>
              {stats.errorTrend === 'up' ? 'Rising' : stats.errorTrend === 'down' ? 'Falling' : 'Stable'}
            </span>
          </div>
        </div>
      </div>
    );

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
        flexWrap: 'wrap' as const,
      }}>
        <Filter size={16} color={tokens.colors.neutral[400]} />

        {/* Provider filter */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => {
              setShowProviderDropdown(!showProviderDropdown);
              setShowTypeDropdown(false);
              setShowStatusDropdown(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterProviderId ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filterProviderId ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: filterProviderId ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            {filterProviderId ? providers.find(p => p.id === filterProviderId)?.name || 'Provider' : 'All Providers'}
            <ChevronDown size={12} />
          </button>
          {showProviderDropdown && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[1],
              minWidth: 180,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
              ...glassSurfaceStyle,
            }}>
              <div
                onClick={() => {
                  onFilterChange?.({ providerId: undefined });
                  setShowProviderDropdown(false);
                }}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: !filterProviderId ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                  backgroundColor: !filterProviderId ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                All Providers
              </div>
              {providers.map(provider => (
                <div
                  key={provider.id}
                  onClick={() => {
                    onFilterChange?.({ providerId: provider.id });
                    setShowProviderDropdown(false);
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: filterProviderId === provider.id ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: filterProviderId === provider.id ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {provider.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type filter */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowProviderDropdown(false);
              setShowStatusDropdown(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterOperationType ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filterOperationType ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: filterOperationType ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            {filterOperationType || 'All Types'}
            <ChevronDown size={12} />
          </button>
          {showTypeDropdown && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[1],
              minWidth: 140,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
              ...glassSurfaceStyle,
            }}>
              {[null, 'full', 'incremental', 'manual'].map(type => (
                <div
                  key={type || 'all'}
                  onClick={() => {
                    onFilterChange?.({ operationType: type as SyncOperationType | undefined });
                    setShowTypeDropdown(false);
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: filterOperationType === type ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: filterOperationType === type ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All Types'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowProviderDropdown(false);
              setShowTypeDropdown(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterOperationStatus ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filterOperationStatus ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: filterOperationStatus ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            {filterOperationStatus || 'All Status'}
            <ChevronDown size={12} />
          </button>
          {showStatusDropdown && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[1],
              minWidth: 140,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
              ...glassSurfaceStyle,
            }}>
              {[null, 'running', 'completed', 'failed', 'partial'].map(status => (
                <div
                  key={status || 'all'}
                  onClick={() => {
                    onFilterChange?.({ operationStatus: status as SyncOperationStatus | undefined });
                    setShowStatusDropdown(false);
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: filterOperationStatus === status ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: filterOperationStatus === status ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Status'}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Mapping toggle */}
        {mappings.length > 0 && (
          <button
            onClick={() => setShowMappings(!showMappings)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showMappings ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: showMappings ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: showMappings ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            {showMappings ? 'Hide' : 'Show'} Attribute Mappings
          </button>
        )}
      </div>
    );

    // ─── Render: Attribute Mappings ────────────────────────────────────

    const renderAttributeMappings = () => {
      if (!showMappings || mappings.length === 0) return null;

      const getDirectionIcon = (direction: MappingDirection | undefined) => {
        if (!direction) return <ArrowLeftRight size={14} color={tokens.colors.neutral[400]} />;
        if (direction === 'inbound') return <ArrowLeft size={14} color={tokens.colors.neutral[400]} />;
        if (direction === 'outbound') return <ArrowRight size={14} color={tokens.colors.neutral[400]} />;
        return <ArrowLeftRight size={14} color={tokens.colors.neutral[400]} />;
      };

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[4],
            marginBottom: tokens.spacing[4],
            ...glassCardStyle,
          }}
        >
          <div style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[3],
          }}>
            Attribute Mappings
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {mappings.map((mapping, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: index % 2 === 0 ? tokens.colors.neutral[50] : 'transparent',
                }}
              >
                <div style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  {mapping.scimAttribute}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  {getDirectionIcon(mapping.direction)}
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {mapping.direction}
                  </span>
                </div>

                <div style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                }}>
                  {mapping.localAttribute}
                </div>

                {mapping.isRequired && (
                  <span style={{
                    ...createBadgeStyle(tokens, 'error'),
                    fontSize: '10px',
                  }}>
                    Required
                  </span>
                )}

                {mapping.transform && (
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.infoScale[600],
                    fontFamily: 'monospace',
                  }}>
                    {mapping.transform}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    // ─── Render: Operation Row ─────────────────────────────────────────

    const renderOperationRow = (operation: SyncOperationRecord) => {
      const provider = providers.find(p => p.id === operation.providerId);
      const statusCfg = OPERATION_STATUS_CONFIG[operation.status];
      const isExpanded = expandedOperationId === operation.id;

      return (
        <div key={operation.id}>
          {/* Main row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : 'transparent',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onClick={() => setExpandedOperationId(isExpanded ? null : operation.id)}
          >
            {/* Expand icon */}
            <div style={{ flexShrink: 0 }}>
              {isExpanded ? <ChevronUp size={16} color={tokens.colors.neutral[400]} /> : <ChevronDown size={16} color={tokens.colors.neutral[400]} />}
            </div>

            {/* Timestamp */}
            <div style={{ width: 160, flexShrink: 0 }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                {new Date(operation.startedAt).toLocaleString()}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                {formatDistanceToNow(new Date(operation.startedAt), { addSuffix: true })}
              </div>
            </div>

            {/* Provider */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[800],
              }}>
                {provider?.name || 'Unknown'}
              </div>
            </div>

            {/* Type */}
            <div style={{ width: 100, flexShrink: 0 }}>
              <span style={{
                ...createBadgeStyle(tokens, 'info'),
              }}>
                {operation.type}
              </span>
            </div>

            {/* Duration */}
            <div style={{ width: 80, textAlign: 'right' as const }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
              }}>
                {operation.duration ? formatDuration(operation.duration) : '-'}
              </div>
            </div>

            {/* Stats summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ textAlign: 'center' as const, minWidth: 50 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  Created
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  {operation.stats.usersCreated}
                </div>
              </div>
              <div style={{ textAlign: 'center' as const, minWidth: 50 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  Updated
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  {operation.stats.usersUpdated}
                </div>
              </div>
              <div style={{ textAlign: 'center' as const, minWidth: 50 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  Errors
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: operation.stats.errors > 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[700],
                }}>
                  {operation.stats.errors}
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ width: 100, flexShrink: 0 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusCfg.bgColor,
                color: statusCfg.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
              }}>
                {statusCfg.label}
              </span>
            </div>

            {/* Action */}
            <div style={{ flexShrink: 0 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOperationClick?.(operation.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                Details <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div style={{
              padding: tokens.spacing[4],
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: tokens.spacing[4],
                marginBottom: tokens.spacing[3],
              }}>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Users Created
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}>
                    {operation.stats.usersCreated}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Users Updated
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.infoScale[600],
                  }}>
                    {operation.stats.usersUpdated}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Users Deactivated
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.warningScale[600],
                  }}>
                    {operation.stats.usersDeactivated}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Groups Created
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}>
                    {operation.stats.groupsCreated}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Groups Updated
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.infoScale[600],
                  }}>
                    {operation.stats.groupsUpdated}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Total Errors
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.errorScale[600],
                  }}>
                    {operation.stats.errors}
                  </div>
                </div>
              </div>

              {/* Error details */}
              {operation.errorDetails && operation.errorDetails.length > 0 && (
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[700],
                    marginBottom: tokens.spacing[2],
                  }}>
                    Error Details ({operation.errorDetails.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {operation.errorDetails.map((error, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.errorScale[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                        }}
                      >
                        <div style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.errorScale[700],
                          marginBottom: 2,
                        }}>
                          {error.resource}
                        </div>
                        <div style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}>
                          {error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Operations Table ──────────────────────────────────────

    const renderOperationsTable = () => {
      if (filteredOperations.length === 0) {
        return (
          <div
            style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              ...createEmptyStateStyle(tokens),
              padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
              ...glassCardStyle,
            }}
          >
            <Clock size={48} color={tokens.colors.neutral[300]} />
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              marginTop: tokens.spacing[3],
              marginBottom: tokens.spacing[2],
            }}>
              No sync operations found
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
            }}>
              Try adjusting your filters or wait for syncs to complete
            </div>
          </div>
        );
      }

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: 0,
            overflow: 'hidden' as const,
            ...glassCardStyle,
          }}
        >
          {/* Table header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{ width: 16, flexShrink: 0 }} />
            <div style={{ width: 160, flexShrink: 0, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Timestamp
            </div>
            <div style={{ flex: 1, minWidth: 120, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Provider
            </div>
            <div style={{ width: 100, flexShrink: 0, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Type
            </div>
            <div style={{ width: 80, textAlign: 'right' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Duration
            </div>
            <div style={{ width: 200, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Stats Summary
            </div>
            <div style={{ width: 100, flexShrink: 0, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Status
            </div>
            <div style={{ width: 80, flexShrink: 0 }} />
          </div>

          {/* Table rows */}
          {filteredOperations.map(operation => renderOperationRow(operation))}
        </div>
      );
    };

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
        {renderHeader()}
        {renderStatsBar()}
        {renderFilterBar()}
        {renderAttributeMappings()}
        {renderOperationsTable()}
      </div>
    );
  },
});
