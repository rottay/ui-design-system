'use client';

import { Cascader, ColorPicker, Select, TagInput } from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

const CASCADER_OPTIONS = [
  {
    value: 'roster',
    label: 'Roster',
    children: [
      { value: 'reviewers', label: 'Reviewers' },
      { value: 'approvers', label: 'Approvers' },
    ],
  },
  { value: 'archive', label: 'Archive' },
];

const SELECT_OPTIONS = [
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'approver', label: 'Approver' },
  { value: 'observer', label: 'Observer' },
];

export function InputsMaterialScene() {
  return (
    <SceneFrame title="INPUTS MATERIAL - CASCADER + COLORPICKER + SELECT + TAGINPUT">
      <SpecimenRow axis="OVERLAY REGISTER - floating panels (cascader, colorpicker, select)">
        <div data-testid="lab-cascader" style={{ inlineSize: 240 }}>
          <Cascader options={CASCADER_OPTIONS} placeholder="Pick a scope" />
        </div>

        <div data-testid="lab-colorpicker">
          <ColorPicker defaultValue="#2A1B4D" open />
        </div>

        <div data-testid="lab-select" style={{ inlineSize: 240 }}>
          <Select options={SELECT_OPTIONS} defaultValue="reviewer" forceCustomDropdown />
        </div>
      </SpecimenRow>

      <div aria-hidden="true" style={{ blockSize: 340 }} />

      <SpecimenRow axis="CONTROL REGISTER - taginput focus ring authority">
        <div data-testid="lab-taginput" style={{ inlineSize: 300 }}>
          <TagInput value={['reviewer', 'finance']} placeholder="Add a tag" />
        </div>
      </SpecimenRow>
    </SceneFrame>
  );
}
