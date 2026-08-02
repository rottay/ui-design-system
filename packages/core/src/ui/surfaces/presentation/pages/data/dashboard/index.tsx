"use client";

/**
 * @fileoverview DashboardSurface - Rottay Design System
 * @description Reusable dashboard shell for KPI grids, section cards, charts,
 * and header actions.
 *
 * @remarks
 * This surface packages the recurring "overview page" structure while leaving
 * each widget's content and meaning in app-level config.
 */

import { useMemo, useRef } from "react";

import {
  Button,
  Card,
  Grid,
  Stack,
  Text,
  Flex,
  Box,
} from "../../../../../primitives";
import type { GridColumns } from "../../../../../primitives/layout/Grid/contracts";
import { PatternStatsGrid } from "../../../../../patterns";
import { FadeIn, StaggerChildren } from "@/graphics/motion";
import {
  filterSurfaceActions,
  resolveSurfaceButtonVariant,
} from "../../../../runtime/helpers";
import type {
  DashboardSurfaceConfig,
  DashboardSurfaceSection,
} from "../../../../foundation/contracts";
import { PageShellSurface } from "../../../../composition/layout/page-shell";
import { resolveAdaptiveLayout } from "../../../../../patterns/data/widget-board/runtime/solver";
import {
  useAdaptiveEnvironment,
  useContainerPosture,
} from "../../../../../patterns/data/widget-board/runtime/solver/react";
import { useSurfaceProfileDefaultsWithOverrides } from "../../../../runtime/profile-defaults/overrides";
import {
  resolveResponsiveColumnCount,
  useSurfaceResponsiveLayout,
} from "../../../../runtime/responsive";
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from "../../../../runtime/profile-defaults/personality";
import {
  SurfaceEmptyState,
  SurfaceErrorState,
} from "../../../../runtime/helpers/states";
import { useMotionPolicy } from "@/infrastructure/runtime/motion";

/** Loading placeholder that mirrors the board's exact geometry.
 *  The stats row keeps the resolved column count; every section keeps its own
 *  span inside the same grid, so the swap to real content is a pure paint
 *  change, never a layout shift. Geometry hooks are `data-part`s; the pulse
 *  and the block chrome live in the DashboardSurface skin. */
function DashboardSkeleton({
  statsCount,
  statsColumns,
  sections,
  sectionsColumns,
  sectionSpacing,
  cardVariant,
  isMobile,
  stackSectionsOnMobile,
}: {
  statsCount: number;
  statsColumns: GridColumns;
  sections: DashboardSurfaceSection[];
  sectionsColumns: GridColumns;
  sectionSpacing: "sm" | "md" | "lg";
  cardVariant: "outlined" | "elevated" | "filled" | "ghost";
  isMobile: boolean;
  stackSectionsOnMobile?: boolean;
}) {
  return (
    <>
      {statsCount > 0 && (
        <Grid
          columns={statsColumns}
          gap={sectionSpacing}
          data-part="dashboard-skeleton-stats"
        >
          {Array.from({ length: statsCount }, (_, index) => (
            <Box
              key={index}
              data-part="dashboard-skeleton-block"
              data-size="stat"
            />
          ))}
        </Grid>
      )}
      {sections.length > 0 && (
        <Grid columns={sectionsColumns} gap={sectionSpacing}>
          {sections.map((section) => (
            <Grid.Item
              key={section.key}
              span={
                isMobile && stackSectionsOnMobile !== false
                  ? undefined
                  : isMobile
                  ? section.mobileSpan
                  : section.span
              }
            >
              <Card variant={cardVariant}>
                <Card.Body>
                  <Stack spacing="md">
                    <Box
                      data-part="dashboard-skeleton-block"
                      data-size="section-title"
                    />
                    <Box
                      data-part="dashboard-skeleton-block"
                      data-size="section-line"
                    />
                    <Box
                      data-part="dashboard-skeleton-block"
                      data-size="section-line"
                    />
                  </Stack>
                </Card.Body>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      )}
    </>
  );
}

export interface DashboardSurfaceProps {
  config: DashboardSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Dashboard page shell with stats, header actions, section cards, and error handling. */
export function DashboardSurface({
  config,
  loading = false,
  error,
  onRetry,
}: DashboardSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const responsiveLayout = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: false,
  });
  const isMobile = responsiveLayout.isMobile;
  // Section reveals opt into the scroll-driven entry fade-up only when the
  // ambient dial allows decorative motion. allowAmbientMotion already folds in
  // reduced-motion, coarse-pointer, constrained-power and hidden-tab state, so
  // this single gate is the sanctioned "should ambient motion run" flag. The
  // .ds-scroll-reveal class is additionally reduce-neutralized in transitions.css
  // and degrades to static content where the view() timeline is unsupported.
  const sectionRevealClass = useMotionPolicy().allowAmbientMotion
    ? "ds-scroll-reveal"
    : undefined;
  // Permission filtering happens early so the action count drives both
  // rendering and layout decisions (e.g. no empty action bar wrapper).
  const headerActions = filterSurfaceActions(
    config.behavior.headerActions,
    config.access
  );
  // Spacing and heading hierarchy resolve from personality tokens, allowing
  // the same dashboard config to render differently across product profiles.
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const visibleSections = (config.presentation.sections ?? [])
    .filter((section) => !(isMobile && section.hideOnMobile))
    .sort((left, right) => {
      if (!isMobile) {
        return 0;
      }

      return (
        (left.mobilePriority ?? Number.MAX_SAFE_INTEGER) -
        (right.mobilePriority ?? Number.MAX_SAFE_INTEGER)
      );
    });
  const stats =
    isMobile && config.visual.mobileStatsLimit
      ? (config.behavior.stats ?? []).slice(0, config.visual.mobileStatsLimit)
      : config.behavior.stats;
  const statsColumns = resolveResponsiveColumnCount(
    responsiveLayout,
    config.visual.statsColumns ?? 4,
    Math.min(config.visual.statsColumns ?? 4, 2),
    1
  );
  const sectionsColumns =
    isMobile && config.visual.stackSectionsOnMobile !== false
      ? 1
      : isMobile
      ? config.visual.mobileSectionsColumns ?? 1
      : config.visual.sectionsColumns ?? 12;

  // C2 convergence: the SAME deterministic solver WidgetBoard uses resolves
  // section spans (since C2c for EVERY numeric-span sections area — the
  // flag only decides solver freedom vs pinned spans, see below). Sections
  // keep their DOM order (the solver never backfills); under solver freedom
  // spans may grow into row residue or shrink toward their mobile span to
  // complete a row, so authored 5+5 / 6+4 combinations stop stranding dead
  // columns. The one-column mobile stacking path is the single remaining
  // early-out — with one column there are zero packing decisions to make.
  // C2b: the packing posture is CONTAINER-first through the shared adaptive
  // runtime (one observer on the sections region); the viewport breakpoint
  // is only the unmeasurable-environment fallback (SSR/jsdom).
  const sectionsRegionRef = useRef<HTMLDivElement | null>(null);
  const packedPosture = useContainerPosture(
    sectionsRegionRef,
    isMobile ? "compact" : "expanded"
  );

  // C2c: NO packing bypass. Every section lowers into the same solver —
  // `adaptivePacking: true` gives the solver freedom (shrink toward the
  // mobile span, grow into row residue); the authored posture PINS each
  // span (min = preferred = max), which the solver reproduces exactly
  // (row-major, no backfill, pinned spans are untouchable), so authored
  // geometry is now an INTENT, not a second layout engine. The single
  // remaining early-out is one-column mobile stacking: with one column
  // there are zero packing decisions to make.
  const adaptiveEnvironment = useAdaptiveEnvironment();
  // The solver reasons over NUMERIC capacity. A responsive/auto template is
  // a different layout model (CSS-owned tracks), not packing intent — it has
  // no numeric spans to pin, so it stays with its authored template.
  const numericSectionsColumns =
    typeof sectionsColumns === 'number' ? sectionsColumns : null;
  const solverColumns = config.visual.adaptivePacking
    ? 12
    : numericSectionsColumns ?? 12;
  const packedSectionSpans = useMemo(() => {
    if (isMobile && config.visual.stackSectionsOnMobile !== false) {
      return undefined;
    }
    const free = config.visual.adaptivePacking === true;
    if (!free && numericSectionsColumns === null) return undefined;
    const numericSpan = (value: unknown): number | null =>
      typeof value === 'number' && Number.isFinite(value) ? value : null;
    const contracts = visibleSections.map((section, index) => {
      const authoredRaw = isMobile
        ? numericSpan(section.mobileSpan) ?? numericSpan(section.span)
        : numericSpan(section.span);
      const authored = Math.max(
        1,
        Math.min(solverColumns, authoredRaw ?? solverColumns)
      );
      const min = free
        ? Math.max(
            1,
            Math.min(numericSpan(section.mobileSpan) ?? authored, authored)
          )
        : authored;
      return {
        id: section.key,
        accessibleTitle: String(section.key ?? index),
        minSpan: { cols: min },
        preferredSpan: { cols: authored },
        maxSpan: { cols: free ? solverColumns : authored },
        blockPolicy: { mode: 'intrinsic' as const, minRows: 1 },
        contentModes: [{ id: 'full' as const, minSpan: { cols: 1 } }],
        priority: 'primary' as const,
        overflowPolicy: 'shrink-to-min' as const,
        visualReorder: 'forbid' as const,
      };
    });
    // Door 2 only; the real environment invalidates through the memo deps
    // (adaptiveEnvironment identity folds dir/locale/density/type/fonts/
    // artifact-revision — door 1).
    const result = resolveAdaptiveLayout(contracts, [], {
      cols: solverColumns,
      posture: packedPosture,
      // E2: the tenant responsive posture biases where each section resolves
      // inside its authored min..max. Sections columns are JS-owned here (the
      // same number is handed to the grid as a prop), so unlike WidgetBoard
      // this surface has no CSS-pinned track count to contradict.
      spanBias: adaptiveEnvironment.posture.spanBias,
    });
    return Object.fromEntries(
      result.placements.map((placement) => [placement.itemId, placement.colSpan])
    ) as Record<string, number>;
  }, [
    config.visual.adaptivePacking,
    config.visual.stackSectionsOnMobile,
    isMobile,
    packedPosture,
    visibleSections,
    solverColumns,
    numericSectionsColumns,
    adaptiveEnvironment,
  ]);

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {headerActions.map((action) => (
        <Button
          key={action.id}
          variant={resolveSurfaceButtonVariant(action.variant)}
          disabled={action.disabled}
          loading={action.loading}
          icon={action.icon}
          onClick={() => action.onClick?.(undefined as void)}
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );

  // Error state renders full page chrome so the user can still use header
  // actions (e.g. refresh) even when the data load failed.
  if (error) {
    return (
      <PageShellSurface
        chrome={config.presentation.chrome}
        actions={actionsNode}
        loading={false}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const dashboardContent = (
    <Stack
      className="ds-surface ds-dashboard"
      data-part="root"
      data-mobile={isMobile ? "true" : "false"}
      data-loading={loading ? "true" : "false"}
      data-heading-weight={profileDefaults.headerWeight}
      spacing={sectionSpacing}
    >
      {config.presentation.headerContent}

      {loading ? (
        /* Mirror skeleton: the board's geometry is preserved through the
           load — the page chrome
           stays live and the swap is paint-only. The page-shell loading
           early-return is NOT used here because it would drop the board. */
        <DashboardSkeleton
          statsCount={stats?.length ?? 0}
          /* resolveResponsiveColumnCount clamps to the 1–12 literal range by
             contract, so the resolved count is always a valid GridColumns. */
          statsColumns={statsColumns as GridColumns}
          sections={visibleSections}
          sectionsColumns={sectionsColumns}
          sectionSpacing={sectionSpacing}
          cardVariant={profileDefaults.cardVariant}
          isMobile={isMobile}
          stackSectionsOnMobile={config.visual.stackSectionsOnMobile}
        />
      ) : (
        <>
          {/* Stats stay optional so the same surface can power sparse and dense dashboards. */}
          {stats && stats.length > 0 && (
            <PatternStatsGrid
              stats={stats}
              columns={statsColumns}
              variant="glass"
              onStatClick={config.behavior.onStatClick}
            />
          )}

          {visibleSections.length === 0 && (!stats || stats.length === 0) ? (
            <SurfaceEmptyState action={headerActions[0]} />
          ) : null}

          {visibleSections.length > 0 && (
            /* Packed spans are resolved on a 12-column tier, so the grid
               must expose those 12 tracks whenever the solver is active. */
            <Grid
              ref={sectionsRegionRef}
              columns={packedSectionSpans ? solverColumns : sectionsColumns}
              gap={sectionSpacing}
            >
              {visibleSections.map((section) => {
                // Sections can opt out of the card shell when the content already brings its own chrome.
                const sectionContent =
                  section.chrome === "plain" ? (
                    section.content
                  ) : (
                    <Card variant={profileDefaults.cardVariant}>
                      <Card.Body>
                        <Stack spacing="md">
                          {(section.title ||
                            section.description ||
                            section.actions) && (
                            <Flex justify="between" align="start" gap={12}>
                              <Stack spacing="xs">
                                {section.title && (
                                  <Text
                                    className="ds-dashboard__section-title"
                                    data-part="section-title"
                                    textStyle="sectionTitle"
                                  >
                                    {section.title}
                                  </Text>
                                )}
                                {section.description && (
                                  <Text
                                    className="ds-dashboard__muted-text"
                                    data-part="section-description"
                                  >
                                    {section.description}
                                  </Text>
                                )}
                              </Stack>
                              {section.actions}
                            </Flex>
                          )}
                          {section.content}
                        </Stack>
                      </Card.Body>
                    </Card>
                  );

                return (
                  <Grid.Item
                    key={section.key}
                    className={sectionRevealClass}
                    span={
                      isMobile && config.visual.stackSectionsOnMobile !== false
                        ? undefined
                        : packedSectionSpans
                        ? packedSectionSpans[section.key]
                        : isMobile
                        ? section.mobileSpan
                        : section.span
                    }
                  >
                    {sectionContent}
                  </Grid.Item>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Stack>
  );

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the board-mirror skeleton, so the shell's loading
       early-return is intentionally not engaged. */
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={false}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>
            <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
              {dashboardContent}
            </StaggerChildren>
          </FadeIn>
        ) : (
          dashboardContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
