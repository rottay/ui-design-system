'use client';

import {
  useState,
  type ReactNode,
} from 'react';
import {
  Alert,
  Button,
  Drawer,
  Flex,
  Input,
  MessageProvider,
  Modal,
  NotificationProvider,
  Progress,
  Rate,
  Result,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Toast,
  ToastProvider,
  useMessage,
  useNotification,
  useToast,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Real DS-backed preview components
// ---------------------------------------------------------------------------

function MessagePreview() {
  return (
    <MessageProvider>
      <MessagePreviewContent />
    </MessageProvider>
  );
}

function MessagePreviewContent() {
  const [messageApi, messageContextHolder] = useMessage();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      {messageContextHolder}
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Real imperative DS message API.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => messageApi.success('Changes saved')}
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => messageApi.warning('Validation still pending')}
        >
          Warning
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => messageApi.loading('Publishing update...')}
        >
          Loading
        </Button>
      </Flex>
    </Stack>
  );
}

function NotificationPreview() {
  return (
    <NotificationProvider>
      <NotificationPreviewContent />
    </NotificationProvider>
  );
}

function NotificationPreviewContent() {
  const [notificationApi, notificationContextHolder] = useNotification();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      {notificationContextHolder}
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Provider-backed DS notifications with engine-specific chrome.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            notificationApi.success({
              message: 'Route published',
              description: 'Dispatchers can now assign this route.',
            })
          }
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() =>
            notificationApi.warning({
              message: 'Quota warning',
              description: 'Premium API usage is nearing the monthly cap.',
            })
          }
        >
          Warning
        </Button>
      </Flex>
    </Stack>
  );
}

function ToastPreview() {
  return (
    <ToastProvider duration={3200}>
      <ToastPreviewContent />
      <Toast.Container position="top-right" />
    </ToastProvider>
  );
}

function ToastPreviewContent() {
  const toast = useToast();

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Lightweight toast stack from the real DS runtime.
      </Text>
      <Flex gap={8} wrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            toast.success('Deployment ready', 'All tenant checks passed.')
          }
        >
          Show toast
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() =>
            toast.info('Sync running', 'Background reconciliation is still active.')
          }
        >
          Info
        </Button>
      </Flex>
    </Stack>
  );
}

function DrawerPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Uses the real DS drawer component instead of a fake trigger.
      </Text>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Tenant filters"
        placement="right"
        width={360}
      >
        <Stack spacing="sm">
          <Input placeholder="Search routes" />
          <Select
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' },
            ]}
            placeholder="Status"
          />
        </Stack>
      </Drawer>
    </Stack>
  );
}

function FeedbackModalPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing="sm">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Click to inspect the real DS modal treatment for the active engine.
      </Text>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Archive tenant"
        description="Archived tenants can be restored later from platform settings."
        footer={
          <Flex gap={8} justify="end">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Archive
            </Button>
          </Flex>
        }
      >
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          This preview is bound to the DS modal runtime instead of a showroom-only
          placeholder.
        </Text>
      </Modal>
    </Stack>
  );
}

export const FEEDBACK_PREVIEWS: Record<string, ReactNode> = {
  // -- Feedback --
  'alert': (
    <Stack spacing="sm" style={{ maxWidth: 400 }}>
      <Alert tone="info" message="Info alert" />
      <Alert tone="success" message="Success alert" />
      <Alert tone="warning" message="Warning alert" />
      <Alert tone="danger" message="Error alert" />
    </Stack>
  ),
  'drawer': <DrawerPreview />,
  'message': <MessagePreview />,
  'modal': <FeedbackModalPreview />,
  'notification': <NotificationPreview />,
  'progress': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Progress percent={65} />
      <Progress percent={100} />
    </Stack>
  ),
  'rate': <Rate defaultValue={3} />,
  'result': (
    <Result
      status="success"
      title="Operation successful"
      subTitle="Your request has been processed."
    />
  ),
  'skeleton': <Skeleton active style={{ width: 260 }} />,
  'spinner': (
    <Flex gap={16} align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Flex>
  ),
  'toast': <ToastPreview />,
};
