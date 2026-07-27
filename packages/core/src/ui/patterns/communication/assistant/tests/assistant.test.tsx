import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/infrastructure/runtime/motion';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  AssistantStatusBadge,
  AssistantStatusIndicator,
  ConfirmActionCard,
  MessageBubble,
  PreviewDiffCard,
  StreamingText,
  ToolCallCard,
  TypingIndicator,
  type AssistantMessagePart,
} from '..';
import { fireEvent, screen } from '@testing-library/react';

beforeAll(async () => {
  await Promise.all([
    import('../../../../primitives/layout/Box/engines/rustic'),
    import('../../../../primitives/layout/Stack/engines/rustic'),
    import('../../../../primitives/display/Card/engines/rustic'),
    import('../../../../primitives/display/Tag/engines/rustic'),
    import('../../../../primitives/display/Typography/engines/rustic'),
    import('../../../../primitives/inputs/Button/engines/rustic'),
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

  it('streams a shimmer/caret while live and stops dead on completion (rendered alone)', async () => {
    // Rendered without a TypingIndicator so the caret must render on the streaming
    // path itself; a co-mounting dependency would fail this. WO-SKIN-06 CK-F moved the
    // caret's `ds-assistant-caret` keyframe into an unlayered skin (no longer injected
    // per-mount), so assert the caret's anatomy ([data-part='caret']) — the real
    // evidence it rendered — rather than the contents of an injected <style> tag.
    const streamingView = renderSurface(
      <StreamingText text="Generating summary" streaming />,
      { engine: 'modern' },
    );

    expect(await screen.findByText('|')).toBeInTheDocument();
    expect(document.querySelector('[data-part="caret"]')).toBeTruthy();

    streamingView.unmount();

    renderSurface(<StreamingText text="Generating summary" />, { engine: 'modern' });
    expect(await screen.findByText('Generating summary')).toBeInTheDocument();
    expect(screen.queryByText('|')).not.toBeInTheDocument();
  });

  it('runs the streaming shimmer and an animated caret when motion is allowed', async () => {
    renderSurface(
      <StreamingText text="Generating summary" streaming />,
      { engine: 'modern' },
    );

    expect(await screen.findByText('Generating summary')).toBeInTheDocument();
    // The shimmer effect mounts its own `ds-shimmer` keyframe; its presence is
    // proof the live (animated) streaming branch rendered.
    const hasShimmer = Array.from(document.querySelectorAll('style')).some((node) =>
      node.textContent?.includes('ds-shimmer'),
    );
    expect(hasShimmer).toBe(true);
    const caret = document.querySelector('[data-part="caret"]');
    expect(caret?.getAttribute('style')).toContain('ds-assistant-caret');
  });

  it('renders the full text immediately with no shimmer or blinking caret under a reduced-motion preference', async () => {
    renderSurface(
      <MotionProvider reducedMotion>
        <StreamingText text="Generating summary" streaming />
      </MotionProvider>,
      { engine: 'modern' },
    );

    // Full text is present at once -- there is no per-character cadence to wait on.
    expect(await screen.findByText('Generating summary')).toBeInTheDocument();
    // The streaming shimmer branch is not mounted, so its keyframe is absent.
    const hasShimmer = Array.from(document.querySelectorAll('style')).some((node) =>
      node.textContent?.includes('ds-shimmer'),
    );
    expect(hasShimmer).toBe(false);
    // The caret holds a static position instead of blinking.
    const caret = document.querySelector('[data-part="caret"]');
    expect(caret?.getAttribute('style')).toContain('animation: none');
  });

  it('honors the reducedMotion prop override even without an OS preference', async () => {
    renderSurface(<StreamingText text="Generating summary" streaming reducedMotion />);

    expect(await screen.findByText('Generating summary')).toBeInTheDocument();
    const hasShimmer = Array.from(document.querySelectorAll('style')).some((node) =>
      node.textContent?.includes('ds-shimmer'),
    );
    expect(hasShimmer).toBe(false);
  });

  it('renders a terminal receipt for a completed tool call and hides live I/O', async () => {
    renderSurface(
      <ToolCallCard
        name="search_index"
        status="complete"
        summary="Indexed 12 records"
        input="query=onboarding"
        output="12 records"
        duration="1.2s"
      />
    );

    expect(await screen.findByText('search_index')).toBeInTheDocument();
    expect(screen.getByText('Indexed 12 records')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    // The receipt posture omits the live input/output expansion.
    expect(screen.queryByText('query=onboarding')).not.toBeInTheDocument();
    expect(screen.queryByText('12 records')).not.toBeInTheDocument();
    expect(screen.queryByText('Input')).not.toBeInTheDocument();
  });

  it('fires confirm and cancel callbacks from ConfirmActionCard', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderSurface(
      <ConfirmActionCard
        title="Apply proposed change"
        summary="This will update three fields."
        confirmLabel="Apply"
        cancelLabel="Discard"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders added and removed rows in PreviewDiffCard from props alone', async () => {
    renderSurface(
      <PreviewDiffCard
        title="Proposed update"
        rows={[
          { label: 'Status', after: 'Published', change: 'added' },
          { label: 'Owner', before: 'Alex', change: 'removed' },
          { label: 'Priority', before: 'Low', after: 'High', change: 'updated' },
        ]}
      />
    );

    expect(await screen.findByText('Proposed update')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders every state in the agent status set', async () => {
    renderSurface(
      <div>
        <AssistantStatusIndicator status="idle" />
        <AssistantStatusIndicator status="thinking" />
        <AssistantStatusIndicator status="streaming" />
        <AssistantStatusIndicator status="acting" />
        <AssistantStatusIndicator status="error" />
        <AssistantStatusIndicator status="streaming" label="Custom streaming label" />
      </div>
    );

    expect(await screen.findByText('Idle')).toBeInTheDocument();
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getByText('Streaming')).toBeInTheDocument();
    expect(screen.getByText('Acting')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Custom streaming label')).toBeInTheDocument();
  });
});
