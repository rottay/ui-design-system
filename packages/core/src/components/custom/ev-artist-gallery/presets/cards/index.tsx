'use client';

/**
 * EvArtistGallery - Cards Preset
 * 3-column artist card grid with search, genre filter pills, avatar circles,
 * rating stars, events played count, contract status badges
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvArtistGalleryProps, ArtistProfile } from '../../core';

const MOCK_ARTISTS: ArtistProfile[] = [
  { id: 'a1', name: 'DJ Nova', genre: 'Electronic', bio: 'Pioneering electronic artist known for immersive live sets and genre-bending productions.', rating: 4.9, eventsPlayed: 127, contractStatus: 'active' },
  { id: 'a2', name: 'The Velvet Band', genre: 'Indie Rock', bio: 'Four-piece indie rock group blending dreamy melodies with raw energy.', rating: 4.6, eventsPlayed: 84, contractStatus: 'active' },
  { id: 'a3', name: 'MC Flux', genre: 'Hip Hop', bio: 'Lyrical genius with rapid-fire delivery and socially conscious bars.', rating: 4.4, eventsPlayed: 56, contractStatus: 'pending' },
  { id: 'a4', name: 'Aurora Beats', genre: 'Ambient', bio: 'Ambient soundscape creator crafting otherworldly atmospheric experiences.', rating: 4.7, eventsPlayed: 42, contractStatus: 'active' },
  { id: 'a5', name: 'Soulfire', genre: 'Soul', bio: 'Neo-soul vocalist with a powerhouse voice and heartfelt songwriting.', rating: 4.8, eventsPlayed: 93, contractStatus: 'expired' },
  { id: 'a6', name: 'Rhythm Collective', genre: 'House', bio: 'House music duo delivering infectious grooves and euphoric dance floor anthems.', rating: 4.3, eventsPlayed: 68, contractStatus: 'none' },
];

const GENRES = ['All', 'Electronic', 'Indie Rock', 'Hip Hop', 'Ambient', 'Soul', 'House'];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

const CONTRACT_CONFIG: Record<string, { color: 'success' | 'warning' | 'error' | 'secondary'; emoji: string; label: string }> = {
  active: { color: 'success', emoji: '\u2705', label: 'Active' },
  pending: { color: 'warning', emoji: '\u23F3', label: 'Pending' },
  expired: { color: 'error', emoji: '\u274C', label: 'Expired' },
  none: { color: 'secondary', emoji: '\u2796', label: 'No Contract' },
};

export const CardsEvArtistGallery = createPreset<EvArtistGalleryProps>({
  name: 'EvArtistGallery.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvArtistGalleryProps>) => {
    const { Box, Text } = primitives;
    const { artists: propArtists, onArtistClick, onInviteArtist, className, style } = props;
    const artists = propArtists && propArtists.length > 0 ? propArtists : MOCK_ARTISTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [genreFilter, setGenreFilter] = useState('All');
    const [contractFilter, setContractFilter] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => artists.filter(a => {
      if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.genre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (genreFilter !== 'All' && a.genre !== genreFilter) return false;
      if (contractFilter && a.contractStatus !== contractFilter) return false;
      return true;
    }), [artists, searchTerm, genreFilter, contractFilter]);

    const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      return Array.from({ length: 5 }, (_, i) => i < full ? '\u2605' : '\u2606').join('');
    };

    const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const totalActive = artists.filter(a => a.contractStatus === 'active').length;
    const avgRating = (artists.reduce((sum, a) => sum + a.rating, 0) / artists.length).toFixed(1);
    const totalEvents = artists.reduce((sum, a) => sum + a.eventsPlayed, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83C\uDFA4'} Artist Gallery</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} artist{filtered.length !== 1 ? 's' : ''} found</Text>
          </div>
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Invite Artist</div>
        </div>

        {/* Quick stats */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], display: 'flex', gap: tokens.spacing[4] }}>
          {[
            { label: 'Total Artists', value: artists.length, emoji: '\uD83C\uDFA4', color: tokens.colors.primaryScale[600] },
            { label: 'Active Contracts', value: totalActive, emoji: '\u2705', color: tokens.colors.successScale[600] },
            { label: 'Avg Rating', value: avgRating, emoji: '\u2B50', color: tokens.colors.warningScale[600] },
            { label: 'Total Events', value: totalEvents, emoji: '\uD83C\uDFAB', color: tokens.colors.infoScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Search and filter bar */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search artists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              {GENRES.map(g => (
                <div key={g} onClick={() => setGenreFilter(g)} style={createFilterPillStyle(tokens, { active: genreFilter === g })}>{g}</div>
              ))}
            </div>
          </div>
          {/* Contract status filters */}
          <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginRight: tokens.spacing[1], alignSelf: 'center' }}>Contract:</Text>
            <div onClick={() => setContractFilter(null)} style={createFilterPillStyle(tokens, { active: contractFilter === null })}>All</div>
            {Object.entries(CONTRACT_CONFIG).map(([key, cfg]) => (
              <div key={key} onClick={() => setContractFilter(contractFilter === key ? null : key)} style={createFilterPillStyle(tokens, { active: contractFilter === key })}>{cfg.emoji} {cfg.label}</div>
            ))}
          </div>
        </div>

        {/* Artist cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[5] }}>
          {filtered.map((artist, idx) => {
            const isHovered = hoveredCard === artist.id;
            const contractCfg = CONTRACT_CONFIG[artist.contractStatus] || CONTRACT_CONFIG.none;
            return (
              <div key={artist.id} onClick={() => onArtistClick?.(artist.id)} onMouseEnter={() => setHoveredCard(artist.id)} onMouseLeave={() => setHoveredCard(null)} style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}) }}>
                {/* Cover gradient */}
                <div style={{ height: 80, background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], position: 'relative' as const }}>
                  <div style={{ position: 'absolute' as const, top: tokens.spacing[2], right: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, contractCfg.color)}>{contractCfg.emoji} {contractCfg.label}</span>
                  </div>
                </div>

                {/* Avatar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: -32 }}>
                  <div style={{ width: 64, height: 64, borderRadius: tokens.borderRadius.full, background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], border: `3px solid ${tokens.colors.common.white}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: tokens.shadows.md }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{getInitials(artist.name)}</Text>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{artist.name}</Text>
                  <span style={{ display: 'inline-block', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFB5'} {artist.genre}</span>

                  {artist.bio && (
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[3], lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, maxHeight: 36 }}>{artist.bio}</Text>
                  )}

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500], letterSpacing: '2px' }}>{renderStars(artist.rating)}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{artist.rating}</Text>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                    <div style={{ flex: 1, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{'\uD83C\uDFAB'}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{artist.eventsPlayed}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Events</Text>
                    </div>
                    <div style={{ flex: 1, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{'\u2B50'}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{artist.rating}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Rating</Text>
                    </div>
                    <div style={{ flex: 1, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{contractCfg.emoji}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{contractCfg.label}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Contract</Text>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3] }}>
                    <div onClick={(e) => { e.stopPropagation(); onArtistClick?.(artist.id); }} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textAlign: 'center' as const, cursor: 'pointer', ...hoverStyle }}>View Profile</div>
                    {artist.contractStatus !== 'active' && (
                      <div onClick={(e) => { e.stopPropagation(); onInviteArtist?.(artist.id); }} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, textAlign: 'center' as const, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDCE8'} Invite</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFA4'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No artists match your criteria</Text>
          </div>
        )}
      </Box>
    );
  },
});
