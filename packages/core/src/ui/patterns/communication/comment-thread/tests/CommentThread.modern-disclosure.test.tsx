import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCommentThread from '../engines/modern';
import type { Comment, CommentThreadProps } from '../contracts';

const currentUser = { name: 'Ana' };

function comment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    author: { name: 'Ana' },
    content: 'Original body',
    timestamp: new Date().toISOString(),
    ...overrides,
  } as Comment;
}

function buildProps(overrides: Partial<CommentThreadProps> = {}): CommentThreadProps {
  return {
    comments: [comment()],
    currentUser,
    ...overrides,
  } as CommentThreadProps;
}

const settle = () => act(async () => {});

describe('CommentThread modern engine disclosure state', () => {
  it('reports the reply composer state on the trigger', async () => {
    render(<ModernCommentThread {...buildProps({ onReply: vi.fn() })} />);
    await settle();

    const reply = await screen.findByRole('button', { name: 'Reply' });
    expect(reply.getAttribute('aria-expanded')).toBe('false');

    await act(async () => { fireEvent.click(reply); });
    expect(reply.getAttribute('aria-expanded')).toBe('true');
  });

  it('reports the edit composer state on the trigger', async () => {
    render(<ModernCommentThread {...buildProps({ onEdit: vi.fn() })} />);
    await settle();

    const edit = await screen.findByRole('button', { name: 'Edit' });
    expect(edit.getAttribute('aria-expanded')).toBe('false');

    await act(async () => { fireEvent.click(edit); });
    expect(edit.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('CommentThread modern engine composer focus contract', () => {
  it('moves focus into the reply field the trigger just revealed', async () => {
    const { container } = render(<ModernCommentThread {...buildProps({ onReply: vi.fn() })} />);
    await settle();

    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Reply' })); });

    const textarea = container.querySelector('[data-part="reply-form"] textarea');
    expect(document.activeElement).toBe(textarea);
  });

  it('returns focus to the trigger when the reply composer is cancelled', async () => {
    render(<ModernCommentThread {...buildProps({ onReply: vi.fn() })} />);
    await settle();

    const reply = await screen.findByRole('button', { name: 'Reply' });
    await act(async () => { fireEvent.click(reply); });
    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Cancel' })); });

    // Cancel destroys the focused field; without a handoff focus lands on <body>.
    expect(document.activeElement).toBe(reply);
  });

  it('returns focus to the trigger when the edit composer is cancelled', async () => {
    render(<ModernCommentThread {...buildProps({ onEdit: vi.fn() })} />);
    await settle();

    const edit = await screen.findByRole('button', { name: 'Edit' });
    await act(async () => { fireEvent.click(edit); });
    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Cancel' })); });

    expect(document.activeElement).toBe(edit);
  });
});

describe('CommentThread modern engine editor seeding', () => {
  it('seeds the editor from the current comment, not the mount-time value', async () => {
    const { container, rerender } = render(<ModernCommentThread {...buildProps({ onEdit: vi.fn() })} />);
    await settle();

    // The comment is updated elsewhere (another client, a refetch) while this
    // node stays mounted -- the editor must not resurrect the stale body.
    rerender(
      <ModernCommentThread
        {...buildProps({ onEdit: vi.fn(), comments: [comment({ content: 'Updated body' })] })}
      />,
    );
    await settle();

    await act(async () => { fireEvent.click(await screen.findByRole('button', { name: 'Edit' })); });

    const textarea = container.querySelector('[data-part="edit-form"] textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Updated body');
  });
});

describe('CommentThread modern engine floor interpolation', () => {
  it('never prints a raw placeholder in a relative timestamp', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { container } = render(
      <ModernCommentThread {...buildProps({ comments: [comment({ timestamp: twoHoursAgo })] })} />,
    );
    await settle();

    // The English floor carries the same {count} placeholder as catalog copy;
    // handing it back unresolved shows the user the template itself.
    const stamp = container.querySelector('[data-part="timestamp"]');
    expect(stamp?.textContent).toBe('2h ago');
    expect(stamp?.textContent).not.toContain('{count}');
  });
});

describe('CommentThread modern engine depth-cap integrity', () => {
  it('accounts for replies the depth cap removes from the tree', async () => {
    const nested = comment({
      id: 'root',
      content: 'Root',
      replies: [comment({ id: 'child', content: 'Child', replies: [comment({ id: 'grand', content: 'Grandchild' })] })],
    } as Partial<Comment>);

    const { container } = render(
      <ModernCommentThread {...buildProps({ comments: [nested], maxDepth: 1 })} />,
    );
    await settle();

    // A depth cap that drops replies silently leaves no trace that the
    // thread continued past the visible nodes.
    expect(screen.queryByText('Grandchild')).toBeNull();
    const notice = container.querySelector('[data-part="replies-truncated"]');
    expect(notice?.textContent).toContain('1 more reply not shown');
  });

  it('pluralizes the depth-cap notice for multiple hidden replies', async () => {
    const nested = comment({
      id: 'root',
      content: 'Root',
      replies: [
        comment({
          id: 'child',
          content: 'Child',
          replies: [comment({ id: 'g1', content: 'G1' }), comment({ id: 'g2', content: 'G2' })],
        }),
      ],
    } as Partial<Comment>);

    const { container } = render(
      <ModernCommentThread {...buildProps({ comments: [nested], maxDepth: 1 })} />,
    );
    await settle();

    const notice = container.querySelector('[data-part="replies-truncated"]');
    expect(notice?.textContent).toContain('2 more replies not shown');
  });
});
