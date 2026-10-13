'use client';

import type { ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Calendar,
  Card,
  Carousel,
  Descriptions,
  Empty,
  Flex,
  Image,
  Kbd,
  List,
  QRCode,
  Stack,
  Statistic,
  Table,
  Tag,
  Text,
  Timeline,
  Tooltip,
  Tree,
} from '@rottay/design-system';

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

export const DISPLAY_PREVIEWS: Record<string, ReactNode> = {
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
    <Alert
      tone="warning"
      message="Approval needed"
      description="Finance overrides require a second approver before they can publish."
      action={<Button size="sm" variant="primary">Review now</Button>}
      emphasis="subtle"
      announce="tone"
    />
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
};
