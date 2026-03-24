# PatternFormBuilder

**Source**: `ui-design-system/packages/core/src/components/patterns/form-builder/`
**Component**: `PatternFormBuilder`
**Export**: `import { PatternFormBuilder } from '@rottay/design-system'`

## Purpose

Schema-driven form renderer that generates a complete form from a declarative `FieldDef[]` array. Supports four layout modes (vertical, horizontal, grid, multi-step wizard), built-in validation with error feedback, controlled and uncontrolled value management, custom field rendering, disabled/read-only modes, and configurable spacing. The parent provides `onSubmit` to receive validated form data.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface FormBuilderProps extends PatternBaseProps {
  /** Field definitions describing each form control. */
  fields: FieldDef[];

  /** Layout mode for field arrangement. Default: "vertical". */
  layout?: 'vertical' | 'horizontal' | 'grid' | 'steps';

  /** Number of grid columns (only for "grid" layout). Default: 1. */
  columns?: number;

  /** Custom field renderer wrapping or replacing default output. */
  renderField?: (field: FieldDef, defaultRender: ReactNode, value: unknown) => ReactNode;

  /** Action buttons slot at the bottom of the form. */
  actions?: ReactNode;

  /** Submit handler called with validated form values. */
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;

  /** Called when validation errors change. */
  onValidationChange?: (errors: Record<string, string>) => void;

  /** Called on every field value change. */
  onChange?: (values: Record<string, unknown>) => void;

  /** Initial values for uncontrolled mode (seeded on mount only). */
  initialValues?: Record<string, unknown>;

  /** Controlled form values (takes precedence over initialValues). */
  values?: Record<string, unknown>;

  /** Disables all fields and prevents submission. */
  disabled?: boolean;

  /** Read-only mode (displays values as non-editable text). */
  readOnly?: boolean;

  /** Whether to render field labels. Default: true. */
  showLabels?: boolean;

  /** Whether to show asterisk on required field labels. */
  showRequired?: boolean;

  /** Spacing between fields (px or CSS string). */
  gap?: number | string;

  /** Form title rendered above all fields. */
  title?: ReactNode;

  /** Description rendered below the title. */
  description?: ReactNode;

  /** Step labels for wizard-style "steps" layout. */
  stepLabels?: string[];

  /** Current active step index (zero-based) for "steps" layout. */
  currentStep?: number;

  /** Called when the user navigates between steps. */
  onStepChange?: (step: number) => void;
}
```

## FieldDef Type

```typescript
interface FieldDef {
  name: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' |
        'multi-select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'time' |
        'datetime' | 'file' | 'color' | 'slider' | 'rating' | 'custom';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean | ((values: Record<string, unknown>) => boolean);
  options?: { label: string; value: string; disabled?: boolean }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: unknown;
  colSpan?: number;           // Grid columns to span
  render?: (field: FieldDef, value: unknown, onChange: (value: unknown) => void) => ReactNode;
}
```

## Composition Hook

`useFormBuilder(options)` provides form values state, validation, and step navigation.

## Usage Example

```tsx
import { PatternFormBuilder } from '@rottay/design-system';

<PatternFormBuilder
  layout="grid"
  columns={2}
  fields={[
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 2 },
    { name: 'role', label: 'Role', type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Member', value: 'member' },
      ]},
    { name: 'department', label: 'Department', type: 'select',
      options: departments.map(d => ({ label: d.name, value: d.id })) },
    { name: 'bio', label: 'Bio', type: 'textarea', colSpan: 2,
      validation: { maxLength: 500 } },
    { name: 'notifications', label: 'Enable Notifications', type: 'switch' },
  ]}
  onSubmit={async (values) => await createUser(values)}
  showRequired
  actions={
    <Flex gap="2" justify="end">
      <Button variant="default" onClick={handleCancel}>Cancel</Button>
      <Button type="submit" variant="primary">Create User</Button>
    </Flex>
  }
/>
```

## Related Patterns

- **StepWizard** -- Dedicated multi-step wizard pattern with full progress UI. FormBuilder's `"steps"` layout provides basic wizard functionality; use StepWizard for complex multi-step flows.
- **FilterBuilder** -- Uses a similar declarative field definition approach but for building filter queries rather than data entry forms.
