'use client';

/**
 * @fileoverview MediaSurface - Rottay Design System
 * @description Reusable media-browser surface with gallery, selection, preview,
 * detail rail, and item-level actions.
 *
 * @remarks
 * The surface centralizes media mechanics while still allowing apps to inject
 * custom thumbnails, previews, and details renderers.
 *
 * Composition notes:
 * - `PatternGalleryView` (data/gallery-view) is deliberately NOT composed: its
 *   anatomy is a multi-select checkbox grid with pattern-owned item wrappers
 *   and its own default card, while this surface's contract is single-select
 *   preview driving a details rail, with surface-owned pinned hooks
 *   (`.ds-media__item[data-part="media-item"]`, `.ds-media__card`). The gallery
 *   grid stays surface-owned on the `Grid` primitive.
 * - Item selection rides the `Card` primitive's native selection mechanics
 *   (`selectable`/`selected`/`onSelect`): the operable role, `aria-pressed`,
 *   keyboard activation, focus ring, and the `--ds-card-border-selected`
 *   treatment all come from the primitive, so the surface never re-paints
 *   selection and never nests interactive elements inside a clickable card.
 *   When the app supplies `presentation.renderGridItem`, the item wrapper
 *   keeps plain click delegation (the render context exposes no select
 *   callback) and the skin paints the pointer affordance; custom renderers
 *   own their inner semantics and receive `selected` for state painting.
 * - States: `loading` renders a surface-owned mirror skeleton (gallery-shaped
 *   card blocks, plus a rail block in detail layouts) under the live page
 *   chrome -- the page-shell loading early-return is intentionally NOT engaged
 *   (dashboard/chat idiom) because it would drop the gallery anatomy;
 *   `error` composes the shared `SurfaceErrorState` kit with retry under the
 *   live chrome; empty composes the `SurfaceEmptyState` kit inside the root.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, Grid, Image, Stack, Text } from '../../../../../primitives';
import { FadeIn, recordTransitionName } from '@/graphics/motion';
import { useCollectionStagger } from '../../../../../patterns/foundation/motion';
import { filterSurfaceActions } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import type { MediaSurfaceConfig, MediaSurfaceItem } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';

/**
 * Default gallery card used when callers do not provide a custom grid-item
 * renderer. Selection is the Card primitive's native selectable mechanics, so
 * the card is the single interactive element (no clickable wrapper around it)
 * and exposes `aria-pressed` plus an accessible name resolved from the item.
 */
function DefaultMediaCard({
  item,
  selected,
  variant,
  onSelect,
}: {
  item: MediaSurfaceItem;
  selected: boolean;
  variant: 'outlined' | 'elevated' | 'filled' | 'ghost';
  onSelect: () => void;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  return (
    <Card
      className="ds-media__card"
      variant={variant}
      hoverable
      selectable
      selected={selected}
      onSelect={onSelect}
      aria-label={
        // Accessible name must be a plain string: the contract types `title`
        // as ReactNode, so non-string titles fall back to `alt` and then to
        // the i18n floor.
        typeof item.title === 'string'
          ? item.title
          : item.alt ?? tSurfaceOr('media.untitled_item', 'Untitled media item')
      }
    >
      <Card.Body>
        <Stack spacing="sm">
          {/* Partial data: an item without `thumbnailSrc` falls back to the
              full asset; a failed load renders the Image primitive's own
              governed fallback (P10), so the surface ships no fallback SVG. */}
          <Image
            src={item.thumbnailSrc ?? item.src}
            alt={item.alt ?? ''}
            height={180}
            width="100%"
            radius="md"
          />
          {(item.title || item.description || item.meta) && (
            <Stack spacing="xs">
              {item.title && <Text weight="semibold">{item.title}</Text>}
              {item.description && (
                <Text className="ds-media__muted-text" color="muted">
                  {item.description}
                </Text>
              )}
              {item.meta}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Loading placeholder that mirrors the gallery anatomy: card-shaped blocks on
 * the SAME responsive column template as the loaded grid, so the swap to real
 * content is a pure paint change, never a layout shift. Geometry and pulse
 * live in the media skin; the blocks are decorative (`aria-hidden`) while the
 * root carries `aria-busy`.
 */
function MediaGallerySkeleton({ columns }: { columns: number }): React.ReactElement {
  const blockCount = Math.min(Math.max(columns, 1) * 2, 8);

  return (
    <Grid
      data-part="gallery-skeleton"
      templateColumns={`repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`}
      gap="md"
      aria-hidden="true"
    >
      {Array.from({ length: blockCount }, (_, index) => (
        <Box key={index} data-part="media-skeleton-card">
          <Box data-part="media-skeleton-thumb" />
          <Box data-part="media-skeleton-line" data-size="title" />
          <Box data-part="media-skeleton-line" data-size="caption" />
        </Box>
      ))}
    </Grid>
  );
}

/**
 * Loading placeholder for the details rail, inside the SAME section cards as
 * the loaded rail (frames and headings stay alive). The preview block takes
 * the contract `previewHeight` through the sanctioned inline instance-value
 * channel (chat `transcriptHeight` idiom); the skin owns every other metric.
 */
function MediaRailSkeleton({
  previewHeight,
  spacing,
}: {
  previewHeight: number;
  spacing: 'sm' | 'md' | 'lg';
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  return (
    <Stack spacing={spacing}>
      <SurfaceSectionCard title={tSurfaceOr('media.preview_title', 'Preview')}>
        <Box
          data-part="media-skeleton-preview"
          aria-hidden="true"
          style={{ minBlockSize: previewHeight }}
        />
      </SurfaceSectionCard>
      <SurfaceSectionCard title={tSurfaceOr('media.details_title', 'Details')}>
        <Stack spacing="xs" aria-hidden="true">
          <Box data-part="media-skeleton-line" data-size="title" />
          <Box data-part="media-skeleton-line" data-size="caption" />
        </Stack>
      </SurfaceSectionCard>
    </Stack>
  );
}

export interface MediaSurfaceProps {
  config: MediaSurfaceConfig;
  loading?: boolean;
  /** Load failure of the media payload; renders the shared error kit under the live page chrome. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
}

/** Media-browser shell with selection state, responsive gallery layout, and details rail. */
export function MediaSurface({
  config,
  loading = false,
  error,
  onRetry,
}: MediaSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const resolvedMobile = responsiveLayout.isMobile && responsiveLayout.hasResolvedViewport;
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  // Selection supports controlled (app owns selectedItemId) and uncontrolled
  // (surface auto-selects first item) modes. Auto-selection on mount ensures
  // the details rail has something to show immediately.
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    config.behavior.selectedItemId ?? config.behavior.items[0]?.id
  );

  // Re-sync when items change (e.g. after filtering) or when the app takes
  // over control of the selection. The fallback to items[0] prevents the
  // details rail from going blank after a filter narrows results.
  useEffect(() => {
    if (config.behavior.selectedItemId !== undefined) {
      setInternalSelectedId(config.behavior.selectedItemId);
    } else if (config.behavior.items.length > 0 && !internalSelectedId) {
      setInternalSelectedId(config.behavior.items[0]?.id);
    }
  }, [config.behavior.items, config.behavior.selectedItemId, internalSelectedId]);

  const selectedId = config.behavior.selectedItemId ?? internalSelectedId;
  const selectedItem = useMemo(() => {
    return config.behavior.items.find((item) => item.id === selectedId);
  }, [config.behavior.items, selectedId]);

  const itemActions = useMemo(() => {
    return filterSurfaceActions(config.behavior.itemActions, config.access, selectedItem);
  }, [config.behavior.itemActions, config.access, selectedItem]);
  const shouldStack = responsiveLayout.shouldStack;
  // Explicit safe resolution: the rail skeleton needs a numeric block size;
  // the loaded preview keeps the contract value verbatim (Image `height`
  // accepts string | number). No casts.
  const previewHeight = config.visual.previewHeight ?? 360;
  const previewHeightPx = typeof previewHeight === 'number' ? previewHeight : 360;
  // Details rail shows when there is a selected item AND either a custom
  // detail renderer exists or the layout explicitly requests it. Without
  // either condition, the gallery takes full width.
  const resolvedLayout =
    config.visual.layout ??
    (config.presentation.renderDetails || config.presentation.renderPreview ? 'detail' : 'gallery');
  const showDetailsRail = !!selectedItem && resolvedLayout === 'detail';
  // Gallery column count scales down responsively: desktop uses the configured
  // count, tablet caps at 2 to prevent cramped thumbnails, mobile always
  // collapses to a single column.
  const galleryColumns = resolveResponsiveColumnCount(
    responsiveLayout,
    config.visual.columns ?? 3,
    Math.min(config.visual.columns ?? 3, 2),
    Math.min(
      config.visual.columns ?? 3,
      Math.max(1, Math.floor(config.visual.mobileColumnsLimit ?? 1))
    )
  );

  // Per-card entrance choreography (collection.insert recipe), gated by BOTH
  // the product profile's animateEntrance flag AND the active motion policy,
  // so a reduced/calm/hidden context renders every card at its final state.
  const stagger = useCollectionStagger(config.behavior.items.length);
  const applyStagger = profileDefaults.animateEntrance && stagger.animated;

  const setSelectedItem = (item: MediaSurfaceItem): void => {
    if (config.behavior.selectedItemId === undefined) {
      setInternalSelectedId(item.id);
    }

    // Selection is surfaced back to app code even in uncontrolled mode so it can
    // drive related UI such as metadata panels or analytics.
    config.behavior.onSelectItem?.(item);
  };

  // Error state renders under the live page chrome so header actions (e.g.
  // upload) stay usable, mirroring the dashboard/chat surface idiom.
  if (error) {
    return (
      <PageShellSurface
        chrome={{
          ...config.presentation.chrome,
          maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
        }}
        actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // During loading the mirror skeleton renders the EXPECTED anatomy (rail
  // whenever the detail layout would show one), so resolving into real
  // content is paint-only. The pinned `split`/`stacked` modifier logic for
  // the loaded state is unchanged.
  const railVisible = loading ? resolvedLayout === 'detail' : showDetailsRail;
  const splitActive = railVisible && !shouldStack;

  const mediaContent = (
    <Grid
      className={`ds-surface ds-media ds-media--${splitActive ? 'split' : 'stacked'}${loading ? ' ds-media--loading' : ''}`}
      data-part="root"
      data-layout={resolvedLayout}
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
      data-mobile-columns={resolvedMobile ? galleryColumns : undefined}
      columns={splitActive ? 12 : 1}
      gap={sectionSpacing}
    >
      <Grid.Item span={splitActive ? 7 : undefined}>
        {loading ? (
          <MediaGallerySkeleton columns={galleryColumns} />
        ) : config.behavior.items.length === 0 ? (
          config.presentation.emptyState ?? (
            <SurfaceEmptyState
              title={tSurfaceOr('media.empty_title', 'No media items')}
              description={tSurfaceOr(
                'media.empty_description',
                'Provide one or more media items to render the gallery.'
              )}
            />
          )
        ) : (
          <Stack spacing={sectionSpacing}>
            <Grid
              templateColumns={`repeat(${galleryColumns}, minmax(0, 1fr))`}
              gap="md"
              className={applyStagger ? stagger.containerClassName : undefined}
              style={
                applyStagger
                  ? ({
                      '--ds-stagger-step': stagger.stepCss,
                      '--ds-stagger-max': stagger.maxCss,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {config.behavior.items.map((item, index) => {
                const selected = item.id === selectedId;
                const customItem = config.presentation.renderGridItem?.(item, {
                  index,
                  selected,
                });

                return (
                  <Box
                    key={item.id}
                    className="ds-media__item"
                    data-part="media-item"
                    data-selected={selected ? 'true' : 'false'}
                    data-clickable={customItem !== undefined ? 'true' : undefined}
                    onClick={customItem !== undefined ? () => setSelectedItem(item) : undefined}
                    data-ds-stagger-item={applyStagger ? '' : undefined}
                    style={
                      {
                        // Per-item view-transition seam keyed on the item id so
                        // a grid card and the preview rail agree on identity
                        // (list-surface idiom). Inert outside an active view
                        // transition; the stagger index is the sanctioned
                        // custom-property passthrough.
                        viewTransitionName: recordTransitionName(item.id),
                        ...(applyStagger
                          ? { '--ds-stagger-index': index }
                          : {}),
                      } as React.CSSProperties
                    }
                  >
                    {customItem ?? (
                      <DefaultMediaCard
                        item={item}
                        selected={selected}
                        variant={profileDefaults.cardVariant}
                        onSelect={() => setSelectedItem(item)}
                      />
                    )}
                  </Box>
                );
              })}
            </Grid>

            {config.presentation.footer}
          </Stack>
        )}
      </Grid.Item>

      {railVisible && (
        <Grid.Item span={!shouldStack ? 5 : undefined}>
          {loading ? (
            <MediaRailSkeleton
              previewHeight={previewHeightPx}
              spacing={sectionSpacing}
            />
          ) : (
            selectedItem && (
              <Stack spacing={sectionSpacing}>
                <SurfaceSectionCard
                  title={selectedItem.title ?? tSurfaceOr('media.preview_title', 'Preview')}
                  description={selectedItem.description}
                  actions={
                    <SurfaceActionBar
                      actions={itemActions}
                      item={selectedItem}
                      access={config.access}
                    />
                  }
                >
                  {config.presentation.renderPreview?.(selectedItem) ?? (
                    <Image
                      src={selectedItem.src}
                      alt={selectedItem.alt ?? ''}
                      height={config.visual.previewHeight ?? 360}
                      width="100%"
                      radius="md"
                    />
                  )}
                </SurfaceSectionCard>

                <SurfaceSectionCard title={tSurfaceOr('media.details_title', 'Details')}>
                  {config.presentation.renderDetails?.(selectedItem) ?? (
                    <Stack spacing="xs">
                      {selectedItem.meta}
                      {selectedItem.description && (
                        <Text className="ds-media__muted-text" color="muted">
                          {selectedItem.description}
                        </Text>
                      )}
                    </Stack>
                  )}
                </SurfaceSectionCard>
              </Stack>
            )
          )}
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      // The page-shell loading early-return is intentionally NOT engaged: it
      // would replace the body with a generic page skeleton and drop the
      // gallery anatomy. The surface owns a mirror skeleton instead.
      loading={false}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{mediaContent}</FadeIn>
        ) : (
          mediaContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
