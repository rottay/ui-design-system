'use client';

import {
  Box,
  Button,
  PatternFilterBuilder,
  PatternFormBuilder,
  PatternInvoiceTemplate,
  PatternStepWizard,
  Stack,
  Text,
  type FieldDef,
  type FilterFieldDefinition,
  type FilterGroup,
  type InvoiceData,
  type WizardStep,
} from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-D/F patterns/forms
// data-part probe (FilterBuilder, FormBuilder, StepWizard, InvoiceTemplate).
// Per the checkpoint contract these are SIX INDEPENDENT SKINS (each
// component owns its own enum-to-style map; there is no shared tone
// vocabulary across them) -- fixtures below are deliberately per-component,
// not unified. Every instance is deterministic: controlled `currentStep`/
// `values` props stand in for what would otherwise be internal React state,
// so the grid renders identically on every load. Rendered only behind
// `?forms=1` so no flagship capture sees it. This page is the
// visual-evidence half; FormsBatch.contract.test.tsx renders its own
// fixtures directly through React Testing Library.
const FORMS_FILTER_FIELDS: FilterFieldDefinition[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  { key: 'joined', label: 'Joined', type: 'date' },
  { key: 'active', label: 'Active', type: 'boolean' },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multiSelect',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'new', label: 'New' },
    ],
  },
];

// Root group (AND) with a first text rule, a second number rule ("AND"
// label), and a nested OR group covering select/date/boolean/multiSelect --
// exercises every FilterFieldType's data-field-type on `value-input`, both
// `data-logic` values on `logic-toggle`, both `data-root` states on `group`,
// and both "Where"/"AND"/"OR" positions of `rule-logic-label`.
const FORMS_FILTER_VALUE: FilterGroup = {
  id: 'fb-root',
  logic: 'and',
  rules: [
    { id: 'fb-r1', field: 'name', operator: 'contains', value: 'ada' },
    { id: 'fb-r2', field: 'age', operator: 'gt', value: 21 },
    {
      id: 'fb-g1',
      logic: 'or',
      rules: [
        { id: 'fb-r3', field: 'status', operator: 'equals', value: 'active' },
        {
          id: 'fb-r4',
          field: 'joined',
          operator: 'equals',
          value: '2026-01-01',
        },
        { id: 'fb-r5', field: 'active', operator: 'equals', value: true },
        { id: 'fb-r6', field: 'tags', operator: 'in', value: 'vip' },
      ],
    },
  ],
};

const FORMS_BUILDER_FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', type: 'text', required: true },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Engineer', value: 'engineer' },
      { label: 'Designer', value: 'designer' },
    ],
  },
  { name: 'active', label: 'Active', type: 'checkbox' },
  {
    name: 'plan',
    label: 'Plan',
    type: 'radio',
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
    ],
  },
  { name: 'notify', label: 'Notify', type: 'switch' },
  { name: 'startDate', label: 'Start date', type: 'date' },
  { name: 'resume', label: 'Resume', type: 'file' },
  { name: 'brandColor', label: 'Brand color', type: 'color' },
  { name: 'satisfaction', label: 'Satisfaction', type: 'slider' },
  { name: 'rating', label: 'Rating', type: 'rating' },
];

// Read-only fixture: one value per readOnly-branch (checkbox/select/
// multi-select/color/rating/file/default) plus one omitted field (empty
// branch), exercising every `data-field-type` the read-only switch keys on
// and the category-B color-swatch (SKIN-EXEMPT-RUNTIME-VALUE, `background:
// String(val)` -- deliberately not a token, transcribed byte-exact).
const FORMS_BUILDER_READONLY_FIELDS: FieldDef[] = [
  { name: 'active', label: 'Active', type: 'checkbox' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [{ label: 'Engineer', value: 'engineer' }],
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [{ label: 'VIP', value: 'vip' }],
  },
  { name: 'brandColor', label: 'Brand color', type: 'color' },
  { name: 'rating', label: 'Rating', type: 'rating' },
  { name: 'resume', label: 'Resume', type: 'file' },
  { name: 'notes', label: 'Notes', type: 'text' },
  { name: 'empty', label: 'Empty', type: 'text' },
];
const FORMS_BUILDER_READONLY_VALUES: Record<string, unknown> = {
  active: true,
  role: 'engineer',
  tags: ['vip'],
  brandColor: '#4f46e5',
  rating: 4,
  resume: 'resume.pdf',
  notes: 'Some notes',
  // `empty` intentionally omitted -- exercises the empty/'--' branch.
};

const FORMS_WIZARD_STEPS: WizardStep[] = [
  {
    key: 'account',
    title: 'Account',
    description: 'Basic info',
    content: <Text size="xs">Account step content</Text>,
  },
  {
    key: 'profile',
    title: 'Profile',
    description: 'Tell us more',
    content: <Text size="xs">Profile step content</Text>,
    optional: true,
  },
  {
    key: 'review',
    title: 'Review',
    content: <Text size="xs">Review step content</Text>,
  },
];

const FORMS_INVOICE_BASE: InvoiceData = {
  number: 'INV-2026-0042',
  date: '2026-07-01',
  dueDate: '2026-07-15',
  currency: '$',
  company: {
    name: 'Rottay Inc.',
    address: '1 Market St',
    city: 'San Francisco',
    country: 'US',
    taxId: '94-1234567',
    email: 'billing@rottay.com',
  },
  client: {
    name: 'Acme Corp',
    address: '500 Main Ave',
    city: 'Austin',
    country: 'US',
    taxId: '74-7654321',
    email: 'ap@acme.example',
  },
  items: [
    {
      id: 'li-1',
      description: 'Design system license',
      quantity: 1,
      unitPrice: 4800,
      total: 4800,
    },
    {
      id: 'li-2',
      description: 'Onboarding support',
      quantity: 2,
      unitPrice: 600,
      total: 1200,
    },
  ],
  subtotal: 6000,
  taxRate: 8.5,
  tax: 510,
  total: 6510,
  notes: 'Thank you for your business.\nPayment due within 14 days.',
};

// One minimal invoice per status -- exercises every `data-status` value on
// `status-badge` (draft/sent/paid/overdue).
const FORMS_INVOICE_STATUSES: Array<'draft' | 'sent' | 'paid' | 'overdue'> = ['draft', 'sent', 'paid', 'overdue'];

function FormsFbFilterBuilder() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-filter-builder">
      <Text size="xs" color="secondary">
        FilterBuilder
      </Text>
      <PatternFilterBuilder
        fields={FORMS_FILTER_FIELDS}
        value={FORMS_FILTER_VALUE}
        onChange={() => undefined}
        allowGrouping
        showAddFilter
        showClear
        onClear={() => undefined}
      />
      <PatternFilterBuilder
        fields={FORMS_FILTER_FIELDS}
        value={{ id: 'fb-loading-root', logic: 'and', rules: [] }}
        onChange={() => undefined}
        loading
      />
    </Stack>
  );
}

function FormsFbFormBuilder() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-form-builder">
      <Text size="xs" color="secondary">
        FormBuilder (vertical)
      </Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_FIELDS}
        layout="vertical"
        title="Team member"
        description="Basic profile details."
        onSubmit={() => undefined}
        actions={
          <Button size="sm" variant="primary">
            Save
          </Button>
        }
      />
      <Text size="xs" color="secondary">
        FormBuilder (steps -- active/completed/upcoming)
      </Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_FIELDS}
        layout="steps"
        stepLabels={['Info', 'Review', 'Done']}
        currentStep={1}
        onStepChange={() => undefined}
        onSubmit={() => undefined}
      />
      <Text size="xs" color="secondary">
        FormBuilder (read-only)
      </Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_READONLY_FIELDS}
        readOnly
        values={FORMS_BUILDER_READONLY_VALUES}
        onSubmit={() => undefined}
      />
      <Text size="xs" color="secondary">
        FormBuilder (loading)
      </Text>
      <PatternFormBuilder fields={FORMS_BUILDER_FIELDS} onSubmit={() => undefined} loading />
    </Stack>
  );
}

function FormsFbStepWizard() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-step-wizard">
      <Text size="xs" color="secondary">
        StepWizard (horizontal, mid-step, skip)
      </Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        allowSkip
        orientation="horizontal"
      />
      <Text size="xs" color="secondary">
        StepWizard (horizontal, last step)
      </Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={FORMS_WIZARD_STEPS.length - 1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        orientation="horizontal"
      />
      <Text size="xs" color="secondary">
        StepWizard (vertical)
      </Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        orientation="vertical"
      />
      <Text size="xs" color="secondary">
        StepWizard (loading)
      </Text>
      <PatternStepWizard steps={FORMS_WIZARD_STEPS} onComplete={() => undefined} loading />
    </Stack>
  );
}

function FormsFbInvoiceTemplate() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-invoice-template">
      <Text size="xs" color="secondary">
        InvoiceTemplate (full, paid)
      </Text>
      <PatternInvoiceTemplate
        invoice={{ ...FORMS_INVOICE_BASE, status: 'paid' }}
        onPrint={() => undefined}
        onExport={() => undefined}
      />
      {FORMS_INVOICE_STATUSES.map((status) => (
        <Box key={status}>
          <Text size="xs" color="secondary">{`InvoiceTemplate (status: ${status})`}</Text>
          <PatternInvoiceTemplate
            invoice={{
              number: `INV-STATUS-${status}`,
              date: '2026-07-01',
              company: { name: 'Rottay Inc.' },
              client: { name: 'Acme Corp' },
              items: [
                {
                  id: 'li-1',
                  description: 'Line item',
                  quantity: 1,
                  unitPrice: 100,
                  total: 100,
                },
              ],
              subtotal: 100,
              tax: 0,
              total: 100,
              status,
            }}
            showActions={false}
          />
        </Box>
      ))}
      <Text size="xs" color="secondary">
        InvoiceTemplate (loading)
      </Text>
      <PatternInvoiceTemplate
        invoice={{
          number: 'INV-LOADING',
          date: '2026-07-01',
          company: { name: 'Rottay Inc.' },
          client: { name: 'Acme Corp' },
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
        }}
        loading
      />
    </Stack>
  );
}

export function FormsFbStates() {
  return (
    <Box
      data-testid="probe-forms"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <FormsFbFilterBuilder />
        <FormsFbFormBuilder />
        <FormsFbStepWizard />
        <FormsFbInvoiceTemplate />
      </Stack>
    </Box>
  );
}
