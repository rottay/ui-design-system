'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Button,
  Modal,
  Tour,
  ConfirmDialog,
  AlertDialog,
  Popconfirm,
  Sheet,
  ContextMenu,
  Popover,
  Dropdown,
  HoverCard,
  Watermark,
} from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-04 checkpoint P overlay-primitives data-part
// probe (Modal, Tour, ConfirmDialog, AlertDialog, Popconfirm, Sheet,
// ContextMenu, Popover, Dropdown, HoverCard, Watermark -- AdaptiveOverlay owns
// no DOM of its own, per the checkpoint contract, so it has no fixture here).
// Every floating component stays closed/unopened at rest -- Modal, Tour,
// ConfirmDialog, AlertDialog, and Sheet via controlled `open` state defaulting
// false; Popconfirm/ContextMenu/Popover/Dropdown/HoverCard via their own
// uncontrolled internal state -- and is opened by overlay-batch.spec.ts
// clicking (or right-clicking, for ContextMenu; hovering, for HoverCard) the
// matching `data-testid="probe-overlay-{component}-trigger"` element. Popover
// and Dropdown are forced to `trigger="click"` here (their defaults are
// hover-based) so the spec can open them deterministically without a
// hover-delay race. Watermark renders statically -- no open/closed state.
// The Modal fixture below is the canonical `Modal`; it used to be imported as
// `OverlayModal`, a retired alias for the same component. The
// `probe-overlay-modal*` test ids and the `.rottay-overlay-modal-shell--*`
// selectors keep their historical names because overlay-batch.spec.ts keys on
// them and the engines still emit those classes -- do not rename them here.
// This page is the visual-evidence half; OverlayBatch.contract.test.tsx
// asserts the stamped data-part/data-open/data-placement/data-tone/
// data-variant attributes and portal posture against its own React Testing
// Library fixtures.
export function OverlayStates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Box
      data-testid="probe-overlay"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-overlay-modal">
          <Text size="xs" color="secondary">
            Modal
          </Text>
          <Button data-testid="probe-overlay-modal-trigger" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Overlay modal title"
            description="Overlay modal description text."
            footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
          >
            Overlay modal body content.
          </Modal>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-tour">
          <Text size="xs" color="secondary">
            Tour
          </Text>
          <span data-testid="probe-overlay-tour-target" style={{ display: 'inline-block', padding: 4 }}>
            Target element
          </span>
          <Button data-testid="probe-overlay-tour-trigger" onClick={() => setTourOpen(true)}>
            Start tour
          </Button>
          <Tour
            open={tourOpen}
            onClose={() => setTourOpen(false)}
            type="primary"
            steps={[
              {
                target: '[data-testid="probe-overlay-tour-target"]',
                title: 'Step one',
                description: 'First step description.',
              },
              {
                target: '[data-testid="probe-overlay-tour-target"]',
                title: 'Step two',
                description: 'Second step description.',
              },
            ]}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-confirmdialog">
          <Text size="xs" color="secondary">
            ConfirmDialog
          </Text>
          <Button data-testid="probe-overlay-confirmdialog-trigger" onClick={() => setConfirmDialogOpen(true)}>
            Open confirm dialog
          </Button>
          <ConfirmDialog
            open={confirmDialogOpen}
            title="Delete item?"
            description="This cannot be undone."
            variant="danger"
            onConfirm={() => setConfirmDialogOpen(false)}
            onCancel={() => setConfirmDialogOpen(false)}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-alertdialog">
          <Text size="xs" color="secondary">
            AlertDialog
          </Text>
          <Button data-testid="probe-overlay-alertdialog-trigger" onClick={() => setAlertDialogOpen(true)}>
            Open alert dialog
          </Button>
          <AlertDialog
            open={alertDialogOpen}
            onOpenChange={setAlertDialogOpen}
            title="Revoke access?"
            description="All sessions will be terminated."
            action={
              <Button variant="danger" onClick={() => setAlertDialogOpen(false)}>
                Revoke
              </Button>
            }
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-popconfirm">
          <Text size="xs" color="secondary">
            Popconfirm
          </Text>
          <Popconfirm
            title="Remove item?"
            description="This action cannot be undone."
            okType="danger"
            onConfirm={() => undefined}
            onCancel={() => undefined}
          >
            <Button data-testid="probe-overlay-popconfirm-trigger">Remove</Button>
          </Popconfirm>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-sheet">
          <Text size="xs" color="secondary">
            Sheet
          </Text>
          <Button data-testid="probe-overlay-sheet-trigger" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="bottom" title="Sheet title">
            Sheet body content.
          </Sheet>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-contextmenu">
          <Text size="xs" color="secondary">
            ContextMenu
          </Text>
          <ContextMenu
            items={[
              { key: 'edit', label: 'Edit', shortcut: 'Ctrl+E' },
              { key: 'group', label: 'Actions', type: 'group' },
              { key: 'divider', type: 'divider' },
              { key: 'delete', label: 'Delete', danger: true },
            ]}
            onSelect={() => undefined}
            trigger={
              <Box
                data-testid="probe-overlay-contextmenu-trigger"
                style={{
                  padding: 12,
                  border: '1px dashed var(--ds-color-border)',
                  borderRadius: 8,
                  textAlign: 'center' as const,
                }}
              >
                <Text size="xs" color="secondary">
                  Right-click here
                </Text>
              </Box>
            }
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-popover">
          <Text size="xs" color="secondary">
            Popover
          </Text>
          <Popover title="Popover title" content="Popover content text." trigger="click" arrow>
            <Button data-testid="probe-overlay-popover-trigger">Open popover</Button>
          </Popover>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-dropdown">
          <Text size="xs" color="secondary">
            Dropdown
          </Text>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'profile', label: 'Profile' },
                { key: 'group', label: 'Actions', type: 'group' },
                { key: 'divider', type: 'divider' },
                { key: 'delete', label: 'Delete', danger: true },
              ],
              onClick: () => undefined,
            }}
          >
            <Button data-testid="probe-overlay-dropdown-trigger">Open dropdown</Button>
          </Dropdown>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-hovercard">
          <Text size="xs" color="secondary">
            HoverCard
          </Text>
          <HoverCard
            content="Hover card content."
            openDelay={0}
            closeDelay={0}
            trigger={<Button data-testid="probe-overlay-hovercard-trigger">@username</Button>}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-watermark">
          <Text size="xs" color="secondary">
            Watermark
          </Text>
          <Watermark content="Draft">
            <Box
              style={{
                padding: 24,
                minHeight: 100,
                background: 'var(--ds-color-bg-primary)',
              }}
            >
              <Text size="sm">Watermarked content</Text>
            </Box>
          </Watermark>
        </Stack>
      </Box>
    </Box>
  );
}
