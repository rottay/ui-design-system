"use client";

import { ShowroomLink as Link } from "@/components/showroom-link";
import { RuntimeFingerprint } from "@/components/runtime/runtime-fingerprint";
import { useShowroomRuntime } from "@/components/showroom-context";
import { Badge, Box, Card, Flex, Stack, Text, useTokens } from "@rottay/design-system";
import {
  BriefcaseIcon,
  SettingsIcon,
  SparklesIcon,
} from "@rottay/design-system/icons";

interface VerticalEntry {
  name: string;
  slug: string;
  description: string;
  engine: string;
  theme: string;
  density: string;
  showcaseLanes: number;
  livePreviewCount: number;
  productPosture: string;
  whyInspect: string;
  signatureMoment: string;
  stableSignal: string;
  adaptationFocus: string;
  highlights: string[];
  tint: string;
  border: string;
  icon: React.ReactNode;
}

const VERTICALS: VerticalEntry[] = [
  {
    name: "Platform",
    slug: "platform",
    description:
      "Multi-tenant admin control plane for identity, tenancy, permissions, features, and governance-heavy SaaS operations.",
    engine: "classic",
    theme: "rottay",
    density: "compact",
    showcaseLanes: 7,
    livePreviewCount: 3,
    productPosture: "Admin control plane",
    whyInspect:
      "Shows how the system behaves when density, hierarchy, and operational trust matter more than visual softness.",
    signatureMoment: "Dense admin dashboards, directories, and tenant controls.",
    stableSignal: "Information hierarchy and governance language stay fixed.",
    adaptationFocus: "Chrome, card depth, contrast rhythm, and shell temperature.",
    highlights: ["Identity", "Tenancy", "Permissions", "Features"],
    tint: "color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent)",
    border:
      "color-mix(in srgb, var(--ds-color-primary-500) 24%, var(--ds-color-border, rgba(148, 163, 184, 0.28)))",
    icon: <SettingsIcon size={26} />,
  },
  {
    name: "BitHire",
    slug: "bithire",
    description:
      "Recruiting product focused on candidate flow, analytics, scorecards, and AI-assisted hiring operations.",
    engine: "modern",
    theme: "bithire",
    density: "comfortable",
    showcaseLanes: 7,
    livePreviewCount: 3,
    productPosture: "Recruiting workspace",
    whyInspect:
      "A good reference for modern talent tooling where the same system needs to feel faster, more contemporary, and more expressive.",
    signatureMoment: "Pipeline movement, evaluation signal, and recruiter momentum.",
    stableSignal: "Hiring workflows, scoring posture, and role-based decision making.",
    adaptationFocus: "Motion, rounding, chart emphasis, and energetic wayfinding.",
    highlights: ["Pipeline", "Analytics", "Scorecards", "AI cues"],
    tint: "color-mix(in srgb, var(--ds-color-secondary-500) 16%, transparent)",
    border:
      "color-mix(in srgb, var(--ds-color-secondary-500) 24%, var(--ds-color-border, rgba(148, 163, 184, 0.28)))",
    icon: <BriefcaseIcon size={26} />,
  },
  {
    name: "Evnto",
    slug: "evnto",
    description:
      "Events and venue operations product covering ticketing, venue management, staffing, engagement, and analytics.",
    engine: "modern",
    theme: "evnto",
    density: "spacious",
    showcaseLanes: 8,
    livePreviewCount: 3,
    productPosture: "Event operations suite",
    whyInspect:
      "Useful when you want to test whether the design system can stay disciplined while supporting bolder branding and roomier interaction.",
    signatureMoment: "Ticketing, venue control, and live-event operations.",
    stableSignal: "Commercial clarity and operational readiness stay readable.",
    adaptationFocus: "Atmosphere, spaciousness, spotlight framing, and premium rhythm.",
    highlights: ["Ticketing", "Venue", "Operations", "Analytics"],
    tint: "color-mix(in srgb, var(--ds-color-warning-500) 16%, transparent)",
    border:
      "color-mix(in srgb, var(--ds-color-warning-500) 24%, var(--ds-color-border, rgba(148, 163, 184, 0.28)))",
    icon: <SparklesIcon size={26} />,
  },
];

const AUDIT_STEPS = [
  "Keep the workflow constant and change the runtime controls.",
  "Watch which surfaces adapt through tokens versus scenario content.",
  "Treat each page as product proof, not just a component sampler.",
];

const SHOWCASE_READING_GUIDE = [
  {
    label: "Read the product lens",
    detail:
      "Start with the workflow so theme and engine never become the whole story.",
  },
  {
    label: "Separate stable vs adaptive",
    detail:
      "Each card calls out what should hold steady and what runtime may restyle.",
  },
  {
    label: "Open the live route",
    detail:
      "Use the live vertical page to validate real DS frames instead of summaries.",
  },
];

const RUNTIME_AUDIT_SIGNALS = [
  {
    label: "Should stay stable",
    detail: "Workflow semantics, navigation confidence, and hierarchy should survive every provider swap.",
  },
  {
    label: "Should adapt",
    detail: "Contrast rhythm, card temperature, accent energy, and overall product mood should change with runtime.",
  },
];

const TOTAL_SHOWCASE_LANES = VERTICALS.reduce(
  (sum, vertical) => sum + vertical.showcaseLanes,
  0
);

const TOTAL_DEMOS = VERTICALS.reduce(
  (sum, vertical) => sum + vertical.livePreviewCount,
  0
);

const VERTICAL_CARD_HIGHLIGHT_LIMIT = 3;

const SURFACE = "var(--ds-color-bg-container, #ffffff)";
const ELEVATED_SURFACE = "var(--ds-color-bg-elevated, #f8fafc)";
const SUBTLE_SURFACE = "var(--ds-color-bg-secondary, #f1f5f9)";
const BORDER = "var(--ds-color-border, rgba(148, 163, 184, 0.28))";
const TEXT_SECONDARY = "var(--ds-color-text-secondary)";
const TEXT_MUTED = "var(--ds-color-text-muted)";
const HERO_OVERLAY =
  "radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-error-500) 10%, transparent), transparent 34%)";
const CARD_SHADOW = "var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))";
const PANEL_SHADOW = "var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))";

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
        padding: "16px 18px",
        borderRadius: "var(--ds-border-radius-lg, 16px)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 92%, var(--ds-color-primary-500) 8%) 0%, var(--ds-color-bg-elevated) 100%)",
        border: `1px solid ${BORDER}`,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: "block",
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </Text>
      <Text
        size="lg"
        weight="bold"
        style={{
          display: "block",
          marginTop: 10,
          overflowWrap: "anywhere",
          lineHeight: 1.15,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{ display: "block", marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}
      >
        {detail}
      </Text>
    </Box>
  );
}

export default function VerticalsPage() {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: tokens.spacing[5],
          border: `1px solid ${BORDER}`,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-container)) 0%, var(--ds-color-bg-container) 100%)",
          overflow: "hidden",
          position: "relative",
          boxShadow: CARD_SHADOW,
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
          <Flex align="center" gap={8} style={{ flexWrap: "wrap" }}>
            <Badge variant="primary">Verticals</Badge>
            <Badge variant="secondary">Tenant adaptability atlas</Badge>
            <Badge variant="secondary">
              {runtime.tenantName} / {runtime.engine}
            </Badge>
          </Flex>

          <Box
            className="showroom-verticals-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)",
              gap: tokens.spacing[4],
              alignItems: "start",
            }}
          >
            <Stack spacing="md">
          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 7%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-container) 100%)",
                  border: `1px solid ${BORDER}`,
                  boxShadow: PANEL_SHADOW,
                }}
              >
              <Stack spacing="sm">
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{ letterSpacing: "-0.04em", maxWidth: 840 }}
                >
                  One design system, three product stories, and a runtime that
                  must hold up even when Rottay goes dark-first.
                </Text>
                <Box style={{ paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                  <Text size="md" style={{ color: TEXT_SECONDARY, maxWidth: 780, lineHeight: 1.55 }}>
                    These pages are here to prove that Platform, BitHire, and Evnto are not just
                    tinted placeholders. Each vertical keeps a real workflow lens while the active
                    showroom provider changes the actual DS rendering, token posture, and contrast
                    rhythm.
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background: `linear-gradient(180deg, ${ELEVATED_SURFACE}, ${SURFACE})`,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
            >
              <Stack spacing="sm">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: "block",
                    color: TEXT_MUTED,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Audit method
                </Text>
                <Box style={{ paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                  <Text
                    size="sm"
                    style={{ display: "block", color: TEXT_SECONDARY, lineHeight: 1.55 }}
                  >
                    Keep the scenario semantics fixed, then use the tenant and engine switchers to
                    inspect whether hierarchy, density, navigation confidence, and commercial tone
                    stay coherent.
                  </Text>
                </Box>
                  <Flex gap={8} style={{ flexWrap: "wrap" }}>
                    {AUDIT_STEPS.map((step) => (
                      <Badge key={step} variant="secondary">
                        {step}
                      </Badge>
                    ))}
                  </Flex>
                </Stack>
              </Box>

              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: tokens.spacing[3],
                }}
              >
                <MetricTile
                  label="Verticals"
                  value={`${VERTICALS.length}`}
                  detail="Platform, BitHire, and Evnto all rendered through the active provider."
                />
                <MetricTile
                  label="Showcase lanes"
                  value={`${TOTAL_SHOWCASE_LANES}`}
                  detail="Distinct scenario lanes to compare density, posture, and runtime behavior."
                />
                <MetricTile
                  label="Live demo frames"
                  value={`${TOTAL_DEMOS}`}
                  detail="Actual DS surfaces, not mocked screenshots or static artboards."
                />
              </Box>
            </Stack>

            <Card
              style={{
                padding: tokens.spacing[4],
                background: `linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 42%), ${ELEVATED_SURFACE}`,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="md">
                <Box
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: SUBTLE_SURFACE,
                    border: `1px solid ${BORDER}`,
                    width: "fit-content",
                  }}
                >
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "var(--ds-color-primary)",
                      boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.12)",
                      flexShrink: 0,
                    }}
                  />
                  <Text size="xs" weight="semibold" style={{ display: "block" }}>
                    Active provider
                  </Text>
                </Box>

                <Stack spacing="xs">
                  <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: "block" }}>
                    {runtime.tenantName} is driving this showcase right now.
                  </Text>
                  <Box style={{ paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                    <Text
                      size="sm"
                      style={{ display: "block", color: TEXT_SECONDARY, lineHeight: 1.55 }}
                    >
                      That means every live frame below inherits the current runtime surface
                      model, including any dark-first treatment, primary color behavior, spacing
                      density, and badge or card personality.
                    </Text>
                  </Box>
                </Stack>

                <RuntimeFingerprint compact itemLimit={6} showHeader={false} />

                <Box
                  style={{
                    paddingTop: tokens.spacing[3],
                    borderTop: `1px solid ${BORDER}`,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: tokens.spacing[3],
                  }}
                >
                  {RUNTIME_AUDIT_SIGNALS.map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: "block",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          display: "block",
                          marginTop: 8,
                          color: TEXT_SECONDARY,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Card>
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          padding: tokens.spacing[5],
          border: `1px solid ${BORDER}`,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)",
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Box style={{ paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
            <Flex
              align="center"
              justify="between"
              style={{ flexWrap: "wrap", gap: 12 }}
            >
              <Box>
                <Text as={"h2" as any} size="xl" weight="semibold">
                  Tenant showcase index
                </Text>
                <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                  Open a vertical to inspect live product moments rendered through the current DS provider.
                </Text>
              </Box>
              <Badge variant="primary">{TOTAL_DEMOS} live frames across 3 products</Badge>
            </Flex>
          </Box>

          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
            >
              <Text
                size="sm"
                style={{ display: "block", color: TEXT_SECONDARY, lineHeight: 1.5 }}
              >
                Read each card as a proof point: a scenario lens, a runtime audit
                lens, and a reason the vertical is worth opening live.
              </Text>
            </Box>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: tokens.spacing[3],
            }}
          >
            {SHOWCASE_READING_GUIDE.map((item) => (
              <Box
                key={item.label}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.xl,
                  background: `linear-gradient(180deg, ${ELEVATED_SURFACE}, ${SURFACE})`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: "block",
                    color: TEXT_MUTED,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: "block",
                    marginTop: 8,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.55,
                  }}
                >
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Box>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: tokens.spacing[4],
            }}
          >
            {VERTICALS.map((vertical) => {
              const visibleHighlights = vertical.highlights.slice(
                0,
                VERTICAL_CARD_HIGHLIGHT_LIMIT
              );
              const hiddenHighlightCount =
                vertical.highlights.length - visibleHighlights.length;

              return (
                <Link
                  key={vertical.slug}
                  href={`/verticals/${vertical.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    hoverable
                    style={{
                      height: "100%",
                      padding: tokens.spacing[5],
                      border: `1px solid ${vertical.border}`,
                      background: `linear-gradient(180deg, ${vertical.tint}, transparent 42%), ${SURFACE}`,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Stack spacing="md" style={{ height: "100%" }}>
                    <Flex
                      align="start"
                      justify="between"
                      style={{ gap: 12, flexWrap: "wrap" }}
                    >
                      <Flex align="center" gap={12} style={{ minWidth: 0 }}>
                        <Box
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: tokens.borderRadius.xl,
                            background:
                              "color-mix(in srgb, var(--ds-color-bg-elevated) 88%, var(--ds-color-primary-500) 12%)",
                            border: `1px solid ${vertical.border}`,
                            color: "var(--ds-color-text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
                            flexShrink: 0,
                          }}
                        >
                          {vertical.icon}
                        </Box>
                        <Box style={{ minWidth: 0 }}>
                          <Text as={"h3" as any} size="lg" weight="bold" style={{ display: "block" }}>
                            {vertical.name}
                          </Text>
                          <Text
                            size="xs"
                            style={{ display: "block", marginTop: 4, color: TEXT_MUTED, lineHeight: 1.4 }}
                          >
                            {vertical.productPosture}
                          </Text>
                        </Box>
                      </Flex>
                        <Badge variant="secondary">
                          {vertical.livePreviewCount} live demos
                        </Badge>
                    </Flex>

                    <Box
                      style={{
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.xl,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Stack spacing="md">
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            display: "block",
                            color: TEXT_MUTED,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Scenario lens
                        </Text>
                        <Box style={{ paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                          <Text
                            size="sm"
                            style={{ display: "block", color: TEXT_SECONDARY, lineHeight: 1.55 }}
                          >
                            {vertical.description}
                          </Text>
                        </Box>
                        <Box
                          style={{
                            paddingTop: 10,
                            borderTop: `1px solid ${BORDER}`,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: tokens.spacing[3],
                          }}
                        >
                          {[
                            {
                              label: "Signature moment",
                              detail: vertical.signatureMoment,
                            },
                            {
                              label: "Why open it",
                              detail: vertical.whyInspect,
                            },
                          ].map((item) => (
                            <Box
                              key={item.label}
                              style={{
                                padding: "12px 14px",
                                borderRadius: tokens.borderRadius.lg,
                                background: `linear-gradient(180deg, ${ELEVATED_SURFACE}, ${SURFACE})`,
                                border: `1px solid ${BORDER}`,
                                boxShadow: PANEL_SHADOW,
                              }}
                            >
                              <Text
                                size="xs"
                                weight="semibold"
                                style={{ display: "block", color: TEXT_MUTED }}
                              >
                                {item.label}
                              </Text>
                              <Text
                                size="sm"
                                style={{
                                  display: "block",
                                  marginTop: 6,
                                  color: TEXT_SECONDARY,
                                  lineHeight: 1.5,
                                }}
                              >
                                {item.detail}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      style={{
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.xl,
                        background: `linear-gradient(180deg, ${ELEVATED_SURFACE}, ${SURFACE})`,
                        border: `1px solid ${BORDER}`,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Stack spacing="sm">
                        <Flex
                          align="center"
                          justify="between"
                          gap={12}
                          style={{ flexWrap: "wrap" }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              color: TEXT_MUTED,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Proof framing
                          </Text>
                          <Badge variant="secondary">
                            {vertical.showcaseLanes} lanes
                          </Badge>
                        </Flex>
                        <Box
                          style={{
                            paddingTop: 10,
                            borderTop: `1px solid ${BORDER}`,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: tokens.spacing[3],
                          }}
                        >
                          {[
                            {
                              label: "Stays stable",
                              detail: vertical.stableSignal,
                            },
                            {
                              label: "Adapts",
                              detail: vertical.adaptationFocus,
                            },
                          ].map((item) => (
                            <Box
                              key={item.label}
                              style={{
                                padding: tokens.spacing[3],
                                borderRadius: tokens.borderRadius.lg,
                                background: SURFACE,
                                border: `1px solid ${BORDER}`,
                                boxShadow: PANEL_SHADOW,
                              }}
                            >
                              <Text
                                size="xs"
                                weight="semibold"
                                style={{ display: "block", color: TEXT_MUTED }}
                              >
                                {item.label}
                              </Text>
                              <Text
                                size="sm"
                                style={{
                                  display: "block",
                                  marginTop: 6,
                                  color: TEXT_SECONDARY,
                                  lineHeight: 1.5,
                                }}
                              >
                                {item.detail}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      </Stack>
                    </Box>

                      <Box
                        style={{
                          padding: tokens.spacing[4],
                          borderRadius: tokens.borderRadius.xl,
                          background: `linear-gradient(180deg, ${ELEVATED_SURFACE}, ${SURFACE})`,
                          border: `1px solid ${BORDER}`,
                          boxShadow: PANEL_SHADOW,
                        }}
                      >
                        <Stack spacing="sm">
                          <Flex
                            align="center"
                            justify="between"
                            gap={12}
                            style={{ flexWrap: "wrap" }}
                          >
                            <Text
                              size="xs"
                              weight="semibold"
                              style={{
                                display: "block",
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Runtime setup
                            </Text>
                            <Badge variant="secondary">{vertical.productPosture}</Badge>
                          </Flex>

                          <Box
                            style={{
                              paddingTop: 10,
                              borderTop: `1px solid ${BORDER}`,
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(120px, 1fr))",
                              gap: tokens.spacing[2],
                            }}
                          >
                            {[
                              { label: "Engine", value: vertical.engine },
                              { label: "Theme", value: vertical.theme },
                              { label: "Density", value: vertical.density },
                            ].map((item) => (
                              <Box
                                key={item.label}
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: tokens.borderRadius.lg,
                                  background: SURFACE,
                                  border: `1px solid ${BORDER}`,
                                  boxShadow: PANEL_SHADOW,
                                }}
                              >
                                <Text
                                  size="xs"
                                  weight="semibold"
                                  style={{
                                    display: "block",
                                    color: TEXT_MUTED,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  {item.label}
                                </Text>
                                <Text
                                  size="sm"
                                  weight="semibold"
                                  style={{
                                    display: "block",
                                    marginTop: 6,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {item.value}
                                </Text>
                              </Box>
                            ))}
                          </Box>
                        </Stack>
                      </Box>

                    <Box
                      style={{
                        marginTop: "auto",
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.xl,
                        background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
                        border: `1px solid ${BORDER}`,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Stack spacing="sm">
                        <Flex
                          align="center"
                          justify="between"
                          gap={12}
                          style={{ flexWrap: "wrap" }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              color: TEXT_MUTED,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Highlights
                          </Text>
                          <Badge variant="secondary">
                            {visibleHighlights.length} core cues
                          </Badge>
                        </Flex>
                        <Box style={{ paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                          <Flex gap={6} style={{ flexWrap: "wrap" }}>
                            {visibleHighlights.map((highlight) => (
                              <Box
                                key={highlight}
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: SURFACE,
                                  border: `1px solid ${BORDER}`,
                                }}
                              >
                                <Text
                                  size="xs"
                                  style={{
                                    display: "block",
                                    color: TEXT_SECONDARY,
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {highlight}
                                </Text>
                              </Box>
                            ))}
                            {hiddenHighlightCount > 0 ? (
                              <Box
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: SURFACE,
                                  border: `1px solid ${BORDER}`,
                                }}
                              >
                                <Text
                                  size="xs"
                                  style={{
                                    display: "block",
                                    color: TEXT_SECONDARY,
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  +{hiddenHighlightCount} more
                                </Text>
                              </Box>
                            ) : null}
                          </Flex>
                        </Box>

                        <Box
                          style={{
                            padding: "12px 14px",
                            borderRadius: tokens.borderRadius.lg,
                            background: `linear-gradient(180deg, ${vertical.tint}, ${SURFACE})`,
                            border: `1px solid ${vertical.border}`,
                          }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              color: "var(--ds-color-text-primary)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Open live vertical showcase
                          </Text>
                          <Text
                            size="xs"
                            style={{
                              display: "block",
                              marginTop: 6,
                              color: TEXT_MUTED,
                              lineHeight: 1.45,
                            }}
                          >
                            Loads through the active {runtime.tenantName} runtime
                            on first render.
                          </Text>
                        </Box>
                      </Stack>
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
          .showroom-verticals-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
