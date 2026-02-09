'use client';

/**
 * RefundWorkflow - Detail Preset
 * Detailed view for a single refund request with customer info,
 * transaction details, timeline, notes, and action buttons.
 *
 * All visual values use design tokens for white-label support.
 */

import { useMemo } from 'react';
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
  User,
  Mail,
  CreditCard,
  FileText,
  MessageSquare,
  Loader2,
  Calendar,
  UserCheck,
  Hash,
} from 'lucide-react';

// ============================================================================
// Status Badge Component (token-based)
// ============================================================================

function RefundStatusBadge({ status, tokens, large }: { status: RefundStatus; tokens: DesignTokens; large?: boolean }) {
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
        padding: large
          ? `${tokens.spacing[1]}px ${tokens.spacing[3]}px`
          : `2px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: large ? tokens.typography.fontSize.sm : tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: config.bg,
        color: config.color,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: large ? 8 : 6,
          height: large ? 8 : 6,
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
// Section Header Component
// ============================================================================

function SectionHeader({ label, icon, tokens }: { label: string; icon: React.ReactNode; tokens: DesignTokens }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        marginBottom: tokens.spacing[3],
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <span style={{ display: 'flex', color: tokens.colors.neutral[400] }}>{icon}</span>
      {label}
    </div>
  );
}

// ============================================================================
// Detail Row Component
// ============================================================================

function DetailRow({ label, value, tokens, mono, color }: {
  label: string;
  value: React.ReactNode;
  tokens: DesignTokens;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[1]}px 0`,
      }}
    >
      <span
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[400],
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium,
          color: color || tokens.colors.neutral[900],
          fontFamily: mono ? 'monospace' : 'inherit',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export const DetailRefundWorkflow = createPreset<RefundWorkflowProps>({
  name: 'RefundWorkflow.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<RefundWorkflowProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      refunds,
      selectedRefundId,
      onApprove,
      onReject,
      onProcess,
      onViewTransaction,
      loading = false,
      className,
      style,
    } = props;

    // ========================================================================
    // Selected Refund
    // ========================================================================
    const refund = useMemo(() => {
      if (selectedRefundId) {
        return refunds.find((r) => r.id === selectedRefundId) || null;
      }
      return refunds.length > 0 ? refunds[0] : null;
    }, [refunds, selectedRefundId]);

    // ========================================================================
    // Render: No Selection State
    // ========================================================================
    if (loading) {
      return (
        <Box
          className={className}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            ...style,
          }}
        >
          <Spinner size="md" />
        </Box>
      );
    }

    if (!refund) {
      return (
        <Box
          className={className}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            gap: tokens.spacing[3],
            ...style,
          }}
        >
          <RotateCcw style={{ width: 40, height: 40, color: tokens.colors.neutral[300], opacity: 0.5 }} />
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
            Select a refund request
          </Text>
        </Box>
      );
    }

    // ========================================================================
    // Format dates
    // ========================================================================
    const requestedDate = refund.requestedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const processedDate = refund.processedAt
      ? refund.processedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Box style={createPanelHeaderStyle(tokens)}>
        <Flex align="center" justify="between">
          <Flex align="center" gap={tokens.spacing[3]}>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(refund.amount, refund.currency)}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                  textTransform: 'uppercase',
                  marginLeft: tokens.spacing[1],
                }}
              >
                {refund.currency}
              </Text>
            </Box>
            <RefundStatusBadge status={refund.status} tokens={tokens} large />
          </Flex>
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Customer Info
    // ========================================================================
    const renderCustomerInfo = () => (
      <Box
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <SectionHeader label="Customer" icon={<User style={{ width: 14, height: 14 }} />} tokens={tokens} />
        <DetailRow label="Name" value={refund.customerName} tokens={tokens} />
        <DetailRow label="Email" value={refund.customerEmail} tokens={tokens} color={tokens.colors.primaryScale[600]} />
      </Box>
    );

    // ========================================================================
    // Render: Transaction Details
    // ========================================================================
    const renderTransactionDetails = () => (
      <Box
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <SectionHeader label="Transaction" icon={<CreditCard style={{ width: 14, height: 14 }} />} tokens={tokens} />
        <DetailRow label="Transaction ID" value={refund.transactionId} tokens={tokens} mono />
        <DetailRow label="Payment Method" value={refund.paymentMethod} tokens={tokens} />
        <DetailRow
          label="Original Amount"
          value={formatCurrency(refund.originalAmount, refund.currency)}
          tokens={tokens}
        />
      </Box>
    );

    // ========================================================================
    // Render: Refund Details
    // ========================================================================
    const renderRefundDetails = () => (
      <Box
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <SectionHeader label="Refund Details" icon={<FileText style={{ width: 14, height: 14 }} />} tokens={tokens} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[1]}px 0`,
          }}
        >
          <span
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
            }}
          >
            Reason
          </span>
          <span style={createBadgeStyle(tokens, refund.reason === 'fraudulent' ? 'error' : 'info')}>
            {getReasonLabel(refund.reason)}
          </span>
        </div>
        {refund.reasonDetail && (
          <Box
            style={{
              marginTop: tokens.spacing[2],
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}
          >
            {refund.reasonDetail}
          </Box>
        )}
      </Box>
    );

    // ========================================================================
    // Render: Timeline
    // ========================================================================
    const renderTimeline = () => {
      const events: Array<{ label: string; time: string; icon: React.ReactNode; dotColor: string }> = [];

      events.push({
        label: 'Refund requested',
        time: requestedDate,
        icon: <Clock style={{ width: 12, height: 12 }} />,
        dotColor: tokens.colors.warningScale[500],
      });

      if (processedDate && refund.processedBy) {
        const processLabel =
          refund.status === 'approved' ? 'Approved' :
          refund.status === 'rejected' ? 'Rejected' :
          refund.status === 'completed' ? 'Completed' :
          refund.status === 'processing' ? 'Processing started' :
          'Processed';

        events.push({
          label: `${processLabel} by ${refund.processedBy}`,
          time: processedDate,
          icon: refund.status === 'rejected'
            ? <X style={{ width: 12, height: 12 }} />
            : <Check style={{ width: 12, height: 12 }} />,
          dotColor: refund.status === 'rejected' || refund.status === 'failed'
            ? tokens.colors.errorScale[500]
            : tokens.colors.successScale[500],
        });
      } else if (processedDate) {
        events.push({
          label: 'Processed',
          time: processedDate,
          icon: <Check style={{ width: 12, height: 12 }} />,
          dotColor: tokens.colors.successScale[500],
        });
      }

      return (
        <Box
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          <SectionHeader label="Timeline" icon={<Calendar style={{ width: 14, height: 14 }} />} tokens={tokens} />
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            {events.map((event, idx) => (
              <Box
                key={idx}
                style={{
                  display: 'flex',
                  gap: tokens.spacing[3],
                  position: 'relative',
                  paddingBottom: idx < events.length - 1 ? tokens.spacing[4] : 0,
                }}
              >
                {idx < events.length - 1 && (
                  <Box
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
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: event.dotColor,
                    flexShrink: 0,
                    marginTop: 2,
                    boxShadow: `0 0 0 2px ${event.dotColor}33`,
                  }}
                />
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {event.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      marginTop: 2,
                    }}
                  >
                    {event.time}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    // ========================================================================
    // Render: Notes
    // ========================================================================
    const renderNotes = () => {
      if (!refund.notes || refund.notes.length === 0) return null;

      return (
        <Box
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          <SectionHeader label="Notes" icon={<MessageSquare style={{ width: 14, height: 14 }} />} tokens={tokens} />
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {refund.notes.map((note, idx) => (
              <Box
                key={idx}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                {note}
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    // ========================================================================
    // Render: Action Buttons
    // ========================================================================
    const renderActions = () => {
      const hasPendingActions = refund.status === 'pending' && (onApprove || onReject);
      const hasApprovedActions = refund.status === 'approved' && onProcess;
      const hasViewAction = !!onViewTransaction;

      if (!hasPendingActions && !hasApprovedActions && !hasViewAction) return null;

      return (
        <Flex
          align="center"
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
          }}
        >
          {refund.status === 'pending' && onApprove && (
            <Box
              onClick={() => onApprove(refund.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Check style={{ width: 14, height: 14 }} />
              Approve Refund
            </Box>
          )}
          {refund.status === 'pending' && onReject && (
            <Box
              onClick={() => onReject(refund.id, '')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.errorScale[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <X style={{ width: 14, height: 14 }} />
              Reject Refund
            </Box>
          )}
          {refund.status === 'approved' && onProcess && (
            <Box
              onClick={() => onProcess(refund.id)}
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
                border: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Loader2 style={{ width: 14, height: 14 }} />
              Process Refund
            </Box>
          )}
          {onViewTransaction && (
            <Box
              onClick={() => onViewTransaction(refund.transactionId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                transition: `all ${tokens.motion.hover}`,
                marginLeft: 'auto',
              }}
            >
              <ExternalLink style={{ width: 14, height: 14 }} />
              View Transaction
            </Box>
          )}
        </Flex>
      );
    };

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
        {renderCustomerInfo()}
        {renderTransactionDetails()}
        {renderRefundDetails()}
        {renderTimeline()}
        {renderNotes()}
        {renderActions()}
      </Box>
    );
  },
});

export default DetailRefundWorkflow;
