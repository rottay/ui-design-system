'use client';

/**
 * PATTERN BEHAVIORS — browser scenes for the nine ELEVATED Modern PATTERN families.
 *
 * These closures were rejected for resting on unit tests alone, so every case
 * here is configured so the family's SPECIFIC repaired behaviour is what a
 * capture sees. A LiveFeed is not "a feed": it is a first-load skeleton beside
 * its own loaded twin, because the repair is that the header survives the swap.
 * A PricingTable is not "a pricing table": it is a four-plan comparison grid
 * inside a 360px page, because the repair is that the frame scrolls instead of
 * the document.
 *
 * DETERMINISM. Several of these engines derive a relative timestamp from the
 * wall clock ("3m ago"), which would make the DOM differ between two runs. Every
 * fixture date is therefore a hardcoded literal placed WELL past each family's
 * seven-day relative window, so the engine lands on its stable absolute-date
 * branch — which is also the exact branch the locale repair touched. There is no
 * `Math.random`, no `Date.now`, no polling interval and no network anywhere in
 * this file.
 *
 * PROPS OVER GESTURES. Where a target state is reachable through the public
 * contract it IS reached through props (`loading`, `open`, `defaultCollapsed`,
 * `maxVisible`, `maxDepth`), so a still frame is the proof. The handful of
 * states that genuinely have no prop — an EnvironmentToggle panel, a
 * CommentThread composer — are reached by the runner, and each one carries a
 * fixture-owned readout so the post-interaction frame is self-describing.
 *
 * TENANCY. The React tree is identical under both grounds; only the tenant
 * layer differs. Nothing here reads the tenant, and no wrapper hardcodes a
 * colour: every fixture surface is a `var(--ds-*)` channel.
 */

import React from 'react';

import {
  PatternActivityLog,
  PatternCockpitHeader,
  PatternCommentThread,
  PatternDecisionComparison,
  PatternEmptyState,
  PatternEnvironmentToggle,
  PatternFileManager,
  PatternFilterPanel,
  PatternLiveFeed,
  PatternNotificationCenter,
  PatternPricingTable,
  PatternRecordFacts,
  PatternUserProfileCard,
  PatternWorkbenchHeader,
  PatternWorkspaceSwitcher,
} from '@rottay/design-system';
import type {
  Activity,
  ActivityFilter,
  CockpitBreadcrumb,
  CockpitStatus,
  Comment,
  DecisionComparisonSubject,
  EnvironmentDef,
  FeedItem,
  FileItem,
  FilterDef,
  FolderItem,
  Notification,
  PricingFeature,
  PricingPlan,
  ProfileAction,
  RecordFact,
  WorkbenchQuickAction,
  WorkbenchSavedView,
  Workspace,
} from '@rottay/design-system';

import { AxisCaption, SceneFrame, SpecimenRow, Vignette } from '../../chrome';

export type PatternBehaviorCase =
  | 'live-feed-shell-continuity'
  | 'comment-thread-disclosure-truncation'
  | 'activity-log-diff-and-busy'
  | 'notification-center-row-actions'
  | 'filter-panel-collapsed-inert'
  | 'file-manager-locale-and-roving'
  | 'environment-toggle-menu-semantics'
  | 'pricing-table-comparison-semantics'
  | 'workspace-switcher-row-model'
  | 'empty-state-illustration-and-skeleton'
  | 'user-profile-card-grapheme-and-affordance'
  | 'cockpit-header-trail-and-posture'
  | 'workbench-header-skeleton-footprint'
  | 'decision-comparison-wrap-and-rtl'
  | 'record-facts-narrow-description';

// ---------------------------------------------------------------------------
// Fixture furniture
// ---------------------------------------------------------------------------

/** Small fixture-owned readout. Mirrors the primitive-complex-states / primitive-state-repairs idiom. */
function Readout({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      data-testid={id}
      style={{
        font: 'inherit',
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        color: 'var(--ds-color-text-secondary)',
        marginBlockStart: 8,
      }}
    >
      {children}
    </div>
  );
}

/** A neutral frame that makes an otherwise invisible region legible on canvas. */
const OUTLINE_FRAME: React.CSSProperties = {
  border: '1px dashed var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-md, 8px)',
  padding: 12,
};

/** Vertical scene rhythm shared by every harness. */
function Column({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        inlineSize: `min(${width}px, 100%)`,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. communication/live-feed — shell continuity across the skeleton swap
// ---------------------------------------------------------------------------

/** The domain fields this fixture hangs off the feed contract's open shape. */
interface RosterFeedItem extends FeedItem {
  key: string;
  headline: string;
  detail: string;
}

const FEED_ITEMS: RosterFeedItem[] = [
  {
    key: 'feed-1',
    headline: 'Marta Oliveira moved two candidates to the panel stage',
    detail: 'REQ-4821 — Senior Venue Operations Lead',
  },
  {
    key: 'feed-2',
    headline: 'Catering headcount for Sala Norte revised to 240 covers',
    detail: 'Event ES-2210 — doors 18:30',
  },
  {
    key: 'feed-3',
    headline: 'Offer package returned by compensation with one query',
    detail: 'Band 6, on-call supplement pending',
  },
  {
    key: 'feed-4',
    headline: 'Safety officer signed off the rigging plan',
    detail: 'Sala Norte — main stage',
  },
  {
    key: 'feed-5',
    headline: 'Take-home exercise scored by the second reviewer',
    detail: 'REQ-4821 — awaiting panel consensus',
  },
];

/**
 * The feed contract keeps an open index signature, so `renderItem` hands the
 * domain fields back as `unknown`. Reading them through `String()` is the honest
 * narrowing — a cast would claim a guarantee the contract does not make.
 */
function FeedRow({ item }: { item: FeedItem }) {
  return (
    <div style={{ ...OUTLINE_FRAME, padding: 10 }}>
      <div style={{ font: 'inherit', fontSize: '0.8125rem', color: 'var(--ds-color-text-primary)' }}>
        {String(item.headline)}
      </div>
      <div style={{ font: 'inherit', fontSize: '0.6875rem', color: 'var(--ds-color-text-secondary)' }}>
        {String(item.detail)}
      </div>
    </div>
  );
}

/**
 * LiveFeed — the skeleton branch used to return a BARE root: the title and the
 * refresh control unmounted on first load, so the shell collapsed and the page
 * re-flowed the moment items landed. The two postures below are the same
 * configuration side by side, so the collapse is visible or it is gone. The
 * loaded twin is `maxHeight`-bounded, which is the posture where the scroller
 * became a named tab stop (`role="region"` + label + `tabIndex=0`), and it
 * carries buffered arrivals so the polite status region has something to say.
 *
 * `autoRefresh` is deliberately NOT set: the in-flight polling guard is real,
 * but a live interval is a clock, and a clock cannot appear in a deterministic
 * fixture. That defect stays unproven here and is reported as such.
 */
function LiveFeedShellHarness() {
  const [merged, setMerged] = React.useState(0);
  const [refreshes, setRefreshes] = React.useState(0);
  const [buffered, setBuffered] = React.useState(4);

  return (
    <Column width={880}>
      <div data-lab-live-feed="loading">
        <AxisCaption>first load — header and refresh survive the skeleton</AxisCaption>
        <PatternLiveFeed
          loading
          items={[]}
          maxHeight={220}
          header={<span>Hiring activity</span>}
          onRefresh={() => undefined}
          renderItem={(item) => <FeedRow item={item} />}
        />
      </div>

      <div data-lab-live-feed="loaded">
        <AxisCaption>loaded — same shell, bounded scroller is a named tab stop</AxisCaption>
        <PatternLiveFeed
          items={FEED_ITEMS}
          maxHeight={220}
          header={<span>Hiring activity</span>}
          newItemsCount={buffered}
          onShowNewItems={() => {
            setBuffered(0);
            setMerged((n) => n + 1);
          }}
          onRefresh={() => setRefreshes((n) => n + 1)}
          renderItem={(item) => <FeedRow item={item} />}
        />
      </div>

      <Readout id="lab-live-feed-readout">
        buffered: {buffered} / merges: {merged} / refreshes: {refreshes}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 2. communication/comment-thread — disclosure state and the depth cap
// ---------------------------------------------------------------------------

/**
 * `maxDepth={1}` is what makes the truncation notice render: the second level of
 * this thread sits AT the cap, so its own replies used to be deleted from the
 * tree with nothing left behind. Two capped branches on purpose — one with two
 * hidden replies and one with a single hidden reply — because the plural notice
 * is the parametric floor, and a floor that did not interpolate would print the
 * literal `{count}` right there on canvas. Timestamps are months old so the
 * engine lands on its absolute-date branch and the DOM cannot drift between runs.
 */
const THREAD: Comment[] = [
  {
    id: 'c-1',
    author: { name: 'Marta Oliveira' },
    content:
      'Panel debrief for REQ-4821: both operations leads want a second look at the availability grid before we move to offer.',
    timestamp: '2026-05-04T09:12:00.000Z',
    reactions: [{ emoji: '\uD83D\uDC4D', count: 3, active: true }],
    replies: [
      {
        id: 'c-1-1',
        author: { name: 'Diego Fernandes' },
        content:
          'Agreed. The candidate flagged two weekends in July that clash with the Sala Norte residency.',
        timestamp: '2026-05-04T10:41:00.000Z',
        edited: true,
        replies: [
          {
            id: 'c-1-1-1',
            author: { name: 'Ana Ruiz' },
            content: 'Compensation confirmed the on-call supplement covers both weekends at band 6.',
            timestamp: '2026-05-05T08:02:00.000Z',
          },
          {
            id: 'c-1-1-2',
            author: { name: 'Marta Oliveira' },
            content: 'Then the only open item left on the loop is the safety-officer slot.',
            timestamp: '2026-05-05T11:20:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'c-2',
    author: { name: 'Ana Ruiz' },
    content:
      'Sala Norte rigging inspection is rebooked for the 12th. The July roster cannot publish before it clears.',
    timestamp: '2026-04-28T16:35:00.000Z',
    replies: [
      {
        id: 'c-2-1',
        author: { name: 'Diego Fernandes' },
        content: 'I moved the two front-of-house shifts behind the inspection so nothing publishes early.',
        timestamp: '2026-04-29T07:14:00.000Z',
        replies: [
          {
            id: 'c-2-1-1',
            author: { name: 'Ana Ruiz' },
            content: 'Noted. I will confirm with the safety officer on the day.',
            timestamp: '2026-04-29T09:48:00.000Z',
          },
        ],
      },
    ],
  },
];

/**
 * CommentThread — Reply and Edit toggled a composer while exposing no
 * `aria-expanded`, and every close path (Cancel and a successful submit alike)
 * unmounted the focused field and dropped the caret on `<body>`. The current
 * user IS the author of the root comment, so the Edit disclosure is present in
 * the still and the runner can drive the whole open/close journey. The editor
 * also seeds from the LIVE prop now, so the "Amend the thread" button below
 * rewrites the comment underneath a closed editor: re-opening it must show the
 * amended text, not the mount-time snapshot.
 */
function CommentThreadHarness() {
  const [amended, setAmended] = React.useState(false);
  const [lastAction, setLastAction] = React.useState('none');

  const comments = React.useMemo<Comment[]>(() => {
    if (!amended) return THREAD;
    const [root, ...rest] = THREAD;
    return [
      {
        ...root,
        content:
          'Panel debrief for REQ-4821: compensation confirmed the supplement, so the only open item is the safety-officer slot.',
      },
      ...rest,
    ];
  }, [amended]);

  return (
    <Column width={720}>
      <div data-lab-comment-thread="thread">
        <AxisCaption>maxDepth=1 — capped replies are counted, never deleted</AxisCaption>
        <PatternCommentThread
          comments={comments}
          maxDepth={1}
          currentUser={{ name: 'Marta Oliveira' }}
          placeholder="Add a note for the panel"
          onReply={(parentId) => setLastAction(`reply:${parentId}`)}
          onEdit={(id) => setLastAction(`edit:${id}`)}
          onReaction={(id, emoji) => setLastAction(`react:${id}:${emoji}`)}
        />
      </div>

      <div>
        <button
          type="button"
          data-testid="lab-comment-thread-amend"
          onClick={() => setAmended(true)}
          style={{
            font: 'inherit',
            fontSize: '0.75rem',
            padding: '6px 12px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-elevated)',
            color: 'var(--ds-color-text-primary)',
            cursor: 'pointer',
          }}
        >
          Amend the comment from elsewhere
        </button>
      </div>

      <Readout id="lab-comment-thread-readout">
        external amendment: {amended ? 'applied' : 'none'} / last action: {lastAction}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 3. communication/activity-log — diff honesty and the busy swap
// ---------------------------------------------------------------------------

/**
 * The diff column is the point. `panel` carries a STRUCTURED value (which used
 * to print `[object Object]`), `owner` moves away from an absent value (which
 * used to print the literal string `undefined`), and `notes` empties out to
 * `''`. Each side also gains a visually-hidden "from"/"to" label, because the
 * strikethrough was the only mark of which value was replaced.
 */
const ACTIVITIES: Activity[] = [
  {
    id: 'a-1',
    user: { name: 'Marta Oliveira' },
    action: 'updated',
    timestamp: '2026-05-18T14:22:00.000Z',
    entityType: 'requisition',
    entityId: 'REQ-4821',
    diff: {
      stage: { from: 'Panel loop', to: 'Offer' },
      panel: {
        from: { leads: 2, safetyOfficer: false },
        to: { leads: 2, safetyOfficer: true },
      },
    },
  },
  {
    id: 'a-2',
    user: { name: 'Diego Fernandes' },
    action: 'reassigned',
    timestamp: '2026-05-16T09:05:00.000Z',
    entityType: 'shift',
    entityId: 'SN-0142',
    diff: {
      owner: { from: undefined, to: 'Ana Ruiz' },
      notes: { from: 'Cover requested for the residency weekend', to: '' },
    },
  },
  {
    id: 'a-3',
    user: { name: 'Ana Ruiz' },
    action: 'published',
    timestamp: '2026-05-12T17:48:00.000Z',
    entityType: 'roster',
    entityId: 'Sala Norte — July',
  },
];

const ACTION_TYPES = ['updated', 'reassigned', 'published', 'archived'];

const ACTIVITY_USERS = [
  { name: 'Marta Oliveira' },
  { name: 'Diego Fernandes' },
  { name: 'Ana Ruiz' },
];

/**
 * ActivityLog — the loading branch early-returned a root containing ONLY the
 * skeleton, so a refetch unmounted the very filter controls that caused it and
 * re-flowed everything below. Both postures render here with the same filter
 * configuration: the bar has to be present in both, and `aria-busy` has to flip
 * rather than disappear.
 */
function ActivityLogHarness() {
  const [filters, setFilters] = React.useState<ActivityFilter>({ type: ['updated'] });

  return (
    <Column width={860}>
      <div data-lab-activity-log="loading">
        <AxisCaption>refetch — the filter bar outlives the skeleton</AxisCaption>
        <PatternActivityLog
          loading
          activities={[]}
          filters={filters}
          onFilterChange={(next) => setFilters(next)}
          actionTypes={ACTION_TYPES}
          users={ACTIVITY_USERS}
        />
      </div>

      <div data-lab-activity-log="loaded">
        <AxisCaption>loaded — structured and absent diff values render honestly</AxisCaption>
        <PatternActivityLog
          activities={ACTIVITIES}
          filters={filters}
          onFilterChange={(next) => setFilters(next)}
          actionTypes={ACTION_TYPES}
          users={ACTIVITY_USERS}
        />
      </div>

      <Readout id="lab-activity-log-readout">
        active type filter: {filters.type?.join(', ') || 'none'}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 4. communication/notification-center — per-row names, capped list, busy bell
// ---------------------------------------------------------------------------

/**
 * Six notifications against `maxVisible={3}`: the remainder used to vanish, so a
 * capped panel looked like the complete set. Titles are deliberately distinct
 * because they are what the repaired dismiss/mark-read accessible names carry —
 * five buttons all named "Dismiss" was the defect.
 */
const NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    title: 'Panel scorecard overdue',
    message: 'Diego Fernandes has not returned the scorecard for REQ-4821.',
    type: 'warning',
    read: false,
    timestamp: '2026-06-02T08:15:00.000Z',
  },
  {
    id: 'n-2',
    title: 'Offer approved by compensation',
    message: 'Band 6 with the on-call supplement was approved without conditions.',
    type: 'success',
    read: false,
    timestamp: '2026-06-01T16:40:00.000Z',
  },
  {
    id: 'n-3',
    title: 'Sala Norte rigging inspection failed',
    message: 'The safety officer flagged two anchor points on the main stage.',
    type: 'error',
    read: false,
    timestamp: '2026-05-30T11:02:00.000Z',
  },
  {
    id: 'n-4',
    title: 'Catering headcount revised',
    message: 'Event ES-2210 moved from 210 to 240 covers.',
    type: 'info',
    read: true,
    timestamp: '2026-05-28T09:30:00.000Z',
  },
  {
    id: 'n-5',
    title: 'Two shifts still unassigned',
    message: 'The July roster publishes on Friday with two front-of-house gaps.',
    type: 'warning',
    read: true,
    timestamp: '2026-05-27T18:12:00.000Z',
  },
  {
    id: 'n-6',
    title: 'Background check cleared',
    message: 'The candidate for REQ-4821 cleared the standard check.',
    type: 'success',
    read: true,
    timestamp: '2026-05-26T07:55:00.000Z',
  },
];

/**
 * NotificationCenter — `open` is a real controlled prop, so the panel is open in
 * the STILL and every repaired row detail is on canvas without a gesture: the
 * overflow note, the per-row action buttons, the grouped list. The loading twin
 * beside it proves the bell no longer unmounts while notifications load, which
 * is what used to shift the whole header row.
 */
function NotificationCenterHarness() {
  const [open, setOpen] = React.useState(true);
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const unread = items.filter((item) => !item.read).length;

  return (
    <Column width={640}>
      <div data-lab-notification-center="loading" style={OUTLINE_FRAME}>
        <AxisCaption>loading — the trigger bell holds its place in the chrome</AxisCaption>
        <PatternNotificationCenter loading notifications={[]} unreadCount={3} />
      </div>

      <div
        data-lab-notification-center="open"
        style={{ ...OUTLINE_FRAME, minBlockSize: 520 }}
      >
        <AxisCaption>open panel — maxVisible=3 reports the remainder</AxisCaption>
        <PatternNotificationCenter
          notifications={items}
          unreadCount={unread}
          maxVisible={3}
          open={open}
          onOpenChange={setOpen}
          onRead={(id) =>
            setItems((current) =>
              current.map((item) => (item.id === id ? { ...item, read: true } : item))
            )
          }
          onClear={(id) => setItems((current) => current.filter((item) => item.id !== id))}
        />
      </div>

      <Readout id="lab-notification-center-readout">
        panel open: {open ? 'yes' : 'no'} / rows: {items.length} / unread: {unread}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 5. forms/filter-panel — collapsed is inert, actions need a handler
// ---------------------------------------------------------------------------

const PANEL_FILTERS: FilterDef[] = [
  {
    key: 'stage',
    label: 'Pipeline stage',
    type: 'select',
    placeholder: 'Any stage',
    options: [
      { label: 'Screening', value: 'screening' },
      { label: 'Panel loop', value: 'panel' },
      { label: 'Offer', value: 'offer' },
    ],
  },
  { key: 'window', label: 'Interview window', type: 'date-range' },
  { key: 'covers', label: 'Confirmed covers', type: 'number-range' },
  { key: 'venue', label: 'Venue', type: 'text', placeholder: 'Sala Norte' },
];

const PANEL_VALUES: Record<string, unknown> = {
  stage: 'panel',
  window: ['2026-05-04', '2026-05-29'],
  covers: [120, 320],
  venue: 'Sala Norte',
};

/**
 * FilterPanel — three specimens, three repairs.
 *
 * The COLLAPSED panel is the P1: the region was hidden by paint alone
 * (`max-block-size: 0` + `opacity: 0`), so every filter control inside stayed in
 * the tab order and in the AT tree. It is collapsed through `defaultCollapsed`,
 * so `inert` + `aria-hidden` + the `aria-controls` target are all in the first
 * frame. Tabbing from the fixture button above it must land past the panel, not
 * inside it.
 *
 * The WIRED panel carries a date range (two bounds that were completely
 * unnamed), a number range (whose separator was a hardcoded ASCII hyphen while
 * its date sibling rode the i18n channel), and both actions with handlers.
 *
 * The HANDLER-LESS panel is the same `showReset` / `showApply` configuration
 * with the handlers removed: those buttons used to paint as live controls and
 * swallow every click, so here they must simply not exist.
 */
function FilterPanelHarness() {
  const [wired, setWired] = React.useState<Record<string, unknown>>(PANEL_VALUES);
  const [collapsedValues, setCollapsedValues] = React.useState<Record<string, unknown>>({
    venue: 'Sala Norte',
  });
  const [applied, setApplied] = React.useState(0);
  const [resets, setResets] = React.useState(0);

  return (
    <Column width={900}>
      <div data-lab-filter-panel="collapsed">
        <AxisCaption>collapsed — the region leaves the tab order and the AT tree</AxisCaption>
        <button
          type="button"
          data-testid="lab-filter-panel-before"
          style={{
            font: 'inherit',
            fontSize: '0.75rem',
            padding: '6px 12px',
            marginBlockEnd: 8,
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-elevated)',
            color: 'var(--ds-color-text-primary)',
          }}
        >
          Focus starts here
        </button>
        <PatternFilterPanel
          title="Roster filters"
          layout="stacked"
          collapsible
          defaultCollapsed
          activeCount={1}
          filters={PANEL_FILTERS}
          values={collapsedValues}
          onChange={setCollapsedValues}
          onReset={() => setCollapsedValues({})}
          showReset
        />
        <button
          type="button"
          data-testid="lab-filter-panel-after"
          style={{
            font: 'inherit',
            fontSize: '0.75rem',
            padding: '6px 12px',
            marginBlockStart: 8,
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-elevated)',
            color: 'var(--ds-color-text-primary)',
          }}
        >
          Next stop after the panel
        </button>
      </div>

      <div data-lab-filter-panel="wired">
        <AxisCaption>expanded, handlers present — both range bounds are named</AxisCaption>
        <PatternFilterPanel
          title="Candidate filters"
          layout="stacked"
          activeCount={4}
          filters={PANEL_FILTERS}
          values={wired}
          onChange={setWired}
          onReset={() => {
            setWired({});
            setResets((n) => n + 1);
          }}
          onApply={() => setApplied((n) => n + 1)}
          showReset
          showApply
        />
      </div>

      <div data-lab-filter-panel="handlerless">
        <AxisCaption>same flags, no handlers — no dead reset or apply is painted</AxisCaption>
        <PatternFilterPanel
          title="Read-only view"
          layout="stacked"
          activeCount={4}
          filters={PANEL_FILTERS}
          values={PANEL_VALUES}
          onChange={() => undefined}
          showReset
          showApply
        />
      </div>

      <Readout id="lab-filter-panel-readout">
        applies: {applied} / resets: {resets} / wired stage: {String(wired.stage ?? '(cleared)')}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 6. data/file-manager — honest cells, disabled toggles, one roving tab stop
// ---------------------------------------------------------------------------

/**
 * Row three carries an unparseable `modifiedAt` and row four a NEGATIVE size:
 * both used to reach the cell as real content ("Invalid Date", and a byte count
 * formatted as if it meant something). Both must resolve to the '--' placeholder.
 */
const FILES: FileItem[] = [
  {
    id: 'f-1',
    name: 'Q3-headcount-plan.xlsx',
    type: 'file',
    size: 284_910,
    modifiedAt: '2026-05-21T10:04:00.000Z',
  },
  {
    id: 'f-2',
    name: 'sala-norte-rigging-signoff.pdf',
    type: 'file',
    size: 1_842_003,
    modifiedAt: '2026-05-19T15:30:00.000Z',
  },
  {
    id: 'f-3',
    name: 'panel-scorecards-REQ-4821.csv',
    type: 'file',
    size: 7_420,
    modifiedAt: 'not-a-date',
  },
  {
    id: 'f-4',
    name: 'catering-invoice-ES-2210.pdf',
    type: 'file',
    size: -1,
    modifiedAt: '2026-05-11T08:47:00.000Z',
  },
];

const FOLDERS: FolderItem[] = [
  { id: 'd-1', name: 'Interview loops', type: 'folder', childCount: 12, modifiedAt: '2026-05-22T09:00:00.000Z' },
  { id: 'd-2', name: 'Venue compliance', type: 'folder', childCount: 5, modifiedAt: '2026-05-20T13:10:00.000Z' },
];

/**
 * FileManager — three postures.
 *
 * The LIST posture with a selection handler is where the cell repairs read:
 * sizes and dates go through the governed locale-aware formatters, and the two
 * poisoned rows show '--' instead of "Invalid Date" and a fictional byte count.
 *
 * The LIST posture WITHOUT `onSelectionChange` is the swallowed-click repair:
 * `handleSelect` early-returns there, so every checkbox now reads as disabled
 * instead of painting live and doing nothing.
 *
 * The GRID posture is the roving tab stop: every card used to be its own tab
 * stop, so a folder of N items cost N Tab presses. Exactly one card may carry
 * `tabIndex=0`, and the arrow cluster moves between them.
 */
function FileManagerHarness() {
  const [selected, setSelected] = React.useState<string[]>(['f-1']);

  return (
    <Column width={860}>
      <div data-lab-file-manager="list">
        <AxisCaption>list — unparseable dates and negative sizes resolve to the placeholder</AxisCaption>
        <PatternFileManager
          files={FILES}
          folders={FOLDERS}
          viewMode="list"
          currentPath={['Talent', 'REQ-4821']}
          selectedItems={selected}
          onSelectionChange={setSelected}
          onNavigate={() => undefined}
        />
      </div>

      <div data-lab-file-manager="readonly">
        <AxisCaption>no selection handler — the row toggle reads as disabled</AxisCaption>
        <PatternFileManager
          files={FILES.slice(0, 2)}
          folders={[]}
          viewMode="list"
          currentPath={['Talent', 'Archive']}
        />
      </div>

      <div data-lab-file-manager="grid">
        <AxisCaption>grid — one roving tab stop, arrows walk the group</AxisCaption>
        <PatternFileManager
          files={FILES}
          folders={FOLDERS}
          viewMode="grid"
          currentPath={['Talent', 'REQ-4821']}
          selectedItems={selected}
          onSelectionChange={setSelected}
          onNavigate={() => undefined}
        />
      </div>

      <Readout id="lab-file-manager-readout">selected: {selected.join(', ') || 'none'}</Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 7. navigation/environment-toggle — two instances, a real menu, a clamped panel
// ---------------------------------------------------------------------------

const SHORT_ENVIRONMENTS: EnvironmentDef[] = [
  { id: 'prod', name: 'Production', color: 'var(--ds-color-error)' },
  { id: 'staging', name: 'Staging', color: 'var(--ds-color-warning)' },
  { id: 'sandbox', name: 'Sandbox', color: 'var(--ds-color-success)', badge: 'LOCAL' },
];

/**
 * A deliberately LONG roster: the panel is absolutely positioned with a
 * min-inline-size floor and had no maximum on either axis, so a long list grew
 * past the viewport with no way to reach the last rows. The clamp is what this
 * roster measures.
 */
const LONG_ENVIRONMENTS: EnvironmentDef[] = [
  { id: 'prod', name: 'Production — Lisbon primary', color: 'var(--ds-color-error)' },
  { id: 'prod-eu', name: 'Production — Frankfurt replica', color: 'var(--ds-color-error)' },
  { id: 'staging', name: 'Staging — shared', color: 'var(--ds-color-warning)' },
  { id: 'staging-perf', name: 'Staging — performance rig', color: 'var(--ds-color-warning)' },
  { id: 'qa', name: 'QA — venue operations', color: 'var(--ds-color-info)' },
  { id: 'qa-talent', name: 'QA — talent pipeline', color: 'var(--ds-color-info)' },
  { id: 'demo', name: 'Demo — customer sandbox', color: 'var(--ds-color-success)', badge: 'DEMO' },
  { id: 'sandbox', name: 'Sandbox — Sala Norte fixtures', color: 'var(--ds-color-success)' },
  { id: 'local', name: 'Local — developer machine', color: 'var(--ds-color-success)', badge: 'LOCAL' },
];

/**
 * EnvironmentToggle — TWO dropdown instances on one page is the whole point of
 * the first repair: the panel id and the trigger's `aria-controls` were both
 * hardcoded to `env-toggle-panel`, so two toggles emitted duplicate DOM ids and
 * BOTH triggers resolved to the first panel. They are also the closed-state
 * proof: while a panel is unmounted its trigger must carry no `aria-controls` at
 * all, and that is readable in the very first frame.
 *
 * The second instance is pushed to the reading END of its row and carries the
 * long roster plus the production gate, which is where the panel clamp and the
 * "the gate is the only live layer" repair are observable.
 */
function EnvironmentToggleHarness() {
  const [first, setFirst] = React.useState('staging');
  const [second, setSecond] = React.useState('qa');
  const [pills, setPills] = React.useState('staging');

  return (
    <Column width={960}>
      <div data-lab-environment-toggle="first">
        <AxisCaption>instance A — short roster, no production gate</AxisCaption>
        <div data-testid="lab-env-first" style={{ ...OUTLINE_FRAME, minBlockSize: 260 }}>
          <PatternEnvironmentToggle
            environments={SHORT_ENVIRONMENTS}
            activeEnvironment={first}
            onChange={setFirst}
            variant="dropdown"
            productionId="prod"
          />
        </div>
      </div>

      <div data-lab-environment-toggle="second">
        <AxisCaption>instance B — long roster at the reading end, production gate armed</AxisCaption>
        <div
          data-testid="lab-env-second"
          style={{
            ...OUTLINE_FRAME,
            minBlockSize: 360,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <PatternEnvironmentToggle
            environments={LONG_ENVIRONMENTS}
            activeEnvironment={second}
            onChange={setSecond}
            variant="dropdown"
            productionId="prod"
            confirmProductionSwitch="Switching to Production affects live venue rosters. Continue?"
          />
        </div>
      </div>

      <div data-lab-environment-toggle="pills">
        <AxisCaption>pills variant — the gate hands focus back to the roving radio</AxisCaption>
        <div data-testid="lab-env-pills" style={OUTLINE_FRAME}>
          <PatternEnvironmentToggle
            environments={SHORT_ENVIRONMENTS}
            activeEnvironment={pills}
            onChange={setPills}
            variant="pills"
            productionId="prod"
            confirmProductionSwitch="Switching to Production affects live venue rosters. Continue?"
          />
        </div>
      </div>

      <Readout id="lab-environment-toggle-readout">
        instance A: {first} / instance B: {second} / pills: {pills}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 8. commerce/pricing-table — a frame that scrolls, headers that are headers
// ---------------------------------------------------------------------------

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    description: 'One venue, one recruiter',
    cta: 'Start free',
    priceNote: 'per month',
    features: {
      seats: '3 seats',
      venues: '1 venue',
      pipelines: '2 pipelines',
      scorecards: true,
      rostering: false,
      sso: false,
      audit: false,
      support: 'Community',
    },
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    description: 'Growing operations teams',
    cta: 'Choose Team',
    priceNote: 'per month',
    popular: true,
    features: {
      seats: '15 seats',
      venues: '5 venues',
      pipelines: 'Unlimited',
      scorecards: true,
      rostering: true,
      sso: false,
      audit: false,
      support: 'Business hours',
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 249,
    description: 'Multi-venue programmes',
    cta: 'Choose Business',
    priceNote: 'per month',
    features: {
      seats: '60 seats',
      venues: '25 venues',
      pipelines: 'Unlimited',
      scorecards: true,
      rostering: true,
      sso: true,
      audit: true,
      support: 'Priority',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Regulated and multi-region',
    cta: 'Contact sales',
    features: {
      seats: 'Unlimited',
      venues: 'Unlimited',
      pipelines: 'Unlimited',
      scorecards: true,
      rostering: true,
      sso: true,
      audit: true,
      support: 'Named partner',
    },
  },
];

const PRICING_FEATURES: PricingFeature[] = [
  { key: 'seats', label: 'Team seats', category: 'Capacity' },
  { key: 'venues', label: 'Managed venues', category: 'Capacity' },
  { key: 'pipelines', label: 'Hiring pipelines', category: 'Capacity' },
  { key: 'scorecards', label: 'Panel scorecards', category: 'Hiring' },
  { key: 'rostering', label: 'Shift rostering', category: 'Operations' },
  { key: 'sso', label: 'SAML single sign-on', category: 'Governance', description: 'Directory-backed sign-in with enforced session policy.' },
  { key: 'audit', label: 'Audit export', category: 'Governance' },
  { key: 'support', label: 'Support channel', category: 'Governance' },
];

/**
 * PricingTable — the comparison grid declared its scroll frame with
 * `overflow-inline`, which ships in Firefox and nowhere else, so on Chromium and
 * WebKit the frame declared no overflow at all: four plan columns against a
 * 12rem feature floor pushed the PAGE sideways instead of scrolling in place,
 * and the narrow-container sticky feature column had no scrollport to stick to.
 * Four plans is above the three-plan case the ledger measured, so the 360 and
 * 390 captures are the load-bearing ones here.
 *
 * The loading twin renders with EMPTY arrays on purpose: the skeleton used to be
 * derived from the very data that has not arrived, so first load painted an
 * empty box and reflowed the page when content landed. It must now show a fixed
 * three-column / five-row footprint.
 */
function PricingTableHarness() {
  const [cycle, setCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const [chosen, setChosen] = React.useState('none');

  return (
    <Column width={980}>
      <div data-lab-pricing-table="loading">
        <AxisCaption>first load, no data yet — the skeleton still has a footprint</AxisCaption>
        <PatternPricingTable
          loading
          plans={[]}
          features={[]}
          onBillingCycleChange={setCycle}
          billingCycle={cycle}
        />
      </div>

      <div data-lab-pricing-table="grid">
        <AxisCaption>four plans — the frame scrolls, the page does not</AxisCaption>
        <PatternPricingTable
          plans={PRICING_PLANS}
          features={PRICING_FEATURES}
          highlightedPlan="team"
          currency="€"
          billingCycle={cycle}
          onBillingCycleChange={setCycle}
          onSelectPlan={setChosen}
        />
      </div>

      <Readout id="lab-pricing-table-readout">
        cycle: {cycle} / selected plan: {chosen}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 9. navigation/workspace-switcher — menu rows with no nested control
// ---------------------------------------------------------------------------

const WORKSPACES: Workspace[] = [
  { id: 'ws-lisbon', name: 'Sala Norte — Lisbon', role: 'Admin', plan: 'Enterprise', unreadCount: 4, online: 12 },
  { id: 'ws-porto', name: 'Casa do Porto', role: 'Operations lead', plan: 'Business', unreadCount: 1, online: 5 },
  { id: 'ws-madrid', name: 'Teatro Delicias — Madrid', role: 'Member', plan: 'Business', online: 3 },
  { id: 'ws-talent', name: 'Talent programmes', role: 'Recruiter', plan: 'Team', unreadCount: 9, online: 8 },
  {
    id: 'ws-residency',
    name: 'Summer residency programme — Iberian venues',
    role: 'Programme lead',
    plan: 'Enterprise',
    online: 2,
  },
];

/**
 * WorkspaceSwitcher — the ARIA model was REPLACED, not patched.
 *
 * The panel was a `role="listbox"` whose `role="option"` rows CONTAINED the
 * focusable settings Button. A focusable descendant of an option is forbidden
 * (axe `nested-interactive`, serious) and a listbox has no legal slot for a
 * per-row control, so the listbox is gone: `role="menu"` now sits on the LIST
 * (not the panel, which also holds a header, a search, a create row and a user
 * block), rows are `role="menuitemradio"` carrying `aria-checked`, and each gear
 * is a `role="menuitem"` SIBLING under a `role="none"` row frame. Virtual focus
 * went with it — rows take real DOM focus under a roving tabindex, and the
 * search is a plain `searchbox` because a textbox may not own a menu popup.
 *
 * `onSettings` is supplied on BOTH specimens, and that is the whole point: the
 * gear only renders when it is, so this is exactly the configuration in which
 * the P1 used to exist. The proof is negative — every `role="menuitemradio"`
 * must contain ZERO focusable descendants, while the gear remains reachable as
 * its sibling.
 *
 * Two independent instances because `menuId` and every row id are `useId`-scoped:
 * they must not collide. They cannot be open at the same time (each panel's
 * outside-pointer guard dismisses the other), so that check is sequential.
 */
function WorkspaceSwitcherHarness() {
  const [railActive, setRailActive] = React.useState('ws-lisbon');
  const [headerActive, setHeaderActive] = React.useState('ws-porto');
  const [lastPath, setLastPath] = React.useState('none');

  return (
    <Column width={640}>
      <div data-lab-workspace-switcher="sidebar">
        <AxisCaption>sidebar rail — full anatomy: gears, create row, user block</AxisCaption>
        <div
          data-testid="lab-ws-sidebar"
          style={{ ...OUTLINE_FRAME, minBlockSize: 480 }}
        >
          {/* A real nav rail, not a full-width block: the sidebar panel anchors
              at the trigger's inline END above 30rem, so the rail width is what
              keeps the open panel inside the page at 768 and above. */}
          <div style={{ inlineSize: 'min(200px, 100%)' }}>
            <PatternWorkspaceSwitcher
              workspaces={WORKSPACES}
              activeWorkspaceId={railActive}
              position="sidebar"
              showCreateButton
              currentUser={{ name: 'Marta Oliveira', email: 'marta.oliveira@example.com' }}
              onSwitch={(id) => {
                setRailActive(id);
                setLastPath(`rail-switch:${id}`);
              }}
              onSettings={(id) => setLastPath(`rail-settings:${id}`)}
              onCreate={() => setLastPath('rail-create')}
            />
          </div>
        </div>
      </div>

      <div data-lab-workspace-switcher="header">
        <AxisCaption>header posture — a second instance; ids must not collide</AxisCaption>
        <div
          data-testid="lab-ws-header"
          style={{ ...OUTLINE_FRAME, minBlockSize: 420 }}
        >
          <div style={{ inlineSize: 'min(240px, 100%)' }}>
            <PatternWorkspaceSwitcher
              workspaces={WORKSPACES}
              activeWorkspaceId={headerActive}
              position="header"
              onSwitch={(id) => {
                setHeaderActive(id);
                setLastPath(`header-switch:${id}`);
              }}
              onSettings={(id) => setLastPath(`header-settings:${id}`)}
            />
          </div>
        </div>
      </div>

      <Readout id="lab-workspace-switcher-readout">
        rail: {railActive} / header: {headerActive} / last path: {lastPath}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// 10. feedback/empty-state — an illustration that fits, a skeleton that declares
// ---------------------------------------------------------------------------

/**
 * A 3:1 illustration drawn inline. The well is a SQUARE 6.25rem tile at
 * `size="lg"`, so aspect ratio is the whole point: under the old
 * `object-fit: cover` this asset was scaled until it filled the square and
 * both of its ends were cut away; under `contain` it lands whole and
 * letterboxed. A square placeholder would have proved nothing.
 */
const WIDE_ILLUSTRATION_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80">' +
      '<rect width="240" height="80" fill="#94a3b8"/>' +
      '<rect x="14" y="20" width="104" height="12" rx="6" fill="#e2e8f0"/>' +
      '<rect x="14" y="46" width="152" height="12" rx="6" fill="#e2e8f0"/>' +
      '<circle cx="204" cy="40" r="22" fill="#e2e8f0"/>' +
      '<rect x="196" y="32" width="16" height="16" rx="3" fill="#94a3b8"/>' +
      '</svg>'
  );

/** Everything the two roots share. Only `loading` differs between the bands. */
const EMPTY_STATE_COPY = {
  title: 'No open requisitions for this venue',
  description:
    'Requisitions appear here once an operations lead publishes a roster gap for the Sala Norte programme. Nothing is pending review.',
  image: WIDE_ILLUSTRATION_SRC,
  size: 'lg' as const,
};

/**
 * EmptyState — two roots, one prop set, two repairs.
 *
 * The ILLUSTRATION repair is the visual one and it reads only in band B: the
 * well is square, the asset is 3:1, and `object-fit` moved from `cover` (both
 * ends cropped away) to `contain` (the whole asset, letterboxed). The loading
 * branch never mounts the `<img>`, so band A cannot carry it.
 *
 * The SKELETON repair is a DOM claim, not a pixel one, and the caption says so.
 * The loading root used to hardcode `data-has-action={false}`; it now stamps
 * the same `data-visual` / `data-has-description` / `data-has-action` triple
 * the settled root computes from the identical props. No shipped rule consumes
 * those stamps yet — the loading root is still a flat 8rem against the settled
 * 18rem — so this band is judged on the attributes the Readout reports, and a
 * tenant that keys a footprint off them now gets a truthful one.
 *
 * The action tray is also the variant repair: `action` carries no explicit
 * variant, so it must resolve to `primary` and read as visibly heavier than
 * the `default` secondary beside it. Both used to paint identically.
 */
function EmptyStateHarness() {
  const [primaryClicks, setPrimaryClicks] = React.useState(0);
  const [secondaryClicks, setSecondaryClicks] = React.useState(0);

  const action = {
    label: 'Publish a roster gap',
    onClick: () => setPrimaryClicks((n) => n + 1),
  };
  const secondaryAction = {
    label: 'Open the venue calendar',
    onClick: () => setSecondaryClicks((n) => n + 1),
  };

  return (
    <Column width={880}>
      <div data-lab-empty-state="loading">
        <AxisCaption>first load — the skeleton stamps the anatomy the props declare</AxisCaption>
        <PatternEmptyState
          loading
          {...EMPTY_STATE_COPY}
          action={action}
          secondaryAction={secondaryAction}
        />
      </div>

      <div data-lab-empty-state="settled">
        <AxisCaption>settled — a 3:1 illustration fits the square well whole</AxisCaption>
        <PatternEmptyState
          {...EMPTY_STATE_COPY}
          action={action}
          secondaryAction={secondaryAction}
        />
      </div>

      <Readout id="lab-empty-state-illustration-and-skeleton-readout">
        bands: 2 / illustration: 240x80 in a square well / expected stamps on BOTH roots:
        data-visual=image, data-has-description=true, data-has-action=true / unlabelled
        primary resolves to data-variant=primary, secondary stays default / primary clicks:{' '}
        {primaryClicks} / secondary clicks: {secondaryClicks}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 11. identity/profile/user-profile-card — whole graphemes, honest affordance
// ---------------------------------------------------------------------------

/**
 * MATHEMATICAL SCRIPT CAPITAL A (U+1D49C) is a surrogate pair in UTF-16, so
 * `charAt(0)` returned half of it and the well painted a replacement glyph.
 * Written as an escape on purpose: a pasted literal is invisible in review.
 */
const ASTRAL_NAME = '\u{1D49C}lice Moreau';

/**
 * UserProfileCard — three bands, three states of one decision.
 *
 * Band A is the GRAPHEME repair and it is the visual of the three: no avatar
 * URL, so the well falls back to the initial, and `Intl.Segmenter` must hand
 * back the whole astral grapheme. Half a surrogate pair renders as a tofu box
 * in the same slot, which is exactly what a judge can see without reading code.
 *
 * Bands B and C are the AFFORDANCE repair, and it is a DOM claim: a clickable
 * card with no nested controls is promoted to `role="button"` + `tabIndex=0`
 * with Enter/Space wired, while a clickable card that owns an action tray must
 * stay a plain container — `role="button"` would make its own buttons
 * presentational and unreachable. B and C differ by exactly one prop, so the
 * gate is the only variable. Neither promotion paints differently at rest;
 * both are reported in the Readout and both are keyboard-drivable by a runner.
 */
function UserProfileCardHarness() {
  const [promotedActivations, setPromotedActivations] = React.useState(0);
  const [containerActivations, setContainerActivations] = React.useState(0);
  const [nestedActivations, setNestedActivations] = React.useState(0);

  const cardActions: ProfileAction[] = [
    {
      key: 'message',
      label: 'Message',
      variant: 'primary',
      onClick: () => setNestedActivations((n) => n + 1),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      onClick: () => setNestedActivations((n) => n + 1),
    },
  ];

  return (
    <Column width={880}>
      <div data-lab-user-profile-card="grapheme">
        <AxisCaption>astral-plane name — the initial is one whole grapheme</AxisCaption>
        <PatternUserProfileCard
          variant="full"
          user={{
            name: ASTRAL_NAME,
            role: 'Programme lead — Iberian residency',
            email: 'alice.moreau@example.com',
            department: 'Venue operations',
            status: 'away',
          }}
        />
      </div>

      <div data-lab-user-profile-card="promoted">
        <AxisCaption>onClick alone — the card becomes a real keyboard button</AxisCaption>
        <PatternUserProfileCard
          variant="full"
          user={{
            name: 'Diego Fernandes',
            role: 'Operations lead',
            email: 'diego.fernandes@example.com',
            department: 'Sala Norte',
            status: 'active',
          }}
          onClick={() => setPromotedActivations((n) => n + 1)}
        />
      </div>

      <div data-lab-user-profile-card="container">
        <AxisCaption>onClick plus actions — it stays a container so the controls survive</AxisCaption>
        <PatternUserProfileCard
          variant="full"
          user={{
            name: 'Ana Ruiz',
            role: 'Safety officer',
            email: 'ana.ruiz@example.com',
            department: 'Compliance',
            status: 'busy',
          }}
          actions={cardActions}
          onClick={() => setContainerActivations((n) => n + 1)}
        />
      </div>

      <Readout id="lab-user-profile-card-grapheme-and-affordance-readout">
        bands: 3 / band A initial: one grapheme from U+1D49C, avatar-initial code points must be 1
        / band B root: role=button, tabindex=0, zero nested controls / band C root: no role, no
        tabindex, 2 action buttons reachable / promoted activations: {promotedActivations} /
        container activations: {containerActivations} / nested action activations:{' '}
        {nestedActivations}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 12. shell/cockpit-header — an ordered trail and a held sticky posture
// ---------------------------------------------------------------------------

const COCKPIT_BREADCRUMBS: CockpitBreadcrumb[] = [
  { label: 'Venues', href: '/venues' },
  { label: 'Sala Norte', href: '/venues/sala-norte' },
  { label: 'REQ-4821 — Senior Venue Operations Lead' },
];

const COCKPIT_STATUS: CockpitStatus[] = [
  { label: 'Panel loop', variant: 'info' },
  { label: 'Inspection pending', variant: 'warning' },
];

/** Shared by both bands so the only difference between them is `loading`. */
const COCKPIT_PROPS = {
  title: 'REQ-4821 — Senior Venue Operations Lead',
  subtitle: 'Two panel slots confirmed, safety-officer slot outstanding',
  breadcrumbs: COCKPIT_BREADCRUMBS,
  status: COCKPIT_STATUS,
  sticky: true as const,
};

/**
 * CockpitHeader — the loading root and its settled twin under one prop set.
 *
 * The TRAIL repair is anatomy: three crumbs used to be a flat run of
 * `React.Fragment` siblings with no list semantics at all. They are now an
 * `<ol role="list">` of `<li data-part="crumb-item">`, the first crumb carries
 * no separator, the terminal crumb is not a link and holds
 * `aria-current="page"`, and the `<nav>` took `tabIndex=0` because it is a
 * scrollable region with a hidden scrollbar whose overflowed tail was
 * otherwise unreachable. The skin reproduces the historical 8px rhythm
 * deliberately, so this is a DOM-tree proof, not a pixel one.
 *
 * The POSTURE repair is what the two bands compare: the loading root now
 * stamps `data-sticky` and `data-compact`, and the skin hangs
 * `position: sticky` off `data-sticky='true'`. Without the stamp a sticky
 * header un-stuck itself for the duration of the load and jumped into place
 * when content arrived. Both roots must read `data-sticky="true"` here.
 *
 * The 20px hysteresis band (enter at 60, exit at 40) is NOT provable in a
 * still. It only exists across a sequence of scroll positions — 61, then 50
 * holding compact, then 30, then 50 holding resting — and a single frame
 * cannot distinguish a held posture from a re-entered one. This scene is
 * captured at scroll 0, where both bands rest and `data-compact` is `false`;
 * the hysteresis stays with the unit suite and is reported as unproven here.
 */
function CockpitHeaderHarness() {
  const [exports, setExports] = React.useState(0);

  const actions = (
    <button
      type="button"
      data-testid="lab-cockpit-header-action"
      onClick={() => setExports((n) => n + 1)}
      style={{
        font: 'inherit',
        fontSize: '0.75rem',
        padding: '6px 12px',
        borderRadius: 'var(--ds-radius-md, 8px)',
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        color: 'var(--ds-color-text-primary)',
        cursor: 'pointer',
      }}
    >
      Export the loop
    </button>
  );

  return (
    <Column width={900}>
      <div data-lab-cockpit-header="loading">
        <AxisCaption>loading — the sticky posture is stamped, not dropped</AxisCaption>
        <PatternCockpitHeader loading {...COCKPIT_PROPS} actions={actions} />
      </div>

      <div data-lab-cockpit-header="settled">
        <AxisCaption>settled — three crumbs as an ordered list, terminal crumb is not a link</AxisCaption>
        <PatternCockpitHeader {...COCKPIT_PROPS} actions={actions} />
      </div>

      <Readout id="lab-cockpit-header-trail-and-posture-readout">
        bands: 2 / crumbs: 3, separators: 2, terminal crumb aria-current=page and not an anchor /
        breadcrumb nav tabindex: 0 / both roots data-sticky=true / captured at scroll 0 so both
        read data-compact=false / hysteresis (enter 60, exit 40) is scroll-dependent and NOT
        proven by this still / action clicks: {exports}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 13. shell/workbench-header — the skeleton reserves what the props declare
// ---------------------------------------------------------------------------

const WORKBENCH_QUICK_ACTIONS: WorkbenchQuickAction[] = [
  { label: 'Publish roster', variant: 'primary', onClick: () => undefined },
  { label: 'Assign cover', onClick: () => undefined },
  { label: 'Escalate', variant: 'danger', onClick: () => undefined },
];

const WORKBENCH_SAVED_VIEWS: WorkbenchSavedView[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'exceptions', label: 'Exceptions only' },
];

/**
 * WorkbenchHeader — the strongest visual of the six, and it needs no
 * interaction, no locale and no media emulation.
 *
 * The defect was a FIXED skeleton: every loading header painted an avatar
 * circle, a title bar, a subtitle bar, exactly two action blocks and a tab
 * strip, whatever the caller had actually passed. Band A is a header whose
 * only prop is a title — its skeleton must now be ONE title bar, where it used
 * to paint six blocks of furniture that band B then deletes on settle. Band B
 * is that same title-only header settled, so the judge can see there was never
 * an avatar, a subtitle, an action or a tab to reserve.
 *
 * Band C is the contrast that makes A legible: the full anatomy — icon,
 * eyebrow, subtitle, THREE quick actions and a saved-views strip — loading.
 * Three action blocks, one per action, is itself the second half of the
 * repair: the count was hardcoded to two, so a three-action header
 * under-reserved and shifted sideways on settle.
 *
 * A-vs-C is the proof. Identical component, identical `loading`, and the
 * skeletons differ because the props differ. The pre-repair build would have
 * rendered A and C nearly the same.
 */
function WorkbenchHeaderHarness() {
  const [view, setView] = React.useState('week');

  return (
    <Column width={900}>
      <div data-lab-workbench-header="minimal-loading">
        <AxisCaption>title only, loading — one bar, nothing it will never fill</AxisCaption>
        <PatternWorkbenchHeader loading title="Venue operations briefing" />
      </div>

      <div data-lab-workbench-header="minimal-settled">
        <AxisCaption>title only, settled — the anatomy the band above reserved</AxisCaption>
        <PatternWorkbenchHeader title="Venue operations briefing" />
      </div>

      <div data-lab-workbench-header="full-loading">
        <AxisCaption>full anatomy, loading — three action blocks, one per action</AxisCaption>
        <PatternWorkbenchHeader
          loading
          title="Venue operations briefing"
          eyebrow="Sala Norte"
          subtitle="Two front-of-house gaps before Friday's publish"
          icon={<span aria-hidden="true">•</span>}
          exceptionCount={12}
          quickActions={WORKBENCH_QUICK_ACTIONS}
          savedViews={WORKBENCH_SAVED_VIEWS}
          activeViewId={view}
          onViewChange={setView}
        />
      </div>

      <Readout id="lab-workbench-header-skeleton-footprint-readout">
        bands: 3 / band A skeleton blocks: 1 (data-size=title), data-has-icon=false,
        data-has-actions=false, data-has-tabs=false, aria-busy=true / band C skeleton blocks: 8 =
        avatar + eyebrow + title + subtitle + 3 action + tabs, data-has-icon=true,
        data-has-actions=true, data-has-tabs=true / bands A and B must agree on all three
        data-has-* stamps / active view: {view}
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 14. data/decision-comparison — titles that wrap, values that mirror
// ---------------------------------------------------------------------------

/**
 * The title is a bare text node carrying a long unbreakable token. The base
 * skin gave the wrap contract to ELEMENT children only, so a plain string
 * inherited nothing but the `overflow: hidden` box and its token was cut. The
 * subtitle and scoreLabel are long on purpose too: their base rule is
 * `white-space: nowrap` + ellipsis above 47.9375rem, and the modern rule
 * replaces it with a two-line clamp — the loudest of the six CSS repairs.
 */
const DECISION_SUBJECTS: DecisionComparisonSubject[] = [
  {
    key: 'moreau',
    title:
      'Alice Moreau — REQ-4821_Senior_Venue_Operations_Lead_Iberian_Residency_Programme',
    subtitle:
      'Programme lead, Iberian residency — currently covering Sala Norte and Casa do Porto through the summer season',
    score: '86',
    scoreLabel:
      'Weighted against the operations rubric, band 6, including the on-call supplement and weekend availability',
    leading: true,
    facts: [
      { key: 'availability', label: 'Weekend availability', value: '38 of 42 dates', tone: 'positive' },
      { key: 'venues', label: 'Venues managed', value: '2 (Lisbon, Porto)', tone: 'neutral' },
      { key: 'notice', label: 'Notice period', value: '8 weeks', tone: 'warning' },
      {
        key: 'compensation',
        label: 'Compensation band',
        value: 'Band 6 + on-call',
        tone: 'neutral',
        supporting: 'Approved without conditions',
      },
    ],
  },
  {
    key: 'fernandes',
    title: 'Diego Fernandes — REQ-4821_Front_of_House_Operations_Secondment',
    subtitle:
      'Operations lead, Sala Norte — internal secondment, already cleared for the July roster and the rigging inspection',
    score: '79',
    scoreLabel:
      'Weighted against the operations rubric, band 5, excluding the on-call supplement pending compensation review',
    facts: [
      { key: 'availability', label: 'Weekend availability', value: '31 of 42 dates', tone: 'neutral' },
      { key: 'venues', label: 'Venues managed', value: '1 (Lisbon)', tone: 'neutral' },
      { key: 'notice', label: 'Notice period', value: 'Immediate', tone: 'positive' },
      {
        key: 'compensation',
        label: 'Compensation band',
        value: 'Band 5',
        tone: 'critical',
        supporting: 'On-call supplement not yet approved',
      },
    ],
  },
];

/**
 * DecisionComparison — the only family of the six whose repair is entirely
 * CSS. There is no engine diff: the modern "engine" is a wrapper that stamps
 * `ds-engine-modern`, and every repaired declaration hangs off that class in
 * the shared skin. Its unit suite never renders a DOM at all — it parses the
 * CSS text and computes cascade winners — so this scene is the first evidence
 * that the winning declarations produce the intended PIXELS.
 *
 * Band A is LTR and carries both wrap repairs: an unbreakable token in a plain
 * string title that must break instead of being cut, and a subtitle plus score
 * label that must clamp to two lines instead of ending in a single-line
 * ellipsis. The band is wide on purpose — above 47.9375rem the base rule is
 * `nowrap`, and below it the shared narrow query already relaxes on its own,
 * which would hide the repair.
 *
 * Band B is the same content under `dir="rtl"`. The shared rule forced the
 * fact-value column to `start` in RTL, double-correcting an alignment that was
 * already writing-mode aware, so values landed back on the physical right and
 * collided with their own labels. The modern rule restores `end`. Copy is held
 * constant between the bands so direction is the only variable.
 *
 * The other three CSS repairs in this family are out of reach of a still: the
 * reduced-motion override and the forced-colors tone dot need media emulation,
 * and the density floors are invisible until `--ds-density-effective-scale`
 * leaves 1.
 */
function DecisionComparisonHarness() {
  return (
    <Column width={980}>
      <div data-lab-decision-comparison="ltr">
        <AxisCaption>ltr — an unbreakable title token wraps, subtitle clamps to two lines</AxisCaption>
        <div style={OUTLINE_FRAME}>
          <PatternDecisionComparison
            subjects={DECISION_SUBJECTS}
            context="Panel debrief — REQ-4821"
            contextMeta="Operations rubric v4"
            ariaLabel="Candidate comparison, left to right"
            density="comfortable"
          />
        </div>
      </div>

      <div data-lab-decision-comparison="rtl">
        <AxisCaption>rtl — fact values mirror to the leading edge, clear of the labels</AxisCaption>
        <div dir="rtl" style={OUTLINE_FRAME}>
          <PatternDecisionComparison
            subjects={DECISION_SUBJECTS}
            context="Panel debrief — REQ-4821"
            contextMeta="Operations rubric v4"
            ariaLabel="Candidate comparison, right to left"
            density="comfortable"
          />
        </div>
      </div>

      <Readout id="lab-decision-comparison-wrap-and-rtl-readout">
        bands: 2 / subjects: 2 / facts per subject: 4 / band A dir=ltr, band B dir=rtl, identical
        copy / title is a plain string with an unbreakable token: it must break, never clip /
        subtitle and score-label must render two lines, never one ellipsis / band B fact-value
        text-align and justify-items must both resolve to end / reduced-motion, forced-colors and
        the density floors are NOT proven by this still
      </Readout>
    </Column>
  );
}

// ---------------------------------------------------------------------------
// 15. data/record-facts — the narrow description survives, the skeleton fits
// ---------------------------------------------------------------------------

/**
 * `span: 4` puts three facts on a row, which is the same track
 * `.ds-record-facts__skeleton` occupies (`grid-column: span 4`), so the
 * loading and settled bands compare row-for-row rather than approximately.
 * Three facts against the engine's three fixed skeleton rows. The first label
 * is long: it used to be cut to one ellipsised line and now wraps to two.
 */
const RECORD_FACTS: RecordFact[] = [
  {
    key: 'inspection',
    label: 'Rigging inspection window and safety-officer sign-off',
    value: '12 July 2026',
    span: 4,
    supporting: 'Rebooked once',
  },
  { key: 'covers', label: 'Confirmed covers', value: '240', span: 4 },
  { key: 'owner', label: 'Programme owner', value: 'Ana Ruiz', span: 4, emphasis: 'strong' },
];

const RECORD_DESCRIPTION =
  'What this section covers: the operational facts a venue lead needs before publishing the July roster, including the outstanding safety sign-off.';

/**
 * RecordFacts — like decision-comparison, a CSS-only repair behind a wrapper
 * that only stamps `ds-engine-modern`, whose unit suite parses stylesheets
 * instead of rendering. Two independent defects, three bands.
 *
 * The NARROW band is the first: below a 560px container the shared skin set
 * the section description to `display: none` — the one line explaining what
 * the section IS vanished exactly where the reader had the least context. The
 * modern rule, winning on `@layer` order rather than specificity, replaces
 * that with a two-line clamp. The root itself declares
 * `container-type: inline-size`, so a 520px wrapper is enough to arm the query
 * with no container ancestor of its own. The band's width is set explicitly
 * and framed so the judge can see it is genuinely under the breakpoint.
 *
 * The LOADING and SETTLED bands are the second, and it reproduces on default
 * props with no density override: the shared skin hardcoded the skeleton row
 * to the COMPACT 70px floor while a default comfortable board renders 82px
 * facts, so every first load settled downward. Both bands sit at 720px — above
 * 560px — because the narrow query collapses fact and skeleton to one shared
 * 68px floor and would erase the very difference under test. They are stacked
 * rather than side by side for the same reason: two 560px+ halves do not fit
 * the scene frame.
 */
function RecordFactsHarness() {
  return (
    <Column width={980}>
      <div data-lab-record-facts="narrow">
        <AxisCaption>520px container — the description clamps instead of vanishing</AxisCaption>
        <div style={{ ...OUTLINE_FRAME, inlineSize: 520, maxInlineSize: '100%' }}>
          <PatternRecordFacts
            title="Sala Norte — July roster"
            description={RECORD_DESCRIPTION}
            facts={RECORD_FACTS}
          />
        </div>
      </div>

      <div data-lab-record-facts="loading">
        <AxisCaption>720px, loading — three skeleton rows at the comfortable floor</AxisCaption>
        <div style={{ inlineSize: 720, maxInlineSize: '100%' }}>
          <PatternRecordFacts
            loading
            title="Sala Norte — July roster"
            description={RECORD_DESCRIPTION}
            facts={RECORD_FACTS}
          />
        </div>
      </div>

      <div data-lab-record-facts="settled">
        <AxisCaption>720px, settled — the rows land at the height the skeleton reserved</AxisCaption>
        <div style={{ inlineSize: 720, maxInlineSize: '100%' }}>
          <PatternRecordFacts
            title="Sala Norte — July roster"
            description={RECORD_DESCRIPTION}
            facts={RECORD_FACTS}
          />
        </div>
      </div>

      <Readout id="lab-record-facts-narrow-description-readout">
        bands: 3 / narrow band container: 520px, under the 560px query — description must be
        visible and clamped to 2 lines, never display:none / wide bands: 720px, above the query /
        density: comfortable (default), data-density=comfortable / skeleton rows: 3, facts: 3,
        both span 4 / skeleton min-height and fact min-height must both resolve to 82px
      </Readout>
    </Column>
  );
}

const TITLES: Record<PatternBehaviorCase, string> = {
  'live-feed-shell-continuity': 'live feed — shell continuity across the skeleton swap',
  'comment-thread-disclosure-truncation': 'comment thread — disclosure state and the depth cap',
  'activity-log-diff-and-busy': 'activity log — diff honesty and the busy swap',
  'notification-center-row-actions': 'notification center — row actions and the capped list',
  'filter-panel-collapsed-inert': 'filter panel — collapsed is inert, actions need handlers',
  'file-manager-locale-and-roving': 'file manager — honest cells and one roving tab stop',
  'environment-toggle-menu-semantics': 'environment toggle — instance ids and a real menu',
  'pricing-table-comparison-semantics': 'pricing table — a frame that scrolls, headers that are headers',
  'workspace-switcher-row-model': 'workspace switcher — menu rows with no nested control',
  'empty-state-illustration-and-skeleton':
    'empty state — an illustration that fits, a skeleton that declares',
  'user-profile-card-grapheme-and-affordance':
    'user profile card — whole graphemes and an honest affordance',
  'cockpit-header-trail-and-posture':
    'cockpit header — an ordered trail and a held sticky posture',
  'workbench-header-skeleton-footprint':
    'workbench header — the skeleton reserves what the props declare',
  'decision-comparison-wrap-and-rtl': 'decision comparison — titles that wrap, values that mirror',
  'record-facts-narrow-description':
    'record facts — the narrow description survives, the skeleton fits',
};

const AXES: Record<PatternBehaviorCase, string> = {
  'live-feed-shell-continuity': 'the header survives first load; the bounded scroller is reachable',
  'comment-thread-disclosure-truncation': 'capped replies are counted; the composer owns and returns focus',
  'activity-log-diff-and-busy': 'the filter bar outlives the refetch; both diff sides are named',
  'notification-center-row-actions': 'each row names its own control; the remainder is reported',
  'filter-panel-collapsed-inert': 'a collapsed panel is unreachable; no handler, no button',
  'file-manager-locale-and-roving': 'absent data reads as absent; the grid is one composite widget',
  'environment-toggle-menu-semantics': 'two panels, two ids; no reference while closed',
  'pricing-table-comparison-semantics': 'the grid scrolls in its frame and every header is scoped',
  'workspace-switcher-row-model': 'menuitemradio rows hold no focusable descendant; the gear is a sibling',
  'empty-state-illustration-and-skeleton':
    'a 3:1 illustration fits the square well whole; both roots stamp one anatomy',
  'user-profile-card-grapheme-and-affordance':
    'the initial is a whole grapheme; only a card without nested controls becomes a button',
  'cockpit-header-trail-and-posture':
    'the trail is an ordered list with a terminal crumb; loading keeps the sticky stamp',
  'workbench-header-skeleton-footprint':
    'a title-only skeleton is one bar; a full one reserves three actions and a strip',
  'decision-comparison-wrap-and-rtl':
    'a plain-string title breaks instead of clipping; rtl values mirror clear of the labels',
  'record-facts-narrow-description':
    'under 560px the description clamps instead of vanishing; the skeleton row matches the fact floor',
};

function CaseBody({ only }: { only: PatternBehaviorCase }) {
  switch (only) {
    case 'live-feed-shell-continuity':
      return <LiveFeedShellHarness />;
    case 'comment-thread-disclosure-truncation':
      return <CommentThreadHarness />;
    case 'activity-log-diff-and-busy':
      return <ActivityLogHarness />;
    case 'notification-center-row-actions':
      return <NotificationCenterHarness />;
    case 'filter-panel-collapsed-inert':
      return <FilterPanelHarness />;
    case 'file-manager-locale-and-roving':
      return <FileManagerHarness />;
    case 'environment-toggle-menu-semantics':
      return <EnvironmentToggleHarness />;
    case 'pricing-table-comparison-semantics':
      return <PricingTableHarness />;
    case 'workspace-switcher-row-model':
      return <WorkspaceSwitcherHarness />;
    case 'empty-state-illustration-and-skeleton':
      return <EmptyStateHarness />;
    case 'user-profile-card-grapheme-and-affordance':
      return <UserProfileCardHarness />;
    case 'cockpit-header-trail-and-posture':
      return <CockpitHeaderHarness />;
    case 'workbench-header-skeleton-footprint':
      return <WorkbenchHeaderHarness />;
    case 'decision-comparison-wrap-and-rtl':
      return <DecisionComparisonHarness />;
    case 'record-facts-narrow-description':
      return <RecordFactsHarness />;
    default:
      return null;
  }
}

/**
 * One case per render. The route passes `only`, so a capture frames exactly one
 * family and a predicate never has to disambiguate between two specimens of the
 * same pattern on one page.
 */
export function PatternBehaviorScene({ only }: { only: PatternBehaviorCase }) {
  return (
    <SceneFrame title={TITLES[only]}>
      <SpecimenRow axis={AXES[only]}>
        <div data-testid={`lab-${only}`} style={{ inlineSize: 'min(1000px, 100%)' }}>
          <CaseBody only={only} />
        </div>
      </SpecimenRow>
      <Vignette label={only}>
        <p style={{ font: 'inherit', fontSize: '0.75rem', opacity: 0.55, margin: 0 }}>
          Rendered under the segment’s BrandTheme. The specimen above is the judged band; this
          note carries no tenant identity of its own.
        </p>
      </Vignette>
    </SceneFrame>
  );
}
