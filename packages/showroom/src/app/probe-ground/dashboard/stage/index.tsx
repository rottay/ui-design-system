'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  WidgetBoard,
  type WidgetBoardItem,
  type WidgetLayout,
} from '@rottay/design-system';

import { DASHBOARD_LABELS, DASHBOARD_WIDGETS } from '../widgets';

import { DASHBOARD_WIDTHS } from './widths';

interface LayoutRecord {
  readonly commits: number;
  readonly postures: string[];
  readonly last: WidgetLayout | null;
}

/**
 * The app side of the board: items and the persisted layout live in React state only, and the
 * width knob resizes the board's container live, at whatever viewport the page was opened in.
 */
export function DashboardStage({ initialWidth }: { initialWidth: number }) {
  const [items, setItems] = useState<WidgetBoardItem[]>(DASHBOARD_WIDGETS);
  const [width, setWidth] = useState(initialWidth);
  const [layout, setLayout] = useState<LayoutRecord>({
    commits: 0,
    postures: [],
    last: null,
  });

  const resize = (next: number) => {
    setWidth(next);
    window.history.replaceState(null, '', `?width=${next}`);
  };

  return (
    <Box padding="lg" data-testid="dashboard-probe-stage">
      <Stack spacing="md">
        <Flex gap={8} align="center" wrap="wrap" data-testid="dashboard-width-knob">
          <Text size="xs" weight="semibold" color="muted">
            Board width
          </Text>
          {DASHBOARD_WIDTHS.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === width ? 'primary' : 'secondary'}
              aria-pressed={value === width}
              onClick={() => resize(value)}
            >
              {`${value}px`}
            </Button>
          ))}
        </Flex>
        <Text
          size="xs"
          color="muted"
          data-testid="dashboard-layout-state"
          data-commits={layout.commits}
          data-postures={layout.postures.join(' ')}
        >
          {`${layout.commits} layout commit(s) held in app state`}
        </Text>
        <Box
          width={`min(${width}px, 100%)`}
          data-testid="dashboard-board-container"
          data-width={width}
        >
          <WidgetBoard
            labels={DASHBOARD_LABELS}
            items={items}
            editable
            onItemsChange={setItems}
            onLayoutChange={(next, posture) =>
              setLayout((current) => ({
                commits: current.commits + 1,
                postures: [...current.postures, posture],
                last: next,
              }))
            }
          />
        </Box>
      </Stack>
    </Box>
  );
}
