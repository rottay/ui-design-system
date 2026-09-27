'use client';

import { Box, Flex, Stack, Text, type WidgetBoardItem, type WidgetBoardLabels } from '@rottay/design-system';

export const DASHBOARD_LABELS: WidgetBoardLabels = {
  context: 'Probe ground',
  heading: 'Dashboard',
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'Every widget is on the board',
  editHint: 'Drag, resize or use the keyboard to arrange the board',
  readHint: 'The board as the app persisted it',
  move: 'Move',
  resize: 'Resize',
  resizeWidth: 'Resize width',
  resizeHeight: 'Resize height',
  autoHeight: 'Automatic height',
  remove: 'Remove',
};

const TREND = [18, 26, 22, 34, 30, 42, 48];

/* The one adaptive widget: the app names two views and the cell's own width picks one. */
const PipelineNumber = (
  <Stack spacing="xs" data-testid="pipeline-view-number">
    <Text size="xl" weight="semibold">42</Text>
    <Text size="sm" color="muted">open roles</Text>
  </Stack>
);

const PipelineChart = (
  <Flex role="img" aria-label="Open roles over seven weeks" gap={6} align="end" data-testid="pipeline-view-chart">
    {TREND.map((value, index) => (
      <Box
        key={index}
        width={16}
        height={value * 2}
        background="var(--ds-color-primary)"
        borderRadius="sm"
      />
    ))}
  </Flex>
);

const body = (text: string, testId: string) => (
  <Text size="sm" color="muted" data-testid={testId}>
    {text}
  </Text>
);

export const DASHBOARD_WIDGETS: WidgetBoardItem[] = [
  {
    id: 'pipeline',
    title: 'Pipeline',
    accessibleTitle: 'Pipeline',
    size: 'wide',
    order: 0,
    visible: true,
    content: body('Pipeline overview', 'pipeline-view-content'),
    views: { number: PipelineNumber, chart: PipelineChart },
    adapt: { compact: { view: 'number' }, expanded: { view: 'chart' } },
  },
  {
    id: 'revenue',
    title: 'Revenue',
    accessibleTitle: 'Revenue',
    size: 'wide',
    order: 1,
    visible: true,
    content: body('Booked revenue across every open role', 'revenue-content'),
  },
  {
    id: 'velocity',
    title: 'Hiring velocity',
    accessibleTitle: 'Hiring velocity',
    size: 'md',
    height: 320,
    order: 2,
    visible: true,
    content: body('Days from first contact to offer, fixed at 320px', 'velocity-content'),
  },
  {
    id: 'compliance',
    title: 'Compliance',
    accessibleTitle: 'Compliance',
    size: 'md',
    order: 3,
    visible: true,
    movable: false,
    content: body('Pinned in place: it never moves', 'compliance-content'),
  },
  {
    id: 'inbox',
    title: 'Inbox',
    accessibleTitle: 'Inbox',
    size: 'md',
    order: 4,
    visible: true,
    resizable: false,
    content: body('Fixed size: it never resizes', 'inbox-content'),
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    accessibleTitle: 'Onboarding',
    size: 'md',
    order: 5,
    visible: false,
    catalog: { description: 'New hires and their first week', category: 'People' },
    content: body('Onboarding checklist', 'onboarding-content'),
  },
];
