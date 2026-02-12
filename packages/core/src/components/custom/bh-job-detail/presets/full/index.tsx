'use client';

/**
 * BhJobDetail - Full Preset
 * Complete job detail page with header, metrics, funnel, candidates, template,
 * activity timeline, analytics charts, and settings panel
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle, getHoverTransform } from '../../../helpers';
import type { BhJobDetailProps, JobDetailTab, MetricsTimeRange } from '../../core';
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
  const s = (t.colors as any)[scale];
  return { bg: s[100], color: s[Number(shade)], border: s[200] };
}

function urgencyColors(urgency: string, t: DesignTokens) {
  const m: Record<string, string> = { low: 'neutral', medium: 'infoScale', high: 'warningScale', critical: 'errorScale' };
  const s = (t.colors as any)[m[urgency] ?? 'neutral'];
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

function timeAgo(date: Date): string {
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

/* Sub-components */
function Badge({ bg, color, border, children, tokens }: { bg: string; color: string; border: string; children: React.ReactNode; tokens: DesignTokens }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: bg, color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${border}`, textTransform: 'capitalize' as const }}>
      {children}
    </span>
  );
}

function Avatar({ avatar, name, tokens, size = 28 }: { avatar?: string; name: string; tokens: DesignTokens; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' as const }} />;
  return (
    <span style={{ width: size, height: size, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Checkbox({ checked, tokens, onClick }: { checked: boolean; tokens: DesignTokens; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={onClick} style={{ width: 16, height: 16, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: checked ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      {checked && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={tokens.colors.common.white} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function SectionHeader({ expanded, onToggle, label, tokens }: { expanded: boolean; onToggle: () => void; label: string; tokens: DesignTokens }) {
  return (
    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }} onClick={onToggle}>
      {expanded ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

function Toggle({ on, tokens }: { on: boolean; tokens: DesignTokens }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: tokens.borderRadius.full, backgroundColor: on ? tokens.colors.successScale[500] : tokens.colors.neutral[300], position: 'relative' as const, cursor: 'pointer', transition: `all ${tokens.motion.hover}` }}>
      <div style={{ width: 16, height: 16, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.common.white, position: 'absolute' as const, top: 2, left: on ? 18 : 2, transition: `all ${tokens.motion.hover}`, boxShadow: tokens.shadows.sm }} />
    </div>
  );
}

function SettingRow({ label, children, tokens }: { label: string; children: React.ReactNode; tokens: DesignTokens }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}` }}>
      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{label}</span>
      {children}
    </div>
  );
}

const SOURCE_COLORS = ['primaryScale', 'infoScale', 'successScale', 'warningScale', 'secondaryScale', 'errorScale'] as const;

/* ------------------------------------------------------------------ */
/*  Full Preset                                                         */
/* ------------------------------------------------------------------ */

export const FullBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Full',
  ({ primitives, props, tokens }: PresetContext<BhJobDetailProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const { jobInfo, metrics = [], funnelStages = [], candidates = [], templateInfo, events = [], analytics, settings, activeTab: activeTabProp, onTabChange, onEdit, onPause, onClose, onDuplicate, onCandidateClick, onSettingsSave, className, style } = props;

    const [internalTab, setInternalTab] = useState<JobDetailTab>('overview');
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
    const [metricsTimeRange, setMetricsTimeRange] = useState<MetricsTimeRange>('30d');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ funnel: true, candidates: true, template: true, activity: true });
    const [showActionMenu, setShowActionMenu] = useState(false);

    const activeTab = activeTabProp ?? internalTab;
    const handleTabChange = (tab: JobDetailTab) => { onTabChange?.(tab); setInternalTab(tab); };
    const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));
    const toggleCandidate = (id: string) => setSelectedCandidates(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const glassCard = isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}` } : {};
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const tabs: { key: JobDetailTab; label: string; icon: React.ReactNode }[] = [
      { key: 'overview', label: 'Overview', icon: <Eye size={14} /> },
      { key: 'candidates', label: 'Candidates', icon: <Users size={14} /> },
      { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
      { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    ];

    const sectionPad = `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px`;

    /* Header */
    const renderHeader = () => {
      const sc = statusColors(jobInfo.status, tokens);
      const uc = urgencyColors(jobInfo.urgency, tokens);
      const actions = [
        { label: 'Edit Job', icon: <Edit3 size={14} />, action: onEdit },
        { label: 'Pause Job', icon: <Pause size={14} />, action: onPause },
        { label: 'Close Job', icon: <XCircle size={14} />, action: onClose },
        { label: 'Duplicate', icon: <Copy size={14} />, action: onDuplicate },
      ];

      return (
        <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const, marginBottom: tokens.spacing[2] }}>
              <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>{jobInfo.title}</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[100], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md }}>{jobInfo.code}</Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
              <Badge bg={sc.bg} color={sc.color} border={sc.border} tokens={tokens}><Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sc.color }} />{jobInfo.status}</Badge>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}><Building2 size={14} />{jobInfo.clientName}</Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}><Clock size={14} />{jobInfo.daysOpen} days open</Box>
              <Badge bg={uc.bg} color={uc.color} border={uc.border} tokens={tokens}><AlertTriangle size={12} />{jobInfo.urgency}</Badge>
            </Box>
          </Box>
          <Box style={{ position: 'relative' as const, flexShrink: 0 }}>
            <button onClick={() => setShowActionMenu(!showActionMenu)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: tokens.spacing[9], height: tokens.spacing[9], border: `1px solid ${tokens.colors.neutral[100]}`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.common.white, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, color: tokens.colors.neutral[600], ...hoverStyle }}><MoreVertical size={16} /></button>
            {showActionMenu && (
              <Box style={{ position: 'absolute' as const, top: '100%', right: 0, marginTop: tokens.spacing[1], backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `1px solid ${tokens.colors.neutral[100]}`, zIndex: 50, minWidth: 180, padding: `${tokens.spacing[1]}px 0`, ...glassCard }}>
                {actions.map(a => (
                  <button key={a.label} onClick={() => { a.action?.(); setShowActionMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontFamily: 'inherit', textAlign: 'left' as const, ...hoverStyle }}>{a.icon}{a.label}</button>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    /* Tabs */
    const renderTabs = () => (
      <Box style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, padding: `0 ${tokens.spacing[6]}px` }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, border: 'none', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${activeTab === tab.key ? tokens.colors.primaryScale[500] : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.sm, fontWeight: activeTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium, color: activeTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500], fontFamily: 'inherit', marginBottom: -1 }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </Box>
    );

    /* Metrics */
    const renderMetrics = () => {
      if (!metrics.length) return null;
      return (
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, 1fr)`, gap: tokens.spacing[3], padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px` }}>
          {metrics.slice(0, 6).map((m, i) => (
            <Box key={i} style={{ ...cardBase, padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>{m.label}</Box>
                {m.icon && <Box style={{ color: tokens.colors.neutral[400] }}>{m.icon}</Box>}
              </Box>
              <Box style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{m.value}</Box>
              {m.trendValue !== undefined && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: trendColor(m.trend, tokens) }}>
                  <TrendIcon trend={m.trend} /><span>{m.trend === 'up' ? '+' : ''}{m.trendValue}%</span>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      );
    };

    /* Funnel */
    const renderFunnel = () => {
      if (!funnelStages.length) return null;
      const maxCount = Math.max(...funnelStages.map(s => s.count), 1);
      const W = 600, stH = 36, gap = 12, maxBar = W - 200;
      const svgH = 60 + funnelStages.length * (stH + gap);

      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader expanded={!!expandedSections.funnel} onToggle={() => toggleSection('funnel')} label="Pipeline Funnel" tokens={tokens} />
          {expandedSections.funnel && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4], overflow: 'auto' }}>
              <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{ display: 'block', maxWidth: W }}>
                {funnelStages.map((stage, idx) => {
                  const y = 10 + idx * (stH + gap);
                  const bw = Math.max((stage.count / maxCount) * maxBar, 4);
                  const tw = idx === 0 ? bw : Math.max((funnelStages[idx - 1].count / maxCount) * maxBar, 4);
                  const x = 160;
                  return (
                    <g key={stage.name}>
                      <polygon points={`${x},${y} ${x + tw},${y} ${x + bw},${y + stH} ${x},${y + stH}`} fill={stage.color || tokens.colors.primaryScale[400]} opacity={0.85} />
                      <text x={10} y={y + stH / 2 + 4} fill={tokens.colors.neutral[700]} fontSize={12} fontWeight={tokens.typography.fontWeight.medium}>{stage.name}</text>
                      <text x={x + bw + 10} y={y + stH / 2 + 4} fill={tokens.colors.neutral[600]} fontSize={12} fontWeight={tokens.typography.fontWeight.semibold}>{stage.count} ({stage.percentage}%)</text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          )}
        </Box>
      );
    };

    /* Candidates */
    const renderCandidates = () => {
      if (!candidates.length) return null;
      const display = activeTab === 'candidates' ? candidates : candidates.slice(0, 10);
      const gridCols = '40px 1fr 120px 160px 100px';

      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader expanded={!!expandedSections.candidates} onToggle={() => toggleSection('candidates')} label={`Top Candidates (${candidates.length})`} tokens={tokens} />
          {expandedSections.candidates && (
            <Box style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: gridCols, gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                <Box /><Box>Candidate</Box><Box>Stage</Box><Box>Score</Box><Box>Status</Box>
              </Box>
              {display.map(c => {
                const csc = statusColors(c.status, tokens);
                const isSel = selectedCandidates.has(c.id);
                return (
                  <Box key={c.id} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, alignItems: 'center', borderBottom: `1px solid ${tokens.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: isSel ? tokens.colors.primaryScale[50] : tokens.colors.common.white, transition: `all ${tokens.motion.hover}` }} onClick={() => onCandidateClick?.(c.id)}>
                    <Checkbox checked={isSel} tokens={tokens} onClick={(e) => { e.stopPropagation(); toggleCandidate(c.id); }} />
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}><Avatar avatar={c.avatar} name={c.name} tokens={tokens} /><Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{c.name}</Box></Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{c.stage}</Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{ flex: 1, height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <Box style={{ width: `${c.scorePercent}%`, height: '100%', backgroundColor: scoreColor(c.scorePercent, tokens), borderRadius: tokens.borderRadius.full, transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600], minWidth: 32, textAlign: 'right' as const }}>{c.scorePercent}%</Box>
                    </Box>
                    <Badge bg={csc.bg} color={csc.color} border={csc.border} tokens={tokens}>{c.status}</Badge>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    };

    /* Template */
    const renderTemplate = () => {
      if (!templateInfo) return null;
      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader expanded={!!expandedSections.template} onToggle={() => toggleSection('template')} label="Hiring Template" tokens={tokens} />
          {expandedSections.template && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[3] }}>{templateInfo.name}</Box>
              {[
                { label: 'Stages', icon: <ClipboardList size={12} />, items: templateInfo.stages, render: (s: string, i: number) => (
                  <Box key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}` }}>
                    <Box style={{ width: 16, height: 16, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: tokens.typography.fontWeight.semibold }}>{i + 1}</Box>{s}
                  </Box>
                )},
                { label: 'AI Agents', icon: <Bot size={12} />, items: templateInfo.agents, render: (a: string, i: number) => <Box key={i} style={createBadgeStyle(tokens, 'info')}><Bot size={10} />{a}</Box> },
                { label: 'Rubrics', icon: <FileText size={12} />, items: templateInfo.rubrics, render: (r: string, i: number) => <Box key={i} style={createBadgeStyle(tokens, 'secondary')}>{r}</Box> },
              ].map(section => (
                <Box key={section.label} style={{ marginBottom: tokens.spacing[3] }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>{section.icon}{section.label}</Box>
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>{section.items.map(section.render)}</Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    };

    /* Activity */
    const renderActivity = () => {
      if (!events.length) return null;
      return (
        <Box style={{ padding: sectionPad }}>
          <SectionHeader expanded={!!expandedSections.activity} onToggle={() => toggleSection('activity')} label="Recent Activity" tokens={tokens} />
          {expandedSections.activity && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              {events.slice(0, 15).map((ev, idx) => {
                const em = eventIcon(ev.type, tokens);
                const isLast = idx === Math.min(events.length, 15) - 1;
                return (
                  <Box key={ev.id} style={{ display: 'flex', gap: tokens.spacing[3], position: 'relative' as const, paddingBottom: isLast ? 0 : tokens.spacing[3] }}>
                    {!isLast && <Box style={{ position: 'absolute' as const, left: 11, top: 24, bottom: 0, width: 2, backgroundColor: tokens.colors.neutral[200] }} />}
                    <Box style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], color: em.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>{em.icon}</Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.normal }}>{ev.message}</Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>{timeAgo(ev.time)}</Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    };

    /* Analytics */
    const renderAnalytics = () => {
      if (!analytics) return <Box style={{ padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`, textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No analytics data available.</Box>;
      const { sources, timeToStage, scoreDistribution } = analytics;
      const maxSrc = Math.max(...sources.map(s => s.count), 1);
      const maxDays = Math.max(...timeToStage.map(s => Math.max(s.avgDays, s.targetDays)), 1);
      const maxBkt = Math.max(...scoreDistribution.map(b => b.count), 1);
      const hW = Math.min(60, 400 / Math.max(scoreDistribution.length, 1)), hH = 160;

      return (
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {(['7d', '14d', '30d', '90d'] as MetricsTimeRange[]).map(r => (
              <button key={r} onClick={() => setMetricsTimeRange(r)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${metricsTimeRange === r ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`, backgroundColor: metricsTimeRange === r ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: metricsTimeRange === r ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>{r}</button>
            ))}
          </Box>

          {/* Sources */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[3] }}>Source Breakdown</Box>
            {sources.map((src, idx) => (
              <Box key={src.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                <Box style={{ width: 100, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium, textAlign: 'right' as const, flexShrink: 0 }}>{src.name}</Box>
                <Box style={{ flex: 1, maxWidth: 300, height: 18, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                  <Box style={{ width: `${(src.count / maxSrc) * 100}%`, height: '100%', backgroundColor: tokens.colors[SOURCE_COLORS[idx % SOURCE_COLORS.length]][idx === 5 ? 400 : 500], borderRadius: tokens.borderRadius.sm, transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 60 }}>{src.count} ({src.percentage}%)</Box>
              </Box>
            ))}
          </Box>

          {/* Time to Stage */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[3] }}>Time to Stage (days)</Box>
            {timeToStage.map(e => (
              <Box key={e.stageName} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                <Box style={{ width: 100, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium, textAlign: 'right' as const, flexShrink: 0 }}>{e.stageName}</Box>
                <Box style={{ flex: 1, maxWidth: 240, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                  <Box style={{ height: 10, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                    <Box style={{ width: `${(e.avgDays / maxDays) * 100}%`, height: '100%', backgroundColor: e.avgDays > e.targetDays ? tokens.colors.errorScale[400] : tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.sm }} />
                  </Box>
                  <Box style={{ height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                    <Box style={{ width: `${(e.targetDays / maxDays) * 100}%`, height: '100%', backgroundColor: tokens.colors.neutral[300], borderRadius: tokens.borderRadius.sm }} />
                  </Box>
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: e.avgDays > e.targetDays ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], minWidth: 60 }}>{e.avgDays}d / {e.targetDays}d</Box>
              </Box>
            ))}
            <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}><Box style={{ width: 12, height: 8, backgroundColor: tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.sm }} />Actual</Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}><Box style={{ width: 12, height: 6, backgroundColor: tokens.colors.neutral[300], borderRadius: tokens.borderRadius.sm }} />Target</Box>
            </Box>
          </Box>

          {/* Score Distribution */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[3] }}>Score Distribution</Box>
            <svg width="100%" viewBox={`0 0 ${scoreDistribution.length * (hW + 8) + 40} ${hH + 40}`} style={{ display: 'block', maxWidth: 500 }}>
              {scoreDistribution.map((b, i) => {
                const bH = (b.count / maxBkt) * hH, x = 20 + i * (hW + 8), y = hH - bH + 10;
                return (
                  <g key={b.range}>
                    <rect x={x} y={y} width={hW} height={bH} fill={tokens.colors.primaryScale[400]} rx={3} opacity={0.85} />
                    <text x={x + hW / 2} y={y - 4} textAnchor="middle" fill={tokens.colors.neutral[600]} fontSize={10} fontWeight={tokens.typography.fontWeight.medium}>{b.count}</text>
                    <text x={x + hW / 2} y={hH + 24} textAnchor="middle" fill={tokens.colors.neutral[500]} fontSize={9}>{b.range}</text>
                  </g>
                );
              })}
              <line x1={16} y1={hH + 10} x2={scoreDistribution.length * (hW + 8) + 20} y2={hH + 10} stroke={tokens.colors.neutral[200]} strokeWidth={1} />
            </svg>
          </Box>
        </Box>
      );
    };

    /* Settings */
    const renderSettings = () => {
      if (!settings) return <Box style={{ padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`, textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No settings configured.</Box>;

      const settingSections = [
        { icon: <ClipboardList size={16} color={tokens.colors.primaryScale[500]} />, label: 'Template Association', content: (
          <SettingRow label={`Template ID: ${settings.templateId}`} tokens={tokens}><span /></SettingRow>
        )},
        { icon: <Bell size={16} color={tokens.colors.infoScale[500]} />, label: 'Notifications', content: (
          <SettingRow label="Email notifications" tokens={tokens}><Toggle on={settings.notifications} tokens={tokens} /></SettingRow>
        )},
        { icon: <Shield size={16} color={tokens.colors.warningScale[500]} />, label: 'SLA Configuration', content: (
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {[{ label: 'Max Days Open', value: settings.slaConfig.maxDaysOpen }, { label: 'Max Days Per Stage', value: settings.slaConfig.maxDaysPerStage }].map(item => (
              <SettingRow key={item.label} label={item.label} tokens={tokens}><span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{item.value} days</span></SettingRow>
            ))}
            <SettingRow label="Notify on Breach" tokens={tokens}><Toggle on={settings.slaConfig.notifyOnBreach} tokens={tokens} /></SettingRow>
          </Box>
        )},
      ];

      return (
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {settingSections.map(s => (
            <Box key={s.label} style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                {s.icon}<Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{s.label}</Box>
              </Box>
              {s.content}
            </Box>
          ))}
          {onSettingsSave && (
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => onSettingsSave(settings)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontFamily: 'inherit', ...hoverStyle }}><Save size={14} />Save Settings</button>
            </Box>
          )}
        </Box>
      );
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`, boxShadow: tokens.shadows.lg, width: '100%', overflow: 'hidden', ...glassCard, ...style }}>
        {renderHeader()}
        {renderTabs()}
        {activeTab === 'overview' && <>{renderMetrics()}{renderFunnel()}{renderCandidates()}{renderTemplate()}{renderActivity()}</>}
        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </Box>
    );
  },
);
