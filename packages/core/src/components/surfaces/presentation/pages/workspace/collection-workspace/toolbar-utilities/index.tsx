import type React from 'react';
import type { ComponentProps, ReactNode, RefObject } from 'react';
import { CheckSquareIcon, ChevronDownIcon } from '@/graphics/icons';
import { ActionFilterIcon } from '@/graphics/icons/semantic/generated/roles/action-filter';
import { DataExportIcon } from '@/graphics/icons/semantic/generated/roles/data-export';
import type { PaginationConfig } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';
import type { CollectionHeaderProps } from '../../../../../../structures/headers/collection';
import { useSurfaceTranslations } from '../../../../../../structures/foundation/chrome/runtime/i18n';
import { useFormatter } from '@/infrastructure/runtime/i18n';
import type { UseFormatterResult } from '@/infrastructure/runtime/i18n';
import { ColumnMenu } from '../../../../../../structures/workspace/column-menu';
import { Box } from '../../../../../../primitives/layout/box';
import { Flex } from '../../../../../../primitives/layout/flex';
import { Text } from '../../../../../../primitives/display/typography';
import { Button } from '../../../../../../primitives/inputs/button';
import { Select } from '../../../../../../primitives/inputs/select';
import type { PrimaryActionPlacement } from '../../../../../foundation/contracts/postures';
import type { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import type { CollectionWorkspaceProps } from '..';
import type { SurfaceTranslator } from '../foundation';

// ---------------------------------------------------------------------------
// Compact utility button (inline in controls row)
// ---------------------------------------------------------------------------

function UtilityIcon({
  icon,
  label,
  active,
  onClick,
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  buttonRef,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: React.AriaAttributes['aria-haspopup'];
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="sm"
      icon={icon}
      className="ds-collection-workspace__utility-icon-toggle"
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
    />
  );
}

function getPageSizeOptions(pagination?: PaginationConfig | false): number[] {
  if (!pagination) return [];

  const options = pagination.pageSizeOptions?.length
    ? pagination.pageSizeOptions
    : [pagination.pageSize];

  return [...new Set(options.concat(pagination.pageSize))]
    .filter((option) => Number.isFinite(option) && option > 0)
    .sort((left, right) => left - right);
}

function formatPaginationRange(
  t: SurfaceTranslator,
  format: UseFormatterResult,
  pagination?: PaginationConfig | false,
  visibleCount?: number,
): string {
  if (!pagination) {
    return t('collection_workspace.range_results', '{count} results', { count: format.number(visibleCount ?? 0) });
  }

  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  if (pagination.loadMode === 'incremental') {
    const visible = Math.min(Math.max(0, visibleCount ?? 0), total);
    return total === 0
      ? t('collection_workspace.results_zero', '0 results')
      : t('collection_workspace.range_from_start_of', '1-{visible} of {total}', {
          visible: format.number(visible),
          total: format.number(total),
        });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);

  if (total === 0) return t('collection_workspace.results_zero', '0 results');

  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return t('collection_workspace.range_of', '{start}-{end} of {total}', {
    start: format.number(start),
    end: format.number(end),
    total: format.number(total),
  });
}

function PageSizeControl({
  pagination,
  visibleCount,
  compact = false,
}: {
  pagination?: PaginationConfig | false;
  visibleCount: number;
  compact?: boolean;
}) {
  const { tSurfaceOr } = useSurfaceTranslations();
  const format = useFormatter();
  const options = getPageSizeOptions(pagination);
  const rangeLabel = formatPaginationRange(tSurfaceOr, format, pagination, visibleCount);
  const isIncremental = !!pagination && pagination.loadMode === 'incremental';
  const unitLabel = isIncremental
    ? tSurfaceOr('collection_workspace.cards_unit', 'Cards')
    : tSurfaceOr('collection_workspace.rows_unit', 'Rows');
  const suffixLabel = isIncremental
    ? tSurfaceOr('collection_workspace.per_batch', '/ batch')
    : tSurfaceOr('collection_workspace.per_page', '/ page');
  const controlLabel = isIncremental
    ? tSurfaceOr('collection_workspace.cards_per_batch', 'Cards per batch')
    : tSurfaceOr('collection_workspace.rows_per_page', 'Rows per page');

  if (!pagination || options.length <= 1) {
    return (
      <Text
        className="ds-collection-page-size-control__summary"
        size="xs"
      >
        {rangeLabel}
      </Text>
    );
  }

  return (
    <>
      <Box
        as="label"
        className="ds-collection-page-size-control"
        data-part="page-size-control"
        data-load-mode={isIncremental ? 'incremental' : 'paged'}
        data-compact={compact ? 'true' : 'false'}
        title={controlLabel}
      >
        <Text
          className="ds-collection-page-size-control__range"
          as="span"
          size="xs"
        >
          {rangeLabel}
        </Text>
        <Box
          className="ds-collection-page-size-control__picker"
          data-part="page-size-picker"
        >
          {!compact && (
            <Text
              className="ds-collection-page-size-control__unit"
              as="span"
              size="xs"
            >
              {unitLabel}
            </Text>
          )}
          <Text
            as="span"
            className="ds-collection-page-size-control__value"
            size="xs"
          >
            {pagination.pageSize}
          </Text>
          {!compact && (
            <Text
              className="ds-collection-page-size-control__suffix"
              as="span"
              size="xs"
            >
              {suffixLabel}
            </Text>
          )}
          {/* An invisible overlay on the pill: only the Modern native trigger keeps the OS popup and the
              accessible name under every engine, so the overlay pins it; the pill paints the presentation. */}
          <Select
            engine="modern"
            chrome="none"
            size="sm"
            placeholder=""
            aria-label={controlLabel}
            className="ds-collection-page-size-control__select"
            options={options.map((option) => ({
              value: String(option),
              label: tSurfaceOr('collection_workspace.page_size_option', '{count} / page', { count: option }),
            }))}
            value={String(pagination.pageSize)}
            onChange={(next) => pagination.onChange(1, Number(next))}
          />
          <ChevronDownIcon
            aria-hidden
            className="ds-collection-page-size-control__chevron"
            data-part="page-size-chevron"
            size={13}
            strokeWidth={2.3}
          />
        </Box>
      </Box>
    </>
  );
}

export interface CollectionToolbarUtilitiesInput<T extends object> {
  primaryAction: CollectionWorkspaceProps<T>['primaryAction'];
  controls: CollectionWorkspaceProps<T>['controls'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  data: CollectionWorkspaceProps<T>['data'];
  tSurfaceOr: SurfaceTranslator;
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  postureIsPhone: boolean;
  primaryPlacement: PrimaryActionPlacement | undefined;
  primaryActionVisible: boolean;
  density: DensityPosture;
  scopedPrimaryAction: ReactNode;
  resolvedHeader: CollectionHeaderProps | undefined;
  selectionEnabled: boolean;
  canToggleSelectionMode: boolean;
  hasFilters: boolean;
  filtersExpanded: boolean;
  filterDisclosureId: string;
  filterDropdownAnchorRef: RefObject<HTMLButtonElement | null>;
  usesFilterDisclosure: boolean;
  usesStickyActionContinuity: boolean;
  handleExport: (() => void) | undefined;
  defaultColumnKeys: string[];
  hasColumnMenu: boolean;
  columnMenuColumns: ComponentProps<typeof ColumnMenu>['columns'];
  columnMenuActions: ComponentProps<typeof ColumnMenu>['actions'];
  handleColumnsApply: (visibleKeys: string[], orderedKeys: string[]) => void;
  handleColumnsReset: () => void;
  handleVisibleActionsApply: (visibleKeys: string[]) => void;
  handleSelectionModeToggle: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  handleFiltersToggle: () => void;
  showInlineResultCount: boolean;
}

export function renderToolbarUtilities<T extends object>(input: CollectionToolbarUtilitiesInput<T>) {
  const {
    primaryAction, controls, behavior, data, tSurfaceOr, workspace, postureIsPhone, primaryPlacement,
    primaryActionVisible, density, scopedPrimaryAction, resolvedHeader, selectionEnabled, canToggleSelectionMode,
    hasFilters, filtersExpanded, filterDisclosureId, filterDropdownAnchorRef, usesFilterDisclosure,
    usesStickyActionContinuity, handleExport, defaultColumnKeys, hasColumnMenu, columnMenuColumns, columnMenuActions,
    handleColumnsApply, handleColumnsReset, handleVisibleActionsApply, handleSelectionModeToggle, activeFilterCount,
    hasActiveFilters, handleFiltersToggle, showInlineResultCount,
  } = input;
  return (
          <Flex
            className="ds-collection-workspace__utilities"
            data-part="utilities"
            align="center"
            gap={4}
            style={{
              flexShrink: 0,
              ...(postureIsPhone
                ? {
                    width: '100%',
                    justifyContent: 'flex-end',
                  }
                : null),
            }}
          >
            {canToggleSelectionMode && (
              <UtilityIcon
                icon={<CheckSquareIcon size={15} />}
                label={
                  selectionEnabled
                    ? tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                        count: behavior?.selection?.selectedKeys?.length ?? workspace.selectedKeys.length,
                      })
                    : behavior?.selection?.toggleLabel
                      ?? tSurfaceOr('collection_workspace.select_rows', 'Select rows')
                }
                active={selectionEnabled}
                onClick={handleSelectionModeToggle}
              />
            )}

            {controls?.density?.enabled && controls.density.onChange && (
              <UtilityIcon
                icon={
                  <Box as="span" className="ds-collection-workspace__density-glyph" data-part="density-glyph">
                    {density === 'compact' ? 'S' : density === 'spacious' ? 'L' : 'M'}
                  </Box>
                }
                label={tSurfaceOr('collection_workspace.density_label', 'Density: {mode}', { mode: density })}
                onClick={() => {
                  const next = density === 'compact' ? 'comfortable' : density === 'comfortable' ? 'spacious' : 'compact';
                  controls.density!.onChange!(next);
                }}
              />
            )}

            {hasColumnMenu && (
              <ColumnMenu
                columns={columnMenuColumns}
                visibleColumns={controls?.columnSettings?.visibleColumns ?? defaultColumnKeys}
                columnOrder={controls?.columnSettings?.columnOrder ?? defaultColumnKeys}
                onColumnsChange={handleColumnsApply}
                actions={columnMenuActions}
                visibleActions={controls?.columnSettings?.visibleActionKeys}
                onVisibleActionsChange={handleVisibleActionsApply}
                pinnedColumns={
                  controls?.columnSettings?.pinnedColumns
                    ? {
                        left: controls.columnSettings.pinnedColumns.left ?? [],
                        right: controls.columnSettings.pinnedColumns.right ?? [],
                      }
                    : undefined
                }
                onPinChange={
                  controls?.columnSettings?.onPinnedColumnsChange
                    ? (pinned) => controls.columnSettings!.onPinnedColumnsChange!(pinned)
                    : undefined
                }
                columnWidths={controls?.columnSettings?.columnWidths}
                onColumnResize={controls?.columnSettings?.onColumnResize}
                groups={controls?.columnSettings?.groups}
                onReset={handleColumnsReset}
                compact
              />
            )}

            {hasFilters && (
              <UtilityIcon
                icon={<ActionFilterIcon decorative size={15} />}
                label={hasActiveFilters
                  ? tSurfaceOr('collection_workspace.filters_title_count', 'Advanced filters ({count})', { count: activeFilterCount })
                  : tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
                active={filtersExpanded || hasActiveFilters}
                onClick={handleFiltersToggle}
                ariaControls={usesFilterDisclosure ? filterDisclosureId : undefined}
                ariaExpanded={filtersExpanded}
                ariaHasPopup={usesFilterDisclosure ? 'dialog' : undefined}
                buttonRef={filterDropdownAnchorRef}
              />
            )}

            {handleExport && (
              <UtilityIcon
                icon={<DataExportIcon decorative size={15} />}
                label={tSurfaceOr('collection_workspace.export_aria', 'Export')}
                onClick={handleExport}
              />
            )}

            {showInlineResultCount && (
              <PageSizeControl
                pagination={behavior?.pagination}
                visibleCount={data.length}
                compact={postureIsPhone}
              />
            )}

            {primaryPlacement === 'app-bar' && scopedPrimaryAction}
            {!primaryPlacement && primaryActionVisible && !resolvedHeader && !usesStickyActionContinuity && primaryAction && (
              <Button
                variant="primary"
                size="sm"
                icon={primaryAction.icon}
                disabled={primaryAction.disabled}
                pending={primaryAction.pending ?? primaryAction.loading}
                pendingLabel={primaryAction.pendingLabel}
                aria-label={primaryAction.ariaLabel}
                onClick={primaryAction.onClick}
                className="ds-collection-workspace__toolbar-primary-action"
              >
                {primaryAction.label}
              </Button>
            )}
          </Flex>
  );
}
