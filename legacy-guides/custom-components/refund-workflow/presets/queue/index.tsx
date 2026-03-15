'use client';

/**
 * RefundWorkflow - Queue Preset
 * Refund request queue with filter pills, summary stats,
 * sortable list, status badges, and quick actions.
 *
 * All visual values use design tokens for white-label support.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createBadgeStyle,
  createFilterPillStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { RefundWorkflowProps, RefundRequest, RefundStatus } from '../../core';
import { REFUND_WORKFLOW_DEFAULTS, getRefundStatusColors, getReasonLabel, formatCurrency } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Check,
  X,
  Clock,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Loader2,
} from 'lucide-react';

// ============================================================================
// Status Badge Component (token-based)
// ============================================================================

function RefundStatusBadge({ status, tokens }: { status: RefundStatus; tokens: DesignTokens }) {
  const statusColors = getRefundStatusColors(tokens);
  const config = statusColors[status];

  const labelMap: Record<RefundStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    failed: 'Failed',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: `2px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: config.dot,
          flexShrink: 0,
        }}
      />
      {labelMap[status]}
    </span>
  );
}

// ============================================================================
// Reason Badge Component (token-based)
// ============================================================================

function ReasonBadge({ reason, tokens }: { reason: RefundRequest['reason']; tokens: DesignTokens }) {
  const colorMap: Record<string, 'warning' | 'error' | 'info' | 'secondary'> = {
    'duplicate': 'warning',
    'fraudulent': 'error',
    'customer-request': 'info',
    'product-issue': 'secondary',
    'service-issue': 'secondary',
    'other': 'secondary',
  };

  const badgeColor = colorMap[reason] || 'secondary';

  return (
    <span style={createBadgeStyle(tokens, badgeColor)}>
      {getReasonLabel(reason)}
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

export const QueueRefundWorkflow = createPreset<RefundWorkflowProps>({
  name: 'RefundWorkflow.Queue',
  render: ({ primitives, props, tokens, engine }: PresetContext<RefundWorkflowProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      refunds,
      onApprove,
      onReject,
      onProcess,
      onViewTransaction,
      title = REFUND_WORKFLOW_DEFAULTS.title,
      subtitle,
      loading = false,
      className,
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================
    const [activeFilter, setActiveFilter] = useState<RefundStatus | 'all'>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // ========================================================================
    // Computed Data
    // ========================================================================
    const filteredRefunds = useMemo(() => {
      let result = [...refunds];

      if (activeFilter !== 'all') {
        result = result.filter((r) => r.status === activeFilter);
      }

      // Sort by requestedAt desc
      result.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

      return result;
    }, [refunds, activeFilter]);

    const pendingCount = useMemo(() => refunds.filter((r) => r.status === 'pending').length, [refunds]);

    const pendingTotalAmount = useMemo(() => {
      const pending = refunds.filter((r) => r.status === 'pending');
      if (pending.length === 0) return '$0.00';
      const total = pending.reduce((sum, r) => sum + r.amount, 0);
      const currency = pending[0].currency;
      return formatCurrency(total, currency);
    }, [refunds]);

    const approvedTodayCount = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return refunds.filter((r) =>
        r.status === 'approved' && r.processedAt && r.processedAt.getTime() >= today.getTime()
      ).length;
    }, [refunds]);

    const rejectionRate = useMemo(() => {
      const processed = refunds.filter((r) => r.status === 'completed' || r.status === 'rejected');
      if (processed.length === 0) return '0%';
      const rejected = processed.filter((r) => r.status === 'rejected').length;
      return `${Math.round((rejected / processed.length) * 100)}%`;
    }, [refunds]);

    const filterCounts = useMemo(() => {
      const counts: Record<string, number> = { all: refunds.length };
      const statuses: RefundStatus[] = ['pending', 'approved', 'processing', 'completed', 'rejected'];
      for (const status of statuses) {
        counts[status] = refunds.filter((r) => r.status === status).length;
      }
      return counts;
    }, [refunds]);

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Box style={createPanelHeaderStyle(tokens)}>
        <Flex align="center" justify="between">
          <Flex align="center" gap={tokens.spacing[2]}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[400],
                backgroundColor: tokens.colors.neutral[100],
                padding: `1px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
              }}
            >
              {refunds.length}
            </Text>
            {pendingCount > 0 && (
              <span style={createBadgeStyle(tokens, 'warning')}>
                {pendingCount} pending
              </span>
            )}
          </Flex>
          {subtitle && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {subtitle}
            </Text>
          )}
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Summary Stats
    // ========================================================================
    const renderSummaryStats = () => (
      <Flex
        align="center"
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          gap: tokens.spacing[4],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <Flex align="center" gap={tokens.spacing[2]}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.warningScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign style={{ width: 14, height: 14, color: tokens.colors.warningScale[600] }} />
          </Box>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              Pending Amount
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {pendingTotalAmount}
            </Text>
          </Box>
        </Flex>

        <Box style={{ width: 1, height: 28, backgroundColor: tokens.colors.neutral[100] }} />

        <Flex align="center" gap={tokens.spacing[2]}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.successScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check style={{ width: 14, height: 14, color: tokens.colors.successScale[600] }} />
          </Box>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              Approved Today
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {approvedTodayCount}
            </Text>
          </Box>
        </Flex>

        <Box style={{ width: 1, height: 28, backgroundColor: tokens.colors.neutral[100] }} />

        <Flex align="center" gap={tokens.spacing[2]}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.errorScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown style={{ width: 14, height: 14, color: tokens.colors.errorScale[600] }} />
          </Box>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              Rejection Rate
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {rejectionRate}
            </Text>
          </Box>
        </Flex>
      </Flex>
    );

    // ========================================================================
    // Render: Filter Pills
    // ========================================================================
    const renderFilterPills = () => {
      const filters: Array<{ key: RefundStatus | 'all'; label: string }> = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'processing', label: 'Processing' },
        { key: 'completed', label: 'Completed' },
        { key: 'rejected', label: 'Rejected' },
      ];

      return (
        <Flex
          align="center"
          style={{
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            gap: tokens.spacing[1],
            flexWrap: 'wrap',
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          {filters.map((filter) => (
            <Box
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              style={{
                ...createFilterPillStyle(tokens, { active: activeFilter === filter.key }),
                gap: tokens.spacing[1],
              }}
            >
              {filter.label}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: activeFilter === filter.key
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                  backgroundColor: activeFilter === filter.key
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[200],
                  padding: `0px ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.full,
                  minWidth: 16,
                  textAlign: 'center',
                  lineHeight: '16px',
                }}
              >
                {filterCounts[filter.key] ?? 0}
              </Text>
            </Box>
          ))}
        </Flex>
      );
    };

    // ========================================================================
    // Render: Refund Row
    // ========================================================================
    const renderRefundRow = (refund: RefundRequest) => {
      const isHovered = hoveredRow === refund.id;

      return (
        <Box
          key={refund.id}
          onMouseEnter={() => setHoveredRow(refund.id)}
          onMouseLeave={() => setHoveredRow(null)}
          style={{
            ...createListItemStyle(tokens, { active: false, interactive: true }),
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            backgroundColor: isHovered
              ? tokens.colors.neutral[50]
              : tokens.colors.common.white,
          }}
        >
          {/* Customer Info */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap={tokens.spacing[2]}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {refund.customerName}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {refund.customerEmail}
              </Text>
            </Flex>
            <Flex align="center" gap={tokens.spacing[2]} style={{ marginTop: tokens.spacing[1] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  fontFamily: 'monospace',
                }}
              >
                {refund.transactionId}
              </Text>
            </Flex>
          </Box>

          {/* Amount */}
          <Box style={{ textAlign: 'right', flexShrink: 0 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(refund.amount, refund.currency)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              of {formatCurrency(refund.originalAmount, refund.currency)}
            </Text>
          </Box>

          {/* Reason */}
          <Box style={{ flexShrink: 0 }}>
            <ReasonBadge reason={refund.reason} tokens={tokens} />
          </Box>

          {/* Status */}
          <Box style={{ flexShrink: 0 }}>
            <RefundStatusBadge status={refund.status} tokens={tokens} />
          </Box>

          {/* Time */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {formatDistanceToNow(refund.requestedAt, { addSuffix: true })}
          </Text>

          {/* Quick Actions */}
          <Flex
            align="center"
            gap={tokens.spacing[1]}
            style={{
              flexShrink: 0,
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}
          >
            {refund.status === 'pending' && onApprove && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onApprove(refund.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[50],
                  color: tokens.colors.successScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Check style={{ width: 12, height: 12 }} />
                Approve
              </Box>
            )}
            {refund.status === 'pending' && onReject && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onReject(refund.id, '');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.errorScale[50],
                  color: tokens.colors.errorScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <X style={{ width: 12, height: 12 }} />
                Reject
              </Box>
            )}
            {refund.status === 'approved' && onProcess && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onProcess(refund.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[50],
                  color: tokens.colors.primaryScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Loader2 style={{ width: 12, height: 12 }} />
                Process
              </Box>
            )}
            {onViewTransaction && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onViewTransaction(refund.transactionId);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <ExternalLink style={{ width: 12, height: 12 }} />
                View Txn
              </Box>
            )}
          </Flex>
        </Box>
      );
    };

    // ========================================================================
    // Render: Empty State
    // ========================================================================
    const renderEmptyState = () => (
      <Flex
        align="center"
        justify="center"
        style={{
          padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
          flexDirection: 'column',
          gap: tokens.spacing[3],
        }}
      >
        <RotateCcw style={{ width: 40, height: 40, color: tokens.colors.neutral[300], opacity: 0.5 }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          No refund requests
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
          ...createCardStyle(tokens, { elevation: 'sm' }),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...style,
        }}
      >
        {renderHeader()}
        {renderSummaryStats()}
        {renderFilterPills()}

        {/* Refund List */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px` }}
            >
              <Spinner size="md" />
            </Flex>
          ) : filteredRefunds.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredRefunds.map((refund) => renderRefundRow(refund))
          )}
        </Box>
      </Box>
    );
  },
});

export default QueueRefundWorkflow;
