/**
 * Primitives Registry
 *
 * Catalog of all primitive components in the design system.
 * Grouped by category: display, inputs, feedback, layout, navigation, overlay.
 */

export type PrimitiveCategory =
  | 'display'
  | 'inputs'
  | 'feedback'
  | 'layout'
  | 'navigation'
  | 'overlay';

export type EngineName = 'classic' | 'modern' | 'rustic';

export interface PrimitiveEntry {
  slug: string;
  name: string;
  category: PrimitiveCategory;
  description: string;
  engines: EngineName[];
}

const allEngines: EngineName[] = ['classic', 'modern', 'rustic'];

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

const display: PrimitiveEntry[] = [
  { slug: 'avatar', name: 'Avatar', category: 'display', description: 'User or entity avatar with image, initials, or icon fallback', engines: allEngines },
  { slug: 'badge', name: 'Badge', category: 'display', description: 'Small count or status indicator attached to another element', engines: allEngines },
  { slug: 'calendar', name: 'Calendar', category: 'display', description: 'Date calendar panel for date selection and display', engines: allEngines },
  { slug: 'callout', name: 'Callout', category: 'display', description: 'Highlighted block for tips, warnings, or important notes', engines: allEngines },
  { slug: 'card', name: 'Card', category: 'display', description: 'Contained surface for grouping related content', engines: allEngines },
  { slug: 'carousel', name: 'Carousel', category: 'display', description: 'Horizontally scrollable set of slides', engines: allEngines },
  { slug: 'descriptions', name: 'Descriptions', category: 'display', description: 'Key-value list for displaying metadata fields', engines: allEngines },
  { slug: 'empty', name: 'Empty', category: 'display', description: 'Placeholder shown when a container has no data', engines: allEngines },
  { slug: 'image', name: 'Image', category: 'display', description: 'Responsive image with lazy loading and fallback', engines: allEngines },
  { slug: 'kbd', name: 'Kbd', category: 'display', description: 'Keyboard shortcut indicator', engines: allEngines },
  { slug: 'list', name: 'List', category: 'display', description: 'Ordered or unordered list with optional actions', engines: allEngines },
  { slug: 'qr-code', name: 'QRCode', category: 'display', description: 'QR code generator for URLs or text', engines: allEngines },
  { slug: 'statistic', name: 'Statistic', category: 'display', description: 'Large numeric value with label and optional trend', engines: allEngines },
  { slug: 'table', name: 'Table', category: 'display', description: 'Basic data table primitive with rows and columns', engines: allEngines },
  { slug: 'tag', name: 'Tag', category: 'display', description: 'Compact label for categorization or filtering', engines: allEngines },
  { slug: 'timeline', name: 'Timeline', category: 'display', description: 'Vertical sequence of chronological events', engines: allEngines },
  { slug: 'tooltip', name: 'Tooltip', category: 'display', description: 'Contextual popup shown on hover or focus', engines: allEngines },
  { slug: 'tree', name: 'Tree', category: 'display', description: 'Hierarchical tree structure with expand/collapse', engines: allEngines },
  { slug: 'typography', name: 'Typography', category: 'display', description: 'Text rendering with heading, paragraph, and inline styles', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const inputs: PrimitiveEntry[] = [
  { slug: 'auto-complete', name: 'AutoComplete', category: 'inputs', description: 'Text input with suggestion dropdown', engines: allEngines },
  { slug: 'button', name: 'Button', category: 'inputs', description: 'Clickable action trigger with multiple variants', engines: allEngines },
  { slug: 'cascader', name: 'Cascader', category: 'inputs', description: 'Multi-level cascading dropdown selector', engines: allEngines },
  { slug: 'checkbox', name: 'Checkbox', category: 'inputs', description: 'Boolean or group selection control', engines: allEngines },
  { slug: 'color-picker', name: 'ColorPicker', category: 'inputs', description: 'Color selection with palette and custom input', engines: allEngines },
  { slug: 'date-picker', name: 'DatePicker', category: 'inputs', description: 'Date and date-range selection control', engines: allEngines },
  { slug: 'form', name: 'Form', category: 'inputs', description: 'Form container with validation and layout', engines: allEngines },
  { slug: 'form-field', name: 'FormField', category: 'inputs', description: 'Individual form field with label, help text, and error', engines: allEngines },
  { slug: 'input', name: 'Input', category: 'inputs', description: 'Single-line text input with optional addons', engines: allEngines },
  { slug: 'input-number', name: 'InputNumber', category: 'inputs', description: 'Numeric input with increment/decrement controls', engines: allEngines },
  { slug: 'mentions', name: 'Mentions', category: 'inputs', description: 'Text input with @mention suggestions', engines: allEngines },
  { slug: 'otp-input', name: 'OTPInput', category: 'inputs', description: 'One-time password input with segmented fields', engines: allEngines },
  { slug: 'password-input', name: 'PasswordInput', category: 'inputs', description: 'Password field with visibility toggle', engines: allEngines },
  { slug: 'radio', name: 'Radio', category: 'inputs', description: 'Single selection from a group of options', engines: allEngines },
  { slug: 'select', name: 'Select', category: 'inputs', description: 'Dropdown selection with search and multi-select', engines: allEngines },
  { slug: 'slider', name: 'Slider', category: 'inputs', description: 'Range slider for numeric value selection', engines: allEngines },
  { slug: 'switch', name: 'Switch', category: 'inputs', description: 'Toggle switch for binary on/off states', engines: allEngines },
  { slug: 'tag-input', name: 'TagInput', category: 'inputs', description: 'Multi-value input rendered as removable tags', engines: allEngines },
  { slug: 'textarea', name: 'Textarea', category: 'inputs', description: 'Multi-line text input with auto-resize', engines: allEngines },
  { slug: 'time-picker', name: 'TimePicker', category: 'inputs', description: 'Time selection control with hour/minute/second', engines: allEngines },
  { slug: 'toggle', name: 'Toggle', category: 'inputs', description: 'Pressable toggle button for binary states', engines: allEngines },
  { slug: 'transfer', name: 'Transfer', category: 'inputs', description: 'Dual-list control for moving items between pools', engines: allEngines },
  { slug: 'tree-select', name: 'TreeSelect', category: 'inputs', description: 'Hierarchical dropdown tree selector', engines: allEngines },
  { slug: 'upload', name: 'Upload', category: 'inputs', description: 'File upload with drag-and-drop and preview', engines: allEngines },
  { slug: 'voice-input-button', name: 'VoiceInputButton', category: 'inputs', description: 'Microphone button for voice-to-text input', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

const feedback: PrimitiveEntry[] = [
  { slug: 'alert', name: 'Alert', category: 'feedback', description: 'Inline banner for contextual messages', engines: allEngines },
  { slug: 'drawer', name: 'Drawer', category: 'feedback', description: 'Sliding panel from screen edge', engines: allEngines },
  { slug: 'message', name: 'Message', category: 'feedback', description: 'Lightweight top-level feedback message', engines: allEngines },
  { slug: 'modal', name: 'Modal', category: 'feedback', description: 'Centered dialog overlay with adaptive fullscreen', engines: allEngines },
  { slug: 'notification', name: 'Notification', category: 'feedback', description: 'Toast-style notification with title and content', engines: allEngines },
  { slug: 'progress', name: 'Progress', category: 'feedback', description: 'Linear or circular progress indicator', engines: allEngines },
  { slug: 'rate', name: 'Rate', category: 'feedback', description: 'Star or icon-based rating control', engines: allEngines },
  { slug: 'result', name: 'Result', category: 'feedback', description: 'Full-page operation result with status icon', engines: allEngines },
  { slug: 'skeleton', name: 'Skeleton', category: 'feedback', description: 'Placeholder shimmer while content is loading', engines: allEngines },
  { slug: 'spinner', name: 'Spinner', category: 'feedback', description: 'Indeterminate loading spinner', engines: allEngines },
  { slug: 'toast', name: 'Toast', category: 'feedback', description: 'Brief auto-dismissing notification at screen edge', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const layout: PrimitiveEntry[] = [
  { slug: 'aspect-ratio', name: 'AspectRatio', category: 'layout', description: 'Container that maintains a fixed aspect ratio', engines: allEngines },
  { slug: 'box', name: 'Box', category: 'layout', description: 'Generic layout box replacing raw div', engines: allEngines },
  { slug: 'collapse', name: 'Collapse', category: 'layout', description: 'Expandable/collapsible content panel', engines: allEngines },
  { slug: 'container', name: 'Container', category: 'layout', description: 'Max-width centered content wrapper', engines: allEngines },
  { slug: 'divider', name: 'Divider', category: 'layout', description: 'Horizontal or vertical content separator', engines: allEngines },
  { slug: 'flex', name: 'Flex', category: 'layout', description: 'Flexbox layout container with gap and alignment', engines: allEngines },
  { slug: 'grid', name: 'Grid', category: 'layout', description: 'CSS grid layout container', engines: allEngines },
  { slug: 'hide', name: 'Hide', category: 'layout', description: 'Conditionally hide content at breakpoints', engines: allEngines },
  { slug: 'layout', name: 'Layout', category: 'layout', description: 'Page-level layout with header, sider, content, footer', engines: allEngines },
  { slug: 'responsive-slot', name: 'ResponsiveSlot', category: 'layout', description: 'Slot that renders different content per breakpoint', engines: allEngines },
  { slug: 'scroll-area', name: 'ScrollArea', category: 'layout', description: 'Custom scrollbar container', engines: allEngines },
  { slug: 'show', name: 'Show', category: 'layout', description: 'Conditionally show content at breakpoints', engines: allEngines },
  { slug: 'space', name: 'Space', category: 'layout', description: 'Inline spacing between child elements', engines: allEngines },
  { slug: 'splitter', name: 'Splitter', category: 'layout', description: 'Resizable split pane container', engines: allEngines },
  { slug: 'stack', name: 'Stack', category: 'layout', description: 'Vertical or horizontal stack with consistent spacing', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const navigation: PrimitiveEntry[] = [
  { slug: 'affix', name: 'Affix', category: 'navigation', description: 'Sticky element that pins on scroll', engines: allEngines },
  { slug: 'anchor', name: 'Anchor', category: 'navigation', description: 'In-page navigation linking to sections', engines: allEngines },
  { slug: 'back-top', name: 'BackTop', category: 'navigation', description: 'Scroll-to-top floating button', engines: allEngines },
  { slug: 'breadcrumb', name: 'Breadcrumb', category: 'navigation', description: 'Hierarchical path navigation trail', engines: allEngines },
  { slug: 'float-button', name: 'FloatButton', category: 'navigation', description: 'Floating action button with optional expansion', engines: allEngines },
  { slug: 'link', name: 'Link', category: 'navigation', description: 'Styled anchor with router integration', engines: allEngines },
  { slug: 'menu', name: 'Menu', category: 'navigation', description: 'Vertical or horizontal navigation menu', engines: allEngines },
  { slug: 'pagination', name: 'Pagination', category: 'navigation', description: 'Page navigation with size options', engines: allEngines },
  { slug: 'segmented', name: 'Segmented', category: 'navigation', description: 'Segmented control for switching views', engines: allEngines },
  { slug: 'stepper', name: 'Stepper', category: 'navigation', description: 'Compact step indicator for mobile flows', engines: allEngines },
  { slug: 'steps', name: 'Steps', category: 'navigation', description: 'Multi-step process indicator', engines: allEngines },
  { slug: 'tabs', name: 'Tabs', category: 'navigation', description: 'Tabbed content switcher', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

const overlay: PrimitiveEntry[] = [
  { slug: 'alert-dialog', name: 'AlertDialog', category: 'overlay', description: 'Modal dialog requiring user acknowledgement', engines: allEngines },
  { slug: 'confirm-dialog', name: 'ConfirmDialog', category: 'overlay', description: 'Confirmation dialog with accept/cancel actions', engines: allEngines },
  { slug: 'context-menu', name: 'ContextMenu', category: 'overlay', description: 'Right-click context menu with actions', engines: allEngines },
  { slug: 'dropdown', name: 'Dropdown', category: 'overlay', description: 'Trigger-based dropdown menu', engines: allEngines },
  { slug: 'hover-card', name: 'HoverCard', category: 'overlay', description: 'Rich content preview on hover', engines: allEngines },
  { slug: 'overlay-modal', name: 'Modal', category: 'overlay', description: 'Overlay-tier modal with portal rendering', engines: allEngines },
  { slug: 'popconfirm', name: 'Popconfirm', category: 'overlay', description: 'Inline confirmation popover before action', engines: allEngines },
  { slug: 'popover', name: 'Popover', category: 'overlay', description: 'Floating content panel anchored to a trigger', engines: allEngines },
  { slug: 'sheet', name: 'Sheet', category: 'overlay', description: 'Bottom sheet overlay for mobile interactions', engines: allEngines },
  { slug: 'tour', name: 'Tour', category: 'overlay', description: 'Step-by-step guided tour overlay', engines: allEngines },
  { slug: 'watermark', name: 'Watermark', category: 'overlay', description: 'Background watermark pattern for content protection', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const primitives: PrimitiveEntry[] = [
  ...display,
  ...inputs,
  ...feedback,
  ...layout,
  ...navigation,
  ...overlay,
];

export const primitivesByCategory: Record<PrimitiveCategory, PrimitiveEntry[]> = {
  display,
  inputs,
  feedback,
  layout,
  navigation,
  overlay,
};

export const primitiveCategories: { slug: PrimitiveCategory; label: string; count: number }[] = [
  { slug: 'display', label: 'Display', count: display.length },
  { slug: 'inputs', label: 'Inputs', count: inputs.length },
  { slug: 'feedback', label: 'Feedback', count: feedback.length },
  { slug: 'layout', label: 'Layout', count: layout.length },
  { slug: 'navigation', label: 'Navigation', count: navigation.length },
  { slug: 'overlay', label: 'Overlay', count: overlay.length },
];
