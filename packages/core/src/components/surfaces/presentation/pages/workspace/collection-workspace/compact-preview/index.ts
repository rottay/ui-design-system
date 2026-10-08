import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { ResolvedSurfacePosture } from '../../../../../foundation/contracts/postures';
import type { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import type { CollectionWorkspaceProps } from '..';
import { resolveKey } from '../foundation';

export interface CollectionCompactPreviewInput<T extends object> {
  surfacePosture: ResolvedSurfacePosture | undefined;
  rowKey: CollectionWorkspaceProps<T>['rowKey'];
  loading: CollectionWorkspaceProps<T>['loading'];
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  compactPreviewOpen: boolean;
  setCompactPreviewOpen: Dispatch<SetStateAction<boolean>>;
  compactPreviewKey: string | null;
  setCompactPreviewKey: Dispatch<SetStateAction<string | null>>;
  dismissedCompactPreviewKeyRef: RefObject<string | null>;
  unavailableCompactPreviewKeyRef: RefObject<string | null>;
  focusedKey: string | null;
  previewKey: string | null;
  usesCompactPreview: boolean;
  displayData: T[];
}

export function useCollectionCompactPreview<T extends object>(input: CollectionCompactPreviewInput<T>) {
  const {
    surfacePosture, rowKey, loading, workspace, compactPreviewOpen, setCompactPreviewOpen, compactPreviewKey,
    setCompactPreviewKey, dismissedCompactPreviewKeyRef, unavailableCompactPreviewKeyRef, focusedKey, previewKey,
    usesCompactPreview, displayData,
  } = input;
  const resolvedCompactPreviewKey = compactPreviewKey
    ?? (unavailableCompactPreviewKeyRef.current === previewKey ? null : previewKey);
  const previewItem = useMemo(
    () => resolvedCompactPreviewKey == null
      ? undefined
      : displayData.find((item) => resolveKey(item, rowKey) === resolvedCompactPreviewKey),
    [displayData, resolvedCompactPreviewKey, rowKey],
  );
  const compactPreviewVisible = Boolean(
    usesCompactPreview && compactPreviewOpen && resolvedCompactPreviewKey != null && surfacePosture?.regions['preview-rail'] !== 'collapse',
  );

  const handleCompactPreviewOpenChange = useCallback((open: boolean) => {
    if (open) {
      const nextKey = compactPreviewKey ?? previewKey;
      if (nextKey == null) return;
      dismissedCompactPreviewKeyRef.current = null;
      setCompactPreviewKey(nextKey);
      setCompactPreviewOpen(true);
      return;
    }

    dismissedCompactPreviewKeyRef.current = compactPreviewKey ?? previewKey;
    setCompactPreviewOpen(false);
  }, [compactPreviewKey, previewKey]);

  const openCompactPreviewForKey = useCallback((key: string) => {
    dismissedCompactPreviewKeyRef.current = null;
    unavailableCompactPreviewKeyRef.current = null;
    setCompactPreviewKey(key);
    setCompactPreviewOpen(true);
  }, []);

  const previousExternalPreviewKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const previousExternalKey = previousExternalPreviewKeyRef.current;

    if (!usesCompactPreview) {
      previousExternalPreviewKeyRef.current = null;
      dismissedCompactPreviewKeyRef.current = null;
      unavailableCompactPreviewKeyRef.current = null;
      setCompactPreviewKey(null);
      setCompactPreviewOpen(false);
      return;
    }

    previousExternalPreviewKeyRef.current = previewKey;
    if (previewKey == null) {
      if (previousExternalKey != null) {
        dismissedCompactPreviewKeyRef.current = null;
        unavailableCompactPreviewKeyRef.current = null;
        setCompactPreviewKey(null);
        setCompactPreviewOpen(false);
      }
      return;
    }

    if (unavailableCompactPreviewKeyRef.current === previewKey) {
      if (compactPreviewKey != null) setCompactPreviewKey(null);
      return;
    }

    if (unavailableCompactPreviewKeyRef.current != null) {
      unavailableCompactPreviewKeyRef.current = null;
    }

    if (compactPreviewKey !== previewKey) {
      setCompactPreviewKey(previewKey);
      if (dismissedCompactPreviewKeyRef.current !== previewKey) {
        setCompactPreviewOpen(true);
      }
    }
  }, [compactPreviewKey, previewKey, usesCompactPreview]);

  useEffect(() => {
    if (
      !usesCompactPreview
      || !compactPreviewOpen
      || resolvedCompactPreviewKey == null
      || previewItem
      || loading
    ) {
      return;
    }

    // Loading may transiently empty the collection. Only close once the app
    // declares a settled dataset that no longer contains the previewed item.
    dismissedCompactPreviewKeyRef.current = resolvedCompactPreviewKey;
    unavailableCompactPreviewKeyRef.current = resolvedCompactPreviewKey;
    setCompactPreviewKey(null);
    setCompactPreviewOpen(false);
  }, [
    compactPreviewOpen,
    loading,
    previewItem,
    resolvedCompactPreviewKey,
    usesCompactPreview,
  ]);

  const handleWorkspaceSelectionChange = useCallback((keys: string[], items: T[]) => {
    workspace.setSelection(keys, items);
    if (!usesCompactPreview || focusedKey) return;

    if (keys.length === 1) {
      openCompactPreviewForKey(keys[0]);
      return;
    }

    dismissedCompactPreviewKeyRef.current = null;
    setCompactPreviewKey(null);
    setCompactPreviewOpen(false);
  }, [focusedKey, openCompactPreviewForKey, usesCompactPreview, workspace]);
  return {
    resolvedCompactPreviewKey, previewItem, compactPreviewVisible, handleCompactPreviewOpenChange,
    openCompactPreviewForKey, handleWorkspaceSelectionChange,
  };
}
