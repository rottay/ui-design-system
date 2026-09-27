'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  LayoutGroup,
  PresenceList,
  Text,
  useFlipLayout,
  useLayoutAnimation,
  usePresence,
  useReducedMotion,
  useSharedElementKey,
  useSizeAnimation,
  WidgetBoard,
  type WidgetBoardItem,
  type WidgetBoardLabels,
} from '@rottay/design-system';

import { MOTION_BUDGET_DOM, type MotionBudgetSceneId } from '../roster';

const KERNEL_EXPORTS: Record<string, unknown> = {
  useLayoutAnimation,
  LayoutGroup,
  PresenceList,
  useFlipLayout,
  useSizeAnimation,
  useSharedElementKey,
  usePresence,
  useReducedMotion,
};

const RESOLVED_KERNEL_EXPORTS = Object.entries(KERNEL_EXPORTS)
  .filter(([, value]) => typeof value === 'function')
  .map(([name]) => name)
  .sort()
  .join(' ');

const CARD_KEYS = Array.from({ length: 12 }, (_, index) => `card-${index + 1}`);
const GROWN_KEY = 'card-1';

const STYLES = `
  .motion-budget { padding: var(--ds-spacing-6); background: var(--ds-color-background); color: var(--ds-color-text); }
  .motion-budget__grid { display: grid; grid-template-columns: repeat(4, 12rem); gap: var(--ds-spacing-3); align-items: start; margin-block-start: var(--ds-spacing-4); }
  .motion-budget__card { min-block-size: 6rem; padding: var(--ds-spacing-3); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); overflow: hidden; }
  .motion-budget__card[data-grown='true'] { grid-column: span 2; grid-row: span 2; }
  .motion-budget__list { display: grid; gap: var(--ds-spacing-2); margin-block-start: var(--ds-spacing-4); inline-size: 32rem; }
  .motion-budget__row { padding: var(--ds-spacing-3); border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); }
  .motion-budget__row[data-state='open'] { opacity: 1; transition: opacity var(--ds-motion-reveal) var(--ds-motion-ease-enter); }
  .motion-budget__row[data-state='closed'] { opacity: 0; transition: opacity var(--ds-motion-feedback) var(--ds-motion-ease-exit); }
  @starting-style { .motion-budget__row[data-state='open'] { opacity: 0; } }
`;

function Trigger({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Button {...{ [MOTION_BUDGET_DOM.trigger]: 'true' }} onClick={onPress}>
      {label}
    </Button>
  );
}

function ReflowGrid() {
  const [grown, setGrown] = useState(false);
  const { register, measure } = useLayoutAnimation<string>({ kind: 'reflow' });

  return (
    <>
      <Trigger label="Grow the first card" onPress={() => { measure(); setGrown((value) => !value); }} />
      <Box className="motion-budget__grid">
        {CARD_KEYS.map((key) => (
          <Box
            key={key}
            ref={register(key)}
            className="motion-budget__card"
            data-grown={key === GROWN_KEY && grown ? 'true' : undefined}
            {...{ [MOTION_BUDGET_DOM.subject]: key }}
          >
            <Text>{key}</Text>
          </Box>
        ))}
      </Box>
    </>
  );
}

function SizeGrid({ sizeStrategy, onStrategy }: {
  sizeStrategy: 'auto' | 'measured';
  onStrategy: (strategy: string) => void;
}) {
  const [grown, setGrown] = useState(false);
  const { register, measure, strategy } = useLayoutAnimation<string>({ kind: 'size', sizeStrategy });

  useEffect(() => onStrategy(strategy), [onStrategy, strategy]);

  return (
    <>
      <Trigger label="Resize the first card" onPress={() => { measure(); setGrown((value) => !value); }} />
      <Box className="motion-budget__grid">
        {CARD_KEYS.map((key) => (
          <Box
            key={key}
            ref={register(key)}
            className="motion-budget__card"
            {...{ [MOTION_BUDGET_DOM.subject]: key }}
          >
            <Text>{key}</Text>
            {key === GROWN_KEY && grown ? (
              <Box>
                {CARD_KEYS.slice(0, 6).map((line) => <Text key={line}>{`${line} detail`}</Text>)}
              </Box>
            ) : null}
          </Box>
        ))}
      </Box>
    </>
  );
}

function PresenceRows() {
  const [halved, setHalved] = useState(false);
  const visible = halved ? CARD_KEYS.filter((_, index) => index % 2 === 0) : CARD_KEYS;

  return (
    <>
      <Trigger label="Remove every other row" onPress={() => setHalved((value) => !value)} />
      <Box className="motion-budget__list">
        <PresenceList>
          {visible.map((key) => (
            <Box key={key} className="motion-budget__row" {...{ [MOTION_BUDGET_DOM.subject]: key }}>
              <Text>{key}</Text>
            </Box>
          ))}
        </PresenceList>
      </Box>
    </>
  );
}

const BOARD_LABELS: WidgetBoardLabels = {
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'Empty',
  editHint: 'Editing',
  readHint: 'Reading',
  move: 'Move',
  resize: 'Resize',
  remove: 'Remove',
};

const BOARD_ITEMS: WidgetBoardItem[] = CARD_KEYS.map((key, index) => ({
  id: key,
  title: key,
  accessibleTitle: key,
  size: 'sm',
  order: index,
  visible: true,
  content: <Text {...{ [MOTION_BUDGET_DOM.subject]: key }}>{key}</Text>,
}));

// The reorder runs through the board's own keyboard move, the path that snapshots before it commits.
function WidgetBoardReflow() {
  const [items, setItems] = useState(BOARD_ITEMS);
  const [forward, setForward] = useState(true);
  const move = () => {
    const control = document.querySelector<HTMLElement>(`[aria-label="Move: ${GROWN_KEY}"]`);
    control?.dispatchEvent(new KeyboardEvent('keydown', { key: forward ? 'ArrowRight' : 'ArrowLeft', bubbles: true }));
    setForward((value) => !value);
  };

  return (
    <>
      <Trigger label="Move the first card" onPress={move} />
      <Box width="56rem" paddingTop="md">
        <WidgetBoard labels={BOARD_LABELS} items={items} editable defaultEditing onItemsChange={setItems} />
      </Box>
    </>
  );
}

export function MotionBudgetScene({ scene }: { scene: MotionBudgetSceneId }) {
  const [ready, setReady] = useState(false);
  const [sizeStrategy, setSizeStrategy] = useState<string | undefined>(undefined);

  useEffect(() => setReady(true), []);

  return (
    <Box
      as="main"
      className="motion-budget"
      {...{
        [MOTION_BUDGET_DOM.scene]: scene,
        [MOTION_BUDGET_DOM.ready]: ready ? 'true' : 'false',
        [MOTION_BUDGET_DOM.kernelExports]: RESOLVED_KERNEL_EXPORTS,
        [MOTION_BUDGET_DOM.sizeStrategy]: sizeStrategy,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Heading level="h1">{`Motion budget - ${scene}`}</Heading>
      <LayoutGroup id={`motion-budget-${scene}`}>
        {scene === 'reflow' ? <ReflowGrid /> : null}
        {scene === 'size-interpolate' ? <SizeGrid sizeStrategy="auto" onStrategy={setSizeStrategy} /> : null}
        {scene === 'size-measured' ? <SizeGrid sizeStrategy="measured" onStrategy={setSizeStrategy} /> : null}
        {scene === 'presence' ? <PresenceRows /> : null}
        {scene === 'widget-board' ? <WidgetBoardReflow /> : null}
      </LayoutGroup>
    </Box>
  );
}
