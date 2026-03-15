'use client';

/**
 * EvScreenController - Preview Preset
 * Full preview area with current content, schedule timeline, type filter,
 * navigation controls, stats summary, rotation progress bar
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvScreenControllerProps, ScreenContent } from '../../core';

const MOCK: ScreenContent[] = [
  { id: 'c1', type: 'sponsor', title: 'RedBull Energy', content: 'RedBull gives you wings - Official event sponsor', duration: 15, order: 1, isActive: true },
  { id: 'c2', type: 'schedule', title: 'Tonight\'s Lineup', content: '9PM DJ Nova | 11PM MC Thunder | 1AM VJ Aurora', duration: 20, order: 2, isActive: true },
  { id: 'c3', type: 'announcement', title: 'VIP Table Service', content: 'Book your VIP table now! Limited availability.', duration: 10, order: 3, isActive: true },
  { id: 'c4', type: 'sponsor', title: 'Heineken', content: 'Enjoy responsibly - Heineken, official beer partner', duration: 15, order: 4, isActive: false },
  { id: 'c5', type: 'social', title: 'Social Feed', content: '#NeonNights - Show us your best moments!', duration: 30, order: 5, isActive: true },
  { id: 'c6', type: 'custom', title: 'Photo Booth', content: 'Visit the photo booth near Gate B - Free prints!', duration: 12, order: 6, isActive: true },
  { id: 'c7', type: 'announcement', title: 'Last Call', content: 'Bar closes in 30 minutes. Get your drinks now!', duration: 10, order: 7, isActive: false },
  { id: 'c8', type: 'schedule', title: 'Tomorrow Preview', content: 'Gates open 5PM | VJ Aurora 7PM | DJ Eclipse 10PM', duration: 15, order: 8, isActive: true },
];

const TYPE_ICONS: Record<string, string> = { announcement: '\uD83D\uDCE2', sponsor: '\uD83C\uDFF7', schedule: '\uD83D\uDCC5', social: '\uD83D\uDCF1', custom: '\u2699\uFE0F' };
const TYPE_COLORS: Record<string, 'warning' | 'success' | 'primary' | 'info' | 'error'> = { announcement: 'warning', sponsor: 'success', schedule: 'primary', social: 'info', custom: 'error' };

const PREVIEW_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

export const PreviewEvScreenController = createPreset<EvScreenControllerProps>({
  name: 'EvScreenController.Preview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvScreenControllerProps>) => {
    const { Box, Text } = primitives;
    const { contentItems: propItems, className, style } = props;
    const contentItems = propItems && propItems.length > 0 ? propItems : MOCK;

    const [currentIdx, setCurrentIdx] = useState(0);
    const [showAll, setShowAll] = useState(false);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const active = useMemo(() => contentItems.filter(i => i.isActive).sort((a, b) => a.order - b.order), [contentItems]);
    const allSorted = useMemo(() => [...contentItems].sort((a, b) => a.order - b.order), [contentItems]);
    const displayItems = showAll ? allSorted : active;

    const current = active.length > 0 ? active[currentIdx % active.length] : null;
    const totalDuration = active.reduce((s, i) => s + i.duration, 0);
    const currentProgress = current && totalDuration > 0 ? Math.round((active.slice(0, currentIdx % active.length).reduce((s, i) => s + i.duration, 0) / totalDuration) * 100) : 0;
    const overallBar = createProgressBarStyle(tokens, { percent: currentProgress, color: tokens.colors.primaryScale[500] });

    const nextItem = active.length > 1 ? active[(currentIdx + 1) % active.length] : null;
    const prevItem = active.length > 1 ? active[(currentIdx - 1 + active.length) % active.length] : null;

    const types = [...new Set(contentItems.map(i => i.type))];
    const typeBreakdown = types.map(t => ({ type: t, count: active.filter(i => i.type === t).length, totalDuration: active.filter(i => i.type === t).reduce((s, i) => s + i.duration, 0) }));

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83D\uDCFA'} Screen Preview</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Live preview of screen content rotation | {active.length} active items</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
              <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
              LIVE PREVIEW
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Active Items', value: active.length, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Total Duration', value: `${totalDuration}s`, emoji: '\u23F1\uFE0F', color: tokens.colors.primaryScale[600] },
            { label: 'Content Types', value: types.length, emoji: '\uD83C\uDFAD', color: tokens.colors.infoScale[600] },
            { label: 'Current', value: current ? `#${(currentIdx % active.length) + 1}` : '--', emoji: '\u25B6\uFE0F', color: tokens.colors.warningScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Preview Area */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[5] }}>
          <div style={{ background: current ? PREVIEW_GRADIENTS[(currentIdx % active.length) % PREVIEW_GRADIENTS.length] : tokens.colors.neutral[900], padding: tokens.spacing[8], textAlign: 'center' as const, minHeight: 280, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
            {/* Live indicator */}
            <div style={{ position: 'absolute' as const, top: tokens.spacing[3], right: tokens.spacing[3] }}>
              <span style={{ ...createBadgeStyle(tokens, 'error'), fontWeight: tokens.typography.fontWeight.bold }}>{'\uD83D\uDD34'} LIVE</span>
            </div>
            {/* Position indicator */}
            <div style={{ position: 'absolute' as const, top: tokens.spacing[3], left: tokens.spacing[3] }}>
              <span style={{ ...createBadgeStyle(tokens, 'info') }}>{(currentIdx % active.length) + 1} / {active.length}</span>
            </div>

            {current ? (
              <>
                <div style={{ fontSize: 56, marginBottom: tokens.spacing[4] }}>{TYPE_ICONS[current.type]}</div>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block', marginBottom: tokens.spacing[3], textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{current.title}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, color: 'rgba(255,255,255,0.9)', maxWidth: 600, lineHeight: 1.5, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{current.content}</Text>
                <div style={{ marginTop: tokens.spacing[4], display: 'flex', gap: tokens.spacing[2] }}>
                  <span style={createBadgeStyle(tokens, TYPE_COLORS[current.type] || 'primary')}>{TYPE_ICONS[current.type]} {current.type}</span>
                  <span style={createBadgeStyle(tokens, 'info')}>{'\u23F1\uFE0F'} {current.duration}s</span>
                </div>
              </>
            ) : (
              <>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCFA'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.common.white }}>No active content to display</Text>
              </>
            )}
          </div>

          {/* Navigation bar */}
          <div style={{ padding: tokens.spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.colors.neutral[800] }}>
            {/* Prev */}
            <div onClick={() => setCurrentIdx(prev => (prev - 1 + active.length) % active.length)}
              style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[700], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>
              {'\u25C0'} {prevItem?.title || 'Prev'}
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {active.map((item, idx) => (
                <div key={item.id} onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: idx === currentIdx % active.length ? 32 : 10, height: 10,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: idx === currentIdx % active.length ? tokens.colors.primaryScale[500] : tokens.colors.neutral[600],
                    cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                  }} />
              ))}
            </div>
            {/* Next */}
            <div onClick={() => setCurrentIdx(prev => (prev + 1) % active.length)}
              style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[700], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>
              {nextItem?.title || 'Next'} {'\u25B6'}
            </div>
          </div>
        </div>

        {/* Rotation Progress */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\u23F1\uFE0F'} Rotation Progress</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{currentProgress}% through cycle</Text>
          </div>
          <div style={overallBar.track}><div style={overallBar.fill} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5], marginBottom: tokens.spacing[5] }}>
          {/* Schedule Timeline */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCC5'} Rotation Schedule</Text>
              <div onClick={() => setShowAll(!showAll)} style={createFilterPillStyle(tokens, { active: showAll })}>{showAll ? 'Show Active Only' : 'Show All'}</div>
            </div>
            {/* Timeline bar */}
            <div style={{ padding: tokens.spacing[4] }}>
              <div style={{ display: 'flex', borderRadius: tokens.borderRadius.md, overflow: 'hidden', height: 28, marginBottom: tokens.spacing[3] }}>
                {active.map((item, idx) => {
                  const pct = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
                  const isCurrent = idx === currentIdx % active.length;
                  const colors = [tokens.colors.primaryScale[400], tokens.colors.successScale[400], tokens.colors.warningScale[400], tokens.colors.infoScale[400], tokens.colors.errorScale[400]];
                  return (
                    <div key={item.id} onClick={() => setCurrentIdx(idx)} style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: isCurrent ? `2px solid ${tokens.colors.common.white}` : 'none', opacity: isCurrent ? 1 : 0.7 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold }}>{item.duration}s</Text>
                    </div>
                  );
                })}
              </div>
              {/* Schedule list */}
              {displayItems.map((item, idx) => {
                const isCurrent = active.indexOf(item) === currentIdx % active.length;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px 0`, borderBottom: idx < displayItems.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', opacity: item.isActive ? 1 : 0.4 }}>
                    <span style={{ fontSize: 14 }}>{TYPE_ICONS[item.type]}</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: isCurrent ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.medium, color: isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700], flex: 1 }}>{item.title}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{item.duration}s</Text>
                    {isCurrent && <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />}
                    {!item.isActive && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>(off)</Text>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Type Breakdown */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83C\uDFAD'} Content Type Breakdown</Text>
            </div>
            <div style={{ padding: tokens.spacing[4] }}>
              {typeBreakdown.map((tb, idx) => {
                const sharePct = totalDuration > 0 ? Math.round((tb.totalDuration / totalDuration) * 100) : 0;
                const bar = createProgressBarStyle(tokens, { percent: sharePct, color: [tokens.colors.primaryScale[500], tokens.colors.successScale[500], tokens.colors.warningScale[500], tokens.colors.infoScale[500], tokens.colors.errorScale[500]][idx % 5] });
                return (
                  <div key={tb.type} style={{ marginBottom: idx < typeBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: 16 }}>{TYPE_ICONS[tb.type]}</span>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{tb.type.charAt(0).toUpperCase() + tb.type.slice(1)}</Text>
                      </div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{tb.count} items | {tb.totalDuration}s | {sharePct}%</Text>
                    </div>
                    <div style={bar.track}><div style={bar.fill} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Active Items', value: active.length.toString(), emoji: '\u2705' },
            { label: 'Inactive', value: (contentItems.length - active.length).toString(), emoji: '\u23F8\uFE0F' },
            { label: 'Total Duration', value: `${totalDuration}s`, emoji: '\u23F1\uFE0F' },
            { label: 'Content Types', value: types.length.toString(), emoji: '\uD83C\uDFAD' },
            { label: 'Current Slide', value: current ? `#${(currentIdx % active.length) + 1}` : '--', emoji: '\u25B6\uFE0F' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
