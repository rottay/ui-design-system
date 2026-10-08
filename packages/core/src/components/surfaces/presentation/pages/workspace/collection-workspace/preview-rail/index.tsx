import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { SurfacePostureSlot } from '../../../../../runtime/postures/scope';
import { Box } from '../../../../../../primitives/layout/box';
import type { CollectionWorkspaceProps } from '..';
import { resolveKey, type SurfaceTranslator } from '../foundation';
import type { ReactNode } from 'react';

const DEFAULT_PREVIEW_RAIL_WIDTH = 380;
const DEFAULT_PREVIEW_RAIL_MIN_WIDTH = 280;
const DEFAULT_PREVIEW_RAIL_MAX_WIDTH = 720;

function parseRailWidth(value: string | number | undefined, fallback = DEFAULT_PREVIEW_RAIL_WIDTH): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return fallback;
  const pxMatches = [...value.matchAll(/(\d+(?:\.\d+)?)px/g)];
  const lastPx = arrayValueAt(pxMatches, -1)?.[1];
  if (lastPx) return Number(lastPx);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clampRailWidth(value: number, minWidth: number, maxWidth: number): number {
  return Math.min(Math.max(value, minWidth), maxWidth);
}

function getPreviewRailViewportMax(minWidth: number, maxWidth: number): number {
  if (typeof window === 'undefined') return maxWidth;
  return Math.max(minWidth, Math.min(maxWidth, window.innerWidth - 360));
}

export interface CollectionPreviewRailInput<T extends object> {
  behavior: CollectionWorkspaceProps<T>['behavior'];
  tSurfaceOr: SurfaceTranslator;
  directionIsRtl: boolean;
}

export function useCollectionPreviewRail<T extends object>(input: CollectionPreviewRailInput<T>) {
  const { behavior, tSurfaceOr, directionIsRtl } = input;
  const previewRailResizable = behavior?.previewRail?.resizable ?? true;
  const previewRailMinWidth = behavior?.previewRail?.minWidth ?? DEFAULT_PREVIEW_RAIL_MIN_WIDTH;
  const previewRailMaxWidth = behavior?.previewRail?.maxWidth ?? DEFAULT_PREVIEW_RAIL_MAX_WIDTH;
  const previewRailDefaultWidth = useMemo(
    () => clampRailWidth(
      parseRailWidth(behavior?.previewRail?.width, DEFAULT_PREVIEW_RAIL_WIDTH),
      previewRailMinWidth,
      previewRailMaxWidth,
    ),
    [behavior?.previewRail?.width, previewRailMaxWidth, previewRailMinWidth],
  );
  const [previewRailWidth, setPreviewRailWidth] = useState(previewRailDefaultWidth);
  const previewRailWidthRef = useRef(previewRailDefaultWidth);
  const previewRailDragActiveRef = useRef(false);

  useEffect(() => {
    previewRailWidthRef.current = previewRailWidth;
  }, [previewRailWidth]);

  // RAIL WIDTH IS CONFIG-OWNED, NOT SURFACE-OWNED. This effect used to read a
  // remembered width out of browser storage under a key derived from the
  // surface TITLE, so two collections that shared a heading shared a rail and
  // the DS carried a browser dependency no consumer could see. The declared
  // width wins; a consumer that wants the width remembered persists it with
  // `useLayoutPreference` and feeds it back through `previewRail.width`.
  useEffect(() => {
    if (!previewRailResizable || typeof window === 'undefined') {
      setPreviewRailWidth(previewRailDefaultWidth);
      return;
    }

    const viewportMax = getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth);
    setPreviewRailWidth(
      clampRailWidth(previewRailDefaultWidth, previewRailMinWidth, viewportMax),
    );
  }, [
    previewRailDefaultWidth,
    previewRailMaxWidth,
    previewRailMinWidth,
    previewRailResizable,
  ]);

  const commitPreviewRailWidth = useCallback(
    (nextWidth: number) => {
      const viewportMax = getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth);
      const clampedWidth = clampRailWidth(nextWidth, previewRailMinWidth, viewportMax);

      previewRailWidthRef.current = clampedWidth;
      setPreviewRailWidth(clampedWidth);
      behavior?.previewRail?.onWidthChange?.(clampedWidth);
    },
    [
      behavior?.previewRail,
      previewRailMaxWidth,
      previewRailMinWidth,
    ],
  );

  const handlePreviewRailResizeStart = useCallback(
    (event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      if (!previewRailResizable || typeof window === 'undefined') return;

      event.preventDefault();
      event.stopPropagation();
      if (previewRailDragActiveRef.current) return;

      const startX = event.clientX;
      const startWidth = previewRailWidthRef.current;
      // The rail sits at the inline-end edge: in RTL that flips it to the
      // left side of the row, so the same physical drag has the opposite
      // effect on the rail width.
      const directionFactor = directionIsRtl ? -1 : 1;

      previewRailDragActiveRef.current = true;

      const handlePointerMove = (moveEvent: PointerEvent | MouseEvent) => {
        const delta = (startX - moveEvent.clientX) * directionFactor;
        commitPreviewRailWidth(startWidth + delta);
      };

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('mouseup', handlePointerUp);
        previewRailDragActiveRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('mouseup', handlePointerUp);
    },
    [commitPreviewRailWidth, previewRailResizable],
  );

  const handlePreviewRailResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!previewRailResizable) return;

      // Logical arrows: ArrowLeft always moves the separator towards the
      // inline-start, which widens the inline-end rail in LTR and shrinks it
      // in RTL.
      const directionFactor = directionIsRtl ? -1 : 1;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current + 24 * directionFactor);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current - 24 * directionFactor);
      }
    },
    [commitPreviewRailWidth, previewRailResizable],
  );

  const renderPreviewRail = useCallback(
    (railItem: T) => {
      const configuredWidth = previewRailResizable
        ? `${previewRailWidth}px`
        : behavior?.previewRail?.width ?? `${DEFAULT_PREVIEW_RAIL_WIDTH}px`;

      return (
        <SurfacePostureSlot name="preview-rail" asChild><Box
          className="ds-collection-preview-rail"
          data-part="preview-rail"
          data-resizable={previewRailResizable ? 'true' : 'false'}
          style={{
            // Instance geometry: the user-resolved rail width is true
            // per-instance data (resized + persisted), not paint.
            width: configuredWidth,
            minWidth: configuredWidth,
            maxWidth: configuredWidth,
            flex: `0 0 ${configuredWidth}`,
          }}
        >
          {previewRailResizable ? (
            <Box
              as="div"
              role="separator"
              aria-orientation="vertical"
              aria-label={tSurfaceOr('collection_workspace.resize_rail_aria', 'Resize detail panel')}
              aria-valuemin={previewRailMinWidth}
              aria-valuemax={getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth)}
              aria-valuenow={previewRailWidth}
              tabIndex={0}
              title={tSurfaceOr('collection_workspace.resize_rail_title', 'Drag to resize detail panel')}
              onPointerDown={handlePreviewRailResizeStart}
              onMouseDown={handlePreviewRailResizeStart}
              onKeyDown={handlePreviewRailResizeKeyDown}
              className="ds-collection-preview-rail__resize"
              data-part="preview-rail-resize"
            >
              <Box
                className="ds-collection-preview-rail__resize-bar"
                data-part="preview-rail-resize-bar"
                aria-hidden
              />
            </Box>
          ) : null}
          {behavior!.previewRail!.render!(railItem, { pane: 'inline', compact: false })}
        </Box></SurfacePostureSlot>
      );
    },
    [
      behavior,
      handlePreviewRailResizeKeyDown,
      handlePreviewRailResizeStart,
      previewRailResizable,
      previewRailWidth,
      tSurfaceOr,
    ],
  );
  return { renderPreviewRail };
}

export interface CollectionPreviewRailItemInput<T extends object> {
  rowKey: CollectionWorkspaceProps<T>['rowKey'];
  previewKey: string | null;
  showPreviewRail: boolean;
  renderPreviewRail: (railItem: T) => ReactNode;
  displayData: T[];
}

export function renderLegacyPreviewRailItem<T extends object>(input: CollectionPreviewRailItemInput<T>) {
  const { rowKey, previewKey, showPreviewRail, renderPreviewRail, displayData } = input;
  return (
          showPreviewRail && (() => {
            const railItem = displayData.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return renderPreviewRail(railItem);
          })()
  );
}

export function renderPremiumPreviewRailItem<T extends object>(input: CollectionPreviewRailItemInput<T>) {
  const { rowKey, previewKey, showPreviewRail, renderPreviewRail, displayData } = input;
  return (
          showPreviewRail && (() => {
            const railItem = displayData.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return renderPreviewRail(railItem);
          })()
  );
}
