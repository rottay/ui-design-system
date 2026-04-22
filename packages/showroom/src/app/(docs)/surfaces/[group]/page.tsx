import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  DocsMetricTile,
  DocsPanel,
  SectionDivider,
} from '@/components/showroom-ui';
import { notFound } from 'next/navigation';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  surfaceGroups,
  surfacesByGroup,
  type SurfaceEntry,
  type SurfaceGroup,
} from '@/data/registry';

const GROUP_PROFILES: Record<
  SurfaceGroup,
  {
    summary: string;
    promise: string;
    evaluate: string[];
    appOwns: string[];
  }
> = {
  admin: {
    summary:
      'Admin surfaces turn settings, audit, permissions, and governance work into stable internal page contracts.',
    promise:
      'The shell should stay calm under dense controls so operators can scan risk, state, and policy without losing context.',
    evaluate: ['permission-aware actions', 'auditability', 'dense but readable control groups'],
    appOwns: ['permissions', 'policy rules', 'mutation side effects'],
  },
  data: {
    summary:
      'Data surfaces package lists, dashboards, reports, and comparison flows into page-level recipes for analytical work.',
    promise:
      'Signal should land before ornament: the page needs a clear path from overview to inspection to action.',
    evaluate: ['query-state clarity', 'scan rhythm', 'summary-to-detail movement'],
    appOwns: ['fetching', 'aggregation', 'routing and filters'],
  },
  experience: {
    summary:
      'Experience surfaces cover the branded, user-facing edges of the system where mood, trust, and product posture matter immediately.',
    promise:
      'These routes should feel product-ready at first glance while still proving the DS can carry real UX, not just marketing chrome.',
    evaluate: ['brand fit', 'narrative clarity', 'call-to-action priority'],
    appOwns: ['content strategy', 'copy tone', 'feature gating'],
  },
  forms: {
    summary:
      'Forms surfaces shape long authoring flows into guided, reviewable pages instead of generic stacked inputs.',
    promise:
      'Progress, validation, and review should feel intentional for both first-time users and expert operators.',
    evaluate: ['progress pacing', 'validation rhythm', 'review affordances'],
    appOwns: ['submission logic', 'draft persistence', 'business validation'],
  },
  operations: {
    summary:
      'Operations surfaces support live queues, monitoring, scheduling, and day-to-day execution work under time pressure.',
    promise:
      'The page must stay readable as status changes, priorities move, and decisions happen quickly.',
    evaluate: ['queue priority', 'exception handling', 'live-signal readability'],
    appOwns: ['realtime updates', 'command logic', 'threshold rules'],
  },
  workspace: {
    summary:
      'Workspace surfaces are the heaviest desks in the showroom, combining multiple views and support rails into one serious environment.',
    promise:
      'This is where the system proves it can carry multi-panel product work without collapsing into clutter.',
    evaluate: ['mode switching', 'panel orchestration', 'persistent context'],
    appOwns: ['workspace state', 'cross-panel memory', 'product-specific tools'],
  },
};

const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';
const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';

function groupLabel(slug: SurfaceGroup) {
  return surfaceGroups.find((item) => item.slug === slug)?.label ?? slug;
}

function SurfaceRouteCard({ entry }: { entry: SurfaceEntry }) {
  return (
    <Link href={`/surfaces/${entry.group}/${entry.slug}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        className="showroom-surfaces-route-card"
        style={{
          height: '100%',
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 5%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
          boxShadow: SHADOW,
          containerType: 'inline-size',
          containerName: 'showroom-surface-card',
        }}
      >
        <Stack spacing="md" style={{ height: '100%' }}>
          <Flex
            className="showroom-surfaces-route-card-head"
            align="start"
            justify="between"
            gap={12}
            style={{ flexWrap: 'wrap', paddingBottom: 12, borderBottom: SUBTLE_BORDER }}
          >
            <Box style={{ minWidth: 0 }}>
              <Text as={"h3" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                {entry.name}
              </Text>
              <Text
                className="showroom-surfaces-route-card-path"
                size="xs"
                style={{
                  display: 'block',
                  marginTop: 4,
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                /surfaces/{entry.group}/{entry.slug}
              </Text>
            </Box>
            <Badge variant="secondary">{entry.engines.length} engines</Badge>
          </Flex>

          <Text
            size="sm"
            style={{
              display: 'block',
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {entry.description}
          </Text>

          <Box
            style={{
              marginTop: 'auto',
              paddingTop: 14,
              borderTop: SUBTLE_BORDER,
            }}
          >
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {entry.engines.map((engine) => (
                <Badge key={engine} variant="secondary">
                  {engine}
                </Badge>
              ))}
            </Flex>
          </Box>
        </Stack>
      </Card>
    </Link>
  );
}

export function generateStaticParams() {
  return surfaceGroups.map((group) => ({ group: group.slug }));
}

export default async function SurfaceGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as SurfaceGroup;
  const profile = GROUP_PROFILES[groupSlug];
  const entries = surfacesByGroup[groupSlug] ?? [];

  if (!profile || entries.length === 0) {
    notFound();
  }

  const label = groupLabel(groupSlug);

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 24,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 100%)',
          boxShadow: SHADOW,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 14%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 10%, transparent), transparent 34%)',
            pointerEvents: 'none',
          }}
        />

        <Stack spacing="md" style={{ position: 'relative' }}>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Link href="/surfaces" style={{ textDecoration: 'none' }}>
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
                  Surfaces
                </Text>
              </Link>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                /
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {label}
              </Text>
            </Flex>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{entries.length} surfaces</Badge>
              <Badge variant="secondary">Surface domain</Badge>
            </Flex>
          </Flex>

          <SectionDivider />

          <Box
            className="showroom-surfaces-group-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="md" fullWidth>
              <Stack spacing="xs">
                <Text as={"h1" as any} size="2xl" weight="bold" style={{ lineHeight: 1.1 }}>
                  {label}
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    maxWidth: 760,
                    lineHeight: 1.65,
                  }}
                >
                  {profile.summary}
                </Text>
              </Stack>

              <Box
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: SUBTLE_BORDER,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                }}
              >
                <Stack spacing="sm" fullWidth>
                  <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
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
                      Surface promise
                    </Text>
                    <Badge variant="secondary">Route from this domain, then inspect a recipe</Badge>
                  </Flex>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.65,
                    }}
                  >
                    {profile.promise}
                  </Text>
                </Stack>
              </Box>

              <Box
                className="showroom-surfaces-group-metrics-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                <DocsMetricTile
                  label="Surfaces"
                  value={`${entries.length}`}
                  detail="Page-level recipes in this domain"
                  tone="accent"
                />
                <DocsMetricTile
                  label="Engines"
                  value="3"
                  detail="Classic, Modern, and Rustic must all stay coherent"
                />
                <DocsMetricTile
                  label="Starter route"
                  value={entries[0].name}
                  detail={`/surfaces/${groupSlug}/${entries[0].slug}`}
                  tone="success"
                />
              </Box>
            </Stack>

            <DocsPanel
              eyebrow="Review checklist"
              title="Audit the domain before a single recipe"
              description="The point of this landing is to judge route posture first, then decide which concrete surface earns a closer inspection."
              tone="warning"
              style={{
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-color-bg-primary)) 0%, var(--ds-color-bg-elevated) 100%)',
              }}
            >
              <Stack spacing="sm" fullWidth>
                {profile.evaluate.map((item) => (
                  <Box
                    key={item}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      border: SUBTLE_BORDER,
                      background: PANEL_SURFACE,
                    }}
                  >
                    <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                      {item}
                    </Text>
                  </Box>
                ))}
              </Stack>

              <Box
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: SUBTLE_BORDER,
                  background: PANEL_SURFACE,
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
                  Application still owns
                </Text>
                <Flex gap={8} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                  {profile.appOwns.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </DocsPanel>
          </Box>
        </Stack>
      </Card>

      <DocsPanel
        eyebrow="Catalog"
        title={`Browse recipes in ${label}`}
        description="Open a concrete surface once the domain promise is clear. This landing should route by screen intent first, not by component trivia."
        actions={<Badge variant="secondary">{entries.length} routes</Badge>}
        tone="accent"
      >
        <Box
          className="showroom-surfaces-group-catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {entries.map((entry) => (
            <SurfaceRouteCard key={entry.slug} entry={entry} />
          ))}
        </Box>
      </DocsPanel>

      <style>{`
        .showroom-surfaces-group-catalog-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        @container showroom-content (max-width: 1720px) {
          .showroom-surfaces-group-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1210px) {
          .showroom-surfaces-group-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1080px) {
          .showroom-surfaces-group-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 1180px) {
          .showroom-surfaces-group-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 760px) {
          .showroom-surfaces-group-catalog-grid,
          .showroom-surfaces-group-metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-surface-card (max-width: 360px) {
          .showroom-surfaces-route-card-head {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>
    </Stack>
  );
}
