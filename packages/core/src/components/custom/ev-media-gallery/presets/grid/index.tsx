'use client';

/**
 * EvMediaGallery - Grid Preset
 * Photo/video card grid with search, type/status filter pills, hover transforms,
 * reaction counts, upload button, stats summary bar, empty state
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
import type { EvMediaGalleryProps, MediaFile } from '../../core';

const MOCK: MediaFile[] = [
  { id: 'm1', type: 'photo', url: '', uploadedBy: 'PartyKing', uploadedAt: new Date(Date.now() - 60000), reactions: 42, status: 'approved', caption: 'Main stage vibes!' },
  { id: 'm2', type: 'video', url: '', uploadedBy: 'NeonQueen', uploadedAt: new Date(Date.now() - 120000), reactions: 38, status: 'approved', caption: 'DJ Nova dropping the bass' },
  { id: 'm3', type: 'photo', url: '', uploadedBy: 'GlowStick', uploadedAt: new Date(Date.now() - 300000), reactions: 25, status: 'approved', caption: 'Light show was incredible' },
  { id: 'm4', type: 'photo', url: '', uploadedBy: 'RaveLover', uploadedAt: new Date(Date.now() - 600000), reactions: 19, status: 'approved', caption: 'Crowd going wild' },
  { id: 'm5', type: 'video', url: '', uploadedBy: 'DanceMachine', uploadedAt: new Date(Date.now() - 900000), reactions: 31, status: 'approved', caption: 'Best transition of the night' },
  { id: 'm6', type: 'photo', url: '', uploadedBy: 'VIPVibes', uploadedAt: new Date(Date.now() - 1200000), reactions: 14, status: 'approved', caption: 'VIP lounge view' },
  { id: 'm7', type: 'photo', url: '', uploadedBy: 'TechnoFan99', uploadedAt: new Date(Date.now() - 1500000), reactions: 8, status: 'pending', caption: 'Backstage pass!' },
  { id: 'm8', type: 'video', url: '', uploadedBy: 'MidnightOwl', uploadedAt: new Date(Date.now() - 1800000), reactions: 5, status: 'pending', caption: 'After party vibes' },
  { id: 'm9', type: 'photo', url: '', uploadedBy: 'BassDropper', uploadedAt: new Date(Date.now() - 2400000), reactions: 62, status: 'approved', caption: 'Pyrotechnics moment' },
  { id: 'm10', type: 'video', url: '', uploadedBy: 'StarGazer', uploadedAt: new Date(Date.now() - 3000000), reactions: 0, status: 'rejected', caption: 'Blurry footage' },
];

const COLORS = ['#7C3AED', '#2563EB', '#DC2626', '#059669', '#D97706', '#EC4899', '#6366F1', '#0891B2', '#F97316', '#14B8A6'];

export const GridEvMediaGallery = createPreset<EvMediaGalleryProps>({
  name: 'EvMediaGallery.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvMediaGalleryProps>) => {
    const { Box, Text } = primitives;
    const { media: propMedia, onUpload, onMediaClick, className, style } = props;
    const media = propMedia && propMedia.length > 0 ? propMedia : MOCK;

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => media.filter(m => {
      if (searchTerm && !(m.caption || '').toLowerCase().includes(searchTerm.toLowerCase()) && !m.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      return true;
    }), [media, searchTerm, typeFilter, statusFilter]);

    const approved = media.filter(m => m.status === 'approved');
    const pending = media.filter(m => m.status === 'pending');
    const rejected = media.filter(m => m.status === 'rejected');
    const totalReactions = media.reduce((s, m) => s + m.reactions, 0);
    const photos = media.filter(m => m.type === 'photo');
    const videos = media.filter(m => m.type === 'video');

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83D\uDCF8'} Media Gallery</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {media.length} items | {totalReactions} total reactions</Text>
          </div>
          <div onClick={() => onUpload?.()} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDCE4'} Upload Media</div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Media', value: media.length, emoji: '\uD83D\uDCF8', color: tokens.colors.primaryScale[600] },
            { label: 'Photos', value: photos.length, emoji: '\uD83D\uDCF7', color: tokens.colors.infoScale[600] },
            { label: 'Videos', value: videos.length, emoji: '\uD83C\uDFA5', color: tokens.colors.warningScale[600] },
            { label: 'Approved', value: approved.length, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Reactions', value: totalReactions, emoji: '\u2764\uFE0F', color: tokens.colors.errorScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search captions or uploaders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Type:</Text>
              <div onClick={() => setTypeFilter('all')} style={createFilterPillStyle(tokens, { active: typeFilter === 'all' })}>All</div>
              <div onClick={() => setTypeFilter(typeFilter === 'photo' ? 'all' : 'photo')} style={createFilterPillStyle(tokens, { active: typeFilter === 'photo' })}>{'\uD83D\uDCF7'} Photos</div>
              <div onClick={() => setTypeFilter(typeFilter === 'video' ? 'all' : 'video')} style={createFilterPillStyle(tokens, { active: typeFilter === 'video' })}>{'\uD83C\uDFA5'} Videos</div>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Status:</Text>
              <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
              <div onClick={() => setStatusFilter(statusFilter === 'approved' ? null : 'approved')} style={createFilterPillStyle(tokens, { active: statusFilter === 'approved' })}>{'\u2705'} Approved</div>
              <div onClick={() => setStatusFilter(statusFilter === 'pending' ? null : 'pending')} style={createFilterPillStyle(tokens, { active: statusFilter === 'pending' })}>{'\u23F3'} Pending</div>
              <div onClick={() => setStatusFilter(statusFilter === 'rejected' ? null : 'rejected')} style={createFilterPillStyle(tokens, { active: statusFilter === 'rejected' })}>{'\u274C'} Rejected</div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {filtered.map((item, idx) => {
            const isHovered = hoveredCard === item.id;
            const statusColor = item.status === 'approved' ? 'success' as const : item.status === 'pending' ? 'warning' as const : 'error' as const;
            const reactionBar = createProgressBarStyle(tokens, { percent: Math.min(100, Math.round((item.reactions / 70) * 100)), color: tokens.colors.errorScale[400] });
            return (
              <div key={item.id} onClick={() => onMediaClick?.(item.id)} onMouseEnter={() => setHoveredCard(item.id)} onMouseLeave={() => setHoveredCard(null)}
                style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}), opacity: item.status === 'rejected' ? 0.6 : 1 }}>
                {/* Thumbnail placeholder */}
                <div style={{ height: 160, backgroundColor: COLORS[idx % COLORS.length] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                  <span style={{ fontSize: 40, opacity: 0.6 }}>{item.type === 'video' ? '\uD83C\uDFAC' : '\uD83D\uDCF7'}</span>
                  {/* Type badge */}
                  <span style={{ position: 'absolute' as const, top: tokens.spacing[2], left: tokens.spacing[2], ...createBadgeStyle(tokens, item.type === 'video' ? 'info' : 'primary'), fontSize: tokens.typography.fontSize.xs }}>
                    {item.type === 'video' ? '\uD83C\uDFA5 Video' : '\uD83D\uDCF8 Photo'}
                  </span>
                  {/* Status badge */}
                  <span style={{ position: 'absolute' as const, top: tokens.spacing[2], right: tokens.spacing[2], ...createBadgeStyle(tokens, statusColor) }}>
                    {item.status === 'approved' ? '\u2705' : item.status === 'pending' ? '\u23F3' : '\u274C'} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  {/* Hover overlay */}
                  {isHovered && (
                    <div style={{ position: 'absolute' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `opacity ${tokens.motion.hover}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{'\uD83D\uDD0D'} View</Text>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[1], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.caption || 'Untitled'}</Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>by {item.uploadedBy}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTime(item.uploadedAt)}</Text>
                  </div>
                  {/* Reaction bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'\u2764\uFE0F'} {item.reactions}</Text>
                    <div style={{ flex: 1 }}><div style={reactionBar.track}><div style={reactionBar.fill} /></div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCF8'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No media matches your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
          </div>
        )}

        {/* Summary bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Items', value: media.length.toString(), emoji: '\uD83D\uDCF8' },
            { label: 'Approved', value: approved.length.toString(), emoji: '\u2705' },
            { label: 'Pending Review', value: pending.length.toString(), emoji: '\u23F3' },
            { label: 'Rejected', value: rejected.length.toString(), emoji: '\u274C' },
            { label: 'Total Reactions', value: totalReactions.toString(), emoji: '\u2764\uFE0F' },
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
