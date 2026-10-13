'use client';

import { useState } from 'react';
import {
  AdaptiveOverlay,
  Button,
  Flex,
  Stack,
  TerminalBlock,
  Text,
  type TerminalBlockLine,
} from '@rottay/design-system';

export function AdaptiveOverlayPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing={12}>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The same feedback flow resolves to a modal, drawer, or bottom sheet for the active device class.
      </Text>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open adaptive review
      </Button>
      <AdaptiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Review workspace changes"
        footer={(
          <Flex gap={8} justify="end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </Flex>
        )}
      >
        <Text size="sm">
          Content and actions stay consistent while the overlay posture adapts to the viewport.
        </Text>
      </AdaptiveOverlay>
    </Stack>
  );
}

const TERMINAL_LINES: TerminalBlockLine[] = [
  { prompt: true, text: 'pnpm --filter @rottay/design-system typecheck' },
  { text: 'tsc --noEmit' },
  { text: 'no errors found' },
  { text: 'done in 4.1s' },
];

export function TerminalBlockPreview() {
  return (
    <TerminalBlock
      streaming={false}
      title="pnpm --filter @rottay/design-system typecheck"
      lines={TERMINAL_LINES}
    />
  );
}
