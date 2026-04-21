import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  DocsMetricTile,
  DocsPanel,
  SectionDivider,
} from '@/components/showroom-ui';
import { notFound } from 'next/navigation';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  primitiveCategories,
  primitivesByCategory,
  type PrimitiveCategory,
  type PrimitiveEntry,
} from '@/data/registry';

const CATEGORY_PROFILES: Record<
  PrimitiveCategory,
  {
    eyebrow: string;
    summary: string;
    scenarios: string[];
    evaluate: string[];
    outcome: string;
  }
> = {
  display: {
    eyebrow: 'Readability and content delivery',
    summary:
      'Display primitives carry meaning, hierarchy, and quiet density without forcing product teams to rebuild visual semantics from scratch.',
    scenarios: ['dashboards', 'metadata panels', 'detail views'],
    evaluate: ['legibility', 'fallback states', 'content density'],
    outcome:
      'Use this category to prove the system can present information with polish before layout or workflow logic enters the room.',
  },
  inputs: {
    eyebrow: 'Interaction and capture',
    summary:
      'Inputs define how the design system feels under real keyboard, pointer, validation, and error-handling pressure.',
    scenarios: ['forms', 'filters', 'composer flows'],
    evaluate: ['focus states', 'validation feedback', 'keyboard support'],
    outcome:
      'These pages should make it obvious whether the design system can sustain serious data entry and decision making.',
  },
  feedback: {
    eyebrow: 'Response and system trust',
    summary:
      'Feedback primitives frame async work, risks, success states, and interruption handling so users always know what just happened.',
    scenarios: ['loading states', 'success flows', 'destructive actions'],
    evaluate: ['urgency', 'clarity', 'recovery paths'],
    outcome:
      'Review these when you need confidence that the system can communicate status, motion, and consequence cleanly.',
  },
  layout: {
    eyebrow: 'Rhythm and structure',
    summary:
      'Layout primitives are the invisible scaffolding that determine balance, spacing, responsiveness, and page-level consistency.',
    scenarios: ['page shells', 'sections', 'adaptive grids'],
    evaluate: ['spacing rhythm', 'alignment', 'responsive behavior'],
    outcome:
      'A strong showroom should display layout as composition power, not as blank utility wrappers.',
  },
  navigation: {
    eyebrow: 'Wayfinding and pace',
    summary:
      'Navigation primitives control how users move, orient themselves, and switch modes without losing context or momentum.',
    scenarios: ['application shells', 'multi-step flows', 'tabbed workspaces'],
    evaluate: ['orientation', 'discoverability', 'active state clarity'],
    outcome:
      'Use this category to judge whether the design system can support complex applications instead of isolated components.',
  },
  overlay: {
    eyebrow: 'Layering and interruption',
    summary:
      'Overlay primitives prove how the system behaves when attention shifts, context floats, or a workflow temporarily leaves the base page.',
    scenarios: ['menus', 'confirmations', 'guided help'],
    evaluate: ['layer clarity', 'escape routes', 'anchoring'],
    outcome:
      'These details matter once the product starts stacking interactions and still needs to feel calm and deliberate.',
  },
};

const CARD_SURFACE =
  'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const INSET_SURFACE =
  'var(--ds-surface-inset, var(--ds-color-bg-secondary, var(--ds-color-neutral-50)))';
const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const SHADOW = '0 20px 48px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';

function getCategoryLabel(slug: string): string {
  const category = primitiveCategories.find((item) => item.slug === slug);
  return category?.label ?? slug;
}

function PrimitiveReferenceCard({
  entry,
  href,
  inspectPrompt,
}: {
  entry: PrimitiveEntry;
  href: string;
  inspectPrompt: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        style={{
          height: '100%',
          padding: 18,
          border: SUBTLE_BORDER,
          background: CARD_SURFACE,
          cursor: 'pointer',
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="sm" fullWidth style={{ height: '100%' }}>
          <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 220px' }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Primitive
              </Text>
              <Text
                as={"h3" as any}
                size="lg"
                weight="semibold"
                style={{
                  display: 'block',
                  marginTop: 6,
                  fontFamily: 'var(--font-geist-mono)',
                  color: 'var(--ds-color-text-primary)',
                  lineHeight: 1.15,
                }}
              >
                {entry.name}
              </Text>
            </Box>
            <Badge variant={entry.engines.length === 3 ? 'success' : 'secondary'}>
              {entry.engines.length}/3 engines
            </Badge>
          </Flex>

          <Text
            size="sm"
            style={{ display: 'block', color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
          >
            {entry.description}
          </Text>

          <Box
            style={{
              marginTop: 'auto',
              paddingTop: 12,
              borderTop: SUBTLE_BORDER,
            }}
          >
            <Box
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: PANEL_SURFACE,
                border: SUBTLE_BORDER,
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Inspect first
              </Text>
              <Text
                size="sm"
                weight="medium"
                style={{ display: 'block', marginTop: 6, lineHeight: 1.5 }}
              >
                {inspectPrompt}
              </Text>
            </Box>

            <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap', marginTop: 12 }}>
              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                {entry.engines.map((engine) => (
                  <Box
                    key={engine}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'var(--ds-color-neutral-100)',
                    }}
                  >
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-secondary)',
                        fontFamily: 'var(--font-geist-mono)',
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
                  display: 'block',
                  color: 'var(--ds-color-primary-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Open Reference
              </Text>
            </Flex>
          </Box>
        </Stack>
      </Card>
    </Link>
  );
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return primitiveCategories.map((category) => ({ category: category.slug }));
}

export default async function PrimitiveCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryKey = category as PrimitiveCategory;
  const entries = primitivesByCategory[categoryKey] ?? [];
  const label = getCategoryLabel(category);
  const profile = CATEGORY_PROFILES[categoryKey];
  const featuredEntries = entries.slice(0, 4);

  if (!profile) {
    notFound();
  }

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 24,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(140deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 52%, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-tertiary)) 100%)',
          boxShadow: SHADOW,
          overflow: 'hidden',
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Link href="/primitives" style={{ textDecoration: 'none' }}>
              <Flex align="center" gap={8}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Primitives
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  /
                </Text>
                <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                  {label}
                </Text>
              </Flex>
            </Link>

            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">{profile.eyebrow}</Badge>
              <Badge variant="primary">{entries.length} components</Badge>
            </Flex>
          </Flex>

          <SectionDivider />

          <Box
            className="showroom-primitives-category-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="sm" fullWidth>
              <Text as={"h1" as any} size="xl" weight="bold" style={{ display: 'block' }}>
                {label}
              </Text>
              <Text
                size="md"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-secondary)',
                  maxWidth: 760,
                  lineHeight: 1.6,
                }}
              >
                {profile.summary}
              </Text>
              <Box
                style={{
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Outcome
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  {profile.outcome}
                </Text>
              </Box>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              <DocsMetricTile
                label="Components"
                value={`${entries.length}`}
                detail="Indexed in this category"
                tone="accent"
              />
              <DocsMetricTile
                label="Runtime"
                value="3 engines"
                detail="Classic, Modern, Rustic"
              />
              <DocsMetricTile
                label="Inspect first"
                value={profile.evaluate[0]}
                detail="Suggested first comparison lens"
                tone="warning"
              />
            </Box>
          </Box>
        </Stack>
      </Card>

      <Box
        className="showroom-primitives-category-support-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 16,
        }}
      >
        <DocsPanel
          eyebrow="Good starting scenes"
          title="Where this category earns its keep"
          description="Use these screens first when you want evidence of hierarchy, responsiveness, and runtime polish."
          actions={<Badge variant="secondary">{profile.scenarios.length} scenes</Badge>}
        >
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            {profile.scenarios.map((scene) => (
              <Badge key={scene} variant="secondary">
                {scene}
              </Badge>
            ))}
          </Flex>
        </DocsPanel>

        <DocsPanel
          eyebrow="Audit lens"
          title="What to inspect"
          description="Compare one quality lens at a time so the category does not collapse into generic component browsing."
          tone="warning"
        >
          <Stack spacing="xs" fullWidth>
            {profile.evaluate.map((item) => (
              <Box
                key={item}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                }}
              >
                <Text size="sm" style={{ display: 'block', lineHeight: 1.45 }}>
                  {item}
                </Text>
              </Box>
            ))}
          </Stack>
        </DocsPanel>

        <DocsPanel
          eyebrow="Fastest entry"
          title="Start with these"
          description="These references are the quickest way to see live DS behavior in this category before you branch into the full index."
          actions={<Badge variant="secondary">{featuredEntries.length} picks</Badge>}
          tone="accent"
        >
          <Stack spacing="xs" fullWidth>
            {featuredEntries.length > 0 ? (
              featuredEntries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/primitives/${category}/${entry.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: INSET_SURFACE,
                      border: SUBTLE_BORDER,
                    }}
                  >
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-primary)',
                        lineHeight: 1.35,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {entry.name}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 6,
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.5,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {entry.description}
                    </Text>
                  </Box>
                </Link>
              ))
            ) : (
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                No primitives are registered in this category yet.
              </Text>
            )}
          </Stack>
        </DocsPanel>
      </Box>

      <DocsPanel
        eyebrow="Catalog"
        title="Browse components"
        description="Open a component to inspect usage guidance, live preview coverage, and engine support without losing the category context."
        actions={<Badge variant="secondary">{entries.length} indexed</Badge>}
        tone="accent"
      >
        {entries.length > 0 ? (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 16,
            }}
          >
            {entries.map((entry, index) => (
              <PrimitiveReferenceCard
                key={entry.slug}
                entry={entry}
                href={`/primitives/${category}/${entry.slug}`}
                inspectPrompt={profile.evaluate[index % profile.evaluate.length]}
              />
            ))}
          </Box>
        ) : (
          <Box
            style={{
              padding: 32,
              borderRadius: 20,
              border: '1px dashed var(--ds-color-border-subtle, var(--ds-color-neutral-300))',
              background: PANEL_SURFACE,
            }}
          >
            <Stack spacing="sm" align="center">
              <Text as={"h2" as any} size="lg" weight="semibold">
                No primitives registered yet for {label}
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                This category page is ready to absorb new components as they land in the registry.
              </Text>
            </Stack>
          </Box>
        )}
      </DocsPanel>

      <style>{`
        @container showroom-content (max-width: 920px) {
          .showroom-primitives-category-hero-grid,
          .showroom-primitives-category-support-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
