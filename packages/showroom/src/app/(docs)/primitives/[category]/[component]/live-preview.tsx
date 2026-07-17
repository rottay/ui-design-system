'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Affix,
  Alert,
  AlertDialog,
  Anchor,
  AspectRatio,
  AutoComplete,
  Avatar,
  BackTop,
  Badge,
  Box,
  Breadcrumb,
  Button,
  Calendar,
  Callout,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Collapse,
  ColorPicker,
  ConfirmDialog,
  Container,
  ContextMenu,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Form,
  FormField,
  Grid,
  Hide,
  HoverCard,
  Image,
  Input,
  InputNumber,
  Kbd,
  Layout,
  List,
  Menu,
  Mentions,
  MessageProvider,
  Modal,
  NavLink,
  NotificationProvider,
  OTPInput,
  OverlayModal,
  Pagination,
  PasswordInput,
  Popconfirm,
  Popover,
  Progress,
  QRCode,
  Radio,
  Rate,
  ResponsiveSlot,
  Result,
  ScrollArea,
  Segmented,
  Select,
  Sheet,
  Show,
  Skeleton,
  Slider,
  Space,
  Spinner,
  Splitter,
  Stack,
  Statistic,
  Stepper,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TagInput,
  Text,
  Textarea,
  TimePicker,
  Timeline,
  Toast,
  ToastProvider,
  Toggle,
  Tooltip,
  Tour,
  Transfer,
  Tree,
  TreeSelect,
  Upload,
  VoiceInputButton,
  Watermark,
  useMessage,
  useNotification,
  useToast,
} from '@rottay/design-system';
import { RuntimeFingerprint } from '@/components/runtime/runtime-fingerprint';
import { StateGallery, getFlagshipSpec } from '@/components/state-gallery';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { primitives } from '@/data/registry';
import type {
  PrimitiveCategory,
  PrimitiveEntry,
} from '@/data/registry';

// ---------------------------------------------------------------------------
// Shared preview helpers
// ---------------------------------------------------------------------------

function PreviewFrame({
  children,
  height = 208,
  width = 296,
}: {
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <Box
      style={{
        position: 'relative',
        width: 'min(100%, 100%)',
        maxWidth: width,
        minHeight: height,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-container, #ffffff) 0%, var(--ds-color-bg-secondary, #f8fafc) 100%)',
      }}
    >
      {children}
    </Box>
  );
}

function SurfaceBlock({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      style={{
        padding: 14,
        borderRadius: 14,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-container)',
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

function AdapterPendingPreview({
  entry,
}: {
  entry: PrimitiveEntry;
}) {
  return (
    <Stack spacing="sm" style={{ maxWidth: 360 }}>
      <Badge variant="warning">Adapter pending</Badge>
      <Text size="sm" weight="semibold">
        {entry.name} still needs a dedicated showroom fixture.
      </Text>
      <Text
        size="sm"
        style={{ color: 'var(--ds-color-text-secondary)' }}
      >
        This state is intentionally explicit so the docs do not imply a verified
        engine-level preview that is not wired yet.
      </Text>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Real DS-backed preview components
// ---------------------------------------------------------------------------

function TablePreview() {
  const rows = [
    { key: 'op-14', name: 'Operations', owner: 'Daniel', status: 'Ready' },
    { key: 'fin-08', name: 'Finance', owner: 'Mariela', status: 'Review' },
    { key: 'sup-03', name: 'Support', owner: 'Jordan', status: 'Blocked' },
  ];

  return (
    <Box style={{ width: 372 }}>
      <Table
        rowKey="key"
        pagination={false}
        dataSource={rows}
        columns={[
          {
            key: 'name',
            title: 'Workspace',
            dataIndex: 'name',
          },
          {
            key: 'owner',
            title: 'Owner',
            dataIndex: 'owner',
          },
          {
            key: 'status',
            title: 'Status',
            dataIndex: 'status',
            render: (value) => {
              const variant =
                value === 'Ready'
                  ? 'success'
                  : value === 'Review'
                    ? 'warning'
                    : 'error';

              return <Badge variant={variant}>{String(value)}</Badge>;
            },
          },
        ]}
      />
    </Box>
  );
}

function FormPreview() {
  return (
    <Form
      layout="vertical"
      initialValues={{
        tenant: 'Northwind',
        owner: 'daniel@rottay.com',
      }}
      style={{ width: 320 }}
    >
      <Form.Item
        name="tenant"
        label="Tenant name"
        rules={[{ required: true, message: 'Tenant name is required' }]}
      >
        <Input placeholder="Northwind" />
      </Form.Item>
      <Form.Item name="owner" label="Workspace owner">
        <Input placeholder="daniel@rottay.com" />
      </Form.Item>
      <Form.Item name="tier" label="Plan tier">
        <Select
          options={[
            { value: 'starter', label: 'Starter' },
            { value: 'growth', label: 'Growth' },
            { value: 'enterprise', label: 'Enterprise' },
          ]}
          placeholder="Choose a plan"
        />
      </Form.Item>
    </Form>
  );
}

function FormFieldPreview() {
  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <FormField
        label="Email"
        name="email"
        required
        help="We use this for workspace access alerts."
      >
        <Input placeholder="ops@northwind.co" />
      </FormField>
      <FormField
        label="Status"
        name="status"
        error="Pick an approval status before continuing."
      >
        <Select
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In review' },
            { value: 'approved', label: 'Approved' },
          ]}
          placeholder="Select a status"
        />
      </FormField>
    </Stack>
  );
}

function TagInputPreview() {
  const [tags, setTags] = useState(['billing', 'priority']);

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <TagInput
        value={tags}
        onChange={setTags}
        placeholder="Add route labels"
        maxTags={6}
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Tags stay controlled in preview so you can test add and remove behavior.
      </Text>
    </Stack>
  );
}

function VoiceInputButtonPreview() {
  const [transcript, setTranscript] = useState('');

  return (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Flex align="center" gap={10}>
        <Input
          value={transcript}
          readOnly
          placeholder="Speech transcript appears here when supported"
          style={{ width: 250 }}
        />
        <VoiceInputButton
          onTranscript={setTranscript}
          ariaLabel="Capture voice query"
        />
      </Flex>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        This uses the real DS voice primitive. It only renders the mic button
        when the browser exposes speech recognition and microphone access is
        available.
      </Text>
    </Stack>
  );
}

function MessagePreview() {
  return (
    <MessageProvider>
      <MessagePreviewContent />
    </MessageProvider>
  );
}

function MessagePreviewContent() {
  const [messageApi, messageContextHolder] = useMessage();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      {messageContextHolder}
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Real imperative DS message API.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => messageApi.success('Changes saved')}
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => messageApi.warning('Validation still pending')}
        >
          Warning
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => messageApi.loading('Publishing update...')}
        >
          Loading
        </Button>
      </Flex>
    </Stack>
  );
}

function NotificationPreview() {
  return (
    <NotificationProvider>
      <NotificationPreviewContent />
    </NotificationProvider>
  );
}

function NotificationPreviewContent() {
  const [notificationApi, notificationContextHolder] = useNotification();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      {notificationContextHolder}
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Provider-backed DS notifications with engine-specific chrome.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            notificationApi.success({
              message: 'Route published',
              description: 'Dispatchers can now assign this route.',
            })
          }
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() =>
            notificationApi.warning({
              message: 'Quota warning',
              description: 'Premium API usage is nearing the monthly cap.',
            })
          }
        >
          Warning
        </Button>
      </Flex>
    </Stack>
  );
}

function ToastPreview() {
  return (
    <ToastProvider duration={3200}>
      <ToastPreviewContent />
      <Toast.Container position="top-right" />
    </ToastProvider>
  );
}

function ToastPreviewContent() {
  const toast = useToast();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Lightweight toast stack from the real DS runtime.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            toast.success('Deployment ready', 'All tenant checks passed.')
          }
        >
          Show toast
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() =>
            toast.info('Sync running', 'Background reconciliation is still active.')
          }
        >
          Info
        </Button>
      </Flex>
    </Stack>
  );
}

function DrawerPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Uses the real DS drawer component instead of a fake trigger.
      </Text>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Tenant filters"
        placement="right"
        width={360}
      >
        <Stack spacing="sm">
          <Input placeholder="Search routes" />
          <Select
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' },
            ]}
            placeholder="Status"
          />
        </Stack>
      </Drawer>
    </Stack>
  );
}

function FeedbackModalPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Click to inspect the real DS modal treatment for the active engine.
      </Text>
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
          This preview is bound to the DS modal runtime instead of a showroom-only
          placeholder.
        </Text>
      </Modal>
    </Stack>
  );
}

function BackTopPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 140;
    }
  }, []);

  return (
    <PreviewFrame height={208} width={304}>
      <Box
        ref={scrollRef}
        style={{
          position: 'relative',
          height: '100%',
          overflow: 'auto',
          padding: 14,
        }}
      >
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Scrollable activity feed
          </Text>
          {Array.from({ length: 8 }).map((_, index) => (
            <SurfaceBlock key={index}>
              <Text size="sm">Activity item {index + 1}</Text>
            </SurfaceBlock>
          ))}
        </Stack>
        <BackTop
          target={() => scrollRef.current ?? window}
          visibilityHeight={32}
          style={{
            position: 'absolute',
            inset: 'auto',
            right: 14,
            bottom: 14,
          }}
        >
          <Text size="xs" weight="semibold">
            Top
          </Text>
        </BackTop>
      </Box>
    </PreviewFrame>
  );
}

function FloatButtonPreview() {
  const [open, setOpen] = useState(true);

  return (
    <PreviewFrame height={208} width={304}>
      <Box style={{ padding: 16 }}>
        <Text size="sm" weight="semibold">
          Floating action cluster
        </Text>
        <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
          The controls below are the actual DS float button family.
        </Text>
      </Box>
      <FloatButton.Group
        open={open}
        onOpenChange={setOpen}
        trigger="click"
        type="primary"
        icon={<Text size="xs">+</Text>}
        style={{
          position: 'absolute',
          inset: 'auto',
          right: 16,
          bottom: 16,
        }}
      >
        <FloatButton icon={<Text size="xs">E</Text>} tooltip="Edit" />
        <FloatButton icon={<Text size="xs">S</Text>} tooltip="Share" />
      </FloatButton.Group>
    </PreviewFrame>
  );
}

function StepperPreview() {
  const [current, setCurrent] = useState(1);

  return (
    <Stack spacing="sm" style={{ width: 340 }}>
      <Stepper
        items={[
          { title: 'Draft', description: 'Configure workspace' },
          { title: 'Review', description: 'Validate policy' },
          { title: 'Launch', description: 'Go live' },
        ]}
        current={current}
        clickable
        onChange={setCurrent}
      />
      <SurfaceBlock>
        <Text size="sm" weight="semibold">
          Step {current + 1}
        </Text>
        <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
          Click the real DS stepper to move between stages.
        </Text>
      </SurfaceBlock>
    </Stack>
  );
}

function AlertDialogPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open alert dialog
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete route?"
        description="This action cannot be undone for downstream operators."
        action={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Delete
          </Button>
        }
      />
    </Stack>
  );
}

function ConfirmDialogPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open confirm dialog
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Publish tenant?"
        description="Publishing will expose the tenant to all connected operators."
        variant="warning"
        confirmLabel="Publish"
      />
    </Stack>
  );
}

function OverlayModalPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open overlay modal
      </Button>
      <OverlayModal
        open={open}
        onClose={() => setOpen(false)}
        title="Advanced overlay"
        description="Portal-driven modal primitive used by higher-order layers."
        footer={
          <Flex gap={8} justify="end">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Continue
            </Button>
          </Flex>
        }
      >
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          This slug now opens the lower-level overlay modal exported by the DS.
        </Text>
      </OverlayModal>
    </Stack>
  );
}

function SheetPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Mobile actions"
        side="bottom"
      >
        <Stack spacing="sm">
          <Button variant="primary">Create task</Button>
          <Button variant="default">Duplicate workflow</Button>
        </Stack>
      </Sheet>
    </Stack>
  );
}

function TourPreview() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const compareRef = useRef<HTMLButtonElement>(null);
  const inspectRef = useRef<HTMLDivElement>(null);
  const tourId = useId();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <Flex gap={8} wrap="wrap">
        <Button
          ref={compareRef}
          id={`${tourId}-compare`}
          variant="primary"
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          Start tour
        </Button>
        <Button variant="default">Open sidebar</Button>
      </Flex>
      <SurfaceBlock style={{ width: '100%' }}>
        <Flex align="center" justify="between" gap={12}>
          <Box ref={inspectRef} id={`${tourId}-inspect`}>
            <Text size="sm" weight="semibold">
              Runtime checklist
            </Text>
            <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
              Switch engine, switch tenant, compare density.
            </Text>
          </Box>
          <Badge variant="primary">Live docs</Badge>
        </Flex>
      </SurfaceBlock>
      <Tour
        open={open}
        current={current}
        mask={false}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        steps={[
          {
            target: () => compareRef.current,
            title: 'Start comparison',
            description: 'Use the real DS tour to guide operators through the preview flow.',
            placement: 'bottom',
          },
          {
            target: () => inspectRef.current,
            title: 'Review runtime output',
            description: 'This step points at the live checklist surface.',
            placement: 'bottomRight',
          },
        ]}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Component map -- slug to rendered live example
// ---------------------------------------------------------------------------

export const COMPONENT_MAP: Record<string, ReactNode> = {
  // -- Inputs --
  'auto-complete': (
    <AutoComplete
      options={[
        { value: 'React' },
        { value: 'Vue' },
        { value: 'Angular' },
      ]}
      placeholder="Search framework..."
      style={{ width: 220 }}
    />
  ),
  'button': (
    <Flex gap={8} wrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="default">Default</Button>
      <Button variant="ghost">Ghost</Button>
    </Flex>
  ),
  'cascader': (
    <Cascader
      options={[
        {
          value: 'frontend',
          label: 'Frontend',
          children: [
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
          ],
        },
        {
          value: 'backend',
          label: 'Backend',
          children: [{ value: 'node', label: 'Node.js' }],
        },
      ]}
      placeholder="Select category..."
      style={{ width: 240 }}
    />
  ),
  'checkbox': (
    <Flex gap={16}>
      <Checkbox>Accept terms</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
    </Flex>
  ),
  'color-picker': <ColorPicker defaultValue="#0f766e" />,
  'date-picker': (
    <DatePicker placeholder="Select date" style={{ width: 200 }} />
  ),
  'form': <FormPreview />,
  'form-field': <FormFieldPreview />,
  'input': (
    <Input placeholder="Type something..." style={{ maxWidth: 280 }} />
  ),
  'input-number': (
    <InputNumber min={0} max={100} defaultValue={42} style={{ width: 140 }} />
  ),
  'mentions': (
    <Mentions
      options={[
        { value: 'daniel', label: 'Daniel' },
        { value: 'maria', label: 'Maria' },
        { value: 'carlos', label: 'Carlos' },
      ]}
      placeholder="Type @ to mention..."
      style={{ width: 280 }}
    />
  ),
  'otp-input': <OTPInput length={6} />,
  'password-input': (
    <Stack spacing="sm" style={{ width: 320 }}>
      <PasswordInput
        placeholder="Create a password"
        strengthIndicator
        strengthLevel="good"
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Real DS password field with toggle and strength treatment.
      </Text>
    </Stack>
  ),
  'radio': (
    <Flex gap={16}>
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
    </Flex>
  ),
  'select': (
    <Select
      options={[
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' },
      ]}
      placeholder="Select..."
      style={{ minWidth: 200 }}
    />
  ),
  'slider': (
    <Box style={{ width: 260 }}>
      <Slider defaultValue={50} />
    </Box>
  ),
  'switch': (
    <Flex gap={16} align="center">
      <Switch />
      <Switch defaultChecked />
    </Flex>
  ),
  'tag-input': <TagInputPreview />,
  'textarea': (
    <Textarea
      placeholder="Enter description..."
      rows={3}
      style={{ maxWidth: 320 }}
    />
  ),
  'time-picker': (
    <Stack spacing="sm" style={{ width: 240 }}>
      <TimePicker
        defaultValue="09:30:00"
        format="HH:mm"
        showSecond={false}
        placeholder="Pick a time"
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Time options come from the DS picker runtime.
      </Text>
    </Stack>
  ),
  'toggle': (
    <Toggle
      defaultChecked
      color="success"
      label="Auto-assign approvals"
      checkedLabel="ON"
      uncheckedLabel="OFF"
      description="Keep incoming reviews moving."
    />
  ),
  'transfer': (
    <Transfer
      dataSource={[
        { key: '1', title: 'Item 1' },
        { key: '2', title: 'Item 2' },
        { key: '3', title: 'Item 3' },
        { key: '4', title: 'Item 4' },
      ]}
      targetKeys={['2']}
      titles={['Source', 'Target']}
    />
  ),
  'tree-select': (
    <TreeSelect
      treeData={[
        {
          title: 'Platform',
          value: 'platform',
          children: [
            { title: 'Admin', value: 'admin' },
            { title: 'Operations', value: 'operations' },
          ],
        },
        {
          title: 'Experience',
          value: 'experience',
          children: [
            { title: 'Mobile', value: 'mobile' },
            { title: 'Desktop', value: 'desktop' },
          ],
        },
      ]}
      defaultValue="operations"
      placeholder="Choose a workspace"
      style={{ width: 260 }}
    />
  ),
  'upload': (
    <Upload action="">
      <Button>Upload file</Button>
    </Upload>
  ),
  'voice-input-button': <VoiceInputButtonPreview />,

  // -- Display --
  'avatar': (
    <Flex gap={8} align="center">
      <Avatar size="sm">DA</Avatar>
      <Avatar size="md">DA</Avatar>
      <Avatar size="lg">DA</Avatar>
    </Flex>
  ),
  'badge': (
    <Flex gap={8} wrap="wrap">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
    </Flex>
  ),
  'calendar': <Calendar style={{ maxWidth: 320 }} />,
  'callout': (
    <Callout
      variant="warning"
      title="Approval needed"
      action={<Button size="sm" variant="primary">Review now</Button>}
    >
      Finance overrides require a second approver before they can publish.
    </Callout>
  ),
  'card': (
    <Card title="Card title" style={{ maxWidth: 300 }}>
      <Text size="sm">
        Card content goes here. This is a basic card example.
      </Text>
    </Card>
  ),
  'carousel': (
    <Carousel style={{ maxWidth: 320, height: 120 }}>
      <Box
        style={{
          height: 120,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="md">Slide 1</Text>
      </Box>
      <Box
        style={{
          height: 120,
          background: 'var(--ds-color-primary-200, #c4b5fd)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="md">Slide 2</Text>
      </Box>
      <Box
        style={{
          height: 120,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="md">Slide 3</Text>
      </Box>
    </Carousel>
  ),
  'descriptions': (
    <Descriptions title="User info" column={1}>
      <Descriptions.Item label="Name">Daniel Avila</Descriptions.Item>
      <Descriptions.Item label="Role">Admin</Descriptions.Item>
      <Descriptions.Item label="Status">Active</Descriptions.Item>
    </Descriptions>
  ),
  'empty': <Empty description="No data available" />,
  'image': (
    <Image
      width={120}
      height={80}
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' fill='%23dff3ef'%3E%3Crect width='120' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%230f766e' font-size='14'%3EImage%3C/text%3E%3C/svg%3E"
      alt="Sample"
    />
  ),
  'kbd': (
    <Flex gap={8} align="center" wrap="wrap">
      <Kbd>Cmd</Kbd>
      <Kbd>K</Kbd>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Open command bar
      </Text>
    </Flex>
  ),
  'list': (
    <List
      dataSource={['Item One', 'Item Two', 'Item Three'] as string[]}
      renderItem={(item) => <List.Item>{item as ReactNode}</List.Item>}
      style={{ maxWidth: 280 }}
    />
  ),
  'qr-code': <QRCode value="https://rottay.com" size={120} />,
  'statistic': (
    <Flex gap={24}>
      <Statistic title="Active users" value={1128} />
      <Statistic title="Revenue" value={93.28} prefix="$" precision={2} />
    </Flex>
  ),
  'table': <TablePreview />,
  'tag': (
    <Flex gap={8} wrap="wrap">
      <Tag>Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
    </Flex>
  ),
  'timeline': (
    <Timeline
      items={[
        { children: 'Create project' },
        { children: 'Design system setup' },
        { children: 'Deploy to production' },
      ]}
    />
  ),
  'tooltip': (
    <Tooltip content="Tooltip content">
      <Button>Hover me</Button>
    </Tooltip>
  ),
  'tree': (
    <Tree
      treeData={[
        {
          title: 'Parent node',
          key: '0',
          children: [
            { title: 'Child 1', key: '0-0' },
            { title: 'Child 2', key: '0-1' },
          ],
        },
        {
          title: 'Another parent',
          key: '1',
          children: [{ title: 'Child 3', key: '1-0' }],
        },
      ]}
      defaultExpandAll
    />
  ),
  'typography': (
    <Stack spacing="sm">
      <Text size="xl" weight="bold">
        Heading text
      </Text>
      <Text size="md">Body text with regular weight.</Text>
      <Text
        size="sm"
        style={{ color: 'var(--ds-color-text-muted)' }}
      >
        Muted helper text.
      </Text>
    </Stack>
  ),

  // -- Layout --
  'aspect-ratio': (
    <AspectRatio ratio={16 / 9} maxWidth={300}>
      <Box
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 18%, white) 0%, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-color-bg-container)) 100%)',
        }}
      >
        <Text size="sm" weight="semibold">
          16:9 media slot
        </Text>
      </Box>
    </AspectRatio>
  ),
  'box': (
    <Box
      style={{
        padding: 16,
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
      }}
    >
      <Text size="sm">Box content</Text>
    </Box>
  ),
  'collapse': (
    <Collapse defaultActiveKey="1" style={{ width: 320 }}>
      <Collapse.Panel header="Tenant permissions" panelKey="1">
        <Text size="sm">Role changes apply immediately across all routes.</Text>
      </Collapse.Panel>
      <Collapse.Panel header="Escalation rules" panelKey="2">
        <Text size="sm">Secondary approvers inherit workspace defaults.</Text>
      </Collapse.Panel>
    </Collapse>
  ),
  'container': (
    <Container
      maxWidth="sm"
      padding="md"
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 16,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Stack spacing="sm">
        <Text size="sm" weight="semibold">
          Centered content container
        </Text>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Width, padding, and centering come from the DS primitive.
        </Text>
      </Stack>
    </Container>
  ),
  'divider': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Text size="sm">Content above</Text>
      <Divider />
      <Text size="sm">Content below</Text>
    </Stack>
  ),
  'flex': (
    <Flex gap={8}>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">A</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">B</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">C</Text>
      </Box>
    </Flex>
  ),
  'grid': (
    <Grid columns={3} gap="sm">
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">1</Text>
      </Box>
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">2</Text>
      </Box>
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">3</Text>
      </Box>
    </Grid>
  ),
  'hide': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Hide on="desktop">
        <Badge variant="warning">This badge disappears on desktop</Badge>
      </Hide>
      <Show on="desktop">
        <Badge variant="success">Desktop keeps the alternate content visible</Badge>
      </Show>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The preview is intentionally viewport-sensitive because the primitive is.
      </Text>
    </Stack>
  ),
  'layout': (
    <Layout
      hasSider
      style={{
        width: 360,
        minHeight: 188,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border)',
      }}
    >
      <Layout.Sider
        width={92}
        style={{
          padding: 16,
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        <Stack spacing="sm">
          <Text size="xs" weight="semibold">
            Sider
          </Text>
          <Text size="xs">Nav</Text>
          <Text size="xs">Queues</Text>
        </Stack>
      </Layout.Sider>
      <Layout>
        <Layout.Header
          height={52}
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="sm" weight="semibold">
            Header
          </Text>
        </Layout.Header>
        <Layout.Content
          style={{
            padding: 16,
            background: 'var(--ds-color-bg-primary)',
          }}
        >
          <Text size="sm">Content panel</Text>
        </Layout.Content>
        <Layout.Footer
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Footer
          </Text>
        </Layout.Footer>
      </Layout>
    </Layout>
  ),
  'responsive-slot': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <ResponsiveSlot
        phone={<Badge variant="warning">Phone slot</Badge>}
        tablet={<Badge variant="secondary">Tablet slot</Badge>}
        desktop={<Badge variant="success">Desktop slot</Badge>}
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The rendered node changes with the current viewport breakpoint.
      </Text>
    </Stack>
  ),
  'scroll-area': (
    <ScrollArea maxHeight={152} style={{ width: 320, paddingRight: 6 }}>
      <Stack spacing="sm">
        {Array.from({ length: 7 }).map((_, index) => (
          <SurfaceBlock key={index}>
            <Text size="sm">Scrollable card {index + 1}</Text>
          </SurfaceBlock>
        ))}
      </Stack>
    </ScrollArea>
  ),
  'show': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Show on="desktop">
        <Badge variant="success">Desktop content visible</Badge>
      </Show>
      <Show below="tablet">
        <Badge variant="warning">Phone and tablet content visible</Badge>
      </Show>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Resize the viewport to verify the breakpoint contract.
      </Text>
    </Stack>
  ),
  'space': (
    <Space size="middle" wrap>
      <Button size="sm" variant="default">Approve</Button>
      <Button size="sm" variant="primary">Publish</Button>
      <Button size="sm" variant="ghost">Archive</Button>
    </Space>
  ),
  'splitter': (
    <Splitter
      layout="horizontal"
      style={{
        width: 340,
        height: 172,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--ds-color-border)',
      }}
    >
      <Splitter.Panel defaultSize={34} min={96}>
        <Box
          style={{
            height: '100%',
            padding: 14,
            background: 'var(--ds-color-bg-secondary)',
          }}
        >
          <Text size="sm" weight="semibold">
            Filters
          </Text>
        </Box>
      </Splitter.Panel>
      <Splitter.Panel defaultSize={66}>
        <Box
          style={{
            height: '100%',
            padding: 14,
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="sm" weight="semibold">
            Results
          </Text>
        </Box>
      </Splitter.Panel>
    </Splitter>
  ),
  'stack': (
    <Stack spacing="sm">
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 1</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 2</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 3</Text>
      </Box>
    </Stack>
  ),

  // -- Feedback --
  'alert': (
    <Stack spacing="sm" style={{ maxWidth: 400 }}>
      <Alert type="info" message="Info alert" />
      <Alert type="success" message="Success alert" />
      <Alert type="warning" message="Warning alert" />
      <Alert type="error" message="Error alert" />
    </Stack>
  ),
  'drawer': <DrawerPreview />,
  'message': <MessagePreview />,
  'modal': <FeedbackModalPreview />,
  'notification': <NotificationPreview />,
  'progress': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Progress percent={65} />
      <Progress percent={100} />
    </Stack>
  ),
  'rate': <Rate defaultValue={3} />,
  'result': (
    <Result
      status="success"
      title="Operation successful"
      subTitle="Your request has been processed."
    />
  ),
  'skeleton': <Skeleton active style={{ width: 260 }} />,
  'spinner': (
    <Flex gap={16} align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Flex>
  ),
  'toast': <ToastPreview />,

  // -- Navigation --
  'affix': (
    <Affix offsetTop={0}>
      <Button variant="default">Affixed button</Button>
    </Affix>
  ),
  'anchor': (
    <Anchor affix={false}>
      <Anchor.Link href="#section-1" title="Section 1" />
      <Anchor.Link href="#section-2" title="Section 2" />
      <Anchor.Link href="#section-3" title="Section 3" />
    </Anchor>
  ),
  'back-top': <BackTopPreview />,
  'breadcrumb': (
    <Breadcrumb
      items={[
        { key: 'home', label: 'Home' },
        { key: 'category', label: 'Category' },
        { key: 'current', label: 'Current' },
      ]}
    />
  ),
  'float-button': <FloatButtonPreview />,
  'link': (
    <Flex gap={12} wrap="wrap" align="center">
      <NavLink href="/primitives" type="primary">
        Tenant overview
      </NavLink>
      <NavLink href="https://rottay.com" external>
        External docs
      </NavLink>
      <NavLink href="/restricted" disabled>
        Disabled state
      </NavLink>
    </Flex>
  ),
  'menu': (
    <Menu
      mode="vertical"
      items={[
        { key: 'home', label: 'Home' },
        { key: 'settings', label: 'Settings' },
        { key: 'profile', label: 'Profile' },
      ]}
      style={{ width: 200 }}
    />
  ),
  'pagination': <Pagination total={100} pageSize={10} current={1} />,
  'segmented': (
    <Segmented
      options={['Daily', 'Weekly', 'Monthly']}
      defaultValue="Weekly"
    />
  ),
  'stepper': <StepperPreview />,
  'steps': (
    <Steps
      current={1}
      items={[
        { title: 'Setup' },
        { title: 'Configure' },
        { title: 'Deploy' },
      ]}
    />
  ),
  'tabs': (
    <Tabs
      items={[
        { key: '1', label: 'Tab 1', children: <Text size="sm">Content 1</Text> },
        { key: '2', label: 'Tab 2', children: <Text size="sm">Content 2</Text> },
        { key: '3', label: 'Tab 3', children: <Text size="sm">Content 3</Text> },
      ]}
    />
  ),

  // -- Overlay --
  'alert-dialog': <AlertDialogPreview />,
  'confirm-dialog': <ConfirmDialogPreview />,
  'context-menu': (
    <Stack spacing="sm" style={{ width: 320 }}>
      <ContextMenu
        items={[
          { key: 'edit', label: 'Edit draft' },
          { key: 'duplicate', label: 'Duplicate workflow' },
          { key: 'divider', type: 'divider', label: '' },
          { key: 'delete', label: 'Delete', danger: true },
        ]}
        trigger={
          <SurfaceBlock>
            <Text size="sm" weight="semibold">
              Right-click this block
            </Text>
            <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
              The menu itself is the DS primitive.
            </Text>
          </SurfaceBlock>
        }
      />
    </Stack>
  ),
  'dropdown': (
    <Dropdown
      menu={{
        items: [
          { key: '1', label: 'Option 1' },
          { key: '2', label: 'Option 2' },
          { key: '3', label: 'Option 3' },
        ],
      }}
    >
      <Button>Click menu</Button>
    </Dropdown>
  ),
  'hover-card': (
    <HoverCard
      trigger={<Button variant="default">Hover user card</Button>}
      content={
        <Stack spacing="xs" style={{ maxWidth: 220 }}>
          <Text size="sm" weight="semibold">
            Daniel Avila
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Platform owner reviewing runtime parity across engines.
          </Text>
        </Stack>
      }
    />
  ),
  'overlay-modal': <OverlayModalPreview />,
  'popover': (
    <Popover
      content={<Text size="sm">Popover content here</Text>}
      title="Title"
    >
      <Button>Hover for popover</Button>
    </Popover>
  ),
  'popconfirm': (
    <Popconfirm title="Are you sure?" onConfirm={() => undefined}>
      <Button variant="default">Delete item</Button>
    </Popconfirm>
  ),
  'sheet': <SheetPreview />,
  'tour': <TourPreview />,
  'watermark': (
    <Watermark content="Rottay">
      <Box style={{ height: 100, width: 240 }} />
    </Watermark>
  ),
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface LivePreviewProps {
  slug: string;
}

const CATEGORY_META: Record<
  PrimitiveCategory,
  { label: string; note: string; minHeight: number }
> = {
  display: {
    label: 'Display',
    note: 'Check readability, fallback handling, and how much meaning survives with almost no supporting chrome.',
    minHeight: 180,
  },
  inputs: {
    label: 'Input',
    note: 'Check focus, affordance, and whether the control still feels trustworthy when styling shifts.',
    minHeight: 190,
  },
  feedback: {
    label: 'Feedback',
    note: 'Check urgency, motion, and clarity of what the system is telling the user to do next.',
    minHeight: 180,
  },
  layout: {
    label: 'Layout',
    note: 'Check rhythm, spacing, and whether the component creates obvious structure rather than empty scaffolding.',
    minHeight: 190,
  },
  navigation: {
    label: 'Navigation',
    note: 'Check orientation, active state clarity, and how quickly the interaction teaches itself.',
    minHeight: 190,
  },
  overlay: {
    label: 'Overlay',
    note: 'Check anchoring, exit paths, and how gently the layer interrupts the base interface.',
    minHeight: 190,
  },
};

const CATEGORY_ACCENTS: Record<PrimitiveCategory, string> = {
  display: '#60a5fa',
  inputs: '#34d399',
  feedback: '#f59e0b',
  layout: '#a78bfa',
  navigation: '#f472b6',
  overlay: '#f97316',
};

export function LivePreview({ slug }: LivePreviewProps) {
  const entry = primitives.find((primitive) => primitive.slug === slug);
  const hasFixture = Object.prototype.hasOwnProperty.call(COMPONENT_MAP, slug);
  const preview = hasFixture
    ? COMPONENT_MAP[slug]
    : entry
      ? <AdapterPendingPreview entry={entry} />
      : null;
  const meta = entry ? CATEGORY_META[entry.category] : null;

  if (!preview) {
    return (
      <Box
        style={{
          minHeight: 180,
          padding: 20,
          borderRadius: 20,
          border: `1px dashed ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Stack spacing="sm" align="center" style={{ textAlign: 'center' }}>
          <Text
            size="sm"
            weight="semibold"
            style={{ color: SHOWROOM_SURFACES.text }}
          >
            Preview coming soon
          </Text>
          <Text
            size="xs"
            style={{ color: SHOWROOM_SURFACES.textSecondary }}
          >
            No live example was found for <strong>{slug}</strong>, but the
            detail page still documents how to evaluate and compose it.
          </Text>
        </Stack>
      </Box>
    );
  }

  const accent = entry
    ? CATEGORY_ACCENTS[entry.category]
    : 'var(--ds-color-primary, #60a5fa)';
  const isFlagship = Boolean(getFlagshipSpec(slug));

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithCanvas(
          accent,
          10,
        )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Stack spacing="sm" style={{ height: '100%' }}>
        <Box
          style={{
            paddingBottom: 10,
            borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={10}
            style={{ minWidth: 0, minHeight: 44 }}
          >
            <Box style={{ minWidth: 0, flex: 1 }}>
              {meta ? (
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-geist-sans)',
                  }}
                >
                  {meta.label}
                </Text>
              ) : null}
              {entry ? (
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    display: 'block',
                    marginTop: 4,
                    color: SHOWROOM_SURFACES.text,
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-geist-sans)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {entry.name}
                </Text>
              ) : null}
            </Box>

            <Box
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                borderRadius: 999,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: SHOWROOM_SURFACES.surface,
                maxWidth: '52%',
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-geist-sans)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {entry ? `${entry.engines.length} live engines` : 'Live preview'}
              </Text>
            </Box>
          </Flex>
        </Box>

        <Flex
          style={{
            flex: 1,
            minHeight: 0,
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}
        >
          <Box
            style={{
              width: '100%',
              minWidth: 0,
              minHeight: 0,
              padding: 14,
              borderRadius: 18,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
                accent,
                8,
                SHOWROOM_SURFACES.surface,
              )} 100%)`,
              boxShadow: `inset 0 1px 0 ${mixWithSurface(
                accent,
                14,
                'transparent',
              )}`,
              display: 'grid',
              gridTemplateRows: 'auto minmax(0, 1fr)',
            }}
          >
            <Flex
              align="center"
              justify="between"
              gap={8}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                flexWrap: 'wrap',
              }}
            >
              <Flex gap={6}>
                {['12%', '20%', '28%'].map((opacity, index) => (
                  <Box
                    key={`${slug}-${index}`}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: `color-mix(in srgb, ${accent} ${opacity}, ${SHOWROOM_SURFACES.text})`,
                    }}
                  />
                ))}
              </Flex>
              <Text
                size="xs"
                style={{ display: 'block', color: SHOWROOM_SURFACES.textSecondary }}
              >
                Live DS output
              </Text>
            </Flex>
            <Box
              style={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
                minHeight: 0,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                overflowX: 'auto',
                overflowY: 'auto',
              }}
            >
              {preview}
            </Box>
          </Box>
        </Flex>

        <Box
          style={{
            padding: 12,
            borderRadius: 16,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
              accent,
              7,
            )} 100%)`,
          }}
        >
          <Text
            size="xs"
            weight="semibold"
            style={{
              display: 'block',
              marginBottom: 8,
              color: SHOWROOM_SURFACES.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {isFlagship ? 'Variant + state gallery' : 'Runtime fingerprint'}
          </Text>
          <Divider />
          <Box style={{ marginTop: 10 }}>
            {isFlagship ? (
              <StateGallery slug={slug} />
            ) : (
              <RuntimeFingerprint compact compactColumns={2} itemLimit={6} showHeader={false} />
            )}
          </Box>
        </Box>

        {meta ? (
          <Box
            style={{
              padding: '10px 12px',
              borderRadius: 16,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: SHOWROOM_SURFACES.subtle,
              minHeight: 72,
            }}
          >
            <Flex align="start" gap={10} style={{ minWidth: 0 }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  minWidth: 44,
                  marginTop: 1,
                }}
              >
                Note
              </Text>
              <Box
                style={{
                  minWidth: 0,
                  maxHeight: 52,
                  overflow: 'auto',
                }}
              >
                <Text size="xs" style={{ color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45 }}>
                  {meta.note}
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
