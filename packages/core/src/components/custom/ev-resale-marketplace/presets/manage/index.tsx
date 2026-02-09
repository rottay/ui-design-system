'use client';

/**
 * EvResaleMarketplace - Manage Preset
 * My listings table with status, edit/remove actions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvResaleMarketplaceProps, ResaleListing } from '../../core';

const MOCK_LISTINGS: ResaleListing[] = [
  { id: '1', ticketType: 'VIP', eventName: 'Neon Nights Festival', originalPrice: 120, askingPrice: 95, sellerName: 'You', sellerRating: 4.8, status: 'active' },
  { id: '2', ticketType: 'GA', eventName: 'Neon Nights Festival', originalPrice: 45, askingPrice: 38, sellerName: 'You', sellerRating: 4.8, status: 'active' },
  { id: '3', ticketType: 'Backstage', eventName: 'Neon Nights Festival', originalPrice: 250, askingPrice: 200, sellerName: 'You', sellerRating: 4.8, status: 'sold' },
  { id: '4', ticketType: 'GA', eventName: 'Summer Beats', originalPrice: 35, askingPrice: 30, sellerName: 'You', sellerRating: 4.8, status: 'expired' },
  { id: '5', ticketType: 'VIP', eventName: 'Summer Beats', originalPrice: 100, askingPrice: 85, sellerName: 'You', sellerRating: 4.8, status: 'sold' },
  { id: '6', ticketType: 'Early Bird', eventName: 'Neon Nights Festival', originalPrice: 35, askingPrice: 45, sellerName: 'You', sellerRating: 4.8, status: 'active' },
];

export const ManageEvResaleMarketplace = createPreset<EvResaleMarketplaceProps>({
  name: 'EvResaleMarketplace.Manage',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvResaleMarketplaceProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const listings = props.listings ?? MOCK_LISTINGS;

    const active = listings.filter(l => l.status === 'active');
    const sold = listings.filter(l => l.status === 'sold');
    const expired = listings.filter(l => l.status === 'expired');
    const totalEarned = sold.reduce((s, l) => s + l.askingPrice, 0);

    const statusBadge = (s: string): 'success' | 'warning' | 'error' | 'info' => s === 'active' ? 'success' : s === 'sold' ? 'info' : 'warning';
    const statusIcon = (s: string) => s === 'active' ? '\uD83D\uDFE2' : s === 'sold' ? '\u2705' : '\u23F0';

    const thStyle = { textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` };
    const tdStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>My Listings</h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Manage your ticket resale listings</span>
          </div>
          <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>+ New Listing</button>
        </Box>

        {/* Summary */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {[
            { label: 'Active', value: active.length, icon: '\uD83D\uDFE2', color: tokens.colors.successScale },
            { label: 'Sold', value: sold.length, icon: '\u2705', color: tokens.colors.infoScale },
            { label: 'Expired', value: expired.length, icon: '\u23F0', color: tokens.colors.warningScale },
            { label: 'Earned', value: `$${totalEarned}`, icon: '\uD83D\uDCB0', color: tokens.colors.primaryScale },
          ].map((s, i) => (
            <Box key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.lg }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</div>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{s.value}</div>
              </div>
            </Box>
          ))}
        </Box>

        {/* Table */}
        <Box style={cardBase}>
          <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>All Listings</span>
          <Box style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Event', 'Ticket Type', 'Original', 'Asking', 'Diff', 'Status', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {listings.map((l) => {
                  const diff = l.askingPrice - l.originalPrice;
                  const pct = Math.round((diff / l.originalPrice) * 100);
                  return (
                    <tr key={l.id}>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{l.eventName}</td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, l.ticketType === 'VIP' || l.ticketType === 'Backstage' ? 'warning' : 'primary')}>{l.ticketType}</span></td>
                      <td style={tdStyle}>${l.originalPrice}</td>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold }}>${l.askingPrice}</td>
                      <td style={tdStyle}>
                        <span style={{ color: diff < 0 ? tokens.colors.successScale[600] : diff > 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
                          {diff < 0 ? '' : '+'}{pct}%
                        </span>
                      </td>
                      <td style={tdStyle}><span style={createBadgeStyle(tokens, statusBadge(l.status))}>{statusIcon(l.status)} {l.status}</span></td>
                      <td style={tdStyle}>
                        {l.status === 'active' ? (
                          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                            <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: 'transparent', color: tokens.colors.primaryScale[600], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                            <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: 'transparent', color: tokens.colors.errorScale[600], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                          </Box>
                        ) : (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    );
  },
});
