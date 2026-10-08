import { useCallback } from 'react';
import type { SurfacePosture } from '../../../../../foundation/contracts/adaptive';
import type { CollectionWorkspaceProps } from '..';
import { resolveKey, type SurfaceTranslator } from '../foundation';

export interface CollectionRowActivationInput<T extends object> {
  title: CollectionWorkspaceProps<T>['title'];
  rowKey: CollectionWorkspaceProps<T>['rowKey'];
  onRowClick: CollectionWorkspaceProps<T>['onRowClick'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  tSurfaceOr: SurfaceTranslator;
  posture: SurfacePosture;
  focusEnabled: boolean;
  focusedKey: string | null;
  usesCompactPreview: boolean;
  handleCompactPreviewOpenChange: (open: boolean) => void;
  openCompactPreviewForKey: (key: string) => void;
}

export function useCollectionRowActivation<T extends object>(input: CollectionRowActivationInput<T>) {
  const {
    title, rowKey, onRowClick, behavior, tSurfaceOr, posture, focusEnabled, focusedKey, usesCompactPreview,
    handleCompactPreviewOpenChange, openCompactPreviewForKey,
  } = input;
  const handleRowClick = useCallback(
    (item: T, index: number) => {
      const mobileNav = behavior?.previewRail?.mobileNavigation;
      const usesDeclaredRoute = posture.pane === 'route';
      const usesLegacyHiddenRoute = posture.pane === 'hidden' && mobileNav?.enabled;
      const usesEnabledNavigation = mobileNav?.enabled === true;

      // `route` is the named navigation posture. Keep hidden + mobileNavigation
      // as a compatibility alias until apps migrate their adaptive configs.
      //
      // NAVIGATION OWNERSHIP: `href` is rendered as a real record link by
      // `resolveRowHref`, so the browser performs the navigation and the row
      // keeps middle-click, copy-link and open-in-new-tab. The surface does not
      // also assign the document location: a component that navigates by side
      // effect takes a decision the app never handed it and defeats every
      // client router the DS is meant to be agnostic of.
      if (usesDeclaredRoute || usesLegacyHiddenRoute) {
        if (usesEnabledNavigation && mobileNav?.href) {
          return;
        }
        if (usesEnabledNavigation && mobileNav?.onClick) {
          mobileNav.onClick(item);
          return;
        }

        if (usesDeclaredRoute) {
          (onRowClick ?? behavior?.onRowClick)?.(item, index);
          return;
        }
      }

      const key = resolveKey(item, rowKey);
      if (focusEnabled && behavior?.focus?.onFocusChange) {
        const nextKey = key === focusedKey ? null : key;
        behavior.focus.onFocusChange(nextKey);
        if (usesCompactPreview) {
          if (nextKey) openCompactPreviewForKey(nextKey);
          else handleCompactPreviewOpenChange(false);
        }
      } else if (usesCompactPreview) {
        openCompactPreviewForKey(key);
      }
      (onRowClick ?? behavior?.onRowClick)?.(item, index);
    },
    [
      behavior?.focus,
      behavior?.onRowClick,
      behavior?.previewRail?.mobileNavigation,
      focusEnabled,
      focusedKey,
      handleCompactPreviewOpenChange,
      onRowClick,
      openCompactPreviewForKey,
      posture.pane,
      rowKey,
      usesCompactPreview,
    ],
  );

  const resolveRowHref = useCallback((item: T) => {
    const mobileNav = behavior?.previewRail?.mobileNavigation;
    const usesDeclaredRoute = posture.pane === 'route';
    const usesLegacyHiddenRoute = posture.pane === 'hidden' && mobileNav?.enabled;
    if (
      (!usesDeclaredRoute && !usesLegacyHiddenRoute)
      || mobileNav?.enabled !== true
      || !mobileNav.href
    ) {
      return undefined;
    }

    return mobileNav.href(item);
  }, [behavior?.previewRail?.mobileNavigation, posture.pane]);

  const resolveRowActivationLabel = useCallback(
    (_item: T, index: number) => tSurfaceOr(
      'collection_workspace.open_item_aria',
      'Open {title} item {index}',
      { title, index: index + 1 },
    ),
    [tSurfaceOr, title],
  );
  return { handleRowClick, resolveRowHref, resolveRowActivationLabel };
}
