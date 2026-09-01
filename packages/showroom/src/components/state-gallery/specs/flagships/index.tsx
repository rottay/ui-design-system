'use client';

import { useState, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  FormField,
  Input,
  Modal,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Flagship variant + state specs
//
// Each flagship renders the REAL DS component across the states it can express
// truthfully in a static frame: variants, sizes, and prop-driven states
// (disabled, read-only, error, empty). Pure pseudo-class states (hover, active,
// focus) are NOT faked here — they are exercised for real by the interaction
// capture (Playwright .hover()/.focus()) so nothing on this surface implies a
// state the component is not actually in.
// ---------------------------------------------------------------------------

export interface StateCell {
  label: string;
  node: ReactNode;
}

export interface StateGroup {
  label: string;
  cells: StateCell[];
}

export interface FlagshipSpec {
  slug: string;
  name: string;
  groups: StateGroup[];
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'enterprise', label: 'Enterprise' },
];

const TABLE_ROWS = [
  { key: 'op-14', name: 'Operations', owner: 'Daniel', status: 'Ready' },
  { key: 'fin-08', name: 'Finance', owner: 'Mariela', status: 'Review' },
  { key: 'sup-03', name: 'Support', owner: 'Jordan', status: 'Blocked' },
];

const TABLE_COLUMNS = [
  { key: 'name', title: 'Workspace', dataIndex: 'name' },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value: unknown) => {
      const variant: BadgeVariant =
        value === 'Ready' ? 'success' : value === 'Review' ? 'warning' : 'error';
      return <Badge variant={variant}>{String(value)}</Badge>;
    },
  },
];

const TABS_ITEMS = [
  { key: '1', label: 'Overview', children: <Text size="sm">Overview panel</Text> },
  { key: '2', label: 'Activity', children: <Text size="sm">Activity panel</Text> },
  { key: '3', label: 'Settings', children: <Text size="sm">Settings panel</Text> },
];

function ModalCell() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Archive tenant"
        description="Archived tenants can be restored later from platform settings."
        footer={
          <Flex gap={8} justify="end">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Archive
            </Button>
          </Flex>
        }
      >
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          The real DS modal surface, rendered under the active tenant palette.
        </Text>
      </Modal>
    </Stack>
  );
}

export const FLAGSHIP_SPECS: FlagshipSpec[] = [
  {
    slug: 'button',
    name: 'Button',
    groups: [
      {
        label: 'Variants',
        cells: [
          { label: 'Primary', node: <Button variant="primary">Primary</Button> },
          { label: 'Secondary', node: <Button variant="secondary">Secondary</Button> },
          { label: 'Default', node: <Button variant="default">Default</Button> },
          { label: 'Ghost', node: <Button variant="ghost">Ghost</Button> },
        ],
      },
      {
        label: 'States',
        cells: [
          { label: 'Default', node: <Button variant="primary">Save changes</Button> },
          {
            label: 'Disabled',
            node: (
              <Button variant="primary" disabled>
                Save changes
              </Button>
            ),
          },
        ],
      },
      {
        label: 'Sizes',
        cells: [
          { label: 'Small', node: <Button variant="primary" size="sm">Small</Button> },
          { label: 'Medium', node: <Button variant="primary" size="md">Medium</Button> },
          { label: 'Large', node: <Button variant="primary" size="lg">Large</Button> },
        ],
      },
    ],
  },
  {
    slug: 'input',
    name: 'Input',
    groups: [
      {
        label: 'States',
        cells: [
          { label: 'Default', node: <Input placeholder="ops@northwind.co" style={{ width: 220 }} /> },
          { label: 'Filled', node: <Input defaultValue="Northwind" style={{ width: 220 }} /> },
          { label: 'Disabled', node: <Input placeholder="Disabled" disabled style={{ width: 220 }} /> },
          { label: 'Read only', node: <Input defaultValue="Locked value" readOnly style={{ width: 220 }} /> },
        ],
      },
      {
        label: 'Validation',
        cells: [
          {
            label: 'Error',
            node: (
              <Box style={{ width: 240 }}>
                <FormField label="Email" name="gallery-email" error="Enter a valid email address.">
                  <Input defaultValue="not-an-email" />
                </FormField>
              </Box>
            ),
          },
          {
            label: 'Required',
            node: (
              <Box style={{ width: 240 }}>
                <FormField label="Tenant" name="gallery-tenant" required help="Shown across all routes.">
                  <Input placeholder="Northwind" />
                </FormField>
              </Box>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'select',
    name: 'Select',
    groups: [
      {
        label: 'States',
        cells: [
          {
            label: 'Placeholder',
            node: <Select options={PLAN_OPTIONS} placeholder="Choose a plan" style={{ minWidth: 200 }} />,
          },
          {
            label: 'Selected',
            node: <Select options={PLAN_OPTIONS} defaultValue="growth" style={{ minWidth: 200 }} />,
          },
          {
            label: 'Disabled',
            node: <Select options={PLAN_OPTIONS} defaultValue="starter" disabled style={{ minWidth: 200 }} />,
          },
        ],
      },
      {
        label: 'Validation',
        cells: [
          {
            label: 'Error',
            node: (
              <Box style={{ width: 240 }}>
                <FormField label="Plan tier" name="gallery-tier" error="Pick an approval status.">
                  <Select options={PLAN_OPTIONS} placeholder="Select a plan" />
                </FormField>
              </Box>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    groups: [
      {
        label: 'Compositions',
        cells: [
          {
            label: 'Basic',
            node: (
              <Card title="Workspace" style={{ width: 240 }}>
                <Text size="sm">Grouped content lives on a contained surface.</Text>
              </Card>
            ),
          },
          {
            label: 'With status',
            node: (
              <Card title="Route policy" style={{ width: 240 }}>
                <Stack spacing="sm">
                  <Flex align="center" justify="between">
                    <Text size="sm" weight="semibold">
                      Northwind
                    </Text>
                    <Badge variant="success">Active</Badge>
                  </Flex>
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    Secondary approvers inherit workspace defaults.
                  </Text>
                </Stack>
              </Card>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    groups: [
      {
        label: 'Variants',
        cells: (['primary', 'secondary', 'success', 'warning', 'error'] as BadgeVariant[]).map(
          (variant) => ({
            label: variant.charAt(0).toUpperCase() + variant.slice(1),
            node: <Badge variant={variant}>{variant}</Badge>,
          })
        ),
      },
    ],
  },
  {
    slug: 'table',
    name: 'Table',
    groups: [
      {
        label: 'States',
        // Cells must be fluid: this gallery is captured at fixed 360/768/1280 viewports.
        cells: [
          {
            label: 'Populated',
            node: (
              <Box style={{ width: '100%', maxWidth: 360 }}>
                <Table rowKey="key" pagination={false} dataSource={TABLE_ROWS} columns={TABLE_COLUMNS} />
              </Box>
            ),
          },
          {
            label: 'Empty',
            node: (
              <Box style={{ width: '100%', maxWidth: 360 }}>
                <Table rowKey="key" pagination={false} dataSource={[]} columns={TABLE_COLUMNS} />
              </Box>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    groups: [
      {
        label: 'Active item',
        // Cells must be fluid: this gallery is captured at fixed 360/768/1280 viewports.
        cells: [
          {
            label: 'First active',
            node: (
              <Box style={{ width: '100%', maxWidth: 300 }}>
                <Tabs items={TABS_ITEMS} defaultActiveKey="1" />
              </Box>
            ),
          },
          {
            label: 'Second active',
            node: (
              <Box style={{ width: '100%', maxWidth: 300 }}>
                <Tabs items={TABS_ITEMS} defaultActiveKey="2" />
              </Box>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'modal',
    name: 'Modal',
    groups: [
      {
        label: 'Surface',
        cells: [{ label: 'Trigger + dialog', node: <ModalCell /> }],
      },
    ],
  },
];
