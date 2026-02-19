'use client';

/**
 * BhAuditTrail - Timeline Preset
 * Vertical timeline view of audit events with filter bar, expandable
 * before/after diff cards, event detail modal, stats bar, export,
 * and real-time mode toggle.
 *
 * Design: Chronological vertical timeline with color-coded entity dots,
 * card-based event entries, expandable inline diffs, and a detail modal.
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
  Plus,
  Pencil,
  ArrowRightLeft,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Download,
  Radio,
  Globe,
  Clock,
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
  createOverlayStyle,
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

/** Minimal shape for AI audit log fields accessed in this preset */
interface AiAuditEventLike {
  id?: string;
  action?: string;
  eventType?: string;
  model?: string;
  createdAt?: string | Date;
  tokensUsed?: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'job', label: 'Job' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'team', label: 'Team' },
  { value: 'settings', label: 'Settings' },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'state_change', label: 'State Change' },
  { value: 'deleted', label: 'Deleted' },
];

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

function getActionIcon(actionType: ActionType, size: number) {
  switch (actionType) {
    case 'created': return <Plus size={size} />;
    case 'updated': return <Pencil size={size} />;
    case 'state_change': return <ArrowRightLeft size={size} />;
    case 'deleted': return <Trash2 size={size} />;
  }
}

function getActionLabel(actionType: ActionType): string {
  switch (actionType) {
    case 'created': return 'created';
    case 'updated': return 'updated';
    case 'state_change': return 'changed state of';
    case 'deleted': return 'deleted';
  }
}

/* ------------------------------------------------------------------ */
/*  Timeline Preset                                                    */
/* ------------------------------------------------------------------ */
export const TimelineBhAuditTrail = createPreset<BhAuditTrailProps>({
  name: 'BhAuditTrail.Timeline',
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
      showDetail: externalShowDetail = false,
      onDetailToggle,
      liveMode: externalLive = false,
      onLiveModeToggle,
      onExport,
      aiAuditEvents: rawAiAuditEvents,
      viewMode: viewModeProp,
      exportRange: exportRangeProp,
      retentionDays: retentionDaysProp,
      className,
      style,
    } = props;

    const events = eventsProp?.length ? eventsProp : [];
    const stats = statsProp ?? {} as Partial<AuditStats>;
    const aiAuditEvents = Array.isArray(rawAiAuditEvents) ? rawAiAuditEvents : [];
    const viewMode = viewModeProp ?? 'timeline';
    const exportRange = exportRangeProp ?? null;
    const retentionDays = retentionDaysProp ?? undefined;

    /* -- Internal state ---------------------------------------------- */
    const [filters, setFilters] = useState<AuditFilter>(externalFilters ?? {});
    const [selectedEvent, setSelectedEvent] = useState<string | null>(externalSelected ?? null);
    const [showDetail, setShowDetail] = useState(externalShowDetail ?? false);
    const [liveMode, setLiveMode] = useState(externalLive ?? false);
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

    const handleFilterChange = useCallback((next: AuditFilter) => { setFilters(next); onFilterChange?.(next); }, [onFilterChange]);
    const handleSelect = useCallback((id: string | null) => {
      setSelectedEvent(id);
      onEventSelect?.(id);
      if (id) { setShowDetail(true); onDetailToggle?.(); }
    }, [onEventSelect, onDetailToggle]);
    const handleDetailClose = useCallback(() => {
      setShowDetail(false); setSelectedEvent(null); onDetailToggle?.(); onEventSelect?.(null);
    }, [onDetailToggle, onEventSelect]);
    const handleLiveToggle = useCallback(() => { const n = !liveMode; setLiveMode(n); onLiveModeToggle?.(); }, [liveMode, onLiveModeToggle]);
    const toggleExpanded = useCallback((id: string) => {
      setExpandedEvents((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
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
    const overlayStyle = useMemo(() => createOverlayStyle(t, 'medium'), [t]);
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

    const selectedObj = useMemo(() => events.find((e) => e.id === selectedEvent), [events, selectedEvent]);

    const filteredEvents = useMemo(() => events.filter((ev) => {
      if (filters.entityType && ev.entityType !== filters.entityType) return false;
      if (filters.actionType && ev.actionType !== filters.actionType) return false;
      if (filters.userId && ev.userName !== filters.userId) return false;
      return true;
    }), [events, filters]);

    const pulseKeyframes = `@keyframes bhAuditPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`;

    /* ================================================================ */
    /*  Inner Components                                                 */
    /* ================================================================ */

    /* -- Stat Card -------------------------------------------------- */
    const StatCard = ({ label, value, icon, scale }: { label: string; value: string | number; icon: React.ReactNode; scale: string }) => {
      const s = (t.colors as any)[scale] as ColorScale;
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

    /* -- Filter Pill ------------------------------------------------ */
    const FilterPill = ({ active, color, borderColor, children, onClick, label }: { active: boolean; color?: string; borderColor?: string; children: React.ReactNode; onClick: () => void; label?: string }) => (
      <Box
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-label={label}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
          borderRadius: t.borderRadius.full,
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${active ? (borderColor || t.colors.primaryScale[300]) : t.colors.neutral[200]}`,
          backgroundColor: active ? (color || t.colors.primaryScale[50]) : t.colors.common.white,
          color: active ? (color ? 'inherit' : t.colors.primaryScale[700]) : t.colors.neutral[600],
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.medium,
          cursor: 'pointer',
          transition: `all ${t.motion.hover}`,
        }}
      >
        {children}
      </Box>
    );

    /* -- Diff Table ------------------------------------------------- */
    const DiffTable = ({ before, after }: { before: Record<string, any>; after: Record<string, any> }) => (
      <Box style={{ borderRadius: t.borderRadius.md, overflow: 'hidden', border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, marginTop: t.spacing[2] }}>
        <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', backgroundColor: t.colors.neutral[100], padding: `${t.spacing[2]}px` }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Field</Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Before</Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>After</Text>
        </Box>
        {Object.keys({ ...before, ...after }).map((key) => {
          const b = before[key];
          const a = after[key];
          const changed = JSON.stringify(b) !== JSON.stringify(a);
          if (!changed) return null;
          return (
            <Box key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`, fontSize: t.typography.fontSize.xs }}>
              <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.neutral[50], fontFamily: 'monospace', fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}` }}>
                <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{key}</Text>
              </Box>
              <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.errorScale[50], color: t.colors.errorScale[700], fontFamily: 'monospace', borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, wordBreak: 'break-all' as const }}>
                <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{b !== undefined ? String(b) : '(none)'}</Text>
              </Box>
              <Box style={{ padding: t.spacing[2], backgroundColor: t.colors.successScale[50], color: t.colors.successScale[700], fontFamily: 'monospace', wordBreak: 'break-all' as const }}>
                <Text style={{ fontSize: 'inherit', fontFamily: 'monospace' }}>{a !== undefined ? String(a) : '(none)'}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    );

    /* ================================================================ */
    /*  Render                                                           */
    /* ================================================================ */
    return (
      <Box
        className={className}
        role="region"
        aria-label="Audit Trail Timeline"
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

          {/* ---- Info Bar: View Mode, Retention, Export Range --------- */}
          {(viewMode || retentionDays != null || exportRange) && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap' as const }}>
              {viewMode && (
                <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Layers size={11} />
                  <Text style={{ fontSize: 'inherit' }}>View: {viewMode}</Text>
                </Box>
              )}
              {retentionDays != null && (
                <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Clock size={11} />
                  <Text style={{ fontSize: 'inherit' }}>Retention: {retentionDays}d</Text>
                </Box>
              )}
              {exportRange && exportRange.length === 2 && (
                <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Download size={11} />
                  <Text style={{ fontSize: 'inherit' }}>Export: {exportRange[0]} - {exportRange[1]}</Text>
                </Box>
              )}
            </Box>
          )}

          {/* ---- Filter Bar ----------------------------------------- */}
          <Box style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>Entity:</Text>
              {ENTITY_OPTIONS.map((opt) => {
                const isActive = filters.entityType === opt.value;
                const eColor = entityColors[opt.value];
                return (
                  <FilterPill key={opt.value} active={isActive} color={isActive ? eColor.bg : undefined} borderColor={isActive ? eColor.border : undefined} onClick={() => handleFilterChange({ ...filters, entityType: isActive ? undefined : opt.value })} label={`Filter by ${opt.label}`}>
                    <Box style={{ color: isActive ? eColor.color : 'inherit', display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      {getEntityIcon(opt.value, 12)}
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                    </Box>
                  </FilterPill>
                );
              })}

              <Box style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[200], margin: `0 ${t.spacing[1]}px` }} />

              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>Action:</Text>
              {ACTION_OPTIONS.map((opt) => {
                const isActive = filters.actionType === opt.value;
                const aColor = actionColors[opt.value];
                return (
                  <FilterPill key={opt.value} active={isActive} color={isActive ? aColor.bg : undefined} borderColor={isActive ? aColor.bg : undefined} onClick={() => handleFilterChange({ ...filters, actionType: isActive ? undefined : opt.value })} label={`Filter by ${opt.label}`}>
                    <Box style={{ color: isActive ? aColor.color : 'inherit', display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      {getActionIcon(opt.value, 12)}
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                    </Box>
                  </FilterPill>
                );
              })}
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
                <Radio size={12} style={liveMode ? { animation: 'bhAuditPulse 2s ease-in-out infinite' } : undefined} />
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

          {/* ---- Timeline ------------------------------------------- */}
          {filteredEvents.length === 0 ? (
            <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${t.spacing[10]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
              <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}><Activity size={32} /></Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>No audit events match your filters</Text>
            </Box>
          ) : (
            <Box style={{ position: 'relative' as const }}>
              {/* Vertical line */}
              <Box style={{ position: 'absolute' as const, left: 19, top: 0, bottom: 0, width: 2, backgroundColor: t.colors.neutral[200] }} />

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
                {filteredEvents.map((event, idx) => {
                  const eColor = entityColors[event.entityType];
                  const aColor = actionColors[event.actionType];
                  const isExpanded = expandedEvents.has(event.id);
                  const isSelected = selectedEvent === event.id;
                  const hasDiff = event.beforeState && event.afterState && Object.keys(event.beforeState).length > 0;
                  const itemEntrance = createEntranceAnimation(t, { index: idx });

                  return (
                    <Box key={event.id} style={{ ...animStyle(idx), display: 'flex', gap: t.spacing[3], position: 'relative' as const, ...itemEntrance.animate, transition: itemEntrance.transition }}>
                      {/* Timeline dot */}
                      <Box style={{ width: 40, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: t.spacing[3], zIndex: 1 }}>
                        <Box style={{ width: 14, height: 14, borderRadius: t.borderRadius.full, backgroundColor: eColor.dot, border: `3px solid ${t.colors.common.white}`, boxShadow: t.shadows.sm }} />
                      </Box>

                      {/* Event card */}
                      <Box
                        onClick={() => handleSelect(event.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${event.userName} ${getActionLabel(event.actionType)} ${event.entityName}`}
                        style={{
                          ...card,
                          flex: 1,
                          borderLeft: `3px solid ${eColor.dot}`,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                          boxShadow: isSelected ? t.shadows.md : card.boxShadow,
                        }}
                        onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = t.shadows.md; }}
                        onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = isSelected ? t.shadows.md : (card.boxShadow as string) || ''; }}
                      >
                        {/* Header */}
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <Box style={{
                              ...createIconContainerStyle(t, { size: 28, color: t.colors.neutral[200] }),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <User size={14} color={t.colors.neutral[500]} />
                            </Box>
                            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                                {event.userName}
                              </Text>
                              {' '}
                              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                                {getActionLabel(event.actionType)}
                              </Text>
                              {' '}
                              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                                {event.entityName}
                              </Text>
                            </Box>
                          </Box>

                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                              {getEntityIcon(event.entityType, 10)}
                              <Text style={{ fontSize: 'inherit' }}>{event.entityType}</Text>
                            </Box>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: aColor.bg, color: aColor.color }}>
                              <Text style={{ fontSize: 'inherit' }}>{event.actionType.replace('_', ' ')}</Text>
                            </Box>
                          </Box>
                        </Box>

                        {/* Timestamp + IP */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: hasDiff ? t.spacing[2] : 0 }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <Clock size={12} color={t.colors.neutral[400]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatAuditTimestamp(event.timestamp)}</Text>
                          </Box>
                          {event.ipAddress && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                              <Globe size={12} color={t.colors.neutral[400]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>{event.ipAddress}</Text>
                            </Box>
                          )}
                          {event.relatedEvents && event.relatedEvents.length > 0 && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {event.relatedEvents.length} related event{event.relatedEvents.length > 1 ? 's' : ''}
                            </Text>
                          )}
                        </Box>

                        {/* Expandable diff */}
                        {hasDiff && (
                          <>
                            <Box
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleExpanded(event.id); }}
                              role="button"
                              tabIndex={0}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Hide changes' : 'Show changes'}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                                color: t.colors.primaryScale[600],
                                fontSize: t.typography.fontSize.xs,
                                fontWeight: t.typography.fontWeight.medium,
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>{isExpanded ? 'Hide changes' : 'Show changes'}</Text>
                            </Box>

                            {isExpanded && event.beforeState && event.afterState && (
                              <DiffTable before={event.beforeState} after={event.afterState} />
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ---- AI Audit Events ------------------------------------ */}
          {aiAuditEvents.length > 0 && (
            <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                <Box style={{ color: t.colors.secondaryScale[500] }}>
                  <Zap size={16} />
                </Box>
                <Text style={{ ...sectionHdr, marginBottom: 0 }}>AI Audit Events</Text>
                <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR }}>
                  <Text style={{ fontSize: 'inherit' }}>{aiAuditEvents.length}</Text>
                </Box>
              </Box>
              {aiAuditEvents.slice(0, 10).map((aiEvent, idx) => {
                const itemEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box key={aiEvent.id ?? `ai-${idx}`} style={{
                    ...animStyle(idx),
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.neutral[50],
                    ...itemEntrance.animate, transition: itemEntrance.transition,
                  }}>
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 28, color: t.colors.secondaryScale[100] }),
                      color: t.colors.secondaryScale[600],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={14} />
                    </Box>
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {(aiEvent as AiAuditEventLike).action ?? (aiEvent as AiAuditEventLike).eventType ?? 'AI Event'}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {(aiEvent as AiAuditEventLike).model ?? ''} {(aiEvent as AiAuditEventLike).createdAt ? `- ${new Date((aiEvent as AiAuditEventLike).createdAt!).toLocaleDateString()}` : ''}
                      </Text>
                    </Box>
                    {(aiEvent as AiAuditEventLike).tokensUsed != null && (
                      <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR }}>
                        <Text style={{ fontSize: 'inherit' }}>{(aiEvent as AiAuditEventLike).tokensUsed} tokens</Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ---- Detail Modal --------------------------------------- */}
          {showDetail && selectedObj && (() => {
            const eColor = entityColors[selectedObj.entityType];
            const aColor = actionColors[selectedObj.actionType];
            const hasDiff = selectedObj.beforeState && selectedObj.afterState && Object.keys(selectedObj.beforeState).length > 0;

            return (
              <Box
                style={{
                  position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
                  ...overlayStyle,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={handleDetailClose}
                role="dialog"
                aria-modal={true}
                aria-label="Audit event detail"
              >
                <Box
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  style={{
                    ...createCardStyle(t, { padding: t.spacing[8] }),
                    width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' as const,
                    backgroundColor: t.colors.common.white,
                  }}
                >
                  {/* Modal Header */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 44, color: eColor.bg }),
                        color: eColor.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getEntityIcon(selectedObj.entityType, 22)}
                      </Box>
                      <Box>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                          {selectedObj.entityName}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeR }}>
                            <Text style={{ fontSize: 'inherit' }}>{selectedObj.entityType}</Text>
                          </Box>
                          <Box style={{ display: 'inline-flex', alignItems: 'center', padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: aColor.bg, color: aColor.color }}>
                            <Text style={{ fontSize: 'inherit' }}>{selectedObj.actionType.replace('_', ' ')}</Text>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box onClick={handleDetailClose} role="button" tabIndex={0} aria-label="Close detail panel" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDetailClose(); } }} style={{ padding: t.spacing[2], backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.md, color: t.colors.neutral[600], cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${t.motion.hover}` }}>
                      <X size={18} />
                    </Box>
                  </Box>

                  {/* User info */}
                  <Box style={{ ...card, marginBottom: t.spacing[4] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 40, color: t.colors.neutral[200] }),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <User size={20} color={t.colors.neutral[500]} />
                      </Box>
                      <Box>
                        <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                          {selectedObj.userName}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <Clock size={12} color={t.colors.neutral[400]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatAuditTimestamp(selectedObj.timestamp)}</Text>
                          </Box>
                          {selectedObj.ipAddress && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                              <Globe size={12} color={t.colors.neutral[400]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>{selectedObj.ipAddress}</Text>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Full diff */}
                  {hasDiff && selectedObj.beforeState && selectedObj.afterState && (
                    <Box style={{ marginBottom: t.spacing[4] }}>
                      <Text style={{ ...sectionHdr, marginBottom: t.spacing[2], display: 'block' }}>Changes</Text>
                      <DiffTable before={selectedObj.beforeState} after={selectedObj.afterState} />
                    </Box>
                  )}

                  {/* Related events */}
                  {selectedObj.relatedEvents && selectedObj.relatedEvents.length > 0 && (
                    <Box>
                      <Text style={{ ...sectionHdr, marginBottom: t.spacing[2], display: 'block' }}>Related Events</Text>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                        {selectedObj.relatedEvents.map((relId, i) => {
                          const relEvent = events.find((e) => e.id === relId);
                          if (!relEvent) return null;
                          const relEColor = entityColors[relEvent.entityType];
                          return (
                            <Box
                              key={relId}
                              role="button"
                              tabIndex={0}
                              aria-label={`View related event: ${relEvent.userName} ${getActionLabel(relEvent.actionType)} ${relEvent.entityName}`}
                              onClick={() => handleSelect(relId)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(relId); } }}
                              style={{
                                ...animStyle(i),
                                ...card, cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                                <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: relEColor.dot, flexShrink: 0 }} />
                                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], flex: 1 }}>
                                  {relEvent.userName} {getActionLabel(relEvent.actionType)} {relEvent.entityName}
                                </Text>
                                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                  {formatAuditTimestamp(relEvent.timestamp)}
                                </Text>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Box>
    );
  },
});
