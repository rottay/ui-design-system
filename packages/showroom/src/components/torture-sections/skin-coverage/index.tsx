'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Box,
  Stack,
  Text,
  Button,
  Card,
  Cascader,
  Collapse,
  DatePicker,
  FormSections,
  InlineEditSection,
  Input,
  Menu,
  MessageProvider,
  Modal,
  NotificationProvider,
  Pagination,
  PatternDataTable,
  PatternFormBuilder,
  Popconfirm,
  RecordField,
  Result,
  Select,
  Slider,
  Stepper,
  Textarea,
  TimePicker,
  Toast,
  ToastProvider,
  Tree,
  useNotification,
  useToast,
  type ColumnDef,
} from '@rottay/design-system';

// Configurations whose skin parts no other section mounts, behind their own flag so the
// opened overlays stay out of the visual batch screenshots. Every state is static at rest.

const noop = () => undefined;

/** Clicks `target` until `reached` matches; a lazy engine can ignore a click it receives before hydrating. */
function useClickUntil(target: string, reached: string) {
  useEffect(() => {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (document.querySelector(reached) || tries > 40) {
        window.clearInterval(timer);
        return;
      }
      document.querySelector<HTMLElement>(target)?.click();
    }, 250);
    return () => window.clearInterval(timer);
  }, [target, reached]);
}

function Cell({ testId, label, children }: { testId: string; label: string; children: ReactNode }) {
  return (
    <Stack spacing="xs" data-testid={`probe-skin-coverage-${testId}`}>
      <Text size="xs" color="secondary">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

// ---- fields ----------------------------------------------------------------

const GROUP_OPTIONS = [
  { value: 'http', label: 'http' },
  { value: 'https', label: 'https' },
];

function FieldsCoverage() {
  return (
    <>
      <Cell testId="input-count" label="Input -- showCount near limit, at limit, invalid">
        <Input showCount maxLength={10} defaultValue="123456789" />
        <Input showCount maxLength={10} defaultValue="1234567890" />
        <Input showCount maxLength={10} defaultValue="bad" error errorMessage="Invalid value" />
      </Cell>
      <Cell testId="slider-range-tooltip" label="Slider -- range with tooltip">
        <Slider range defaultValue={[20, 70]} tooltip={{}} />
      </Cell>
      <Cell testId="input-group-select" label="Input.Group compact -- Select seams">
        <Input.Group compact>
          <Input.Addon position="before">scheme</Input.Addon>
          <Select options={GROUP_OPTIONS} defaultValue="https" />
          <Input.Addon position="after">host</Input.Addon>
        </Input.Group>
        <Input.Group compact>
          <Select options={GROUP_OPTIONS} defaultValue="https" status="error" />
          <Input.Addon position="after">error</Input.Addon>
        </Input.Group>
        <Input.Group compact>
          <Input.Addon position="before">warning</Input.Addon>
          <Select options={GROUP_OPTIONS} defaultValue="https" status="warning" />
        </Input.Group>
        <Input.Group compact>
          <Input.Addon position="before">success</Input.Addon>
          <Select options={GROUP_OPTIONS} defaultValue="https" status="success" />
          <Input.Addon position="after">ok</Input.Addon>
        </Input.Group>
        <Input.Group compact>
          <Input.Addon position="before">disabled</Input.Addon>
          <Select options={GROUP_OPTIONS} defaultValue="https" disabled />
          <Input.Addon position="after">off</Input.Addon>
        </Input.Group>
      </Cell>
      <Cell testId="textarea-variants" label="Textarea -- filled, borderless">
        <Textarea variant="filled" rows={2} defaultValue="Filled" />
        <Textarea variant="borderless" rows={2} defaultValue="Borderless" />
      </Cell>
    </>
  );
}

// ---- dropdowns -------------------------------------------------------------

const CASCADER_OPTIONS = [
  { value: 'us', label: 'United States', children: [{ value: 'us-ca', label: 'California' }] },
  { value: 'ca', label: 'Canada' },
];

const SELECT_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
];

const SELECT_GROUPS = [
  { label: 'Product', options: [{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }] },
  { label: 'Revenue', options: [{ value: 'sales', label: 'Sales' }] },
];

function DropdownsCoverage() {
  // Opened after hydration: an SSR-open rustic Cascader fails hydration (its portal is document-gated).
  const [cascaderOpen, setCascaderOpen] = useState(false);
  useEffect(() => setCascaderOpen(true), []);
  useClickUntil(
    "[data-testid='probe-skin-coverage-select-groups-open'] .rottay-select--rustic [data-part='trigger']",
    "[data-testid='probe-skin-coverage-select-groups-open'] .rottay-select--rustic [data-part='dropdown']",
  );
  return (
    <>
      <Cell testId="cascader-open" label="Cascader -- open">
        <Cascader options={CASCADER_OPTIONS} open={cascaderOpen} onChange={noop} />
      </Cell>
      <Cell testId="select-variants" label="Select -- filled, flushed">
        <Select options={SELECT_OPTIONS} variant="filled" defaultValue="design" />
        <Select options={SELECT_OPTIONS} variant="flushed" defaultValue="sales" />
      </Cell>
      <Cell testId="select-groups-open" label="Select -- option groups, opened">
        <Select options={SELECT_OPTIONS} optionGroups={SELECT_GROUPS} placeholder="Choose a team" />
      </Cell>
    </>
  );
}

// ---- pickers ---------------------------------------------------------------

function PickersCoverage() {
  return (
    <Cell testId="picker-status" label="DatePicker / TimePicker -- error, warning">
      <DatePicker status="error" defaultValue="2026-03-15" onChange={noop} />
      <DatePicker status="warning" defaultValue="2026-03-15" onChange={noop} />
      <DatePicker.RangePicker status="error" defaultValue={['2026-01-01', '2026-01-10']} onChange={noop} />
      <DatePicker.RangePicker status="warning" defaultValue={['2026-01-01', '2026-01-10']} onChange={noop} />
      <TimePicker status="error" defaultValue="09:30" onChange={noop} />
      <TimePicker status="warning" defaultValue="09:30" onChange={noop} />
      <TimePicker.RangePicker status="error" onChange={noop} />
      <TimePicker.RangePicker status="warning" onChange={noop} />
    </Cell>
  );
}

// ---- overlay / overlayfb ---------------------------------------------------

function FiredToast() {
  const { show } = useToast();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    show({
      variant: 'info',
      title: 'Container toast with action',
      duration: 0,
      showProgress: false,
      action: { label: 'Undo', onClick: noop },
    });
  }, [show]);
  return null;
}

function OpenedNotifications() {
  const [api] = useNotification();
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    api.open({ message: 'Top notification', duration: 0, placement: 'top' });
    api.open({ message: 'Bottom notification', duration: 0, placement: 'bottom' });
  }, [api]);
  return null;
}

function OverlayCoverage() {
  return (
    <>
      <Cell testId="popconfirm-open" label="Popconfirm -- open">
        <Popconfirm title="Remove item?" description="This action cannot be undone." open onConfirm={noop} onCancel={noop}>
          <Button>Remove</Button>
        </Popconfirm>
      </Cell>
      <Cell testId="modal-compounds" label="Modal -- compound header/body/footer">
        <Modal open onClose={noop}>
          <Modal.Header closable onClose={noop}>
            Compound header
          </Modal.Header>
          <Modal.Header divider>Divided header</Modal.Header>
          <Modal.Body>Default padding</Modal.Body>
          <Modal.Body padding="none">No padding</Modal.Body>
          <Modal.Body padding="sm">Small padding</Modal.Body>
          <Modal.Footer divider>
            <Button size="sm">Default</Button>
          </Modal.Footer>
          <Modal.Footer padding="none" align="start">
            <Button size="sm">None</Button>
          </Modal.Footer>
          <Modal.Footer padding="sm" align="center">
            <Button size="sm">Small</Button>
          </Modal.Footer>
          <Modal.Footer padding="md">
            <Button size="sm">Medium</Button>
          </Modal.Footer>
          <Modal.CloseButton size="sm" onClose={noop} />
          <Modal.CloseButton size="lg" onClose={noop} />
        </Modal>
      </Cell>
      <Cell testId="toast-container-action" label="Toast.Container -- fired toast with action">
        <ToastProvider>
          <FiredToast />
          <Toast.Container position="top-right" />
        </ToastProvider>
      </Cell>
      <Cell testId="toast-undo" label="Toast.Undo">
        <Toast.Undo title="Item deleted" onUndo={noop} duration={0} />
      </Cell>
      <Cell testId="notification-stack" label="Notification -- provider with top and bottom stacks">
        <NotificationProvider>
          <OpenedNotifications />
        </NotificationProvider>
      </Cell>
      <Cell testId="message-provider" label="Message -- provider stack">
        <MessageProvider>
          <Text size="xs">Message provider mounted</Text>
        </MessageProvider>
      </Cell>
      <Cell testId="result-http" label="Result -- HTTP statuses">
        <Result status="404" title="Not found" />
        <Result status="403" title="Forbidden" />
        <Result status="500" title="Server error" />
      </Cell>
    </>
  );
}

// ---- nav -------------------------------------------------------------------

const ICON_SUBMENU_ITEMS = [
  {
    key: 'workspace',
    label: 'Workspace',
    icon: <Text size="xs">W</Text>,
    children: [{ key: 'workspace-overview', label: 'Overview' }],
  },
  { key: 'reports', label: 'Reports' },
];

function NavCoverage() {
  return (
    <>
      <Cell testId="menu-icon-submenu" label="Menu -- submenu with icon, open">
        <Menu items={ICON_SUBMENU_ITEMS} defaultOpenKeys={['workspace']} onSelect={noop} />
      </Cell>
      <Cell testId="menu-dark" label="Menu -- dark theme">
        <Menu theme="dark" items={ICON_SUBMENU_ITEMS.slice(1)} onSelect={noop} />
      </Cell>
      <Cell testId="menu-divider-dashed" label="Menu.Divider -- dashed">
        <Menu onSelect={noop}>
          <Menu.Item itemKey="above">Above</Menu.Item>
          <Menu.Divider dashed />
          <Menu.Item itemKey="below">Below</Menu.Item>
        </Menu>
      </Cell>
      <Cell testId="stepper-step-standalone" label="Stepper.Step -- standalone">
        <Stepper.Step title="Standalone step" description="Outside a Stepper" />
      </Cell>
      <Cell testId="pagination-size-changer" label="Pagination -- size changer">
        <Pagination current={1} total={100} pageSize={10} showSizeChanger onChange={noop} />
      </Cell>
    </>
  );
}

// ---- mediaStates / layout / dataDisplayStates ------------------------------

const TREE_LAZY_DATA = [{ key: 'lazy', title: 'Lazy folder', isLeaf: false }];
const neverResolves = () => new Promise<never>(() => undefined);

function DisplayCoverage() {
  useClickUntil(
    "[data-testid='probe-skin-coverage-tree-loading'] [data-part='tree-node-toggle']",
    "[data-testid='probe-skin-coverage-tree-loading'] :is([data-part='loading'], [aria-expanded='true'])",
  );
  return (
    <>
      <Cell testId="card-compound-header" label="Card -- compound header, per tone">
        {(['default', 'primary', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
          <Card key={tone} colorVariant={tone}>
            <Card.Header title={`Header ${tone}`} />
          </Card>
        ))}
      </Cell>
      <Cell testId="card-extra" label="Card -- extra">
        <Card title="With extra" extra={<Button size="xs">Extra</Button>} />
      </Cell>
      <Cell testId="card-nested" label="Card -- nested card">
        <Card title="Outer">
          <Card title="Inner" />
        </Card>
      </Cell>
      <Cell testId="collapse-ghost" label="Collapse -- ghost">
        <Collapse ghost defaultActiveKey={['open']}>
          <Collapse.Panel header="Open ghost panel" panelKey="open">
            <Text size="xs">Expanded content</Text>
          </Collapse.Panel>
          <Collapse.Panel header="Closed ghost panel" panelKey="closed">
            <Text size="xs">Collapsed content</Text>
          </Collapse.Panel>
        </Collapse>
      </Cell>
      <Cell testId="tree-loading" label="Tree -- node loading">
        <Tree treeData={TREE_LAZY_DATA} loadData={neverResolves} />
      </Cell>
    </>
  );
}

// ---- forms / record --------------------------------------------------------

const SECTIONED_FIELDS = [
  { name: 'section:identity', label: 'Identity', description: 'Who the record belongs to', type: 'custom' as const },
  { name: 'fullName', label: 'Full name', type: 'text' as const },
];

const ERROR_SECTIONS = [
  {
    key: 'coverage-error',
    title: 'Billing',
    error: 'Card declined',
    children: <Text size="xs">Section content</Text>,
  },
];

function FormsCoverage() {
  return (
    <>
      <Cell testId="form-builder-sections" label="FormBuilder -- titled section">
        <PatternFormBuilder fields={SECTIONED_FIELDS} onSubmit={noop} />
      </Cell>
      <Cell testId="record-field-error" label="RecordField -- error">
        <RecordField label="Email" value="ada@example" error="Enter a valid email" />
      </Cell>
      <Cell testId="form-sections-error" label="FormSections -- section error">
        <FormSections sections={ERROR_SECTIONS} />
      </Cell>
      <Cell testId="inline-edit-section" label="InlineEditSection">
        <InlineEditSection title="Contact" description="How we reach you">
          <Text size="xs">Section fields</Text>
        </InlineEditSection>
      </Cell>
    </>
  );
}

// ---- datatable -------------------------------------------------------------

interface CoverageRow {
  id: string;
  name: string;
  owner: string;
}

const COVERAGE_ROWS: CoverageRow[] = [
  { id: 'r1', name: 'Quarterly review', owner: 'Ada' },
  { id: 'r2', name: 'Launch plan', owner: 'Grace' },
];

const COVERAGE_COLUMNS: ColumnDef<CoverageRow>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
];

const renderRowActions = () => <Button size="xs">Edit</Button>;

const EVERY_POSTURE = ['phone', 'tablet', 'desktop', 'compact', 'regular', 'expanded'] as const;

// The same delta on every posture holds the presentation at whatever width the page is read.
const TABLE_PRESENTATION = Object.fromEntries(EVERY_POSTURE.map((posture) => [posture, { presentation: 'table' as const }]));
const CARDS_WITH_MENU_ACTIONS = Object.fromEntries(
  EVERY_POSTURE.map((posture) => [posture, { presentation: 'cards' as const, rowActions: 'menu' as const }]),
);

function DataTableCoverage() {
  return (
    <>
      <Cell testId="datatable-actions" label="DataTable -- row actions column">
        <PatternDataTable<CoverageRow>
          data={COVERAGE_ROWS}
          rowKey="id"
          columns={COVERAGE_COLUMNS}
          actions={renderRowActions}
          adapt={TABLE_PRESENTATION}
        />
      </Cell>
      <Cell testId="datatable-cards-menu" label="DataTable -- cards with row-action menu">
        <PatternDataTable<CoverageRow>
          data={COVERAGE_ROWS}
          rowKey="id"
          columns={COVERAGE_COLUMNS}
          actions={renderRowActions}
          adapt={CARDS_WITH_MENU_ACTIONS}
        />
      </Cell>
    </>
  );
}

export function SkinCoverageStates() {
  return (
    <Box
      data-testid="probe-skin-coverage"
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <FieldsCoverage />
        <DropdownsCoverage />
        <PickersCoverage />
        <OverlayCoverage />
        <NavCoverage />
        <DisplayCoverage />
        <FormsCoverage />
        <DataTableCoverage />
      </Box>
    </Box>
  );
}
