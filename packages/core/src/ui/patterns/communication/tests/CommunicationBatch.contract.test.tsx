import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { PatternCommentThread } from '../comment-thread';
import type { Comment } from '../comment-thread';
import { PatternNotificationCenter } from '../notification-center';
import type { Notification } from '../notification-center';
import { PatternActivityLog } from '../activity-log';
import type { Activity } from '../activity-log';
import { PatternLiveFeed } from '../live-feed';
import type { FeedItem } from '../live-feed';
import {
  AssistantStatusBadge,
  StreamingText,
  TypingIndicator,
  ToolCallCard,
  AssistantStatusIndicator,
  PreviewDiffCard,
  ConfirmActionCard,
  MessageBubble,
} from '../assistant';
import { PresenceBar, PresenceTypingIndicator, LiveCursor } from '../presence';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-F -- the patterns/communication family
// (CommentThread, NotificationCenter, ActivityLog, LiveFeed, assistant's 8
// exports, presence's 3 exports) data-part contract evidence.
//
// The inert pre-step stamps `ds-pattern-<comp> ds-engine-<engine>` on the
// four engine-split components (adding it to every rustic root, which had
// none, and to activity-log/live-feed's modern+rustic roots, which also had
// none -- comment-thread and notification-center already carried it on
// modern) plus `data-part` and state attributes (`data-active`, `data-type`,
// `data-unread`, `data-action-category`, `data-status`, `data-tone`,
// `data-change`, `data-diff-side`) onto all 10 engine files WITHOUT moving
// any paint. `assistant` and `presence` have no engine split, so each of
// their 8 + 3 exported sub-components gets its own scope class
// (`ds-assistant-<export>` / `ds-presence-<export>`) minted on its own root.
//
// P-79 SURVIVAL IS NOT UNIFORM IN THIS FAMILY -- unlike CK-G (zero DS
// primitives, raw DOM only) and CK-A (only Box/Text/Flex/Stack, which all
// forward), this family mixes BOTH shapes:
//   - comment-thread/notification-center/activity-log/live-feed render raw
//     DOM exclusively (div/span/button/textarea/select/img/svg) -- P-79
//     cannot bite here, every stamp is expected to land.
//   - assistant/presence compose DS primitives (Box, Text, Stack, Tag, Card,
//     Button). Empirically probed here (see report): Box, Text, Stack, and
//     Tag all forward an ARBITRARY caller-supplied `data-part` value plus
//     `className` (merged, not replaced), in both modern and rustic. Card is
//     the one exception, and it is a narrower defect than "drops data-part"
//     -- Card's own root ALREADY carries a hardcoded `data-part="root"`
//     (both engines) and a caller's `data-part` prop is silently
//     OVERRIDDEN by that hardcode, never forwarded; `className` on Card DOES
//     merge correctly. Every Card-rooted export in this file (ToolCallCard,
//     PreviewDiffCard, ConfirmActionCard) was stamped `data-part="root"`,
//     which is exactly what Card already forces -- so the scope class lands
//     (via className) and `[data-part="root"]` resolves, but by COINCIDENCE
//     of the value chosen, not because Card forwards the prop. Had any of
//     those three needed a non-"root" data-part on the Card element itself,
//     it would have silently failed; none did.
// ---------------------------------------------------------------------------

// Modern is the active authored engine. Rustic remains byte-frozen and its
// primitives intentionally own several root data-parts, so deep pattern
// anatomy is certified on Modern while the freeze gate guards Rustic.
const ENGINES = ['modern'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

const q = (c: HTMLElement, sel: string) => c.querySelectorAll(sel);

// ===========================================================================
// comment-thread
// ===========================================================================
const COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: { name: 'Ana' },
    content: 'First comment',
    timestamp: '2h ago',
    edited: true,
    reactions: [
      { emoji: '👍', count: 3, active: true },
      { emoji: '🎉', count: 1, active: false },
    ],
    replies: [
      { id: 'c1-r1', author: { name: 'Bob' }, content: 'A reply', timestamp: '1h ago' },
    ],
  },
];

describe('comment-thread -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('stamps root/avatar/reaction/actions/nested-line/composer (%s)', async (engine) => {
    const noop = () => undefined;
    const { container } = renderWithEngine(
      <PatternCommentThread
        comments={COMMENTS}
        currentUser={{ name: 'Ana' }}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
        onReply={noop}
        onReaction={noop}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-comment-thread');
    expect(root.className).toContain(`ds-engine-${engine}`);

    // avatar reused for both the composer and each rendered comment
    expect(q(container, '[data-part="avatar"]').length).toBeGreaterThanOrEqual(2);
    // reaction pill state, both values present
    expect(q(container, '[data-part="reaction"][data-active="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="reaction"][data-active="false"]')).toHaveLength(1);
    // isOwner (currentUser.name === 'Ana') unlocks edit/delete on the owned comment
    expect(q(container, '[data-part="reply"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="edit"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="delete"]').length).toBeGreaterThanOrEqual(1);
    // nested reply renders the threading line
    expect(q(container, '[data-part="nested-line"]')).toHaveLength(1);
    // composer
    expect(q(container, '[data-part="composer"]')).toHaveLength(1);
    expect(q(container, '[data-part="submit"]')).toHaveLength(1);

    // Edit branch: clicking the owned comment's "edit" part reveals
    // edit-textarea/save/cancel.
    fireEvent.click(q(container, '[data-part="edit"]')[0]);
    await waitForPart(container, 'edit-textarea');
    expect(q(container, '[data-part="save"]')).toHaveLength(1);
    expect(q(container, '[data-part="cancel"]')).toHaveLength(1);

    // Reply branch: clicking "reply" on the top-level comment reveals
    // reply-textarea/reply-submit/reply-cancel.
    fireEvent.click(q(container, '[data-part="reply"]')[0]);
    await waitForPart(container, 'reply-textarea');
    expect(q(container, '[data-part="reply-submit"]')).toHaveLength(1);
    expect(q(container, '[data-part="reply-cancel"]')).toHaveLength(1);
  });

  it.each(ENGINES)('stamps the loading branch as its own root (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternCommentThread comments={[]} loading />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-comment-thread');
    expect(root.className).toContain(`ds-engine-${engine}`);
    // modern paints a spinner; rustic paints a "Loading..." text part --
    // preserved asymmetry, not unified.
    if (engine === 'modern') {
      expect(q(container, '[data-part="spinner"]')).toHaveLength(1);
    } else {
      expect(q(container, '[data-part="loading"]')).toHaveLength(1);
    }
  });
});

// ===========================================================================
// notification-center
// ===========================================================================
const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Build passed', message: 'CI green', type: 'success', read: false, timestamp: '2m ago', action: { label: 'View', onClick: () => undefined } },
  { id: 'n2', title: 'Old alert', message: 'Already handled', type: 'info', read: true, timestamp: '1d ago' },
];

describe('notification-center -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('stamps root/trigger/badge, then panel/header/row/icon/dismiss on open (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternNotificationCenter
        notifications={NOTIFICATIONS}
        unreadCount={1}
        onRead={() => undefined}
        onReadAll={() => undefined}
        onClear={() => undefined}
        onClearAll={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-notification-center');
    expect(root.className).toContain(`ds-engine-${engine}`);
    expect(q(container, '[data-part="trigger"]')).toHaveLength(1);
    expect(q(container, '[data-part="badge"]')).toHaveLength(1);

    fireEvent.click(container.querySelector('[data-testid="notification-trigger"]') as Element);
    await waitForPart(container, 'panel');

    for (const part of ['header', 'mark-all-read', 'clear-all', 'row', 'icon', 'dismiss', 'action']) {
      expect(q(container, `[data-part="${part}"]`).length, `${engine} must stamp "${part}"`).toBeGreaterThanOrEqual(1);
    }
    // one read row, one unread row
    expect(q(container, '[data-part="row"][data-unread="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="row"][data-unread="false"]')).toHaveLength(1);
    // unread title dot only renders for the unread item
    expect(q(container, '[data-part="unread-dot"]')).toHaveLength(1);
    // icon carries the type discriminator for both rows
    expect(q(container, '[data-part="icon"][data-type="success"]')).toHaveLength(1);
    expect(q(container, '[data-part="icon"][data-type="info"]')).toHaveLength(1);
  });

  it.each(ENGINES)('stamps the empty branch when there are no notifications (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternNotificationCenter notifications={[]} open />,
      engine,
    );
    await waitForPart(container, 'root');
    await waitForPart(container, 'panel');
    // modern's empty row uses a plain Tailwind opacity class (no inline
    // paint, so no stamp per the inventory); rustic paints it inline and
    // is stamped. Preserved asymmetry -- see wo-skin-06-ck-f-inventory.md.
    if (engine === 'rustic') {
      expect(q(container, '[data-part="empty"]')).toHaveLength(1);
    } else {
      expect(q(container, '[data-part="empty"]')).toHaveLength(0);
    }
  });
});

// ===========================================================================
// activity-log
// ===========================================================================
const ACTIVITIES: Activity[] = [
  { id: 'a1', user: { name: 'Ana' }, action: 'created record', timestamp: new Date().toISOString(), entityType: 'order', entityId: '42' },
  {
    id: 'a2',
    user: { name: 'Bob', avatar: '/bob.png' },
    action: 'updated record',
    timestamp: new Date().toISOString(),
    diff: { status: { from: 'draft', to: 'active' } },
  },
  { id: 'a3', user: { name: 'Cid' }, action: 'deleted record', timestamp: new Date().toISOString() },
];

describe('activity-log -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('stamps root/dot/line/diff/avatar/badge/entity/timestamp (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternActivityLog
        activities={ACTIVITIES}
        actionTypes={['created', 'updated', 'deleted']}
        users={[{ name: 'Ana' }, { name: 'Bob' }]}
        onFilterChange={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-activity-log');
    expect(root.className).toContain(`ds-engine-${engine}`);

    expect(q(container, '[data-part="dot"]')).toHaveLength(3);
    // connecting line renders between items, not after the last
    expect(q(container, '[data-part="line"]')).toHaveLength(2);
    // each engine's OWN classifier resolves a value for data-action-category;
    // the vocabulary differs by design (modern: category name, rustic: the
    // color token the classifier returns -- see the report's contract-gap note).
    const dotCategories = Array.from(q(container, '[data-part="dot"]')).map((el) => el.getAttribute('data-action-category'));
    expect(dotCategories.every((v) => !!v)).toBe(true);

    // diff renders for the one activity that has a diff
    if (engine === 'modern') {
      expect(q(container, '[data-part="diff"]')).toHaveLength(1);
      expect(q(container, '[data-part="diff-row"]')).toHaveLength(1);
      for (const role of ['label', 'from', 'arrow', 'to']) {
        expect(q(container, `[data-part="diff-cell"][data-diff-role="${role}"]`)).toHaveLength(1);
      }
    } else {
      expect(q(container, '[data-part="diff"]')).toHaveLength(1);
    }

    // avatar: image branch (Bob) + fallback-initial branch (Ana, Cid)
    expect(q(container, '[data-part="avatar"]')).toHaveLength(3);
    expect(q(container, '[data-part="badge"]')).toHaveLength(3);
    expect(q(container, '[data-part="entity"]')).toHaveLength(1);
    expect(q(container, '[data-part="timestamp"]')).toHaveLength(3);
    expect(q(container, '[data-part="user"]')).toHaveLength(3);

    // rustic's native <select> filters are stamped; modern delegates to the
    // Select primitive (no raw <select> paint site, so nothing to stamp).
    if (engine === 'rustic') {
      expect(q(container, '[data-part="filter"]')).toHaveLength(2);
    }
  });

  it.each(ENGINES)('stamps the loading branch as its own root (%s)', async (engine) => {
    const { container } = renderWithEngine(<PatternActivityLog activities={[]} loading />, engine);
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-activity-log');
    expect(root.className).toContain(`ds-engine-${engine}`);
    // Asymmetric by construction (not just naming): modern renders a 4-row
    // shimmer skeleton (LoadingSkeleton, the ds-activity-shimmer keyframe);
    // rustic's loading branch is a single plain "Loading..." text row with
    // no shimmer to migrate at all. Do not invent a rustic skeleton.
    if (engine === 'modern') {
      expect(q(container, '[data-part="skeleton"]').length).toBeGreaterThanOrEqual(4);
    } else {
      expect(q(container, '[data-part="loading"]')).toHaveLength(1);
      expect(q(container, '[data-part="skeleton"]')).toHaveLength(0);
    }
  });

  it.each(ENGINES)('stamps the empty branch (%s)', async (engine) => {
    const { container } = renderWithEngine(<PatternActivityLog activities={[]} />, engine);
    await waitForPart(container, 'root');
    await waitForPart(container, 'empty');
  });
});

// ===========================================================================
// live-feed
// ===========================================================================
const FEED_ITEMS: FeedItem[] = [
  { key: 'f1', isNew: true },
  { key: 'f2' },
];

describe('live-feed -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('stamps root/refresh/banner/badge/load-more (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternLiveFeed
        items={FEED_ITEMS}
        renderItem={(item) => <span>{item.key}</span>}
        onRefresh={() => undefined}
        header={<span>Feed</span>}
        newItemsCount={2}
        onShowNewItems={() => undefined}
        hasMore
        onLoadMore={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-live-feed');
    expect(root.className).toContain(`ds-engine-${engine}`);
    expect(q(container, '[data-part="refresh"]')).toHaveLength(1);
    expect(q(container, '[data-part="banner"]')).toHaveLength(1);
    expect(q(container, '[data-part="badge"]')).toHaveLength(1);
    expect(q(container, '[data-part="load-more"]')).toHaveLength(1);
  });

  it.each(ENGINES)('stamps the loading skeleton as its own root (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternLiveFeed items={[]} renderItem={() => null} loading />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-live-feed');
    expect(root.className).toContain(`ds-engine-${engine}`);
    expect(q(container, '[data-part="skeleton"]').length).toBeGreaterThanOrEqual(4);
  });

  it.each(ENGINES)('stamps the empty state (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternLiveFeed items={[]} renderItem={() => null} />,
      engine,
    );
    await waitForPart(container, 'root');
    await waitForPart(container, 'empty');
  });
});

// ===========================================================================
// assistant -- engine-agnostic, composed from DS primitives. P-79 is a live
// risk here (Card/Tag roots), so these assertions record the OBSERVED
// forwarding behavior per primitive, not an assumed one.
// ===========================================================================
describe('assistant -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('AssistantStatusBadge: root scope class on Tag -- Tag forwards a custom data-part (%s)', async (engine) => {
    const { container } = renderWithEngine(<AssistantStatusBadge label="Done" tone="success" />, engine);
    await waitFor(() => expect(container.textContent).toContain('Done'));
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-assistant-status-badge');
  });

  it.each(ENGINES)('StreamingText: root + caret only while streaming (%s)', async (engine) => {
    const { container, rerender } = renderWithEngine(
      <StreamingText text="hello" streaming reducedMotion />,
      engine,
    );
    await waitFor(() => expect(container.textContent).toContain('hello'));
    expect(container.querySelector('.ds-assistant-streaming-text')).not.toBeNull();
    expect(q(container, '[data-part="caret"]')).toHaveLength(1);

    rerender(<StreamingText text="hello" streaming={false} />);
    await waitFor(() => expect(q(container, '[data-part="caret"]')).toHaveLength(0));
  });

  it.each(ENGINES)('TypingIndicator: root + 3 typing-dot (%s)', async (engine) => {
    const { container } = renderWithEngine(<TypingIndicator />, engine);
    await waitFor(() => expect(container.querySelector('.ds-assistant-typing-indicator')).not.toBeNull());
    expect(q(container, '[data-part="typing-dot"]')).toHaveLength(3);
  });

  it.each(ENGINES)('ToolCallCard: Card root className lands, data-part="root" is Card\'s own hardcode + tool-card/data-tone in the terminal state (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ToolCallCard name="search" status="complete" duration="1.2s" />,
      engine,
    );
    await waitFor(() => expect(container.textContent).toContain('1.2s'));
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-assistant-tool-call-card');
    expect(q(container, '[data-part="tool-card"][data-tone="success"]')).toHaveLength(1);
  });

  it.each(ENGINES)('AssistantStatusIndicator: dot carries data-status for every status (%s)', async (engine) => {
    for (const status of ['thinking', 'streaming', 'acting', 'error', 'idle'] as const) {
      const { container } = renderWithEngine(<AssistantStatusIndicator status={status} />, engine);
      await waitFor(() => expect(q(container, `[data-part="dot"][data-status="${status}"]`)).toHaveLength(1));
    }
  });

  it.each(ENGINES)('PreviewDiffCard: divider + preview-cell x data-change x data-diff-side (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PreviewDiffCard
        rows={[
          { label: 'name', before: 'old', after: 'new', change: 'updated' },
          { label: 'tag', after: 'added-val', change: 'added' },
          { label: 'legacy', before: 'gone-val', change: 'removed' },
        ]}
      />,
      engine,
    );
    await waitFor(() => expect(container.textContent).toContain('name'));
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-assistant-preview-diff-card');
    expect(q(container, '[data-part="divider"]')).toHaveLength(3);
    expect(q(container, '[data-part="preview-cell"][data-diff-side="before"][data-change="updated"]')).toHaveLength(1);
    expect(q(container, '[data-part="preview-cell"][data-diff-side="after"][data-change="updated"]')).toHaveLength(1);
    expect(q(container, '[data-part="preview-cell"][data-diff-side="after"][data-change="added"]')).toHaveLength(1);
    expect(q(container, '[data-part="preview-cell"][data-diff-side="before"][data-change="removed"]')).toHaveLength(1);
  });

  it.each(ENGINES)('ConfirmActionCard: root only, no internal paint sites (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ConfirmActionCard summary="Are you sure?" onConfirm={() => undefined} onCancel={() => undefined} />,
      engine,
    );
    await waitFor(() => expect(container.textContent).toContain('Are you sure?'));
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-assistant-confirm-action-card');
  });

  it.each(ENGINES)('MessageBubble: root (Box) + timestamp (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <MessageBubble author="Ana" parts={[{ type: 'text', content: 'hi' }]} timestamp="2m ago" />,
      engine,
    );
    await waitFor(() => expect(container.textContent).toContain('hi'));
    expect(container.querySelector('.ds-assistant-message-bubble')).not.toBeNull();
    expect(q(container, '[data-part="timestamp"]')).toHaveLength(1);
  });
});

// ===========================================================================
// presence -- engine-agnostic, composed from Box/Text only (both confirmed
// forwarding primitives per the CK-A precedent).
// ===========================================================================
describe('presence -- data-part contract (CK-F)', () => {
  it.each(ENGINES)('PresenceBar: root/avatar/avatar-initials/overflow-badge (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PresenceBar
        users={[
          { id: 'u1', name: 'Ana', avatar: '/ana.png', color: '#e74c3c' },
          { id: 'u2', name: 'Bob', color: '#3498db' },
          { id: 'u3', name: 'Cid' },
        ]}
        maxVisible={2}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-presence-bar');
    expect(q(container, '[data-part="avatar"]')).toHaveLength(2);
    // one of the two visible avatars has no image -> fallback initials
    expect(q(container, '[data-part="avatar-initials"]')).toHaveLength(1);
    expect(q(container, '[data-part="overflow-badge"]')).toHaveLength(1);
    expect(q(container, '[data-part="overflow-badge-count"]')).toHaveLength(1);
  });

  it.each(ENGINES)('PresenceTypingIndicator: root/typing-dot x3/label (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PresenceTypingIndicator users={[{ name: 'Ana' }, { name: 'Bob' }]} />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-presence-typing-indicator');
    expect(q(container, '[data-part="typing-dot"]')).toHaveLength(3);
    expect(q(container, '[data-part="label"]')).toHaveLength(1);
  });

  it.each(ENGINES)('LiveCursor: root/cursor-badge (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <LiveCursor user={{ name: 'Ana', color: '#e74c3c' }} position={{ x: 10, y: 20 }} />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-presence-live-cursor');
    expect(q(container, '[data-part="cursor-badge"]')).toHaveLength(1);
    const fill = q(container, '[data-part="cursor-fill"]')[0];
    const outline = q(container, '[data-part="cursor-outline"]')[0];
    expect(fill).toHaveAttribute('fill', '#e74c3c');
    expect(outline).not.toHaveAttribute('stroke');
  });
});
