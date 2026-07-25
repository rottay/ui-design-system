'use client';

/**
 * @fileoverview CompareSurface -- side-by-side comparison table.
 * @description Standardizes product comparison pages, plan matrices, and vendor
 * evaluation screens. Owns the comparison chrome (header row, feature rows,
 * highlight column) so these pages stop being custom one-offs.
 */

import React from 'react';
import { Box, Card, Stack, Table, Text } from '../../../../../primitives';
import type { CompareSurfaceConfig, CompareSurfaceRow } from '../../../../foundation/contracts';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface CompareSurfaceProps {
  config: CompareSurfaceConfig;
  loading?: boolean;
}

export function CompareSurface({
  config,
  loading = false,
}: CompareSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurface } = useSurfaceTranslations();
  const responsive = useSurfaceResponsiveLayout({ stackOnMobile: true });
  // Empty state requires both subjects AND at least one populated section.
  // Having subjects but zero rows (e.g. no features loaded yet) should still
  // trigger empty state rather than rendering an empty table.
  const hasData =
    config.behavior.subjects.length > 0 && config.behavior.sections.some((section) => section.rows.length > 0);
  const compact = config.visual.compact ?? profileDefaults.compareCompact;

  // The criteria column is synthesized here rather than coming from config
  // because every comparison table needs it, and its rendering logic is
  // always the same: label + optional description.
  const columns = [
    {
      key: '__criteria',
      // Fixed 24% width on desktop keeps the criteria column narrow enough
      // to leave room for multiple subjects; on mobile it auto-sizes.
      title: tSurface('compare.criteria'),
      width: responsive.shouldStack ? undefined : '24%',
      render: (_: unknown, record: unknown) => {
        // The Table component erases generics, so we cast back to the
        // surface's row type for type-safe access.
        const row = record as CompareSurfaceRow;

        return (
          <Stack spacing="xs">
            <Text style={{ fontWeight: 600 }}>{row.label}</Text>
            {row.description && (
              <Text
                className="ds-compare__muted-text"
              >
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
            <Text
              className="ds-compare__muted-text"
            >
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
      actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
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
        <Stack
          className="ds-surface ds-compare"
          data-part="root"
          data-layout={responsive.shouldStack ? 'stacked' : 'table'}
          data-loading={loading ? 'true' : 'false'}
          spacing="lg"
        >
          {config.presentation.intro}

          {config.behavior.sections.map((section) => (
            <Stack key={section.key} spacing="md">
              {(section.title || section.description) && (
                <Box
                  className="ds-compare__section-heading"
                  style={{
                    padding: '16px',
                  }}
                >
                  <Stack spacing="xs">
                    {section.title && <Text style={{ fontWeight: 700 }}>{section.title}</Text>}
                    {section.description && (
                      <Text
                        className="ds-compare__muted-text"
                      >
                        {section.description}
                      </Text>
                    )}
                  </Stack>
                </Box>
              )}

              {/* On mobile, the table layout is unreadable with multiple columns,
                so we switch to stacked cards where each row becomes a card
                that lists values per subject vertically. */}
            {responsive.shouldStack ? (
                <Stack spacing="md">
                  {section.rows.map((row) => (
                    <Card key={row.key} variant="outlined">
                      <Card.Body>
                        <Stack spacing="md">
                          <Stack spacing="xs">
                            <Text style={{ fontWeight: 700 }}>{row.label}</Text>
                            {row.description && (
                              <Text
                                className="ds-compare__muted-text"
                              >
                                {row.description}
                              </Text>
                            )}
                          </Stack>

                          {config.behavior.subjects.map((subject) => (
                            <Box
                              key={`${row.key}-${subject.key}`}
                              className="ds-compare__divider"
                              data-part="divider"
                              style={{
                                paddingTop: '12px',
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
                    // Minimum scroll width scales with subject count so columns
                    // do not compress below readability. 720px floor ensures
                    // the table never shrinks below a reasonable 2-subject view.
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
