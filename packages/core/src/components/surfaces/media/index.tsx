'use client';

/**
 * MediaSurface
 *
 * Media-heavy pages need more than a card grid: they need selection, preview,
 * details, and item-level actions. This surface centralizes those mechanics
 * while still allowing the app to provide custom thumbnails and previews.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, Grid, Image, Stack, Text } from '../../primitives';
import { filterSurfaceActions } from '../helpers';
import { useSurfaceTranslations } from '../i18n';
import type { MediaSurfaceConfig, MediaSurfaceItem } from '../types';
import { PageShellSurface } from '../page-shell';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../shared';
import { SurfaceEmptyState } from '../states';

function DefaultMediaCard({
  item,
  selected,
}: {
  item: MediaSurfaceItem;
  selected: boolean;
}): React.ReactElement {
  return (
    <Card
      variant="outlined"
      hoverable
      clickable
      style={{
        borderColor: selected ? 'var(--ds-color-primary-500)' : undefined,
      }}
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
                <Text style={{ color: 'var(--ds-color-text-muted)' }}>{item.description}</Text>
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

export function MediaSurface({
  config,
  loading = false,
}: MediaSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    config.behavior.selectedItemId ?? config.behavior.items[0]?.id
  );

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
    return filterSurfaceActions(config.behavior.itemActions, config.permissions, selectedItem);
  }, [config.behavior.itemActions, config.permissions, selectedItem]);
  const shouldStack = responsiveLayout.shouldStack;
  const showDetailsRail =
    !!selectedItem && (config.presentation.renderDetails || config.visual.layout === 'detail');
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

    config.behavior.onSelectItem?.(item);
  };

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />}
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
        <Grid columns={showDetailsRail && !shouldStack ? 12 : 1} gap="lg">
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
                      <DefaultMediaCard item={item} selected={selected} />
                    );

                  return (
                    <Box
                      key={item.id}
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
                      permissions={config.permissions}
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
                        <Text style={{ color: 'var(--ds-color-text-muted)' }}>
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
