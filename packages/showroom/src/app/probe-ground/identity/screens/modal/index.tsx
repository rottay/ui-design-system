'use client';

import { useState } from 'react';
import {
  Button,
  Flex,
  FormField,
  Heading,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from '@rottay/design-system';

const APPROVERS = [
  { label: 'D. Alvarez (hiring manager)', value: 'dalvarez' },
  { label: 'S. Chen (recruiter)', value: 'schen' },
  { label: 'Compensation committee', value: 'comp' },
];

export function ModalScreen({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <Stack spacing="md" fullWidth>
      <Stack spacing="none">
        <Heading level="h2">Decision overlay</Heading>
        <Text size="sm" color="muted">
          The dialog carries the candidate&apos;s surface: ground, radius, focus and motion.
        </Text>
      </Stack>

      <Flex align="center" gap={8}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Move to offer
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Flex>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        title="Move Ana Ruiz to offer"
        description="The panel debrief is complete and the band is approved."
        footer={
          <Flex align="center" justify="end" gap={8}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Send for approval
            </Button>
          </Flex>
        }
      >
        <Stack spacing="sm">
          <FormField label="Approver" name="offer-approver" required>
            <Select options={APPROVERS} defaultValue="dalvarez" />
          </FormField>
          <FormField label="Note to the approver" name="offer-note">
            <Textarea rows={3} defaultValue="Strong system-design signal; two references pending." />
          </FormField>
        </Stack>
      </Modal>
    </Stack>
  );
}
