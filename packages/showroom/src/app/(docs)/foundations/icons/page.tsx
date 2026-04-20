'use client';

import { useState, useMemo, useCallback } from 'react';
import { Box, Flex, Stack, Text, Card, Badge, Input } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import * as AllIcons from '@rottay/design-system/icons';

// ── Category mapping ─────────────────────────────────────────────────
// Maps each icon name to its catalog category. When a new icon is added
// to the DS catalog, add it here to place it in the correct group.
// Icons not listed here fall into 'misc' by default.

const CATEGORY_MAP: Record<string, string> = {
  // Navigation (15)
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
  // Action (15)
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
  // Status (12)
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
  // Content (7)
  FileTextIcon: 'content',
  FileDownIcon: 'content',
  FolderIcon: 'content',
  BracesIcon: 'content',
  BookmarkPlusIcon: 'content',
  BookmarkIcon: 'content',
  ImageIcon: 'content',
  // Communication (6)
  MailIcon: 'communication',
  MessageSquareIcon: 'communication',
  BellIcon: 'communication',
  PhoneIcon: 'communication',
  InboxIcon: 'communication',
  SendMessageIcon: 'communication',
  // User (14)
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
  // Data (10)
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
  // Layout (10)
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
  // Media (9)
  EyeIcon: 'media',
  EyeOffIcon: 'media',
  StarIcon: 'media',
  ZapIcon: 'media',
  SparklesIcon: 'media',
  MicIcon: 'media',
  MicOffIcon: 'media',
  AudioLinesIcon: 'media',
  CameraIcon: 'media',
  // Misc (11)
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

// ── Non-icon exports to exclude from the registry ────────────────────
const NON_ICON_EXPORTS = new Set([
  'createIcon',
  'ICON_SIZE_MAP',
  'ICON_SIZE_TOKENS',
  'BaseIcon',
  'AlertIcon',
  'LoaderIcon',
]);

// ── Constants ────────────────────────────────────────────────────────

const CATEGORIES_LIST = [
  'navigation', 'action', 'status', 'content', 'communication',
  'user', 'data', 'layout', 'media', 'misc',
];

const CATEGORIES = ['all', ...CATEGORIES_LIST] as const;

// ── Build the icon registry dynamically from AllIcons ────────────────
interface IconEntry {
  name: string;
  component: React.ComponentType<{ size?: number }>;
  category: string;
}

const ICON_REGISTRY: IconEntry[] = Object.entries(AllIcons)
  .filter(([name, value]) => {
    if (NON_ICON_EXPORTS.has(name)) return false;
    if (typeof value !== 'function') return false;
    if (!name.endsWith('Icon')) return false;
    return true;
  })
  .map(([name, component]) => ({
    name,
    component: component as React.ComponentType<{ size?: number }>,
    category: CATEGORY_MAP[name] || 'misc',
  }))
  .sort((a, b) => {
    const catOrder = CATEGORIES_LIST.indexOf(a.category) - CATEGORIES_LIST.indexOf(b.category);
    if (catOrder !== 0) return catOrder;
    return a.name.localeCompare(b.name);
  });

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
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

// ── IconCell ─────────────────────────────────────────────────────────

function IconCell({ entry }: { entry: IconEntry }) {
  const tokens = useTokens();
  const [copied, setCopied] = useState(false);
  const Icon = entry.component;

  const handleClick = useCallback(() => {
    const importStatement = `import { ${entry.name} } from '@rottay/design-system/icons';`;
    navigator.clipboard.writeText(importStatement).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [entry.name]);

  return (
    <Box
      as="button"
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.lg,
        border: '1px solid var(--ds-color-neutral-200)',
        background: copied ? 'var(--ds-color-success-50)' : 'var(--ds-color-white)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        minWidth: 0,
      }}
    >
      <Box
        style={{
          color: copied ? 'var(--ds-color-success-600)' : 'var(--ds-color-text-primary)',
          transition: 'color 150ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
        }}
      >
        <Icon size={24} />
      </Box>
      <Text
        size="xs"
        color={copied ? 'default' : 'muted'}
        style={{
          wordBreak: 'break-all',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {copied ? 'Copied!' : entry.name.replace(/Icon$/, '')}
      </Text>
    </Box>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function IconsPage() {
  const tokens = useTokens();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return ICON_REGISTRY.filter((entry) => {
      const matchesSearch = search === '' || entry.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ICON_REGISTRY.length };
    for (const entry of ICON_REGISTRY) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Group filtered icons by category for grouped display
  const grouped = useMemo(() => {
    const groups: Record<string, IconEntry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Icons
          </Text>
          <Badge variant="primary">{ICON_REGISTRY.length} icons</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            All icons are lucide-react components wrapped via createIcon() with DS
            defaults: token-driven sizing, currentColor inheritance, and the
            rottay-icon CSS class. Click any icon to copy its import statement.
          </Text>
        </Box>
      </Box>

      {/* Search + category filter */}
      <Card>
        <Stack spacing="md">
          {/* Search input */}
          <Box style={{ maxWidth: 400 }}>
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(value: string) => setSearch(value)}
              prefix={<AllIcons.SearchIcon size={16} />}
            />
          </Box>

          {/* Category pills */}
          <Flex gap={6} style={{ flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <Box
                key={cat}
                as="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: activeCategory === cat
                    ? 'var(--ds-color-primary-500)'
                    : 'var(--ds-color-neutral-200)',
                  background: activeCategory === cat
                    ? 'var(--ds-color-primary-50)'
                    : 'var(--ds-color-white)',
                  color: activeCategory === cat
                    ? 'var(--ds-color-primary-700)'
                    : 'var(--ds-color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: activeCategory === cat ? 600 : 400,
                  transition: 'all 150ms ease',
                }}
              >
                {CATEGORY_LABELS[cat] || cat} ({categoryCounts[cat] || 0})
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>

      {/* Results count */}
      <Text size="sm" style={{ color: "var(--ds-color-text-muted)" }}>
        Showing {filtered.length} of {ICON_REGISTRY.length} icons
      </Text>

      {/* Icon grid grouped by category */}
      {CATEGORIES_LIST.map((cat) => {
        const icons = grouped[cat];
        if (!icons || icons.length === 0) return null;
        return (
          <Box key={cat}>
            <Box style={{ marginBottom: tokens.spacing[3] }}>
              <Flex align="center" gap={6}>
                <Text as={"h2" as any} size="lg" weight="semibold">
                  {CATEGORY_LABELS[cat] || cat}
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
                  {icons.length}
                </Text>
              </Flex>
            </Box>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {icons.map((entry) => (
                <IconCell key={entry.name} entry={entry} />
              ))}
            </Box>
          </Box>
        );
      })}

      {filtered.length === 0 && (
        <Flex
          align="center"
          justify="center"
          style={{
            padding: tokens.spacing[10],
            color: 'var(--ds-color-text-tertiary)',
          }}
        >
          <Text size="md" style={{ color: "var(--ds-color-text-muted)" }}>
            No icons match your search.
          </Text>
        </Flex>
      )}

      {/* Import hint */}
      <Card>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">Import Pattern</Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              lineHeight: 1.6,
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Always import from the DS, never from lucide-react directly`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`import { SearchIcon, PlusIcon, CheckIcon } from '@rottay/design-system/icons';`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
