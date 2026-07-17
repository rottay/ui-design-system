'use client';

/**
 * @fileoverview Classic engine for the ApprovalInbox pattern.
 * Renders grouped approval cards with domain headers, item rows with
 * approve/reject buttons, SLA indicators, amount/risk badges, and a
 * batch action toolbar.
 */

import React, { useState, useCallback } from 'react';
import { Box, Flex, Stack } from '../../../../../primitives/layout';
import { Text, Badge, Tag } from '../../../../../primitives/display';
import { Button, Checkbox } from '../../../../../primitives/inputs';
import type { ApprovalInboxProps, ApprovalItem } from '../../contracts';

/** Maps risk level to Tag color name. */
const RISK_COLORS: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
  critical: 'volcano',
};

/** Maps risk level to DS CSS variable. */
const RISK_CSS: Record<string, string> = {
  low: 'var(--ds-color-success)',
  medium: 'var(--ds-color-warning)',
  high: 'var(--ds-color-error)',
  critical: 'var(--ds-color-error)',
};

/** Formats a monetary amount with locale formatting. */
function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Computes SLA urgency from a deadline timestamp. */
function getSlaUrgency(deadline?: string): 'normal' | 'warning' | 'critical' | null {
  if (!deadline) return null;
  const now = new Date().getTime();
  const dl = new Date(deadline).getTime();
  const hoursLeft = (dl - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'critical';
  if (hoursLeft < 4) return 'warning';
  return 'normal';
}

/** Formats relative time until SLA deadline. */
function formatSla(deadline?: string): string | null {
  if (!deadline) return null;
  const now = new Date().getTime();
  const dl = new Date(deadline).getTime();
  const hoursLeft = (dl - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'Overdue';
  if (hoursLeft < 1) return `${Math.round(hoursLeft * 60)}m left`;
  if (hoursLeft < 24) return `${Math.round(hoursLeft)}h left`;
  return `${Math.round(hoursLeft / 24)}d left`;
}

/** Formats a relative submission time. */
function formatSubmittedAt(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const SLA_COLORS: Record<string, string> = {
  normal: 'var(--ds-color-text-muted)',
  warning: 'var(--ds-color-warning)',
  critical: 'var(--ds-color-error)',
};

/**
 * Classic engine ApprovalInbox.
 * Renders grouped domain cards with item rows, approve/reject buttons,
 * SLA indicators, and batch action toolbar when items are selected.
 */
export default function ClassicApprovalInbox(props: ApprovalInboxProps) {
  const {
    groups,
    onApprove,
    onReject,
    onBatchApprove,
    emptyMessage = 'No pending approvals',
    loading,
    className,
    style,
  } = props;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (loading) {
    return (
      <Box
        className={className}
        style={{
          padding: '20px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          ...style,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={`skel-${i}`}
            style={{
              width: '100%',
              height: 60,
              borderRadius: 8,
              background: 'var(--ds-color-bg-secondary)',
              marginBottom: 12,
            }}
          />
        ))}
      </Box>
    );
  }

  if (totalItems === 0) {
    return (
      <Box
        className={`ds-pattern-approval-inbox ds-engine-classic ${className ?? ''}`}
        style={{
          padding: '40px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          textAlign: 'center' as const,
          ...style,
        }}
      >
        <Text style={{ fontSize: 14, color: 'var(--ds-color-text-muted)' }}>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      className={`ds-pattern-approval-inbox ds-engine-classic ${className ?? ''}`}
      style={style}
    >
      {/* Batch action toolbar */}
      {selectedIds.size > 0 && onBatchApprove && (
        <Flex
          align="center"
          gap={12}
          style={{
            padding: '10px 20px',
            marginBottom: 12,
            background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
            borderRadius: 8,
            border: '1px solid color-mix(in srgb, var(--ds-color-primary) 20%, transparent)',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-color-primary)' }}>
            {selectedIds.size} selected
          </Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onBatchApprove(Array.from(selectedIds));
              setSelectedIds(new Set());
            }}
          >
            Batch Approve
          </Button>
          <Button
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </Flex>
      )}

      {/* Domain groups */}
      <Stack gap={16}>
        {groups.map((group) => (
          <Box
            key={group.domain}
            style={{
              background: 'var(--ds-color-bg-primary)',
              borderRadius: 12,
              border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
              overflow: 'hidden',
            }}
          >
            {/* Domain header */}
            <Flex
              justify="between"
              align="center"
              style={{
                padding: '12px 20px',
                background: 'var(--ds-color-bg-secondary)',
                borderBottom: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))',
              }}
            >
              <Flex align="center" gap={8}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ds-color-text-primary)',
                  }}
                >
                  {group.domain}
                </Text>
                <Badge
                  count={group.items.length}
                  style={{ backgroundColor: 'var(--ds-color-text-muted)' }}
                />
              </Flex>
            </Flex>

            {/* Item rows */}
            {group.items.map((item, idx) => {
              const slaUrgency = getSlaUrgency(item.slaDeadline);
              const slaText = formatSla(item.slaDeadline);

              return (
                <Flex
                  key={item.id}
                  justify="between"
                  align="center"
                  style={{
                    padding: '12px 20px',
                    borderBottom:
                      idx < group.items.length - 1
                        ? '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent))'
                        : 'none',
                  }}
                >
                  {/* Left: checkbox + info */}
                  <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                    {onBatchApprove && (
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    )}
                    <Flex direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Flex align="center" gap={8}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--ds-color-text-primary)',
                          }}
                        >
                          {item.title}
                        </Text>
                        {item.risk && (
                          <Tag color={RISK_COLORS[item.risk]} style={{ fontSize: 11 }}>
                            {item.risk.toUpperCase()}
                          </Tag>
                        )}
                      </Flex>
                      <Flex align="center" gap={12}>
                        {item.subtitle && (
                          <Text style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
                            {item.subtitle}
                          </Text>
                        )}
                        <Text style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>
                          {formatSubmittedAt(item.submittedAt)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  {/* Center: amount + SLA */}
                  <Flex align="center" gap={16} style={{ marginRight: 16 }}>
                    {item.amount != null && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--ds-color-text-primary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatAmount(item.amount)}
                      </Text>
                    )}
                    {slaText && slaUrgency && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: SLA_COLORS[slaUrgency],
                        }}
                      >
                        {slaText}
                      </Text>
                    )}
                  </Flex>

                  {/* Right: actions */}
                  <Flex gap={6}>
                    {onApprove && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onApprove(item.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {onReject && (
                      <Button
                        size="sm"
                        danger
                        onClick={() => onReject(item.id)}
                      >
                        Reject
                      </Button>
                    )}
                  </Flex>
                </Flex>
              );
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
