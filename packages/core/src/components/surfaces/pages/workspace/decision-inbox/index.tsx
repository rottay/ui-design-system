'use client';

/**
 * @fileoverview DecisionInboxSurface - approval/review queue workspace.
 *
 * For: approval queues, moderation, audit triage, expense review,
 * support ticket triage, impersonation request review.
 */

import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../patterns/foundation/types';
import type { CollectionWorkspaceConfig } from '../../../foundation/contracts/collection';
import { useCollectionWorkspace } from '../../../foundation/hooks/useCollectionWorkspace';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import { PatternDataTable } from '../../../../patterns/data/data-table';
import { PatternFilterPanel } from '../../../../patterns/forms/filter-panel';
import { Box } from '../../../../primitives/layout/Box';
import { Stack } from '../../../../primitives/layout/Stack';
import { Flex } from '../../../../primitives/layout/Flex';
import { Text } from '../../../../primitives/display/Typography';
import { Card } from '../../../../primitives/display/Card';
import { Badge } from '../../../../primitives/display/Badge';
import { Button } from '../../../../primitives/inputs/Button';
import { Textarea } from '../../../../primitives/inputs/Textarea';
import { Skeleton } from '../../../../primitives/feedback/Skeleton';

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
    return (
      <Badge variant="error" badgeStyle="soft" size="xs">
        Overdue
      </Badge>
    );
  }
  if (diffMin <= criticalMin) {
    return (
      <Badge variant="error" badgeStyle="soft" size="xs">
        {diffMin}m left
      </Badge>
    );
  }
  if (diffMin <= warningMin) {
    return (
      <Badge variant="warning" badgeStyle="soft" size="xs">
        {diffMin}m left
      </Badge>
    );
  }
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return (
    <Text
      className="ds-decision-inbox__muted-text"
      data-part="muted-text"
      size="xs"
    >
      {hours}h {mins}m
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DecisionInboxSkeleton() {
  return (
    <Stack spacing="md">
      {/* Header skeleton */}
      <Box>
        <Skeleton variant="text" width="35%" height={24} />
        <Skeleton variant="text" width="50%" height={14} style={{ marginTop: 8 }} />
      </Box>

      {/* Filter skeleton */}
      <Flex gap={2}>
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="rounded" width={120} height={32} />
      </Flex>

      {/* Table skeleton */}
      <Card variant="outlined">
        <Card.Body>
          <Stack spacing="sm">
            {/* Header row */}
            <Flex
              className="ds-decision-inbox__divider"
              data-part="divider"
              data-divider-kind="skeleton-header"
              gap={4}
              style={{ paddingBottom: 'var(--ds-spacing-sm, 8px)' }}
            >
              <Skeleton variant="text" width="25%" height={14} />
              <Skeleton variant="text" width="20%" height={14} />
              <Skeleton variant="text" width="15%" height={14} />
              <Skeleton variant="text" width="20%" height={14} />
            </Flex>
            {/* Data rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Flex
                className="ds-decision-inbox__divider"
                data-part="divider"
                data-divider-kind="skeleton-row"
                key={i}
                gap={4}
                align="center"
                style={{
                  padding: 'var(--ds-spacing-sm, 8px) 0',
                }}
              >
                <Skeleton variant="text" width="25%" height={14} />
                <Skeleton variant="text" width="20%" height={14} />
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="text" width="20%" height={14} />
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function DecisionEmptyState() {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Flex
          align="center"
          justify="center"
          style={{
            padding: 'var(--ds-spacing-xl, 32px) var(--ds-spacing-md, 16px)',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-sm, 8px)',
          }}
        >
          <Text size="lg" weight="medium" color="muted">
            No pending decisions
          </Text>
          <Text size="sm" color="muted">
            All items have been reviewed. New items will appear here when they require attention.
          </Text>
        </Flex>
      </Card.Body>
    </Card>
  );
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

  const { isDesktop } = useBreakpoints();

  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleRowClick = useCallback((item: T) => {
    setSelectedItem(item);
    setPendingAction(null);
    setReasonText('');
  }, []);

  const handleDecision = useCallback((action: string) => {
    if (!selectedItem) return;
    const key = typeof rowKey === 'function'
      ? rowKey(selectedItem)
      : String(Reflect.get(selectedItem, rowKey));
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
  const isLoading = workspaceConfig.loading;
  const isEmpty = !isLoading && (!workspaceConfig.data || workspaceConfig.data.length === 0);

  // Show full-page skeleton on initial load when no data at all
  if (isLoading && (!workspaceConfig.data || workspaceConfig.data.length === 0)) {
    return (
      <Stack
        className="ds-surface ds-decision-inbox"
        data-part="root"
        data-loading="true"
        data-empty="false"
        spacing="md"
      >
        {headerSlot}
        <DecisionInboxSkeleton />
        {footerSlot}
      </Stack>
    );
  }

  return (
    <Stack
      className="ds-surface ds-decision-inbox"
      data-part="root"
      data-loading={isLoading ? 'true' : 'false'}
      data-empty={isEmpty ? 'true' : 'false'}
      spacing="md"
    >
      {headerSlot}

      {/* Header */}
      <Flex align="center" justify="between">
        <Box>
          <Text className="ds-decision-inbox__title" data-part="title" size="xl" weight="semibold">{queueName}</Text>
          {subtitle && (
            <Text
              className="ds-decision-inbox__muted-text"
              data-part="muted-text"
              size="sm"
              color="muted"
              style={{ marginTop: 'var(--ds-spacing-xs, 4px)' }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {workspaceConfig.data && workspaceConfig.data.length > 0 && (
          <Badge variant="default" badgeStyle="soft" size="sm">
            {workspaceConfig.data.length} pending
          </Badge>
        )}
      </Flex>

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
        <Card
          className="ds-decision-inbox__selection-bar"
          variant="outlined"
        >
          <Card.Body>
            <Flex align="center" gap={3} wrap="wrap">
              <Badge variant="primary" badgeStyle="soft" size="sm">
                {workspace.selectedKeys.length} items selected
              </Badge>
              <Box style={{ flex: 1 }} />

              {/* Reason input for batch (if pending action requires it) */}
              {pendingAction && (
                <Textarea
                  className="ds-decision-inbox__batch-reason"
                  value={reasonText}
                  onChange={(val) => setReasonText(val)}
                  placeholder="Enter reason..."
                  rows={1}
                  style={{ minWidth: 200, maxWidth: 320 }}
                />
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={() => workspace.clearSelection()}
              >
                Clear
              </Button>
              {decisions.map((decision) => (
                <Button
                  key={decision.key}
                  size="sm"
                  variant={
                    decision.variant === 'primary'
                      ? 'primary'
                      : decision.variant === 'danger'
                        ? 'danger'
                        : 'secondary'
                  }
                  onClick={() => handleBatchDecision(decision.key)}
                  icon={decision.icon}
                >
                  {decision.label}
                </Button>
              ))}
            </Flex>
          </Card.Body>
        </Card>
      )}

      {/* Empty state */}
      {isEmpty && !workspaceConfig.emptyState && <DecisionEmptyState />}

      {/* Main content */}
      {!isEmpty && (
        <Flex
          gap={4}
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
          }}
        >
          {/* Queue table */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <PatternDataTable<T>
              data={workspaceConfig.data}
              columns={enrichedColumns}
              rowKey={rowKey}
              loading={isLoading}
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
                width: isDesktop ? (reviewRail.width ?? '380px') : '100%',
                flexShrink: 0,
              }}
            >
              <Card
                className="ds-decision-inbox__review-card"
                variant="outlined"
                style={{
                  position: isDesktop ? 'sticky' : 'relative',
                  top: isDesktop ? 'var(--ds-spacing-md, 16px)' : undefined,
                }}
              >
                <Card.Body>
                  <Stack spacing="md">
                    {/* Rail header */}
                    <Flex align="center" justify="between">
                      <Text size="sm" weight="semibold">Review Details</Text>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          setSelectedItem(null);
                          setPendingAction(null);
                          setReasonText('');
                        }}
                      >
                        Close
                      </Button>
                    </Flex>

                    {/* Divider */}
                    <Box
                      className="ds-decision-inbox__divider"
                      data-part="divider"
                      data-divider-kind="review-rail"
                      style={{
                        height: 1,
                      }}
                    />

                    {/* Custom review content */}
                    {reviewRail.render(selectedItem)}

                    {/* Reason input (if pending action requires it) */}
                    {pendingAction && (
                      <Box>
                        <Text
                          size="sm"
                          weight="medium"
                          style={{ marginBottom: 'var(--ds-spacing-xs, 4px)' }}
                        >
                          Reason
                        </Text>
                        <Textarea
                          className="ds-decision-inbox__review-reason"
                          value={reasonText}
                          onChange={(val) => setReasonText(val)}
                          placeholder="Enter reason for this decision..."
                          rows={3}
                          style={{ width: '100%' }}
                        />
                      </Box>
                    )}

                    {/* Divider before actions */}
                    <Box
                      className="ds-decision-inbox__divider"
                      data-part="divider"
                      data-divider-kind="review-rail"
                      style={{
                        height: 1,
                      }}
                    />

                    {/* Decision buttons */}
                    <Flex gap={2} wrap="wrap">
                      {decisions.map((decision) => (
                        <Button
                          key={decision.key}
                          size="sm"
                          variant={
                            decision.variant === 'primary'
                              ? 'primary'
                              : decision.variant === 'danger'
                                ? 'danger'
                                : 'secondary'
                          }
                          onClick={() => handleDecision(decision.key)}
                          icon={decision.icon}
                          style={{ flex: 1 }}
                        >
                          {decision.label}
                        </Button>
                      ))}
                    </Flex>
                  </Stack>
                </Card.Body>
              </Card>
            </Box>
          )}
        </Flex>
      )}

      {footerSlot}
    </Stack>
  );
}
