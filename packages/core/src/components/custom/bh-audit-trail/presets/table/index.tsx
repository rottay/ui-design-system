'use client';

/**
 * BhAuditTrail - Table Preset
 * Sortable data-table view of audit events with inline filters,
 * expandable row diffs, sort controls, live mode, and export.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhAuditTrailProps,
  AuditEvent,
  AuditFilter,
  EntityType,
  ActionType,
} from '../../core';
import {
  getEntityTypeColors,
  getActionTypeColors,
  formatAuditTimestamp,
} from '../../core';
import {
  Activity,
  User,
  Briefcase,
  Video,
  FileText,
  Users,
  Settings,
  Plus,
  Pencil,
  ArrowRightLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Download,
  Radio,
  Globe,
  Clock,
  ArrowUpDown,
  Eye,
  Layers,
  UserCheck,
  Zap,
} from 'lucide-react';

type SortField = 'timestamp' | 'userName' | 'entityType' | 'actionType' | 'entityName';
type SortDir = 'asc' | 'desc';

function getEntityIcon(entityType: EntityType, size: number) {
  switch (entityType) {
    case 'candidate':
      return <User size={size} />;
    case 'job':
      return <Briefcase size={size} />;
    case 'interview':
      return <Video size={size} />;
    case 'offer':
      return <FileText size={size} />;
    case 'team':
      return <Users size={size} />;
    case 'settings':
      return <Settings size={size} />;
  }
}

function getActionLabel(actionType: ActionType): string {
  switch (actionType) {
    case 'created':
      return 'Created';
    case 'updated':
      return 'Updated';
    case 'state_change':
      return 'State Change';
    case 'deleted':
      return 'Deleted';
  }
}

export const TableBhAuditTrail = createPreset<BhAuditTrailProps>({
  name: 'BhAuditTrail.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAuditTrailProps>) => {
    const { Box, Stack } = primitives;

    const {
      events: externalEvents = [],
      stats: externalStats,
      filters: externalFilters,
      onFilterChange,
      selectedEvent: externalSelectedEvent,
      onEventSelect,
      showDetail: externalShowDetail = false,
      onDetailToggle,
      liveMode: externalLiveMode = false,
      onLiveModeToggle,
      onExport,
      className,
      style,
    } = props;

    const [filters, setFilters] = useState<AuditFilter>(externalFilters ?? {});
    const [selectedEvent, setSelectedEvent] = useState<string | null>(
      externalSelectedEvent ?? null
    );
    const [liveMode, setLiveMode] = useState(externalLiveMode);
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
      if (externalFilters) setFilters(externalFilters);
    }, [externalFilters]);
    useEffect(() => {
      if (externalSelectedEvent !== undefined) setSelectedEvent(externalSelectedEvent);
    }, [externalSelectedEvent]);
    useEffect(() => { setLiveMode(externalLiveMode); }, [externalLiveMode]);

    const handleFilterChange = useCallback(
      (next: AuditFilter) => {
        setFilters(next);
        onFilterChange?.(next);
      },
      [onFilterChange]
    );

    const handleEventSelect = useCallback(
      (eventId: string | null) => {
        setSelectedEvent(eventId);
        onEventSelect?.(eventId);
      },
      [onEventSelect]
    );

    const handleLiveModeToggle = useCallback(() => {
      const next = !liveMode;
      setLiveMode(next);
      onLiveModeToggle?.();
    }, [liveMode, onLiveModeToggle]);

    const handleSort = useCallback((field: SortField) => {
      setSortField((prev) => {
        if (prev === field) {
          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
          return prev;
        }
        setSortDir('asc');
        return field;
      });
    }, []);

    const toggleRow = useCallback((eventId: string) => {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    }, []);

    const isGlass = engine === 'modern';
    const entityColors = getEntityTypeColors(tokens);
    const actionColors = getActionTypeColors(tokens);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const pulseKeyframes = `
      @keyframes bhAuditTablePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;

    const filteredSorted = useMemo(() => {
      let result = externalEvents.filter((ev) => {
        if (filters.entityType && ev.entityType !== filters.entityType) return false;
        if (filters.actionType && ev.actionType !== filters.actionType) return false;
        if (filters.userId && ev.userName !== filters.userId) return false;
        return true;
      });

      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'timestamp':
            cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            break;
          case 'userName':
            cmp = a.userName.localeCompare(b.userName);
            break;
          case 'entityType':
            cmp = a.entityType.localeCompare(b.entityType);
            break;
          case 'actionType':
            cmp = a.actionType.localeCompare(b.actionType);
            break;
          case 'entityName':
            cmp = a.entityName.localeCompare(b.entityName);
            break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });

      return result;
    }, [externalEvents, filters, sortField, sortDir]);

    /* ---- Stats Bar ---- */
    const renderStatsBar = () => {
      if (!externalStats) return null;

      const statItems = [
        { label: 'Total Events', value: externalStats.totalEvents.toLocaleString(), icon: <Layers size={16} color={tokens.colors.primaryScale[600]} />, scale: tokens.colors.primaryScale },
        { label: 'Today', value: externalStats.eventsToday.toLocaleString(), icon: <Activity size={16} color={tokens.colors.infoScale[600]} />, scale: tokens.colors.infoScale },
        { label: 'Most Active', value: externalStats.mostActiveUser, icon: <UserCheck size={16} color={tokens.colors.successScale[600]} />, scale: tokens.colors.successScale },
        { label: 'Most Changed', value: externalStats.mostChangedEntity, icon: <Zap size={16} color={tokens.colors.warningScale[600]} />, scale: tokens.colors.warningScale },
      ];

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {statItems.map((s) => (
            <div key={s.label} style={cardBase}>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: (s.scale as any)[50], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <span style={{ ...sectionHeader, marginBottom: 0, display: 'block' }}>{s.label}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{s.value}</span>
                </div>
              </Stack>
            </div>
          ))}
        </div>
      );
    };

    /* ---- Toolbar ---- */
    const renderToolbar = () => {
      return (
        <div style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between">
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                {filteredSorted.length} event{filteredSorted.length !== 1 ? 's' : ''}
              </span>
              {filters.entityType && (
                <span style={{ ...createBadgeStyle(tokens, 'primary') }}>
                  {filters.entityType}
                  <button
                    onClick={() => handleFilterChange({ ...filters, entityType: undefined })}
                    style={{ marginLeft: 4, border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'inherit' }}
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.actionType && (
                <span style={{ ...createBadgeStyle(tokens, 'info') }}>
                  {filters.actionType.replace('_', ' ')}
                  <button
                    onClick={() => handleFilterChange({ ...filters, actionType: undefined })}
                    style={{ marginLeft: 4, border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'inherit' }}
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </Stack>

            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <button
                onClick={handleLiveModeToggle}
                style={{
                  ...hoverTransition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${liveMode ? tokens.colors.successScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: liveMode ? tokens.colors.successScale[50] : tokens.colors.common.white,
                  color: liveMode ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Radio size={12} style={liveMode ? { animation: 'bhAuditTablePulse 2s ease-in-out infinite' } : undefined} />
                {liveMode ? 'Live' : 'Paused'}
              </button>
              {onExport && (
                <>
                  <button onClick={() => onExport('csv')} style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
                    <Download size={12} />CSV
                  </button>
                  <button onClick={() => onExport('json')} style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
                    <Download size={12} />JSON
                  </button>
                </>
              )}
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ---- Sortable Header ---- */
    const SortHeader = ({
      field,
      children,
    }: {
      field: SortField;
      children: React.ReactNode;
    }) => {
      const active = sortField === field;
      return (
        <th
          onClick={() => handleSort(field)}
          style={{
            ...hoverTransition,
            padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
            textAlign: 'left' as const,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            color: active ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
            fontWeight: tokens.typography.fontWeight.semibold,
            fontSize: tokens.typography.fontSize.xs,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap' as const,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            userSelect: 'none' as const,
          }}
        >
          <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
            {children}
            {active ? (
              sortDir === 'asc' ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )
            ) : (
              <ArrowUpDown size={12} color={tokens.colors.neutral[300]} />
            )}
          </Stack>
        </th>
      );
    };

    /* ---- Data Table ---- */
    const renderTable = () => {
      if (filteredSorted.length === 0) {
        return (
          <div style={{ ...cardBase, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
            <Activity size={32} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[3] }} />
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0 }}>No audit events match your filters</p>
          </div>
        );
      }

      return (
        <div style={{ ...cardBase, overflowX: 'auto' as const, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
            <thead>
              <tr>
                <th style={{ width: 32, padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }} />
                <SortHeader field="timestamp">Time</SortHeader>
                <SortHeader field="userName">User</SortHeader>
                <SortHeader field="actionType">Action</SortHeader>
                <SortHeader field="entityType">Entity</SortHeader>
                <SortHeader field="entityName">Name</SortHeader>
                <th style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((event) => {
                const eColor = entityColors[event.entityType];
                const aColor = actionColors[event.actionType];
                const isExpanded = expandedRows.has(event.id);
                const isSelected = selectedEvent === event.id;
                const hasDiff = event.beforeState && event.afterState && Object.keys(event.beforeState).length > 0;

                return (
                  <React.Fragment key={event.id}>
                    <tr
                      onClick={() => handleEventSelect(event.id)}
                      style={{
                        ...hoverTransition,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      }}
                    >
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'center' as const }}>
                        {hasDiff && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleRow(event.id); }}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400] }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, whiteSpace: 'nowrap' as const }}>
                        <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                          <Clock size={12} color={tokens.colors.neutral[400]} />
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                            {formatAuditTimestamp(event.timestamp)}
                          </span>
                        </Stack>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                          {event.userAvatar ? (
                            <img src={event.userAvatar} alt={event.userName} style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, objectFit: 'cover' as const }} />
                          ) : (
                            <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={12} color={tokens.colors.neutral[500]} />
                            </div>
                          )}
                          <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{event.userName}</span>
                        </Stack>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: aColor.bg, color: aColor.color }}>
                          {getActionLabel(event.actionType)}
                        </span>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                          <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: eColor.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: eColor.color, fontWeight: tokens.typography.fontWeight.medium }}>{event.entityType}</span>
                        </Stack>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                        {event.entityName}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {event.ipAddress || '-'}
                      </td>
                    </tr>

                    {/* Expanded diff row */}
                    {isExpanded && hasDiff && event.beforeState && event.afterState && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, backgroundColor: tokens.colors.neutral[50] }}>
                            <div style={{ borderRadius: tokens.borderRadius.md, overflow: 'hidden', border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                              {Object.keys({ ...event.beforeState, ...event.afterState }).map((key) => {
                                const before = event.beforeState?.[key];
                                const after = event.afterState?.[key];
                                if (JSON.stringify(before) === JSON.stringify(after)) return null;
                                return (
                                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.xs }}>
                                    <div style={{ padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.neutral[50], fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], fontFamily: 'monospace', borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{key}</div>
                                    <div style={{ padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontFamily: 'monospace', borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, wordBreak: 'break-all' as const }}>{before !== undefined ? String(before) : '(none)'}</div>
                                    <div style={{ padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[50], color: tokens.colors.successScale[700], fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{after !== undefined ? String(after) : '(none)'}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <style>{pulseKeyframes}</style>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5], maxWidth: 1400, margin: '0 auto' }}>
          {renderStatsBar()}
          {renderToolbar()}
          {renderTable()}
        </div>
      </div>
    );
  },
});
