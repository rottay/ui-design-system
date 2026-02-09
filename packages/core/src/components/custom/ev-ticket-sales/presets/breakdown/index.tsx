'use client';

/**
 * EvTicketSales - Breakdown Preset
 * Per-type detailed table with sold/total, revenue, and progress bars
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createProgressBarStyle,
  createBadgeStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { EvTicketSalesProps, TicketTypeBreakdown } from '../../core';

const MOCK_BREAKDOWN: TicketTypeBreakdown[] = [
  { type: 'General Admission', sold: 1800, total: 2500, price: 45, revenue: 81000, color: 'primary' },
  { type: 'VIP', sold: 620, total: 800, price: 120, revenue: 74400, color: 'secondary' },
  { type: 'Backstage', sold: 180, total: 200, price: 250, revenue: 45000, color: 'warning' },
  { type: 'Early Bird', sold: 600, total: 600, price: 35, revenue: 21000, color: 'success' },
];

export const BreakdownEvTicketSales = createPreset<EvTicketSalesProps>({
  name: 'EvTicketSales.Breakdown',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketSalesProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const breakdown = props.breakdown ?? MOCK_BREAKDOWN;
    const [sortCol, setSortCol] = useState<'type' | 'sold' | 'revenue' | 'price'>('revenue');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const handleSort = (col: typeof sortCol) => {
      if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortCol(col); setSortDir('desc'); }
    };

    const sorted = useMemo(() => [...breakdown].sort((a, b) => {
      const av = sortCol === 'type' ? a.type : a[sortCol];
      const bv = sortCol === 'type' ? b.type : b[sortCol];
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    }), [breakdown, sortCol, sortDir]);

    const totalSold = breakdown.reduce((s, t) => s + t.sold, 0);
    const totalCapacity = breakdown.reduce((s, t) => s + t.total, 0);
    const totalRevenue = breakdown.reduce((s, t) => s + t.revenue, 0);
    const avgPrice = Math.round(totalRevenue / totalSold);

    const thStyle = {
      textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50], cursor: 'pointer', userSelect: 'none' as const,
    };
    const tdStyle = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
    };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Ticket Breakdown</h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Detailed per-type sales analysis</span>
          </div>
          {props.onExport && (
            <button onClick={props.onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
              Export CSV
            </button>
          )}
        </Box>

        {/* Summary KPI Strip */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {[
            { label: 'Total Sold', value: totalSold.toLocaleString(), icon: '\uD83C\uDFAB' },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '\uD83D\uDCB0' },
            { label: 'Avg Price', value: `$${avgPrice}`, icon: '\uD83D\uDCCA' },
            { label: 'Capacity', value: `${Math.round((totalSold / totalCapacity) * 100)}%`, icon: '\uD83C\uDFDF\uFE0F' },
          ].map((kpi, i) => (
            <Box key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl }}>{kpi.icon}</span>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</div>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{kpi.value}</div>
              </div>
            </Box>
          ))}
        </Box>

        {/* Detailed Table */}
        <Box style={cardBase}>
          <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Sales by Ticket Type</span>
          <Box style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('type')} style={thStyle}>
                    Type {sortCol === 'type' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                  </th>
                  <th onClick={() => handleSort('price')} style={{ ...thStyle, textAlign: 'right' as const }}>
                    Price {sortCol === 'price' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                  </th>
                  <th onClick={() => handleSort('sold')} style={{ ...thStyle, textAlign: 'right' as const }}>
                    Sold {sortCol === 'sold' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                  </th>
                  <th style={thStyle}>Progress</th>
                  <th onClick={() => handleSort('revenue')} style={{ ...thStyle, textAlign: 'right' as const }}>
                    Revenue {sortCol === 'revenue' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((ticket, idx) => {
                  const pct = Math.round((ticket.sold / ticket.total) * 100);
                  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = { primary: 'primary', secondary: 'secondary', warning: 'warning', success: 'success' };
                  const bColor = colorMap[ticket.color] ?? 'primary';
                  const scale = (tokens.colors as any)[`${bColor}Scale`] ?? tokens.colors.primaryScale;
                  const pbar = createProgressBarStyle(tokens, { color: scale[500], percent: pct });

                  return (
                    <tr key={idx}>
                      <td style={tdStyle}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: scale[500], display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{ticket.type}</span>
                        </Box>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const }}>
                        <span style={createBadgeStyle(tokens, bColor)}>${ticket.price}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.semibold }}>
                        {ticket.sold.toLocaleString()} / {ticket.total.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, minWidth: 120 }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box style={{ ...pbar.track, flex: 1 }}><Box style={pbar.fill} /></Box>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], whiteSpace: 'nowrap' }}>{pct}%</span>
                        </Box>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        ${ticket.revenue.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const, color: pct >= 100 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>
                        {pct >= 100 ? 'Sold Out' : `${(ticket.total - ticket.sold).toLocaleString()} left`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                  <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: 'none' }}>Total</td>
                  <td style={{ ...tdStyle, borderBottom: 'none' }} />
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: 'none' }}>
                    {totalSold.toLocaleString()} / {totalCapacity.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: 'none' }}>
                    {(() => { const tpct = Math.round((totalSold / totalCapacity) * 100); const tb = createProgressBarStyle(tokens, { percent: tpct }); return (<Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}><Box style={{ ...tb.track, flex: 1 }}><Box style={tb.fill} /></Box><span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{tpct}%</span></Box>); })()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: 'none' }}>
                    ${totalRevenue.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, borderBottom: 'none', color: tokens.colors.neutral[500] }}>
                    {(totalCapacity - totalSold).toLocaleString()} left
                  </td>
                </tr>
              </tfoot>
            </table>
          </Box>
        </Box>
      </Box>
    );
  },
});
