'use client';

/**
 * PRIMITIVE STATE REPAIRS — capture scenes for the seventeen repaired Modern primitive
 * families.
 *
 * A scene here is NOT "the component, mounted". Each case is configured so the
 * repaired behaviour is the thing a capture actually shows: the failed-image
 * panel that used to be an unnamed empty box, the live region that used to
 * unmount when empty, the cover that used to collapse when its src 404'd, the
 * clear affordance that used to survive a controlled reset. Where a state is
 * reachable through props, it IS reached through props, so a screenshot alone
 * carries the evidence; the three cases that genuinely need a keystroke are
 * built with a visible readout so the post-interaction frame is self-describing
 * rather than requiring a DOM dump.
 *
 * Content is realistic recruiting / venue-management copy on purpose: This probe judges
 * rhythm under real strings, and a scene padded with lorem cannot show whether
 * a chip row, a tag field or a notification body survives its own content.
 */

import React from 'react';

import {
  AutoComplete,
  Button,
  Callout,
  Card,
  Cascader,
  CodeBlock,
  ColorPicker,
  Form,
  Image,
  Input,
  Mentions,
  NavLink,
  NotificationItem,
  Pagination,
  Select,
  Slider,
  TagInput,
  Toast,
  ToastProvider,
  Tour,
  Upload,
} from '@rottay/design-system';

import {
  AxisCaption,
  PLACEHOLDER_IMAGE_SRC,
  SceneFrame,
  SpecimenRow,
  TORTURE_CONTENT,
  Vignette,
} from '../../chrome';

export type PrimitiveStateRepairCase =
  | 'image-fallback'
  | 'toast-live-region'
  | 'tour-dialog-name'
  | 'notification-nested-controls'
  | 'callout-dismiss-focus'
  | 'card-cover-error'
  | 'codeblock-copy'
  | 'pagination-reveal'
  | 'taginput-paste'
  | 'colorpicker-hover'
  | 'slider-value-semantics'
  | 'upload-drop-constraints'
  | 'autocomplete-disabled-rows'
  | 'cascader-controlled-reset'
  | 'mentions-active-option'
  | 'select-id-forwarding'
  | 'form-touched';

// ---------------------------------------------------------------------------
// Deterministic fixture assets
// ---------------------------------------------------------------------------

/**
 * An image source that CANNOT resolve, without touching the network. The
 * payload decodes cleanly as base64 but is plain text, so every browser fails
 * the image decode and fires `error` — the same terminal state a 404 produces,
 * reached offline and identically on every run. A relative 404 URL would work
 * in the dev server and silently change behaviour behind a proxy or an
 * offline capture.
 */
const UNRESOLVABLE_IMAGE_SRC =
  'data:image/png;base64,ZGVsaWJlcmF0ZWx5LW5vdC1hbi1pbWFnZQ==';

/** Neutral frame used to make an otherwise invisible region legible on canvas. */
const OUTLINE_FRAME: React.CSSProperties = {
  border: '1px dashed var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-md, 8px)',
  padding: 12,
};

/** Small fixture-owned readout. Mirrors the component-behaviors harness idiom. */
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

// ---------------------------------------------------------------------------
// Harnesses
// ---------------------------------------------------------------------------

/**
 * Tour anchors to a real target so the surface paints beside page furniture
 * rather than floating in the middle of an empty canvas. Step 1 carries NO
 * title on purpose: the repaired engine stops emitting an empty `h3` and names
 * the dialog through `aria-label` instead, so the captured frame must show a
 * dialog whose body starts at the description with no orphaned heading band.
 */
function UntitledTourHarness() {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <button
        ref={anchorRef}
        type="button"
        data-testid="lab-tour-anchor"
        style={{
          font: 'inherit',
          padding: '8px 14px',
          borderRadius: 'var(--ds-radius-md, 8px)',
          border: '1px solid var(--ds-color-border)',
          background: 'var(--ds-color-bg-elevated)',
          color: 'var(--ds-color-text-primary)',
        }}
      >
        Publish the March rota
      </button>
      <Tour
        open
        current={0}
        mask={false}
        arrow
        placement="bottom"
        steps={[
          {
            // Deliberately title-less. `title` is a required key with a
            // ReactNode type, so `null` is the contract's own spelling of
            // "this step has no heading".
            title: null,
            target: anchorRef,
            description:
              'Publishing locks the shift pattern for every venue in the region and notifies each assigned coordinator.',
          },
          {
            title: 'Confirm coverage',
            target: anchorRef,
            description: 'Any shift still short of its minimum headcount is flagged before the rota goes live.',
          },
        ]}
        onClose={() => undefined}
      />
    </div>
  );
}

/**
 * The notification card is itself clickable, which is what made nested controls
 * a real defect: a press on the action button used to fire BOTH the button and
 * the card behind it. The counters make that separation visible in the frame
 * after the runner presses the nested button — card activations must stay 0.
 */
function NotificationNestedControlsHarness() {
  const [cardActivations, setCardActivations] = React.useState(0);
  const [approvals, setApprovals] = React.useState(0);

  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <NotificationItem
        id="lab-notification-overtime"
        type="warning"
        duration={0}
        closable
        onClick={() => setCardActivations((n) => n + 1)}
        onRemove={() => undefined}
        message="Overtime approval needed"
        description={
          <span style={{ display: 'grid', gap: 10 }}>
            <span>
              Three bar shifts at Shoreditch Hall exceed the contracted weekly cap for the week beginning
              9 March 2026.
            </span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                data-testid="lab-notification-approve"
                onClick={() => setApprovals((n) => n + 1)}
              >
                Approve 3 shifts
              </Button>
              <NavLink href="#lab-notification-rota" data-testid="lab-notification-link">
                Open the rota
              </NavLink>
            </span>
          </span>
        }
      />
      {/* The nested link points at a real in-scene target so activating it is a
          deterministic no-op instead of a hash change with nowhere to land. */}
      <span id="lab-notification-rota" />
      <Readout id="lab-notification-counts">
        Nested approvals: {approvals} / card activations: {cardActivations}
      </Readout>
    </div>
  );
}

/**
 * Two dismissible callouts followed by a focusable control. The repaired
 * keyboard dismissal hands focus to the first focusable AFTER the dismissed
 * callout in document order, instead of dropping it on `<body>`; the readout
 * names wherever focus currently sits so the post-dismissal frame states the
 * outcome instead of implying it.
 */
function CalloutDismissFocusHarness() {
  const [focused, setFocused] = React.useState('none');
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  React.useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const node = event.target as HTMLElement | null;
      const named = node?.closest<HTMLElement>('[data-lab-focus-name]');
      setFocused(named?.dataset.labFocusName ?? node?.tagName?.toLowerCase() ?? 'none');
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  return (
    <div style={{ display: 'grid', gap: 12, inlineSize: 'min(520px, 100%)' }}>
      <span data-lab-focus-name="callout-one-dismiss">
        <Callout
          engine="modern"
          tone="warning"
          title="Right-to-work documents expiring"
          closable
          onClose={() => setDismissed((list) => [...list, 'one'])}
        >
          Four bar staff have share codes that lapse before the end of the month. Re-verify them before
          the next rota is published.
        </Callout>
      </span>
      <span data-lab-focus-name="callout-two-dismiss">
        <Callout
          engine="modern"
          tone="info"
          title="Premises licence renewal"
          closable
          onClose={() => setDismissed((list) => [...list, 'two'])}
        >
          The Shoreditch Hall licence renews on 1 April 2026. Late-night refreshment hours stay unchanged.
        </Callout>
      </span>
      <span data-lab-focus-name="trailing-button" style={{ display: 'inline-flex' }}>
        <Button variant="secondary" data-testid="lab-callout-trailing">
          Review compliance queue
        </Button>
      </span>
      <Readout id="lab-callout-focus">
        Focus: {focused} / dismissed: {dismissed.length === 0 ? 'none' : dismissed.join(', ')}
      </Readout>
    </div>
  );
}

/**
 * Many pages inside a narrow frame. The controls row owns an inline scrollport
 * of its own, and the repaired reveal writes only THAT row's `scrollLeft`. The
 * scene therefore nests it in an ancestor that is itself scrollable on both
 * axes and starts at (0, 0): the ruler and the header stay flush at the start
 * edge in the capture, which is exactly what an ancestor-walking
 * `scrollIntoView` would have destroyed.
 */
function PaginationRevealHarness() {
  const [current, setCurrent] = React.useState(38);
  return (
    <div
      data-testid="lab-pagination-ancestor"
      style={{
        inlineSize: 'min(560px, 100%)',
        blockSize: 208,
        overflow: 'auto',
        ...OUTLINE_FRAME,
      }}
    >
      <div style={{ inlineSize: 900, display: 'grid', gap: 10 }}>
        <div
          data-testid="lab-pagination-header"
          style={{ font: 'inherit', fontSize: '0.8125rem', color: 'var(--ds-color-text-primary)' }}
        >
          Application ledger — 480 candidates across the Shoreditch and Peckham venues
        </div>
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            gap: 40,
            font: 'inherit',
            fontSize: '0.625rem',
            letterSpacing: '0.08em',
            color: 'var(--ds-color-text-secondary)',
          }}
        >
          {['0', '100', '200', '300', '400', '500', '600', '700', '800'].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div style={{ inlineSize: 'min(320px, 100%)', overflow: 'hidden' }}>
          <Pagination
            engine="modern"
            current={current}
            total={480}
            pageSize={10}
            siblingCount={4}
            boundaryCount={3}
            onChange={(page) => setCurrent(page)}
          />
        </div>
      </div>
    </div>
  );
}

const ROSTER_TAGS = [
  'Personal licence',
  'Cellar management',
  'Cocktail service',
  'Allergen level 2',
  'Cash handling',
  'Late-night duty manager',
  'First aid at work',
];

/**
 * A near-full tag field: seven committed chips against a cap of eight. The
 * committed chips and the remaining capacity are both on canvas, so a capture
 * shows the multi-tag commit state; driving one more paste/commit exercises the
 * refusal path the readout also reports.
 */
function TagInputCapacityHarness() {
  const [tags, setTags] = React.useState<string[]>(ROSTER_TAGS);
  const maxTags = 8;
  return (
    <div style={{ inlineSize: 'min(520px, 100%)' }}>
      <label
        htmlFor="lab-taginput-field"
        style={{ display: 'block', font: 'inherit', fontSize: '0.75rem', marginBlockEnd: 6 }}
      >
        Required certifications
      </label>
      <TagInput
        engine="modern"
        id="lab-taginput-field"
        value={tags}
        onChange={setTags}
        maxTags={maxTags}
        separator=","
        placeholder="Paste a comma-separated list"
        aria-label="Required certifications"
      />
      <Readout id="lab-taginput-capacity">
        Committed {tags.length} of {maxTags} — {Math.max(0, maxTags - tags.length)} slot remaining
      </Readout>
    </div>
  );
}

/**
 * Both sliders read their value out loud in different ways: the single thumb
 * carries a forced-open formatted bubble (so the formatted string is on
 * canvas, not only in `aria-valuetext`), and the range slider carries an
 * external name for the pair of thumbs it renders.
 */
function SliderSemanticsHarness() {
  return (
    <div style={{ display: 'grid', gap: 44, inlineSize: 'min(460px, 100%)' }}>
      <div data-testid="lab-slider-formatted">
        <AxisCaption>single thumb — formatted readout</AxisCaption>
        <div style={{ paddingBlockStart: 26 }}>
          <Slider
            defaultValue={72}
            min={0}
            max={100}
            aria-label="Target shift fill rate"
            tooltip={{ open: true, placement: 'top', formatter: (value) => `${value ?? 0}% fill rate` }}
          />
        </div>
      </div>
      <div data-testid="lab-slider-range">
        <AxisCaption>range — two thumbs, one name</AxisCaption>
        <div style={{ paddingBlockStart: 10 }}>
          <Slider
            range
            defaultValue={[2, 6]}
            min={0}
            max={12}
            marks={{ 0: '0h', 6: '6h', 12: '12h' }}
            aria-label="Interview loop length in hours"
          />
        </div>
      </div>
    </div>
  );
}

const ACCEPTED_FLOOR_PLAN = [
  {
    uid: 'floorplan-1',
    name: 'shoreditch-hall-ground-floor.png',
    status: 'done' as const,
    type: 'image/png',
    size: 184320,
    url: PLACEHOLDER_IMAGE_SRC,
    thumbUrl: PLACEHOLDER_IMAGE_SRC,
  },
];

const VENUE_OPTIONS = [
  {
    value: 'london',
    label: 'London',
    children: [
      { value: 'shoreditch-hall', label: 'Shoreditch Hall', isLeaf: true },
      { value: 'peckham-yard', label: 'Peckham Yard', isLeaf: true },
    ],
  },
  {
    value: 'manchester',
    label: 'Manchester',
    children: [
      { value: 'ancoats-works', label: 'Ancoats Works', isLeaf: true },
      { value: 'deansgate-rooms', label: 'Deansgate Rooms', isLeaf: true },
    ],
  },
];

/** Two Cascaders, one holding a path and one reset to `[]` by its parent. */
function CascaderResetHarness() {
  const [filled, setFilled] = React.useState<(string | number)[]>(['london', 'shoreditch-hall']);
  const [cleared, setCleared] = React.useState<(string | number)[]>([]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, inlineSize: '100%' }}>
      <div data-testid="lab-cascader-filled" style={{ inlineSize: 'min(260px, 100%)' }}>
        <AxisCaption>controlled value — path + clear</AxisCaption>
        <Cascader
          engine="modern"
          options={VENUE_OPTIONS}
          value={filled}
          allowClear
          placeholder="Select a venue"
          onChange={(next) => setFilled(next as (string | number)[])}
        />
      </div>
      <div data-testid="lab-cascader-cleared" style={{ inlineSize: 'min(260px, 100%)' }}>
        <AxisCaption>controlled reset to [] — placeholder, no clear</AxisCaption>
        <Cascader
          engine="modern"
          options={VENUE_OPTIONS}
          value={cleared}
          allowClear
          placeholder="Select a venue"
          onChange={(next) => setCleared(next as (string | number)[])}
        />
      </div>
    </div>
  );
}

const COORDINATOR_OPTIONS = [
  { value: 'priya.raghavan', label: 'Priya Raghavan — Senior Venue Coordinator' },
  { value: 'dmitri.laurens', label: 'Dmitri Laurens — Bar Operations Lead' },
  { value: 'noor.haddad', label: 'Noor Haddad — Staffing Partner' },
  { value: 'esme.whitlock', label: 'Esme Whitlock — Compliance Officer' },
];

/**
 * Mentions has no `open` prop: the suggestion list is opened by the prefix
 * detector inside `onChange`, so this state is genuinely unreachable from
 * props. The scene therefore stages everything else statically — external
 * label, options, a part-written note — and the runner types the single `@`
 * that opens the list.
 */
function MentionsActiveOptionHarness() {
  const [note, setNote] = React.useState('Cover confirmed for Friday. Escalating the short shift to ');
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <label
        htmlFor="lab-mentions-note"
        style={{ display: 'block', font: 'inherit', fontSize: '0.75rem', marginBlockEnd: 6 }}
      >
        Handover note
      </label>
      <Mentions
        engine="modern"
        id="lab-mentions-note"
        value={note}
        onChange={setNote}
        options={COORDINATOR_OPTIONS}
        rows={3}
        placeholder="Type @ to notify a coordinator"
      />
      <Readout id="lab-mentions-state">Draft length: {note.length} characters</Readout>
    </div>
  );
}

const PANEL_OPTIONS = [
  { value: 'priya.raghavan', label: 'Priya Raghavan' },
  { value: 'dmitri.laurens', label: 'Dmitri Laurens' },
  { value: 'noor.haddad', label: 'Noor Haddad' },
  { value: 'esme.whitlock', label: 'Esme Whitlock' },
];

/**
 * The Form pair. `touched` is set by the repaired `onChange` path only, so the
 * success posture on the left column appears once the runner types into the
 * hours field — which also re-runs the dependent field's validation. The right
 * column declares `validateStatus="success"` outright and is the static
 * reference for what that posture looks like, so the untouched-vs-touched
 * difference is legible in a single frame.
 */
function FormTouchedHarness() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, inlineSize: '100%' }}>
      <div data-testid="lab-form-dependency-pair" style={{ inlineSize: 'min(300px, 100%)' }}>
        <AxisCaption>hasFeedback + dependencies — posture follows touch</AxisCaption>
        <Form
          hasFeedback
          layout="vertical"
          initialValues={{ weeklyHours: '38', overtimeCap: '6' }}
          onFinish={() => undefined}
        >
          <Form.Item
            name="weeklyHours"
            label="Contracted weekly hours"
            rules={[{ required: true, message: 'Enter the contracted hours' }]}
          >
            <Input id="lab-form-weekly-hours" />
          </Form.Item>
          <Form.Item
            name="overtimeCap"
            label="Overtime cap"
            dependencies={['weeklyHours']}
            rules={[{ required: true, message: 'Enter the overtime cap' }]}
          >
            <Input id="lab-form-overtime-cap" />
          </Form.Item>
        </Form>
      </div>
      <div data-testid="lab-form-declared-success" style={{ inlineSize: 'min(300px, 100%)' }}>
        <AxisCaption>declared status — reference posture</AxisCaption>
        <Form hasFeedback layout="vertical" initialValues={{ payGrade: 'Band 4' }}>
          <Form.Item
            name="payGrade"
            label="Pay grade"
            validateStatus="success"
            hasFeedback
            help="Matches the published venue band."
          >
            <Input id="lab-form-pay-grade" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

const ROTA_SNIPPET = [
  '{',
  '  "venue": "shoreditch-hall",',
  '  "weekBeginning": "2026-03-09",',
  '  "minimumHeadcount": { "bar": 6, "floor": 4, "door": 2 },',
  '  "overtimeCapHours": 6,',
  `  "exportFilename": "${TORTURE_CONTENT.unbroken}",`,
  '  "notifyCoordinators": true',
  '}',
].join('\n');

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function PrimitiveStateRepairScene({ only }: { only: PrimitiveStateRepairCase }) {
  return (
    <SceneFrame title={`PRIMITIVE STATE REPAIRS - ${only.toUpperCase()}`}>
      {only === 'image-fallback' && (
        <SpecimenRow axis="IMAGE - the failed-load panel is a named region, not an empty box">
          <div
            data-testid="lab-image-fallback"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 24, inlineSize: '100%' }}
          >
            <div data-testid="lab-image-fallback-alt" style={{ inlineSize: 'min(200px, 100%)' }}>
              <AxisCaption>caller alt wins</AxisCaption>
              <Image
                engine="modern"
                lazy={false}
                bordered
                radius="md"
                width="100%"
                height={132}
                src={UNRESOLVABLE_IMAGE_SRC}
                alt="Signed venue hire agreement — Shoreditch Hall, 14 March 2026"
              />
            </div>
            <div data-testid="lab-image-fallback-floor" style={{ inlineSize: 'min(200px, 100%)' }}>
              <AxisCaption>empty alt falls to the shared floor</AxisCaption>
              <Image
                engine="modern"
                lazy={false}
                bordered
                radius="md"
                width="100%"
                height={132}
                src={UNRESOLVABLE_IMAGE_SRC}
                alt=""
              />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'toast-live-region' && (
        <SpecimenRow axis="TOAST - the polite region stays mounted with zero toasts">
          <div data-testid="lab-toast-live-region" style={{ inlineSize: 'min(460px, 100%)' }}>
            <div style={{ ...OUTLINE_FRAME, display: 'grid', gap: 8 }}>
              <span style={{ font: 'inherit', fontSize: '0.8125rem' }}>
                Shift-assignment updates announce into the region pinned at the bottom-left of this
                capture. It is outlined and empty on purpose.
              </span>
              <span style={{ font: 'inherit', fontSize: '0.75rem', color: 'var(--ds-color-text-secondary)' }}>
                A region that mounted only once it already had content could never announce its first
                arrival, so an empty-but-present frame is the passing state.
              </span>
            </div>
            {/* The container portals to the document, so the visible outline is
                applied to the region ITSELF rather than to a wrapper that would
                no longer contain it. Pinned bottom-left so the landing spot is
                deterministic at 1440 and 390 alike. */}
            <ToastProvider position="bottom-left" duration={0}>
              <Toast.Container
                position="bottom-left"
                style={{
                  insetBlockEnd: 24,
                  insetInlineStart: 24,
                  minInlineSize: 220,
                  minBlockSize: 64,
                  border: '1px dashed var(--ds-color-border)',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  background: 'var(--ds-color-bg-elevated)',
                }}
              />
            </ToastProvider>
          </div>
        </SpecimenRow>
      )}

      {only === 'tour-dialog-name' && (
        <SpecimenRow axis="TOUR - a title-less step still names its dialog">
          <div data-testid="lab-tour-dialog-name" style={{ inlineSize: '100%' }}>
            <UntitledTourHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'notification-nested-controls' && (
        <SpecimenRow axis="NOTIFICATION - nested controls act alone inside a clickable card">
          <div data-testid="lab-notification-nested-controls" style={{ inlineSize: '100%' }}>
            <NotificationNestedControlsHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'callout-dismiss-focus' && (
        <SpecimenRow axis="CALLOUT - a keyboard dismissal lands on the next real control">
          <div data-testid="lab-callout-dismiss-focus" style={{ inlineSize: '100%' }}>
            <CalloutDismissFocusHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'card-cover-error' && (
        <SpecimenRow axis="CARD - a cover that cannot load keeps its reserved geometry">
          <div
            data-testid="lab-card-cover-error"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 20, inlineSize: '100%' }}
          >
            <div data-testid="lab-card-cover-failed" style={{ inlineSize: 'min(260px, 100%)' }}>
              <Card
                engine="modern"
                cover={UNRESOLVABLE_IMAGE_SRC}
                coverAlt="Shoreditch Hall main room"
                title="Shoreditch Hall"
                description="Capacity 320 · late licence to 02:00 · three bar stations"
              />
            </div>
            <div data-testid="lab-card-cover-ok" style={{ inlineSize: 'min(260px, 100%)' }}>
              <Card
                engine="modern"
                cover={PLACEHOLDER_IMAGE_SRC}
                coverAlt="Peckham Yard courtyard"
                title="Peckham Yard"
                description="Capacity 180 · outdoor courtyard · two bar stations"
              />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'codeblock-copy' && (
        <SpecimenRow axis="CODEBLOCK - the copy control is present and named">
          <div data-testid="lab-codeblock-copy" style={{ inlineSize: 'min(560px, 100%)' }}>
            <CodeBlock
              code={ROTA_SNIPPET}
              language="json"
              showLineNumbers
              highlightLines={[4, 5]}
              wrap
              title="rota-config.json"
              ariaLabel="Rota configuration for Shoreditch Hall"
              copyLabel="Copy"
              copiedLabel="Copied"
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'pagination-reveal' && (
        <SpecimenRow axis="PAGINATION - the reveal scrolls its own row, never an ancestor">
          <div data-testid="lab-pagination-reveal" style={{ inlineSize: '100%' }}>
            <Vignette label="ledger footer inside a two-axis scrollport">
              <PaginationRevealHarness />
            </Vignette>
          </div>
        </SpecimenRow>
      )}

      {only === 'taginput-paste' && (
        <SpecimenRow axis="TAGINPUT - committed chips and the remaining capacity are both visible">
          <div data-testid="lab-taginput-paste" style={{ inlineSize: '100%' }}>
            <TagInputCapacityHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'colorpicker-hover' && (
        <SpecimenRow axis="COLORPICKER - the hover-triggered panel is fully reachable">
          <div
            data-testid="lab-colorpicker-hover"
            style={{ inlineSize: 'min(420px, 100%)', minBlockSize: 340 }}
          >
            <ColorPicker
              engine="modern"
              open
              trigger="hover"
              allowClear
              showText
              format="hex"
              defaultValue="#2F5D50"
              presets={[
                { label: 'Venue accents', colors: ['#2F5D50', '#8C5A2B', '#1F3A5F', '#7A2E3B'] },
                { label: 'Status', colors: ['#2E7D5B', '#B4762A', '#9B2C2C'] },
              ]}
              onChange={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'slider-value-semantics' && (
        <SpecimenRow axis="SLIDER - the announced value is the value on screen">
          <div data-testid="lab-slider-value-semantics" style={{ inlineSize: '100%' }}>
            <SliderSemanticsHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'upload-drop-constraints' && (
        <SpecimenRow axis="UPLOAD - the dropzone states the constraints it enforces">
          <div data-testid="lab-upload-drop-constraints" style={{ inlineSize: 'min(460px, 100%)' }}>
            <Upload.Dragger
              engine="modern"
              accept="image/*"
              multiple={false}
              listType="picture"
              fileList={ACCEPTED_FLOOR_PLAN}
              onPreview={() => undefined}
              onRemove={() => false}
            >
              <div style={{ display: 'grid', gap: 6, padding: 16, textAlign: 'center' }}>
                <span style={{ font: 'inherit', fontSize: '0.875rem', color: 'var(--ds-color-text-primary)' }}>
                  Drop the venue floor plan here
                </span>
                <span style={{ font: 'inherit', fontSize: '0.75rem', color: 'var(--ds-color-text-secondary)' }}>
                  One image file only — PNG, JPG or WebP
                </span>
              </div>
            </Upload.Dragger>
          </div>
        </SpecimenRow>
      )}

      {only === 'autocomplete-disabled-rows' && (
        <SpecimenRow axis="AUTOCOMPLETE - inert rows read as inert, not as live ones">
          <div
            data-testid="lab-autocomplete-disabled-rows"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24, inlineSize: '100%' }}
          >
            {/* Each column reserves its own block space: the open panels are
                absolutely positioned, so at 390 the two columns stack and an
                unreserved first panel would paint over the second control. */}
            <div
              data-testid="lab-autocomplete-control-disabled"
              style={{ inlineSize: 'min(260px, 100%)', minBlockSize: 220 }}
            >
              <AxisCaption>disabled control — every row inert</AxisCaption>
              <AutoComplete
                engine="modern"
                open
                disabled
                filterOption={false}
                value="Shored"
                placeholder="Search venues"
                options={[
                  { value: 'Shoreditch Hall' },
                  { value: 'Shoreditch Arches' },
                  { value: 'Shoreditch Rooftop' },
                ]}
                onChange={() => undefined}
              />
            </div>
            <div
              data-testid="lab-autocomplete-row-disabled"
              style={{ inlineSize: 'min(260px, 100%)', minBlockSize: 220 }}
            >
              <AxisCaption>live control — one inert row</AxisCaption>
              <AutoComplete
                engine="modern"
                open
                filterOption={false}
                value="Peck"
                placeholder="Search venues"
                options={[
                  { value: 'Peckham Yard' },
                  { value: 'Peckham Levels', disabled: true },
                  { value: 'Peckham Arches' },
                ]}
                onChange={() => undefined}
              />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'cascader-controlled-reset' && (
        <SpecimenRow axis="CASCADER - a controlled reset drops the path and the clear affordance">
          <div data-testid="lab-cascader-controlled-reset" style={{ inlineSize: '100%' }}>
            <CascaderResetHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'mentions-active-option' && (
        <SpecimenRow axis="MENTIONS - exactly one suggestion row paints as the active option">
          <div data-testid="lab-mentions-active-option" style={{ inlineSize: '100%', minBlockSize: 280 }}>
            <MentionsActiveOptionHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'select-id-forwarding' && (
        <SpecimenRow axis="SELECT - the caller id survives the custom trigger path">
          <div data-testid="lab-select-id-forwarding" style={{ inlineSize: 'min(420px, 100%)' }}>
            <label
              htmlFor="lab-select-panel"
              style={{ display: 'block', font: 'inherit', fontSize: '0.75rem', marginBlockEnd: 6 }}
            >
              Interview panel
            </label>
            <Select
              engine="modern"
              id="lab-select-panel"
              searchable
              multiple
              clearable
              placeholder="Add panel members"
              defaultValue={['priya.raghavan', 'dmitri.laurens']}
              options={PANEL_OPTIONS}
              onChange={() => undefined}
            />
            <Readout id="lab-select-binding">
              The visible label targets the trigger id, so clicking the label reaches the combobox.
            </Readout>
          </div>
        </SpecimenRow>
      )}

      {only === 'form-touched' && (
        <SpecimenRow axis="FORM - a touched field reaches the success posture without a declared status">
          <div data-testid="lab-form-touched" style={{ inlineSize: '100%' }}>
            <FormTouchedHarness />
          </div>
        </SpecimenRow>
      )}
    </SceneFrame>
  );
}
