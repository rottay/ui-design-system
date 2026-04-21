'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import { RuntimeFingerprint } from '@/components/runtime/runtime-fingerprint';
import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';

export interface VerticalCategoryCard {
  title: string;
  slug: string;
  description: string;
  demoCount: number;
  icon: React.ReactNode;
  lens: string;
}

export interface VerticalProofPoint {
  title: string;
  description: string;
}

export interface VerticalHeroMetric {
  label: string;
  value: string;
  detail: string;
}

export interface VerticalLiveDemo {
  title: string;
  description: string;
  badge: string;
  inspectionNotes: string[];
  coverageNote: string;
  viewportHeight?: number;
  children: React.ReactNode;
}

export interface VerticalShowcaseShellProps {
  name: string;
  slug: string;
  heroTitle: string;
  heroSummary: string;
  runtimeSummary: string;
  auditPoints: string[];
  heroMetrics: VerticalHeroMetric[];
  proofPoints: VerticalProofPoint[];
  leadDemo: VerticalLiveDemo;
  supportingDemos: VerticalLiveDemo[];
  categories: VerticalCategoryCard[];
  categoryIntro: string;
  accentTint: string;
  accentBorder: string;
}

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 90%, var(--ds-color-bg-secondary, #f1f5f9) 10%) 0%, ${SURFACE} 100%)`;

function MetricTile({ label, value, detail }: VerticalHeroMetric) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
        background: PANEL_BACKGROUND,
        border: `1px solid ${BORDER}`,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Flex align="center" gap={8}>
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'var(--ds-color-primary)',
            boxShadow: '0 0 0 4px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)',
            flexShrink: 0,
          }}
        />
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: TEXT_MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
      </Flex>
      <Box
        style={{
          height: 1,
          marginTop: 10,
          background: `linear-gradient(90deg, ${BORDER}, transparent)`,
        }}
      />
      <Text
        size="lg"
        weight="bold"
        style={{
          display: 'block',
          marginTop: 12,
          lineHeight: 1.15,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{ display: 'block', marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function DemoFrame({
  title,
  description,
  badge,
  children,
  viewportHeight,
  accentTint,
  accentBorder,
}: {
  title: string;
  description: string;
  badge: string;
  children: React.ReactNode;
  viewportHeight?: number;
  accentTint: string;
  accentBorder: string;
}) {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Card
      style={{
        padding: tokens.spacing[4],
        border: `1px solid ${accentBorder}`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 46%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
        overflow: 'hidden',
        alignSelf: 'start',
        boxShadow:
          '0 24px 56px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.18)) 24%, transparent)',
      }}
    >
      <Stack spacing="md">
        <Flex
          align="start"
          justify="between"
          style={{
            flexWrap: 'wrap',
            gap: 12,
            paddingBottom: tokens.spacing[3],
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Box style={{ minWidth: 0, flex: '1 1 220px' }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: TEXT_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Live frame
            </Text>
            <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block', marginTop: 6 }}>
              {title}
            </Text>
            <Text
              size="sm"
              style={{
                display: 'block',
                marginTop: 8,
                color: TEXT_SECONDARY,
                lineHeight: 1.62,
                maxWidth: '60ch',
              }}
            >
              {description}
            </Text>
          </Box>
          <Badge variant="secondary">{badge}</Badge>
        </Flex>

        <Box
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: tokens.borderRadius.xl,
            padding: tokens.spacing[2],
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 52%, var(--ds-color-bg-elevated, #ffffff)) 0%, ${ELEVATED_SURFACE} 100%)`,
            overflow: 'hidden',
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={8}
            style={{
              flexWrap: 'wrap',
              marginBottom: tokens.spacing[3],
              paddingBottom: tokens.spacing[3],
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">Live DS runtime</Badge>
              <Text size="xs" style={{ display: 'block', color: TEXT_MUTED }}>
                No local skin override
              </Text>
            </Flex>
            <Box
              style={{
                padding: '8px 10px',
                borderRadius: 999,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text
                size="xs"
                style={{
                  display: 'block',
                  color: TEXT_SECONDARY,
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  lineHeight: 1.35,
                }}
              >
                {runtime.tenantName} / {runtime.engine} / {runtime.productProfileLabel}
              </Text>
            </Box>
          </Flex>
          <Box
            style={{
              position: 'relative',
              minWidth: 0,
              overflow: 'hidden',
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid color-mix(in srgb, ${accentBorder} 88%, ${BORDER})`,
              background: `linear-gradient(180deg, color-mix(in srgb, ${SURFACE} 88%, ${accentTint}) 0%, ${SURFACE} 100%)`,
              boxShadow:
                'inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 72%, transparent)',
            }}
          >
            <Box
              style={{
                minWidth: 0,
                maxHeight: viewportHeight,
                overflowY: viewportHeight ? 'auto' : 'visible',
                overflowX: 'hidden',
                padding: viewportHeight ? `0 ${tokens.spacing[1]}px 0 0` : 0,
                borderRadius: `calc(${tokens.borderRadius.lg} - 1px)`,
              }}
            >
              {children}
            </Box>
            {viewportHeight ? (
              <Box
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  height: 72,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, var(--ds-color-bg-container, #ffffff) 82%)',
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}

export function VerticalShowcaseShell({
  name,
  slug,
  heroTitle,
  heroSummary,
  runtimeSummary,
  auditPoints,
  heroMetrics,
  proofPoints,
  leadDemo,
  supportingDemos,
  categories,
  categoryIntro,
  accentTint,
  accentBorder,
}: VerticalShowcaseShellProps) {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: tokens.spacing[5],
          border: `1px solid ${BORDER}`,
          background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 24%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: CARD_SHADOW,
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at top right, ${accentTint}, transparent 28%), linear-gradient(180deg, rgba(148, 163, 184, 0.08), transparent 30%)`,
            pointerEvents: 'none',
          }}
        />

        <Stack spacing="lg" style={{ position: 'relative' }}>
          <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
            <Badge variant="primary">{name}</Badge>
            <Badge variant="secondary">Tenant showcase</Badge>
            <Badge variant="secondary">
              {runtime.tenantName} / {runtime.engine} / {runtime.productProfileLabel}
            </Badge>
          </Flex>

          <Box
            className="showroom-vertical-shell-hero"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
              gap: tokens.spacing[4],
              alignItems: 'start',
            }}
          >
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{ display: 'block', letterSpacing: '-0.04em', maxWidth: 820 }}
                >
                  {heroTitle}
                </Text>
                <Text
                  size="md"
                  style={{ display: 'block', color: TEXT_SECONDARY, maxWidth: 780, lineHeight: 1.68 }}
                >
                  {heroSummary}
                </Text>
                <Text
                  size="sm"
                  style={{ display: 'block', color: TEXT_MUTED, maxWidth: 760, lineHeight: 1.62 }}
                >
                  {runtimeSummary}
                </Text>
              </Stack>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {heroMetrics.map((metric) => (
                  <MetricTile key={metric.label} {...metric} />
                ))}
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {proofPoints.map((point) => (
                  <Box
                    key={point.title}
                    style={{
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.xl,
                      background: PANEL_BACKGROUND,
                      border: `1px solid ${BORDER}`,
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Proof point
                    </Text>
                    <Box
                      style={{
                        height: 1,
                        marginTop: 10,
                        background: `linear-gradient(90deg, ${BORDER}, transparent)`,
                      }}
                    />
                    <Text as={"h2" as any} size="md" weight="semibold" style={{ marginTop: 10 }}>
                      {point.title}
                    </Text>
                    <Text
                      size="sm"
                      style={{ display: 'block', marginTop: 8, color: TEXT_SECONDARY, lineHeight: 1.5 }}
                    >
                      {point.description}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Stack>

            <Card
              style={{
                padding: tokens.spacing[4],
                background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 42%, ${ELEVATED_SURFACE}) 0%, ${ELEVATED_SURFACE} 100%)`,
                border: `1px solid ${accentBorder}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="md">
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    width: 'fit-content',
                    boxShadow:
                      '0 10px 24px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.18)) 12%, transparent)',
                  }}
                >
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: 'var(--ds-color-primary)',
                      boxShadow: '0 0 0 4px rgba(148, 163, 184, 0.12)',
                      flexShrink: 0,
                    }}
                  />
                  <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                    Active runtime
                  </Text>
                </Box>

                <Stack spacing="xs">
                  <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                    {runtime.tenantName} is styling this {slug} scenario.
                  </Text>
                  <Text
                    size="sm"
                    style={{ display: 'block', color: TEXT_SECONDARY, lineHeight: 1.55 }}
                  >
                    The workflow lens belongs to {name}. The surrounding chrome,
                    contrast, chart emphasis, and surface temperature must all
                    adapt to the active provider, including dark-first Rottay.
                  </Text>
                </Stack>

                <Box
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${accentBorder}, transparent)`,
                  }}
                />

                <RuntimeFingerprint compact itemLimit={4} showHeader={false} />

                <Box
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${BORDER}, transparent)`,
                  }}
                />

                <Box
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Stack spacing="sm">
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Audit strip
                    </Text>
                    <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                      {auditPoints.map((point) => (
                        <Badge key={point} variant="secondary">
                          {point}
                        </Badge>
                      ))}
                    </Flex>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Stack>
      </Card>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Box>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Live product moments
            </Text>
            <Text size="sm" style={{ color: TEXT_SECONDARY }}>
              These frames are real DS surfaces and should read convincingly
              under every tenant runtime.
            </Text>
          </Box>
          <Badge variant="primary">Live DS runtime below</Badge>
        </Flex>

        <Box
          className="showroom-vertical-shell-lead"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
            gap: tokens.spacing[4],
            alignItems: 'start',
          }}
        >
          <DemoFrame
            title={leadDemo.title}
            description={leadDemo.description}
            badge={leadDemo.badge}
            viewportHeight={leadDemo.viewportHeight}
            accentTint={accentTint}
            accentBorder={accentBorder}
          >
            {leadDemo.children}
          </DemoFrame>

          <Card
            style={{
              padding: tokens.spacing[4],
              alignSelf: 'start',
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="md">
              <Text as={"h2" as any} size="md" weight="semibold">
                What to inspect here
              </Text>
              {leadDemo.inspectionNotes.map((note) => (
                <Box
                  key={note}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                  >
                    <Text size="sm" style={{ display: 'block', color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                      {note}
                    </Text>
                  </Box>
              ))}

              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: `linear-gradient(180deg, ${accentTint}, transparent 42%), ${SURFACE}`,
                  border: `1px solid ${accentBorder}`,
                }}
              >
                <Text size="xs" weight="semibold" style={{ display: 'block', color: TEXT_MUTED }}>
                  Coverage snapshot
                </Text>
                <Text
                  size="sm"
                  style={{ display: 'block', marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.5 }}
                >
                  {leadDemo.coverageNote}
                </Text>
              </Box>

              <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Read it like a product screen
                </Text>
                <Text
                  size="sm"
                  style={{ display: 'block', marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.55 }}
                >
                  Start with the task, then validate whether runtime only changes mood, chrome, and
                  emphasis instead of rewriting the workflow semantics.
                </Text>
              </Box>
            </Stack>
          </Card>
        </Box>

        <Box
          style={{
            paddingTop: tokens.spacing[1],
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: TEXT_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Supporting product surfaces
              </Text>
              <Text size="sm" style={{ display: 'block', marginTop: 6, color: TEXT_SECONDARY }}>
                These companion frames should reinforce the same product story instead of reading
                like isolated component snapshots.
              </Text>
            </Box>
            <Badge variant="secondary">{supportingDemos.length} supporting frames</Badge>
          </Flex>
        </Box>

        <Box
          className="showroom-vertical-shell-supporting"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: tokens.spacing[4],
            alignItems: 'start',
          }}
        >
          {supportingDemos.map((demo) => (
            <DemoFrame
              key={demo.title}
              title={demo.title}
              description={demo.description}
              badge={demo.badge}
              viewportHeight={demo.viewportHeight}
              accentTint={accentTint}
              accentBorder={accentBorder}
            >
              {demo.children}
            </DemoFrame>
          ))}
        </Box>
      </Stack>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: TEXT_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Category explorer
            </Text>
            <Text as={"h2" as any} size="xl" weight="semibold" style={{ display: 'block' }}>
              Category routes
            </Text>
            <Text
              size="sm"
              style={{ display: 'block', color: TEXT_SECONDARY, lineHeight: 1.5 }}
            >
              {categoryIntro}
            </Text>
          </Box>
          <Badge variant="secondary">{categories.length} categories</Badge>
        </Flex>

        <Box
          className="showroom-vertical-shell-categories"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: tokens.spacing[4],
            alignItems: 'start',
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/verticals/${slug}/${category.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  padding: tokens.spacing[4],
                  border: `1px solid ${accentBorder}`,
                  background: `linear-gradient(180deg, ${accentTint}, transparent 30%), ${PANEL_BACKGROUND}`,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Stack spacing="md" style={{ height: '100%' }}>
                  <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <Box
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: tokens.borderRadius.xl,
                        background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 54%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
                        color: 'var(--ds-color-primary)',
                        border: `1px solid ${accentBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Badge variant="secondary">{category.demoCount} demos</Badge>
                  </Flex>

                  <Box>
                    <Text as={"h3" as any} size="md" weight="semibold" style={{ display: 'block' }}>
                      {category.title}
                    </Text>
                    <Box style={{ paddingTop: 8, marginTop: 8, borderTop: `1px solid ${BORDER}` }}>
                      <Text
                        size="sm"
                        style={{ display: 'block', color: TEXT_SECONDARY, lineHeight: 1.5 }}
                      >
                        {category.description}
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <Text size="xs" weight="semibold" style={{ display: 'block', color: TEXT_MUTED }}>
                      Scenario lens
                    </Text>
                    <Box style={{ paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
                      <Text
                        size="sm"
                        style={{ display: 'block', color: TEXT_SECONDARY, lineHeight: 1.5 }}
                      >
                        {category.lens}
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    style={{
                      marginTop: 'auto',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 34%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
                      border: `1px solid ${accentBorder}`,
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Open focused appendix
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 6,
                        color: TEXT_SECONDARY,
                        lineHeight: 1.45,
                      }}
                    >
                      Dive into {category.demoCount} scenario rows with stable product framing.
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: TEXT_MUTED,
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      /verticals/{slug}/{category.slug}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            </Link>
          ))}
        </Box>
      </Stack>

      <style>{`
        @container showroom-content (max-width: 1120px) {
          .showroom-vertical-shell-hero,
          .showroom-vertical-shell-lead {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 900px) {
          .showroom-vertical-shell-categories,
          .showroom-vertical-shell-supporting {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
