'use client';

/**
 * EvVenueDirectory - Map Preset
 * Split-panel layout with venue list sidebar, simulated map area, zone breakdowns, capacity meters
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
import type { EvVenueDirectoryProps, VenueCard } from '../../core';

const MOCK_VENUES: VenueCard[] = [
  { id: 'v1', name: 'Arena Complex', address: '1200 Main Blvd', city: 'Downtown', capacity: 5000, zonesCount: 4, stagesCount: 3, rating: 4.8, isAvailable: true },
  { id: 'v2', name: 'Garden Stage', address: '45 Park Avenue', city: 'Westside', capacity: 2000, zonesCount: 2, stagesCount: 2, rating: 4.5, isAvailable: true },
  { id: 'v3', name: 'Beach Club', address: '88 Shoreline Dr', city: 'Marina Bay', capacity: 800, zonesCount: 2, stagesCount: 1, rating: 4.2, isAvailable: false },
  { id: 'v4', name: 'The Loft', address: '320 Industrial St', city: 'Arts District', capacity: 500, zonesCount: 1, stagesCount: 1, rating: 4.6, isAvailable: true },
  { id: 'v5', name: 'Warehouse 42', address: '42 Dock Road', city: 'Portside', capacity: 1200, zonesCount: 3, stagesCount: 2, rating: 4.4, isAvailable: true },
  { id: 'v6', name: 'Sky Terrace', address: '100 Tower Place', city: 'Downtown', capacity: 350, zonesCount: 1, stagesCount: 1, rating: 4.9, isAvailable: false },
  { id: 'v7', name: 'Festival Grounds', address: '500 Field Lane', city: 'Northville', capacity: 15000, zonesCount: 6, stagesCount: 5, rating: 4.3, isAvailable: true },
  { id: 'v8', name: 'Jazz Cellar', address: '12 Bourbon St', city: 'Old Town', capacity: 200, zonesCount: 1, stagesCount: 1, rating: 4.7, isAvailable: true },
];

const MAP_PINS = [
  { id: 'v1', x: 55, y: 35 }, { id: 'v2', x: 25, y: 50 }, { id: 'v3', x: 75, y: 70 },
  { id: 'v4', x: 40, y: 60 }, { id: 'v5', x: 65, y: 45 }, { id: 'v6', x: 50, y: 25 },
  { id: 'v7', x: 30, y: 20 }, { id: 'v8', x: 60, y: 65 },
];

export const MapEvVenueDirectory = createPreset<EvVenueDirectoryProps>({
  name: 'EvVenueDirectory.Map',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvVenueDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { venues: propVenues, onVenueClick, className, style } = props;
    const venues = propVenues && propVenues.length > 0 ? propVenues : MOCK_VENUES;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<string | null>('v1');
    const [availableOnly, setAvailableOnly] = useState(false);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => venues.filter(v => {
      if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase()) && !v.city.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (availableOnly && !v.isAvailable) return false;
      return true;
    }), [venues, searchTerm, availableOnly]);

    const selectedDetail = venues.find(v => v.id === selectedVenue);

    const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      return Array.from({ length: 5 }, (_, i) => i < full ? '\u2605' : '\u2606').join('');
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'hidden', backgroundColor: tokens.colors.neutral[50], display: 'flex', flexDirection: 'column', ...style }}>
        {/* Header */}
        <div style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                Venue Map
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {filtered.length} venue{filtered.length !== 1 ? 's' : ''} | {filtered.filter(v => v.isAvailable).length} available
              </Text>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setAvailableOnly(!availableOnly)} style={createFilterPillStyle(tokens, { active: availableOnly })}>Available Only</div>
            </div>
          </div>
        </div>

        {/* Main split layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left sidebar - venue list */}
          <div style={{ width: 320, borderRight: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Search */}
            <div style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
              <div style={{ position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>🔍</div>
                <input type="text" placeholder="Search venues or cities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
              </div>
            </div>

            {/* Venue list */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {filtered.map((venue) => {
                const isSelected = selectedVenue === venue.id;
                return (
                  <div key={venue.id} onClick={() => { setSelectedVenue(venue.id); onVenueClick?.(venue.id); }}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{venue.name}</Text>
                      <span style={{
                        width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                        backgroundColor: venue.isAvailable ? tokens.colors.successScale[500] : tokens.colors.errorScale[400],
                      }} />
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>
                      📍 {venue.address}, {venue.city}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>👥 {venue.capacity.toLocaleString()}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[500] }}>{renderStars(venue.rating)}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{venue.rating}</Text>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No venues found</Text>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Simulated map */}
            <div style={{ flex: 1, position: 'relative' as const, backgroundColor: tokens.colors.neutral[100], backgroundImage: `radial-gradient(circle at 25% 25%, ${tokens.colors.neutral[200]} 1px, transparent 1px), radial-gradient(circle at 75% 75%, ${tokens.colors.neutral[200]} 1px, transparent 1px)`, backgroundSize: '40px 40px', overflow: 'hidden' }}>
              {/* Map pins */}
              {MAP_PINS.map((pin) => {
                const venue = venues.find(v => v.id === pin.id);
                if (!venue) return null;
                const isFiltered = filtered.some(v => v.id === pin.id);
                if (!isFiltered) return null;
                const isSelected = selectedVenue === pin.id;
                return (
                  <div key={pin.id} onClick={() => { setSelectedVenue(pin.id); onVenueClick?.(pin.id); }}
                    style={{
                      position: 'absolute' as const, left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)',
                      cursor: 'pointer', zIndex: isSelected ? 10 : 1,
                    }}
                  >
                    <div style={{
                      width: isSelected ? 40 : 28, height: isSelected ? 40 : 28,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[600] : venue.isAvailable ? tokens.colors.successScale[500] : tokens.colors.errorScale[400],
                      border: `3px solid ${tokens.colors.common.white}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: `all ${tokens.motion.hover}`,
                      fontSize: isSelected ? tokens.typography.fontSize.sm : tokens.typography.fontSize.xs,
                      color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold,
                    }}>
                      🏛️
                    </div>
                    {isSelected && (
                      <div style={{
                        position: 'absolute' as const, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: tokens.spacing[1],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.neutral[900], color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}>
                        {venue.name}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Map legend */}
              <div style={{
                position: 'absolute' as const, bottom: tokens.spacing[3], right: tokens.spacing[3],
                ...cardBase, padding: tokens.spacing[3], minWidth: 140,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Legend</Text>
                {[
                  { label: 'Available', color: tokens.colors.successScale[500] },
                  { label: 'Booked', color: tokens.colors.errorScale[400] },
                  { label: 'Selected', color: tokens.colors.primaryScale[600] },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: i < 2 ? tokens.spacing[1] : 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: item.color, border: `2px solid ${tokens.colors.common.white}`, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{item.label}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected venue detail panel */}
            {selectedDetail && (
              <div style={{ padding: tokens.spacing[4], borderTop: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{selectedDetail.name}</Text>
                      <span style={createBadgeStyle(tokens, selectedDetail.isAvailable ? 'success' : 'error')}>
                        {selectedDetail.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>📍 {selectedDetail.address}, {selectedDetail.city}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500] }}>{renderStars(selectedDetail.rating)}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{selectedDetail.rating}</Text>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
                  {[
                    { icon: '👥', label: 'Capacity', value: selectedDetail.capacity.toLocaleString() },
                    { icon: '🗺️', label: 'Zones', value: selectedDetail.zonesCount.toString() },
                    { icon: '🎸', label: 'Stages', value: selectedDetail.stagesCount.toString() },
                    { icon: '📊', label: 'City', value: selectedDetail.city },
                  ].map((spec, i) => (
                    <div key={i} style={{ padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{spec.icon}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{spec.value}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{spec.label}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
