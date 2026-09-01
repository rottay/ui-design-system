'use client';

import {
  AutoComplete,
  Mentions,
  Modal,
  Pagination,
  Progress,
  Steps,
  Transfer,
} from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

export type PrimitiveInteractionCase =
  | 'autocomplete'
  | 'mentions'
  | 'transfer'
  | 'modal'
  | 'progress'
  | 'pagination'
  | 'steps';

const AC_OPTIONS = [
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'approver', label: 'Approver' },
];

const MENTION_OPTIONS = [
  { value: 'jane', label: 'Jane Doe' },
  { value: 'sam', label: 'Sam Lee' },
];

const TRANSFER_ITEMS = [
  { key: 'alpha', title: 'Alpha' },
  { key: 'beta', title: 'Beta' },
  { key: 'gamma', title: 'Gamma' },
];

const STEP_ITEMS = [
  { title: 'Draft' },
  { title: 'Review' },
  { title: 'Approve' },
];

export function PrimitiveInteractionScene({ only }: { only: PrimitiveInteractionCase }) {
  return (
    <SceneFrame title={`PRIMITIVE INTERACTIONS - ${only.toUpperCase()}`}>
      {only === 'autocomplete' && (
        <SpecimenRow axis="AUTOCOMPLETE - open popup owns its own Escape">
          <div data-testid="lab-autocomplete" style={{ inlineSize: 260 }}>
            <AutoComplete options={AC_OPTIONS} open placeholder="Assign a role" />
          </div>
        </SpecimenRow>
      )}

      {only === 'mentions' && (
        <SpecimenRow axis="MENTIONS - popup Escape scoped to the suggestion list">
          <div data-testid="lab-mentions" style={{ inlineSize: 300 }}>
            <Mentions options={MENTION_OPTIONS} defaultValue="cc @" placeholder="Mention a reviewer" />
          </div>
        </SpecimenRow>
      )}

      {only === 'transfer' && (
        <SpecimenRow axis="TRANSFER - select-all preserves out-of-scope selection">
          <div data-testid="lab-transfer">
            <Transfer dataSource={TRANSFER_ITEMS} targetKeys={['gamma']} />
          </div>
        </SpecimenRow>
      )}

      {only === 'modal' && (
        <div data-testid="lab-modal">
          <Modal open header={<h2>Archive workspace</h2>} onClose={() => {}}>
            Everyone loses access immediately.
          </Modal>
        </div>
      )}

      {only === 'progress' && (
        <SpecimenRow axis="PROGRESS - line variant carries an accessible name">
          <div data-testid="lab-progress" style={{ inlineSize: 300 }}>
            <Progress percent={42} />
          </div>
        </SpecimenRow>
      )}

      {only === 'pagination' && (
        <SpecimenRow axis="PAGINATION - edge focus rescue">
          <div data-testid="lab-pagination">
            <Pagination current={4} total={40} pageSize={10} />
          </div>
        </SpecimenRow>
      )}

      {only === 'steps' && (
        <SpecimenRow axis="STEPS - aria-current rides the interactive trigger">
          <div data-testid="lab-steps" style={{ inlineSize: 420 }}>
            <Steps items={STEP_ITEMS} current={1} onChange={() => {}} />
          </div>
        </SpecimenRow>
      )}
    </SceneFrame>
  );
}
