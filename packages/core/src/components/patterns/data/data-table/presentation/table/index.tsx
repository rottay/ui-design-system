"use client";

import { densityScopeAttributes } from "@/infrastructure/runtime/foundation/density";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createEngineComponent } from "../../../../../../infrastructure/runtime/engines/presentation/component-factory";
import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import {
  DATA_TABLE_ADAPTATION_BASE,
  DATA_TABLE_ADAPT_DEFAULTS,
  type ResolvedDataTableAdaptation,
  type ViewportPosture,
} from "@/foundation/contracts/kernel/adaptation";
import { useAdaptation } from "@/infrastructure/runtime/adaptation";
import { useResponsive } from "@/infrastructure/runtime/responsive";
import { AnatomySkeleton } from "@/components/primitives/feedback/skeleton";
import { Box } from "@/components/primitives/layout/box";
import { Button } from "@/components/primitives/inputs/button";
import { Card } from "@/components/primitives/display/card";
import { Flex } from "@/components/primitives/layout/flex";
import { Stack } from "@/components/primitives/layout/stack";
import { Text } from "@/components/primitives/display/typography";
import { VisuallyHidden } from "@/components/primitives/foundation/visually-hidden";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Table2Icon,
} from "../../../../../../graphics/icons";
import { PatternFilterPanel } from "../../../../facade";
import type {
  ColumnDef,
  ResponsiveColumnMode,
} from "../../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps, DataTableRecipe } from "../../contracts";
import { useRecipeProfileDefaults } from "@/infrastructure/runtime/foundation/recipes/profiles";
import {
  adaptTableColumns,
  declaresColumnAdaptation,
  projectRecordColumns,
} from "../../runtime/adaptation";
import { resolveRowKey } from "../../runtime/row-resolution";
import { DataTableMobileCards } from "./mobile-cards";
import { placeRowActions } from "./mobile-cards/row-actions";

/**
 * Resolves the effective responsive mode for a column at the current device class.
 * Returns `'visible'` when the column has no `responsive` config (backward-compatible).
 */
function getColumnResponsiveMode<T>(
  column: ColumnDef<T>,
  deviceKey: ViewportPosture
): ResponsiveColumnMode {
  return column.responsive?.[deviceKey] ?? "visible";
}

const DataTableEngine = createEngineComponent<DataTablePatternProps<any>>(
  "PatternDataTable",
  {
    classic: () => import("../../engines/classic"),
    modern: () => import("../../engines/modern"),
    rustic: () => import("../../engines/rustic"),
  }
);

function MobileBulkActions<T extends object>({
  selectedKeys,
  data,
  rowKey,
  bulkActions,
  messages,
}: {
  selectedKeys: string[];
  data: T[];
  rowKey?: keyof T | ((row: T) => string);
  bulkActions?: DataTablePatternProps<T>["bulkActions"];
  messages?: DataTablePatternProps<T>["messages"];
}): React.ReactElement | null {
  if (!bulkActions || bulkActions.length === 0 || selectedKeys.length === 0) {
    return null;
  }

  const selectedRows = data.filter((row, index) =>
    selectedKeys.includes(resolveRowKey(row, rowKey, index))
  );

  return (
    <Flex
      data-part="mobile-bulk-actions"
      align="center"
      justify="between"
      gap={12}
      wrap="wrap"
      className="ds-pattern-data-table ds-data-table--mobile"
    >
      <Text color="subtle" data-part="mobile-bulk-count">
        {messages?.selectedCount?.(selectedKeys.length) ??
          `${selectedKeys.length} selected`}
      </Text>
      <Flex gap={8} wrap="wrap">
        {bulkActions.map((action) => (
          <Button
            key={action.key}
            variant={
              action.variant === "danger"
                ? "danger"
                : action.variant === "primary"
                ? "primary"
                : "ghost"
            }
            size="sm"
            disabled={action.disabled}
            icon={action.icon}
            onClick={() => action.onExecute(selectedRows)}
          >
            {action.label}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}

function MobilePagination<T extends object>({
  pagination,
  messages,
}: {
  pagination?: DataTablePatternProps<T>["pagination"];
  messages?: DataTablePatternProps<T>["messages"];
}): React.ReactElement | null {
  if (!pagination) return null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const start =
    pagination.total === 0
      ? 0
      : (pagination.current - 1) * pagination.pageSize + 1;
  const end = Math.min(
    pagination.current * pagination.pageSize,
    pagination.total
  );

  return (
    <Flex
      data-part="mobile-pagination"
      align="center"
      justify="between"
      gap={12}
    >
      <Text color="subtle" data-part="mobile-pagination-range">
        {messages?.paginationRange?.(start, end, pagination.total) ??
          `${start} – ${end} of ${pagination.total.toLocaleString()}`}
      </Text>
      <Flex align="center" gap={6} data-part="mobile-pagination-actions">
        <Button
          variant="ghost"
          size="sm"
          shape="circle"
          disabled={pagination.current <= 1}
          icon={<ArrowLeftIcon size={16} aria-hidden />}
          aria-label={messages?.previousPage ?? "Previous page"}
          onClick={() =>
            pagination.onChange(pagination.current - 1, pagination.pageSize)
          }
        />
        <Text data-part="mobile-pagination-page">
          {pagination.current} / {totalPages}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          shape="circle"
          disabled={pagination.current >= totalPages}
          icon={<ArrowRightIcon size={16} aria-hidden />}
          aria-label={messages?.nextPage ?? "Next page"}
          onClick={() =>
            pagination.onChange(pagination.current + 1, pagination.pageSize)
          }
        />
      </Flex>
    </Flex>
  );
}

export function PatternDataTable<T extends object>(
  props: DataTablePatternProps<T>
): React.ReactElement {
  const {
    data,
    columns,
    rowKey,
    selectedKeys: controlledSelectedKeys,
    onSelectionChange,
    selectable = false,
    header,
    toolbar,
    footer,
    bulkActions,
    emptyState,
    error = false,
    errorState,
    messages,
    loading = false,
    mobileCard,
    mobileBreakpoint,
    autoMobileCards = true,
    actions,
    onRowClick,
    filters,
    filterValues = {},
    onFilterChange,
    pagination,
    adapt,
  } = props;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    []
  );
  const responsiveRootRef = useRef<HTMLDivElement | null>(null);

  // The deprecated pixel threshold keeps its own measurement, and only while
  // it is set; everything else adapts on the shared postures.
  const legacyThreshold = mobileBreakpoint;
  const { activeBreakpoint } = useResponsive();
  const [legacyWidth, setLegacyWidth] = useState<number | null>(null);
  useEffect(() => {
    const node = responsiveRootRef.current;
    if (legacyThreshold === undefined) return undefined;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (typeof width === "number") setLegacyWidth(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [legacyThreshold]);
  const legacyCompact =
    legacyThreshold !== undefined &&
    (legacyWidth === null
      ? RESPONSIVE_BREAKPOINTS[activeBreakpoint] < legacyThreshold
      : legacyWidth < legacyThreshold);

  const adaptationBase = useMemo<ResolvedDataTableAdaptation>(
    () =>
      legacyThreshold !== undefined && autoMobileCards && legacyCompact
        ? { ...DATA_TABLE_ADAPTATION_BASE, presentation: "cards" }
        : DATA_TABLE_ADAPTATION_BASE,
    [autoMobileCards, legacyCompact, legacyThreshold]
  );
  const {
    posture,
    adaptation,
    postureAttribute,
  } = useAdaptation<ResolvedDataTableAdaptation>(adapt, {
    base: adaptationBase,
    defaults:
      autoMobileCards && legacyThreshold === undefined
        ? DATA_TABLE_ADAPT_DEFAULTS
        : undefined,
    containerRef: responsiveRootRef,
  });
  const responsiveDeviceKey: ViewportPosture =
    legacyThreshold !== undefined
      ? legacyCompact
        ? "phone"
        : posture.viewport
      : posture.container === "compact"
      ? "phone"
      : posture.viewport;

  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const handleSelectionChange = useCallback(
    (keys: string[], rows: T[]) => {
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(keys);
      }
      onSelectionChange?.(keys, rows);
    },
    [controlledSelectedKeys, onSelectionChange]
  );
  const getRowKey = useCallback(
    (row: T, index: number) => resolveRowKey(row, rowKey, index),
    [rowKey]
  );

  const toggleSelection = useCallback(
    (key: string) => {
      const nextKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((selectedKey) => selectedKey !== key)
        : [...selectedKeys, key];
      const selectedRows = data.filter((candidate, index) =>
        nextKeys.includes(getRowKey(candidate, index))
      );

      handleSelectionChange(nextKeys, selectedRows);
    },
    [data, getRowKey, handleSelectionChange, selectedKeys]
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter((column) => {
        // Respect the legacy `visible` prop first
        if (column.visible === false) return false;
        // Filter out columns explicitly hidden at the current breakpoint
        const mode = getColumnResponsiveMode(column, responsiveDeviceKey);
        return mode !== "hidden";
      }),
    [columns, responsiveDeviceKey]
  );
  // Keyed by value: an inline `adapt` literal must not re-create the column
  // model the engine receives on every render.
  const columnAdaptationKey = JSON.stringify(adaptation.columns);
  const columnAdaptation = useMemo(
    () => adaptation.columns,
    [columnAdaptationKey]
  );
  const presentation =
    visibleColumns.length > 0 ? adaptation.presentation : "table";
  const rowActionsLabel = messages?.rowActions ?? "Row actions";
  const tableActions = useMemo(
    () =>
      actions && adaptation.rowActions !== "inline"
        ? (row: T, index: number) =>
            placeRowActions("menu", actions(row, index), rowActionsLabel)
        : actions,
    [actions, adaptation.rowActions, rowActionsLabel]
  );
  const tableColumns = useMemo(
    () => adaptTableColumns(visibleColumns, columnAdaptation),
    [visibleColumns, columnAdaptation]
  );
  const recordProjection = useMemo(
    () =>
      declaresColumnAdaptation(columnAdaptation)
        ? projectRecordColumns(visibleColumns, columnAdaptation)
        : undefined,
    [visibleColumns, columnAdaptation]
  );

  // Density is a declarative anatomy state. Skins resolve its spacing tokens;
  // presentation code must not recreate stable visual values inline.
  const recipeProfileDefaults = useRecipeProfileDefaults("dataTable");
  const resolvedDensity =
    props.density ??
    (typeof recipeProfileDefaults.density === "string"
      ? (recipeProfileDefaults.density as DataTablePatternProps<T>["density"])
      : undefined) ??
    (props.compact ? "compact" : "comfortable");
  const resolvedRecipe =
    props.recipe ??
    (typeof recipeProfileDefaults.recipe === "string"
      ? (recipeProfileDefaults.recipe as DataTableRecipe)
      : undefined) ??
    (props.bordered ? "grid" : props.striped ? "zebra" : "minimal");

  const activeFilterCount = useMemo(
    () =>
      Object.values(filterValues).filter((value) => {
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      }).length,
    [filterValues]
  );

  const resetFilterValues = useMemo(
    () =>
      Object.fromEntries(
        (filters ?? [])
          .filter((filter) => filter.defaultValue !== undefined)
          .map((filter) => [filter.key, filter.defaultValue])
      ),
    [filters]
  );

  const filterPanel =
    filters && filters.length > 0 && onFilterChange ? (
      <div data-part="filters">
        <PatternFilterPanel
          engine={props.engine}
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onReset={() => onFilterChange(resetFilterValues)}
          layout="inline"
          collapsible
          title={messages?.filtersTitle ?? "Filters"}
          showReset={activeFilterCount > 0}
          activeCount={activeFilterCount}
        />
      </div>
    ) : null;

  if (presentation !== "table") {
    return (
      <div
        ref={responsiveRootRef}
        data-part="responsive-root"
        data-posture={postureAttribute}
        data-presentation={presentation}
        data-row-actions={adaptation.rowActions}
        className="ds-data-table-responsive-root"
      >
        <Stack
          spacing="md"
          fullWidth
          data-part="mobile-root"
          {...densityScopeAttributes(resolvedDensity)}
          data-recipe={resolvedRecipe}
          data-error={error ? "true" : "false"}
          className={[
            "ds-pattern-data-table ds-data-table--mobile",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={props.style}
        >
          {header}
          {toolbar && <div data-part="mobile-toolbar">{toolbar}</div>}
          {filterPanel}
          <MobileBulkActions
            selectedKeys={selectedKeys}
            data={data}
            rowKey={rowKey}
            bulkActions={bulkActions}
            messages={messages}
          />

          {error ? (
            <Box
              data-part="mobile-state-panel"
              data-state="error"
              className="ds-pattern-data-table ds-data-table--mobile"
              role="alert"
            >
              {errorState ?? (
                <Stack spacing="sm" align="center">
                  <Box data-part="state-icon-tile" aria-hidden="true">
                    <AlertTriangleIcon size={22} strokeWidth={1.5} />
                  </Box>
                  <Text weight="semibold">
                    {messages?.errorTitle ?? "Unable to load data"}
                  </Text>
                  <Text color="subtle">
                    {messages?.errorDescription ??
                      "Try again or adjust your filters."}
                  </Text>
                </Stack>
              )}
            </Box>
          ) : loading && data.length === 0 ? (
            <Box
              data-part="mobile-state-panel"
              data-state="loading"
              className="ds-pattern-data-table ds-data-table--mobile"
              role="status"
              aria-label={messages?.loadingLabel ?? "Loading"}
            >
              {/* Card-projection loading state: two card anatomies mirror the
                  loaded list's exact footprint, and the shared renderer draws
                  one bone per stamped part so it cannot drift from the cards.
                  The accessible name stays on the host. */}
              <VisuallyHidden>
                {messages?.loadingLabel ?? "Loading…"}
              </VisuallyHidden>
              {[0, 1].map((cardIndex) => (
                <AnatomySkeleton key={cardIndex} busy={false}>
                  <Card variant="outlined">
                    <Card.Body>
                      <Stack spacing="md">
                        <Box data-part="mobile-card-title">{"\u00a0"}</Box>
                        <Flex
                          data-part="mobile-card-summary-row"
                          justify="between"
                          align="start"
                          gap={12}
                        >
                          <Box data-part="mobile-card-summary-label">
                            {"\u00a0"}
                          </Box>
                          <Box data-part="mobile-card-summary-value">
                            {"\u00a0"}
                          </Box>
                        </Flex>
                        <Flex
                          data-part="mobile-card-summary-row"
                          justify="between"
                          align="start"
                          gap={12}
                        >
                          <Box data-part="mobile-card-summary-label">
                            {"\u00a0"}
                          </Box>
                          <Box data-part="mobile-card-summary-value">
                            {"\u00a0"}
                          </Box>
                        </Flex>
                      </Stack>
                    </Card.Body>
                  </Card>
                </AnatomySkeleton>
              ))}
            </Box>
          ) : data.length === 0 ? (
            <Box
              data-part="mobile-state-panel"
              data-state="empty"
              className="ds-pattern-data-table ds-data-table--mobile"
              role="status"
            >
              {emptyState ?? (
                <Stack spacing="sm" align="center">
                  <Box data-part="state-icon-tile" aria-hidden="true">
                    <Table2Icon size={22} strokeWidth={1.5} />
                  </Box>
                  <Text weight="semibold">
                    {messages?.emptyTitle ?? "No data"}
                  </Text>
                  <Text color="subtle">
                    {messages?.emptyDescription ??
                      "There are no records to display."}
                  </Text>
                </Stack>
              )}
            </Box>
          ) : (
            <DataTableMobileCards
              data={data}
              columns={visibleColumns}
              deviceKey={responsiveDeviceKey}
              getRowKey={getRowKey}
              selectedKeys={selectedKeys}
              selectable={selectable}
              onToggleSelection={
                selectable ? (key) => toggleSelection(key) : undefined
              }
              onRowClick={onRowClick}
              actions={actions}
              mobileCard={mobileCard}
              messages={messages}
              projection={recordProjection}
              presentation={presentation}
              rowActions={adaptation.rowActions}
            />
          )}

          {!error && !loading && data.length > 0 && (
            <MobilePagination<T>
              pagination={pagination}
              messages={messages}
            />
          )}
          {footer}
        </Stack>
      </div>
    );
  }

  return (
    <div
      ref={responsiveRootRef}
      data-part="responsive-root"
      data-posture={postureAttribute}
      data-presentation="table"
      data-row-actions={adaptation.rowActions === "inline" ? "inline" : "menu"}
      className="ds-data-table-responsive-root"
    >
      <DataTableEngine
        {...props}
        columns={tableColumns}
        actions={tableActions}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        density={resolvedDensity}
        recipe={resolvedRecipe}
        toolbar={
          toolbar || filterPanel ? (
            <Stack spacing="sm" data-part="toolbar-stack">
              {toolbar}
              {filterPanel}
            </Stack>
          ) : undefined
        }
        style={props.style}
      />
    </div>
  );
}
