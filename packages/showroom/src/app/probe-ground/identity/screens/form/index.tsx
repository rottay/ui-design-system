'use client';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormField,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@rottay/design-system';

const SENIORITY = [
  { label: 'Mid', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Staff', value: 'staff' },
];

const LOCATIONS = [
  { label: 'Madrid', value: 'madrid' },
  { label: 'Berlin', value: 'berlin' },
  { label: 'Remote (EU)', value: 'remote-eu' },
];

export function FormScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Stack spacing="none">
        <Heading level="h2">New role</Heading>
        <Text size="sm" color="muted">
          Three sections, one surface. Fields are numbered so the reviewer can cite them.
        </Text>
      </Stack>

      <Stack spacing="sm">
        <Text size="xs" weight="semibold" color="muted">
          1 · Definition
        </Text>
        <FormField label="Role title" name="role-title" required>
          <Input defaultValue="Senior Backend Engineer" />
        </FormField>
        <Flex gap={12} wrap="wrap">
          <Box style={{ flex: '1 1 220px' }}>
            <FormField label="Seniority" name="role-seniority" required>
              <Select options={SENIORITY} defaultValue="senior" />
            </FormField>
          </Box>
          <Box style={{ flex: '1 1 220px' }}>
            <FormField label="Location" name="role-location">
              <Select options={LOCATIONS} defaultValue="madrid" />
            </FormField>
          </Box>
        </Flex>
        <FormField label="Scope" name="role-scope" help="Shown to candidates on the public post.">
          <Textarea
            rows={4}
            defaultValue="Own the ingestion pipeline and its SLOs, and partner with the platform team on the tenancy migration."
          />
        </FormField>
      </Stack>

      <Divider />

      <Stack spacing="sm">
        <Text size="xs" weight="semibold" color="muted">
          2 · Compensation
        </Text>
        <Flex gap={12} wrap="wrap">
          <Box style={{ flex: '1 1 200px' }}>
            <FormField label="Band minimum" name="comp-min" required>
              <Input defaultValue="92000" />
            </FormField>
          </Box>
          <Box style={{ flex: '1 1 200px' }}>
            <FormField label="Band maximum" name="comp-max" required>
              <Input defaultValue="108000" />
            </FormField>
          </Box>
          <Box style={{ flex: '1 1 200px' }}>
            <FormField label="Equity" name="comp-equity" error="Enter a percentage between 0 and 1.">
              <Input defaultValue="2.4%" />
            </FormField>
          </Box>
        </Flex>
      </Stack>

      <Divider />

      <Stack spacing="sm">
        <Text size="xs" weight="semibold" color="muted">
          3 · Process
        </Text>
        <Flex align="center" justify="between" gap={12}>
          <Stack spacing="none">
            <Text size="sm">Remote-first loop</Text>
            <Text size="xs" color="muted">
              Panels are scheduled in the candidate&apos;s timezone.
            </Text>
          </Stack>
          <Switch checked onChange={() => undefined} />
        </Flex>
        <Checkbox label="Require a written debrief before advancing" checked onChange={() => undefined} />
        <Checkbox label="Publish the compensation band on the post" />
        <Checkbox label="Anonymise the first screen" disabled />
      </Stack>

      <Flex align="center" justify="end" gap={8}>
        <Button variant="ghost">Discard</Button>
        <Button variant="secondary">Save draft</Button>
        <Button variant="primary">Publish role</Button>
      </Flex>
    </Stack>
  );
}
