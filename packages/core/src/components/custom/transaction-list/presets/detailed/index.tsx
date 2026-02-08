'use client';

/**
 * TransactionList - Detailed Preset
 * Extended Stripe-style view with expandable rows showing transaction
 * timeline/metadata, volume charts, advanced filter panel with date range,
 * and bulk actions toolbar when items are selected.
 *
 * All visual values use design tokens for white-label support.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { TransactionListProps, Transaction, TransactionStatus, TransactionSummary } from '../../core';
import { TRANSACTION_LIST_DEFAULTS, getStatusConfig, defaultFormatAmount, generateDefaultSummaries } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  Download,
  Columns3,
  Plus,
  BarChart3,
  Home,
  Wallet,
  ArrowLeftRight,
  Users,
  ShoppingBag,
  CreditCard,
  Receipt,
  PieChart,
  MoreHorizontal,
  Check,
  X,
  Clock,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Calendar,
  Trash2,
  Copy,
  RefreshCw,
  TrendingUp,
  Archive,
} from 'lucide-react';

// ============================================================================
// Payment Method Icons (token-based)
// ============================================================================

function PaymentMethodIcon({ type, tokens }: { type: string; tokens: DesignTokens }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    visa: { bg: tokens.colors.primaryScale[900], color: tokens.colors.common.white },
    mastercard: { bg: tokens.colors.errorScale[600], color: tokens.colors.common.white },
    amex: { bg: tokens.colors.infoScale[600], color: tokens.colors.common.white },
    paypal: { bg: tokens.colors.primaryScale[800], color: tokens.colors.common.white },
    bank: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500] },
    crypto: { bg: tokens.colors.warningScale[500], color: tokens.colors.common.white },
  };

  const labelMap: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    paypal: 'PP',
    bank: 'BANK',
    crypto: 'BTC',
    other: '...',
  };

  const colorConfig = colorMap[type] || colorMap.bank;

  return (
    <span
      style={{
        width: 24,
        height: 16,
        borderRadius: tokens.borderRadius.sm,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.bold,
        letterSpacing: '0.5px',
        border: type === 'bank' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : `${tokens.surface.borderWidth} solid transparent`,
        backgroundColor: colorConfig.bg,
        color: colorConfig.color,
        flexShrink: 0,
      }}
    >
      {labelMap[type] || '...'}
    </span>
  );
}

// ============================================================================
// Status Badge (token-based)
// ============================================================================

function StatusBadge({ status, tokens }: { status: TransactionStatus; tokens: DesignTokens }) {
  const statusConfig = getStatusConfig(tokens);
  const config = statusConfig[status];

  const iconMap: Record<TransactionStatus, React.ReactNode> = {
    succeeded: <Check style={{ width: 12, height: 12 }} />,
    failed: <X style={{ width: 12, height: 12 }} />,
    incomplete: <Clock style={{ width: 12, height: 12 }} />,
    refunded: <RotateCcw style={{ width: 12, height: 12 }} />,
    disputed: <AlertTriangle style={{ width: 12, height: 12 }} />,
    uncaptured: <Clock style={{ width: 12, height: 12 }} />,
    pending: <Clock style={{ width: 12, height: 12 }} />,
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: `2px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        lineHeight: '18px',
        backgroundColor: config.bgColor,
        color: config.textColor,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      {iconMap[status]}
      {config.label}
    </span>
  );
}

// ============================================================================
// Volume Chart (SVG Bar Chart) - token-based
// ============================================================================

interface VolumeChartProps {
  transactions: Transaction[];
  formatAmount: (amount: number, currency: string) => string;
  tokens: DesignTokens;
}

function VolumeChart({ transactions, formatAmount: fmt, tokens }: VolumeChartProps) {
  const dailyData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number; succeeded: number; failed: number }> = {};

    for (const tx of transactions) {
      const dateKey = tx.date.split(',')[0] || tx.date.substring(0, 10);
      if (!grouped[dateKey]) {
        grouped[dateKey] = { total: 0, count: 0, succeeded: 0, failed: 0 };
      }
      grouped[dateKey].total += Math.abs(tx.amount);
      grouped[dateKey].count += 1;
      if (tx.status === 'succeeded') grouped[dateKey].succeeded += 1;
      if (tx.status === 'failed') grouped[dateKey].failed += 1;
    }

    const sortedKeys = Object.keys(grouped).sort();
    return sortedKeys.map((key) => ({
      date: key,
      ...grouped[key],
    }));
  }, [transactions]);

  if (dailyData.length === 0) return null;

  const maxTotal = Math.max(...dailyData.map((d) => d.total), 1);
  const chartWidth = 600;
  const chartHeight = 120;
  const barWidth = Math.max(20, Math.min(60, (chartWidth - 20) / dailyData.length - 4));
  const totalAmount = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const mainCurrency = transactions[0]?.currency || 'USD';

  return (
    <div
      style={{
        padding: `${tokens.spacing[5]}px ${tokens.spacing[7]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
        <div>
          <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
            Transaction Volume
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {fmt(totalAmount, mainCurrency)}
            </span>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[600], fontWeight: tokens.typography.fontWeight.medium, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp style={{ width: 14, height: 14 }} />
              +12.5%
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: tokens.spacing[4], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[600], display: 'inline-block' }} />
            Succeeded
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.errorScale[600], display: 'inline-block' }} />
            Failed
          </span>
        </div>
      </div>

      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYEnd meet">
        {dailyData.map((day, i) => {
          const barHeight = (day.total / maxTotal) * (chartHeight - 20);
          const x = (i / dailyData.length) * chartWidth + 2;
          const succeededRatio = day.count > 0 ? day.succeeded / day.count : 1;
          const succeededHeight = barHeight * succeededRatio;
          const failedHeight = barHeight - succeededHeight;

          return (
            <g key={day.date}>
              <rect
                x={x}
                y={chartHeight - barHeight}
                width={barWidth}
                height={succeededHeight}
                rx={3}
                fill={tokens.colors.primaryScale[600]}
                opacity={0.85}
              />
              {failedHeight > 0 && (
                <rect
                  x={x}
                  y={chartHeight - failedHeight}
                  width={barWidth}
                  height={failedHeight}
                  rx={3}
                  fill={tokens.colors.errorScale[600]}
                  opacity={0.85}
                />
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight}
                textAnchor="middle"
                style={{ fontSize: tokens.typography.fontSize.xs, fill: tokens.colors.neutral[400] }}
              >
                {day.date.length > 5 ? day.date.slice(-5) : day.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================================
// Sidebar Navigation
// ============================================================================

interface SidebarNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { key: 'home', label: 'Home', icon: <Home style={{ width: 16, height: 16 }} /> },
  { key: 'balances', label: 'Balances', icon: <Wallet style={{ width: 16, height: 16 }} /> },
  { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight style={{ width: 16, height: 16 }} />, active: true },
  { key: 'customers', label: 'Customers', icon: <Users style={{ width: 16, height: 16 }} /> },
  { key: 'catalog', label: 'Product catalogue', icon: <ShoppingBag style={{ width: 16, height: 16 }} /> },
];

const SIDEBAR_PRODUCTS: SidebarNavItem[] = [
  { key: 'payments', label: 'Payments', icon: <CreditCard style={{ width: 16, height: 16 }} /> },
  { key: 'billing', label: 'Billing', icon: <Receipt style={{ width: 16, height: 16 }} /> },
  { key: 'reporting', label: 'Reporting', icon: <PieChart style={{ width: 16, height: 16 }} /> },
  { key: 'more', label: 'More', icon: <MoreHorizontal style={{ width: 16, height: 16 }} /> },
];

// ============================================================================
// Expanded Row Content (token-based)
// ============================================================================

interface ExpandedRowProps {
  transaction: Transaction;
  formatAmount: (amount: number, currency: string) => string;
  tokens: DesignTokens;
}

function ExpandedRowContent({ transaction, formatAmount: fmt, tokens }: ExpandedRowProps) {
  const timelineEvents = useMemo(() => {
    const events: Array<{ label: string; time: string; status: 'success' | 'error' | 'info' | 'neutral' }> = [];

    events.push({
      label: 'Payment created',
      time: transaction.date,
      status: 'info',
    });

    if (transaction.status === 'succeeded') {
      events.push({
        label: 'Payment succeeded',
        time: transaction.date,
        status: 'success',
      });
    } else if (transaction.status === 'failed') {
      events.push({
        label: 'Payment failed',
        time: transaction.date,
        status: 'error',
      });
    } else if (transaction.status === 'refunded' && transaction.refundedDate) {
      events.push({
        label: 'Payment succeeded',
        time: transaction.date,
        status: 'success',
      });
      events.push({
        label: `Refunded ${fmt(transaction.amount, transaction.currency)}`,
        time: transaction.refundedDate,
        status: 'info',
      });
    } else if (transaction.status === 'disputed') {
      events.push({
        label: 'Payment succeeded',
        time: transaction.date,
        status: 'success',
      });
      events.push({
        label: `Dispute opened for ${transaction.disputeAmount ? fmt(transaction.disputeAmount, transaction.currency) : 'full amount'}`,
        time: transaction.date,
        status: 'error',
      });
    } else {
      events.push({
        label: `Status: ${transaction.status}`,
        time: transaction.date,
        status: 'neutral',
      });
    }

    return events;
  }, [transaction, fmt]);

  const dotColors: Record<string, string> = {
    success: tokens.colors.successScale[600],
    error: tokens.colors.errorScale[600],
    info: tokens.colors.primaryScale[600],
    neutral: tokens.colors.neutral[400],
  };

  return (
    <div
      style={{
        padding: `${tokens.spacing[5]}px ${tokens.spacing[7]}px ${tokens.spacing[5]}px ${tokens.spacing[11]}px`,
        backgroundColor: tokens.colors.neutral[50],
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[7],
      }}
    >
      {/* Timeline */}
      <div>
        <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: tokens.spacing[3] }}>
          Timeline
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {timelineEvents.map((event, idx) => (
            <div key={idx} style={{ display: 'flex', gap: tokens.spacing[3], position: 'relative', paddingBottom: idx < timelineEvents.length - 1 ? tokens.spacing[4] : 0 }}>
              {idx < timelineEvents.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 5,
                    top: 14,
                    bottom: 0,
                    width: 2,
                    backgroundColor: tokens.colors.neutral[200],
                  }}
                />
              )}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: dotColors[event.status],
                  flexShrink: 0,
                  marginTop: 2,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[50]}`,
                  boxShadow: `0 0 0 2px ${dotColors[event.status]}33`,
                }}
              />
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                  {event.label}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: 2 }}>
                  {event.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata / Details */}
      <div>
        <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: tokens.spacing[3] }}>
          Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.sm }}>
          <span style={{ color: tokens.colors.neutral[400] }}>ID</span>
          <span style={{ color: tokens.colors.neutral[900], fontFamily: 'monospace', fontSize: tokens.typography.fontSize.sm }}>{transaction.id}</span>

          <span style={{ color: tokens.colors.neutral[400] }}>Amount</span>
          <span style={{ color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.semibold }}>{fmt(transaction.amount, transaction.currency)}</span>

          <span style={{ color: tokens.colors.neutral[400] }}>Currency</span>
          <span style={{ color: tokens.colors.neutral[900], textTransform: 'uppercase' }}>{transaction.currency}</span>

          {transaction.customer && (
            <React.Fragment>
              <span style={{ color: tokens.colors.neutral[400] }}>Customer</span>
              <span style={{ color: tokens.colors.primaryScale[600], cursor: 'pointer' }}>{transaction.customer}</span>
            </React.Fragment>
          )}

          {transaction.paymentMethod && (
            <React.Fragment>
              <span style={{ color: tokens.colors.neutral[400] }}>Payment method</span>
              <span style={{ color: tokens.colors.neutral[900] }}>
                {transaction.paymentMethod.type}{transaction.paymentMethod.last4 ? ` ending in ${transaction.paymentMethod.last4}` : ''}
              </span>
            </React.Fragment>
          )}

          {transaction.refundedDate && (
            <React.Fragment>
              <span style={{ color: tokens.colors.neutral[400] }}>Refunded</span>
              <span style={{ color: tokens.colors.neutral[900] }}>{transaction.refundedDate}</span>
            </React.Fragment>
          )}

          {transaction.disputeAmount != null && (
            <React.Fragment>
              <span style={{ color: tokens.colors.neutral[400] }}>Dispute amount</span>
              <span style={{ color: tokens.colors.errorScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>{fmt(transaction.disputeAmount, transaction.currency)}</span>
            </React.Fragment>
          )}

          {transaction.metadata && Object.entries(transaction.metadata).map(([key, value]) => (
            <React.Fragment key={key}>
              <span style={{ color: tokens.colors.neutral[400] }}>{key}</span>
              <span style={{ color: tokens.colors.neutral[900] }}>{value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export const DetailedTransactionList = createPreset<TransactionListProps>({
  name: 'TransactionList.Detailed',
  render: ({ primitives, props, tokens, engine }: PresetContext<TransactionListProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      transactions,
      summaries: propSummaries,
      activeSummary: controlledActiveSummary,
      onSummaryChange,
      filters,
      onFilterClick,
      searchPlaceholder = TRANSACTION_LIST_DEFAULTS.searchPlaceholder,
      onSearch,
      title = TRANSACTION_LIST_DEFAULTS.title,
      subtitle,
      headerActions,
      onExport,
      onEditColumns,
      onTransactionClick,
      selectable = false,
      selectedIds: controlledSelectedIds,
      onSelectionChange,
      totalResults,
      loading = false,
      emptyText = TRANSACTION_LIST_DEFAULTS.emptyText,
      formatAmount = defaultFormatAmount,
      onTransactionAction,
      rowActions: customRowActions,
      className,
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================
    const [internalActiveSummary, setInternalActiveSummary] = useState<string>('all');
    const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [dateRangeStart, setDateRangeStart] = useState('');
    const [dateRangeEnd, setDateRangeEnd] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const activeSummaryKey = controlledActiveSummary ?? internalActiveSummary;
    const selectedIds = controlledSelectedIds ?? internalSelectedIds;

    // ========================================================================
    // Computed Data
    // ========================================================================
    const summaries = propSummaries ?? generateDefaultSummaries(transactions);

    const filteredTransactions = useMemo(() => {
      let result = transactions;

      if (activeSummaryKey && activeSummaryKey !== 'all') {
        result = result.filter((t) => t.status === activeSummaryKey);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter((t) =>
          t.description?.toLowerCase().includes(query) ||
          t.customer?.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
        );
      }

      return result;
    }, [transactions, activeSummaryKey, searchQuery]);

    const displayedResultCount = totalResults ?? filteredTransactions.length;

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleSummaryChange = useCallback((key: string) => {
      if (!controlledActiveSummary) {
        setInternalActiveSummary(key);
      }
      onSummaryChange?.(key);
    }, [controlledActiveSummary, onSummaryChange]);

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    }, [onSearch]);

    const handleSelectionToggle = useCallback((id: string) => {
      const newIds = selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id];
      if (!controlledSelectedIds) {
        setInternalSelectedIds(newIds);
      }
      onSelectionChange?.(newIds);
    }, [selectedIds, controlledSelectedIds, onSelectionChange]);

    const handleSelectAll = useCallback(() => {
      const allIds = filteredTransactions.map((t) => t.id);
      const newIds = selectedIds.length === allIds.length ? [] : allIds;
      if (!controlledSelectedIds) {
        setInternalSelectedIds(newIds);
      }
      onSelectionChange?.(newIds);
    }, [filteredTransactions, selectedIds, controlledSelectedIds, onSelectionChange]);

    const toggleExpand = useCallback((id: string) => {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }, []);

    const handleClearSelection = useCallback(() => {
      if (!controlledSelectedIds) {
        setInternalSelectedIds([]);
      }
      onSelectionChange?.([]);
    }, [controlledSelectedIds, onSelectionChange]);

    // ========================================================================
    // Default Filters
    // ========================================================================
    const defaultFilters = filters ?? [
      { key: 'date', label: 'Date and time' },
      { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' },
      { key: 'status', label: 'Status' },
      { key: 'method', label: 'Payment method' },
      { key: 'more', label: 'More filters' },
    ];

    // ========================================================================
    // Render: Sidebar
    // ========================================================================
    const renderSidebar = () => (
      <Box
        style={{
          width: 220,
          backgroundColor: tokens.colors.neutral[50],
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `${tokens.spacing[4]}px 0`,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Box style={{ padding: `0 ${tokens.spacing[2]}px`, marginBottom: tokens.spacing[6] }}>
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <Box
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: item.active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                color: item.active
                  ? tokens.colors.neutral[900]
                  : tokens.colors.neutral[500],
                backgroundColor: item.active
                  ? tokens.colors.neutral[100]
                  : 'transparent',
              }}
            >
              <Box style={{ color: item.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400], display: 'flex' }}>
                {item.icon}
              </Box>
              {item.label}
            </Box>
          ))}
        </Box>

        <Box style={{ padding: `0 ${tokens.spacing[2]}px` }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: `0 ${tokens.spacing[3]}px`,
              marginBottom: tokens.spacing[2],
            }}
          >
            Products
          </Text>
          {SIDEBAR_PRODUCTS.map((item) => (
            <Box
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.normal,
                color: tokens.colors.neutral[500],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Box style={{ color: tokens.colors.neutral[400], display: 'flex' }}>
                {item.icon}
              </Box>
              {item.label}
            </Box>
          ))}
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Flex
        align="center"
        justify="between"
        style={{ padding: `${tokens.spacing[6]}px ${tokens.spacing[7]}px ${tokens.spacing[4]}px` }}
      >
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Box style={{ marginTop: tokens.spacing[1] }}>
              {typeof subtitle === 'string' ? (
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )}
            </Box>
          )}
        </Box>

        <Flex align="center" gap={tokens.spacing[2]}>
          {headerActions}
          <Box
            onClick={onExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[900],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <BarChart3 style={{ width: 14, height: 14 }} />
            Analyse
          </Box>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              border: 'none',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Create payment
          </Box>
        </Flex>
      </Flex>
    );

    // ========================================================================
    // Render: Bulk Actions Toolbar
    // ========================================================================
    const renderBulkActions = () => {
      if (selectedIds.length === 0) return null;

      const bulkButtons = [
        { icon: <Download style={{ width: 12, height: 12 }} />, label: 'Export', onClick: onExport },
        { icon: <Copy style={{ width: 12, height: 12 }} />, label: 'Duplicate', onClick: undefined },
        { icon: <RefreshCw style={{ width: 12, height: 12 }} />, label: 'Refund', onClick: undefined },
        { icon: <Archive style={{ width: 12, height: 12 }} />, label: 'Archive', onClick: undefined },
      ];

      return (
        <Flex
          align="center"
          style={{
            padding: `${tokens.spacing[2]}px ${tokens.spacing[7]}px`,
            backgroundColor: tokens.colors.primaryScale[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
            gap: tokens.spacing[3],
          }}
        >
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>
            {selectedIds.length} {selectedIds.length === 1 ? 'transaction' : 'transactions'} selected
          </Text>

          <Box style={{ width: 1, height: 20, backgroundColor: tokens.colors.primaryScale[200] }} />

          <Flex align="center" gap={tokens.spacing[1]}>
            {bulkButtons.map((action) => (
              <Box
                key={action.label}
                onClick={action.onClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  color: tokens.colors.primaryScale[700],
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                }}
              >
                {action.icon}
                {action.label}
              </Box>
            ))}
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.errorScale[700],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
              }}
            >
              <Trash2 style={{ width: 12, height: 12 }} />
              Delete
            </Box>
          </Flex>

          <Box style={{ marginLeft: 'auto' }}>
            <Box
              onClick={handleClearSelection}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <X style={{ width: 12, height: 12 }} />
              Clear selection
            </Box>
          </Box>
        </Flex>
      );
    };

    // ========================================================================
    // Render: Summary Tabs
    // ========================================================================
    const renderSummaryTabs = () => (
      <Box
        style={{
          display: 'flex',
          gap: 0,
          padding: `0 ${tokens.spacing[7]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {summaries.map((summary) => {
          const isActive = activeSummaryKey === summary.key;
          return (
            <Box
              key={summary.key}
              onClick={() => handleSummaryChange(summary.key)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: isActive
                  ? tokens.colors.primaryScale[600]
                  : tokens.colors.neutral[500],
                borderBottom: isActive
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`
                  : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                marginBottom: -1,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}
            >
              {summary.label}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: isActive
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                  backgroundColor: isActive
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.neutral[100],
                  padding: `1px ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.full,
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {summary.count}
              </Text>
            </Box>
          );
        })}
      </Box>
    );

    // ========================================================================
    // Render: Filter Chips + Advanced Filters
    // ========================================================================
    const renderFilterChips = () => (
      <Box>
        <Flex
          align="center"
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[7]}px`,
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
          }}
        >
          {defaultFilters.map((filter) => (
            <Box
              key={filter.key}
              onClick={() => onFilterClick?.(filter.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: filter.active
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                color: filter.active
                  ? tokens.colors.primaryScale[600]
                  : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                whiteSpace: 'nowrap',
              }}
            >
              {filter.icon}
              {filter.label}
              <ChevronDown style={{ width: 12, height: 12, opacity: 0.5 }} />
            </Box>
          ))}

          {/* Advanced filters toggle */}
          <Box
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: showAdvancedFilters
                ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`
                : `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[200]}`,
              backgroundColor: showAdvancedFilters
                ? tokens.colors.primaryScale[50]
                : 'transparent',
              color: showAdvancedFilters
                ? tokens.colors.primaryScale[600]
                : tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <Calendar style={{ width: 12, height: 12 }} />
            Date range
          </Box>

          {/* Search */}
          <Box
            style={{
              marginLeft: 'auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              style={{
                position: 'absolute',
                left: tokens.spacing[2],
                width: 14,
                height: 14,
                color: tokens.colors.neutral[400],
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: 200,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px ${tokens.spacing[1]}px ${tokens.spacing[7]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                outline: 'none',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>
        </Flex>

        {/* Advanced date range filter panel */}
        {showAdvancedFilters && (
          <Flex
            align="center"
            style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[7]}px`,
              gap: tokens.spacing[3],
              backgroundColor: tokens.colors.neutral[50],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
              Date range:
            </Text>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                outline: 'none',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>to</Text>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                outline: 'none',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                border: 'none',
              }}
            >
              Apply
            </Box>
            <Box
              onClick={() => {
                setDateRangeStart('');
                setDateRangeEnd('');
                setShowAdvancedFilters(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
              }}
            >
              Clear
            </Box>
          </Flex>
        )}
      </Box>
    );

    // ========================================================================
    // Render: Table Header
    // ========================================================================
    const renderTableHeader = () => {
      const columns = [
        { key: 'expand', label: '', width: '40px' },
        { key: 'amount', label: 'Amount', width: '120px' },
        { key: 'status', label: 'Status', width: '130px' },
        { key: 'method', label: 'Payment method', width: '160px' },
        { key: 'description', label: 'Description', width: '1fr' },
        { key: 'customer', label: 'Customer', width: '130px' },
        { key: 'date', label: 'Date', width: '130px' },
        { key: 'refunded', label: 'Refunded', width: '100px' },
        { key: 'dispute', label: 'Dispute', width: '100px' },
        { key: 'actions', label: '', width: '48px' },
      ];

      const baseCols = columns.map((c) => c.width).join(' ');
      const gridCols = selectable ? `40px ${baseCols}` : baseCols;

      return (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            padding: `0 ${tokens.spacing[7]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {selectable && (
            <Box
              style={{
                padding: `${tokens.spacing[2]}px 0`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={handleSelectAll}
                style={{ width: 14, height: 14, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
              />
            </Box>
          )}
          {columns.map((col) => (
            <Box
              key={col.key}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[400],
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {col.label}
            </Box>
          ))}
        </Box>
      );
    };

    // ========================================================================
    // Render: Table Row
    // ========================================================================
    const renderTableRow = (transaction: Transaction) => {
      const isSelected = selectedIds.includes(transaction.id);
      const isHovered = hoveredRow === transaction.id;
      const isExpanded = expandedRows.has(transaction.id);

      const columns = [
        { key: 'expand', width: '40px' },
        { key: 'amount', width: '120px' },
        { key: 'status', width: '130px' },
        { key: 'method', width: '160px' },
        { key: 'description', width: '1fr' },
        { key: 'customer', width: '130px' },
        { key: 'date', width: '130px' },
        { key: 'refunded', width: '100px' },
        { key: 'dispute', width: '100px' },
        { key: 'actions', width: '48px' },
      ];

      const baseCols = columns.map((c) => c.width).join(' ');
      const gridCols = selectable ? `40px ${baseCols}` : baseCols;

      return (
        <Box key={transaction.id}>
          <Box
            onClick={() => onTransactionClick?.(transaction)}
            onMouseEnter={() => setHoveredRow(transaction.id)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              padding: `0 ${tokens.spacing[7]}px`,
              borderBottom: isExpanded ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: isSelected
                ? tokens.colors.primaryScale[50]
                : isHovered
                  ? tokens.colors.neutral[50]
                  : tokens.colors.common.white,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            {/* Checkbox */}
            {selectable && (
              <Box
                style={{
                  padding: `${tokens.spacing[3]}px 0`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleSelectionToggle(transaction.id);
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectionToggle(transaction.id)}
                  style={{ width: 14, height: 14, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
                />
              </Box>
            )}

            {/* Expand toggle */}
            <Box
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[1]}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleExpand(transaction.id);
              }}
            >
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: tokens.borderRadius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: isExpanded
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[200],
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <ChevronRight
                  style={{
                    width: 14,
                    height: 14,
                    color: isExpanded ? tokens.colors.common.white : tokens.colors.neutral[400],
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                />
              </Box>
            </Box>

            {/* Amount */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatAmount(transaction.amount, transaction.currency)}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.normal,
                    color: tokens.colors.neutral[400],
                    marginLeft: tokens.spacing[1],
                    textTransform: 'uppercase',
                  }}
                >
                  {transaction.currency}
                </Text>
              </Text>
            </Box>

            {/* Status */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <StatusBadge status={transaction.status} tokens={tokens} />
            </Box>

            {/* Payment Method */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {transaction.paymentMethod ? (
                <>
                  {transaction.paymentMethod.icon || <PaymentMethodIcon type={transaction.paymentMethod.type} tokens={tokens} />}
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    {transaction.paymentMethod.last4
                      ? `\u2022\u2022\u2022\u2022 ${transaction.paymentMethod.last4}`
                      : transaction.paymentMethod.type}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>--</Text>
              )}
            </Box>

            {/* Description */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {transaction.description || '--'}
              </Text>
            </Box>

            {/* Customer */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: transaction.customer
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: transaction.customer ? 'pointer' : 'default',
                }}
              >
                {transaction.customer || '--'}
              </Text>
            </Box>

            {/* Date */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {transaction.date}
              </Text>
            </Box>

            {/* Refunded Date */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: transaction.refundedDate ? tokens.colors.infoScale[600] : tokens.colors.neutral[400] }}>
                {transaction.refundedDate || '--'}
              </Text>
            </Box>

            {/* Dispute Amount */}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, display: 'flex', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: transaction.disputeAmount ? tokens.colors.errorScale[600] : tokens.colors.neutral[400], fontWeight: transaction.disputeAmount ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal }}>
                {transaction.disputeAmount != null ? formatAmount(transaction.disputeAmount, transaction.currency) : '--'}
              </Text>
            </Box>

            {/* Actions */}
            <Box
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[1]}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setActionMenuId(actionMenuId === transaction.id ? null : transaction.id);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: tokens.borderRadius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: tokens.colors.neutral[400],
                  opacity: isHovered || actionMenuId === transaction.id ? 1 : 0,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <MoreHorizontal style={{ width: 14, height: 14 }} />
              </Box>

              {actionMenuId === transaction.id && onTransactionAction && (
                <>
                  <Box
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setActionMenuId(null); }}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 100,
                      backgroundColor: tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.md,
                      boxShadow: tokens.shadows.lg,
                      padding: `${tokens.spacing[1]}px 0`,
                      minWidth: 160,
                    }}
                  >
                    {(customRowActions ?? [
                      { key: 'refund' as const, label: 'Refund', hidden: (t: Transaction) => t.status !== 'succeeded' },
                      { key: 'capture' as const, label: 'Capture', hidden: (t: Transaction) => t.status !== 'uncaptured' },
                      { key: 'dispute' as const, label: 'Dispute', hidden: (t: Transaction) => t.status !== 'succeeded' },
                      { key: 'cancel' as const, label: 'Cancel', danger: true, hidden: (t: Transaction) => t.status !== 'pending' && t.status !== 'uncaptured' },
                      { key: 'copy' as const, label: 'Copy ID' },
                      { key: 'archive' as const, label: 'Archive' },
                    ]).filter(a => !a.hidden?.(transaction)).map((action) => (
                      <Box
                        key={action.key}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onTransactionAction(action.key, transaction);
                          setActionMenuId(null);
                        }}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          fontSize: tokens.typography.fontSize.sm,
                          color: action.danger ? tokens.colors.errorScale[600] : tokens.colors.neutral[700],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                      >
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Expanded Row Content */}
          {isExpanded && (
            <ExpandedRowContent transaction={transaction} formatAmount={formatAmount} tokens={tokens} />
          )}
        </Box>
      );
    };

    // ========================================================================
    // Render: Footer
    // ========================================================================
    const renderFooter = () => (
      <Flex
        align="center"
        justify="between"
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[7]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
          {displayedResultCount} {displayedResultCount === 1 ? 'result' : 'results'}
        </Text>

        <Flex align="center" gap={tokens.spacing[2]}>
          {onExport && (
            <Box
              onClick={onExport}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Download style={{ width: 13, height: 13 }} />
              Export
            </Box>
          )}
          {onEditColumns && (
            <Box
              onClick={onEditColumns}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Columns3 style={{ width: 13, height: 13 }} />
              Edit columns
            </Box>
          )}
        </Flex>
      </Flex>
    );

    // ========================================================================
    // Render: Empty State
    // ========================================================================
    const renderEmptyState = () => (
      <Flex
        align="center"
        justify="center"
        style={{
          padding: `${tokens.spacing[10]}px ${tokens.spacing[7]}px`,
          flexDirection: 'column',
          gap: tokens.spacing[3],
        }}
      >
        <ArrowLeftRight style={{ width: 40, height: 40, color: tokens.colors.neutral[400], opacity: 0.5 }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          {emptyText}
        </Text>
      </Flex>
    );

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          height: '100%',
          minHeight: 600,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
          backgroundColor: tokens.colors.common.white,
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {renderHeader()}

          {/* Volume Chart */}
          <VolumeChart transactions={transactions} formatAmount={formatAmount} tokens={tokens} />

          {renderBulkActions()}
          {renderSummaryTabs()}
          {renderFilterChips()}

          {/* Table */}
          <Box style={{ flex: 1, overflow: 'auto' }}>
            {renderTableHeader()}

            {loading ? (
              <Flex
                align="center"
                justify="center"
                style={{ padding: `${tokens.spacing[10]}px ${tokens.spacing[7]}px` }}
              >
                <Spinner size="md" />
              </Flex>
            ) : filteredTransactions.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredTransactions.map((transaction) => renderTableRow(transaction))
            )}
          </Box>

          {renderFooter()}
        </Box>
      </Box>
    );
  },
});

export default DetailedTransactionList;
