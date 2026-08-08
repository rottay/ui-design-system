'use client';

import { AlertDialog, ConfirmDialog, Menu, Sheet, Tour } from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

const MENU_ITEMS = [
  { key: 'roster', label: 'Roster' },
  {
    key: 'reviews',
    label: 'Reviews',
    children: [
      { key: 'reviews-open', label: 'Open' },
      { key: 'reviews-closed', label: 'Closed' },
    ],
  },
  { key: 'archive', label: 'Archive' },
];

const TOUR_STEPS = [
  { title: 'Reviewer roster', description: 'Everyone assigned this quarter.' },
];

export type OverlayEdgeCase = 'alertdialog' | 'confirmdialog' | 'sheet' | 'tour' | 'menu';

export function OverlayEdgeScene({ only }: { only: OverlayEdgeCase }) {
  return (
    <SceneFrame title={`OVERLAY EDGE - ${only.toUpperCase()}`}>
      <SpecimenRow axis="MENU - item state grounds (always in frame)">
        <div data-testid="lab-menu" style={{ inlineSize: 260 }}>
          {/* defaultOpenKeys renders the trigger in [data-open='true'], one of
              the two states this batch moved onto the governed channel. */}
          <Menu
            items={MENU_ITEMS}
            defaultSelectedKeys={['reviews-open']}
            defaultOpenKeys={['reviews']}
          />
        </div>
      </SpecimenRow>

      {only === 'alertdialog' && (
        <div data-testid="lab-alertdialog">
          <AlertDialog open title="Archive roster?" description="This cannot be undone." />
        </div>
      )}

      {only === 'confirmdialog' && (
        <div data-testid="lab-confirmdialog">
          <ConfirmDialog open title="Remove reviewer?" description="They lose access immediately." />
        </div>
      )}

      {only === 'sheet' && (
        <div data-testid="lab-sheet">
          <Sheet open onOpenChange={() => {}} side="right" title="Reviewer detail">
            Four open assignments.
          </Sheet>
        </div>
      )}

      {only === 'tour' && (
        <div data-testid="lab-tour">
          <Tour open steps={TOUR_STEPS} />
        </div>
      )}
    </SceneFrame>
  );
}
