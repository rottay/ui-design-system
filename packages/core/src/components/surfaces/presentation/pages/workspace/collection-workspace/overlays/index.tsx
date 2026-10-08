import type { Dispatch, RefObject, SetStateAction } from 'react';
import { SurfacePostureSlot } from '../../../../../runtime/postures/scope';
import { ChevronDownIcon } from '@/graphics/icons';
import type { CollectionHeaderQuickAction } from '../../../../../../structures/headers/collection';
import { PatternFilterPanel } from '../../../../../../patterns/forms/filter-panel';
import { Box } from '../../../../../../primitives/layout/box';
import { Stack } from '../../../../../../primitives/layout/stack';
import { Flex } from '../../../../../../primitives/layout/flex';
import { Text } from '../../../../../../primitives/display/typography';
import { Button } from '../../../../../../primitives/inputs/button';
import { Popover } from '../../../../../../primitives/overlay/popover';
import { AdaptiveOverlay } from '../../../../../../patterns/feedback/adaptive-overlay';
import type { ResolvedSurfacePosture } from '../../../../../foundation/contracts/postures';
import type { CollectionWorkspaceProps } from '..';
import type { SurfaceTranslator } from '../foundation';

export interface CollectionOverlaysInput<T extends object> {
  surfacePosture: ResolvedSurfacePosture | undefined;
  title: CollectionWorkspaceProps<T>['title'];
  controls: CollectionWorkspaceProps<T>['controls'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  loading: CollectionWorkspaceProps<T>['loading'];
  tSurfaceOr: SurfaceTranslator;
  hasFilters: boolean;
  filtersExpanded: boolean;
  filterDraftValues: Record<string, unknown>;
  setFilterDraftValues: Dispatch<SetStateAction<Record<string, unknown>>>;
  compactActionsOpen: boolean;
  setCompactActionsOpen: Dispatch<SetStateAction<boolean>>;
  compactPreviewOpen: boolean;
  filterDisclosureId: string;
  filterDropdownAnchorRef: RefObject<HTMLButtonElement | null>;
  compactActionsId: string;
  compactPreviewId: string;
  usesFilterSheet: boolean;
  usesFilterDropdown: boolean;
  usesStickyActionContinuity: boolean;
  actionOverflowItems: CollectionHeaderQuickAction[];
  usesPreviewSheet: boolean;
  usesPreviewAccordion: boolean;
  resolvedCompactPreviewKey: string | null;
  previewItem: T | undefined;
  compactPreviewVisible: boolean;
  handleCompactPreviewOpenChange: (open: boolean) => void;
  draftActiveFilterCount: number;
  closeFilterDisclosure: () => void;
  applyFilterDisclosure: () => void;
  clearFilterDraft: () => void;
  handleFilterDisclosureOpenChange: (open: boolean) => void;
}

export function renderCollectionOverlays<T extends object>(input: CollectionOverlaysInput<T>) {
  const {
    surfacePosture, title, controls, behavior, loading, tSurfaceOr, hasFilters, filtersExpanded, filterDraftValues,
    setFilterDraftValues, compactActionsOpen, setCompactActionsOpen, compactPreviewOpen, filterDisclosureId,
    filterDropdownAnchorRef, compactActionsId, compactPreviewId, usesFilterSheet, usesFilterDropdown,
    usesStickyActionContinuity, actionOverflowItems, usesPreviewSheet, usesPreviewAccordion, resolvedCompactPreviewKey,
    previewItem, compactPreviewVisible, handleCompactPreviewOpenChange, draftActiveFilterCount, closeFilterDisclosure,
    applyFilterDisclosure, clearFilterDraft, handleFilterDisclosureOpenChange,
  } = input;
  const filterDraftPanel = hasFilters ? (
    <PatternFilterPanel
      filters={controls!.filters!}
      values={filterDraftValues}
      onChange={setFilterDraftValues}
      onReset={clearFilterDraft}
      activeCount={draftActiveFilterCount}
      layout="stacked"
      showReset={draftActiveFilterCount > 0}
    />
  ) : null;

  const filterSheet = usesFilterSheet ? (
    <AdaptiveOverlay
      mode="sheet"
      open={filtersExpanded}
      onOpenChange={handleFilterDisclosureOpenChange}
      title={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
      id={filterDisclosureId}
      aria-label={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
      className="ds-collection-workspace__filter-sheet"
      footer={(
        <Flex gap={2} justify="end">
          <Button variant="secondary" onClick={closeFilterDisclosure}>
            {tSurfaceOr('collection_workspace.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" onClick={applyFilterDisclosure}>
            {tSurfaceOr('collection_workspace.apply_filters', 'Apply filters')}
          </Button>
        </Flex>
      )}
    >
      <Box
        className="ds-collection-workspace__filter-sheet-content"
        data-part="filter-sheet-content"
      >
        {filterDraftPanel}
      </Box>
    </AdaptiveOverlay>
  ) : null;

  const filterDropdown = usesFilterDropdown ? (
    <Popover
      anchor={filterDropdownAnchorRef}
      open={usesFilterDropdown && filtersExpanded}
      onOpenChange={handleFilterDisclosureOpenChange}
      id={filterDisclosureId}
      aria-label={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
      role="dialog"
      placement="bottomRight"
      offset={8}
      // The skin lands the workspace measure as the popover minimum on this
      // surface; the maximum follows it, so the disclosure width is fixed.
      maxWidth="var(--ds-popover-min-width)"
      overlayClassName="ds-collection-workspace__filter-dropdown"
      content={
        <Box
          className="ds-collection-workspace__filter-dropdown-content"
          data-part="filter-dropdown-content"
        >
          {filterDraftPanel}
          <Flex
            className="ds-collection-workspace__filter-dropdown-actions"
            data-part="filter-dropdown-actions"
            gap={2}
            justify="end"
          >
            <Button variant="secondary" onClick={closeFilterDisclosure}>
              {tSurfaceOr('collection_workspace.cancel', 'Cancel')}
            </Button>
            <Button variant="primary" onClick={applyFilterDisclosure}>
              {tSurfaceOr('collection_workspace.apply_filters', 'Apply filters')}
            </Button>
          </Flex>
        </Box>
      }
    />
  ) : null;

  const previewDetailsTitle = tSurfaceOr(
    'collection_workspace.preview_details_title',
    '{title} details',
    { title },
  );
  const loadingDetailsLabel = tSurfaceOr(
    'collection_workspace.loading_details',
    'Loading details…',
  );

  const compactPreviewSheet = usesPreviewSheet ? (
    <SurfacePostureSlot name="preview-rail" label={previewDetailsTitle}><AdaptiveOverlay
      mode="sheet"
      open={compactPreviewVisible}
      onOpenChange={handleCompactPreviewOpenChange}
      title={previewDetailsTitle}
      id={compactPreviewId}
      aria-label={previewDetailsTitle}
      className="ds-collection-workspace__preview-sheet"
    >
      <Box
        className="ds-collection-workspace__preview-sheet-content"
        data-part="preview-sheet-content"
        data-preview-key={resolvedCompactPreviewKey ?? undefined}
      >
        {previewItem
          ? behavior!.previewRail!.render!(previewItem, { pane: 'sheet', compact: true })
          : loading && resolvedCompactPreviewKey != null
            ? <Text color="muted">{loadingDetailsLabel}</Text>
            : null}
      </Box>
    </AdaptiveOverlay></SurfacePostureSlot>
  ) : null;

  const compactPreviewAccordion = usesPreviewAccordion && resolvedCompactPreviewKey != null ? (
    <SurfacePostureSlot name="preview-rail" label={previewDetailsTitle} asChild><Box
      role={surfacePosture ? 'region' : undefined}
      aria-label={surfacePosture ? previewDetailsTitle : undefined}
      className="ds-collection-workspace__preview-accordion"
      data-part="preview-accordion"
      data-preview-key={resolvedCompactPreviewKey ?? undefined}
      data-expanded={compactPreviewOpen ? 'true' : 'false'}
    >
      <Button
        id={`${compactPreviewId}-trigger`}
        variant="ghost"
        radius="none"
        block
        aria-expanded={compactPreviewOpen}
        aria-controls={`${compactPreviewId}-region`}
        data-expanded={compactPreviewOpen ? 'true' : 'false'}
        onClick={() => handleCompactPreviewOpenChange(!compactPreviewOpen)}
      >
        <Flex align="center" justify="between" gap={2} className="ds-collection-workspace__preview-accordion-trigger">
          <Text as="span" weight="semibold">{previewDetailsTitle}</Text>
          <ChevronDownIcon
            aria-hidden
            data-part="preview-accordion-icon"
            size={16}
          />
        </Flex>
      </Button>
      {compactPreviewOpen ? (
        <Box
          id={`${compactPreviewId}-region`}
          role="region"
          aria-labelledby={`${compactPreviewId}-trigger`}
          data-part="preview-accordion-content"
        >
          {previewItem
            ? behavior!.previewRail!.render!(previewItem, { pane: 'accordion', compact: true })
            : loading
              ? <Text color="muted">{loadingDetailsLabel}</Text>
              : null}
        </Box>
      ) : null}
    </Box></SurfacePostureSlot>
  ) : null;

  const compactActionsSheet = usesStickyActionContinuity
    && actionOverflowItems.length > 0 ? (
      <AdaptiveOverlay
        mode="sheet"
        open={compactActionsOpen}
        onOpenChange={setCompactActionsOpen}
        title={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
        id={compactActionsId}
        aria-label={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
        className="ds-collection-workspace__compact-actions-sheet"
      >
        <Stack
          spacing="sm"
          className="ds-collection-workspace__compact-actions-list"
          data-part="compact-actions-list"
        >
          {actionOverflowItems.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'default'}
              icon={action.icon}
              block
              data-action-key={action.key}
              className="ds-collection-workspace__compact-action"
              onClick={() => {
                setCompactActionsOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </AdaptiveOverlay>
    ) : null;
  return { filterSheet, filterDropdown, compactPreviewSheet, compactPreviewAccordion, compactActionsSheet };
}
