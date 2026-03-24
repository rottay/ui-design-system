# Component Index

Complete catalog of all components in `@rottay/design-system`.

Source: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/`

---

## Architecture Layers

```
tokens -> primitives -> patterns -> surfaces -> app-owned composition
```

1. **Tokens** - Design tokens (colors, spacing, typography, personality)
2. **Primitives** - Foundational UI building blocks with multi-engine support
3. **Patterns** - Composable mid-complexity components (tables, forms, charts)
4. **Surfaces** - Page-level shells that handle chrome, loading, layout
5. **App composition** - Product-specific pages built from surfaces + patterns

---

## Primitives (89 components)

All primitives support the multi-engine architecture via `createEngineComponent`. Each has implementations for `classic` (Ant Design), `modern` (DaisyUI), and `rustic` (Vanilla HTML/CSS).

Source: `src/components/primitives/`

### Layout (12)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Box` | Base container element, replaces `<div>` | classic, modern, rustic | Stable |
| `Stack` | Vertical spacing layout (`space-y-*`) | classic, modern, rustic | Stable |
| `Grid` | CSS Grid layout container | classic, modern, rustic | Stable |
| `Flex` | Flexbox layout container | classic, modern, rustic | Stable |
| `Divider` | Horizontal/vertical separator | classic, modern, rustic | Stable |
| `Container` | Max-width centered container | classic, modern, rustic | Stable |
| `Space` | Inline spacing between elements | classic, modern, rustic | Stable |
| `Layout` | Page-level layout shell (header/sider/content/footer) | classic, modern, rustic | Stable |
| `Splitter` | Resizable split pane layout | classic, modern, rustic | Stable |
| `Collapse` | Expandable/collapsible content panel | classic, modern, rustic | Stable |
| `AspectRatio` | Fixed aspect ratio container | classic, modern, rustic | Stable |
| `ScrollArea` | Custom scrollbar container | classic, modern, rustic | Stable |

### Inputs (23)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Button` | Primary action trigger | classic, modern, rustic | Stable |
| `Input` | Single-line text input | classic, modern, rustic | Stable |
| `Select` | Dropdown selection | classic, modern, rustic | Stable |
| `Checkbox` | Boolean toggle with label | classic, modern, rustic | Stable |
| `Radio` | Single selection from group | classic, modern, rustic | Stable |
| `Toggle` | Binary on/off toggle | classic, modern, rustic | Stable |
| `Textarea` | Multi-line text input | classic, modern, rustic | Stable |
| `Switch` | Toggle switch | classic, modern, rustic | Stable |
| `InputNumber` | Numeric input with stepper | classic, modern, rustic | Stable |
| `Form` | Form container with validation | classic, modern, rustic | Stable |
| `DatePicker` | Date selection | classic, modern, rustic | Stable |
| `TimePicker` | Time selection | classic, modern, rustic | Stable |
| `AutoComplete` | Input with suggestions | classic, modern, rustic | Stable |
| `Cascader` | Hierarchical selection | classic, modern, rustic | Stable |
| `TreeSelect` | Tree-structured selection | classic, modern, rustic | Stable |
| `Mentions` | @mention input | classic, modern, rustic | Stable |
| `Transfer` | Dual-list item transfer | classic, modern, rustic | Stable |
| `ColorPicker` | Color selection | classic, modern, rustic | Stable |
| `Slider` | Range/value slider | classic, modern, rustic | Stable |
| `Upload` | File upload | classic, modern, rustic | Stable |
| `PasswordInput` | Password field with visibility toggle | classic, modern, rustic | Stable |
| `TagInput` | Multi-value tag entry | classic, modern, rustic | Stable |
| `OTPInput` | One-time password input | classic, modern, rustic | Stable |

### Display (19)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Avatar` | User/entity avatar | classic, modern, rustic | Stable |
| `Badge` | Status/count indicator | classic, modern, rustic | Stable |
| `Card` | Content container with header/body/footer | classic, modern, rustic | Stable |
| `Image` | Responsive image with fallback | classic, modern, rustic | Stable |
| `Tag` | Categorical label | classic, modern, rustic | Stable |
| `Tooltip` | Hover information popup | classic, modern, rustic | Stable |
| `Typography` | Text rendering (heading, paragraph, text, link) | classic, modern, rustic | Stable |
| `Table` | Data table | classic, modern, rustic | Stable |
| `Calendar` | Calendar display | classic, modern, rustic | Stable |
| `List` | Vertical item list | classic, modern, rustic | Stable |
| `Empty` | Empty state placeholder | classic, modern, rustic | Stable |
| `Statistic` | KPI/number display with optional count-up | classic, modern, rustic | Stable |
| `Carousel` | Sliding content carousel | classic, modern, rustic | Stable |
| `Descriptions` | Key-value pair display | classic, modern, rustic | Stable |
| `Timeline` | Chronological event display | classic, modern, rustic | Stable |
| `Tree` | Hierarchical tree display | classic, modern, rustic | Stable |
| `QRCode` | QR code generator | classic, modern, rustic | Stable |
| `Kbd` | Keyboard shortcut display | classic, modern, rustic | Stable |
| `Callout` | Highlighted information block | classic, modern, rustic | Stable |

### Feedback (11)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Alert` | Inline status message | classic, modern, rustic | Stable |
| `Spinner` | Loading spinner | classic, modern, rustic | Stable |
| `Progress` | Progress bar/circle | classic, modern, rustic | Stable |
| `Modal` | Modal dialog | classic, modern, rustic | Stable |
| `Toast` | Temporary notification popup | classic, modern, rustic | Stable |
| `Skeleton` | Content loading placeholder | classic, modern, rustic | Stable |
| `Drawer` | Slide-out panel | classic, modern, rustic | Stable |
| `Message` | Brief floating message | classic, modern, rustic | Stable |
| `Notification` | Rich notification popup | classic, modern, rustic | Stable |
| `Result` | Operation result page | classic, modern, rustic | Stable |
| `Rate` | Star rating | classic, modern, rustic | Stable |

### Navigation (12)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Tabs` | Tabbed content switching | classic, modern, rustic | Stable |
| `Breadcrumb` | Navigation breadcrumb trail | classic, modern, rustic | Stable |
| `Pagination` | Page navigation | classic, modern, rustic | Stable |
| `Menu` | Vertical/horizontal navigation menu | classic, modern, rustic | Stable |
| `Stepper` | Step-by-step progress indicator | classic, modern, rustic | Stable |
| `Steps` | Step navigation | classic, modern, rustic | Stable |
| `Affix` | Sticky positioning wrapper | classic, modern, rustic | Stable |
| `Segmented` | Segmented control | classic, modern, rustic | Stable |
| `BackTop` | Scroll-to-top button | classic, modern, rustic | Stable |
| `Anchor` | In-page anchor navigation | classic, modern, rustic | Stable |
| `FloatButton` | Floating action button | classic, modern, rustic | Stable |
| `Link` (NavLink) | Navigation link | classic, modern, rustic | Stable |

### Overlay (11)

| Component | Description | Engines | Status |
|-----------|-------------|---------|--------|
| `Dropdown` | Dropdown menu | classic, modern, rustic | Stable |
| `Popover` | Content popover | classic, modern, rustic | Stable |
| `Popconfirm` | Confirmation popover | classic, modern, rustic | Stable |
| `Tour` | Guided tour overlay | classic, modern, rustic | Stable |
| `Watermark` | Background watermark | classic, modern, rustic | Stable |
| `ContextMenu` | Right-click context menu | classic, modern, rustic | Stable |
| `HoverCard` | Hover-triggered content card | classic, modern, rustic | Stable |
| `Sheet` | Bottom/side sheet | classic, modern, rustic | Stable |
| `ConfirmDialog` | Confirmation dialog | classic, modern, rustic | Stable |
| `AlertDialog` | Alert dialog | classic, modern, rustic | Stable |
| `Modal` (overlay) | Overlay modal variant | classic, modern, rustic | Stable |

---

## Patterns (29 top-level components)

Composable mid-complexity components that combine primitives into reusable UI blocks. Source: `src/components/patterns/`

Count policy:
- includes only the reusable top-level pattern catalog
- excludes `assistant` sub-patterns from the main total
- excludes `charts`, `hooks`, `stories`, and `tests` from the main total

| Pattern | Description | Engine Support | Status |
|---------|-------------|---------------|--------|
| `PatternDataTable` | Full-featured data table with sorting, filtering, pagination, bulk actions | Engine-aware | Stable |
| `PatternKanbanBoard` | Drag-and-drop kanban board with columns and cards | Engine-aware | Stable |
| `PatternFormBuilder` | Dynamic form generator from field definitions | Engine-aware | Stable |
| `PatternStatsGrid` | KPI statistics grid with trend indicators | Engine-aware | Stable |
| `PatternDetailPanel` | Entity detail panel with tabs, sidebar, actions | Engine-aware | Stable |
| `PatternTimeline` | Chronological event timeline | Engine-aware | Stable |
| `PatternEmptyState` | Empty state with icon, title, description, actions | Engine-aware | Stable |
| `PatternPageShell` | Page shell with breadcrumbs, title, actions, loading | Engine-aware | Stable |
| `PatternFilterPanel` | Filter panel with multiple filter types | Engine-aware | Stable |
| `PatternCommandPalette` | Keyboard-driven command palette (Cmd+K) | Engine-aware | Stable |
| `PatternCalendarView` | Calendar with month/week/day views and events | Engine-aware | Stable |
| `PatternMapView` | Map with markers and info popups | Engine-aware | Stable |
| `PatternApprovalWorkflow` | Multi-step approval workflow visualization | Engine-aware | Stable |
| `PatternStepWizard` | Multi-step wizard with progress tracking | Engine-aware | Stable |
| `PatternLiveFeed` | Real-time feed with auto-refresh and load more | Engine-aware | Stable |
| `PatternTreeView` | Interactive tree with expand/collapse, selection | Engine-aware | Stable |
| `PatternFileManager` | File/folder browser with navigation | Engine-aware | Stable |
| `PatternActivityLog` | Filterable activity/audit log | Engine-aware | Stable |
| `PatternCommentThread` | Threaded comments with reactions | Engine-aware | Stable |
| `PatternNotificationCenter` | Notification list with read/unread state | Engine-aware | Stable |
| `PatternUserProfileCard` | User profile card with avatar, stats, actions | Engine-aware | Stable |
| `PatternPricingTable` | Pricing plan comparison table | Engine-aware | Stable |
| `PatternInvoiceTemplate` | Printable invoice layout | Engine-aware | Stable |
| `PatternSavedViewsBar` | Persistent saved views with rename, reorder, and active-state controls | Engine-aware | Stable |
| `PatternShortcutsOverlay` | Keyboard shortcut cheat sheet overlay with grouped commands | Engine-aware | Stable |
| `PatternWorkspaceSwitcher` | Workspace switcher with badges, presence, and keyboard support | Engine-aware | Stable |
| `PatternEnvironmentToggle` | Test/live environment switcher with confirmation flow | Engine-aware | Stable |
| `PatternTenantPreview` | Tenant branding/profile preview for white-label onboarding | Engine-aware | Stable |
| `PatternFilterBuilder` | Nested AND/OR filter builder with field-aware operators | Engine-aware | Stable |

### Assistant Sub-patterns

| Component | Description |
|-----------|-------------|
| `StreamingText` | Typewriter-style text rendering for streaming responses |
| `TypingIndicator` | Animated typing indicator (dots) |
| `ToolCallCard` | Tool/function call status card |
| `MessageBubble` | Chat message bubble with role alignment |
| `AssistantStatusBadge` | Connection/status badge for assistant state |

### Pattern Hooks

| Hook | Description |
|------|-------------|
| `useDataTable` | State management for DataTable (sorting, filtering, pagination) |
| `useKanban` | State management for KanbanBoard (columns, drag-and-drop) |
| `useFormBuilder` | State management for FormBuilder (values, validation, submission) |
| `useFilterPanel` | State management for FilterPanel (filter values, reset) |

### Pattern Utilities

| Utility | Description |
|---------|-------------|
| `column(def)` | Type-safe column definition helper |
| `columns(defs)` | Type-safe multi-column definition helper |
| `actionsColumn(def)` | Pre-configured actions column |
| `createRecipeVariant(config)` | Domain-specific pattern variant factory |

---

## Charts (10 components)

D3-based chart components with personality-driven animation, color schemes, and tooltip styles. Source: `src/components/patterns/charts/`

| Chart | Description | Status |
|-------|-------------|--------|
| `BarChart` | Vertical/horizontal bar chart | Stable |
| `LineChart` | Line chart with configurable line style (sharp/smooth/step) | Stable |
| `AreaChart` | Filled area chart with optional gradient fill | Stable |
| `PieChart` | Pie/donut chart | Stable |
| `RadarChart` | Radar/spider chart | Stable |
| `FunnelChart` | Funnel/conversion chart | Stable |
| `GanttChart` | Timeline/gantt chart for project scheduling | Stable |
| `HeatMap` | Heat map grid visualization | Stable |
| `TreeMap` | Hierarchical treemap | Stable |
| `NetworkGraph` | Node/edge network graph | Stable |

All charts respond to personality tokens:
- `chart.animateOnMount` / `chart.mountDuration` control mount animation
- `chart.lineStyle` controls line interpolation (sharp/smooth/step)
- `chart.showDots` toggles data point markers
- `chart.useGradientFill` enables gradient fills
- `chart.tooltipStyle` selects tooltip appearance (minimal/detailed/glass)
- `chart.colorScheme` selects the color palette

---

## Surfaces (28 components)

Page-level shells that own chrome, layout, loading, empty, error, actions, tabs/views, permissions plumbing, and responsive mechanics. The app owns fetch, adapters, renderers, handlers, and business rules.

Source: `src/components/surfaces/`

Each surface config follows the four-section contract:
1. `visual` - Layout dimensions, density, responsive breakpoints
2. `presentation` - Chrome, slots, renderers, static content
3. `behavior` - Data, actions, callbacks, state
4. `permissions` - Field/action/tab permission rules

| Surface | Builder Function | Description |
|---------|-----------------|-------------|
| `PageShellSurface` | - | Base page shell (title, breadcrumbs, actions, loading) |
| `HeaderSurface` | `createHeaderSurfaceConfig` | Page header with tabs, metadata, actions |
| `SidebarSurface` | `createSidebarSurfaceConfig` | Sidebar layout with collapsible sidebar, content, aside |
| `ListSurface` | `createListSurfaceConfig` | List page with toolbar, filters, table/cards, pagination |
| `DashboardSurface` | `createDashboardSurfaceConfig` | Dashboard with stats, configurable sections |
| `DetailSurface` | `createDetailSurfaceConfig` | Entity detail with tabs, sidebar, footer, status |
| `FormSurface` | `createFormSurfaceConfig` | Form page shell using PatternFormBuilder |
| `DetailFormSurface` | `createDetailFormSurfaceConfig` | Split form + summary/aside layout |
| `WizardSurface` | `createWizardSurfaceConfig` | Multi-step wizard with configurable steps |
| `VisualizationSurface` | `createVisualizationSurfaceConfig` | Analytics/dashboard with tabs/views, stats |
| `SearchSurface` | `createSearchSurfaceConfig` | Search with query, filters, results, preview |
| `EditorSurface` | `createEditorSurfaceConfig` | Editor with toolbar, preview, save/publish |
| `OperationalSurface` | `createOperationalSurfaceConfig` | Operational view with stats, queue, panels, live feed |
| `MediaSurface` | `createMediaSurfaceConfig` | Media gallery/detail with preview, metadata |
| `ChatSurface` | `createChatSurfaceConfig` | Chat with transcript, composer, sidebar, streaming |
| `SchedulerSurface` | `createSchedulerSurfaceConfig` | Calendar with month/week/day views |
| `CompareSurface` | `createCompareSurfaceConfig` | Side-by-side comparison by sections |
| `AuthSurface` | `createAuthSurfaceConfig` | Auth layout (split/centered) with hero and legal |
| `OnboardingSurface` | `createOnboardingSurfaceConfig` | Guided onboarding flow with wizard + hero |
| `EmptyStateSurface` | `createEmptyStateSurfaceConfig` | Standalone empty state page |
| `SettingsSurface` | `createSettingsSurfaceConfig` | Settings page with tabs/sections |
| `AuditSurface` | `createAuditSurfaceConfig` | Audit log with columns, filters, export |
| `BillingSurface` | `createBillingSurfaceConfig` | Billing page with plan, usage, invoices, payment methods |
| `ProfileSurface` | `createProfileSurfaceConfig` | User profile with sections, avatar, password |
| `NotificationSurface` | `createNotificationSurfaceConfig` | Notification center with preferences |
| `ImportExportSurface` | `createImportExportSurfaceConfig` | Data import/export with mapping, templates |
| `ReportSurface` | `createReportSurfaceConfig` | Report builder with templates, filters, generation |

---

## Motion / Animation Primitives

Source: `src/motion/`

| Component | Description |
|-----------|-------------|
| `FadeIn` | Opacity entrance animation |
| `SlideIn` | Directional slide entrance |
| `ScaleIn` | Scale entrance animation |
| `ScrollReveal` | Animate on scroll into viewport |
| `StaggerChildren` | Sequential child animation |
| `TextReveal` | Character/word text animation |
| `CountUp` | Animated number counting |
| `Morph` | Shape morphing transition |
| `Magnetic` | Magnetic cursor-following effect |
| `Aurora` | Aurora background effect |
| `ShimmerText` | Shimmering text effect |

Animation behavior is controlled by personality tokens (`animation.intensity`, `animation.entrance`, `animation.useSpring`, etc.) and respects `prefers-reduced-motion`.

---

## Shared Types

Source: `src/components/surfaces/types.ts`

| Type | Description |
|------|-------------|
| `EntityAdapter<TRaw, TView>` | Maps raw domain data to surface-consumable shape |
| `EntityFieldMeta<TView>` | Field metadata with stable `fieldId` |
| `SurfacePageChrome` | Title, subtitle, breadcrumbs, badge, back button |
| `SurfaceAction<TView>` | Declarative action (id, label, icon, variant, onClick, visible, disabled) |
| `SurfacePermissionsConfig` | Field/action/tab permission rules |
| `SurfaceTabbedView` | Tab descriptor (key, label, content, icon, badge) |
| `SurfaceBreadcrumb` | Breadcrumb item (label, href, onClick) |

---

## Totals

| Layer | Count |
|-------|-------|
| Primitives | 89 |
| Patterns | 29 top-level |
| Surfaces | 28 |
| Charts | 10 |
| Motion | 10 motion components + 9 visual effects |
| **Total** | **180+** |
