'use client';

import React from 'react';

import {
  BackTop,
  Checkbox,
  Collapse,
  DatePicker,
  FloatButton,
  OTPInput,
  InputNumber,
  Mentions,
  PasswordInput,
  Radio,
  Splitter,
  Stepper,
  Tabs,
  Textarea,
  TimePicker,
  Toggle,
  Upload,
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
  | 'floatbutton';

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
    </SceneFrame>
  );
}
