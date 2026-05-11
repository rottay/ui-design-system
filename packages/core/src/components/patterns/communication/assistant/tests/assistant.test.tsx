import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  AssistantStatusBadge,
  MessageBubble,
  StreamingText,
  ToolCallCard,
  TypingIndicator,
  type AssistantMessagePart,
} from '..';
import { screen } from '@testing-library/react';

beforeAll(async () => {
  await Promise.all([
    import('../../../../primitives/layout/Box/engines/rustic'),
    import('../../../../primitives/layout/Stack/engines/rustic'),
    import('../../../../primitives/display/Card/engines/rustic'),
    import('../../../../primitives/display/Tag/engines/rustic'),
    import('../../../../primitives/display/Typography/engines/rustic'),
  ]);
});

describe('assistant patterns', () => {
  it('renders streaming text and typing indicators through the DS provider stack', async () => {
    renderSurface(
      <div>
        <StreamingText text="Draft response" streaming />
        <TypingIndicator label="Copilot is thinking" />
      </div>
    );

    expect(await screen.findByText('Draft response')).toBeInTheDocument();
    expect(await screen.findByText('Copilot is thinking')).toBeInTheDocument();
  });

  it('renders tool cards and message bubbles with typed parts', async () => {
    const parts: AssistantMessagePart[] = [
      { type: 'text', content: 'I found two matching records.' },
      {
        type: 'tool-status',
        name: 'search_events',
        status: 'complete',
        summary: 'Search completed',
        input: 'query=music festival',
        output: '2 matches',
      },
      {
        type: 'artifact',
        title: 'Suggested response',
        content: <div>We can recommend the summer festival bundle.</div>,
      },
    ];

    renderSurface(
      <div>
        <AssistantStatusBadge label="streaming" tone="info" />
        <ToolCallCard
          name="create_quote"
          status="running"
          summary="Preparing a quote"
          input="venue=outdoor"
        />
        <MessageBubble
          author="Copilot"
          role="assistant"
          deliveryStatus="streaming"
          parts={parts}
        />
      </div>
    );

    expect(await screen.findByText('I found two matching records.')).toBeInTheDocument();
    expect(screen.getAllByText('streaming')).toHaveLength(2);
    expect(screen.getByText('create_quote')).toBeInTheDocument();
    expect(screen.getByText('Preparing a quote')).toBeInTheDocument();
    expect(screen.getByText('Copilot')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('search_events')).toBeInTheDocument();
    expect(screen.getByText('Suggested response')).toBeInTheDocument();
  });

  it('covers attachment parts, default tones, and custom part renderers', async () => {
    const parts: AssistantMessagePart[] = [
      { type: 'markdown', content: '**Plan**', streaming: true },
      { type: 'attachments', content: <div>Attachment payload</div> },
    ];

    renderSurface(
      <div>
        <AssistantStatusBadge label="queued" />
        <MessageBubble
          author="Operator"
          role="tool"
          deliveryStatus="error"
          align="end"
          parts={parts}
          renderPart={(part, index) =>
            part.type === 'attachments' ? <div key={`custom-${index}`}>Rendered attachment</div> : null
          }
        />
      </div>
    );

    expect(await screen.findByText('queued')).toBeInTheDocument();
    expect(screen.getByText('Tool')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('Rendered attachment')).toBeInTheDocument();
  });

  it('covers remaining badge tones, roles, delivery states, attachment defaults, and metadata branches', async () => {
    const parts: AssistantMessagePart[] = [
      { type: 'attachments', content: <div>Attachment payload</div> },
      {
        type: 'artifact',
        title: 'Generated artifact',
        content: <div>Artifact content</div>,
        meta: <div>Artifact metadata</div>,
      },
      { type: 'unknown' as never, content: 'ignored' } as AssistantMessagePart,
    ];

    renderSurface(
      <div>
        <AssistantStatusBadge label="delivered" tone="success" />
        <AssistantStatusBadge label="queued" tone="warning" />
        <MessageBubble
          author="Requester"
          role="user"
          deliveryStatus="sent"
          timestamp="10:45"
          status={<div>Delivered cleanly</div>}
          meta={<div>Conversation metadata</div>}
          parts={parts}
        />
        <MessageBubble
          author="System agent"
          role="system"
          parts={[{ type: 'text', content: 'System notice' }]}
        />
        <MessageBubble
          author="Anonymous"
          parts={[{ type: 'markdown', content: 'No role branch' }]}
        />
      </div>
    );

    expect(await screen.findByText('delivered')).toBeInTheDocument();
    expect(screen.getByText('queued')).toBeInTheDocument();
    expect(screen.getByText('Requester')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Attachment payload')).toBeInTheDocument();
    expect(screen.getByText('Generated artifact')).toBeInTheDocument();
    expect(screen.getByText('Artifact metadata')).toBeInTheDocument();
    expect(screen.getByText('10:45')).toBeInTheDocument();
    expect(screen.getByText('Delivered cleanly')).toBeInTheDocument();
    expect(screen.getByText('Conversation metadata')).toBeInTheDocument();
    expect(screen.getByText('No role branch')).toBeInTheDocument();
  });
});
