'use client';

/**
 * BhJobDetail - Compact Preset
 * Slite-inspired tabbed summary with warm tones, generous whitespace,
 * and condensed layout for key job information.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle, createHoverStyle, createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles, createPersonalitySectionHeaderStyle,
  createIconContainerStyle, getPersonalityTypography, getPersonalityBadgeRadius,
  getCardPadding,
  createPersonalityAccentBar,
} from '../../../helpers';
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
  const s = t.colors[scale as keyof typeof t.colors] as Record<number, string>;
  return { bg: s[100], color: s[Number(shade)], border: s[200] };
}

function urgencyColors(urgency: string, t: DesignTokens) {
  const m: Record<string, string> = { low: 'neutral', medium: 'infoScale', high: 'warningScale', critical: 'errorScale' };
  const s = t.colors[(m[urgency] ?? 'neutral') as keyof typeof t.colors] as Record<number, string>;
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

function timeAgo(date: Date | null | undefined): string {
  if (!date) return '';
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

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                      */
/* ------------------------------------------------------------------ */

type CompactTab = 'summary' | 'pipeline' | 'candidates' | 'activity';

export const CompactBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Compact',
  ({ primitives, props, tokens }: PresetContext<BhJobDetailProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const JOB_INFO_DEFAULT = { title: '', code: '', status: 'draft' as const, clientName: '', daysOpen: 0, urgency: 'low' as const };
    const { jobInfo: _jobInfo = JOB_INFO_DEFAULT, metrics: rawMetrics = [], funnelStages: rawFunnelStages = [], candidates: rawCandidates = [], templateInfo, events: rawEvents = [], activeTab: activeTabProp, onTabChange, onCandidateClick, className, style } = props;

    const metrics = Array.isArray(rawMetrics) ? rawMetrics : [];
    const funnelStages = Array.isArray(rawFunnelStages) ? rawFunnelStages : [];
    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];
    const events = Array.isArray(rawEvents) ? rawEvents : [];
    const jobInfo = _jobInfo ?? JOB_INFO_DEFAULT;

    const [internalTab, setInternalTab] = useState<CompactTab>('summary');
    const activeTab = (activeTabProp as string) === 'overview' ? 'summary' : ((activeTabProp as string) ?? internalTab) as CompactTab;
    const handleTabChange = useCallback((tab: CompactTab) => { onTabChange?.(tab as any); setInternalTab(tab); }, [onTabChange]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardPadding = useMemo(() => getCardPadding(tokens), [tokens]);
    const iconContainer = useMemo(() => createIconContainerStyle(tokens, { size: 32 }), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

    const sc = statusColors(jobInfo.status, tokens);
    const uc = urgencyColors(jobInfo.urgency, tokens);

    const compactTabs: { key: CompactTab; label: string }[] = [
      { key: 'summary', label: 'Summary' }, { key: 'pipeline', label: 'Pipeline' },
      { key: 'candidates', label: 'Candidates' }, { key: 'activity', label: 'Activity' },
    ];

    const BadgeBox = useCallback(({ bg, color, border, children }: { bg: string; color: string; border: string; children: React.ReactNode }) => (
      <Box style={{
        display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
        borderRadius: badgeRadius,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: bg, color,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${border}`,
        textTransform: 'capitalize' as const,
      }}>
        {children}
      </Box>
    ), [tokens, badgeRadius, Box]);

    const AvatarBox = useCallback(({ avatar, name, size = 24 }: { avatar?: string; name: string; size?: number }) => {
      if (avatar) {
        return <Box style={{ width: size, height: size, borderRadius: tokens.borderRadius.full, backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />;
      }
      return (
        <Box style={{
          ...createIconContainerStyle(tokens, { size, color: tokens.colors.primaryScale[100] }),
        }}>
          <Text style={{ fontSize: '10px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
            {(name || '').charAt(0).toUpperCase()}
          </Text>
        </Box>
      );
    }, [tokens, Box, Text]);

    const tabRenderers: Record<CompactTab, () => React.ReactNode> = {
      summary: () => (
        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
          {metrics.length > 0 && (
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, 1fr)`, gap: tokens.spacing[2] }}>
              {metrics.slice(0, 4).map((m, i) => (
                <Box key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                  ...animStyle(i),
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  textAlign: 'center' as const,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: typo.headingWeight, color: tokens.colors.neutral[900] }}>{m.value}</Text>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                    textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing,
                  }}>{m.label}</Text>
                  {m.trendValue !== undefined && (
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: tokens.typography.fontSize.xs, color: trendColor(m.trend, tokens), marginTop: tokens.spacing[1] }}>
                      <TrendIcon trend={m.trend} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor(m.trend, tokens) }}>{m.trendValue}%</Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {funnelStages.length > 0 && (
            <Box style={{ ...cardBase, padding: tokens.spacing[3] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing,
                marginBottom: tokens.spacing[2],
              }}>Pipeline</Text>
              <Box style={{ display: 'flex', height: 24, borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
                {funnelStages.map(s => (
                  <Box key={s.name} title={`${s.name}: ${s.count} (${s.percentage}%)`} style={{ width: `${s.percentage}%`, minWidth: s.percentage > 0 ? 2 : 0, backgroundColor: s.color || tokens.colors.primaryScale[400], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {s.percentage >= 10 && <Text style={{ fontSize: '9px', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold }}>{s.count}</Text>}
                  </Box>
                ))}
              </Box>
              <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
                {funnelStages.map(s => (
                  <Box key={s.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: s.color || tokens.colors.primaryScale[400] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{s.name}: {s.count}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {templateInfo && (
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Template</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>{templateInfo.name ?? ''} ({(templateInfo.stages ?? []).length} stages)</Text>
            </Box>
          )}
        </Box>
      ),

      pipeline: () => {
        if (!funnelStages.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}><Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No pipeline data.</Text></Box>;
        const max = Math.max(...(funnelStages ?? []).map(s => s.count ?? 0), 1);
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {funnelStages.map(s => (
              <Box key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <Text style={{ width: 80, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], flexShrink: 0 }}>{s.name}</Text>
                <Box style={{ flex: 1, height: 12, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                  <Box style={{ width: `${(s.count / max) * 100}%`, height: '100%', backgroundColor: s.color || tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.full, transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], minWidth: 48, textAlign: 'right' as const }}>{s.count} ({s.percentage}%)</Text>
              </Box>
            ))}
          </Box>
        );
      },

      candidates: () => {
        if (!candidates.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}><Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No candidates yet.</Text></Box>;
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {candidates.slice(0, 10).map(c => {
              const csc = statusColors(c.status, tokens);
              return (
                <Box
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View candidate ${c.name}`}
                  onClick={() => onCandidateClick?.(c.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCandidateClick?.(c.id); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    ...hoverStyle, outline: 'none',
                  }}
                >
                  <AvatarBox avatar={c.avatar} name={c.name} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{c.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{c.stage}</Text>
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: scoreColor(c.scorePercent, tokens) }}>{c.scorePercent}%</Text>
                  <Box style={{
                    padding: `1px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                    fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: csc.bg, color: csc.color, textTransform: 'capitalize' as const,
                  }}>
                    <Text style={{ fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, color: csc.color }}>{c.status}</Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      },

      activity: () => {
        if (!events.length) return <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}><Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No recent activity.</Text></Box>;
        return (
          <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {events.slice(0, 10).map(ev => {
              const em = eventIcon(ev.type, tokens);
              return (
                <Box key={ev.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}>
                  <Box style={{
                    ...createIconContainerStyle(tokens, { size: 20, color: tokens.colors.neutral[100] }),
                    marginTop: 1,
                  }}>
                    {em.icon}
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.normal }}>{ev.message}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400]}}>{timeAgo(ev.time)}</Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      },
    };

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        ...cardBase,
        width: '100%', maxWidth: 480, overflow: 'hidden',
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          gap: tokens.spacing[3], flexWrap: 'wrap' as const,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1, minWidth: 0 }}>
            <Box style={{
              ...iconContainer,
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[600],
            }}>
              <Briefcase size={16} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: typo.headingWeight,
                letterSpacing: typo.headingLetterSpacing,
                color: tokens.colors.neutral[900],
                whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{jobInfo.title}</Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobInfo.code}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>-</Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Building2 size={10} color={tokens.colors.neutral[500]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobInfo.clientName}</Text>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <BadgeBox bg={sc.bg} color={sc.color} border={sc.border}>
              <Box style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: sc.color }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color }}>{jobInfo.status}</Text>
            </BadgeBox>
            <BadgeBox bg={uc.bg} color={uc.color} border={uc.border}>
              <AlertTriangle size={10} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: uc.color }}>{jobInfo.urgency}</Text>
            </BadgeBox>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Clock size={10} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{jobInfo.daysOpen}d</Text>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box style={{
          display: 'flex', gap: 0,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          padding: `0 ${tokens.spacing[4]}px`,
        }}>
          {compactTabs.map(tab => (
            <Box
              key={tab.key}
              role="tab"
              tabIndex={0}
              aria-selected={activeTab === tab.key}
              aria-label={tab.label}
              onClick={() => handleTabChange(tab.key)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabChange(tab.key); } }}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderBottom: `2px solid ${activeTab === tab.key ? tokens.colors.primaryScale[500] : 'transparent'}`,
                backgroundColor: 'transparent',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activeTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: activeTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontFamily: 'inherit',
                cursor: 'pointer',
                marginBottom: -1,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activeTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: activeTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
              }}>
                {tab.label}
              </Text>
            </Box>
          ))}
        </Box>

        {tabRenderers[activeTab]?.()}
      </Box>
    );
  },
);
