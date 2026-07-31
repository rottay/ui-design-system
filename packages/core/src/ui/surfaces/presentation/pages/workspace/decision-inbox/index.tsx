'use client';

/**
 * @fileoverview DecisionInboxSurface - approval/review queue workspace.
 *
 * For: approval queues, moderation, audit triage, expense review,
 * support ticket triage, impersonation request review.
 */

import React, { useState, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { CollectionWorkspaceConfig } from '../../../../foundation/contracts/adaptive/collection';
import { useCollectionWorkspace } from '../../../../runtime/collection-workspace';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';
import { PatternDataTable } from '../../../../../patterns/data/data-table';
import { PatternFilterPanel } from '../../../../../patterns/forms/filter-panel';
import { CommunicationInboxIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-inbox';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Text } from '../../../../../primitives/display/Typography';
import { Card } from '../../../../../primitives/display/Card';
import { Badge } from '../../../../../primitives/display/Badge';
import { Button } from '../../../../../primitives/inputs/Button';
import { Textarea } from '../../../../../primitives/inputs/Textarea';
import { Popconfirm } from '../../../../../primitives/overlay/Popconfirm';
import { Skeleton } from '../../../../../primitives/feedback/Skeleton';

function readDecisionRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

/** Map the surface-level decision vocabulary onto the Button primitive variants. */
function resolveDecisionButtonVariant(
  variant: DecisionAction['variant'],
): 'primary' | 'danger' | 'secondary' {
  if (variant === 'primary') return 'primary';
  if (variant === 'danger') return 'danger';
  return 'secondary';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DecisionAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  icon?: ReactNode;
  requiresReason?: boolean;
  /** Confirmation message. When set, the action fires through a Popconfirm
   *  (destructive decisions get a danger confirm with cancel-first focus). */
  confirm?: string;
  /** Busy state for async decision submission (spinner + interaction lock). */
  loading?: boolean;
  /** Permission/disabled state — the action stays visible but inert. */
  disabled?: boolean;
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
  const { tSurfaceOr } = useSurfaceTranslations();
  if (!deadline) return null;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 0) {
    return (
      <Badge variant="error" badgeStyle="soft" size="xs">
        {tSurfaceOr('decision_inbox.sla_overdue', 'Overdue')}
      </Badge>
    );
  }
  if (diffMin <= criticalMin) {
    return (
      <Badge variant="error" badgeStyle="soft" size="xs">
        {tSurfaceOr('decision_inbox.sla_minutes_left', '{count}m left', { count: diffMin })}
      </Badge>
    );
  }
  if (diffMin <= warningMin) {
    return (
      <Badge variant="warning" badgeStyle="soft" size="xs">
        {tSurfaceOr('decision_inbox.sla_minutes_left', '{count}m left', { count: diffMin })}
      </Badge>
    );
  }
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return (
    <Text
      className="ds-decision-inbox__muted-text"
      size="xs"
    >
      {tSurfaceOr('decision_inbox.sla_duration_short', '{hours}h {mins}m', { hours, mins })}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DecisionInboxSkeleton() {
  return (
    <Stack className="ds-decision-inbox__skeleton" data-part="skeleton" spacing="md" aria-hidden="true">
      {/* Header skeleton */}
      <Box>
        <Skeleton variant="text" width="35%" height={24} />
        <Skeleton
          className="ds-decision-inbox__skeleton-subtitle"
          variant="text"
          width="50%"
          height={14}
        />
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

  const { tSurfaceOr } = useSurfaceTranslations();
  const batchReasonId = useId();
  const reviewReasonId = useId();

  const workspace = useCollectionWorkspace({
    config: workspaceConfig,
    defaultViewMode: 'table',
  });

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
      : String(readDecisionRecordValue(selectedItem, rowKey));
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

  // Renders one decision action. Reason-gated decisions stay plain buttons
  // (the first click reveals the reason field); once the reason requirement
  // is satisfied — or never existed — a `confirm`-carrying decision routes
  // through Popconfirm so destructive actions always get an explicit confirm.
  const renderDecisionButton = (
    decision: DecisionAction,
    onTrigger: (action: string) => void,
    stretch: boolean,
  ): React.ReactElement => {
    const needsReasonFirst = !!decision.requiresReason && !reasonText;
    const wrappedInConfirm = !!decision.confirm && !needsReasonFirst;
    const hookClass = stretch ? 'ds-decision-inbox__decision-action' : undefined;
    const button = (
      <Button
        key={decision.key}
        size="sm"
        variant={resolveDecisionButtonVariant(decision.variant)}
        onClick={wrappedInConfirm ? undefined : () => onTrigger(decision.key)}
        icon={decision.icon}
        loading={decision.loading}
        disabled={decision.disabled}
        className={hookClass}
      >
        {decision.label}
      </Button>
    );
    if (!wrappedInConfirm) return button;
    return (
      <Popconfirm
        key={decision.key}
        title={decision.confirm}
        okText={tSurfaceOr('decision_inbox.confirm_ok', 'Confirm')}
        cancelText={tSurfaceOr('decision_inbox.cancel', 'Cancel')}
        okType={decision.variant === 'danger' ? 'danger' : 'primary'}
        okButtonLoading={decision.loading}
        disabled={decision.disabled || decision.loading}
        className={hookClass}
        onConfirm={() => onTrigger(decision.key)}
      >
        {button}
      </Popconfirm>
    );
  };

  // Build columns with SLA badge if configured
  const enrichedColumns = sla
    ? [
        ...columns,
        {
          key: '__sla',
          header: tSurfaceOr('decision_inbox.sla_header', 'SLA'),
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
  const errorContent = workspaceConfig.error;
  const isEmpty = !isLoading && !errorContent && (!workspaceConfig.data || workspaceConfig.data.length === 0);

  // Show full-page skeleton on initial load when no data at all
  if (isLoading && (!workspaceConfig.data || workspaceConfig.data.length === 0)) {
    return (
      <Stack
        className="ds-surface ds-decision-inbox"
        data-part="root"
        data-loading="true"
        data-empty="false"
        data-mobile={workspace.isMobile ? 'true' : 'false'}
        spacing="md"
        aria-busy="true"
      >
        {headerSlot}
        <Text
          as="span"
          className="ds-decision-inbox__loading-label"
          data-part="loading-label"
        >
          {tSurfaceOr('decision_inbox.loading_label', 'Loading…')}
        </Text>
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
      data-mobile={workspace.isMobile ? 'true' : 'false'}
      spacing="md"
    >
      {headerSlot}

      {/* Header */}
      <Flex align="center" justify="between">
        <Box>
          <Text className="ds-decision-inbox__title" data-part="title" size="xl" weight="semibold">{queueName}</Text>
          {subtitle && (
            <Text
              className="ds-decision-inbox__muted-text ds-decision-inbox__subtitle"
              size="sm"
              color="muted"
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {workspaceConfig.data && workspaceConfig.data.length > 0 && (
          <Badge variant="default" badgeStyle="soft" size="sm">
            {tSurfaceOr('decision_inbox.pending_count', '{count} pending', {
              count: workspaceConfig.data.length,
            })}
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
                {tSurfaceOr('decision_inbox.items_selected', '{count} items selected', {
                  count: workspace.selectedKeys.length,
                })}
              </Badge>
              <Box className="ds-decision-inbox__selection-spacer" />

              {/* Reason input for batch (if pending action requires it) */}
              {pendingAction && (
                <Flex
                  className="ds-decision-inbox__batch-reason-field"
                  data-part="batch-reason-field"
                  direction="column"
                  align="stretch"
                  gap={1}
                >
                  <Text as="label" size="sm" weight="medium" htmlFor={batchReasonId}>
                    {tSurfaceOr('decision_inbox.reason_label', 'Reason')}
                  </Text>
                  <Textarea
                    id={batchReasonId}
                    className="ds-decision-inbox__batch-reason"
                    value={reasonText}
                    onChange={(val) => setReasonText(val)}
                    placeholder={tSurfaceOr('decision_inbox.reason_placeholder_batch', 'Enter reason...')}
                    rows={1}
                    autoFocus
                  />
                </Flex>
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={() => workspace.clearSelection()}
              >
                {tSurfaceOr('decision_inbox.clear_selection', 'Clear')}
              </Button>
              {decisions.map((decision) => renderDecisionButton(decision, handleBatchDecision, false))}
            </Flex>
          </Card.Body>
        </Card>
      )}

      {/* Error state (app-owned node from the collection contract) */}
      {errorContent && (
        <Box className="ds-decision-inbox__error" data-part="error">
          {errorContent}
        </Box>
      )}

      {/* Empty state */}
      {isEmpty && (
        workspaceConfig.emptyState ?? (
          <SurfaceEmptyState
            icon={<CommunicationInboxIcon decorative size={32} />}
            title={tSurfaceOr('decision_inbox.empty_title', 'No pending decisions')}
            description={tSurfaceOr(
              'decision_inbox.empty_description',
              'All items have been reviewed. New items will appear here when they require attention.',
            )}
          />
        )
      )}

      {/* Main content */}
      {!isEmpty && !errorContent && (
        <Flex
          className="ds-decision-inbox__content"
          data-part="content"
          gap={4}
        >
          {/* Queue table */}
          <Box className="ds-decision-inbox__queue" data-part="queue">
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
              className="ds-decision-inbox__review-rail"
              data-part="review-rail"
              style={
                reviewRail.width
                  ? ({ '--_ds-instance-decision-inbox-rail-width': reviewRail.width } as React.CSSProperties)
                  : undefined
              }
            >
              <Card
                className="ds-decision-inbox__review-card"
                variant="outlined"
              >
                <Card.Body>
                  <Stack spacing="md">
                    {/* Rail header */}
                    <Flex align="center" justify="between">
                      <Text size="sm" weight="semibold">
                        {tSurfaceOr('decision_inbox.review_details', 'Review Details')}
                      </Text>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          setSelectedItem(null);
                          setPendingAction(null);
                          setReasonText('');
                        }}
                      >
                        {tSurfaceOr('decision_inbox.close', 'Close')}
                      </Button>
                    </Flex>

                    {/* Divider */}
                    <Box
                      className="ds-decision-inbox__divider"
                      data-part="divider"
                      data-divider-kind="review-rail"
                    />

                    {/* Custom review content */}
                    {reviewRail.render(selectedItem)}

                    {/* Reason input (if pending action requires it) */}
                    {pendingAction && (
                      <Box>
                        <Text
                          as="label"
                          size="sm"
                          weight="medium"
                          htmlFor={reviewReasonId}
                          className="ds-decision-inbox__reason-label"
                        >
                          {tSurfaceOr('decision_inbox.reason_label', 'Reason')}
                        </Text>
                        <Textarea
                          id={reviewReasonId}
                          className="ds-decision-inbox__review-reason"
                          value={reasonText}
                          onChange={(val) => setReasonText(val)}
                          placeholder={tSurfaceOr(
                            'decision_inbox.reason_placeholder_review',
                            'Enter reason for this decision...',
                          )}
                          rows={3}
                          autoFocus
                        />
                      </Box>
                    )}

                    {/* Divider before actions */}
                    <Box
                      className="ds-decision-inbox__divider"
                      data-part="divider"
                      data-divider-kind="review-rail"
                    />

                    {/* Decision buttons */}
                    <Flex gap={2} wrap="wrap">
                      {decisions.map((decision) => renderDecisionButton(decision, handleDecision, true))}
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
