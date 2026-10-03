'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Card,
  Flex,
  Input,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import {
  buildIconSnippet,
  iconCategories,
  icons as corpusIcons,
  type IconCategory,
  type IconEntry,
} from '@/data/registry/icons';
import { FoundationTopRail } from '../foundation-top-rail';

const CATEGORY_ORDER: IconCategory[] = iconCategories.map((category) => category.slug);

const CATEGORY_LABELS: Record<IconCategory, string> = iconCategories.reduce(
  (labels, category) => {
    labels[category.slug] = category.label;
    return labels;
  },
  {} as Record<IconCategory, string>,
);
const FILTER_CATEGORIES: Array<'all' | IconCategory> = ['all', ...CATEGORY_ORDER];

const ICON_REGISTRY: IconEntry[] = [...corpusIcons].sort((a, b) => {
  const categoryDelta = CATEGORY_ORDER.indexOf(a.category) -
    CATEGORY_ORDER.indexOf(b.category);
  if (categoryDelta !== 0) return categoryDelta;
  return a.name.localeCompare(b.name);
});

const ICON_SPOTLIGHTS = [
  {
    title: 'Navigation',
    detail: 'Wayfinding, switchers, and shell chrome.',
    names: ['navigation.menu', 'navigation.back', 'navigation.forward'],
  },
  {
    title: 'Action',
    detail: 'Primary verbs and direct manipulation.',
    names: ['action.add', 'action.confirm', 'action.download'],
  },
  {
    title: 'Status',
    detail: 'Success, warnings, and operational states.',
    names: ['status.success', 'status.warning', 'status.loading'],
  },
] as const;

function normalizeIconSearchValue(value: string) {
  return value.toLowerCase().replace(/icon$/g, '').replace(/[\s._-]+/g, '');
}

function IconCell({ entry }: { entry: IconEntry }) {
  const tokens = useTokens();
  const [copied, setCopied] = useState(false);

  return (
    <Box
      as="button"
      onClick={() => {
        navigator.clipboard
          .writeText(buildIconSnippet(entry.name))
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing[3],
        minWidth: 0,
        minHeight: 192,
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.lg,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          copied
            ? 'linear-gradient(180deg, var(--ds-color-success-50), var(--ds-color-white))'
            : 'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-overlay))',
        boxShadow:
          'inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary) 74%, transparent)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: copied ? 'var(--ds-color-success-100)' : 'var(--ds-color-neutral-50)',
          color: copied ? 'var(--ds-color-success-700)' : 'var(--ds-color-text-primary)',
        }}
      >
        <Icon name={entry.name} decorative size={24} />
      </Box>

      <Stack spacing="xs" fullWidth style={{ minWidth: 0, alignItems: 'center', textAlign: 'center' }}>
        <Text
          size="xs"
          style={{
            display: 'block',
            color: copied ? 'var(--ds-color-success-700)' : 'var(--ds-color-text-secondary)',
            lineHeight: 1.45,
            overflowWrap: 'anywhere',
          }}
        >
          {copied ? 'Copied import' : entry.name}
        </Text>
        <Text
          size="xs"
          style={{
            display: 'block',
            color: 'var(--ds-color-text-muted)',
            lineHeight: 1.35,
            overflowWrap: 'anywhere',
          }}
        >
          {entry.intent}
        </Text>
      </Stack>

      <Box
        style={{
          width: '100%',
          marginTop: 'auto',
          paddingTop: tokens.spacing[2],
          borderTop: '1px solid var(--ds-color-border-secondary)',
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <Badge variant="secondary">{CATEGORY_LABELS[entry.category]}</Badge>
        <Badge variant="secondary">{entry.status}</Badge>
      </Box>
    </Box>
  );
}

export default function IconsPage() {
  const tokens = useTokens();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | IconCategory>('all');
  const normalizedSearch = normalizeIconSearchValue(search.trim());

  const searchedIcons = useMemo(() => {
    if (normalizedSearch === '') {
      return ICON_REGISTRY;
    }

    return ICON_REGISTRY.filter((entry) => {
      const searchableValues = [
        entry.name,
        entry.slug,
        entry.searchAlias,
        entry.intent,
        CATEGORY_LABELS[entry.category],
      ];

      return searchableValues.some((value) =>
        normalizeIconSearchValue(value).includes(normalizedSearch)
      );
    });
  }, [normalizedSearch]);

  const categoryCounts = useMemo(() => {
    const counts = iconCategories.reduce(
      (accumulator, category) => {
        accumulator[category.slug] = 0;
        return accumulator;
      },
      { all: searchedIcons.length } as Record<'all' | IconCategory, number>,
    );
    for (const entry of searchedIcons) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  }, [searchedIcons]);

  const filtered = useMemo(() => {
    return searchedIcons.filter((entry) =>
      activeCategory === 'all' || entry.category === activeCategory
    );
  }, [searchedIcons, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, IconEntry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations"
        backLabel="Foundations"
        badge="Icon library"
        title="Icons"
        description="Icons are a semantic vocabulary layer for navigation, action, data, status, content, and system chrome. Search by task and copy imports directly from the catalog."
        panels={[
          {
            title: 'Use this page for',
            body: 'Finding the right icon by intent, not inventing custom SVG drift in product surfaces.',
            tone: 'accent',
          },
          {
            title: 'Interaction',
            body: 'Click any icon cell to copy the import statement from @rottay/design-system/icons.',
          },
          {
            title: 'Rendering contract',
            body: 'Every role renders through the public semantic Icon facade with consistent sizing and currentColor behavior across themes and engines.',
            tone: 'dark',
          },
        ]}
        links={[
          { label: 'Navigation' },
          { label: 'Action' },
          { label: 'Status' },
          { label: 'Data' },
          { label: 'Layout' },
        ]}
        stats={[
          { label: 'Icons', value: `${ICON_REGISTRY.length}`, detail: 'Governed semantic roles' },
          { label: 'Categories', value: `${CATEGORY_ORDER.length}`, detail: 'Canonical corpus domains' },
          { label: 'Copy flow', value: '1 click', detail: 'Import statement to clipboard' },
          { label: 'Sizing', value: 'currentColor', detail: 'Portable across surfaces' },
        ]}
      />

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text as={"h2" as any} size="xl" weight="semibold">
                Icon language at a glance
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                A compact editorial sample before you dive into the full catalog.
              </Text>
            </Box>
            <Badge variant="secondary">Semantic sets</Badge>
          </Flex>

            <Box
              className="showroom-icons-spotlight-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {ICON_SPOTLIGHTS.map((spotlight) => (
                <Box
                  key={spotlight.title}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background:
                      'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
                  }}
                >
                  <Stack spacing="md">
                    <Box>
                      <Flex align="center" gap={8}>
                        <Icon name={spotlight.names[0]} decorative size={14} />
                        <Text size="sm" weight="semibold">
                          {spotlight.title}
                        </Text>
                      </Flex>
                      <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {spotlight.detail}
                      </Text>
                    </Box>
                    <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                      {spotlight.names.map((name) => (
                        <Box
                          key={name}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--ds-color-white)',
                            border: '1px solid var(--ds-color-neutral-200)',
                          }}
                        >
                          <Icon name={name} decorative size={18} />
                        </Box>
                      ))}
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </Box>
        </Stack>
      </Card>

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box style={{ maxWidth: 420, width: '100%' }}>
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(value: string) => setSearch(value)}
                prefix={<Icon name="action.search" decorative size={16} />}
              />
            </Box>
            <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
              Showing {filtered.length} of {categoryCounts.all} matching icons
            </Text>
          </Flex>
          <Flex gap={6} style={{ flexWrap: 'wrap' }}>
            {FILTER_CATEGORIES.map((category) => (
              <Box
                key={category}
                as="button"
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor:
                    activeCategory === category
                      ? 'var(--ds-color-primary-500)'
                      : 'var(--ds-color-neutral-200)',
                  background:
                    activeCategory === category
                      ? 'var(--ds-color-primary-50)'
                      : 'var(--ds-color-white)',
                  color:
                    activeCategory === category
                      ? 'var(--ds-color-primary-700)'
                      : 'var(--ds-color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: activeCategory === category ? 600 : 400,
                }}
              >
                {(category === 'all' ? 'All' : CATEGORY_LABELS[category])} ({categoryCounts[category] || 0})
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>

      {CATEGORY_ORDER.map((category) => {
        const icons = grouped[category];
        if (!icons || icons.length === 0) return null;

        return (
          <Card
            key={category}
            style={{
              width: '100%',
              padding: tokens.spacing[5],
              border: '1px solid var(--ds-color-border-secondary)',
              background:
                'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-overlay))',
            }}
          >
            <Stack spacing="md" fullWidth>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Text as={"h2" as any} size="lg" weight="semibold">
                  {CATEGORY_LABELS[category]}
                </Text>
                <Badge variant="secondary">{icons.length}</Badge>
              </Flex>
              <Box
                className="showroom-icons-category-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {icons.map((entry) => (
                  <IconCell key={entry.name} entry={entry} />
                ))}
              </Box>
            </Stack>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <Card style={{ padding: tokens.spacing[7], textAlign: 'center' }}>
          <Stack spacing="sm">
            <Text as={"h2" as any} size="lg" weight="semibold">
              No icons match the current filter
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
              Try another keyword or reset to `all` categories.
            </Text>
          </Stack>
        </Card>
      )}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Text as={"h2" as any} size="lg" weight="semibold">
              Usage guidance
            </Text>
            {[
              'Prefer task meaning over decorative novelty.',
              'Match icon weight to nearby typography and button density.',
              'Use icons to reinforce labels, not replace them in dense products.',
              'Import from @rottay/design-system/icons only.',
            ].map((rule) => (
              <Box
                key={rule}
                style={{
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: 'var(--ds-color-bg-overlay)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Text key={rule} size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  {rule}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Text as={"h2" as any} size="lg" weight="semibold">
              Sizing
            </Text>
            <Flex gap={12} align="end">
              {[16, 20, 24, 32].map((size) => (
                <Stack key={size} spacing={4} align="center">
                  <Box
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--ds-color-neutral-50)',
                      border: '1px solid var(--ds-color-neutral-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="action.search" decorative size={size} />
                  </Box>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}
                  >
                    {size}px
                  </Text>
                </Stack>
              ))}
            </Flex>
          </Stack>
        </Card>
      </Box>

      <CodeBlock
        title="Icon import"
        language="tsx"
        code={`import { Icon } from '@rottay/design-system/icons';

<Button variant="primary">
  <Icon name="action.add" decorative size={16} />
  Add record
</Button>`}
      />

      <style>{`
        .showroom-icons-category-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: ${tokens.spacing[3]}px;
        }

        @container showroom-content (max-width: 1720px) {
          .showroom-icons-category-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1380px) {
          .showroom-icons-category-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 1080px) {
          .showroom-icons-spotlight-grid,
          .showroom-icons-category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 820px) {
          .showroom-icons-category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @container showroom-content (max-width: 620px) {
          .showroom-icons-spotlight-grid,
          .showroom-icons-category-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </Stack>
  );
}
