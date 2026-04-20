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
  // Display
  Avatar,
  Badge,
  Card,
  Tag,
  Tooltip,
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
  // Navigation
  Tabs,
  Breadcrumb,
  Pagination,
  // Overlay
  Dropdown,
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
