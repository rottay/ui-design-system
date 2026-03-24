# Engine Component Coverage - Rottay Design System

> Last updated: 2026-03-23

## Overview

Every component in the design system is created via `createEngineComponent()` and ships with three engine implementations (classic, modern, rustic) plus optional custom engine support. This document lists all 130+ components organized by category.

**Engine implementations live in**: `components/{category}/{ComponentName}/engines/{classic,modern,rustic}.tsx`

---

## Summary

| Category | Components | Compound Sub-components | Total Exports |
|----------|-----------|------------------------|---------------|
| Layout (primitives) | 12 | 7 | 19 |
| Inputs (primitives) | 24 | 3 | 27 |
| Display (primitives) | 18 | 4 | 22 |
| Feedback (primitives) | 10 | 1 | 11 |
| Navigation (primitives) | 15 | 4 | 19 |
| Overlay (primitives) | 11 | 0 | 11 |
| Patterns | 38 | 0 | 38 |
| **Total** | **128** | **19** | **147** |

---

## Primitives: Layout

| Component | Display Name | Engine Dir | Compound Parts |
|-----------|-------------|------------|----------------|
| Box | `Box` | `layout/Box/engines/` | - |
| Flex | `Flex` | `layout/Flex/engines/` | - |
| Grid | `Grid` | `layout/Grid/engines/` | - |
| Stack | `Stack` | `layout/Stack/engines/` | - |
| Space | `Space` | `layout/Space/engines/` | - |
| Container | `Container` | `layout/Container/engines/` | - |
| Layout | `Layout` | `layout/Layout/engines/` | `Layout.Header`, `Layout.Sider`, `Layout.Content`, `Layout.Footer` |
| Divider | `Divider` | `layout/Divider/engines/` | - |
| Collapse | `Collapse` | `layout/Collapse/engines/` | `Collapse.Panel` |
| Splitter | `Splitter` | `layout/Splitter/engines/` | `Splitter.Panel` |
| ScrollArea | `ScrollArea` | `layout/ScrollArea/engines/` | - |
| AspectRatio | `AspectRatio` | `layout/AspectRatio/engines/` | - |

---

## Primitives: Inputs

| Component | Display Name | Engine Dir | Compound Parts |
|-----------|-------------|------------|----------------|
| Button | `Button` | `inputs/Button/engines/` | - |
| Input | `Input` | `inputs/Input/engines/` | - |
| Textarea | `Textarea` | `inputs/Textarea/engines/` | - |
| InputNumber | `InputNumber` | `inputs/InputNumber/engines/` | - |
| PasswordInput | `PasswordInput` | `inputs/PasswordInput/engines/` | - |
| OTPInput | `OTPInput` | `inputs/OTPInput/engines/` | - |
| TagInput | `TagInput` | `inputs/TagInput/engines/` | - |
| Select | `Select` | `inputs/Select/engines/` | - |
| AutoComplete | `AutoComplete` | `inputs/AutoComplete/engines/` | - |
| Cascader | `Cascader` | `inputs/Cascader/engines/` | - |
| TreeSelect | `TreeSelect` | `inputs/TreeSelect/engines/` | - |
| Checkbox | `Checkbox` | `inputs/Checkbox/engines/` | - |
| Radio | `Radio` | `inputs/Radio/engines/` | - |
| Switch | `Switch` | `inputs/Switch/engines/` | - |
| Toggle | `Toggle` | `inputs/Toggle/engines/` | - |
| Slider | `Slider` | `inputs/Slider/engines/` | - |
| DatePicker | `DatePicker` | `inputs/DatePicker/engines/` | `DateRangePicker` |
| TimePicker | `TimePicker` | `inputs/TimePicker/engines/` | `TimeRangePicker` |
| ColorPicker | `ColorPicker` | `inputs/ColorPicker/engines/` | - |
| Upload | `Upload` | `inputs/Upload/engines/` | `Upload.Dragger` |
| Transfer | `Transfer` | `inputs/Transfer/engines/` | - |
| Mentions | `Mentions` | `inputs/Mentions/engines/` | - |
| Form | `Form` | `inputs/Form/engines/` | - |
| FormField | `FormField` | `inputs/FormField/engines/` | - |

---

## Primitives: Display

| Component | Display Name | Engine Dir | Compound Parts |
|-----------|-------------|------------|----------------|
| Avatar | `Avatar` | `display/Avatar/engines/` | - |
| Badge | `Badge` | `display/Badge/engines/` | - |
| Tag | `Tag` | `display/Tag/engines/` | - |
| Card | `Card` | `display/Card/engines/` | - |
| List | `List` | `display/List/engines/` | `List.Item`, `List.Item.Meta` |
| Table | `Table` | `display/Table/engines/` | - |
| Descriptions | `Descriptions` | `display/Descriptions/engines/` | `Descriptions.Item` |
| Statistic | `Statistic` | `display/Statistic/engines/` | `Statistic.Countdown` |
| Typography | `Typography` | `display/Typography/engines/` | - |
| Tooltip | `Tooltip` | `display/Tooltip/engines/` | - |
| Tree | `Tree` | `display/Tree/engines/` | - |
| Calendar | `Calendar` | `display/Calendar/engines/` | - |
| Carousel | `Carousel` | `display/Carousel/engines/` | - |
| Image | `Image` | `display/Image/engines/` | - |
| Timeline | `Timeline` | `display/Timeline/engines/` | - |
| Empty | `Empty` | `display/Empty/engines/` | - |
| QRCode | `QRCode` | `display/QRCode/engines/` | - |
| Callout | `Callout` | `display/Callout/engines/` | - |
| Kbd | `Kbd` | `display/Kbd/engines/` | - |

---

## Primitives: Feedback

| Component | Display Name | Engine Dir | Compound Parts |
|-----------|-------------|------------|----------------|
| Alert | `Alert` | `feedback/Alert/engines/` | - |
| Modal | `Modal` | `feedback/Modal/engines/` | - |
| Drawer | `Drawer` | `feedback/Drawer/engines/` | - |
| Progress | `Progress` | `feedback/Progress/engines/` | - |
| Spinner | `Spinner` | `feedback/Spinner/engines/` | - |
| Skeleton | `Skeleton` | `feedback/Skeleton/engines/` | - |
| Result | `Result` | `feedback/Result/engines/` | - |
| Rate | `Rate` | `feedback/Rate/engines/` | - |
| Toast | `Toast` | `feedback/Toast/engines/` | - |
| Message | `Message` | `feedback/Message/engines/` | - |
| Notification | `Notification` | `feedback/Notification/engines/` | - |

---

## Primitives: Navigation

| Component | Display Name | Engine Dir | Compound Parts |
|-----------|-------------|------------|----------------|
| Menu | `Menu` | `navigation/Menu/engines/` | - |
| Tabs | `Tabs` | `navigation/Tabs/engines/` | - |
| Breadcrumb | `Breadcrumb` | `navigation/Breadcrumb/engines/` | - |
| Pagination | `Pagination` | `navigation/Pagination/engines/` | - |
| Steps | `Steps` | `navigation/Steps/engines/` | - |
| Stepper | `Stepper` | `navigation/Stepper/engines/` | - |
| Segmented | `Segmented` | `navigation/Segmented/engines/` | - |
| Link | `Link` | `navigation/Link/engines/` | - |
| Anchor | `Anchor` | `navigation/Anchor/engines/` | `Anchor.Link` |
| FloatButton | `FloatButton` | `navigation/FloatButton/engines/` | `FloatButton.Group`, `FloatButton.BackTop` |
| BackTop | `BackTop` | `navigation/BackTop/engines/` | - |
| Affix | `Affix` | `navigation/Affix/engines/` | - |
| ActionDock | `ActionDock` | `navigation/ActionDock/engines/` | - |
| BottomTabBar | `BottomTabBar` | `navigation/BottomTabBar/engines/` | - |
| MobileHeader | `MobileHeader` | `navigation/MobileHeader/engines/` | - |

---

## Primitives: Overlay

| Component | Display Name | Engine Dir |
|-----------|-------------|------------|
| Dropdown | `Dropdown` | `overlay/Dropdown/engines/` |
| Popover | `Popover` | `overlay/Popover/engines/` |
| Popconfirm | `Popconfirm` | `overlay/Popconfirm/engines/` |
| ContextMenu | `ContextMenu` | `overlay/ContextMenu/engines/` |
| Watermark | `Watermark` | `overlay/Watermark/engines/` |
| Modal (overlay) | `Modal` | `overlay/Modal/engines/` |
| AlertDialog | `AlertDialog` | `overlay/AlertDialog/engines/` |
| ConfirmDialog | `ConfirmDialog` | `overlay/ConfirmDialog/engines/` |
| HoverCard | `HoverCard` | `overlay/HoverCard/engines/` |
| Sheet | `Sheet` | `overlay/Sheet/engines/` |
| Tour | `Tour` | `overlay/Tour/engines/` |

---

## Patterns

Patterns are higher-order, domain-oriented composite components. Each has its own `engines/` directory with three implementations.

| Component | Export Name | Engine Dir |
|-----------|-----------|------------|
| ActivityLog | `PatternActivityLog` | `patterns/activity-log/engines/` |
| ApprovalInbox | `PatternApprovalInbox` | `patterns/approval-inbox/engines/` |
| ApprovalWorkflow | `PatternApprovalWorkflow` | `patterns/approval-workflow/engines/` |
| CalendarView | `PatternCalendarView` | `patterns/calendar-view/engines/` |
| CockpitHeader | `PatternCockpitHeader` | `patterns/cockpit-header/engines/` |
| ColumnSettings | `PatternColumnSettings` | `patterns/column-settings/engines/` |
| CommandPalette | `PatternCommandPalette` | `patterns/command-palette/engines/` |
| CommentThread | `PatternCommentThread` | `patterns/comment-thread/engines/` |
| DataTable | `DataTableEngine` (internal) | `patterns/data-table/engines/` |
| DetailPanel | `PatternDetailPanel` | `patterns/detail-panel/engines/` |
| EmptyState | `PatternEmptyState` | `patterns/empty-state/engines/` |
| EnvironmentToggle | `PatternEnvironmentToggle` | `patterns/environment-toggle/engines/` |
| FileManager | `PatternFileManager` | `patterns/file-manager/engines/` |
| FilterBuilder | `PatternFilterBuilder` | `patterns/filter-builder/engines/` |
| FilterPanel | `PatternFilterPanel` | `patterns/filter-panel/engines/` |
| FormBuilder | `PatternFormBuilder` | `patterns/form-builder/engines/` |
| InvoiceTemplate | `PatternInvoiceTemplate` | `patterns/invoice-template/engines/` |
| KanbanBoard | `PatternKanbanBoard` | `patterns/kanban-board/engines/` |
| ListToolbar | `PatternListToolbar` | `patterns/list-toolbar/engines/` |
| LiveFeed | `PatternLiveFeed` | `patterns/live-feed/engines/` |
| MapView | `PatternMapView` | `patterns/map-view/engines/` |
| ModerationGallery | `PatternModerationGallery` | `patterns/moderation-gallery/engines/` |
| NotificationCenter | `PatternNotificationCenter` | `patterns/notification-center/engines/` |
| OperationalLedger | `PatternOperationalLedger` | `patterns/operational-ledger/engines/` |
| PageShell | `PatternPageShell` | `patterns/page-shell/engines/` |
| PricingTable | `PatternPricingTable` | `patterns/pricing-table/engines/` |
| SavedViews | `PatternSavedViewsBar` | `patterns/saved-views/engines/` |
| ShiftMatrix | `PatternShiftMatrix` | `patterns/shift-matrix/engines/` |
| ShortcutsOverlay | `PatternShortcutsOverlay` | `patterns/shortcuts-overlay/engines/` |
| StatsGrid | `PatternStatsGrid` | `patterns/stats-grid/engines/` |
| StatsHeader | `StatsHeader` | `patterns/stats-header/engines/` |
| StepWizard | `PatternStepWizard` | `patterns/step-wizard/engines/` |
| TenantPreview | `PatternTenantPreview` | `patterns/tenant-preview/engines/` |
| Timeline (pattern) | `PatternTimeline` | `patterns/timeline/engines/` |
| TreeView | `PatternTreeView` | `patterns/tree-view/engines/` |
| UserProfileCard | `PatternUserProfileCard` | `patterns/user-profile-card/engines/` |
| WorkbenchHeader | `PatternWorkbenchHeader` | `patterns/workbench-header/engines/` |
| WorkspaceSwitcher | `PatternWorkspaceSwitcher` | `patterns/workspace-switcher/engines/` |

---

## Engine Implementation File Convention

Each component with engine support follows this directory structure:

```
ComponentName/
  |-- index.ts              # createEngineComponent() call + compound assembly
  |-- ComponentName.tsx     # (optional) wrapper or compound logic
  |-- types.ts              # Props interface
  |-- engines/
  |     |-- classic.tsx     # Ant Design implementation
  |     |-- modern.tsx      # DaisyUI/Tailwind implementation
  |     |-- rustic.tsx      # Vanilla HTML/CSS implementation
  |-- __tests__/
        |-- ComponentName.test.tsx
```

Each engine file exports a `default` component that matches the component's Props interface:

```typescript
// engines/classic.tsx
import { ComponentType } from 'react';
import type { ButtonProps } from '../types';

const ClassicButton: ComponentType<ButtonProps> = (props) => { ... };
export default ClassicButton;
```

---

## Notes

- All 147 exports across primitives and patterns have full three-engine coverage (classic + modern + rustic).
- The `custom` engine does not require engine files; it resolves from the pack-scoped component registry at runtime.
- Compound components (e.g., `Layout.Header`, `List.Item`) each have their own `createEngineComponent` call and their own engine implementations.
- Some components exist in both primitives and patterns (e.g., `Modal` in feedback + overlay, `Timeline` in display + patterns). These are separate implementations with different prop interfaces.
