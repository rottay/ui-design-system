'use client';

import { useState } from 'react';
import {
  AssistantStatusBadge,
  AssistantStatusIndicator,
  Avatar,
  Box,
  Button,
  Card,
  ConfirmActionCard,
  Flex,
  LiveCursor,
  MessageBubble,
  PresenceBar,
  PresenceTypingIndicator,
  PreviewDiffCard,
  Stack,
  StreamingText,
  Text,
  ToolCallCard,
  TypingIndicator,
} from '@rottay/design-system';

export function AssistantPreview() {
  // Local state drives the two sighted transitions: shimmer live -> stopped,
  // and the confirm ceremony resolving to a terminal outcome.
  const [streaming, setStreaming] = useState(true);
  const [decision, setDecision] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  return (
    <Stack spacing="md" style={{ width: '100%', maxWidth: 760 }}>
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <Flex gap={8} align="center" style={{ flexWrap: 'wrap' }}>
          <Text size="sm" weight="semibold">
            Assistant kit: streaming, receipts, diff/confirm, and status
          </Text>
          <AssistantStatusBadge label="streaming" tone="info" />
        </Flex>
        <TypingIndicator label="Assistant is preparing the rollout brief" />
      </Flex>

      {/* Agent status set: thinking/streaming/acting animate; idle/error hold static. */}
      <Flex gap={16} align="center" style={{ flexWrap: 'wrap' }}>
        <AssistantStatusIndicator status="idle" />
        <AssistantStatusIndicator status="thinking" />
        <AssistantStatusIndicator status="streaming" />
        <AssistantStatusIndicator status="acting" />
        <AssistantStatusIndicator status="error" />
      </Flex>

      <MessageBubble
        author="Daniel"
        role="user"
        align="end"
        deliveryStatus="sent"
        avatar={<Avatar size="sm">D</Avatar>}
        timestamp="2 min ago"
        parts={[
          {
            type: 'text',
            content: 'Summarize the current rollout state and highlight blocked approvals.',
          },
        ]}
      />

      <MessageBubble
        author="Rottay Assistant"
        role="assistant"
        deliveryStatus="streaming"
        avatar={<Avatar size="sm">AI</Avatar>}
        timestamp="just now"
        parts={[
          {
            type: 'markdown',
            content:
              'Approvals are clear for Finance and Ops. Legal still has 2 contracts in review and one vendor exception is awaiting a decision.',
            streaming,
          },
          {
            type: 'tool-status',
            name: 'approval_audit',
            status: 'complete',
            summary: 'Checked current approval queues across tenants.',
            duration: '0.8s',
            meta: <Text size="xs">2 pending legal approvals, 1 vendor exception.</Text>,
          },
        ]}
      />

      {/* Streaming law: the shimmer runs only while live and stops on completion. */}
      <Card variant="outlined">
        <Card.Body>
          <Stack spacing="sm">
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Text size="sm" weight="semibold">
                Streaming text {streaming ? '(live)' : '(complete)'}
              </Text>
              <Button size="sm" variant="secondary" onClick={() => setStreaming((value) => !value)}>
                {streaming ? 'Complete response' : 'Restart stream'}
              </Button>
            </Flex>
            <StreamingText
              text="Drafting the rollout brief: approvals cleared for Finance and Ops, legal contracts still pending, and one vendor exception to decide."
              streaming={streaming}
            />
          </Stack>
        </Card.Body>
      </Card>

      {/* Tool call running -> terminal receipt (compact outcome + elapsed time). */}
      <ToolCallCard
        name="scan_approvals"
        status="running"
        summary="Scanning approval queues across tenants..."
        input="scope=all-tenants"
      />
      <ToolCallCard
        name="scan_approvals"
        status="complete"
        summary="Scanned approval queues across tenants."
        duration="0.9s"
        meta={<Text size="xs">Target channel: cmd+k runtime bulletin</Text>}
      />

      {/* Preview-confirm ceremony: proposed diff, then a confirm/cancel surface. */}
      <PreviewDiffCard
        title="Proposed rollout change"
        rows={[
          { label: 'Stage', before: 'Draft', after: 'Scheduled', change: 'updated' },
          { label: 'Notify channel', after: 'cmd+k runtime bulletin', change: 'added' },
          { label: 'Legal hold', before: 'On', change: 'removed' },
        ]}
      />

      {decision === 'pending' ? (
        <ConfirmActionCard
          title="Publish rollout update"
          summary="Applies the proposed change and notifies stakeholders in the cmd+k runtime bulletin."
          confirmLabel="Publish update"
          cancelLabel="Keep draft"
          onConfirm={() => setDecision('confirmed')}
          onCancel={() => setDecision('cancelled')}
        />
      ) : (
        <Flex gap={8} align="center" style={{ flexWrap: 'wrap' }}>
          <AssistantStatusBadge
            label={decision === 'confirmed' ? 'Update published' : 'Kept as draft'}
            tone={decision === 'confirmed' ? 'success' : 'neutral'}
          />
          <Button size="sm" variant="secondary" onClick={() => setDecision('pending')}>
            Reset
          </Button>
        </Flex>
      )}
    </Stack>
  );
}

export function PresencePreview() {
  return (
    <Stack spacing="md" style={{ width: '100%', maxWidth: 640 }}>
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <PresenceBar
          users={[
            { id: 'u1', name: 'Ana', color: '#2563eb' },
            { id: 'u2', name: 'Marco', color: '#14b8a6' },
            { id: 'u3', name: 'Lina', color: '#a855f7' },
          ]}
        />
        <PresenceTypingIndicator users={[{ name: 'Ana' }, { name: 'Marco' }]} />
      </Flex>

      <Box
        style={{
          position: 'relative',
          minHeight: 180,
          borderRadius: 18,
          border: '1px solid var(--ds-color-border, #e5e7eb)',
          background: 'var(--ds-color-bg-elevated, #f8fafc)',
          overflow: 'hidden',
        }}
      >
        <Box style={{ padding: 16 }}>
          <Text size="sm" weight="semibold">
            Shared editing surface
          </Text>
          <Text size="sm" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
            Presence awareness stays real-time, but the visual layer comes from the shared DS primitives.
          </Text>
        </Box>
        <LiveCursor user={{ name: 'Ana', color: '#2563eb' }} position={{ x: 160, y: 88 }} />
        <LiveCursor user={{ name: 'Marco', color: '#14b8a6' }} position={{ x: 320, y: 132 }} />
      </Box>
    </Stack>
  );
}
