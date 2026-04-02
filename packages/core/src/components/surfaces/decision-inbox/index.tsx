'use client';

/**
 * @fileoverview DecisionInboxSurface - approval/review queue workspace.
 *
 * For: approval queues, moderation, audit triage, expense review,
 * support ticket triage, impersonation request review.
 */

import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../patterns/types';
import type { CollectionWorkspaceConfig } from '../contracts/collection';
import { useCollectionWorkspace } from '../hooks/useCollectionWorkspace';
import { PatternDataTable } from '../../patterns/data-table';
import { PatternFilterPanel } from '../../patterns/filter-panel';
import { Box } from '../../primitives/layout/Box';
import { Stack } from '../../primitives/layout/Stack';
import { Flex } from '../../primitives/layout/Flex';
import { Text } from '../../primitives/display/Typography';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DecisionAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  icon?: ReactNode;
  requiresReason?: boolean;
  confirm?: string;
}

export interface DecisionInboxSurfaceProps<T extends object> {
  /** Queue name displayed as title. */
  queueName: string;
  /** Optional subtitle. */
  subtitle?: string;

  /** Collection workspace config for the queue list. */
  workspace: CollectionWorkspaceConfig<T>;

  /** Column definitions for the queue table. */
  columns: ColumnDef<T>[];
  /** Row key accessor. */
  rowKey: keyof T | ((row: T) => string);

  /** Available decision actions (approve, reject, escalate, etc.). */
  decisions: DecisionAction[];
  /** Called when a decision is made on an item. */
  onDecision: (itemId: string, action: string, reason?: string) => void;

  /** Optional: batch decisions on multiple items at once. */
  batchDecisions?: boolean;
  /** Called when a batch decision is made on multiple items. */
  onBatchDecision?: (itemIds: string[], action: string, reason?: string) => void;

  /** Review rail (side panel for selected item context). */
  reviewRail?: {
    render: (item: T) => ReactNode;
    width?: string;
  };

  /** SLA configuration. */
  sla?: {
    getDeadline: (item: T) => Date | null;
    warningThresholdMinutes?: number;
    criticalThresholdMinutes?: number;
  };

  /** Per-row actions (additional to decision buttons). */
  actions?: (row: T, index: number) => ReactNode;

  /** Header/footer slots. */
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
}

// ---------------------------------------------------------------------------
// SLA Badge helper
// ---------------------------------------------------------------------------

function SlaBadge({ deadline, warningMin = 60, criticalMin = 15 }: {
  deadline: Date | null;
  warningMin?: number;
  criticalMin?: number;
}) {
  if (!deadline) return null;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 0) {
    return <Text size="xs" style={{ color: 'var(--ds-color-error)' }}>Overdue</Text>;
  }
  if (diffMin <= criticalMin) {
    return <Text size="xs" style={{ color: 'var(--ds-color-error)' }}>{diffMin}m left</Text>;
  }
  if (diffMin <= warningMin) {
    return <Text size="xs" style={{ color: 'var(--ds-color-warning)' }}>{diffMin}m left</Text>;
  }
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>{hours}h {mins}m</Text>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DecisionInboxSurface<T extends object>(props: DecisionInboxSurfaceProps<T>) {
  const {
    queueName,
    subtitle,
    workspace: workspaceConfig,
    columns,
    rowKey,
    decisions,
    onDecision,
    batchDecisions,
    onBatchDecision,
    reviewRail,
    sla,
    actions,
    headerSlot,
    footerSlot,
  } = props;

  const workspace = useCollectionWorkspace({
    config: workspaceConfig,
    defaultViewMode: 'table',
  });

  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleRowClick = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const handleDecision = useCallback((action: string) => {
    if (!selectedItem) return;
    const key = typeof rowKey === 'function' ? rowKey(selectedItem) : String(selectedItem[rowKey]);
    const decisionDef = decisions.find(d => d.key === action);
    if (decisionDef?.requiresReason && !reasonText) {
      setPendingAction(action);
      return;
    }
    onDecision(key, action, reasonText || undefined);
    setReasonText('');
    setPendingAction(null);
    setSelectedItem(null);
  }, [selectedItem, rowKey, decisions, onDecision, reasonText]);

  const handleBatchDecision = useCallback((action: string) => {
    const decisionDef = decisions.find(d => d.key === action);
    if (decisionDef?.requiresReason && !reasonText) {
      setPendingAction(action);
      return;
    }
    if (onBatchDecision) {
      onBatchDecision(workspace.selectedKeys, action, reasonText || undefined);
    } else {
      for (const key of workspace.selectedKeys) {
        onDecision(key, action, reasonText || undefined);
      }
    }
    setReasonText('');
    setPendingAction(null);
    workspace.clearSelection();
  }, [workspace.selectedKeys, workspace.clearSelection, onBatchDecision, onDecision, decisions, reasonText]);

  // Build columns with SLA badge if configured
  const enrichedColumns = sla
    ? [
        ...columns,
        {
          key: '__sla',
          header: 'SLA',
          render: (_: unknown, row: T) => (
            <SlaBadge
              deadline={sla.getDeadline(row)}
              warningMin={sla.warningThresholdMinutes}
              criticalMin={sla.criticalThresholdMinutes}
            />
          ),
        } as ColumnDef<T>,
      ]
    : columns;

  const showReviewRail = reviewRail && selectedItem;

  return (
    <Stack spacing="md">
      {headerSlot}

      {/* Header */}
      <Box>
        <Text size="xl" weight="semibold">{queueName}</Text>
        {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
      </Box>

      {/* Filters */}
      {workspaceConfig.controls?.filters && workspaceConfig.controls.filters.length > 0 && (
        <PatternFilterPanel
          filters={workspaceConfig.controls.filters}
          values={workspace.filterValues}
          onChange={workspace.applyFilters}
          onReset={workspace.resetFilters}
          activeCount={workspace.activeFilterCount}
          layout={workspace.isMobile ? 'stacked' : 'inline'}
        />
      )}

      {/* Batch decision bar */}
      {batchDecisions && workspace.hasSelection && workspace.selectedKeys.length > 1 && (
        <Flex
          align="center"
          gap={3}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-primary)',
            background: 'var(--ds-color-bg-tertiary)',
          }}
        >
          <Text size="sm" weight="medium" style={{ flex: 1 }}>
            {workspace.selectedKeys.length} items selected
          </Text>

          {/* Reason input for batch (if pending action requires it) */}
          {pendingAction && (
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Enter reason..."
              style={{
                minWidth: '200px',
                minHeight: '36px',
                padding: '6px 12px',
                border: '1px solid var(--ds-color-border-primary)',
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: 'var(--ds-color-bg-primary)',
                color: 'var(--ds-color-text-primary)',
                fontSize: '14px',
                resize: 'horizontal',
              }}
            />
          )}

          <button
            onClick={() => workspace.clearSelection()}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--ds-color-border-primary)',
              borderRadius: 'var(--ds-radius-md, 8px)',
              background: 'var(--ds-color-bg-secondary)',
              color: 'var(--ds-color-text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Clear selection
          </button>
          {decisions.map((decision) => (
            <button
              key={decision.key}
              onClick={() => handleBatchDecision(decision.key)}
              style={{
                padding: '6px 12px',
                border: decision.variant === 'danger'
                  ? '1px solid var(--ds-color-error)'
                  : '1px solid var(--ds-color-border-primary)',
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: decision.variant === 'primary'
                  ? 'var(--ds-color-primary)'
                  : decision.variant === 'danger'
                    ? 'transparent'
                    : 'var(--ds-color-bg-secondary)',
                color: decision.variant === 'primary'
                  ? 'var(--ds-color-text-on-primary, #fff)'
                  : decision.variant === 'danger'
                    ? 'var(--ds-color-error)'
                    : 'var(--ds-color-text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
              }}
            >
              {decision.icon && <span style={{ marginRight: '6px' }}>{decision.icon}</span>}
              {decision.label}
            </button>
          ))}
        </Flex>
      )}

      {/* Main content */}
      <Flex gap={4}>
        {/* Queue table */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <PatternDataTable<T>
            data={workspaceConfig.data}
            columns={enrichedColumns}
            rowKey={rowKey}
            loading={workspaceConfig.loading}
            emptyState={workspaceConfig.emptyState}
            selectable={batchDecisions}
            selectedKeys={workspace.selectedKeys}
            onSelectionChange={workspace.setSelection}
            onRowClick={handleRowClick}
            sorting={workspaceConfig.behavior?.sorting}
            onSortChange={workspaceConfig.behavior?.onSortChange}
            pagination={workspaceConfig.behavior?.pagination}
            hoverable
            actions={actions}
          />
        </Box>

        {/* Review rail */}
        {showReviewRail && (
          <Box
            style={{
              width: reviewRail.width ?? '380px',
              flexShrink: 0,
              borderLeft: '1px solid var(--ds-color-border-secondary)',
              paddingLeft: '16px',
            }}
          >
            <Stack spacing="md">
              {reviewRail.render(selectedItem)}

              {/* Reason input (if pending action requires it) */}
              {pendingAction && (
                <Box>
                  <Text size="sm" weight="medium" style={{ marginBottom: '8px' }}>Reason</Text>
                  <textarea
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Enter reason..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px 12px',
                      border: '1px solid var(--ds-color-border-primary)',
                      borderRadius: 'var(--ds-radius-md, 8px)',
                      background: 'var(--ds-color-bg-primary)',
                      color: 'var(--ds-color-text-primary)',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </Box>
              )}

              {/* Decision buttons */}
              <Flex gap={2} wrap="wrap">
                {decisions.map((decision) => (
                  <button
                    key={decision.key}
                    onClick={() => handleDecision(decision.key)}
                    style={{
                      padding: '8px 16px',
                      border: decision.variant === 'danger'
                        ? '1px solid var(--ds-color-error)'
                        : '1px solid var(--ds-color-border-primary)',
                      borderRadius: 'var(--ds-radius-md, 8px)',
                      background: decision.variant === 'primary'
                        ? 'var(--ds-color-primary)'
                        : decision.variant === 'danger'
                          ? 'transparent'
                          : 'var(--ds-color-bg-secondary)',
                      color: decision.variant === 'primary'
                        ? 'var(--ds-color-text-on-primary, #fff)'
                        : decision.variant === 'danger'
                          ? 'var(--ds-color-error)'
                          : 'var(--ds-color-text-primary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
                    }}
                  >
                    {decision.icon && <span style={{ marginRight: '6px' }}>{decision.icon}</span>}
                    {decision.label}
                  </button>
                ))}
              </Flex>
            </Stack>
          </Box>
        )}
      </Flex>

      {footerSlot}
    </Stack>
  );
}
