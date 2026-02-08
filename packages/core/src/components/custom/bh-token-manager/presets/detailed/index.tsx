'use client';

/**
 * BhTokenManager - Detailed Preset
 * Transaction-focused view with expanded table, summary stats,
 * per-team breakdowns, and granular filtering controls.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type {
  BhTokenManagerProps,
  TokenBalance,
  TokenTransaction,
  TeamQuota,
  CostBreakdownItem,
  AlertConfig,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: format large numbers                                      */
/* ------------------------------------------------------------------ */
function formatTokenCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: trend arrow                                               */
/* ------------------------------------------------------------------ */
function trendArrow(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '\u2191';
    case 'down':
      return '\u2193';
    case 'stable':
      return '\u2192';
  }
}

/* ------------------------------------------------------------------ */
/*  Detailed Preset                                                   */
/* ------------------------------------------------------------------ */
export const DetailedBhTokenManager = createPreset<BhTokenManagerProps>({
  name: 'BhTokenManager.Detailed',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTokenManagerProps>) => {
    const { Box, Text } = primitives;

    const {
      balance,
      consumptionData = [],
      costBreakdown = [],
      teamQuotas = [],
      transactions = [],
      alerts = [],
      forecast = [],
      timeRange: controlledTimeRange,
      onTimeRangeChange,
      costGrouping: controlledCostGrouping,
      onCostGroupingChange,
      selectedTeam: controlledSelectedTeam,
      onTeamSelect,
      transactionFilter: controlledTransactionFilter,
      onTransactionFilterChange,
      onTopUp,
      onAlertConfigChange,
      className,
      style,
    } = props;

    const [localTimeRange, setLocalTimeRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
    const [localTransactionFilter, setLocalTransactionFilter] = useState<'all' | 'usage' | 'purchase' | 'credit'>('all');
    const [localSelectedTeam, setLocalSelectedTeam] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<'date' | 'amount' | 'cost' | 'balance'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);

    const timeRange = controlledTimeRange ?? localTimeRange;
    const transactionFilter = controlledTransactionFilter ?? localTransactionFilter;
    const selectedTeam = controlledSelectedTeam !== undefined ? controlledSelectedTeam : localSelectedTeam;
    const pageSize = 20;

    const handleTimeRange = (range: '7d' | '30d' | '90d' | 'year') => {
      setLocalTimeRange(range);
      onTimeRangeChange?.(range);
    };

    const handleTransactionFilter = (filter: 'all' | 'usage' | 'purchase' | 'credit') => {
      setLocalTransactionFilter(filter);
      onTransactionFilterChange?.(filter);
      setPage(0);
    };

    const handleTeamSelect = (teamId: string | null) => {
      setLocalSelectedTeam(teamId);
      onTeamSelect?.(teamId);
      setPage(0);
    };

    const handleSort = (column: 'date' | 'amount' | 'cost' | 'balance') => {
      if (sortColumn === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('desc');
      }
    };

    const isGlass = engine === 'modern' && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    /* ---------- Filtered & sorted transactions ---------- */
    const processedTransactions = useMemo(() => {
      let filtered = transactions;
      if (transactionFilter !== 'all') {
        filtered = filtered.filter((t) => t.type === transactionFilter);
      }
      if (selectedTeam) {
        filtered = filtered.filter((t) => t.team === selectedTeam || !t.team);
      }

      const sorted = [...filtered].sort((a, b) => {
        const dir = sortDirection === 'asc' ? 1 : -1;
        switch (sortColumn) {
          case 'date':
            return (a.date > b.date ? 1 : -1) * dir;
          case 'amount':
            return (a.amount - b.amount) * dir;
          case 'cost':
            return (a.cost - b.cost) * dir;
          case 'balance':
            return (a.runningBalance - b.runningBalance) * dir;
          default:
            return 0;
        }
      });

      return sorted;
    }, [transactions, transactionFilter, selectedTeam, sortColumn, sortDirection]);

    const paginatedTransactions = useMemo(() => {
      const start = page * pageSize;
      return processedTransactions.slice(start, start + pageSize);
    }, [processedTransactions, page]);

    const totalPages = Math.ceil(processedTransactions.length / pageSize);

    /* ---------- Summary stats ---------- */
    const summaryStats = useMemo(() => {
      const totalUsage = transactions.filter((t) => t.type === 'usage').reduce((s, t) => s + t.amount, 0);
      const totalPurchases = transactions.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
      const totalCredits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalSpend = transactions.filter((t) => t.type === 'usage').reduce((s, t) => s + t.cost, 0);
      return { totalUsage, totalPurchases, totalCredits, totalSpend };
    }, [transactions]);

    /* ---------- Transaction type badge ---------- */
    const txTypeBadge = (type: 'usage' | 'purchase' | 'credit') => {
      switch (type) {
        case 'usage':
          return createBadgeStyle(tokens, 'warning');
        case 'purchase':
          return createBadgeStyle(tokens, 'success');
        case 'credit':
          return createBadgeStyle(tokens, 'info');
      }
    };

    /* ---------- Sort indicator ---------- */
    const sortIndicator = (column: 'date' | 'amount' | 'cost' | 'balance') => {
      if (sortColumn !== column) return '';
      return sortDirection === 'asc' ? ' \u25B2' : ' \u25BC';
    };

    /* ---------- Trend color ---------- */
    const trendColor = (trend: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up':
          return tokens.colors.errorScale[500];
        case 'down':
          return tokens.colors.successScale[500];
        case 'stable':
          return tokens.colors.neutral[500];
      }
    };

    /* ---------- Runway color ---------- */
    const runwayColor = (days: number) => {
      if (days < 7) return tokens.colors.errorScale[500];
      if (days < 30) return tokens.colors.warningScale[500];
      return tokens.colors.successScale[500];
    };

    /* ---------- Quota color ---------- */
    const quotaColor = (used: number, limit: number) => {
      const pct = limit > 0 ? used / limit : 0;
      if (pct >= 0.9) return tokens.colors.errorScale[500];
      if (pct >= 0.7) return tokens.colors.warningScale[500];
      return tokens.colors.primaryScale[500];
    };

    const activeAlerts = alerts.filter((a) => a.enabled);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[5],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ========== HEADER BAR ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl || '1.25rem',
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            Token Usage Details
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {(['7d', '30d', '90d', 'year'] as const).map((range) => (
              <div
                key={range}
                onClick={() => handleTimeRange(range)}
                style={{
                  ...hoverStyle,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: timeRange === range ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  backgroundColor: timeRange === range ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: timeRange === range ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${timeRange === range ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                }}
              >
                {range === 'year' ? '1Y' : range.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* ========== SUMMARY STAT CARDS ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
          {/* Balance */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Balance</Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {balance ? formatTokenCount(balance.balance) : '0'}
            </Text>
            {balance && (
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: trendColor(balance.trend),
                  }}
                >
                  {trendArrow(balance.trend)} {formatTokenCount(balance.burnRatePerDay)}/day
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: runwayColor(balance.projectedRunwayDays),
                    marginLeft: tokens.spacing[1],
                  }}
                >
                  {balance.projectedRunwayDays}d runway
                </span>
              </div>
            )}
          </Box>

          {/* Total Usage */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Total Usage</Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.errorScale[600],
              }}
            >
              {formatTokenCount(summaryStats.totalUsage)}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              {formatCurrency(summaryStats.totalSpend)} spent
            </Text>
          </Box>

          {/* Total Purchased */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Purchased</Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {formatTokenCount(summaryStats.totalPurchases)}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              tokens added
            </Text>
          </Box>

          {/* Credits */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Credits</Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.infoScale[600],
              }}
            >
              {formatTokenCount(summaryStats.totalCredits)}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              tokens credited
            </Text>
          </Box>
        </div>

        {/* ========== TEAM + ALERTS SIDEBAR + MAIN TABLE ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: tokens.spacing[5] }}>
          {/* ---- Left sidebar: Teams + Alerts ---- */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {/* Team filter */}
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ ...sectionHeader }}>Filter by Team</Text>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                <div
                  onClick={() => handleTeamSelect(null)}
                  style={{
                    ...hoverStyle,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: selectedTeam === null ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    backgroundColor: selectedTeam === null ? tokens.colors.primaryScale[50] : 'transparent',
                    color: selectedTeam === null ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  }}
                >
                  All Teams
                </div>
                {teamQuotas.map((team) => {
                  const pct = team.limit > 0 ? Math.min((team.used / team.limit) * 100, 100) : 0;
                  return (
                    <div
                      key={team.teamId}
                      onClick={() => handleTeamSelect(team.teamId)}
                      style={{
                        ...hoverStyle,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: selectedTeam === team.teamId ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                        backgroundColor: selectedTeam === team.teamId ? tokens.colors.primaryScale[50] : 'transparent',
                        color: selectedTeam === team.teamId ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{team.teamName}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 3,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[100],
                          overflow: 'hidden',
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: quotaColor(team.used, team.limit),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Box>

            {/* Active alerts */}
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ ...sectionHeader }}>Active Alerts</Text>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => {
                    const badgeColor = alert.type === 'low_balance' ? 'error' : alert.type === 'high_usage' ? 'warning' : 'info';
                    const label = alert.type === 'low_balance' ? 'Low Balance' : alert.type === 'high_usage' ? 'High Usage' : 'Quota Exceeded';
                    return (
                      <div
                        key={alert.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.neutral[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}
                      >
                        <span style={createBadgeStyle(tokens, badgeColor)}>{label}</span>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {alert.type === 'low_balance' ? formatTokenCount(alert.threshold) : `${alert.threshold}%`}
                        </Text>
                      </div>
                    );
                  })
                ) : (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], textAlign: 'center' as const, padding: tokens.spacing[2] }}>
                    No active alerts
                  </Text>
                )}
              </div>
            </Box>

            {/* Cost breakdown summary */}
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ ...sectionHeader }}>Cost Summary</Text>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {costBreakdown.map((item) => (
                  <div key={item.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                        {item.category}
                      </Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </div>
                ))}
                {costBreakdown.length === 0 && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], textAlign: 'center' as const }}>
                    No cost data
                  </Text>
                )}
              </div>
            </Box>
          </div>

          {/* ---- Main transaction table ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Transactions</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {(['all', 'usage', 'purchase', 'credit'] as const).map((f) => (
                  <div
                    key={f}
                    onClick={() => handleTransactionFilter(f)}
                    style={{
                      ...hoverStyle,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: transactionFilter === f ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      backgroundColor: transactionFilter === f ? tokens.colors.primaryScale[50] : 'transparent',
                      color: transactionFilter === f ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Result count */}
            <div style={{ marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {processedTransactions.length} transaction{processedTransactions.length !== 1 ? 's' : ''} found
              </Text>
            </div>

            <div style={{ overflowX: 'auto' as const }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse' as const,
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    {[
                      { key: 'date' as const, label: 'Date' },
                      { key: null, label: 'Type' },
                      { key: 'amount' as const, label: 'Amount' },
                      { key: null, label: 'Provider' },
                      { key: null, label: 'Team' },
                      { key: 'cost' as const, label: 'Cost' },
                      { key: 'balance' as const, label: 'Balance' },
                    ].map((col, i) => (
                      <th
                        key={i}
                        onClick={col.key ? () => handleSort(col.key!) : undefined}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          textAlign: 'left' as const,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                          cursor: col.key ? 'pointer' : 'default',
                          userSelect: 'none' as const,
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {col.label}{col.key ? sortIndicator(col.key) : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600], whiteSpace: 'nowrap' as const }}>
                        {tx.date}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        <span style={txTypeBadge(tx.type)}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tx.type === 'usage' ? tokens.colors.errorScale[600] : tokens.colors.successScale[600],
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {tx.type === 'usage' ? '-' : '+'}{formatTokenCount(tx.amount)}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                        {tx.provider || '\u2014'}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                        {tx.team || '\u2014'}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[700], whiteSpace: 'nowrap' as const }}>
                        {formatCurrency(tx.cost)}
                      </td>
                      <td
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[800],
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {formatTokenCount(tx.runningBalance)}
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: tokens.spacing[6],
                          textAlign: 'center' as const,
                          color: tokens.colors.neutral[400],
                          fontSize: tokens.typography.fontSize.sm,
                        }}
                      >
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: tokens.spacing[4],
                  paddingTop: tokens.spacing[3],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  Page {page + 1} of {totalPages}
                </Text>
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <div
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{
                      ...hoverStyle,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      color: page > 0 ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      pointerEvents: page > 0 ? 'auto' as const : 'none' as const,
                    }}
                  >
                    Previous
                  </div>
                  <div
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    style={{
                      ...hoverStyle,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      color: page < totalPages - 1 ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      pointerEvents: page < totalPages - 1 ? 'auto' as const : 'none' as const,
                    }}
                  >
                    Next
                  </div>
                </div>
              </div>
            )}
          </Box>
        </div>

        {/* ========== TOP-UP BANNER ========== */}
        <div
          onClick={onTopUp}
          style={{
            ...hoverStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[600],
            color: tokens.colors.common.white,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.primaryScale[700] })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.primaryScale[600] })}
        >
          + Top Up Tokens
        </div>
      </Box>
    );
  },
});
