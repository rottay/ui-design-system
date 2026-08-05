'use client';

import {
  AssistantStatusBadge,
  AssistantStatusIndicator,
  Box,
  ConfirmActionCard,
  LiveCursor,
  MessageBubble,
  PatternActivityLog,
  PatternCommentThread,
  PatternLiveFeed,
  PatternNotificationCenter,
  PresenceBar,
  PresenceTypingIndicator,
  PreviewDiffCard,
  Stack,
  StreamingText,
  Text,
  ToolCallCard,
  TypingIndicator,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-F -- patterns/communication family torture section
// (?communication=1). Six components: the four engine-split patterns
// (comment-thread, notification-center, activity-log, live-feed) plus
// assistant's 8 exports and presence's 3 exports (both engine-agnostic).
//
// Fixture data is chosen to hit every stamped state attribute at least once:
// comment-thread's reaction pill (active + inactive) and a nested reply;
// notification-center's 4 types are not all exercised (2 shown is enough to
// prove data-type renders per row) plus one read + one unread row and one
// action button; activity-log's three classifier categories (create/update/
// delete) plus a diff and both avatar branches (image + fallback initial);
// live-feed's refresh/banner/load-more; assistant's AssistantStatusIndicator
// across all 5 statuses and PreviewDiffCard's 3 change values; presence's
// PresenceBar overflow badge and a LiveCursor in its own relative band.
// ---------------------------------------------------------------------------

const COMM_COMMENTS = [
  {
    id: 'cm-1',
    author: { name: 'Priya Shah' },
    content: 'Can we ship this by Friday?',
    timestamp: '2h ago',
    edited: true,
    reactions: [
      { emoji: '👍', count: 4, active: true },
      { emoji: '👀', count: 1, active: false },
    ],
    replies: [
      {
        id: 'cm-1-r1',
        author: { name: 'Dev Costa' },
        content: 'Yes, on track.',
        timestamp: '1h ago',
      },
    ],
  },
];

const COMM_NOTIFICATIONS = [
  {
    id: 'cn-1',
    title: 'Deployment succeeded',
    message: 'v2.4 is live on production',
    type: 'success' as const,
    read: false,
    timestamp: '5m ago',
    action: { label: 'View', onClick: () => undefined },
  },
  {
    id: 'cn-2',
    title: 'License expiring soon',
    message: 'Renew within 14 days',
    type: 'warning' as const,
    read: true,
    timestamp: '1d ago',
  },
];

const COMM_ACTIVITIES = [
  {
    id: 'ca-1',
    user: { name: 'Priya Shah' },
    action: 'created record',
    timestamp: new Date().toISOString(),
    entityType: 'order',
    entityId: '881',
  },
  {
    id: 'ca-2',
    user: { name: 'Dev Costa', avatar: 'https://i.pravatar.cc/48?img=12' },
    action: 'updated record',
    timestamp: new Date().toISOString(),
    diff: { status: { from: 'draft', to: 'active' } },
  },
  {
    id: 'ca-3',
    user: { name: 'Ana Ruiz' },
    action: 'deleted record',
    timestamp: new Date().toISOString(),
  },
];

interface CommFeedItem {
  key: string;
  isNew?: boolean;
  label: string;
  [extra: string]: unknown;
}

const COMM_FEED_ITEMS: CommFeedItem[] = [
  { key: 'cf-1', isNew: true, label: 'New signup: Dev Costa' },
  { key: 'cf-2', label: 'Report exported' },
];

const COMM_DIFF_ROWS = [
  {
    label: 'name',
    before: 'Q1 Draft',
    after: 'Q1 Final',
    change: 'updated' as const,
  },
  { label: 'owner', after: 'Priya Shah', change: 'added' as const },
  { label: 'legacy_id', before: 'ORD-881', change: 'removed' as const },
];

const COMM_STATUSES = ['thinking', 'streaming', 'acting', 'error', 'idle'] as const;

export function CommunicationFbStates() {
  return (
    <Box
      data-testid="probe-communication"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-communication-comment-thread">
          <PatternCommentThread
            comments={COMM_COMMENTS}
            currentUser={{ name: 'Priya Shah' }}
            onAdd={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            onReply={() => undefined}
            onReaction={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-notification-center">
          <PatternNotificationCenter
            notifications={COMM_NOTIFICATIONS}
            unreadCount={1}
            open
            onRead={() => undefined}
            onReadAll={() => undefined}
            onClear={() => undefined}
            onClearAll={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-activity-log">
          <PatternActivityLog
            activities={COMM_ACTIVITIES}
            actionTypes={['created', 'updated', 'deleted']}
            users={[{ name: 'Priya Shah' }, { name: 'Dev Costa' }]}
            onFilterChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-live-feed">
          <PatternLiveFeed
            items={COMM_FEED_ITEMS}
            renderItem={(item) => <Text size="sm">{(item as CommFeedItem).label}</Text>}
            onRefresh={() => undefined}
            header={<Text weight="semibold">Live activity</Text>}
            newItemsCount={2}
            onShowNewItems={() => undefined}
            hasMore
            onLoadMore={() => undefined}
          />
        </Stack>

        <Stack spacing="sm" data-testid="probe-communication-assistant">
          <Text size="xs" color="secondary">
            assistant -- 8 exports
          </Text>
          <Stack direction="horizontal" spacing="sm" align="center">
            <AssistantStatusBadge label="Streaming" tone="info" />
            <StreamingText text="Drafting a response..." streaming />
            <TypingIndicator />
          </Stack>
          <ToolCallCard name="search_records" status="complete" duration="0.8s" summary="3 matches" />
          <Stack direction="horizontal" spacing="sm" align="center">
            {COMM_STATUSES.map((status) => (
              <AssistantStatusIndicator key={status} status={status} />
            ))}
          </Stack>
          <PreviewDiffCard title="Proposed change" rows={COMM_DIFF_ROWS} />
          <ConfirmActionCard
            summary="Apply this change to the live record?"
            onConfirm={() => undefined}
            onCancel={() => undefined}
          />
          <MessageBubble
            author="Priya Shah"
            parts={[{ type: 'text', content: 'Looks good to me.' }]}
            timestamp="2m ago"
            align="end"
          />
        </Stack>

        <Stack spacing="sm" data-testid="probe-communication-presence">
          <Text size="xs" color="secondary">
            presence -- 3 exports
          </Text>
          <PresenceBar
            users={[
              {
                id: 'pu-1',
                name: 'Priya Shah',
                avatar: 'https://i.pravatar.cc/48?img=12',
                color: '#e74c3c',
              },
              { id: 'pu-2', name: 'Dev Costa', color: '#3498db' },
              { id: 'pu-3', name: 'Ana Ruiz', color: '#2ecc71' },
              { id: 'pu-4', name: 'Sam Lee', color: '#9b59b6' },
            ]}
            maxVisible={2}
          />
          <PresenceTypingIndicator users={[{ name: 'Priya Shah' }, { name: 'Dev Costa' }]} />
          <Box
            style={{
              position: 'relative',
              height: 100,
              borderRadius: 8,
              border: '1px dashed var(--ds-color-border)',
            }}
          >
            <LiveCursor user={{ name: 'Priya Shah', color: '#e74c3c' }} position={{ x: 40, y: 30 }} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
