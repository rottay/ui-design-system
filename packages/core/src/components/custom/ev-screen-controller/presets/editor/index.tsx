'use client';

/**
 * EvScreenController - Editor Preset
 * Content items list with drag handles, reorder, type filter pills, search,
 * active toggle, duration bars, stats summary, empty state
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvScreenControllerProps, ScreenContent } from '../../core';

const MOCK: ScreenContent[] = [
  { id: 'c1', type: 'sponsor', title: 'RedBull Energy', content: 'RedBull gives you wings - Official event sponsor', duration: 15, order: 1, isActive: true },
  { id: 'c2', type: 'schedule', title: 'Tonight\'s Lineup', content: '9PM DJ Nova | 11PM MC Thunder | 1AM VJ Aurora', duration: 20, order: 2, isActive: true },
  { id: 'c3', type: 'announcement', title: 'VIP Table Service', content: 'Book your VIP table now! Limited availability. Text NEON to 55555', duration: 10, order: 3, isActive: true },
  { id: 'c4', type: 'sponsor', title: 'Heineken', content: 'Enjoy responsibly - Heineken, official beer partner', duration: 15, order: 4, isActive: false },
  { id: 'c5', type: 'social', title: 'Social Feed', content: '#NeonNights - Show us your best moments!', duration: 30, order: 5, isActive: true },
  { id: 'c6', type: 'announcement', title: 'Last Call', content: 'Bar closes in 30 minutes. Get your drinks now!', duration: 10, order: 6, isActive: false },
  { id: 'c7', type: 'custom', title: 'Photo Booth', content: 'Visit the photo booth near Gate B - Free prints!', duration: 12, order: 7, isActive: true },
  { id: 'c8', type: 'schedule', title: 'Tomorrow Preview', content: 'Gates open 5PM | VJ Aurora 7PM | DJ Eclipse 10PM', duration: 15, order: 8, isActive: true },
];

const TYPE_ICONS: Record<string, string> = { announcement: '\uD83D\uDCE2', sponsor: '\uD83C\uDFF7', schedule: '\uD83D\uDCC5', social: '\uD83D\uDCF1', custom: '\u2699\uFE0F' };
const TYPE_COLORS: Record<string, 'warning' | 'success' | 'primary' | 'info' | 'error'> = { announcement: 'warning', sponsor: 'success', schedule: 'primary', social: 'info', custom: 'error' };

export const EditorEvScreenController = createPreset<EvScreenControllerProps>({
  name: 'EvScreenController.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvScreenControllerProps>) => {
    const { Box, Text } = primitives;
    const { contentItems: propItems, onAddContent, onEditContent, onToggleActive, className, style } = props;
    const contentItems = propItems && propItems.length > 0 ? propItems : MOCK;

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const sorted = useMemo(() => [...contentItems].sort((a, b) => a.order - b.order), [contentItems]);

    const filtered = useMemo(() => sorted.filter(item => {
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && !item.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      if (activeFilter === 'active' && !item.isActive) return false;
      if (activeFilter === 'inactive' && item.isActive) return false;
      return true;
    }), [sorted, searchTerm, typeFilter, activeFilter]);

    const active = contentItems.filter(i => i.isActive);
    const inactive = contentItems.filter(i => !i.isActive);
    const totalDuration = active.reduce((s, i) => s + i.duration, 0);
    const types = [...new Set(contentItems.map(i => i.type))];
    const maxDuration = Math.max(...contentItems.map(i => i.duration), 1);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83D\uDDA5'} Screen Controller</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{active.length} active items | {totalDuration}s rotation cycle</Text>
          </div>
          <div onClick={() => onAddContent?.()} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Add Content</div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Items', value: contentItems.length, emoji: '\uD83D\uDCCB', color: tokens.colors.primaryScale[600] },
            { label: 'Active', value: active.length, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Inactive', value: inactive.length, emoji: '\u23F8\uFE0F', color: tokens.colors.neutral[500] },
            { label: 'Rotation', value: `${totalDuration}s`, emoji: '\u23F1\uFE0F', color: tokens.colors.warningScale[600] },
            { label: 'Types', value: types.length, emoji: '\uD83C\uDFAD', color: tokens.colors.infoScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Rotation Duration Bar */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\u23F1\uFE0F'} Rotation Timeline</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{totalDuration}s total</Text>
          </div>
          <div style={{ display: 'flex', borderRadius: tokens.borderRadius.md, overflow: 'hidden', height: 28, marginBottom: tokens.spacing[2] }}>
            {active.sort((a, b) => a.order - b.order).map((item, idx) => {
              const pct = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
              const colors = [tokens.colors.primaryScale[400], tokens.colors.successScale[400], tokens.colors.warningScale[400], tokens.colors.infoScale[400], tokens.colors.errorScale[400]];
              return (
                <div key={item.id} style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold }}>{item.duration}s</Text>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[3] }}>
            {active.sort((a, b) => a.order - b.order).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ fontSize: 12 }}>{TYPE_ICONS[item.type]}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{item.title} ({item.duration}s)</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Type:</Text>
              <div onClick={() => setTypeFilter(null)} style={createFilterPillStyle(tokens, { active: typeFilter === null })}>All</div>
              {types.map(t => (
                <div key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} style={createFilterPillStyle(tokens, { active: typeFilter === t })}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Status:</Text>
              <div onClick={() => setActiveFilter('all')} style={createFilterPillStyle(tokens, { active: activeFilter === 'all' })}>All</div>
              <div onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')} style={createFilterPillStyle(tokens, { active: activeFilter === 'active' })}>{'\u2705'} Active</div>
              <div onClick={() => setActiveFilter(activeFilter === 'inactive' ? 'all' : 'inactive')} style={createFilterPillStyle(tokens, { active: activeFilter === 'inactive' })}>{'\u23F8\uFE0F'} Inactive</div>
            </div>
          </div>
        </div>

        {/* Content Items List */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[5] }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCCB'} Content Items ({filtered.length})</Text>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: tokens.spacing[8], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDDA5'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No content items match your filters</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
            </div>
          ) : filtered.map((item, idx) => {
            const isHovered = hoveredItem === item.id;
            const durationBar = createProgressBarStyle(tokens, { percent: Math.round((item.duration / maxDuration) * 100), color: item.isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300] });
            return (
              <div key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}
                style={{
                  padding: `${tokens.spacing[4]}px`,
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[4],
                  opacity: item.isActive ? 1 : 0.5,
                  backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  transition: `background-color ${tokens.motion.hover}`,
                }}>
                {/* Drag handle */}
                <div style={{ fontSize: 16, color: tokens.colors.neutral[400], cursor: 'grab', flexShrink: 0 }}>{'\u22EE\u22EE'}</div>
                {/* Order number */}
                <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: item.isActive ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: item.isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500], flexShrink: 0 }}>{item.order}</div>
                {/* Type icon */}
                <div style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[item.type] || '\u2699\uFE0F'}</div>
                {/* Content info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{item.title}</Text>
                    <span style={createBadgeStyle(tokens, TYPE_COLORS[item.type] || 'primary')}>{item.type}</span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 400 }}>{item.content}</Text>
                  {/* Duration bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{'\u23F1\uFE0F'} {item.duration}s</Text>
                    <div style={{ width: 80 }}><div style={durationBar.track}><div style={durationBar.fill} /></div></div>
                  </div>
                </div>
                {/* Toggle */}
                <div onClick={() => onToggleActive?.(item.id)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    backgroundColor: item.isActive ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
                    color: item.isActive ? tokens.colors.successScale[700] : tokens.colors.neutral[500],
                    border: `1px solid ${item.isActive ? tokens.colors.successScale[300] : tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer', ...hoverStyle,
                  }}>
                  {item.isActive ? '\u2705 Active' : '\u2B1C Inactive'}
                </div>
                {/* Edit */}
                <div onClick={() => onEditContent?.(item.id)} style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, ...hoverStyle }}>{'\u270F\uFE0F'}</div>
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Items', value: contentItems.length.toString(), emoji: '\uD83D\uDCCB' },
            { label: 'Active', value: active.length.toString(), emoji: '\u2705' },
            { label: 'Inactive', value: inactive.length.toString(), emoji: '\u23F8\uFE0F' },
            { label: 'Rotation', value: `${totalDuration}s`, emoji: '\u23F1\uFE0F' },
            { label: 'Content Types', value: types.length.toString(), emoji: '\uD83C\uDFAD' },
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
