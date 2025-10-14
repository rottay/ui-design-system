# FormBuilder Component

An advanced, theme-aware dynamic form generator for React with conditional fields, multi-column layouts, custom validation, and field dependencies.

## Table of Contents

- [Features](#features)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
  - [1. Conditional Fields](#1-conditional-fields)
  - [2. Multi-Column Layouts](#2-multi-column-layouts)
  - [3. Field Groups/Sections](#3-field-groupssections)
  - [4. Custom Validation](#4-custom-validation)
  - [5. Field Dependencies](#5-field-dependencies)
- [API Reference](#api-reference)
- [Complete Examples](#complete-examples)

## Features

✅ **10+ Field Types**: text, number, email, password, textarea, select, radio, checkbox, date, switch, section
✅ **Conditional Rendering**: Show/hide fields based on other field values
✅ **Multi-Column Layouts**: 1-4 column responsive grid layouts
✅ **Field Grouping**: Visual sections with titles and descriptions
✅ **Custom Validation**: Sync and async validation with custom rules
✅ **Field Dependencies**: Auto-update fields when dependencies change
✅ **Theme-Aware Styling**: Automatic styling based on selected theme (Spotify, Stripe, Notion, etc.)
✅ **TypeScript Support**: Full type safety with comprehensive interfaces
✅ **Ant Design Integration**: Built on top of Ant Design Form components

## Basic Usage

```tsx
import { FormBuilder } from '@es-rottay/designsystem-core';
import type { FormField } from '@es-rottay/designsystem-core';

const fields: FormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    required: true,
    placeholder: 'Enter username',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'your.email@example.com',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
  },
];

function MyForm() {
  return (
    <FormBuilder
      fields={fields}
      onSubmit={(values) => console.log(values)}
      submitText="Sign Up"
    />
  );
}
```

## Advanced Features

### 1. Conditional Fields

Show or hide fields based on other field values using either `dependsOn` or `visibleWhen`.

#### Using `dependsOn` (simple conditions)

```tsx
const fields: FormField[] = [
  {
    name: 'accountType',
    label: 'Account Type',
    type: 'select',
    options: [
      { label: 'Personal', value: 'personal' },
      { label: 'Business', value: 'business' },
    ],
  },
  // This field only shows when accountType === 'business'
  {
    name: 'companyName',
    label: 'Company Name',
    type: 'text',
    dependsOn: {
      field: 'accountType',
      value: 'business',
      condition: 'equals', // 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    },
  },
];
```

#### Using `visibleWhen` (complex conditions)

```tsx
const fields: FormField[] = [
  {
    name: 'age',
    label: 'Age',
    type: 'number',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    options: [
      { label: 'USA', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
  },
  // Show this field only if age >= 18 AND country is 'us'
  {
    name: 'driversLicense',
    label: 'Driver\'s License',
    type: 'text',
    visibleWhen: (values) =>
      values.age >= 18 && values.country === 'us',
  },
];
```

### 2. Multi-Column Layouts

Create responsive grid layouts with 1-4 columns. Use `colSpan` to control how many columns a field should occupy.

```tsx
<FormBuilder
  fields={fields}
  columns={2}           // 2-column grid
  columnGap={24}        // Gap between columns (px)
  rowGap={8}            // Gap between rows (px)
/>
```

```tsx
const fields: FormField[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    colSpan: 1,  // Takes 1 column
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    colSpan: 1,  // Takes 1 column
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    colSpan: 2,  // Takes full width (2 columns)
  },
];
```

### 3. Field Groups/Sections

Organize fields into visual sections with titles and descriptions.

```tsx
const fields: FormField[] = [
  // Section header
  {
    name: 'section_personal',
    label: 'Personal Information',  // Not displayed, used for key
    type: 'section',
    title: 'Personal Information',
    description: 'Please provide your personal details',
  },
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
  },

  // Another section
  {
    name: 'section_account',
    label: 'Account Settings',
    type: 'section',
    title: 'Account Settings',
    description: 'Configure your account preferences',
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
  },
];
```

### 4. Custom Validation

Add custom validation logic with sync or async validators.

#### Synchronous Validation

```tsx
const fields: FormField[] = [
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    customValidator: (value) => {
      if (!value) return;

      if (value.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain an uppercase letter');
      }

      if (!/[0-9]/.test(value)) {
        throw new Error('Password must contain a number');
      }
    },
  },
];
```

#### Asynchronous Validation

```tsx
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const response = await fetch(`/api/check-username?username=${username}`);
  return response.ok;
};

const fields: FormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    validateTrigger: 'onBlur',  // Only validate when field loses focus
    customValidator: async (value) => {
      if (!value) return;

      const isAvailable = await checkUsernameAvailable(value);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    },
  },
];
```

#### Cross-Field Validation

```tsx
const fields: FormField[] = [
  {
    name: 'password',
    label: 'Password',
    type: 'password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    dependencies: ['password'],  // Re-validate when password changes
    customValidator: (value, allValues) => {
      if (value !== allValues.password) {
        throw new Error('Passwords do not match');
      }
    },
  },
];
```

### 5. Field Dependencies

Update field options or behavior when other fields change.

```tsx
const [form] = Form.useForm();

const fields: FormField[] = [
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
  },
  {
    name: 'state',
    label: 'State/Province',
    type: 'select',
    dependencies: ['country'],  // This field depends on country
    options: [],  // Will be populated dynamically
  },
];

const handleFieldChange = (changedField: string, value: any, allValues: Record<string, any>) => {
  if (changedField === 'country') {
    // Update state options based on country
    const stateOptions = getStatesForCountry(value);

    // Reset state field
    form.setFieldsValue({ state: undefined });

    // Update options
    const stateField = fields.find(f => f.name === 'state');
    if (stateField) {
      stateField.options = stateOptions;
    }
  }
};

<FormBuilder
  form={form}
  fields={fields}
  onFieldChange={handleFieldChange}
/>
```

## API Reference

### FormBuilderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FormField[]` | **required** | Array of field configurations |
| `form` | `FormInstance` | - | Ant Design form instance (optional) |
| `initialValues` | `Record<string, any>` | - | Initial form values |
| `onSubmit` | `(values) => void \| Promise<void>` | - | Submit callback |
| `submitText` | `string` | `'Submit'` | Submit button text |
| `showSubmit` | `boolean` | `true` | Show submit button |
| `showReset` | `boolean` | `false` | Show reset button |
| `resetText` | `string` | `'Reset'` | Reset button text |
| `loading` | `boolean` | `false` | Loading state for submit button |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` | Form layout |
| `labelCol` | `{ span: number }` | - | Label column span (horizontal layout) |
| `wrapperCol` | `{ span: number }` | - | Wrapper column span (horizontal layout) |
| **`columns`** | `1 \| 2 \| 3 \| 4` | `1` | **NEW:** Number of columns in grid layout |
| **`columnGap`** | `number` | `16` | **NEW:** Gap between columns (px) |
| **`rowGap`** | `number` | `0` | **NEW:** Gap between rows (px) |
| **`onFieldChange`** | `(field, value, allValues) => void` | - | **NEW:** Callback when any field changes |

### FormField

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | ✅ | Field name/key |
| `label` | `string` | ✅ | Field label |
| `type` | `FieldType` | ✅ | Field type (see below) |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | - | Is field required |
| `rules` | `Rule[]` | - | Ant Design validation rules |
| `options` | `SelectOption[]` | - | Options for select/radio/checkbox |
| `defaultValue` | `any` | - | Default field value |
| `disabled` | `boolean` | - | Is field disabled |
| `hidden` | `boolean` | - | Is field hidden |
| `tooltip` | `string` | - | Tooltip text for field label |
| **`colSpan`** | `1 \| 2 \| 3 \| 4` | - | **NEW:** Number of columns field should span |
| **`dependsOn`** | `FieldDependency` | - | **NEW:** Simple dependency configuration |
| **`visibleWhen`** | `(values) => boolean` | - | **NEW:** Complex visibility function |
| **`dependencies`** | `string[]` | - | **NEW:** Array of field names this field depends on |
| **`customValidator`** | `CustomValidator` | - | **NEW:** Custom validation function |
| **`validateTrigger`** | `'onChange' \| 'onBlur' \| 'onSubmit'` | `'onChange'` | **NEW:** When to trigger validation |
| **`title`** | `string` | - | **NEW:** Section title (for type: 'section') |
| **`description`** | `string` | - | **NEW:** Section description (for type: 'section') |

### FieldType

```typescript
type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'switch'
  | 'section';  // NEW
```

### FieldDependency

```typescript
interface FieldDependency {
  field: string;  // Field name to depend on
  value: any;     // Expected value
  condition?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
}
```

### CustomValidator

```typescript
type CustomValidator = (
  value: any,
  allValues: Record<string, any>
) => Promise<void> | void;
```

## Complete Examples

For complete working examples of all features, see [ADVANCED_EXAMPLES.tsx](./ADVANCED_EXAMPLES.tsx):

1. **ConditionalFieldsExample** - Show/hide fields with `dependsOn` and `visibleWhen`
2. **MultiColumnLayoutExample** - 2-column layout with spanning fields
3. **FieldGroupsExample** - Organized form with sections
4. **CustomValidationExample** - Async username check and password validation
5. **FieldDependenciesExample** - Dynamic country/state/city dropdowns
6. **ComplexFormExample** - All features combined in one form
7. **ConditionalNumericExample** - Numeric comparisons (greaterThan/lessThan)

## Theme Support

The FormBuilder automatically adapts its styling based on the current theme:

- **Spotify**: Dark background, bold labels, rounded corners
- **Stripe**: Light background, professional styling, subtle shadows
- **Notion**: Minimal styling, square corners, signature shadows
- **Linear**: Modern look, very rounded corners, clean design
- **Base/Airbnb/Slack/Vercel**: Default Ant Design styling with theme colors

## Migration from Basic FormBuilder

All existing props and functionality remain unchanged. New features are opt-in:

```tsx
// Old code still works
<FormBuilder
  fields={oldFields}
  onSubmit={handleSubmit}
/>

// Add new features when needed
<FormBuilder
  fields={newFields}
  columns={2}              // NEW
  onFieldChange={onChange} // NEW
  onSubmit={handleSubmit}
/>
```

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  FormField,
  FormBuilderProps,
  FieldDependency,
  CustomValidator,
  FieldType,
  SelectOption,
} from '@es-rottay/designsystem-core';
```

## Best Practices

1. **Use `dependsOn` for simple conditions**, `visibleWhen` for complex logic
2. **Set `validateTrigger: 'onBlur'` for async validators** to avoid excessive API calls
3. **Use `dependencies` array for cross-field validation** (e.g., confirm password)
4. **Create sections to organize long forms** and improve UX
5. **Use multi-column layouts for better space utilization** on desktop
6. **Provide clear error messages in custom validators**
7. **Use `colSpan` strategically** - full-width fields for long content (addresses, descriptions)

## License

MIT
