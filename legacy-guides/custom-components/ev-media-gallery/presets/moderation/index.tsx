'use client';

/**
 * EvMediaGallery - Moderation Preset
 * Pending queue with approve/reject, search, filter pills, moderation stats,
 * recent decisions table, hover effects, progress bars, empty state
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
  { id: 'm1', type: 'photo', url: '', uploadedBy: 'PartyKing', uploadedAt: new Date(Date.now() - 60000), reactions: 0, status: 'pending', caption: 'Main stage vibes!' },
  { id: 'm2', type: 'video', url: '', uploadedBy: 'NeonQueen', uploadedAt: new Date(Date.now() - 120000), reactions: 0, status: 'pending', caption: 'DJ set highlight' },
  { id: 'm3', type: 'photo', url: '', uploadedBy: 'GlowStick', uploadedAt: new Date(Date.now() - 300000), reactions: 0, status: 'pending', caption: 'Light show closeup' },
  { id: 'm4', type: 'photo', url: '', uploadedBy: 'RaveLover', uploadedAt: new Date(Date.now() - 600000), reactions: 42, status: 'approved', caption: 'Crowd going wild' },
  { id: 'm5', type: 'video', url: '', uploadedBy: 'DanceMachine', uploadedAt: new Date(Date.now() - 900000), reactions: 31, status: 'approved', caption: 'Best transition' },
  { id: 'm6', type: 'photo', url: '', uploadedBy: 'VIPVibes', uploadedAt: new Date(Date.now() - 1200000), reactions: 14, status: 'approved', caption: 'VIP lounge' },
  { id: 'm7', type: 'photo', url: '', uploadedBy: 'TechnoFan99', uploadedAt: new Date(Date.now() - 1500000), reactions: 0, status: 'rejected', caption: 'Blurry photo' },
  { id: 'm8', type: 'video', url: '', uploadedBy: 'MidnightOwl', uploadedAt: new Date(Date.now() - 1800000), reactions: 0, status: 'rejected', caption: 'Copyright content' },
  { id: 'm9', type: 'video', url: '', uploadedBy: 'BassDropper', uploadedAt: new Date(Date.now() - 2100000), reactions: 0, status: 'pending', caption: 'Backstage footage' },
  { id: 'm10', type: 'photo', url: '', uploadedBy: 'StarGazer', uploadedAt: new Date(Date.now() - 2400000), reactions: 58, status: 'approved', caption: 'Fireworks finale' },
];

const THUMB_COLORS = ['#7C3AED', '#2563EB', '#DC2626', '#059669', '#D97706', '#EC4899', '#6366F1', '#0891B2', '#F97316', '#14B8A6'];

export const ModerationEvMediaGallery = createPreset<EvMediaGalleryProps>({
  name: 'EvMediaGallery.Moderation',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvMediaGalleryProps>) => {
    const { Box, Text } = primitives;
    const { media: propMedia, onApprove, onReject, className, style } = props;
    const media = propMedia && propMedia.length > 0 ? propMedia : MOCK;

    const [searchTerm, setSearchTerm] = useState('');
    const [queueFilter, setQueueFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const pending = media.filter(m => m.status === 'pending');
    const approved = media.filter(m => m.status === 'approved');
    const rejected = media.filter(m => m.status === 'rejected');

    const filtered = useMemo(() => media.filter(m => {
      if (searchTerm && !(m.caption || '').toLowerCase().includes(searchTerm.toLowerCase()) && !m.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (queueFilter !== 'all' && m.status !== queueFilter) return false;
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      return true;
    }).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()), [media, searchTerm, queueFilter, typeFilter]);

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    const approvalRate = media.length > 0 ? Math.round(((approved.length) / (approved.length + rejected.length || 1)) * 100) : 0;
    const approvalBar = createProgressBarStyle(tokens, { percent: approvalRate, color: tokens.colors.successScale[500] });
    const pendingBar = createProgressBarStyle(tokens, { percent: Math.min(100, Math.round((pending.length / media.length) * 100)), color: tokens.colors.warningScale[500] });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83D\uDEE1'} Media Moderation</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{pending.length} items pending review | {media.length} total</Text>
          </div>
          {pending.length > 0 && (
            <span style={{ ...createBadgeStyle(tokens, 'warning'), fontSize: tokens.typography.fontSize.sm, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>{'\u23F3'} {pending.length} Pending</span>
          )}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Pending', count: pending.length, emoji: '\u23F3', color: tokens.colors.warningScale[600] },
            { label: 'Approved', count: approved.length, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Rejected', count: rejected.length, emoji: '\u274C', color: tokens.colors.errorScale[600] },
            { label: 'Total', count: media.length, emoji: '\uD83D\uDCCA', color: tokens.colors.infoScale[600] },
          ].map((s, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const }}>
              <Text style={{ fontSize: 20, display: 'block', marginBottom: tokens.spacing[1] }}>{s.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.count}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Approval Rate + Pending Rate */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Approval Rate</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>{approvalRate}%</Text>
            </div>
            <div style={approvalBar.track}><div style={approvalBar.fill} /></div>
          </div>
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Pending Queue</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[600] }}>{pending.length} items</Text>
            </div>
            <div style={pendingBar.track}><div style={pendingBar.fill} /></div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search captions or uploaders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setQueueFilter('all')} style={createFilterPillStyle(tokens, { active: queueFilter === 'all' })}>All ({media.length})</div>
              <div onClick={() => setQueueFilter('pending')} style={createFilterPillStyle(tokens, { active: queueFilter === 'pending' })}>{'\u23F3'} Pending ({pending.length})</div>
              <div onClick={() => setQueueFilter('approved')} style={createFilterPillStyle(tokens, { active: queueFilter === 'approved' })}>{'\u2705'} Approved ({approved.length})</div>
              <div onClick={() => setQueueFilter('rejected')} style={createFilterPillStyle(tokens, { active: queueFilter === 'rejected' })}>{'\u274C'} Rejected ({rejected.length})</div>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setTypeFilter('all')} style={createFilterPillStyle(tokens, { active: typeFilter === 'all' })}>All Types</div>
              <div onClick={() => setTypeFilter(typeFilter === 'photo' ? 'all' : 'photo')} style={createFilterPillStyle(tokens, { active: typeFilter === 'photo' })}>{'\uD83D\uDCF7'} Photo</div>
              <div onClick={() => setTypeFilter(typeFilter === 'video' ? 'all' : 'video')} style={createFilterPillStyle(tokens, { active: typeFilter === 'video' })}>{'\uD83C\uDFA5'} Video</div>
            </div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[5] }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCCB'} Review Queue ({filtered.length} items)</Text>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: tokens.spacing[8], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDEE1'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No items match your filters</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
            </div>
          ) : filtered.map((item, idx) => {
            const isHovered = hoveredItem === item.id;
            const statusBadge = item.status === 'approved' ? 'success' as const : item.status === 'rejected' ? 'error' as const : 'warning' as const;
            const statusEmoji = item.status === 'approved' ? '\u2705' : item.status === 'rejected' ? '\u274C' : '\u23F3';
            return (
              <div key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}
                style={{
                  padding: `${tokens.spacing[4]}px`,
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                  display: 'flex', gap: tokens.spacing[4], alignItems: 'center',
                  backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  cursor: 'default', transition: `background-color ${tokens.motion.hover}`,
                }}>
                {/* Thumbnail */}
                <div style={{ width: 80, height: 80, borderRadius: tokens.borderRadius.md, backgroundColor: THUMB_COLORS[idx % THUMB_COLORS.length] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {item.type === 'video' ? '\uD83C\uDFAC' : '\uD83D\uDCF7'}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{item.caption || 'Untitled'}</Text>
                    <span style={createBadgeStyle(tokens, item.type === 'video' ? 'info' : 'primary')}>{item.type}</span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Uploaded by {item.uploadedBy} - {formatTime(item.uploadedAt)}</Text>
                  {item.reactions > 0 && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{'\u2764\uFE0F'} {item.reactions} reactions</Text>}
                </div>
                {/* Status badge */}
                <span style={createBadgeStyle(tokens, statusBadge)}>{statusEmoji} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                {/* Actions (only for pending) */}
                {item.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: tokens.spacing[2], flexShrink: 0 }}>
                    <div onClick={() => onApprove?.(item.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', ...hoverStyle }}>{'\u2705'} Approve</div>
                    <div onClick={() => onReject?.(item.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.errorScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', ...hoverStyle }}>{'\u274C'} Reject</div>
                  </div>
                ) : (
                  <div style={{ width: 180, textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Reviewed</Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Media', value: media.length.toString(), emoji: '\uD83D\uDCF8' },
            { label: 'Pending', value: pending.length.toString(), emoji: '\u23F3' },
            { label: 'Approved', value: approved.length.toString(), emoji: '\u2705' },
            { label: 'Rejected', value: rejected.length.toString(), emoji: '\u274C' },
            { label: 'Approval Rate', value: `${approvalRate}%`, emoji: '\uD83D\uDCCA' },
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
