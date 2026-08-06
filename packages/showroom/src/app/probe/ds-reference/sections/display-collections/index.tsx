'use client';

/**
 * DISPLAY — COLLECTIONS scene — Table + List + Tree + Timeline + Calendar.
 *
 * Five families grouped because each renders MANY repeating units from one
 * data source — rows, items, nodes, events, days — as opposed to
 * `display-surfaces` (one bounded fact/message block). This is also the
 * group most exposed to real content length, so instead of a separate
 * "content torture" row per family (the pattern in `display-labels` and
 * `display-surfaces`), each family's ONE realistic specimen already mixes in
 * a long/unbroken entry among its normal rows — a table with a mostly-short
 * "notes" column except one long one, a tree with one long node title, and so
 * on. That is closer to how these families actually fail in production (one
 * unusually long record among many ordinary ones), and it is what "a
 * specimen ... including at least one long-content case" calls for literally.
 *
 * READINESS MARKERS. Same technique as the other new display scenes: each
 * family's primary specimen is wrapped in a plain
 * `data-testid="lab-display-<family>"` span/div this scene owns, independent
 * of the internal DOM/class names three other lanes are rewriting
 * concurrently. See `capture-lab.mjs` READINESS['display-collections'].
 */

import { Avatar, Button, Calendar, List, Table, Timeline, Tree } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, TORTURE_CONTENT, Vignette } from '../../chrome';

interface ReviewRow {
  id: string;
  name: string;
  email: string;
  role: string;
  notes: string;
}

const REVIEW_ROWS: ReviewRow[] = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.org', role: 'Reviewer', notes: 'On track' },
  { id: '2', name: 'Sam Lee', email: 'sam@example.org', role: 'Approver', notes: 'On track' },
  { id: '3', name: 'Kim Park', email: 'kim@example.org', role: 'Reviewer', notes: TORTURE_CONTENT.longLabel },
  { id: '4', name: 'Alex Ito', email: 'alex@example.org', role: 'Approver', notes: TORTURE_CONTENT.unbroken },
];

const REVIEW_COLUMNS = [
  { title: 'Name', dataIndex: 'name', sorter: true },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Role', dataIndex: 'role' },
  { title: 'Notes', dataIndex: 'notes' },
];

const REVIEWERS = [
  { name: 'Jane Doe', email: 'Reviewer, Finance' },
  { name: 'Sam Lee', email: 'Approver, Operations' },
  { name: 'Kim Park', email: TORTURE_CONTENT.longParagraph },
];

const TREE_DATA = [
  {
    key: '1',
    title: 'Finance',
    children: [
      { key: '1-1', title: 'Q3 2026 reconciliation' },
      { key: '1-2', title: TORTURE_CONTENT.longLabel },
      {
        key: '1-3',
        title: 'Budget review',
        children: [{ key: '1-3-1', title: 'Committee sign-off' }],
      },
    ],
  },
  {
    key: '2',
    title: 'Operations',
    children: [{ key: '2-1', title: TORTURE_CONTENT.unbroken }],
  },
];

export function DisplayCollectionsScene() {
  return (
    <SceneFrame title="display — collections: table + list + tree + timeline + calendar">
      {/* ---- Table ---- */}
      <SpecimenRow axis="table — reviewer roster (sortable name, notes column carries long + unbroken content)">
        <div data-testid="lab-display-table" style={{ minInlineSize: 320, maxInlineSize: '100%' }}>
          <Table<ReviewRow>
            dataSource={REVIEW_ROWS}
            columns={REVIEW_COLUMNS}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </div>
      </SpecimenRow>

      {/* ---- List ---- */}
      <SpecimenRow axis="list — reviewer roster with avatar/title/description meta, actions (one long description)">
        <div data-testid="lab-display-list" style={{ minInlineSize: 300, maxInlineSize: 420 }}>
          <List
            dataSource={REVIEWERS}
            bordered
            renderItem={(user) => (
              <List.Item actions={[<Button key="edit" variant="ghost">Edit</Button>]}>
                <List.Item.Meta
                  avatar={<Avatar name={user.name} tone="primary" />}
                  title={user.name}
                  description={user.email}
                />
              </List.Item>
            )}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </SpecimenRow>

      {/* ---- Tree ---- */}
      <SpecimenRow axis="tree — nested categories, checkable, connecting lines (one long, one unbroken node title)">
        <div data-testid="lab-display-tree" style={{ minInlineSize: 260, maxInlineSize: 380 }}>
          <Tree treeData={TREE_DATA} checkable showLine defaultExpandedKeys={['1', '1-3']} />
        </div>
      </SpecimenRow>

      {/* ---- Timeline ---- */}
      <SpecimenRow axis="timeline — alternating mode, colored events, pending (one long entry)">
        <div data-testid="lab-display-timeline" style={{ minInlineSize: 320, maxInlineSize: 480 }}>
          <Timeline mode="alternate" pending="Awaiting final sign-off">
            <Timeline.Item color="green" label="2026-07-01">
              Submitted for review
            </Timeline.Item>
            <Timeline.Item color="blue" label="2026-07-03">
              Approved by finance
            </Timeline.Item>
            <Timeline.Item color="warning" label="2026-07-10">
              {TORTURE_CONTENT.longParagraph}
            </Timeline.Item>
            <Timeline.Item color="gray" label="2026-07-12">
              {TORTURE_CONTENT.unbroken}
            </Timeline.Item>
          </Timeline>
        </div>
      </SpecimenRow>

      {/* ---- Calendar ---- */}
      {/* Compact (non-fullscreen) panel with one day carrying an unbroken
          event-label token — the calendar's failure mode for long content is a
          single day cell overflowing its grid box, not paragraph wrap, so the
          unbroken token is the correct torture case here (not longParagraph). */}
      <SpecimenRow axis="calendar — month panel, fixed date, one day carries an unbroken event label">
        <div data-testid="lab-display-calendar" style={{ minInlineSize: 280, maxInlineSize: 360 }}>
          <Calendar
            defaultValue={new Date('2026-08-15T00:00:00')}
            mode="month"
            fullscreen={false}
            cellRender={(date) =>
              date.getDate() === 15 ? (
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.625rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {TORTURE_CONTENT.unbroken}
                </span>
              ) : null
            }
          />
        </div>
      </SpecimenRow>

      {/* ---- Composition vignette ---- */}
      <Vignette label="review workspace — roster beside category tree">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ minInlineSize: 300, maxInlineSize: 420, flex: '1 1 360px' }}>
            <Table<ReviewRow>
              dataSource={REVIEW_ROWS.slice(0, 3)}
              columns={REVIEW_COLUMNS.slice(0, 3)}
              rowKey="id"
              pagination={false}
              size="sm"
            />
          </div>
          <div style={{ minInlineSize: 220, maxInlineSize: 280 }}>
            <Tree treeData={TREE_DATA} defaultExpandedKeys={['1']} />
          </div>
        </div>
      </Vignette>
    </SceneFrame>
  );
}
