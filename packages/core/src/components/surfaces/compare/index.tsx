'use client';

/**
 * CompareSurface
 *
 * Product comparison pages and plan matrices show up everywhere: sales,
 * pricing, vendor evaluation, even internal rollout decisions. The surface
 * owns the repeated comparison chrome so those pages stop living as custom
 * one-offs.
 */

import React from 'react';
import { Box, Card, Stack, Table, Text } from '../../primitives';
import type { CompareSurfaceConfig, CompareSurfaceRow } from '../types';
import { useSurfaceTranslations } from '../i18n';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface CompareSurfaceProps {
  config: CompareSurfaceConfig;
  loading?: boolean;
}

export function CompareSurface({
  config,
  loading = false,
}: CompareSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { tSurface } = useSurfaceTranslations();
  const responsive = useSurfaceResponsiveLayout({ stackOnMobile: true });
  const hasData =
    config.behavior.subjects.length > 0 && config.behavior.sections.some((section) => section.rows.length > 0);
  const compact = config.visual.compact ?? profileDefaults.compareCompact;

  const columns = [
    {
      key: '__criteria',
      title: tSurface('compare.criteria'),
      width: responsive.shouldStack ? undefined : '24%',
      render: (_: unknown, record: unknown) => {
        const row = record as CompareSurfaceRow;

        return (
          <Stack spacing="xs">
            <Text style={{ fontWeight: 600 }}>{row.label}</Text>
            {row.description && (
              <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                {row.description}
              </Text>
            )}
          </Stack>
        );
      },
    },
    ...config.behavior.subjects.map((subject) => ({
      key: subject.key,
      title: (
        <Stack spacing="xs">
          <Text style={{ fontWeight: 700 }}>{subject.label}</Text>
          {subject.description && (
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>
              {subject.description}
            </Text>
          )}
          {subject.badge}
        </Stack>
      ),
      render: (_: unknown, record: unknown) => {
        const row = record as CompareSurfaceRow;
        return row.values[subject.key] ?? '-';
      },
    })),
  ];

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />}
      loading={loading}
    >
      {!hasData ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('compare.empty_title')}
            description={tSurface('compare.empty_description')}
          />
        )
      ) : (
        <Stack spacing="lg">
          {config.presentation.intro}

          {config.behavior.sections.map((section) => (
            <Stack key={section.key} spacing="md">
              {(section.title || section.description) && (
                <Box
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--ds-radius-lg)',
                    background: 'var(--ds-color-surface-secondary)',
                  }}
                >
                  <Stack spacing="xs">
                    {section.title && <Text style={{ fontWeight: 700 }}>{section.title}</Text>}
                    {section.description && (
                      <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                        {section.description}
                      </Text>
                    )}
                  </Stack>
                </Box>
              )}

              {responsive.shouldStack ? (
                <Stack spacing="md">
                  {section.rows.map((row) => (
                    <Card key={row.key} variant="outlined">
                      <Card.Body>
                        <Stack spacing="md">
                          <Stack spacing="xs">
                            <Text style={{ fontWeight: 700 }}>{row.label}</Text>
                            {row.description && (
                              <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                                {row.description}
                              </Text>
                            )}
                          </Stack>

                          {config.behavior.subjects.map((subject) => (
                            <Box
                              key={`${row.key}-${subject.key}`}
                              style={{
                                paddingTop: '12px',
                                borderTop: '1px solid var(--ds-color-border-subtle)',
                              }}
                            >
                              <Stack spacing="xs">
                                <Text style={{ fontWeight: 600 }}>{subject.label}</Text>
                                {subject.badge}
                                <Box>{row.values[subject.key] ?? '-'}</Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Card.Body>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Box style={{ overflowX: 'auto' }}>
                  <Table
                    // The engine factory erases the generic parameter at the
                    // component boundary, so CompareSurface keeps the record
                    // contract locally and passes normalized rows into Table.
                    dataSource={section.rows}
                    columns={columns}
                    rowKey="key"
                    pagination={false}
                    bordered
                    size={compact ? 'small' : 'default'}
                    rowHoverable={false}
                    locale={{ emptyText: tSurface('compare.empty_description') }}
                    scroll={{
                      x: Math.max(720, config.behavior.subjects.length * 220),
                    }}
                  />
                </Box>
              )}
            </Stack>
          ))}

          {config.presentation.footer}
        </Stack>
      )}
    </PageShellSurface>
  );
}
