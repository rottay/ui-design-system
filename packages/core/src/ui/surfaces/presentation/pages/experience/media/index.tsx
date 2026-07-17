'use client';

/**
 * @fileoverview MediaSurface - Rottay Design System
 * @description Reusable media-browser surface with gallery, selection, preview,
 * detail rail, and item-level actions.
 *
 * @remarks
 * The surface centralizes media mechanics while still allowing apps to inject
 * custom thumbnails, previews, and details renderers.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, Grid, Image, Stack, Text } from '../../../../../primitives';
import { filterSurfaceActions } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { MediaSurfaceConfig, MediaSurfaceItem } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

/** Default gallery card used when callers do not provide a custom grid-item renderer. */
function DefaultMediaCard({
  item,
}: {
  item: MediaSurfaceItem;
}): React.ReactElement {
  return (
    <Card
      className="ds-media__card"
      variant="outlined"
      hoverable
      clickable
    >
      <Card.Body>
        <Stack spacing="sm">
          <Image
            src={item.thumbnailSrc ?? item.src}
            alt={item.alt ?? ''}
            height={180}
            width="100%"
            radius="md"
          />
          {(item.title || item.description || item.meta) && (
            <Stack spacing="xs">
              {item.title && <Text style={{ fontWeight: 700 }}>{item.title}</Text>}
              {item.description && (
                <Text className="ds-media__muted-text" data-part="muted-text">{item.description}</Text>
              )}
              {item.meta}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export interface MediaSurfaceProps {
  config: MediaSurfaceConfig;
  loading?: boolean;
}

/** Media-browser shell with selection state, responsive gallery layout, and details rail. */
export function MediaSurface({
  config,
  loading = false,
}: MediaSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
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
  // Details rail shows when there is a selected item AND either a custom
  // detail renderer exists or the layout explicitly requests it. Without
  // either condition, the gallery takes full width.
  const showDetailsRail =
    !!selectedItem && (config.presentation.renderDetails || config.visual.layout === 'detail');
  // Gallery column count scales down responsively: desktop uses the configured
  // count, tablet caps at 2 to prevent cramped thumbnails, mobile always
  // collapses to a single column.
  const galleryColumns = resolveResponsiveColumnCount(
    responsiveLayout,
    config.visual.columns ?? 3,
    Math.min(config.visual.columns ?? 3, 2),
    1
  );

  const setSelectedItem = (item: MediaSurfaceItem): void => {
    if (config.behavior.selectedItemId === undefined) {
      setInternalSelectedId(item.id);
    }

    // Selection is surfaced back to app code even in uncontrolled mode so it can
    // drive related UI such as metadata panels or analytics.
    config.behavior.onSelectItem?.(item);
  };

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      loading={loading}
    >
      {config.behavior.items.length === 0 ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('media.empty_title')}
            description={tSurface('media.empty_description')}
          />
        )
      ) : (
        <Grid
          className={`ds-surface ds-media ds-media--${showDetailsRail && !shouldStack ? 'split' : 'stacked'}${loading ? ' ds-media--loading' : ''}`}
          columns={showDetailsRail && !shouldStack ? 12 : 1}
          gap="lg"
        >
          <Grid.Item span={showDetailsRail && !shouldStack ? 7 : undefined}>
            <Stack spacing="lg">
              <Grid
                templateColumns={`repeat(${galleryColumns}, minmax(0, 1fr))`}
                gap="md"
              >
                {config.behavior.items.map((item, index) => {
                  const selected = item.id === selectedId;
                  const rendered =
                    config.presentation.renderGridItem?.(item, { index, selected }) ?? (
                      <DefaultMediaCard item={item} />
                    );

                  return (
                    <Box
                      key={item.id}
                      className="ds-media__item"
                      data-part="media-item"
                      data-selected={selected ? 'true' : 'false'}
                      onClick={() => setSelectedItem(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      {rendered}
                    </Box>
                  );
                })}
              </Grid>

              {config.presentation.footer}
            </Stack>
          </Grid.Item>

          {showDetailsRail && (
            <Grid.Item span={!shouldStack ? 5 : undefined}>
              <Stack spacing="lg">
                <SurfaceSectionCard
                  title={selectedItem?.title ?? tSurface('media.preview_title')}
                  description={selectedItem.description}
                  actions={
                    <SurfaceActionBar
                      actions={itemActions}
                      item={selectedItem}
                      access={config.access}
                    />
                  }
                >
                  {selectedItem && (config.presentation.renderPreview?.(selectedItem) ?? (
                    <Image
                      src={selectedItem.src}
                      alt={selectedItem.alt ?? ''}
                      height={config.visual.previewHeight ?? 360}
                      width="100%"
                      radius="md"
                    />
                  ))}
                </SurfaceSectionCard>

                <SurfaceSectionCard title={tSurface('media.details_title')}>
                  {selectedItem && (config.presentation.renderDetails?.(selectedItem) ?? (
                    <Stack spacing="xs">
                      {selectedItem.meta}
                      {selectedItem.description && (
                        <Text className="ds-media__muted-text" data-part="muted-text">
                          {selectedItem.description}
                        </Text>
                      )}
                    </Stack>
                  ))}
                </SurfaceSectionCard>
              </Stack>
            </Grid.Item>
          )}
        </Grid>
      )}
    </PageShellSurface>
  );
}
