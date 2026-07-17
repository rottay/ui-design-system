import { ShowroomLink as Link } from "@/components/showroom-link";
import {
  DocsMetricTile,
  DocsPanel,
  SectionDivider,
} from "@/components/showroom-ui";
import { notFound } from "next/navigation";
import { Badge, Box, Card, Flex, Stack, Text } from "@rottay/design-system";
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from "@/components/playground/surface-tokens";
import {
  charts,
  patternGroups,
  patternsByGroup,
  type PatternEntry,
  type PatternGroup,
} from "@/data/registry";

const GROUP_PROFILES: Record<
  PatternGroup,
  {
    summary: string;
    evaluate: string[];
    structures: string[];
    surfaces: string[];
  }
> = {
  data: {
    summary:
      "Data patterns are where the showroom proves density, scan ergonomics, and operator confidence beyond a single widget.",
    evaluate: ["scan speed", "bulk action clarity", "empty and dense states"],
    structures: ["CollectionHeader", "TableToolbar", "ActiveFiltersBar"],
    surfaces: ["ListSurface", "ReportSurface", "CollectionWorkspaceSurface"],
  },
  forms: {
    summary:
      "Form patterns show whether the design system can guide creation, editing, filtering, and review without devolving into bespoke UI.",
    evaluate: ["field grouping", "validation pacing", "progress visibility"],
    structures: ["FormHeader", "FormSections", "DetailHeader"],
    surfaces: ["FormSurface", "WizardSurface", "DetailFormSurface"],
  },
  visualization: {
    summary:
      "Visualization patterns demonstrate how information changes shape across time, lanes, locations, and hierarchies.",
    evaluate: ["signal emphasis", "interaction affordances", "cross-filtering"],
    structures: ["DashboardHeader", "StatsHeader", "CollectionHeader"],
    surfaces: ["VisualizationSurface", "DashboardSurface", "SchedulerSurface"],
  },
  communication: {
    summary:
      "Communication patterns carry messaging, presence, alerts, and review loops that need to feel live but never noisy.",
    evaluate: [
      "conversation clarity",
      "status readability",
      "response hierarchy",
    ],
    structures: ["DetailHeader", "WorkbenchHeader", "PageShell"],
    surfaces: ["ChatSurface", "ActivitySurface", "NotificationSurface"],
  },
  workflow: {
    summary:
      "Workflow patterns prove the design system can sustain operational review, routing, approval, and queue management.",
    evaluate: ["decision speed", "status progression", "exception handling"],
    structures: ["CollectionHeader", "SelectionPreviewRail", "TableToolbar"],
    surfaces: ["DecisionInboxSurface", "OperationalSurface", "KanbanSurface"],
  },
  navigation: {
    summary:
      "Navigation patterns help users switch context, invoke tools, and move around large systems without losing orientation.",
    evaluate: ["discoverability", "mode switching", "spatial memory"],
    structures: ["PageShell", "WorkbenchHeader", "SearchCommandBar"],
    surfaces: [
      "CollectionWorkspaceSurface",
      "CommandCenterSurface",
      "RecordWorkbenchSurface",
    ],
  },
  feedback: {
    summary:
      "Feedback patterns adapt confirmation and interruption flows to the current device without forking product behavior.",
    evaluate: ["responsive posture", "dismissal clarity", "focus continuity"],
    structures: ["LoadingOverlay", "ActionDock", "MobileHeader"],
    surfaces: ["FormSurface", "DetailSurface", "CommandCenterSurface"],
  },
  misc: {
    summary:
      "Misc patterns collect high-signal composite pieces that still need strong documentation because they shape perceived polish fast.",
    evaluate: ["cohesion", "surface readiness", "brand adaptability"],
    structures: ["PageShell", "DashboardInsights", "DetailHeader"],
    surfaces: ["MarketingSurface", "ProfileSurface", "PricingSurface"],
  },
};

const CARD_SURFACE =
  SHOWROOM_SURFACES.surface;
const PANEL_SURFACE =
  SHOWROOM_SURFACES.subtle;
const INSET_SURFACE =
  mixWithCanvas('var(--ds-color-primary, #60a5fa)', 4, SHOWROOM_SURFACES.canvas);
const SUBTLE_BORDER =
  `1px solid ${SHOWROOM_SURFACES.border}`;
const SHADOW = SHOWROOM_SURFACES.shadow;

function groupLabel(slug: PatternGroup): string {
  const group = patternGroups.find((item) => item.slug === slug);
  return group?.label ?? slug;
}

function PatternReferenceCard({
  entry,
  href,
  inspectPrompt,
}: {
  entry: PatternEntry;
  href: string;
  inspectPrompt: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        className="showroom-patterns-group-card"
        style={{
          height: "100%",
          padding: 18,
          border: SUBTLE_BORDER,
          background: `linear-gradient(180deg, ${mixWithSurface(
            'var(--ds-color-primary-500)',
            4,
            SHOWROOM_SURFACES.subtle,
          )} 0%, ${CARD_SURFACE} 100%)`,
          cursor: "pointer",
          boxShadow: SHADOW,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 296,
          containerType: "inline-size",
          containerName: "showroom-pattern-card",
        }}
      >
        <Stack spacing="sm" fullWidth style={{ height: "100%" }}>
          <Flex
            align="start"
            justify="between"
            gap={12}
            style={{ flexWrap: "wrap" }}
          >
            <Box style={{ minWidth: 0, flex: "1 1 220px" }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  color: "var(--ds-color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Pattern
              </Text>
              <Text
                as={"h3" as any}
                size="lg"
                weight="semibold"
                style={{
                  display: "block",
                  marginTop: 6,
                  color: "var(--ds-color-text-primary)",
                  lineHeight: 1.15,
                }}
              >
                {entry.name}
              </Text>
            </Box>
            <Badge
              variant={entry.engines.length === 3 ? "success" : "secondary"}
            >
              {entry.engines.length}/3 engines
            </Badge>
          </Flex>

          <Text
            size="sm"
            style={{
              display: "block",
              color: "var(--ds-color-text-secondary)",
              lineHeight: 1.55,
              overflowWrap: "anywhere",
            }}
          >
            {entry.description}
          </Text>

          <Box
            style={{
              marginTop: "auto",
              padding: "12px 14px",
              borderRadius: 14,
              background: PANEL_SURFACE,
              border: SUBTLE_BORDER,
              minHeight: 96,
            }}
          >
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: "block",
                color: "var(--ds-color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Evaluate
            </Text>
            <Text
              size="sm"
              weight="medium"
              style={{
                display: "block",
                marginTop: 6,
                lineHeight: 1.45,
                overflowWrap: "anywhere",
              }}
            >
              {inspectPrompt}
            </Text>
          </Box>

          <Flex
            className="showroom-patterns-group-card-footer"
            align="center"
            justify="between"
            gap={10}
            style={{ flexWrap: "wrap", marginTop: "auto" }}
          >
            <Flex gap={6} style={{ flexWrap: "wrap" }}>
              {entry.engines.map((engine) => (
                <Box
                  key={engine}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "var(--ds-color-neutral-100)",
                    border: SUBTLE_BORDER,
                  }}
                >
                  <Text
                    size="xs"
                    style={{
                      display: "block",
                      color: "var(--ds-color-text-secondary)",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    {engine}
                  </Text>
                </Box>
              ))}
            </Flex>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: "block",
                color: "var(--ds-color-primary-600)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1.4,
              }}
            >
              Open Reference
            </Text>
          </Flex>
        </Stack>
      </Card>
    </Link>
  );
}

export function generateStaticParams() {
  return patternGroups.map((group) => ({ group: group.slug }));
}

export default async function PatternGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as PatternGroup;
  const entries = patternsByGroup[groupSlug] ?? [];
  const label = groupLabel(groupSlug);
  const profile = GROUP_PROFILES[groupSlug];
  const featuredPatterns = entries.slice(0, 4);

  if (!profile) {
    notFound();
  }

  return (
    <Stack spacing="md" fullWidth>
      <Card
        style={{
          padding: 22,
          border: SUBTLE_BORDER,
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 52%, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-tertiary)) 100%)",
          boxShadow: SHADOW,
          overflow: "hidden",
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex
            align="center"
            justify="between"
            gap={12}
            style={{ flexWrap: "wrap" }}
          >
            <Link href="/patterns" style={{ textDecoration: "none" }}>
              <Flex align="center" gap={8}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: "var(--ds-color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Patterns
                </Text>
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>
                  /
                </Text>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{ color: "var(--ds-color-text-primary)" }}
                >
                  {label}
                </Text>
              </Flex>
            </Link>

            <Flex gap={8} style={{ flexWrap: "wrap" }}>
              <Badge variant="secondary">Reusable composites</Badge>
              <Badge variant="primary">{entries.length} patterns</Badge>
            </Flex>
          </Flex>

          <SectionDivider />

          <Box
            className="showroom-patterns-group-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 18,
              alignItems: "start",
            }}
          >
            <Stack spacing="sm" fullWidth>
              <Text as={"h1" as any} size="xl" weight="bold" style={{ display: "block" }}>
                {label}
              </Text>
              <Text
                size="md"
                style={{
                  display: "block",
                  color: "var(--ds-color-text-secondary)",
                  maxWidth: 760,
                  lineHeight: 1.65,
                }}
              >
                {profile.summary}
              </Text>
              <Text
                size="sm"
                style={{
                  display: "block",
                  color: "var(--ds-color-text-muted)",
                  maxWidth: 720,
                  lineHeight: 1.55,
                }}
              >
                Use this page to narrow the lane. Open an individual pattern
                when you want the live DS and runtime reference.
              </Text>
              <Box
                style={{
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: "block",
                    color: "var(--ds-color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Read this page for
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: "block",
                    marginTop: 8,
                    color: "var(--ds-color-text-secondary)",
                    lineHeight: 1.55,
                  }}
                >
                  Group-level fit, evaluation lenses, and the most likely structure and surface pairings.
                </Text>
              </Box>
            </Stack>

            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
              }}
            >
              <DocsMetricTile
                label="Patterns"
                value={`${entries.length}`}
                detail="Indexed in this group"
                tone="accent"
              />
              <DocsMetricTile
                label="Inspect first"
                value={profile.evaluate[0]}
                detail="Suggested first evaluation lens"
                tone="warning"
              />
              <DocsMetricTile
                label="Common surface"
                value={profile.surfaces[0]}
                detail="Typical landing context"
              />
            </Box>
          </Box>
        </Stack>
      </Card>

      <Box
        className="showroom-patterns-group-support-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        <DocsPanel
          eyebrow="Audit lens"
          title="What to evaluate"
          description="Judge the group by reusable behavior and operator clarity before admiring individual modules."
          tone="warning"
        >
          <Stack spacing="xs" fullWidth>
            {profile.evaluate.map((item) => (
              <Box
                key={item}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                  minHeight: 58,
                }}
              >
                <Text
                  size="sm"
                  style={{ display: "block", lineHeight: 1.5, overflowWrap: "anywhere" }}
                >
                  {item}
                </Text>
              </Box>
            ))}
          </Stack>
        </DocsPanel>

        <DocsPanel
          eyebrow="Structure pairings"
          title="Common structure pairing"
          description="Patterns become easier to judge when you picture the page chrome they normally sit inside."
        >
          <Stack spacing="xs" fullWidth>
            {profile.structures.map((item) => (
              <Box
                key={item}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                  minHeight: 58,
                }}
              >
                <Text
                  size="sm"
                  style={{ display: "block", lineHeight: 1.5, overflowWrap: "anywhere" }}
                >
                  {item}
                </Text>
              </Box>
            ))}
          </Stack>
        </DocsPanel>

        <DocsPanel
          eyebrow="Surface context"
          title="Typical surfaces"
          description="These are the route-level homes where this group usually proves its value."
        >
          <Stack spacing="xs" fullWidth>
            {profile.surfaces.map((item) => (
              <Box
                key={item}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                  minHeight: 58,
                }}
              >
                <Text
                  size="sm"
                  style={{ display: "block", lineHeight: 1.5, overflowWrap: "anywhere" }}
                >
                  {item}
                </Text>
              </Box>
            ))}
          </Stack>
        </DocsPanel>

        <DocsPanel
          eyebrow="Fastest entry"
          title="Start with these"
          description="These are the quickest paths into live DS and runtime usage for this group."
          actions={<Badge variant="secondary">{featuredPatterns.length} picks</Badge>}
          tone="accent"
        >
          <Stack spacing="xs" fullWidth>
            {featuredPatterns.length > 0 ? (
              featuredPatterns.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/patterns/${groupSlug}/${entry.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: INSET_SURFACE,
                      border: SUBTLE_BORDER,
                      minHeight: 74,
                    }}
                  >
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{
                        display: "block",
                        color: "var(--ds-color-text-primary)",
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {entry.name}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: "block",
                        marginTop: 6,
                        color: "var(--ds-color-text-secondary)",
                        lineHeight: 1.45,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {entry.description}
                    </Text>
                  </Box>
                </Link>
              ))
            ) : (
              <Text
                size="sm"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                No patterns are registered in this group yet.
              </Text>
            )}
          </Stack>
        </DocsPanel>
      </Box>

      {groupSlug === "visualization" ? (
        <Link
          href="/patterns/visualization/charts"
          style={{ textDecoration: "none" }}
        >
          <DocsPanel
            hoverable
            eyebrow="Visualization branch"
            title="Open the chart showroom"
            description="Charts keep their own comparison flow for choosing the right data story and contract."
            actions={<Badge variant="success">{charts.length} chart types</Badge>}
            tone="warning"
            style={{
              border:
                "1px solid color-mix(in srgb, var(--ds-color-warning-500) 24%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))",
              background:
                "color-mix(in srgb, var(--ds-color-warning-500) 8%, var(--ds-surface-card, var(--ds-color-bg-elevated)))",
              cursor: "pointer",
            }}
          >
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: "wrap" }}>
              <Text
                size="sm"
                style={{
                  display: "block",
                  color: "var(--ds-color-text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                Use it when the decision is no longer “which pattern group?” but “which chart contract tells the story cleanly?”
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  color: "var(--ds-color-warning-700)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Open comparison flow
              </Text>
            </Flex>
          </DocsPanel>
        </Link>
      ) : null}

      <DocsPanel
        eyebrow="Catalog"
        title="Browse patterns"
        description="Open a pattern to inspect live DS treatment, engine coverage, and where it fits in the broader system."
        actions={<Badge variant="secondary">{entries.length} indexed</Badge>}
        tone="accent"
      >
        {entries.length > 0 ? (
          <Box
            className="showroom-patterns-group-catalog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {entries.map((entry, index) => (
              <PatternReferenceCard
                key={entry.slug}
                entry={entry}
                href={`/patterns/${groupSlug}/${entry.slug}`}
                inspectPrompt={profile.evaluate[index % profile.evaluate.length]}
              />
            ))}
          </Box>
        ) : (
          <Box
            style={{
              padding: 28,
              borderRadius: 20,
              border: SUBTLE_BORDER,
              background: PANEL_SURFACE,
            }}
          >
            <Stack spacing="sm" align="center">
              <Text as={"h2" as any} size="lg" weight="semibold">
                No patterns registered yet for {label}
              </Text>
              <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                This group page is ready to absorb new entries as they land in the registry.
              </Text>
            </Stack>
          </Box>
        )}
      </DocsPanel>

      <style>{`
        .showroom-patterns-group-catalog-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .showroom-patterns-group-support-grid > * {
          height: auto !important;
          align-self: start;
        }

        @container showroom-content (max-width: 1720px) {
          .showroom-patterns-group-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1210px) {
          .showroom-patterns-group-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1260px) {
          .showroom-patterns-group-support-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 920px) {
          .showroom-patterns-group-hero-grid,
          .showroom-patterns-group-support-grid,
          .showroom-patterns-group-catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-pattern-card (max-width: 360px) {
          .showroom-patterns-group-card-footer {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>
    </Stack>
  );
}
