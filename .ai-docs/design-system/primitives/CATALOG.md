# Primitives Catalog

Source: `ui-design-system/packages/core/src/components/primitives/`

All primitives use the `createEngineComponent` factory and support three stable engines (classic, modern, rustic) plus the experimental athena engine. Every component accepts an `engine` prop override.

---

## Display (20 components)

Source: `primitives/display/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| Avatar | Yes | User/entity profile image with fallback initials. Compound: AvatarGroup, AvatarBadge, AvatarFallback |
| Badge | Yes | Small status indicator or count overlay |
| Calendar | Yes | Date grid display for viewing/selecting dates |
| Callout | Yes | Rich message box for info/warning/error/success states with title, icon, closable, action slots |
| Card | Yes | Surface container for grouped content |
| Carousel | Yes | Horizontal slide-based content viewer |
| Descriptions | Yes | Key-value pair display in a description list layout |
| Empty | Yes | Placeholder shown when a section has no data |
| Image | Yes | Enhanced image with fallback, skeleton loading, and error states. Compound: ImageFallback, ImageSkeleton |
| Kbd | Yes | Keyboard key rendering in monospace with subtle styling |
| List | Yes | Vertical list of items with optional metadata. Compound: List.Item, List.Item.Meta |
| QRCode | Yes | QR code generator with error correction levels and status states |
| Statistic | Yes | Numeric value display with label and optional prefix/suffix. Includes Countdown sub-component |
| Table | Yes | Data table with sorting, filtering, pagination, row selection, and expandable rows |
| Tag | Yes | Categorical label chip. Compound: TagGroup |
| Timeline | Yes | Chronological event list with status-colored dots |
| Tooltip | Yes | Hover/focus-triggered content popover |
| Tree | Yes | Hierarchical expandable/collapsible tree view |
| Typography | Yes | Text rendering primitives: Heading, Text, Paragraph, Link (aliased from display). Supports `as` prop for semantic HTML |

---

## Inputs (24 components)

Source: `primitives/inputs/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| AutoComplete | Yes | Text input with filtered suggestion dropdown |
| Button | Yes | Primary interactive element for actions. Compound: Button.Group, Button.Icon |
| Cascader | Yes | Multi-level hierarchical selector (province > city > district) |
| Checkbox | Yes | Boolean toggle with label. Compound: CheckboxGroup |
| ColorPicker | Yes | Color value selector with presets, formats (hex/rgb/hsl) |
| DatePicker | Yes | Date/date-range selection with calendar popup. Includes RangePicker |
| Form | Yes | Form layout manager with validation, field state, and submission handling. Exports useForm hook |
| FormField | Yes | Standalone labeled field wrapper with error/help text and layout control |
| Input | Yes | Single-line text input. Compound: InputGroup, InputAddon |
| InputNumber | Yes | Numeric input with stepper controls and formatting |
| Mentions | Yes | Text input with @-mention suggestion support |
| OTPInput | Yes | One-time password input with separate digit fields |
| PasswordInput | Yes | Password input with visibility toggle and strength indicator |
| Radio | Yes | Single-choice selector within a group. Compound: RadioGroup |
| Select | Yes | Dropdown selection with search, multi-select, and option grouping |
| Slider | Yes | Numeric range input via draggable handle(s) |
| Switch | Yes | Toggle between two mutually exclusive states |
| TagInput | Yes | Input that converts text entries into removable tags |
| Textarea | Yes | Multi-line text input with auto-resize |
| TimePicker | Yes | Time/time-range selection. Includes TimeRangePicker |
| Toggle | Yes | Labeled on/off toggle with variant styling |
| Transfer | Yes | Dual-list item mover for bulk selection |
| TreeSelect | Yes | Dropdown with hierarchical tree options |
| Upload | Yes | File upload with drag-and-drop, preview, and list display. Includes Dragger |

---

## Layout (17 components)

Source: `primitives/layout/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| AspectRatio | Yes | Maintains a fixed width-to-height ratio for child content |
| Box | Yes | Foundational layout primitive -- the `div` replacement. Supports spacing, radius, shadow, display, position, overflow tokens |
| Collapse | Yes | Expandable/collapsible content panels. Compound: Collapse.Panel |
| Container | Yes | Max-width centered content wrapper with responsive padding |
| Divider | Yes | Horizontal or vertical separator line with optional text label |
| Flex | Yes | Flexbox layout container (direction, wrap, justify, align) |
| Grid | Yes | CSS Grid layout with responsive columns, rows, and gap. Compound: GridItem |
| Hide | No (CSS-only) | CSS-first responsive visibility: hides children at specified breakpoints |
| Layout | Yes | Application shell with Header, Sider, Content, Footer compound components |
| ResponsiveSlot | No (CSS-only) | CSS-first responsive content swapping between breakpoints |
| ScrollArea | Yes | Custom-styled scrollable container with configurable scrollbar |
| Show | No (CSS-only) | CSS-first responsive visibility: shows children only at specified breakpoints |
| Space | Yes | Inline spacing helper between child elements |
| Splitter | Yes | Resizable split-pane layout. Compound: Splitter.Panel |
| Stack | Yes | Vertical or horizontal stack with consistent spacing between children |

Note: `Hide`, `Show`, and `ResponsiveSlot` are CSS-only utilities that do not use the engine system. A `shared/responsive-helpers.tsx` module provides breakpoint logic for layout primitives.

---

## Navigation (18 components)

Source: `primitives/navigation/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| ActionDock | Yes | Floating action bar for contextual bulk actions (mobile-first) |
| Affix | Yes | Pins content to viewport on scroll (sticky positioning) |
| Anchor | Yes | Page-section jump links with scroll tracking. Compound: Anchor.Link |
| BackTop | Yes | Scroll-to-top floating button |
| BottomTabBar | Yes | Mobile bottom tab navigation bar |
| Breadcrumb | Yes | Hierarchical navigation trail |
| FloatButton | Yes | Floating action button with optional group expansion. Compound: FloatButton.Group, FloatButton.BackTop |
| Link (NavLink) | Yes | Styled navigation link (exported as NavLink to avoid Typography.Link conflict) |
| Menu | Yes | Vertical/horizontal navigation menu. Compound: MenuItem, MenuGroup, MenuSubMenu, MenuDivider |
| MobileHeader | Yes | Mobile-optimized top navigation header |
| Pagination | Yes | Page navigation controls with size and page-number selectors |
| Segmented | Yes | Horizontal toggle between a small set of options |
| Stepper | Yes | Multi-step progress indicator with content panels. Compound: StepperStep, StepperContent |
| Steps | Yes | Linear step indicator (simpler than Stepper, closer to Ant Design Steps) |
| Tabs | Yes | Tabbed content panels with multiple tab styles |

---

## Feedback (13 components)

Source: `primitives/feedback/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| Alert | Yes | Inline status message banner (info/success/warning/error) |
| Drawer | Yes | Slide-in panel from screen edge with configurable placement and size |
| Message | Yes | Lightweight global notification at top of viewport. Imperative API: `message.success()`. Provider: MessageProvider. Hook: useMessage |
| Modal | Yes | Centered dialog overlay. Compound: ModalHeader, ModalBody, ModalFooter, ModalCloseButton |
| Notification | Yes | Rich toast-style notification with icon and actions. Imperative API: `notification.open()`. Provider: NotificationProvider. Hook: useNotification |
| Progress | Yes | Visual progress indicator (line, circle, dashboard) |
| Rate | Yes | Star/icon-based rating input |
| Result | Yes | Full-page operation result display (success, error, 404, 403, etc.) |
| Skeleton | Yes | Content placeholder during loading. Variants: SkeletonAvatar, SkeletonText, SkeletonButton, SkeletonCard, SkeletonListItem, SkeletonTable, SkeletonForm, SkeletonParagraph |
| Spinner | Yes | Animated loading indicator |
| Toast | Yes | Transient notification popup with auto-dismiss. Imperative API: `toast()`. Provider: ToastProvider. Hook: useToast. Container: ToastContainer |

---

## Overlay (14 components)

Source: `primitives/overlay/`

| Component | Multi-Engine | Purpose |
|-----------|:---:|---------|
| AdaptiveOverlay | Yes | Responsive overlay that adapts between modal (desktop) and sheet (mobile) |
| AlertDialog | Yes | Confirmation dialog requiring explicit user action (no backdrop dismiss) |
| ConfirmDialog | Yes | Action confirmation dialog with variant-colored styling (danger, warning, info) |
| ContextMenu | Yes | Right-click context menu |
| Dropdown | Yes | Click/hover-triggered dropdown menu |
| HoverCard | Yes | Hover-triggered rich content preview card |
| OverlayModal | Yes | Advanced modal with Portal, Overlay, and FocusTrap utilities (aliased to avoid feedback/Modal conflict) |
| Popconfirm | Yes | Confirmation popover attached to a trigger element |
| Popover | Yes | Click/hover-triggered rich content popover |
| Sheet | Yes | Bottom/side sheet overlay (mobile-first) |
| Tour | Yes | Step-by-step guided tour highlighting UI elements |
| Watermark | Yes | Semi-transparent text/image watermark overlay |

Utility exports from overlay/Modal:
- `Portal` -- renders children into a portal container
- `usePortalContainer` -- hook to access portal container element
- `Overlay` -- backdrop overlay layer
- `FocusTrap` / `useFocusTrap` -- keyboard focus containment

---

## Summary

| Category | Count |
|----------|------:|
| Display | 20 |
| Inputs | 24 |
| Layout | 17 |
| Navigation | 18 |
| Feedback | 13 |
| Overlay | 14 |
| **Total** | **106** |

All 106 primitives support multi-engine rendering via `createEngineComponent` (except 3 CSS-only layout utilities: Hide, Show, ResponsiveSlot).
