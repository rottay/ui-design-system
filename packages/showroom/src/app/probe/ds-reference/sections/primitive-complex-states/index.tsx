'use client';

/**
 * PRIMITIVE COMPLEX STATES — capture scenes for the nineteen elevated Modern primitive
 * families.
 *
 * Every case here is configured so the SPECIFIC repaired behaviour is what a
 * capture and its predicate see, not a generic render of the family. A
 * Timeline is not "a timeline": it is a single-sided timeline whose dead track
 * used to eat half the measure. A List is not "a list": it is a loading list
 * beside its own loaded twin, because the repair is that the two now carry the
 * same frame. Where a state is reachable through props it IS reached through
 * props; the cases that genuinely need a keystroke or a scroll carry a
 * fixture-owned readout so the post-interaction frame is self-describing.
 *
 * Content is realistic recruiting / venue-operations copy: This probe judges rhythm
 * under real strings, and a scene padded with lorem cannot show whether a
 * description list, a step track or a breadcrumb trail survives its own
 * content. Every wrapper is `min(Xpx, 100%)` so the 390 capture never
 * overflows the page.
 */

import React from 'react';

import {
  Affix,
  Anchor,
  BackTop,
  Breadcrumb,
  Calendar,
  ContextMenu,
  Descriptions,
  Dropdown,
  FloatButton,
  InputNumber,
  List,
  Modal,
  PasswordInput,
  Popconfirm,
  Stepper,
  Steps,
  Switch,
  Timeline,
  TreeSelect,
} from '@rottay/design-system';

import { AxisCaption, SceneFrame, SpecimenRow, Vignette } from '../../chrome';

export type PrimitiveComplexStateCase =
  | 'timeline-track-collapse'
  | 'calendar-controlled-panel'
  | 'descriptions-responsive-columns'
  | 'list-loading-continuity'
  | 'switch-busy-tab-stop'
  | 'contextmenu-submenu-focus'
  | 'popconfirm-disclosure-toggle'
  | 'affix-container-edge'
  | 'anchor-confined-jump'
  | 'breadcrumb-trail-parking'
  | 'modal-describedby-merge'
  | 'treeselect-cleared-placeholder'
  | 'inputnumber-typing-draft'
  | 'passwordinput-filled-state'
  | 'dropdown-stacked-escape'
  | 'backtop-duration'
  | 'floatbutton-disclosure'
  | 'stepper-content-panels'
  | 'steps-status-name';

// ---------------------------------------------------------------------------
// Fixture furniture
// ---------------------------------------------------------------------------

/** Small fixture-owned readout. Mirrors the primitive-state-repairs / component-behaviors idiom. */
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

/** A plain fixture-owned control. Deliberately not a DS Button: several cases
 *  assert focus ownership, and an unstyled native button keeps the assertion
 *  about the family under test rather than about the button beside it. */
function LabButton({
  id,
  onClick,
  children,
}: {
  id: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid={id}
      onClick={onClick}
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
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Harnesses
// ---------------------------------------------------------------------------

/**
 * Timeline — three postures in one specimen. `left` (the contract default) and
 * `right` are single-sided and must collapse the opposite track; `alternate`
 * occupies both. The pending row belongs to the same sequence, so it takes the
 * mode's NEXT side instead of a fixed one, and the rail seam between the last
 * real row and it must be closed.
 */
function TimelineTrackHarness() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, inlineSize: 'min(620px, 100%)' }}>
      <div data-lab-timeline="left">
        <AxisCaption>mode=left (default) — one occupied track</AxisCaption>
        <Timeline
          items={[
            { children: 'Application received from the Lisbon careers page' },
            { children: 'Recruiter screen booked with Marta Oliveira for Thursday 14:00' },
            { children: 'Take-home exercise returned and scored by the panel', color: 'success' },
          ]}
        />
      </div>

      <div data-lab-timeline="alternate">
        <AxisCaption>mode=alternate — both tracks occupied</AxisCaption>
        <Timeline
          mode="alternate"
          items={[
            { children: 'Venue walkthrough completed at Sala Norte' },
            { children: 'Catering headcount confirmed at 240 covers' },
            { children: 'Rigging plan signed off by the safety officer', color: 'success' },
          ]}
        />
      </div>

      <div data-lab-timeline="pending">
        <AxisCaption>mode=right + pending — pending row joins the sequence</AxisCaption>
        <Timeline
          mode="right"
          pending="Awaiting hiring-manager sign-off"
          items={[
            { children: 'Offer package drafted by compensation' },
            { children: 'Background check cleared', color: 'success' },
          ]}
        />
      </div>
    </div>
  );
}

/**
 * Calendar — the panel is now genuinely OWNER-DRIVEN. `mode` was read once at
 * mount, so a toolbar that drove the view could never move it; a controlled
 * `value` that jumped to another month left the calendar paged where it was,
 * with the selected day off-panel entirely. Both are driven from fixture state
 * here, and `onPanelChange` counts every page move the header makes.
 */
function CalendarPanelHarness() {
  const [mode, setMode] = React.useState<'month' | 'year'>('month');
  const [value, setValue] = React.useState(() => new Date(2026, 0, 20));
  const [panelSignals, setPanelSignals] = React.useState(0);
  const [lastPanel, setLastPanel] = React.useState('none');

  const handlePanelChange = React.useCallback((date: Date, nextMode: 'month' | 'year') => {
    setPanelSignals((n) => n + 1);
    setLastPanel(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')} ${nextMode}`);
  }, []);

  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <Calendar
        mode={mode}
        value={value}
        fullscreen={false}
        onPanelChange={handlePanelChange}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBlockStart: 12 }}>
        <LabButton
          id="lab-calendar-mode"
          onClick={() => setMode((current) => (current === 'month' ? 'year' : 'month'))}
        >
          Toggle owner-driven view
        </LabButton>
        <LabButton id="lab-calendar-jump" onClick={() => setValue(new Date(2026, 5, 3))}>
          Move interview to 3 June 2026
        </LabButton>
      </div>
      <Readout id="lab-calendar-readout">
        owner mode: {mode} / panel signals: {panelSignals} / last panel: {lastPanel}
      </Readout>
    </div>
  );
}

/**
 * Descriptions — a `ResponsiveColumn` used to be resolved as `md ?? lg ?? 3`,
 * so `{ xs: 1, sm: 2 }` rendered THREE tracks at every width, wider than the
 * author's own maximum. The responsive panel below declares two tiers; the
 * fixed panel beside it is the control that still carries an inline count.
 */
function DescriptionsColumnsHarness() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, inlineSize: 'min(920px, 100%)' }}>
      <div data-lab-descriptions="responsive">
        <AxisCaption>column={'{ xs: 1, sm: 2 }'} — never wider than the declared maximum</AxisCaption>
        <Descriptions bordered title="Requisition REQ-4821">
          <Descriptions.Item label="Role">Senior Venue Operations Lead</Descriptions.Item>
          <Descriptions.Item label="Hiring manager">Marta Oliveira</Descriptions.Item>
          <Descriptions.Item label="Location">Lisbon — Sala Norte, hybrid three days on site</Descriptions.Item>
          <Descriptions.Item label="Band">Compensation band 6, reviewed January 2026</Descriptions.Item>
        </Descriptions>
      </div>

      <div data-lab-descriptions="fixed">
        <AxisCaption>column={'{3}'} — scalar posture keeps the inline count</AxisCaption>
        <Descriptions bordered column={3} title="Event ES-2210">
          <Descriptions.Item label="Venue">Sala Norte</Descriptions.Item>
          <Descriptions.Item label="Capacity">240 covers</Descriptions.Item>
          <Descriptions.Item label="Doors">18:30</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
}

/** Realistic list rows shared by the loading posture and its loaded twin. */
const ACTIVITY_ROWS = [
  'Marta Oliveira moved two candidates to the panel stage',
  'Catering headcount for Sala Norte revised to 240 covers',
  'Offer package for REQ-4821 returned by compensation',
];

/**
 * List — the loading posture used to be a different component: it dropped the
 * frame, the size step, the layout stamp and the header/footer entirely, so a
 * bordered grid list resolved from a bare pulsing rectangle into a framed,
 * titled, multi-column one. The two roots below are the same configuration in
 * the two postures, side by side, so the jump is visible or it is gone.
 */
function ListLoadingHarness() {
  const grid = { xs: 1, md: 2, xl: 3, gutter: 16 } as const;
  const header = <span>Recent activity</span>;
  const footer = <span>3 of 41 updates</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, inlineSize: 'min(900px, 100%)' }}>
      <div data-lab-list="loading">
        <AxisCaption>loading posture</AxisCaption>
        <List loading bordered size="small" itemLayout="vertical" grid={grid} header={header} footer={footer} />
      </div>
      <div data-lab-list="loaded">
        <AxisCaption>loaded posture — same frame, same tracks</AxisCaption>
        <List
          bordered
          size="small"
          itemLayout="vertical"
          grid={grid}
          header={header}
          footer={footer}
          dataSource={ACTIVITY_ROWS}
          renderItem={(row) => <List.Item>{String(row)}</List.Item>}
        />
      </div>
    </div>
  );
}

/**
 * Switch — `loading` used to hard-disable the input, dropping the control out
 * of the tab order at the exact moment the user operated it. Busy is not
 * disabled: the tab stop survives, the state is announced, and no value
 * commits while the previous one is in flight. The commit counter is the proof
 * that a click during busy changes nothing.
 */
function SwitchBusyHarness() {
  const [commits, setCommits] = React.useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, inlineSize: 'min(420px, 100%)' }}>
      <div data-lab-switch="busy" style={OUTLINE_FRAME}>
        <AxisCaption>loading — still a tab stop, refuses to commit</AxisCaption>
        <Switch
          aria-label="Publish this requisition to the careers page"
          loading
          checkedChildren="Published"
          unCheckedChildren="Draft"
          onChange={() => setCommits((n) => n + 1)}
        />
      </div>
      <div data-lab-switch="standalone" style={OUTLINE_FRAME}>
        <AxisCaption>indicator-only — carries the coarse-pointer floor stamp</AxisCaption>
        <Switch aria-label="Notify the panel by email" />
      </div>
      <div data-lab-switch="disabled" style={OUTLINE_FRAME}>
        <AxisCaption>caller-disabled — still hard-disabled</AxisCaption>
        <Switch aria-label="Archive this requisition" disabled />
      </div>
      <Readout id="lab-switch-readout">commits while busy: {commits}</Readout>
    </div>
  );
}

const CONTEXT_MENU_ITEMS = [
  { key: 'open', label: 'Open candidate record' },
  { key: 'divider-1', type: 'divider' as const },
  {
    key: 'share',
    label: 'Share with the panel',
    children: [
      { key: 'copy-link', label: 'Copy link' },
      { key: 'email', label: 'Email the interview loop' },
    ],
  },
  { key: 'archive', label: 'Archive', danger: true },
];

/**
 * ContextMenu — the initial-focus effect was keyed on `isOpen` alone, so it
 * always ran a commit before the panel existed and never fired again. Nothing
 * inside the panel held focus, which made the level handlers on that `<ul>`
 * unreachable: arrows, Home/End, typeahead and Escape were all inert. The
 * repaired contract is the whole keyboard journey, so the trigger is a real
 * button and the menu is opened with a right-click.
 */
function ContextMenuFocusHarness() {
  const [selected, setSelected] = React.useState('none');
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <ContextMenu
        items={CONTEXT_MENU_ITEMS}
        onSelect={(key) => setSelected(key)}
        trigger={
          <button
            type="button"
            data-testid="lab-contextmenu-trigger"
            style={{
              font: 'inherit',
              fontSize: '0.8125rem',
              inlineSize: '100%',
              padding: '18px 14px',
              textAlign: 'start',
              borderRadius: 'var(--ds-radius-md, 8px)',
              border: '1px dashed var(--ds-color-border)',
              background: 'var(--ds-color-bg-elevated)',
              color: 'var(--ds-color-text-primary)',
            }}
          >
            Candidate row — right-click for actions
          </button>
        }
      />
      <Readout id="lab-contextmenu-readout">last selection: {selected}</Readout>
    </div>
  );
}

/**
 * Popconfirm — the trigger is now a real disclosure. It carries
 * `aria-haspopup="dialog"` / `aria-expanded`, references a surface only while
 * one exists, and a re-press closes what it opened (the outside-click guard
 * treats the trigger as inside the anchor, so without a toggle a second press
 * did nothing at all). `okType="danger"` puts the initial focus on the safer
 * choice.
 */
function PopconfirmDisclosureHarness() {
  const [outcome, setOutcome] = React.useState('none');
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Popconfirm
        title="Withdraw this offer?"
        description="The candidate and the hiring manager are both notified immediately."
        okType="danger"
        okText="Withdraw offer"
        cancelText="Keep offer"
        onConfirm={() => setOutcome('withdrawn')}
        onCancel={() => setOutcome('kept')}
      >
        <button
          type="button"
          data-testid="lab-popconfirm-trigger"
          style={{
            font: 'inherit',
            fontSize: '0.8125rem',
            padding: '8px 14px',
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-elevated)',
            color: 'var(--ds-color-text-primary)',
            cursor: 'pointer',
          }}
        >
          Withdraw offer
        </button>
      </Popconfirm>
      <Readout id="lab-popconfirm-readout">outcome: {outcome}</Readout>
    </div>
  );
}

/**
 * Affix — two repairs in one scene. The vacated flow is reserved on the BLOCK
 * axis only (an inline freeze never re-widths on resize), and `position: fixed`
 * resolves against the VIEWPORT even when the scroll source is an element, so
 * the container's bottom edge is re-expressed in viewport coordinates. Before
 * that, a bottom-affixed bar inside a 260px column pinned itself to the bottom
 * of the WINDOW instead of the bottom of its column.
 */
function AffixContainerHarness() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = React.useState('false');
  const target = React.useCallback(() => scrollRef.current ?? window, []);
  const handleChange = React.useCallback((next: boolean) => setAffixed(String(next)), []);

  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <div
        ref={scrollRef}
        data-testid="lab-affix-scroller"
        style={{
          blockSize: 260,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md, 8px)',
        }}
      >
        <div style={{ padding: 12, blockSize: 220 }}>
          Shift roster for Sala Norte — the bar below pins to the bottom of this column, not
          to the bottom of the window.
        </div>
        <Affix offsetBottom={12} target={target} onChange={handleChange}>
          <div
            data-testid="lab-affix-bar"
            style={{
              padding: '10px 12px',
              background: 'var(--ds-color-primary)',
              color: 'var(--ds-color-text-inverse, #fff)',
              fontSize: '0.75rem',
              borderRadius: 'var(--ds-radius-sm, 6px)',
            }}
          >
            4 shifts unassigned — review before publishing
          </div>
        </Affix>
        <div style={{ padding: 12, blockSize: 900 }}>Roster rows continue below.</div>
      </div>
      <Readout id="lab-affix-readout">affixed: {affixed}</Readout>
    </div>
  );
}

const ANCHOR_SECTIONS = [
  { id: 'lab-anchor-scope', title: 'Scope of work', body: 'Own the operations calendar for Sala Norte and two satellite rooms.' },
  { id: 'lab-anchor-panel', title: 'Interview panel', body: 'Two operations leads, one safety officer and the venue director.' },
  { id: 'lab-anchor-comp', title: 'Compensation', body: 'Band 6 with an on-call supplement, reviewed each January.' },
  { id: 'lab-anchor-apply', title: 'How to apply', body: 'Submit the availability grid with the application; no cover letter needed.' },
];

/**
 * Anchor — the jump used to be `scrollIntoView`, which walks the WHOLE
 * ancestor chain (it can scroll the page as well as the caller's
 * `getContainer`) and lands the section flush against the container edge,
 * putting the heading under the affixed bar in the family's own documented
 * `affix` + `offsetTop` recipe. The jump is now one `scrollTop` write on the
 * ONE element the caller nominated, offset by the declared `offsetTop`.
 */
function AnchorConfinedJumpHarness() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const getContainer = React.useCallback((): HTMLElement | Window => scrollRef.current ?? window, []);

  return (
    <div style={{ display: 'flex', gap: 16, inlineSize: 'min(620px, 100%)', flexWrap: 'wrap' }}>
      <div style={{ inlineSize: 'min(180px, 100%)' }}>
        <Anchor getContainer={getContainer} offsetTop={48} affix={false}>
          {ANCHOR_SECTIONS.map((section) => (
            <Anchor.Link key={section.id} href={`#${section.id}`} title={section.title} />
          ))}
        </Anchor>
      </div>
      <div
        ref={scrollRef}
        data-testid="lab-anchor-scroller"
        style={{
          flex: '1 1 260px',
          blockSize: 260,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md, 8px)',
          padding: 12,
        }}
      >
        {ANCHOR_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} style={{ blockSize: 220 }}>
            <h3 style={{ font: 'inherit', fontSize: '0.8125rem', margin: 0 }}>{section.title}</h3>
            <p style={{ font: 'inherit', fontSize: '0.75rem', opacity: 0.7 }}>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

const BREADCRUMB_ITEMS = [
  { key: 'workspace', label: 'Rottay workspace', href: '#lab-crumb-workspace' },
  { key: 'venues', label: 'Venue operations', href: '#lab-crumb-venues' },
  { key: 'norte', label: 'Sala Norte', href: '#lab-crumb-norte' },
  { key: 'requisitions', label: 'Open requisitions', href: '#lab-crumb-reqs' },
  { key: 'req', label: 'REQ-4821 — Senior Venue Operations Lead', href: '#lab-crumb-req' },
  { key: 'panel', label: 'Interview panel' },
];

/**
 * Breadcrumb — the trail parks at the CURRENT location when it clips, because
 * that is the one crumb that must be legible. The repair is that the park no
 * longer re-runs on every parent render (the effect keyed on inline `items`),
 * and that a reader who scrolls back toward the root is not dragged forward
 * again by a later re-park. The frame is deliberately narrow so the trail
 * always clips, and the fixture can force a re-measure by re-rendering.
 */
function BreadcrumbParkingHarness() {
  const [renders, setRenders] = React.useState(0);
  // Built INLINE on every render, which is how real call sites pass it — and
  // exactly what used to re-run the pin. A module-level constant would keep a
  // stable identity and hide the failure this case exists to show.
  const items = BREADCRUMB_ITEMS.map((item) => ({ ...item }));
  return (
    <div style={{ inlineSize: 'min(320px, 100%)' }}>
      <div data-testid="lab-breadcrumb-frame" style={OUTLINE_FRAME}>
        <Breadcrumb items={items} />
      </div>
      <div style={{ marginBlockStart: 12 }}>
        <LabButton id="lab-breadcrumb-rerender" onClick={() => setRenders((n) => n + 1)}>
          Re-render the parent
        </LabButton>
      </div>
      <Readout id="lab-breadcrumb-readout">parent renders: {renders}</Readout>
    </div>
  );
}

/**
 * Modal — two repairs. `aria-describedby` merges the caller's token with the
 * modal's own description instead of replacing it (and never points at a
 * description a custom `header` suppressed). And the `{show && <Modal open />}`
 * shape unmounts an open dialog WITHOUT running the close steps, so the
 * browser never restores focus and the invoker's focus lands on `<body>` —
 * the salvage returns it.
 */
function ModalDescribedByHarness() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <p id="lab-modal-form-hint" style={{ font: 'inherit', fontSize: '0.75rem', opacity: 0.7 }}>
        Archived requisitions stay searchable for ninety days.
      </p>
      <LabButton id="lab-modal-invoker" onClick={() => setOpen(true)}>
        Archive requisition
      </LabButton>
      {open && (
        <Modal
          open
          title="Archive REQ-4821?"
          description="The requisition leaves the active board and the panel loses edit access."
          aria-describedby="lab-modal-form-hint"
          onClose={() => setOpen(false)}
        >
          <p style={{ font: 'inherit', fontSize: '0.8125rem' }}>
            Four candidates are mid-loop. They keep their scheduled interviews.
          </p>
          <LabButton id="lab-modal-destroy" onClick={() => setOpen(false)}>
            Archive and unmount
          </LabButton>
        </Modal>
      )}
      <Readout id="lab-modal-readout">dialog mounted: {open ? 'yes' : 'no'}</Readout>
    </div>
  );
}

const TREE_NODES = [
  {
    value: 'operations',
    title: 'Venue operations',
    children: [
      { value: 'front-of-house', title: 'Front of house' },
      { value: 'stage', title: 'Stage and rigging' },
    ],
  },
  {
    value: 'talent',
    title: 'Talent',
    children: [
      { value: 'recruiting', title: 'Recruiting' },
      { value: 'people-ops', title: 'People operations' },
    ],
  },
];

/**
 * TreeSelect — `''` IS this component's own reset-to-empty payload (the clear
 * affordance emits it), so admitting it as a selected key made a cleared
 * controlled trigger render an empty `value` part with the placeholder
 * suppressed: a field that looked filled with nothing. ArrowDown on the closed
 * trigger is also the APG "open AND move to an option" key.
 */
function TreeSelectResetHarness() {
  const [value, setValue] = React.useState<string>('recruiting');
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <div data-lab-treeselect="controlled">
        <TreeSelect
          treeData={TREE_NODES}
          value={value}
          placeholder="Select a team"
          allowClear
          treeDefaultExpandAll
          aria-label="Owning team"
          onChange={(next) => setValue(String(next))}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBlockStart: 12 }}>
        <LabButton id="lab-treeselect-clear" onClick={() => setValue('')}>
          Reset the controlled value
        </LabButton>
      </div>
      <Readout id="lab-treeselect-readout">controlled value: {value === '' ? '(empty)' : value}</Readout>
    </div>
  );
}

/**
 * InputNumber — `formatValue` is a COMMITTED-value formatter, so rendering it
 * on every keystroke fed the caret a reformatted string mid-entry: with
 * `precision={2}` typing "1" became "1.00" and the next digit landed as
 * "1.005". The draft echoes exactly what was typed and defers formatting to
 * the blur clamp. Beside it, a read-only field renders its steppers away but
 * stayed focusable, so the whole APG key set mutated it anyway.
 */
function InputNumberDraftHarness() {
  const [commits, setCommits] = React.useState(0);
  const [readOnlyCommits, setReadOnlyCommits] = React.useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, inlineSize: 'min(420px, 100%)' }}>
      <div data-lab-inputnumber="precision" style={OUTLINE_FRAME}>
        <AxisCaption>precision=2 — echoes what was typed until blur</AxisCaption>
        <InputNumber
          id="lab-inputnumber-precision"
          precision={2}
          aria-label="On-call supplement multiplier"
          onChange={() => setCommits((n) => n + 1)}
        />
      </div>
      <div data-lab-inputnumber="readonly" style={OUTLINE_FRAME}>
        <AxisCaption>readOnly — refuses every keyboard step</AxisCaption>
        <InputNumber
          id="lab-inputnumber-readonly"
          defaultValue={240}
          min={0}
          max={400}
          step={10}
          readOnly
          aria-label="Confirmed covers"
          onChange={() => setReadOnlyCommits((n) => n + 1)}
        />
      </div>
      <Readout id="lab-inputnumber-readout">
        precision commits: {commits} / read-only commits: {readOnlyCommits}
      </Readout>
    </div>
  );
}

/**
 * PasswordInput — `data-filled` is a real content state the skin paints from,
 * and reading it off `value ?? defaultValue` meant an uncontrolled password
 * stayed `data-filled="false"` for its entire life no matter what the user
 * typed. The errored field beside it proves the describedby MERGE: a
 * form-level description arriving from FormField must not silence the field's
 * own error message.
 */
function PasswordFilledHarness() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, inlineSize: 'min(420px, 100%)' }}>
      <div data-lab-password="uncontrolled" style={OUTLINE_FRAME}>
        <AxisCaption>uncontrolled — data-filled follows the field</AxisCaption>
        <PasswordInput
          id="lab-password-uncontrolled"
          placeholder="Choose a passphrase"
          aria-label="New passphrase"
        />
      </div>
      <div data-lab-password="described" style={OUTLINE_FRAME}>
        <AxisCaption>error + cloned describedby — both survive</AxisCaption>
        <p id="lab-password-hint" style={{ font: 'inherit', fontSize: '0.6875rem', opacity: 0.7 }}>
          At least twelve characters, no reused workspace passphrase.
        </p>
        <PasswordInput
          id="lab-password-described"
          error
          errorMessage="This passphrase was used on this workspace before."
          aria-label="Replacement passphrase"
          {...({ 'aria-describedby': 'lab-password-hint' } as Record<string, string>)}
        />
      </div>
    </div>
  );
}

const DROPDOWN_MENU = {
  items: [
    { key: 'assign', label: 'Assign to a recruiter' },
    {
      key: 'share',
      label: 'Share with the panel',
      children: [
        { key: 'copy-link', label: 'Copy link' },
        { key: 'email', label: 'Email the interview loop' },
      ],
    },
    { key: 'divider-1', type: 'divider' as const },
    { key: 'archive', label: 'Archive requisition', danger: true },
  ],
};

/**
 * Dropdown — its Escape used to be a private bubble-phase document listener,
 * so the shared stack's capture-phase router never saw the menu at all: a
 * dropdown opened inside a Modal handed Escape to the DIALOG, which closed the
 * whole surface out from under the open menu while the menu itself stayed
 * open. The menu now joins the stack, and its submenus publish their own
 * closers so one Escape peels exactly one layer.
 */
function DropdownStackedEscapeHarness() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <LabButton id="lab-dropdown-open-modal" onClick={() => setOpen(true)}>
        Open the requisition dialog
      </LabButton>
      <Modal
        open={open}
        title="REQ-4821 — Senior Venue Operations Lead"
        description="Four candidates are mid-loop."
        onClose={() => setOpen(false)}
      >
        <p style={{ font: 'inherit', fontSize: '0.8125rem' }}>
          The row menu below opens INSIDE this dialog. Escape must peel the menu first.
        </p>
        <Dropdown trigger={['click']} menu={DROPDOWN_MENU}>
          <button
            type="button"
            data-testid="lab-dropdown-trigger"
            style={{
              font: 'inherit',
              fontSize: '0.8125rem',
              padding: '8px 14px',
              borderRadius: 'var(--ds-radius-md, 8px)',
              border: '1px solid var(--ds-color-border)',
              background: 'var(--ds-color-bg-elevated)',
              color: 'var(--ds-color-text-primary)',
              cursor: 'pointer',
            }}
          >
            Row actions
          </button>
        </Dropdown>
      </Modal>
      <Readout id="lab-dropdown-readout">dialog open: {open ? 'yes' : 'no'}</Readout>
    </div>
  );
}

/**
 * BackTop — `scrollTo({ behavior: 'smooth' })` animates on a UA-chosen cadence
 * that no argument can shorten or lengthen, so the contract's `duration` axis
 * (sold with a 450ms default and documented `duration={200}` / `duration={800}`
 * call sites) had no effect at all. Two columns, two durations, one shared
 * start offset: if `duration` is honored they are at different offsets at the
 * same instant, and a UA cadence cannot produce that.
 */
function BackTopDurationHarness() {
  const fastRef = React.useRef<HTMLDivElement>(null);
  const slowRef = React.useRef<HTMLDivElement>(null);
  const fastTarget = React.useCallback(() => fastRef.current ?? window, []);
  const slowTarget = React.useCallback(() => slowRef.current ?? window, []);

  const column: React.CSSProperties = {
    blockSize: 200,
    overflow: 'auto',
    position: 'relative',
    border: '1px solid var(--ds-color-border)',
    borderRadius: 'var(--ds-radius-md, 8px)',
    flex: '1 1 180px',
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', inlineSize: 'min(620px, 100%)' }}>
      <div ref={fastRef} data-testid="lab-backtop-fast-scroller" style={column}>
        <div style={{ padding: 12, blockSize: 1600, fontSize: '0.75rem' }}>
          duration=150 — the shift log for the fast column.
        </div>
        {/* The two triggers are pinned to distinct corners on purpose: they
            are both viewport-fixed, and a capture cannot attribute a click to
            one journey if they overlap. */}
        <BackTop
          className="lab-backtop-fast"
          target={fastTarget}
          visibilityHeight={0}
          duration={150}
          style={{ insetInlineEnd: 200, insetBlockEnd: 24 }}
        />
      </div>
      <div ref={slowRef} data-testid="lab-backtop-slow-scroller" style={column}>
        <div style={{ padding: 12, blockSize: 1600, fontSize: '0.75rem' }}>
          duration=2400 — the shift log for the slow column.
        </div>
        <BackTop
          className="lab-backtop-slow"
          target={slowTarget}
          visibilityHeight={0}
          duration={2400}
          style={{ insetInlineEnd: 24, insetBlockEnd: 24 }}
        />
      </div>
    </div>
  );
}

/**
 * FloatButton.Group — the trigger promised `aria-haspopup="true"`, which means
 * MENU, for a panel that is a `role="group"` of buttons, and its
 * `aria-expanded` had no target at all. It is a disclosure: `aria-controls`
 * now points at the real panel element.
 */
function FloatButtonDisclosureHarness() {
  return (
    <div data-testid="lab-floatbutton-host" style={{ inlineSize: 'min(420px, 100%)', ...OUTLINE_FRAME, blockSize: 220, position: 'relative' }}>
      <AxisCaption>group disclosure — aria-controls points at the panel</AxisCaption>
      <FloatButton.Group trigger="click" tooltip="Roster actions">
        <FloatButton tooltip="Add a shift" />
        <FloatButton tooltip="Publish the roster" />
        <FloatButton tooltip="Export to payroll" />
      </FloatButton.Group>
    </div>
  );
}

const STEP_ITEMS = [
  { title: 'Application', description: 'Received 4 January' },
  { title: 'Recruiter screen', description: 'Marta Oliveira' },
  { title: 'Panel loop', description: 'Two operations leads' },
  { title: 'Offer', description: 'Compensation band 6' },
];

/**
 * Stepper — two repairs. Status was color-and-glyph only, so a screen-reader
 * user heard only the step title and could not tell a finished step from a
 * failed one. And every engine walked the child list looking ONLY for
 * `Stepper.Step`, silently dropping the `Stepper.Content` panels the contract
 * documents — the compound usage rendered a track with no body at all.
 */
function StepperContentHarness() {
  const [current, setCurrent] = React.useState(1);
  return (
    <div style={{ inlineSize: 'min(720px, 100%)' }}>
      <Stepper current={current} clickable onChange={setCurrent}>
        <Stepper.Step title="Application" description="Received 4 January" />
        <Stepper.Step title="Recruiter screen" status="error" description="Reschedule requested" />
        <Stepper.Step title="Panel loop" description="Two operations leads" />
        <Stepper.Content stepIndex={0}>
          <div style={OUTLINE_FRAME}>Application form — availability grid attached.</div>
        </Stepper.Content>
        <Stepper.Content stepIndex={1}>
          <div style={OUTLINE_FRAME}>Recruiter screen notes — candidate asked to move to Thursday.</div>
        </Stepper.Content>
        <Stepper.Content stepIndex={2}>
          <div style={OUTLINE_FRAME}>Panel scorecards — two of four returned.</div>
        </Stepper.Content>
      </Stepper>
      <Readout id="lab-stepper-readout">current step: {current}</Readout>
    </div>
  );
}

/**
 * Steps — the skin drew status as a tinted circle plus a pseudo-element
 * dingbat, so `finish` and `error` had NO non-visual expression. The name now
 * rides with the step title, clipped from paint and out of flow. `process` is
 * already carried by `aria-current` and `wait` is the absence of both, so
 * neither gets a name: this scene carries all four so that stays visible.
 */
function StepsStatusHarness() {
  return (
    <div style={{ inlineSize: 'min(760px, 100%)' }}>
      <Steps
        current={2}
        onChange={() => {}}
        items={[
          { ...STEP_ITEMS[0] },
          { ...STEP_ITEMS[1], status: 'error' as const },
          { ...STEP_ITEMS[2] },
          { ...STEP_ITEMS[3] },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

const TITLES: Record<PrimitiveComplexStateCase, string> = {
  'timeline-track-collapse': 'timeline — occupied-track collapse',
  'calendar-controlled-panel': 'calendar — owner-driven panel',
  'descriptions-responsive-columns': 'descriptions — declared column tiers',
  'list-loading-continuity': 'list — loading shell continuity',
  'switch-busy-tab-stop': 'switch — busy is not disabled',
  'contextmenu-submenu-focus': 'context menu — submenu focus journey',
  'popconfirm-disclosure-toggle': 'popconfirm — disclosure and toggle',
  'affix-container-edge': 'affix — container edge and reservation',
  'anchor-confined-jump': 'anchor — confined, offset jump',
  'breadcrumb-trail-parking': 'breadcrumb — trail parking',
  'modal-describedby-merge': 'modal — describedby merge and focus return',
  'treeselect-cleared-placeholder': 'tree select — cleared value and keyboard entry',
  'inputnumber-typing-draft': 'input number — typing draft and read-only',
  'passwordinput-filled-state': 'password — filled state and describedby',
  'dropdown-stacked-escape': 'dropdown — stacked escape',
  'backtop-duration': 'back to top — honored duration',
  'floatbutton-disclosure': 'float button — group disclosure',
  'stepper-content-panels': 'stepper — status name and content panels',
  'steps-status-name': 'steps — status is not color-only',
};

const AXES: Record<PrimitiveComplexStateCase, string> = {
  'timeline-track-collapse': 'single-sided rail settles on the real edge',
  'calendar-controlled-panel': 'mode and value are owner-driven; panel moves are reported',
  'descriptions-responsive-columns': 'never wider than the author’s declared maximum',
  'list-loading-continuity': 'same frame, size, layout and tracks in both postures',
  'switch-busy-tab-stop': 'tab stop survives the busy state; no value commits',
  'contextmenu-submenu-focus': 'arrows reach the submenu; escape peels one level',
  'popconfirm-disclosure-toggle': 'trigger discloses, references and un-discloses',
  'affix-container-edge': 'pins to the column edge, reserves the block axis only',
  'anchor-confined-jump': 'one container scrolls, offset by the declared offsetTop',
  'breadcrumb-trail-parking': 'parks at the current crumb, never drags the reader back',
  'modal-describedby-merge': 'both descriptions survive; the invoker gets focus back',
  'treeselect-cleared-placeholder': 'a cleared value shows the placeholder again',
  'inputnumber-typing-draft': 'the caret keeps what was typed; read-only refuses steps',
  'passwordinput-filled-state': 'filled state follows the field; descriptions merge',
  'dropdown-stacked-escape': 'one escape, one layer — the dialog stays open',
  'backtop-duration': 'the declared duration drives the journey',
  'floatbutton-disclosure': 'a disclosure with a real target, not a phantom menu',
  'stepper-content-panels': 'status is named; the content panels render',
  'steps-status-name': 'finished and failed are distinguishable without color',
};

function CaseBody({ only }: { only: PrimitiveComplexStateCase }) {
  switch (only) {
    case 'timeline-track-collapse':
      return <TimelineTrackHarness />;
    case 'calendar-controlled-panel':
      return <CalendarPanelHarness />;
    case 'descriptions-responsive-columns':
      return <DescriptionsColumnsHarness />;
    case 'list-loading-continuity':
      return <ListLoadingHarness />;
    case 'switch-busy-tab-stop':
      return <SwitchBusyHarness />;
    case 'contextmenu-submenu-focus':
      return <ContextMenuFocusHarness />;
    case 'popconfirm-disclosure-toggle':
      return <PopconfirmDisclosureHarness />;
    case 'affix-container-edge':
      return <AffixContainerHarness />;
    case 'anchor-confined-jump':
      return <AnchorConfinedJumpHarness />;
    case 'breadcrumb-trail-parking':
      return <BreadcrumbParkingHarness />;
    case 'modal-describedby-merge':
      return <ModalDescribedByHarness />;
    case 'treeselect-cleared-placeholder':
      return <TreeSelectResetHarness />;
    case 'inputnumber-typing-draft':
      return <InputNumberDraftHarness />;
    case 'passwordinput-filled-state':
      return <PasswordFilledHarness />;
    case 'dropdown-stacked-escape':
      return <DropdownStackedEscapeHarness />;
    case 'backtop-duration':
      return <BackTopDurationHarness />;
    case 'floatbutton-disclosure':
      return <FloatButtonDisclosureHarness />;
    case 'stepper-content-panels':
      return <StepperContentHarness />;
    case 'steps-status-name':
      return <StepsStatusHarness />;
    default:
      return null;
  }
}

/**
 * One case per render. The route passes `only`, so a capture frames exactly
 * one family and a predicate never has to disambiguate between two specimens
 * of the same primitive on one page.
 */
export function PrimitiveComplexStateScene({ only }: { only: PrimitiveComplexStateCase }) {
  return (
    <SceneFrame title={TITLES[only]}>
      <SpecimenRow axis={AXES[only]}>
        <div data-testid={`lab-${only}`} style={{ inlineSize: 'min(960px, 100%)' }}>
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
