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
import { stampDataPart } from "../../../../../../infrastructure/runtime/dom/foundation/data-part";
import { useBreakpoints } from "@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state";
import { useMediaQuery } from "@/infrastructure/runtime/responsive/runtime/media-query";
import { Box, Button, Flex, Stack, Text } from "../../../../../primitives";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "../../../../../../graphics/icons";
import { PatternFilterPanel } from "../../../../forms/filter-panel";
import type {
  ColumnDef,
  ResponsiveColumnMode,
} from "../../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps, DataTableRecipe } from "../../contracts";
import { useRecipeProfileDefaults } from "@/infrastructure/runtime/foundation/recipes/profiles";
import { resolveRowKey } from "../../runtime/row-resolution";
import { DataTableMobileCards } from "./mobile-cards";

/**
 * Resolves the effective responsive mode for a column at the current device class.
 * Returns `'visible'` when the column has no `responsive` config (backward-compatible).
 */
function getColumnResponsiveMode<T>(
  column: ColumnDef<T>,
  deviceKey: "phone" | "tablet" | "desktop"
): ResponsiveColumnMode {
  return column.responsive?.[deviceKey] ?? "visible";
}

/**
 * Maps the `useBreakpoints()` result to a device class key matching the
 * `ColumnResponsiveConfig` interface.
 */
function resolveDeviceKey(bp: {
  isMobile: boolean;
  isTablet: boolean;
}): "phone" | "tablet" | "desktop" {
  if (bp.isMobile) return "phone";
  if (bp.isTablet) return "tablet";
  return "desktop";
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
  const setBulkRootRef = useCallback((node: HTMLDivElement | null) => {
    if (node) stampDataPart(node, "mobile-bulk-actions");
  }, []);

  if (!bulkActions || bulkActions.length === 0 || selectedKeys.length === 0) {
    return null;
  }

  const selectedRows = data.filter((row, index) =>
    selectedKeys.includes(resolveRowKey(row, rowKey, index))
  );

  return (
    <Flex
      ref={setBulkRootRef}
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
    mobileBreakpoint = 768,
    autoMobileCards = true,
    actions,
    onRowClick,
    filters,
    filterValues = {},
    onFilterChange,
    pagination,
  } = props;
  const isMobile = useMediaQuery(
    `(max-width: ${Math.max(mobileBreakpoint - 1, 0)}px)`
  );
  const breakpoints = useBreakpoints();
  const deviceKey = resolveDeviceKey(breakpoints);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    []
  );
  const responsiveRootRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const node = responsiveRootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (typeof width === "number") setContainerWidth(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

  const responsiveDeviceKey =
    containerWidth !== null && containerWidth < mobileBreakpoint
      ? "phone"
      : deviceKey;
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
  const shouldUseMobileCards =
    autoMobileCards &&
    (containerWidth === null ? isMobile : containerWidth < mobileBreakpoint) &&
    visibleColumns.length > 0;

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

  if (shouldUseMobileCards) {
    return (
      <div
        ref={responsiveRootRef}
        data-part="responsive-root"
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
                <Stack spacing="xs" align="center">
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
              <Text color="subtle">{messages?.loadingLabel ?? "Loading…"}</Text>
            </Box>
          ) : data.length === 0 ? (
            <Box
              data-part="mobile-state-panel"
              data-state="empty"
              className="ds-pattern-data-table ds-data-table--mobile"
              role="status"
            >
              {emptyState ?? (
                <Stack spacing="xs" align="center">
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
      className="ds-data-table-responsive-root"
    >
      <DataTableEngine
        {...props}
        columns={visibleColumns}
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
