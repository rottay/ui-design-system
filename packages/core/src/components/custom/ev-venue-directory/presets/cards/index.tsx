'use client';

/**
 * EvVenueDirectory - Cards Preset
 * Venue card grid with search, filters, capacity info, rating stars, availability badges
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
import type { EvVenueDirectoryProps, VenueCard } from '../../core';

const MOCK_VENUES: VenueCard[] = [
  { id: 'v1', name: 'Arena Complex', address: '1200 Main Blvd', city: 'Downtown', capacity: 5000, zonesCount: 4, stagesCount: 3, rating: 4.8, isAvailable: true },
  { id: 'v2', name: 'Garden Stage', address: '45 Park Avenue', city: 'Westside', capacity: 2000, zonesCount: 2, stagesCount: 2, rating: 4.5, isAvailable: true },
  { id: 'v3', name: 'Beach Club', address: '88 Shoreline Dr', city: 'Marina Bay', capacity: 800, zonesCount: 2, stagesCount: 1, rating: 4.2, isAvailable: false },
  { id: 'v4', name: 'The Loft', address: '320 Industrial St', city: 'Arts District', capacity: 500, zonesCount: 1, stagesCount: 1, rating: 4.6, isAvailable: true },
];

const VENUE_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const CardsEvVenueDirectory = createPreset<EvVenueDirectoryProps>({
  name: 'EvVenueDirectory.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvVenueDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { venues: propVenues, onVenueClick, className, style } = props;
    const venues = propVenues && propVenues.length > 0 ? propVenues : MOCK_VENUES;

    const [searchTerm, setSearchTerm] = useState('');
    const [capacityFilter, setCapacityFilter] = useState<string | null>(null);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => venues.filter(v => {
      if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase()) && !v.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (availableOnly && !v.isAvailable) return false;
      if (capacityFilter === 'small' && v.capacity > 1000) return false;
      if (capacityFilter === 'medium' && (v.capacity <= 1000 || v.capacity > 3000)) return false;
      if (capacityFilter === 'large' && v.capacity <= 3000) return false;
      return true;
    }), [venues, searchTerm, capacityFilter, availableOnly]);

    const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      return Array.from({ length: 5 }, (_, i) => i < full ? '\u2605' : '\u2606').join('');
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{'\uD83C\uDFDB\uFE0F'} Venue Directory</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} venue{filtered.length !== 1 ? 's' : ''} found</Text>
          </div>
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>+ Add Venue</div>
        </div>

        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search venues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setCapacityFilter(null)} style={createFilterPillStyle(tokens, { active: capacityFilter === null })}>All Sizes</div>
              <div onClick={() => setCapacityFilter(capacityFilter === 'small' ? null : 'small')} style={createFilterPillStyle(tokens, { active: capacityFilter === 'small' })}>{'\uD83D\uDFE2'} Small</div>
              <div onClick={() => setCapacityFilter(capacityFilter === 'medium' ? null : 'medium')} style={createFilterPillStyle(tokens, { active: capacityFilter === 'medium' })}>{'\uD83D\uDFE1'} Medium</div>
              <div onClick={() => setCapacityFilter(capacityFilter === 'large' ? null : 'large')} style={createFilterPillStyle(tokens, { active: capacityFilter === 'large' })}>{'\uD83D\uDD34'} Large</div>
              <div onClick={() => setAvailableOnly(!availableOnly)} style={createFilterPillStyle(tokens, { active: availableOnly })}>{'\u2705'} Available</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[5] }}>
          {filtered.map((venue, idx) => {
            const isHovered = hoveredCard === venue.id;
            return (
              <div key={venue.id} onClick={() => onVenueClick?.(venue.id)} onMouseEnter={() => setHoveredCard(venue.id)} onMouseLeave={() => setHoveredCard(null)} style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}) }}>
                <div style={{ height: 100, background: VENUE_GRADIENTS[idx % VENUE_GRADIENTS.length], position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize['2xl'], opacity: 0.5 }}>{'\uD83C\uDFDB\uFE0F'}</Text>
                  <div style={{ position: 'absolute' as const, top: tokens.spacing[2], right: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, venue.isAvailable ? 'success' : 'error')}>{venue.isAvailable ? '\u2705 Available' : '\u274C Booked'}</span>
                  </div>
                  <div style={{ position: 'absolute' as const, bottom: tokens.spacing[2], left: tokens.spacing[2] }}>
                    <span style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: 'rgba(0,0,0,0.5)', color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>{'\uD83D\uDC65'} {venue.capacity.toLocaleString()} cap</span>
                  </div>
                </div>
                <div style={{ padding: tokens.spacing[4] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{venue.name}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[3] }}>{'\uD83D\uDCCD'} {venue.address}, {venue.city}</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500], letterSpacing: '2px' }}>{renderStars(venue.rating)}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{venue.rating}</Text>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                    {[
                      { emoji: '\uD83D\uDDFA\uFE0F', value: venue.zonesCount, label: 'Zones' },
                      { emoji: '\uD83C\uDFB8', value: venue.stagesCount, label: 'Stages' },
                      { emoji: '\uD83D\uDC65', value: venue.capacity.toLocaleString(), label: 'Capacity' },
                    ].map((spec, si) => (
                      <div key={si} style={{ flex: 1, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{spec.emoji}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{spec.value}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{spec.label}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFDB\uFE0F'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No venues match your criteria</Text>
          </div>
        )}
      </Box>
    );
  },
});
