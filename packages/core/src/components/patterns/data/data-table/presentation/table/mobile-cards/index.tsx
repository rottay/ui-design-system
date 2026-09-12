"use client";

import React from "react";
import { Box } from "@/components/primitives/layout/box";
import { Card } from "@/components/primitives/display/card";
import { Checkbox } from "@/components/primitives/inputs/checkbox";
import { Flex } from "@/components/primitives/layout/flex";
import { Stack } from "@/components/primitives/layout/stack";
import { Text } from "@/components/primitives/display/typography/compound/text";
import type {
  ColumnDef,
  ResponsiveColumnMode,
} from "@/foundation/contracts/runtime/components/patterns/core";
import type {
  DataTableRowActions,
  ViewportPosture,
} from "@/foundation/contracts/kernel/adaptation";
import type { DataTableMobileCardContext } from "../../../contracts";
import type { DataTableMessages } from "../../../contracts";
import type { RecordColumnProjection } from "../../../runtime/adaptation";
import { resolveAccessor } from "../../../runtime/row-resolution";
import { placeRowActions, SwipeActionsRecord } from "./row-actions";

function stringifyMobileValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value);
}

function renderDefaultField<T extends object>(
  column: ColumnDef<T>,
  row: T,
  index: number
): React.ReactNode {
  const value = resolveAccessor(column, row);

  if (column.render) {
    return column.render(value, row, index);
  }

  return stringifyMobileValue(value);
}

export interface DataTableMobileCardsProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Current device class key, used to resolve responsive column roles. */
  deviceKey?: ViewportPosture;
  getRowKey: (row: T, index: number) => string;
  selectedKeys?: string[];
  selectable?: boolean;
  onToggleSelection?: (key: string) => void;
  onRowClick?: (row: T, index: number) => void;
  actions?: (row: T, index: number) => React.ReactNode;
  mobileCard?: (
    row: T,
    index: number,
    context: DataTableMobileCardContext<T>
  ) => React.ReactNode;
  messages?: DataTableMessages;
  /**
   * The column projection an adaptation declared. When present it replaces the
   * per-column responsive roles and the positional heuristic, uncapped: the
   * application said which columns stay.
   */
  projection?: RecordColumnProjection<T>;
  /** `list` renders one compact line per record instead of a card. */
  presentation?: "cards" | "list";
  rowActions?: DataTableRowActions;
}

/**
 * Resolves the responsive mode for a column at the given device class.
 * Falls back to `'visible'` when the column has no responsive config.
 */
function getMode<T>(
  column: ColumnDef<T>,
  deviceKey: ViewportPosture
): ResponsiveColumnMode {
  return column.responsive?.[deviceKey] ?? "visible";
}

/**
 * Phone projection ordering: a column declared `priority: 'low'` is supporting
 * context (it already yields first to the container-width axis on the desktop
 * table), so it must never displace primary content from one of the few
 * summary slots a 390px card has. The sort is stable — declaration order
 * stands within one priority tier, which keeps the card reading in the same
 * field order the consumer designed.
 */
function orderSummaryCandidates<T>(cols: ColumnDef<T>[]): ColumnDef<T>[] {
  return [...cols].sort(
    (a, b) => Number(a.priority === "low") - Number(b.priority === "low")
  );
}

export function DataTableMobileCards<T extends object>({
  data,
  columns,
  deviceKey = "phone",
  getRowKey,
  selectedKeys = [],
  selectable = false,
  onToggleSelection,
  onRowClick,
  actions,
  mobileCard,
  messages,
  projection,
  presentation = "cards",
  rowActions = "inline",
}: DataTableMobileCardsProps<T>): React.ReactElement {
  const visibleColumns = columns.filter((column) => column.visible !== false);
  const rowActionsLabel = messages?.rowActions ?? "Row actions";

  // Check if ANY column has a responsive config at this device class.
  // If so, use the responsive roles to pick title/summary columns.
  // Otherwise, fall back to the legacy positional heuristic.
  const hasResponsiveConfig = visibleColumns.some(
    (col) => col.responsive && col.responsive[deviceKey] !== undefined
  );

  let titleColumn: ColumnDef<T> | undefined;
  let summaryColumns: ColumnDef<T>[];
  const metaColumns: ColumnDef<T>[] = projection?.meta ?? [];

  if (projection) {
    titleColumn = projection.title;
    summaryColumns = projection.fields;
  } else if (hasResponsiveConfig) {
    // Use explicit responsive roles
    const primaryCols = visibleColumns.filter(
      (col) => getMode(col, deviceKey) === "primary"
    );
    const summaryCols = visibleColumns.filter(
      (col) => getMode(col, deviceKey) === "summary"
    );

    // If there are primary columns, use the first as card title.
    // Otherwise fall back to the first visible column (legacy behavior).
    // Both branches cap the summary at 3 fields: a phone card is an
    // identity + key-facts projection, not a column dump — fields beyond
    // the cap are reachable via the row's own open action.
    titleColumn = primaryCols[0] ?? visibleColumns[0];
    summaryColumns =
      summaryCols.length > 0
        ? orderSummaryCandidates(summaryCols).slice(0, 3)
        : orderSummaryCandidates(
            visibleColumns.filter(
              (col) =>
                col !== titleColumn && getMode(col, deviceKey) === "visible"
            )
          ).slice(0, 3);
  } else {
    // Legacy positional heuristic: first column is title, next 3 are summary
    // (priority-ordered: low-priority context yields its slot first).
    titleColumn = visibleColumns[0];
    summaryColumns = orderSummaryCandidates(visibleColumns.slice(1)).slice(
      0,
      3
    );
  }

  const renderMeta = (row: T, index: number) =>
    metaColumns.length > 0 ? (
      <Flex gap={8} wrap="wrap" align="center" data-part="record-meta">
        {metaColumns.map((column) => (
          <Box key={column.key} data-part="record-meta-value">
            {renderDefaultField(column, row, index)}
          </Box>
        ))}
      </Flex>
    ) : null;

  return (
    <Stack
      spacing={presentation === "list" ? "xs" : "md"}
      className="ds-pattern-data-table ds-data-table--mobile"
      data-part={presentation === "list" ? "record-list" : "record-cards"}
      role={presentation === "list" ? "list" : undefined}
    >
      {data.map((row, index) => {
        const rowKey = getRowKey(row, index);
        const isSelected = selectedKeys.includes(rowKey);
        const authoredActions = actions?.(row, index);
        const resolvedActions =
          rowActions === "menu"
            ? placeRowActions("menu", authoredActions, rowActionsLabel)
            : authoredActions;
        const mobileCardContext: DataTableMobileCardContext<T> = {
          item: row,
          index,
          rowKey,
          selected: isSelected,
          selectable,
          toggleSelection: (event) => {
            event?.stopPropagation?.();
            onToggleSelection?.(rowKey);
          },
          open: (event) => {
            event?.stopPropagation?.();
            onRowClick?.(row, index);
          },
          actions: resolvedActions,
        };
        const inlineActions = rowActions === "swipe" ? null : resolvedActions;
        const withSwipe = (record: React.ReactElement): React.ReactElement =>
          rowActions === "swipe" && authoredActions ? (
            <SwipeActionsRecord
              key={rowKey}
              label={rowActionsLabel}
              actions={authoredActions}
            >
              {record}
            </SwipeActionsRecord>
          ) : (
            record
          );

        if (mobileCard) {
          return (
            <Box
              key={rowKey}
              data-part="mobile-card-custom"
              data-selected={isSelected ? "true" : "false"}
            >
              {mobileCard(row, index, mobileCardContext)}
            </Box>
          );
        }

        const selection =
          selectable && onToggleSelection ? (
            <Box
              data-part="mobile-card-selection"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleSelection(rowKey)}
                aria-label={
                  messages?.selectRow?.(rowKey) ?? `Select ${rowKey}`
                }
              />
            </Box>
          ) : null;

        if (presentation === "list") {
          const openRow = onRowClick ? () => onRowClick(row, index) : undefined;
          return withSwipe(
            <Box
              key={rowKey}
              role="listitem"
              data-part="record-list-item"
              data-selected={isSelected ? "true" : "false"}
              onClick={openRow}
            >
              <Flex justify="between" align="center" gap={12}>
                <Flex align="center" gap={12} wrap="wrap">
                  {selection}
                  <Flex
                    align="center"
                    gap={12}
                    wrap="wrap"
                    data-part="record-list-open"
                    role={openRow ? "button" : undefined}
                    tabIndex={openRow ? 0 : undefined}
                    onKeyDown={
                      openRow
                        ? (event) => {
                            if (event.target !== event.currentTarget) return;
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            openRow();
                          }
                        : undefined
                    }
                  >
                    {titleColumn && (
                      <Box data-part="mobile-card-title">
                        {renderDefaultField(titleColumn, row, index)}
                      </Box>
                    )}
                    {renderMeta(row, index)}
                    {summaryColumns.map((column) => (
                      <Box key={column.key} data-part="mobile-card-summary-value">
                        {renderDefaultField(column, row, index)}
                      </Box>
                    ))}
                  </Flex>
                </Flex>
                {inlineActions && (
                  <Box
                    data-part="mobile-card-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {inlineActions}
                  </Box>
                )}
              </Flex>
            </Box>
          );
        }

        return withSwipe(
          <Card
            key={rowKey}
            variant="outlined"
            hoverable={!!onRowClick}
            clickable={!!onRowClick}
            onClick={() => onRowClick?.(row, index)}
            className={`ds-data-table__mobile-card${
              isSelected ? " ds-data-table__mobile-card--selected" : ""
            }`}
          >
            <Card.Body>
              <Stack spacing="md">
                <Flex justify="between" align="start" gap={12}>
                  <Stack spacing="xs" data-part="mobile-card-primary">
                    {titleColumn && (
                      <Box data-part="mobile-card-title">
                        {renderDefaultField(titleColumn, row, index)}
                      </Box>
                    )}
                    {renderMeta(row, index)}
                  </Stack>

                  {selection}
                </Flex>

                {summaryColumns.length > 0 && (
                  <Stack spacing="sm">
                    {summaryColumns.map((column) => (
                      <Flex
                        key={column.key}
                        data-part="mobile-card-summary-row"
                        justify="between"
                        align="start"
                        gap={12}
                      >
                        {/*
                         * Typography owns data-part="root" as part of its
                         * primitive contract. Keep the pattern slot on Box so
                         * the DataTable skin has a stable, engine-neutral hook.
                         */}
                        <Box data-part="mobile-card-summary-label">
                          <Text color="subtle">{column.header}</Text>
                        </Box>
                        <Box data-part="mobile-card-summary-value">
                          {renderDefaultField(column, row, index)}
                        </Box>
                      </Flex>
                    ))}
                  </Stack>
                )}

                {inlineActions && (
                  <Box
                    data-part="mobile-card-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Flex gap={8} wrap="wrap">
                      {inlineActions}
                    </Flex>
                  </Box>
                )}
              </Stack>
            </Card.Body>
          </Card>
        );
      })}
    </Stack>
  );
}
