'use client';

/**
 * BhAuditTrail - Table Preset
 * Sortable data-table view of audit events with inline filters,
 * expandable row diffs, sort controls, live mode, and export.
 *
 * Design: Clean data table with generous row padding, tinted action/entity
 * badges, monospace diff view with before/after coloring, stat summary bar.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Activity,
  User,
  Briefcase,
  Video,
  FileText,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Download,
  Radio,
  Globe,
  Clock,
  ArrowUpDown,
  Layers,
  UserCheck,
  Zap,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ColorScale } from '../../../../../types';
import {
  createBadgeStyle,
  createCardStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createIconContainerStyle,
  createDividerStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,

  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type {
  BhAuditTrailProps,
  AuditEvent,
  AuditStats,
  AuditFilter,
  EntityType,
  ActionType,
} from '../../core';
import {
  getEntityTypeColors,
  getActionTypeColors,
  formatAuditTimestamp,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
type SortField = 'timestamp' | 'userName' | 'entityType' | 'actionType' | 'entityName';
type SortDir = 'asc' | 'desc';

function getEntityIcon(entityType: EntityType, size: number) {
  switch (entityType) {
    case 'candidate': return <User size={size} />;
    case 'job': return <Briefcase size={size} />;
    case 'interview': return <Video size={size} />;
    case 'offer': return <FileText size={size} />;
    case 'team': return <Users size={size} />;
    case 'settings': return <Settings size={size} />;
  }
}

function getActionLabel(actionType: ActionType): string {
  switch (actionType) {
    case 'created': return 'Created';
    case 'updated': return 'Updated';
    case 'state_change': return 'State Change';
    case 'deleted': return 'Deleted';
  }
}

/* ------------------------------------------------------------------ */
/*  Table Preset                                                       */
/* ------------------------------------------------------------------ */
export const TableBhAuditTrail = createPreset<BhAuditTrailProps>({
  name: 'BhAuditTrail.Table',
  render: ({ primitives, props, tokens }: PresetContext<BhAuditTrailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    /* -- Props with mock fallbacks ----------------------------------- */
    const {
      events: eventsProp,
      stats: statsProp,
      filters: externalFilters,
      onFilterChange,
      selectedEvent: externalSelected,
      onEventSelect,
      liveMode: externalLive = false,
      onLiveModeToggle,
      onExport,
      className,
      style,
    } = props;

    const events = eventsProp?.length ? eventsProp : [];
    const stats = statsProp ?? {} as Partial<AuditStats>;

    /* -- Internal state ---------------------------------------------- */
    const [filters, setFilters] = useState<AuditFilter>(externalFilters ?? {});
    const [selectedEvent, setSelectedEvent] = useState<string | null>(externalSelected ?? null);
    const [liveMode, setLiveMode] = useState(externalLive ?? false);
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const handleFilterChange = useCallback((next: AuditFilter) => { setFilters(next); onFilterChange?.(next); }, [onFilterChange]);
    const handleSelect = useCallback((id: string | null) => { setSelectedEvent(id); onEventSelect?.(id); }, [onEventSelect]);
    const handleLiveToggle = useCallback(() => { const n = !liveMode; setLiveMode(n); onLiveModeToggle?.(); }, [liveMode, onLiveModeToggle]);
    const handleSort = useCallback((field: SortField) => {
      setSortField((prev) => { if (prev === field) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return field; });
    }, []);
    const toggleRow = useCallback((id: string) => {
      setExpandedRows((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    }, []);

    /* -- Styles ------------------------------------------------------ */
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const entityColors = useMemo(() => getEntityTypeColors(t), [t]);
    const actionColors = useMemo(() => getActionTypeColors(t), [t]);
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[7] }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return {
          backdropFilter: t.glass.blur,
          WebkitBackdropFilter: t.glass.blur,
        };
      }
      return {};
    }, [t]);

    const pulseKeyframes = `@keyframes bhAuditTablePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`;

    /* -- Filtered & sorted data ------------------------------------- */
    const filteredSorted = useMemo(() => {
      let result = events.filter((ev) => {
        if (filters.entityType && ev.entityType !== filters.entityType) return false;
        if (filters.actionType && ev.actionType !== filters.actionType) return false;
        if (filters.userId && ev.userName !== filters.userId) return false;
        return true;
      });
      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'timestamp': cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); break;
          case 'userName': cmp = a.userName.localeCompare(b.userName); break;
          case 'entityType': cmp = a.entityType.localeCompare(b.entityType); break;
          case 'actionType': cmp = a.actionType.localeCompare(b.actionType); break;
          case 'entityName': cmp = a.entityName.localeCompare(b.entityName); break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return result;
    }, [events, filters, sortField, sortDir]);

    /* ================================================================ */
    /*  Inner Components                                                 */
    /* ================================================================ */

    /* -- Stat Card -------------------------------------------------- */
    const StatCard = ({ label, value, icon, scale }: { label: string; value: string | number; icon: React.ReactNode; scale: string }) => {
      const s = (t.colors as any)[scale];
      return (
        <Box style={{ ...card, display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
          <Box style={{
            ...createIconContainerStyle(t, { size: 40, color: s[50] }),
            color: s[600],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[500], textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing, display: 'block', marginBottom: t.spacing[1] }}>{label}</Text>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
          </Box>
        </Box>
      );
    };

    /* -- Sortable Column Header ------------------------------------- */
    const SortHeader = ({ field, children, width }: { field: SortField; children: React.ReactNode; width?: string | number }) => {
      const active = sortField === field;
      return (
        <Box
          onClick={() => handleSort(field)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(field); } }}
          role="columnheader"
          tabIndex={0}
          aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          style={{
            width,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
            cursor: 'pointer',
            userSelect: 'none' as const,
            color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
            fontWeight: t.typography.fontWeight.semibold,
            fontSize: t.typography.fontSize.xs,
            textTransform: typo.labelTransform,
            letterSpacing: typo.labelLetterSpacing,
            whiteSpace: 'nowrap' as const,
            transition: `color ${t.motion.hover}`,
          }}
        >
          {children}
          {active
            ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
            : <ArrowUpDown size={12} color={t.colors.neutral[300]} />
          }
        </Box>
      );
    };

    /* ================================================================ */
    /*  Render                                                           */
    /* ================================================================ */
    return (
      <Box
        className={className}
        role="region"
        aria-label="Audit Trail Table"
        style={{
          minHeight: '100%',
          backgroundColor: t.colors.neutral[50],
          padding: t.spacing[7],
          fontFamily: 'inherit',
          ...glassStyle,
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        <style>{pulseKeyframes}</style>

        <Box style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
          {/* ---- Stats Bar ------------------------------------------ */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
            <StatCard label="Total Events" value={stats.totalEvents ?? 0} icon={<Layers size={18} />} scale="primaryScale" />
            <StatCard label="Today" value={stats.eventsToday ?? 0} icon={<Activity size={18} />} scale="infoScale" />
            <StatCard label="Most Active" value={stats.mostActiveUser ?? '-'} icon={<UserCheck size={18} />} scale="successScale" />
            <StatCard label="Most Changed" value={stats.mostChangedEntity ?? '-'} icon={<Zap size={18} />} scale="warningScale" />
          </Box>

          {/* ---- Toolbar -------------------------------------------- */}
          <Box style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                {filteredSorted.length} event{filteredSorted.length !== 1 ? 's' : ''}
              </Text>
              {filters.entityType && (
                <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Text style={{ fontSize: 'inherit' }}>{filters.entityType}</Text>
                  <Box onClick={() => handleFilterChange({ ...filters, entityType: undefined })} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, entityType: undefined }); } }} role="button" tabIndex={0} aria-label="Clear entity filter" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <X size={10} />
                  </Box>
                </Box>
              )}
              {filters.actionType && (
                <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Text style={{ fontSize: 'inherit' }}>{filters.actionType.replace('_', ' ')}</Text>
                  <Box onClick={() => handleFilterChange({ ...filters, actionType: undefined })} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, actionType: undefined }); } }} role="button" tabIndex={0} aria-label="Clear action filter" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <X size={10} />
                  </Box>
                </Box>
              )}
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box
                onClick={handleLiveToggle}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLiveToggle(); } }}
                role="button"
                tabIndex={0}
                aria-pressed={liveMode}
                aria-label={liveMode ? 'Disable live mode' : 'Enable live mode'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${liveMode ? t.colors.successScale[300] : t.colors.neutral[200]}`,
                  backgroundColor: liveMode ? t.colors.successScale[50] : t.colors.common.white,
                  color: liveMode ? t.colors.successScale[700] : t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Radio size={12} style={liveMode ? { animation: 'bhAuditTablePulse 2s ease-in-out infinite' } : undefined} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{liveMode ? 'Live' : 'Paused'}</Text>
              </Box>
              {onExport && (
                <>
                  <Box onClick={() => onExport('csv')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExport('csv'); } }} role="button" tabIndex={0} aria-label="Export as CSV" style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md, border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Download size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>CSV</Text>
                  </Box>
                  <Box onClick={() => onExport('json')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExport('json'); } }} role="button" tabIndex={0} aria-label="Export as JSON" style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md, border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Download size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>JSON</Text>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* ---- Data Table ----------------------------------------- */}
          {filteredSorted.length === 0 ? (
            <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${t.spacing[10]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
              <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}><Activity size={32} /></Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>No audit events match your filters</Text>
            </Box>
          ) : (
            <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
              {/* Table header */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: '32px 140px 160px 110px 110px 1fr 120px',
                gap: t.spacing[2],
                padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.neutral[50],
              }}>
                <Box />
                <SortHeader field="timestamp">Time</SortHeader>
                <SortHeader field="userName">User</SortHeader>
                <SortHeader field="actionType">Action</SortHeader>
                <SortHeader field="entityType">Entity</SortHeader>
                <SortHeader field="entityName">Name</SortHeader>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>IP</Text>
              </Box>

              {/* Rows */}
              {filteredSorted.map((event, i) => {
                const eColor = entityColors[event.entityType];
                const aColor = actionColors[event.actionType];
                const isExpanded = expandedRows.has(event.id);
                const isSelected = selectedEvent === event.id;
                const hasDiff = event.beforeState && event.afterState && Object.keys(event.beforeState).length > 0;

                return (
                  <React.Fragment key={event.id}>
                    <Box
                      onClick={() => handleSelect(event.id)}
                      role="row"
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={`${event.userName} ${getActionLabel(event.actionType).toLowerCase()} ${event.entityName}`}
                      style={{
                        ...animStyle(i),
                        display: 'grid',
                        gridTemplateColumns: '32px 140px 160px 110px 110px 1fr 120px',
                        gap: t.spacing[2],
                        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                        borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                        backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                        cursor: 'pointer',
                        transition: `background-color ${t.motion.hover}`,
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e: any) => { if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                      onMouseLeave={(e: any) => { if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.common.white; }}
                    >
                      {/* Expand toggle */}
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasDiff && (
                          <Box onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleRow(event.id); }} role="button" tabIndex={0} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse changes' : 'Expand changes'} style={{ cursor: 'pointer', color: t.colors.neutral[400], display: 'flex' }}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Box>
                        )}
                      </Box>

                      {/* Time */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Clock size={12} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{formatAuditTimestamp(event.timestamp)}</Text>
                      </Box>

                      {/* User */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          ...createIconContainerStyle(t, { size: 24, color: t.colors.neutral[200] }),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <User size={12} color={t.colors.neutral[500]} />
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{event.userName}</Text>
                      </Box>

                      {/* Action badge */}
                      <Box>
                        <Box style={{ display: 'inline-flex', alignItems: 'center', padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeR, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: aColor.bg, color: aColor.color }}>
                          <Text style={{ fontSize: 'inherit' }}>{getActionLabel(event.actionType)}</Text>
                        </Box>
                      </Box>

                      {/* Entity */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: eColor.dot, flexShrink: 0 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: eColor.color, fontWeight: t.typography.fontWeight.medium }}>{event.entityType}</Text>
                      </Box>

                      {/* Name */}
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{event.entityName}</Text>

                      {/* IP */}
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>{event.ipAddress || '-'}</Text>
                    </Box>

                    {/* Expanded diff */}
                    {isExpanded && hasDiff && event.beforeState && event.afterState && (
                      <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[6]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}` }}>
                        <Box style={{ borderRadius: t.borderRadius.md, overflow: 'hidden', border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}` }}>
                          {/* Diff header */}
                          <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', backgroundColor: t.colors.neutral[100], padding: `${t.spacing[2]}px` }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Field</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Before</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>After</Text>
                          </Box>
                          {Object.keys({ ...event.beforeState, ...event.afterState }).map((key) => {
                            const before = event.beforeState?.[key];
                            const after = event.afterState?.[key];
                            if (JSON.stringify(before) === JSON.stringify(after)) return null;
                            return (
                              <Box key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`, fontSize: t.typography.fontSize.xs }}>
                                <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.neutral[50], fontFamily: 'monospace', fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}` }}>
                                  <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{key}</Text>
                                </Box>
                                <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.errorScale[50], color: t.colors.errorScale[700], fontFamily: 'monospace', borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, wordBreak: 'break-all' as const }}>
                                  <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{before !== undefined ? String(before) : '(none)'}</Text>
                                </Box>
                                <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.successScale[50], color: t.colors.successScale[700], fontFamily: 'monospace', wordBreak: 'break-all' as const }}>
                                  <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{after !== undefined ? String(after) : '(none)'}</Text>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
