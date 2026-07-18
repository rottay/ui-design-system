/**
 * Icons Registry
 *
 * Catalog of all 109 curated icons in the design system.
 * Product icons resolve through the governed semantic icon facade.
 * Grouped by category: navigation, action, status, content, communication,
 * user, data, layout, media, misc.
 */

export type IconCategory =
  | 'navigation'
  | 'action'
  | 'status'
  | 'content'
  | 'communication'
  | 'user'
  | 'data'
  | 'layout'
  | 'media'
  | 'misc';

export interface IconEntry {
  slug: string;
  name: string;
  category: IconCategory;
  /** Supplier-independent lookup alias retained for catalog search. */
  searchAlias: string;
}

// ---------------------------------------------------------------------------
// Navigation -- arrows, chevrons, menus
// ---------------------------------------------------------------------------

const navigation: IconEntry[] = [
  { slug: 'arrow-left', name: 'ArrowLeftIcon', category: 'navigation', searchAlias: 'ArrowLeft' },
  { slug: 'arrow-right', name: 'ArrowRightIcon', category: 'navigation', searchAlias: 'ArrowRight' },
  { slug: 'arrow-up', name: 'ArrowUpIcon', category: 'navigation', searchAlias: 'ArrowUp' },
  { slug: 'arrow-down', name: 'ArrowDownIcon', category: 'navigation', searchAlias: 'ArrowDown' },
  { slug: 'arrow-up-right', name: 'ArrowUpRightIcon', category: 'navigation', searchAlias: 'ArrowUpRight' },
  { slug: 'chevron-down', name: 'ChevronDownIcon', category: 'navigation', searchAlias: 'ChevronDown' },
  { slug: 'chevron-up', name: 'ChevronUpIcon', category: 'navigation', searchAlias: 'ChevronUp' },
  { slug: 'chevron-left', name: 'ChevronLeftIcon', category: 'navigation', searchAlias: 'ChevronLeft' },
  { slug: 'chevron-right', name: 'ChevronRightIcon', category: 'navigation', searchAlias: 'ChevronRight' },
  { slug: 'home', name: 'HomeIcon', category: 'navigation', searchAlias: 'Home' },
  { slug: 'external-link', name: 'ExternalLinkIcon', category: 'navigation', searchAlias: 'ExternalLink' },
  { slug: 'menu', name: 'MenuIcon', category: 'navigation', searchAlias: 'Menu' },
  { slug: 'more-horizontal', name: 'MoreHorizontalIcon', category: 'navigation', searchAlias: 'MoreHorizontal' },
  { slug: 'panel-right-close', name: 'PanelRightCloseIcon', category: 'navigation', searchAlias: 'PanelRightClose' },
  { slug: 'scan-search', name: 'ScanSearchIcon', category: 'navigation', searchAlias: 'ScanSearch' },
];

// ---------------------------------------------------------------------------
// Action -- CRUD, clipboard, power
// ---------------------------------------------------------------------------

const action: IconEntry[] = [
  { slug: 'plus', name: 'PlusIcon', category: 'action', searchAlias: 'Plus' },
  { slug: 'edit', name: 'EditIcon', category: 'action', searchAlias: 'Edit' },
  { slug: 'pencil', name: 'PencilIcon', category: 'action', searchAlias: 'Pencil' },
  { slug: 'pencil-line', name: 'PencilLineIcon', category: 'action', searchAlias: 'PencilLine' },
  { slug: 'trash', name: 'Trash2Icon', category: 'action', searchAlias: 'Trash2' },
  { slug: 'save', name: 'SaveIcon', category: 'action', searchAlias: 'Save' },
  { slug: 'download', name: 'DownloadIcon', category: 'action', searchAlias: 'Download' },
  { slug: 'upload', name: 'UploadIcon', category: 'action', searchAlias: 'Upload' },
  { slug: 'copy', name: 'CopyIcon', category: 'action', searchAlias: 'Copy' },
  { slug: 'clipboard-copy', name: 'ClipboardCopyIcon', category: 'action', searchAlias: 'ClipboardCopy' },
  { slug: 'refresh', name: 'RefreshCwIcon', category: 'action', searchAlias: 'RefreshCw' },
  { slug: 'rotate', name: 'RotateCcwIcon', category: 'action', searchAlias: 'RotateCcw' },
  { slug: 'send', name: 'SendIcon', category: 'action', searchAlias: 'Send' },
  { slug: 'share', name: 'Share2Icon', category: 'action', searchAlias: 'Share2' },
  { slug: 'power', name: 'PowerIcon', category: 'action', searchAlias: 'Power' },
];

// ---------------------------------------------------------------------------
// Status -- checks, alerts, loading
// ---------------------------------------------------------------------------

const status: IconEntry[] = [
  { slug: 'check', name: 'CheckIcon', category: 'status', searchAlias: 'Check' },
  { slug: 'check-circle', name: 'CheckCircleIcon', category: 'status', searchAlias: 'CheckCircle' },
  { slug: 'check-circle-2', name: 'CheckCircle2Icon', category: 'status', searchAlias: 'CheckCircle2' },
  { slug: 'x', name: 'XIcon', category: 'status', searchAlias: 'X' },
  { slug: 'x-circle', name: 'XCircleIcon', category: 'status', searchAlias: 'XCircle' },
  { slug: 'alert-circle', name: 'AlertCircleIcon', category: 'status', searchAlias: 'AlertCircle' },
  { slug: 'alert-triangle', name: 'AlertTriangleIcon', category: 'status', searchAlias: 'AlertTriangle' },
  { slug: 'alert-octagon', name: 'AlertOctagonIcon', category: 'status', searchAlias: 'AlertOctagon' },
  { slug: 'info', name: 'InfoIcon', category: 'status', searchAlias: 'Info' },
  { slug: 'ban', name: 'BanIcon', category: 'status', searchAlias: 'Ban' },
  { slug: 'loader-circle', name: 'LoaderCircleIcon', category: 'status', searchAlias: 'LoaderCircle' },
  { slug: 'circle-alert', name: 'CircleAlertIcon', category: 'status', searchAlias: 'CircleAlert' },
];

// ---------------------------------------------------------------------------
// Content -- files, folders, bookmarks
// ---------------------------------------------------------------------------

const content: IconEntry[] = [
  { slug: 'file-text', name: 'FileTextIcon', category: 'content', searchAlias: 'FileText' },
  { slug: 'file-down', name: 'FileDownIcon', category: 'content', searchAlias: 'FileDown' },
  { slug: 'folder', name: 'FolderIcon', category: 'content', searchAlias: 'Folder' },
  { slug: 'braces', name: 'BracesIcon', category: 'content', searchAlias: 'Braces' },
  { slug: 'bookmark-plus', name: 'BookmarkPlusIcon', category: 'content', searchAlias: 'BookmarkPlus' },
  { slug: 'bookmark', name: 'BookmarkIcon', category: 'content', searchAlias: 'Bookmark' },
  { slug: 'image', name: 'ImageIcon', category: 'content', searchAlias: 'Image' },
];

// ---------------------------------------------------------------------------
// Communication -- mail, messaging, notifications
// ---------------------------------------------------------------------------

const communication: IconEntry[] = [
  { slug: 'mail', name: 'MailIcon', category: 'communication', searchAlias: 'Mail' },
  { slug: 'message-square', name: 'MessageSquareIcon', category: 'communication', searchAlias: 'MessageSquare' },
  { slug: 'bell', name: 'BellIcon', category: 'communication', searchAlias: 'Bell' },
  { slug: 'phone', name: 'PhoneIcon', category: 'communication', searchAlias: 'Phone' },
  { slug: 'inbox', name: 'InboxIcon', category: 'communication', searchAlias: 'Inbox' },
  { slug: 'send-message', name: 'SendMessageIcon', category: 'communication', searchAlias: 'Send' },
];

// ---------------------------------------------------------------------------
// User -- people, auth, security
// ---------------------------------------------------------------------------

const user: IconEntry[] = [
  { slug: 'user', name: 'UserIcon', category: 'user', searchAlias: 'User' },
  { slug: 'users', name: 'UsersIcon', category: 'user', searchAlias: 'Users' },
  { slug: 'user-check', name: 'UserCheckIcon', category: 'user', searchAlias: 'UserCheck' },
  { slug: 'user-x', name: 'UserXIcon', category: 'user', searchAlias: 'UserX' },
  { slug: 'user-minus', name: 'UserMinusIcon', category: 'user', searchAlias: 'UserMinus' },
  { slug: 'settings', name: 'SettingsIcon', category: 'user', searchAlias: 'Settings' },
  { slug: 'settings-2', name: 'Settings2Icon', category: 'user', searchAlias: 'Settings2' },
  { slug: 'shield', name: 'ShieldIcon', category: 'user', searchAlias: 'Shield' },
  { slug: 'shield-check', name: 'ShieldCheckIcon', category: 'user', searchAlias: 'ShieldCheck' },
  { slug: 'lock', name: 'LockIcon', category: 'user', searchAlias: 'Lock' },
  { slug: 'key', name: 'KeyIcon', category: 'user', searchAlias: 'Key' },
  { slug: 'key-round', name: 'KeyRoundIcon', category: 'user', searchAlias: 'KeyRound' },
  { slug: 'fingerprint', name: 'FingerprintIcon', category: 'user', searchAlias: 'Fingerprint' },
  { slug: 'log-out', name: 'LogOutIcon', category: 'user', searchAlias: 'LogOut' },
];

// ---------------------------------------------------------------------------
// Data -- charts, search, filters, databases
// ---------------------------------------------------------------------------

const dataIcons: IconEntry[] = [
  { slug: 'bar-chart', name: 'BarChart3Icon', category: 'data', searchAlias: 'BarChart3' },
  { slug: 'trending-up', name: 'TrendingUpIcon', category: 'data', searchAlias: 'TrendingUp' },
  { slug: 'trending-down', name: 'TrendingDownIcon', category: 'data', searchAlias: 'TrendingDown' },
  { slug: 'activity', name: 'ActivityIcon', category: 'data', searchAlias: 'Activity' },
  { slug: 'database', name: 'DatabaseIcon', category: 'data', searchAlias: 'Database' },
  { slug: 'search', name: 'SearchIcon', category: 'data', searchAlias: 'Search' },
  { slug: 'filter', name: 'FilterIcon', category: 'data', searchAlias: 'Filter' },
  { slug: 'sliders', name: 'SlidersHorizontalIcon', category: 'data', searchAlias: 'SlidersHorizontal' },
  { slug: 'layers', name: 'LayersIcon', category: 'data', searchAlias: 'Layers' },
  { slug: 'globe', name: 'GlobeIcon', category: 'data', searchAlias: 'Globe' },
];

// ---------------------------------------------------------------------------
// Layout -- views, grids, calendars, alignment
// ---------------------------------------------------------------------------

const layoutIcons: IconEntry[] = [
  { slug: 'list', name: 'ListIcon', category: 'layout', searchAlias: 'List' },
  { slug: 'layout-grid', name: 'LayoutGridIcon', category: 'layout', searchAlias: 'LayoutGrid' },
  { slug: 'grid-3x3', name: 'Grid3x3Icon', category: 'layout', searchAlias: 'Grid3x3' },
  { slug: 'columns-3', name: 'Columns3Icon', category: 'layout', searchAlias: 'Columns3' },
  { slug: 'calendar', name: 'CalendarIcon', category: 'layout', searchAlias: 'Calendar' },
  { slug: 'calendar-days', name: 'CalendarDaysIcon', category: 'layout', searchAlias: 'CalendarDays' },
  { slug: 'align-justify', name: 'AlignJustifyIcon', category: 'layout', searchAlias: 'AlignJustify' },
  { slug: 'align-center', name: 'AlignCenterIcon', category: 'layout', searchAlias: 'AlignCenter' },
  { slug: 'align-left', name: 'AlignLeftIcon', category: 'layout', searchAlias: 'AlignLeft' },
  { slug: 'layout-template', name: 'LayoutTemplateIcon', category: 'layout', searchAlias: 'LayoutTemplate' },
];

// ---------------------------------------------------------------------------
// Media -- visibility, ratings, audio, visual
// ---------------------------------------------------------------------------

const media: IconEntry[] = [
  { slug: 'eye', name: 'EyeIcon', category: 'media', searchAlias: 'Eye' },
  { slug: 'eye-off', name: 'EyeOffIcon', category: 'media', searchAlias: 'EyeOff' },
  { slug: 'star', name: 'StarIcon', category: 'media', searchAlias: 'Star' },
  { slug: 'zap', name: 'ZapIcon', category: 'media', searchAlias: 'Zap' },
  { slug: 'sparkles', name: 'SparklesIcon', category: 'media', searchAlias: 'Sparkles' },
  { slug: 'mic', name: 'MicIcon', category: 'media', searchAlias: 'Mic' },
  { slug: 'mic-off', name: 'MicOffIcon', category: 'media', searchAlias: 'MicOff' },
  { slug: 'audio-lines', name: 'AudioLinesIcon', category: 'media', searchAlias: 'AudioLines' },
  { slug: 'camera', name: 'CameraIcon', category: 'media', searchAlias: 'Camera' },
];

// ---------------------------------------------------------------------------
// Misc -- workspace, time, utilities
// ---------------------------------------------------------------------------

const misc: IconEntry[] = [
  { slug: 'briefcase', name: 'BriefcaseIcon', category: 'misc', searchAlias: 'Briefcase' },
  { slug: 'building', name: 'Building2Icon', category: 'misc', searchAlias: 'Building2' },
  { slug: 'keyboard', name: 'KeyboardIcon', category: 'misc', searchAlias: 'Keyboard' },
  { slug: 'clock', name: 'ClockIcon', category: 'misc', searchAlias: 'Clock' },
  { slug: 'loader', name: 'Loader2Icon', category: 'misc', searchAlias: 'Loader2' },
  { slug: 'flag', name: 'FlagIcon', category: 'misc', searchAlias: 'Flag' },
  { slug: 'rocket', name: 'RocketIcon', category: 'misc', searchAlias: 'Rocket' },
  { slug: 'grip-vertical', name: 'GripVerticalIcon', category: 'misc', searchAlias: 'GripVertical' },
  { slug: 'pin', name: 'PinIcon', category: 'misc', searchAlias: 'Pin' },
  { slug: 'pin-off', name: 'PinOffIcon', category: 'misc', searchAlias: 'PinOff' },
  { slug: 'git-compare', name: 'GitCompareIcon', category: 'misc', searchAlias: 'GitCompare' },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const icons: IconEntry[] = [
  ...navigation,
  ...action,
  ...status,
  ...content,
  ...communication,
  ...user,
  ...dataIcons,
  ...layoutIcons,
  ...media,
  ...misc,
];

export const iconsByCategory: Record<IconCategory, IconEntry[]> = {
  navigation,
  action,
  status,
  content,
  communication,
  user,
  data: dataIcons,
  layout: layoutIcons,
  media,
  misc,
};

export const iconCategories: { slug: IconCategory; label: string; count: number }[] = [
  { slug: 'navigation', label: 'Navigation', count: navigation.length },
  { slug: 'action', label: 'Action', count: action.length },
  { slug: 'status', label: 'Status', count: status.length },
  { slug: 'content', label: 'Content', count: content.length },
  { slug: 'communication', label: 'Communication', count: communication.length },
  { slug: 'user', label: 'User', count: user.length },
  { slug: 'data', label: 'Data', count: dataIcons.length },
  { slug: 'layout', label: 'Layout', count: layoutIcons.length },
  { slug: 'media', label: 'Media', count: media.length },
  { slug: 'misc', label: 'Misc', count: misc.length },
];
