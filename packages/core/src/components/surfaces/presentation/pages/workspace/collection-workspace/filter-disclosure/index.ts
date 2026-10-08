import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FilterDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { isCollectionFilterValueActive, type useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import type { CollectionWorkspaceProps } from '..';

function resolveDefaultFilterValues(filters: FilterDef[] | undefined): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const filter of filters ?? []) {
    if (filter.defaultValue !== undefined) defaults[filter.key] = filter.defaultValue;
  }
  return defaults;
}

function countActiveFilterValues(values: Record<string, unknown>): number {
  return Object.values(values).filter(isCollectionFilterValueActive).length;
}

export interface CollectionFilterDisclosureInput<T extends object> {
  activeFilters: CollectionWorkspaceProps<T>['activeFilters'];
  controls: CollectionWorkspaceProps<T>['controls'];
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  hasFilters: boolean;
  setFiltersExpanded: Dispatch<SetStateAction<boolean>>;
  filtersExpanded: boolean;
  filterDraftValues: Record<string, unknown>;
  setFilterDraftValues: Dispatch<SetStateAction<Record<string, unknown>>>;
  usesFilterDisclosure: boolean;
}

export function useCollectionFilterDisclosure<T extends object>(input: CollectionFilterDisclosureInput<T>) {
  const {
    activeFilters, controls, workspace, hasFilters, setFiltersExpanded, filtersExpanded, filterDraftValues,
    setFilterDraftValues, usesFilterDisclosure,
  } = input;
  const clearFilters = useCallback(() => {
    activeFilters?.onClearAll?.();
    if (!activeFilters?.onClearAll) {
      workspace.resetFilters();
    }
  }, [activeFilters?.onClearAll, workspace]);
  const activeFilterCount = workspace.activeFilterCount;
  const hasActiveFilters = activeFilterCount > 0;
  const draftActiveFilterCount = useMemo(
    () => countActiveFilterValues(filterDraftValues),
    [filterDraftValues],
  );
  const openFilterDisclosure = useCallback(() => {
    setFilterDraftValues({ ...workspace.filterValues });
    setFiltersExpanded(true);
  }, [workspace.filterValues]);
  const closeFilterDisclosure = useCallback(() => {
    setFilterDraftValues({ ...workspace.filterValues });
    setFiltersExpanded(false);
  }, [workspace.filterValues]);
  const applyFilterDisclosure = useCallback(() => {
    workspace.applyFilters({ ...filterDraftValues });
    setFiltersExpanded(false);
  }, [filterDraftValues, workspace]);
  const clearFilterDraft = useCallback(() => {
    setFilterDraftValues(resolveDefaultFilterValues(controls?.filters));
  }, [controls?.filters]);
  const handleFiltersToggle = useCallback(() => {
    if (!usesFilterDisclosure) {
      setFiltersExpanded((current) => !current);
      return;
    }
    if (filtersExpanded) closeFilterDisclosure();
    else openFilterDisclosure();
  }, [closeFilterDisclosure, filtersExpanded, openFilterDisclosure, usesFilterDisclosure]);
  const handleFilterDisclosureOpenChange = useCallback((open: boolean) => {
    if (open) openFilterDisclosure();
    else closeFilterDisclosure();
  }, [closeFilterDisclosure, openFilterDisclosure]);

  // KEYBOARD OWNERSHIP. The `f` / `c` / `s` shortcuts used to be a document
  // keydown listener this surface installed for itself, and the `c` branch
  // reached the column menu by dispatching an untyped DOM event on `window`.
  // Two workspaces on one page therefore raced for the same three letters
  // through a channel with no owner, no types and no way for a consuming app
  // to opt out. Shortcut ownership belongs to the interaction runtime
  // (WO-FAM-11); it is not re-created here as a second one.

  const previousUsesFilterDisclosureRef = useRef(usesFilterDisclosure);
  useEffect(() => {
    const previouslyUsedDisclosure = previousUsesFilterDisclosureRef.current;
    previousUsesFilterDisclosureRef.current = usesFilterDisclosure;

    if (!hasFilters) {
      setFiltersExpanded(false);
      return;
    }

    if (!previouslyUsedDisclosure && usesFilterDisclosure && filtersExpanded) {
      setFilterDraftValues({ ...workspace.filterValues });
      return;
    }

    if (previouslyUsedDisclosure && !usesFilterDisclosure) {
      setFiltersExpanded(false);
    }
  }, [filtersExpanded, hasFilters, usesFilterDisclosure, workspace.filterValues]);
  return {
    clearFilters, activeFilterCount, hasActiveFilters, draftActiveFilterCount, closeFilterDisclosure,
    applyFilterDisclosure, clearFilterDraft, handleFiltersToggle, handleFilterDisclosureOpenChange,
  };
}
