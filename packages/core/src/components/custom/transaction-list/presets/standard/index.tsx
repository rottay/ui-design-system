'use client';

/**
 * TransactionList - Standard Preset
 * Stripe-style transaction view with sidebar navigation, summary tabs,
 * filter chips, and a data table with status badges.
 *
 * All visual values use design tokens for white-label support.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
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
  Lightbulb,
} from 'lucide-react';

// ============================================================================
// Payment Method Icons (token-based)
// ============================================================================

function PaymentMethodIcon({ type, tokens }: { type: string; tokens: DesignTokens }) {
  const iconStyle: React.CSSProperties = {
    width: 24,
    height: 16,
    borderRadius: tokens.borderRadius.sm,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: '0.5px',
    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    backgroundColor: tokens.colors.common.white,
    color: tokens.colors.neutral[500],
    flexShrink: 0,
  };

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
        ...iconStyle,
        backgroundColor: colorConfig.bg,
        color: colorConfig.color,
        borderColor: type === 'bank' ? tokens.colors.neutral[200] : 'transparent',
      }}
    >
      {labelMap[type] || '...'}
    </span>
  );
}

// ============================================================================
// Status Badge Component (token-based)
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
// Sidebar Navigation
// ============================================================================

interface SidebarNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  section?: string;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { key: 'home', label: 'Home', icon: <Home style={{ width: 16, height: 16 }} /> },
  { key: 'balances', label: 'Balances', icon: <Wallet style={{ width: 16, height: 16 }} /> },
  { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight style={{ width: 16, height: 16 }} />, active: true },
  { key: 'customers', label: 'Customers', icon: <Users style={{ width: 16, height: 16 }} /> },
  { key: 'catalog', label: 'Product catalogue', icon: <ShoppingBag style={{ width: 16, height: 16 }} /> },
];

const SIDEBAR_PRODUCTS: SidebarNavItem[] = [
  { key: 'payments', label: 'Payments', icon: <CreditCard style={{ width: 16, height: 16 }} />, section: 'Products' },
  { key: 'billing', label: 'Billing', icon: <Receipt style={{ width: 16, height: 16 }} />, section: 'Products' },
  { key: 'reporting', label: 'Reporting', icon: <PieChart style={{ width: 16, height: 16 }} />, section: 'Products' },
  { key: 'more', label: 'More', icon: <MoreHorizontal style={{ width: 16, height: 16 }} />, section: 'Products' },
];

// ============================================================================
// Component
// ============================================================================

export const StandardTransactionList = createPreset<TransactionListProps>({
  name: 'TransactionList.Standard',
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

    const activeSummaryKey = controlledActiveSummary ?? internalActiveSummary;
    const selectedIds = controlledSelectedIds ?? internalSelectedIds;

    // ========================================================================
    // Computed Data
    // ========================================================================
    const summaries = propSummaries ?? generateDefaultSummaries(transactions);

    const filteredTransactions = useMemo(() => {
      let result = transactions;

      // Filter by active summary tab
      if (activeSummaryKey && activeSummaryKey !== 'all') {
        result = result.filter((t) => t.status === activeSummaryKey);
      }

      // Filter by search query
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
        {/* Main Nav */}
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
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Box style={{ color: item.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400], display: 'flex' }}>
                {item.icon}
              </Box>
              {item.label}
            </Box>
          ))}
        </Box>

        {/* Products Section */}
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
        style={{
          padding: `${tokens.spacing[6]}px ${tokens.spacing[7]}px ${tokens.spacing[4]}px`,
        }}
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
    // Render: Info Banner
    // ========================================================================
    const renderInfoBanner = () => (
      <Box
        style={{
          margin: `0 ${tokens.spacing[7]}px ${tokens.spacing[4]}px`,
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderRadius: tokens.borderRadius.lg,
          backgroundColor: tokens.colors.infoScale[50],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.infoScale[700],
        }}
      >
        <Lightbulb style={{ width: 16, height: 16, flexShrink: 0 }} />
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.infoScale[700] }}>
          Use the filters and search to quickly find specific transactions. Export data for reporting.
        </Text>
      </Box>
    );

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
                  ? `2px solid ${tokens.colors.primaryScale[600]}`
                  : '2px solid transparent',
                marginBottom: -1,
                transition: `all ${tokens.motion.hover}`,
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
    // Render: Filter Chips
    // ========================================================================
    const renderFilterChips = () => (
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
          />
        </Box>
      </Flex>
    );

    // ========================================================================
    // Render: Table Header
    // ========================================================================
    const renderTableHeader = () => {
      const columns = [
        { key: 'amount', label: 'Amount', width: '120px' },
        { key: 'status', label: 'Status', width: '130px' },
        { key: 'method', label: 'Payment method', width: '160px' },
        { key: 'description', label: 'Description', width: '1fr' },
        { key: 'customer', label: 'Customer', width: '140px' },
        { key: 'date', label: 'Date', width: '140px' },
        { key: 'actions', label: '', width: '48px' },
      ];

      const gridCols = selectable ? `40px ${columns.map((c) => c.width).join(' ')}` : columns.map((c) => c.width).join(' ');

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
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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

      const columns = [
        { key: 'amount', width: '120px' },
        { key: 'status', width: '130px' },
        { key: 'method', width: '160px' },
        { key: 'description', width: '1fr' },
        { key: 'customer', width: '140px' },
        { key: 'date', width: '140px' },
        { key: 'actions', width: '48px' },
      ];

      const gridCols = selectable ? `40px ${columns.map((c) => c.width).join(' ')}` : columns.map((c) => c.width).join(' ');

      return (
        <Box
          key={transaction.id}
          onClick={() => onTransactionClick?.(transaction)}
          onMouseEnter={() => setHoveredRow(transaction.id)}
          onMouseLeave={() => setHoveredRow(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            padding: `0 ${tokens.spacing[7]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            cursor: onTransactionClick ? 'pointer' : 'default',
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

          {/* Amount */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
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
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
            <StatusBadge status={transaction.status} tokens={tokens} />
          </Box>

          {/* Payment Method */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
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
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
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
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
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
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {transaction.date}
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

            {/* Action dropdown menu */}
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
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
          }}
        >
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
          {renderInfoBanner()}
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

export default StandardTransactionList;
