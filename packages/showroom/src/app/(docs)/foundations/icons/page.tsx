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
import * as AllIcons from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import { FoundationTopRail } from '../foundation-top-rail';

const CATEGORY_MAP: Record<string, string> = {
  ArrowLeftIcon: 'navigation',
  ArrowRightIcon: 'navigation',
  ArrowUpIcon: 'navigation',
  ArrowDownIcon: 'navigation',
  ArrowUpRightIcon: 'navigation',
  ChevronDownIcon: 'navigation',
  ChevronUpIcon: 'navigation',
  ChevronLeftIcon: 'navigation',
  ChevronRightIcon: 'navigation',
  HomeIcon: 'navigation',
  ExternalLinkIcon: 'navigation',
  MenuIcon: 'navigation',
  MoreHorizontalIcon: 'navigation',
  PanelRightCloseIcon: 'navigation',
  ScanSearchIcon: 'navigation',
  PlusIcon: 'action',
  EditIcon: 'action',
  PencilIcon: 'action',
  PencilLineIcon: 'action',
  Trash2Icon: 'action',
  SaveIcon: 'action',
  DownloadIcon: 'action',
  UploadIcon: 'action',
  CopyIcon: 'action',
  ClipboardCopyIcon: 'action',
  RefreshCwIcon: 'action',
  RotateCcwIcon: 'action',
  SendIcon: 'action',
  Share2Icon: 'action',
  PowerIcon: 'action',
  CheckIcon: 'status',
  CheckCircleIcon: 'status',
  CheckCircle2Icon: 'status',
  XIcon: 'status',
  XCircleIcon: 'status',
  AlertCircleIcon: 'status',
  AlertTriangleIcon: 'status',
  AlertOctagonIcon: 'status',
  InfoIcon: 'status',
  BanIcon: 'status',
  LoaderCircleIcon: 'status',
  CircleAlertIcon: 'status',
  FileTextIcon: 'content',
  FileDownIcon: 'content',
  FolderIcon: 'content',
  BracesIcon: 'content',
  BookmarkPlusIcon: 'content',
  BookmarkIcon: 'content',
  ImageIcon: 'content',
  MailIcon: 'communication',
  MessageSquareIcon: 'communication',
  BellIcon: 'communication',
  PhoneIcon: 'communication',
  InboxIcon: 'communication',
  SendMessageIcon: 'communication',
  UserIcon: 'user',
  UsersIcon: 'user',
  UserCheckIcon: 'user',
  UserXIcon: 'user',
  UserMinusIcon: 'user',
  SettingsIcon: 'user',
  Settings2Icon: 'user',
  ShieldIcon: 'user',
  ShieldCheckIcon: 'user',
  LockIcon: 'user',
  KeyIcon: 'user',
  KeyRoundIcon: 'user',
  FingerprintIcon: 'user',
  LogOutIcon: 'user',
  BarChart3Icon: 'data',
  TrendingUpIcon: 'data',
  TrendingDownIcon: 'data',
  ActivityIcon: 'data',
  DatabaseIcon: 'data',
  SearchIcon: 'data',
  FilterIcon: 'data',
  SlidersHorizontalIcon: 'data',
  LayersIcon: 'data',
  GlobeIcon: 'data',
  ListIcon: 'layout',
  LayoutGridIcon: 'layout',
  Grid3x3Icon: 'layout',
  Columns3Icon: 'layout',
  CalendarIcon: 'layout',
  CalendarDaysIcon: 'layout',
  AlignJustifyIcon: 'layout',
  AlignCenterIcon: 'layout',
  AlignLeftIcon: 'layout',
  LayoutTemplateIcon: 'layout',
  EyeIcon: 'media',
  EyeOffIcon: 'media',
  StarIcon: 'media',
  ZapIcon: 'media',
  SparklesIcon: 'media',
  MicIcon: 'media',
  MicOffIcon: 'media',
  AudioLinesIcon: 'media',
  CameraIcon: 'media',
  BriefcaseIcon: 'misc',
  Building2Icon: 'misc',
  KeyboardIcon: 'misc',
  ClockIcon: 'misc',
  Loader2Icon: 'misc',
  FlagIcon: 'misc',
  RocketIcon: 'misc',
  GripVerticalIcon: 'misc',
  PinIcon: 'misc',
  PinOffIcon: 'misc',
  GitCompareIcon: 'misc',
};

const NON_ICON_EXPORTS = new Set([
  'createIcon',
  'ICON_SIZE_MAP',
  'ICON_SIZE_TOKENS',
  'BaseIcon',
  'AlertIcon',
  'LoaderIcon',
]);

const CATEGORY_ORDER = [
  'navigation',
  'action',
  'status',
  'content',
  'communication',
  'user',
  'data',
  'layout',
  'media',
  'misc',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  action: 'Action',
  status: 'Status',
  content: 'Content',
  communication: 'Communication',
  user: 'User & Identity',
  data: 'Data',
  layout: 'Layout',
  media: 'Media',
  misc: 'Misc',
};

interface IconEntry {
  name: string;
  component: React.ComponentType<{ size?: number }>;
  category: string;
}

const ICON_REGISTRY: IconEntry[] = Object.entries(AllIcons)
  .filter(([name, value]) => {
    if (NON_ICON_EXPORTS.has(name)) return false;
    if (typeof value !== 'function') return false;
    return name.endsWith('Icon');
  })
  .map(([name, component]) => ({
    name,
    component: component as React.ComponentType<{ size?: number }>,
    category: CATEGORY_MAP[name] || 'misc',
  }))
  .sort((a, b) => {
    const categoryDelta = CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number]) -
      CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number]);
    if (categoryDelta !== 0) return categoryDelta;
    return a.name.localeCompare(b.name);
  });

const ICON_SPOTLIGHTS = [
  {
    title: 'Navigation',
    detail: 'Wayfinding, switchers, and shell chrome.',
    icons: [AllIcons.MenuIcon, AllIcons.ArrowLeftIcon, AllIcons.ChevronRightIcon],
  },
  {
    title: 'Action',
    detail: 'Primary verbs and direct manipulation.',
    icons: [AllIcons.PlusIcon, AllIcons.CheckIcon, AllIcons.DownloadIcon],
  },
  {
    title: 'Status',
    detail: 'Success, warnings, and operational states.',
    icons: [
      AllIcons.CheckCircleIcon,
      AllIcons.AlertTriangleIcon,
      AllIcons.LoaderCircleIcon,
    ],
  },
] as const;

function IconCell({ entry }: { entry: IconEntry }) {
  const tokens = useTokens();
  const [copied, setCopied] = useState(false);
  const Icon = entry.component;

  return (
    <Box
      as="button"
      onClick={() => {
        navigator.clipboard
          .writeText(`import { ${entry.name} } from '@rottay/design-system/icons';`)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.lg,
        border: '1px solid var(--ds-color-neutral-200)',
        background:
          copied
            ? 'linear-gradient(180deg, var(--ds-color-success-50), var(--ds-color-white))'
            : 'linear-gradient(180deg, var(--ds-color-white), var(--ds-color-neutral-50))',
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
        <Icon size={24} />
      </Box>
      <Text
        size="xs"
        style={{
          textAlign: 'center',
          color: copied ? 'var(--ds-color-success-700)' : 'var(--ds-color-text-secondary)',
          lineHeight: 1.45,
        }}
      >
        {copied ? 'Copied import' : entry.name.replace(/Icon$/, '')}
      </Text>
    </Box>
  );
}

export default function IconsPage() {
  const tokens = useTokens();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ICON_REGISTRY.length };
    for (const entry of ICON_REGISTRY) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return ICON_REGISTRY.filter((entry) => {
      const matchesSearch =
        search === '' || entry.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || entry.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

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
            body: 'All icons are wrapped for consistent sizing and currentColor behavior across themes and engines.',
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
          { label: 'Icons', value: `${ICON_REGISTRY.length}`, detail: 'Curated DS icon exports' },
          { label: 'Categories', value: `${CATEGORY_ORDER.length}`, detail: 'Organized by UI intent' },
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
                    <Text size="sm" weight="semibold">
                      {spotlight.title}
                    </Text>
                    <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                      {spotlight.detail}
                    </Text>
                  </Box>
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    {spotlight.icons.map((IconComponent) => (
                      <Box
                        key={IconComponent.displayName || IconComponent.name}
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
                        <IconComponent size={18} />
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
                prefix={<AllIcons.SearchIcon size={16} />}
              />
            </Box>
              <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
                Showing {filtered.length} of {ICON_REGISTRY.length}
              </Text>
            </Flex>
          <Flex gap={6} style={{ flexWrap: 'wrap' }}>
            {['all', ...CATEGORY_ORDER].map((category) => (
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
                {(CATEGORY_LABELS[category] || 'All')} ({categoryCounts[category] || ICON_REGISTRY.length})
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>

      {CATEGORY_ORDER.map((category) => {
        const icons = grouped[category];
        if (!icons || icons.length === 0) return null;

        return (
          <Stack key={category} spacing="md">
            <Flex align="center" gap={8}>
              <Text as={"h2" as any} size="lg" weight="semibold">
                {CATEGORY_LABELS[category]}
              </Text>
              <Badge variant="secondary">{icons.length}</Badge>
            </Flex>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {icons.map((entry) => (
                <IconCell key={entry.name} entry={entry} />
              ))}
            </Box>
          </Stack>
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
                    <AllIcons.SearchIcon size={size} />
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
        code={`import { SearchIcon, PlusIcon, CheckIcon } from '@rottay/design-system/icons';

<Button variant="primary">
  <PlusIcon size={16} />
  Add record
</Button>`}
      />

    </Stack>
  );
}
