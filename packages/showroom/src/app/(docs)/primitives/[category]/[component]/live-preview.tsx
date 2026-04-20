'use client';

import {
  // Inputs
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  Textarea,
  Slider,
  AutoComplete,
  Cascader,
  ColorPicker,
  DatePicker,
  InputNumber,
  Mentions,
  OTPInput,
  Transfer,
  Upload,
  // Display
  Avatar,
  Badge,
  Card,
  Tag,
  Tooltip,
  Calendar,
  Carousel,
  Descriptions,
  Empty,
  Image,
  List,
  QRCode,
  Statistic,
  Timeline,
  Tree,
  // Layout
  Box,
  Flex,
  Stack,
  Grid,
  Divider,
  // Feedback
  Alert,
  Progress,
  Spinner,
  Skeleton,
  Rate,
  Result,
  // Navigation
  Tabs,
  Breadcrumb,
  Pagination,
  Steps,
  Menu,
  Segmented,
  Anchor,
  Affix,
  // Overlay
  Dropdown,
  Popover,
  Popconfirm,
  Watermark,
  // Typography
  Text,
} from '@rottay/design-system';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Component map -- maps slug to a rendered live example
// ---------------------------------------------------------------------------

const COMPONENT_MAP: Record<string, ReactNode> = {
  // -- Inputs --
  'button': (
    <Flex gap={8} wrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="default">Default</Button>
      <Button variant="ghost">Ghost</Button>
    </Flex>
  ),
  'input': <Input placeholder="Type something..." style={{ maxWidth: 280 }} />,
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
  'checkbox': (
    <Flex gap={16}>
      <Checkbox>Accept terms</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
    </Flex>
  ),
  'radio': (
    <Flex gap={16}>
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
    </Flex>
  ),
  'switch': (
    <Flex gap={16} align="center">
      <Switch />
      <Switch defaultChecked />
    </Flex>
  ),
  'textarea': <Textarea placeholder="Enter description..." rows={3} style={{ maxWidth: 320 }} />,
  'slider': (
    <Box style={{ width: 260 }}>
      <Slider defaultValue={50} />
    </Box>
  ),
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
          children: [
            { value: 'node', label: 'Node.js' },
          ],
        },
      ]}
      placeholder="Select category..."
      style={{ width: 240 }}
    />
  ),
  'color-picker': <ColorPicker defaultValue="#6366f1" />,
  'date-picker': <DatePicker placeholder="Select date" style={{ width: 200 }} />,
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
  'upload': (
    <Upload action="">
      <Button>Upload File</Button>
    </Upload>
  ),

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
  'card': (
    <Card title="Card Title" style={{ maxWidth: 300 }}>
      <Text size="sm">Card content goes here. This is a basic card example.</Text>
    </Card>
  ),
  'tag': (
    <Flex gap={8} wrap="wrap">
      <Tag>Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
    </Flex>
  ),
  'tooltip': (
    <Tooltip content="Tooltip content">
      <Button>Hover me</Button>
    </Tooltip>
  ),
  'typography': (
    <Stack spacing="sm">
      <Text size="xl" weight="bold">Heading Text</Text>
      <Text size="md">Body text with regular weight.</Text>
      <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>Muted helper text.</Text>
    </Stack>
  ),
  'calendar': <Calendar style={{ maxWidth: 320 }} />,
  'carousel': (
    <Carousel style={{ maxWidth: 320, height: 120 }}>
      <Box style={{ height: 120, background: 'var(--ds-color-primary-100, #e8e0ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size="md">Slide 1</Text>
      </Box>
      <Box style={{ height: 120, background: 'var(--ds-color-primary-200, #c4b5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size="md">Slide 2</Text>
      </Box>
      <Box style={{ height: 120, background: 'var(--ds-color-primary-100, #e8e0ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size="md">Slide 3</Text>
      </Box>
    </Carousel>
  ),
  'descriptions': (
    <Descriptions title="User Info" column={1}>
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
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' fill='%23e8e0ff'%3E%3Crect width='120' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236366f1' font-size='14'%3EImage%3C/text%3E%3C/svg%3E"
      alt="Sample"
    />
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
      <Statistic title="Active Users" value={1128} />
      <Statistic title="Revenue" value={93.28} prefix="$" precision={2} />
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
  'tree': (
    <Tree
      treeData={[
        {
          title: 'Parent Node',
          key: '0',
          children: [
            { title: 'Child 1', key: '0-0' },
            { title: 'Child 2', key: '0-1' },
          ],
        },
        {
          title: 'Another Parent',
          key: '1',
          children: [
            { title: 'Child 3', key: '1-0' },
          ],
        },
      ]}
      defaultExpandAll
    />
  ),

  // -- Layout --
  'box': (
    <Box style={{ padding: 16, border: '1px solid var(--ds-color-border)', borderRadius: 8 }}>
      <Text size="sm">Box content</Text>
    </Box>
  ),
  'flex': (
    <Flex gap={8}>
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">A</Text>
      </Box>
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">B</Text>
      </Box>
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">C</Text>
      </Box>
    </Flex>
  ),
  'stack': (
    <Stack spacing="sm">
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">Item 1</Text>
      </Box>
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">Item 2</Text>
      </Box>
      <Box style={{ padding: 8, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4 }}>
        <Text size="sm">Item 3</Text>
      </Box>
    </Stack>
  ),
  'grid': (
    <Grid columns={3} gap="sm">
      <Box style={{ padding: 16, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4, textAlign: 'center' }}>
        <Text size="sm">1</Text>
      </Box>
      <Box style={{ padding: 16, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4, textAlign: 'center' }}>
        <Text size="sm">2</Text>
      </Box>
      <Box style={{ padding: 16, background: 'var(--ds-color-primary-100, #e8e0ff)', borderRadius: 4, textAlign: 'center' }}>
        <Text size="sm">3</Text>
      </Box>
    </Grid>
  ),
  'divider': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Text size="sm">Content above</Text>
      <Divider />
      <Text size="sm">Content below</Text>
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
  'progress': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Progress percent={65} />
      <Progress percent={100} />
    </Stack>
  ),
  'spinner': (
    <Flex gap={16} align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Flex>
  ),
  'skeleton': <Skeleton active style={{ width: 260 }} />,
  'drawer': (
    <Button variant="primary" onClick={() => {}}>
      Open Drawer (demo)
    </Button>
  ),
  'message': (
    <Button variant="default" onClick={() => {}}>
      Show Message (demo)
    </Button>
  ),
  'notification': (
    <Button variant="default" onClick={() => {}}>
      Show Notification (demo)
    </Button>
  ),
  'rate': <Rate defaultValue={3} />,
  'result': (
    <Result
      status="success"
      title="Operation Successful"
      subTitle="Your request has been processed."
    />
  ),

  // -- Navigation --
  'tabs': (
    <Tabs
      items={[
        { key: '1', label: 'Tab 1', children: <Text size="sm">Content 1</Text> },
        { key: '2', label: 'Tab 2', children: <Text size="sm">Content 2</Text> },
        { key: '3', label: 'Tab 3', children: <Text size="sm">Content 3</Text> },
      ]}
    />
  ),
  'breadcrumb': (
    <Breadcrumb
      items={[
        { key: 'home', label: 'Home' },
        { key: 'category', label: 'Category' },
        { key: 'current', label: 'Current' },
      ]}
    />
  ),
  'pagination': <Pagination total={100} pageSize={10} current={1} />,
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
  'segmented': (
    <Segmented
      options={['Daily', 'Weekly', 'Monthly']}
      defaultValue="Weekly"
    />
  ),
  'anchor': (
    <Anchor affix={false}>
      <Anchor.Link href="#section-1" title="Section 1" />
      <Anchor.Link href="#section-2" title="Section 2" />
      <Anchor.Link href="#section-3" title="Section 3" />
    </Anchor>
  ),
  'affix': (
    <Affix offsetTop={0}>
      <Button variant="default">Affixed Button</Button>
    </Affix>
  ),

  // -- Overlay --
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
  'modal': (
    <Button variant="primary" onClick={() => {}}>
      Open Modal (demo)
    </Button>
  ),
  'popover': (
    <Popover content={<Text size="sm">Popover content here</Text>} title="Title">
      <Button>Hover for Popover</Button>
    </Popover>
  ),
  'popconfirm': (
    <Popconfirm title="Are you sure?" onConfirm={() => {}}>
      <Button variant="default">Delete Item</Button>
    </Popconfirm>
  ),
  'tour': (
    <Button variant="primary" onClick={() => {}}>
      Start Tour (demo)
    </Button>
  ),
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

export function LivePreview({ slug }: LivePreviewProps) {
  const preview = COMPONENT_MAP[slug];

  if (!preview) {
    return (
      <Flex
        direction="column"
        align="center"
        gap={8}
        style={{ padding: 24 }}
      >
        <Text
          size="sm"
          weight="semibold"
          style={{ color: 'var(--ds-color-text-muted)' }}
        >
          Preview coming soon
        </Text>
        <Text
          size="xs"
          style={{ color: 'var(--ds-color-text-muted)' }}
        >
          A live example for this component will be added in a future update.
        </Text>
      </Flex>
    );
  }

  return <>{preview}</>;
}
