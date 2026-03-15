'use client';

import React from 'react';

import { Box, Card, Stack, Text, Tag } from '../../primitives';
import type {
  AssistantDeliveryStatus,
  AssistantMessagePart,
  AssistantMessageRole,
  AssistantStatusBadgeProps,
  MessageBubbleProps,
  StreamingTextProps,
  ToolCallCardProps,
  TypingIndicatorProps,
} from './types';

export type {
  AssistantMessageRole,
  AssistantDeliveryStatus,
  AssistantToolStatus,
  AssistantMessagePart,
  AssistantStatusBadgeProps,
  StreamingTextProps,
  TypingIndicatorProps,
  ToolCallCardProps,
  MessageBubbleProps,
} from './types';

function toneToVariant(
  tone: AssistantStatusBadgeProps['tone']
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'error';
    case 'info':
      return 'primary';
    default:
      return 'default';
  }
}

function deliveryStatusToTone(
  deliveryStatus: AssistantDeliveryStatus | undefined
): AssistantStatusBadgeProps['tone'] {
  switch (deliveryStatus) {
    case 'sent':
      return 'success';
    case 'sending':
    case 'streaming':
      return 'info';
    case 'error':
      return 'danger';
    default:
      return 'neutral';
  }
}

function roleLabel(role: AssistantMessageRole | undefined): string | null {
  switch (role) {
    case 'assistant':
      return 'Assistant';
    case 'user':
      return 'User';
    case 'system':
      return 'System';
    case 'tool':
      return 'Tool';
    default:
      return null;
  }
}

export function AssistantStatusBadge({
  label,
  tone = 'neutral',
}: AssistantStatusBadgeProps): React.ReactElement {
  return (
    <Tag variant={toneToVariant(tone)} outlined size="sm">
      {label}
    </Tag>
  );
}

export function StreamingText({
  text,
  streaming = false,
  as = 'text',
}: StreamingTextProps): React.ReactElement {
  return (
    <Box>
      <Text
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: as === 'markdown' ? 'var(--ds-font-family-mono, inherit)' : undefined,
        }}
      >
        {text}
      </Text>
      {streaming ? (
        <Text
          aria-hidden="true"
          style={{
            marginLeft: 4,
            display: 'inline-block',
            color: 'var(--ds-color-primary-500)',
            animation: 'ds-assistant-caret 1s steps(2, jump-none) infinite',
          }}
        >
          |
        </Text>
      ) : null}
    </Box>
  );
}

export function TypingIndicator({
  label = 'Assistant is typing',
}: TypingIndicatorProps): React.ReactElement {
  return (
    <Box
      role="status"
      aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <style>{`@keyframes ds-assistant-dot { 0%, 80%, 100% { opacity: .35; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } } @keyframes ds-assistant-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }`}</style>
      <Box aria-hidden="true" style={{ display: 'inline-flex', gap: 4 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ds-color-primary-500)',
              animation: `ds-assistant-dot 1.1s ease-in-out ${index * 0.12}s infinite`,
            }}
          />
        ))}
      </Box>
      <Text color="muted">{label}</Text>
    </Box>
  );
}

export function ToolCallCard({
  name,
  status,
  summary,
  input,
  output,
  meta,
}: ToolCallCardProps): React.ReactElement {
  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text style={{ fontWeight: 700 }}>{name}</Text>
            <AssistantStatusBadge
              label={status}
              tone={
                status === 'complete'
                  ? 'success'
                  : status === 'error'
                    ? 'danger'
                    : status === 'running'
                      ? 'info'
                      : 'warning'
              }
            />
          </Stack>
          {summary ? <Box>{summary}</Box> : null}
          {input ? (
            <Box>
              <Text size="sm" color="muted">
                Input
              </Text>
              <Box>{input}</Box>
            </Box>
          ) : null}
          {output ? (
            <Box>
              <Text size="sm" color="muted">
                Output
              </Text>
              <Box>{output}</Box>
            </Box>
          ) : null}
          {meta ? <Box>{meta}</Box> : null}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function renderDefaultPart(part: AssistantMessagePart, index: number): React.ReactNode {
  switch (part.type) {
    case 'text':
      return <StreamingText key={`part-${index}`} text={part.content} streaming={part.streaming} />;
    case 'markdown':
      return (
        <StreamingText
          key={`part-${index}`}
          text={part.content}
          streaming={part.streaming}
          as="markdown"
        />
      );
    case 'tool-status':
      return (
        <ToolCallCard
          key={`part-${index}`}
          name={part.name}
          status={part.status}
          summary={part.summary}
          input={part.input}
          output={part.output}
          meta={part.meta}
        />
      );
    case 'artifact':
      return (
        <Card key={`part-${index}`} variant="filled">
          <Card.Body>
            <Stack spacing="sm">
              {part.title ? <Text style={{ fontWeight: 700 }}>{part.title}</Text> : null}
              <Box>{part.content}</Box>
              {part.meta ? <Box>{part.meta}</Box> : null}
            </Stack>
          </Card.Body>
        </Card>
      );
    case 'attachments':
      return <Box key={`part-${index}`}>{part.content}</Box>;
    default:
      return null;
  }
}

export function MessageBubble({
  author,
  parts,
  avatar,
  timestamp,
  meta,
  status,
  align = 'start',
  role,
  deliveryStatus,
  renderPart,
}: MessageBubbleProps): React.ReactElement {
  const alignEnd = align === 'end';
  const roleText = roleLabel(role);

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: alignEnd ? 'flex-end' : 'flex-start',
      }}
    >
      <Card
        variant={alignEnd ? 'filled' : 'outlined'}
        style={{ maxWidth: '80%', width: 'fit-content' }}
      >
        <Card.Body>
          <Stack spacing="sm">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Stack direction="horizontal" spacing="sm" align="center">
                {avatar ? <Box>{avatar}</Box> : null}
                <Stack spacing="xs">
                  <Text style={{ fontWeight: 700 }}>{author}</Text>
                  {roleText ? (
                    <Text size="sm" color="muted">
                      {roleText}
                    </Text>
                  ) : null}
                </Stack>
              </Stack>
              {deliveryStatus ? (
                <AssistantStatusBadge
                  label={deliveryStatus}
                  tone={deliveryStatusToTone(deliveryStatus)}
                />
              ) : null}
            </Stack>
            <Stack spacing="sm">
              {parts.map((part, index) => (
                <React.Fragment key={`${part.type}-${index}`}>
                  {renderPart ? renderPart(part, index) : renderDefaultPart(part, index)}
                </React.Fragment>
              ))}
            </Stack>
            {timestamp || status || meta ? (
              <Stack spacing="xs">
                {timestamp ? (
                  <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
                    {timestamp}
                  </Text>
                ) : null}
                {status ? <Box>{status}</Box> : null}
                {meta ? <Box>{meta}</Box> : null}
              </Stack>
            ) : null}
          </Stack>
        </Card.Body>
      </Card>
    </Box>
  );
}
