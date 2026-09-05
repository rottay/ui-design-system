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
  PatternDataTable,
  PatternWorkbenchHeader,
  BulkSelectToggle,
  PatternGalleryView,
  PatternGridView,
  PatternSavedViewsBar,
  cellRenderers,
  PatternDetailPanel,
  PatternFileManager,
  PatternFormBuilder,
  PatternFilterPanel,
  AdaptiveOverlay,
  PatternInvoiceTemplate,
  PatternStepWizard,
  PatternLocaleSwitcher,
  PatternTimeline,
  PatternKanbanBoard,
  PresenceBar,
  PatternBrandStudio,
  PatternTenantPreview,
  TokenInspector,
  PatternColumnSettings,
  PatternWorkspaceSwitcher,
  PatternCockpitHeader,
  PatternPageShell,
  PatternApprovalInbox,
  PatternModerationGallery,
  PatternOperationalLedger,
  PatternCalendarView,
  PatternTreeView,
} from '@rottay/design-system';
import { AlertIcon } from '@rottay/design-system/icons';

import { SceneFrame, SpecimenRow } from '../../chrome';

export type ComponentBehaviorCase =
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
  | 'workbenchheader'
  | 'gridtrack'
  | 'gallerytrack'
  | 'savedviewsfocus'
  | 'bulkselectcount'
  | 'cellreveal'
  | 'celleditorerror'
  | 'detailpanellate'
  | 'filemanagerrows'
  | 'formbuilderresolve'
  | 'filterpanelnames'
  | 'adaptiveoverlay'
  | 'invoicetemplate'
  | 'stepwizard'
  | 'localeswitcher'
  | 'patterntimeline'
  | 'patternkanban'
  | 'presence'
  | 'brand-studio'
  | 'tenant-preview'
  | 'token-inspector'
  | 'column-settings'
  | 'workspace-switcher'
  | 'cockpit-header'
  | 'page-shell'
  | 'approval-inbox'
  | 'moderation-gallery'
  | 'operational-ledger'
  | 'calendar-view'
  | 'tree-view';

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

/** Tabs arrive after the first render, exactly like an async detail load. */
function DetailPanelLateTabsHarness() {
  const [tabs, setTabs] = React.useState<{ key: string; label: string; content: React.ReactNode }[]>([]);
  React.useEffect(() => {
    const id = setTimeout(
      () =>
        setTabs([
          { key: 'overview', label: 'Overview', content: <span>Overview body</span> },
          { key: 'activity', label: 'Activity', content: <span>Activity body</span> },
        ]),
      120,
    );
    return () => clearTimeout(id);
  }, []);
  return (
    <PatternDetailPanel
      engine="modern"
      data={{ id: 'u1', name: 'Ada Lovelace' }}
      title="Ada Lovelace"
      breadcrumbs={[{ label: 'Users', onClick: () => undefined }, { label: 'Ada Lovelace' }]}
      tabs={tabs}
    />
  );
}

/** loading flips true -> false; an early return above the hooks would crash. */
function FormBuilderResolveHarness() {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const id = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(id);
  }, []);
  return (
    <PatternFormBuilder
      engine="modern"
      loading={loading}
      fields={[{ name: 'terms', label: 'Accept terms', type: 'checkbox', required: true }]}
      onSubmit={() => undefined}
      actions={<button type="submit" data-testid="lab-fb-submit">Save</button>}
    />
  );
}

/** Deterministic opener: the overlay starts closed so a run can prove the
 *  forced-drawer phone width only after an explicit open. */
function AdaptiveOverlayHarness() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <button type="button" data-testid="lab-ao-open" onClick={() => setOpen(true)}>
        Open overlay
      </button>
      <button type="button" data-testid="lab-ao-close" onClick={() => setOpen(false)}>
        Close overlay
      </button>
      <AdaptiveOverlay
        open={open}
        mode="drawer"
        title="Adaptive overlay"
        width={640}
        onClose={() => setOpen(false)}
      >
        <div data-testid="lab-ao-body">Drawer body content</div>
      </AdaptiveOverlay>
    </div>
  );
}

/** Deterministic loading toggle: the skeleton branch and the live combobox are
 *  both reachable from one scene without a timer. */
function LocaleSwitcherHarness() {
  const [loading, setLoading] = React.useState(false);
  const [locale, setLocale] = React.useState('en');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <button type="button" data-testid="lab-ls-loading-on" onClick={() => setLoading(true)}>
        Start loading
      </button>
      <button type="button" data-testid="lab-ls-loading-off" onClick={() => setLoading(false)}>
        Stop loading
      </button>
      <PatternLocaleSwitcher engine="modern" locale={locale} loading={loading} onChange={setLocale} />
      <div data-testid="lab-ls-locale">Locale: {locale}</div>
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

export function ComponentBehaviorScene({ only }: { only: ComponentBehaviorCase }) {
  return (
    <SceneFrame title={`COMPONENT BEHAVIORS - ${only.toUpperCase()}`}>
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
              appearance={{
                general: {
                  palette: {
                    primary: '#2f6feb',
                    accent: 'red; } [data-preview-escape] { display: none',
                    secondary: 'url(javascript:alert(1))',
                  },
                },
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

      {only === 'gridtrack' && (
        <SpecimenRow axis="GRIDVIEW - the auto track floor cannot outgrow its container">
          {/* Deliberately narrower than the 220px/280px track floor: the old
              bare minmax() floor could not shrink and overflowed here. */}
          <div data-testid="lab-gridtrack" style={{ inlineSize: 'min(200px, 100%)', outline: '1px dashed rgba(0,0,0,.25)' }}>
            <PatternGridView
              data={[{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }]}
              renderCard={(row: { id: string; name: string }) => <span>{row.name}</span>}
              columns="auto"
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'gallerytrack' && (
        <SpecimenRow axis="GALLERYVIEW - the track floor yields and the caller style survives data">
          <div data-testid="lab-gallerytrack" style={{ inlineSize: 'min(200px, 100%)', outline: '1px dashed rgba(0,0,0,.25)' }}>
            <PatternGalleryView
              data={[{ id: 'a', title: 'Alpha', url: '' }, { id: 'b', title: 'Beta', url: '' }]}
              imageField="url"
              renderCard={(row) => <span>{row.title}</span>}
              columns="auto"
              minColumnWidth={240}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'savedviewsfocus' && (
        <SpecimenRow axis="SAVEDVIEWS - a keyboard-dismissed editor hands focus back">
          <div data-testid="lab-savedviewsfocus" style={{ inlineSize: '100%' }}>
            <PatternSavedViewsBar
              engine="modern"
              views={[
                { id: 'v1', name: 'All records', config: {} },
                { id: 'v2', name: 'Mine', config: {} },
              ]}
              activeViewId="v1"
              onViewSelect={() => undefined}
              onViewRename={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'bulkselectcount' && (
        <SpecimenRow axis="BULKSELECT - the selection count reaches a mounted live region">
          <div data-testid="lab-bulkselectcount" style={{ inlineSize: '100%' }}>
            <BulkSelectToggle active selectedCount={3} onToggle={() => undefined} />
          </div>
        </SpecimenRow>
      )}

      {only === 'cellreveal' && (
        <SpecimenRow axis="CELLRENDERERS - clipped text keeps a reveal path">
          <div data-testid="lab-cellreveal" style={{ display: 'grid', gap: 16, inlineSize: 140, maxInlineSize: '100%' }}>
            {/* minInlineSize:0 — a grid item defaults to min-width:auto and
                would refuse to shrink, so nothing would ever clip here. */}
            <div data-testid="lab-cellreveal-avatar" style={{ minInlineSize: 0, overflow: 'hidden' }}>
              {cellRenderers.avatarName('Alexandra Konstantinopolous', 'alexandra.konstantinopolous@example.com')}
            </div>
            <div data-testid="lab-cellreveal-icontext" style={{ minInlineSize: 0, overflow: 'hidden' }}>
              {cellRenderers.iconText(AlertIcon, 'alexandra.konstantinopolous@example.com')}
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'celleditorerror' && (
        <SpecimenRow axis="DATATABLE - a rejected checkbox save is announced, not silent">
          {/* validate rejects the checked value, so toggling the box in edit
              mode is the only way to reach the rejected-save branch. */}
          <div data-testid="lab-celleditorerror" style={{ inlineSize: '100%' }}>
            <PatternDataTable
              engine="modern"
              rowKey="id"
              data={[{ id: 'r1', enabled: false, name: 'Alpha' }]}
              columns={[
                {
                  key: 'enabled',
                  header: 'Enabled',
                  accessorKey: 'enabled',
                  editable: {
                    type: 'checkbox',
                    validate: (value: unknown) =>
                      value === true ? 'Cannot enable this row' : null,
                  },
                },
                { key: 'name', header: 'Name', accessorKey: 'name' },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'detailpanellate' && (
        <SpecimenRow axis="DETAILPANEL - late tabs select, crumbs operable, skeleton busy">
          <div data-testid="lab-detailpanellate" style={{ inlineSize: '100%' }}>
            <DetailPanelLateTabsHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'filemanagerrows' && (
        <SpecimenRow axis="FILEMANAGER - row actions name their item, dragleave survives descendants">
          <div data-testid="lab-filemanagerrows" style={{ inlineSize: '100%' }}>
            <PatternFileManager
              engine="modern"
              folders={[]}
              files={[
                { id: 'f1', name: 'quarterly-report.pdf', type: 'file', mimeType: 'application/pdf', size: 2048 },
                { id: 'f2', name: 'headshot.jpg', type: 'file', mimeType: 'image/jpeg', size: 1024 },
              ]}
              onRename={() => undefined}
              onDelete={() => undefined}
              onUpload={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'formbuilderresolve' && (
        <SpecimenRow axis="FORMBUILDER - loading resolves, a rejected checkbox is announced">
          <div data-testid="lab-formbuilderresolve" style={{ inlineSize: '100%' }}>
            <FormBuilderResolveHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'filterpanelnames' && (
        <SpecimenRow axis="FILTERPANEL - every control and composite carries its field name">
          <div data-testid="lab-filterpanelnames" style={{ inlineSize: '100%' }}>
            <PatternFilterPanel
              engine="modern"
              values={{}}
              onChange={() => undefined}
              filters={[
                { key: 'query', label: 'Query', type: 'text' },
                {
                  key: 'tags',
                  label: 'Tags',
                  type: 'multi-select',
                  options: [
                    { label: 'Alpha', value: 'a' },
                    { label: 'Beta', value: 'b' },
                  ],
                },
                { key: 'capacity', label: 'Capacity', type: 'number-range' },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'adaptiveoverlay' && (
        <SpecimenRow axis="ADAPTIVEOVERLAY - a forced phone drawer yields to the viewport">
          <div data-testid="lab-adaptiveoverlay" style={{ inlineSize: '100%' }}>
            <AdaptiveOverlayHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'invoicetemplate' && (
        <SpecimenRow axis="INVOICETEMPLATE - decimal tax rate, country-only party, locale currency">
          <div data-testid="lab-invoicetemplate" style={{ inlineSize: '100%' }}>
            <PatternInvoiceTemplate
              engine="modern"
              invoice={{
                number: 'INV-2026-001',
                date: '2026-03-14',
                dueDate: '2026-04-14',
                status: 'sent',
                currency: 'EUR',
                taxRate: 0.21,
                tax: 210,
                total: 1210,
                subtotal: 1000,
                company: {
                  name: 'Rottay Inc.',
                  country: 'Portugal',
                  phone: '+1 (555) 123-4567',
                },
                client: { name: 'Acme Ltd.', country: 'Brazil' },
                items: [{ id: 'li-1', description: 'Design retainer', quantity: 1, unitPrice: 1000, total: 1000 }],
              }}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'stepwizard' && (
        <SpecimenRow axis="STEPWIZARD - a caller-supplied step icon reaches the rail">
          <div data-testid="lab-stepwizard" style={{ inlineSize: '100%' }}>
            <PatternStepWizard
              engine="modern"
              currentStep={0}
              steps={[
                { key: 'draft', title: 'Draft', icon: <span data-testid="lab-sw-icon">D</span>, content: <span>Draft body</span> },
                { key: 'review', title: 'Review', content: <span>Review body</span> },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'localeswitcher' && (
        <SpecimenRow axis="LOCALESWITCHER - loading is a skeleton with no operable control">
          <div data-testid="lab-localeswitcher" style={{ inlineSize: '100%' }}>
            <LocaleSwitcherHarness />
          </div>
        </SpecimenRow>
      )}

      {only === 'patterntimeline' && (
        <SpecimenRow axis="TIMELINE - type drives the glyph, item.color overrides both channels">
          <div data-testid="lab-patterntimeline" style={{ inlineSize: 'min(520px, 100%)' }}>
            <PatternTimeline
              engine="modern"
              groupByDate
              items={[
                { key: 'a', title: 'Deploy failed', timestamp: '2026-03-15T10:00:00.000Z', type: 'error' },
                { key: 'b', title: 'Override tint', timestamp: '2026-03-15T11:00:00.000Z', type: 'error', color: 'rgb(10, 20, 30)' },
                { key: 'c', title: 'Checks passed', timestamp: '2026-03-16T09:00:00.000Z', type: 'success', user: { name: 'Ana Ruiz', avatar: '' } },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'patternkanban' && (
        <SpecimenRow axis="KANBAN - one drop is one move, an empty column has a default">
          <div data-testid="lab-patternkanban" style={{ inlineSize: '100%' }}>
            <PatternKanbanBoard
              engine="modern"
              columns={[
                { id: 'todo', title: 'To do', items: [{ id: 'task-1', title: 'Task A' }, { id: 'task-2', title: 'Task B' }] },
                { id: 'doing', title: 'Doing', items: [] },
              ]}
              itemKey={(item: { id: string }) => item.id}
              renderCard={(item: { id: string; title: string }) => <span>{item.title}</span>}
              onItemMove={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'presence' && (
        <SpecimenRow axis="PRESENCE - composed avatars, initials fallback, overflow badge">
          <div data-testid="lab-presence" style={{ inlineSize: '100%' }}>
            <PresenceBar
              users={[
                { id: 'u1', name: 'Ana Ruiz', color: '#e74c3c' },
                { id: 'u2', name: 'Bob Nilsson', color: '#3498db' },
                { id: 'u3', name: 'Cid Okafor' },
              ]}
              maxVisible={2}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'tenant-preview' && (
        <SpecimenRow axis="TENANTPREVIEW - named groups, bdi meta, personality-driven accent">
          <div data-testid="lab-tenantpreview" style={{ inlineSize: '100%' }}>
            <PatternTenantPreview
              engine="modern"
              config={{ slug: 'acme-co', name: 'Acme Co', primaryColor: '#2f6feb', secondaryColor: '#8a5cf6', personality: 'playful' }}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'token-inspector' && (
        <SpecimenRow axis="TOKENINSPECTOR - clamped panel, truncation honesty, pinned scroll reach">
          <div data-testid="lab-tokeninspector" style={{ inlineSize: '100%', minBlockSize: 420 }}>
            <span data-testid="lab-ti-target">Inspect target</span>
            <TokenInspector />
          </div>
        </SpecimenRow>
      )}

      {only === 'column-settings' && (
        <SpecimenRow axis="COLUMNSETTINGS - explicit move controls replace the inert grip">
          <div data-testid="lab-columnsettings" style={{ inlineSize: '100%' }}>
            <PatternColumnSettings
              engine="modern"
              allColumns={[
                { key: 'name', header: 'Name' },
                { key: 'owner', header: 'Owner' },
                { key: 'updated', header: 'Updated' },
              ]}
              visibleColumns={['name', 'owner', 'updated']}
              lockedColumns={[]}
              columnOrder={['name', 'owner', 'updated']}
              pinnedColumns={{ left: [], right: [] }}
              onToggleVisibility={() => undefined}
              onReorder={() => undefined}
              onTogglePin={() => undefined}
              onReset={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'workspace-switcher' && (
        <SpecimenRow axis="WORKSPACESWITCHER - APG combobox, scoped ids, filter reset">
          <div data-testid="lab-workspaceswitcher" style={{ inlineSize: '100%' }}>
            <PatternWorkspaceSwitcher
              engine="modern"
              workspaces={[
                { id: 'w1', name: 'Acme Co' },
                { id: 'w2', name: 'Globex' },
                { id: 'w3', name: 'Initech' },
              ]}
              activeWorkspaceId="w1"
              onSwitch={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'cockpit-header' && (
        <SpecimenRow axis="COCKPITHEADER - skeleton mirrors requested anatomy">
          <div data-testid="lab-cockpitheader" style={{ display: 'grid', gap: 20, inlineSize: '100%' }}>
            <div data-testid="lab-ch-full">
              <PatternCockpitHeader
                engine="modern"
                title="Event #1234"
                subtitle="Summer Music Festival"
                breadcrumbs={[{ label: 'Events', href: '/e' }, { label: 'Event #1234' }]}
                actions={<button type="button">Edit</button>}
              />
            </div>
            <div data-testid="lab-ch-bare">
              <PatternCockpitHeader engine="modern" title="Detail" loading />
            </div>
          </div>
        </SpecimenRow>
      )}

      {only === 'page-shell' && (
        <SpecimenRow axis="PAGESHELL - numeric maxWidth resolves, tabs and loading mirror">
          <div data-testid="lab-pageshell" style={{ inlineSize: '100%' }}>
            <PatternPageShell
              engine="modern"
              title="Users"
              subtitle="Directory"
              maxWidth={1200}
              tabs={[{ key: 'all', label: 'All', content: <span>All users</span> }, { key: 'admins', label: 'Admins', content: <span>Admins</span> }]}
              activeTab="all"
            >
              <span>Page body</span>
            </PatternPageShell>
          </div>
        </SpecimenRow>
      )}

      {only === 'approval-inbox' && (
        <SpecimenRow axis="APPROVALINBOX - live selection, mounted announcer, focus policy">
          <div data-testid="lab-approvalinbox" style={{ inlineSize: '100%' }}>
            <PatternApprovalInbox
              engine="modern"
              groups={[
                {
                  domain: 'finance',
                  items: [
                    { id: 'a1', title: 'Vendor onboarding', submittedAt: '2026-03-15T10:00:00.000Z', risk: 'high' },
                    { id: 'a2', title: 'Budget increase', submittedAt: '2026-03-15T11:00:00.000Z', risk: 'low' },
                  ],
                },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'moderation-gallery' && (
        <SpecimenRow axis="MODERATIONGALLERY - composed Image fallback on a dead thumbnail">
          <div data-testid="lab-moderationgallery" style={{ inlineSize: '100%' }}>
            <PatternModerationGallery
              engine="modern"
              items={[
                { id: 'm1', thumbnailUrl: '/does-not-exist.png', type: 'image', status: 'pending', uploadedBy: 'Ana', uploadedAt: '2026-03-15T10:00:00.000Z' },
                { id: 'm2', thumbnailUrl: '', type: 'video', status: 'approved', uploadedBy: 'Bob', uploadedAt: '2026-03-15T11:00:00.000Z' },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'operational-ledger' && (
        <SpecimenRow axis="OPERATIONALLEDGER - narrow fold keeps actor/reason/reference">
          <div data-testid="lab-operationalledger" style={{ inlineSize: '100%' }}>
            <PatternOperationalLedger
              engine="modern"
              entries={[
                { id: 'l1', timestamp: '2026-03-15T10:00:00.000Z', description: 'Stock intake', quantity: 12, type: 'credit', actor: 'Ana Ruiz' },
                { id: 'l2', timestamp: '2026-03-15T12:00:00.000Z', description: 'Damage writeoff', quantity: 3, type: 'debit', actor: 'Bob Nilsson' },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'calendar-view' && (
        <SpecimenRow axis="CALENDARVIEW - single grid tab stop, chronological buckets, spans">
          <div data-testid="lab-calendarview" style={{ inlineSize: '100%' }}>
            <PatternCalendarView
              engine="modern"
              events={[
                { id: 'c1', title: 'Late standup', start: new Date(new Date().getFullYear(), new Date().getMonth(), 16, 18) },
                { id: 'c2', title: 'Early standup', start: new Date(new Date().getFullYear(), new Date().getMonth(), 16, 6) },
                { id: 'c3', title: 'Design sprint', start: new Date(new Date().getFullYear(), new Date().getMonth(), 17, 9), end: new Date(new Date().getFullYear(), new Date().getMonth(), 19, 17) },
              ]}
              onEventClick={() => undefined}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'tree-view' && (
        <SpecimenRow axis="TREEVIEW - ReactNode labels searchable, match count announced">
          <div data-testid="lab-treeview" style={{ inlineSize: '100%' }}>
            <PatternTreeView
              engine="modern"
              searchable
              data={[
                { key: 'root', label: <span>Café Ledger</span>, children: [
                  { key: 'a', label: <span>Alpha node</span> },
                  { key: 'b', label: 'Beta node' },
                ] },
              ]}
            />
          </div>
        </SpecimenRow>
      )}

      {only === 'brand-studio' && (
        <SpecimenRow axis="BRANDSTUDIO - editor and preview share one tenant theme">
          <div data-testid="lab-brandstudio" style={{ inlineSize: '100%' }}>
            <PatternBrandStudio
              vertical="bithire"
              value={{ palette: { primaryColor: '#2f6feb' } }}
              onChange={() => undefined}
            />
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
