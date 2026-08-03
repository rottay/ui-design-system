"use client";

/**
 * @fileoverview CompareSurface -- side-by-side comparison table.
 * @description Standardizes product comparison pages, plan matrices, and vendor
 * evaluation screens. Owns the comparison chrome (header row, feature rows,
 * highlight column) so these pages stop being custom one-offs.
 */

import React from "react";
import { Box, Card, Stack, Table, Text } from "../../../../../primitives";
import type {
  CompareSurfaceConfig,
  CompareSurfaceRow,
} from "../../../../foundation/contracts";
import { useOptionalDirection } from "@/infrastructure/runtime/i18n";
import { useSurfaceTranslations } from "../../../../runtime/helpers/states/i18n";
import { PageShellSurface } from "../../../../composition/layout/page-shell";
import { useSurfaceProfileDefaultsWithOverrides } from "../../../../runtime/profile-defaults/overrides";
import { useSurfaceResponsiveLayout } from "../../../../runtime/responsive";
import { SurfaceActionBar } from "../../../../runtime/helpers/rendering";
import { SurfaceEmptyState } from "../../../../runtime/helpers/states";

export interface CompareSurfaceProps {
  config: CompareSurfaceConfig;
  loading?: boolean;
}

/** Loading placeholder that mirrors the comparison's geometry: every section
 *  keeps its heading band and table frame, so the swap to real content is a
 *  pure paint change, never a layout shift. Geometry hooks are `data-part`s;
 *  the pulse and the block chrome live in the CompareSurface skin. */
function CompareSkeleton({
  sectionCount,
}: {
  sectionCount: number;
}): React.ReactElement {
  return (
    <Stack spacing="lg" data-part="compare-skeleton">
      {Array.from({ length: sectionCount }, (_, index) => (
        <Stack key={index} spacing="md">
          <Box data-part="compare-skeleton-block" data-size="section-title" />
          <Box data-part="compare-skeleton-block" data-size="table" />
        </Stack>
      ))}
    </Stack>
  );
}

export function CompareSurface({
  config,
  loading = false,
}: CompareSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurface } = useSurfaceTranslations();
  const responsive = useSurfaceResponsiveLayout({ stackOnMobile: true });
  // Direction-aware pinning: the criteria column is the FIRST column, which
  // sits at inline-start -- physical left in LTR, physical right in RTL. The
  // Table's `fixed` contract is explicitly physical, so the surface resolves
  // the side from the active locale's direction instead of hardcoding 'left'.
  const direction = useOptionalDirection();
  // Empty state requires both subjects AND at least one populated section.
  // Having subjects but zero rows (e.g. no features loaded yet) should still
  // trigger empty state rather than rendering an empty table.
  const hasData =
    config.behavior.subjects.length > 0 &&
    config.behavior.sections.some((section) => section.rows.length > 0);
  const compact = config.visual.compact ?? profileDefaults.compareCompact;

  // The criteria column is synthesized here rather than coming from config
  // because every comparison table needs it, and its rendering logic is
  // always the same: label + optional description.
  const columns = [
    {
      key: "__criteria",
      // Fixed 24% width on desktop keeps the criteria column narrow enough
      // to leave room for multiple subjects; on mobile it auto-sizes.
      title: tSurface("compare.criteria"),
      width: responsive.shouldStack ? undefined : "24%",
      // Pin the criteria column through horizontal scroll so wide subject
      // sets never scroll the row labels out of view. Composed through the
      // Table primitive's own (physical) fixed contract, keyed on direction.
      fixed: (direction === "rtl" ? "right" : "left") as "right" | "left",
      render: (_: unknown, record: unknown) => {
        // The Table component erases generics, so we cast back to the
        // surface's row type for type-safe access.
        const row = record as CompareSurfaceRow;

        return (
          <Stack spacing="xs">
            <Text className="ds-compare__row-label" data-part="row-label">{row.label}</Text>
            {row.description && (
              <Text className="ds-compare__muted-text" data-part="muted-text">
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
          <Text className="ds-compare__subject-label" data-part="subject-label">
            {subject.label}
          </Text>
          {subject.description && (
            <Text className="ds-compare__muted-text" data-part="muted-text">
              {subject.description}
            </Text>
          )}
          {subject.badge}
        </Stack>
      ),
      render: (_: unknown, record: unknown) => {
        const row = record as CompareSurfaceRow;
        return row.values[subject.key] ?? "-";
      },
    })),
  ];

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the mirror skeleton, so the shell's loading early-return
       is intentionally not engaged (fleet pattern shared with the other
       data surfaces). */
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={
        <SurfaceActionBar
          actions={config.behavior.actions}
          access={config.access}
        />
      }
      loading={false}
    >
      {loading || hasData ? (
        <Stack
          className="ds-surface ds-compare"
          data-part="root"
          data-layout={responsive.shouldStack ? "stacked" : "table"}
          data-loading={loading ? "true" : "false"}
          spacing="lg"
        >
          {config.presentation.intro}

          {loading ? (
            /* Mirror skeleton: section chrome and intro/footer stay live so
               the swap to real content is paint-only. */
            <CompareSkeleton
              sectionCount={Math.max(config.behavior.sections.length, 1)}
            />
          ) : (
            config.behavior.sections.map((section) => (
            <Stack key={section.key} spacing="md">
              {(section.title || section.description) && (
                <Box className="ds-compare__section-heading">
                  <Stack spacing="xs">
                    {section.title && (
                      <Text className="ds-compare__section-title" data-part="section-title">
                        {section.title}
                      </Text>
                    )}
                    {section.description && (
                      <Text className="ds-compare__muted-text" data-part="muted-text">
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
                            <Text className="ds-compare__row-label" data-part="row-label">
                              {row.label}
                            </Text>
                            {row.description && (
                              <Text className="ds-compare__muted-text" data-part="muted-text">
                                {row.description}
                              </Text>
                            )}
                          </Stack>

                          {config.behavior.subjects.map((subject) => (
                            <Box
                              key={`${row.key}-${subject.key}`}
                              className="ds-compare__divider"
                              data-part="divider"
                            >
                              <Stack spacing="xs">
                                <Text className="ds-compare__row-label" data-part="row-label">
                                  {subject.label}
                                </Text>
                                {subject.badge}
                                <Box>{row.values[subject.key] ?? "-"}</Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Card.Body>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Box
                  className="ds-compare__table-viewport"
                  data-part="table-viewport"
                >
                  <Table
                    // The engine factory erases the generic parameter at the
                    // component boundary, so CompareSurface keeps the record
                    // contract locally and passes normalized rows into Table.
                    dataSource={section.rows}
                    columns={columns}
                    rowKey="key"
                    pagination={false}
                    bordered
                    size={compact ? "small" : "default"}
                    rowHoverable={false}
                    locale={{
                      emptyText: tSurface("compare.empty_description"),
                    }}
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
            ))
          )}

          {config.presentation.footer}
        </Stack>
      ) : (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface("compare.empty_title")}
            description={tSurface("compare.empty_description")}
          />
        )
      )}
    </PageShellSurface>
  );
}
