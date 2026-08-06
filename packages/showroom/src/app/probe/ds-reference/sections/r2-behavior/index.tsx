'use client';

import React from 'react';

import {
  Affix,
  Alert,
  Anchor,
  AspectRatio,
  Box,
  BackTop,
  Breadcrumb,
  Button,
  Checkbox,
  Collapse,
  Container,
  DatePicker,
  Divider,
  Drawer,
  Empty,
  Flex,
  Dropdown,
  FloatButton,
  Form,
  FormField,
  Grid,
  Hide,
  IconFrame,
  Input,
  LoadingIndicator,
  Meter,
  Layout,
  NavLink,
  OTPInput,
  InputNumber,
  Mentions,
  Popover,
  PasswordInput,
  Radio,
  Rate,
  ResizeHandle,
  ResponsiveSlot,
  Result,
  ScrollArea,
  Segmented,
  SemanticSurface,
  Show,
  Skeleton,
  Space,
  Stack,
  Splitter,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  TimePicker,
  Toggle,
  TreeSelect,
  Upload,
  VisuallyHidden,
  VoiceInputButton,
  Watermark,
  BrandingPreviewSandbox,
  PatternLiveFeed,
  PatternPricingTable,
  PatternUserProfileCard,
  PatternWorkbenchHeader,
} from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

export type R2BehaviorCase =
  | 'datepicker'
  | 'timepicker'
  | 'tabs'
  | 'stepper'
  | 'upload'
  | 'splitter'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'inputnumber'
  | 'passwordinput'
  | 'mentions'
  | 'otpinput'
  | 'collapse'
  | 'backtop'
  | 'floatbutton'
  | 'switch'
  | 'scrollarea'
  | 'breadcrumb'
  | 'anchor'
  | 'formfield'
  | 'layout'
  | 'rate'
  | 'affix'
  | 'result'
  | 'link'
  | 'segmented'
  | 'popover'
  | 'drawer'
  | 'skeleton'
  | 'form'
  | 'watermark'
  | 'alert'
  | 'input'
  | 'grid'
  | 'dropdown'
  | 'button'
  | 'divider'
  | 'space'
  | 'stack'
  | 'empty'
  | 'container'
  | 'flex'
  | 'box'
  | 'aspectratio'
  | 'semanticsurface'
  | 'responsiveslot'
  | 'showhide'
  | 'iconframe'
  | 'treeselect'
  | 'resizehandle'
  | 'loadingindicator'
  | 'voiceinput'
  | 'meter'
  | 'visuallyhidden'
  | 'pricingtable'
  | 'livefeed'
  | 'brandingpreview'
  | 'userprofilecard'
  | 'workbenchheader';

const CRUMB_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'a', label: 'Level A', href: '/a' },
  { key: 'b', label: 'Level B', href: '/b' },
  { key: 'c', label: 'Level C', href: '/c' },
  { key: 'd', label: 'Level D', href: '/d' },
  { key: 'current', label: 'Current page' },
];

const TAB_ITEMS = [
  { key: 'roster', label: 'Roster', children: 'Reviewer roster' },
  { key: 'reviews', label: 'Reviews', children: 'Open reviews' },
  { key: 'archive', label: 'Archive', children: 'Archived items' },
];

const STEP_ITEMS = [{ title: 'Draft' }, { title: 'Review' }, { title: 'Approve' }];

const UPLOAD_FILES = [
  {
    uid: '1',
    name: 'roster.png',
    status: 'done' as const,
    type: 'image/png',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjM0E2RkIwIi8+PC9zdmc+',
  },
];

function RefusedOtpHarness() {
  const [attempted, setAttempted] = React.useState<string | null>(null);
  return (
    <div>
      <OTPInput length={4} value="12" onChange={(next) => setAttempted(next)} />
      <div data-testid="lab-otpinput-attempt">
        {attempted === null ? 'Attempted: none' : `Attempted: ${attempted}`}
      </div>
    </div>
  );
}

/** The container mounts a commit after the trigger, with a memoized accessor. */
function LateTargetHarness({ kind }: { kind: 'backtop' | 'floatbutton' }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);
  const target = React.useCallback(() => scrollRef.current ?? window, []);
  React.useEffect(() => { setReady(true); }, []);
  return (
    <div style={{ position: 'relative' }}>
      {ready && (
        <div
          ref={scrollRef}
          data-testid={`lab-${kind}-scroller`}
          style={{ inlineSize: 300, blockSize: 200, overflow: 'auto', position: 'relative' }}
        >
          <div style={{ blockSize: 1200 }}>Scroll region</div>
        </div>
      )}
      {kind === 'backtop' ? (
        <BackTop target={target} visibilityHeight={120} />
      ) : (
        <FloatButton.BackTop type="primary" target={target} visibilityHeight={120} />
      )}
    </div>
  );
}

/** A 90ms churn hands LiveFeed a fresh inline onRefresh far faster than its
 *  500ms poll: a timer keyed on handler identity could never fire. */
function LiveFeedPollingHarness() {
  const [churn, setChurn] = React.useState(0);
  const [refreshes, setRefreshes] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setChurn((n) => n + 1), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <PatternLiveFeed
        engine="modern"
        items={[{ key: 'a', timestamp: new Date(0) }]}
        renderItem={() => <span>feed row</span>}
        autoRefresh={500}
        onRefresh={() => setRefreshes((n) => n + 1)}
      />
      <div data-testid="lab-livefeed-refreshes">Refreshes: {refreshes}</div>
      <div data-testid="lab-livefeed-churn">Rerenders: {churn}</div>
    </div>
  );
}

function SwitchClickValueHarness() {
  const [reported, setReported] = React.useState('none');
  return (
    <div>
      <Switch onClick={(checked) => setReported(String(checked))} />
      <div data-testid="lab-switch-reported">Reported: {reported}</div>
    </div>
  );
}

/** The pinned badge resolves against the scroll root only if the root is a containing block. */
function ScrollAreaContainingBlockHarness() {
  return (
    <div
      style={{
        paddingInlineStart: 'clamp(8px, 8vw, 200px)',
        paddingInlineEnd: 8,
        paddingBlockStart: 32,
      }}
    >
      <ScrollArea
        maxHeight={180}
        style={{ inlineSize: 'min(320px, 100%)', border: '1px solid var(--ds-color-border)' }}
        data-testid="lab-scrollarea-root"
      >
        <div
          data-testid="lab-scrollarea-pinned"
          style={{
            position: 'absolute',
            insetBlockStart: 8,
            insetInlineEnd: 8,
            padding: '2px 8px',
            background: 'var(--ds-color-primary)',
            color: 'var(--ds-color-text-inverse, #fff)',
            fontSize: 12,
          }}
        >
          Pinned
        </div>
        <div style={{ blockSize: 720, paddingBlockStart: 44, paddingInline: 12 }}>
          Scrollable content
        </div>
      </ScrollArea>
    </div>
  );
}

function AnchorInterceptHarness() {
  const [prevented, setPrevented] = React.useState('none');
  React.useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const node = event.target as HTMLElement | null;
      if (!node?.closest('[data-lab-external]')) return;
      setPrevented(String(event.defaultPrevented));
      // The lab records the verdict, then stops the real navigation.
      event.preventDefault();
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);
  return (
    <div>
      <Anchor>
        <Anchor.Link href="#lab-anchor-section" title="In-page section" />
        <span data-lab-external>
          <Anchor.Link href="https://example.com/pricing" title="External pricing" target="_blank" />
        </span>
      </Anchor>
      <div data-testid="lab-anchor-prevented">External defaultPrevented: {prevented}</div>
      <div id="lab-anchor-section" style={{ marginBlockStart: 16 }}>Section body</div>
    </div>
  );
}

function FormFieldBindingHarness() {
  const [focused, setFocused] = React.useState('none');
  return (
    <div>
      <FormField label="Account email" name="email">
        <Input id="account-email" onFocus={() => setFocused('account-email')} />
      </FormField>
      <div data-testid="lab-formfield-focused">Focused: {focused}</div>
    </div>
  );
}

/** The inline onCollapse is a fresh closure per render — what re-armed the collapse. */
function LayoutBreakpointHarness() {
  const [reported, setReported] = React.useState('none');
  const [renders, setRenders] = React.useState(0);
  return (
    <div>
      <Layout>
        <Layout.Sider
          collapsible
          breakpoint="md"
          width={200}
          collapsedWidth={64}
          onCollapse={(collapsed) => {
            setReported(String(collapsed));
            setRenders((n) => n + 1);
          }}
        >
          <div style={{ padding: 12 }}>Nav</div>
        </Layout.Sider>
        <Layout.Content>
          <div style={{ padding: 12 }}>Content</div>
        </Layout.Content>
      </Layout>
      <div data-testid="lab-layout-state">
        Reported: {reported} / parent renders: {renders}
      </div>
    </div>
  );
}

function RateClearHarness() {
  const [committed, setCommitted] = React.useState('none');
  return (
    <div>
      <Rate defaultValue={3} allowClear onChange={(next) => setCommitted(String(next))} />
      <div data-testid="lab-rate-committed">Committed: {committed}</div>
    </div>
  );
}

function AffixLateTargetHarness() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const armedRef = React.useRef(false);
  const [bound, setBound] = React.useState(false);
  const [affixed, setAffixed] = React.useState('none');
  // A memoized accessor whose FIRST answer is not its final one: until the
  // post-mount commit arms it, the container reads as absent.
  const target = React.useCallback(() => (armedRef.current ? scrollRef.current : null) ?? window, []);
  // Stable, so a fresh handler identity cannot re-run the binding effect for us.
  const handleChange = React.useCallback((next: boolean) => setAffixed(String(next)), []);
  React.useEffect(() => {
    armedRef.current = true;
    setBound(true);
  }, []);
  return (
    <div>
      <div
        ref={scrollRef}
        data-testid="lab-affix-scroller"
        style={{
          inlineSize: 'min(320px, 100%)',
          blockSize: 200,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid var(--ds-color-border)',
        }}
      >
        <div style={{ blockSize: 90 }}>Above</div>
        <Affix target={target} offsetTop={0} onChange={handleChange}>
          <div
            data-testid="lab-affix-bar"
            style={{ padding: 8, background: 'var(--ds-color-primary)', color: '#fff' }}
          >
            Affixed bar
          </div>
        </Affix>
        <div style={{ blockSize: 900 }}>Below</div>
      </div>
      <div data-testid="lab-affix-state">
        Bound: {bound ? 'yes' : 'no'} / affixed: {affixed}
      </div>
    </div>
  );
}

function SegmentedReselectHarness() {
  const [fired, setFired] = React.useState(0);
  const [value, setValue] = React.useState<string | number>('week');
  return (
    <div>
      <Segmented
        options={[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]}
        value={value}
        onChange={(next) => {
          setFired((n) => n + 1);
          setValue(next);
        }}
      />
      <div data-testid="lab-segmented-state">
        Value: {String(value)} / onChange fired: {fired}
      </div>
    </div>
  );
}

/** The parent refuses every close, so the surface stays open across dismissals. */
function PopoverRefusedCloseHarness() {
  const [closeRequests, setCloseRequests] = React.useState(0);
  return (
    <div>
      <Popover
        open
        trigger="click"
        title="Filters"
        content={<div style={{ padding: 4 }}>Saved views</div>}
        onOpenChange={(next) => {
          if (!next) setCloseRequests((n) => n + 1);
        }}
      >
        <button type="button" data-testid="lab-popover-trigger">Open filters</button>
      </Popover>
      <div data-testid="lab-popover-state">Close requests: {closeRequests}</div>
    </div>
  );
}

/** The inner drawer is opened by the operator, so it always registers last. */
function StackedDrawerHarness() {
  const [outer, setOuter] = React.useState(true);
  const [inner, setInner] = React.useState(false);
  return (
    <div>
      <Drawer open={outer} title="Outer" placement="right" onClose={() => setOuter(false)}>
        <div style={{ padding: 12 }}>
          <button type="button" data-testid="lab-drawer-open-inner" onClick={() => setInner(true)}>
            Open inner
          </button>
        </div>
      </Drawer>
      {inner && (
        <Drawer open title="Inner" placement="right" onClose={() => setInner(false)}>
          <div style={{ padding: 12 }}>Inner body</div>
        </Drawer>
      )}
      <div data-testid="lab-drawer-state">
        outer: {String(outer)} / inner: {String(inner)}
      </div>
    </div>
  );
}

function FormUnmountedFieldHarness() {
  const [showOptional, setShowOptional] = React.useState(true);
  const [submits, setSubmits] = React.useState(0);
  return (
    <div>
      <Form initialValues={{ always: 'filled' }} onFinish={() => setSubmits((n) => n + 1)}>
        <Form.Item name="always" label="Always" rules={[{ required: true, message: 'Required' }]}>
          <Input id="lab-form-always" />
        </Form.Item>
        {showOptional && (
          <Form.Item name="optional" label="Optional" rules={[{ required: true, message: 'Required' }]}>
            <Input id="lab-form-optional" />
          </Form.Item>
        )}
        <button type="submit" data-testid="lab-form-submit">Submit</button>
      </Form>
      <button type="button" data-testid="lab-form-toggle" onClick={() => setShowOptional(false)}>
        Remove optional
      </button>
      <div data-testid="lab-form-state">
        optional mounted: {String(showOptional)} / submits: {submits}
      </div>
    </div>
  );
}

function WatermarkStabilityHarness() {
  const [tick, setTick] = React.useState(0);
  return (
    <div>
      <button type="button" data-testid="lab-watermark-tick" onClick={() => setTick((n) => n + 1)}>
        Re-render parent
      </button>
      <Watermark content="Draft" gap={[80, 80]} font={{ fontSize: 14 }}>
        <div style={{ blockSize: 160, padding: 12 }}>Document body</div>
      </Watermark>
      <div data-testid="lab-watermark-state">Parent renders: {tick}</div>
    </div>
  );
}

const ALERT_MESSAGES = ['Upload failed', 'Retrying upload'];

function AlertReturnHarness() {
  const [index, setIndex] = React.useState(0);
  return (
    <div>
      <Alert tone="danger" closable message={ALERT_MESSAGES[index]} />
      <button type="button" data-testid="lab-alert-swap" onClick={() => setIndex((i) => (i + 1) % 2)}>
        Swap message
      </button>
      <div data-testid="lab-alert-state">Showing: {ALERT_MESSAGES[index]}</div>
    </div>
  );
}

function InputCompositionHarness() {
  const [submits, setSubmits] = React.useState(0);
  return (
    <div>
      <Input id="lab-input-field" placeholder="Type here" onPressEnter={() => setSubmits((n) => n + 1)} />
      <div data-testid="lab-input-state">Submitted: {submits}</div>
    </div>
  );
}

function DropdownReentryHarness() {
  return (
    <Dropdown
      trigger="click"
      menu={{
        items: [
          { key: 'edit', label: 'Edit' },
          { key: 'duplicate', label: 'Duplicate' },
          { key: 'archive', label: 'Archive' },
        ],
      }}
    >
      <button type="button" data-testid="lab-dropdown-trigger">Row actions</button>
    </Dropdown>
  );
}

function LabelledSearchIcon() {
  return (
    <svg role="img" aria-label="Search" viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 L14 14" />
    </svg>
  );
}

function ResizeHandleChordHarness() {
  const [value, setValue] = React.useState(50);
  return (
    <div>
      {/* A separator has no intrinsic size: it needs a host that gives it one. */}
      <div style={{ display: 'flex', blockSize: 120, border: '1px solid var(--ds-color-border)' }}>
        <div style={{ flex: `0 0 ${value}%`, background: 'var(--ds-color-surface-raised)' }} />
        <ResizeHandle
          label="Resize panel"
          orientation="vertical"
          min={0}
          max={100}
          value={value}
          valueText={`${value}%`}
          style={{ inlineSize: 8, background: 'var(--ds-color-primary)', cursor: 'col-resize' }}
          onAdjust={(intent) =>
            setValue((current) => {
              if (intent === 'minimize') return 0;
              if (intent === 'maximize') return 100;
              const next = intent === 'increase' ? current + 10 : current - 10;
              return Math.min(100, Math.max(0, next));
            })
          }
        />
        <div style={{ flex: 1, background: 'var(--ds-color-surface)' }} />
      </div>
      <div data-testid="lab-resizehandle-state">Value: {value}</div>
    </div>
  );
}

function VoiceErrorLiveRegionHarness() {
  return (
    <div data-testid="lab-voiceinput-host">
      <VoiceInputButton lang="en-US" onTranscript={() => {}} />
    </div>
  );
}

export function R2BehaviorScene({ only }: { only: R2BehaviorCase }) {
  return (
    <SceneFrame title={`R2 BEHAVIOR - ${only.toUpperCase()}`}>
      {only === 'datepicker' && (
        <SpecimenRow axis="DATEPICKER - calendar grid rows + labelled trigger">
          <div data-testid="lab-datepicker" style={{ inlineSize: 320 }}>
            <label htmlFor="lab-dob">Date of birth</label>
            <DatePicker id="lab-dob" open defaultValue="2026-08-06" />
          </div>
        </SpecimenRow>
      )}

      {only === 'timepicker' && (
        <SpecimenRow axis="TIMEPICKER - listbox columns + labelled trigger">
          <div data-testid="lab-timepicker" style={{ inlineSize: 320 }}>
            <label htmlFor="lab-start">Start time</label>
            <TimePicker id="lab-start" open defaultValue="09:30:00" />
          </div>
        </SpecimenRow>
      )}

      {only === 'tabs' && (
        <SpecimenRow axis="TABS - scrollport-local reveal, page never moves">
          <div data-testid="lab-tabs" style={{ inlineSize: 320 }}>
            <Tabs items={TAB_ITEMS} defaultActiveKey="archive" />
          </div>
        </SpecimenRow>
      )}

      {only === 'stepper' && (
        <SpecimenRow axis="STEPPER - aria-current rides the clickable trigger">
          <div data-testid="lab-stepper" style={{ inlineSize: 420 }}>
            <Stepper items={STEP_ITEMS} current={1} clickable onChange={() => {}} />
          </div>
        </SpecimenRow>
      )}

      {only === 'upload' && (
        <SpecimenRow axis="UPLOAD - keyboard preview + live status region">
          <div data-testid="lab-upload" style={{ inlineSize: 380 }}>
            <Upload listType="picture" fileList={UPLOAD_FILES} onPreview={() => {}} />
          </div>
        </SpecimenRow>
      )}

      {only === 'splitter' && (
        <SpecimenRow axis="SPLITTER - separator reports boundary position">
          <div data-testid="lab-splitter" style={{ inlineSize: "min(480px, 100%)", blockSize: 160 }}>
            <Splitter>
              <Splitter.Panel defaultSize={33}>Alpha</Splitter.Panel>
              <Splitter.Panel defaultSize={34}>Beta</Splitter.Panel>
              <Splitter.Panel defaultSize={33}>Gamma</Splitter.Panel>
            </Splitter>
          </div>
        </SpecimenRow>
      )}

      {only === 'textarea' && (
        <SpecimenRow axis="TEXTAREA - autoSize survives a width change">
          <div data-testid="lab-textarea" style={{ inlineSize: 320 }}>
            <Textarea autoSize defaultValue={'Reconciliation notes for this quarter.\nSecond line.\nThird line.'} />
          </div>
        </SpecimenRow>
      )}

      {only === 'radio' && (
        <SpecimenRow axis="RADIO - one native group, exactly one checked">
          <div data-testid="lab-radio">
            <Radio name="plan" value="monthly" label="Monthly" defaultChecked />
            <Radio name="plan" value="yearly" label="Yearly" description="Two months included." />
          </div>
        </SpecimenRow>
      )}

      {only === 'checkbox' && (
        <SpecimenRow axis="CHECKBOX - description describes, it does not name">
          <div data-testid="lab-checkbox">
            <Checkbox
              label="Marketing emails"
              description="We send at most one message per week."
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'toggle' && (
        <SpecimenRow axis="TOGGLE - name stays stable while the state label swaps">
          <div data-testid="lab-toggle" style={{ inlineSize: 320 }}>
            <Toggle
              label="Profile visibility"
              description="Anyone with the link can view."
              checkedLabel="On"
              uncheckedLabel="Off"
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'inputnumber' && (
        <SpecimenRow axis="INPUTNUMBER - fractional step keeps its precision">
          <div data-testid="lab-inputnumber" style={{ inlineSize: 240 }}>
            <InputNumber step={0.1} defaultValue={0.1} />
          </div>
        </SpecimenRow>
      )}

      {only === 'passwordinput' && (
        <SpecimenRow axis="PASSWORDINPUT - toggle focus depends on activation kind">
          <div data-testid="lab-passwordinput" style={{ inlineSize: 300 }}>
            <PasswordInput aria-label="Account password" defaultValue="correct horse battery" strengthIndicator strengthLevel="good" />
          </div>
        </SpecimenRow>
      )}

      {only === 'mentions' && (
        <SpecimenRow axis="MENTIONS - external label owns the name (ancillary)">
          <div data-testid="lab-mentions" style={{ inlineSize: 320 }}>
            <label htmlFor="lab-mentions-field">Notify reviewer</label>
            <Mentions
              id="lab-mentions-field"
              options={[
                { value: 'jane', label: 'Jane Doe' },
                { value: 'sam', label: 'Sam Lee' },
              ]}
              placeholder="Mention a reviewer"
            />
          </div>
        </SpecimenRow>
      )}
      {only === 'otpinput' && (
        <SpecimenRow axis="OTPINPUT - a refused controlled change never sticks">
          <div data-testid="lab-otpinput" style={{ inlineSize: 320 }}>
            <RefusedOtpHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'collapse' && (
        <SpecimenRow axis="COLLAPSE - accordion opens exactly one panel">
          <div data-testid="lab-collapse" style={{ inlineSize: 380 }}>
            <Collapse accordion defaultActiveKey={['one', 'two']}>
              <Collapse.Panel panelKey="one" header="Roster">Reviewer roster</Collapse.Panel>
              <Collapse.Panel panelKey="two" header="Reviews">Open reviews</Collapse.Panel>
              <Collapse.Panel panelKey="three" header="Archive">Archived items</Collapse.Panel>
            </Collapse>
          </div>
        </SpecimenRow>
      )}

      {only === 'backtop' && (
        <SpecimenRow axis="BACKTOP - binds the container that mounts later">
          <div data-testid="lab-backtop">
            <LateTargetHarness kind="backtop" />
          </div>
        </SpecimenRow>
      )}

      {only === 'floatbutton' && (
        <SpecimenRow axis="FLOATBUTTON.BACKTOP - same late-target binding">
          <div data-testid="lab-floatbutton">
            <LateTargetHarness kind="floatbutton" />
          </div>
        </SpecimenRow>
      )}

      {only === 'switch' && (
        <SpecimenRow axis="SWITCH - onClick reports the value the activation produced">
          <div data-testid="lab-switch" style={{ inlineSize: 320 }}>
            <SwitchClickValueHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'scrollarea' && (
        <SpecimenRow axis="SCROLLAREA - the scroll root is its own containing block">
          <div data-testid="lab-scrollarea">
            <ScrollAreaContainingBlockHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'breadcrumb' && (
        <SpecimenRow axis="BREADCRUMB - collapsed items reachable without a pointer">
          <div data-testid="lab-breadcrumb" style={{ inlineSize: 460 }}>
            <Breadcrumb items={CRUMB_ITEMS} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />
          </div>
        </SpecimenRow>
      )}

      {only === 'anchor' && (
        <SpecimenRow axis="ANCHOR - only in-page fragments are intercepted">
          <div data-testid="lab-anchor" style={{ inlineSize: 360 }}>
            <AnchorInterceptHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'formfield' && (
        <SpecimenRow axis="FORMFIELD - the label binds the id the control really has">
          <div data-testid="lab-formfield" style={{ inlineSize: 'min(360px, 100%)' }}>
            <FormFieldBindingHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'layout' && (
        <SpecimenRow axis="LAYOUT.SIDER - a re-render never replays the breakpoint collapse">
          <div data-testid="lab-layout" style={{ inlineSize: '100%' }}>
            <LayoutBreakpointHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'rate' && (
        <SpecimenRow axis="RATE - clearing wins over the preview under the pointer">
          <div data-testid="lab-rate" style={{ inlineSize: 'min(320px, 100%)' }}>
            <RateClearHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'affix' && (
        <SpecimenRow axis="AFFIX - binds the scroll container it resolves late">
          <div data-testid="lab-affix" style={{ inlineSize: 'min(360px, 100%)' }}>
            <AffixLateTargetHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'result' && (
        <SpecimenRow axis="RESULT - the status region is named by its own title">
          <div data-testid="lab-result" style={{ inlineSize: 'min(420px, 100%)' }}>
            <Result
              status="success"
              title="Payout scheduled"
              subTitle="Funds arrive within two business days."
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'link' && (
        <SpecimenRow axis="LINK - a new tab is announced only when one opens">
          <div data-testid="lab-link" style={{ display: 'grid', gap: 8, inlineSize: 'min(420px, 100%)' }}>
            <span data-testid="lab-link-native">
              <NavLink href="https://example.com/a" target="_blank">Native new tab</NavLink>
            </span>
            <span data-testid="lab-link-self">
              <NavLink href="https://example.com/b" external target="_self">Same tab</NavLink>
            </span>
            <span data-testid="lab-link-merged">
              <NavLink href="https://example.com/c" external rel="nofollow">Merged rel</NavLink>
            </span>
          </div>
        </SpecimenRow>
      )}

      {only === 'segmented' && (
        <SpecimenRow axis="SEGMENTED - re-selecting the current option is not a change">
          <div data-testid="lab-segmented" style={{ inlineSize: 'min(420px, 100%)' }}>
            <SegmentedReselectHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'popover' && (
        <SpecimenRow axis="POPOVER - a refused close still reports the next dismissal">
          <div data-testid="lab-popover" style={{ inlineSize: 'min(420px, 100%)' }}>
            <PopoverRefusedCloseHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'drawer' && (
        <SpecimenRow axis="DRAWER - Escape dismisses only the top-most layer">
          <div data-testid="lab-drawer" style={{ inlineSize: 'min(420px, 100%)' }}>
            <StackedDrawerHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'skeleton' && (
        <SpecimenRow axis="SKELETON - a declared zero row count is a real count">
          <div data-testid="lab-skeleton" style={{ display: 'grid', gap: 16, inlineSize: 'min(420px, 100%)' }}>
            <div data-testid="lab-skeleton-zero">
              <Skeleton paragraph={{ rows: 0 }} />
            </div>
            <div data-testid="lab-skeleton-three">
              <Skeleton paragraph={{ rows: 3 }} />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'form' && (
        <SpecimenRow axis="FORM - an unmounted field stops blocking submit">
          <div data-testid="lab-form" style={{ inlineSize: 'min(420px, 100%)' }}>
            <FormUnmountedFieldHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'watermark' && (
        <SpecimenRow axis="WATERMARK - equal literals never re-rasterise the tile">
          <div data-testid="lab-watermark" style={{ inlineSize: 'min(420px, 100%)' }}>
            <WatermarkStabilityHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'alert' && (
        <SpecimenRow axis="ALERT - a returning message re-opens a dismissed alert">
          <div data-testid="lab-alert" style={{ inlineSize: 'min(460px, 100%)' }}>
            <AlertReturnHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'input' && (
        <SpecimenRow axis="INPUT - Enter confirming an IME candidate is not a submit">
          <div data-testid="lab-input" style={{ inlineSize: 'min(360px, 100%)' }}>
            <InputCompositionHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'grid' && (
        <SpecimenRow axis="GRID - a responsive axis never wipes its static sibling">
          <div data-testid="lab-grid" style={{ inlineSize: '100%' }}>
            <Grid data-testid="lab-grid-root" columns={3} rows={{ xs: 1, md: 2 }} gap="md">
              <div style={{ padding: 12, background: 'var(--ds-color-surface-raised, #eee)' }}>One</div>
              <div style={{ padding: 12, background: 'var(--ds-color-surface-raised, #eee)' }}>Two</div>
              <div style={{ padding: 12, background: 'var(--ds-color-surface-raised, #eee)' }}>Three</div>
            </Grid>
          </div>
        </SpecimenRow>
      )}

      {only === 'box' && (
        <SpecimenRow axis="BOX - a conditional style that resolved away keeps the governed stamp">
          <div data-testid="lab-box" style={{ display: 'grid', gap: 12, inlineSize: 'min(460px, 100%)' }}>
            <Box
              data-testid="lab-box-resolved"
              rounded="xl"
              shadow="lg"
              style={{ borderRadius: undefined, boxShadow: undefined, padding: 12 }}
            >
              Conditional resolved away
            </Box>
            <Box
              data-testid="lab-box-owned"
              rounded="xl"
              shadow="lg"
              style={{ borderRadius: '3px', boxShadow: 'none', padding: 12 }}
            >
              Caller owns both
            </Box>
          </div>
        </SpecimenRow>
      )}

      {only === 'aspectratio' && (
        <SpecimenRow axis="ASPECTRATIO - a composing caller owns the anatomy part (P-79)">
          <div data-testid="lab-aspectratio" style={{ inlineSize: 'min(420px, 100%)' }}>
            <AspectRatio
              engine="modern"
              ratio={16 / 9}
              data-part="media-frame"
              data-testid="lab-aspectratio-root"
            >
              <div style={{ blockSize: '100%', background: 'var(--ds-color-primary)' }} />
            </AspectRatio>
          </div>
        </SpecimenRow>
      )}

      {only === 'semanticsurface' && (
        <SpecimenRow axis="SEMANTICSURFACE - a caller aria state survives the spread">
          <div data-testid="lab-semanticsurface" style={{ inlineSize: 'min(460px, 100%)' }}>
            <SemanticSurface
              surfaceRole="card"
              data-testid="lab-semanticsurface-root"
              aria-disabled
              style={{ padding: 12 }}
            >
              Caller-owned aria-disabled
            </SemanticSurface>
          </div>
        </SpecimenRow>
      )}

      {only === 'responsiveslot' && (
        <SpecimenRow axis="RESPONSIVESLOT - a slot whose condition resolved to false emits nothing">
          <div data-testid="lab-responsiveslot" style={{ inlineSize: 'min(460px, 100%)' }}>
            <ResponsiveSlot
              phone={false && <span>phone banner</span>}
              desktop={<span data-testid="lab-slot-desktop">desktop content</span>}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'showhide' && (
        <SpecimenRow axis="SHOW/HIDE - a 0px bound is a real bound, and they stay complements">
          <div data-testid="lab-showhide" style={{ display: 'grid', gap: 8, inlineSize: 'min(460px, 100%)' }}>
            <Show from="phone">
              <span data-testid="lab-show-always">show-from-phone always renders</span>
            </Show>
            <Hide from="phone">
              <span data-testid="lab-hide-never">hide-from-phone never renders</span>
            </Hide>
          </div>
        </SpecimenRow>
      )}

      {only === 'iconframe' && (
        <SpecimenRow axis="ICONFRAME - a badge stays outside the named frame's pruned subtree">
          <div data-testid="lab-iconframe" style={{ display: 'flex', gap: 16 }}>
            <span data-testid="lab-iconframe-badged">
              <IconFrame icon="status.success" label="Completed" badge={<span>3</span>} />
            </span>
            <span data-testid="lab-iconframe-plain">
              <IconFrame icon="status.success" label="Completed" />
            </span>
          </div>
        </SpecimenRow>
      )}

      {only === 'treeselect' && (
        <SpecimenRow axis="TREESELECT - an external label reference names the combobox">
          <div data-testid="lab-treeselect" style={{ inlineSize: 'min(420px, 100%)' }}>
            <span id="lab-treeselect-label">Owning team</span>
            <TreeSelect
              engine="modern"
              aria-labelledby="lab-treeselect-label"
              placeholder="Please select"
              treeData={[
                { value: 'eng', title: 'Engineering', children: [{ value: 'fe', title: 'Frontend', isLeaf: true }] },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'meter' && (
        <SpecimenRow axis="METER - the announced reading is the reading on screen">
          <div data-testid="lab-meter" style={{ display: 'grid', gap: 20, inlineSize: 'min(420px, 100%)' }}>
            <div data-testid="lab-meter-custom">
              <Meter value={40} label="Storage" formatValue={() => '~40'} />
            </div>
            <div data-testid="lab-meter-node">
              <Meter value={40} label="Backups" formatValue={() => <em>40</em>} />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'visuallyhidden' && (
        <SpecimenRow axis="VISUALLYHIDDEN - the focusable gate owns focus reachability">
          <div data-testid="lab-visuallyhidden" style={{ inlineSize: 'min(420px, 100%)' }}>
            <button type="button" data-testid="lab-vh-before">Before</button>
            <VisuallyHidden data-testid="lab-vh-gated" tabIndex={0}>
              Gated sr-only text
            </VisuallyHidden>
            <VisuallyHidden data-testid="lab-vh-open" focusable tabIndex={0}>
              Skip to content
            </VisuallyHidden>
            <button type="button" data-testid="lab-vh-after">After</button>
          </div>
        </SpecimenRow>
      )}

      {only === 'resizehandle' && (
        <SpecimenRow axis="RESIZEHANDLE - an OS arrow chord is left to the browser">
          <div data-testid="lab-resizehandle" style={{ inlineSize: 'min(420px, 100%)' }}>
            <ResizeHandleChordHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'loadingindicator' && (
        <SpecimenRow axis="LOADINGINDICATOR - a duplicated label is announced once">
          <div data-testid="lab-loadingindicator" style={{ display: 'grid', gap: 16 }}>
            <span data-testid="lab-li-duplicated">
              <LoadingIndicator label="Loading results" statusLabel="Loading results" />
            </span>
            <span data-testid="lab-li-distinct">
              <LoadingIndicator label="Loading" statusLabel="Loading results" />
            </span>
          </div>
        </SpecimenRow>
      )}

      {only === 'voiceinput' && (
        <SpecimenRow axis="VOICEINPUTBUTTON - a recognition error reaches AT without hover">
          <div data-testid="lab-voiceinput" style={{ inlineSize: 'min(420px, 100%)' }}>
            <VoiceErrorLiveRegionHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'empty' && (
        <SpecimenRow axis="EMPTY - the preset illustration carries the part the skin sizes">
          <div data-testid="lab-empty" style={{ display: 'grid', gap: 24, inlineSize: 'min(460px, 100%)' }}>
            <div data-testid="lab-empty-default">
              <Empty image="default" description="No records yet" />
            </div>
            <div data-testid="lab-empty-simple">
              <Empty image="simple" description="Nothing archived" />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'container' && (
        <SpecimenRow axis="CONTAINER - the engine prop never reaches the DOM">
          <div data-testid="lab-container" style={{ inlineSize: '100%' }}>
            <Container engine="modern" maxWidth="md" padding="md" data-testid="lab-container-root">
              <div style={{ padding: 12 }}>Container body</div>
            </Container>
          </div>
        </SpecimenRow>
      )}

      {only === 'flex' && (
        <SpecimenRow axis="FLEX - a consumer data attribute survives the presentation resolver">
          <div data-testid="lab-flex" style={{ inlineSize: 'min(460px, 100%)' }}>
            <Flex gap="md" data-testid="lab-flex-root" data-align="consumer-owned">
              <span>one</span>
              <span>two</span>
              <span>three</span>
            </Flex>
          </div>
        </SpecimenRow>
      )}

      {only === 'button' && (
        <SpecimenRow axis="BUTTON - a label that resolved away leaves an icon-only name">
          <div data-testid="lab-button" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span data-testid="lab-button-resolved">
              <Button variant="primary" icon={<LabelledSearchIcon />}>
                {false && <span>Search records</span>}
              </Button>
            </span>
            <span data-testid="lab-button-labelled">
              <Button variant="secondary" icon={<LabelledSearchIcon />}>Search records</Button>
            </span>
          </div>
        </SpecimenRow>
      )}

      {only === 'divider' && (
        <SpecimenRow axis="DIVIDER - a composite label still names the separator">
          <div data-testid="lab-divider" style={{ inlineSize: 'min(460px, 100%)' }}>
            <Divider>
              Section <strong>two</strong>
            </Divider>
          </div>
        </SpecimenRow>
      )}

      {only === 'space' && (
        <SpecimenRow axis="SPACE - fragment members each get their own separator">
          <div data-testid="lab-space" style={{ inlineSize: 'min(460px, 100%)' }}>
            <Space split={<span data-part="lab-split">|</span>}>
              <>
                <span>alpha</span>
                <span>beta</span>
              </>
              <>
                <span>gamma</span>
                <span>delta</span>
              </>
            </Space>
          </div>
        </SpecimenRow>
      )}

      {only === 'stack' && (
        <SpecimenRow axis="STACK - fragment members each get their own divider">
          <div data-testid="lab-stack" style={{ inlineSize: 'min(460px, 100%)' }}>
            <Stack divider={<span data-part="lab-divider">/</span>}>
              <>
                <span>alpha</span>
                <span>beta</span>
              </>
              <>
                <span>gamma</span>
                <span>delta</span>
              </>
            </Stack>
          </div>
        </SpecimenRow>
      )}

      {only === 'dropdown' && (
        <SpecimenRow axis="DROPDOWN - ArrowDown enters a menu that is already open">
          <div data-testid="lab-dropdown" style={{ inlineSize: 'min(360px, 100%)' }}>
            <DropdownReentryHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'pricingtable' && (
        <SpecimenRow axis="PRICINGTABLE - the standalone billing toggle carries a name">
          <div data-testid="lab-pricingtable" style={{ inlineSize: '100%' }}>
            <PatternPricingTable
              engine="modern"
              billingCycle="monthly"
              onBillingCycleChange={() => undefined}
              plans={[
                { id: 'free', name: 'Free', price: 0, cta: 'Get started', features: { seats: '1' } },
                { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, features: { seats: '10' } },
              ]}
              features={[{ key: 'seats', label: 'Seats' }]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'livefeed' && (
        <SpecimenRow axis="LIVEFEED - polling survives caller churn and the log region precedes its items">
          <div data-testid="lab-livefeed" style={{ display: 'grid', gap: 24, inlineSize: 'min(520px, 100%)' }}>
            <div data-testid="lab-livefeed-polling">
              <LiveFeedPollingHarness />
            </div>
            {/* Empty on purpose: a live region announced only once it already
                has content would never announce its first arrival. */}
            <div data-testid="lab-livefeed-empty">
              <PatternLiveFeed engine="modern" items={[]} renderItem={() => null} />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'brandingpreview' && (
        <SpecimenRow axis="BRANDINGPREVIEW - only guard-passed declarations reach the style sink">
          <div data-testid="lab-brandingpreview" style={{ inlineSize: '100%' }}>
            <BrandingPreviewSandbox
              compact
              showLabels={false}
              appearance={{}}
              extraVars={{
                '--ds-color-primary': '#2f6feb',
                '--ds-color-accent': 'red; } [data-preview-escape] { display: none',
                '--ds-color-border': 'url(javascript:alert(1))',
                'color: red; --ds-color-text-primary': '#111111',
              }}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'userprofilecard' && (
        <SpecimenRow axis="USERPROFILECARD - the pending card announces itself as busy">
          <div data-testid="lab-userprofilecard" style={{ display: 'grid', gap: 24, inlineSize: 'min(420px, 100%)' }}>
            <div data-testid="lab-upc-loading">
              <PatternUserProfileCard engine="modern" loading user={{ name: 'Ada Lovelace', role: 'Engineer' }} />
            </div>
            <div data-testid="lab-upc-settled">
              <PatternUserProfileCard engine="modern" user={{ name: 'Ada Lovelace', role: 'Engineer' }} />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'workbenchheader' && (
        <SpecimenRow axis="WORKBENCHHEADER - the exception count reaches the accessibility tree">
          <div data-testid="lab-workbenchheader" style={{ inlineSize: '100%' }}>
            <PatternWorkbenchHeader engine="modern" title="Operations" subtitle="Today" exceptionCount={3} />
          </div>
        </SpecimenRow>
      )}
    </SceneFrame>
  );
}
