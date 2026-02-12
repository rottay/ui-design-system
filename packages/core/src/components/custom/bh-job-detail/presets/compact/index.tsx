'use client';

/**
 * BhJobDetail - Compact Preset
 * Slite-inspired tabbed summary with warm tones, generous whitespace,
 * and condensed layout for key job information.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createHoverStyle } from '../../../helpers';
import type { BhJobDetailProps } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Building2, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus,
  User, CheckCircle2, FileText, Timer, Zap, XOctagon, ChevronRight,
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
  const sz = 12;
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
  return pct >= 75 ? t.colors.successScale[600] : pct >= 50 ? t.colors.warningScale[600] : t.colors.errorScale[600];
}

function trendColor(trend: string | undefined, t: DesignTokens) {
  return trend === 'up' ? t.colors.successScale[600] : trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500];
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'up') return <TrendingUp size={10} />;
  if (trend === 'down') return <TrendingDown size={10} />;
  return <Minus size={10} />;
}

/* Sub-components */
function Badge({ bg, color, border, children, tokens }: { bg: string; color: string; border: string; children: React.ReactNode; tokens: DesignTokens }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: bg, color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${border}`, textTransform: 'capitalize' as const }}>
      {children}
    </span>
  );
}

function Avatar({ avatar, name, tokens, size = 24 }: { avatar?: string; name: string; tokens: DesignTokens; size?: number }) {
  if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' as const }} />;
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: tokens.typography.fontWeight.semibold, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                      */
/* ------------------------------------------------------------------ */

type CompactTab = 'summary' | 'pipeline' | 'candidates' | 'activity';

export const CompactBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Compact',
  ({ primitives, props, tokens }: PresetContext<BhJobDetailProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const { jobInfo, metrics = [], funnelStages = [], candidates = [], templateInfo, events = [], activeTab: activeTabProp, onTabChange, onCandidateClick, className, style } = props;

    const [internalTab, setInternalTab] = useState<CompactTab>('summary');
    const activeTab = (activeTabProp as string) === 'overview' ? 'summary' : ((activeTabProp as string) ?? internalTab) as CompactTab;
    const handleTabChange = (tab: CompactTab) => { onTabChange?.(tab as any); setInternalTab(tab); };

    const glassCard = isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}` } : {};
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const sc = statusColors(jobInfo.status, tokens);
    const uc = urgencyColors(jobInfo.urgency, tokens);

    const compactTabs: { key: CompactTab; label: string }[] = [
      { key: 'summary', label: 'Summary' }, { key: 'pipeline', label: 'Pipeline' },
      { key: 'candidates', label: 'Candidates' }, { key: 'activity', label: 'Activity' },
    ];

    const tabRenderers: Record<CompactTab, () => React.ReactNode> = {
      summary: () => (
        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
          {metrics.length > 0 && (
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, 1fr)`, gap: tokens.spacing[2] }}>
              {metrics.slice(0, 4).map((m, i) => (
                <Box key={i} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}`, textAlign: 'center' as const }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{m.value}</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{m.label}</Box>
                  {m.trendValue !== undefined && (
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: tokens.typography.fontSize.xs, color: trendColor(m.trend, tokens), marginTop: tokens.spacing[1] }}>
                      <TrendIcon trend={m.trend} /><span>{m.trendValue}%</span>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {funnelStages.length > 0 && (
            <Box style={{ ...cardBase, padding: tokens.spacing[3] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>Pipeline</Box>
              <Box style={{ display: 'flex', height: 24, borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
                {funnelStages.map(s => (
                  <Box key={s.name} title={`${s.name}: ${s.count} (${s.percentage}%)`} style={{ width: `${s.percentage}%`, minWidth: s.percentage > 0 ? 2 : 0, backgroundColor: s.color || tokens.colors.primaryScale[400], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold, overflow: 'hidden' }}>
                    {s.percentage >= 10 ? s.count : ''}
                  </Box>
                ))}
              </Box>
              <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
                {funnelStages.map(s => (
                  <Box key={s.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: s.color || tokens.colors.primaryScale[400] }} />{s.name}: {s.count}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {templateInfo && (
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}` }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Template</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>{templateInfo.name} ({templateInfo.stages.length} stages)</Box>
            </Box>
          )}
        </Box>
      ),

      pipeline: () => {
        if (!funnelStages.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No pipeline data.</Box>;
        const max = Math.max(...funnelStages.map(s => s.count), 1);
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {funnelStages.map(s => (
              <Box key={s.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}` }}>
                <Box style={{ width: 80, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], flexShrink: 0 }}>{s.name}</Box>
                <Box style={{ flex: 1, height: 12, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                  <Box style={{ width: `${(s.count / max) * 100}%`, height: '100%', backgroundColor: s.color || tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.full, transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], minWidth: 48, textAlign: 'right' as const }}>{s.count} ({s.percentage}%)</Box>
              </Box>
            ))}
          </Box>
        );
      },

      candidates: () => {
        if (!candidates.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No candidates yet.</Box>;
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {candidates.slice(0, 10).map(c => {
              const csc = statusColors(c.status, tokens);
              return (
                <Box key={c.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, ...hoverStyle }} onClick={() => onCandidateClick?.(c.id)}>
                  <Avatar avatar={c.avatar} name={c.name} tokens={tokens} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{c.name}</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{c.stage}</Box>
                  </Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: scoreColor(c.scorePercent, tokens) }}>{c.scorePercent}%</Box>
                  <Box style={{ padding: `1px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, backgroundColor: csc.bg, color: csc.color, textTransform: 'capitalize' as const }}>{c.status}</Box>
                </Box>
              );
            })}
          </Box>
        );
      },

      activity: () => {
        if (!events.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No recent activity.</Box>;
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {events.slice(0, 10).map(ev => {
              const em = eventIcon(ev.type, tokens);
              return (
                <Box key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <Box style={{ width: 20, height: 20, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], color: em.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{em.icon}</Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.normal }}>{ev.message}</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{timeAgo(ev.time)}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      },
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`, boxShadow: tokens.shadows.md, width: '100%', maxWidth: 480, overflow: 'hidden', ...glassCard, ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1, minWidth: 0 }}>
            <Box style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Briefcase size={16} /></Box>
            <Box style={{ minWidth: 0 }}>
              <Box style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobInfo.title}</Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                <span>{jobInfo.code}</span><span>-</span>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Building2 size={10} />{jobInfo.clientName}</Box>
              </Box>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Badge bg={sc.bg} color={sc.color} border={sc.border} tokens={tokens}><Box style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: sc.color }} />{jobInfo.status}</Badge>
            <Badge bg={uc.bg} color={uc.color} border={uc.border} tokens={tokens}><AlertTriangle size={10} />{jobInfo.urgency}</Badge>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}><Clock size={10} />{jobInfo.daysOpen}d</Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, padding: `0 ${tokens.spacing[4]}px` }}>
          {compactTabs.map(tab => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${activeTab === tab.key ? tokens.colors.primaryScale[500] : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.xs, fontWeight: activeTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium, color: activeTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500], fontFamily: 'inherit', marginBottom: -1 }}>
              {tab.label}
            </button>
          ))}
        </Box>

        {tabRenderers[activeTab]?.()}
      </Box>
    );
  },
);
