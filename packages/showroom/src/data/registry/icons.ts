/**
 * Icons Registry
 *
 * Catalog of all 109 curated icons in the design system.
 * All icons are created via createIcon() wrapping lucide-react.
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
  lucideSource: string;
}

// ---------------------------------------------------------------------------
// Navigation -- arrows, chevrons, menus
// ---------------------------------------------------------------------------

const navigation: IconEntry[] = [
  { slug: 'arrow-left', name: 'ArrowLeftIcon', category: 'navigation', lucideSource: 'ArrowLeft' },
  { slug: 'arrow-right', name: 'ArrowRightIcon', category: 'navigation', lucideSource: 'ArrowRight' },
  { slug: 'arrow-up', name: 'ArrowUpIcon', category: 'navigation', lucideSource: 'ArrowUp' },
  { slug: 'arrow-down', name: 'ArrowDownIcon', category: 'navigation', lucideSource: 'ArrowDown' },
  { slug: 'arrow-up-right', name: 'ArrowUpRightIcon', category: 'navigation', lucideSource: 'ArrowUpRight' },
  { slug: 'chevron-down', name: 'ChevronDownIcon', category: 'navigation', lucideSource: 'ChevronDown' },
  { slug: 'chevron-up', name: 'ChevronUpIcon', category: 'navigation', lucideSource: 'ChevronUp' },
  { slug: 'chevron-left', name: 'ChevronLeftIcon', category: 'navigation', lucideSource: 'ChevronLeft' },
  { slug: 'chevron-right', name: 'ChevronRightIcon', category: 'navigation', lucideSource: 'ChevronRight' },
  { slug: 'home', name: 'HomeIcon', category: 'navigation', lucideSource: 'Home' },
  { slug: 'external-link', name: 'ExternalLinkIcon', category: 'navigation', lucideSource: 'ExternalLink' },
  { slug: 'menu', name: 'MenuIcon', category: 'navigation', lucideSource: 'Menu' },
  { slug: 'more-horizontal', name: 'MoreHorizontalIcon', category: 'navigation', lucideSource: 'MoreHorizontal' },
  { slug: 'panel-right-close', name: 'PanelRightCloseIcon', category: 'navigation', lucideSource: 'PanelRightClose' },
  { slug: 'scan-search', name: 'ScanSearchIcon', category: 'navigation', lucideSource: 'ScanSearch' },
];

// ---------------------------------------------------------------------------
// Action -- CRUD, clipboard, power
// ---------------------------------------------------------------------------

const action: IconEntry[] = [
  { slug: 'plus', name: 'PlusIcon', category: 'action', lucideSource: 'Plus' },
  { slug: 'edit', name: 'EditIcon', category: 'action', lucideSource: 'Edit' },
  { slug: 'pencil', name: 'PencilIcon', category: 'action', lucideSource: 'Pencil' },
  { slug: 'pencil-line', name: 'PencilLineIcon', category: 'action', lucideSource: 'PencilLine' },
  { slug: 'trash', name: 'Trash2Icon', category: 'action', lucideSource: 'Trash2' },
  { slug: 'save', name: 'SaveIcon', category: 'action', lucideSource: 'Save' },
  { slug: 'download', name: 'DownloadIcon', category: 'action', lucideSource: 'Download' },
  { slug: 'upload', name: 'UploadIcon', category: 'action', lucideSource: 'Upload' },
  { slug: 'copy', name: 'CopyIcon', category: 'action', lucideSource: 'Copy' },
  { slug: 'clipboard-copy', name: 'ClipboardCopyIcon', category: 'action', lucideSource: 'ClipboardCopy' },
  { slug: 'refresh', name: 'RefreshCwIcon', category: 'action', lucideSource: 'RefreshCw' },
  { slug: 'rotate', name: 'RotateCcwIcon', category: 'action', lucideSource: 'RotateCcw' },
  { slug: 'send', name: 'SendIcon', category: 'action', lucideSource: 'Send' },
  { slug: 'share', name: 'Share2Icon', category: 'action', lucideSource: 'Share2' },
  { slug: 'power', name: 'PowerIcon', category: 'action', lucideSource: 'Power' },
];

// ---------------------------------------------------------------------------
// Status -- checks, alerts, loading
// ---------------------------------------------------------------------------

const status: IconEntry[] = [
  { slug: 'check', name: 'CheckIcon', category: 'status', lucideSource: 'Check' },
  { slug: 'check-circle', name: 'CheckCircleIcon', category: 'status', lucideSource: 'CheckCircle' },
  { slug: 'check-circle-2', name: 'CheckCircle2Icon', category: 'status', lucideSource: 'CheckCircle2' },
  { slug: 'x', name: 'XIcon', category: 'status', lucideSource: 'X' },
  { slug: 'x-circle', name: 'XCircleIcon', category: 'status', lucideSource: 'XCircle' },
  { slug: 'alert-circle', name: 'AlertCircleIcon', category: 'status', lucideSource: 'AlertCircle' },
  { slug: 'alert-triangle', name: 'AlertTriangleIcon', category: 'status', lucideSource: 'AlertTriangle' },
  { slug: 'alert-octagon', name: 'AlertOctagonIcon', category: 'status', lucideSource: 'AlertOctagon' },
  { slug: 'info', name: 'InfoIcon', category: 'status', lucideSource: 'Info' },
  { slug: 'ban', name: 'BanIcon', category: 'status', lucideSource: 'Ban' },
  { slug: 'loader-circle', name: 'LoaderCircleIcon', category: 'status', lucideSource: 'LoaderCircle' },
  { slug: 'circle-alert', name: 'CircleAlertIcon', category: 'status', lucideSource: 'CircleAlert' },
];

// ---------------------------------------------------------------------------
// Content -- files, folders, bookmarks
// ---------------------------------------------------------------------------

const content: IconEntry[] = [
  { slug: 'file-text', name: 'FileTextIcon', category: 'content', lucideSource: 'FileText' },
  { slug: 'file-down', name: 'FileDownIcon', category: 'content', lucideSource: 'FileDown' },
  { slug: 'folder', name: 'FolderIcon', category: 'content', lucideSource: 'Folder' },
  { slug: 'braces', name: 'BracesIcon', category: 'content', lucideSource: 'Braces' },
  { slug: 'bookmark-plus', name: 'BookmarkPlusIcon', category: 'content', lucideSource: 'BookmarkPlus' },
  { slug: 'bookmark', name: 'BookmarkIcon', category: 'content', lucideSource: 'Bookmark' },
  { slug: 'image', name: 'ImageIcon', category: 'content', lucideSource: 'Image' },
];

// ---------------------------------------------------------------------------
// Communication -- mail, messaging, notifications
// ---------------------------------------------------------------------------

const communication: IconEntry[] = [
  { slug: 'mail', name: 'MailIcon', category: 'communication', lucideSource: 'Mail' },
  { slug: 'message-square', name: 'MessageSquareIcon', category: 'communication', lucideSource: 'MessageSquare' },
  { slug: 'bell', name: 'BellIcon', category: 'communication', lucideSource: 'Bell' },
  { slug: 'phone', name: 'PhoneIcon', category: 'communication', lucideSource: 'Phone' },
  { slug: 'inbox', name: 'InboxIcon', category: 'communication', lucideSource: 'Inbox' },
  { slug: 'send-message', name: 'SendMessageIcon', category: 'communication', lucideSource: 'Send' },
];

// ---------------------------------------------------------------------------
// User -- people, auth, security
// ---------------------------------------------------------------------------

const user: IconEntry[] = [
  { slug: 'user', name: 'UserIcon', category: 'user', lucideSource: 'User' },
  { slug: 'users', name: 'UsersIcon', category: 'user', lucideSource: 'Users' },
  { slug: 'user-check', name: 'UserCheckIcon', category: 'user', lucideSource: 'UserCheck' },
  { slug: 'user-x', name: 'UserXIcon', category: 'user', lucideSource: 'UserX' },
  { slug: 'user-minus', name: 'UserMinusIcon', category: 'user', lucideSource: 'UserMinus' },
  { slug: 'settings', name: 'SettingsIcon', category: 'user', lucideSource: 'Settings' },
  { slug: 'settings-2', name: 'Settings2Icon', category: 'user', lucideSource: 'Settings2' },
  { slug: 'shield', name: 'ShieldIcon', category: 'user', lucideSource: 'Shield' },
  { slug: 'shield-check', name: 'ShieldCheckIcon', category: 'user', lucideSource: 'ShieldCheck' },
  { slug: 'lock', name: 'LockIcon', category: 'user', lucideSource: 'Lock' },
  { slug: 'key', name: 'KeyIcon', category: 'user', lucideSource: 'Key' },
  { slug: 'key-round', name: 'KeyRoundIcon', category: 'user', lucideSource: 'KeyRound' },
  { slug: 'fingerprint', name: 'FingerprintIcon', category: 'user', lucideSource: 'Fingerprint' },
  { slug: 'log-out', name: 'LogOutIcon', category: 'user', lucideSource: 'LogOut' },
];

// ---------------------------------------------------------------------------
// Data -- charts, search, filters, databases
// ---------------------------------------------------------------------------

const dataIcons: IconEntry[] = [
  { slug: 'bar-chart', name: 'BarChart3Icon', category: 'data', lucideSource: 'BarChart3' },
  { slug: 'trending-up', name: 'TrendingUpIcon', category: 'data', lucideSource: 'TrendingUp' },
  { slug: 'trending-down', name: 'TrendingDownIcon', category: 'data', lucideSource: 'TrendingDown' },
  { slug: 'activity', name: 'ActivityIcon', category: 'data', lucideSource: 'Activity' },
  { slug: 'database', name: 'DatabaseIcon', category: 'data', lucideSource: 'Database' },
  { slug: 'search', name: 'SearchIcon', category: 'data', lucideSource: 'Search' },
  { slug: 'filter', name: 'FilterIcon', category: 'data', lucideSource: 'Filter' },
  { slug: 'sliders', name: 'SlidersHorizontalIcon', category: 'data', lucideSource: 'SlidersHorizontal' },
  { slug: 'layers', name: 'LayersIcon', category: 'data', lucideSource: 'Layers' },
  { slug: 'globe', name: 'GlobeIcon', category: 'data', lucideSource: 'Globe' },
];

// ---------------------------------------------------------------------------
// Layout -- views, grids, calendars, alignment
// ---------------------------------------------------------------------------

const layoutIcons: IconEntry[] = [
  { slug: 'list', name: 'ListIcon', category: 'layout', lucideSource: 'List' },
  { slug: 'layout-grid', name: 'LayoutGridIcon', category: 'layout', lucideSource: 'LayoutGrid' },
  { slug: 'grid-3x3', name: 'Grid3x3Icon', category: 'layout', lucideSource: 'Grid3x3' },
  { slug: 'columns-3', name: 'Columns3Icon', category: 'layout', lucideSource: 'Columns3' },
  { slug: 'calendar', name: 'CalendarIcon', category: 'layout', lucideSource: 'Calendar' },
  { slug: 'calendar-days', name: 'CalendarDaysIcon', category: 'layout', lucideSource: 'CalendarDays' },
  { slug: 'align-justify', name: 'AlignJustifyIcon', category: 'layout', lucideSource: 'AlignJustify' },
  { slug: 'align-center', name: 'AlignCenterIcon', category: 'layout', lucideSource: 'AlignCenter' },
  { slug: 'align-left', name: 'AlignLeftIcon', category: 'layout', lucideSource: 'AlignLeft' },
  { slug: 'layout-template', name: 'LayoutTemplateIcon', category: 'layout', lucideSource: 'LayoutTemplate' },
];

// ---------------------------------------------------------------------------
// Media -- visibility, ratings, audio, visual
// ---------------------------------------------------------------------------

const media: IconEntry[] = [
  { slug: 'eye', name: 'EyeIcon', category: 'media', lucideSource: 'Eye' },
  { slug: 'eye-off', name: 'EyeOffIcon', category: 'media', lucideSource: 'EyeOff' },
  { slug: 'star', name: 'StarIcon', category: 'media', lucideSource: 'Star' },
  { slug: 'zap', name: 'ZapIcon', category: 'media', lucideSource: 'Zap' },
  { slug: 'sparkles', name: 'SparklesIcon', category: 'media', lucideSource: 'Sparkles' },
  { slug: 'mic', name: 'MicIcon', category: 'media', lucideSource: 'Mic' },
  { slug: 'mic-off', name: 'MicOffIcon', category: 'media', lucideSource: 'MicOff' },
  { slug: 'audio-lines', name: 'AudioLinesIcon', category: 'media', lucideSource: 'AudioLines' },
  { slug: 'camera', name: 'CameraIcon', category: 'media', lucideSource: 'Camera' },
];

// ---------------------------------------------------------------------------
// Misc -- workspace, time, utilities
// ---------------------------------------------------------------------------

const misc: IconEntry[] = [
  { slug: 'briefcase', name: 'BriefcaseIcon', category: 'misc', lucideSource: 'Briefcase' },
  { slug: 'building', name: 'Building2Icon', category: 'misc', lucideSource: 'Building2' },
  { slug: 'keyboard', name: 'KeyboardIcon', category: 'misc', lucideSource: 'Keyboard' },
  { slug: 'clock', name: 'ClockIcon', category: 'misc', lucideSource: 'Clock' },
  { slug: 'loader', name: 'Loader2Icon', category: 'misc', lucideSource: 'Loader2' },
  { slug: 'flag', name: 'FlagIcon', category: 'misc', lucideSource: 'Flag' },
  { slug: 'rocket', name: 'RocketIcon', category: 'misc', lucideSource: 'Rocket' },
  { slug: 'grip-vertical', name: 'GripVerticalIcon', category: 'misc', lucideSource: 'GripVertical' },
  { slug: 'pin', name: 'PinIcon', category: 'misc', lucideSource: 'Pin' },
  { slug: 'pin-off', name: 'PinOffIcon', category: 'misc', lucideSource: 'PinOff' },
  { slug: 'git-compare', name: 'GitCompareIcon', category: 'misc', lucideSource: 'GitCompare' },
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
