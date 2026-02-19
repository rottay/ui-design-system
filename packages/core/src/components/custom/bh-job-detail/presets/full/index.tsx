'use client';

/**
 * BhJobDetail - Full Preset
 * Complete job detail page with header, metrics, funnel, candidates, template,
 * activity timeline, analytics charts, and settings panel
 */

import React, { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createHoverStyle,
  createSurfaceStyle,
  getHoverTransform,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createIconContainerStyle,
  createEmptyStateStyle,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhJobDetailProps, JobDetailTab, MetricsTimeRange, JobInfo } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Building2, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus,
  MoreVertical, Edit3, Pause, XCircle, Copy, Users, BarChart3, Settings, Eye,
  ChevronDown, ChevronRight, User, CheckCircle2, XOctagon, Timer, Zap, FileText,
  Bot, ClipboardList, Bell, Shield, Save,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function statusColors(status: string, t: DesignTokens) {
  const m: Record<string, [string, string]> = { draft: ['neutral', '600'], open: ['successScale', '700'], paused: ['warningScale', '700'], closed: ['neutral', '600'], filled: ['primaryScale', '700'], new: ['infoScale', '700'], screening: ['warningScale', '700'], interview: ['primaryScale', '700'], offer: ['successScale', '700'], hired: ['successScale', '800'], rejected: ['errorScale', '700'], withdrawn: ['neutral', '500'] };
  const [scale, shade] = m[status] ?? ['neutral', '600'];
  const s = t.colors[scale as keyof typeof t.colors] as Record<number, string>;
  return { bg: s[100], color: s[Number(shade)], border: s[200] };
}

function urgencyColors(urgency: string, t: DesignTokens) {
  const m: Record<string, string> = { low: 'neutral', medium: 'infoScale', high: 'warningScale', critical: 'errorScale' };
  const s = t.colors[(m[urgency] ?? 'neutral') as keyof typeof t.colors] as Record<number, string>;
  return { bg: s[100], color: s[700], border: s[200] };
}

function eventIcon(type: string, t: DesignTokens) {
  const sz = 14;
  const m: Record<string, { icon: React.ReactNode; color: string }> = {
    created: { icon: <FileText size={sz} />, color: t.colors.primaryScale[500] },
    opened: { icon: <CheckCircle2 size={sz} />, color: t.colors.successScale[500] },
    'candidate-added': { icon: <User size={sz} />, color: t.colors.infoScale[500] },
    'stage-change': { icon: <ChevronRight size={sz} />, color: t.colors.warningScale[500] },
    'interview-scheduled': { icon: <Timer size={sz} />, color: t.colors.primaryScale[500] },
    'offer-sent': { icon: <Zap size={sz} />, color: t.colors.successScale[500] },
    closed: { icon: <XOctagon size={sz} />, color: t.colors.neutral[400] },
    note: { icon: <FileText size={sz} />, color: t.colors.neutral[400] },
  };
  return m[type] ?? { icon: <FileText size={sz} />, color: t.colors.neutral[400] };
}

function timeAgo(date: Date | null | undefined): string {
  if (!date) return '';
  const d = Math.floor((Date.now() - date.getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function scoreColor(pct: number, t: DesignTokens) {
  return pct >= 75 ? t.colors.successScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];
}

function TrendIcon({ trend, size = 12 }: { trend?: string; size?: number }) {
  if (trend === 'up') return <TrendingUp size={size} />;
  if (trend === 'down') return <TrendingDown size={size} />;
  return <Minus size={size} />;
}

function trendColor(trend: string | undefined, t: DesignTokens) {
  return trend === 'up' ? t.colors.successScale[600] : trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500];
}

const SOURCE_COLORS = ['primaryScale', 'infoScale', 'successScale', 'warningScale', 'secondaryScale', 'errorScale'] as const;

/* ------------------------------------------------------------------ */
/*  Full Preset                                                         */
/* ------------------------------------------------------------------ */

export const FullBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Full',
  ({ primitives, props, tokens }: PresetContext<BhJobDetailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const JOB_INFO_DEFAULT: JobInfo = { title: '', code: '', status: 'draft', clientName: '', daysOpen: 0, urgency: 'low' };
    const { jobInfo: _jobInfo = JOB_INFO_DEFAULT, metrics: rawMetrics = [], funnelStages: rawFunnelStages = [], candidates: rawCandidates = [], templateInfo, events: rawEvents = [], analytics, settings, activeTab: activeTabProp, onTabChange, onEdit, onPause, onClose, onDuplicate, onCandidateClick, onSettingsSave, className, style } = props;

    const metrics = Array.isArray(rawMetrics) ? rawMetrics : [];
    const funnelStages = Array.isArray(rawFunnelStages) ? rawFunnelStages : [];
    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];
    const events = Array.isArray(rawEvents) ? rawEvents : [];
    const jobInfo = _jobInfo ?? JOB_INFO_DEFAULT;

    const [internalTab, setInternalTab] = useState<JobDetailTab>('overview');
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
    const [metricsTimeRange, setMetricsTimeRange] = useState<MetricsTimeRange>('30d');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ funnel: true, candidates: true, template: true, activity: true });
    const [showActionMenu, setShowActionMenu] = useState(false);

    const activeTab = activeTabProp ?? internalTab;
    const handleTabChange = useCallback((tab: JobDetailTab) => { onTabChange?.(tab); setInternalTab(tab); }, [onTabChange]);
    const toggleSection = useCallback((key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] })), []);
    const toggleCandidate = useCallback((id: string) => setSelectedCandidates(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
    const handleKeyAction = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    const glassCard = isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.glass.border}` } : {};
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const tabs: { key: JobDetailTab; label: string; icon: React.ReactNode }[] = [
      { key: 'overview', label: 'Overview', icon: <Eye size={14} /> },
      { key: 'candidates', label: 'Candidates', icon: <Users size={14} /> },
      { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
      { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    ];

    const sectionPad = `0 ${t.spacing[6]}px ${t.spacing[4]}px`;

    /* -- Sub-components -------------------------------------------- */

    const Badge_ = useCallback(({ bg, color, border, children }: { bg: string; color: string; border: string; children: React.ReactNode }) => (
      <Text style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, backgroundColor: bg, color, border: `${bdr} ${border}`, textTransform: 'capitalize' as const }}>{children}</Text>
    ), [t, bdr]);

    const Avatar_ = useCallback(({ avatar, name, size = 28 }: { avatar?: string; name: string; size?: number }) => {
      if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' as const }} />;
      const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
      const divider = useMemo(() => createDividerStyle(t), [t]);
      const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

      return (
        <Text style={{ width: size, height: size, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], color: t.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>{(name || '').charAt(0).toUpperCase()}</Text>
      );
    }, [t]);

    const Checkbox_ = useCallback(({ checked, onClick }: { checked: boolean; onClick?: (e: React.MouseEvent) => void }) => (
      <Box role="checkbox" tabIndex={0} aria-checked={checked} aria-label={checked ? 'Deselect' : 'Select'} onClick={onClick} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => onClick?.({} as any))} style={{ width: 16, height: 16, borderRadius: t.borderRadius.sm, border: `${bdr} ${checked ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: checked ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {checked && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={t.colors.common.white} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </Box>
    ), [t, bdr, handleKeyAction]);

    const SectionHeader_ = useCallback(({ expanded, onToggle, label }: { expanded: boolean; onToggle: () => void; label: string }) => (
      <Box role="button" tabIndex={0} aria-expanded={expanded} aria-label={`Toggle ${label}`} onClick={onToggle} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, onToggle)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3], transition: `all ${t.motion.hover}` }}>
        {expanded ? <ChevronDown size={16} color={t.colors.neutral[500]} /> : <ChevronRight size={16} color={t.colors.neutral[500]} />}
        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[700], textTransform: 'uppercase' as const }}>{label}</Text>
      </Box>
    ), [t, ptypo, handleKeyAction]);

    const Toggle_ = useCallback(({ on }: { on: boolean }) => (
      <Box 
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{ width: 36, height: 20, borderRadius: t.borderRadius.full, backgroundColor: on ? t.colors.successScale[500] : t.colors.neutral[300], position: 'relative' as const, cursor: 'pointer', transition: `all ${t.motion.hover}` }} role="switch" aria-checked={on}>
        <Box style={{ width: 16, height: 16, borderRadius: t.borderRadius.full, backgroundColor: t.colors.common.white, position: 'absolute' as const, top: 2, left: on ? 18 : 2, transition: `all ${t.motion.hover}`, boxShadow: t.shadows.sm }} />
      </Box>
    ), [t]);

    const SettingRow_ = useCallback(({ label, children }: { label: string; children: React.ReactNode }) => (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, backgroundColor: t.colors.neutral[50], borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[100]}` }}>
        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{label}</Text>
        {children}
      </Box>
    ), [t, bdr]);

    /* Header */
    const renderHeader = useCallback(() => {
      const sc = statusColors(jobInfo.status, t);
      const uc = urgencyColors(jobInfo.urgency, t);
      const actions = [
        { label: 'Edit Job', icon: <Edit3 size={14} />, action: onEdit },
        { label: 'Pause Job', icon: <Pause size={14} />, action: onPause },
        { label: 'Close Job', icon: <XCircle size={14} />, action: onClose },
        { label: 'Duplicate', icon: <Copy size={14} />, action: onDuplicate },
      ];

      return (
        <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: `${t.spacing[5]}px ${t.spacing[6]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`, gap: t.spacing[4], flexWrap: 'wrap' as const }}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap' as const, marginBottom: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: t.typography.lineHeight.tight }}>{jobInfo.title}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[500], backgroundColor: t.colors.neutral[100], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md }}>{jobInfo.code}</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], flexWrap: 'wrap' as const }}>
              <Badge_ bg={sc.bg} color={sc.color} border={sc.border}><Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc.color }} />{jobInfo.status}</Badge_>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], color: t.colors.neutral[600], fontSize: t.typography.fontSize.sm }}><Building2 size={14} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{jobInfo.clientName}</Text></Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], color: t.colors.neutral[600], fontSize: t.typography.fontSize.sm }}><Clock size={14} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{jobInfo.daysOpen} days open</Text></Box>
              <Badge_ bg={uc.bg} color={uc.color} border={uc.border}><AlertTriangle size={12} />{jobInfo.urgency}</Badge_>
              {jobInfo.workMode && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: jobInfo.workMode === 'remote' ? t.colors.infoScale[100] : jobInfo.workMode === 'hybrid' ? t.colors.warningScale[100] : t.colors.neutral[100], color: jobInfo.workMode === 'remote' ? t.colors.infoScale[700] : jobInfo.workMode === 'hybrid' ? t.colors.warningScale[700] : t.colors.neutral[700], border: `${bdr} ${jobInfo.workMode === 'remote' ? t.colors.infoScale[200] : jobInfo.workMode === 'hybrid' ? t.colors.warningScale[200] : t.colors.neutral[200]}` }}>
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{jobInfo.workMode === 'remote' ? 'Remote' : jobInfo.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</Text>
                </Box>
              )}
            </Box>
          </Box>
          <Box style={{ position: 'relative' as const, flexShrink: 0 }}>
            <Box role="button" tabIndex={0} aria-label="Actions menu" aria-expanded={showActionMenu} onClick={() => setShowActionMenu(!showActionMenu)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => setShowActionMenu(!showActionMenu))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: t.spacing[9], height: t.spacing[9], border: `${bdr} ${t.colors.neutral[100]}`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.common.white, cursor: 'pointer', transition: `all ${t.motion.hover}`, color: t.colors.neutral[600] }}><MoreVertical size={16} /></Box>
            {showActionMenu && (
              <Box style={{ position: 'absolute' as const, top: '100%', right: 0, marginTop: t.spacing[1], backgroundColor: t.colors.common.white, borderRadius: t.borderRadius.lg, boxShadow: t.shadows.lg, border: `${bdr} ${t.colors.neutral[100]}`, zIndex: 50, minWidth: 180, padding: `${t.spacing[1]}px 0`, ...glassCard }} role="menu">
                {actions.map(a => (
                  <Box key={a.label} role="menuitem" tabIndex={0} aria-label={a.label} onClick={() => { a.action?.(); setShowActionMenu(false); }} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => { a.action?.(); setShowActionMenu(false); })} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: `all ${t.motion.hover}`, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{a.icon}<Text style={{ fontSize: 'inherit', color: 'inherit' }}>{a.label}</Text></Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      );
    }, [jobInfo, showActionMenu, t, bdr, glassCard, onEdit, onPause, onClose, onDuplicate, handleKeyAction, Badge_]);

    /* Tabs */
    const renderTabs = useCallback(() => (
      <Box style={{ display: 'flex', gap: 0, borderBottom: `${bdr} ${t.colors.neutral[100]}`, padding: `0 ${t.spacing[6]}px` }} role="tablist" aria-label="Job detail tabs">
        {tabs.map(tab => (
          <Box key={tab.key} role="tab" tabIndex={0} aria-selected={activeTab === tab.key} aria-label={tab.label} onClick={() => handleTabChange(tab.key)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleTabChange(tab.key))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[3]}px ${t.spacing[4]}px`, border: 'none', borderBottom: `${bdr} ${activeTab === tab.key ? t.colors.primaryScale[500] : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: t.typography.fontSize.sm, fontWeight: activeTab === tab.key ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, color: activeTab === tab.key ? t.colors.primaryScale[600] : t.colors.neutral[500], marginBottom: -1, transition: `all ${t.motion.hover}` }}>
            {tab.icon}<Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{tab.label}</Text>
          </Box>
        ))}
      </Box>
    ), [activeTab, t, bdr, handleTabChange, handleKeyAction]);

    /* Metrics */
    const renderMetrics = useCallback(() => {
      if (!metrics.length) return null;
      return (
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, 1fr)`, gap: t.spacing[3], padding: `${t.spacing[4]}px ${t.spacing[6]}px` }}>
          {metrics.slice(0, 6).map((m, i) => {
            const itemEntrance = createEntranceAnimation(t, { index: i });
            return (
              <Box key={i} style={{ ...cardBase, padding: `${t.spacing[3]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...itemEntrance.animate, transition: itemEntrance.transition }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{m.label}</Text>
                  {m.icon && <Box style={{ color: t.colors.neutral[400] }}>{m.icon}</Box>}
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{m.value}</Text>
                {m.trendValue !== undefined && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: trendColor(m.trend, t) }}>
                    <TrendIcon trend={m.trend} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{m.trend === 'up' ? '+' : ''}{m.trendValue}%</Text>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }, [metrics, cardBase, t]);

    /* Funnel */
    const renderFunnel = useCallback(() => {
      if (!funnelStages.length) return null;
      const maxCount = Math.max(...(funnelStages ?? []).map(s => s.count ?? 0), 1);
      const W = 600, stH = 36, gap = 12, maxBar = W - 200;
      const svgH = 60 + funnelStages.length * (stH + gap);

      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader_ expanded={!!expandedSections.funnel} onToggle={() => toggleSection('funnel')} label="Pipeline Funnel" />
          {expandedSections.funnel && (
            <Box style={{ ...cardBase, padding: t.spacing[4], overflow: 'auto' }}>
              <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{ display: 'block', maxWidth: W }} role="img" aria-label="Pipeline funnel chart">
                {funnelStages.map((stage, idx) => {
                  const y = 10 + idx * (stH + gap);
                  const bw = Math.max((stage.count / maxCount) * maxBar, 4);
                  const tw = idx === 0 ? bw : Math.max((funnelStages[idx - 1].count / maxCount) * maxBar, 4);
                  const x = 160;
                  return (
                    <g key={stage.name}>
                      <polygon points={`${x},${y} ${x + tw},${y} ${x + bw},${y + stH} ${x},${y + stH}`} fill={stage.color || t.colors.primaryScale[400]} opacity={0.85} />
                      <text x={10} y={y + stH / 2 + 4} fill={t.colors.neutral[700]} fontSize={12} fontWeight={t.typography.fontWeight.medium}>{stage.name}</text>
                      <text x={x + bw + 10} y={y + stH / 2 + 4} fill={t.colors.neutral[600]} fontSize={12} fontWeight={t.typography.fontWeight.semibold}>{stage.count} ({stage.percentage}%)</text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          )}
        </Box>
      );
    }, [funnelStages, expandedSections.funnel, cardBase, t, sectionPad, toggleSection, SectionHeader_]);

    /* Candidates */
    const renderCandidates = useCallback(() => {
      if (!candidates.length) return null;
      const display = activeTab === 'candidates' ? candidates : candidates.slice(0, 10);
      const gridCols = '40px 1fr 120px 160px 100px';

      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader_ expanded={!!expandedSections.candidates} onToggle={() => toggleSection('candidates')} label={`Top Candidates (${candidates.length})`} />
          {expandedSections.candidates && (
            <Box style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: gridCols, gap: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `${bdr} ${t.colors.neutral[100]}`, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                <Box /><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Candidate</Text><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Stage</Text><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Score</Text><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Status</Text>
              </Box>
              {display.map(c => {
                const csc = statusColors(c.status, t);
                const isSel = selectedCandidates.has(c.id);
                return (
                  <Box key={c.id} role="button" tabIndex={0} aria-label={`Candidate ${c.name}`} onClick={() => onCandidateClick?.(c.id)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => onCandidateClick?.(c.id))} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, alignItems: 'center', borderBottom: `${bdr} ${t.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: isSel ? t.colors.primaryScale[50] : t.colors.common.white, transition: `all ${t.motion.hover}` }}>
                    <Checkbox_ checked={isSel} onClick={(e) => { e.stopPropagation(); toggleCandidate(c.id); }} />
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}><Avatar_ avatar={c.avatar} name={c.name} /><Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{c.name}</Text></Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{c.stage}</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ flex: 1, height: 6, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                        <Box style={{ width: `${c.scorePercent}%`, height: '100%', backgroundColor: scoreColor(c.scorePercent, t), borderRadius: t.borderRadius.full, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], minWidth: 32, textAlign: 'right' as const }}>{c.scorePercent}%</Text>
                    </Box>
                    <Badge_ bg={csc.bg} color={csc.color} border={csc.border}>{c.status}</Badge_>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    }, [candidates, activeTab, selectedCandidates, expandedSections.candidates, cardBase, t, bdr, sectionPad, onCandidateClick, toggleSection, toggleCandidate, handleKeyAction, Badge_, Avatar_, Checkbox_, SectionHeader_]);

    /* Template */
    const renderTemplate = useCallback(() => {
      if (!templateInfo) return null;
      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader_ expanded={!!expandedSections.template} onToggle={() => toggleSection('template')} label="Hiring Template" />
          {expandedSections.template && (
            <Box style={{ ...cardBase, padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[3] }}>{templateInfo.name}</Text>
              {[
                { label: 'Stages', icon: <ClipboardList size={12} />, items: templateInfo.stages ?? [], render: (s: string, i: number) => (
                  <Box key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.xs, backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700], border: `${bdr} ${t.colors.primaryScale[200]}` }}>
                    <Text style={{ width: 16, height: 16, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], color: t.colors.primaryScale[600], fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: t.typography.fontWeight.semibold }}>{i + 1}</Text><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{s}</Text>
                  </Box>
                )},
                { label: 'AI Agents', icon: <Bot size={12} />, items: templateInfo.agents ?? [], render: (a: string, i: number) => <Text key={i} style={createBadgeStyle(t, 'info')}><Bot size={10} />{a}</Text> },
                { label: 'Rubrics', icon: <FileText size={12} />, items: templateInfo.rubrics ?? [], render: (r: string, i: number) => <Text key={i} style={createBadgeStyle(t, 'secondary')}>{r}</Text> },
              ].map(section => (
                <Box key={section.label} style={{ marginBottom: t.spacing[3] }}>
                  <Box style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[500], marginBottom: t.spacing[2], display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>{section.icon}<Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{section.label}</Text></Box>
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>{(section.items ?? []).map(section.render)}</Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    }, [templateInfo, expandedSections.template, cardBase, t, bdr, sectionPad, toggleSection, SectionHeader_]);

    /* Activity */
    const renderActivity = useCallback(() => {
      if (!events.length) return null;
      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader_ expanded={!!expandedSections.activity} onToggle={() => toggleSection('activity')} label="Recent Activity" />
          {expandedSections.activity && (
            <Box style={{ ...cardBase, padding: t.spacing[4] }}>
              {events.slice(0, 15).map((ev, idx) => {
                const em = eventIcon(ev.type, t);
                const isLast = idx === Math.min(events.length, 15) - 1;
                return (
                  <Box key={ev.id} style={{ ...animStyle(idx), display: 'flex', gap: t.spacing[3], position: 'relative' as const, paddingBottom: isLast ? 0 : t.spacing[3] }}>
                    {!isLast && <Box style={{ position: 'absolute' as const, left: 11, top: 24, bottom: 0, width: 2, backgroundColor: t.colors.neutral[200] }} />}
                    <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], color: em.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>{em.icon}</Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.normal }}>{ev.message}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400]}}>{timeAgo(ev.time)}</Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    }, [events, expandedSections.activity, cardBase, t, sectionPad, toggleSection, SectionHeader_]);

    /* Analytics */
    const renderAnalytics = useCallback(() => {
      if (!analytics) return <Box style={{ padding: `${t.spacing[8]}px ${t.spacing[6]}px`, textAlign: 'center' as const, color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}><Text style={{ fontSize: 'inherit', color: 'inherit' }}>No analytics data available.</Text></Box>;
      const { sources = [], timeToStage = [], scoreDistribution = [] } = analytics;
      const maxSrc = Math.max(...(sources ?? []).map(s => s.count ?? 0), 1);
      const maxDays = Math.max(...(timeToStage ?? []).map(s => Math.max(s.avgDays ?? 0, s.targetDays ?? 0)), 1);
      const maxBkt = Math.max(...(scoreDistribution ?? []).map(b => b.count ?? 0), 1);
      const hW = Math.min(60, 400 / Math.max((scoreDistribution ?? []).length, 1)), hH = 160;

      return (
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
          <Box style={{ display: 'flex', gap: t.spacing[2] }} role="radiogroup" aria-label="Time range">
            {(['7d', '14d', '30d', '90d'] as MetricsTimeRange[]).map(r => (
              <Box key={r} role="radio" tabIndex={0} aria-checked={metricsTimeRange === r} aria-label={`${r} range`} onClick={() => setMetricsTimeRange(r)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => setMetricsTimeRange(r))} style={{ padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${metricsTimeRange === r ? t.colors.primaryScale[300] : t.colors.neutral[200]}`, backgroundColor: metricsTimeRange === r ? t.colors.primaryScale[50] : t.colors.common.white, color: metricsTimeRange === r ? t.colors.primaryScale[600] : t.colors.neutral[600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{r}</Text>
              </Box>
            ))}
          </Box>

          <Box style={{ ...cardBase, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], marginBottom: t.spacing[3] }}>Source Breakdown</Text>
            {sources.map((src, idx) => (
              <Box key={src.name} style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2] }}>
                <Text style={{ width: 100, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const, flexShrink: 0 }}>{src.name}</Text>
                <Box style={{ flex: 1, maxWidth: 300, height: 18, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                  <Box style={{ width: `${(src.count / maxSrc) * 100}%`, height: '100%', backgroundColor: t.colors[SOURCE_COLORS[idx % SOURCE_COLORS.length]][idx === 5 ? 400 : 500], borderRadius: t.borderRadius.sm, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], minWidth: 60 }}>{src.count} ({src.percentage}%)</Text>
              </Box>
            ))}
          </Box>

          <Box style={{ ...cardBase, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], marginBottom: t.spacing[3] }}>Time to Stage (days)</Text>
            {timeToStage.map(e => (
              <Box key={e.stageName} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2] }}>
                <Text style={{ width: 100, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const, flexShrink: 0 }}>{e.stageName}</Text>
                <Box style={{ flex: 1, maxWidth: 240, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                  <Box style={{ height: 10, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                    <Box style={{ width: `${(e.avgDays / maxDays) * 100}%`, height: '100%', backgroundColor: e.avgDays > e.targetDays ? t.colors.errorScale[400] : t.colors.primaryScale[400], borderRadius: t.borderRadius.sm }} />
                  </Box>
                  <Box style={{ height: 6, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                    <Box style={{ width: `${(e.targetDays / maxDays) * 100}%`, height: '100%', backgroundColor: t.colors.neutral[300], borderRadius: t.borderRadius.sm }} />
                  </Box>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: e.avgDays > e.targetDays ? t.colors.errorScale[600] : t.colors.neutral[500], minWidth: 60 }}>{e.avgDays}d / {e.targetDays}d</Text>
              </Box>
            ))}
            <Box style={{ display: 'flex', gap: t.spacing[4], marginTop: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}><Box style={{ width: 12, height: 8, backgroundColor: t.colors.primaryScale[400], borderRadius: t.borderRadius.sm }} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>Actual</Text></Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}><Box style={{ width: 12, height: 6, backgroundColor: t.colors.neutral[300], borderRadius: t.borderRadius.sm }} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>Target</Text></Box>
            </Box>
          </Box>

          <Box style={{ ...cardBase, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], marginBottom: t.spacing[3] }}>Score Distribution</Text>
            <svg width="100%" viewBox={`0 0 ${scoreDistribution.length * (hW + 8) + 40} ${hH + 40}`} style={{ display: 'block', maxWidth: 500 }} role="img" aria-label="Score distribution chart">
              {scoreDistribution.map((b, i) => {
                const bH = (b.count / maxBkt) * hH, x = 20 + i * (hW + 8), y = hH - bH + 10;
                return (
                  <g key={b.range}>
                    <rect x={x} y={y} width={hW} height={bH} fill={t.colors.primaryScale[400]} rx={3} opacity={0.85} />
                    <text x={x + hW / 2} y={y - 4} textAnchor="middle" fill={t.colors.neutral[600]} fontSize={10} fontWeight={t.typography.fontWeight.medium}>{b.count}</text>
                    <text x={x + hW / 2} y={hH + 24} textAnchor="middle" fill={t.colors.neutral[500]} fontSize={9}>{b.range}</text>
                  </g>
                );
              })}
              <line x1={16} y1={hH + 10} x2={scoreDistribution.length * (hW + 8) + 20} y2={hH + 10} stroke={t.colors.neutral[200]} strokeWidth={1} />
            </svg>
          </Box>
        </Box>
      );
    }, [analytics, metricsTimeRange, cardBase, t, bdr, handleKeyAction]);

    /* Settings */
    const renderSettings = useCallback(() => {
      if (!settings) return <Box style={{ padding: `${t.spacing[8]}px ${t.spacing[6]}px`, textAlign: 'center' as const, color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}><Text style={{ fontSize: 'inherit', color: 'inherit' }}>No settings configured.</Text></Box>;

      const settingSections = [
        { icon: <ClipboardList size={16} color={t.colors.primaryScale[500]} />, label: 'Template Association', content: (
          <SettingRow_ label={`Template ID: ${settings.templateId ?? 'N/A'}`}><Box /></SettingRow_>
        )},
        { icon: <Bell size={16} color={t.colors.infoScale[500]} />, label: 'Notifications', content: (
          <SettingRow_ label="Email notifications"><Toggle_ on={settings.notifications ?? false} /></SettingRow_>
        )},
        { icon: <Shield size={16} color={t.colors.warningScale[500]} />, label: 'SLA Configuration', content: (
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            {[{ label: 'Max Days Open', value: settings.slaConfig?.maxDaysOpen ?? 0 }, { label: 'Max Days Per Stage', value: settings.slaConfig?.maxDaysPerStage ?? 0 }].map(item => (
              <SettingRow_ key={item.label} label={item.label}><Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{item.value} days</Text></SettingRow_>
            ))}
            <SettingRow_ label="Notify on Breach"><Toggle_ on={settings.slaConfig?.notifyOnBreach ?? false} /></SettingRow_>
          </Box>
        )},
      ];

      return (
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          {settingSections.map(s => (
            <Box key={s.label} style={{ ...cardBase, padding: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                {s.icon}<Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{s.label}</Text>
              </Box>
              {s.content}
            </Box>
          ))}
          {onSettingsSave && (
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box role="button" tabIndex={0} aria-label="Save settings" onClick={() => onSettingsSave(settings)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => onSettingsSave(settings))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, border: 'none', backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer', transition: `all ${t.motion.hover}` }}><Save size={14} /><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Save Settings</Text></Box>
            </Box>
          )}
        </Box>
      );
    }, [settings, cardBase, t, onSettingsSave, handleKeyAction, SettingRow_, Toggle_]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, backgroundColor: t.colors.common.white, borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[100]}`, boxShadow: t.shadows.lg, width: '100%', overflow: 'hidden', ...entrance.animate, transition: entrance.transition, ...glassCard, ...style }}>
        {accentBar && <Box style={accentBar} />}
        {renderHeader()}
        {renderTabs()}
        {activeTab === 'overview' && <>{renderMetrics()}{renderFunnel()}{renderCandidates()}{renderTemplate()}{jobInfo.benefits && jobInfo.benefits.length > 0 && (
          <Box style={{ padding: sectionPad }}>
            <SectionHeader_ expanded={true} onToggle={() => {}} label="Benefits & Perks" />
            <Box style={{ ...cardBase, padding: t.spacing[4] }}>
              <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>
                {jobInfo.benefits.map((benefit, idx) => (
                  <Text key={idx} style={createBadgeStyle(t, 'primary')}>{benefit}</Text>
                ))}
              </Box>
              {jobInfo.perks && jobInfo.perks.length > 0 && (
                <Box style={{ marginTop: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[500], marginBottom: t.spacing[2], display: 'block' }}>Perks</Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>
                    {jobInfo.perks.map((perk, idx) => (
                      <Text key={idx} style={createBadgeStyle(t, 'secondary')}>{perk}</Text>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}{renderActivity()}</>}
        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </Box>
    );
  },
);
