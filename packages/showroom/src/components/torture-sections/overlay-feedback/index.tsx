'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Button,
  Modal,
  Drawer,
  Toast,
  ToastProvider,
  useToast,
  MessageItem,
  NotificationItem,
  Result,
} from '@rottay/design-system';

// Container-toast trigger for the WO-SKIN-03 checkpoint O overlays probe.
// Isolated into its own component so `useToast()` only needs a ToastProvider
// ancestor, not a rework of the whole torture tree -- the trigger dispatches
// an auto-dismissing toast with showProgress on, which the spec's clock-pinned
// open shot captures deterministically (see overlays-batch.spec.ts).
function OverlayFbToastTrigger() {
  const { show } = useToast();
  return (
    <Button
      data-testid="probe-overlayfb-toast-trigger"
      onClick={() =>
        show({
          variant: 'info',
          title: 'Container toast',
          description: 'Auto-dismissing with a progress bar.',
          duration: 6000,
          showProgress: true,
          closable: true,
        })
      }
    >
      Trigger container toast
    </Button>
  );
}

// Fixed fixtures for the WO-SKIN-03 checkpoint O overlays-family data-part
// probe (Modal, Drawer, Toast, Message, Notification, Result). Rendered only
// behind `?overlayfb=1` so no flagship capture sees it. Modal and Drawer stay
// closed at rest and are opened by overlays-batch.spec.ts clicking their
// trigger buttons; Result, the inline Toast, and the Message/Notification
// instances render statically (duration=0 / no-op onRemove -- no live
// timers) so the rest shots are deterministic. This page is the
// visual-evidence half; OverlaysBatch.contract.test.tsx asserts the stamped
// data-part/data-tone/data-placement/data-open attributes and portal posture
// against its own React Testing Library fixtures.
export function OverlayFbStates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box
      data-testid="probe-overlayfb"
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
        <Stack spacing="xs" data-testid="probe-overlayfb-modal">
          <Text size="xs" color="secondary">
            Modal
          </Text>
          <Button data-testid="probe-overlayfb-modal-trigger" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            onOk={() => setModalOpen(false)}
            title="Modal title"
            description="Modal description text."
          >
            Modal body content.
          </Modal>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-drawer">
          <Text size="xs" color="secondary">
            Drawer
          </Text>
          <Button data-testid="probe-overlayfb-drawer-trigger" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Drawer title"
            footer={<Button onClick={() => setDrawerOpen(false)}>Close</Button>}
          >
            Drawer body content.
          </Drawer>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-toast">
          <Text size="xs" color="secondary">
            Toast
          </Text>
          <Toast
            variant="success"
            title="Inline toast"
            description="Static instance, no live timer."
            visible
            duration={0}
            showProgress={false}
            closable
          />
          <ToastProvider>
            <OverlayFbToastTrigger />
            <Toast.Container position="top-right" />
          </ToastProvider>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-message">
          <Text size="xs" color="secondary">
            Message
          </Text>
          <MessageItem
            id="probe-overlayfb-message-1"
            type="success"
            content="Static message instance."
            duration={0}
            closable
            onRemove={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-notification">
          <Text size="xs" color="secondary">
            Notification
          </Text>
          <NotificationItem
            id="probe-overlayfb-notification-1"
            type="warning"
            message="Static notification instance"
            description="No live timer -- duration is 0."
            duration={0}
            closable
            onRemove={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-result">
          <Text size="xs" color="secondary">
            Result
          </Text>
          <Result
            status="success"
            title="All done"
            subTitle="Static result fixture."
            extra={<Button variant="primary">Continue</Button>}
          />
        </Stack>
      </Box>
    </Box>
  );
}
