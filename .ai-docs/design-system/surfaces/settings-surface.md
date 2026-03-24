# SettingsSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/settings/index.tsx`

## Purpose

Tabbed settings page shell. Centralizes the repetitive settings route structure: title, intro copy, action bar, tab navigation, and optional sidebar. Each app owns the actual settings panels and field renderers. Used for application settings, tenant configuration, and preference pages.

## Config Structure

### SettingsSurfaceConfig

```typescript
interface SettingsSurfaceConfig {
  visual: SettingsSurfaceVisualConfig;
  presentation: SettingsSurfacePresentationConfig;
  behavior: SettingsSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (SettingsSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxWidth` | `number \| string` | -- | Constrain content width |
| `tabsType` | `TabsProps['type']` | Profile's `tabsType` | Tab rendering style (line, card) |
| `centeredTabs` | `boolean` | -- | Center-align tabs |
| `stackOnMobile` | `boolean` | `true` (builder) | Stack sidebar below content on mobile |
| `stackOnTablet` | `boolean` | -- | Stack on tablet |
| `collapseSidebarOnMobile` | `boolean` | `true` (builder) | Collapse sidebar on mobile |

### Presentation (SettingsSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs, back button |
| `intro` | `ReactNode` | Introductory content above tabs |
| `sidebar` | `ReactNode` | Sidebar navigation (alternative to tabs) |
| `footer` | `ReactNode` | Footer content |

### Behavior (SettingsSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `tabs` | `SurfaceTabbedView[]` | **Required** -- settings category tabs |
| `activeTab` | `string` | Currently active tab key (controlled) |
| `onTabChange` | `(key: string) => void` | Tab navigation callback |
| `actions` | `SurfaceAction<void>[]` | Page-level actions |

## Props Interface

```typescript
interface SettingsSurfaceProps {
  config: SettingsSurfaceConfig;
  loading?: boolean;
}
```

## Builder Function

```typescript
function createSettingsSurfaceConfig(
  config: SettingsSurfaceConfig
): SettingsSurfaceConfig
```

Mobile-first defaults:
- `stackOnMobile: true`
- `collapseSidebarOnMobile: true`

## Internal Composition

### Primitives Used
- `Card`, `Grid`, `Stack`, `Tabs`, `Text`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceActionBar**: Permission-aware action row
- **SurfaceTabbedLabel**: Tab label with optional badge
- **useSurfaceProfileDefaults()**: Personality-driven defaults (tabsType)
- **useSurfaceResponsiveLayout()**: Responsive stacking decision

### Key Internal Logic

1. **Permission-filtered tabs**: `filterSurfaceTabbedViews()` removes tabs the user cannot access, preventing "access denied" dead ends inside the page
2. **Active tab resolution**: Falls back to first visible tab if the configured `activeTab` was hidden by permissions
3. **Controlled vs uncontrolled tabs**: Passes `activeKey` when `activeTab` is explicitly set; `defaultActiveKey` otherwise
4. **Sidebar layout**: 12-column grid with 8/4 split when sidebar content exists and viewport is wide enough; full-width Card without sidebar
5. **Tab descriptions**: Each tab can include a `description` rendered below the tab content as muted text
6. **Tab type from profile**: Falls back to personality-driven `profileDefaults.tabsType` (line for compact/comfortable, card for spacious)

## Usage Example

```typescript
const config = createSettingsSurfaceConfig({
  visual: { tabsType: 'line' },
  presentation: {
    chrome: { title: 'Settings', breadcrumbs: [{ label: 'Admin' }] },
    intro: 'Configure your workspace settings.',
    sidebar: <SettingsNav />,
  },
  behavior: {
    tabs: [
      { key: 'general', label: 'General', content: <GeneralSettings /> },
      { key: 'security', label: 'Security', icon: <LockIcon />, content: <SecuritySettings />, permissionId: 'settings.security' },
      { key: 'billing', label: 'Billing', badge: '3', content: <BillingSettings />, permissionId: 'settings.billing' },
    ],
    activeTab: currentTab,
    onTabChange: setCurrentTab,
    actions: [
      { id: 'save', label: 'Save All', variant: 'primary', onClick: handleSaveAll },
    ],
  },
  permissions: { granted: userPermissions },
});

<SettingsSurface config={config} loading={isLoading} />
```
