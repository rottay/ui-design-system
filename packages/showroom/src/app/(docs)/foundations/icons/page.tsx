'use client';

import { useState, useMemo, useCallback } from 'react';
import { Box, Flex, Stack, Text, Card, Badge, Input } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { SearchIcon } from '@rottay/design-system/icons';

// ── Icon registry ──────────────────────────────────────────────────────
// Organized by the 10 catalog categories. Each entry maps a display name
// to the actual icon component so we can render it + build the import.

import {
  // navigation
  ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon,
  ArrowUpRightIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon,
  ChevronRightIcon, HomeIcon, ExternalLinkIcon, MenuIcon,
  MoreHorizontalIcon, PanelRightCloseIcon, ScanSearchIcon,
  // action
  PlusIcon, EditIcon, PencilIcon, PencilLineIcon, Trash2Icon,
  SaveIcon, DownloadIcon, UploadIcon, CopyIcon, ClipboardCopyIcon,
  RefreshCwIcon, RotateCcwIcon, SendIcon, Share2Icon, PowerIcon,
  // status
  CheckIcon, CheckCircleIcon, CheckCircle2Icon, XIcon, XCircleIcon,
  AlertCircleIcon, AlertTriangleIcon, AlertOctagonIcon, InfoIcon,
  BanIcon, LoaderCircleIcon, CircleAlertIcon,
  // content
  FileTextIcon, FileDownIcon, FolderIcon, BracesIcon,
  BookmarkPlusIcon, BookmarkIcon, ImageIcon,
  // communication
  MailIcon, MessageSquareIcon, BellIcon, PhoneIcon, InboxIcon,
  // user
  UserIcon, UsersIcon, UserCheckIcon, UserXIcon, UserMinusIcon,
  SettingsIcon, Settings2Icon, ShieldIcon, ShieldCheckIcon,
  LockIcon, KeyIcon, KeyRoundIcon, FingerprintIcon, LogOutIcon,
  // data
  BarChart3Icon, TrendingUpIcon, TrendingDownIcon, ActivityIcon,
  DatabaseIcon, FilterIcon, SlidersHorizontalIcon, LayersIcon, GlobeIcon,
  // layout
  ListIcon, LayoutGridIcon, Grid3x3Icon, Columns3Icon,
  CalendarIcon, CalendarDaysIcon, AlignJustifyIcon, AlignCenterIcon,
  AlignLeftIcon, LayoutTemplateIcon,
  // media
  EyeIcon, EyeOffIcon, StarIcon, ZapIcon, SparklesIcon,
  MicIcon, MicOffIcon, AudioLinesIcon, CameraIcon,
  // misc
  BriefcaseIcon, Building2Icon, KeyboardIcon, ClockIcon,
  Loader2Icon, FlagIcon, RocketIcon, GripVerticalIcon,
  PinIcon, PinOffIcon, GitCompareIcon,
} from '@rottay/design-system/icons';

interface IconEntry {
  name: string;
  component: React.ComponentType<{ size?: number }>;
  category: string;
}

const ICON_REGISTRY: IconEntry[] = [
  // Navigation (15)
  { name: 'ArrowLeftIcon', component: ArrowLeftIcon, category: 'navigation' },
  { name: 'ArrowRightIcon', component: ArrowRightIcon, category: 'navigation' },
  { name: 'ArrowUpIcon', component: ArrowUpIcon, category: 'navigation' },
  { name: 'ArrowDownIcon', component: ArrowDownIcon, category: 'navigation' },
  { name: 'ArrowUpRightIcon', component: ArrowUpRightIcon, category: 'navigation' },
  { name: 'ChevronDownIcon', component: ChevronDownIcon, category: 'navigation' },
  { name: 'ChevronUpIcon', component: ChevronUpIcon, category: 'navigation' },
  { name: 'ChevronLeftIcon', component: ChevronLeftIcon, category: 'navigation' },
  { name: 'ChevronRightIcon', component: ChevronRightIcon, category: 'navigation' },
  { name: 'HomeIcon', component: HomeIcon, category: 'navigation' },
  { name: 'ExternalLinkIcon', component: ExternalLinkIcon, category: 'navigation' },
  { name: 'MenuIcon', component: MenuIcon, category: 'navigation' },
  { name: 'MoreHorizontalIcon', component: MoreHorizontalIcon, category: 'navigation' },
  { name: 'PanelRightCloseIcon', component: PanelRightCloseIcon, category: 'navigation' },
  { name: 'ScanSearchIcon', component: ScanSearchIcon, category: 'navigation' },
  // Action (15)
  { name: 'PlusIcon', component: PlusIcon, category: 'action' },
  { name: 'EditIcon', component: EditIcon, category: 'action' },
  { name: 'PencilIcon', component: PencilIcon, category: 'action' },
  { name: 'PencilLineIcon', component: PencilLineIcon, category: 'action' },
  { name: 'Trash2Icon', component: Trash2Icon, category: 'action' },
  { name: 'SaveIcon', component: SaveIcon, category: 'action' },
  { name: 'DownloadIcon', component: DownloadIcon, category: 'action' },
  { name: 'UploadIcon', component: UploadIcon, category: 'action' },
  { name: 'CopyIcon', component: CopyIcon, category: 'action' },
  { name: 'ClipboardCopyIcon', component: ClipboardCopyIcon, category: 'action' },
  { name: 'RefreshCwIcon', component: RefreshCwIcon, category: 'action' },
  { name: 'RotateCcwIcon', component: RotateCcwIcon, category: 'action' },
  { name: 'SendIcon', component: SendIcon, category: 'action' },
  { name: 'Share2Icon', component: Share2Icon, category: 'action' },
  { name: 'PowerIcon', component: PowerIcon, category: 'action' },
  // Status (12)
  { name: 'CheckIcon', component: CheckIcon, category: 'status' },
  { name: 'CheckCircleIcon', component: CheckCircleIcon, category: 'status' },
  { name: 'CheckCircle2Icon', component: CheckCircle2Icon, category: 'status' },
  { name: 'XIcon', component: XIcon, category: 'status' },
  { name: 'XCircleIcon', component: XCircleIcon, category: 'status' },
  { name: 'AlertCircleIcon', component: AlertCircleIcon, category: 'status' },
  { name: 'AlertTriangleIcon', component: AlertTriangleIcon, category: 'status' },
  { name: 'AlertOctagonIcon', component: AlertOctagonIcon, category: 'status' },
  { name: 'InfoIcon', component: InfoIcon, category: 'status' },
  { name: 'BanIcon', component: BanIcon, category: 'status' },
  { name: 'LoaderCircleIcon', component: LoaderCircleIcon, category: 'status' },
  { name: 'CircleAlertIcon', component: CircleAlertIcon, category: 'status' },
  // Content (7)
  { name: 'FileTextIcon', component: FileTextIcon, category: 'content' },
  { name: 'FileDownIcon', component: FileDownIcon, category: 'content' },
  { name: 'FolderIcon', component: FolderIcon, category: 'content' },
  { name: 'BracesIcon', component: BracesIcon, category: 'content' },
  { name: 'BookmarkPlusIcon', component: BookmarkPlusIcon, category: 'content' },
  { name: 'BookmarkIcon', component: BookmarkIcon, category: 'content' },
  { name: 'ImageIcon', component: ImageIcon, category: 'content' },
  // Communication (5)
  { name: 'MailIcon', component: MailIcon, category: 'communication' },
  { name: 'MessageSquareIcon', component: MessageSquareIcon, category: 'communication' },
  { name: 'BellIcon', component: BellIcon, category: 'communication' },
  { name: 'PhoneIcon', component: PhoneIcon, category: 'communication' },
  { name: 'InboxIcon', component: InboxIcon, category: 'communication' },
  // User (14)
  { name: 'UserIcon', component: UserIcon, category: 'user' },
  { name: 'UsersIcon', component: UsersIcon, category: 'user' },
  { name: 'UserCheckIcon', component: UserCheckIcon, category: 'user' },
  { name: 'UserXIcon', component: UserXIcon, category: 'user' },
  { name: 'UserMinusIcon', component: UserMinusIcon, category: 'user' },
  { name: 'SettingsIcon', component: SettingsIcon, category: 'user' },
  { name: 'Settings2Icon', component: Settings2Icon, category: 'user' },
  { name: 'ShieldIcon', component: ShieldIcon, category: 'user' },
  { name: 'ShieldCheckIcon', component: ShieldCheckIcon, category: 'user' },
  { name: 'LockIcon', component: LockIcon, category: 'user' },
  { name: 'KeyIcon', component: KeyIcon, category: 'user' },
  { name: 'KeyRoundIcon', component: KeyRoundIcon, category: 'user' },
  { name: 'FingerprintIcon', component: FingerprintIcon, category: 'user' },
  { name: 'LogOutIcon', component: LogOutIcon, category: 'user' },
  // Data (10)
  { name: 'BarChart3Icon', component: BarChart3Icon, category: 'data' },
  { name: 'TrendingUpIcon', component: TrendingUpIcon, category: 'data' },
  { name: 'TrendingDownIcon', component: TrendingDownIcon, category: 'data' },
  { name: 'ActivityIcon', component: ActivityIcon, category: 'data' },
  { name: 'DatabaseIcon', component: DatabaseIcon, category: 'data' },
  { name: 'SearchIcon', component: SearchIcon, category: 'data' },
  { name: 'FilterIcon', component: FilterIcon, category: 'data' },
  { name: 'SlidersHorizontalIcon', component: SlidersHorizontalIcon, category: 'data' },
  { name: 'LayersIcon', component: LayersIcon, category: 'data' },
  { name: 'GlobeIcon', component: GlobeIcon, category: 'data' },
  // Layout (10)
  { name: 'ListIcon', component: ListIcon, category: 'layout' },
  { name: 'LayoutGridIcon', component: LayoutGridIcon, category: 'layout' },
  { name: 'Grid3x3Icon', component: Grid3x3Icon, category: 'layout' },
  { name: 'Columns3Icon', component: Columns3Icon, category: 'layout' },
  { name: 'CalendarIcon', component: CalendarIcon, category: 'layout' },
  { name: 'CalendarDaysIcon', component: CalendarDaysIcon, category: 'layout' },
  { name: 'AlignJustifyIcon', component: AlignJustifyIcon, category: 'layout' },
  { name: 'AlignCenterIcon', component: AlignCenterIcon, category: 'layout' },
  { name: 'AlignLeftIcon', component: AlignLeftIcon, category: 'layout' },
  { name: 'LayoutTemplateIcon', component: LayoutTemplateIcon, category: 'layout' },
  // Media (9)
  { name: 'EyeIcon', component: EyeIcon, category: 'media' },
  { name: 'EyeOffIcon', component: EyeOffIcon, category: 'media' },
  { name: 'StarIcon', component: StarIcon, category: 'media' },
  { name: 'ZapIcon', component: ZapIcon, category: 'media' },
  { name: 'SparklesIcon', component: SparklesIcon, category: 'media' },
  { name: 'MicIcon', component: MicIcon, category: 'media' },
  { name: 'MicOffIcon', component: MicOffIcon, category: 'media' },
  { name: 'AudioLinesIcon', component: AudioLinesIcon, category: 'media' },
  { name: 'CameraIcon', component: CameraIcon, category: 'media' },
  // Misc (11)
  { name: 'BriefcaseIcon', component: BriefcaseIcon, category: 'misc' },
  { name: 'Building2Icon', component: Building2Icon, category: 'misc' },
  { name: 'KeyboardIcon', component: KeyboardIcon, category: 'misc' },
  { name: 'ClockIcon', component: ClockIcon, category: 'misc' },
  { name: 'Loader2Icon', component: Loader2Icon, category: 'misc' },
  { name: 'FlagIcon', component: FlagIcon, category: 'misc' },
  { name: 'RocketIcon', component: RocketIcon, category: 'misc' },
  { name: 'GripVerticalIcon', component: GripVerticalIcon, category: 'misc' },
  { name: 'PinIcon', component: PinIcon, category: 'misc' },
  { name: 'PinOffIcon', component: PinOffIcon, category: 'misc' },
  { name: 'GitCompareIcon', component: GitCompareIcon, category: 'misc' },
];

const CATEGORIES = [
  'all', 'navigation', 'action', 'status', 'content', 'communication',
  'user', 'data', 'layout', 'media', 'misc',
] as const;

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
              prefix={<SearchIcon size={16} />}
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
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({categoryCounts[cat] || 0})
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>

      {/* Results count */}
      <Text size="sm" style={{ color: "var(--ds-color-text-muted)" }}>
        Showing {filtered.length} of {ICON_REGISTRY.length} icons
      </Text>

      {/* Icon grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: tokens.spacing[3],
        }}
      >
        {filtered.map((entry) => (
          <IconCell key={entry.name} entry={entry} />
        ))}
      </Box>

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
