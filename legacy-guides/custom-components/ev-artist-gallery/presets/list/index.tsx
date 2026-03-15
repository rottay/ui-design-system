'use client';

/**
 * EvArtistGallery - List Preset
 * Table-style artist list with avatar, name, genre, rating, events, contract status, invite button
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createListItemStyle,
} from '../../../helpers';
import type { EvArtistGalleryProps, ArtistProfile } from '../../core';

const MOCK_ARTISTS: ArtistProfile[] = [
  { id: 'a1', name: 'DJ Nova', genre: 'Electronic', bio: 'Pioneering electronic artist known for immersive live sets.', rating: 4.9, eventsPlayed: 127, contractStatus: 'active' },
  { id: 'a2', name: 'The Velvet Band', genre: 'Indie Rock', bio: 'Four-piece indie rock group blending dreamy melodies.', rating: 4.6, eventsPlayed: 84, contractStatus: 'active' },
  { id: 'a3', name: 'MC Flux', genre: 'Hip Hop', bio: 'Lyrical genius with rapid-fire delivery.', rating: 4.4, eventsPlayed: 56, contractStatus: 'pending' },
  { id: 'a4', name: 'Aurora Beats', genre: 'Ambient', bio: 'Ambient soundscape creator crafting otherworldly experiences.', rating: 4.7, eventsPlayed: 42, contractStatus: 'active' },
  { id: 'a5', name: 'Soulfire', genre: 'Soul', bio: 'Neo-soul vocalist with a powerhouse voice.', rating: 4.8, eventsPlayed: 93, contractStatus: 'expired' },
  { id: 'a6', name: 'Rhythm Collective', genre: 'House', bio: 'House music duo delivering infectious grooves.', rating: 4.3, eventsPlayed: 68, contractStatus: 'none' },
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

type SortKey = 'name' | 'rating' | 'eventsPlayed' | 'genre';

export const ListEvArtistGallery = createPreset<EvArtistGalleryProps>({
  name: 'EvArtistGallery.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvArtistGalleryProps>) => {
    const { Box, Text } = primitives;
    const { artists: propArtists, onArtistClick, onInviteArtist, className, style } = props;
    const artists = propArtists && propArtists.length > 0 ? propArtists : MOCK_ARTISTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [genreFilter, setGenreFilter] = useState('All');
    const [contractFilter, setContractFilter] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => {
      let result = artists.filter(a => {
        if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.genre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (genreFilter !== 'All' && a.genre !== genreFilter) return false;
        if (contractFilter && a.contractStatus !== contractFilter) return false;
        return true;
      });
      result.sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortKey === 'rating') cmp = a.rating - b.rating;
        else if (sortKey === 'eventsPlayed') cmp = a.eventsPlayed - b.eventsPlayed;
        else if (sortKey === 'genre') cmp = a.genre.localeCompare(b.genre);
        return sortAsc ? cmp : -cmp;
      });
      return result;
    }, [artists, searchTerm, genreFilter, contractFilter, sortKey, sortAsc]);

    const handleSort = (key: SortKey) => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else { setSortKey(key); setSortAsc(true); }
    };

    const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      return Array.from({ length: 5 }, (_, i) => i < full ? '\u2605' : '\u2606').join('');
    };

    const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const sortIcon = (key: SortKey) => sortKey === key ? (sortAsc ? ' \u25B2' : ' \u25BC') : '';

    const totalActive = artists.filter(a => a.contractStatus === 'active').length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83C\uDFA4'} Artist Gallery</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {artists.length} artists | {totalActive} active contracts</Text>
          </div>
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Invite Artist</div>
        </div>

        {/* Search and filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const, marginBottom: tokens.spacing[3] }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search by name or genre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const, marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Genre:</Text>
            {GENRES.map(g => (
              <div key={g} onClick={() => setGenreFilter(g)} style={createFilterPillStyle(tokens, { active: genreFilter === g })}>{g}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], alignSelf: 'center', marginRight: tokens.spacing[1] }}>Contract:</Text>
            <div onClick={() => setContractFilter(null)} style={createFilterPillStyle(tokens, { active: contractFilter === null })}>All</div>
            {Object.entries(CONTRACT_CONFIG).map(([key, cfg]) => (
              <div key={key} onClick={() => setContractFilter(contractFilter === key ? null : key)} style={createFilterPillStyle(tokens, { active: contractFilter === key })}>{cfg.emoji} {cfg.label}</div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 44 }} />
            <div onClick={() => handleSort('name')} style={{ flex: 2, cursor: 'pointer', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Artist{sortIcon('name')}</Text>
            </div>
            <div onClick={() => handleSort('genre')} style={{ flex: 1, cursor: 'pointer', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Genre{sortIcon('genre')}</Text>
            </div>
            <div onClick={() => handleSort('rating')} style={{ width: 120, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Rating{sortIcon('rating')}</Text>
            </div>
            <div onClick={() => handleSort('eventsPlayed')} style={{ width: 80, cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Events{sortIcon('eventsPlayed')}</Text>
            </div>
            <div style={{ width: 110, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Contract</Text>
            </div>
            <div style={{ width: 100, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Action</Text>
            </div>
          </div>

          {/* Table rows */}
          {filtered.map((artist, idx) => {
            const isHovered = hoveredRow === artist.id;
            const contractCfg = CONTRACT_CONFIG[artist.contractStatus] || CONTRACT_CONFIG.none;
            return (
              <div
                key={artist.id}
                onClick={() => onArtistClick?.(artist.id)}
                onMouseEnter={() => setHoveredRow(artist.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderBottom: idx < filtered.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                  backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Avatar */}
                <div style={{ width: 44, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{getInitials(artist.name)}</Text>
                  </div>
                </div>

                {/* Name + Bio */}
                <div style={{ flex: 2, minWidth: 0 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{artist.name}</Text>
                  {artist.bio && (
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, display: 'block', maxWidth: 250 }}>{artist.bio}</Text>
                  )}
                </div>

                {/* Genre */}
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'inline-block', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{'\uD83C\uDFB5'} {artist.genre}</span>
                </div>

                {/* Rating */}
                <div style={{ width: 120, textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[500], letterSpacing: '1px', display: 'block' }}>{renderStars(artist.rating)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{artist.rating}</Text>
                </div>

                {/* Events */}
                <div style={{ width: 80, textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{artist.eventsPlayed}</Text>
                </div>

                {/* Contract status */}
                <div style={{ width: 110, textAlign: 'center' as const }}>
                  <span style={createBadgeStyle(tokens, contractCfg.color)}>{contractCfg.emoji} {contractCfg.label}</span>
                </div>

                {/* Action */}
                <div style={{ width: 100, textAlign: 'center' as const }}>
                  {artist.contractStatus !== 'active' ? (
                    <div onClick={(e) => { e.stopPropagation(); onInviteArtist?.(artist.id); }} style={{ display: 'inline-block', padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>{'\uD83D\uDCE8'} Invite</div>
                  ) : (
                    <div onClick={(e) => { e.stopPropagation(); onArtistClick?.(artist.id); }} style={{ display: 'inline-block', padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', ...hoverStyle }}>View</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Summary footer */}
          <div style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ width: 44 }} />
            <div style={{ flex: 2 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{filtered.length} artist{filtered.length !== 1 ? 's' : ''}</Text>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 120, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Avg: {(filtered.reduce((s, a) => s + a.rating, 0) / (filtered.length || 1)).toFixed(1)}</Text>
            </div>
            <div style={{ width: 80, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{filtered.reduce((s, a) => s + a.eventsPlayed, 0)} total</Text>
            </div>
            <div style={{ width: 110 }} />
            <div style={{ width: 100 }} />
          </div>
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
