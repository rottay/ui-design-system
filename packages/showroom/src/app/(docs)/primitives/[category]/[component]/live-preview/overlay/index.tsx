'use client';

import {
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  ConfirmDialog,
  ContextMenu,
  Dropdown,
  Flex,
  HoverCard,
  Popconfirm,
  Popover,
  Sheet,
  Stack,
  Text,
  Tour,
  Watermark,
} from '@rottay/design-system';
import { SurfaceBlock } from '../frames';

// ---------------------------------------------------------------------------
// Real DS-backed preview components
// ---------------------------------------------------------------------------

function AlertDialogPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open alert dialog
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete route?"
        description="This action cannot be undone for downstream operators."
        action={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Delete
          </Button>
        }
      />
    </Stack>
  );
}

function ConfirmDialogPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open confirm dialog
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Publish tenant?"
        description="Publishing will expose the tenant to all connected operators."
        variant="warning"
        confirmLabel="Publish"
      />
    </Stack>
  );
}

function SheetPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Mobile actions"
        side="bottom"
      >
        <Stack spacing="sm">
          <Button variant="primary">Create task</Button>
          <Button variant="default">Duplicate workflow</Button>
        </Stack>
      </Sheet>
    </Stack>
  );
}

function TourPreview() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const compareRef = useRef<HTMLButtonElement>(null);
  const inspectRef = useRef<HTMLDivElement>(null);
  const tourId = useId();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <Flex gap={8} wrap="wrap">
        <Button
          ref={compareRef}
          id={`${tourId}-compare`}
          variant="primary"
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          Start tour
        </Button>
        <Button variant="default">Open sidebar</Button>
      </Flex>
      <SurfaceBlock style={{ width: '100%' }}>
        <Flex align="center" justify="between" gap={12}>
          <Box ref={inspectRef} id={`${tourId}-inspect`}>
            <Text size="sm" weight="semibold">
              Runtime checklist
            </Text>
            <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
              Switch engine, switch tenant, compare density.
            </Text>
          </Box>
          <Badge variant="primary">Live docs</Badge>
        </Flex>
      </SurfaceBlock>
      <Tour
        open={open}
        current={current}
        mask={false}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        steps={[
          {
            target: () => compareRef.current,
            title: 'Start comparison',
            description: 'Use the real DS tour to guide operators through the preview flow.',
            placement: 'bottom',
          },
          {
            target: () => inspectRef.current,
            title: 'Review runtime output',
            description: 'This step points at the live checklist surface.',
            placement: 'bottomRight',
          },
        ]}
      />
    </Stack>
  );
}

export const OVERLAY_PREVIEWS: Record<string, ReactNode> = {
  // -- Overlay --
  'alert-dialog': <AlertDialogPreview />,
  'confirm-dialog': <ConfirmDialogPreview />,
  'context-menu': (
    <Stack spacing="sm" style={{ width: 320 }}>
      <ContextMenu
        items={[
          { key: 'edit', label: 'Edit draft' },
          { key: 'duplicate', label: 'Duplicate workflow' },
          { key: 'divider', type: 'divider' },
          { key: 'delete', label: 'Delete', danger: true },
        ]}
        trigger={
          <SurfaceBlock>
            <Text size="sm" weight="semibold">
              Right-click this block
            </Text>
            <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
              The menu itself is the DS primitive.
            </Text>
          </SurfaceBlock>
        }
      />
    </Stack>
  ),
  'dropdown': (
    <Dropdown
      menu={{
        items: [
          { key: '1', label: 'Option 1' },
          { key: '2', label: 'Option 2' },
          { key: '3', label: 'Option 3' },
        ],
      }}
    >
      <Button>Click menu</Button>
    </Dropdown>
  ),
  'hover-card': (
    <HoverCard
      trigger={<Button variant="default">Hover user card</Button>}
      content={
        <Stack spacing="xs" style={{ maxWidth: 220 }}>
          <Text size="sm" weight="semibold">
            Daniel Avila
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Rottay owner reviewing runtime parity across engines.
          </Text>
        </Stack>
      }
    />
  ),
  'popover': (
    <Popover
      content={<Text size="sm">Popover content here</Text>}
      title="Title"
    >
      <Button>Hover for popover</Button>
    </Popover>
  ),
  'popconfirm': (
    <Popconfirm title="Are you sure?" onConfirm={() => undefined}>
      <Button variant="default">Delete item</Button>
    </Popconfirm>
  ),
  'sheet': <SheetPreview />,
  'tour': <TourPreview />,
  'watermark': (
    <Watermark content="Rottay">
      <Box style={{ height: 100, width: 240 }} />
    </Watermark>
  ),
};
