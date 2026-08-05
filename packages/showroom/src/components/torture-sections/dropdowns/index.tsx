'use client';

import { Box, Stack, Text, Select, TreeSelect, Cascader, AutoComplete, Mentions } from '@rottay/design-system';

// Fixed option/tree/cascade data for the WO-SKIN-02 checkpoint B dropdown-family
// (Select, TreeSelect, Cascader, AutoComplete, Mentions) data-part probe.
const DROPDOWN_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
];

const TREE_SELECT_DATA = [
  {
    value: 'engineering',
    title: 'Engineering',
    children: [
      { value: 'frontend', title: 'Frontend' },
      { value: 'backend', title: 'Backend' },
    ],
  },
  { value: 'design', title: 'Design' },
];

const CASCADER_OPTIONS = [
  {
    value: 'us',
    label: 'United States',
    children: [
      {
        value: 'us-ca',
        label: 'California',
        children: [{ value: 'us-ca-sf', label: 'San Francisco' }],
      },
      { value: 'us-ny', label: 'New York' },
    ],
  },
  { value: 'ca', label: 'Canada' },
];

const AUTOCOMPLETE_OPTIONS = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue' },
  { value: 'Angular', label: 'Angular' },
];

const MENTIONS_OPTIONS = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
];

// WO-SKIN-02 checkpoint B dropdown-family data-part probe. An open popup is
// not capturable at rest (open state = interaction), so this grid only shows
// closed triggers -- with values, placeholders, tags, and disabled -- per the
// checkpoint contract; the spec's interaction shots open each popup
// separately (click trigger, wait for the listbox). Rendered only behind
// `?dropdowns=1` so no flagship capture sees it. This section is what
// `dropdowns-batch.spec.ts` photographs and reads computed styles from.
export function DropdownsStates() {
  return (
    <Box
      data-testid="probe-dropdowns"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-dropdowns-select">
          <Text size="xs" color="secondary">
            Select
          </Text>
          <Select options={DROPDOWN_OPTIONS} placeholder="Choose a team" onChange={() => undefined} />
          <Select options={DROPDOWN_OPTIONS} defaultValue="engineering" onChange={() => undefined} />
          <Select
            options={DROPDOWN_OPTIONS}
            multiple
            defaultValue={['design', 'engineering', 'marketing']}
            maxTagCount={2}
            onChange={() => undefined}
          />
          <Select options={DROPDOWN_OPTIONS} error defaultValue="sales" onChange={() => undefined} />
          <Select options={DROPDOWN_OPTIONS} disabled defaultValue="design" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-treeselect">
          <Text size="xs" color="secondary">
            TreeSelect
          </Text>
          <TreeSelect treeData={TREE_SELECT_DATA} placeholder="Choose a node" onChange={() => undefined} />
          <TreeSelect treeData={TREE_SELECT_DATA} defaultValue="frontend" onChange={() => undefined} />
          <TreeSelect treeData={TREE_SELECT_DATA} disabled defaultValue="design" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-cascader">
          <Text size="xs" color="secondary">
            Cascader
          </Text>
          <Cascader options={CASCADER_OPTIONS} placeholder="Choose a location" onChange={() => undefined} />
          <Cascader options={CASCADER_OPTIONS} defaultValue={['us', 'us-ca', 'us-ca-sf']} onChange={() => undefined} />
          <Cascader options={CASCADER_OPTIONS} disabled defaultValue={['ca']} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-autocomplete">
          <Text size="xs" color="secondary">
            AutoComplete
          </Text>
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} placeholder="Search a framework" onChange={() => undefined} />
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} defaultValue="React" onChange={() => undefined} />
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} disabled defaultValue="Vue" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-mentions">
          <Text size="xs" color="secondary">
            Mentions
          </Text>
          <Mentions options={MENTIONS_OPTIONS} placeholder="Type @ to mention someone" onChange={() => undefined} />
          <Mentions
            options={MENTIONS_OPTIONS}
            defaultValue="Hey @ada, can you review this?"
            onChange={() => undefined}
          />
          <Mentions options={MENTIONS_OPTIONS} disabled defaultValue="Assigned to @grace" onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}
