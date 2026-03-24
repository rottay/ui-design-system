# FormSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/form/index.tsx`

## Purpose

Reusable page-level form shell built on top of the schema-driven form builder pattern. Owns page chrome, responsive two-column layout (form + aside), action presentation, and permission-based field filtering. Delegates actual field rendering to `PatternFormBuilder`.

## Config Structure

### FormSurfaceConfig

```typescript
interface FormSurfaceConfig {
  visual: FormSurfaceVisualConfig;
  presentation: FormSurfacePresentationConfig;
  behavior: FormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (FormSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layout` | `'vertical' \| 'horizontal' \| 'inline' \| 'steps'` | -- | Form layout mode |
| `columns` | `number` | -- | Multi-column form grid count |
| `maxWidth` | `number \| string` | -- | Maximum form width |
| `stackOnMobile` | `boolean` | `true` | Stack fields vertically on mobile |
| `stackOnTablet` | `boolean` | `false` | Stack fields vertically on tablet |
| `hideAsideOnMobile` | `boolean` | `true` (builder) | Hide aside rail on mobile |
| `mobileActionsSticky` | `boolean` | `true` (builder) | Sticky submit/cancel on mobile |

### Presentation (FormSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs, back button |
| `description` | `ReactNode` | Instructional text below title |
| `error` | `ReactNode` | Global error banner above fields |
| `aside` | `ReactNode` | Side panel (help text, preview) |
| `renderField` | `FormBuilderProps['renderField']` | Custom field renderer override |

### Behavior (FormSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `fields` | `SurfaceFieldDef[]` | Field definitions (order = render order) |
| `initialValues` | `Record<string, unknown>` | Initial form values |
| `values` | `Record<string, unknown>` | Current values (controlled mode) |
| `onChange` | `(values) => void` | Field change callback |
| `onValidationChange` | `(errors) => void` | Validation state callback |
| `submitAction` | `SurfaceAction<Record<string, unknown>>` | **Required** -- submit button config |
| `cancelAction` | `SurfaceAction<void>` | Optional cancel button |
| `disabled` | `boolean` | Disable all fields globally |
| `readOnly` | `boolean` | Read-only view mode |
| `showLabels` | `boolean` | Show field labels (default: true) |
| `showRequired` | `boolean` | Show required indicators (default: true) |
| `stepLabels` | `string[]` | Step labels for multi-step layout |
| `currentStep` | `number` | Current step (controlled, step layout) |
| `onStepChange` | `(step) => void` | Step navigation callback |

### SurfaceFieldDef

```typescript
interface SurfaceFieldDef extends FieldDef {
  fieldId?: string;  // For permission gating
}
```

## Props Interface

```typescript
interface FormSurfaceProps {
  config: FormSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}
```

## Builder Function

```typescript
function createFormSurfaceConfig(
  config: FormSurfaceConfig
): FormSurfaceConfig
```

Mobile-first defaults:
- `hideAsideOnMobile: true`
- `mobileActionsSticky: true`

## Internal Composition

### Patterns Used
- **PatternFormBuilder**: Schema-driven form generation with field rendering, validation, step support

### Primitives Used
- `Button`, `Card`, `Grid`, `Stack`, `Text`, `Flex`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceErrorState**: Error state with retry
- **FadeIn**: Entrance animation (personality-driven)
- **SurfaceAccentBarWrapper**: Accent bar

### Key Internal Logic

1. **Permission-based field filtering**: `filterSurfaceFields()` removes restricted fields before they reach `PatternFormBuilder` -- restricted fields never appear in the DOM
2. **Responsive layout**: `useSurfaceResponsiveLayout()` controls stacking; horizontal layout auto-converts to vertical when stacking
3. **Column adaptation**: Multi-column layouts collapse to single column on mobile
4. **Aside rail**: 12-column grid with 8/4 split when aside content exists and viewport is wide enough
5. **Sticky mobile actions**: Submit/cancel cluster uses `position: sticky` with a gradient fade background on mobile
6. **Action normalization**: Submit/cancel actions are permission-filtered via `resolveSurfaceAction()`
7. **Label text transform**: `resolveLabelTextTransform()` applies personality-driven label casing (uppercase, capitalize, sentence)
8. **Error banner**: Renders above form fields in a Card with error border color

## Usage Example

```typescript
const config = createFormSurfaceConfig({
  visual: { columns: 2, layout: 'vertical' },
  presentation: {
    chrome: { title: 'Create User', breadcrumbs: [{ label: 'Users', href: '/users' }] },
    description: 'Fill in the details to create a new user account.',
    aside: <HelpPanel />,
  },
  behavior: {
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true, fieldId: 'user.name' },
      { key: 'email', label: 'Email', type: 'email', required: true, fieldId: 'user.email' },
      { key: 'role', label: 'Role', type: 'select', options: roleOptions, fieldId: 'user.role' },
    ],
    submitAction: { id: 'create', label: 'Create User', variant: 'primary', onClick: handleSubmit },
    cancelAction: { id: 'cancel', label: 'Cancel', onClick: () => router.back() },
  },
  permissions: { granted: ['users.create'] },
});

<FormSurface config={config} loading={isSubmitting} />
```
