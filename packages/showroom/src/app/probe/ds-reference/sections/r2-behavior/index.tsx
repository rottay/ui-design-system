'use client';

import {
  DatePicker,
  Splitter,
  Stepper,
  Tabs,
  Textarea,
  TimePicker,
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
  | 'textarea';

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
    </SceneFrame>
  );
}
