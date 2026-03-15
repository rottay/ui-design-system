'use client';

/**
 * EvResaleMarketplace - Browse Preset
 * Search, price filter, listing cards with seller ratings and buy button
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createSectionHeaderStyle, createHoverStyle } from '../../../helpers';
import type { EvResaleMarketplaceProps, ResaleListing } from '../../core';

const MOCK_LISTINGS: ResaleListing[] = [
  { id: '1', ticketType: 'VIP', eventName: 'Neon Nights Festival', originalPrice: 120, askingPrice: 95, sellerName: 'Alex T.', sellerRating: 4.8, status: 'active' },
  { id: '2', ticketType: 'Backstage', eventName: 'Neon Nights Festival', originalPrice: 250, askingPrice: 200, sellerName: 'Jamie K.', sellerRating: 4.5, status: 'active' },
  { id: '3', ticketType: 'GA', eventName: 'Neon Nights Festival', originalPrice: 45, askingPrice: 38, sellerName: 'Morgan L.', sellerRating: 5.0, status: 'active' },
  { id: '4', ticketType: 'VIP', eventName: 'Neon Nights Festival', originalPrice: 120, askingPrice: 110, sellerName: 'Casey R.', sellerRating: 3.9, status: 'active' },
  { id: '5', ticketType: 'GA', eventName: 'Neon Nights Festival', originalPrice: 45, askingPrice: 42, sellerName: 'Drew P.', sellerRating: 4.2, status: 'active' },
  { id: '6', ticketType: 'Early Bird', eventName: 'Neon Nights Festival', originalPrice: 35, askingPrice: 50, sellerName: 'Sam W.', sellerRating: 4.7, status: 'active' },
];

export const BrowseEvResaleMarketplace = createPreset<EvResaleMarketplaceProps>({
  name: 'EvResaleMarketplace.Browse',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvResaleMarketplaceProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const listings = props.listings ?? MOCK_LISTINGS;
    const [search, setSearch] = useState('');
    const [maxPrice, setMaxPrice] = useState(300);

    const filtered = useMemo(() => listings.filter(l => {
      if (l.status !== 'active') return false;
      if (search && !l.ticketType.toLowerCase().includes(search.toLowerCase()) && !l.sellerName.toLowerCase().includes(search.toLowerCase())) return false;
      if (l.askingPrice > maxPrice) return false;
      return true;
    }), [listings, search, maxPrice]);

    const stars = (r: number) => {
      const full = Math.floor(r);
      return Array.from({ length: 5 }, (_, i) => i < full ? '\u2B50' : '\u2606').join('');
    };

    const priceDiff = (orig: number, ask: number) => {
      const diff = ask - orig;
      const pct = Math.round((diff / orig) * 100);
      return { diff, pct, isBelow: diff < 0 };
    };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        <div>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Ticket Marketplace</h2>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Browse verified resale tickets</span>
        </div>

        {/* Search + Filter */}
        <Box style={cardBase}>
          <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="\uD83D\uDD0D Search ticket type or seller..." style={{ flex: 1, minWidth: 200, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white }} />
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Max price:</span>
              <input type="range" min={20} max={300} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 120 }} />
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${maxPrice}</span>
            </Box>
          </Box>
          <Box style={{ marginTop: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{filtered.length} listings found</Box>
        </Box>

        {/* Listing Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
          {filtered.map((listing) => {
            const pd = priceDiff(listing.originalPrice, listing.askingPrice);
            return (
              <Box key={listing.id} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], ...createHoverStyle(tokens) }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={createBadgeStyle(tokens, listing.ticketType === 'VIP' || listing.ticketType === 'Backstage' ? 'warning' : 'primary')}>{listing.ticketType}</span>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>{listing.eventName}</div>
                  </div>
                  <Box style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${listing.askingPrice}</div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, textDecoration: 'line-through', color: tokens.colors.neutral[400] }}>Was ${listing.originalPrice}</div>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>{listing.sellerName[0]}</Box>
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{listing.sellerName}</div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs }}>{stars(listing.sellerRating)} <span style={{ color: tokens.colors.neutral[500] }}>{listing.sellerRating}</span></div>
                    </div>
                  </Box>
                  <span style={createBadgeStyle(tokens, pd.isBelow ? 'success' : pd.pct === 0 ? 'info' : 'error')}>
                    {pd.isBelow ? `${pd.pct}%` : `+${pd.pct}%`}
                  </span>
                </Box>
                <button onClick={() => props.onBuy?.(listing.id)} style={{ width: '100%', padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Buy Now</button>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
