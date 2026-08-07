'use client';

import React from 'react';

import { Carousel, Table, Transfer, Tree } from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

export type R2ClosureBCase =
  | 'table-anatomy'
  | 'tree-anatomy'
  | 'carousel-anatomy'
  | 'transfer-oneway-remove';

const ROLE_COLUMNS = [
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'venue', title: 'Venue', dataIndex: 'venue' },
  { key: 'stage', title: 'Stage', dataIndex: 'stage' },
];

const ROLE_ROWS = [
  { id: 'r-1', role: 'Head Bartender', venue: 'Riverside Hall', stage: 'Final interview' },
  { id: 'r-2', role: 'Event Steward', venue: 'Northgate Arena', stage: 'Screening' },
  { id: 'r-3', role: 'Kitchen Porter', venue: 'Riverside Hall', stage: 'Offer sent' },
];

const TEAM_TREE = [
  {
    key: 'ops',
    title: 'Venue operations',
    children: [
      { key: 'ops-bar', title: 'Bar service', isLeaf: true },
      { key: 'ops-floor', title: 'Floor stewards', isLeaf: true },
    ],
  },
  {
    key: 'kitchen',
    title: 'Kitchen',
    children: [{ key: 'kitchen-prep', title: 'Prep line', isLeaf: true }],
  },
];

const SHIFT_POOL = [
  { key: 's-1', title: 'Friday close — Riverside Hall' },
  { key: 's-2', title: 'Saturday matinee — Northgate Arena' },
  { key: 's-3', title: 'Sunday brunch — Riverside Hall' },
  { key: 's-4', title: 'Monday setup — Northgate Arena' },
];

export function R2ClosureBScene({ only }: { only: R2ClosureBCase }) {
  return (
    <SceneFrame title={`R2 CLOSURE B - ${only.toUpperCase()}`}>
      {only === 'table-anatomy' && (
        <SpecimenRow axis="TABLE - header, row and cell registers hold at both widths">
          <div data-testid="lab-table-anatomy" style={{ inlineSize: 'min(720px, 100%)' }}>
            <Table columns={ROLE_COLUMNS} dataSource={ROLE_ROWS} rowKey="id" />
          </div>
        </SpecimenRow>
      )}

      {only === 'tree-anatomy' && (
        <SpecimenRow axis="TREE - expanded branches keep their disclosure and indent rhythm">
          <div data-testid="lab-tree-anatomy" style={{ inlineSize: 'min(420px, 100%)' }}>
            <Tree treeData={TEAM_TREE} defaultExpandedKeys={['ops', 'kitchen']} />
          </div>
        </SpecimenRow>
      )}

      {only === 'carousel-anatomy' && (
        <SpecimenRow axis="CAROUSEL - slide track and dot register paint together">
          <div data-testid="lab-carousel-anatomy" style={{ inlineSize: 'min(480px, 100%)' }}>
            <Carousel>
              <div style={{ padding: 'var(--ds-spacing-6)', background: 'var(--ds-surface-inset)' }}>
                Riverside Hall — 240 covers
              </div>
              <div style={{ padding: 'var(--ds-spacing-6)', background: 'var(--ds-surface-inset)' }}>
                Northgate Arena — 1,100 covers
              </div>
            </Carousel>
          </div>
        </SpecimenRow>
      )}

      {only === 'transfer-oneway-remove' && (
        <SpecimenRow axis="TRANSFER - oneWay target rows carry a real per-item remove control">
          <div data-testid="lab-transfer-oneway-remove" style={{ inlineSize: 'min(640px, 100%)' }}>
            <Transfer
              oneWay
              dataSource={SHIFT_POOL}
              targetKeys={['s-2', 's-3']}
              titles={['Unassigned shifts', 'Assigned to Dana']}
            />
          </div>
        </SpecimenRow>
      )}
    </SceneFrame>
  );
}
