'use client';

import {
  Avatar,
  Box,
  Button,
  Calendar,
  Callout,
  Descriptions,
  Heading,
  Link,
  List,
  Paragraph,
  Stack,
  Statistic,
  Text,
  Timeline,
  Tooltip,
  Tree,
  type TreeDataNode,
} from '@rottay/design-system';

const COUNTDOWN_TARGET = Date.now() + 3_600_000;

// Fixed fixtures for the WO-SKIN-05 checkpoint D2 data-display data-part
// probe (Tree, Calendar, List, Timeline, Descriptions, Statistic, Typography,
// Tooltip, Callout). Every instance below is deterministic: forced
// selected/expanded/disabled props and a controlled Calendar `value` distinct
// from the pinned recording day. Calendar's own "today" ring is compiled from
// a real `new Date()` inside the component with no override prop -- the e2e
// spec freezes the browser clock via `page.clock.setFixedTime` before
// navigating (same recipe as WO-SKIN-02's DatePicker pin) so the ring does
// not silently move day to day. Tooltip stays closed at rest (matching every
// other floating component's rest posture) and is opened by the spec's own
// hover interaction pin, not by this fixture. Rendered only behind
// `?display2=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// Two checkpoint-anticipated states have no corresponding prop in source
// today (WO-SKIN-05 D2 pre-step finding, code over inventory): List.Item has
// no `selected`/`clickable` prop, and Calendar renders no outside-month
// cells (only true blanks before day 1, never adjacent-month dates) -- both
// rows below demonstrate the states that DO exist rather than inventing new
// component API.
const DISPLAY2_TREE_DATA: TreeDataNode[] = [
  {
    key: 'documents',
    title: 'Documents',
    children: [
      { key: 'selected-file', title: 'Selected file' },
      { key: 'disabled-file', title: 'Disabled file', disabled: true },
      { key: 'leaf-file', title: 'Plain file', isLeaf: true },
    ],
  },
  { key: 'archive', title: 'Archive', isLeaf: true },
];

export function Display2States() {
  return (
    <Box
      data-testid="probe-display2"
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
        <Stack spacing="xs" data-testid="probe-display2-tree">
          <Text size="xs" color="secondary">
            Tree (selected / expanded / disabled / checkable)
          </Text>
          <Tree
            treeData={DISPLAY2_TREE_DATA}
            defaultExpandedKeys={['documents']}
            defaultSelectedKeys={['selected-file']}
            checkable
            showLine
            onSelect={() => undefined}
            onExpand={() => undefined}
            onCheck={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-calendar">
          <Text size="xs" color="secondary">
            Calendar (selected != today, disabled Sundays)
          </Text>
          <Calendar
            value={new Date(2026, 6, 8)}
            disabledDate={(date) => date.getDay() === 0}
            fullscreen={false}
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-list">
          <Text size="xs" color="secondary">
            List (bordered, header/footer, split)
          </Text>
          <List
            header="Team members"
            footer="3 members"
            bordered
            dataSource={['Ada Lovelace', 'Alan Turing', 'Grace Hopper']}
            renderItem={(item) => {
              const name = String(item);
              return (
                <List.Item
                  key={name}
                  actions={[
                    <Button key="edit" size="xs">
                      Edit
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="sm"
                        name={name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      />
                    }
                    title={name}
                    description="Member"
                  />
                </List.Item>
              );
            }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-timeline">
          <Text size="xs" color="secondary">
            Timeline (tones + pending)
          </Text>
          <Timeline pending="Recording...">
            <Timeline.Item color="success" label="09:00">
              Order placed
            </Timeline.Item>
            <Timeline.Item color="warning" label="09:15">
              Payment pending
            </Timeline.Item>
            <Timeline.Item color="error" label="09:30">
              Payment failed
            </Timeline.Item>
          </Timeline>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-descriptions">
          <Text size="xs" color="secondary">
            Descriptions (bordered, horizontal, spanning cell)
          </Text>
          <Descriptions title="Order #1029" bordered column={2}>
            <Descriptions.Item label="Status">Shipped</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>
              $128.00
            </Descriptions.Item>
          </Descriptions>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-statistic">
          <Text size="xs" color="secondary">
            Statistic + Countdown (trend variants, loading)
          </Text>
          <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Statistic title="Revenue" value={128000} prefix="$" valueType="positive" />
            <Statistic title="Errors" value={12} valueType="negative" />
            <Statistic title="Loading" value={0} loading />
            <Statistic.Countdown title="Sale ends" value={COUNTDOWN_TARGET} valueType="warning" />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-typography">
          <Text size="xs" color="secondary">
            Typography (Heading / Text / Paragraph / Link)
          </Text>
          <Stack spacing="xs">
            <Heading level="h3" color="primary">
              Section heading
            </Heading>
            <Text color="muted">Muted inline text</Text>
            <Paragraph color="secondary">A short paragraph of body copy for size comparison.</Paragraph>
            <Link href="/display2-link" color="primary">
              Learn more
            </Link>
          </Stack>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-tooltip">
          <Text size="xs" color="secondary">
            Tooltip (closed at rest; hover to open)
          </Text>
          <Box style={{ paddingTop: 32, paddingBottom: 16 }}>
            <Tooltip content="Pinned tooltip content" placement="top">
              <Button data-testid="probe-display2-tooltip-trigger" size="xs">
                Hover me
              </Button>
            </Tooltip>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-callout">
          <Text size="xs" color="secondary">
            Callout (tones + closable + action)
          </Text>
          <Stack spacing="xs">
            <Callout tone="info" title="Heads up" closable onClose={() => undefined}>
              Informational message.
            </Callout>
            <Callout tone="danger" title="Error" action={<Button size="xs">Retry</Button>}>
              Something failed.
            </Callout>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
