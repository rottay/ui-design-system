import { ShowroomLink as Link } from "@/composition/components/showroom-link";
import { Badge, Box, Card, Flex, Stack, Text } from "@/composition/components/showroom-ui";
import { SHOWROOM_SURFACES } from "@/composition/components/playground/surface-tokens";
import {
  patternGroups,
  patterns,
  patternsByGroup,
  type PatternGroup,
} from "@/data/registry/patterns";
import { charts } from "@/data/registry/charts";
import {
  ActivityIcon,
  BarChart3Icon,
  GitCompareIcon,
  MessageSquareIcon,
  ScanSearchIcon,
  SparklesIcon,
  ZapIcon,
} from "@rottay/design-system/icons";

interface PatternEditorial {
  promise: string;
  description: string;
  bestFor: string;
  pairedSurfaces: string[];
  tint: string;
  accent: string;
  icon: React.ReactNode;
}

const PATTERN_EDITORIAL: Record<PatternGroup, PatternEditorial> = {
  data: {
    promise: "Package repeatable data exploration work.",
    description:
      "Data patterns stop teams from rebuilding table state, views, stats, bulk selection, and collection affordances screen by screen.",
    bestFor:
      "Collections, reports, grids, saved views, and repeatable data operations",
    pairedSurfaces: [
      "ListSurface",
      "ReportSurface",
      "CollectionWorkspaceSurface",
    ],
    tint: "var(--ds-color-primary-50)",
    accent: "var(--ds-color-primary-600)",
    icon: <BarChart3Icon size={20} />,
  },
  forms: {
    promise: "Turn structured capture flows into reusable systems.",
    description:
      "Forms patterns package field orchestration, rules, and multi-step authoring so teams can think in workflows instead of isolated inputs.",
    bestFor:
      "Setup flows, filters, invoice flows, wizards, and guided drafting",
    pairedSurfaces: ["FormSurface", "WizardSurface", "DetailFormSurface"],
    tint: "var(--ds-color-success-50)",
    accent: "var(--ds-color-success-700)",
    icon: <SparklesIcon size={20} />,
  },
  visualization: {
    promise: "Reveal systems, trends, and spatial relationships.",
    description:
      "Visualization patterns cover the interactive models behind calendars, kanban boards, maps, trees, timelines, and the dedicated charts catalog.",
    bestFor:
      "Dashboards, planning tools, analytics, scheduling, spatial stories",
    pairedSurfaces: [
      "DashboardSurface",
      "VisualizationSurface",
      "KanbanSurface",
    ],
    tint: "var(--ds-color-warning-50)",
    accent: "var(--ds-color-warning-700)",
    icon: <ActivityIcon size={20} />,
  },
  communication: {
    promise: "Make activity and collaboration legible.",
    description:
      "Communication patterns turn feeds, comments, assistant panels, and notification behaviour into reusable product-grade modules.",
    bestFor:
      "Commenting, AI assistant panels, activity logs, notification centers",
    pairedSurfaces: ["ChatSurface", "NotificationSurface", "ActivitySurface"],
    tint: "var(--ds-color-primary-50)",
    accent: "var(--ds-color-primary-700)",
    icon: <MessageSquareIcon size={20} />,
  },
  workflow: {
    promise: "Model operational review and decision loops.",
    description:
      "Workflow patterns exist where UI carries process: approvals, moderation, staffing, ledgers, and structured review queues.",
    bestFor:
      "Approvals, moderation, operations backoffices, scheduling matrices",
    pairedSurfaces: [
      "DecisionInboxSurface",
      "OperationalSurface",
      "SchedulerSurface",
    ],
    tint: "var(--ds-color-error-50)",
    accent: "var(--ds-color-error-700)",
    icon: <GitCompareIcon size={20} />,
  },
  navigation: {
    promise: "Give power users faster ways to move and switch context.",
    description:
      "Navigation patterns handle command layers, workspace switching, shortcuts, locale changes, and environment context beyond basic tabs and menus.",
    bestFor:
      "Power user shells, multi-workspace tools, global search, cross-app utilities",
    pairedSurfaces: [
      "CollectionWorkspaceSurface",
      "CommandCenterSurface",
      "RecordWorkbenchSurface",
    ],
    tint: "var(--ds-color-neutral-100)",
    accent: "var(--ds-color-text-primary, #111827)",
    icon: <ScanSearchIcon size={20} />,
  },
  misc: {
    promise: "House specialised product modules that still deserve reuse.",
    description:
      "Misc is where branded or niche but still repeatable modules live, from pricing tables and file managers to token inspectors and workbench headers.",
    bestFor:
      "Product-specific widgets that appear in more than one app or screen",
    pairedSurfaces: [
      "PricingSurface",
      "RecordWorkbenchSurface",
      "MarketingSurface",
    ],
    tint: "var(--ds-color-primary-50)",
    accent: "var(--ds-color-primary-600)",
    icon: <ZapIcon size={20} />,
  },
};

const FEATURED_PATHS = [
  {
    title: "Operate data-rich workspaces",
    href: "/patterns/data",
    badge: "Collections",
    description:
      "Search, filtering, saved views, statistics, and dense data operations.",
  },
  {
    title: "Guide capture and authoring",
    href: "/patterns/forms",
    badge: "Authoring",
    description:
      "Validation choreography, section pacing, and multi-step setup logic.",
  },
  {
    title: "Visualize live systems",
    href: "/patterns/visualization",
    badge: "Analysis",
    description:
      "Planning, scheduling, analytics, kanban, maps, and visual interpretation.",
  },
  {
    title: "Coordinate activity and review",
    href: "/patterns/workflow",
    badge: "Operations",
    description:
      "Review queues, activity streams, and team-facing decision loops.",
  },
];

const PATTERN_READING_POINTS = [
  {
    label: "Use patterns when",
    detail:
      "The task needs durable state, review flow, or behavior that will repeat across multiple screens.",
  },
  {
    label: "Stay at primitives when",
    detail:
      "The work is still local UI composition, spacing cleanup, or a one-off interaction without packaged logic.",
  },
  {
    label: "Pair with surfaces when",
    detail:
      "The task module is stable enough to slot into a broader page contract or workspace shell.",
  },
];

const CARD_SURFACE =
  SHOWROOM_SURFACES.surface;
const PANEL_SURFACE =
  SHOWROOM_SURFACES.subtle;
const SUBTLE_BORDER =
  `1px solid ${SHOWROOM_SURFACES.border}`;
const SHADOW = SHOWROOM_SURFACES.shadow;
const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 30%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 10%, transparent), transparent 34%)';

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: 16,
        borderRadius: 20,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 92%, var(--ds-color-primary-500) 8%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        border: SUBTLE_BORDER,
        boxShadow: SHADOW,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 136,
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
        {label}
      </Text>
      <Text size="xl" weight="bold" style={{ display: "block", lineHeight: 1.05 }}>
        {value}
      </Text>
      <Box
        aria-hidden="true"
        style={{
          height: 1,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, var(--ds-color-border), transparent)",
        }}
      />
      <Text
        size="xs"
        style={{
          display: "block",
          color: "var(--ds-color-text-secondary)",
          lineHeight: 1.5,
          overflowWrap: "anywhere",
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

export default function PatternsPage() {
  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 24,
          border: SUBTLE_BORDER,
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 50%, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-tertiary)) 100%)",
          boxShadow: SHADOW,
          position: "relative",
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: HERO_OVERLAY,
            pointerEvents: "none",
          }}
        />

        <Stack spacing="lg" style={{ position: "relative" }}>
          <Flex
            align="center"
            justify="between"
            gap={12}
            style={{ flexWrap: "wrap" }}
          >
            <Badge variant="primary">{patterns.length} task-level modules</Badge>
            <Badge variant="secondary">Reference index</Badge>
          </Flex>

          <Box
            className="showroom-patterns-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.08fr) minmax(320px, 0.92fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <Box
              style={{
                padding: 22,
                borderRadius: 24,
                border: SUBTLE_BORDER,
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)",
                minWidth: 0,
              }}
            >
              <Stack spacing="sm">
                <Text as={"h1" as any} size="2xl" weight="bold" style={{ display: "block" }}>
                  Patterns
                </Text>
                <Text
                  size="md"
                  style={{
                    display: "block",
                    maxWidth: 760,
                    color: "var(--ds-color-text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  Patterns are where the design system starts feeling productive. They package
                  recurring tasks so teams can ship review flows, workspaces, and dashboards
                  without rebuilding workflow logic screen by screen.
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: "block",
                    color: "var(--ds-color-text-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  Use this page as a routing map. Open a group or pattern detail when you want the
                  live DS/runtime reference.
                </Text>
                <Box
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(90deg, var(--ds-color-border), transparent)",
                  }}
                />
                <Flex gap={8} style={{ flexWrap: "wrap", marginTop: 4 }}>
                  {["Task modules", "Workflow logic", "Reusable screens"].map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            </Box>

            <Stack spacing="md" style={{ minWidth: 0 }}>
              <Box
                style={{
                  padding: 20,
                  borderRadius: 24,
                  border: SUBTLE_BORDER,
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 5%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)",
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" justify="between" gap={12} style={{ flexWrap: "wrap" }}>
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
                      Atlas snapshot
                    </Text>
                    <Badge variant="secondary">System scale</Badge>
                  </Flex>
                  <Box
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(90deg, var(--ds-color-border), transparent)",
                    }}
                  />
                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <MetricTile
                      label="Pattern groups"
                      value={`${patternGroups.length}`}
                      detail="Capability shelves to browse first."
                    />
                    <MetricTile
                      label="Chart types"
                      value={`${charts.length}`}
                      detail="Dedicated chart grammar catalog."
                    />
                    <MetricTile
                      label="Engines"
                      value="3"
                      detail="Classic, modern, and rustic references."
                    />
                    <MetricTile
                      label="Focus"
                      value="Task flows"
                      detail="Reusable behavior instead of raw parts."
                    />
                  </Box>
                </Stack>
              </Box>

              <Box
                style={{
                  padding: 18,
                  borderRadius: 24,
                  border: SUBTLE_BORDER,
                  background: PANEL_SURFACE,
                }}
              >
                <Stack spacing={10}>
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
                    How to read the shelf
                  </Text>
                  <Box
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(90deg, var(--ds-color-border), transparent)",
                    }}
                  />
                  {PATTERN_READING_POINTS.map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: SUBTLE_BORDER,
                        background: CARD_SURFACE,
                      }}
                    >
                      <Text size="xs" weight="semibold" style={{ display: "block" }}>
                        {item.label}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: "block",
                          marginTop: 6,
                          color: "var(--ds-color-text-secondary)",
                          lineHeight: 1.45,
                        }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            style={{
              padding: 20,
              borderRadius: 24,
              border: SUBTLE_BORDER,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)",
            }}
          >
            <Stack spacing="md">
              <Flex align="center" justify="between" gap={12} style={{ flexWrap: "wrap" }}>
                <Box>
                  <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: "block" }}>
                    Fast paths
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      display: "block",
                      marginTop: 6,
                      color: "var(--ds-color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Jump straight to the shelf that best matches the product job in front of you.
                  </Text>
                </Box>
                <Badge variant="secondary">Routing shortcuts</Badge>
              </Flex>
              <Box
                style={{
                  height: 1,
                  background:
                    "linear-gradient(90deg, var(--ds-color-border), transparent)",
                }}
              />

              <Box
                className="showroom-patterns-path-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: 14,
                }}
              >
                {FEATURED_PATHS.map((path) => (
                  <Link
                    key={path.href}
                    href={path.href}
                    style={{ textDecoration: "none" }}
                  >
                    <Box
                      style={{
                        height: "100%",
                        padding: 16,
                        borderRadius: 20,
                        border: SUBTLE_BORDER,
                        background:
                          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-panel, var(--ds-color-bg-tertiary))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        minHeight: 132,
                      }}
                    >
                      <Flex align="center" justify="between" gap={8}>
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
                          {path.title}
                        </Text>
                        <Badge>{path.badge}</Badge>
                      </Flex>
                      <Box
                        style={{
                          height: 1,
                          background:
                            "linear-gradient(90deg, var(--ds-color-border), transparent)",
                        }}
                      />
                      <Text
                        size="xs"
                        style={{
                          display: "block",
                          color: "var(--ds-color-text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {path.description}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </Box>

              <Link
                href="/patterns/visualization/charts"
                style={{ textDecoration: "none" }}
              >
                  <Box
                    style={{
                      padding: 16,
                      borderRadius: 20,
                      border:
                        "1px solid color-mix(in srgb, var(--ds-color-warning-500) 24%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))",
                      background:
                        "color-mix(in srgb, var(--ds-color-warning-500) 8%, var(--ds-surface-card, var(--ds-color-bg-elevated)))",
                      minWidth: 0,
                    }}
                  >
                  <Flex
                    align="center"
                    justify="between"
                    gap={12}
                    style={{ flexWrap: "wrap" }}
                  >
                    <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                      <ActivityIcon size={18} />
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          size="sm"
                          weight="semibold"
                          style={{
                            display: "block",
                            lineHeight: 1.4,
                            overflowWrap: "anywhere",
                          }}
                        >
                          Need the chart catalog?
                        </Text>
                        <Box
                          style={{
                            height: 1,
                            marginTop: 8,
                            background:
                              "linear-gradient(90deg, var(--ds-color-border), transparent)",
                          }}
                        />
                        <Text
                          size="xs"
                          style={{
                            display: "block",
                            color: "var(--ds-color-text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          Jump to charts when the question is chart grammar, not a broader
                          visualization workflow.
                        </Text>
                      </Box>
                    </Flex>
                    <Badge variant="secondary">{charts.length} chart types</Badge>
                  </Flex>
                </Box>
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          padding: 24,
          border: SUBTLE_BORDER,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)",
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: "wrap" }}>
            <Box>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: "block" }}>
                Browse by reusable job
              </Text>
              <Text
                size="sm"
                style={{
                  display: "block",
                  marginTop: 6,
                  color: "var(--ds-color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Each group is framed around a product capability question and the
                surfaces it most naturally powers.
              </Text>
            </Box>
            <Badge variant="secondary">Group atlas</Badge>
          </Flex>

          <Box
            style={{
              padding: 16,
              borderRadius: 20,
              border: SUBTLE_BORDER,
              background: PANEL_SURFACE,
            }}
          >
            <Text
              size="sm"
              style={{
                display: "block",
                color: "var(--ds-color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Open a group card when you need the promise, best-fit scenarios,
              common surface pairings, and a quick sample of modules in one place.
            </Text>
          </Box>

          <Box
            className="showroom-patterns-group-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 16,
            }}
          >
            {patternGroups.map((group) => {
              const editorial = PATTERN_EDITORIAL[group.slug];
              const entries = patternsByGroup[group.slug];

              return (
                <Link
                  key={group.slug}
                  href={`/patterns/${group.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    hoverable
                    style={{
                      height: "100%",
                      padding: 20,
                      cursor: "pointer",
                      border: SUBTLE_BORDER,
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                      boxShadow: SHADOW,
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      minHeight: 302,
                    }}
                  >
                    <Stack spacing="md" fullWidth style={{ height: "100%" }}>
                      <Flex
                        align="start"
                        justify="between"
                        gap={12}
                        style={{ flexWrap: "wrap" }}
                      >
                        <Flex
                          align="start"
                          gap={12}
                          style={{ minWidth: 0, flex: "1 1 200px" }}
                        >
                          <Box
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 14,
                              background: editorial.tint,
                              color: editorial.accent,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {editorial.icon}
                          </Box>
                          <Box style={{ minWidth: 0 }}>
                            <Text
                              as={"h3" as any}
                              size="lg"
                              weight="semibold"
                              style={{ display: "block", lineHeight: 1.25 }}
                            >
                              {group.label}
                            </Text>
                            <Text
                              size="xs"
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "var(--ds-color-text-muted)",
                                lineHeight: 1.5,
                              }}
                            >
                              {editorial.promise}
                            </Text>
                          </Box>
                        </Flex>
                        <Badge>{entries.length} items</Badge>
                      </Flex>

                      <Text
                        size="sm"
                        style={{
                          display: "block",
                          color: "var(--ds-color-text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        {editorial.description}
                      </Text>

                      <Box
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: 12,
                        }}
                      >
                        <Box
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: SUBTLE_BORDER,
                            background: editorial.tint,
                            minHeight: 104,
                          }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Use when
                          </Text>
                          <Text
                            size="sm"
                            style={{
                              display: "block",
                              marginTop: 8,
                              color: "var(--ds-color-text-secondary)",
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {editorial.promise}
                          </Text>
                        </Box>

                        <Box
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: SUBTLE_BORDER,
                            background: editorial.tint,
                            minHeight: 104,
                          }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Best for
                          </Text>
                          <Text
                            size="sm"
                            style={{
                              display: "block",
                              marginTop: 8,
                              color: "var(--ds-color-text-secondary)",
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {editorial.bestFor}
                          </Text>
                        </Box>
                      </Box>

                      <Box
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: SUBTLE_BORDER,
                          background: PANEL_SURFACE,
                          minHeight: 92,
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
                          Common surfaces
                        </Text>
                        <Flex gap={6} style={{ flexWrap: "wrap", marginTop: 8 }}>
                          {editorial.pairedSurfaces.slice(0, 2).map((surface) => (
                            <Badge key={surface} variant="secondary">
                              {surface}
                            </Badge>
                          ))}
                          {editorial.pairedSurfaces.length > 2 ? (
                            <Badge variant="secondary">
                              +{editorial.pairedSurfaces.length - 2} more
                            </Badge>
                          ) : null}
                        </Flex>
                      </Box>

                      <Box
                        style={{
                          marginTop: "auto",
                          padding: 12,
                          borderRadius: 14,
                          border: SUBTLE_BORDER,
                          background: CARD_SURFACE,
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
                          Sample modules
                        </Text>
                        <Flex gap={6} style={{ flexWrap: "wrap", marginTop: 8 }}>
                          {entries.slice(0, 3).map((entry) => (
                            <Box
                              key={entry.slug}
                              style={{
                                padding: "5px 10px",
                                borderRadius: 999,
                                background: "var(--ds-color-neutral-100)",
                              }}
                            >
                              <Text
                                size="xs"
                                style={{
                                  display: "block",
                                  color: "var(--ds-color-text-secondary)",
                                  fontFamily: "var(--font-geist-mono, monospace)",
                                  lineHeight: 1.45,
                                }}
                              >
                                {entry.name}
                              </Text>
                            </Box>
                          ))}
                          {entries.length > 3 && (
                            <Badge>+{entries.length - 3} more</Badge>
                          )}
                        </Flex>
                      </Box>
                    </Stack>
                  </Card>
                </Link>
              );
            })}
          </Box>
        </Stack>
      </Card>

      <style>{`
        @container showroom-content (max-width: 1120px) {
          .showroom-patterns-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
